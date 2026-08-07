---

title: I want to prepare a sales forecast strategy
aliases:
- I want to prepare a sales forecast strategy
- sales-forecast-journey
- revenue-forecast-journey
- pipeline-forecast-journey
- sales forecast entry
tags:
- journeys
- sales-forecast
- revenue-forecast
- pipeline
- forecast-accuracy
- commit-best-case
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
-./prepare-a-revenue-ops-strategy.md
- prepare-a-pipeline-strategy.md
-./prepare-a-quarterly-review.md
-../../product-manager/discovery/metrics/north-star-metric.md
-../../knowledge-curator/diagrams/directory-blueprint.md
-../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a sales forecast strategy

> **As an** engineer, **I want to** prepare a sales forecast, **so that** launch is safe.

> "Pipeline + commit + best-case + accuracy + sales coverage + governance + quarterly audit" reaches process + thinking + case study within 2 hops.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing a sales forecast / pipeline / commit / best-case / accuracy / sales coverage / governance / communication / promotion freeze / quarterly audit / retrospective, TL + sales + finance + sponsor need to look up process + thinking + case study. This entry aggregates sales-forecast-related process + thinking + case study into a 2-hop path, avoiding "pipeline scattered / commit inflated / accuracy missed / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of forecast · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert to imagine inflation · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [pricing-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-pricing-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — forecast communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — sales matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — forecast incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [reference](../../brd/) — forecast business |
| `projects/` | each project's `architecture-summary.md` §RevOps + `adr-*` §forecast |
| `journeys/` | [./prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) · [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) · [./i-want-to-prepare-a-pipeline-strategy.md](./prepare-a-pipeline-strategy.md) · [./prepare-a-budget.md](./prepare-a-budget.md) |

## Action recommendations

1. **First principles**: First ask "what forecast problem to solve / what happens if not done / ROI / business impact"; don't forecast for the sake of forecasting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "forecast could go out of control (pipeline scattered / commit inflated / accuracy missed / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one forecast adjustment → behavior changes → another adjustment; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest forecast that satisfies business wins; don't pile up variables; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Pipeline**: must run pipeline health + no scatter; see [i-want-to-prepare-a-pipeline-strategy.md](./prepare-a-pipeline-strategy.md).
6. **Commit**: must run commit + best-case tiering + no gut call.
7. **Accuracy**: must run forecast accuracy trace + no ambiguity; see [i-want-to-prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md).
8. **Method**: must run forecast method (weighted / categorical) + no gut call.
9. **Sales coverage**: must run coverage / capacity + no ambiguity; see [i-want-to-prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md).
10. **Budget**: must run [i-want-to-prepare-a-budget.md](./prepare-a-budget.md) + no naked run.
11. **QBR**: must run [i-want-to-prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) + no naked run.
12. **RevOps**: must run [i-want-to-prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) + no naked run.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) forecast library + no multi-source.
14. **Contract QA**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no re-compute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); sales / finance / RevOps / TL owner.
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change forecast rules.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate inside and outside.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for accuracy / pipeline alerts.
20. **Retrospective**: after a forecast incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: use [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the method is still accurate + whether coverage is still reasonable.
22. **ADR**: forecast decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: accurate forecast → faster decisions → accurate resources → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) — RevOps
- Related journey: [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) — QBR
- Related journey: [./i-want-to-prepare-a-pipeline-strategy.md](./prepare-a-pipeline-strategy.md) — pipeline
- Related journey: [./prepare-a-budget.md](./prepare-a-budget.md) — budget
- Upstream: [../../product-manager/frameworks/README.md](../../product-manager/frameworks/README.md) — pm-frameworks leaf entry
