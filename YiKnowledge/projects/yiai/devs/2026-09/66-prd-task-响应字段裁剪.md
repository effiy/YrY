---
doc_type: module
prd_task_id: "YA-09-76"
title: "YA-09-76: 响应字段裁剪 — Sparse Fieldsets 按需返回 — 开发方案"
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
source_prd: "66-需求-响应字段裁剪.md"
source_okr: [yiai-001]
---

# YA-09-76: 响应字段裁剪 — Sparse Fieldsets 按需返回 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[66-需求-响应字段裁剪.md](../../prds/2026-09/66-需求-响应字段裁剪.md)
> 需求编号：YA-09-76 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-09-71 查询优化](./21-prd-task-数据访问层查询优化.md) 的 MongoDB projection 基础上，增加 API 层的 Sparse Fieldsets 支持——客户端通过 `?fields=name,status,created` 指定返回字段。

```python
from fastapi import Query

@router.get("/projects")
async def list_projects(fields: str = Query(None, description="逗号分隔的返回字段")):
    projection = None
    if fields:
        field_list = fields.split(",")
        projection = {f: 1 for f in field_list}
        projection["_id"] = 1  # 始终返回 _id

    docs = await db.projects.find({}, projection=projection).to_list(None)
    return {"data": docs}
```

### 适用端点

| 端点 | 完整响应 | 裁剪后 | 节省 |
|------|---------|--------|------|
| `GET /knowledge/list` | 5KB/doc | 500B/doc | 90% |
| `GET /sessions?fields=title,updated` | 20KB/doc | 200B/doc | 99% |
| `GET /bugs?fields=title,severity,status` | 3KB/doc | 300B/doc | 90% |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `?fields=` Query 参数 + projection | 裁剪后响应体积减少 80%+ | 0.25 |
| 2 | 集成到列表端点 + 测试 | 字段过滤正确 | 0.25 |

**合计：0.5d**。