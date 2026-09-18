---
doc_type: module
prd_task_id: "YA-09-124"
title: "YA-09-124: 数据血缘追踪 — AI 生成内容端到端溯源 — 开发方案"
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
source_prd: "173-需求-数据血缘追踪.md"
source_okr: [yiai-001]
---

# YA-09-124: 数据血缘追踪 — AI 生成内容端到端溯源 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[173-需求-数据血缘追踪.md](../../prds/2026-09/173-需求-数据血缘追踪.md)
> 需求编号：YA-09-124 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

追踪 AI 回答的数据来源——哪个知识文件、哪次 RAG 检索、哪个 Agent 工具调用产生了该内容。

```python
class LineageTracker:
    async def track(self, session_id: str, message_id: str, sources: list[dict]):
        await db.data_lineage.insert_one({
            "session_id": session_id, "message_id": message_id,
            "sources": sources,  # [{type:"rag", file:"path.md", chunk:3}, {type:"tool", name:"web_search"}]
            "model": current_model, "timestamp": datetime.now(timezone.utc),
        })

    async def trace(self, message_id: str) -> list[dict]:
        """反向追溯：这个回答来自哪里"""
        chain = []
        current = await db.data_lineage.find_one({"message_id": message_id})
        while current:
            chain.append(current)
            current = await db.data_lineage.find_one({"message_id": current.get("parent_message_id")})
        return chain
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | LineageTracker + MongoDB | 回答可追溯到 RAG 源文件 | 0.25 |
| 2 | 追溯 API + 测试 | `GET /lineage/{message_id}` 返回完整链 | 0.25 |

**合计：0.5d**。