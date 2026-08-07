---
title: RAG quality dashboard
aliases:
- retrieval augmented generation dashboard
- RAG performance dashboard
- RAG evaluation dashboard
- retrieval quality dashboard
tags:
- dashboard
- rag
- retrieval
- generation
- embeddings
- chunking
- hallucination
category: ai-engineer/methodology
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- ai-engineer
- tech-lead
benefit: RAG pipeline quality and retrieval effectiveness visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- retrieval precision/recall, chunk quality, embedding drift, context relevance, and generation faithfulness defined
related:
- ./dashboard-ai-methodology.md
- ../platform/dashboard-ai-performance.md
- ../foundations/dashboard-ai-safety.md
- ../foundations/dashboard-model-explainability.md
- ../data/dashboard-data-pipeline.md
tacit: false
---

# RAG quality dashboard

> **As an** AI engineer, **I want to** track RAG pipeline quality end-to-end, **so that** every retrieval is precise, every chunk is relevant, and every generation is grounded in the retrieved context.

> RAG is only as good as its weakest link. This dashboard tracks retrieval precision/recall, chunk quality, embedding drift, context relevance, and generation faithfulness — turning RAG from a black box into a measurable, optimizable pipeline.

## Summary

- 5 RAG quality dimensions: retrieval quality, chunk quality, embedding health, context relevance, generation faithfulness
- 8 RAG pipelines across 4 use cases: knowledge search, code assistant, document Q&A, customer support
- 2.8M queries/month; average retrieval latency: 320ms; average context precision: 82%
- 4 embedding models tracked; chunking strategies: fixed-size (3 pipelines), semantic (3), recursive (2)
- Dashboard reviewed monthly; RAG quality review bi-weekly with AI engineering team

## Core viewpoints

- RAG quality is a chain, not a single metric — retrieval precision × context relevance × generation faithfulness = end-to-end quality; a 90% precise retrieval with 60% faithful generation is still a 54% quality pipeline
- Chunking is the most underrated lever — the chunk size and strategy determine what the retriever can find; bad chunking means good retrieval is impossible
- Embedding drift is silent degradation — as your knowledge base evolves, the embedding space shifts; what was semantically close 3 months ago may not be today
- Grounded generation is the contract with users — if the LLM generates information not present in the retrieved context, it's hallucination, not RAG; every claim must be attributable to a source

## Key information

### 5-panel RAG quality overview

