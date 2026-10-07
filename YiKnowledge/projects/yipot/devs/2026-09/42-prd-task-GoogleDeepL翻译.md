---

doc_type: module
prd_task_id: "YP-09-S09-S10"
title: "Google/DeepL 翻译 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.6
source_prd: "20-prd-DeepL翻译.md"

type: task
---

# Google/DeepL 翻译 — 开发方案

## Google 翻译

```javascript
// 免费接口，无需 API Key
const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
const data = await fetch(url).then(r => r.json());
return { text: data[0].map(i => i[0]).join(""), from: data[2], to };
```

## DeepL 翻译

```javascript
// Free/Pro 双 endpoint
const endpoint = options.pro ? "https://api.deepl.com/v2/translate" : "https://api-free.deepl.com/v2/translate";
const params = new URLSearchParams({ text, target_lang: to.toUpperCase(), ...(options.formality && { formality: options.formality }) });
const res = await fetch(endpoint, {
  method: "POST", headers: { Authorization: `DeepL-Auth-Key ${options.apiKey}` }, body: params
});
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| Google 免费接口 | 不要求 API Key | 降低使用门槛 |
| DeepL formality | 可配置参数 | 正式/非正式语体区分 |
| 语言检测 | Google API 自动检测 | 用户无需手动选择源语言 |
| 请求合并 | 相同参数 < 500ms 内的请求复用结果 | 避免重复 API 调用 |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| LRU 翻译缓存 | `TranslateCache` 200 条上限 | 重复翻译命中率 30-40% |
| 请求去重 | 相同 `(text, from, to, service)` 合并为单次调用 | 减少 API 调用 |
| Google 免费接口 | 无 API Key，`translate.googleapis.com` | 零认证延迟 |
| DeepL 连接复用 | `keep-alive` HTTP 头 + 复用 fetch | 减少 TLS 握手 |
| 文本分片 | > 5000 字符自动分片并行翻译 | 长文本翻译时间减半 |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示 |
|----------|--------|----------|----------|
| Google 接口限流 (429) | `TR-429` | 指数退避重试 3 次 (1s/2s/4s) | "请求过于频繁，请稍后" |
| DeepL 认证失败 (403) | `TR-AUTH` | 提示检查 API Key | "DeepL API Key 无效" |
| DeepL 配额用尽 (456) | `TR-QUOTA` | 提示升级套餐或切换服务 | "DeepL 配额已用尽" |
| DeepL 字符超限 | `TR-LEN` | 自动分片翻译 | 静默处理 |
| 网络超时 (> 10s) | `TR-TO` | 重试 1 次后提示 | "翻译超时，请检查网络" |
| 不支持的语言对 | `TR-LANG` | 提示支持的语言列表 | "不支持 {from}→{to} 翻译" |
| 响应解析失败 | `TR-PARSE` | 降级返回原始文本 | "翻译结果解析异常" |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [20-prd-DeepL翻译](../prds/2026-09/20-prd-DeepL翻译.md) | 上游 PRD | DeepL 功能需求 |
| [21-prd-Google翻译](../prds/2026-09/21-prd-Google翻译.md) | 上游 PRD | Google 功能需求 |
| [20-prd-test-DeepL翻译](../tests/2026-09/20-prd-test-DeepL翻译.md) | 下游测试 | 测试用例与验证方案 |
| [48-prd-task-翻译性能优化](./48-prd-task-翻译性能优化.md) | 性能 | LRU 缓存、AbortController |
| [37-prd-task-设置页面](./37-prd-task-设置页面.md) | 配置 | 翻译服务选择与 API Key 配置 |
| `src/services/translate/google/` | 源码 | Google 翻译实现 |
| `src/services/translate/deepl/` | 源码 | DeepL 翻译实现 |