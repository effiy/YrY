---

title: I want to prepare a showback strategy
aliases:
- I want to prepare a cost visibility strategy
- showback-journey
- cost-visibility-journey
- cost visibility entry
tags:
- journeys
- showback
- cost-visibility
- chargeback
- finops
- internal-billing
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
- ../../oncall-sre/incident-response/prepare-a-finops-strategy.md
- ./prepare-a-cost-allocation.md
- ./prepare-a-metering-strategy.md
- ./prepare-a-unit-economics-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a showback strategy

> **As an** engineer, **I want to** prepare a showback, **so that** launch is safe.

> "visibility + allocation + responsible party + governance + quarterly audit" reachable within 2 hops of Process + Thinking + Case study.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing showback / cost visibility / allocation / responsible party / governance / promotion freeze / quarterly audit / retrospective, TL + Platform + data + algorithm + sponsor need to look up Process + Thinking + Case study. This entry aggregates showback-related Process + Thinking + Case study into a 2-hop path, avoiding "scattered visibility / missed allocation / drift / messy closed loop / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — visibility intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion of scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | showback · cost-visibility · chargeback · internal-billing |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | showback-runtime · cost-store · allocation-engine · audit-log |
| `tech/ai-foundations/` | showback-patterns · allocation-suite · visibility-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — visibility communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — visibility incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — visibility business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §visibility |
| `journeys/` | [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) · [./prepare-a-cost-allocation.md](./prepare-a-cost-allocation.md) · [./prepare-a-metering-strategy.md](./prepare-a-metering-strategy.md) · [./prepare-a-unit-economics-strategy.md](./prepare-a-unit-economics-strategy.md) · [./prepare-a-resource-tagging-strategy.md](./prepare-a-resource-tagging-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what showback solves / what happens if not done / ROI / business impact"; do not visibility for visibility's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "showback could go out of control (scattered visibility / missed allocation / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one-shot visibility → behaviour changes → another visibility; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest visibility that satisfies the business wins; do not pile up charts; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **visibility**: must run visibility / dashboard / consistency + no scatter.
6. **allocation**: must run allocation / model / responsible party + no miss.
7. **responsible party**: must run responsible party / single owner / change + no miss.
8. **reconciliation**: must run reconciliation / variance / closed loop + no miss.
9. **FinOps**: must run [i-want-to-prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) + no naked run.
10. **cost allocation**: must run [i-want-to-prepare-a-cost-allocation.md](./prepare-a-cost-allocation.md) + no naked run.
11. **metering**: must run [i-want-to-prepare-a-metering-strategy.md](./prepare-a-metering-strategy.md) + no naked run.
12. **unit economics**: must run [i-want-to-prepare-a-unit-economics-strategy.md](./prepare-a-unit-economics-strategy.md) + no naked run.
13. **resource tagging**: must run [i-want-to-prepare-a-resource-tagging-strategy.md](./prepare-a-resource-tagging-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) showback library + no multi-source.
15. **contract QA**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / data / algorithm / TL owner.
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not change visibility.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internal and external.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for visibility drift alerts.
20. **Retrospective**: after visibility incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether visibility is still accurate / whether allocation is still reasonable.
22. **ADR**: showback decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: showback good → awareness rises → governance rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) — FinOps
- Related journey: [./prepare-a-cost-allocation.md](./prepare-a-cost-allocation.md) — cost allocation
- Related journey: [./prepare-a-metering-strategy.md](./prepare-a-metering-strategy.md) — metering
- Related journey: [./prepare-a-unit-economics-strategy.md](./prepare-a-unit-economics-strategy.md) — unit economics
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
