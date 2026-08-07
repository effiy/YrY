---

title: I want to prepare a sales demo strategy
aliases:
- I want to prepare a sales demo strategy
- sales-demo-journey
- demo-strategy-journey
- demo-script-journey
- salesdemoentry
tags:
- journeys
- sales-demo
- demo-script
- demo-environment
- sales-enablement
- demo-automation
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
- ./prepare-a-sales-enablement-strategy.md
- ./prepare-a-pitch.md
- ./prepare-a-messaging-house-strategy.md
- ../../product-manager/frameworks/prepare-a-go-to-market.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a sales demo strategy

> **As an** engineer, **I want to** prepare a sales demo, **so that** launch is safe.

> "Script + environment + story flow + personalization + demo data + governance + quarterly audit" reachable within 2 hops of process + thinking + case study.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case study: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

Prepare sales demo / demo / script / environment / story flow / personalization / demo data / governance / communication / big-promo freeze / quarterly audit / retrospective, when TL + sales + SE + sponsor need to look up process + thinking + case study. This entry aggregates sales-demo-related process + thinking + case study into a 2-hop path, avoiding "script scattered / environment fake / data missing / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — demo intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion thinking catches gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [differentiation-summary.md](./../../executive/strategy/porter-five-forces.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — demo communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — SE matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — demo incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — demo business |
| `projects/` | each project `architecture-summary.md` §SE + `adr-*` §demo |
| `journeys/` | [./prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) · [./prepare-a-pitch.md](./prepare-a-pitch.md) · [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) · [./prepare-a-value-proposition-strategy.md](./prepare-a-value-proposition-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does the demo solve / what if not done / ROI / business impact"; do not demo for the sake of demo; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how can the demo fail (script scattered / environment fake / data missing / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one adjustment -> behavior changes -> another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest demo that satisfies business wins; do not pile up features; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Script**: must do demo script + no scattering; follow [i-want-to-prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md).
6. **Story flow**: must do story flow + avoid feature piling.
7. **Environment**: must do demo environment + no naked run; follow [i-want-to-prepare-an-environment-strategy.md](./prepare-an-environment-strategy.md).
8. **Data**: must do demo data / mock + no scattering.
9. **Personalization**: must do per-audience personalized demo + avoid one-size-fits-all; follow [i-want-to-prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md).
10. **Automation**: must do demo automation / sandbox + no naked run.
11. **Sales enablement**: must do [i-want-to-prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) + not empty.
12. **Pitch**: must do [i-want-to-prepare-a-pitch.md](./prepare-a-pitch.md) + no scattering.
13. **Value proposition**: must do [i-want-to-prepare-a-value-proposition-strategy.md](./prepare-a-value-proposition-strategy.md) + no naked run.
14. **SSOT**: must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) demo library + no multi-source.
15. **Feature flag**: must do [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) gradual rollout of features.
16. **Cache**: must do [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
17. **RACI**: must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); SE / sales / TL / sponsor owners.
18. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move demo script.
19. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communication internally and externally.
20. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) demo coverage rate / win rate alerts.
21. **Retrospective**: after demo incident, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
22. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan script whether still accurate + environment whether still reasonable.
23. **ADR**: demo decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **Flywheel**: good demo -> higher win rate -> rising revenue -> more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) — sales enablement
- Related journey: [./prepare-a-pitch.md](./prepare-a-pitch.md) — pitch
- Related journey: [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) — messaging house
- Related journey: [./prepare-a-value-proposition-strategy.md](./prepare-a-value-proposition-strategy.md) — value proposition
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
