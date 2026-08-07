---
title: RAG design patterns (chunking / reranking / hybrid search)
aliases:
- RAG Design Patterns
- Retrieval-Augmented Generation
tags:
- AI
- methodology
- RAG
- retrieval
category: ai-engineer/methodology
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- ai-engineer
- engineer
benefit: ai methodology sound
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- agent-architecture-patterns.md
- prompt-engineering-guide.md
- hallucination-mitigation.md
- llm-evaluation-methods.md
- ../platform/vector-db-comparison.md
- ../platform/embedding-model-selection.md
- ../../engineer/projects/yiai/README.md
tacit: false
---

# RAG design patterns

> **As a** an ai engineer, **I want to** rag design patterns, **so that** ai methodology sound. 

> Retrieve relevant chunks from an external knowledge base before generation, then feed them as context to the LLM, resolving timeliness, private knowledge, and traceability issues. 

## Summary
- RAG = retrieval + reranking + generation; the core is making answers traceable and controllable, rather than relying on model weights. 
- Standard pipeline: query rewriting → hybrid retrieval → reranking → context compression → prompt → generation → citation. 
- Key bottlenecks are in chunking and rerank: the former determines the recall ceiling, the latter determines the precision ceiling. 
- Anti-pattern: no rerank, all dense, no query rewriting, no traceability, no evaluation, quality uncontrollable. 

## Core viewpoints
- **Retrieval quality determines the ceiling** — if the recall pool does not contain the right answer, even the strongest LLM cannot answer; rerank can improve recall rate by 5-15%. 
- **Chunk size is a trade-off** — too large and context becomes verbose with attention diluted; too small and context is lost; need Parent-Child overlapping splits. 
- **Hybrid search is standard** — dense recall is weak on rare terms and proper nouns, BM25 complements it, RRF fusion is the engineering default. 
- **Traceability is more important than high scores** — prompt requires references, frontend renders references, backend validates reference consistency; the three form a closed loop. 
- **Better evaluate than blindly run** — eval set + RAGAS (faithfulness / relevance / context recall) monthly regression. 

## Key information

### Concept breakdown

| term | meaning |
|---|---|
| Chunking | splitting long documents into retrievable units |
| Embedding | chunk text → dense vector |
| Retrieval | find top-k most similar chunks |
| Reranking | reorder top-k using a more expensive but more accurate model |
| Hybrid search | dense ANN + sparse BM25 / SPLADE fusion |
| Query rewriting | rewriting the user's original query into a form better suited for retrieval |
| HyDE | LLM writes a fake hypothetical answer first, then uses the answer vector to retrieve |
| Multi-query | generate multiple query variants, retrieve in parallel, fuse results |
| RAG-Fusion | merge multi-query results using RRF (Reciprocal Rank Fusion) |
| Self-RAG | LLM decides on its own whether to retrieve, whether to accept retrieval results |
| Graph RAG | organize knowledge as a graph, retrieve across chunk relationships |

### Standard pipeline

```
User Query
   ↓
Query Rewriting (optional: HyDE / Multi-query / Sub-query decomposition) 
   ↓
Retrieval (vector ANN + BM25 hybrid) 
   ↓
Reranking (cross-encoder re-rank top-20 → top-5) 
   ↓
Context Compression (optional: summarize long chunks / extract relevant segments) 
   ↓
Prompt Construction (system + retrieved context + user query) 
   ↓
LLM Generation
   ↓
Citation & Verification (optional: have LLM cite sources, validate consistency) 
```

### Chunking strategies

| strategy | applicable | pitfall |
|---|---|---|
| Fixed size (200-500 tokens)  | general | cuts semantic units |
| Paragraph / heading splitting | structured documentation | heading hierarchy lost |
| Recursive splitting (paragraphs then sentences)  | Markdown / HTML | needs structured parser |
| Semantic splitting (merge based on embedding similarity)  | long-form high-consistency text | splitting costs compute |
| Overlapping splitting (50-100 token overlap between chunks)  | cross-boundary information not lost | increases storage |

Experience: for BRD / PRD / design docs — structured documentation, recursive split by heading hierarchy, chunk 200-500 tokens, overlap 50. 

### Retrieval / Reranking key points

- **Recall count**: top-k 20-50 enter the rerank pool; final give to LLM 3-5 chunks
- **Hybrid retrieval**: dense recall + BM25 recall, RRF fusion
- **Metadata filtering**: first filter by type / permission / timeliness, then ANN (pre-filter) 
- **Multi-path recall**: original query + rewritten query + HyDE answer three paths in parallel
- **Reranker**: bge-reranker-large / cohere-rerank-3 / jina-reranker-v2; reorder top-20 → top-5; cost: reranker needs a forward pass for each pair, 20 chunks × 100 queries = 2000 passes

### Prompt construction

