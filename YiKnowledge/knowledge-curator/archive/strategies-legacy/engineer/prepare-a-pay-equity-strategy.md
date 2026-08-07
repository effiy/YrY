---

title: I want to prepare a pay equity strategy
aliases:
- I want to prepare a pay equity strategy
- pay-equity-journey
- equal-pay-journey
- pay equity entry
tags:
- journeys
- pay-equity
- equal-pay
- fairness
- sre
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
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
- ./prepare-a-compensation-strategy.md
- ./prepare-a-compensation-benchmarking-strategy.md
- ./prepare-a-benefits-strategy.md
- ./prepare-a-total-rewards-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a pay equity strategy

> **As an** engineer, **I want to** prepare a pay equity, **so that** launch is safe. 

> "Pay equity + equal pay for equal work + audit + Governance + Quarterly audit" reach within 2 hops to Process + Thinking + Case study. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing pay equity / equal pay for equal work / audit / Governance / promotion freeze / Quarterly audit / Retrospective, TL + HR + legal + finance + sponsor need to look up Process + Thinking + Case study. This entry aggregates pay-equity-related Process + Thinking + Case study into 2-hop path, avoiding "data scattered / gap missed / compliance risk / closed loop messy / no quarterly audit". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — equity intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | pay-equity · equal-pay · fairness · gap-analysis |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | equity-runtime · gap-store · analyze-engine · audit-log |
| `tech/ai-foundations/` | equity-patterns · gap-suite · analyze-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — equity Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — Platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — equity Incident Archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — equity business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §equity |
| `journeys/` | [./prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) · [./prepare-a-compensation-benchmarking-strategy.md](./prepare-a-compensation-benchmarking-strategy.md) · [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) · [./prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "pay equity what to solve / what happens if not done / ROI / business impact"; do not audit for audit's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "equity could go out of control (data scattered / gap missed / failure risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one audit -> role changes -> another audit; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest equity that satisfies business wins; do not pile up models; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **data**: must run data / dimension / slice + no scatter. 
6. **gap**: must run gap / attribution / adjust + no miss. 
7. **observable**: must run observable / traceability / audit + no miss. 
8. **closed loop**: must run closed loop / Retrospective / Archive + no miss. 
9. **compensation**: must run [i-want-to-prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) + no naked run. 
10. **benchmarking**: must run [i-want-to-prepare-a-compensation-benchmarking-strategy.md](./prepare-a-compensation-benchmarking-strategy.md) + no naked run. 
11. **benefits**: must run [i-want-to-prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) + no naked run. 
12. **total rewards**: must run [i-want-to-prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) + no naked run. 
13. **safe**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) equity library + no multi-source. 
15. **contract QA**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / HR / legal / finance owner. 
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move equity rules. 
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) Communication inside and outside. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) equity anomaly alert. 
20. **Retrospective**: after equity Incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether equity rules are still accurate / gap is still reasonable. 
22. **ADR**: equity Decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: equity good -> retention rises -> trust rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [./prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) — compensation
- Related journey: [./prepare-a-compensation-benchmarking-strategy.md](./prepare-a-compensation-benchmarking-strategy.md) — benchmarking
- Related journey: [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) — benefits
- Related journey: [./prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) — total rewards
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
