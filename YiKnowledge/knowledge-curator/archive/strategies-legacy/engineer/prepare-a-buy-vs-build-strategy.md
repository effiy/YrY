---

title: I want to prepare a buy vs build strategy
aliases:
- i-want-to-prepare-a-buy-vs-build-strategy
- buy-vs-build-journey
- build-or-buy-journey
- make-or-buy-journey
- buy-vs-build-entry
tags:
- journeys
- buy-vs-build
- build-or-buy
- make-or-buy
- tco
- vendor-evaluation
- build-decision
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
- ./prepare-a-vendor-risk-management-strategy.md
- ./prepare-an-rfp.md
- prepare-a-tech-strategy.md
- ./prepare-a-unit-economics-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a buy vs build strategy

> **As an** engineer, **I want to** prepare a buy vs build, **so that** launch is safe.

> Reach process + thinking + cases for "build + buy + evaluation + decision + TCO + governance + quarterly audit" within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing build vs buy / evaluation / decision / TCO / governance / comms / promo freeze / quarterly audit / retrospective, TL + PM + architecture + legal + sponsor need to look up process + thinking + cases. This entry aggregates build-vs-buy-related process + thinking + cases into a 2-hop path, avoiding "scattered evaluation / virtual decision / TCO gaps / messy closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — build intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert the emptiness · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [build-vs-buy-summary.md](./evaluate-a-build-vs-buy-decision.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — decision comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — architecture matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — decision incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — decision business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §decision |
| `journeys/` | [./prepare-a-vendor-risk-management-strategy.md](./prepare-a-vendor-risk-management-strategy.md) · [./prepare-an-rfp.md](./prepare-an-rfp.md) · [./i-want-to-prepare-a-tech-strategy.md](./prepare-a-tech-strategy.md) · [./prepare-a-unit-economics-strategy.md](./prepare-a-unit-economics-strategy.md) · [./prepare-a-contract-management-strategy.md](./prepare-a-contract-management-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does build vs buy solve / what happens if not done / ROI / business impact"; don't make decisions for the sake of decisions; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "decision could go out of control (scattered evaluation / virtual decision / TCO gaps / messy closed loop / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One decision -> behavior change -> another decision; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest decision that satisfies business wins; don't pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Strategic value**: must run strategic value assessment (differentiation / core / commodity) + gut-check.
6. **TCO**: must run total cost of ownership / 5-year + no gaps; follow [i-want-to-prepare-a-unit-economics-strategy.md](./prepare-a-unit-economics-strategy.md).
7. **RFP**: must run [i-want-to-prepare-an-rfp.md](./prepare-an-rfp.md) + no scatter.
8. **Vendor**: must run [i-want-to-prepare-a-vendor-risk-management-strategy.md](./prepare-a-vendor-risk-management-strategy.md) + no naked run.
9. **Tech**: must run [i-want-to-prepare-a-tech-strategy.md](./prepare-a-tech-strategy.md) + no naked run.
10. **Contract**: must run [i-want-to-prepare-a-contract-management-strategy.md](./prepare-a-contract-management-strategy.md) + no naked run.
11. **Integration**: must run integration cost / data flow / boundary + no gaps.
12. **Risk**: must run risk exposure / lock-in / exit + no gaps.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) decision library + no multi-source.
14. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); architecture / PM / legal / TL owners.
17. **Freeze window**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not touch decisions.
18. **Comms**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal/external comms.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) TCO / integration / risk alerts.
20. **Retrospective**: after decision incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether decisions are still accurate / TCO still reasonable.
22. **ADR**: decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: decisions done well -> resources accurate -> fast launches -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-a-vendor-risk-management-strategy.md](./prepare-a-vendor-risk-management-strategy.md) — vendor
- Same-category journey: [./prepare-an-rfp.md](./prepare-an-rfp.md) — RFP
- Same-category journey: [./i-want-to-prepare-a-tech-strategy.md](./prepare-a-tech-strategy.md) — tech
- Same-category journey: [./prepare-a-unit-economics-strategy.md](./prepare-a-unit-economics-strategy.md) — unit economics
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
