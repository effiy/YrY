import { Ollama } from 'ollama/browser';
import { Language } from './info';
import { applyPromptPlaceholders, normalizeUrl } from '../../../utils';

/**
 * Ollama 浏览器 SDK 自带流式迭代器，不属于 HTTP SSE，因此走独立实现。
 * （不适用 createChatTranslateService 统一工厂）
 */
export async function translate(text, from, to, options = {}) {
    const { config, setResult, detect } = options;
    const { stream, promptList, requestPath, model } = config;

    const host = normalizeUrl(requestPath ?? '', { stripTrailingSlash: true });
    const ollama = new Ollama({ host });

    const messages = applyPromptPlaceholders(promptList ?? [], {
        text,
        from,
        to,
        detectLabel: Language[detect],
    });

    const response = await ollama.chat({ model, messages, stream: Boolean(stream) });

    if (stream) {
        let target = '';
        for await (const part of response) {
            const chunk = part?.message?.content ?? '';
            if (!chunk) continue;
            target += chunk;
            if (setResult) {
                setResult(`${target}_`);
            } else {
                ollama.abort();
                return '[STREAM]';
            }
        }
        const trimmed = target.trim();
        setResult?.(trimmed);
        return trimmed;
    }

    return response?.message?.content ?? '';
}

export * from './Config';
export * from './info';
