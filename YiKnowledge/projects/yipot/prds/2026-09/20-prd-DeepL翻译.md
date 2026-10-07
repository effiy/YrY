---
doc_type: prd
title: "YP-09-S09: DeepL 翻译服务集成"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S09
estimate_frontend: 0.3
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, DeepL, 翻译, API]
category: 项目/桌面应用/需求
---

# YP-09-S09: DeepL 翻译服务集成

> 需求编号：YP-09-S09 · 优先级：P1 · 人天：0.3d · 状态：已完成

## 背景

DeepL 以欧洲语言翻译质量著称，在专业文档翻译场景中优于 Google/百度。支持术语表（glossary）和正式/非正式语体选择。

## 需求

- API Key 认证（支持 Free/Pro 两种 endpoint）
- `formality` 参数：default/prefer_more/prefer_less
- 支持 30+ 语言对
- 保留 HTML/XML 标签

## 验收标准

- [ ] Free API 和 Pro API 均可正常使用
- [ ] formality 参数生效
- [ ] API Key 错误时明确提示

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| Free API Key 使用 Pro endpoint | 异常 | 返回 403，提示"请使用 Free API URL" | — |
| Pro API Key 使用 Free endpoint | 边界 | 正常使用（Free endpoint 兼容 Pro Key） | — |
| formality 参数对语言不适用 | 边界 | DeepL 自动忽略，不影响翻译 | — |
| 不支持的语言对 | 异常 | 提示"DeepL 不支持该语言组合" | — |
| HTML 标签保留 | 边界 | 翻译结果保持标签结构不变 | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | API 响应时间 | P95 ≤ 1s | 100 次计时 |
| 安全 | API Key 存储 | AES-256 加密 | 磁盘检查 |
| 可用性 | formality 参数 | default/prefer_more/prefer_less 三选一 | 功能测试 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | DeepL API (Free/Pro) | HTTPS POST | `{text, target_lang, formality}` |
| 依赖 | 插件配置存储 | Tauri config | API Key + endpoint URL |
| 被依赖 | 划词翻译核心 | 插件接口 | `translate(text, from, to) → result` |

---

## 相关文档

- 开发方案: [20-prd-task-DeepL翻译](../../devs/2026-09/20-prd-task-DeepL翻译.md)
- 测试方案: [20-prd-test-DeepL翻译](../../tests/2026-09/20-prd-test-DeepL翻译.md)
- 翻译服务接口全景: [05-prd-翻译服务接口全景](./05-prd-翻译服务接口全景.md)

---

## 量化验收标准

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 翻译响应时间 (P50) | < 800ms | fetch 计时，排除网络延迟 |
| 翻译响应时间 (P95) | < 2,000ms | fetch 计时，含网络 |
| 翻译准确率 (中→英) | BLEU > 0.45 | WMT 中英标准测试集 (100 条) |
| 翻译准确率 (英→德) | BLEU > 0.50 | WMT 英德标准测试集 (100 条) |
| 翻译准确率 (英→法) | BLEU > 0.50 | WMT 英法标准测试集 (100 条) |
| API Key 认证成功率 | 100% (有效 Key) | 冒烟测试，每个 Plan 3 次 |
| formality 参数覆盖 | DE/FR/IT/ES/NL/PL/PT/RU 全部 8 种 | 每种语言分别测试 formal/informal |
| HTML/XML 标签保留率 | 100% | `<p>Hello <b>world</b></p>` 等 20 个 case |
| Free Plan 配额耗尽提示 | 错误码 456 → 明确中文提示 | 超过 500,000 字符/月 |
| 支持语言对数量 | >= 30 种 | 对照 [DeepL API 文档](https://www.deepl.com/docs-api) 验证 |