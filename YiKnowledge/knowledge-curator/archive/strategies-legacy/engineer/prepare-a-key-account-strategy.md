---

title: I want to prepare a key account strategy
aliases:
- I want to prepare a key account strategy
- key-account-journey
- kam-journey
- strategic-account-journey
- key account entry
tags:
- journeys
- key-account
- kam
- strategic-account
- account-plan
- abm
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
- ./prepare-a-customer-segmentation-strategy.md
- ./prepare-a-territory-strategy.md
- ../../engineer/strategies/prepare-a-customer-success-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a key account strategy

> **As an** engineer, **I want to** prepare a key account, **so that** launch is safe. 

> "Key account + account plan + ABM + strategic account + resource tilt + governance + quarterly audit" 2-hop reachable process + thinking + cases. 

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Cases via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing key accounts / KAM / account plan / ABM / strategic accounts / resource tilt / governance / reporting / big-promo freeze / quarterly audit / retrospective, TL + KAM + CSM + sponsor need to look up process + thinking + cases. This entry aggregates key-account-related process + thinking + cases to a 2-hop path, avoiding "empty account plan / scattered resources / missing relationships / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — key account intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [customer-success-summary.md](../../engineer/strategies/prepare-a-customer-success-strategy.md) · [customer-segmentation-summary.md](../../executive/strategy/prepare-a-market-segmentation-strategy.md) · [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) |
| `product/metrics/` | [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — key account reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — KAM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — key account failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — key account business |
| `projects/` | each project `architecture-summary.md` §KAM + `adr-*` §key account |
| `journeys/` | [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) · [./prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md) · [./prepare-a-territory-strategy.md](./prepare-a-territory-strategy.md) · [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) |

## Action recommendations

1. **First principles**: First ask "what does a key account solve / what happens if not done / ROI / business impact"; do not do key accounts for the sake of key accounts; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First imagine "key accounts could go out of control (empty account plan / scattered resources / missing relationships / trust collapse) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: One round of adjustment → behavior change → another round of adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest key-account setup that meets business wins; do not pile up KAM; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Identify**: Must run key-account identification (revenue / strategy / growth) + no gut call; follow [i-want-to-prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md). 
6. **Account plan**: Must run account plan + no emptiness. 
7. **Relationship map**: Must run stakeholder map + no scatter; follow [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md). 
8. **ABM**: Must run ABM (account-based marketing) + no naked running. 
9. **Resource tilt**: Must run resource tilt + no averaging. 
10. **QBR**: Must run [i-want-to-prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) + no naked running. 
11. **CSM**: Must run [i-want-to-prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) + no naked running. 
12. **Territory**: Must run [i-want-to-prepare-a-territory-strategy.md](./prepare-a-territory-strategy.md) + no overlap. 
13. **SSOT**: Must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) key-account store + no multi-source. 
14. **Feature flag**: Must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) for gradual service rollout. 
15. **Cache**: Must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute. 
16. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); KAM / CSM / TL / sponsor owner. 
17. **Freeze period**: During big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change account plan. 
18. **Reporting**: Must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for health / renewal / growth alerts. 
20. **Retrospective**: After a key-account failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether account plan is still accurate / whether resources are still reasonable. 
22. **ADR**: Key-account decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: Key accounts done well → renewal stable → growth fast → more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Similar journey: [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) — CSM
- Similar journey: [./prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md) — segmentation
- Similar journey: [./prepare-a-territory-strategy.md](./prepare-a-territory-strategy.md) — territory
- Similar journey: [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) — QBR
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry
