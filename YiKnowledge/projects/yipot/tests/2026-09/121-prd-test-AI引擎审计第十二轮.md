---
doc_type: test
title: "YiPot AI 引擎与 Rust 审计（第十二轮）— 测试方案"
tags: [测试方案, AI引擎, ollama, bing, null-safety]
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
test_id: YP-09-121
prd_ref: YP-09-75
dev_ref: YP-09-116
roles: [engineer]
---

# YiPot AI 引擎与 Rust 审计（第十二轮）— 测试方案

> 测试编号：YP-09-121 · 关联 PRD：YP-09-75 · 关联开发：YP-09-116

---

## 一、测试用例

### TC-01: Ollama 翻译 — 正常

| 项 | 内容 |
|-----|------|
| **前置条件** | Ollama 本地运行，模型已加载 |
| **步骤** | 翻译 "hello" → en→zh → Ollama |
| **预期** | 正常返回翻译结果 |

### TC-02: Ollama — config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 Ollama → 翻译 |
| **预期** | model/requestPath 为 undefined → API 错误（非 TypeError） |

### TC-03: Bing 翻译 — 正常

| 项 | 内容 |
|-----|------|
| **步骤** | 翻译 "hello" → en→zh → Bing |
| **预期** | 正常返回翻译结果 |

### TC-04: Bing — 空响应

| 项 | 内容 |
|-----|------|
| **步骤** | Mock Bing API 返回 `[]` |
| **预期** | `result?.[0]?.translations` → undefined → throw JSON.stringify（非 TypeError） |

### TC-05: 剪切板监听启停

| 项 | 内容 |
|-----|------|
| **步骤** | 托盘菜单 → 启停剪切板监听 5 次 |
| **预期** | 每次切换正确，无资源泄漏 |

---

## 二、回归测试

- Ollama + Bing 翻译各一次
- 剪切板监听启停循环

## 三、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/75-prd-AI引擎审计第十二轮.md` |
| 开发方案 | `../devs/2026-09/116-prd-task-AI引擎审计第十二轮.md` |