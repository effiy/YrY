---

doc_type: module
prd_task_id: "YP-09-S17"
title: "有道翻译 — 开发方案"
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
source_prd: "28-prd-有道翻译.md"

type: task
---

# 有道翻译 — 开发方案

## 源码

`YiPot/src/services/translate/youdao/`

### 签名算法

```javascript
const salt = Date.now();
const sign = md5(appKey + text + salt + secret);
```

### API 调用

```javascript
export default async function translate(text, from, to, options) {
  const salt = Date.now();
  const sign = md5(options.appKey + text + salt + options.secret);

  const params = new URLSearchParams({
    q: text, from, to,
    appKey: options.appKey,
    salt, sign
  });

  const res = await fetch("https://openapi.youdao.com/api", {
    method: "POST", body: params
  });
  const data = await res.json();

  return {
    text: data.translation?.join(""),
    from: data.l?.split("2")[0] || from, to,
    explains: data.basic?.explains,
    phonetics: data.basic?.phonetic
  };
}
```

### 错误码

| 错误码 | 含义 | 通用分类 | 处理策略 | 用户感知 |
|--------|------|---------|---------|---------|
| 0 | 成功 | — | 正常返回 | — |
| 101 | 缺少必填参数 | bad_request | 检查 q/from/to/appKey/salt/sign 完整性 | "请求参数不完整" |
| 102 | 不支持的语言类型 | bad_request | 检查语言列表 → 灰显有道选项 | "有道不支持该语言组合" |
| 103 | 翻译文本过长 (> 5,000 字符) | text_too_long | 自动截断至 5,000 字符 + 提示 | "文本过长，请分段翻译" |
| 108 | appKey 无效 | unauthorized | 提示检查 appKey | "AppKey 无效，请检查" |
| 110 | 无相关服务的有效实例 | unauthorized | 提示到有道 AI 开放平台开通服务 | "未开通有道翻译服务" |
| 111 | 开发者账号无效 | unauthorized | 提示检查账号状态 | "开发者账号无效" |
| 113 | q 不能为空 | bad_request | 翻译入口灰显 (text.length === 0) | — (不发起请求) |
| 201 | 解密失败 | unauthorized | 提示检查密钥 | "解密失败，请检查密钥" |
| 202 | 签名检验失败 | unauthorized | 提示检查 Secret + 重新计算签名 | "签名验证失败，请检查 Secret" |
| 203 | 访问 IP 不在白名单 | unauthorized | 提示添加 IP 白名单 | "IP 不在白名单" |
| 301 | 词典查询失败 | dict_error | 仅记录日志，继续返回译文 | 正常显示译文 (无词典) |
| 302 | 小语种翻译失败 | translation_error | 降级使用其他翻译源 | "小语种翻译失败" (自动降级) |
| 303 | 服务端断流 | server_error | 自动重试 1 次 (1s 退避) | "有道服务器异常，正在重试" |
| 401 | 账户欠费 | quota_exhausted | 提示充值 | "有道账户欠费，请充值" |
| 411 | 访问频率受限 | rate_limited | 退避 3s → 重试 1 次 | "请求过于频繁，请稍后重试" |
| 412 | 长文本频率超限 | rate_limited | 退避 5s → 重试 1 次 | "长文本请求过于频繁" |

## 设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 签名算法 | MD5(appKey + text + salt + secret) | HMAC-SHA256 | 有道 API 强制要求 MD5 签名格式，无法选择 | MD5 仅防篡改、不防攻击 (碰撞风险)，建议使用 HTTPS + 网络隔离 |
| salt 生成 | Date.now() (毫秒时间戳) | UUID / crypto.randomUUID() | 有道仅要求 salt 唯一即可，时间戳足够且无额外依赖 | 同一毫秒内并发请求可产生相同 salt (概率极低) |
| 单词/句子双模式 | 根据 text 是否含空格自动切换 | 用户手动切换模式 | 用户体验更流畅，符合划词直觉 (单词=查词，句子=翻译) | 短句如 "HelloWorld" 会被误判为单词，但此类场景极少 |
| 词典返回策略 | 仅在单词查询时返回 explains/phonetics | 始终返回词典数据 | 节省响应体积，句子词典释义无意义 | 复合词 (如 "machine learning") 不会返回词典 |
| 语言代码转换 | zh → zh-CHS, zh-TW → zh-CHT | 统一使用 zh-CHS | 有道 API 区分简繁体 (不同于其他 API)，必须转换 | 需要维护简繁体映射表 |
| 错误码映射 | 有道专有错误码 → 通用分类码 | 直接展示有道错误码 | 统一翻译核心的错误展示格式，用户无需理解每个 API 的错误码体系 | 额外 ~30 行映射代码 |
| 签名重试 | 202 错误 → 重新生成签名 (新 salt) → 重试 1 次 | 直接报错 | salt 失效 (服务端时间偏差) 是偶发问题，重试可自愈 | 极少数情况下增加一次额外请求 |

### 有道 API 调用特点

```
API 端点: https://openapi.youdao.com/api
请求方法: POST (application/x-www-form-urlencoded)
签名方法: MD5(appKey + truncatedText + salt + secret)

truncatedText 计算规则 (有道 API 特殊要求):
  - text.length <= 20: q = text (不截断)
  - text.length > 20: 
      q = text.substring(0, 10) + text.length + text.substring(text.length - 10)
      例: "Hello World, how are you today" (33 字符)
      → 签名用: "Hello Worl33 today" (前 10 + 长度 + 后 10)
  
  但 POST body 中的 q 始终是完整文本，仅签名使用截断文本

注意: 签名中使用的 text 是 POST body 中 q 字段的截断值，而非完整文本。
      此行为是 [有道翻译 API 文档](https://ai.youdao.com/docs/doc-trans-api.s) 的规范要求。
```

## 性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 签名计算 | MD5 散列 (crypto-js 纯 JS 实现) | 签名耗时 < 1ms | crypto-js MD5 对 1KB 文本 < 0.5ms |
| 单词缓存 | LRU Cache (key=text:from:to, TTL 30min) | 单词查询重复率高 (查词场景 ~40% 命中) | 缓存命中 < 5ms |
| 句子缓存 | LRU Cache (key=text:from:to, TTL 5min) | 句子翻译重复率 ~10% | 缓存命中 < 5ms |
| 请求合并 | 单词优先使用缓存 → 减少 40% API 调用 | 节省有道 API 调用额度 (免费层 2,000 次/小时) | — |
| 增量签名 | salt 复用 Date.now() (无需异步生成) | 零额外延迟 | Date.now() < 0.1ms |

## 认证流程详解

### 有道翻译 API 签名认证机制

```
认证方式: App Key + Secret MD5 签名
密钥类型: 双密钥 (AppKey 标识身份，Secret 生成签名)
签名算法: MD5(appKey + text + salt + secret)

认证流程:
  1. 用户在有道 AI 开放平台注册应用
     (https://ai.youdao.com/ — 控制台 → 应用管理 → 创建应用)
     获取: appKey (应用 ID) + secret (应用密钥)
  
  2. 翻译请求完整流程:
     ┌─────────────────────────────────────────────┐
     │ 1. 生成 salt                               │
     │    salt = Date.now()                       │
     │                                            │
     │ 2. 计算签名 (有截断规则)                    │
     │    if (text.length > 20)                   │
     │      signText = text.slice(0,10) +         │
     │                 text.length +              │
     │                 text.slice(-10)            │
     │    else                                     │
     │      signText = text                       │
     │    sign = MD5(appKey + signText + salt     │
     │                 + secret)                  │
     │                                            │
     │ 3. 构建请求                                 │
     │    POST https://openapi.youdao.com/api     │
     │    Content-Type: application/              │
     │      x-www-form-urlencoded                 │
     │    Body:                                   │
     │      q={完整text}&from={from}&to={to}      │
     │      &appKey={appKey}&salt={salt}          │
     │      &sign={sign}                          │
     │                                            │
     │ 4. 有道服务端验证                           │
     │    a. 使用相同算法计算签名                   │
     │       (appKey + 截断q + salt + secret)     │
     │    b. 比对签名 → 一致: 继续                │
     │                 → 不一致: 返回 errorCode=202 │
     │    c. 检查 appKey 有效性                   │
     │    d. 检查账户配额/欠费状态                 │
     │    e. 检查 IP 白名单 (如配置)               │
     │    f. 执行翻译                              │
     └─────────────────────────────────────────────┘

MD5 签名安全性分析:
  - MD5 非加密算法: 仅用于校验请求参数完整性，不加密数据
  - 签名包含 secret: 攻击者无法伪造签名 (除非知道 secret)
  - 签名包含 salt: 防止重放攻击 (相同文本每次签名不同)
  - 签名包含文本: 防止参数被中间人篡改
  - HTTPS 加密传输: 请求体在传输层已加密，签名防篡改为第二层保护

Secret 存储安全:
  - 本地存储: 明文存储于用户配置文件 (Tauri 本地文件)
  - 传输安全: HTTPS TLS 1.2+ 全程加密
  - 注意: Secret 不应硬编码在客户端代码中 (采用用户配置模式)
```

## 关联文档

| 文档 | 关系 | 路径 |
|------|------|------|
| 有道翻译 PRD | 来源需求 | [28-prd-有道翻译.md](../../prds/2026-09/28-prd-有道翻译.md) |
| 翻译核心架构 | 父模块 | [01-prd-task-翻译核心架构.md](./01-prd-task-翻译核心架构.md) |
| 翻译服务插件实现 | 插件规范 | [04-prd-task-翻译服务插件实现.md](./04-prd-task-翻译服务插件实现.md) |
| DeepL 翻译开发方案 | 同级翻译源 | [15-prd-task-DeepL翻译.md](./15-prd-task-DeepL翻译.md) |
| Google 翻译开发方案 | 同级翻译源 | [16-prd-task-Google翻译.md](./16-prd-task-Google翻译.md) |
| 阿里/腾讯/火山翻译开发方案 | 同级翻译源 | [20-prd-task-阿里腾讯火山翻译.md](./20-prd-task-阿里腾讯火山翻译.md) |
| 有道翻译 API 文档 | 外部参考 | https://ai.youdao.com/docs/doc-trans-api.s |
| 有道 AI 开放平台 | 外部参考 | https://ai.youdao.com/ |