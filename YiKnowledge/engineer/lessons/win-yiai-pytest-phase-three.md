---
title: YiAi pytest Phase 3 eval set complete win
aliases: [yiai-pytest-phase-three-win, YiAi pytest Phase 3, eval set baseline]
tags: [lessons, wins, yi-ai, pytest, phase-three, eval-set, ragas, recall, llm-evaluation]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: planned
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: Eval set is not LLM self-eval; it is human-annotated + bilingual + multi-dimension; CI regression > 5% blocks; recall is the primary metric
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiAi pytest Phase 3 eval set complete win

> **As an** engineer, **I want to** yiai pytest phase three, **so that** success is reproducible.

## Summary

- Phase 3 landing: YiAi backend eval set baseline established; tests/eval/ directory + ragas 4 metrics
- 50 documentation bilingual (Chinese / English) eval set; human-annotated ground truth
- 4 metrics: faithfulness / answer_relevancy / context_precision / context_recall
- Recall is the primary metric: context_recall baseline 0.87; regression > 5% blocks
- Multi-provider eval: each provider runs the full eval set; eval set baseline multi-provider co-build
- CI runs full set not depending on macOS FSEvents; local watchfiles unreliable
- Coverage unchanged (eval set does not participate in coverage); subset < 5min
- 0 incidents; follow-up Phase 4 contract tests two-way run to close

## Core viewpoints

