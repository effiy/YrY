---
doc_type: module
prd_task_id: "YA-09-150"
title: "YA-09-150: 文档影响力评分 — 引用计数 + RAG 检索频率 + PageRank — 开发方案"
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
source_prd: "226-需求-文档影响力评分.md"
source_okr: [yiai-001]
---

# YA-09-150: 文档影响力评分 — 引用计数 + RAG 检索频率 + PageRank — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[226-需求-文档影响力评分.md](../../prds/2026-09/226-需求-文档影响力评分.md)
> 需求编号：YA-09-150 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

知识文件的多维度影响力评分——被引用次数、RAG 检索命中频率、用户评分。影响 RAG 检索排序。

```python
def influence_score(doc: dict) -> float:
    citation_score = min(doc.get("cited_by", 0) / 100, 1.0)   # 被引用数 / 100
    rag_score = min(doc.get("rag_hits_30d", 0) / 1000, 1.0)   # 30 天 RAG 命中 / 1000
    rating_score = doc.get("avg_rating", 5.0) / 5.0            # 用户评分 / 5
    return citation_score * 0.3 + rag_score * 0.5 + rating_score * 0.2

# RAG 检索时: final_score = similarity * 0.6 + influence * 0.2 + freshness * 0.2
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 引用计数 + RAG 命中追踪 | 高影响力文档排序靠前 | 0.25 |
| 2 | Dashboard + 趋势 + 测试 | 影响力排行榜可见 | 0.25 |

**合计：0.5d**。