---

title: I want to prepare a pitch deck strategy
aliases:
- I want to prepare a sales deck strategy
- pitch-deck-journey
- sales-deck-journey
- investor-deck-journey
- deck entry
tags:
- journeys
- pitch-deck
- sales-deck
- investor-deck
- story-arc
- personalization
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
- ./prepare-a-sales-demo-strategy.md
- ./prepare-a-narrative-strategy.md
- ./prepare-a-messaging-house-strategy.md
- ./prepare-a-positioning-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a pitch deck strategy

> **As an** engineer, **I want to** prepare a pitch deck, **so that** launch is safe.

> "Story arc + audience + personalization + closed loop + governance + quarterly audit" reach within 2 hops of process + thinking + case study.

## Summary

- Process: go [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: go [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: go [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case study: go [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing a pitch deck / sales deck / story arc / audience / personalization / closed loop / governance / reporting / big-promo freeze / quarterly audit / retrospective, TL + PMM + sales + sponsor need to look up process + thinking + case study. This entry aggregates pitch-deck-related process + thinking + case study into a 2-hop path, avoiding "story scattered / audience vague / personalization missed / closed-loop chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — deck intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine vague · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [narrative-summary.md](./../../product-manager/frameworks/prepare-a-product-positioning-strategy.md) · [messaging-house-summary.md](./../../product-manager/frameworks/prepare-a-product-positioning-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — deck reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — PMM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — deck incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — deck business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §deck |
| `journeys/` | [./prepare-a-sales-demo-strategy.md](./prepare-a-sales-demo-strategy.md) · [./prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md) · [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) · [./prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) · [./prepare-a-value-proposition-strategy.md](./prepare-a-value-proposition-strategy.md) |

## Action recommendations

1. **First principles**: first ask "pitch deck what to solve / what happens if not done / ROI / business impact"; do not do a deck for the sake of a deck; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "deck could go out of control (story scattered / audience vague / personalization missed / closed-loop chaos / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one send → behavior changes → another send; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest deck that satisfies business wins; do not pile up pages; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Story arc**: must run story arc (problem → solution → value → evidence → action) + no vagueness; see [i-want-to-prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md).
6. **Audience**: must run audience adaptation (executives / mid-level / users) + no one-size-fits-all; see [i-want-to-prepare-a-stakeholder-map.md](../processes/do-a-stakeholder-mapping.md).
7. **Personalization**: must run deck personalization / customer logo / case swap + no scattering.
8. **Demo**: must run [i-want-to-prepare-a-sales-demo-strategy.md](./prepare-a-sales-demo-strategy.md) + no naked run.
9. **Message house**: must run [i-want-to-prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) + no drift.
10. **Positioning**: must run [i-want-to-prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) + no drift.
11. **Value proposition**: must run [i-want-to-prepare-a-value-proposition-strategy.md](./prepare-a-value-proposition-strategy.md) + no vagueness.
12. **A/B**: must run [i-want-to-run-an-a-b-test.md](../processes/run-an-a-b-test.md) + no intuition.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) deck library + no multi-source.
14. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) for deck canary.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no re-computation.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PMM / sales / TL / sponsor owner.
17. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move the deck template.
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) open / forward / follow-up alerts.
20. **Retrospective**: after a deck incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan template whether still accurate / story whether still reasonable.
22. **ADR**: deck decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: deck good → consensus fast → deal fast → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [./prepare-a-sales-demo-strategy.md](./prepare-a-sales-demo-strategy.md) — demo
- similar journey: [./prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md) — narrative
- similar journey: [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) — message house
- similar journey: [./prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) — positioning
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry
