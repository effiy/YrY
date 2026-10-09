import { Language } from './info';
import { defaultRequestArguments } from './Config';
import { createChatTranslateService, normalizeUrl } from '../../../utils';

const DEFAULT_PROMPTS = [
    {
        role: 'system',
        content:
            'You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.',
    },
    { role: 'user', content: 'Translate into $to:\n"""\n$text\n"""' },
];

export const translate = createChatTranslateService({
    Language,
    defaultPromptList: DEFAULT_PROMPTS,
    buildUrl: ({ requestPath, service }) => {
        const url = new URL(normalizeUrl(requestPath ?? ''));
        if (service === 'openai' && !url.pathname.endsWith('/chat/completions')) {
            url.pathname += url.pathname.endsWith('/') ? '' : '/';
            url.pathname += 'v1/chat/completions';
        }
        return url.href;
    },
    buildHeaders: ({ apiKey, service }) =>
        service === 'openai'
            ? { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }
            : { 'Content-Type': 'application/json', 'api-key': apiKey },
    buildBody: ({ config, messages, raw }) => ({
        ...JSON.parse(config.requestArguments ?? defaultRequestArguments),
        ...raw,
        ...(config.service === 'openai' ? { model: config.model } : {}),
    }),
});

export * from './Config';
export * from './info';
