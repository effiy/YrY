---
doc_type: module
prd_task_id: "YA-09-41"
title: "YA-09-41: 异步任务队列 — asyncio.Queue + worker pool — 开发方案"
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
source_prd: "46-需求-异步任务队列.md"
source_okr: [yiai-001]
---

# YA-09-41: 异步任务队列 — asyncio.Queue + worker pool — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[46-需求-异步任务队列.md](../../prds/2026-09/46-需求-异步任务队列.md)
> 需求编号：YA-09-41 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

为耗时操作（批量邮件、报告生成、RAG 索引重建）提供异步任务队列，避免阻塞 HTTP 请求。

```python
class TaskQueue:
    def __init__(self, workers: int = 4):
        self.queue = asyncio.Queue()
        self.workers = [asyncio.create_task(self._worker(i)) for i in range(workers)]

    async def submit(self, task: Callable, *args) -> str:
        task_id = str(uuid.uuid4())
        await self.queue.put((task_id, task, args))
        return task_id

    async def _worker(self, idx: int):
        while True:
            tid, task, args = await self.queue.get()
            try: result = await task(*args); self._results[tid] = ("done", result)
            except Exception as e: self._results[tid] = ("failed", str(e))
            self.queue.task_done()
```

### 适用场景

| 任务 | 耗时 | 优先级 |
|------|------|--------|
| RAG 索引重建 | 10-60s | 低 |
| CSV 导出 | 5-30s | 中 |
| 企微群发通知 | 1-5s | 高 |
| 代码健康扫描 | 30-120s | 低 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | asyncio.Queue + worker pool | 并发任务不阻塞 HTTP | 0.5 |
| 2 | 任务状态查询 API + 重试 + 测试 | `GET /tasks/{id}` 返回进度 | 0.5 |

**合计：1.0d**。