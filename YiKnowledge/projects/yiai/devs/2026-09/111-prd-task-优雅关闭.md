---

title: "优雅关闭"
doc_type: task
prd_task_id: "YA-09-111"

type: task
status: 待开始
---

# YA-09-111: 优雅关闭 — 技术设计

## 实现

**文件**：`server/middleware.py` → `GracefulShutdownMiddleware`

**机制**：`__call__` 中 `inflight += 1` / `finally: inflight -= 1` + lifespan shutdown handler 中 `while inflight > 0 and timeout < 30s: await asyncio.sleep(0.1)`

## 非功能需求

| 维度 | 目标 |
|------|------|
| 最大等待 | 30s |
| 可观测 | /debug/performance 显示 inflight 数 |