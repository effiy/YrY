// Built-in translate service registry.
// Each service folder (./<name>) must export: { translate, Config, info }
// Consumers rely on the namespace shape `builtinServices[serviceName]` (e.g.
// builtinServices.openai.translate) which is preserved by namespace re-exports.

export * as deepl from './deepl';
export * as bing from './bing';
export * as yandex from './yandex';
export * as openai from './openai';
export * as google from './google';
export * as transmart from './transmart';
export * as alibaba from './alibaba';
export * as baidu from './baidu';
export * as baidu_field from './baidu_field';
export * as tencent from './tencent';
export * as volcengine from './volcengine';
export * as niutrans from './niutrans';
export * as youdao from './youdao';
export * as bing_dict from './bing_dict';
export * as cambridge_dict from './cambridge_dict';
export * as caiyun from './caiyun';
export * as chatglm from './chatglm';
export * as geminipro from './geminipro';
export * as ollama from './ollama';
export * as ecdict from './ecdict';
export * as lingva from './lingva';
