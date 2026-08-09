---
title: Evaluate an LLM app
aliases:
- I want to assess an LLM application
- llm-eval-journey
- rag-eval-journey
- LLM assessment entry
tags:
- journeys
- llm-evaluation
- rag-eval
- faithfulness
- hallucination
- eval-driven
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
benefit: findings are actionable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/projects/build-a-rag-pipeline.md
- ../../engineer/engineering/track-tech-foundations.md
- ../../ai-engineer/methodology/README.md
review_cycle: quarterly
tacit: false
---

# I want to evaluate an LLM app

> **As a** an ai engineer, **I want to** evaluate an llm app, **so that** findings are actionable.

> Reach "LLM application assessment / RAG assessment / recall + faithfulness + latency + cost + security" within 2 hops across assessment methods + eval-driven dev + hallucination mitigation + injection defense + observability.

## Summary

- Assessment methods: [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md): HELM / MT-Bench / self-built eval set
- Eval-driven dev: [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md)
- Hallucination: [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md)
- Security: [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md)
- Observability: [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md)

## Core viewpoints

**Evaluation is not a phase -- it is the development process.** The traditional software development lifecycle treats evaluation as a final gate before release. For LLM applications, evaluation must be embedded in every step: prompt design (evaluation set guides prompt iteration), model selection (evaluation set determines which model to use), deployment (evaluation set gates the release), and monitoring (evaluation set detects drift). An LLM application without an evaluation set is not a product -- it is an experiment.

**The evaluation set is the single most valuable artifact in an LLM project, and it should be treated with the same rigor as production code.** The evaluation set is versioned, reviewed, and updated on a regular cadence. Every change to the evaluation set is peer-reviewed to ensure that it represents the production distribution, not the developer's intuition. The evaluation set is the team's shared understanding of what "good" means, and it is the only objective measure of whether the application is improving or degrading.

**LLM-as-judge is not a replacement for human evaluation -- it is a scaling mechanism for human evaluation.** The LLM judge is biased (position bias, length bias, self-preference), inconsistent (scores vary between runs), and limited (cannot evaluate subjective qualities like "helpfulness" or "tone"). The correct approach is to use LLM-as-judge for scale (thousands of evaluations per day) and human evaluation for calibration (hundreds of evaluations per week). The human evaluations calibrate the LLM judge, and the LLM judge scales the human judgments.

**The evaluation set must be adversarial -- it must contain examples designed to break the current system, not just representative examples.** A representative evaluation set measures average performance, which is necessary but not sufficient. An adversarial evaluation set measures worst-case performance, which is what users remember. The adversarial set should include: edge cases, ambiguous queries, contradictory information, out-of-domain queries, and known failure modes from previous iterations. The system's score on the adversarial set is the more honest metric.

**Online evaluation is more truthful than offline evaluation, but offline evaluation is the only pre-deployment signal.** Offline evaluation on a static dataset cannot capture the full distribution of user behavior, the interaction between components in a live system, or the latency and cost characteristics of production. But online evaluation (A/B testing, user feedback) requires a live deployment, which means you have already exposed users to the system. The two must work together: offline evaluation gates the deployment, online evaluation validates the deployment.

## Key info

