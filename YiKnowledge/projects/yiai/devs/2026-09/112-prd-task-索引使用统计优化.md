---
doc_type: module
prd_task_id: "YA-09-119"
title: "YA-09-119: 索引使用统计 — 未使用索引检测与清理 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "112-需求-索引使用统计优化.md"
source_okr: [yiai-001]
---

# YA-09-119: 索引使用统计 — 未使用索引检测与清理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[112-需求-索引使用统计优化.md](../../prds/2026-09/112-需求-索引使用统计优化.md)
> 需求编号：YA-09-119 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

`$indexStats` 返回每个索引的访问次数。未使用索引浪费存储和写入性能，定期检测并建议清理。

```python
async def unused_indexes():
    unused = []
    for cname in await db.list_collection_names():
        stats = await db[cname].aggregate([{"$indexStats": {}}]).to_list(None)
        for idx in stats:
            if idx["accesses"]["ops"] == 0:
                days_since_creation = (datetime.now() - idx.get("created", datetime.min)).days
                if days_since_creation > 30:
                    unused.append({"collection": cname, "index": idx["name"], "size_mb": idx.get("size", 0)})
    return unused
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `$indexStats` 分析 + 建议报告 | 未使用索引可被发现 | 0.25 |
| 2 | 定期巡检 + Dashboard + 测试 | 每月自动报告未使用索引 | 0.25 |

**合计：0.5d**。