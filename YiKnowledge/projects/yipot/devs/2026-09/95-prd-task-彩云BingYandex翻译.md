---

doc_type: module
prd_task_id: "YP-09-S18"
title: "彩云小译/Bing/Yandex — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "29-prd-彩云BingYandex翻译.md"

type: task
---

# 彩云小译/Bing/Yandex — 开发方案

> 来源 PRD：[29-prd-彩云BingYandex翻译.md](../../prds/2026-09/29-prd-彩云BingYandex翻译.md)
> 需求编号：YP-09-S18 · 优先级：P2 · 人天：0.5d

---

## 一、架构概述

三个翻译服务统一遵循 `TranslateService` 插件接口，位于 `services/translate/` 目录：

```
services/translate/
├── caiyun/
│   ├── info.ts       — Token 认证，zh/en/ja 语言
│   ├── index.jsx     — POST https://api.interpreter.caiyunai.com/v1/translator
│   └── Config.jsx    — Token 输入框
├── bing/
│   ├── info.ts       — Azure API Key + Region
│   ├── index.jsx     — POST https://api.cognitive.microsofttranslator.com/translate?api-version=3.0
│   └── Config.jsx    — API Key + Region 输入
└── yandex/
    ├── info.ts       — API Key (IAM token 或 Api-Key)
    ├── index.jsx     — POST https://translate.api.cloud.yandex.net/translate/v2/translate
    └── Config.jsx    — API Key 输入
```

## 二、各服务实现细节

### 2.1 彩云小译

```javascript
// services/translate/caiyun/index.jsx
export default async function translate(text, from, to, options) {
  const response = await fetch("https://api.interpreter.caiyunai.com/v1/translator", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": `token ${options.token}`
    },
    body: JSON.stringify({
      source: text,
      trans_type: `${from}2${to}`,
      request_id: crypto.randomUUID()
    })
  });
  const data = await response.json();
  return { text: data.target, from, to };
}
```

**特点**: 仅支持中/英/日三语互译，Token 通过 HTTP Header 传递。

### 2.2 Bing (Azure) 翻译

```javascript
// services/translate/bing/index.jsx
export default async function translate(text, from, to, options) {
  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": options.apiKey,
      "Ocp-Apim-Subscription-Region": options.region
    },
    body: JSON.stringify([{ Text: text }])
  });
  const data = await response.json();
  return { text: data[0]?.translations[0]?.text, from, to };
}
```

**特点**: 请求体为数组格式（支持批量翻译），需同时提供 `Ocp-Apim-Subscription-Key` 和 `Ocp-Apim-Subscription-Region` 两个 Header。免费层 2M 字符/月。

### 2.3 Yandex 翻译

```javascript
// services/translate/yandex/index.jsx
export default async function translate(text, from, to, options) {
  const response = await fetch("https://translate.api.cloud.yandex.net/translate/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Api-Key ${options.apiKey}`
    },
    body: JSON.stringify({
      texts: [text],
      sourceLanguageCode: from,
      targetLanguageCode: to,
      format: "PLAIN_TEXT"
    })
  });
  const data = await response.json();
  return { text: data.translations[0]?.text, from, to };
}
```

**特点**: Yandex Cloud 需绑定账单账户（无免费层级），支持 90+ 语言，俄语/东欧语言质量最佳。

## 三、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 权衡代价 |
|--------|------|---------|---------|----------|
| 彩云 Token 格式 | `X-Authorization: token {token}` | Bearer Token | 彩云 API 要求专用 Header 格式 | 与标准 Bearer 不兼容 |
| Bing region 配置 | 用户手动输入 region | 自动探测 (IP 地理定位) | Azure 区域与 Key 绑定，自动探测可能错误 | 增加配置复杂度 |
| Yandex 认证 | Api-Key 方式 | IAM Token (需 OAuth 流程) | Api-Key 创建后持久有效，IAM Token 每 12h 过期 | Api-Key 权限粒度较粗 |
| 三服务合并 | 独立插件目录 | 合并为单一"其他翻译"插件 | 独立启用/禁用、独立错误提示 | 设置页翻译服务列表更长 |
| 请求格式 | 符合各 API 原生格式 | 统一 JSON schema + adapter | 减少代码量，直接透传 | 每个插件需处理各自的错误格式 |

## 四、性能优化

| 优化点 | 手段 | 预期收益 |
|--------|------|---------|
| 彩云连接复用 | HTTP Keep-Alive | 后续请求减少 TLS 握手开销 ~200ms |
| Bing region 就近选择 | 用户选择 Asia Pacific 区域 | 延迟降低 ~300ms（相比跨区域请求） |
| Yandex 批量翻译 | 多段文本合并为 `texts[]` | 减少 API 调用次数 N→1 |
| 三服务并行调度 | `Promise.allSettled` 合并到翻译调度 | 总时延 = max(服务响应)，非 sum |

## 五、错误处理与恢复

| 错误层级 | 错误类型 | HTTP 状态 | 处理策略 | 用户提示 |
|---------|---------|----------|---------|---------|
| 彩云 | Token 无效 | 401 | 标记 "unauthorized" | "彩云小译 Token 无效，请检查" |
| 彩云 | 请求过频 | 429 | 退避 3s 重试 1 次 | "彩云小译请求频繁，请稍后" |
| 彩云 | 不支持语言对 | 400 | 不显示彩云选项 | — |
| Bing | API Key 无效 | 401 | 标记 "unauthorized" | "Azure API Key 无效" |
| Bing | Region 不匹配 | 403 | 提示检查 region | "Azure 区域配置不匹配" |
| Bing | 配额耗尽 (429) | 429 | 标记 "quota" | "Azure 免费层配额已用完 (2M字符/月)" |
| Bing | 国内网络不可达 | DNS/Timeout | 提示使用代理 | "Bing 翻译无法访问，请检查代理设置" |
| Yandex | API Key 无效 | 401/403 | 标记 "unauthorized" | "Yandex API Key 无效" |
| Yandex | 语言不支持 | 501 | 提示切换语言 | "Yandex 不支持该语言组合" |
| Yandex | 请求过频 | 429 | 读取 `Retry-After` Header 退避 | "Yandex 请求频繁，请稍后" |

## 六、跨平台差异

| 差异点 | macOS | Windows | Linux |
|--------|-------|---------|-------|
| Bing 国内可达性 | 需代理 | 需代理 | 需代理 |
| Yandex 国内可达性 | 需代理 | 需代理 | 需代理 |
| 代理配置方式 | 系统代理 (自动) | 系统代理 (自动) | 需手动配置 `HTTP_PROXY` |
| TLS 证书验证 | 系统钥匙串 | Windows 证书存储 | OpenSSL 证书包 |

## 七、交叉引用

| 关联文档 | 关系 | 路径 |
|---------|------|------|
| 翻译服务插件实现 | 父模块 | [04-prd-task-翻译服务插件实现.md](./04-prd-task-翻译服务插件实现.md) |
| 翻译核心架构 | 调度层 | [01-prd-task-翻译核心架构.md](./01-prd-task-翻译核心架构.md) |
| 代理与网络 | 网络层 | [42-prd-task-代理网络实现.md](./42-prd-task-代理网络实现.md) |
| 源码 - 彩云 | 实现 | `YiPot/src/services/translate/caiyun/` |
| 源码 - Bing | 实现 | `YiPot/src/services/translate/bing/` |
| 源码 - Yandex | 实现 | `YiPot/src/services/translate/yandex/` |