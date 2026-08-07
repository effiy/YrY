---
title: Enterprise RAG pure semantic recall collapses on industry nomenclature
aliases: [enterprise-rag-pure-semantic-fails-on-nomenclature, pure-semantic-rag-failure, bm25-mandatory-failure]
tags: [retrospective, enterprise-rag, pure-semantic, bm25, nomenclature, recall-failure, rag-triad]
category: engineer/lessons
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, ai-engineer, tech-lead]
benefit: "failure does not repeat"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

# Enterprise RAG pure semantic recall collapses on industry nomenclature

> **As an** engineer, **I want to** pure semantic rag failure, **so that** failure does not repeat.

> Enterprise RAG started with pure semantic vector search -> industry terms (product codes / regulation numbers / abbreviations / unit identifiers) recall < 50% -> customer loses trust -> renewal deadlock. This retrospective is the basis for [ADR Hybrid search mandatory](../../tech-lead/decisions/fde/enterprise-rag-hybrid-search-mandatory.md). 

## Summary

- **Symptom**: pure semantic RAG recall < 50%; customer business-side terms not hit -> lose trust -> renewal deadlock
- **Root cause**: embedding general model coverage of industry terms < 40%; pure semantic lacks keyword anchors
- **Root-cause chain**: 5-Why down to system layer (design choice wrong + template does not enforce hybrid) 
- **Action**: all enterprise RAG must enforce hybrid (semantic + BM25 + cross-encoder rerank) 
- **Reusable**: FDE Practice "enterprise RAG must be hybrid" template

## Core viewpoints

- **Pure semantic search is a general-domain solution applied to a domain-specific problem, and the mismatch is structural**: Embedding models are trained on general web text, where "product code XC-4400-B" has no semantic neighbors. In an enterprise context, exact term matching is not a fallback -- it is often the primary retrieval mechanism. Treating BM25 as optional is treating the customer's primary query pattern as an edge case.

- **The golden evaluation set is the contract between the engineering team and the customer's business users**: If the golden set contains zero industry-term queries, the evaluation will report 90% recall while the customer experiences 50% recall. The evaluation set must be co-designed with the business side, not derived solely from engineering's understanding of the domain.

- **RAG pipeline architecture decisions made during MVP week become technical debt that requires a full re-architecture to fix**: Starting with pure semantic as a "simple starting point" assumes that adding BM25 later is an incremental change. In practice, adding hybrid search requires re-indexing, re-ranking pipeline changes, and re-evaluation -- a Phase 2 project, not a sprint task. The initial architecture choice is effectively permanent for the first release cycle.

- **Customer trust in AI systems is binary, not continuous**: A system with 70% overall recall is not "70% trustworthy" -- it is untrustworthy. Users do not average their experiences; they remember the failures. When a business-side user searches for a regulation number and gets irrelevant results, they stop using the system entirely, not 30% of the time.

- **Cross-encoder reranking is not a luxury feature -- it is the last line of defense against embedding model blind spots**: Even with BM25 ensuring term-matched documents enter the candidate set, the final ranking determines what the user sees. A bi-encoder alone will rank a term-matched but semantically distant document above a truly relevant one. The cross-encoder reranker is the only component that reads the full query-document pair and makes a holistic relevance judgment.

## Key info

- **Enterprise RAG pure semantic failure metrics (FDE-RAG-001, P1 severity)**: Term query recall < 50% (product codes, regulation numbers, abbreviations, unit identifiers); overall recall ~70%; embedding general model coverage of industry terms < 40%; customer trust NPS dropped to -20; renewal deadlocked. Timeline: Week 0 — chose pure semantic as starting point; Week 4 — RAG MVP launch; Week 6 — customer business-side complained "terms not hit"; Week 8 — golden set test confirmed term recall < 50%; Week 12 — customer renewal deadlock.
- **5-Why root cause chain**: Why 1: Customer lost trust → term query recall < 50%. Why 2: Low recall → pure semantic vector search. Why 3: Pure semantic → embedding general model covers industry terms < 40%. Why 4: General model → selection did not test industry-term recall. Why 5: Not tested → FDE Practice RAG template does not enforce hybrid + selection must test. Root cause type: process missing (template does not enforce hybrid) + design choice wrong (pure semantic as starting point).
- **Hybrid search mandatory architecture (3-stage pipeline)**: Stage 1 — Semantic (bi-encoder embedding) + BM25 (keyword) parallel retrieval, each returning top-K candidates; Stage 2 — Fusion via Reciprocal Rank Fusion (RRF) to merge ranked lists from both paths; Stage 3 — Cross-encoder reranker (different model from bi-encoder) scores each query-document pair holistically for final ranking. Chunking strategy: BM25 works best with smaller overlapping chunks (128-256 tokens), semantic search with 512-token chunks — adding BM25 without re-chunking produces high-recall, low-precision results.
- **Golden evaluation set co-design requirements**: Must contain ≥30% industry-term queries (product codes, regulation numbers, unit identifiers) co-designed with customer's business users. An evaluation set derived solely from engineering's domain understanding will report 90% recall while customer experiences 50%. Evaluation metric must match UX: if user sees 3 results, measure recall@3, not recall@10. A recall@10 of 90% where the correct document is consistently at position 7 means the user experiences 0% recall.
- **Embedding model selection gate for enterprise RAG**: Run targeted recall benchmark on customer's actual terminology before selecting a model. General embedding models (trained on web text) cover < 40% of industry terms — product codes, regulation numbers, and abbreviations have no semantic neighbors in general-domain training data. Do not select a model based on general benchmarks (MTEB, BEIR) alone; industry-term recall must be a mandatory selection criterion.
- **Yi-family RAG architecture (2026-08)**: YiVad RAG system uses hybrid retrieval (semantic + BM25) with cross-encoder reranking, targeting faithfulness > 0.9 and context recall > 0.8. The hybrid architecture was adopted from the start, avoiding the pure-semantic failure mode. The FDE Practice "enterprise RAG must be hybrid" template is documented for external customer deployments. Golden evaluation set for YiVad includes industry-term queries from the BRD domain.

## 1. Basic info

| Field | Content |
|---|---|
| Incident ID | FDE-RAG-001 |
| Title | Enterprise RAG pure semantic recall collapses on industry nomenclature |
| Severity | P1 |
| Date | 2026-08-05 (retrospective)  |
| Reporter | FDE Practice Lead |
| Related project | FDE Playbook (multi-customer retrospective)  |
| Related ADR | [ADR Hybrid search mandatory](../../tech-lead/decisions/fde/enterprise-rag-hybrid-search-mandatory.md) |

## 2. Impact scope

| dimension | impact |
|---|---|
| Recall rate | term query < 50%; overall 70% |
| Customer trust | business-side terms not hit -> lose trust |
| Renewal rate | renewal deadlock |
| FDE Practice reputation | "RAG untrustworthy" tag |

## 3. Incident timeline

| time | event | operator | source |
|---|---|---|---|
| Week 0 | chose pure semantic as starting point | FDE | selection record |
| Week 4 | RAG MVP launch | FDE | SOW |
| Week 6 | customer business-side complained "terms not hit" | customer business-side | ticket |
| Week 8 | golden set test: term recall < 50% | FDE | eval report |
| Week 12 | customer renewal deadlock | CTO | renewal meeting |

## 4. Root-cause chain (5-Why) 

| Why level | symptom | direct cause |
|---|---|---|
| Why 1 | customer lost trust | term query recall < 50% |
| Why 2 | low recall | pure semantic vector search |
| Why 3 | pure semantic | embedding general model covers industry terms < 40% |
| Why 4 | general model | selection did not test industry-term recall |
| Why 5 | not tested | FDE Practice RAG template does not enforce hybrid + selection must test |

**Root-cause type** (multi-select) : 
- [x] process missing (template does not enforce hybrid + selection must test) 
- [x] design choice wrong (pure semantic as starting point) 
- [ ] code defect
- [ ] config error
- [ ] insufficient capacity
- [ ] monitoring missing
- [ ] third-party dependency
- [ ] human operation

## 5. Temporary and fundamental actions

| type | action | owner | due date | state |
|---|---|---|---|---|
| Temporary | existing customers add BM25 index + cross-encoder rerank | FDE Practice Lead | 2026-08-30 | todo |
| Fundamental | FDE Practice RAG template enforces hybrid | FDE Practice Lead | 2026-09-15 | todo |
| Fundamental | Embedding selection must test industry-term recall | FDE Practice Lead | 2026-09-30 | todo |
| Fundamental | golden set must contain >= 30% industry-term queries | FDE Practice Lead | 2026-09-30 | todo |

## 6. Action items

| no. | action item | type | owner | due date | acceptance method | state |
|---|---|---|---|---|---|---|
| 1 | existing customers add BM25 + cross-encoder | engineering | FDE Practice Lead | 2026-08-30 | recall >= 90% | todo |
| 2 | FDE Practice RAG template enforces hybrid | process | FDE Practice Lead | 2026-09-15 | template launch | todo |
| 3 | Embedding selection must test industry-term recall | process | FDE Practice Lead | 2026-09-30 | selection SOP launch | todo |
| 4 | golden set must contain >= 30% term queries | process | FDE Practice Lead | 2026-09-30 | SOP launch | todo |
| 5 | Groundedness measurement (Pointwise RAG triad) must run | process | FDE Practice Lead | 2026-09-15 | CI gate launch | todo |

## 7. Lessons learned

- Done well: MVP 30-day launch; UAT sign-off
- To improve: started with pure semantic; selection did not test terms; golden set did not contain terms
- Reusable: FDE Practice "enterprise RAG must be hybrid" template

## 8. Monitoring metrics regression

| metric | before incident | during incident | current | goal |
|---|---|---|---|---|
| Recall rate (term query)  | — | < 50% | — | >= 90% |
| Recall rate (overall)  | — | 70% | — | >= 92% |
| Groundedness | — | 0.8 | — | >= 0.95 |
| Customer trust (NPS)  | — | -20 | — | >= 30 |

