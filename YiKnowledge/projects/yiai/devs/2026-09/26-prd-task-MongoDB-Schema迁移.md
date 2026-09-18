---
doc_type: module
prd_task_id: "YA-09-95"
title: "YA-09-95: MongoDB Schema 迁移 — 版本管理 + 滚动升级 — 开发方案"
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
source_prd: "26-需求-MongoDB-Schema迁移.md"
source_okr: [yiai-001]
---

# YA-09-95: MongoDB Schema 迁移 — 版本管理 + 滚动升级 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[26-需求-MongoDB-Schema迁移.md](../../prds/2026-09/26-需求-MongoDB-Schema迁移.md)
> 需求编号：YA-09-95 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

MongoDB 无 Schema 约束意味着字段变更不会自动迁移存量数据。通过迁移脚本 + `schema_version` 字段管理变更。

```python
# migrations/001_add_project_owner.py
async def up(db):
    await db.projects.update_many(
        {"owner": {"$exists": False}},
        {"$set": {"owner": "admin", "schema_version": 1}},
    )
async def down(db):
    await db.projects.update_many(
        {"schema_version": 1},
        {"$unset": {"owner": "", "schema_version": ""}},
    )

# migration_runner.py
class MigrationRunner:
    async def migrate(self):
        applied = await db.migrations.find({}, {"_id": 1}).to_list(None)
        applied_ids = {m["_id"] for m in applied}
        for migration in sorted(MIGRATIONS):
            if migration.id not in applied_ids:
                await migration.up(db)
                await db.migrations.insert_one({"_id": migration.id, "applied_at": now})
```

### 规则

| 规则 | 说明 |
|------|------|
| 每个迁移有 `up()` 和 `down()` | 支持回滚 |
| 已应用迁移不重复执行 | `migrations` 集合追踪 |
| 迁移在 startup 时自动执行 | lifespan 中调用 |
| 禁止删除字段 | 先废弃 → 确认无人使用 → 再删除 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | MigrationRunner + 版本追踪 | 迁移幂等执行 | 0.75 |
| 2 | 回滚 + startup 集成 + 测试 | `down()` 可逆 | 0.75 |

**合计：1.5d**。