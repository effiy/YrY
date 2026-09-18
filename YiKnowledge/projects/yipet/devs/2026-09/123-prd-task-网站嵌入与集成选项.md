---
doc_type: module
prd_task_id: "YP-09-116"
title: "YP-09-116: 网站嵌入与集成选项 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "123-功能实现-网站嵌入与集成选项.md"
---

# YP-09-116: 网站嵌入与集成选项 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-116 · 状态：待开始

## 嵌入方式

| 方式 | 说明 |
|------|------|
| iframe 嵌入 | 网站嵌入聊天窗口 |
| Web Component | `<yi-pet-chat>` 自定义元素 |
| JS SDK | `YiPet.init({...})` 初始化 |