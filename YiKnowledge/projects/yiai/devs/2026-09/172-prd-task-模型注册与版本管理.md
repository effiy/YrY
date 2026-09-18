---
doc_type: module
prd_task_id: "YA-09-125"
title: "YA-09-125: 模型注册与版本管理 — 集中式元数据 + 生命周期 — 开发方案"
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
source_prd: "172-需求-模型注册与版本管理.md"
source_okr: [yiai-002]
---

# YA-09-125: 模型注册与版本管理 — 集中式元数据 + 生命周期 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[172-需求-模型注册与版本管理.md](../../prds/2026-09/172-需求-模型注册与版本管理.md)
> 需求编号：YA-09-125 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

模型散落在 Ollama/DeepSeek 配置中。集中式注册表记录所有模型元数据：名称、版本、能力、状态、成本。

```python
class ModelRegistry:
    async def register(self, model: ModelMeta):
        await db.models.update_one({"name": model.name}, {"$set": model.dict()}, upsert=True)
    async def list_active(self) -> list[ModelMeta]: ...
    async def decommission(self, name: str): ...

@dataclass
class ModelMeta:
    name: str; provider: str; version: str
    capabilities: list[str]  # ["chat", "vision", "embedding"]
    status: str  # active | testing | deprecated
    cost_per_1k_tokens: float
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | ModelRegistry + MongoDB | 所有模型可查询 | 0.25 |
| 2 | Dashboard + 生命周期 + 测试 | 模型状态可视化 | 0.25 |

**合计：0.5d**。