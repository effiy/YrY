---
title: Build a RAG pipeline
aliases:
- I want to build a RAG
- rag-pipeline-journey
- retrieval-augmented generation entry
tags:
- journeys
- rag
- retrieval
- llm
- citation
- vector-db
category: engineer/projects
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: system is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../strategies/find-ai-deployment-cases.md
- ../../README.md
- ../../ai-engineer/methodology/README.md
- ../../engineer/projects/yiai/README.md
- ../../ai-engineer/platform/README.md
review_cycle: quarterly
tacit: false
---

# I want to build a RAG pipeline

> **As an** engineer, **I want to** build a rag pipeline, **so that** system is reproducible. 

> "Recall / rerank / citation / evaluation / knowledge sync how to" reach within 2 hops inline citation pattern + RAG evaluation ADR + hybrid retrieval win + knowledge watcher + vector library / embedding selection. 

## Summary

- Retrieval + rerank + citation go [inline-citation-rag-pattern](../engineering/inline-citation-rag.md) (QueryFusionRetriever vector+BM25 + LLMRerank + `_NumberSourcesPostprocessor` numbering + same-frame source + scope filter) 
- Evaluation goes [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) + [RAG evaluation ADR](../../tech-lead/decisions/yiai/rag-evaluation-infra.md) (50 docs bilingual + ragas 4 metrics + CI gate fallback > 5% block) 
- Knowledge sync goes [knowledge watcher ADR](../../tech-lead/decisions/yiai/knowledge-watcher-deployment.md) (apscheduler polling + incremental index + debounce + fail retry; bypass macOS FSEvents) 
- Generation side multi provider goes [LLM rollout ADR](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) (`llama_index.llms.*` abstraction + 5 stage grayscale) 
- Streaming output goes [sse-streaming-pattern](../architecture-design/sse-streaming.md) (three-way done frame + releaseLock + abort section) 

## Core viewpoints

**Retrieval quality determines the ceiling of RAG; generation quality determines the floor.** A perfect LLM with bad retrieval produces plausible-sounding but factually wrong answers. A mediocre LLM with perfect retrieval produces boring but correct answers. Investment in retrieval (hybrid search, reranking, metadata filtering) has higher ROI than investment in prompt engineering.

**Citation is not optional; it is the only trust mechanism the user has.** An answer without a source is indistinguishable from hallucination. The inline citation pattern (numbered references in the answer body, corresponding source list with path, snippet, and score) is the minimum viable trust surface. Users who cannot verify an answer will stop using the system.

**Evaluation is the only way to know if RAG is improving, and it must be bilingual.** Monolingual evaluation sets hide retrieval failures in the other language. A 50-document bilingual golden set with ragas metrics (faithfulness, answer relevancy, context precision, context recall) and a CI gate that blocks merges when fallback exceeds 5% is the minimum viable evaluation infrastructure.

**Knowledge sync is the hidden bottleneck that determines freshness.** The fanciest RAG pipeline is useless if the underlying knowledge is stale. The sync mechanism (apscheduler polling, incremental indexing, debounce, fail retry, dead-letter queue) must be treated as a first-class component, not a cron job. On macOS, FSEvents is broken, so polling is the only reliable option.

## Key info

- **Chunking strategy comparison**: fixed-size (512 tokens, 10% overlap) is the default and works for 80% of use cases. Sentence-based (split on sentence boundaries) preserves semantic completeness but produces uneven chunk sizes. Recursive (split on headers, then paragraphs, then sentences) is best for structured markdown. Semantic (embed and cluster similar sentences) is computationally expensive and rarely worth the cost. The YiAi default: recursive chunking on markdown headers, 512 tokens, 10% overlap -- this balances structure awareness with retrieval performance.
- **Hybrid retrieval weights**: vector (semantic similarity, catches paraphrases and related concepts) + BM25 (keyword matching, catches exact terminology and code). The fusion weight defaults to 0.5/0.5 but should be tuned per domain: technical documentation (BM25-heavy, 0.3/0.7) because exact API names matter; narrative content (vector-heavy, 0.7/0.3) because semantic meaning matters more than exact wording. YiAi uses `QueryFusionRetriever` with `num_queries=3` (generates 3 query variations) and `reciprocal_rank_fusion` (RRF) to merge results.
- **Reranking cost-benefit**: `LLMRerank` (cross-encoder) reranks top-K retrieved documents by computing relevance scores for each query-document pair. Cost: 1 additional LLM call per reranked document. Benefit: precision@5 improves from ~60% to ~85% on the YiAi bilingual dataset. The trade-off: reranking doubles latency (from ~1s to ~2s per query). The rule: rerank when precision matters more than latency (analyst tools, legal review, medical QA); skip reranking when speed matters more (chat, real-time suggestions).
- **Embedding model selection**: `all-MiniLM-L6-v2` (384 dim, 80MB, fast, English-only, ~15ms per query) is the default for English-only small-scale. `bge-m3` (1024 dim, 2.2GB, multilingual, ~50ms per query) is the YiAi choice for bilingual (zh+en). `text-embedding-3-large` (3072 dim, API-only, $0.13/1M tokens, ~30ms) is the OpenAI option for maximum quality. The dimension trade-off: higher dimensions = better recall but larger index and slower retrieval. The YiAi bilingual dataset showed bge-m3 recall@10 = 0.91 vs all-MiniLM recall@10 = 0.78 for Chinese queries.
- **RAG evaluation metrics**: ragas library provides 4 standard metrics: faithfulness (is the answer grounded in the context? 0-1), answer relevancy (does the answer address the question? 0-1), context precision (are retrieved documents relevant? 0-1), context recall (are all relevant documents retrieved? 0-1). YiAi's CI gate: if any metric falls below 0.85 or drops >5% from baseline, block merge. The 50-document bilingual golden set was hand-curated from YiKnowledge markdown files.

