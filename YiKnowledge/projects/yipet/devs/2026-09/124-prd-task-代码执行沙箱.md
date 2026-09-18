---
doc_type: module
prd_task_id: "YP-09-117"
title: "YP-09-117: 代码执行沙箱 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "124-安全-代码执行沙箱.md"
---

# YP-09-117: 代码执行沙箱 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-117 · 状态：待开始

## 安全沙箱

AI 生成的代码在隔离环境执行。

| 约束 | 说明 |
|------|------|
| iframe sandbox | `sandbox="allow-scripts"` |
| CSP 限制 | 禁止网络请求 |
| 超时 | 5s 超时自动终止 |
| 输出限制 | 最大 1000 字符 |