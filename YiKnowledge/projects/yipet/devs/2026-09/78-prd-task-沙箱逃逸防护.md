---
doc_type: module
prd_task_id: "YP-09-71"
title: "YP-09-71: 沙箱逃逸防护 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "78-安全-沙箱逃逸防护.md"
---

# YP-09-71: 沙箱逃逸防护 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-71 · 状态：待开始

## 防护层

| 层级 | 防护 |
|------|------|
| iframe sandbox | `sandbox="allow-scripts"` |
| CSP | script-src 'self' |
| Origin 校验 | postMessage origin 检查 |
| 超时限制 | 5s 强制终止 |
| 内存限制 | 50MB heap 上限 |