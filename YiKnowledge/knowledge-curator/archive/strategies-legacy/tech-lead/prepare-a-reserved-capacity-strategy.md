---

title: I want to prepare a reserved capacity strategy
aliases:
- i-want-to-prepare-a-reserved-capacity-strategy
- reserved-capacity-journey
- reserved-instance-journey
- reserved-capacity-entry
tags:
- journeys
- reserved-capacity
- reserved-instance
- finops
- commit-discount
- cost-optimization
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
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ../../oncall-sre/incident-response/prepare-a-finops-strategy.md
- ./prepare-a-capacity-planning-strategy.md
- ../../engineer/strategies/prepare-a-right-sizing-strategy.md
- ../../engineer/strategies/prepare-a-savings-plan-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a reserved capacity strategy

> **As a** tech lead, **I want to** prepare a reserved capacity, **so that** launch is safe. 

> "Reservation + commitment + savings + governance + quarterly audit" reach process + thinking + case studies within 2 hops. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing reserved capacity / commitment / savings / governance / big-promo freeze / quarterly audit / retrospective, TL + platform + data + finance + sponsor need to look up process + thinking + case studies. This entry aggregates reserved-capacity-related process + thinking + case studies into a 2-hop path, avoiding "reservations scattered / commitments missed / drift / closed-loop chaos / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of reservation · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reaction · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | reserved-capacity · reserved-instance · commit-discount · cost-optimization |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | reserved-runtime · commit-store · coverage-engine · audit-log |
| `tech/ai-foundations/` | reserved-patterns · commit-suite · coverage-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — reservation reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — reservation incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — reserved business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §reservation |
| `journeys/` | [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) · [./prepare-a-capacity-planning-strategy.md](./prepare-a-capacity-planning-strategy.md) · [../../engineer/strategies/prepare-a-right-sizing-strategy.md](../../engineer/strategies/prepare-a-right-sizing-strategy.md) · [../../engineer/strategies/prepare-a-savings-plan-strategy.md](../../engineer/strategies/prepare-a-savings-plan-strategy.md) · [../../engineer/strategies/prepare-a-cost-allocation.md](../../engineer/strategies/prepare-a-cost-allocation.md) |

## Action recommendations

1. **first principles**: first ask "what does reserved capacity solve / what happens if not done / ROI / business impact"; do not reserve for the sake of reserving; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **inversion**: first imagine "reservation could go out of control (reservations scattered / commitments missed / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **second-order effects**: one reservation → behavior changes → another reservation; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest reservation that satisfies business wins; do not pile up commitments; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Reservation**: must run reservation / cadence / savings + no scattering. 
6. **Commitment**: must run commitment / period / fulfillment + no leakage. 
7. **Coverage**: must run coverage / utilization / recommendation + no leakage. 
8. **Reconciliation**: must run reconciliation / actual / savings + no leakage. 
9. **FinOps**: must run [i-want-to-prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) + no naked run. 
10. **Capacity planning**: must run [i-want-to-prepare-a-capacity-planning-strategy.md](./prepare-a-capacity-planning-strategy.md) + no naked run. 
11. **Right-sizing**: must run [i-want-to-prepare-a-right-sizing-strategy.md](../../engineer/strategies/prepare-a-right-sizing-strategy.md) + no naked run. 
12. **Savings plan**: must run [i-want-to-prepare-a-savings-plan-strategy.md](../../engineer/strategies/prepare-a-savings-plan-strategy.md) + no naked run. 
13. **Cost allocation**: must run [i-want-to-prepare-a-cost-allocation.md](../../engineer/strategies/prepare-a-cost-allocation.md) + no naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) reservation library + no multi-source. 
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / finance / data / TL owner. 
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not touch reservations. 
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally. 
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for coverage alerts. 
20. **retrospective**: after reservation incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether reservations are still accurate / commitments still reasonable. 
22. **ADR**: reservation decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **flywheel**: good reservation → savings rise → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- same-class journey: [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) — FinOps
- same-class journey: [./prepare-a-capacity-planning-strategy.md](./prepare-a-capacity-planning-strategy.md) — Capacity planning
- same-class journey: [../../engineer/strategies/prepare-a-right-sizing-strategy.md](../../engineer/strategies/prepare-a-right-sizing-strategy.md) — Right-sizing
- same-class journey: [../../engineer/strategies/prepare-a-savings-plan-strategy.md](../../engineer/strategies/prepare-a-savings-plan-strategy.md) — Savings plan
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
