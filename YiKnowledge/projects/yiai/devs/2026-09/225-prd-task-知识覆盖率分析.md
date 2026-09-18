---
doc_type: module
prd_task_id: "YA-09-151"
title: "YA-09-151: 知识覆盖率分析 — 缺口识别 + 填充建议 — 开发方案"
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
source_prd: "225-需求-知识覆盖率分析.md"
source_okr: [yiai-001]
---

# YA-09-151: 知识覆盖率分析 — 缺口识别 + 填充建议 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[225-需求-知识覆盖率分析.md](../../prds/2026-09/225-需求-知识覆盖率分析.md)
> 需求编号：YA-09-151 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

分析用户 RAG 查询中"无结果"或"低相关度"的查询，识别知识库覆盖缺口，建议优先补充的知识主题。

```python
async def coverage_analysis() -> dict:
    # 1. 低质量 RAG 查询
    low_quality = await db.rag_queries.find({"hit_score": {"$lt": 0.3}}).to_list(None)
    # 2. 聚类相似查询
    queries = [q["query"] for q in low_quality]
    clusters = await cluster_queries(queries)
    # 3. 对比已有知识
    gaps = []
    for cluster in clusters:
        existing = await db.knowledge_files.count_documents({"tags": {"$in": cluster["keywords"]}})
        if existing < 3: gaps.append({"topic": cluster["label"], "query_count": len(cluster["items"])})
    return {"gaps": sorted(gaps, key=lambda g: -g["query_count"])}
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 低质量查询聚类 + 缺口识别 | 发现未覆盖的知识主题 | 0.25 |
| 2 | Dashboard + 填充建议 + 测试 | 优先创建建议触达 curator | 0.25 |

**合计：0.5d**。