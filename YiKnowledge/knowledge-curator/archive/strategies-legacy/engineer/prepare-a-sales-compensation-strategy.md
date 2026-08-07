---

title: I want to prepare a sales compensation strategy
aliases:
- I want to prepare a sales compensation strategy
- sales-compensation-journey
- commission-journey
- sales-incentive-journey
- sales compensation entry
tags:
- journeys
- sales-compensation
- commission
- incentive
- spif
- sales-pay-plan
- variable-pay
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
- ./prepare-a-quota-strategy.md
- ./prepare-a-territory-strategy.md
- ./prepare-a-revenue-ops-strategy.md
- ../../executive/strategy/business-model-canvas.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a sales compensation strategy

> **As an** engineer, **I want to** prepare a sales compensation, **so that** launch is safe.

> "Commission + incentive + SPIF + pay plan + behavior steering + governance + quarterly audit" reachable within 2 hops: process + thinking + cases.

## TL;D⁠DR

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing sales commission / incentive / SPIF / pay plan / behavior steering / governance / notification / big-promo freeze / quarterly audit / retrospective, TL + sales + HR + finance + sponsor need to look up process + thinking + cases. This entry aggregates sales-compensation-related process + thinking + cases to a 2-hop path, avoiding "hollow commission / scattered incentive / missing behavior / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — commission essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert hollow · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [pricing-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-pricing-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — commission notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — sales matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — commission incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [reference](../../brd/) — commission business |
| `projects/` | each project `architecture-summary.md` §RevOps + `adr-*` §commission |
| `journeys/` | [./prepare-a-quota-strategy.md](./prepare-a-quota-strategy.md) · [./prepare-a-territory-strategy.md](./prepare-a-territory-strategy.md) · [./prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) · [./prepare-a-budget.md](./prepare-a-budget.md) |

## Action recommendations

1. **First principles**: first ask "what does commission solve / what happens if not done / ROI / business impact"; do not do commission for commission's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how commission could go out of control (hollow commission / scattered incentive / missing behavior / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one adjustment → behavior changes → another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest commission that meets business needs wins; do not pile up rules; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Pay plan**: must run pay plan (base + variable + bonus) + no gut call.
6. **Commission**: must run commission structure (rate / tier / accelerator) + no ambiguity.
7. **SPIF**: must run SPIF short-term incentive + no abuse.
8. **Behavior**: must run behavior steering (new customer / upgrade / renewal) + no mismatch.
9. **Caps**: must run caps / floor + no gaps.
10. **Quota**: must run [i-want-to-prepare-a-quota-strategy.md](./prepare-a-quota-strategy.md) + no naked run.
11. **Territory**: must run [i-want-to-prepare-a-territory-strategy.md](./prepare-a-territory-strategy.md) + no naked run.
12. **RevOps**: must run [i-want-to-prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) + no naked run.
13. **Budget**: must run [i-want-to-prepare-a-budget.md](./prepare-a-budget.md) + no overspend.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) commission library + no multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
17. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); HR / sales / finance / TL owner.
18. **Freeze period**: big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not touch commission rules.
19. **Notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) inside and outside.
20. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) payout / attainment alerts.
21. **Retrospective**: after a commission incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
22. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md); scan whether plan still accurate / behavior still reasonable.
23. **ADR**: commission decisions must be captured in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **Flywheel**: commission done well → behavior positive → revenue rises → more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-a-quota-strategy.md](./prepare-a-quota-strategy.md) — quota
- Same-category journey: [./prepare-a-territory-strategy.md](./prepare-a-territory-strategy.md) — territory
- Same-category journey: [./prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) — RevOps
- Same-category journey: [./prepare-a-budget.md](./prepare-a-budget.md) — budget
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
