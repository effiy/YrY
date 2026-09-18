---
doc_type: module
prd_task_id: "YA-09-59"
title: "YA-09-59: 断路器恢复通知 — 状态变更 + 企微推送 — 开发方案"
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
source_prd: "132-需求-断路器恢复通知.md"
source_okr: [yiai-001]
---

# YA-09-59: 断路器恢复通知 — 状态变更 + 企微推送 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[132-需求-断路器恢复通知.md](../../prds/2026-09/132-需求-断路器恢复通知.md)
> 需求编号：YA-09-59 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-09-20 自愈恢复](./93-prd-task-自愈恢复机制.md) 的健康状态机基础上，增加断路器状态变更的通知推送——打开/半开/关闭时通过企微通知相关人员。

```python
class CircuitBreaker:
    STATES = ["CLOSED", "OPEN", "HALF_OPEN"]

    def transition(self, new_state: str):
        old = self.state
        self.state = new_state
        self._notify(old, new_state)

    def _notify(self, old: str, new: str):
        msg = f"断路器: {old} → {new}"
        if old == "CLOSED" and new == "OPEN":
            msg += f"\n连续失败 {self.failure_count} 次"
        elif new == "CLOSED":
            msg += "\n服务已恢复"

        asyncio.create_task(send_wework_message(msg))
```

### 通知规则

| 状态变更 | 通知方式 | 级别 |
|---------|---------|------|
| CLOSED → OPEN | 企微 @all | 紧急 |
| OPEN → HALF_OPEN | 企微 | 警告 |
| HALF_OPEN → CLOSED | 企微 | 信息 |
| HALF_OPEN → OPEN | 企微 | 警告 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | CircuitBreaker 通知集成 | 状态变更触发企微消息 | 0.25 |
| 2 | 通知去重 + 冷却期 + 测试 | 不重复推送相同状态 | 0.25 |

**合计：0.5d**。