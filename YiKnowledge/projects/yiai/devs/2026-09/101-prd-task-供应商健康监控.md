---

doc_type: task
prd_task_id: "YA-09-101"
title: "YA-09-101: 供应商健康监控 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate: 0.2
source_prd: "101-需求-供应商健康监控.md"

type: task
---

# YA-09-101: 供应商健康监控 — 技术设计

> 子任务文档，主任务：[100-prd-task-翻译分析增强](./100-prd-task-翻译分析增强.md)

## 业务上下文

为 YiAi 新增 `provider_health()` 函数，通过 MongoDB 聚合管道计算各供应商成功率，按 healthy/degraded/down 三级判定状态，暴露为 RPC 方法供 YiVad Dashboard 消费。

## 架构

```
provider_health(hours) → MongoDB aggregation pipeline:
  $match(created_at ≥ cutoff) → $unwind(results) → $group(by provider)
  → Python: success_rate = (total-empty)/total → status 判定
```

## 实现细节

**文件**：`services/translation/provider_health.py` → `provider_health(hours=24)`

**核心算法**：`success_rate = (total - empty) / total`；`status = "healthy" if rate >= 0.95 else ("degraded" if rate >= 0.70 else "down")`

**错误处理**：try/except → logger.warning → 返回空 dict

## 非功能需求

| 维度 | 目标 |
|------|------|
| 延迟 | <50ms（500条内） |
| 可用性 | MongoDB 不可达 → 空结果不报错 |