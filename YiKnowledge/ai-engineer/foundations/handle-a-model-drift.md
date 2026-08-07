---
title: Handle a model drift
aliases:
- I want to handle a model drift
- model-drift-journey
- drift-journey
- model drift entry
tags:
- journeys
- model-drift
- llm
- monitoring
- retraining
- evaluation
category: ai-engineer/foundations
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../platform/evaluate-an-llm-app.md
- ../methodology/finetune-a-model.md
- ../../oncall-sre/observability/set-up-observability.md
- ../../ai-engineer/methodology/llm-evaluation-methods.md
review_cycle: quarterly
tacit: false
---

# I want to handle a model drift

> **As a** an ai engineer, **I want to** handle a model drift, **so that** incident is contained. 

> "Baseline + monitoring + drift detection + root cause + rollback / retrain + evaluation + retrospective" 2-hop reach covers AI-specific + process + thinking + case studies.

## Summary

- Evaluation: [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) + [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md)
- Monitoring: [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md)
- Retraining: [i-want-to-finetune-a-model.md](../methodology/finetune-a-model.md) + [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)

## Core viewpoints

**Model drift is not a bug -- it is the expected behavior of any system that depends on a moving target.** The underlying LLM provider updates their model, user behavior changes, the data distribution shifts, and the evaluation criteria evolve. Drift is the steady state, not the exception. The engineering challenge is not to prevent drift but to detect it before users do, quantify its impact, and have a rollback or fallback path that can be activated in minutes.

**The most dangerous drift is the one that improves aggregate metrics while degrading specific subgroups.** A model update might improve the average accuracy by 2% while reducing accuracy on rare queries, non-English languages, or specific user segments by 20%. The aggregate metric hides the subgroup degradation. This is the "mean field trap" of drift monitoring: if you only look at averages, you miss the failures that matter most to specific users. Drift detection must be stratified by user segment, query type, language, and other relevant dimensions.

**Provider-side drift is invisible by design -- the provider does not tell you when they change the model.** API providers update their models silently, and the only signal is the change in your application's behavior. This is the "silent upgrade" problem: the model you are calling today may not be the same model you called yesterday, even if the API endpoint is identical. The defense is to pin model versions (when the provider supports it) and maintain a continuous evaluation pipeline that compares production output against a golden evaluation set.

**The root cause of drift is rarely the model -- it is usually the data or the prompt.** When output quality degrades, the first instinct is to blame the model. But the model is the most stable component in the system. The input distribution changes (users ask different questions), the retrieval quality changes (new documents are added to the knowledge base), or the prompt effectiveness changes (the model's interpretation of prompt instructions shifts). The diagnostic process should start from the edges (data, prompt) and work inward (model) -- not the reverse.

**Drift detection is a statistical process, not a threshold rule.** Setting a single threshold (e.g., "alert when accuracy drops below 90%") is brittle because the baseline accuracy has natural variance. The correct approach is to establish a baseline distribution of evaluation metrics over time and detect deviations from the distribution using statistical process control. This requires running the evaluation set on a regular cadence (daily or weekly) and tracking the metric's mean and variance, not just its current value.

## Key info

- **Drift type taxonomy (4 types with detection methods)**: (1) Data drift — the input distribution changes (users ask different questions, new topics emerge); detected by monitoring embedding distribution of input queries (KL divergence or Wasserstein distance vs. baseline), typically the most common drift type; (2) Concept drift — the relationship between input and desired output changes (what constitutes a "good" answer evolves); detected by monitoring evaluation metrics against a golden dataset; (3) Upstream/provider drift — the LLM provider silently updates the model; detected by monitoring evaluation metrics and output distribution changes; (4) Prompt drift — the model's interpretation of prompt instructions shifts (even without prompt changes); detected by monitoring format compliance and output structure. The Yi-family projects are most exposed to types 1 and 3 (data drift as user queries evolve, provider drift as LLM APIs update silently).
- **Drift detection statistical framework**: Establish a baseline by running the evaluation set N times (N ≥ 30) to compute the mean (μ) and standard deviation (σ) of each metric. Alert when a metric deviates beyond μ ± 3σ (3-sigma rule, corresponding to p < 0.003 for a normal distribution). For metrics with high variance, use an exponentially weighted moving average (EWMA) with a smoothing factor of 0.2-0.3. The evaluation cadence determines detection latency: daily evaluation = 1-2 day detection window, weekly evaluation = 1-2 week detection window. The Yi-family standard: daily evaluation for production systems, weekly for development.
- **Drift response hierarchy (cheapest to most expensive)**: (1) Prompt tuning — adjust system prompt to compensate for the drift, cost: hours, reversible in seconds; (2) Few-shot example adjustment — update in-context examples, cost: hours, reversible in seconds; (3) RAG retrieval tuning — adjust retrieval parameters (top_k, similarity threshold, hybrid weights), cost: hours, reversible in seconds; (4) Model routing — switch to a different provider or model version, cost: hours, reversible in seconds; (5) Fine-tuning — train on new data, cost: days to weeks, partially reversible; (6) Full retraining — train from scratch, cost: weeks to months, not reversible. Always exhaust tiers 1-4 before considering tiers 5-6. The Yi-family projects use tier 1-4 responses; tiers 5-6 are not yet needed.
- **Stratified drift monitoring (6 dimensions)**: (1) Query type — factoid vs. reasoning vs. generation vs. classification; (2) Language — Chinese vs. English vs. multilingual; (3) Topic/domain — after-sales vs. finance vs. HR vs. general; (4) Query length — short (< 50 tokens) vs. medium vs. long (> 500 tokens); (5) User segment — new users vs. returning users vs. power users; (6) Time — business hours vs. off-hours vs. weekends. A 2% improvement in aggregate accuracy that masks a 20% degradation on non-English queries is a net negative. The Yi-family BRD evaluation is stratified by business domain and language (Chinese/English bilingual).
- **Rollback mechanism design for model drift**: The rollback must be testable in < 5 minutes. Requirements: (1) Previous model version/weights available and loaded (or API endpoint pinned); (2) Routing configuration that can switch traffic in < 1 minute; (3) Evaluation that confirms the rollback restored baseline metrics; (4) Rollback drill run within the last 30 days. The rollback mechanism for API-based models (provider switch) is simpler than for self-hosted models (model weight loading). The Yi-family multi-provider routing architecture (OpenAI/Anthropic/Google/Ollama) enables provider-level rollback by switching the routing table.
- **Yi-family drift monitoring state (2026-08)**: YiAi RAG — no drift detection in production; eval set (100 examples) run weekly but not compared against a statistical baseline; no alerting on metric degradation. YiAi BRD Agent — LLM-as-judge evaluation run per PR, but no production drift monitoring. YiVad/Pet aiChat — online metrics only (thumbs up/down, regeneration rate), no offline evaluation. Gap: no project has statistical drift detection with baselines and alerting. The immediate action is to establish baselines for the existing eval sets and set up weekly evaluation with 3-sigma alerting.

## Scenario

When handling model drift / performance degradation / data drift / concept drift / rising hallucination rates / declining user feedback / retraining triggers / post-launch degradation, AI engineering + algorithm + platform + business owners need to look up AI-specific + process + thinking + case studies. This entry aggregates model-drift-related AI-specific + process + thinking content into 2-hop paths, avoiding "post-launch degradation without monitoring / late drift detection / retrain without playbook / outdated evaluation set / cannot rollback / lose user stream".

## 2-hop reachability paths

| Hop 1 (class/leaf)  | Hop 2 (specific file)  |
|---|---|
| `methodology/ai-specific/` | [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — drift root cause · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think degradation consequences · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — retrain chain reaction · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `tech/ai-foundations/` | [transformer-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [long-context-summary.md](../../ai-engineer/foundations/long-context-techniques.md) · [moe-summary.md](../../ai-engineer/foundations/moe-architecture.md) · [rlhf-dpo-summary.md](../../ai-engineer/foundations/rlhf-dpo-alignment.md) · [multimodal-summary.md](../../ai-engineer/foundations/multimodal-fusion.md) · [kv-cache-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) |
| `work/processes/` | [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) |
| `product/metrics/` | [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) — drift business metrics |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux/ai-product-ux-patterns.md) — user-perceived drift |
| `lessons/wins/` | [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) · [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) |
| `lessons/gotchas/` | [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [bugs/](../../engineer/lessons) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `industry/competitors/` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) — provider drift |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — drift reporting |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — drift quarterly audit |
| `projects/YiAi/` | `adr-multi-provider-llm-routing.md` · `adr-llm-multi-provider-rollout.md` · `adr-brd-agent-launch.md` · `adr-rag-evaluation-infra.md` |
| `journeys/` | [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) · [../methodology/finetune-a-model.md](../methodology/finetune-a-model.md) · [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) · [../../engineer/quality-security/troubleshoot-a-regression.md](../../engineer/quality-security/troubleshoot-a-regression.md) |

## Action recommendations

1. **First principles**: First ask "what type of drift is this (data / concept / upstream provider / prompt / evaluation set) / what happens if not handled / ROI"; do not directly retrain; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First think "what will the drift cause (lost user stream / hallucination incident / compliance violation / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: Retrain once → evaluation set drifts → drift again; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest fix that restores stability wins (prompt tuning > RAG > few-shot > fine-tune > retrain); see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Baseline**: Before launch, must build baseline + evaluation set + business metrics + user satisfaction; no baseline means no comparison; see [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md). 
6. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md); must monitor latency / throughput / hallucination rate / user feedback / business metrics. 
7. **Drift types**: data drift (input distribution change) / concept drift (input→output relationship change) / upstream drift (provider upgrade / calling convention change) / evaluation drift (evaluation set outdated). 
8. **Detection**: Must detect in layers (input distribution / output distribution / evaluation metrics / business metrics / user feedback); each layer has different thresholds. 
9. **Alerting**: Must run [i-want-to-set-up-observability.md](../../oncall-sre/observability/set-up-observability.md); thresholds + alerts + reporting. 
10. **Root cause**: Must run 5 whys; do not directly retrain; first check prompt / RAG / data / provider / user behavior. 
11. **Rollback**: Must be able to switch back to the old model / fallback provider / self-hosted vLLM within seconds; see [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md). 
12. **Canary**: New model follows [canary-release-process.md](../../oncall-sre/release/canary-release.md); 1% → 25% → 100%. 
13. **Retrain decision**: Must run [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) + [i-want-to-finetune-a-model.md](../methodology/finetune-a-model.md). 
14. **Evaluation set**: Must update + must have human annotation + must align with business metrics; do not only look at automated metrics. 
15. **Hallucination**: Must run [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md); drift is often accompanied by rising hallucination. 
16. **Provider drift**: Must monitor [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) + provider upgrade reports; see [i-want-to-manage-a-vendor-relationship.md](../../engineer/engineering/manage-a-vendor-relationship.md). 
17. **User feedback**: Must run [i-want-to-handle-customer-feedback.md](../../engineer/process/handle-customer-feedback.md); user perception precedes metrics. 
18. **Freeze window**: During peak promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not switch models. 
19. **Retrospective**: After a drift incident, run [i-want-to-write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) retrospective + archive under [lessons/failures/bugs/](../../engineer/lessons). 
20. **Quarterly audit**: Run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether baselines / evaluation sets / drift detection are still accurate. 
21. **ADR**: Drift remediation must produce an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **Flywheel**: monitoring → early detection → early fix → trust → more AI investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Anti-patterns

- **Retraining the model as the first response to drift.** Retraining is the most expensive and least reversible response to drift. Before retraining, exhaust the cheaper options: prompt tuning (adjust the system prompt to compensate for the drift), few-shot example adjustment (update the in-context examples), RAG retrieval tuning (adjust the retrieval parameters), and model routing (switch to a different provider or model version). Retraining should be reserved for cases where the drift is systematic and irreversible through lighter-weight interventions.

- **Evaluating drift only on automated metrics without human review.** Automated metrics (BLEU, ROUGE, LLM-as-judge scores) can drift independently of actual quality. A model update might produce answers that score higher on automated metrics but are less useful to users. Human review of a random sample of production outputs is the only reliable drift detection signal. The minimum viable monitoring setup is: automated evaluation on the full evaluation set daily, plus human review of 50-100 randomly sampled production outputs weekly.

- **Maintaining a static evaluation set that does not reflect the current production distribution.** The evaluation set must be updated to reflect the current distribution of user queries. If the evaluation set was created at launch and never updated, it will gradually lose relevance as user behavior evolves. The evaluation set is itself subject to drift -- the "evaluation drift" problem. The solution is to periodically sample from production queries, have them labeled, and add them to the evaluation set while retiring older examples.

- **Treating drift as a single metric rather than a multi-dimensional phenomenon.** Drift is not a yes/no condition. A model can drift on factuality but not on style, on long-form generation but not on short-form, on English but not on Chinese. The drift monitoring system must be multi-dimensional, with separate baselines and thresholds for each dimension. A model that passes all dimensions except one is not "not drifting" -- it is drifting on that dimension.

- **Deploying a model update without a rollback plan that has been tested in the last 30 days.** The rollback plan for a model update is not the same as the rollback plan for a code deployment. Model rollback requires: the previous model weights to be available and loaded, the API routing to be updated, and the evaluation to confirm that the rollback restored the baseline. If the rollback procedure has not been tested recently, it will fail when you need it most -- during an active drift incident.

## Related

- Same-class journey: [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) — LLM evaluation
- Same-class journey: [../methodology/finetune-a-model.md](../methodology/finetune-a-model.md) — fine-tuning
- Same-class journey: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — monitoring
- Same-class journey: [../../engineer/quality-security/troubleshoot-a-regression.md](../../engineer/quality-security/troubleshoot-a-regression.md) — performance degradation
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry
