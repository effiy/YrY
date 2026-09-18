---
doc_type: module
prd_task_id: "YA-09-148"
title: "YA-09-148: 知识去重与合并 — 近似文档检测 + 语义去重 — 开发方案"
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
source_prd: "222-需求-知识去重与合并.md"
source_okr: [yiai-001]
---

# YA-09-148: 知识去重与合并 — 近似文档检测 + 语义去重 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[222-需求-知识去重与合并.md](../../prds/2026-09/222-需求-知识去重与合并.md)
> 需求编号：YA-09-148 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

YiKnowledge 中可能存在内容高度相似的文件（同一主题的不同版本）。基于 Embedding 余弦相似度检测，高相似度文件建议合并。

```python
from sklearn.metrics.pairwise import cosine_similarity

async def find_duplicates(threshold: float = 0.9) -> list[dict]:
    docs = await db.knowledge_files.find({}).to_list(None)
    embeddings = np.array([d["embedding"] for d in docs])
    sim_matrix = cosine_similarity(embeddings)
    pairs = []
    for i in range(len(docs)):
        for j in range(i+1, len(docs)):
            if sim_matrix[i][j] > threshold:
                pairs.append({"doc_a": docs[i]["path"], "doc_b": docs[j]["path"], "similarity": sim_matrix[i][j]})
    return sorted(pairs, key=lambda x: -x["similarity"])
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Embedding 相似度矩阵 | 相似文档对被检测 | 0.25 |
| 2 | Dashboard + 合并建议 + 测试 | 去重后 RAG 质量提升 | 0.25 |

**合计：0.5d**。