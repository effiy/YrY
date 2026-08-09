---
title: Handle a cost overrun
aliases:
- i-want-to-handle-a-cost-overrun
- cost-overrun-journey
- budget-overrun-journey
- cost-overrun-entry
tags:
- journeys
- cost-overrun
- budget
- llm-cost
- finops
- cost-optimization
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/engineering/reduce-cost.md
- ../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-budget.md
- ../../tech-lead/roadmap/do-a-capacity-plan.md
- ../../oncall-sre/observability/capacity-and-cost.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to handle a cost overrun

> **As a** oncall sre, **I want to** handle a cost overrun, **so that** incident is contained. 

> "Locate + root cause + stop the bleeding + optimize + notify + revise budget + retrospective + quarterly audit" reachable within 2 hops across process + thinking + case studies.

## Summary

- Process: see [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) + [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md)
- Thinking: see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- Cost: see [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) + [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md)
- LLM cost: see [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) + [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) + [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md)

## Core viewpoints

**Cost overruns are incidents, not accounting problems.**
Treat a cost overrun with the same urgency as a production outage. The stop-the-bleeding-first principle applies: identify and shut down the cost source immediately, then investigate root cause. Waiting for the end of the billing cycle to "see where things land" is equivalent to watching a database fail and deciding to check the logs next week. The urgency should match the rate of cost increase.

**The root cause of a cost overrun is rarely the obvious one.**
A spike in LLM costs may be due to a prompt change that doubled token usage, not increased traffic. A storage cost spike may be due to a logging change that writes 10x more data, not a genuine increase in data volume. The five-whys analysis is essential: the first answer ("traffic increased") is usually wrong. The real answer is often a configuration change, a dependency upgrade, or a retry storm.

**The most dangerous cost overruns are the slow, gradual ones.**
A sudden 10x cost spike triggers alarms and gets immediate attention. A 5% monthly increase over 12 months compounds to 80% growth and goes unnoticed until the annual budget review. The monitoring system must track cost trends, not just cost thresholds. A 3-month continuous upward trend is a stronger signal than a single-day spike.

**Cost overrun communication must be proactive, not reactive.**
The CFO should never discover a cost overrun from the cloud bill. The moment the overrun is detected, the sponsor and finance team must be notified with: what is happening, what is being done to stop it, and when the next update will arrive. The communication should follow the same cadence as an incident: 30 minutes for first notification, then regular updates.

## Scenario

When cost overruns / monthly bills explode / LLM cost spikes / big-promo cost overruns / capacity overruns / budget alerts / CFO notifications / spending cuts / optimization push occur, platform + SRE + business owners + sponsors need to look up process + thinking + case studies. This entry aggregates cost-overrun-related process + thinking + case studies into 2-hop paths, avoiding "unclear locating / late stoppage / optimization collateral damage / delayed notification / unchanged budget / missing retrospective / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/processes/` | [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [tech-roadmap-review-process.md](../../engineer/process/tech-roadmap-review.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — essence of cost · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — inversion on overruns · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — optimization chain · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `methodology/engineering-patterns/` | [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) |
| `methodology/ai-specific/` | [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/data/` | [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/tools/` | [vllm-ollama-deployment.md](../../engineer/engineering/vllm-ollama-deployment.md) · [pi-agent-harness-evolution.md](../../engineer/engineering/pi-agent-harness-evolution.md) · [claude-code-tips.md](../../engineer/engineering/claude-code-tips.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — overrun notification |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) |
| `lessons/wins/` | [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) · [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) · [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) — overrun archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) — overrun notification draft · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) |
| `industry/` | [ai-industry-report.md](../../executive/industry/reports--ai-industry-report.md) · [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) — provider switch |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — overrun quarterly audit |
| `projects/YiAi/` | `adr-multi-provider-llm-routing.md` · `adr-llm-multi-provider-rollout.md` · `adr-rag-evaluation-infra.md` |
| `journeys/` | [../../engineer/engineering/reduce-cost.md](../../engineer/engineering/reduce-cost.md) · [../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-budget.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-budget.md) · [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) · [../../engineer/engineering/manage-a-vendor-relationship.md](../../engineer/engineering/manage-a-vendor-relationship.md) |

## Action recommendations

