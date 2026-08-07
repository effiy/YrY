---

title: I want to prepare a paid media strategy
aliases:
- I want to prepare a paid media strategy
- paid-media-journey
- ppc-journey
- sem-journey
- paid-ads-journey
- paid media entry
tags:
- journeys
- paid-media
- ppc
- sem
- display-ads
- retargeting
- social-ads
- attribution
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
- ./prepare-a-demand-generation-strategy.md
- ./prepare-a-content-strategy.md
- ./prepare-a-budget.md
- ./prepare-a-marketing-operations-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a paid media strategy

> **As an** engineer, **I want to** prepare a paid media, **so that** launch is safe. 

> "ppc + sem + display + retargeting + social ads + attribution + budget + governance + quarterly audit" reachable within 2 hops: process + thinking + case study. 

## Summary

- Process go [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking go [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform go [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study go [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

Prepare paid media / ppc / sem / display / retargeting / social ads / attribution / budget / governance / communication / big-promo freeze / quarterly audit / retrospective; when TL + marketing + MOPS + RevOps + sponsor need to look up process + thinking + case study. This entry aggregates paid-media-related process + thinking + case study into a 2-hop path, avoiding "ppc scattered / sem wasted / retargeting missed / attribution chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — paid intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [growth-strategy-summary.md](./prepare-a-growth-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [business-model-summary.md](../../executive/strategy/business-model-canvas.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — paid communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — MOPS matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — paid incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — paid business |
| `projects/` | each project `architecture-summary.md` §MOPS + `adr-*` §paid |
| `journeys/` | [./prepare-a-demand-generation-strategy.md](./prepare-a-demand-generation-strategy.md) · [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) · [./prepare-a-budget.md](./prepare-a-budget.md) · [./prepare-a-marketing-operations-strategy.md](./prepare-a-marketing-operations-strategy.md) · [../processes/run-an-a-b-test.md](../processes/run-an-a-b-test.md) |

## Action recommendations

1. **First principles**: first ask "what does paid media solve / what if not done / ROI / business impact"; do not spend money just to spend money; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how can paid fail (ppc scattered / sem wasted / retargeting missed / attribution chaos / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one investment -> behavior changes -> another investment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam's razor**: the simplest placement that satisfies business wins; do not pile up channels; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **ppc**: must do ppc keywords + no scattering; follow [i-want-to-prepare-a-search-strategy.md](./prepare-a-search-strategy.md). 
6. **sem**: must do sem selection / bidding + no gut calls. 
7. **Display**: must do display ads + no chaos. 
8. **Retargeting**: must do retargeting + no over-targeting. 
9. **Social ads**: must do social ads + no naked run. 
10. **Attribution**: must do attribution model (first-touch / last-touch / multi-touch / MMM) + no gut calls; follow [i-want-to-prepare-a-marketing-operations-strategy.md](./prepare-a-marketing-operations-strategy.md). 
11. **Budget**: must do [i-want-to-prepare-a-budget.md](./prepare-a-budget.md) + no overspend. 
12. **A/B**: must do [i-want-to-run-an-a-b-test.md](../processes/run-an-a-b-test.md) + no intuition. 
13. **SSOT**: must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) placement library + no multi-source. 
14. **Contract test**: must do [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
15. **Cache**: must do [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute. 
16. **RACI**: must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); MOPS / marketing / RevOps / TL owner. 
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move placements. 
18. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally.
19. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) CPC / CTR / CPL / ROI alert. 
20. **Retrospective**: after paid incident, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether channels are still reasonable / attribution is still accurate. 
22. **ADR**: paid decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: paid done well → conversion rises → revenue rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [./prepare-a-demand-generation-strategy.md](./prepare-a-demand-generation-strategy.md) — demand generation
- Related journey: [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) — content
- Related journey: [./prepare-a-budget.md](./prepare-a-budget.md) — budget
- Related journey: [./prepare-a-marketing-operations-strategy.md](./prepare-a-marketing-operations-strategy.md) — MOPS
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
