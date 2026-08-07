---
title: Pick a vector database
aliases:
- I want to pick a vector database
- vector-db-journey
- embedding-store-journey
- vector-db selection entry
tags:
- journeys
- vector-db
- embedding
- milvus
- qdrant
- weaviate
- pgvector
category: ai-engineer/platform
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: selection is grounded
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/projects/build-a-rag-pipeline.md
- ./pick-an-llm-provider.md
- ../../engineer/engineering/track-tech-foundations.md
- ../../ai-engineer/platform/vector-db-comparison.md
review_cycle: quarterly
tacit: false
---

# I want to pick a vector database

> **As a** an ai engineer, **I want to** pick a vector database, **so that** selection is grounded.

> "Milvus / Qdrant / Weaviate / pgvector / Chroma selection + index strategy + cost + hybrid retrieval" within 2 hops reach vendor comparison + Embedding + RAG patterns + data modeling + cases.

## Summary

- Vendor comparison: [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md)
- Embedding selection: [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md)
- Hybrid retrieval: [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) + [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md)
- Index modeling: [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) + [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md)
- Cost: [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md)

## Core viewpoints

**The vector database is not the decision -- the retrieval architecture is. The database is just the storage layer.** The vector database selection should follow from the retrieval architecture, not precede it. First define: the retrieval strategy (pure vector, hybrid, multi-stage), the embedding model and dimension, the chunking strategy, the metadata filtering requirements, and the expected scale and growth. Then select the vector database that supports the architecture. Choosing the database first and then adapting the architecture to fit the database leads to suboptimal retrieval quality.

**The operational cost of a vector database is dominated by the team's familiarity with the ecosystem, not by the database's performance characteristics.** pgvector is the right choice for teams that already operate PostgreSQL, not because it is the best vector database, but because it eliminates the operational overhead of a new system. Qdrant is the right choice for teams that want a single-binary deployment with minimal ops. Milvus is the right choice for teams that already operate Kubernetes and need 100M+ scale. The database that your team can operate reliably is better than the database with the best benchmark scores.

**Hybrid retrieval is not a "nice to have" -- it is table stakes for production RAG.** Pure vector search systematically fails on queries that contain exact terms (product codes, error messages, person names, abbreviations) because the embedding model encodes these as semantic concepts, not as literal strings. BM25 catches these exact matches. The hybrid approach consistently outperforms either approach alone by 10-30% on recall. The question is only whether to implement hybrid retrieval inside the vector database or with an external search engine.

**Index strategy selection (HNSW vs IVF vs Flat) should be driven by the recall target and memory budget, not by the default recommendation.** HNSW provides the best recall at the cost of the highest memory usage. IVF-PQ provides lower memory usage at the cost of lower recall. Flat provides exact results at the cost of linear scan latency. The correct approach is to define the recall target (e.g., recall@10 > 0.95), benchmark each index type on your data, and select the one that meets the target with the lowest memory footprint.

**Vector database selection is a tradeoff between three dimensions: scale, operational complexity, and feature richness -- and you can only optimize for two.** Milvus optimizes for scale and features but has high operational complexity. pgvector optimizes for simplicity and integration but has limited scale and features. Qdrant is a middle ground. The choice depends on which dimension you are willing to sacrifice, not on which database is "best."

## Key info

