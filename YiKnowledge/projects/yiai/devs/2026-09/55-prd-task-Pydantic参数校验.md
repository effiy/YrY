---
doc_type: module
prd_task_id: "YA-09-101"
title: "YA-09-101: Pydantic 参数校验增强 — RPC 参数模型 + 自定义验证器 — 开发方案"
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
source_prd: "55-需求-Pydantic参数校验.md"
source_okr: [yiai-002]
---

# YA-09-101: Pydantic 参数校验增强 — RPC 参数模型 + 自定义验证器 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[55-需求-Pydantic参数校验.md](../../prds/2026-09/55-需求-Pydantic参数校验.md)
> 需求编号：YA-09-101 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

RPC 方法的 `parameters` 当前是自由 `dict`。为每个 RPC 方法定义 Pydantic model，自动校验参数类型和范围。

```python
from pydantic import BaseModel, Field, model_validator

class QueryDocumentsParams(BaseModel):
    cname: str = Field(..., min_length=1, max_length=50)
    filter: dict = Field(default_factory=dict)
    pageSize: int = Field(default=20, ge=1, le=1000)
    orderBy: str | None = None

    @model_validator(mode="after")
    def forbid_query_param(self):
        if "query" in self.filter:
            raise ValueError("请使用 'filter' 而非 'query'")
        return self

METHOD_PARAMS = {
    "services.database.data_service.query_documents": QueryDocumentsParams,
}

async def validate_rpc_params(module_name: str, params: dict):
    model = METHOD_PARAMS.get(f"{module_name}")
    if model: return model(**params).model_dump()
    return params  # 未定义模型的方法透传
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Pydantic model 注册 + 自动校验 | `query` 参数被拦截提示 | 0.25 |
| 2 | 集成到 RPC 调度 + 测试 | 校验失败返回友好错误 | 0.25 |

**合计：0.5d**。