---
doc_type: module
prd_task_id: "YP-09-06"
title: "YP-09-06: 安全配置 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "13-合规-安全配置.md"
---

# YP-09-06: 安全配置 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-06 · 优先级：P0

---

<a id="sec-1"></a>
## 一、方案概述

MV3 CSP 完善、host_permissions 最小化、web_accessible_resources 精确声明。

### 安全配置

| 配置 | 值 | 说明 |
|------|-----|------|
| CSP | `script-src 'self'` | 禁止 eval/inline/remote |
| host_permissions | `localhost:10086/*` + 生产 API | 最小权限 |
| web_accessible_resources | `assets/*`, `cdn/*` | 精确声明 |
| content_scripts.matches | `<all_urls>` | 宠物需在任意页面显示 |

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