- **LLM evaluation method comparison**: (1) Human evaluation — gold standard, measures subjective qualities (helpfulness, tone, creativity), but expensive ($10-50 per evaluation), slow (hours to days), and inconsistent (inter-rater reliability typically 0.6-0.8); (2) LLM-as-judge — scalable (thousands per day), fast (seconds), but biased (position bias, length bias, self-preference), requires calibration with human evaluations; (3) Automated metrics (BLEU, ROUGE, BERTScore) — instant, free, but only measure surface-level similarity (n-gram overlap, embedding similarity), cannot assess factual correctness or reasoning quality; (4) ragas framework — specialized for RAG, measures faithfulness (is the answer grounded in retrieved context), relevance (is the retrieved context relevant to the query), precision (are retrieved documents relevant), recall (are all relevant documents retrieved). The Yi-family projects use ragas for RAG evaluation and LLM-as-judge for BRD quality evaluation.
- **Eval set construction methodology**: (1) Size — minimum 50 examples for initial development, 200-500 for production deployment, 1000+ for high-stakes applications; (2) Composition — 40% representative (typical user queries), 30% edge cases (unusual but valid queries), 20% adversarial (queries designed to break the system), 10% regression (previously failed queries); (3) Labeling — each example must have a ground-truth answer or evaluation rubric, labeled by at least 2 human annotators with inter-annotator agreement >0.7; (4) Versioning — eval set is versioned in git alongside the code, each version documents what was added/removed and why; (5) Review cadence — eval set is reviewed monthly, stale examples are removed, new failure modes are added. The Yi-family BRD eval set contains 50 bilingual examples; the RAG eval set contains 100 examples.
- **LLM-as-judge calibration process**: (1) Select 50-100 examples that span the full range of quality (bad to excellent); (2) Have 2-3 human annotators score each example independently; (3) Calculate inter-annotator agreement (Cohen's kappa or Krippendorff's alpha, target >0.7); (4) Have the LLM judge score the same examples; (5) Calculate correlation between LLM judge scores and human scores (Pearson or Spearman, target >0.8); (6) If correlation is below target, adjust the LLM judge's prompt (add examples, clarify criteria, add position bias mitigation); (7) Re-calibrate monthly or whenever the underlying model changes. The Yi-family projects use LLM-as-judge for BRD quality, calibrated against PM evaluations.
- **RAG evaluation dimensions (ragas 4 + 2)**: (1) Faithfulness — are all claims in the answer supported by the retrieved context? Score 0-1, target >0.9; (2) Answer Relevance — is the answer relevant to the question? Score 0-1, target >0.85; (3) Context Precision — are the retrieved documents relevant to the question? Score 0-1, target >0.8; (4) Context Recall — are all relevant documents retrieved? Score 0-1, target >0.8; (5) Answer Correctness — is the answer factually correct? Score 0-1, target >0.85; (6) Aspect Critique — domain-specific evaluation (e.g., for BRD: completeness, actionability, risk coverage). The Yi-family RAG system targets faithfulness >0.9 and context recall >0.8.
- **Online evaluation metrics**: (1) User satisfaction — thumbs up/down ratio, target >80% thumbs up; (2) Task completion rate — percentage of sessions where the user achieved their goal, measured by explicit feedback or implicit signals (no follow-up clarification needed); (3) Regeneration rate — percentage of responses the user regenerates, high regeneration rate (>20%) indicates poor quality; (4) Edit rate — percentage of AI-generated content the user edits before using, high edit rate (>30%) indicates the output is not directly usable; (5) Abandonment rate — percentage of sessions where the user leaves without completing the task. The Yi-family projects track thumbs up/down and regeneration rate for aiChat.
- **Yi-family LLM evaluation infrastructure**: YiAi RAG — ragas 4-metric framework, eval set 100 examples, run weekly, CI blocks on faithfulness drop >5%. YiAi BRD Agent — LLM-as-judge (Claude evaluates BRD quality on completeness, actionability, risk coverage), eval set 50 bilingual examples, run per PR, CI blocks on quality drop >10%. YiVad/Pet aiChat — online metrics only (thumbs up/down, regeneration rate), no offline eval set (responses are evaluated by YiAi server-side). Gap: no prediction drift detection in production.

## Scenario description

