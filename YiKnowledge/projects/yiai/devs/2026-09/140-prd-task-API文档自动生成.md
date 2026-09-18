---
doc_type: module
prd_task_id: "YA-09-44"
title: "YA-09-44: API 文档自动生成 — OpenAPI + Scalar 控制台 — 开发方案"
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
source_prd: "140-需求-API文档自动生成.md"
source_okr: [yiai-002]
---

# YA-09-44: API 文档自动生成 — OpenAPI + Scalar 控制台 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[140-需求-API文档自动生成.md](../../prds/2026-09/140-需求-API文档自动生成.md)
> 需求编号：YA-09-44 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

FastAPI 已内置 OpenAPI 生成（`/docs` 和 `/redoc`）。增强：添加 Pydantic schema 描述、RPC 端点目录、交互式 Scalar 控制台。

```python
app = FastAPI(
    title="YiAi API",
    docs_url="/docs",
    openapi_tags=[
        {"name": "Auth", "description": "认证与授权"},
        {"name": "RPC", "description": "通用 RPC 端点 POST /"},
        {"name": "Knowledge", "description": "知识库管理"},
    ],
)

# Scalar 替代 Swagger UI（可选）
@app.get("/scalar", include_in_schema=False)
async def scalar():
    return HTMLResponse(scalar_html)
```

### 文档增强

| 增强 | 实现 |
|------|------|
| Pydantic schema 示例 | `model_config = {"json_schema_extra": {"examples": [...]}}` |
| RPC 端点目录 | 自定义 OpenAPI extension `x-rpc-methods` |
| Markdown 描述 | `fastapi.openapi.utils.get_openapi` 注入项目 README |
| Scalar 控制台 | 现代化 UI，支持暗色主题 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Pydantic examples + RPC 目录 | `/docs` 可见方法列表和示例 | 0.25 |
| 2 | Scalar 集成 + 测试 | `/scalar` 可交互调用 | 0.25 |

**合计：0.5d**。