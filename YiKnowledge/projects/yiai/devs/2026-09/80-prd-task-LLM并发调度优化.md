---
doc_type: module
prd_task_id: "YA-09-114"
title: "YA-09-114: LLM 并发调度 — 动态信号量 + 优先级队列 — 开发方案"
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
source_prd: "80-需求-LLM并发调度优化.md"
source_okr: [yiai-002]
---

# YA-09-114: LLM 并发调度 — 动态信号量 + 优先级队列 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[80-需求-LLM并发调度优化.md](../../prds/2026-09/80-需求-LLM并发调度优化.md)
> 需求编号：YA-09-114 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Ollama 自托管 GPU 显存有限，并发推理请求需排队调度。动态信号量：根据当前 GPU 显存调整并发数。

```python
class LLMScheduler:
    def __init__(self, max_concurrent=3, gpu_memory_threshold=0.85):
        self.sem = asyncio.Semaphore(max_concurrent)
        self.queue = asyncio.PriorityQueue()  # (priority, task_id, fn)

    async def submit(self, priority: int, fn, *args):
        await self.queue.put((priority, id(fn), fn, args))
        async with self.sem:
            _, _, task_fn, task_args = await self.queue.get()
            return await task_fn(*task_args)
```

### 优先级: 实时对话 (0) > Agent 工具 (1) > 批量任务 (2)

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 动态信号量 + 优先级队列 | GPU OOM 不再发生 | 0.25 |
| 2 | GPU 监控 + 测试 | 显存 > 85% 降并发 | 0.25 |

**合计：0.5d**。