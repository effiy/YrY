---
doc_type: module
prd_task_id: "YA-09-132"
title: "YA-09-132: 多轮对话状态追踪 — 槽位填充 + 意图转移 — 开发方案"
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
source_prd: "184-需求-多轮对话状态追踪.md"
source_okr: [yiai-001]
---

# YA-09-132: 多轮对话状态追踪 — 槽位填充 + 意图转移 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[184-需求-多轮对话状态追踪.md](../../prds/2026-09/184-需求-多轮对话状态追踪.md)
> 需求编号：YA-09-132 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

追踪多轮对话中的槽位（slots）——用户在对话中逐步提供的信息。LLM 从每轮消息中提取新槽位并合并状态。

```python
class DialogState:
    def __init__(self): self.slots: dict = {}; self.intent: str = ""; self.turn = 0

async def update_state(state: DialogState, message: str):
    extracted = await llm.extract_slots(message, state.slots.keys())
    state.slots.update(extracted)
    new_intent = await classify_intent(message)
    if new_intent != state.intent: state.intent = new_intent  # 意图转移
    state.turn += 1
    return state
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 槽位提取 + 合并 | 多轮逐步填充槽位 | 0.25 |
| 2 | 意图转移检测 + 测试 | 话题切换被追踪 | 0.25 |

**合计：0.5d**。