import { fetch, Body } from '@tauri-apps/api/http';
import { invoke } from '@tauri-apps/api';
import { store } from './store';
import { v4 as uuidv4 } from 'uuid';
import { httpError } from './index';

/**
 * 语言检测模块。
 * - 每种引擎返回不同的语言代码，统一映射到本项目内部语言代码（见 utils/language.ts）。
 * - 所有检测函数失败时回退为 "en"，保证上层接口的一致性。
 */

// 全局共享的别名映射，允许不同供应商用不同 key 指向同一种内部语言。
// 单一 source of truth，新增供应商时直接复用已有 key。
const COMMON_ALIASES = {
    zh: 'zh_cn',
    'zh-CN': 'zh_cn',
    'zh-Hans': 'zh_cn',
    cht: 'zh_tw',
    'zh-TW': 'zh_tw',
    'zh-Hant': 'zh_tw',
    en: 'en',
    jp: 'ja',
    ja: 'ja',
    kor: 'ko',
    ko: 'ko',
    fra: 'fr',
    fr: 'fr',
    spa: 'es',
    es: 'es',
    ru: 'ru',
    de: 'de',
    it: 'it',
    tr: 'tr',
    pt: 'pt_pt',
    'pt-pt': 'pt_pt',
    vi: 'vi',
    vie: 'vi',
    id: 'id',
    th: 'th',
    ms: 'ms',
    may: 'ms',
    ar: 'ar',
    hi: 'hi',
    no: 'nb_no',
    nob: 'nb_no',
    nb: 'nb_no',
    nno: 'nn_no',
    nn: 'nn_no',
    fa: 'fa',
    per: 'fa',
    uk: 'uk',
    ukr: 'uk',
    mn: 'mn_cy',
    'mn-Cyrl': 'mn_cy',
    mo: 'mn_mo',
    'mn-Mong': 'mn_mo',
    km: 'km',
};

/**
 * 用本地别名表兜底映射 → 不命中时原样转小写返回（便于调试 / 向后兼容）。
 * @param {Record<string,string>} overrides 该引擎独有的映射，优先级高于 COMMON_ALIASES
 */
const buildNormalizer = (overrides = {}) => (code) => {
    if (!code) return 'en';
    const key = String(code).trim();
    if (key in overrides) return overrides[key];
    if (key in COMMON_ALIASES) return COMMON_ALIASES[key];
    return 'en';
};

// ---------------------------------------------------------------------------
// 各供应商实现（内部语言代码 → 本地语言代码 的转换全部委托给 normalizer）
// ---------------------------------------------------------------------------

// 百度：https://fanyi-api.baidu.com/product/113
const toLocalBaidu = buildNormalizer();
async function baidu_detect(text) {
    const res = await fetch('https://fanyi.baidu.com/langdetect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: Body.form({ query: text }),
    });
    if (res.ok) return toLocalBaidu(res.data?.lan);
    throw httpError(res.status, res.data);
}

// 腾讯：https://cloud.tencent.com/document/product/551/15619
const toLocalTencent = buildNormalizer();
async function tencent_detect(text) {
    const res = await fetch('https://fanyi.qq.com/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: Body.form({ sourceText: text }),
    });
    if (res.ok) return toLocalTencent(res.data?.translate?.source);
    throw httpError(res.status, res.data);
}

// Google：https://cloud.google.com/translate/docs/languages?hl=zh-cn
const toLocalGoogle = buildNormalizer();
async function google_detect(text) {
    const res = await fetch(
        'https://translate.google.com/translate_a/single?dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t',
        {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
            query: {
                client: 'gtx',
                sl: 'auto',
                tl: 'zh-CN',
                hl: 'zh-CN',
                ie: 'UTF-8',
                oe: 'UTF-8',
                otf: '1',
                ssel: '0',
                tsel: '0',
                kc: '7',
                q: text,
            },
        }
    );
    if (res.ok) return toLocalGoogle(res.data?.[2]);
    throw httpError(res.status, res.data);
}

// 小牛：https://niutrans.com/documents/contents/trans_text#languageList
const toLocalNiutrans = buildNormalizer();
async function niutrans_detect(text) {
    const res = await fetch('https://test.niutrans.com/NiuTransServer/language', {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        query: {
            src_text: text,
            source: 'text',
            time: String(Date.now()),
        },
    });
    if (res.ok) return toLocalNiutrans(res.data?.language);
    throw httpError(res.status, res.data);
}

// Yandex：https://yandex.com/dev/translate/doc/en/concepts/api-overview
const toLocalYandex = buildNormalizer();
async function yandex_detect(text) {
    const res = await fetch('https://translate.yandex.net/api/v1/tr.json/detect', {
        method: 'GET',
        query: {
            id: `${uuidv4().replaceAll('-', '')}-0-0`,
            srv: 'android',
            text,
        },
    });
    if (res.ok) return toLocalYandex(res.data?.lang);
    throw httpError(res.status, res.data);
}

// Bing：https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support
const toLocalBing = buildNormalizer({ pt: 'pt_br' }); // Bing 对纯 "pt" 归为巴西葡语
const EDGE_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.42';
async function bing_detect(text) {
    const token = await fetch('https://edge.microsoft.com/translate/auth', {
        method: 'GET',
        headers: { 'User-Agent': EDGE_UA },
        responseType: 2,
    });
    if (!token.ok) throw httpError(token.status, token.data);

    const res = await fetch('https://api-edge.cognitive.microsofttranslator.com/detect', {
        method: 'POST',
        headers: {
            accept: '*/*',
            'accept-language': 'zh-TW,zh;q=0.9,ja;q=0.8,zh-CN;q=0.7,en-US;q=0.6,en;q=0.5',
            authorization: `Bearer ${token.data}`,
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            pragma: 'no-cache',
            'sec-ch-ua': '"Microsoft Edge";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            Referer: 'https://appsumo.com/',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'User-Agent': EDGE_UA,
        },
        query: { 'api-version': '3.0' },
        body: { type: 'Json', payload: [{ Text: text }] },
    });
    if (res.ok) return toLocalBing(res.data?.[0]?.language);
    throw httpError(res.status, res.data);
}

async function local_detect(text) {
    return await invoke('lang_detect', { text });
}

// 引擎注册表：统一错误兜底 → 任何异常都回退为 "en"，避免上层中断
const ENGINES = {
    baidu: baidu_detect,
    google: google_detect,
    local: local_detect,
    tencent: tencent_detect,
    niutrans: niutrans_detect,
    yandex: yandex_detect,
    bing: bing_detect,
};

export default async function detect(text) {
    const engine = (await store.get('translate_detect_engine')) ?? 'baidu';
    const runner = ENGINES[engine] ?? local_detect;
    try {
        return await runner(text);
    } catch (_) {
        // 任意接口失败：静默回退到本地语言检测，再失败才兜底 'en'
        try {
            return await local_detect(text);
        } catch (__) {
            return 'en';
        }
    }
}