- **Vector database comparison matrix (5 candidates with key metrics)**: (1) Milvus — scale: 100B+ vectors, index: HNSW/IVF/DiskANN, hybrid: built-in BM25 + vector, metadata filtering: pre-filter with scalar indexing, ops: Kubernetes required, cost: free (open source) + infrastructure; best for 100M+ scale with dedicated ops team; (2) Qdrant — scale: 1B+ vectors, index: HNSW, hybrid: built-in BM25 + vector, metadata filtering: pre-filter with payload indexing, ops: single binary, cost: free (open source) + infrastructure or cloud; best for 1M-100M scale with minimal ops; (3) Weaviate — scale: 1B+ vectors, index: HNSW, hybrid: built-in BM25 + vector, metadata filtering: pre-filter with GraphQL, ops: single binary or Kubernetes, cost: free (open source) + infrastructure or cloud; best for multi-modal (text + image) use cases; (4) pgvector — scale: 10M vectors (practical limit), index: HNSW/IVFFlat, hybrid: external (PostgreSQL full-text search), metadata filtering: native SQL WHERE, ops: existing PostgreSQL, cost: free (PostgreSQL extension); best for teams already on PostgreSQL with < 10M vectors; (5) Chroma — scale: 1M vectors, index: HNSW, hybrid: limited, metadata filtering: basic, ops: embedded library, cost: free (open source); best for prototyping and small-scale projects.
- **Index type comparison (HNSW vs. IVF vs. DiskANN vs. Flat)**: HNSW — recall@10: 0.95-0.99, memory: 1.5-2x raw vector size, build time: medium, query speed: 0.1-1ms at 1M scale; best for high-recall, memory-tolerant scenarios. IVF — recall@10: 0.90-0.95, memory: 1x raw vector size, build time: slow (requires training), query speed: 1-5ms at 1M scale; best for memory-constrained scenarios. DiskANN — recall@10: 0.90-0.95, memory: 0.1x raw vector size (SSD-backed), build time: slow, query speed: 5-20ms; best for billion-scale where RAM is insufficient. Flat — recall@10: 1.0 (exact), memory: 1x raw vector size, build time: instant, query speed: 10-100ms at 1M scale; best for < 100K vectors where exact results are required. The Yi-family RAG system uses llama_index with MongoDB Atlas vector search (HNSW index); the current scale is < 10K vectors.
- **Hybrid retrieval implementation strategies (3 approaches)**: (1) Built-in — the vector database natively supports hybrid (Qdrant, Weaviate, Milvus); simplest to implement but coupled to the database; (2) External fusion — run vector search and BM25 separately, then merge results using Reciprocal Rank Fusion (RRF) or weighted scoring; more flexible, database-agnostic, but requires managing two indexes; (3) Reranking — run vector search first, then use a cross-encoder reranker to score results; highest quality but highest latency and cost. The Yi-family RAG system uses approach 2 (external fusion via llama_index QueryFusionRetriever) with optional approach 3 (LLMRerank). The hybrid approach improved recall by 15% over pure vector search.
- **Embedding model upgrade and index rebuild planning**: The vector database is coupled to the embedding model — when you change the embedding model, all vectors must be re-embedded and the index rebuilt. The dual-track strategy: (1) Run old and new embedding models in parallel, storing vectors in separate collections; (2) Validate the new index against the evaluation set; (3) Switch traffic to the new index only when recall and latency meet targets; (4) Keep the old index for 30 days as a rollback option; (5) Decommission the old index after 30 days. The rebuild time for 1M vectors with a 768-dim embedding model is ~2-4 hours on a single GPU; for 100M vectors, it's 2-4 days. The Yi-family RAG system uses BGE-M3 (1024 dim) embeddings; the current scale (< 10K vectors) makes rebuilds trivial (< 1 minute).
- **Yi-family vector database state (2026-08)**: The Yi-family RAG system uses MongoDB Atlas Vector Search (not a dedicated vector database). The decision rationale: MongoDB is already the primary database for all 3 projects (M0 free tier), the document model fits the YiKnowledge markdown structure, and the vector search capability (added in MongoDB 7.0) is sufficient for the current scale (< 10K vectors). The trade-off: MongoDB Atlas Vector Search has limited index types (HNSW only), no built-in hybrid retrieval (external fusion via llama_index), and no disk-backed index for large scale. The gap: if the vector collection grows beyond 100K, a dedicated vector database (Qdrant or Milvus) should be evaluated.

## Scenario

