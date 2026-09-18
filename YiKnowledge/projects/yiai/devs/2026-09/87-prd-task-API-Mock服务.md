---
doc_type: module
prd_task_id: "YA-09-110"
title: "YA-09-110: API Mock 服务 — 前端独立开发仿真后端 — 开发方案"
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
source_prd: "87-需求-API-Mock服务.md"
source_okr: [yiai-002]
---

# YA-09-110: API Mock 服务 — 前端独立开发仿真后端 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[87-需求-API-Mock服务.md](../../prds/2026-09/87-需求-API-Mock服务.md)
> 需求编号：YA-09-110 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

YiAi 停止时前端无法开发。Mock 模式根据 OpenAPI schema 生成仿真响应，前端可独立开发。

```python
# 启动 Mock 模式
uvicorn app:app --port 10086 --env MOCK_MODE=true

# mock/mock_data.py
MOCK_RESPONSES = {
    "services.database.data_service.query_documents": {
        "code": 0, "data": {"list": [{"key": "mock-1", "name": "Mock Project"}], "total": 1},
    },
    "/auth/menu/list": {
        "code": 0, "data": [{"path": "/home", "name": "home", "meta": {"title": "首页"}}],
    },
}
```

### 模式切换

| 模式 | 数据源 |
|------|--------|
| 正常 | MongoDB + Ollama |
| Mock | `mock/*.json` 静态数据 |
| Record | 录制真实响应 → 保存到 mock 文件 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Mock 中间件 + 数据文件 | `MOCK_MODE=true` 返回仿真数据 | 0.25 |
| 2 | Record 模式 + 测试 | 录制真实响应 → 离线回放 | 0.25 |

**合计：0.5d**。