1. **First principles**: first ask "what type of cost (LLM token / storage / bandwidth / compute / license) / what happens if not solved / ROI"; do not cut for the sake of cutting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: first imagine "what happens on overrun (budget freeze / project stops / layoffs / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: cutting one place → ramifications on performance / availability / user experience; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam**: the simplest optimization that meets the budget wins; do not pile up tools; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **Locate**: first locate the overrun source (split the bill by service / by tenant / by provider / by scenario); do not gut-call. 
6. **Root cause**: run 5 whys; common root causes: traffic rise / model upgrade / cache invalidation / retry explosion / test traffic leakage / fallback to a more expensive provider. 
7. **Stop the bleeding**: stop the bleeding first (switch to cheaper provider / downgrade config / rate-limit / disable non-core); see [incident-response-process.md](../../engineer/process/incident-response.md). 
8. **Notify**: run [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) to notify sponsor + CFO; do not hide. 
9. **Monitoring**: run [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md); daily cost dashboard + threshold alerts + exception detection. 
10. **LLM cost**: run [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md); prompt tuning > RAG > few-shot > fine-tune > self-host. 
11. **Provider switch**: run [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) + [i-want-to-manage-a-vendor-relationship.md](../../engineer/engineering/manage-a-vendor-relationship.md); multi-provider route. 
12. **Cache**: run [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md); semantic cache + exact cache + KV cache reuse. 
13. **Batching**: batch + async + off-peak; do not do everything in real time. 
14. **Degradation**: run [i-want-to-set-up-feature-flags.md](../../engineer/infrastructure/set-up-feature-flags.md); degrade non-core features during overruns. 
15. **Regression**: after optimization run [i-want-to-evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) to verify quality has not regressed. 
16. **Revise budget**: run [i-want-to-prepare-a-budget.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-budget.md) + [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) to adjust the next quarter's budget. 
17. **Freeze period**: during overrun do not run [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) (special case: release the stop-the-bleeding fix). 
18. **Retrospective**: run [i-want-to-write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) retrospective + archive under [bugs/](../../engineer/lessons). 
19. **Quarterly audit**: run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md); scan whether the budget is still accurate + whether optimizations still apply. 
20. **ADR**: cost-optimization decisions must land as ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
21. **Flywheel**: overrun handled well → trust → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 

## Anti-patterns

- **Hiding the overrun hoping it will resolve itself.** Cost overruns do not self-correct. A runaway process, a misconfigured autoscaler, or a retry loop will continue consuming resources until someone intervenes. The instinct to "wait and see if it comes back down" is driven by the discomfort of admitting a mistake. The correct response is to notify stakeholders immediately, stop the bleeding, and investigate later. The reputational damage of a concealed overrun far exceeds the damage of an admitted one.

- **Applying blanket cost cuts without understanding the source.** When faced with a $50,000 overrun, the temptation is to cut everything: reduce instance sizes, downgrade databases, switch to cheaper providers. This is the cost equivalent of rebooting all servers during an outage. The correct approach is to identify the specific source of the overrun and address it surgically. Blanket cuts degrade the system for users who are not responsible for the overrun.

- **Optimizing LLM costs by switching to a smaller model without evaluating quality.** When the LLM bill spikes, the first instinct is to switch from a large model to a small model. This may reduce the bill by 50% and reduce the quality of responses by 90%. Every model switch must be evaluated on the same benchmarks and with the same user feedback loop as the original model. A cost optimization that destroys the product's value proposition is not an optimization.

- **Failing to set a cost anomaly budget.** If the budget is $100,000/month with no tolerance for overages, every month will feel like a crisis. Set a cost anomaly budget: a percentage of the total budget that is reserved for unexpected cost spikes. When the anomaly budget is consumed, it triggers an automatic review and potentially a budget revision. This turns cost overruns from a blame game into a predictable process.

- **Treating the overrun as a one-time event without updating the monitoring.** After the overrun is resolved, the team often moves on without updating the monitoring thresholds that should have caught it earlier. The postmortem must produce concrete monitoring improvements: new alerts, lower thresholds, anomaly detection on cost-per-unit metrics. If the same type of overrun can happen again without being detected earlier, the postmortem failed.

## Related

- similar journey: [../../engineer/engineering/reduce-cost.md](../../engineer/engineering/reduce-cost.md) — cost optimization
- similar journey: [../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-budget.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-budget.md) — budget
- similar journey: [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) — capacity planning
- similar journey: [../../engineer/engineering/manage-a-vendor-relationship.md](../../engineer/engineering/manage-a-vendor-relationship.md) — vendor
- upstream: [../../oncall-sre/observability/README.md](../../oncall-sre/observability/README.md) — infra leaf entry
