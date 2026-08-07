---

title: I want to prepare a professional services strategy
aliases:
- i-want-to-prepare-a-professional-services-strategy
- professional-services-journey
- ps-journey
- implementation-journey
- professional services entry
tags:
- journeys
- professional-services
- implementation
- consulting
- delivery
- psc
- psa
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
- ./prepare-a-customer-onboarding-strategy.md
- ./prepare-a-customer-success-plan.md
- ./prepare-a-budget.md
- ../../engineer/processes/collaboration/raci-matrix.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a professional services strategy

> **As an** engineer, **I want to** prepare a professional services, **so that** launch is safe.

> "Delivery + methodology + SOW + Acceptance + resource + PSA + Governance + Quarterly audit" reach within 2 hops Process + Thinking + Case study.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing professional service / PS / implementation / consulting / delivery / SOW / Acceptance / resource / PSA / Governance / Communication / promotion freeze / Quarterly audit / Retrospective, TL + PS + CSM + sponsor need to look up Process + Thinking + Case study. this entry aggregates PS related Process + Thinking + Case study into a 2-hop path, avoiding "delivery inflated / Acceptance missed / resource chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — service intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — Inversion for collapse · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [customer-success-summary.md](../../engineer/strategies/prepare-a-customer-success-strategy.md) · [customer-onboarding-summary.md](./prepare-a-customer-onboarding-strategy.md) · [business-model-summary.md](../../executive/strategy/business-model-canvas.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — service Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — PS matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — service Incident Archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — service business |
| `projects/` | each project `architecture-summary.md` §service + `adr-*` §PS |
| `journeys/` | [./prepare-a-customer-onboarding-strategy.md](./prepare-a-customer-onboarding-strategy.md) · [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) · [./prepare-a-budget.md](./prepare-a-budget.md) · [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) |

## Action recommendations

1. **First principles**: first ask "what does service solve / what happens if not done / ROI / business impact"; don't do service for service's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "service could go out of control (delivery inflated / Acceptance missed / resource chaos / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one-time adjustment → row changes → another one-time adjustment; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest methodology that satisfies business wins; don't pile up Templates; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **methodology**: must run delivery methodology + no gut calls.
6. **SOW**: must run SOW + no ambiguity.
7. **delivery**: must run clear deliverables + no ambiguity.
8. **Acceptance**: must run Acceptance standard + no gut calls; follow [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md).
9. **resource**: must run resource scheduling + no random piling; follow [i-want-to-prepare-a-budget.md](./prepare-a-budget.md).
10. **PSA**: must run PSA tool + no scatter.
11. **onboarding**: must run [i-want-to-prepare-a-customer-onboarding-strategy.md](./prepare-a-customer-onboarding-strategy.md) + no naked run.
12. **CSM**: must run [i-want-to-prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) + no naked run.
13. **handoff**: must run [i-want-to-handoff-project.md](../../new-hire/onboarding/handoff-project.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) delivery library + no multi-source.
15. **cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no re-compute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PS / CSM / TL / sponsor owner.
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not change delivery Templates.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate inside and outside.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) utilization / Acceptance / CSAT alerts.
20. **Retrospective**: after service Incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether methodology still accurate + whether resource still reasonable.
22. **ADR**: service Decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: service good → experience rises → renewal rises → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-customer-onboarding-strategy.md](./prepare-a-customer-onboarding-strategy.md) — onboarding
- Related journey: [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) — CSM
- Related journey: [./prepare-a-budget.md](./prepare-a-budget.md) — budget
- Related journey: [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) — handoff
- Upstream: [../../engineer/processes/collaboration/README.md](../../engineer/processes/collaboration/README.md) — collaboration leaf entry
