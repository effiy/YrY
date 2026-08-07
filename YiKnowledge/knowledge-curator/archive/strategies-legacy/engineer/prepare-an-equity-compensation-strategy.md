---

title: I want to prepare an equity compensation strategy
aliases:
- I want to prepare an equity compensation strategy
- equity-compensation-journey
- stock-equity-journey
- equity compensation entry
tags:
- journeys
- equity-compensation
- stock-options
- rsu
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
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-compensation-strategy.md
- ./prepare-a-total-rewards-strategy.md
- ./prepare-a-benefits-strategy.md
- ./prepare-a-pay-equity-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an equity compensation strategy

> **As an** engineer, **I want to** prepare an equity compensation, **so that** launch is safe.

> "Equity compensation + options + RSU + governance + quarterly audit" reach within 2 hops process + thinking + case study.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing equity compensation / options / RSU / governance / promo freeze / quarterly audit / retrospective, TL + HR + Finance + Legal + sponsor need to look up process + thinking + case study. This entry aggregates equity-compensation-related process + thinking + case study to a 2-hop path, avoiding "grants scattered / vesting missed / compliance risk / closed-loop chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — equity intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse think scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | equity-compensation · stock-options · rsu · vesting |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | equity-runtime · grant-store · vest-engine · audit-log |
| `tech/ai-foundations/` | equity-comp-patterns · grant-suite · vest-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — equity communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — equity failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — equity business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §equity |
| `journeys/` | [./prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) · [./prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) · [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) · [./prepare-a-pay-equity-strategy.md](./prepare-a-pay-equity-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does equity compensation solve / what happens if not done / ROI / business impact"; do not grant for grant's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "equity could go out of control (grants scattered / vesting missed / compliance risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one grant → behavior change → another grant; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest equity that meets business needs wins; do not pile up types; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Grant**: must run grant / type / pool + anti-scatter.
6. **Vesting**: must run vesting / exercise / audit trail + anti-miss.
7. **observable**: must run observable / traceable / audit + anti-miss.
8. **closed-loop**: must run closed-loop / retrospective / archive + anti-miss.
9. **compensation**: must run [i-want-to-prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) + anti-naked-run.
10. **total rewards**: must run [i-want-to-prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) + anti-naked-run.
11. **benefits**: must run [i-want-to-prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) + anti-naked-run.
12. **pay equity**: must run [i-want-to-prepare-a-pay-equity-strategy.md](./prepare-a-pay-equity-strategy.md) + anti-naked-run.
13. **security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + anti-naked-run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) grant store + anti-multi-source.
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + anti-naked-run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / Finance / Legal owner.
17. **freeze period**: promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move grants.
18. **communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) equity exception alerts.
20. **retrospective**: after equity failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan grants whether still accurate / vesting whether still reasonable.
22. **ADR**: equity decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **flywheel**: equity good → retention rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) — compensation
- Same-category journey: [./prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) — total rewards
- Same-category journey: [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) — benefits
- Same-category journey: [./prepare-a-pay-equity-strategy.md](./prepare-a-pay-equity-strategy.md) — pay equity
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
