---

title: I want to prepare a data augmentation strategy
aliases:
- I want to prepare a data augmentation strategy
- data-augmentation-journey
- data-aug-journey
- data augmentation entry
tags:
- journeys
- data-augmentation
- data-enrichment
- data-quality
- llm-data
- pipeline
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
- ./prepare-a-synthetic-data-strategy.md
- ./prepare-a-model-fine-tuning-strategy.md
- ./prepare-a-data-governance-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a data augmentation strategy

> **As an** engineer, **I want to** prepare a data augmentation, **so that** launch is safe.

> "Cleaning + augmentation + quality + governance + quarterly audit" reachable within 2 hops: process + thinking + case study.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing data augmentation / cleaning / augmentation / quality / governance / big-promo freeze / quarterly audit / retrospective, TL + data + algorithm + platform + sponsor need to look up process + thinking + case study. This entry aggregates data-augmentation-related process + thinking + case study into a 2-hop path, avoiding "scattered augmentation / missed quality / drift / chaotic closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — augmentation intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | data-augmentation · data-enrichment · data-quality · llm-distillation |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [ai-strategy-summary.md](../../engineer/strategies/prepare-an-ai-strategy-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | data-generator · evals-platform · model-registry |
| `tech/ai-foundations/` | data-synthesis · data-aug-baseline · quality-check |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — augmentation communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — data matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — augmentation incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — augmentation business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §augmentation |
| `journeys/` | [./prepare-a-data-labeling-strategy.md](./prepare-a-data-labeling-strategy.md) · [./prepare-a-synthetic-data-strategy.md](./prepare-a-synthetic-data-strategy.md) · [./prepare-a-model-fine-tuning-strategy.md](./prepare-a-model-fine-tuning-strategy.md) · [./prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md) · [./prepare-a-data-modeling-strategy.md](./prepare-a-data-modeling-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does augmentation solve / what happens if not done / ROI / business impact"; do not augment for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "augmentation could go out of control (quality leakage / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one augmentation pass → model changes → another augmentation pass; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest augmentation that satisfies business wins; do not pile up pipelines; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Method**: must run paraphrase / back-translation / replacement / augmentation + no gut calls.
6. **Quality**: must run quality / filter / dedup + no leakage.
7. **Diversity**: must run distribution / diversity / downstream tasks + no leakage.
8. **Data labeling**: must run [i-want-to-prepare-a-data-labeling-strategy.md](./prepare-a-data-labeling-strategy.md) + no naked run.
9. **Synthetic data**: must run [i-want-to-prepare-a-synthetic-data-strategy.md](./prepare-a-synthetic-data-strategy.md) + no naked run.
10. **Fine-tuning**: must run [i-want-to-prepare-a-model-fine-tuning-strategy.md](./prepare-a-model-fine-tuning-strategy.md) + no naked run.
11. **Data governance**: must run [i-want-to-prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md) + no naked run.
12. **Data modeling**: must run [i-want-to-prepare-a-data-modeling-strategy.md](./prepare-a-data-modeling-strategy.md) + no naked run.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) augmentation library + no multi-source.
14. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
15. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); data / algorithm / platform / TL owner.
16. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not move augmentation.
17. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally.
18. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) quality / drift alerts.
19. **Retrospective**: after augmentation incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
20. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan augmentation whether still fresh / quality whether still compliant.
21. **ADR**: augmentation decision must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: augmentation done well → more data → model improves → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-data-labeling-strategy.md](./prepare-a-data-labeling-strategy.md) — data labeling
- Same-class journey: [./prepare-a-synthetic-data-strategy.md](./prepare-a-synthetic-data-strategy.md) — synthetic data
- Same-class journey: [./prepare-a-model-fine-tuning-strategy.md](./prepare-a-model-fine-tuning-strategy.md) — fine-tuning
- Same-class journey: [./prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md) — data governance
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
