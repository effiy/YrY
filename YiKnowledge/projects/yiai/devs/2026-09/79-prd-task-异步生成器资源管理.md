---
doc_type: module
prd_task_id: "YA-09-113"
title: "YA-09-113: 异步生成器资源管理 — SSE 连接完善清理 — 开发方案"
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
source_prd: "79-需求-异步生成器资源管理.md"
source_okr: [yiai-001]
---

# YA-09-113: 异步生成器资源管理 — SSE 连接完善清理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[79-需求-异步生成器资源管理.md](../../prds/2026-09/79-需求-异步生成器资源管理.md)
> 需求编号：YA-09-113 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、问题

SSE 流式响应的 async generator 在客户端断开时可能未正确清理——MongoDB cursor 未关闭、Ollama 推理未取消。

---

<a id="sec-2"></a>
## 二、方案

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def managed_sse_stream(generator):
    resources = []
    try:
        yield generator
    finally:
        for res in resources:
            try: await res.close()
            except: pass

async def rag_chat_stream(query):
    async with managed_sse_stream() as mgr:
        cursor = db.find(...)  # 需清理的资源
        mgr.resources.append(cursor)

        async def gen():
            async for doc in cursor: yield format_sse(doc)
            yield format_sse({"done": True})

        return StreamingResponse(gen(), media_type="text/event-stream",
            headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"})
```

### 清理检查清单

| 资源 | 清理时机 |
|------|---------|
| MongoDB cursor | `finally` → `cursor.close()` |
| aiohttp session | `finally` → `session.close()` |
| Ollama stream | `finally` → 取消任务 |
| asyncio tasks | `finally` → `task.cancel()` |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `managed_sse_stream` 上下文管理器 | 断开后资源正确释放 | 0.25 |
| 2 | 集成到所有 SSE 端点 + 测试 | 无 cursor 泄漏 | 0.25 |

**合计：0.5d**。