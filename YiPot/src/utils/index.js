/**
 * 通用工具函数集合
 * - timer 句柄返回以便调用方在卸载时清理（防止内存泄漏）
 * - 所有异步封装都显式抛出原始错误，确保调用栈完整
 */

/**
 * 创建 debounce 函数。返回值带有 cancel()/flush() 便于调用方清理。
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @param {number} [delay=500]
 * @returns {F & { cancel: () => void; flush: () => void }}
 */
export const debounce = (fn, delay = 500) => {
    /** @type {ReturnType<typeof setTimeout> | null} */
    let timer = null;
    let lastArgs = null;
    let lastThis = null;

    const debounced = function (...args) {
        lastArgs = args;
        lastThis = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            const a = lastArgs;
            const t = lastThis;
            lastArgs = lastThis = null;
            fn.apply(t, a);
        }, delay);
    };

    debounced.cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        lastArgs = lastThis = null;
    };

    debounced.flush = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
            const a = lastArgs;
            const t = lastThis;
            lastArgs = lastThis = null;
            if (a) fn.apply(t, a);
        }
    };

    return debounced;
};

/**
 * 创建 throttle 函数（首次立即执行，窗口内忽略后续调用）。
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @param {number} [wait=200]
 * @returns {F & { cancel: () => void }}
 */
export const throttle = (fn, wait = 200) => {
    /** @type {ReturnType<typeof setTimeout> | null} */
    let timer = null;
    let lastTime = 0;
    let pending = null;
    let pendingThis = null;

    const throttled = function (...args) {
        const now = Date.now();
        const remaining = wait - (now - lastTime);
        if (remaining <= 0 || remaining > wait) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            lastTime = now;
            fn.apply(this, args);
        } else if (!timer) {
            pending = args;
            pendingThis = this;
            timer = setTimeout(() => {
                lastTime = Date.now();
                timer = null;
                const a = pending;
                const t = pendingThis;
                pending = pendingThis = null;
                if (a) fn.apply(t, a);
            }, remaining);
        }
    };

    throttled.cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        pending = pendingThis = null;
    };

    return throttled;
};

/**
 * 确保 URL 以 http(s):// 开头，并可选去除尾部斜杠。
 * @param {string} input
 * @param {{ stripTrailingSlash?: boolean, defaultProtocol?: string }} [opts]
 */
export const normalizeUrl = (input, opts = {}) => {
    const { stripTrailingSlash = false, defaultProtocol = 'https:' } = opts;
    let url = String(input || '').trim();
    if (!url) return url;
    if (!/^https?:\/\//i.test(url)) {
        url = `${defaultProtocol}//${url.replace(/^\/+/, '')}`;
    }
    if (stripTrailingSlash) url = url.replace(/\/+$/, '');
    return url;
};

/**
 * 通用占位符替换：$text / $from / $to / $detect。
 * OpenAI-like: 替换 messages[i].content；
 * Gemini-like: 替换 messages[i].parts[j].text（当存在 parts 时）。
 * @template {{role?: string, content?: string, parts?: Array<{text: string}>}} T
 * @param {T[]} messages
 * @param {{ text: string, from: string, to: string, detectLabel: string }} ctx
 * @returns {T[]}
 */
export const applyPromptPlaceholders = (messages, ctx) => {
    const { text, from, to, detectLabel } = ctx;
    const replace = (s) =>
        String(s ?? '')
            .replaceAll('$text', text)
            .replaceAll('$from', from)
            .replaceAll('$to', to)
            .replaceAll('$detect', detectLabel);
    return messages.map((m) => {
        if (Array.isArray(m.parts)) {
            return {
                ...m,
                parts: m.parts.map((p) => ({ ...p, text: replace(p.text) })),
            };
        }
        return { ...m, content: replace(m.content) };
    });
};

/**
 * 解析 SSE 文本（"data: {...}\n\ndata: [DONE]\n\n" 格式）。
 * @param {string} buffer
 * @returns {{ complete: Array<Record<string,any>>, remaining: string }}
 */
export const splitSseMessages = (buffer) => {
    const complete = [];
    let cursor = 0;
    while (cursor < buffer.length) {
        const boundary = buffer.indexOf('\n\n', cursor);
        if (boundary === -1) break;
        const event = buffer.slice(cursor, boundary);
        cursor = boundary + 2;
        const chunks = event.split(/\r?\n/);
        for (const raw of chunks) {
            const trimmed = raw.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
                complete.push(JSON.parse(payload));
            } catch {
                // 不完整的 JSON，跳过（交由下一帧合并）；此处选择忽略
            }
        }
    }
    return { complete, remaining: buffer.slice(cursor) };
};

/**
 * 读取 fetch 响应流式 SSE 体，通过 onDelta 实时回调增量文本，
 * 完成时返回聚合结果。兼容 OpenAI 标准 delta.content 字段。
 * @param {ReadableStreamDefaultReader<Uint8Array>} reader
 * @param {(deltaText: string, fullText: string) => void} onDelta
 * @param {{ pickDelta?: (data: any) => string | undefined }} [opts]
 */
export const consumeSseStream = async (reader, onDelta, opts = {}) => {
    const pick = opts.pickDelta ?? ((data) => data?.choices?.[0]?.delta?.content ?? '');
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const { complete, remaining } = splitSseMessages(buffer);
            buffer = remaining;
            for (const data of complete) {
                const d = pick(data);
                if (!d) continue;
                full += d;
                onDelta?.(d, full);
            }
        }
        // 尾部兜底
        if (buffer.trim()) {
            const { complete } = splitSseMessages(buffer + '\n\n');
            for (const data of complete) {
                const d = pick(data);
                if (!d) continue;
                full += d;
                onDelta?.(d, full);
            }
        }
    } finally {
        try {
            reader.releaseLock();
        } catch {
            /* noop */
        }
    }
    return full;
};

/**
 * 去除字符串首尾匹配的包裹字符（常用于 LLM 返回首尾多余的引号）。
 * @param {string} s
 * @param {string} [wrapChar='"']
 */
export const stripOuterWrap = (s, wrapChar = '"') => {
    const str = String(s ?? '');
    if (!str) return str;
    const c = wrapChar;
    if (str.startsWith(c) && str.endsWith(c) && str.length >= 2) {
        return str.slice(1, -1);
    }
    return str;
};

/**
 * 构造统一的 HTTP 错误。
 */
export const httpError = (status, body) =>
    new Error(`Http Request Error\nHttp Status: ${status}\n${typeof body === 'string' ? body : JSON.stringify(body)}`);

export { createChatTranslateService } from './create_chat_translate.js';
export { runService, isServiceEnabled } from './dispatch_service.js';
