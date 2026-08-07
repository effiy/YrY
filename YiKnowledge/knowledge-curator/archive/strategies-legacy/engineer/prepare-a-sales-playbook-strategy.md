---

title: I want to prepare a sales playbook strategy
aliases:
- I want to prepare a sales playbook strategy
- sales-playbook-journey
- sales-methodology-journey
- battle-card-journey
- sales playbook entry
tags:
- journeys
- sales-playbook
- sales-methodology
- sales-process
- cadence
- battle-card
- sales-script
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
- ./prepare-a-sales-enablement-strategy.md
- ./prepare-a-sales-demo-strategy.md
- ./prepare-a-sales-compensation-strategy.md
- ./prepare-a-competitive-intelligence-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a sales playbook strategy

> **As an** engineer, **I want to** prepare a sales playbook, **so that** launch is safe.

> "Methodology + process + cadence + script + battle card + closed loop + governance + quarterly audit" reach within 2 hops process + thinking + case study.

## Summary

- Processgo [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinkinggo [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platformgo [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studygo [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing sales playbook / methodology / process / cadence / script / battle card / closed loop / governance / communication / big-promo freeze / quarterly audit / retrospective, TL + sales + enablement + sponsor need to look up process + thinking + case study. This entry aggregates sales-playbook-related process + thinking + case study into a 2-hop path, avoiding "methodology illusory / cadence scattered / script missed / battle card stale / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — playbook intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine illusory · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [sales-enablement-summary.md](./prepare-a-sales-enablement-strategy.md) · [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — playbook communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — sales matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — playbook incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — playbook business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §sales |
| `journeys/` | [./prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) · [./prepare-a-sales-demo-strategy.md](./prepare-a-sales-demo-strategy.md) · [./prepare-a-sales-compensation-strategy.md](./prepare-a-sales-compensation-strategy.md) · [./prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) · [./prepare-a-key-account-strategy.md](./prepare-a-key-account-strategy.md) |

## Action recommendations

1. **First principles**: first ask "sales playbook what to solve / what happens if not done / ROI / business impact"; do not pursue playbook for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "playbook could go out of control (methodology illusory / cadence scattered / script missed / battle card stale / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one tune → behavior changes → another tune; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: satisfy business with the simplest playbook; do not pile up sections; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Methodology**: must run sales methodology (MEDDPICC / SPICED / BANT) + avoid gut call.
6. **Process**: must run sales stage process + avoid chaos; see [i-want-to-prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md).
7. **Cadence**: must run sales cadence / sequence + avoid scatter.
8. **Script**: must run sales script + avoid naked run.
9. **Battle card**: must run battle card + avoid stale; see [i-want-to-prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md).
10. **Demo**: must run [i-want-to-prepare-a-sales-demo-strategy.md](./prepare-a-sales-demo-strategy.md) + avoid naked run.
11. **Compensation**: must run [i-want-to-prepare-a-sales-compensation-strategy.md](./prepare-a-sales-compensation-strategy.md) + avoid drift.
12. **Key account**: must run [i-want-to-prepare-a-key-account-strategy.md](./prepare-a-key-account-strategy.md) + avoid naked run.
13. **Closed loop**: must run lead → opportunity → deal → renewal closed loop + avoid miss; see [i-want-to-prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md).
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) playbook library + avoid multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + avoid naked run.
16. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + avoid re-compute.
17. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); sales / enablement / TL / sponsor owner.
18. **Freeze period**: big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move playbook.
19. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communication inside and outside.
20. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) win-rate / cadence / conversion alert.
21. **Retrospective**: playbook incident after must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
22. **Quarterly audit**: see [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan methodology whether still accurate / battle card whether still fresh.
23. **ADR**: playbook decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **Flywheel**: playbook good → win-rate rises → revenue rises → more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) — enablement
- Same-class journey: [./prepare-a-sales-demo-strategy.md](./prepare-a-sales-demo-strategy.md) — demo
- Same-class journey: [./prepare-a-sales-compensation-strategy.md](./prepare-a-sales-compensation-strategy.md) — compensation
- Same-class journey: [./prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) — competitive
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
