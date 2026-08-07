---

title: I want to prepare a sales enablement strategy
aliases:
- I want to prepare a sales enablement strategy
- sales-enablement-journey
- sales-deck-journey
- enablement-journey
- sales enablement entry
tags:
- journeys
- sales-enablement
- sales-deck
- battle-card
- roi-calculator
- sales-training
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
- ../../product-manager/frameworks/prepare-a-go-to-market.md
- ./prepare-a-pricing-strategy.md
- ./prepare-a-competitive-intelligence-strategy.md
- ../../engineer/processes/collaboration/raci-matrix.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a sales enablement strategy

> **As an** engineer, **I want to** prepare a sales enablement, **so that** launch is safe.

> "Materials + battle card + ROI + training + win reports + feedback + Governance + Quarterly audit" reaches Process + Thinking + Case study within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing sales enablement / sales deck / battle card / ROI / training / win reports / feedback / Governance / Communication / big-promo freeze / Quarterly audit / Retrospective, TL + sales + marketing + sponsor need to look up Process + Thinking + Case study. This entry aggregates sales enablement related Process + Thinking + Case study to a 2-hop path, avoiding "scattered materials / missing battle cards / empty training / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — enablement intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion of scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [product-vision-summary.md](./../../product-manager/frameworks/prepare-a-product-vision-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `industry/` | [competitors/](../../executive/industry/competitors) · [use-cases/](../../product-manager/industry-cases) · [reports/](../../executive/industry/reports) — enablement ecosystem |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — enablement Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — sales matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — enablement incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — enablement business |
| `projects/` | each project `architecture-summary.md` §sales + `adr-*` §enablement |
| `journeys/` | [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) · [../processes/understand-competitors.md](../processes/understand-competitors.md) · [./prepare-a-pitch.md](./prepare-a-pitch.md) |

## Action recommendations

1. **First principles**: first ask "enablement what to solve / what if not done / ROI / business impact"; do not enable for enablement's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how enablement can fail (scattered materials / missing battle cards / empty training / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one adjustment -> behavior changes -> another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest materials that satisfy business win; do not pile up decks; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Materials**: must build a sales material library; avoid scatter; follow [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md).
6. **Battle card**: must build competitor battle cards; avoid absence; follow [i-want-to-understand-competitors.md](../processes/understand-competitors.md).
7. **ROI**: must build an ROI calculator; avoid gut calls.
8. **Case study**: must build customer case studies; avoid emptiness.
9. **Training**: must do sales training; avoid dumping raw materials.
10. **Win reports**: must do win reports; avoid absence; follow [i-want-to-prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md).
11. **Feedback**: must do sales feedback closed loop; avoid one-way.
12. **GTM**: must run [i-want-to-prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) + no naked run.
13. **Pricing**: must run [i-want-to-prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) + no gut call.
14. **Pitch**: must run [i-want-to-prepare-a-pitch.md](./prepare-a-pitch.md) + no scatter.
15. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) gradual rollout of materials.
16. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
17. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); sales / marketing / TL / sponsor owner.
18. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not move battle cards.
19. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal and external communication.
20. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) material usage / win rate / cadence alerts.
21. **Retrospective**: after enablement incidents, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
22. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether materials still accurate + battle cards still reasonable.
23. **ADR**: enablement decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **Flywheel**: enablement good → win rate high → revenue rises → more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) — GTM
- Related journey: [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) — pricing
- Related journey: [../processes/understand-competitors.md](../processes/understand-competitors.md) — competitors
- Related journey: [./prepare-a-pitch.md](./prepare-a-pitch.md) — pitch
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
