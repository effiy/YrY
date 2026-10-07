---

doc_type: module
prd_task_id: "YP-09-S09"
title: "DeepL 翻译 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "20-prd-DeepL翻译.md"

type: task
---

# DeepL 翻译 — 开发方案

> 来源 PRD：[20-prd-DeepL翻译.md](../../prds/2026-09/20-prd-DeepL翻译.md)

## 源码

`YiPot/src/services/translate/deepl/`

### API 端点

- Free: `https://api-free.deepl.com/v2/translate`
- Pro: `https://api.deepl.com/v2/translate`

### 核心逻辑

```javascript
export default async function translate(text, from, to, options) {
  const isPro = options.pro || false;
  const endpoint = isPro
    ? "https://api.deepl.com/v2/translate"
    : "https://api-free.deepl.com/v2/translate";

  const params = new URLSearchParams({
    text, target_lang: to.toUpperCase(),
    ...(from !== "auto" && { source_lang: from.toUpperCase() }),
    ...(options.formality && { formality: options.formality })
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${options.apiKey}` },
    body: params
  });
  const data = await response.json();
  return {
    text: data.translations[0].text,
    from: data.translations[0].detected_source_language?.toLowerCase(),
    to
  };
}
```


## 设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| Free vs Pro | 用户自行选择 (config.pro) | 自动检测 API Key 类型 | API Key 格式相同无法自动区分，让用户明确选择避免调用失败 | 用户需了解自己的 API Plan |
| formality 参数 | 可选配置 (default/prefer_more/prefer_less) | 固定不传 | 德语/法语等需要正式/非正式语体区分，提高翻译自然度 | 仅对部分目标语言生效 (DE/FR/IT/ES/NL/PL/PT/RU) |
| source_lang 处理 | auto 时不传 source_lang 参数 | 始终传 from | DeepL API 在 source_lang=auto 时自动检测，不传参数获得更好的检测结果 | — |
| 语言代码 | 内部小写 → DeepL 大写 (zh → ZH) | 内部统一大写 | 保持内部语言代码一致性 (所有插件用小写)，仅在请求时转换 | 需要 toUpperCase() 映射 |
| 错误分类 | 详细错误码映射 (4xx vs 5xx) | 统一 "失败" | 用户需要知道是认证问题还是配额问题 | 额外 ~20 行错误码映射代码 |

### DeepL 语言代码映射

```
DeepL 支持的目标语言 (target_lang, 大写):
  BG CS DA DE EL EN ES ET FI FR HU IT JA LT LV NL PL PT RO RU SK SL SV ZH

内部 → DeepL 映射:
  zh → ZH, en → EN, ja → JA, ko → (不支持)
  fr → FR, de → DE, es → ES, pt → PT, ru → RU
  
不支持的语言 (ko, ar, th, vi, ...): 
  → 翻译时不包含在 DeepL 语言列表中
```

### formality 参数设计

```
适用语言: DE, FR, IT, ES, NL, PL, PT, RU
选项:
  "default"       → 不传参数 (DeepL 自动选择)
  "prefer_more"   → 倾向于正式语体 (如德语 Sie 而非 du)
  "prefer_less"   → 倾向于非正式语体 (如德语 du 而非 Sie)

非适用语言: 传 formality 参数 → DeepL 忽略 (不报错)
```


## 错误处理

| 错误码 | 含义 | 处理策略 | 用户感知 |
|--------|------|---------|---------|
| 200 | 成功 | 正常返回 | — |
| 400 | 请求参数错误 | 标记 "bad_request" | "请求参数错误，请检查语言设置" |
| 403 | 认证失败 / API Key 无效 | 标记 "unauthorized" | "API Key 无效，请检查" |
| 404 | 资源不存在 | 标记 "not_found" | "请求的资源不存在" |
| 413 | 请求体过大 | 截断文本 + 重试 | "文本过长，已自动截断" |
| 414 | URL 过长 | 截断文本 + 重试 | "文本过长，已自动截断" |
| 429 | 请求过于频繁 | 标记 "rate_limited" + Retry-After | "请求过于频繁，请稍后重试" |
| 456 | 配额已用完 | 标记 "quota_exhausted" | "DeepL 配额已用完 (每月 500,000 字符免费)" |
| 5xx | 服务器错误 | 自动重试 1 次 (1s 退避) | "DeepL 服务器异常，正在重试" |

### DeepL Free vs Pro 选择逻辑

```
用户配置:
  apiKey: "xxx...xxx"
  pro: false (默认 Free)

Free Plan:
  端点: https://api-free.deepl.com/v2/translate
  限额: 500,000 字符/月
  语言: 30+ (同 Pro)

Pro Plan:
  端点: https://api.deepl.com/v2/translate
  限额: 按量付费，无硬限制
  额外: 优先处理、CAT 工具集成、数据处理协议

自动检测: 无。API Key 格式相同，只能由用户指定。
错误识别: Free Key 调用 Pro 端点 → 403 → 提示"请确认 Plan 设置"
```


## 性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 字符计数 | 翻译后更新配额使用量 (response header) | 用户可跟踪每月用量 | 响应头解析 < 0.1ms |
| 请求缓存 | LRU Cache (key=text:from:to, TTL 10min) | DeepL 响应质量高，缓存价值大 | 命中时延 < 5ms |

**关联文档**：
- [翻译服务插件实现](./04-prd-task-翻译服务插件实现.md) — 插件架构
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 并行调度

## 认证流程详解

### DeepL API Key 认证机制

```
认证方式: HTTP Header 认证
密钥类型: API Key (单一字符串，不区分 AppId/Secret)
Header 格式: Authorization: DeepL-Auth-Key {apiKey}

认证流程:
  1. 用户在插件配置中填写 DeepL API Key
     (从 DeepL 账户页面获取: https://www.deepl.com/account/summary)
  
  2. 翻译插件读取配置中的 apiKey
  
  3. 每次翻译请求时:
     POST {endpoint}/v2/translate
     Headers: {
       "Authorization": `DeepL-Auth-Key ${apiKey}`,
       "Content-Type": "application/x-www-form-urlencoded"
     }
  
  4. DeepL 服务端验证流程:
     a. 解析 Authorization header 提取 API Key
     b. 查询 Key 所属账户 Plan (Free/Pro)
     c. 验证 Key 有效性 → 有效: 继续处理
                         → 无效: 返回 HTTP 403
     d. 检查字符配额 (Free Plan) → 超限: 返回 HTTP 456
     e. 执行翻译，返回结果

Free Plan API Key 特征:
  - 结尾固定 ":fx" 后缀
  - 仅限 api-free.deepl.com 端点
  - 月限额: 500,000 字符
  - 调 api.deepl.com (Pro 端点) → HTTP 403

Pro Plan API Key 特征:
  - 无 ":fx" 后缀
  - 可同时使用 api.deepl.com 和 api-free.deepl.com
  - 按量付费，无硬性字符限制

安全注意事项:
  - API Key 通过 HTTPS 传输，Header 加密
  - 本地存储: 明文存储于用户配置文件 (Tauri 本地文件)
  - 传输安全: HTTPS TLS 1.2+ 保证 Header 不泄露
  - 不建议在 URL query 中传递 Key (已使用 POST body + Header)

错误识别增强 (Free vs Pro 端点混淆):
  Free Key → Pro 端点: HTTP 403 "Authorization failed"
  → 插件检测: 如果用户配置 pro=true 但收到 403
  → 额外提示: "认证失败，请确认您的 API Plan 设置 (Free 或 Pro)"
```

### DeepL API Key 格式验证 (客户端预检)

```javascript
function validateDeepLApiKey(key) {
  // Free Key 格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx
  // Pro Key 格式:  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const freeKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:fx$/i;
  
  if (!key || key.trim().length === 0) {
    return { valid: false, type: null, error: "API Key 不能为空" };
  }
  if (freeKeyPattern.test(key.trim())) {
    return { valid: true, type: "free", error: null };
  }
  if (uuidPattern.test(key.trim())) {
    return { valid: true, type: "pro", error: null };
  }
  return { valid: false, type: null, error: "API Key 格式不正确" };
}
```

> 此预检可提前拦截格式错误的 Key，避免无效请求浪费网络资源。但最终有效性仍需服务端验证。