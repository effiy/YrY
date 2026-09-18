---
doc_type: module
prd_task_id: "YP-09-154"
title: "YP-09-154: 时间戳转换器 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "161-工具-时间戳转换器.md"
---

# YP-09-154: 时间戳转换器 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-154 · 状态：待开始

## 时间戳转换

| 功能 | 说明 |
|------|------|
| Unix→日期 | `new Date(ts*1000)` |
| 日期→Unix | `date.getTime()()` |
| 当前时间戳 | `Date.now()` |
| 多时区 | Intl.DateTimeFormat |