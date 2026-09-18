---
doc_type: module
prd_task_id: "YP-09-28"
title: "YP-09-28: 注入时机优化 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "35-性能-注入时机优化.md"
---

# YP-09-28: 注入时机优化 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-28 · 优先级：P1

---

<a id="sec-1"></a>
## 一、方案概述

Content Script 注入时机优化：从 `document_idle` 到 `document_start` + 条件等待，减少 Pet 出现延迟。

### 注入时机对比

| 时机 | 延迟 | 适用 |
|------|------|------|
| `document_start` | 最快 | CSS + 骨架先注入 |
| `document_end` | DOM 就绪 | 脚本注入 |
| `document_idle` | 最慢 | 当前默认 |

### 优化策略

- CSS 在 `document_start` 注入（避免闪烁）
- 脚本在 `document_end` 注入（DOM 就绪）
- Floating Pet 懒渲染（用户可见时才渲染）

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |
