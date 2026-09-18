---
doc_type: module
prd_task_id: "YA-09-93"
title: "YA-09-93: 后台任务队列 (ARQ) — Redis 持久化 + 优先级 + 进度追踪 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "142-需求-后台任务队列.md"
source_okr: [yiai-001]
---

# YA-09-93: 后台任务队列 (ARQ) — Redis 持久化 + 优先级 + 进度追踪 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[142-需求-后台任务队列.md](../../prds/2026-09/142-需求-后台任务队列.md)
> 需求编号：YA-09-93 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-09-41 asyncio.Queue 方案](./46-prd-task-异步任务队列.md) 基础上，升级为基于 ARQ (Async Redis Queue) 的持久化方案——服务重启后任务不丢失，支持优先级和定时调度。

```python
from arq import Worker, create_pool
from arq.connections import RedisSettings

async def rebuild_rag_index(ctx, file_paths: list[str]): ...
async def export_csv(ctx, collection: str, filter: dict): ...
async def send_bulk_notifications(ctx, user_ids: list[str], message: str): ...

# Worker 启动
worker = Worker(redis_settings=RedisSettings(host="localhost"), functions=[rebuild_rag_index, export_csv, send_bulk_notifications])

# 提交任务
redis = await create_pool(RedisSettings())
job = await redis.enqueue_job("export_csv", "projects", {})
```

### 与 asyncio.Queue 对比

| 维度 | asyncio.Queue | ARQ (Redis) |
|------|-------------|------------|
| 持久化 | 否 (进程重启丢失) | 是 |
| 分布式 | 否 (单进程) | 是 (多 Worker) |
| 定时任务 | 需额外实现 | 内置 `cron` |
| 复杂度 | 低 | 中 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | ARQ Worker + Redis 配置 | 任务持久化到 Redis | 0.75 |
| 2 | 优先级 + 进度 API + 测试 | Dashboard 可见任务队列 | 0.75 |

**合计：1.5d**。