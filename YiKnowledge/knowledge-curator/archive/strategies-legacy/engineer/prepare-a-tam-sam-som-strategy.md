---

title: I want to prepare a tam sam som strategy
aliases:
- I want to prepare a market capacity strategy
- tam-journey
- sam-journey
- som-journey
- market-size-journey
- market capacity entry
tags:
- journeys
- tam
- sam
- som
- market-size
- addressable-market
- serviceable-market
- obtainable-market
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
- ../../executive/strategy/prepare-a-market-research-strategy.md
- ../../executive/strategy/prepare-a-market-entry-strategy.md
- ./prepare-a-business-model-strategy.md
- ../../executive/strategy/prepare-a-market-research-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a tam sam som strategy

> **As an** engineer, **I want to** prepare a tam sam som, **so that** launch is safe.

> "TAM + SAM + SOM + bottom-up + top-down + penetration rate + Governance + Quarterly audit" reaches Process + Thinking + Case study within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing TAM / SAM / SOM / bottom-up / top-down / penetration rate / Governance / Communication / promotion freeze / Quarterly audit / Retrospective, TL + strategy + growth + sponsor need to look up Process + Thinking + Case study. This entry aggregates TAM/SAM/SOM related Process + Thinking + Case study to a 2-hop path, avoiding "TAM inflated / SAM scattered / SOM gut call / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — capacity essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion of inflated · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [market-research-summary.md](../../executive/strategy/prepare-a-market-research-strategy.md) · [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `industry/` | [competitors/](../../executive/industry/competitors) · [market-trends/](../../executive/industry/market-trends) · [reports/](../../executive/industry/reports) — market capacity reference |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — capacity Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — strategy matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — capacity incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [reference](../../brd/) — capacity business |
| `projects/` | each project `architecture-summary.md` §strategy + `adr-*` §TAM |
| `journeys/` | [../../executive/strategy/prepare-a-market-research-strategy.md](../../executive/strategy/prepare-a-market-research-strategy.md) · [../../executive/strategy/prepare-a-market-entry-strategy.md](../../executive/strategy/prepare-a-market-entry-strategy.md) · [./prepare-a-business-model-strategy.md](./prepare-a-business-model-strategy.md) · [./prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) |

## Action recommendations

1. **First principles**: first ask "TAM/SAM/SOM what to solve / what happens if not done / ROI / business impact"; don't capacity for capacity's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "TAM/SAM/SOM could go out of control (TAM inflated / SAM scattered / SOM gut call / decision wrong)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one-shot adjustment → row behavior changes → another one-shot adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: satisfy business with the simplest capacity; don't pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **TAM**: must run TAM estimation (top-down / bottom-up) + no gut call.
6. **SAM**: must run SAM segmentation (geography / industry) + no ambiguity.
7. **SOM**: must run SOM estimation (share / penetration) + no gut call.
8. **Bottom-up**: must run bottom-up (customer count × ARPU) + no gut call.
9. **Top-down**: must run top-down (industry report × penetration rate) + no gut call.
10. **Market research**: must run [i-want-to-prepare-a-market-research-strategy.md](../../executive/strategy/prepare-a-market-research-strategy.md) + no naked run.
11. **Market entry**: must run [i-want-to-prepare-a-market-entry-strategy.md](../../executive/strategy/prepare-a-market-entry-strategy.md) + no naked run.
12. **Business pattern**: must run [i-want-to-prepare-a-business-model-strategy.md](./prepare-a-business-model-strategy.md) + no naked run.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) capacity library + no multi-source.
14. **Contract QA**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no re-compute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); strategy / growth / TL / sponsor owner.
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), don't move the numbers.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal and external communication.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) penetration rate / share alerts.
20. **Retrospective**: after capacity incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether TAM still accurate / SOM still reasonable.
22. **ADR**: capacity decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: capacity accurate → targeting accurate → growth fast → more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [../../executive/strategy/prepare-a-market-research-strategy.md](../../executive/strategy/prepare-a-market-research-strategy.md) — market research
- Related journey: [../../executive/strategy/prepare-a-market-entry-strategy.md](../../executive/strategy/prepare-a-market-entry-strategy.md) — market entry
- Related journey: [./prepare-a-business-model-strategy.md](./prepare-a-business-model-strategy.md) — business pattern
- Related journey: [./prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) — competitive intelligence
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
