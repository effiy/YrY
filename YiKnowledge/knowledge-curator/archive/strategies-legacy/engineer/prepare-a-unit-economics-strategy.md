---

title: I want to prepare a unit economics strategy
aliases:
- unit economics strategy
- unit-economics-journey
- ue-journey
- ltv-cac-journey
- unit economics entry
tags:
- journeys
- unit-economics
- ltv-cac
- cac
- payback
- gross-margin
- contribution-margin
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
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-customer-lifetime-value-strategy.md
- ./prepare-a-budget.md
- ./prepare-a-monetization-strategy.md
- ../../executive/strategy/business-model-canvas.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a unit economics strategy

> **As an** engineer, **I want to** prepare a unit economics, **so that** launch is safe. 

> "CAC + LTV + payback + gross margin + contribution + ROI + governance + quarterly audit" reaches process + thinking + cases within 2 hops. 

## Summary

- process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing unit economics / CAC / LTV / payback / gross margin / contribution / ROI / governance / notification / promo freeze / quarterly audit / retrospective, TL + finance + growth + sponsor need to look up process + thinking + cases. This entry aggregates unit-economics related process + thinking + cases within a 2-hop path, avoiding "scattered CAC / empty LTV / missed gross margin / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — economics original intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — think in reverse · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reaction · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [pricing-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-pricing-strategy.md) · [growth-strategy-summary.md](./prepare-a-growth-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — economics notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — finance matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — economics incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [reference](../../brd/) — economics business |
| `projects/` | each project `architecture-summary.md` §finance + `adr-*` §economics |
| `journeys/` | [./prepare-a-customer-lifetime-value-strategy.md](./prepare-a-customer-lifetime-value-strategy.md) · [./prepare-a-budget.md](./prepare-a-budget.md) · [./prepare-a-monetization-strategy.md](./prepare-a-monetization-strategy.md) · [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does unit economics solve / what happens if not done / ROI / business impact"; do not pursue economics for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **inversion**: first imagine "unit economics could go out of control (scattered CAC / empty LTV / missed gross margin / wrong decisions)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **second-order effects**: one adjustment -> behavior change -> another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest economics that satisfies business wins; do not pile up cost items; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **CAC**: must run CAC model (channel / total / paid) + no gut call. 
6. **LTV**: must run [i-want-to-prepare-a-customer-lifetime-value-strategy.md](./prepare-a-customer-lifetime-value-strategy.md) + no bare run. 
7. **LTV/CAC**: must run LTV/CAC ratio (>=3) + no gut call. 
8. **payback**: must run payback period (<=12 months) + no vagueness. 
9. **gross margin**: must run gross margin + no vagueness; follow [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md). 
10. **contribution**: must run contribution margin + no vagueness. 
11. **budget**: must run [i-want-to-prepare-a-budget.md](./prepare-a-budget.md) + no bare run. 
12. **monetization**: must run [i-want-to-prepare-a-monetization-strategy.md](./prepare-a-monetization-strategy.md) + no bare run. 
13. **pricing**: must run [i-want-to-prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) + no bare run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) economics view + no multi-source. 
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no bare run. 
16. **cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute. 
17. **RACI**: must follow [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); finance / growth / TL / sponsor owner. 
18. **freeze period**: during promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not change definitions. 
19. **notification**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify internally and externally. 
20. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for CAC / LTV / gross margin alerts. 
21. **retrospective**: after economics incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs). 
22. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether CAC is still accurate + gross margin still reasonable. 
23. **ADR**: economics decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
24. **flywheel**: economics done well -> precise ad spend -> fast growth -> more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- similar journey: [./prepare-a-customer-lifetime-value-strategy.md](./prepare-a-customer-lifetime-value-strategy.md) — LTV
- similar journey: [./prepare-a-budget.md](./prepare-a-budget.md) — budget
- similar journey: [./prepare-a-monetization-strategy.md](./prepare-a-monetization-strategy.md) — monetization
- similar journey: [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) — pricing
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry
