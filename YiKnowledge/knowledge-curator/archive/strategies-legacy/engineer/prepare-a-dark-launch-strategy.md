---

title: I want to prepare a dark launch strategy
aliases:
- I want to prepare a dark launch strategy
- dark-launch-journey
- feature-shadow-journey
- dark launch entry
tags:
- journeys
- dark-launch
- feature-shadow
- traffic-mirror
- progressive-delivery
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
- ./prepare-a-progressive-delivery-strategy.md
- ./prepare-a-shadow-traffic-strategy.md
- ./prepare-a-canary-release-strategy.md
- ./prepare-a-feature-flag-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a dark launch strategy

> **As an** engineer, **I want to** prepare a dark launch, **so that** launch is safe. 

> "Dark launch + shadow + traffic mirror + governance + quarterly audit" reach within 2 hops to process + thinking + case study. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing dark launch / shadow traffic / traffic mirror / governance / big-promo freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + case study. This entry aggregates dark-launch-related process + thinking + case study into 2-hop path, avoiding "dark launch scattered / shadow missed / mirror messy / closed loop missed / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — dark launch intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagining scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | dark-launch · feature-shadow · traffic-mirror · progressive-delivery |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | dark-runtime · shadow-store · mirror-engine · audit-log |
| `tech/ai-foundations/` | dark-patterns · shadow-suite · mirror-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — dark launch reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — dark launch postmortem archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — dark launch business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §dark launch |
| `journeys/` | [./prepare-a-progressive-delivery-strategy.md](./prepare-a-progressive-delivery-strategy.md) · [./prepare-a-shadow-traffic-strategy.md](./prepare-a-shadow-traffic-strategy.md) · [./prepare-a-canary-release-strategy.md](./prepare-a-canary-release-strategy.md) · [./prepare-a-feature-flag-strategy.md](./prepare-a-feature-flag-strategy.md) · [./prepare-a-ring-deployment-strategy.md](./prepare-a-ring-deployment-strategy.md) |

## Action recommendations

1. **first principles**: first ask "dark launch what to solve / what happens if not done / ROI / business impact"; do not dark launch for dark launch's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **inversion**: first imagine "dark launch could go out of control (dark launch scattered / shadow missed / mirror messy / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **second-order effects**: one dark -> behavior changes -> another dark; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest dark launch that satisfies business wins; do not pile up mirror; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **dark launch**: must run dark launch / shadow / not exposed + no scatter. 
6. **mirror**: must run mirror / traffic / copy + no miss. 
7. **compare**: must run compare / metric / diff + no miss. 
8. **rollback**: must run rollback / auto / owner + no miss. 
9. **progressive delivery**: must run [i-want-to-prepare-a-progressive-delivery-strategy.md](./prepare-a-progressive-delivery-strategy.md) + no naked run. 
10. **shadow traffic**: must run [i-want-to-prepare-a-shadow-traffic-strategy.md](./prepare-a-shadow-traffic-strategy.md) + no naked run. 
11. **canary**: must run [i-want-to-prepare-a-canary-release-strategy.md](./prepare-a-canary-release-strategy.md) + no naked run. 
12. **feature flag**: must run [i-want-to-prepare-a-feature-flag-strategy.md](./prepare-a-feature-flag-strategy.md) + no naked run. 
13. **ring deployment**: must run [i-want-to-prepare-a-ring-deployment-strategy.md](./prepare-a-ring-deployment-strategy.md) + no naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) dark launch library + no multi-source. 
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner. 
17. **freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move dark launch. 
18. **reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) report internally and externally. 
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) shadow diff alert. 
20. **retrospective**: after dark launch postmortem must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether dark launch is still accurate / mirror is still reasonable. 
22. **ADR**: dark launch decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **flywheel**: dark launch good -> risk down -> trust rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- same-category journey: [./prepare-a-progressive-delivery-strategy.md](./prepare-a-progressive-delivery-strategy.md) — progressive delivery
- same-category journey: [./prepare-a-shadow-traffic-strategy.md](./prepare-a-shadow-traffic-strategy.md) — shadow traffic
- same-category journey: [./prepare-a-canary-release-strategy.md](./prepare-a-canary-release-strategy.md) — canary
- same-category journey: [./prepare-a-feature-flag-strategy.md](./prepare-a-feature-flag-strategy.md) — feature flag
- upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
