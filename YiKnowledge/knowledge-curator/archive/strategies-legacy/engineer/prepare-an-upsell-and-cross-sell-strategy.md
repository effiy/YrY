---

title: I want to prepare an upsell and cross-sell strategy
aliases:
- I want to prepare an upsell and cross-sell strategy
- upsell-journey
- cross-sell-journey
- upsell-cross-sell-journey
- upsell-cross-sell-entry
tags:
- journeys
- upsell
- cross-sell
- expansion-revenue
- recommendation
- bundle
- account-expansion
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
- ./prepare-a-customer-success-plan.md
- ./prepare-a-monetization-strategy.md
- ./prepare-a-customer-segmentation-strategy.md
- ../../product-manager/frameworks/prepare-a-product-pricing-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an upsell and cross-sell strategy

> **As an** engineer, **I want to** prepare an upsell and cross sell, **so that** launch is safe. 

> "Upgrade + cross-sell + recommendation + bundle + expansion + trigger + governance + quarterly audit" reaches process + thinking + case study within 2 hops. 

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case study: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing upgrade / cross-sell / recommendation / bundle / expansion / trigger / governance / reporting / promotion freeze / quarterly audit / retrospective, TL + CSM + sales + sponsor need to look up process + thinking + case study. This entry aggregates upgrade-cross-sell-related process + thinking + case study into a 2-hop path, avoiding "hollow recommendations / missed triggers / scattered bundles / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — original intent of upgrade · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion think missing · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [pricing-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-pricing-strategy.md) · [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [customer-segmentation-summary.md](../../executive/strategy/prepare-a-market-segmentation-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — upgrade reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — CSM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — upgrade-failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — upgrade business |
| `projects/` | each project's `architecture-summary.md` §CSM + `adr-*` §upgrade |
| `journeys/` | [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) · [./prepare-a-monetization-strategy.md](./prepare-a-monetization-strategy.md) · [./prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md) · [./prepare-a-quote-to-cash-strategy.md](./prepare-a-quote-to-cash-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does upgrade cross-sell solve / what happens if not done / ROI / business impact"; don't upgrade for the sake of upgrading; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "upgrade could go out of control (hollow recommendations / missed triggers / scattered bundles / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one adjustment → behavior changes → another adjustment; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest upgrade that meets business needs wins; don't pile up recommendations; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Upgrade**: must run upgrade triggers (usage peak / quota) + no gut call. 
6. **Cross-sell**: must run cross-sell recommendations (feature / capacity) + no ambiguity. 
7. **Bundle**: must run bundle strategy + no chaos. 
8. **Trigger**: must run trigger timing + no naked run; see [i-want-to-prepare-a-customer-health-strategy.md](./prepare-a-customer-health-strategy.md). 
9. **CSM**: must run [i-want-to-prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) + no naked run. 
10. **Segmentation**: must run [i-want-to-prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md) + no one-size-fits-all. 
11. **Monetization**: must run [i-want-to-prepare-a-monetization-strategy.md](./prepare-a-monetization-strategy.md) + no naked run. 
12. **Pricing**: must run [pricing-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-pricing-strategy.md) + no gut call. 
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) recommendation library + no multi-source. 
14. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) for gradual rollout of recommendations. 
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); CSM / sales / TL / sponsor owner. 
17. **Freeze period**: during big promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — don't touch recommendation rules. 
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for upgrade rate / ARPU / conversion alerts. 
20. **Retrospective**: after an upgrade failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether recommendations are still accurate + whether bundles are still reasonable. 
22. **ADR**: upgrade decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: upgrade done well → ARPU rises → revenue rises → more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Similar journey: [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) — CSM
- Similar journey: [./prepare-a-monetization-strategy.md](./prepare-a-monetization-strategy.md) — monetization
- Similar journey: [./prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md) — segmentation
- Similar journey: [./prepare-a-quote-to-cash-strategy.md](./prepare-a-quote-to-cash-strategy.md) — QTC
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry
