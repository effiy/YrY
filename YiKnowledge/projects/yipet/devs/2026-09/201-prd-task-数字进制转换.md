---
doc_type: module
prd_task_id: "YP-09-194"
title: "YP-09-194: 数字进制转换 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "201-工具-数字进制转换.md"
---

# YP-09-194: 数字进制转换 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-194 · 状态：待开始

## 进制转换

| 进制 | 方法 |
|------|------|
| 2(Bin) | `num.toString(2)` |
| 8(Oct) | `num.toString(8)` |
| 10(Dec) | `parseInt(s,10)` |
| 16(Hex) | `num.toString(16)` |
| 实时 | 输入即转换 |