- System prompt explicitly states "only answer based on the following context, say you don't know when there is no basis"
- Context sorted by relevance descending (first 2-3 items most important) 
- Annotate each chunk's source (`[doc-1: filename]`) for easy LLM reference

### Evaluation metrics

| metric | meaning |
|---|---|
| Recall@k | whether the recall pool contains the correct answer |
| MRR | mean reciprocal rank of the correct answer |
| nDCG@k | ranking quality |
| Context precision | whether the context used by the LLM is relevant |
| Answer faithfulness | whether the answer is based on context, no hallucination |
| Answer relevance | whether the answer addressed the query |
| Citation accuracy | whether references are correct |

RAGAS is the commonly used evaluation framework, covering faithfulness / relevance / context recall / context precision. 

### Advanced patterns

- **Self-RAG**: LLM decides on its own whether retrieval is needed, proactively calls or refuses; saves cost but less stable
- **Corrective RAG (CRAG)**: when retrieval result quality is low, triggers web search fallback
- **Graph RAG**: uses LLM to extract entity relationships and build a graph, queries across chunk relationships; suitable for long reports / whole-knowledge-base Q&A
- **Agentic RAG**: treats retrieval as a tool, multi-step planning + retrieval + reflection; suitable for complex research-type questions

### Applicable scenarios

- Knowledge changes frequently (documentation updates often) 
- Knowledge is private (not in model weights) 
- Need traceability (answers must be able to cite sources) 
- Need controllability (do not want model to hallucinate) 

## Action recommendations
1. Choose chunking: structured documentation uses recursive splitting + overlap 50; general documentation uses 500 tokens + overlap; evaluate different chunking's Recall@10. 
2. Add hybrid search: dense (bge-m3 / OpenAI embedding) + BM25, RRF fusion, pre-filter metadata. 
3. Add cross-encoder rerank: top-20 → top-5, start with bge-reranker-large, switch to cohere-rerank at scale. 
4. Query rewriting: default add HyDE + multi-query, when hit rate is poor then add sub-query decomposition. 
5. Traceability closed loop: prompt requires references → frontend renders references → backend validates reference consistency. 
6. Build eval set: 50-200 business queries manually annotated, monthly RAGAS run. 
7. Monitor in production: daily sample 50 faithfulness items, quality regression alert. 

## Anti-patterns
- **Chunk too large** — retrieval recall is good but context is verbose, LLM attention diluted; shrink chunk + rerank. 
- **Chunk too small** — recall chunks lack context, answers are fragmented; add overlap + Parent-Child chunking (small retrieve, large send).
- **No rerank** — top-1 recall has high noise, answer quality unstable; add cross-encoder rerank. 
- **All dense** — rare terms / proper nouns recall is poor; hybrid add BM25. 
- **No query rewriting** — user's original sentence is not suitable for retrieval, poor hit rate; add query rewriting or HyDE. 
- **No traceability** — answers cannot be validated; require references in prompt, frontend renders references. 
- **No evaluation** — after launch, quality is unknown; eval set + user feedback. 


- **Using the same chunk size for all document types** — structured documentation (BRD, PRD) and narrative text need different chunking strategies; a single chunk size degrades recall for at least one document type.
- **Embedding documents without metadata fields** — without type, permission, and timeliness metadata, pre-filtering is impossible and retrieval returns irrelevant or stale results.
- **Using the reranker as a substitute for improving retrieval quality** — the reranker can only reorder what is in the top-k pool; if the correct answer is outside top-20, no reranker can recover it.
- **Building RAG without a dedicated retrieval evaluation set** — you cannot tell whether a chunking or embedding change improves or degrades retrieval; an eval set of 50-200 queries is the minimum.
- **Ignoring the total context window budget when constructing the prompt** — retrieval results + system prompt + chat history + user query can silently exceed the model's context limit; truncate or compress before generation.

## Related
- Same category: [agent-architecture-patterns-summary.md](./agent-architecture-patterns.md) (Agentic RAG treats retrieval as a tool) ; [hallucination-mitigation-summary.md](./hallucination-mitigation.md) (RAG is the main force for suppressing hallucinations) ; [llm-evaluation-methods-summary.md](./llm-evaluation-methods.md) (RAGAS evaluation methods) 
- Upstream: [../platform/vector-db-comparison.md](../platform/vector-db-comparison.md); [../platform/embedding-model-selection.md](../platform/embedding-model-selection.md)
- Downstream: [../../engineer/projects/yiai/README.md](../../engineer/projects/yiai/README.md) (YiAi knowledge retrieval implementation) 

## References
- Lewis et al., 2020 — *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*
- Gao et al., 2023 — *Retrieval-Augmented Large Language Models for Sequential Recommendation*
- RAGAS: https://docs.ragas.io
- Microsoft GraphRAG: https://microsoft.github.io/graphrag
