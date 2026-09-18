---
doc_type: module
prd_task_id: "YA-09-143"
title: "YA-09-143: 知识图谱查询 — 实体关系遍历 + 图检索 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "208-需求-知识图谱查询.md"
source_okr: [yiai-003]
---

# YA-09-143: 知识图谱查询 — 实体关系遍历 + 图检索 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[208-需求-知识图谱查询.md](../../prds/2026-09/208-需求-知识图谱查询.md)
> 需求编号：YA-09-143 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

从 YiKnowledge 的 frontmatter 和文件间引用关系中自动构建知识图谱（Neo4j/NetworkX），支持实体关系遍历查询。

```python
import networkx as nx

G = nx.DiGraph()

async def build_knowledge_graph():
    files = await db.knowledge_files.find({}).to_list(None)
    for f in files:
        G.add_node(f["path"], title=f["title"], tags=f["tags"], type=f["type"])
        for tag in f.get("tags", []): G.add_edge(f["path"], f"tag:{tag}")
        for related in f.get("related", []): G.add_edge(f["path"], related)

async def query_graph(entity: str, depth: int = 2) -> list:
    """从 entity 出发遍历 depth 层"""
    if entity not in G: return []
    paths = list(nx.single_source_shortest_path(G, entity, cutoff=depth))
    return [{"path": p, "nodes": [G.nodes[n] for n in p]} for p in paths]
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | NetworkX 构图 + 遍历查询 | "RAG" → 找到所有相关文件和标签 | 0.5 |
| 2 | 图谱可视化 + Agent 集成 + 测试 | Dashboard 可交互浏览图谱 | 0.5 |

**合计：1.0d**。