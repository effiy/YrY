---
doc_type: module
prd_task_id: "YA-09-71"
title: "YA-09-71: 数据访问层查询优化 — 聚合管道 + 字段投影 + 索引策略 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "21-需求-数据访问层查询优化.md"
source_okr: [yiai-001]
---

# YA-09-71: 数据访问层查询优化 — 聚合管道 + 字段投影 + 索引策略 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[21-需求-数据访问层查询优化.md](../../prds/2026-09/21-需求-数据访问层查询优化.md)
> 需求编号：YA-09-71 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

`data_service.query_documents` 当前返回完整文档。增加字段投影 (projection)、聚合管道支持和索引策略建议。

```python
# 字段投影：减少传输量
await collection.find(filter, projection={"content": 0, "messages": 0})

# 聚合管道：Dashboard 统计
pipeline = [
    {"$match": {"status": "active"}},
    {"$group": {"_id": "$category", "count": {"$sum": 1}}},
]
result = await collection.aggregate(pipeline).to_list(None)
```

### 优化措施

| 措施 | 适用场景 | 预期提升 |
|------|---------|---------|
| 字段投影 | 列表页（不需要 body/content） | 传输量 -70% |
| 索引覆盖 | 排序 + 过滤查询 | 查询时间 -90% |
| 聚合管道 | Dashboard 统计 | 替代 N+1 查询 |
| `allowDiskUse` | 大数据集排序 | 避免内存溢出 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | projection + aggregation RPC 参数 | `fields`/`aggregate` 参数生效 | 0.75 |
| 2 | 索引分析 + Dashboard 集成 + 测试 | 慢查询减少 80% | 0.75 |

**合计：1.5d**。