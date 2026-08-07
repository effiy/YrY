---

title: I want to prepare a customer marketing strategy
aliases:
- I want to prepare a customer marketing strategy
- customer-marketing-journey
- lifecycle-marketing-journey
- re-engagement-journey
- customer marketing entry
tags:
- journeys
- customer-marketing
- lifecycle-marketing
- onboarding-marketing
- re-engagement
- win-back
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
- ./prepare-a-customer-success-plan.md
- ./prepare-a-loyalty-program-strategy.md
- ./prepare-a-churn-reduction-strategy.md
- ../../engineer/strategies/prepare-a-customer-success-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a customer marketing strategy

> **As an** engineer, **I want to** prepare a customer marketing, **so that** launch is safe. 

> "Onboarding + lifecycle cadence + re-engagement + win-back + retention + personalization + governance + quarterly audit" — reach Process + Thinking + Case study within 2 hops. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing customer marketing / onboarding / lifecycle cadence / re-engagement / win-back / retention / personalization / governance / communication / promotion freeze / quarterly audit / retrospective, TL + marketing + CSM + sponsor need to look up Process + Thinking + Case study. This entry aggregates customer marketing-related Process + Thinking + Case study into 2-hop paths, avoiding "hollow onboarding / re-engagement gaps / scattered personalization / no quarterly audit". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — marketing intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion think gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [customer-success-summary.md](../../engineer/strategies/prepare-a-customer-success-strategy.md) · [customer-onboarding-summary.md](./prepare-a-customer-onboarding-strategy.md) · [growth-strategy-summary.md](./prepare-a-growth-strategy.md) |
| `product/metrics/` | [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — marketing communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — marketing matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — marketing incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — marketing business |
| `projects/` | each project `architecture-summary.md` §CSM + `adr-*` §marketing |
| `journeys/` | [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) · [./prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) · [./prepare-a-churn-reduction-strategy.md](./prepare-a-churn-reduction-strategy.md) · [./prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md) |

## Action recommendations

1. **First principles**: first ask "customer marketing what to solve / what happens if not done / ROI / business impact"; do not market just to market; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first think "customer marketing could go out of control (hollow onboarding / re-engagement gaps / scattered personalization / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one change → behavior changes → another change; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest marketing that satisfies the business wins; do not pile up touchpoints; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Onboarding**: must run onboarding marketing + no naked run; follow [i-want-to-prepare-a-customer-onboarding-strategy.md](./prepare-a-customer-onboarding-strategy.md). 
6. **Lifecycle cadence**: must run lifecycle cadence touchpoints (onboarding / activation / retention / renewal) + no naked run. 
7. **Re-engagement**: must run dormant user wake-up + no naked run; follow [i-want-to-prepare-a-churn-reduction-strategy.md](./prepare-a-churn-reduction-strategy.md). 
8. **Win-back**: must run churn win-back + no naked run. 
9. **Personalization**: must run [i-want-to-prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md) + no one-size-fits-all. 
10. **A/B**: must run [i-want-to-run-an-a-b-test.md](../processes/run-an-a-b-test.md) + no intuition-based decisions. 
11. **CSM**: must run [i-want-to-prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) + no naked run. 
12. **Loyalty**: must run [i-want-to-prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) + no naked run. 
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) marketing library + no multi-source. 
14. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) gradual rollout touchpoints. 
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no re-computation. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); marketing / CSM / TL / sponsor owner. 
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not change marketing templates. 
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) reach / retention / conversion alerts. 
20. **Retrospective**: after marketing incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan touchpoints whether still accurate + personalization whether still reasonable. 
22. **ADR**: marketing decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: good marketing → retention rises → LTV rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) — CSM
- Related journey: [./prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) — loyalty
- Related journey: [./prepare-a-churn-reduction-strategy.md](./prepare-a-churn-reduction-strategy.md) — churn
- Related journey: [./prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md) — personalization
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
