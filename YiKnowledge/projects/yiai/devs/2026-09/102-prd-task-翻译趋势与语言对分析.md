---

doc_type: task
prd_task_id: "YA-09-102"
title: "YA-09-102: 翻译趋势与语言对分析 — 技术设计"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate: 0.15
source_prd: "102-需求-翻译趋势与语言对分析.md"

type: task
---

# YA-09-102: 翻译趋势与语言对分析 — 技术设计

## 业务上下文

为 YiAi 新增 `hourly_trend(days)` 和 `top_language_pairs(limit)` 两个分析函数，通过 MongoDB 聚合管道实时计算。

## 架构

```
hourly_trend(days) → $match → $dateToString("%Y-%m-%dT%H") → $group → $sort
top_language_pairs(limit) → $group(from+to) → $sort(count) → $limit
```

## 实现细节

**文件**：`services/translation/provider_health.py`

**hourly_trend**：`$dateToString` 按小时格式化 → `$group {count: $sum 1, chars: $sum source_length}` → sorted by `_id`

**top_language_pairs**：`$group {_id: {from, to}, count, total_chars}` → `$sort {count: -1}` → `$limit`

## 非功能需求

| 维度 | 目标 |
|------|------|
| hourly_trend 延迟 | <80ms（3000 条） |
| top_language_pairs 延迟 | <50ms |