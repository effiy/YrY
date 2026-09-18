---
doc_type: module
prd_task_id: "YA-09-118"
title: "YA-09-118: Web Push 通知 — VAPID + 浏览器推送 — 开发方案"
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
source_prd: "101-需求-WebPush通知.md"
source_okr: [yiai-001]
---

# YA-09-118: Web Push 通知 — VAPID + 浏览器推送 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[101-需求-WebPush通知.md](../../prds/2026-09/101-需求-WebPush通知.md)
> 需求编号：YA-09-118 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

通过 Web Push API + VAPID 协议，即使 YiVad 未打开也能推送通知到浏览器。

```python
from pywebpush import webpush

async def send_push(subscription: dict, payload: str):
    return webpush(subscription_info=subscription, data=payload,
                   vapid_private_key=VAPID_PRIVATE_KEY,
                   vapid_claims={"sub": "mailto:admin@yiai.dev"})

# 前端注册
navigator.serviceWorker.register("/sw.js")
const sub = await sw.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
# POST /push/subscribe → 存储 subscription
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | VAPID + pywebpush | 浏览器收到推送 | 0.25 |
| 2 | 订阅管理 + 集成 + 测试 | Bug/告警推送可达 | 0.25 |

**合计：0.5d**。