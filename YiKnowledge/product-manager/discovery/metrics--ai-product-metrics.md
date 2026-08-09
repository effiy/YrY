---
title: AI Product Metrics
aliases:
- AI Product Metrics
- AI Metrics
- LLM Metrics
tags:
- metrics
- AI
- monitoring
- product
- RAGAS
- HELM
category: product-manager/discovery/metrics
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
- executive
benefit: PMs can make data-informed product decisions with clear metrics and frameworks
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./north-star-metric.md
- ./retention-and-churn.md
- ../ux/ai-product-ux-patterns.md
tacit: false
---

# AI Product Metrics

> **As a** product manager, **I want to** ai product metrics, **so that** product decision clear.

> AI product outputs are probabilistic, unpredictable, fabricable, and have cost — the metric system needs to add a quality layer, cost layer, experience layer, and safety layer.

## Summary

- AI metrics four layers: quality layer (hallucination / faithfulness), cost layer (token / TTFT), experience layer (acceptance / regeneration), safety layer (PII / injection)
- North star candidate: success tasks per user; guardrails: hallucination rate, PII leak rate, token cost
- Collection methods: automated eval (LLM-as-judge daily) + human labeling (weekly 50-100 samples) + online instrumentation + red team
- Computing overall hallucination rate without scenario breakdown is a common misuse — must split by user / scenario / language / model version

## Core viewpoints

- **AI product metrics are not a superset of traditional metrics — they are a different category.** Traditional product metrics assume deterministic behavior: if the user clicks X, Y happens. AI product metrics must account for probabilistic behavior: if the user asks X, the response may be correct, hallucinated, or refused. This means the metric system needs a quality layer that traditional products do not have. The PM who applies only traditional metrics (DAU, retention, NPS) to an AI product is flying blind.

- **The hallucination rate is the most dangerous metric because it is the hardest to measure accurately.** Automated hallucination detection (LLM-as-judge) has a false positive rate of 10-20% and a false negative rate that is unknown. A hallucination rate of 5% measured by automated tools may be 10% in reality, or 2%. The only reliable calibration is weekly human labeling of a random sample. Without human calibration, the hallucination rate is a number that creates false confidence.

- **Token cost is not an engineering metric — it is a product margin metric.** Every token consumed by the AI product is a cost that must be covered by the price the customer pays. A product that costs $0.50 per task in tokens and charges $10/month per user must ensure the average user runs fewer than 20 tasks per month. If power users run 50 tasks per month, the unit economics invert. Token cost must be monitored by user segment, not just by aggregate, because the distribution is typically power-law: 10% of users consume 60% of tokens.

- **User acceptance rate (thumbs up, copy, no regeneration) is the closest proxy for "is the AI product actually useful?"** DAU tells you people are using it; task success rate tells you the output is technically correct; acceptance rate tells you the output is useful in the user's context. A technically correct answer that the user does not accept (because it is too verbose, in the wrong tone, or missing context) is a failure. Acceptance rate captures the gap between "correct" and "useful."

- **AI product metrics degrade silently when the underlying model changes.** A model update from the provider can improve latency by 20% but increase hallucination rate by 5% in certain scenarios, and the PM may not notice for weeks unless scenario-segmented metrics are monitored. Unlike traditional software where behavior changes only when the team deploys code, AI product behavior can change without any team action. This requires continuous monitoring of all quality metrics, not just pre-release evaluation.


- Heavy AI use ≠ correct use — looking only at DAU masks task failure rate
- Cost must be computed — AI growth looks good but token economics can lose money; unit economics is the baseline
- Guardrails are red lines — PII leak rate and prompt injection hit rate must be 0
- Automated eval must be calibrated — LLM-as-judge has bias, sample human verification

## Key information

### concept breakdown: four-layer metric system

**quality layer**:

| Metric | Formula / definition | explanation |
|---|---|---|
| Hallucination rate | Answers containing hallucination / total answers | monitoring factual hallucination |
| Faithfulness | Proportion of answer derivable from context | RAG key |
| Answer relevance | Whether answer responds to query | answering off-target |
| Citation accuracy | Proportion of correct references | traceable |
| Tool selection accuracy | Proportion of correct tool selection | Agent |
| Tool argument accuracy | Parameter correctness rate | Agent |
| Task success rate | Proportion of completed tasks | end-to-end |
| Refusal accuracy | Proportion of refusals when should refuse | safety |
| False refusal | Proportion of refusals when should not refuse | experience |

**Cost layer**:

| Metric | Formula | explanation |
|---|---|---|
| Token cost per task | Total token cost / task count | unit task economics |
| Input / output token ratio | input / output token | reflects prompt design |
| Cache hit rate | hit rate | prefix cache |
| First-token latency (TTFT) | first byte latency | experience key |
| Per-output-token latency (TPOT) | per token latency | experience |
| Throughput | tokens/s/GPU | utilization |
| GPU utilization | actual occupancy | deployment optimization |

**Experience layer**:

| Metric | Formula | explanation |
|---|---|---|
| Acceptance rate | Proportion of answers user accepts | direct adoption |
| Regeneration rate | Regeneration proportion | dissatisfaction signal |
| Edit rate | Proportion of answers user edits | dissatisfaction |
| Copy rate | Proportion of answers user copies | satisfaction signal |
| First-success rate | Proportion completed successfully on first try | Activation |
| Sessions per user | Sessions per user | Engagement |
| D7 / W4 retention | 7-day / 4-week retention | long-term value |

**Safety layer (guardrails)**:

| Metric | Threshold |
|---|---|
| PII leak rate | 0 (red line) |
| Prompt injection hit rate | 0 (red line) |
| Sensitive word trigger rate | < 0.1% |
| Model output refusal rate | < 2% (avoid over-refusal) |
| Security audit pass rate | 100% |

### keyparameter: health thresholds

| Metric | Green | Yellow | Red |
|---|---|---|---|
| Faithfulness | ≥ 95% | 85-95% | < 85% |
| Hallucination rate | ≤ 5% | 5-10% | > 10% |
| Regeneration rate | ≤ 10% | 10-20% | > 20% |
| TTFT | < 2s | 2-5s | > 5s |
| TPOT | < 50ms | 50-100ms | > 100ms |
| Cache hit rate | > 50% | 30-50% | < 30% |
| Token cost / task | < budget | budget-1.5x | > 1.5x budget |

### concept breakdown: measurement tiers

| Tier | Metrics | decision scenario |
|---|---|---|
| Task tier | success rate, faithfulness | launch decision |
| Experience tier | acceptance, regeneration, retention | rollout decision |
| Cost tier | token cost / task, throughput | business viability |
| Safety tier | PII / injection | compliance red line |

### concept breakdown: collection methods

| Method | Suitable | Frequency |
|---|---|---|
| Automated eval | Full trace + LLM-as-judge | Daily |
| Human labeling | Sample 50-100 | Weekly |
| Online instrumentation | user behavior | Real-time |
| Survey | NPS, CSAT | Quarterly |
| Red team | Injection sample set | Quarterly |
| Monitoring alerts | exception rate, latency | Real-time |

### Applicable scenarios

- AI product launch decision
- Before/after comparison for model / prompt changes
- Business viability assessment

## Action recommendations

1. **Define north star**: success tasks per user (core value metric of AI products)
2. **Add guardrails**: hallucination rate ≤ 5%, PII leak rate 0, token cost < budget
3. **Split by scenario**: break down metrics by user / scenario / language / model version
4. **Automated eval + human sampling**: LLM-as-judge daily + human weekly 50-100 samples
5. **Monitoring alerts**: real-time alerts for exception rate, latency, sensitive words
6. **Red team quarterly**: injection sample set to test security
7. **Exception handling process**: alert → data validation → cohort split → attribution → decision → validation

## Anti-patterns

- **Evaluating AI product quality on a hand-curated test set that does not represent real user behavior.** The test set of 100 "representative" questions that the team curated will produce excellent metrics because the team unconsciously selected questions the model handles well. The real test is production traffic: 1,000 random user queries from the last week, evaluated for quality. The gap between the curated test set and the production sample is the gap between the team's perception of quality and actual quality.

- **Optimizing for latency at the expense of quality to hit a benchmark.** "Our TTFT (Time to First Token) is under 2 seconds" is only meaningful if the output is correct. Switching to a faster but less capable model to hit a latency target is trading quality for speed. The metric dashboard should show latency and quality side by side, and the team should be equally accountable for both. A fast wrong answer is worse than a slow correct answer.

- **Measuring regeneration rate without segmenting by cause.** A high regeneration rate could mean the model is producing poor outputs (quality problem) or that users are iterating to refine good outputs (exploration behavior). The metric alone cannot distinguish these cases. Regeneration must be paired with an analysis of whether the regenerated output was accepted, and whether the user's prompt changed significantly between attempts.

- **AI cost optimization that degrades the experience for the highest-value users.** Implementing aggressive caching, shorter context windows, and cheaper models for all users to reduce token costs will disproportionately impact power users who have complex queries, long conversations, and high expectations. Cost optimization should be segmented: premium users get the full model capability; free users get optimized performance. Applying uniform cost optimization is a tax on the users who generate the most value.

- **Treating the evaluation set as a static artifact.** The evaluation set that was created at launch reflects the user behavior of that moment. Six months later, users are asking different questions, using new features, and expecting different behavior. The evaluation set must be continuously updated with real user queries, including edge cases, failures, and new use cases. A static evaluation set produces metrics that are increasingly disconnected from reality.



## Related

- Same class: [north-star-metric-summary.md](./north-star-metric.md) — north-star metric (AI north star candidate: success tasks per user)
- Same class: [retention-and-churn-summary.md](./retention-and-churn.md) — retention metrics
- Downstream: [../ux/ai-product-ux-patterns.md](../ux/ai-product-ux-patterns.md) — UX patterns impact metrics
- References: RAGAS — https://docs.ragas.io; HELM — https://crfm.stanford.edu/helm; Lenny Rachitsky — *AI Product Metrics*
