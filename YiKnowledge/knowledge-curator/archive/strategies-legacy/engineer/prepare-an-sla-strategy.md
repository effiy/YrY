---

title: I want to prepare an SLA strategy
aliases:
- I want to prepare SLA strategy
- sla-journey
- service-level-agreement-journey
- uptime-journey
- SLA entry
tags:
- journeys
- sla
- service-level-agreement
- uptime
- latency
- slo
- error-budget
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
- ./prepare-an-sre-strategy.md
- ../../oncall-sre/incident-response/prepare-an-observability-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
- ../../tech-lead/roadmap/prepare-a-capacity-planning-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an SLA strategy

> **As an** engineer, **I want to** prepare an sla, **so that** launch is safe.

> Reach process + thinking + case studies for "SLO + error budget + communication + trust + governance + quarterly audit" within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [observability-pattern.md](../../engineer/patterns/observability.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md)
- Case studies follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing SLA / SLO / error budget / communication / trust / governance / big-promo freeze / quarterly audit / retrospective, TL + SRE + PM + legal + sales + sponsor need to look up process + thinking + case studies. This entry aggregates SLA-related process + thinking + case studies into a 2-hop path, avoiding "empty promises / measurement gaps / messy trust / scattered closed loop / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [caching-pattern.md](../../engineer/patterns/caching.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — SLA intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert the emptiness · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) · [security-strategy-summary.md](../../engineer/strategies/prepare-a-cybersecurity-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — SLA communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — SRE matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — SLA incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — SLA business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §SLA |
| `journeys/` | [./prepare-an-sre-strategy.md](./prepare-an-sre-strategy.md) · [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) · [../../tech-lead/roadmap/prepare-a-capacity-planning-strategy.md](../../tech-lead/roadmap/prepare-a-capacity-planning-strategy.md) · [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md) |

## Action recommendations

1. **First principles**: First ask "what does SLA solve / what if not done / ROI / business impact"; don't make promises for the sake of promises; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "how SLA can fail (empty promises / measurement gaps / messy trust / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One commitment -> behavior changes -> another commitment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: The simplest SLA that satisfies business wins; don't pile metrics; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **SLI**: must do SLI / metric + gut-check.
6. **SLO**: must do SLO / target + no scattering.
7. **Error budget**: must do error budget / burn rate + no leakage.
8. **Measurement**: must do measurement / dashboard / red-black + no leakage; follow [i-want-to-prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md).
9. **SRE**: must do [i-want-to-prepare-an-sre-strategy.md](./prepare-an-sre-strategy.md) + no naked run.
10. **Incident**: must do [i-want-to-prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) + no leakage.
11. **Capacity**: must do [i-want-to-prepare-a-capacity-planning-strategy.md](../../tech-lead/roadmap/prepare-a-capacity-planning-strategy.md) + no naked run.
12. **DR**: must do [i-want-to-prepare-a-disaster-recovery-plan.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md) + no naked run.
13. **Trust**: must do trust / SLA penalties + no leakage.
14. **SSOT**: must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) SLA library + no multi-source.
15. **Contract test**: must do [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); SRE / PM / legal / sales / TL owners.
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move SLA.
18. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal/external comms.
19. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) error budget / burn-rate alerts.
20. **Retrospective**: after SLA incidents, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether SLO is still accurate / measurement still current.
22. **ADR**: SLA decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: SLA done well -> trust rises -> deals close faster -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-an-sre-strategy.md](./prepare-an-sre-strategy.md) — SRE
- Related journey: [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) — observability
- Related journey: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — incident
- Related journey: [../../tech-lead/roadmap/prepare-a-capacity-planning-strategy.md](../../tech-lead/roadmap/prepare-a-capacity-planning-strategy.md) — capacity
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
