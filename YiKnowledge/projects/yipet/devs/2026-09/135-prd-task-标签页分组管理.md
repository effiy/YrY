---
doc_type: module
prd_task_id: "YP-09-128"
title: "YP-09-128: 标签页分组管理 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "135-功能实现-标签页分组管理.md"
---

# YP-09-128: 标签页分组管理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-128 · 状态：待开始

## 分组功能

`chrome.tabs` + `chrome.tabGroups` API。

| 功能 | API |
|------|-----|
| 创建分组 | `chrome.tabs.group` |
| 命名分组 | `chrome.tabGroups.update` |
| 颜色标记 | `chrome.tabGroups.update({color})` |
| 折叠展开 | `chrome.tabGroups.update({collapsed})` |