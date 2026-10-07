---

doc_type: module
prd_id: "PO-09-68"
title: "PO-09-68: History 页供应商健康摘要 — 展示 healthy/total 引擎数"
status: 已完成
priority: P2
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: 需求
---

# PO-09-68: History 页供应商健康摘要

> 运维可视性：在 History 页展示供应商健康概览（N/M healthy），与 YiVad TranslationAnalytics 供应商健康柱状图互补。

## 背景

YiAi `provider_health` RPC 返回各引擎状态（healthy/degraded/down）。YiVad TranslationAnalytics 用柱状图展示，YiPot History 页可在统计栏中简明展示健康引擎数。

## 范围

- 调用已有的 `getProviderHealth` RPC（已集成）
- Stats bar 新增 `N/M healthy` 显示
- 全部健康时绿色，否则黄色

## 验收标准

- [ ] 显示 "5/5 healthy"（全部健康时绿色）
- [ ] 显示 "3/5 healthy"（有异常时黄色）