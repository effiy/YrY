---
title: Build an eval harness
aliases:
- I want to build an evaluation system
- eval-harness-journey
- golden-set-journey
- Evaluation framework entry
tags:
- journeys
- eval-harness
- golden-set
- autoeval
- regression
- llm-evaluation
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
- ../../ai-engineer/platform/evaluate-an-llm-app.md
- ../strategies/prepare-a-test-strategy.md
- ../../ai-engineer/foundations/handle-a-model-drift.md
- ../../ai-engineer/methodology/llm-evaluation-methods.md
review_cycle: quarterly
tacit: false
---

# I want to build an eval harness

> **As an** engineer, **I want to** build an eval harness, **so that** system is reproducible.

> "Golden set + batch runs + scoring + regression + threshold + reports + Monitoring + Retrospective" reachable within 2 hops across AI-specific + Pattern + Case study.

## Summary

- Evaluation goes through [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) + [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md)
- Patterns go through [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [inline-citation-rag-pattern.md](../engineering/inline-citation-rag.md)
- Case study goes through [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) + [yiai-llm-phase-{two,three,four,five}-win.md](../lessons) + [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md)
- Monitoring goes through [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) + [monitoring-governance-process.md](../process/monitoring-governance.md)

## Core viewpoints

**An eval harness without a golden set is a weather vane, not a compass.** Automatic metrics (ROUGE, BLEU, BERTScore) give you numbers, but only a human-annotated golden set tells you whether the numbers mean anything. The golden set must cover positive cases, boundary cases, exception cases, safety cases, and business-critical scenarios. A golden set of 10 cherry-picked examples is a vanity metric.

**LLM-as-judge is a tool, not a replacement for human judgment.** LLM-as-judge can scale evaluation beyond what humans can annotate, but it introduces its own biases (position bias, verbosity bias, self-preference). Every LLM-as-judge pipeline must be calibrated against human scores on the same golden set, and the correlation must be measured and monitored.

**Eval sets drift over time, and the drift itself must be measured.** The distribution of real user queries changes as the product evolves, new features launch, and user behavior shifts. A golden set that was representative six months ago may no longer match production. Quarterly audits of the golden set against production distributions are the only way to catch eval drift before it becomes a blind spot.

**The best eval harness is the one that runs on every PR.** An eval harness that runs nightly but not on PRs will catch regressions a day late. A fast eval suite (under 10 minutes) in CI that blocks merges on threshold violations is the difference between catching a regression before it ships and catching it after users complain.

## Key info

- **Golden set construction methodology (5 categories, minimum 50 examples)**: (1) Positive cases (40%) — well-formed, answerable queries that the system should handle correctly; (2) Boundary cases (20%) — queries at the edge of the system's capability (very long, very short, mixed languages); (3) Exception cases (15%) — queries designed to trigger failures (out-of-scope, malformed, contradictory); (4) Safety cases (10%) — adversarial queries (prompt injection, jailbreak, PII extraction); (5) Business-critical scenarios (15%) — queries that map to the top 5 user jobs-to-be-done. Each example must have: query, expected output/reference, acceptable tolerance, and category tag. A golden set of 10 cherry-picked examples is a vanity metric. The YiAi RAG evaluation uses a 50-document bilingual (zh+en) golden set hand-curated from YiKnowledge markdown files.
- **Evaluation metric stack (4 layers, do not rely on any single layer)**: (1) Automatic metrics — ROUGE (n-gram overlap), BLEU (translation quality), BERTScore (semantic similarity via embeddings), pass@k (code generation); fast but correlate poorly with human judgment for open-ended generation; (2) ragas metrics (RAG-specific) — faithfulness (is answer grounded in context? 0-1), answer relevancy (does answer address question? 0-1), context precision (are retrieved docs relevant? 0-1), context recall (are all relevant docs retrieved? 0-1); (3) LLM-as-judge — LLM scores output on custom rubrics (accuracy, completeness, tone); must be calibrated against human scores on the same golden set, correlation must be ≥ 0.8; watch for position bias (prefers first answer), verbosity bias (prefers longer answers), self-preference bias (prefers own model's output); (4) Human evaluation — manual scoring on a sample of outputs, used to calibrate LLM-as-judge and validate automatic metrics. The YiAi CI gate: if any ragas metric falls below 0.85 or drops > 5% from baseline, block merge.
- **CI integration pipeline for eval (3 tiers by speed)**: (1) Fast suite (< 10 min) — runs on every PR, covers 20% of golden set (stratified sample), blocks merge on threshold violations; (2) Full suite (~1 hour) — runs nightly, covers 100% of golden set, generates trend report and diff from baseline; (3) Stress suite (~4 hours) — runs weekly, covers adversarial/safety cases, multi-language, and edge cases. The fast suite is the gate; the full suite is the monitoring; the stress suite is the audit. Thresholds must be derived from baseline measurement, not gut feel — measure current system performance on the golden set, set threshold at baseline minus acceptable regression margin (typically 3-5%).
- **Eval set drift management protocol**: The distribution of real user queries changes as the product evolves, new features launch, and user behavior shifts. Quarterly audit process: (1) Sample 100 recent production queries; (2) Compare distribution (query length, topic, language, difficulty) against golden set; (3) If distribution shift > 20% (KL divergence), flag golden set for update; (4) Every production incident, user complaint, and model update feeds new examples into the golden set. A static golden set is a test suite that tests yesterday's product. The eval set itself drifts, and the drift must be measured.
- **Dual-world evaluation for provider/model migration**: When switching LLM providers or model versions, run both old and new systems on the same golden set in parallel (dual-world boundary pattern). Compare: (1) Per-example diff — which examples improved, which regressed, by how much; (2) Aggregate metrics — did overall faithfulness/accuracy improve? (3) Cost-latency trade-off — is the improvement worth the cost? (4) Safety regression — did the new model introduce new failure modes? The dual-world run must complete before the migration cutover; a regression > 5% on any metric blocks the migration.
- **Yi-family eval harness state (2026-08)**: YiAi RAG evaluation — 50-document bilingual golden set, ragas 4 metrics (faithfulness, answer relevancy, context precision, context recall), CI gate with > 5% fallback blocking merge. YiVad aiChat — thumbs up/down feedback loop as lightweight human evaluation. YiPet — no formal eval harness. Gap: no LLM-as-judge calibration, no fast CI suite (< 10 min), no quarterly golden set drift audit. The eval harness framework is partially implemented for YiAi RAG; full CI integration and LLM-as-judge are documented for when the system scales.

## Scenario description

When building an evaluation system / golden set / autoeval / LLM-as-judge / evaluation regression / evaluation threshold + alert / evaluation reports / choosing a model rather than evaluating, AI engineering + Platform + algorithm + business owners need to look up AI-specific + Pattern + Case study. This entry aggregates evaluation-system-related Pattern + Case study + AI-specific into a 2-hop path, avoiding "missing eval set / eval drift / threshold gut call / regression without alert / provider escalation without regression / model choice without evaluation."

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/ai-specific/` | [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [inline-citation-rag-pattern.md](../engineering/inline-citation-rag.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — purpose of evaluation · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert to find missing evaluations · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [ai-workbench-comparison-summary.md](./../../ai-engineer/platform/ai-workbench-user-guide.md) · [llama-index-evolution-summary.md](../../ai-engineer/platform/llama-index-evolution.md) |
| `tech/ai-foundations/` | [transformer-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [long-context-summary.md](../../ai-engineer/foundations/long-context-techniques.md) · [moe-summary.md](../../ai-engineer/foundations/moe-architecture.md) · [rlhf-dpo-summary.md](../../ai-engineer/foundations/rlhf-dpo-alignment.md) · [multimodal-summary.md](../../ai-engineer/foundations/multimodal-fusion.md) · [kv-cache-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) |
| `work/processes/` | [monitoring-governance-process.md](../process/monitoring-governance.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [code-review-process.md](../../ai-engineer/methodology/prompts/code-review.md) · [data-compliance-process.md](../infrastructure/data-compliance.md) |
| `product/metrics/` | [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux/ai-product-ux-patterns.md) — user-perceived evaluation |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) · [multilingual-translation-prompt.md](../../ai-engineer/methodology/prompts/multilingual-translation.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../lessons) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) — evaluation gap archive |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `work/tools/` | [claude-code-tips.md](../engineering/claude-code-tips.md) · [pi-agent-harness-evolution.md](../engineering/pi-agent-harness-evolution.md) · [vllm-ollama-deployment.md](../engineering/vllm-ollama-deployment.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `industry/competitors/` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) — provider evaluation comparison |
| `projects/YiAi/` | `adr-rag-evaluation-infra.md` · `adr-multi-provider-llm-routing.md` · `adr-llm-multi-provider-rollout.md` · `adr-brd-agent-launch.md` |
| `journeys/` | [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) · [../strategies/prepare-a-test-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-test-strategy.md) · [../../ai-engineer/foundations/handle-a-model-drift.md](../../ai-engineer/foundations/handle-a-model-drift.md) · [../../ai-engineer/methodology/finetune-a-model.md](../../ai-engineer/methodology/finetune-a-model.md) |

## Action recommendations

1. **First principles**: first ask "what does evaluation need to protect (user value / regression / provider comparison) / what happens if not evaluated / ROI"; don't evaluate for evaluation's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "what happens if evaluation is missing (launch rollback / model incident / user loss / compliance violation)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: eval sets themselves drift → eval drift → one-shot drift; go through [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest evaluation that satisfies the protection requirement wins; don't pile up LLM-as-judge; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Golden set**: must build golden + must manually annotate + must cover positive / boundary / exception / safety / business scenarios.
6. **Metric layer**: automatic metrics (ROUGE / BLEU / BERTScore / pass@k) + LLM-as-judge + manual scoring + business metrics; don't only look at automatic.
7. **LLM-as-judge**: must calibrate + must fix prompt + must cross-score with humans + must guard against position bias.
8. **Regression**: must run every PR + must compare baseline + must diff report + must threshold alert; go through [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md).
9. **Dual world**: on migration / provider switch must run [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) dual-run + diff.
10. **Provider evaluation**: must run [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) + same golden cross-provider run + compare.
11. **RAG evaluation**: must run [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) + recall / precision / citation hit / hallucination rate.
12. **Agent evaluation**: must run [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) + tool-call success rate / multi-step success rate.
13. **Hallucination**: must run [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md); must check citation consistency.
14. **Safety**: must run [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md); red team + jailbreak set.
15. **Threshold**: must be based on baseline + must align with business + must tier alerts (pass / warn / fail).
16. **Reports**: must have dashboard + must trend + must diff + must archive; go through [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md).
17. **CI**: evaluation must go into [i-want-to-set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md); must run before PR + must be fast (<10min) + full nightly.
18. **Monitoring**: post-launch must run [monitoring-governance-process.md](../process/monitoring-governance.md) to monitor production metrics + user feedback + business metrics.
19. **Data desensitization**: eval set must go through [data-compliance-process.md](../infrastructure/data-compliance.md) + must desensitize + must audit access.
20. **Retrospective**: evaluation gaps must run [i-want-to-write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) retrospective + add to golden + archive [bugs/](../lessons).
21. **Quarterly audit**: go through [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan golden for whether it still represents production distribution.
22. **ADR**: evaluation architecture must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: evaluation → early discovery → early fix → trust → more AI investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Anti-patterns

- **Using only automatic metrics (ROUGE, BLEU, BERTScore) without human evaluation.** Automatic metrics correlate poorly with human judgment for open-ended generation tasks. A system can improve its BLEU score while producing worse answers. The golden set with human annotations is the ground truth; automatic metrics are a proxy that must be validated against it.

- **Golden set that does not evolve.** A golden set created at launch and never updated will miss new features, new user behaviors, and new failure modes. Every production incident, every user complaint, and every model update should feed new examples into the golden set. A static golden set is a test suite that tests yesterday's product.

- **No CI integration.** An eval harness that runs manually or on a schedule but not in CI will be skipped when engineers are in a hurry. The eval must be a gate in the PR pipeline: if the regression exceeds the threshold, the merge is blocked. CI integration is what turns evaluation from a research activity into an engineering practice.

- **Thresholds set by gut feel rather than baseline measurement.** Setting a pass/fail threshold at 80% without measuring the current baseline is arbitrary. The threshold should be derived from the current system's performance on the golden set, with a small margin for acceptable regression. A threshold set without baseline data is a random number.

- **Evaluating only the happy path.** A golden set that contains only well-formed, answerable queries will report 95% accuracy while the system fails on 50% of real user queries. The golden set must include adversarial queries, ambiguous queries, out-of-scope queries, and queries in multiple languages. If the eval set does not make the system uncomfortable, it is not representative.

## Related

- Related journey: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — LLM evaluation
- Related journey: [../strategies/prepare-a-test-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-test-strategy.md) — QA strategy
- Related journey: [../../ai-engineer/foundations/handle-a-model-drift.md](../../ai-engineer/foundations/handle-a-model-drift.md) — model drift
- Related journey: [../../ai-engineer/methodology/finetune-a-model.md](../../ai-engineer/methodology/finetune-a-model.md) — fine-tuning
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — AI-specific leaf entry
