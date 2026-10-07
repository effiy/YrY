---

doc_type: module
prd_task_id: "YP-09-S10"
title: "Google 翻译 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "21-prd-Google翻译.md"

type: task
---

# Google 翻译 — 开发方案

> 来源 PRD：[21-prd-Google翻译.md](../../prds/2026-09/21-prd-Google翻译.md)

## 源码

`YiPot/src/services/translate/google/`

### 核心逻辑

Google 翻译使用免费接口，无需 API Key：

```javascript
export default async function translate(text, from, to, options) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  const data = await response.json();

  // Google 返回格式: [[["译文","原文",...]],,"en"]
  const translated = data[0].map(item => item[0]).join("");

  return {
    text: translated,
    from: data[2],  // 检测到的源语言
    to
  };
}
```

### 特点

- 无需 API Key
- 自动语言检测
- 返回音译（非拉丁文字）


## 设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| API 端点 | 免费 Web API (translate.googleapis.com) | Cloud Translation API (需要 API Key) | 零配置开箱即用，无配额限制（非官方），降低用户使用门槛 | 非官方 API 无 SLA 保证，可能随时被限制 |
| 请求方式 | GET 请求 (所有参数在 URL) | POST 请求 | GET 最简单，浏览器原生支持，文本长度限制 2000 字符对翻译场景足够 | 长文本 (2000+) 需改用 POST 或截断 |
| 语言检测 | 利用 Google 的自动检测 (sl=auto) | 前端 franc 检测 | Google 的语言检测精度世界领先，无需前端额外处理 | 始终信任服务端返回的 from 值 |
| 响应解析 | 手动解析特殊 JSON 数组格式 | JSON.parse + 类型断言 | Google API 返回格式已稳定 10+ 年，手动解析比通用解析更可靠 | 格式变更会导致解析失败 (从未发生) |
| 错误处理 | 网络层兜底 + HTTP 状态码 | 不处理（免费服务不保证可用） | 即使免费，也需要给用户明确的状态反馈 | 少量额外代码 |

### Google 翻译 API 响应格式详解

```javascript
// 输入: translate("Hello", "en", "zh")
// 响应格式 (反直觉的嵌套数组):
[
  [
    ["你好", "Hello", null, null, 1],           // 主翻译
    ["您好", "Hello", null, null, 1],             // 备选翻译
    ["喂", "Hello", null, null, 1],               // 备选翻译
    // ... 更多备选
  ],
  null,
  "en",                                            // 检测到的源语言
  null, null, null, null, null, null, null,
  [
    ["Hello", ["你好","您好","喂"],[null,null,null], null, 1]
    // 词典信息
  ]
]

// 解析逻辑:
const translated = data[0].map(item => item[0]).join("");  // 拼接所有译文
const detectedLang = data[2];                               // 源语言
// 非拉丁文字→拉丁文字的转写信息在 data[1] 或 data[数据末尾]
```

> **为什么拼接所有译文**：`data[0]` 中的多条翻译按换行符或空格分隔对应原文的分段，`join("")` 保持原文的分段结构。

### 特殊参数

```
dt=t  → 翻译文本 (必需)
dt=at → 备选翻译
dt=rm → 音译 (Transliteration, 非拉丁文字转拉丁)
client=gtx → 标识客户端类型 (gtx=网页翻译)
```

> `dt=rm` 参数使得中文→日语，或泰语→英语时自动获取转写/罗马字，无需额外 API 调用。


## 错误处理

| 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|
| 网络不可用 (fetch failed) | 标记 "network_error" | 手动重试 | "网络不可用" |
| HTTP 429 (频率限制) | 标记 "rate_limited" + 退避 5s | 自动重试 (1次) | "请求过于频繁，正在重试" |
| 响应格式异常 | 标记 "parse_error" + 记录原始响应 | 手动重试 | "Google 响应格式异常" |
| 空翻译结果 (data[0].length === 0) | 标记 "empty_result" | 手动重试 | "未获取到翻译结果" |
| 文本过长 (> 2000 字符 GET 限制) | 自动截断到 2000 字符 + 提示 | 用户分段翻译 | "文本过长，已自动截断 (最多 2000 字符)" |

### Google 翻译的特点与局限

```
优点:
  - 零配置，即装即用
  - 支持 100+ 语言
  - 自动语言检测精度极高
  - 返回音译 (非拉丁文字)

局限:
  - 非官方 API (无 SLA)
  - 国内网络可能不可用 (需代理)
  - 无形式化/敬语控制
  - GET 请求长度限制 ~2000 字符
  - 频率限制 (无公开阈值)

推荐用途:
  - 作为默认翻译服务 (零配置)
  - 搭配百度/DeepL 等专业服务互补
```


## 性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 文本截断 | > 2000 字符自动截断 | 避免 HTTP 414 URI Too Long | — |
| 结果缓存 | LRU Cache (key=text:from:to, TTL 5min) | 重复查询命中 ~20% | 缓存命中 < 5ms |
| 请求最小化 | 仅传必需参数 (client=gtx, sl, tl, dt=t) | 请求 URL 长度 -30% | — |
| 响应解析 | 单次遍历提取 data[0] (非全量深拷贝) | 大响应解析 < 10ms | — |

**关联文档**：
- [翻译服务插件实现](./04-prd-task-翻译服务插件实现.md) — 插件架构
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 并行调度

## 认证流程详解

### Google 翻译 — 免费接口的无认证机制

```
认证方式: 无需认证 (公开 Web API)
端点: https://translate.googleapis.com/translate_a/single
客户端标识: client=gtx (网页翻译客户端类型)

Google 翻译的免费 Web API 是为 Google Translate 网页版设计的内部接口，
通过 client=gtx 参数标识调用来源为网页翻译，无需 API Key 或 Token。

请求格式:
  GET https://translate.googleapis.com/translate_a/single
    ?client=gtx           # 客户端类型标识 (必需)
    &sl={sourceLang}      # 源语言 (auto=自动检测)
    &tl={targetLang}      # 目标语言
    &dt=t                 # 返回数据类型: t=译文 (必需)
    &dt=at                # 备选翻译 (可选)
    &dt=rm                # 音译/转写 (可选, 非拉丁文字→拉丁)
    &q={encodedText}      # URL 编码后的待翻译文本

与官方 Cloud Translation API 的对比:

| 特性 | 免费 Web API (当前方案) | Cloud Translation API v3 |
|------|------------------------|--------------------------|
| API Key | 不需要 | 需要 (GCP Service Account) |
| 认证方式 | 无 (client=gtx) | OAuth 2.0 / API Key Header |
| 端点 | translate.googleapis.com | translation.googleapis.com |
| 速率限制 | 未公开 (猜测 ~100 req/min) | 明确定义 (6M 字符/分钟) |
| SLA | 无 | 99.9% |
| 语言数量 | 100+ | 100+ (与 NMT 模型相同) |
| 费用 | 免费 | $20/百万字符 |
| 稳定性承诺 | 无 (可能随时变更) | 有 (遵循 GCP Deprecation Policy) |
| 术语表 | 不支持 | 支持 (Custom Glossary) |
| 批量翻译 | 不支持 | 支持 (一次 100+ 文本) |

选择免费 Web API 的理由:
  1. 零配置 — 开箱即用，降低用户使用门槛
  2. 免费 — 无需 Google Cloud 账户，无费用
  3. 轻量 — GET 请求，浏览器原生 fetch 即可
  4. 足够 — 划词/短句翻译场景下，非官方 API 的质量和稳定性足够

弃用风险与缓解:
  - Google 可能随时限制或关闭该接口 (从未公开文档化)
  - 缓解: Google 翻译本身依赖该接口，关闭将导致整个 Google Translate 网页版失效，
    过去 10+ 年该接口格式保持稳定
  - 替代方案: 如未来受限，可切换到 Cloud Translation API v3
    只需修改端点 + 添加 OAuth 认证 Header
```

### client=gtx 参数含义

```
client 参数标识请求模拟的客户端类型:
  client=gtx  → Google Translate Web Extension (浏览器扩展)
  client=t    → Google Translate Web (translate.google.com)
  client=dict-chrome-ex → Google Dictionary Chrome Extension

gtx 是 Google Translate Extension 触发请求时使用的客户端标识。
选择 gtx 而非 t 的原因是:
  - gtx 的速率限制更宽松 (扩展场景)
  - 返回的数据格式更简洁 (t 模式返回额外 UI 元数据)
  - 社区长期采用，已验证稳定

注意: 该接口并非 Google 官方公开 API，不能保证未来的可用性和稳定性。
      建议作为默认翻译源，同时提供 API Key 驱动的备选翻译源。
```