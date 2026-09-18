---
doc_type: module
prd_task_id: "YA-09-120"
title: "YA-09-120: 请求生命周期事件 — 钩子扩展点 — 开发方案"
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
source_prd: "128-需求-请求生命周期事件.md"
source_okr: [yiai-003]
---

# YA-09-120: 请求生命周期事件 — 钩子扩展点 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[128-需求-请求生命周期事件.md](../../prds/2026-09/128-需求-请求生命周期事件.md)
> 需求编号：YA-09-120 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

FastAPI 事件系统：`@app.on_event("startup")` / 中间件。扩展为完整的请求生命周期钩子——`request_received` → `routed` → `before_handler` → `after_handler` → `response_sent`。

```python
class LifecycleHooks:
    hooks: dict[str, list[Callable]] = defaultdict(list)

    @classmethod
    def on(cls, event: str):
        def decorator(fn): cls.hooks[event].append(fn); return fn
        return decorator

@LifecycleHooks.on("request_received")
async def log_request(request): ...

@LifecycleHooks.on("response_sent")
async def update_metrics(request, response): ...
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 5 事件 + 钩子注册 | 各阶段钩子正确触发 | 0.25 |
| 2 | 集成测试 | 事件顺序正确 | 0.25 |

**合计：0.5d**。