```
┌──────────────────────────────────────────────────────────────────┐
│  RETRIEVAL QUALITY                │  CHUNK QUALITY                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Precision@5:  82%      │   │  │  Chunks: 4.2M total      │   │
│  │  Recall@5:     78%      │   │  │  Avg size: 512 tokens    │   │
│  │  NDCG@5:       0.85     │   │  │  Overlap: 64 tokens (12%)│   │
│  │  MRR:          0.78     │   │  │  Semantic: 3 pipelines   │   │
│  │  Hit rate@5:   88%      │   │  │  Fixed:     3 pipelines   │   │
│  │  Query latency: 320ms   │   │  │  Recursive:  2 pipelines  │   │
│  │  Reranker gain: +8%     │   │  │  Chunk health: B+ (82)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  EMBEDDING HEALTH                 │  GENERATION FAITHFULNESS           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Models: 4 in use       │   │  │  Faithfulness: 88%       │   │
│  │  Drift score: 0.08      │   │  │  Answer relevancy: 85%   │   │
│  │  Re-embed needed: 12%   │   │  │  Hallucination rate: 5.2%│   │
│  │  Dimension: 1536 (avg)  │   │  │  Citation accuracy: 82%  │   │
│  │  Cosine sim > 0.8: 72%  │   │  │  Source attribution: 78% │   │
│  │  Index staleness: 4.2d  │   │  │  Context utilization: 72%│   │
│  │  Embedding cost: $2.8K/mo│  │  │  Groundedness: B+ (84)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Retrieval quality by pipeline

| Pipeline | Queries/mo | Precision@5 | Recall@5 | NDCG@5 | MRR | Hit rate@5 | Latency (p95) | Reranker |
|---|---|---|---|---|---|---|---|---|
| Knowledge Search | 1.2M | 85% | 80% | 0.88 | 0.82 | 92% | 280ms | Cohere Rerank v3 |
| Code Assistant | 850K | 78% | 72% | 0.82 | 0.75 | 85% | 350ms | BGE-Reranker-v2 |
| Document Q&A | 520K | 82% | 78% | 0.85 | 0.78 | 88% | 420ms | Cohere Rerank v3 |
| Customer Support | 280K | 80% | 76% | 0.83 | 0.76 | 86% | 310ms | None (hybrid search) |
| **Overall** | **2.8M** | **82%** | **78%** | **0.85** | **0.78** | **88%** | **320ms** | |

### Retrieval quality by query type

| Query type | % of queries | Precision@5 | Recall@5 | Hit rate@5 | Difficulty | Common failure |
|---|---|---|---|---|---|---|
| **Factual lookup** | 35% | 92% | 88% | 96% | Easy | None |
| **Conceptual** | 28% | 82% | 78% | 88% | Medium | Semantic mismatch |
| **Procedural/How-to** | 18% | 78% | 72% | 82% | Medium | Missing steps in chunks |
| **Comparative** | 10% | 72% | 65% | 75% | Hard | Cross-chunk context |
| **Multi-hop** | 6% | 62% | 55% | 68% | Hard | Requires multi-step retrieval |
| **Temporal** | 3% | 70% | 62% | 72% | Hard | Outdated chunks |
| **Overall** | **100%** | **82%** | **78%** | **88%** | | |

### Chunk quality by pipeline

| Pipeline | Chunking strategy | Chunk size | Overlap | Total chunks | Avg chunks/doc | Duplicate rate | Quality score |
|---|---|---|---|---|---|---|---|
| Knowledge Search | Semantic (section-based) | 400 tokens | 80 (20%) | 1.8M | 28 | 3.2% | A (90) |
| Code Assistant | Semantic (function-based) | 350 tokens | 50 (14%) | 1.2M | 45 | 2.8% | A (88) |
| Document Q&A | Recursive (heading-aware) | 600 tokens | 100 (17%) | 850K | 52 | 4.5% | B+ (84) |
| Customer Support | Fixed-size | 512 tokens | 64 (12%) | 380K | 18 | 5.8% | B (78) |
| Internal Wiki | Recursive (heading-aware) | 500 tokens | 75 (15%) | 220K | 35 | 3.5% | B+ (82) |
| API Docs | Semantic (endpoint-based) | 300 tokens | 40 (13%) | 180K | 12 | 1.8% | A (92) |
| HR Policies | Fixed-size | 512 tokens | 0 (0%) | 45K | 8 | 6.5% | C (68) |
| Legal Docs | Fixed-size | 700 tokens | 100 (14%) | 28K | 15 | 2.2% | B (76) |
| **Overall** | | **512 avg** | **64 (12%)** | **4.2M** | | **3.8%** | **B+ (82)** |

### Chunk quality metrics

| Metric | Current | Target | Gap | Impact |
|---|---|---|---|---|
| **Information density** (entities per chunk) | 3.2 | > 4.0 | -0.8 | Low-density chunks dilute retrieval |
| **Semantic coherence** (within-chunk similarity) | 0.78 | > 0.85 | -0.07 | Incoherent chunks confuse the generator |
| **Chunk boundary quality** (sentence break %) | 82% | > 95% | -13% | Mid-sentence breaks fragment meaning |
| **Overlap adequacy** (% with context overlap) | 78% | > 90% | -12% | Missing context at chunk boundaries |
| **Duplicate rate** | 3.8% | < 2% | +1.8% | Duplicates waste retrieval budget |
| **Orphan rate** (chunks with no parent doc) | 2.5% | < 1% | +1.5% | Orphan chunks can't be traced |
| **Overall chunk health** | **82/100** | **> 90** | **-8 pts** | |

### Embedding model health

| Model | Dimension | Pipelines | Avg cosine sim (query-chunk) | Drift score (30d) | Re-embed % | Cost/mo | Status |
|---|---|---|---|---|---|---|---|
| **text-embedding-3-large** (OpenAI) | 3072 | 2 | 0.82 | 0.06 | 8% | $1,200 | Good |
| **Cohere Embed v3** | 1024 | 2 | 0.80 | 0.08 | 10% | $850 | Good |
| **BGE-M3** (self-hosted) | 1024 | 2 | 0.78 | 0.12 | 15% | $450 | Monitor |
| **Voyage AI voyage-2** | 1536 | 1 | 0.84 | 0.05 | 5% | $320 | Good |
| **E5-large-v2** (legacy) | 1024 | 1 | 0.72 | 0.18 | 28% | $0 (self-hosted) | **Migrate** |
| **Overall** | **1536 avg** | **8** | **0.80** | **0.08** | **12%** | **$2,820** | |

### Embedding drift detection

| Pipeline | Embedding model | Drift score | Trend | Re-embed trigger | Last re-embed | Documents affected |
|---|---|---|---|---|---|---|
| Knowledge Search | text-embedding-3-large | 0.06 | → | 0.15 | 2026-07-15 | 2,200 docs |
| Code Assistant | BGE-M3 | 0.12 | ↑ | 0.15 | 2026-06-20 | 1,800 docs |
| Document Q&A | Cohere Embed v3 | 0.08 | → | 0.15 | 2026-07-28 | 850 docs |
| Customer Support | BGE-M3 | 0.14 | ↑ | 0.15 | 2026-06-10 | 620 docs |
| Internal Wiki | Cohere Embed v3 | 0.07 | → | 0.15 | 2026-07-20 | 350 docs |
| API Docs | Voyage AI voyage-2 | 0.05 | → | 0.15 | 2026-08-01 | 120 docs |
| HR Policies | E5-large-v2 | 0.18 | ↑ | 0.15 | **2026-04-15** | 85 docs |
| Legal Docs | text-embedding-3-large | 0.09 | → | 0.15 | 2026-07-10 | 45 docs |
| **Overall** | | **0.08 avg** | **↑** | | | |

### Context relevance

| Pipeline | Context precision | Context recall | Context utilization | Avg chunks retrieved | Avg chunks used | Waste % |
|---|---|---|---|---|---|---|
| Knowledge Search | 85% | 80% | 75% | 5 | 3.8 | 24% |
| Code Assistant | 78% | 72% | 68% | 5 | 3.4 | 32% |
| Document Q&A | 82% | 78% | 72% | 5 | 3.6 | 28% |
| Customer Support | 80% | 76% | 70% | 5 | 3.5 | 30% |
| Internal Wiki | 84% | 79% | 74% | 5 | 3.7 | 26% |
| API Docs | 88% | 84% | 80% | 5 | 4.0 | 20% |
| HR Policies | 72% | 65% | 62% | 5 | 3.1 | 38% |
| Legal Docs | 78% | 72% | 68% | 5 | 3.4 | 32% |
| **Overall** | **82%** | **78%** | **72%** | **5** | **3.6** | **28%** |

### Generation faithfulness

| Pipeline | Faithfulness | Answer relevancy | Hallucination rate | Citation accuracy | Source attribution | Groundedness score |
|---|---|---|---|---|---|---|
| Knowledge Search | 90% | 88% | 4.2% | 85% | 82% | A (90) |
| Code Assistant | 85% | 82% | 6.5% | 78% | 72% | B+ (82) |
| Document Q&A | 88% | 85% | 5.0% | 82% | 78% | B+ (85) |
| Customer Support | 86% | 84% | 5.8% | 80% | 75% | B+ (83) |
| Internal Wiki | 89% | 86% | 4.5% | 84% | 80% | A (88) |
| API Docs | 92% | 90% | 3.2% | 88% | 85% | A (92) |
| HR Policies | 82% | 78% | 8.5% | 72% | 65% | C+ (72) |
| Legal Docs | 87% | 84% | 5.5% | 81% | 78% | B+ (84) |
| **Overall** | **88%** | **85%** | **5.2%** | **82%** | **78%** | **B+ (84)** |

### Hallucination analysis

| Hallucination type | Rate | % of all hallucinations | Example | Severity | Prevention |
|---|---|---|---|---|---|
| **Extrinsic (fabricated facts)** | 2.1% | 40% | "The API supports OAuth 2.1" (it doesn't) | High | Stricter grounded generation prompt |
| **Intrinsic (contradicts context)** | 1.5% | 29% | Context says X, generation says Y | High | Context faithfulness check |
| **Attribution error** | 0.8% | 15% | Cites wrong source | Medium | Citation verification |
| **Temporal mismatch** | 0.5% | 10% | Uses outdated information | Medium | Timestamp awareness |
| **Entity error** | 0.3% | 6% | Wrong entity name/value | Low | Entity grounding |
| **Total** | **5.2%** | **100%** | | | |

### RAG pipeline end-to-end latency

| Pipeline | Retrieval | Reranking | Context assembly | LLM generation | Total | p95 | Target |
|---|---|---|---|---|---|---|---|
| Knowledge Search | 180ms | 100ms | 25ms | 1,200ms | 1,505ms | 2,200ms | < 2s |
| Code Assistant | 220ms | 130ms | 30ms | 1,800ms | 2,180ms | 3,500ms | < 3s |
| Document Q&A | 280ms | 140ms | 35ms | 2,500ms | 2,955ms | 4,200ms | < 3s |
| Customer Support | 200ms | 0ms (no rerank) | 20ms | 1,500ms | 1,720ms | 2,500ms | < 2s |
| Internal Wiki | 190ms | 110ms | 28ms | 1,400ms | 1,728ms | 2,400ms | < 2s |
| **Overall** | **210ms** | **110ms** | **28ms** | **1,680ms** | **2,028ms** | **2,960ms** | |

### RAG evaluation dataset

| Dataset | Queries | Annotated | Domain | Avg difficulty | Last updated | Coverage |
|---|---|---|---|---|---|---|
| Knowledge Search Eval | 1,200 | Yes (human) | Technical docs | 3.2/5 | 2026-08-01 | 85% |
| Code Assistant Eval | 850 | Yes (human + LLM) | Code + docs | 3.8/5 | 2026-07-15 | 78% |
| Document Q&A Eval | 620 | Yes (human) | Business docs | 2.8/5 | 2026-07-20 | 82% |
| Customer Support Eval | 450 | Yes (LLM-judge) | Support tickets | 2.5/5 | 2026-08-03 | 75% |
| Synthetic Eval (auto-generated) | 2,500 | Auto (RAGAS) | Cross-domain | 2.0/5 | 2026-08-05 | 90% |
| Adversarial Eval | 180 | Yes (human) | Edge cases | 4.5/5 | 2026-06-15 | 55% |
| **Total** | **5,800** | | | | | |

## Action recommendations

1. **E5-large-v2 migration**: 0.72 cosine sim, 0.18 drift, 28% re-embed rate; migrate to BGE-M3 or Voyage AI, target completion by Q4 2026
2. **HR Policies chunk quality**: 68/100 score, 0% overlap, 6.5% duplicate rate; redesign chunking strategy with semantic chunking + 15% overlap
3. **Multi-hop and comparative query retrieval**: 62% precision, 55% recall for multi-hop; implement multi-step retrieval with query decomposition
4. **Hallucination reduction**: 5.2% overall, 8.5% for HR Policies; implement chain-of-verification, stricter grounded generation prompt, citation enforcement
5. **Chunk boundary quality**: 82% sentence break; implement sentence-aware chunking across all pipelines, target 95%
6. **Context utilization**: 28% of retrieved context unused; optimize chunk count, implement context compression for long retrievals
7. **Customer Support reranker**: no reranker (0% latency gain but 8% quality gap); add lightweight reranker, evaluate cost-quality trade-off
8. **Embedding drift monitoring**: BGE-M3 at 0.12 drift, approaching 0.15 threshold; schedule re-embedding for Code Assistant and Customer Support pipelines
9. **Adversarial eval expansion**: 180 queries, 55% coverage; expand to 500 queries, add multilingual and temporal edge cases
10. **Bi-weekly RAG quality review**: review retrieval metrics, chunk health, embedding drift, hallucination rate, and pipeline latency with AI engineering team



- Chunk size as a guess → "512 tokens seems right"; chunk size should be determined by the content type, query patterns, and embedding model — test 3-5 sizes before committing
- Retrieval without reranking → trusting the embedding model's top-K as the final answer; a reranker adds 100ms and 8% precision — it's almost always worth it
- Embedding-and-forgetting → embedding documents once and never re-embedding; knowledge changes, embedding models improve, and drift accumulates — re-embedding is maintenance, not a one-time task
- RAG evaluation on synthetic data only → evaluating RAG pipelines on auto-generated Q&A pairs; synthetic data doesn't capture real user query patterns — always validate with human-annotated evals
- Hallucination tolerance → "5% hallucination is good enough for a demo"; every hallucination erodes user trust — in production, target < 2% for critical use cases

## Related

- Same class: [dashboard-ai-methodology](dashboard-ai-methodology.md) — prompt engineering, eval, RAG
- Same class: [dashboard-ai-performance](../platform/dashboard-ai-performance.md) — AI model performance
- Same class: [dashboard-ai-safety](../foundations/dashboard-ai-safety.md) — AI safety and guardrails
- Same class: [dashboard-model-explainability](../foundations/dashboard-model-explainability.md) — model explainability
- Same class: [dashboard-data-pipeline](../data/dashboard-data-pipeline.md) — data pipeline health
- References: RAGAS — *RAG Evaluation Framework*; LangChain — *RAG Best Practices*; Pinecone — *Chunking Strategies for RAG*; Cohere — *Reranking for RAG*; Anthropic — *Contextual Retrieval*; Microsoft — *GraphRAG*