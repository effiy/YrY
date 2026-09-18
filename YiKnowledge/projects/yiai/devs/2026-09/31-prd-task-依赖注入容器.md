---
doc_type: module
prd_task_id: "YA-09-49"
title: "YA-09-49: 依赖注入容器 — FastAPI Depends 模块解耦 — 开发方案"
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
source_prd: "31-需求-依赖注入容器.md"
source_okr: [yiai-001]
---

# YA-09-49: 依赖注入容器 — FastAPI Depends 模块解耦 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[31-需求-依赖注入容器.md](../../prds/2026-09/31-需求-依赖注入容器.md)
> 需求编号：YA-09-49 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

当前 `domain/` 和 `services/` 之间通过直接 import 耦合（如 `from domain.ai.chat import ...`）。通过 FastAPI `Depends` 实现依赖注入，使上层依赖抽象而非具体实现。

```python
# di.py
from functools import lru_cache
from services.ai.chat_service import ChatService
from data.database import MongoDB

@lru_cache()
def get_db() -> MongoDB:
    return MongoDB()

@lru_cache()
def get_chat_service(db: MongoDB = Depends(get_db)) -> ChatService:
    return ChatService(db)

# routes/chat.py
@router.post("/chat")
async def chat(
    request: ChatRequest,
    service: ChatService = Depends(get_chat_service),
):
    return await service.chat(request.messages)
```

### 收益

| 维度 | import 直接耦合 | Depends 注入 |
|------|----------------|-------------|
| 测试 | 需 mock 模块 | 替换 Depends override |
| 切换实现 | 改 import | 改 Depends 注册 |
| 生命周期 | 手动管理 | FastAPI 自动管理 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 核心依赖注册 + di 模块 | `Depends(get_db)` 可注入 | 0.5 |
| 2 | 测试 override fixtures + 文档 | 测试中替换依赖 | 0.5 |

**合计：1.0d**。