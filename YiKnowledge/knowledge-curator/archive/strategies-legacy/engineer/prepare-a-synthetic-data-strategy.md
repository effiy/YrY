---

title: I want to prepare a synthetic data strategy
aliases:
- Synthetic data strategy
- synthetic-data-journey
- synthetic data entry
tags:
- journeys
- synthetic-data
- data-augmentation
- privacy
- llm-data
- data-generation
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-data-labeling-strategy.md
- ./prepare-a-data-governance-strategy.md
- ./prepare-a-data-modeling-strategy.md
- ./prepare-a-model-fine-tuning-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a synthetic data strategy

> **As an** engineer, **I want to** prepare a synthetic data, **so that** launch is safe.

> Reach process + thinking + cases within 2 hops across "generation + privacy + evaluation + governance + quarterly audit".

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing synthetic data / generation / privacy / evaluation / governance / launch freeze / quarterly audit / retrospective, TL + data + algorithm + platform + sponsor need to look up process + thinking + cases. This entry aggregates synthetic-data-related process + thinking + cases into a 2-hop path, avoiding "scattered generation / missed privacy / drift / messy closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of synthesis · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | synthetic-data · data-augmentation · privacy-preservation · llm-distillation |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | data-generator · evals-platform · model-registry |
| `tech/ai-foundations/` | data-synthesis · privacy-patterns · llm-distillation |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — synthesis comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — data matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — synthesis failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — synthetic business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §synthesis |
| `journeys/` | [./prepare-a-data-labeling-strategy.md](./prepare-a-data-labeling-strategy.md) · [./prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md) · [./prepare-a-data-modeling-strategy.md](./prepare-a-data-modeling-strategy.md) · [./prepare-a-model-fine-tuning-strategy.md](./prepare-a-model-fine-tuning-strategy.md) · [../../ai-engineer/foundations/prepare-an-llm-evaluation-strategy.md](../../ai-engineer/foundations/prepare-an-llm-evaluation-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does synthesis solve / what happens if not done / ROI / business impact"; do not synthesize for synthesis's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "synthesis could go out of control (scattered generation / missed privacy / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one synthesis → model changes → another synthesis; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest synthesis that meets business needs; do not pile up generators; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Method**: must run LLM generation / rules / sampling / augmentation; no gut calls.
6. **Privacy**: must run differential privacy / de-identification / isolation; no leaks.
7. **Evaluation**: must run distribution / diversity / downstream tasks; no leaks.
8. **Drift**: must run drift / detection / closed loop; no leaks.
9. **Data labeling**: must follow [i-want-to-prepare-a-data-labeling-strategy.md](./prepare-a-data-labeling-strategy.md); no bare run.
10. **Data governance**: must follow [i-want-to-prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md); no bare run.
11. **Data modeling**: must follow [i-want-to-prepare-a-data-modeling-strategy.md](./prepare-a-data-modeling-strategy.md); no bare run.
12. **Fine-tuning**: must follow [i-want-to-prepare-a-model-fine-tuning-strategy.md](./prepare-a-model-fine-tuning-strategy.md); no bare run.
13. **LLM evaluation**: must follow [i-want-to-prepare-an-llm-evaluation-strategy.md](../../ai-engineer/foundations/prepare-an-llm-evaluation-strategy.md); no bare run.
14. **SSOT**: must follow [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for the synthesis library; no multi-source.
15. **Contract tests**: must follow [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md); no bare run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); data / algorithm / platform / TL owners.
17. **Freeze window**: during launches follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not touch synthesis.
18. **Comms**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for drift / privacy alerts.
20. **Retrospective**: after a synthesis failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) and archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether synthesis is still fresh / privacy still compliant.
22. **ADR**: synthesis decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good synthesis → more data → better models → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-data-labeling-strategy.md](./prepare-a-data-labeling-strategy.md) — data labeling
- Same-class journey: [./prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md) — data governance
- Same-class journey: [./prepare-a-data-modeling-strategy.md](./prepare-a-data-modeling-strategy.md) — data modeling
- Same-class journey: [./prepare-a-model-fine-tuning-strategy.md](./prepare-a-model-fine-tuning-strategy.md) — fine-tuning
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
