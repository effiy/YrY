---

title: I want to prepare a career framework strategy
aliases:
- career framework strategy
- career-framework-journey
- career-architecture-journey
- career framework entry
tags:
- journeys
- career-framework
- career-architecture
- career
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
- ./prepare-a-skill-matrix-strategy.md
- ./prepare-a-competency-matrix-strategy.md
- ./prepare-a-career-strategy.md
- ../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a career framework strategy

> **As an** engineer, **I want to** prepare a career framework, **so that** launch is safe. 

> "Career framework + ladder + track + governance + quarterly audit" reaches process + thinking + cases within 2 hops. 

## Summary

- process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing career framework / ladder / track / governance / promo freeze / quarterly audit / retrospective, TL + HR + L&D + business + sponsor need to look up process + thinking + cases. This entry aggregates career-framework related process + thinking + cases within a 2-hop path, avoiding "scattered ladder / missed track / blocking risk / chaotic closed loop / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — framework original intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — think in reverse · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reaction · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | career-framework · career-architecture · ladder · track |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | career-runtime · track-store · promote-engine · audit-log |
| `tech/ai-foundations/` | career-patterns · track-suite · promote-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — framework notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — framework incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — framework business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §framework |
| `journeys/` | [./prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) · [./prepare-a-competency-matrix-strategy.md](./prepare-a-competency-matrix-strategy.md) · [./i-want-to-prepare-a-career-ladder-strategy.md](./prepare-an-engineering-career-ladder.md) · [../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does the framework solve / what happens if not done / ROI / business impact"; do not build a framework for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **inversion**: first imagine "the framework could go out of control (scattered ladder / missed track / blocking risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **second-order effects**: one framework -> behavior change -> another framework; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest framework that satisfies business wins; do not pile up tracks; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **ladder**: must run ladder / level / tier + no scatter. 
6. **track**: must run track / IC / management + no omission. 
7. **observable**: must run observable / traceability / audit + no leak. 
8. **closed loop**: must run closed loop / retrospective / archive + no leak. 
9. **skill matrix**: must run [i-want-to-prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) + no bare run. 
10. **competency**: must run [i-want-to-prepare-a-competency-matrix-strategy.md](./prepare-a-competency-matrix-strategy.md) + no bare run. 
11. **career ladder**: must run [i-want-to-prepare-a-career-ladder-strategy.md](./prepare-an-engineering-career-ladder.md) + no bare run. 
12. **job architecture**: must run [i-want-to-prepare-a-job-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md) + no bare run. 
13. **security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no bare run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) framework library + no multi-source. 
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no bare run. 
16. **RACI**: must follow [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / L&D / business owner. 
17. **freeze period**: during promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not change framework. 
18. **notification**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify internally and externally. 
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for framework exception alerts. 
20. **retrospective**: after framework incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs). 
21. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether ladder is still accurate / track still reasonable. 
22. **ADR**: framework decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **flywheel**: framework done well -> retention rises -> trust rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- same-class journey: [./prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) — skill matrix
- same-class journey: [./prepare-a-competency-matrix-strategy.md](./prepare-a-competency-matrix-strategy.md) — competency
- same-class journey: [./i-want-to-prepare-a-career-ladder-strategy.md](./prepare-an-engineering-career-ladder.md) — career ladder
- same-class journey: [../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md) — job architecture
- upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
