---

title: I want to prepare an analyst relations strategy
aliases:
- I want to prepare analyst relations strategy
- analyst-relations-journey
- ar-journey
- industry-analyst-journey
- analyst relations entry
tags:
- journeys
- analyst-relations
- ar
- industry-analyst
- gartner
- forrester
- mq
- wave
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
- ./prepare-a-competitive-intelligence-strategy.md
- ./prepare-a-positioning-strategy.md
- ./prepare-a-narrative-strategy.md
- prepare-a-pr-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an analyst relations strategy

> **As an** engineer, **I want to** prepare an analyst relations, **so that** launch is safe.

> "Analyst list + briefing + inquiry + MQ / Wave + impact + governance + quarterly audit" reach process + thinking + case within 2 hops.

## Summary

- process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- case via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing analyst relations / list / briefing / inquiry / MQ / Wave / impact / governance / communication / big promo freeze / quarterly audit / retrospective, TL + AR + PMM + PR + sponsor need to look up process + thinking + case. This entry aggregates analyst relations related process + thinking + case into 2-hop paths, avoiding "list scattered / briefing vague / inquiry missed / impact chaotic / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — AR essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking for vagueness · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [brand-strategy-summary.md](./prepare-a-brand-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `industry/` | [competitors/](../../executive/industry/competitors) · [reports/](../../executive/industry/reports) · [market-trends/](../../executive/industry/market-trends) — analyst report archive |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — AR communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — AR matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — AR failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — AR business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §AR |
| `journeys/` | [./prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) · [./prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) · [./prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md) · [./i-want-to-prepare-a-pr-strategy.md](./prepare-a-pr-strategy.md) · [./prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does analyst relations solve / what happens if not done / ROI / business impact"; do not brief just for briefing's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "AR could go out of control (list scattered / briefing vague / inquiry missed / impact chaotic / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one briefing → rating change → another briefing; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest AR that meets business needs wins; do not pile up analysts; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Analyst list**: must run tiered analyst list + avoid scatter.
6. **Briefing**: must run analyst briefing + avoid vagueness; follow [i-want-to-prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md).
7. **inquiry**: must run analyst inquiry cadence + avoid missing.
8. **MQ / Wave**: must run MQ / Wave rating goal + avoid gut call.
9. **impact**: must run impact tracking + avoid running blind.
10. **Competition**: must run [i-want-to-prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) + avoid running blind.
11. **Positioning**: must run [i-want-to-prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) + avoid drift.
12. **PR**: must run [i-want-to-prepare-a-pr-strategy.md](./prepare-a-pr-strategy.md) + avoid scatter.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) analyst library + avoid multi-source.
14. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + avoid running blind.
15. **cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + avoid recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); AR / PMM / PR / TL owner.
17. **Freeze period**: Big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) don't move briefing calendar.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for inquiry / rating / mention alerts.
20. **retrospective**: After AR failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether analyst list is still accurate / whether rating goal still reasonable.
22. **ADR**: AR decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: AR good → rating up → references rise → more opportunities; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) — competitive intelligence
- Same-category journey: [./prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) — positioning
- Same-category journey: [./prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md) — narrative
- Same-category journey: [./i-want-to-prepare-a-pr-strategy.md](./prepare-a-pr-strategy.md) — PR
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