## Scenario description

When building RAG knowledge base Q&A (like YiAi BRD Agent / after-sales knowledge base / techdocs retrieval), developer needs to decide: vector library selection / embedding model / chunking strategy / fusion retrieval / rerank / citation / evaluation / knowledge sync / generation side LLM provider / streaming output. This entry aggregates RAG full-trace methodology, YiAi landing ADR + wins, vector library / embedding / reasoning engine selection into 2-hop paths, avoiding "recall rate by eyeball / answer no sourcing / knowledge lag". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [inline-citation-rag-pattern.md](../engineering/inline-citation-rag.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) · [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `projects/YiAi/` | [adr-rag-evaluation-infra.md](../../tech-lead/decisions/yiai/rag-evaluation-infra.md) · [adr-brd-agent-launch.md](../../tech-lead/decisions/yiai/brd-agent-launch.md) · [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai/knowledge-watcher-deployment.md) · [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) · [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md) · [architecture-summary.md](../../engineer/projects/yiai/architecture.md) · [functional-modules-summary.md](../../engineer/projects/yiai/functional-modules.md) |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yiai-llm-phase-two-win.md](../lessons/win-yiai-llm-phase-two.md) · [yiai-llm-phase-three-win.md](../lessons/win-yiai-llm-phase-three.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) |
| `tech/ai-platform/` | [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llama-index-evolution-summary.md](../../ai-engineer/platform/llama-index-evolution.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) |

## Action recommendations

1. Retrieval fusion: `QueryFusionRetriever` (vector + BM25) + `LLMRerank`, avoid single-way vector recall losing semantically close docs. 
2. Citation sourcing: `_NumberSourcesPostprocessor` numbering + answer embedded `[N]` + same-frame return source list (path + snippet + score) , not let user face unsourced answer. 
3. Scope filter: MetadataFilters by collection / directory / class filter, avoid cross-domain interference. 
4. Streaming output: SSE same-frame with source (three-way done frame + releaseLock + abort section) , not let user wait 30s. 
5. Eval set: 50 docs bilingual + ragas 4 metrics (faithfulness / answer_relevancy / context_precision / context_recall) + CI gate fallback > 5% block. 
6. Knowledge sync: apscheduler polling + incremental index + 30s debounce + 3 fail exponential backoff + dead-letter queue; bypass macOS FSEvents missing events. 
7. Generation side multi provider: `llama_index.llms.*` abstraction + 5 stage grayscale (supply chain harden before deployment → router + registry → grayscale cut-stream → RAG generation side → endpoint + frontend) . 
8. After launch badcase feeds back into eval set + quarterly full rerun baseline prevent drift. 

## Anti-patterns

- **Using only vector search for retrieval.** Vector search is good at semantic similarity but bad at exact keyword matches, numbers, and code identifiers. A vector-only pipeline will miss documents that use different terminology for the same concept. Hybrid retrieval (vector + BM25) is the baseline; pure vector is a bug.

- **Skipping citation because "the LLM is usually right."** The LLM is right often enough to build false confidence, and wrong often enough to cause real damage. Every answer must include traceable citations. If the citation system is too hard to implement, the RAG pipeline is not ready for users.

- **Eyeballing retrieval quality instead of running an eval harness.** "The results look good to me" is not evaluation. It takes 50 annotated query-document pairs and four automated metrics to know whether a retrieval change is an improvement or a regression. Eyeballing is fine for demos; it is malpractice for production.

- **Ignoring knowledge staleness.** A RAG pipeline that indexes documents once and never re-indexes will serve increasingly stale answers. The knowledge sync mechanism must run on a schedule, detect changes, re-index incrementally, and alert when sync fails. Stale knowledge is worse than no knowledge because it is confidently wrong.

- **Treating chunk size as a one-time configuration choice.** Chunk size has a dramatic effect on retrieval quality and is highly dependent on the document type. Code documentation needs small chunks (function-level); architectural docs need medium chunks (section-level); narrative content needs large chunks. The chunking strategy should be evaluated per document type, not set globally.

## Related

- Related journey: [../strategies/find-ai-deployment-cases.md](../engineering/find-ai-deployment-cases.md) — AI landing case study reference
- Related journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — RAG pipeline decision ADR
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — AI-specific methodology
- Downstream: [../../engineer/projects/yiai/README.md](../../engineer/projects/yiai/README.md) — YiAi RAG landing
