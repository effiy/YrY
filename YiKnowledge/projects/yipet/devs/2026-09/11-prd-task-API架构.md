---
doc_type: module
prd_task_id: "YP-09-04"
title: "YP-09-04: API 架构合规 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "11-合规-API架构.md"
---

# YP-09-04: API 架构合规 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-04 · 优先级：P0

---

<a id="sec-1"></a>
## 一、方案概述

4-Tier API 层全面合规：所有调用必须经过 ApiClient→Endpoints→Types→Services，消除直接 fetch 调用。

### 合规检查

| 检查项 | 工具 |
|--------|------|
| 无直接 fetch | `rg "fetch(" src/ --not -path "*/api/*"` |
| 参数名契约 | `rg '"query"' src/api` 零结果 |
| RPC 信封统一 | 所有请求 body 含 module_name/method_name/parameters |
| Token 自动附加 | 无手动 X-Token 设置 |

### 迁移清单

| 文件 | 问题 | 修复 |
|------|------|------|
| 组件中直接 fetch | 绕过 ApiClient | 迁移到 Service 层 |
| 参数名 query→filter | 后端静默忽略 | 全局替换 |
| 手动 X-Token | 重复代码 | 由 ApiClient 统一处理 |

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
