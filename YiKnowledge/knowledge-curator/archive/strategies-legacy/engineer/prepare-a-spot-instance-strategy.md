---

title: I want to prepare a spot instance strategy
aliases:
- I want to prepare a spot instance strategy
- spot-instance-journey
- spot-journey
- spot instance entry
tags:
- journeys
- spot-instance
- spot
- preemptible
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
- ../../tech-lead/roadmap/prepare-a-reserved-capacity-strategy.md
- ./prepare-a-savings-plan-strategy.md
- ./prepare-a-right-sizing-strategy.md
- ../../oncall-sre/incident-response/prepare-a-finops-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a spot instance strategy

> **As an** engineer, **I want to** prepare a spot instance, **so that** launch is safe.

> "Spot instance + preemption + capacity + Governance + quarterly audit" reach Process + Thinking + Case study within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing spot instance / preemption / capacity / Governance / big-promo freeze / quarterly audit / retrospective, TL + Platform + algorithm + data + sponsor need to look up Process + Thinking + Case study. This entry aggregates spot-instance-related Process + Thinking + Case study into a 2-hop path, avoiding "preemption scattered / capacity leaks / interruption risk / closed loop chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — spot intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | spot-instance · spot · preemptible · interruption |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | spot-runtime · capacity-store · interrupt-engine · audit-log |
| `tech/ai-foundations/` | spot-patterns · capacity-suite · interrupt-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — spot Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — Platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — spot incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — spot business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §spot |
| `journeys/` | [../../tech-lead/roadmap/prepare-a-reserved-capacity-strategy.md](../../tech-lead/roadmap/prepare-a-reserved-capacity-strategy.md) · [./prepare-a-savings-plan-strategy.md](./prepare-a-savings-plan-strategy.md) · [./prepare-a-right-sizing-strategy.md](./prepare-a-right-sizing-strategy.md) · [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does spot instance solve / what if not done / ROI / business impact"; do not save for saving's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how spot can fail (preemption scattered / capacity leaks / interruption risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one saving → behavior changes → another saving; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest spot that meets business wins; do not pile up strategy; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Preemption**: must do preemption / interruption / notification + no scatter.
6. **Capacity pool**: must do capacity pool / multi-AZ / fallback + no leakage.
7. **Scheduling**: must do scheduling / retry / checkpoint + no leakage.
8. **Closed loop**: must do closed loop / retrospective / archive + no leakage.
9. **Reserved capacity**: must do [i-want-to-prepare-a-reserved-capacity-strategy.md](../../tech-lead/roadmap/prepare-a-reserved-capacity-strategy.md) + no naked run.
10. **Savings Plan**: must do [i-want-to-prepare-a-savings-plan-strategy.md](./prepare-a-savings-plan-strategy.md) + no naked run.
11. **Right-sizing**: must do [i-want-to-prepare-a-right-sizing-strategy.md](./prepare-a-right-sizing-strategy.md) + no naked run.
12. **FinOps**: must do [i-want-to-prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) + no naked run.
13. **Security**: must do [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run.
14. **SSOT**: must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) capacity library + no multi-source.
15. **Contract test**: must do [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / algorithm / data / TL owner.
17. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move strategy.
18. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) internally and externally.
19. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) interruption exception alert.
20. **Retrospective**: after spot incident, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether strategy is still accurate / ratio still reasonable.
22. **ADR**: spot decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: spot good → cost down → ROI up → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [../../tech-lead/roadmap/prepare-a-reserved-capacity-strategy.md](../../tech-lead/roadmap/prepare-a-reserved-capacity-strategy.md) — reserved capacity
- Related journey: [./prepare-a-savings-plan-strategy.md](./prepare-a-savings-plan-strategy.md) — Savings Plan
- Related journey: [./prepare-a-right-sizing-strategy.md](./prepare-a-right-sizing-strategy.md) — right-sizing
- Related journey: [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) — FinOps
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
