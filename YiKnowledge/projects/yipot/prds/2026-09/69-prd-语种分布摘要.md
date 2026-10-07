---

doc_type: module
prd_id: "PO-09-69"
title: "PO-09-69: History 页语种分布 — 展示 Top 3 目标语言"
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

# PO-09-69: History 页语种分布摘要

> 数据洞察：在 History stats bar 中展示最常用的目标语言（如 "zh en ja"），利用已有的 `getAnalytics` RPC 返回的 `by_target_language` 数据。

## 范围

- `loadYiAiStats` 提取 Top 3 目标语言
- Stats bar 中 `N langs` 旁显示 "zh en ja"
- 已有数据，无需新 API 调用

## 验收标准

- [ ] 显示 "5 langs zh en ja" 格式