---
doc_type: module
prd_task_id: "YA-09-142"
title: "YA-09-142: 实时协作推理 — 多用户共享会话 + WebSocket 广播 — 开发方案"
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
source_prd: "205-需求-实时协作推理-变体B.md"
source_okr: [yiai-001]
---

# YA-09-142: 实时协作推理 — 多用户共享会话 + WebSocket 广播 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[205-需求-实时协作推理-变体B.md](../../prds/2026-09/205-需求-实时协作推理-变体B.md)
> 需求编号：YA-09-142 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

多用户共享同一推理会话——各自提供上下文片段，收集完毕或超时后 AI 综合所有输入生成回答，WebSocket 广播结果。

```python
class CollaborativeSession:
    def __init__(self, timeout: int = 30):
        self.contributions: dict[str, str] = {}
        self.ready = asyncio.Event()

    async def contribute(self, user_id: str, context: str):
        self.contributions[user_id] = context
        if len(self.contributions) >= self.min_participants:
            self.ready.set()

    async def infer(self):
        await asyncio.wait_for(self.ready.wait(), timeout=self.timeout)
        combined = "\n".join(f"{uid}: {ctx}" for uid, ctx in self.contributions.items())
        response = await llm.chat(messages=[{"role": "user", "content": combined}])
        await ws_manager.broadcast(self.room, {"response": response})
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 贡献收集 + 超时推理 | 多用户输入合并推理 | 0.25 |
| 2 | WebSocket 广播 + 测试 | 所有参与者收到结果 | 0.25 |

**合计：0.5d**。