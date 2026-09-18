---
doc_type: module
prd_task_id: "YA-09-85"
title: "YA-09-85: 意图分类与路由 — LLM 分类器 + 智能分发 — 开发方案"
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
source_prd: "171-需求-意图分类与路由.md"
source_okr: [yiai-002]
---

# YA-09-85: 意图分类与路由 — LLM 分类器 + 智能分发 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[171-需求-意图分类与路由.md](../../prds/2026-09/171-需求-意图分类与路由.md)
> 需求编号：YA-09-85 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

用轻量 LLM 分类用户意图，路由到不同处理管线——RAG 检索、Agent 工具调用、直接对话、代码执行等。

```python
INTENT_SCHEMA = {
    "type": "object",
    "properties": {
        "intent": {"enum": ["rag_query", "tool_call", "chat", "code_execute", "data_query"]},
        "confidence": {"type": "number"},
        "entities": {"type": "object"},
    },
}

async def classify_intent(query: str) -> dict:
    response = await llm.chat(messages=[
        {"role": "system", "content": "分类用户意图"},
        {"role": "user", "content": query},
    ], tools=[{"type": "function", "function": INTENT_SCHEMA}])
    return json.loads(response["tool_calls"][0]["arguments"])
```

### 路由表

| 意图 | 处理管线 | 模型 |
|------|---------|------|
| `rag_query` | RAG 混合检索 | qwen2.5 |
| `tool_call` | Agent 工具执行 | deepseek-chat |
| `chat` | 直接对话 | qwen2.5 |
| `code_execute` | 代码沙箱 | qwen2.5 |
| `data_query` | RPC data_service | 便宜模型 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | LLM 意图分类器 + 5 类路由 | 不同意图正确分发 | 1.0 |
| 2 | 置信度阈值 + 回退 + 测试 | 低置信度回退通用 chat | 0.5 |

**合计：1.5d**。