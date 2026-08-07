---

title: I want to prepare a capacity forecast strategy
aliases:
- I want to prepare a capacity forecast strategy
- capacity-forecast-journey
- demand-forecast-journey
- capacity forecast entry
tags:
- journeys
- capacity-forecast
- demand-forecast
- elasticity
- scalability
- finops
category: tech-lead/roadmap
created: 2026-08-04
updated: 2026-08-04
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-capacity-planning-strategy.md
- ../../engineer/strategies/prepare-a-right-sizing-strategy.md
- ./prepare-an-elasticity-strategy.md
- ../../oncall-sre/incident-response/prepare-an-observability-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a capacity forecast strategy

> **As a** tech lead, **I want to** prepare a capacity forecast, **so that** launch is safe.

> "forecast + elasticity + trend + governance + quarterly audit" reachable within 2 hops: process + thinking + case study.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing capacity forecast / elasticity / trend / governance / big-promo freeze / quarterly audit / retrospective, TL + Platform + data + algorithm + sponsor need to look up process + thinking + case study. This entry aggregates capacity-forecast-related Process + Thinking + Case study into a 2-hop path, avoiding "forecast scattered / trend missed / drift / closed-loop chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — forecast intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | capacity-forecast · demand-forecast · elasticity · scalability |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | forecast-runtime · trend-store · elasticity-engine · audit-log |
| `tech/ai-foundations/` | forecast-patterns · trend-suite · elasticity-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — forecast communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — Platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — forecast incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — forecast business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §forecast |
| `journeys/` | [./prepare-a-capacity-planning-strategy.md](./prepare-a-capacity-planning-strategy.md) · [../../engineer/strategies/prepare-a-right-sizing-strategy.md](../../engineer/strategies/prepare-a-right-sizing-strategy.md) · [./i-want-to-prepare-an-elasticity-strategy.md](./prepare-an-elasticity-strategy.md) · [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) · [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does capacity forecast solve / what if not done / ROI / business impact"; do not forecast for forecasting's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how can capacity forecast fail (forecast scattered / trend missed / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one forecast → behavior changes → another forecast; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest forecast that satisfies business wins; do not pile up models; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Forecast**: must do forecast / model / cadence + no scattering.
6. **Trend**: must do trend / seasonality / baseline + no leakage.
7. **Elasticity**: must do elasticity / scale-up-down / auto + no leakage.
8. **Regression**: must do regression / validation / closed loop + no leakage.
9. **Capacity planning**: must do [i-want-to-prepare-a-capacity-planning-strategy.md](./prepare-a-capacity-planning-strategy.md) + no naked run.
10. **Resource right-sizing**: must do [i-want-to-prepare-a-right-sizing-strategy.md](../../engineer/strategies/prepare-a-right-sizing-strategy.md) + no naked run.
11. **Elasticity**: must do [i-want-to-prepare-an-elasticity-strategy.md](./prepare-an-elasticity-strategy.md) + no naked run.
12. **Observability**: must do [i-want-to-prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) + no naked run.
13. **FinOps**: must do [i-want-to-prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) + no naked run.
14. **SSOT**: must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) forecast library + no multi-source.
15. **Contract test**: must do [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / data / algorithm / TL owner.
17. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move forecast.
18. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally.
19. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) forecast deviation alerts.
20. **Retrospective**: after forecast incidents, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether forecast still accurate / model still reasonable.
22. **ADR**: forecast decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good forecast → elasticity up → cost down → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-capacity-planning-strategy.md](./prepare-a-capacity-planning-strategy.md) — capacity planning
- Related journey: [../../engineer/strategies/prepare-a-right-sizing-strategy.md](../../engineer/strategies/prepare-a-right-sizing-strategy.md) — resource right-sizing
- Related journey: [./i-want-to-prepare-an-elasticity-strategy.md](./prepare-an-elasticity-strategy.md) — elasticity
- Related journey: [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) — observability
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
