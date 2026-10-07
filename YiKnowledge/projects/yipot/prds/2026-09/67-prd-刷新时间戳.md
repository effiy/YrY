---

doc_type: module
prd_id: "PO-09-67"
title: "PO-09-67: History 页分析刷新时间戳 — 显示最后同步时间"
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

# PO-09-67: History 页分析刷新时间戳

> 数据新鲜度感知：刷新按钮旁显示最后同步时间（"just now" / "30s ago" / "2m ago"），对齐 YiPet StatsBar 新鲜度模式。

## 背景

YiPot History 页新增了 YiAi 分析刷新按钮（第 11 轮），但用户无法知道数据是何时获取的。添加时间戳提升数据新鲜度感知。

## 范围

- `lastRefresh` 状态（Date.now()）
- 刷新按钮旁显示相对时间标签
- 格式：just now / Ns ago / Nm ago

## 验收标准

- [ ] 页面加载/刷新后显示 "just now"
- [ ] 时间推进后显示 "30s ago" / "2m ago"
- [ ] 点击刷新按钮重置为 "just now"