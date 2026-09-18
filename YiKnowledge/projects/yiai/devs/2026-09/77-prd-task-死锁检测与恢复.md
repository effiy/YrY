---
doc_type: module
prd_task_id: "YA-09-45"
title: "YA-09-45: 死锁检测与恢复 — 分布式锁超时 + 自动重试 — 开发方案"
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
source_prd: "77-需求-死锁检测与恢复.md"
source_okr: [yiai-001]
---

# YA-09-45: 死锁检测与恢复 — 分布式锁超时 + 自动重试 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[77-需求-死锁检测与恢复.md](../../prds/2026-09/77-需求-死锁检测与恢复.md)
> 需求编号：YA-09-45 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

MongoDB 写冲突（`WriteConflict`）和 asyncio 死锁需要自动检测和恢复。

### MongoDB 重试

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type(WriteConflict, WriteError),
)
async def safe_write(collection, operation, **kwargs):
    return await operation(**kwargs)
```

### asyncio 死锁检测

```python
import asyncio, time

async def deadlock_detector():
    while True:
        await asyncio.sleep(30)
        for task in asyncio.all_tasks():
            if not task.done():
                stack = task.get_stack()
                if any("_acquire_lock" in str(f) for f in stack):
                    logger.warning(f"Task {task.get_name()} may be deadlocked")
```

| 故障 | 检测 | 恢复 |
|------|------|------|
| MongoDB WriteConflict | `pymongo.errors.WriteError` | 指数退避重试 (3 次) |
| asyncio 锁死锁 | `get_stack()` 分析 | WARN + 超时解除 |
| 分布式锁僵死 | TTL 过期 | 自动释放 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | MongoDB 重试装饰器 | WriteConflict 自动恢复 | 0.5 |
| 2 | asyncio 死锁检测 + 测试 | 死锁任务被识别和恢复 | 0.5 |

**合计：1.0d**。