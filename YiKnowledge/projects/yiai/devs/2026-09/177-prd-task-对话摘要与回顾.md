---
doc_type: module
prd_task_id: "YA-09-131"
title: "YA-09-131: 对话摘要与回顾 — 自动总结 + 跨会话上下文 — 开发方案"
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
source_prd: "177-需求-对话摘要与回顾.md"
source_okr: [yiai-001]
---

# YA-09-131: 对话摘要与回顾 — 自动总结 + 跨会话上下文 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[177-需求-对话摘要与回顾.md](../../prds/2026-09/177-需求-对话摘要与回顾.md)
> 需求编号：YA-09-131 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

会话结束后自动 LLM 摘要。跨会话上下文延续——新会话可加载历史摘要作为 context。

```python
async def summarize_session(session_id: str) -> str:
    messages = await db.sessions.find_one({"key": session_id})["messages"]
    response = await llm.chat(messages=[{
        "role": "user", "content": f"用 3 句话总结以下对话:\n{format_messages(messages)}"
    }])
    await db.sessions.update_one({"key": session_id}, {"$set": {"summary": response, "summarized_at": now}})
    return response
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 自动摘要 + 存储 | 会话列表可见摘要 | 0.25 |
| 2 | 跨会话上下文 + 导出 + 测试 | 新会话加载历史摘要 | 0.25 |

**合计：0.5d**。