---
doc_type: module
prd_task_id: "YA-09-75"
title: "YA-09-75: Dashboard 预聚合快照 — 定时物化视图替代实时查询 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "83-需求-Dashboard预聚合快照.md"
source_okr: [yiai-001]
---

# YA-09-75: Dashboard 预聚合快照 — 定时物化视图替代实时查询 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[83-需求-Dashboard预聚合快照.md](../../prds/2026-09/83-需求-Dashboard预聚合快照.md)
> 需求编号：YA-09-75 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Dashboard 的实时聚合查询（`$group`、`$count`）在大数据集下延迟高。定时预计算快照存入 `dashboard_snapshots` 集合，Dashboard API 直接读取快照。

```python
async def build_snapshot():
    snapshots = {
        "knowledge_stats": {
            "total": await db.knowledge_files.count_documents({}),
            "by_type": await db.knowledge_files.aggregate([{"$group": {"_id": "$type", "count": {"$sum": 1}}}]).to_list(None),
        },
        "session_stats": {
            "total": await db.sessions.count_documents({}),
            "active_24h": await db.sessions.count_documents({"updated_at": {"$gte": now - timedelta(hours=24)}}),
        },
        "timestamp": now,
    }
    await db.dashboard_snapshots.insert_one(snapshots)

# apscheduler: 每 5 分钟
scheduler.add_job(build_snapshot, "interval", minutes=5)
```

### 快照 vs 实时

| 维度 | 实时聚合 | 预计算快照 |
|------|---------|-----------|
| 延迟 | 取决于数据量 | < 5min (可接受) |
| 查询耗时 | 500ms-5s | < 10ms |
| MongoDB 负载 | 每次查询 N 次聚合 | 0（读取单文档） |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 快照构建 + apscheduler | 快照集合 5 分钟更新 | 0.5 |
| 2 | Dashboard API 改造 + 测试 | API 延迟 < 10ms | 0.5 |

**合计：1.0d**。