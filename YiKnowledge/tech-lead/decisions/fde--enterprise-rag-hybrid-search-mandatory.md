---
title: ADR — Hybrid search mandatory for enterprise RAG
aliases: [adr-enterprise-rag-hybrid-search-mandatory, fde-hybrid-search-adr, enterprise-rag-hybrid-adr]
tags: [adr, fde, enterprise-rag, hybrid-search, bm25, semantic, vector-search, agent-search, architecture-decision]
category: tech-lead/decisions/fde
created: 2026-08-05
updated: 2026-08-05
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-05
tacit: false
roles: [tech-lead, engineer, ai-engineer]
benefit: "Enterprise RAG mandates hybrid search; industry terms / SKU / compliance terms are not missed in recall"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - consequences and reversal path are stated
related:
  - ../../../ai-engineer/methodology/blueprint-an-enterprise-rag.md
  - ../../../ai-engineer/methodology/rag-design-patterns.md
  - ../../../ai-engineer/platform/pick-a-vector-database.md
  - ../../../engineer/process/operate-as-a-forward-deployed-engineer.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — Hybrid search mandatory for enterprise RAG

> **As a** tech lead, **I want to** mandate hybrid search (dense + sparse + nomenclature) for enterprise RAG, **so that** industry terms / product SKUs / compliance terms are not missed by dense-only recall, and enterprise RAG is not led astray by a "looks runnable" pure-semantic baseline.

> decision: All enterprise RAG deploys must use hybrid search (semantic + BM25 + cross-encoder rerank); pure semantic is not allowed. reason: Industry terms / abbreviations / IDs / product codes / regulatory clause numbers are guaranteed hits with BM25. Landing reference: [Enterprise RAG Blueprint](../../../ai-engineer/methodology/blueprint-an-enterprise-rag.md).

## 1. Basic info

| Field | Content |
|---|---|
| ADR ID | ADR-Fde-Hybrid-Search-Mandatory |
| Title | Enterprise RAG mandates hybrid search |
| State | Accepted |
| Date | 2026-08-05 |
| Decision maker | FDE Practice Lead + AI Architecture Group |
| Reviewers | CTO, customer business stakeholders |
| Related projects | FDE Playbook (enterprise RAG common customer) |
| Related PR/Issue | — |
| Supersedes | — |
| Superseded by | — |
| Re-review triggers | Quarterly review / signal: recall < 90% / customer reports missed terms / new industry terms emerge |

## 2. Background (Context)

- **Current state**: FDE often starts enterprise RAG deploys with "pure semantic vector search"; recall on industry terms (product codes / regulatory clause numbers / abbreviations / unit identifiers) is < 60%.
- **Pain point quantification**:
  - Pure semantic recall on product codes < 50% (embeddings map "Sku-12345" into "inventory management" neighbors).
  - Customer business terms not in embedding vocabulary → recall 0 → trust lost.
  - BM25 + semantic hybrid recall can reach 92%+; cross-encoder rerank can reach 95%+.
  - Regulatory clause numbers (e.g. "§164.312(a)(2)(iii)") have < 30% recall with pure semantic.
- **Triggering event**: Reference to [Awesome-FDE-Roadmap](https://github.com/pierpaolo28/Awesome-FDE-Roadmap) Enterprise RAG Blueprint section; FDE Practice RAG customer retrospective.
- **External constraint**: Enterprise corpora are 80% industry terms / abbreviations / IDs; general-purpose embedding models cover < 40%.

## 3. Decision

FDE Practice enterprise RAG deploys mandate hybrid search (semantic + BM25 + cross-encoder rerank). Pure semantic start is not allowed.

Landing checklist:

| No. | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Ingestion must produce two indexes: vector (Vector Search) + BM25 (Agent Search) | FDE Practice RAG template | One-time |
| 2 | Retrieval must produce dual recall + fusion (RRF / weighted) | FDE Practice RAG template | One-time |
| 3 | Rerank must use cross-encoder (e.g. bge-reranker / cohere-rerank) | FDE Practice RAG template | One-time |
| 4 | Embedding selection must test industry-term recall | FDE Practice RAG template | Per project |
| 5 | Chunking at paragraph level + keep tables intact; no brute 512-token | FDE Practice RAG template | One-time |
| 6 | Citation required (every answer cites source) | FDE Practice RAG template | One-time |
| 7 | Golden set must contain ≥ 30% industry-term queries | FDE Practice RAG template | Per project |
| 8 | Groundedness measurement (Pointwise RAG triad) must run | FDE Practice CI | One-time |
| 9 | Compliance-sensitive customer BM25 index runs inside air-gap (not leaving the domain) | FDE Practice compliance template | Per compliance project |

## 4. Options Considered

| Option | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. Hybrid (semantic + BM25 + cross-encoder rerank) | Three-layer recall | Recall 95%+; terms hit | Heavy; high cost | ✅ Selected |
| B. Pure semantic | Vector only | Light; fast start | Term recall < 60%; customer loses trust | ❌ |
| C. Pure BM25 | Keywords only | Strong terms; light | Misses synonyms; weak semantics | ❌ (kept as hybrid sub-path) |
| D. Hybrid without rerank | semantic + BM25 fusion | Recall 85%; light | Missing rerank → weak ranking | ❌ (POC only) |
| E. Multi-vector index (multiple embedding models) | Ensemble vector | Recall 88% | Terms still weak; high cost | ❌ (kept as extension) |

## 5. Evaluation dimensions

| Dimension | A. Hybrid+rerank | B. Pure semantic | C. Pure BM25 | D. Hybrid no rerank | E. Multi-vector |
|---|---|---|---|---|---|
| Term recall | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Semantic recall | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Ranking precision | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Startup cost | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Long-term cost | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Customer trust | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| BM25 index size large | High | Medium | Segmented index + sharding; split by data domain |
| Cross-encoder slow | High | Medium | Rerank top-20 only; GPU acceleration; cache |
| Wrong embedding model selection | Medium | High | Selection must test industry terms; golden set ≥ 30% terms |
| Chunking misalignment (tables split) | Medium | High | Paragraph-level + whole tables; no brute 512-token |
| RRF weights untuned | Medium | Medium | A/B test fusion weights; tune by recall |
| Compliance customer BM25 leaves domain | Medium | High | Index inside air-gap; not leaving domain |
| Customer business terms not in vocabulary | High | Medium | Adaptive BM25 + customer-signed term dictionary |

## 7. Rollback Plan

| Trigger | Rollback action | Owner | Estimated recovery time |
|---|---|---|---|
| Recall < 85% | Re-review chunking + fusion weights + embedding selection | FDE Practice Lead | 1 week |
| Cross-encoder slow → P95 > 5s | Rerank top-10 only + GPU + cache | FDE Practice Lead | 1 business day |
| BM25 index size over budget | Segmented index + sharding + domain split | FDE Practice Lead | 1 week |
| Wrong embedding selection | Run selection benchmark + re-index | FDE Practice Lead | 2 weeks |
| Compliance customer BM25 leaves domain | Re-run index inside air-gap | FDE Practice Lead + Legal | 1 week |
| Customer term dictionary gaps | Quarterly review + golden set 30% terms | FDE Practice Lead | 1 week |
