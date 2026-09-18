---
doc_type: module
prd_task_id: "YA-09-64"
title: "YA-09-64: 慢查询索引建议 — MongoDB profiler + explain 分析 — 开发方案"
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
source_prd: "81-需求-慢查询索引建议.md"
source_okr: [yiai-001]
---

# YA-09-64: 慢查询索引建议 — MongoDB profiler + explain 分析 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[81-需求-慢查询索引建议.md](../../prds/2026-09/81-需求-慢查询索引建议.md)
> 需求编号：YA-09-64 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

启用 MongoDB profiler（`level: 1, slowms: 100`），定期分析慢查询的 `explain()` 结果，自动建议缺失索引。

```python
async def analyze_slow_queries():
    profile = db.system.profile.find({"millis": {"$gt": 100}}).sort("ts", -1).limit(50)
    suggestions = []
    async for entry in profile:
        explain = await db.command("explain", {"find": entry["ns"].split(".")[1], "filter": entry["command"].get("filter", {})})
        if explain["queryPlanner"]["winningPlan"].get("stage") == "COLLSCAN":
            # 全表扫描 → 建议索引
            filter_keys = list(entry["command"].get("filter", {}).keys())
            suggestions.append({
                "collection": entry["ns"],
                "query": entry["command"].get("filter"),
                "duration_ms": entry["millis"],
                "suggested_index": filter_keys,
            })
    return suggestions
```

### 自动索引管理

| 操作 | 条件 |
|------|------|
| 建议索引 | COLLSCAN + 查询频率 > 10/天 |
| 自动创建 | 建议索引 + 索引大小 < 100MB |
| 需人工确认 | 复合索引 3+ 字段 或 唯一索引 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | profiler 启用 + explain 分析 | 慢查询被识别和分类 | 0.5 |
| 2 | 索引建议 + 自动创建 (保守) + 测试 | COLLSCAN 查询减少 80%+ | 0.5 |

**合计：1.0d**。