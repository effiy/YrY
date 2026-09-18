---
doc_type: module
prd_task_id: "YA-09-99"
title: "YA-09-99: 中间件管道编排 — 声明式顺序 + 优先级 — 开发方案"
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
source_prd: "56-需求-中间件管道编排.md"
source_okr: [yiai-001]
---

# YA-09-99: 中间件管道编排 — 声明式顺序 + 优先级 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[56-需求-中间件管道编排.md](../../prds/2026-09/56-需求-中间件管道编排.md)
> 需求编号：YA-09-99 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

FastAPI 中间件按 `add_middleware` 的**逆序**执行。当前手动管理顺序容易出错。声明式优先级编排，执行顺序稳定可预测。

```python
@dataclass
class MiddlewareDef:
    cls: type; priority: int; kwargs: dict = field(default_factory=dict)

PIPELINE = sorted([
    MiddlewareDef(TraceMiddleware,      10),
    MiddlewareDef(LoggingMiddleware,    20),
    MiddlewareDef(RateLimitMiddleware,  30),
    MiddlewareDef(BodySizeMiddleware,   40),
    MiddlewareDef(AuthMiddleware,       50),
    MiddlewareDef(CORSMiddleware,       60),
    MiddlewareDef(CompressionMiddleware,70),
], key=lambda m: -m.priority)  # 逆序安装 → 正序执行

for mw in PIPELINE:
    app.add_middleware(mw.cls, **mw.kwargs)
```

执行顺序: Trace → Log → RateLimit → BodySize → Auth → CORS → Compress

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `MiddlewareDef` + 优先级安装 | 顺序正确 |

**合计：0.5d**。