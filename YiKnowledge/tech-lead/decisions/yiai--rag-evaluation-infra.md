---
title: ADR — YiAi RAG Evaluation Infrastructure
aliases: [adr-rag-evaluation-infra, yi-ai-rag-eval-adr, ragas-eval-adr]
tags: [adr, yi-ai, rag, evaluation, ragas, llama-datasets, architecture-decision]
category: tech-lead/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
source: internal
type: adr
status: draft
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiAi RAG evaluation infrastructure decision is documented, enabling reproducible quality measurement"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ../../../engineer/projects/yiai/architecture.md
  - ./route-llm-traffic-across-providers.md
  - ./pytest-introduction.md
  - ../../../ai-engineer/platform/llama-index-evolution.md
  - ../../../ai-engineer/methodology/rag-design-patterns.md
  - ../../../ai-engineer/methodology/llm-evaluation-methods.md
  - ../../../product-manager/delivery/retrospective.md
  - ../../../product-manager/delivery/weekly-report.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiAi RAG Evaluation Infrastructure

> **As a** tech lead, **I want to** rag evaluation infra, **so that** decision documented and reversible. 

> Decision: YiAi introduces `llama-datasets` format + ragas-style metrics (faithfulness / answer_relevancy / context_precision / context_recall) + 50 bilingual evaluation docs + CI recall regression > 5% blocking. This lands the [weekly risk radar](../../../product-manager/delivery/weekly-report.md) "YiAi RAG evaluation missing, recall not quantifiable" and [llama_index evolution](../../../ai-engineer/platform/llama-index-evolution.md) §action recommendation #2. Co-builds `tests/eval/` with [ADR multi-provider](./route-llm-traffic-across-providers.md) #5 + [ADR pytest](./pytest-introduction.md) #5. 

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Rag-Evaluation-Infrastructure |
| Title | YiAi RAG evaluation infra: llama-datasets + ragas-style metrics |
| State | Accepted |
| Date | 2026-08-03 |
| Decision makers | YiAi main owner + architecture team |
| Reviewers | CTO, QA, BRD business stakeholders |
| Related project | YiAi |
| Related PR/Issue | To be opened (YiAi `feat(eval): ragas metrics + bilingual eval set + CI gate`)  |
| Supersedes | — |
| Superseded by | — |
| Review trigger | Quarterly review / signals: recall regression > 5% / `llama_index` minor upgrade / `ragas` breaking change / before multi-provider switch |

## 2. Background (Context) 

