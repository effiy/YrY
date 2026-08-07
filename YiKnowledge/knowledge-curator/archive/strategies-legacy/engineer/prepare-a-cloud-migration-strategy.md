---

title: I want to prepare a cloud migration strategy
aliases:
- i-want-to-prepare-a-cloud-migration-strategy
- cloud-migration-journey
- six-rs-journey
- lift-and-shift-journey
- cloud-migration-entry
tags:
- journeys
- cloud-migration
- six-rs
- rehost
- replatform
- refactor
- repurchase
- retain
- retire
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
- tech-lead
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ../../tech-lead/roadmap/decommission-a-service.md
- ./prepare-a-multi-region-strategy.md
- ./prepare-a-resilience-engineering-strategy.md
- ../../oncall-sre/observability/capacity-and-cost.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a cloud migration strategy

> **As an** engineer, **I want to** prepare a cloud migration, **so that** launch is safe.

> "Assessment + 6R + blueprint + reuse + traffic switching + rollback + acceptance + quarterly audit" reachable within 2 hops across process + thinking + cases.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [infrastructure-as-code-pattern.md](./prepare-an-infrastructure-as-code-strategy.md) + [observability-pattern.md](../../engineer/patterns/observability.md) + [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md)
- Cases via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing cloud migration / 6R / lift-and-shift / rehost / replatform / refactor / repurchase / retain / retire / assessment / blueprint / traffic switching / rollback / acceptance / big-promo freeze / quarterly audit / retrospective, TL + platform + architecture + sponsor need to query process + thinking + cases. This entry aggregates cloud-migration-related process + thinking + cases into a 2-hop path, avoiding "assessment hollow / traffic switch breakage / rollback missing / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (by class/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) |
| `methodology/engineering-patterns/` | [infrastructure-as-code-pattern.md](./prepare-an-infrastructure-as-code-strategy.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — migration intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking on breakage · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [cloud-migration-summary.md](./prepare-a-cloud-migration-strategy.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — migration notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — migration matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — migration incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-risks](../../brd/) · [reference](../../brd/) — migration business |
| `projects/` | Each project's `architecture-summary.md` §infrastructure + `adr-*` §migration |
| `journeys/` | [../../tech-lead/roadmap/decommission-a-service.md](../../tech-lead/roadmap/decommission-a-service.md) · [./prepare-a-multi-region-strategy.md](./prepare-a-multi-region-strategy.md) · [./prepare-a-resilience-engineering-strategy.md](./prepare-a-resilience-engineering-strategy.md) · [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md) |

## Action recommendations

1. **first principles**: first ask "what migration solves / what happens if not done / ROI / business impact"; do not migrate for migration's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "migration going out of control (traffic switch breakage / data loss / rollback missing / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one migration → behavior change → another adjustment; via [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest migration that meets business needs wins; do not pile up 6R; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **assessment**: must run dependency / cost / risk assessment + avoid gut call.
6. **6R**: must run rehost / replatform / refactor / repurchase / retain / retire + avoid one-size-fits-all.
7. **blueprint**: must run landing zone + avoid naked run; via [infrastructure-as-code-pattern.md](./prepare-an-infrastructure-as-code-strategy.md).
8. **reuse**: must reuse existing platforms + avoid rebuilding.
9. **dual world**: must run [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) for traffic switching + avoid one-size-fits-all.
10. **rollback**: must run rollback plan + avoid one-way; via [i-want-to-do-a-rollback-drill.md](../../oncall-sre/incident-response/do-a-rollback-drill.md).
11. **acceptance**: must run functional / performance / security acceptance + avoid gut call.
12. **feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) for gradual traffic switching.
13. **IaC**: must run [infrastructure-as-code-pattern.md](./prepare-an-infrastructure-as-code-strategy.md) + avoid manual.
14. **multi-region**: must run [i-want-to-prepare-a-multi-region-strategy.md](./prepare-a-multi-region-strategy.md) + avoid single-region.
15. **DR**: must run [i-want-to-prepare-a-disaster-recovery-plan.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md) + avoid no backup.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / architecture / TL / sponsor owner.
17. **freeze period**: big promos via [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not touch migration.
18. **notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify internal and external.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for traffic switch / error / latency alerts.
20. **retrospective**: after migration incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **quarterly audit**: via [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether migration is still accurate + whether blueprint is still reasonable.
22. **ADR**: migration decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **flywheel**: good migration → resilience rises → experience rises → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [../../tech-lead/roadmap/decommission-a-service.md](../../tech-lead/roadmap/decommission-a-service.md) — decommission
- Same-class journey: [./prepare-a-multi-region-strategy.md](./prepare-a-multi-region-strategy.md) — multi-region
- Same-class journey: [./prepare-a-resilience-engineering-strategy.md](./prepare-a-resilience-engineering-strategy.md) — resilience
- Same-class journey: [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md) — DR
- Upstream: [../../oncall-sre/observability/README.md](../../oncall-sre/observability/README.md) — infra leaf entry
