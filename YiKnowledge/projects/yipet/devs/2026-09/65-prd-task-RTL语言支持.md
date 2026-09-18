---
doc_type: module
prd_task_id: "YP-09-58"
title: "YP-09-58: RTL 语言支持 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "65-功能实现-RTL语言支持.md"
---

# YP-09-58: RTL 语言支持 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-58 · 状态：待开始

## RTL 适配

`direction: rtl` + `writing-mode` 适配阿拉伯语/希伯来语。

| 适配项 | CSS |
|--------|-----|
| 文字方向 | `direction: rtl` |
| 布局镜像 | `flex-direction: row-reverse` |
| 图标翻转 | `transform: scaleX(-1)` |
| 内边距 | `padding-inline-start/end` |