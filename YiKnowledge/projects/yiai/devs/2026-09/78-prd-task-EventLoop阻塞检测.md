---
doc_type: module
prd_task_id: "YA-09-51"
title: "YA-09-51: Event Loop 阻塞检测 — asyncio 慢任务监控 — 开发方案"
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
source_prd: "78-需求-EventLoop阻塞检测.md"
source_okr: [yiai-001]
---

# YA-09-51: Event Loop 阻塞检测 — asyncio 慢任务监控 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[78-需求-EventLoop阻塞检测.md](../../prds/2026-09/78-需求-EventLoop阻塞检测.md)
> 需求编号：YA-09-51 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

同步阻塞代码（如 `open()` 未用 `aiofiles`）会卡住整个 event loop。通过 `asyncio.loop.slow_callback_duration` 检测并告警。

```python
import asyncio, time

loop = asyncio.get_event_loop()
loop.slow_callback_duration = 0.1  # 超过 100ms 视为慢

def log_slow_callback(task_name, duration):
    logger.warning(f"SLOW: {task_name} blocked event loop for {duration:.2f}s")
    # 可选：记录调用栈
    import traceback
    logger.warning(traceback.format_stack())

# 定期监控
async def monitor_event_loop():
    while True:
        await asyncio.sleep(5)
        all_tasks = asyncio.all_tasks()
        pending = sum(1 for t in all_tasks if not t.done())
        if pending > 50:
            logger.warning(f"Event loop has {pending} pending tasks")
```

### 检测维度

| 指标 | 阈值 | 动作 |
|------|------|------|
| 慢回调 | > 100ms | WARN + 调用栈 |
| 积压任务 | > 50 | WARN |
| 事件循环延迟 | > 500ms | ERROR + 企微通知 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | slow_callback 检测 | 同步阻塞代码被识别 | 0.25 |
| 2 | 积压任务监控 + 测试 | 模拟阻塞 → 告警触发 | 0.25 |

**合计：0.5d**。