When building RAG / selecting a vector database / switching vector databases / calculating cost / doing hybrid retrieval (vector + keyword + metadata filtering), architects + algorithm + DBA need to look up vendor comparison + Embedding selection + data modeling + landing cases. This entry aggregates vector-db-related 5 leaf + data modeling + hybrid retrieval win into a 2-hop path, avoiding "selection by hearsay / indexes built randomly / cost out of control / single-route recall lacks hybrid".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/ai-platform/` | [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [ai-workbench-user-guide-summary.md](../../ai-engineer/platform/ai-workbench-user-guide.md) · [llama-index-evolution-summary.md](../../ai-engineer/platform/llama-index-evolution.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `methodology/engineering-patterns/` | [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) |
| `tech/data/` | [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) |
| `tech/ai-foundations/` | [transformer-architecture-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [kv-cache-inference-optimization-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) · [long-context-techniques-summary.md](../../ai-engineer/foundations/long-context-techniques.md) — long context vs vector retrieval |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) — hybrid retrieval landing · [yiai-llm-phase-two-win.md](../../engineer/lessons/win-yiai-llm-phase-two.md) · [yiai-llm-phase-three-win.md](../../engineer/lessons/win-yiai-llm-phase-three.md) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) — knowledge base watcher drops events impacting incremental index |
| `projects/YiAi/` | [adr-rag-evaluation-infra.md](../../tech-lead/decisions/yiai/rag-evaluation-infra.md) · [adr-brd-agent-launch.md](../../tech-lead/decisions/yiai/brd-agent-launch.md) · [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai/knowledge-watcher-deployment.md) — RAG ADR |
| `resources/templates/` | [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [tech-selection-evaluation-summary.md](../../knowledge-curator/templates/tech-selection-evaluation.md) — selection evaluation template |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) — RAG system prompt |

## Action recommendations

1. **Scenario positioning**: million-scale + high QPS -> Milvus / Qdrant; already on PostgreSQL + medium scale -> pgvector; fast prototype -> Chroma; multi-modal -> Weaviate.
2. **Hybrid retrieval**: must run vector + keyword (BM25) + metadata filter; do not single-route pure vector; see [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md).
3. **Embedding selection**: bge-m3 (multi-lingual) / OpenAI text-embedding-3 (ecosystem) / Cohere (strong reranking) / self-hosted (private); see [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md).
4. **Index strategy**: HNSW (high recall + high memory) / IVF (medium) / PQ (compression) / Flat (exact small scale); pick by scale + latency.
5. **Metadata filtering**: must support pre-filter or post-filter; pre-filter performs better; see [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md).
6. **Data modeling**: vector + metadata + reference ID + timestamp; see [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md).
7. **Incremental index**: knowledge updates must run incremental upsert; watcher / ETL pipeline; see [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai/knowledge-watcher-deployment.md) + [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md).
8. **Evaluation**: build an eval set covering recall / faithfulness / reference accuracy; see [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md).
9. **Cost**: memory + storage + compute separated vs integrated, pick by scale; see [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md).
10. **Switch plan**: abstract layer + standard interface, easy to swap DB; see [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md).
11. **Observable**: monitor recall / latency / index size / incremental lag; see [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md).

## Anti-patterns

- **Selecting a vector database based on a blog post comparison without benchmarking your own workload.** Every vector database benchmark is run on a workload that does not match yours. The benchmark may use 1024-dimensional vectors when you use 384, 1M vectors when you have 100M, or no metadata filtering when your queries all have filters. The minimum viable evaluation is: load a representative sample of your data (100K-1M vectors), run your actual query patterns, and measure recall, latency, and memory usage.

- **Over-engineering the vector database selection when the scale does not justify it.** If you have fewer than 1M vectors and already use PostgreSQL, pgvector is the right answer. The performance difference between pgvector and purpose-built vector databases at this scale is measured in single-digit milliseconds. The operational simplicity of staying within the PostgreSQL ecosystem outweighs the performance gap.

- **Implementing pure vector search without BM25 or hybrid retrieval.** This is the single most common cause of poor retrieval quality in production RAG systems. Pure vector search cannot handle exact keyword matches, and pure BM25 cannot handle semantic similarity. The fix is a hybrid retrieval pipeline that combines both, which is built into Qdrant, Weaviate, and Milvus, or can be implemented with an external search engine.

- **Neglecting to plan for embedding model upgrades that require a full index rebuild.** The vector database is coupled to the embedding model. When you upgrade the embedding model, all vectors must be re-embedded and the index must be rebuilt. This process takes days for large indexes. The architecture must support dual-track operation: run the old and new indexes in parallel, validate the new index, and switch traffic only when the new index meets quality targets.

- **Choosing a vector database without considering the metadata filtering requirements.** Most production queries filter by metadata (date range, document type, user permissions). The vector database's metadata filtering performance -- pre-filtering vs post-filtering, index support for filter fields, and the interaction between filters and vector search -- can dominate the query latency. Always benchmark with your actual metadata filtering patterns.

## Related

- Same-class journey: [../../engineer/projects/build-a-rag-pipeline.md](../../engineer/projects/build-a-rag-pipeline.md) — RAG full link
- Same-class journey: [./pick-an-llm-provider.md](./pick-an-llm-provider.md) — Embedding + LLM selected together
- Same-class journey: [../../engineer/engineering/track-tech-foundations.md](../../engineer/engineering/track-tech-foundations.md) — foundation theory
- Same-class journey: [./evaluate-an-llm-app.md](./evaluate-an-llm-app.md) — recall evaluation
- Upstream: [../../ai-engineer/platform/README.md](../../ai-engineer/platform/README.md) — ai-platform leaf entry
