import { fetch, Body } from '@tauri-apps/api/http';
import {
    applyPromptPlaceholders,
    consumeSseStream,
    httpError,
    normalizeUrl,
    stripOuterWrap,
} from './index';

/**
 * createChatTranslateService — 生成一个 OpenAI / Gemini / Ollama 风格聊天翻译服务的 translate() 方法。
 * 4 个大模型翻译服务（openai / chatglm / geminipro / ollama）原本 50~150 行各自手写，
 * 但结构完全一致：「URL 归一化 → Prompt 占位替换 → headers/body 组装 → 走 stream 或非 stream → 去首尾引号」。
 *
 * opts 覆盖差异点：
 *   - `buildUrl({ requestPath, stream, apiKey, model })`   → 服务特定 URL
 *   - `buildHeaders({ apiKey, service })`                   → 鉴权头
 *   - `buildBody({ messages, stream, model, config })`      → 请求体（可覆盖默认字段）
 *   - `adapter.pickStreamDelta(data)`                       → SSE 增量文本抽取（默认 choices[0].delta.content）
 *   - `adapter.pickFinalNonStream(data)`                    → 非流式结果抽取（默认 choices[0].message.content）
 *   - `requestLibrary`                                      → `'window.fetch'` 或 `'tauri.http'`（非流式用 tauri 的 Body.json）
 *   - `messagesField`                                       → 请求体中的消息字段名（默认 'messages'；Gemini 用 'contents'）
 *   - `defaultPromptList`                                   → 服务缺省的 prompt 模板（若 Config 未提供）
 */
export function createChatTranslateService(opts) {
    const {
        buildUrl,
        buildHeaders,
        buildBody,
        adapter = {},
        requestLibrary = 'tauri.http',
        messagesField = 'messages',
        defaultPromptList,
        beforeRequest,
    } = opts;

    const pickDelta = adapter.pickStreamDelta ?? ((d) => d?.choices?.[0]?.delta?.content ?? '');
    const pickFinal =
        adapter.pickFinalNonStream ?? ((d) => d?.choices?.[0]?.message?.content ?? '');

    return async function translateImpl(text, from, to, options) {
        const { config, setResult, detect } = options;
        // 允许调用方或服务模块显式提供 Language 枚举
        const Language = options.Language ?? opts.Language ?? {};
        const { promptList, stream } = config ?? {};

        const messages = applyPromptPlaceholders(promptList ?? defaultPromptList ?? [], {
            text,
            from,
            to,
            detectLabel: Language?.[detect] ?? '',
        });

        const url = buildUrl ? String(await buildUrl(config)) : normalizeUrl(config?.requestPath ?? '');
        const headers = await Promise.resolve(buildHeaders?.(config) ?? {
            'Content-Type': 'application/json',
        });
        const bodyBase = {
            [messagesField]: messages,
            stream: Boolean(stream),
        };
        const body = buildBody
            ? await Promise.resolve(buildBody({ config, messages, stream, raw: bodyBase }))
            : bodyBase;

        const finalBefore = beforeRequest ? await Promise.resolve(beforeRequest({ config, body, url })) : {};
        Object.assign(headers, finalBefore.headers ?? {});
        Object.assign(body, finalBefore.body ?? {});

        // Stream path 统一走标准 fetch（tauri http 不支持 ReadableStream）
        if (stream) {
            const res = await window.fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            if (!res.ok) throw httpError(res.status, res.data ?? await res.text().catch(() => ''));
            const accumulated = await consumeSseStream(
                res.body.getReader(),
                (_d, full) => setResult?.(`${full}_`),
                { pickDelta }
            );
            const trimmed = accumulated.trim();
            setResult?.(trimmed);
            return trimmed;
        }

        // Non-stream：tauri.http 或 window.fetch 二选一
        const res =
            requestLibrary === 'window.fetch'
                ? await window.fetch(url, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify(body),
                  })
                : await fetch(url, {
                      method: 'POST',
                      headers,
                      body: Body.json(body),
                  });
        if (!res.ok) {
            const rawBody =
                requestLibrary === 'window.fetch' ? await res.text().catch(() => '') : res.data;
            throw httpError(res.status, rawBody);
        }
        const data = requestLibrary === 'window.fetch' ? await res.json() : res.data;
        const target = stripOuterWrap(String(pickFinal(data) ?? '').trim());
        if (!target) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
        return target;
    };
}
