---
doc_type: module
prd_task_id: "YA-09-102"
title: "YA-09-102: RAG 查询改写与扩展 — HyDE + 分解 + 同义词 — 开发方案"
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
source_prd: "181-需求-查询改写与扩展.md"
source_okr: [yiai-003]
---

# YA-09-102: RAG 查询改写与扩展 — HyDE + 分解 + 同义词 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[181-需求-查询改写与扩展.md](../../prds/2026-09/181-需求-查询改写与扩展.md)
> 需求编号：YA-09-102 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```python
class QueryRewriter:
    async def hyde(self, query: str) -> str:
        """生成假设文档 (HyDE) 用于检索"""
        hypothesis = await llm.chat(messages=[{
            "role": "user", "content": f"请写一段关于'{query}'的技术文档摘要"
        }])
        return f"{query}\n{hypothesis}"

    async def decompose(self, query: str) -> list[str]:
        """复杂查询分解为多个子查询"""
        response = await llm.chat(messages=[{
            "role": "user", "content": f"将以下复杂查询分解为 2-4 个简单子查询: {query}"
        }])
        return [q.strip() for q in response.split("\n") if q.strip()]

    async def expand_synonyms(self, query: str, domain: str) -> str:
        """领域同义词扩展: RAG → 检索增强生成"""
        synonyms = await load_domain_synonyms(domain)
        for term, expansions in synonyms.items():
            if term in query: query += f" {' '.join(expansions)}"
        return query
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | HyDE + 查询分解 | Recall@5 提升 10%+ | 0.75 |
| 2 | 同义词扩展 + 多跳推理 + 测试 | 领域术语匹配增强 | 0.75 |

**合计：1.5d**。