---
title: RAG 设计模式（chunking / reranking / hybrid search）
tags: [AI, 方法论, RAG, 检索增强]
category: methodology/ai-specific
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# RAG 设计模式

## 1. 方法论定义与适用场景

RAG（Retrieval-Augmented Generation）：在生成前从外部知识库检索相关片段，作为上下文喂给 LLM。适用场景：

- 知识时效性高（文档频繁更新）
- 知识私有（不在模型权重里）
- 需要可溯源（答案要能引用来源）
- 需要可控（不希望模型 hallucinate）

## 2. 关键概念

| 术语 | 含义 |
|---|---|
| Chunking | 把长文档切成可检索单元 |
| Embedding | chunk 文本 → 稠密向量 |
| Retrieval | 找 top-k 最相似的 chunk |
| Reranking | 用更贵但更准的模型重排 top-k |
| Hybrid search | 稠密 ANN + 稀疏 BM25/ SPLADE 融合 |
| Query rewriting | 把用户原 query 改写成更适合检索的形式 |
| HyDE | 让 LLM 先写一个假设答案，用答案向量去检索 |
| Multi-query | 生成多个变体 query 并行检索，结果融合 |
| RAG-Fusion | 多 query 结果用 RRF（Reciprocal Rank Fusion）合并 |
| Self-RAG | LLM 自行判断是否检索、是否接受检索结果 |
| Graph RAG | 把知识组织成图，跨 chunk 关联检索 |

## 3. 标准 RAG 流水线

```
User Query
   ↓
Query Rewriting（可选：HyDE / Multi-query / Sub-query 拆解）
   ↓
Retrieval（vector ANN + BM25 hybrid）
   ↓
Reranking（cross-encoder 重排 top-20 → top-5）
   ↓
Context Compression（可选：对长 chunk 摘要 / 抽取相关段）
   ↓
Prompt Construction（system + retrieved context + user query）
   ↓
LLM Generation
   ↓
Citation & Verification（可选：让 LLM 引用来源，验证一致性）
```

## 4. 关键模块设计

### Chunking

| 策略 | 适用 | 陷阱 |
|---|---|---|
| 固定大小（200-500 token） | 通用 | 切断语义单元 |
| 段落 / 标题切分 | 结构化文档 | 标题层级丢失 |
| 递归切分（先段落后句子） | Markdown / HTML | 需要结构化 parser |
| 语义切分（基于 embedding 相似度合并） | 长文一致性高 | 切分耗算力 |
| 重叠切分（chunk 间重叠 50-100 token） | 跨边界信息不丢 | 增加存储 |

经验：BRD / PRD / 设计文档这类结构化文档，按标题层级递归切，chunk 200-500 token，重叠 50。

### Retrieval

- **召回数**：top-k 20-50 进 rerank 池；最终给 LLM 3-5 chunk
- **混合检索**：dense 召回 + BM25 召回，RRF 融合
- **元数据过滤**：先按 type / 权限 / 时效过滤，再 ANN（pre-filter）
- **多路召回**：原始 query + 改写 query + HyDE answer 三路并行

### Reranking

- 用 cross-encoder（bge-reranker-large / cohere-rerank-3 / jina-reranker-v2）
- 重排 top-20 → top-5，召回率提升 5-15%
- 成本：reranker 模型小但每对都要 forward，20 chunk × 100 query = 2000 次

### Prompt 构造

- system prompt 明确「只回答以下 context 中的内容，无依据时说不知道」
- context 按相关性降序排（前 2-3 个最重要）
- 标注每个 chunk 的来源（`[doc-1: 文件名]`），便于 LLM 引用

## 5. 反模式与陷阱

| 反模式 | 现象 | 修复 |
|---|---|---|
| chunk 过大 | 检索召回好但 context 超长，LLM 注意力分散 | 缩小 chunk + rerank |
| chunk 过小 | 召回 chunk 缺上下文，答案碎片化 | 加重叠 + Parent-Child chunking（小检大送） |
| 无 rerank | top-1 召回噪声大，答案质量不稳 | 加 cross-encoder rerank |
| 全用 dense | 罕见词 / 专有名词召回差 | hybrid 加 BM25 |
| query 不改写 | 用户原句不适合检索，命中差 | 加 query rewriting 或 HyDE |
| 不溯源 | 答案无法验证 | 在 prompt 要求引用，前端渲染引用 |
| 不评估 | 上线后不知道质量 | 评测集 + 用户反馈 |

## 6. 评估指标

| 指标 | 含义 |
|---|---|
| Recall@k | 召回池是否包含正例 |
| MRR | 正例的平均倒数排名 |
| nDCG@k | 排序质量 |
| Context precision | LLM 用到的 context 是否相关 |
| Answer faithfulness | 答案是否基于 context，无 hallucination |
| Answer relevance | 答案是否回答了 query |
| Citation accuracy | 引用是否正确 |

RAGAS 是常用评估框架，覆盖 faithfulness / relevance / context recall / context precision。

## 7. 高阶模式

- **Self-RAG**：LLM 自行判断检索需求，主动调用或拒绝；可省成本但稳定性差
- **Corrective RAG（CRAG）**：检索结果质量低时触发 web 搜索兜底
- **Graph RAG**：用 LLM 抽取实体关系构图，跨 chunk 关联查询；适合长报告 / 全库问答
- **Agentic RAG**：把检索作为工具，多步规划 + 检索 + 反思；适合复杂研究类问题

## 8. 本团队落地案例

- YiAi 知识检索：递归 chunking（500 token，重叠 50）+ bge-m3 dense + BM25 sparse + RRF 融合 + bge-reranker-large 重排 top-20 → top-5
- 多语言术语表：单独存为键值对，不进 RAG 流
- 评测：50 条业务 query 人工标注，月度跑 RAGAS

## 9. 参考资料

- Lewis et al., 2020 — *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*
- Gao et al., 2023 — *Retrieval-Augmented Large Language Models for Sequential Recommendation*
- RAGAS: https://docs.ragas.io
- Microsoft GraphRAG: https://microsoft.github.io/graphrag
