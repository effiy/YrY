---
title: Evaluation-set driven development pattern
aliases: [evaluation-driven-development-pattern, eval-first-dev, ci-gate-eval, baseline-regression]
tags: [pattern, engineering patterns, evaluation set, baseline, CI-gate, regression threshold, quality gates]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "AI features are developed against a curated evaluation set, making quality measurable and regressions detectable"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./inline-citation-rag.md
  - ../../tech-lead/decisions/yiai--rag-evaluation-infra.md
  - ../../tech-lead/decisions/yiai--pytest-introduction.md
---

# Evaluation-set driven development pattern

> **As an** engineer, **I want to** evaluation driven development, **so that** pattern applied consistently.

> baseline + CI gate + regression threshold; do not let "recall / precision / consistency" rely on the naked eye; the evaluation set is the quality gate.

## Summary

- **Pattern**: Build an evaluation set (>= 50 samples, bilingual / multi-scenario / boundary cases) -> run baseline metrics (recall / precision / ragas 4 metrics / self-consistency / human labeling) -> CI gate runs evaluation + regression > threshold blocks merge -> gradual rollout + feedback into the evaluation set -> evaluation set keeps growing
- **Cross-project applicability**: YiAi RAG / YiAi BRD Agent / any LLM long-answer scenario
- **Landing**: [YiAi RAG evaluation ADR](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) + [pytest ADR §eval](../../tech-lead/decisions/yiai--pytest-introduction.md)
- **Alternative**: eyeball / intuition judgment (not applicable, reason in §not applicable)

## Core viewpoints

- **An evaluation set is not a test suite — it is a regression detector** — Unit tests assert that the code does what it was programmed to do; an evaluation set asserts that the system does what users expect. The difference is that unit tests are written by the same people who wrote the code (they know the expected output), while evaluation sets are curated from real user queries and edge cases (they represent the unknown). This is why evaluation sets must grow from user feedback, not from developer imagination.

- **The 50-sample threshold is not arbitrary — it is the minimum for statistical significance** — Below 50 samples, a single outlier can swing a metric by 2%+, making the regression threshold meaningless. At 50 samples, a 5% recall regression is detectable with reasonable confidence. The sample count is a function of the metric's variance, not a nice round number.

- **Bilingual evaluation sets are mandatory, not a nice-to-have** — An LLM that performs well on English queries may hallucinate on Chinese queries due to training data imbalance. A monolingual evaluation set gives a false sense of quality. The bilingual requirement is the cheapest way to catch language-specific regressions before they reach users.

- **The regression threshold must be non-zero** — Setting the threshold to 0 means every CI run that fluctuates by 0.1% blocks the pipeline. LLM evaluation metrics have inherent noise from non-deterministic sampling. A 5% threshold for recall and 3% for faithfulness tolerates noise while catching real regressions.

- **CI gate without block is a checkmark, not a gate** — A CI job that runs the evaluation and prints a report but does not block merge is a monitoring tool, not a quality gate. The regression must block merge for the evaluation set to enforce quality. Teams that run the evaluation but don't block merge will gradually ignore the report.

## Key info

- **Evaluation set composition**: minimum 50 samples, with: 40% common queries (happy path, high recall expected), 30% edge cases (boundary conditions, spelling errors, ambiguous queries), 20% adversarial (deliberately tricky, tests hallucination resistance), 10% out-of-scope (should trigger "I don't know" or refuse). The 50-sample minimum is a statistical requirement: below 50, a single sample represents 2%+ of the score, making regression detection unreliable. For bilingual systems, 50 samples per language, NOT 25+25.
- **Ragas metrics deep dive**: Faithfulness (claims in answer / claims grounded in context, 0-1, target >0.9, measures hallucination), Answer Relevancy (generated questions from answer vs original question, 0-1, target >0.85, measures whether the answer addresses the question), Context Precision (relevant retrieved docs / total retrieved docs, 0-1, target >0.85, measures retrieval quality), Context Recall (relevant retrieved docs / all relevant docs, 0-1, target >0.9, measures retrieval completeness). Faithfulness is the most important single metric because it directly measures hallucination.
- **CI gate configuration**: run evaluation on every PR that touches AI-related code (`src/domain/rag/`, `src/domain/ai/`, prompt files, embedding config). Check: (1) no metric drops >5% from baseline, (2) faithfulness >0.85 absolute, (3) answer relevancy >0.8 absolute. If any check fails, block merge with a report showing which metrics failed and on which samples. The baseline is the evaluation result from the last successful merge, stored as a JSON file in the repo.
- **Evaluation set maintenance**: the set grows by 5-10 samples per month, sourced from: (1) user-reported issues (the query that produced a bad answer), (2) new features (new query types that need coverage), (3) edge cases discovered during development. Each new sample must be human-annotated with the expected answer and ground-truth context. The cost: ~30 minutes per sample for annotation. The evaluation set should be reviewed quarterly to remove samples that are no longer relevant (deprecated features, changed domain).
- **Self-consistency evaluation**: ask the same question 3 times (with temperature >0) and check if the answers are semantically equivalent. A system that gives different answers to the same question has a consistency problem. Self-consistency score = number of semantically equivalent pairs / total pairs. Target >0.9. This metric catches non-deterministic behavior that faithfulness and relevancy miss.

