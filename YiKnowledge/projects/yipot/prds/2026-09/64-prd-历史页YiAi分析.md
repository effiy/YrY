---

doc_type: module
prd_id: "PO-09-64"
title: "PO-09-64: 历史页 YiAi 分析数据 — 翻译量 + 语种对 + 记忆缓存统计"
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

# PO-09-64: 历史页 YiAi 分析数据展示

> 跨项目数据打通：YiPot History 页仅展示本地 SQLite 统计，应补充 YiAi 云端分析数据（翻译量、活跃语种、热门语种对），实现本地 + 云端双维度统计。

## 背景

YiPot History 页当前仅展示本地 SQLite 的 `total records / unique sources / avg chars` 三个指标。YiAi 提供以下分析 RPC：
- `translation_analytics(days)` → 近 N 天翻译总量 + 目标语言分布
- `top_language_pairs(limit)` → 最热门语种对排名

这些数据已在第 1 轮通过 API 层接入，但无 UI 展示。

## 范围

**In scope**：
- 页面加载时调用 `getAnalytics(7)` + `getTopLanguagePairs(5)` 获取 YiAi 数据
- Stats bar 新增分隔区：7 天翻译量 + 活跃语种数 + Top 3 语种对
- YiAi 不可达时优雅降级（不显示云端统计区）

| 优先级 | 故事 | 验收标准 |
|--------|------|----------|
| P2 | YiAi 统计展示 | 本地统计旁显示 7 天翻译量和热门语种对 |
| P2 | 降级处理 | YiAi 不可达时不显示云端统计区 |

## 验收标准

- [ ] 本地统计右侧显示竖线分隔的云端统计区
- [ ] `N Ai tr.` 显示近 7 天通过 YiAi 的翻译次数
- [ ] `N langs` 显示活跃目标语种数
- [ ] 显示 Top 3 语种对（如 `en→zh, ja→zh, zh→en`）
- [ ] YiAi 不可达时仅显示本地统计

## 关联

- API：[translation.ts getAnalytics/getTopLanguagePairs](../../yipot/devs/2026-09/59-prd-task-翻译分析数据完善.md)