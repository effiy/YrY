---
doc_type: module
prd_task_id: "YP-09-124"
title: "YP-09-124: 浏览器历史搜索 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "131-功能实现-浏览器历史搜索.md"
---

# YP-09-124: 浏览器历史搜索 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-124 · 状态：待开始

## 历史搜索

`chrome.history.search` 全文检索浏览历史。

| 功能 | API |
|------|-----|
| 关键词搜索 | `chrome.history.search({text})` |
| 时间范围 | `startTime/endTime` |
| 最近访问 | `chrome.history.getVisits` |
| 删除记录 | `chrome.history.deleteUrl` |