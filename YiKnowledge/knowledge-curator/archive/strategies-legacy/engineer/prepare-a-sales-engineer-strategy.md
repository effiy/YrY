---

title: I want to prepare a sales engineer strategy
aliases:
- i-want-to-prepare-a-sales-engineer-strategy
- sales-engineer-journey
- se-sales-journey
- sales-engineer-entry
tags:
- journeys
- sales-engineer
- se
- technical-sales
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-solution-engineer-strategy.md
- ./prepare-a-presales-strategy.md
- ./prepare-a-sales-process-strategy.md
- ./prepare-a-sales-enablement-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a sales engineer strategy

> **As an** engineer, **I want to** prepare a sales engineer, **so that** launch is safe. 

> "Sales engineer + tech sales + demo + governance + quarterly audit" reaches Process + Thinking + Case study within 2 hops. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing for sales engineer / tech sales / demo / governance / promotion freeze / quarterly audit / retrospective, TL + presales + sales + product + sponsor need to look up Process + Thinking + Case study. This entry aggregates sales-engineer-related Process + Thinking + Case study into a 2-hop path, avoiding "demo scattered / review missed / single-point risk / closed loop chaos / no quarterly audit". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — sales intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagined scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | sales-engineer · se · technical-sales · demo |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | se-runtime · demo-store · enablement-engine · audit-log |
| `tech/ai-foundations/` | se-patterns · demo-suite · enablement-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — SE Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — Platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — SE Incident Archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — SE business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §SE |
| `journeys/` | [./prepare-a-solution-engineer-strategy.md](./prepare-a-solution-engineer-strategy.md) · [./prepare-a-presales-strategy.md](./prepare-a-presales-strategy.md) · [./prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) · [./prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does SE solve / what happens if not done / ROI / business impact"; not tech for tech's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First imagine "SE could go out of control (demo scattered / review missed / single-point risk / trust collapse) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: One-off tech → behavior change → another one-off tech; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest SE that satisfies business wins; do not pile up demos; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Demo**: Must run demo / script / replay + no scatter. 
6. **Review**: Must run review / scope / red line + no miss. 
7. **Observable**: Must run observable / trace / audit + no miss. 
8. **Closed loop**: Must run closed loop / retrospective / archive + no miss. 
9. **Solution engineer**: Must run [i-want-to-prepare-a-solution-engineer-strategy.md](./prepare-a-solution-engineer-strategy.md) + no naked run. 
10. **Presales**: Must run [i-want-to-prepare-a-presales-strategy.md](./prepare-a-presales-strategy.md) + no naked run. 
11. **Sales process**: Must run [i-want-to-prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) + no naked run. 
12. **Sales enablement**: Must run [i-want-to-prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) + no naked run. 
13. **Security**: Must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run. 
14. **SSOT**: Must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) demo library + no multi-source. 
15. **Contract QA**: Must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / presales / sales / product owner. 
17. **Freeze period**: During promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move demos. 
18. **Communication**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate inside and outside. 
19. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) SE anomaly alert. 
20. **Retrospective**: After SE incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan demos whether still accurate / review whether still reasonable. 
22. **ADR**: SE decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: SE done well → win rate rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [./prepare-a-solution-engineer-strategy.md](./prepare-a-solution-engineer-strategy.md) — solution engineer
- Related journey: [./prepare-a-presales-strategy.md](./prepare-a-presales-strategy.md) — presales
- Related journey: [./prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) — sales process
- Related journey: [./prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) — sales enablement
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
