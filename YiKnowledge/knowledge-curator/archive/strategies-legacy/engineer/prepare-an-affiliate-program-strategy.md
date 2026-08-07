---

title: I want to prepare an affiliate program strategy
aliases:
- I want to prepare an affiliate marketing strategy
- affiliate-journey
- affiliate-program-journey
- affiliate-marketing-journey
- affiliate marketing entry
tags:
- journeys
- affiliate
- affiliate-program
- affiliate-marketing
- commission-payout
- partner-tracking
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-referral-program-strategy.md
- ./prepare-a-channel-strategy.md
- ./prepare-a-partner-strategy.md
- ../../engineer/strategies/prepare-a-growth-experiment-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an affiliate program strategy

> **As an** engineer, **I want to** prepare an affiliate program, **so that** launch is safe.

> "Affiliate + commission + tracking + fraud prevention + recruit + governance + quarterly audit" — reach process + thinking + case study within 2 hops.

## Summary

- Process goes through [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking goes through [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform goes through [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case studies go through [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing affiliate marketing / affiliate / commission / tracking / fraud prevention / recruit / governance / communication / big-promo freeze / quarterly audit / retrospective, TL + marketing + growth + sponsor need to look up process + thinking + case study. This entry aggregates affiliate-marketing-related process + thinking + case study into 2-hop paths to avoid "scattered affiliates / hollow commission / tracking gaps / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — affiliate intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion thinking gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) |
| `product/strategy/` | [growth-strategy-summary.md](./prepare-a-growth-strategy.md) · [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — affiliate communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — marketing matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — affiliate incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — affiliate business |
| `projects/` | each project `architecture-summary.md` §growth + `adr-*` §affiliate |
| `journeys/` | [./prepare-a-referral-program-strategy.md](./prepare-a-referral-program-strategy.md) · [./prepare-a-channel-strategy.md](./prepare-a-channel-strategy.md) · [./prepare-a-partner-strategy.md](./prepare-a-partner-strategy.md) · [./prepare-a-growth-strategy.md](./prepare-a-growth-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does affiliate solve / what if not done / ROI / business impact"; do not run affiliates for the sake of affiliates; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how affiliate can fail (scattered affiliates / hollow commission / tracking gaps / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one adjustment -> behavior changes -> another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest affiliate that satisfies the business wins; do not pile up affiliates; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Recruit**: must do affiliate recruit + dispersion check.
6. **Tracking**: must do link/cookie tracking + gap check.
7. **Commission**: must do commission payout + no leakage.
8. **Fraud prevention**: must do fraud prevention (rate limit / risk control / KYC) + no naked run; follow [i-want-to-prepare-a-fraud-detection-strategy.md](./prepare-a-fraud-detection-strategy.md).
9. **Attribution**: must do attribution model (first-touch / last-touch / multi-touch) + no gut call.
10. **A/B**: must do [i-want-to-run-an-a-b-test.md](../processes/run-an-a-b-test.md) + no intuition.
11. **Referral**: must do [i-want-to-prepare-a-referral-program-strategy.md](./prepare-a-referral-program-strategy.md) + no naked run.
12. **Channel**: must do [i-want-to-prepare-a-channel-strategy.md](./prepare-a-channel-strategy.md) + overlap check.
13. **Partner**: must do [i-want-to-prepare-a-partner-strategy.md](./prepare-a-partner-strategy.md) + no naked run.
14. **SSOT**: must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for affiliate library + no multi-source.
15. **Feature flag**: must do [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) for gradual reward rollout.
16. **Cache**: must do [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
17. **RACI**: must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); marketing / growth / finance / TL owner.
18. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change commission rules.
19. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
20. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for affiliate counts / conversion / fraud alerts.
21. **Retrospective**: after affiliate incidents, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
22. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether commission is still accurate / fraud prevention is still reasonable.
23. **ADR**: affiliate decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **Flywheel**: affiliate done well → new customers grow → CAC drops → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-referral-program-strategy.md](./prepare-a-referral-program-strategy.md) — referral
- Related journey: [./prepare-a-channel-strategy.md](./prepare-a-channel-strategy.md) — channel
- Related journey: [./prepare-a-partner-strategy.md](./prepare-a-partner-strategy.md) — partner
- Related journey: [./prepare-a-growth-strategy.md](./prepare-a-growth-strategy.md) — growth
- Upstream: [../../product-manager/frameworks/README.md](../../product-manager/frameworks/README.md) — pm-frameworks leaf entry
