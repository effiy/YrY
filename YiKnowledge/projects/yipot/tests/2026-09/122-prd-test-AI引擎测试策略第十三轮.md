---
doc_type: test
title: "YiPot AI 引擎审计与测试策略（第十三轮）— 测试方案"
tags: [测试方案, AI引擎, chatglm, gemini, volcengine]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-122
prd_ref: YP-09-76
dev_ref: YP-09-117
roles: [engineer]
---

# YiPot AI 引擎审计与测试策略（第十三轮）— 测试方案

> 测试编号：YP-09-122 · 关联 PRD：YP-09-76 · 关联开发：YP-09-117

---

## 一、测试用例

### TC-01: ChatGLM — 正常翻译

| 项 | 内容 |
|-----|------|
| **前置条件** | 智谱 API Key 已配置 |
| **步骤** | 翻译 "hello" → en→zh → ChatGLM |
| **预期** | SSE 流式翻译正常，逐字显示结果 |

### TC-02: ChatGLM — API Key 未配置

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 API Key → 翻译 |
| **预期** | `Promise.reject('invalid apikey')` — 非 TypeError |

### TC-03: Gemini — 正常翻译

| 项 | 内容 |
|-----|------|
| **前置条件** | Gemini API Key 已配置 |
| **步骤** | 翻译 "hello" → en→zh → Gemini |
| **预期** | 翻译结果正确 |

### TC-04: Gemini — config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 → 翻译 |
| **预期** | promptList 为 [] → 发送空消息 → API 错误（非 TypeError） |

### TC-05: Volcengine — 正常翻译

| 项 | 内容 |
|-----|------|
| **前置条件** | 火山引擎 AK/SK 已配置 |
| **步骤** | 翻译 "hello" → en→zh → Volcengine |
| **预期** | 翻译结果正确 |

### TC-06: 回归冒烟套件

执行 [主测试策略](../master-test-strategy.md) 中定义的 15 项回归冒烟测试。

---

## 二、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/76-prd-AI引擎测试策略第十三轮.md` |
| 开发方案 | `../devs/2026-09/117-prd-task-AI引擎测试策略第十三轮.md` |
| 主测试策略 | `../master-test-strategy.md` |