## Problem

Pain points of not using this pattern (quantified):

- **Recall drift**: changing one pipeline = recall -8% not detected = post-launch user feedback
- **Manual verification non-reproducible**: same prompt gives different results at different times = cannot tell whether a change improved things
- **Prompt changes without basis**: prompt changes by intuition = sometimes good sometimes bad = regression
- **RAG / agent launch crash**: no baseline = cannot tell whether online metrics regressed = incident
- **No CI gate**: merge = launch = regressing PRs slip in = firefighting after the fact

## Pattern

### 1. Evaluation set

```yaml
# tests/eval/rag-eval-set.yaml
- id: rag-001
  query: "How to deploy YiAi?"
  expected_sources:
    - "YiKnowledge/engineer/projects/yiai/architecture.md"
  expected_answer_contains:
    - "FastAPI"
    - "StreamingResponse"
  scope:
    collection: "yiai-docs"
- id: rag-002
  query: "What is the RPC envelope field name?"
  # ... 50+ samples, bilingual / multi-scenario / boundary cases
```

Sample requirements:
- **>= 50 samples** (statistically significant)
- **Bilingual** (Chinese / English, prevent language bias)
- **Multi-scenario** (retrieval / reranking / reference / scope filtering / exception path)
- **Boundary cases** (empty query / super-long query / mixed languages / cross-domain)

### 2. Baseline metrics

```yaml
# tests/eval/baseline.yaml
metrics:
  recall_at_k: 0.85        # recall
  precision_at_k: 0.78     # precision
  ragas:
    faithfulness: 0.82     # whether the answer is faithful to sources
    answer_relevancy: 0.88 # whether the answer responds to the query
    context_precision: 0.80
    context_recall: 0.85
  self_consistency: 0.90   # consistency of results across multiple runs of the same query
regression_threshold:
  recall_at_k: 0.05        # block on regression > 5%
  faithfulness: 0.03      # block on regression > 3%
```

### 3. CI gate

```yaml
# .github/workflows/eval.yml
jobs:
  rag-eval:
    steps:
      - run: pytest tests/eval/ -k rag --eval-set=rag-eval-set.yaml
      - run: python scripts/eval-threshold.mjs --baseline baseline.yaml --max-regression 0.05
      - run: pytest tests/eval/ -k ragas --ragas-metrics
```

Regression > threshold = block merge.

### 4. Gradual rollout + feedback into the stream

```markdown
1. 1% gradual rollout -> monitor online metrics (click rate / satisfaction / feedback)
2. User feedback "answer does not match question" -> add to evaluation set
3. Evaluation set grows -> re-run baseline -> update thresholds
4. 10% -> 50% -> 100% traffic cut
```

### 5. Continuous growth of the evaluation set

- Online bad cases enter the evaluation set
- Add corresponding scenarios before launching new features
- Quarterly full re-run of baseline (prevent drift)

## Applicable / Not applicable

### Applicable

- LLM long-answer scenarios (RAG / chat / agent / code generation)
- Evaluation metrics quantifiable (recall / precision / faithfulness)
- CI can run (evaluation set < 1000 samples, runtime < 10 min)
- Long-term maintained projects (baseline needs continuous calibration)

### Not applicable

- Creative generation (metrics not quantifiable)
- Short answers (evaluation set benefit < cost)
- One-off demo (no long-term maintenance)
- Evaluation set runtime > 30 min (CI blocks, needs subset / offline run)

## Landing checklist

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Build evaluation set (>= 50 samples, bilingual / multi-scenario / boundary) | Backend `tests/eval/` | One-shot |
| 2 | Integrate ragas 4 metrics (faithfulness / answer_relevancy / context_precision / context_recall) | Backend eval | One-shot |
| 3 | Run baseline + thresholds (block on regression > 5% / 3%) | Backend eval | One-shot |
| 4 | CI: evaluation + threshold assertion + block merge | CI | One-shot |
| 5 | Subset / offline run (when evaluation set is large) | CI | Follows #4 |
| 6 | Gradual rollout + feedback into evaluation set | Launch + backend | Gradual |
| 7 | Quarterly full re-run of baseline (prevent drift) | Process | Cadence |



