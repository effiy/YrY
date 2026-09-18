---
doc_type: module
prd_task_id: "YA-09-89"
title: "YA-09-89: Webhook 集成系统 — 事件注册 + HMAC 签名 + 重试 — 开发方案"
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
source_prd: "144-需求-Webhook集成系统.md"
source_okr: [yiai-001]
---

# YA-09-89: Webhook 集成系统 — 事件注册 + HMAC 签名 + 重试 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[144-需求-Webhook集成系统.md](../../prds/2026-09/144-需求-Webhook集成系统.md)
> 需求编号：YA-09-89 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

允许外部系统注册 Webhook 订阅 YiAi 事件（Bug 创建、会话结束、备份完成等），HMAC 签名验证，失败指数退避重试。

```python
class WebhookManager:
    async def fire(self, event: str, payload: dict):
        subscribers = await db.webhooks.find({"event": event, "active": True}).to_list(None)
        for sub in subscribers:
            asyncio.create_task(self._deliver(sub, payload))

    async def _deliver(self, sub: dict, payload: dict, attempt: int = 0):
        signature = hmac.new(sub["secret"].encode(), json.dumps(payload).encode(), hashlib.sha256).hexdigest()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(sub["url"], json=payload, headers={"X-Signature": signature}, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status >= 400:
                        raise Exception(f"HTTP {resp.status}")
        except Exception:
            if attempt < 3:
                await asyncio.sleep(2 ** attempt)  # 指数退避
                await self._deliver(sub, payload, attempt + 1)
            else:
                await db.webhooks.update_one({"_id": sub["_id"]}, {"$set": {"active": False}})
```

### 事件类型

| 事件 | 触发时机 |
|------|---------|
| `bug.created` | Bug 报告创建 |
| `session.ended` | 聊天会话结束 |
| `backup.completed` | 数据库备份完成 |
| `rag.indexed` | RAG 索引更新完成 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 事件注册 + HMAC 签名投递 | Webhook 接收端验证签名通过 | 0.75 |
| 2 | 指数退避重试 + 健康监控 + 测试 | 3 次失败后自动停用 | 0.75 |

**合计：1.5d**。