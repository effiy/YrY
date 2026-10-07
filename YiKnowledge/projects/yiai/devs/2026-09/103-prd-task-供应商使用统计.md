---

doc_type: task
prd_task_id: "YA-09-103"
title: "YA-09-103: 供应商使用统计 — 技术设计"
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
source_prd: "103-需求-供应商使用统计.md"

type: task
---

# YA-09-103: 供应商使用统计 — 技术设计

## 业务上下文

为 YiAi 新增 `provider_breakdown(days)` 函数，统计各供应商调用次数和成功次数，暴露为 RPC 方法。

## 架构

```
provider_breakdown(days) → $match(by date) → $unwind(results) → $group(by provider)
  → {provider, count, success_count}
```

## 实现细节

**文件**：`services/translation/provider_health.py`

**聚合管道**：`$match` 时间窗口 → `$unwind results` 展开数组 → `$group {count: $sum 1, success_count: $sum {$cond: [{$ne: ["$results.text", ""]}, 1, 0]}}`

## 非功能需求

| 维度 | 目标 |
|------|------|
| 延迟 | <100ms（万条） |
| 可用性 | MongoDB 不可达 → [] |