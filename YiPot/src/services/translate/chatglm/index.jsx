import * as jose from 'jose';

import { Language } from './info';
import { createChatTranslateService } from '../../../utils';

const ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export const translate = createChatTranslateService({
    Language,
    requestLibrary: 'window.fetch',
    buildUrl: () => ENDPOINT,
    buildHeaders: async (config) => {
        const [id, secret] = String(config?.apiKey ?? '').split('.');
        if (!id || !secret) throw new Error('invalid apikey');
        const token = await new jose.SignJWT({
            api_key: id,
            exp: Date.now() + 1000 * 60,
            timestamp: Date.now(),
        })
            .setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN' })
            .sign(new TextEncoder().encode(secret));
        return { 'Content-Type': 'application/json', Authorization: token };
    },
    buildBody: ({ config, messages, raw }) => ({
        ...raw,
        model: config.model,
        messages,
        stream: true,
        thinking: { type: 'disabled' },
    }),
});

export * from './Config';
export * from './info';
