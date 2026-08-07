---

title: I want to prepare a loss analysis strategy
aliases:
- I want to prepare a loss analysis strategy
- loss-analysis-journey
- win-loss-analysis-journey
- lost-deal-journey
- Loss analysis entry
tags:
- journeys
- loss-analysis
- win-loss
- lost-deal
- competitive-loss
- price-loss
- churn-cause
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
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-competitive-intelligence-strategy.md
- ./prepare-a-customer-research-strategy.md
- ./prepare-a-positioning-strategy.md
- ./prepare-a-pricing-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a loss analysis strategy

> **As an** engineer, **I want to** prepare a loss analysis, **so that** launch is safe.

> "Loss analysis + competitor + price + feature + churn cause + governance + quarterly audit" reachable within 2 hops: process + thinking + case study.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing loss analysis / competitor / price / feature / churn cause / governance / reporting / big-promo freeze / quarterly audit / retrospective, TL + PM + PMM + sales + sponsor need to look up process + thinking + case study. This entry aggregates loss-analysis-related process + thinking + case study into a 2-hop path, avoiding "interviews scattered / cause vague / classification missed / closed loop chaotic / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — loss intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-imagine vagueness · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [opportunity-solution-tree-summary.md](../../engineer/strategies/prepare-an-opportunity-solution-tree-strategy.md) |
| `product/strategy/` | [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [pricing-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-pricing-strategy.md) · [competitive-positioning-summary.md](./../../executive/strategy/porter-five-forces.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `industry/` | [competitors/](../../executive/industry/competitors) · [reports/](../../executive/industry/reports) · [use-cases/](../../product-manager/industry-cases) — competitor archive |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — loss reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — PM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — loss incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — loss business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §loss |
| `journeys/` | [./prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) · [./prepare-a-customer-research-strategy.md](./prepare-a-customer-research-strategy.md) · [./prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) · [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) · [./prepare-a-churn-reduction-strategy.md](./prepare-a-churn-reduction-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does loss analysis solve / what happens if not done / ROI / business impact"; do not analyze for analysis' sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "loss analysis could go out of control (interviews scattered / cause vague / classification missed / closed loop chaotic / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one analysis -> behavior changes -> another analysis; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest analysis that satisfies business wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Interview**: must run loss interviews (switch interview) + no gut call; see [i-want-to-prepare-a-customer-research-strategy.md](./prepare-a-customer-research-strategy.md).
6. **Classification**: must run loss cause classification (competitor / price / feature / process / trust) + no chaos.
7. **Competitor**: must run [i-want-to-prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) + no naked run.
8. **Price**: must run [i-want-to-prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) + no gut call.
9. **Positioning**: must run [i-want-to-prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) + no drift.
10. **Churn**: must run [i-want-to-prepare-a-churn-reduction-strategy.md](./prepare-a-churn-reduction-strategy.md) + no naked run.
11. **JTBD**: must run [i-want-to-prepare-a-jobs-to-be-done-strategy.md](../../product-manager/frameworks/prepare-a-jobs-to-be-done-strategy.md) + no naked run.
12. **Product strategy**: must run [i-want-to-prepare-a-product-strategy.md](../../product-manager/frameworks/prepare-a-product-strategy.md) + no naked run.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) loss library + no multi-source.
14. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PM / PMM / sales / TL owner.
17. **Freeze period**: during big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move analysis cadence.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) reporting internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) loss rate / cause distribution / closed loop alerts.
20. **Retrospective**: after loss incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether classification is still accurate / whether interviews are still reasonable.
22. **ADR**: loss decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good loss analysis -> accurate positioning -> higher win rate -> higher revenue; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-a-competitive-intelligence-strategy.md](./prepare-a-competitive-intelligence-strategy.md) — competition
- Same-category journey: [./prepare-a-customer-research-strategy.md](./prepare-a-customer-research-strategy.md) — research
- Same-category journey: [./prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) — positioning
- Same-category journey: [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) — pricing
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
