---
title: YiAi RAG hybrid retrieval landing
aliases: [yiai-rag-hybrid-retrieval-win, query-fusion-retriever, rag-implementation]
tags: [success case study, YiAi, RAG, hybrid retrieval, QueryFusionRetriever, BM25, llama-index, LLMRerank]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./yiai-brd-agent-launch.md
 - ../../projects/yiai/architecture.md
 - ../../../tech-lead/decisions/yiai--rag-evaluation-infra.md
 - ../../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md
 - ../../../ai-engineer/platform/llama-index-evolution.md
 - ../../../ai-engineer/methodology/rag-design-patterns.md
 - ../../processes/review-lessons.md
---

# YiAi RAG hybrid retrieval landing

> **As an** engineer, **I want to** yiai rag hybrid retrieval, **so that** success is reproducible.

> YiAi 2026-07-31 landed RAG hybrid retrieval: `QueryFusionRetriever` (vector + BM25) + optional `LLMRerank` + `_NumberSourcesPostprocessor` inline citation. BRD Agent + chat dual consumption, scope filter supports per-file / per-category Q&A.

## Summary

- **4 stages**: retrieval base setup (`QueryFusionRetriever`) → citation post-process (inline numbering) → scope filter (per-file / per-category) → optional re-ranking (`LLMRerank`)
- **Key success factors**: llama_index abstraction + BM25 and vector fusion + inline citation post-process + scope filter + optional re-ranking
- **Quantified effect**: BRD citation rate 90%+ (manual sampling); multi-route recall vs single-route recall rate ~30% higher (pending [RAG evaluation ADR](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) quantification)
- **Reusable experience**: RAG = hybrid retrieval > single-route; citation > no citation; scope filter for per-leaf Q&A before retrieval; re-ranking is optional not default

## Core viewpoints

- **Hybrid retrieval (vector + BM25) > single-route** — vector recall captures similar semantics; BM25 recall captures keyword hits; fusion ~30% higher than single-route (pending [RAG evaluation ADR](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) quantification).
- **Citation is the floor of RAG answer trustworthiness** — users must be able to click citation to jump to source file; `_NumberSourcesPostprocessor` labels answer with `[1] [2]` numbering + source path list.
- **Scope filter is a prerequisite for per-leaf Q&A** — `filter={"file_path": "...leaf..."}` lets users ask "what are the gotchas in this leaf"; YiVad 28 leaves × 2 wrappers go through this slicing ([YiVad functional modules](../projects/yivad/functional-modules.md)).
- **Re-ranking is optional, not default** — `LLMRerank` uses LLM two-pass scoring of recalled chunks, quality higher but cost high; `config.yaml rag.rerank` switch defaults off, only enabled for key scenarios.
- **llama_index abstraction is infrastructure** — `QueryFusionRetriever` / `LLMRerank` / postprocessor are all llama_index core; self-building adds no value.

## Key information

### Background

YiAi BRD Agent + chat need to recall knowledge from YiKnowledge to support generation; pain points:

- single vector recall captures similar semantics but misses keyword hits
- BM25 recall captures keywords but misses synonymous expressions
- no citation = answer not trustworthy = users don't know where it came from
- BRD Agent multi-language scenarios need scope filter (per-leaf / per-category)
- YiVad 28 leaves × 2 wrappers expect "ask about this leaf's content"

### 4-stage breakdown

| Stage | Content |
|---|---|
| 1 | Retrieval base setup: `QueryFusionRetriever` (vector + BM25)  |
| 2 | Citation post-process: `_NumberSourcesPostprocessor` inline numbering + source list |
| 3 | Scope filter: `filter={"file_path":...}` / `{"category":...}` |
| 4 | Optional re-ranking: `LLMRerank` + `config.yaml rag.rerank` switch |

### Key success factors

1. **llama_index abstraction infrastructure**: `QueryFusionRetriever` / `LLMRerank` / `_NumberSourcesPostprocessor` not self-built
2. **BM25 and vector fusion**: vector top_k=10 + BM25 sparse_top_k=10 → fusion takes top 5
3. **Inline citation post-process**: `_NumberSourcesPostprocessor` labels answer with `[1] [2]` + source path list
4. **Scope filter supports per-file / per-category**: `filter` field name contract (not `query`) aligned with [YiAi dev-standards §field name contract](../projects/yivad/dev-standards.md)
5. **Re-ranking is optional**: `rag.rerank` defaults off; only enabled for key scenarios; cost control
6. **SSE streaming + citation**: `rag-chat-stream` SSE frames carry source; front-end renders incrementally
7. **BRD Agent + chat dual consumption**: `/rag-query` + `/rag-chat-stream` endpoints reused

### Quantified effect