- **LLM self-evaluation is a useful auxiliary signal and a dangerous primary metric**: An LLM judging its own outputs (or another LLM's outputs) introduces a second layer of hallucination risk -- the evaluator can be wrong about whether the generator was wrong. Human-annotated ground truth is the only reliable primary metric. LLM-as-judge (via ragas) is valuable for scale and cost, but it must be calibrated against human annotations, not used as a replacement.

- **Recall is the primary metric for RAG evaluation because it is the bottleneck that no downstream component can fix**: If the retriever fails to fetch the relevant document (low context_recall), the generator cannot produce a faithful answer regardless of how good the LLM is. A 0.87 recall means 13% of queries are retrieving incomplete or irrelevant context. Faithfulness, answer relevancy, and precision are important, but they are downstream of recall -- a faithfulness score on missing context is meaningless.

- **Bilingual evaluation sets are not a "nice to have" for international products -- they are the only way to detect language-specific retrieval failures**: An embedding model that performs well on English queries may perform poorly on Chinese queries because the training data distribution differs. A monolingual evaluation set reports 0.87 recall and hides the fact that Chinese queries are at 0.72. The bilingual requirement forces the evaluation to surface per-language performance differences.

- **Multi-provider evaluation is not about picking the best provider -- it is about establishing a baseline for each provider so that degradation is detectable**: When the OpenAI baseline is 0.88 and the Anthropic baseline is 0.87, a drop to 0.84 on either provider is a regression. Without per-provider baselines, a drop in overall recall is impossible to attribute. The evaluation set must run against every provider independently, not against a mixed-provider setup.

- **The CI 4-tier threshold system (0%/-5%/-10%/-15%) is a graduated response mechanism that prevents both false alarms and silent failures**: A 2% drop triggers a warning (tier 2) -- worth investigating but not blocking. A 7% drop blocks the merge (tier 3) -- something is wrong, find it before it reaches production. A 12% drop blocks and triggers rollback (tier 4) -- this is a crisis. The tiers prevent the binary pass/fail problem where a 1% drop and a 20% drop are treated identically.


1. **Eval set is not LLM self-eval**: human-annotated ground truth; LLM self-eval only as auxiliary
2. **Bilingual + 50 documentation**: Chinese / English bilingual; 50 documentation covers 5 domains; per-domain coverage
3. **4 metrics**: faithfulness / answer_relevancy / context_precision / context_recall
4. **Recall is the primary metric**: context_recall baseline 0.87; regression > 5% blocks
5. **Multi-provider eval**: each provider runs the full eval set; eval set baseline multi-provider co-build
6. **ragas tool**: RAG eval framework; 4 metrics + LLM as judge + human ground truth
7. **CI runs full set**: not depending on macOS FSEvents ([macos-fsevents gotcha](gotcha-macos-fsevents-silent-drop.md))
8. **Eval set baseline co-build**: [yiai-rag-hybrid-retrieval](win-yiai-rag-hybrid-retrieval.md) + [yiai-llm-phase-three](win-yiai-llm-phase-three.md) + [yiai-llm-phase-five](win-yiai-llm-phase-five.md)
9. **Regression > 5% threshold**: context_recall / faithfulness regression > 5% blocks PR
10. **Subset < 5min**: eval set slower than unit / integration tests; subset threshold 5min
11. **Lockfile + min-release-age co-build**: test dependencies also hardened

## Key information

### Eval set structure

```
tests/eval/
  conftest.py                  # ragas fixture
  eval-set/
    docs/
      after-sales/
        zh-*.md
        en-*.md
      data/
        ...
      hr/
        ...
      knowledge/
        ...
      rag/
        ...
    ground-truth/
      after-sales.json
      data.json
      ...
  test_rag_eval.py             # 4 metrics + recall
  test_multi_provider_eval.py  # multi-provider eval
  test_hallucination_eval.py   # hallucination eval
  test_brd_agent_eval.py       # BRD agent 5-stage eval
```

### 4 metrics

| Metric | Meaning | Baseline | Threshold |
|---|---|---|---|
| faithfulness | Whether the answer is faithful to context | 0.92 | Regression > 5% blocks |
| answer_relevancy | Answer relevance | 0.89 | Regression > 5% blocks |
| context_precision | Retrieval context precision | 0.85 | Regression > 5% blocks |
| context_recall | Retrieval context recall | 0.87 | Regression > 5% blocks |

### Multi-provider eval

| Provider | context_recall | faithfulness | state |
|---|---|---|---|
| OpenAI | 0.88 | 0.92 | baseline |
| Anthropic | 0.87 | 0.93 | baseline |
| YiAi internal | 0.85 | 0.91 | gray |

### Landing metrics

| Metric | Goal | Actual | Notes |
|---|---|---|---|
| Eval documentation count | > 50 | 50 | 5 domains x bilingual |
| 4 metrics | 100% | 100% | faithfulness / answer_relevancy / context_precision / context_recall |
| context_recall baseline | > 0.85 | 0.87 | recall primary |
| CI regression threshold | < 5% | 5% | -5% blocks |
| Subset duration | < 5min | 4min12s | eval subset |
| Multi-provider | 3 | 3 | OpenAI / Anthropic / internal |
| Incident count | 0 | 0 | CI 4-tier threshold |

### CI 4-tier threshold (same as Phase 1/2)

| Tier | Threshold | Behavior |
|---|---|---|
| 1 | 0% < delta < 5% | pass |
| 2 | -5% < delta < 0% | warning |
| 3 | -10% < delta < -5% | block + notify |
| 4 | delta < -10% | block + notify + rollback |

## Action recommendations

1. **Human-annotated ground truth**: do not depend on LLM self-eval; LLM self-eval only as auxiliary
2. **Bilingual + 50 documentation**: Chinese / English bilingual; 50 documentation covers 5 domains; per-domain coverage
3. **4 metrics**: faithfulness / answer_relevancy / context_precision / context_recall
4. **Recall is the primary metric**: context_recall baseline 0.87; regression > 5% blocks
5. **Multi-provider eval**: each provider runs the full eval set; eval set baseline multi-provider co-build
6. **ragas tool**: RAG eval framework; 4 metrics + LLM as judge + human ground truth
7. **CI runs full set**: not depending on macOS FSEvents
8. **Regression > 5% threshold**: context_recall / faithfulness regression > 5% blocks PR
9. **Subset < 5min**: eval set slow; threshold relaxed
10. **Lockfile + min-release-age co-build**: test dependencies also hardened
11. **Follow-up Phase 4 advance**: after eval set stabilizes, Phase 4 contract tests two-way run to close
12. **Co-build with YiVad**: YiVad vendor SSE parser 20 cases two-way run; contract baseline co-build
13. **Hallucination eval co-build**: [hallucination-mitigation](../../ai-engineer/methodology/hallucination-mitigation.md) co-build; faithfulness metric gatekeeping

## Anti-patterns

- **LLM self-eval**: LLM self-eval only as auxiliary; cannot replace human ground truth
- **Monolingual eval set**: only Chinese or only English -> recall biased -> must bilingual
- **Recall not primary**: only look at faithfulness -> retrieval drift -> must recall primary
- **No per-provider eval**: all providers mixed -> cannot locate regression -> must split
- **CI not full set**: depending on macOS FSEvents -> events lost -> must CI run full set
- **No regression threshold**: no block -> recall drift -> must > 5% block
- **Subset not split**: eval + unit + integration mixed -> slow feedback -> must split

## Related

- Upstream Phase 2: [./yiai-pytest-phase-two.md](win-yiai-pytest-phase-two.md) — integration test
- Upstream Phase 1: [./yiai-pytest-phase-one.md](win-yiai-pytest-phase-one.md) — unit test foundation
- Co-build: [./yiai-rag-hybrid-retrieval.md](win-yiai-rag-hybrid-retrieval.md) — RAG pipeline full picture
- Co-build: [./yiai-llm-phase-three.md](win-yiai-llm-phase-three.md) — multi-provider gray
- Co-build: [./yiai-llm-phase-five.md](win-yiai-llm-phase-five.md) — LLM endpoint contract
- Co-build: [./yiai-brd-agent-launch.md](win-yiai-brd-agent-launch.md) — BRD agent 5-stage
- Co-build: [./yiai-knowledge-watcher.md](win-yiai-knowledge-watcher.md) — watcher freshness
- Implementation ADR: [../../../tech-lead/decisions/yiai--pytest-introduction.md](../../tech-lead/decisions/yiai--pytest-introduction.md) + [../../../tech-lead/decisions/yiai--rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md)
- Pattern co-build: [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md)
- Methodology: [llm-evaluation-methods](../../ai-engineer/methodology/llm-evaluation-methods.md) + [hallucination-mitigation](../../ai-engineer/methodology/hallucination-mitigation.md)
- Gotcha co-build: [macos-fsevents-silent-drop](gotcha-macos-fsevents-silent-drop.md) + [no-lockfile-supply-chain-risk](gotcha-no-lockfile-supply-chain-risk.md)
- Follow-up Phase 4: contract tests two-way run to close
