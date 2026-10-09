import { Language } from './info';
import { createChatTranslateService, normalizeUrl } from '../../../utils';

const DEFAULT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro';

const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

export const translate = createChatTranslateService({
    Language,
    messagesField: 'contents',
    buildUrl: ({ requestPath, stream, apiKey }) => {
        const base = normalizeUrl(requestPath || DEFAULT_ENDPOINT, { stripTrailingSlash: true });
        const path = stream
            ? `${base}:streamGenerateContent?alt=sse&key=${apiKey}`
            : `${base}:generateContent?key=${apiKey}`;
        return path;
    },
    buildHeaders: () => ({ 'Content-Type': 'application/json' }),
    // Gemini 消息格式 = { role, parts:[{text}] }；applyPromptPlaceholders 已兼容 parts[]
    buildBody: ({ messages, raw }) => {
        const contents = messages.map(({ role, parts, content }) => ({
            role: role || (parts ? undefined : 'user'),
            parts: parts ?? [{ text: content ?? '' }],
        }));
        return { ...raw, contents, safetySettings: SAFETY_SETTINGS };
    },
    adapter: {
        pickStreamDelta: (d) => d?.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
        pickFinalNonStream: (d) => d?.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
    },
});

export * from './Config';
export * from './info';