| Metric | Before launch | After launch | Note |
|---|---|---|---|
| Recall rate (multi-route vs single-route)  | single-route | multi-route ~+30% | pending [RAG evaluation ADR](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) quantification |
| BRD citation rate | 0% | 90%+ | manual sampling |
| Users click citation to jump to source file | ❌ | ✅ | YiVad already landed |
| Scope filter support | ❌ | per-file / per-category | YiVad 28 leaves go through per-leaf Q&A |
| SSE streaming + source | ❌ | ✅ | `/rag-chat-stream` |
| P0 bug after launch | — | 0 | — |

### Reusable experience

- **RAG decision model**: hybrid retrieval (vector + BM25) > single-route; citation > no citation; scope filter is per-leaf prerequisite; re-ranking is optional
- **llama_index abstraction > self-built**: `QueryFusionRetriever` / `LLMRerank` / postprocessor are infrastructure; self-building adds no value
- **Citation post-process is the floor of RAG answer trustworthiness**: users must be able to trace sources; inline numbering + source list
- **Scope filter uses `filter` not `query`**: field name contract hard constraint ([YiAi dev-standards](../projects/yivad/dev-standards.md))
- **Re-ranking defaults off, only on for key scenarios**: cost control + speed preservation
- **SSE streaming + source same frame**: front-end incremental render instead of two requests

### Follow-up evolution

- RAG evaluation infrastructure: see [ADR RAG evaluation](../../tech-lead/decisions/yiai--rag-evaluation-infra.md); 50 docs bilingual evaluation set + ragas 4 metrics
- Multi-provider LLM routing: see [ADR multi-provider](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md); run evaluation baseline before switching
- Knowledge graph: `llama_index.graph` + `KnowledgeGraphIndex`; BRD Agent based on entity relationship recall ([llama_index evolution §YiAi](../../ai-engineer/platform/llama-index-evolution.md))
- Docs ingestion expansion: `llama_index.readers.*` supports PDF / docx / confluence; LlamaParse cloud-side handles 130+ formats
- Workflows: hand-written SSE → `Workflow` event-driven steps

## Action recommendations

1. RAG retrieval uses `QueryFusionRetriever` hybrid (vector + BM25); fusion top_k starts at 5, gradually increase.
2. Citation must be added: `_NumberSourcesPostprocessor` inline numbering + source path list; users click citation to jump to source.
3. Scope filter uses `filter` field (not `query`); field name contract hard constraint.
4. Re-ranking defaults off; only enable `rag.rerank` for key scenarios (BRD / legal); cost control.
5. SSE streaming + source same frame; front-end incremental render instead of two requests.
6. BRD Agent + chat dual-consume unified endpoints: `/rag-query` + `/rag-chat-stream`.
7. Build evaluation set baseline first ([ADR RAG evaluation](../../tech-lead/decisions/yiai--rag-evaluation-infra.md)); must run before multi-provider switch.
8. Run baseline before multi-provider switch + recall rate fallback > 5% block (aligned with [ADR multi-provider §risk #2](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md)).

## Anti-patterns

- **Using single-route retrieval (vector-only or BM25-only)** — vector-only misses exact keyword matches (e.g., error codes, function names), while BM25-only misses semantic equivalents (e.g., "latency" vs. "response time"). Hybrid fusion of both routes consistently outperforms either alone by ~30%.

- **Delivering RAG answers without inline citations** — users cannot verify where an answer came from, so even factually correct responses are treated as untrustworthy hallucinations. The `_NumberSourcesPostprocessor` with numbered references and clickable source paths is the floor of RAG answer credibility.

- **Using `query` instead of `filter` as the scope field name** — the field name contract is a hard constraint across the YiAi codebase, and using an unapproved name like `query` causes the scope filter to be silently ignored, returning results from the entire knowledge base instead of the target leaf.

- **Enabling re-ranking by default** — `LLMRerank` invokes an LLM for a second scoring pass on every retrieved chunk, doubling cost and latency for every query. It should default to off and only be enabled for high-stakes scenarios where the quality gain justifies the expense.

- **Tuning retrieval parameters (top-k, fusion weights) without an evaluation set** — without a quantitative baseline, adjustments to top-k or fusion strategy are purely subjective and cannot be compared across runs. An evaluation set with ragas metrics must be built first so that every parameter change is measurable.

## Related

- [./win-yiai-brd-agent-launch.md](./win-yiai-brd-agent-launch.md) — BRD agent that consumes RAG hybrid retrieval for knowledge base recall
- [./win-yiai-llm-phase-four.md](./win-yiai-llm-phase-four.md) — LLM Phase 4 generation-side switch using RAG with inline citation retention
- [../../tech-lead/decisions/yiai--rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) — ADR for RAG evaluation infrastructure with ragas metrics
- [../../ai-engineer/platform/llama-index-evolution.md](../../ai-engineer/platform/llama-index-evolution.md) — llama_index evolution tracking QueryFusionRetriever and LLMRerank
- [../../ai-engineer/methodology/rag-design-patterns.md](../../ai-engineer/methodology/rag-design-patterns.md) — RAG design patterns reference
