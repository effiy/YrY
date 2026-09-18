---
doc_type: module
prd_task_id: "YA-09-92"
title: "YA-09-92: 告警路由 — 分级 + 企微/Sentry 双通道 — 开发方案"
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
source_prd: "36-需求-告警路由.md"
source_okr: [yiai-001]
---

# YA-09-92: 告警路由 — 分级 + 企微/Sentry 双通道 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[36-需求-告警路由.md](../../prds/2026-09/36-需求-告警路由.md)
> 需求编号：YA-09-92 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```python
class AlertRouter:
    RULES = {
        "CRITICAL": ["wework@all", "sentry", "email"],
        "ERROR":    ["wework", "sentry"],
        "WARN":     ["wework"],
        "INFO":     [],
    }

    async def route(self, alert: Alert):
        channels = self.RULES.get(alert.level, [])
        tasks = []
        for ch in channels:
            if ch == "wework":    tasks.append(send_wework(alert))
            elif ch == "wework@all": tasks.append(send_wework(alert, mention_all=True))
            elif ch == "sentry":  tasks.append(sentry.capture(alert))
            elif ch == "email":   tasks.append(send_email(alert))
        await asyncio.gather(*tasks, return_exceptions=True)

    def dedup_key(self, alert: Alert) -> str:
        return f"{alert.level}:{alert.type}:{alert.source}"
```

### 分级路由

| 级别 | 企微 | Sentry | 邮件 | 冷却 |
|------|------|--------|------|------|
| CRITICAL | @all | ✓ | ✓ | 5min |
| ERROR | ✓ | ✓ | — | 15min |
| WARN | ✓ | — | — | 1h |
| INFO | — | — | — | — |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | AlertRouter + 3 通道 | CRITICAL 三通道推送 | 0.25 |
| 2 | 去重冷却 + 测试 | 同告警 5min 内不重复 | 0.25 |

**合计：0.5d**。