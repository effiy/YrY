---
doc_type: module
prd_task_id: "YP-09-92"
title: "YP-09-92: 离线支持与缓存策略 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "99-基础设施-离线支持与缓存策略.md"
---

# YP-09-92: 离线支持与缓存策略 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-92 · 状态：待开始

## 离线策略

| 资源 | 缓存方式 |
|------|---------|
| 静态资源 | Cache API |
| 会话数据 | chrome.storage + IndexedDB |
| API 响应 | SW fetch 拦截缓存 |
| 图片/字体 | Cache API 预缓存 |