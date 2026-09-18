---
doc_type: module
prd_task_id: "YA-09-127"
title: "YA-09-127: RAG 问答质量评估 — 忠实度/相关性/完整性评分 — 开发方案"
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
source_prd: "188-需求-知识库问答质量评估.md"
source_okr: [yiai-001]
---

# YA-09-127: RAG 问答质量评估 — 忠实度/相关性/完整性评分 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[188-需求-知识库问答质量评估.md](../../prds/2026-09/188-需求-知识库问答质量评估.md)
> 需求编号：YA-09-127 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

LLM 评估 LLM——用强模型对 RAG 回答三维度打分，持续监控检索质量。

```python
async def evaluate_rag_answer(query: str, sources: list[str], answer: str) -> dict:
    prompt = f"""评估以下 RAG 回答质量:
查询: {query}
参考来源: {json.dumps(sources)}
回答: {answer}
评分 1-5 (忠实度/相关性/完整性)，仅返回 JSON: {{"faithfulness": N, "relevance": N, "completeness": N}}"""
    response = await llm.chat(messages=[{"role": "user", "content": prompt}])
    return json.loads(response)
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | LLM 评分 + Dashboard | 每次 RAG 调用自动评分 | 0.25 |
| 2 | 人工校准 + 测试 | LLM 评分与人工评分相关 > 0.7 | 0.25 |

**合计：0.5d**。