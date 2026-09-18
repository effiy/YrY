---
doc_type: module
prd_task_id: "YA-09-134"
title: "YA-09-134: 向量数据库迁移 — FAISS → ChromaDB/Qdrant — 开发方案"
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
source_prd: "161-需求-向量数据库迁移.md"
source_okr: [yiai-001]
---

# YA-09-134: 向量数据库迁移 — FAISS → ChromaDB/Qdrant — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[161-需求-向量数据库迁移.md](../../prds/2026-09/161-需求-向量数据库迁移.md)
> 需求编号：YA-09-134 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

当前 llama_index 默认 FAISS（内存索引，重启丢失）。迁移到 ChromaDB（持久化，支持元数据过滤）。

```python
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore

chroma_client = chromadb.PersistentClient(path="./data/chroma_store")
collection = chroma_client.get_or_create_collection("yi_knowledge")
vector_store = ChromaVectorStore(chroma_collection=collection)
index = VectorStoreIndex.from_vector_store(vector_store, embed_model=embed_model)
```

### 对比: FAISS 重启丢失、内存限制、无元数据过滤; ChromaDB 持久化、无限制、支持过滤

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | ChromaDB 集成 + 数据迁移 | 重启后索引保留 | 0.5 |
| 2 | 元数据过滤 + 测试 | `{tags: "RAG"}` 过滤正确 | 0.5 |

**合计：1.0d**。