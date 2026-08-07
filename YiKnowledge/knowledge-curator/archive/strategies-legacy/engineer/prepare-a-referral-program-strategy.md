---

title: I want to prepare a referral program strategy
aliases:
- I want to prepare a referral program strategy
- referral-journey
- referral-program-journey
- invite-journey
- referral program entry
tags:
- journeys
- referral
- referral-program
- invite
- word-of-mouth
- double-sided
- anti-fraud
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
- ./prepare-a-customer-advocacy-strategy.md
- ./prepare-a-loyalty-program-strategy.md
- ./prepare-a-lead-generation-strategy.md
- ../../engineer/strategies/prepare-a-growth-experiment-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a referral program strategy

> **As an** engineer, **I want to** prepare a referral program, **so that** launch is safe.

> "Double-sided incentive + invite chain + anti-fraud + trigger + reward + governance + quarterly audit" reachable within 2 hops: process + thinking + case study.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case study: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing referral program / invite / double-sided incentive / anti-fraud / trigger / reward / governance / communication / big-promo freeze / quarterly audit / retrospective, TL + marketing + growth + sponsor need to look up process + thinking + case study. This entry aggregates referral-program-related process + thinking + case study into a 2-hop path, avoiding "rewards inflated / chain scattered / anti-fraud missed / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — referral intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert missed gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) |
| `product/strategy/` | [growth-strategy-summary.md](./prepare-a-growth-strategy.md) · [customer-success-summary.md](../../engineer/strategies/prepare-a-customer-success-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — referral communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — marketing matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — referral incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — referral business |
| `projects/` | each project `architecture-summary.md` §growth + `adr-*` §referral |
| `journeys/` | [./prepare-a-customer-advocacy-strategy.md](./prepare-a-customer-advocacy-strategy.md) · [./prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) · [./prepare-a-lead-generation-strategy.md](./prepare-a-lead-generation-strategy.md) · [./prepare-a-growth-strategy.md](./prepare-a-growth-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does referral solve / what happens if not done / ROI / business impact"; do not refer for referral's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "referral could go out of control (rewards inflated / chain scattered / anti-fraud missed / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one adjustment → behavior changes → another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest referral that satisfies business wins; do not pile up rewards; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **double-sided incentive**: must run double-sided reward + not single-sided.
6. **trigger**: must run trigger timing (key nodes) + not naked run.
7. **chain**: must run invite chain + not broken points.
8. **reward**: must run reward distribution (points / cash / discount) + not missed delivery.
9. **anti-fraud**: must run anti-fraud (rate limit / risk control / KYC) + not naked run; see [i-want-to-prepare-a-fraud-detection-strategy.md](./prepare-a-fraud-detection-strategy.md).
10. **A/B**: must run [i-want-to-run-an-a-b-test.md](../processes/run-an-a-b-test.md) + not gut feel.
11. **advocacy**: must run [i-want-to-prepare-a-customer-advocacy-strategy.md](./prepare-a-customer-advocacy-strategy.md) + not naked run.
12. **loyalty**: must run [i-want-to-prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) + not naked run.
13. **lead-gen**: must run [i-want-to-prepare-a-lead-generation-strategy.md](./prepare-a-lead-generation-strategy.md) + not naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) referral library + not multi-source.
15. **feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) canary rewards.
16. **cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + not recompute.
17. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); marketing / growth / TL / sponsor owner.
18. **freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move reward rules.
19. **communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally.
20. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) invite count / conversion / fraud alerts.
21. **retrospective**: after referral incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
22. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether rewards still accurate + anti-fraud still reasonable.
23. **ADR**: referral decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **flywheel**: good referral → new customers up → CAC down → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-customer-advocacy-strategy.md](./prepare-a-customer-advocacy-strategy.md) — advocacy
- Same-class journey: [./prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) — loyalty
- Same-class journey: [./prepare-a-lead-generation-strategy.md](./prepare-a-lead-generation-strategy.md) — leads
- Same-class journey: [./prepare-a-growth-strategy.md](./prepare-a-growth-strategy.md) — growth
- Upstream: [../../product-manager/frameworks/README.md](../../product-manager/frameworks/README.md) — pm-frameworks leaf entry