- **Current state**: YiAi `domain/rag/engine.py` uses `QueryFusionRetriever` hybrid retrieval + optional `LLMRerank` + inline citation, but recall / answer faithfulness / context precision are all unquantifiable ([llama_index evolution §YiAi current state](../../../ai-engineer/platform/llama-index-evolution.md)). 
- **Pain points quantified**: 
  - RAG parameter tuning (`similarity_top_k` / `sparse_top_k` / rerank on-off) all subjective, no A/B basis. 
  - Multi-provider LLM switch must have baseline first ([ADR multi-provider §risk #2](./route-llm-traffic-across-providers.md)). 
  - llama_index minor upgrade easily causes recall regression ([llama_index evolution §anti-patterns](../../../ai-engineer/platform/llama-index-evolution.md)). 
- **Trigger event**: Weekly risk radar "YiAi RAG evaluation missing, introduce `llama-datasets` + `ragas` in next 2 weeks" + [ADR multi-provider #5](./route-llm-traffic-across-providers.md) eval set precondition depends on. 
- **External constraints**: `ragas` 0.1+ stable; `llama-datasets` provides RAG evaluation dataset format; both Python-native; YiAi already has `llama_index` + `pytest` depends on. 

## 3. Decision (Decision) 

YiAi chooses `llama-datasets` format for eval set + `ragas`-style metrics calculation + CI recall regression > 5% blocking. 50 bilingual evaluation docs cover BRD / after-sales / engineering documentation three domains. 

Landing checklist: 

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | `pyproject.toml` devDeps: `ragas` + `llama-datasets` + `datasets` | YiAi root | One-time |
| 2 | `tests/eval/rag/` directory: 50 bilingual eval docs (BRD 20 / after-sales 20 / engineering 10)  | YiAi test | Progressive, first 10 docs baseline |
| 3 | `tests/eval/rag/expected_answers.yaml`: per doc 1 ground-truth answer + 3 key fact points | YiAi test | Follow #2 |
| 4 | `tests/eval/rag/metrics.py`: 4 metric calculations (faithfulness / answer_relevancy / context_precision / context_recall)  | YiAi test | One-time |
| 5 | `tests/eval/rag/test_rag_regression.py`: pytest integration, run 50 docs → 4 metrics → diff against baseline | YiAi test | Follow #4 |
| 6 | CI `pytest tests/eval/rag/ --metrics-gate` + recall regression > 5% blocking | GitHub Actions | Follow #5 |
| 7 | `tests/eval/rag/baseline.json`: first run produces baseline (git tracked)  | YiAi test | One-time, regression threshold |
| 8 | CLAUDE.md "Eval" section adds "run `pytest tests/eval/rag/`" + metrics explanation | documentation | One-time |

## 4. Options Considered 

| Option | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. `llama-datasets` + `ragas` | Industry standard RAG eval combo | Mature ecosystem; 4 authoritative metrics; synergy with llama_index; Python-native | `ragas` depends on LLM calls, eval cost non-trivial | ✅ Selected |
| B. `deepEval` | Another RAG eval framework | Concise API | Smaller ecosystem than ragas; metrics less standard | ❌ |
| C. Self-built metrics | Hand-written recall / faithfulness | Full control | Reinventing wheel; non-comparable externally; high maintenance cost | ❌ |
| D. Manual eval only | Business stakeholders subjective scoring | Grounded | Non-repeatable; not CI-able; small sample | ❌ (only as final gate before multi-provider switch)  |

## 5. Evaluation dimensions

| Dimension | A. ragas | B. deepEval | C. Self-built | D. Manual |
|---|---|---|---|---|
| Metric authority | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Ecosystem maturity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | — |
| Python isomorphism | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | — |
| CI automation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| Eval cost (LLM calls)  | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Synergy with llama_index | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | — |

## 6. Risks 

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| `ragas` eval LLM call cost high | High | Medium | Eval set limited to 50 docs; CI runs baseline-only mode; weekly full eval |
| `ragas` metric fluctuation | Medium | High | Metrics averaged over 3 runs; > 2% fluctuation triggers review; non-blocking alert |
| Eval set ground-truth subjective bias | Medium | Medium | Business review + key fact points not whole-answer; quarterly review ground-truth |
| Baseline and CI env mismatch | Low | High | CI env pin `ragas` / `llama_index` / `ollama` versions; baseline and CI same env |
| Recall regression > 5% frequently blocks PRs | High | Medium | First month alert not blocking; enable gate after eval stabilizes; adjustable threshold |
| Multi-provider switch breaks baseline | Medium | High | Re-run baseline before multi-provider switch; different providers don't share baseline |

## 7. Rollback Plan 

| Trigger | Rollback action | Owner | Estimated recovery time |
|---|---|---|---|
| Recall regression > 5% blocks key upgrade | Temporarily disable gate + run regression + review baseline | YiAi main owner | 30 min |
| `ragas` eval cost over budget | Shrink eval set to 20 docs + weekly run | YiAi main owner | 15 min |
| `ragas` breaking change | Pin version + evaluate option C (self-built)  | Architecture team | 1 work day |
| Baseline and CI result mismatch | Re-run baseline + reset env | YiAi main owner | 1 h |

> Rollback must be executable within 1 h; eval infra rollback does not impact production deploy. 

## 8. Implementation Plan

| Phase | Content | Completion date | Owner |
|---|---|---|---|
| Phase 1 | `pyproject.toml` + `metrics.py` + 10 docs baseline (#1 #4 #7)  | 2026-08-08 | YiAi main owner |
| Phase 2 | 50 bilingual eval docs + ground-truth (#2 #3)  | 2026-08-15 | YiAi main owner + BRD business stakeholders |
| Phase 3 | pytest integration + CI gate (#5 #6)  | 2026-08-18 | YiAi main owner + QA |
| Phase 4 | Re-run baseline before multi-provider switch (same cadence as [ADR multi-provider](./route-llm-traffic-across-providers.md))  | 2026-08-19 | YiAi main owner |
| Phase 5 | Quarterly review ground-truth + metric fluctuation | 2026-09-01 | Architecture team + business stakeholders |

## 9. Follow-up Tracking Metrics

| Metric | Pre-launch | Goal | Actual |
|---|---|---|---|
| Eval set doc count | 0 | 50 (BRD 20 / after-sales 20 / engineering 10)  | — |
| Recall (context_recall)  | Unquantifiable | baseline + regression ≤ 5% | — |
| Answer faithfulness (faithfulness)  | Unquantifiable | baseline + regression ≤ 5% | — |
| Answer relevance (answer_relevancy)  | Unquantifiable | baseline + regression ≤ 5% | — |
| Context precision (context_precision)  | Unquantifiable | baseline + regression ≤ 5% | — |
| Single eval LLM call cost | 0 | ≤ $2 USD/full run (limit 50 docs)  | — |
| Eval run duration | 0 | ≤ 10 min/full | — |

## 10. Coupling with other ADRs

- **[ADR multi-provider LLM route](./route-llm-traffic-across-providers.md) #5**: `tests/eval/` co-build; before multi-provider switch must run this ADR's baseline first, recall regression > 5% blocks switch. 
- **[ADR pytest introduction](./pytest-introduction.md) #5**: `tests/eval/` directory structure shared; pytest integration tests and eval tests share conftest fixture. 
- **[llama_index evolution §action recommendation #2](../../../ai-engineer/platform/llama-index-evolution.md)**: This ADR is the landing implementation of that recommendation. 
- **[YiAi architecture overview](../../../engineer/projects/yiai/architecture.md)**: Eval infra coverage of `domain/rag/engine.py`. 

## 11. References

- [YiAi architecture overview](../../../engineer/projects/yiai/architecture.md) — RAG module boundary
- [ADR multi-provider LLM route](./route-llm-traffic-across-providers.md) — precondition for multi-provider switch
- [ADR pytest introduction](./pytest-introduction.md) — `tests/eval/` co-build
- [llama_index evolution tracking](../../../ai-engineer/platform/llama-index-evolution.md) — action recommendation #2 source
- [RAG design patterns](../../../ai-engineer/methodology/rag-design-patterns.md)
- [LLM evaluation methods](../../../ai-engineer/methodology/llm-evaluation-methods.md) — metric definition reference
- [ADR template](../../../knowledge-curator/templates/adr.md)
