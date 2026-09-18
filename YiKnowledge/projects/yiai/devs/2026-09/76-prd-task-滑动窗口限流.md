---
doc_type: module
prd_task_id: "YA-09-21"
title: "YA-09-21: 滑动窗口限流 — 消除固定窗口边界突发 — 开发方案"
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
source_prd: "76-需求-滑动窗口限流.md"
source_okr: [yiai-001]
---

# YA-09-21: 滑动窗口限流 — 消除固定窗口边界突发 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[76-需求-滑动窗口限流.md](../../prds/2026-09/76-需求-滑动窗口限流.md)
> 需求编号：YA-09-21 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、问题

固定窗口限流（令牌桶基础版）在窗口边界存在突发问题——前一窗口末尾和后一窗口开头的请求叠加，实际速率可达限额 2 倍。

---

<a id="sec-2"></a>
## 二、方案：滑动窗口

```python
class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests: dict[str, list[float]] = {}  # key → [timestamps]

    def is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        self.requests.setdefault(key, [])
        # 清理过期记录
        self.requests[key] = [t for t in self.requests[key] if now - t < self.window]
        if len(self.requests[key]) >= self.max_requests:
            return False
        self.requests[key].append(now)
        return True
```

| 对比 | 固定窗口 | 滑动窗口 |
|------|---------|---------|
| 边界突发 | 2x 限额 | 精确控制 |
| 内存 | 计数器 | 时间戳列表 |
| 精度 | 窗口粒度 | 请求粒度 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 滑动窗口实现 | 窗口边界无突发 | 0.5 |
| 2 | 集成到限流中间件 + 测试 | 与令牌桶可切换 | 0.5 |

**合计：1.0d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 基础：[YA-09-08 API 限流](./16-prd-task-API限流与并发控制.md)