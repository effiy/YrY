---

title: I want to prepare a narrative strategy
aliases:
- I want to prepare a narrative strategy
- narrative-journey
- storytelling-journey
- brand-narrative-journey
- narrative entry
tags:
- journeys
- narrative
- storytelling
- brand-narrative
- company-narrative
- arc
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
- ./prepare-a-brand-strategy.md
- ./prepare-a-messaging-house-strategy.md
- ./prepare-a-pitch.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a narrative strategy

> **As an** engineer, **I want to** prepare a narrative, **so that** launch is safe. 

> "Narrative + story + company narrative + arc + audience + channel adapt + Governance + Quarterly audit" reach Process + Thinking + Case study within 2 hops. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing narrative / storytelling / company narrative / arc / audience / channel adapt / Governance / Communication / promotion freeze / Quarterly audit / Retrospective, TL + PMM + marketing + CEO office + sponsor need to look up Process + Thinking + Case study. This entry aggregates narrative related Process + Thinking + Case study into 2-hop path, avoiding "scattered narrative / vague arc / missing audience / no quarterly audit". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — narrative intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — Inversion imagine vagueness · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [brand-strategy-summary.md](./prepare-a-brand-strategy.md) · [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — narrative Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — PMM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — narrative Incident Archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — narrative business |
| `projects/` | each project `architecture-summary.md` §strategy + `adr-*` §narrative |
| `journeys/` | [./prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) · [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) · [./prepare-a-pitch.md](./prepare-a-pitch.md) · [./prepare-a-brand-voice-strategy.md](./prepare-a-brand-voice-strategy.md) |

## Action recommendations

1. **First principles**: first ask "narrative what to solve / what happens if not done / ROI / business impact"; don't narrative for narrative's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "narrative could go out of control (scattered narrative / vague arc / missing audience / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one adjustment → row changes → and one adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest narrative that satisfies business wins; don't pile up segments; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **company narrative**: must run company narrative + no gut call. 
6. **arc**: must run story arc (origin / turning / future) + no scattering. 
7. **story**: must run customer story + founder story + no vagueness; follow [i-want-to-prepare-a-customer-advocacy-strategy.md](./prepare-a-customer-advocacy-strategy.md). 
8. **audience**: must run audience adapt + no one-size-fits-all. 
9. **channel**: must run channel adapt (speech / official site / earnings report) + no scattering. 
10. **brand**: must run [i-want-to-prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) + no scattering. 
11. **messaging house**: must run [i-want-to-prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) + no scattering. 
12. **pitch**: must run [i-want-to-prepare-a-pitch.md](./prepare-a-pitch.md) + no scattering. 
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) narrative library + no multi-source. 
14. **feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) progressive narrative. 
15. **cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recomputation. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PMM / CEO office / TL / sponsor owner. 
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move narrative. 
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) Communication inside and outside. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) consistency / deviation alert. 
20. **Retrospective**: narrative Incident after must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan narrative whether still accurate + arc whether still reasonable. 
22. **ADR**: narrative Decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: narrative good → trust rises → retention rises → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [./prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) — brand
- Related journey: [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) — messaging house
- Related journey: [./prepare-a-pitch.md](./prepare-a-pitch.md) — pitch
- Related journey: [./prepare-a-brand-voice-strategy.md](./prepare-a-brand-voice-strategy.md) — brand voice
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
