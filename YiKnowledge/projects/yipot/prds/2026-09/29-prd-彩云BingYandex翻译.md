---
doc_type: prd
title: "YP-09-S18: 彩云小译/Bing/Yandex 翻译集成"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S18
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 彩云, Bing, Yandex, 翻译]
category: 项目/桌面应用/需求
---

# YP-09-S18: 彩云小译/Bing/Yandex 翻译集成

> 需求编号：YP-09-S18 · 优先级：P2 · 人天：0.5d · 状态：已完成

## 彩云小译

- Token 认证
- 中日英翻译优化
- 实时翻译 API

## Bing 翻译

- Azure API Key
- 微软翻译引擎
- 100+ 语言

## Yandex 翻译

- API Key 认证
- 俄语翻译质量最佳
- 90+ 语言

## 验收标准

- [ ] 三个服务均独立可用
- [ ] 启用/禁用独立控制
- [ ] API Key 错误提示

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 彩云 Token 无效 | 异常 | 提示"彩云小译 Token 无效" | — |
| Bing API Key 无效 | 异常 | 提示"Azure 翻译 Key 验证失败" | — |
| Yandex API Key 无效 | 异常 | 提示"Yandex API Key 无效" | — |
| Bing 国内不可达 | 异常 | 提示"Bing 翻译无法访问，请使用代理" | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 安全 | API Key 存储 | AES-256 加密 | 磁盘检查 |
| 性能 | 三服务响应时间 | P95 ≤ 1s (每服务) | 100 次计时 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | 彩云小译 API | HTTPS POST | `{source, trans_type, request_id}` |
| 依赖 | Bing 翻译 API (Azure) | HTTPS POST | `[{Text: "..."}]` |
| 依赖 | Yandex 翻译 API | HTTPS POST | `{texts, sourceLang, targetLang}` |
| 依赖 | 插件配置存储 | Tauri config | Token/API Key |
| 被依赖 | 划词翻译核心 | 插件接口 | `translate(text, from, to) → result` |

---

## 相关文档

- 开发方案: [95-prd-task-彩云BingYandex翻译](../../devs/2026-09/95-prd-task-彩云BingYandex翻译.md)
- 测试方案: [29-prd-test-彩云BingYandex翻译](../../tests/2026-09/29-prd-test-彩云BingYandex翻译.md)
- 翻译服务接口全景: [05-prd-翻译服务接口全景](./05-prd-翻译服务接口全景.md)

---

## 量化验收标准

### 彩云小译

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 翻译响应时间 (P50) | < 400ms | fetch 计时，排除网络延迟 |
| 翻译准确率 (中→英) | BLEU > 0.38 | 标准测试集 (100 条) |
| 翻译准确率 (中→日) | BLEU > 0.35 | 标准测试集 (100 条) |
| Token 认证成功率 | 100% (有效 Token) | 冒烟测试 10 次 |
| 支持语言对 | 中/英/日 (3 种) | 对照[彩云小译 API 文档](https://docs.caiyunapp.com/translator/) |

### Bing (Azure) 翻译

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 翻译响应时间 (P50) | < 600ms | fetch 计时，排除网络延迟 |
| 翻译准确率 (中→英) | BLEU > 0.42 | 标准测试集 (100 条) |
| Azure API Key 认证成功率 | 100% (有效 Key) | 冒烟测试 10 次 |
| 支持语言对数量 | >= 100 种 | 对照 [Azure Translator 文档](https://learn.microsoft.com/azure/ai-services/translator/) |
| 自动语言检测准确率 | >= 95% | 100 条多语言样本 |

### Yandex 翻译

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 翻译响应时间 (P50) | < 500ms | fetch 计时，排除网络延迟 |
| 翻译准确率 (中→俄) | BLEU > 0.35 | 标准测试集 (100 条) |
| API Key 认证成功率 | 100% (有效 Key) | 冒烟测试 10 次 |
| 支持语言对数量 | >= 90 种 | 对照 [Yandex Translate API 文档](https://yandex.com/dev/translate/) |

### 通用

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 三服务独立启用/禁用 | 每个服务可独立开关 | UI 配置面板 |
| 并行调度兼容性 | 三服务与其他翻译源并行无冲突 | 10 次并行翻译测试 |

## 边界条件与异常处理 (补充)

### 彩云小译

| 边界/异常 | 触发条件 | 预期行为 | 用户感知 |
|----------|---------|---------|---------|
| Token 无效 | 401 响应 | 提示"彩云小译 Token 无效" | "彩云小译 Token 无效，请检查" |
| 不支持的语言对 | from/to 不是 zh/en/ja | 翻译入口不显示彩云选项 | — |
| rate limit | 请求过频 | 退避 3s → 重试 1 次 | "彩云小译请求频繁，请稍后" |

### Bing (Azure) 翻译

| 边界/异常 | 触发条件 | 预期行为 | 用户感知 |
|----------|---------|---------|---------|
| API Key 无效 | 401 响应 | 提示"Azure 翻译 Key 验证失败" | "Azure API Key 无效" |
| 区域 (region) 不匹配 | Key 对应区域与请求区域不一致 | 提示"请检查 Azure 区域设置" | "Azure 区域配置不匹配" |
| 国内网络不可达 | api.cognitive.microsofttranslator.com DNS 解析失败 | 提示"Bing 翻译无法访问，请使用代理" | "Bing 翻译无法访问" |
| 字符配额耗尽 | 403 响应 (超免费层 2M 字符/月) | 提示"Azure 免费层配额已用完" | "Azure 配额已用完 (2M 字符/月)" |

### Yandex 翻译

| 边界/异常 | 触发条件 | 预期行为 | 用户感知 |
|----------|---------|---------|---------|
| API Key 无效 | 403/401 响应 | 提示"Yandex API Key 无效" | "Yandex API Key 无效" |
| 不支持的语言对 | 501 (The specified language is not supported) | 提示"Yandex 不支持该语言组合" | "Yandex 不支持该语言" |
| rate limit | 429 响应 | 退避 Retry-After → 重试 1 次 | "Yandex 请求频繁，请稍后" |
| 俄语网络不可达 | translate.api.cloud.yandex.net 连接超时 | 提示"Yandex 翻译无法访问" | "Yandex 翻译无法访问" |

## API 端点与认证总览

| 服务 | API 端点 | 认证方式 | 免费额度 |
|------|---------|---------|---------|
| 彩云小译 | `https://api.interpreter.caiyunai.com/v1/translator` | Header: `X-Authorization: token {token}` | 100 万字符/月 |
| Bing (Azure) | `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0` | Header: `Ocp-Apim-Subscription-Key: {key}` + `Ocp-Apim-Subscription-Region: {region}` | 2M 字符/月 (F0 免费层) |
| Yandex | `https://translate.api.cloud.yandex.net/translate/v2/translate` | Header: `Authorization: Api-Key {key}` | 无免费层级 (需绑定 Yandex Cloud 账单账户) |

## 关联文档

| 文档 | 关系 | 路径 |
|------|------|------|
| 彩云/Bing/Yandex 开发方案 | Dev Doc | [待创建](../../devs/2026-09/) |
| DeepL 翻译 PRD | 同级翻译源 | [20-prd-DeepL翻译.md](./20-prd-DeepL翻译.md) |
| Google 翻译 PRD | 同级翻译源 | [21-prd-Google翻译.md](./21-prd-Google翻译.md) |
| 有道翻译 PRD | 同级翻译源 | [28-prd-有道翻译.md](./28-prd-有道翻译.md) |
| 翻译核心架构 | 父模块 | [01-prd-task-翻译核心架构.md](../../devs/2026-09/01-prd-task-翻译核心架构.md) |
| 翻译服务插件实现 | 插件规范 | [04-prd-task-翻译服务插件实现.md](../../devs/2026-09/04-prd-task-翻译服务插件实现.md) |
| 彩云小译 API 文档 | 外部参考 | https://docs.caiyunapp.com/translator/ |
| Azure Translator API 文档 | 外部参考 | https://learn.microsoft.com/azure/ai-services/translator/ |
| Yandex Translate API 文档 | 外部参考 | https://yandex.com/dev/translate/ |
| YiPot 翻译服务接口全景 | 架构概览 | [05-prd-翻译服务接口全景](./05-prd-翻译服务接口全景.md) |