## 9. Notification and archival

- Notification audience: CTO, customer business-side, customer CISO
- Notification date: 2026-08-10
- Archive path: `lessons/failures/enterprise-rag-pure-semantic-fails-on-nomenclature.md`
- Related ADR / TD: [ADR Hybrid search mandatory](../../tech-lead/decisions/fde/enterprise-rag-hybrid-search-mandatory.md)

## 10. Retrospective meeting meta

- Duration: 45 minutes
- Blameless: yes
- Follow-up action item completion rate: N/A (first time) 



- **Starting with pure semantic** — term recall < 50%; customer loses trust
- **Selection does not test terms** — general model coverage < 40%; production face-plant
- **golden set does not contain terms** — eval false positive; production face-plant
- **No cross-encoder rerank** — recall 85% but weak ranking; poor customer experience
- **Brute-force 512-token chunking** — tables split; term context lost

## Action recommendations

1. **Enforce hybrid search (semantic + BM25) as the default for all enterprise RAG deployments.** Pure semantic search fails on industry nomenclature (product codes, regulation numbers, abbreviations). Make BM25 mandatory in the FDE Practice RAG template, not optional. This applies to every new customer engagement starting from the discovery phase.

2. **Co-design the golden evaluation set with the customer's business users.** The golden set must contain at least 30% industry-term queries (product codes, regulation numbers, unit identifiers). An evaluation set derived solely from engineering's understanding of the domain will report 90% recall while the customer experiences 50%.

3. **Test embedding model recall on industry-specific terms before selecting a model.** General embedding models cover less than 40% of industry terms. Run a targeted recall benchmark on the customer's actual terminology as a gate in the model selection process. Do not select a model based on general benchmarks alone.

4. **Add cross-encoder reranking as a mandatory pipeline stage, not an optional enhancement.** Even with BM25 ensuring term-matched documents enter the candidate set, a bi-encoder alone will rank a term-matched but semantically distant document above a truly relevant one. The cross-encoder is the last line of defense against embedding model blind spots.

5. **Plan the RAG architecture for hybrid search from day one, even if MVP starts with pure semantic.** Adding BM25 and cross-encoder reranking after launch requires re-indexing and re-ranking pipeline changes -- a Phase 2 project, not a sprint task. The initial architecture choice is effectively permanent for the first release cycle, so budget for hybrid search in the initial SOW.

## Anti-patterns

- **Adding BM25 to the retrieval pipeline but still using the same chunking strategy that was designed for semantic search.** Semantic search works well with 512-token chunks because embeddings capture paragraph-level meaning. BM25 works well with smaller, overlapping chunks (128-256 tokens) because keyword matching is more precise when the search unit is smaller. Adding BM25 without re-chunking means BM25 matches a 512-token chunk that contains the keyword somewhere but is mostly irrelevant content, producing a high-recall, low-precision result.
- **Using a single embedding model for both the semantic search path and the cross-encoder reranker.** The bi-encoder (embedding model) and the cross-encoder serve different purposes: the bi-encoder is for fast candidate retrieval, the cross-encoder is for precise relevance scoring. Using the same model for both means the cross-encoder is scoring candidates with the same biases that selected them, and the reranker adds no new information. The cross-encoder must be a different model from the bi-encoder.
- **Building the golden evaluation set by sampling from the existing knowledge base rather than from actual user queries.** The knowledge base contains documents the engineering team wrote; the user queries are the questions the business side asks. These two distributions are not the same. A golden set sampled from the knowledge base will be dominated by queries that the knowledge base was designed to answer, while the user's actual queries will include the terms and questions the knowledge base was not designed for. The golden set must be built from real user query logs, not from the document corpus.
- **Measuring recall as "the relevant document is in the top-10 results" and then presenting only the top-3 results to the user.** A recall@10 of 90% means the correct document is in the top 10, but the user only sees the top 3. If the correct document is consistently at position 7, the user experiences 0% recall. The evaluation metric must match the UX: if the user sees 3 results, measure recall@3, not recall@10.
- **Deploying the hybrid search fix (BM25 + cross-encoder) without re-running the full evaluation set and comparing against the pre-fix baseline.** The fix is a change to the retrieval pipeline, and any pipeline change can introduce regressions on query types that were previously working. A semantic query that previously returned the correct document at position 1 may now return it at position 5 because BM25 noise pushed it down. The post-fix evaluation must include a per-query comparison showing which queries improved, which regressed, and by how much.

## Related

- Same class: [./fde-day-two-without-internal-owner.md](failure-fde-day-two-without-internal-owner.md) — FDE retrospective class
- Upstream: [Enterprise RAG Blueprint](../../ai-engineer/methodology/blueprint-an-enterprise-rag.md) §hybrid search
- Design basis: [ADR Hybrid search mandatory](../../tech-lead/decisions/fde/enterprise-rag-hybrid-search-mandatory.md)
- Trigger trap: [Discovery skipped Three Whys](gotcha-discovery-three-whys-skipped.md)