When assessing RAG recall / assessing LLM answer quality / assessing Agent tool calls / selecting a model / rolling out a model gradually / post-launch monitoring, PM + algorithm + engineer need to look up assessment methods + eval set + hallucination mitigation + injection defense + observability. This entry aggregates LLM assessment 7-item leaves, eval-driven pattern, AI product metrics, and RAG implementation wins into a 2-hop path, avoiding "only looking at manual demos / questions exposed only after launch / model selection by intuition".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/ai-specific/` | [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) |
| `product/metrics/` | [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) — AI business metrics |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) — assessment-phase cost |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-llm-phase-two-win.md](../../engineer/lessons/win-yiai-llm-phase-two.md) · [yiai-llm-phase-three-win.md](../../engineer/lessons/win-yiai-llm-phase-three.md) · [yiai-llm-phase-four-win.md](../../engineer/lessons/win-yiai-llm-phase-four.md) · [yiai-llm-phase-five-win.md](../../engineer/lessons/win-yiai-llm-phase-five.md) · [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) — assessment-driven implementation |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) — prompt assessment samples |
| `projects/YiAi/` | Each `adr-rag-*` / `adr-llm-*` / `adr-brd-*` / `adr-knowledge-*` — assessment-related architecture decisions |

## Action recommendations

1. **Build eval set**: Start with 100-500 manual annotations (positive + negative + hard cases + edge cases), covering core scenarios; see [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md).
2. **Dimension selection**: RAG checks recall + faithfulness + reference accuracy; LLM checks correctness + fluency + security; Agent checks tool selection + parameter fill + task completion rate.
3. **Auto vs manual**: auto (LLM-as-judge + rule) runs full volume; manual sample-inspects 5-10% to calibrate auto results.
4. **Baseline**: Every prompt / model / retrieval change must run full-volume evaluation, compared against baseline; do not release if not meeting the bar.
5. **Gradual rollout**: A/B traffic split + eval set + online metrics, three-pronged; see [canary-release-process.md](../../oncall-sre/release/canary-release.md).
6. **Hallucination**: retrieval grounding + reference enforcement + self-consistency check + secondary validation; see [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md).
7. **Injection**: input side (system prompt hardening / pattern validation / allow-deny list) + output side (structured output / secondary review / refusal); see [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md).
8. **Observability**: Launch must monitor recall rate / faithfulness / error rate / latency P95 / per-call cost / user reuse rate; see [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md).
9. **Regression**: Every model upgrade / data update / prompt change must run regression eval set, avoiding "fix one, break three".

## Anti-patterns

- **Evaluating an LLM application by manually testing a few examples and declaring it "good enough."** This is the most common and most dangerous anti-pattern in LLM development. Manual testing of 5-10 examples is not evaluation -- it is confirmation bias. The developer selects examples that they expect the model to handle and interprets ambiguous outputs favorably. The minimum viable evaluation is 50-200 labeled examples across core scenarios, edge cases, and known failure modes, evaluated systematically on every change.

- **Building an evaluation set that only contains "happy path" examples.** An evaluation set of 100 straightforward queries will report 95% accuracy while the system fails on 30% of real user queries. The evaluation set must include the distribution of queries that users actually ask, including ambiguous, malformed, out-of-domain, and adversarial queries. The accuracy on the "hard" subset of the evaluation set is the more honest metric.

- **Using LLM-as-judge without position bias mitigation.** The LLM judge systematically prefers the first answer in a pairwise comparison, regardless of quality. Without position swapping (evaluating each pair twice, with the order reversed), the position bias can dominate the evaluation signal. The minimum mitigation is: run each pairwise comparison twice with swapped positions, and only accept the result if the judgments are consistent.

- **Evaluating only the LLM's output quality without measuring latency, cost, and reliability.** An LLM application that produces perfect answers but takes 30 seconds and costs $5 per query is not a viable product. The evaluation must include: P95 latency, per-query cost, and success rate (proportion of queries that complete without errors). These operational metrics are as important as the quality metrics.

- **Deploying an LLM application without setting up online evaluation before launch.** The offline evaluation set tells you how the system performs on the data you have. It does not tell you how the system performs on the data you will get. Online evaluation (user feedback, implicit signals, A/B testing) must be set up before launch, not after. If you cannot measure the system's quality in production, you cannot improve it.

## Related

- Related journey: [../../engineer/projects/build-a-rag-pipeline.md](../../engineer/projects/build-a-rag-pipeline.md) — RAG implementation foundation
- Related journey: [../../engineer/engineering/track-tech-foundations.md](../../engineer/engineering/track-tech-foundations.md) — model selection
- Related journey: [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) — AI business metrics
- Related journey: [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) — LLM application release
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry
