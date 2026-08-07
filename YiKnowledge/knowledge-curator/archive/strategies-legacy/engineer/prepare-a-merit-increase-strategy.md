---

title: I want to prepare a merit increase strategy
aliases:
- i-want-to-prepare-a-merit-increase-strategy
- merit-increase-journey
- merit-raise-journey
- merit-increase-entry
tags:
- journeys
- merit-increase
- merit-raise
- compensation-review
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
- ./prepare-a-compensation-strategy.md
- ./prepare-a-pay-equity-strategy.md
- ./prepare-a-salary-band-strategy.md
- ./prepare-a-performance-management-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a merit increase strategy

> **As an** engineer, **I want to** prepare a merit increase, **so that** launch is safe.

> "Merit increase + budget + matrix + governance + quarterly audit" — process + thinking + case study reachable within 2 hops.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing merit increase / budget / matrix / governance / big-promotion freeze / quarterly audit / retrospective, TL + HR + finance + business + sponsor need process + thinking + case study. This entry aggregates merit-increase-related process + thinking + case study into a 2-hop path, to avoid "budget scattered / matrix missed / out-of-bounds risk / closed-loop chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of merit increase · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reaction · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | merit-increase · merit-raise · compensation-review · budget |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | merit-runtime · budget-store · matrix-engine · audit-log |
| `tech/ai-foundations/` | merit-patterns · budget-suite · matrix-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — merit-increase comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — merit-increase rollover archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — merit-increase business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §merit increase |
| `journeys/` | [./prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) · [./prepare-a-pay-equity-strategy.md](./prepare-a-pay-equity-strategy.md) · [./prepare-a-salary-band-strategy.md](./prepare-a-salary-band-strategy.md) · [./prepare-a-performance-management-strategy.md](./prepare-a-performance-management-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does merit increase solve / what happens if not done / ROI / business impact"; do not increase for increase's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first think "how merit increase could go out of control (budget scattered / matrix missed / out-of-bounds risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one increase → behavior change → another increase; via [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest merit increase that satisfies business wins; do not pile up matrices; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **budget**: must run budget / pool / cap + no scatter.
6. **matrix**: must run matrix / rating / position + no miss.
7. **observable**: must run observable / traceable / audit + no miss.
8. **closed loop**: must run closed loop / retrospective / archive + no miss.
9. **compensation**: must run [i-want-to-prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) + no naked run.
10. **pay equity**: must run [i-want-to-prepare-a-pay-equity-strategy.md](./prepare-a-pay-equity-strategy.md) + no naked run.
11. **salary band**: must run [i-want-to-prepare-a-salary-band-strategy.md](./prepare-a-salary-band-strategy.md) + no naked run.
12. **performance management**: must run [i-want-to-prepare-a-performance-management-strategy.md](./prepare-a-performance-management-strategy.md) + no naked run.
13. **safety**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) budget library + no multi-source.
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / finance / business owner.
17. **freeze window**: during big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move merit increase.
18. **comms**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal/external comms.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for merit-increase exception alerts.
20. **retrospective**: after merit-increase rollover, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
21. **quarterly audit**: via [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether budget still accurate / matrix still reasonable.
22. **ADR**: merit-increase decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **flywheel**: merit increase good → retention up → trust up → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- same-class journey: [./prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) — compensation
- same-class journey: [./prepare-a-pay-equity-strategy.md](./prepare-a-pay-equity-strategy.md) — pay equity
- same-class journey: [./prepare-a-salary-band-strategy.md](./prepare-a-salary-band-strategy.md) — salary band
- same-class journey: [./prepare-a-performance-management-strategy.md](./prepare-a-performance-management-strategy.md) — performance management
- upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
