---
doc_type: module
prd_task_id: "YA-09-50"
title: "YA-09-50: 统一分页规范 — offset + cursor 两种模式 — 开发方案"
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
source_prd: "64-需求-统一分页规范.md"
source_okr: [yiai-001]
---

# YA-09-50: 统一分页规范 — offset + cursor 两种模式 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[64-需求-统一分页规范.md](../../prds/2026-09/64-需求-统一分页规范.md)
> 需求编号：YA-09-50 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

当前 `data_service.query_documents` 使用 offset 分页（`pageNum`/`pageSize`）。大数据集下 offset 性能差（MongoDB 需跳过前 N 条）。增加 cursor 分页模式，两种模式通过参数自动选择。

```python
class Pagination:
    # Offset 模式（≤ 1000 条）
    offset: int | None  # pageNum
    limit: int = 20     # pageSize

    # Cursor 模式（> 1000 条）
    cursor: str | None  # 上一页最后一条的 _id
    direction: Literal["next", "prev"] = "next"

async def paginate(collection, pagination: Pagination, filter: dict):
    if pagination.cursor:
        # Cursor: WHERE _id > cursor ORDER BY _id LIMIT limit
        if pagination.cursor:
            filter["_id"] = {"$gt": ObjectId(pagination.cursor)}
        docs = await collection.find(filter).sort("_id", 1).limit(pagination.limit).to_list(None)
    else:
        # Offset: SKIP offset LIMIT limit
        docs = await collection.find(filter).skip(pagination.offset * pagination.limit).limit(pagination.limit).to_list(None)
    return docs
```

### 选择策略

| 数据集 | 模式 | 原因 |
|--------|------|------|
| < 1000 条 | offset | 简单直观 |
| > 1000 条 | cursor | O(1) 定位，不受数据量影响 |
| 实时数据 | cursor | 避免插入/删除导致重复/遗漏 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Pagination 模型 + cursor 实现 | 万级数据集分页 < 50ms | 0.5 |
| 2 | 集成到 data_service + 测试 | 两种模式可切换 | 0.5 |

**合计：1.0d**。