- **Eyeball / intuition judgment**: non-reproducible + non-comparable; must use evaluation set + baseline.
- **Evaluation set < 10 samples**: not statistically significant; must be >= 50.
- **Single-language evaluation set**: language bias; must be bilingual.
- **No boundary cases**: launch crashes; must include empty query / super-long / cross-domain / exception path.
- **Threshold = 0**: noise blocks; must tolerate noise (5% / 3%).
- **CI does not block**: regressing PRs slip in; must block on regression threshold.
- **Baseline never updated**: metric drift = thresholds become invalid; must re-run quarterly.
- **Online bad cases not fed back**: evaluation set stagnates = loses effectiveness; must feed bad cases -> evaluation set.
- **Non-random subset**: subset bias = thresholds deviate from full set; must sample randomly.

## Action recommendations

1. **Build an evaluation set of at least 50 bilingual (Chinese + English) samples for the RAG pipeline, covering retrieval, reranking, citation, scope filtering, and boundary cases, and add it to the CI pipeline as a blocking gate.** The 50-sample threshold is the minimum for statistical significance. Below 50 samples, a single outlier can swing a metric by 2%+, making the regression threshold meaningless. The evaluation set must be curated from real user queries and production edge cases, not from developer imagination.

2. **Set the regression threshold as a function of the baseline value and the metric's variance, not as a fixed number.** A 5% threshold when the baseline is 85% recall is reasonable (5.9% relative regression). A 5% threshold when the baseline is 50% is catastrophic (10% relative regression). The threshold should be calculated as `max(absolute_threshold, baseline * relative_factor)` where `relative_factor` is typically 0.05-0.10 for recall and 0.03-0.05 for faithfulness.

3. **Add a CI job that runs the full evaluation suite (retrieval metrics + ragas 4 metrics) and blocks merge if any metric regresses beyond its threshold.** A CI job that prints a report but does not block merge is a monitoring tool, not a quality gate. Teams that run the evaluation without blocking merge will gradually ignore the report. The CI gate must be a hard block: regression > threshold = merge rejected.

4. **Implement a feedback loop that captures user-reported bad cases (flagged answers, low satisfaction scores) and automatically adds them to the evaluation set within one sprint.** An evaluation set built once and never updated becomes stale within months. The feedback loop must be a process: user reports bad answer -> answer is reviewed -> if the answer is genuinely wrong, a new evaluation sample is created -> the evaluation set is re-run to establish a new baseline. This loop should be tracked as a sprint metric.

5. **Run a quarterly full re-baseline of the evaluation set, updating the baseline metrics and thresholds based on the current production performance.** Metrics drift over time as the underlying model, retrieval pipeline, and data change. A baseline established in Q1 may be irrelevant by Q3. The quarterly re-baseline must include: re-running all evaluation samples, recomputing baseline metrics, adjusting thresholds based on current variance, and documenting the changes in an evaluation report.

## Anti-patterns

- **Treating the evaluation set as a one-time build** — An evaluation set built once and never updated becomes stale within months. New features, new query patterns, and new edge cases are not covered. The evaluation set must grow from user feedback and production incidents to remain a valid quality gate.

- **Using only happy-path queries** — An evaluation set with only well-formed, in-domain queries gives a false sense of quality. Without boundary cases (empty queries, adversarial inputs, mixed-language queries, extremely long queries), the system is untested against the inputs that most commonly cause production failures.

- **Evaluating retrieval and generation separately** — Recall and precision measure retrieval quality; ragas metrics measure generation quality. Running only one set of metrics misses the interaction effect: a good retrieval with bad generation is still a bad user experience, and vice versa. Both must be evaluated in the same CI run.

- **Setting the regression threshold based on the current baseline** — A threshold of 5% when the baseline is 85% recall is reasonable; a threshold of 5% when the baseline is 50% is catastrophic (a 5% drop from 50% is a 10% relative regression). The threshold should be a function of the baseline value and the metric's variance.

- **CI gate that runs evaluation but does not block merge** — A CI job that prints a report but does not block merge is a monitoring tool, not a quality gate. Teams that run the evaluation but don't block merge will gradually ignore the report, and regressions will slip through unnoticed.

## Related

- Landing: [YiAi RAG evaluation ADR](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) — llama-datasets + ragas 4 metrics + 50 bilingual docs + CI gate
- Landing: [YiAi pytest ADR §eval](../../tech-lead/decisions/yiai--pytest-introduction.md) — `tests/{unit,integration,eval}` three catalogs
- Companion: [inline-citation-rag-pattern](./inline-citation-rag.md) — RAG pipeline + evaluation set co-built
- Reference: [llm-evaluation-methods-summary](../../ai-engineer/methodology/llm-evaluation-methods.md) — evaluation methodology
- Upstream: [./README.md](./) — engineering-patterns leaf entry
