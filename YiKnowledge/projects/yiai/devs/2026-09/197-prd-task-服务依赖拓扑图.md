---
doc_type: module
prd_task_id: "YA-09-133"
title: "YA-09-133: 服务依赖拓扑图 — 可视化 + 健康传播 + 循环检测 — 开发方案"
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
source_prd: "197-需求-服务依赖拓扑图.md"
source_okr: [yiai-001]
---

# YA-09-133: 服务依赖拓扑图 — 可视化 + 健康传播 + 循环检测 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[197-需求-服务依赖拓扑图.md](../../prds/2026-09/197-需求-服务依赖拓扑图.md)
> 需求编号：YA-09-133 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Dashboard 可视化 YiAi → MongoDB/Ollama/Redis/YiKnowledge 依赖关系和健康状态。

```python
DEPENDENCIES = [
    {"from": "YiAi", "to": "MongoDB", "critical": True},
    {"from": "YiAi", "to": "Ollama", "critical": False, "degrade": "chat_only"},
    {"from": "YiAi", "to": "Redis", "critical": False, "degrade": "no_cache"},
    {"from": "YiAi", "to": "YiKnowledge", "critical": False, "degrade": "no_knowledge"},
]

async def topology():
    nodes = [{"id": dep["from"]} for dep in DEPENDENCIES]
    for dep in DEPENDENCIES:
        health = await check_health(dep["to"])
        dep["status"] = "healthy" if health else "down"
    return {"nodes": nodes, "edges": DEPENDENCIES}
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 拓扑数据 API | Dashboard 可渲染 D3 拓扑图 | 0.25 |
| 2 | 循环依赖检测 + 健康传播 + 测试 | MongoDB down → 全部变红 | 0.25 |

**合计：0.5d**。