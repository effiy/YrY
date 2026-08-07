---

title: I want to prepare an on call strategy
aliases:
- I want to prepare an on-call strategy
- on-call-strategy-journey
- oncall-journey
- on-call entry
tags:
- journeys
- on-call
- oncall
- follow-the-sun
- escalation
- paging-policy
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
- body contains user-story header + 7 fixed-order sections
related:
- ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md
- ./prepare-an-alerting-strategy.md
- ./prepare-an-sre-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an on call strategy

> **As an** engineer, **I want to** prepare an on call, **so that** launch is safe.

> Reach process + thinking + case studies within 2 hops across "rotation + follow-the-sun + escalation + paging + governance + quarterly audit".

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing on-call / rotation / follow-the-sun / escalation / paging / governance / launch freeze / quarterly audit / retrospective, TL + SRE + platform + algorithm + sponsor need to look up process + thinking + case studies. This entry aggregates on-call-related process + thinking + case studies into a 2-hop path, avoiding "scattered rotation / missed escalation / drift / messy closed loop / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — on-call intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion-imagine scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | on-call · follow-the-sun · escalation · paging-policy |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | oncall-runtime · pager-store · escalation-engine · audit-log |
| `tech/ai-foundations/` | oncall-patterns · rotation-suite · paging-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — on-call comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — SRE matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — on-call incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — on-call business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §on-call |
| `journeys/` | [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md) · [./prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) · [./prepare-an-sre-strategy.md](./prepare-an-sre-strategy.md) · [../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md](../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does on-call solve / what if not done / ROI / business impact"; do not on-call for on-call's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how on-call can fail (scattered rotation / missed escalation / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one on-call rotation → behavior changes → another rotation; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest on-call that meets business wins; do not stack layers; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Rotation**: must run primary / backup / weekly / no-overload; no scatter.
6. **Follow-the-sun**: must run time zones / relay / handoff; no leaks.
7. **Escalation**: must run escalation / time limits / primary-backup; no leaks.
8. **Paging strategy**: must run paging / priority / silent; no leaks.
9. **Incident response**: must follow [i-want-to-prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md); no naked run.
10. **Incident commander**: must follow [i-want-to-prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md); no naked run.
11. **Alerting**: must follow [i-want-to-prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md); no naked run.
12. **SRE**: must follow [i-want-to-prepare-an-sre-strategy.md](./prepare-an-sre-strategy.md); no naked run.
13. **Retrospective**: must follow [i-want-to-prepare-an-incident-postmortem-strategy.md](../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md); no naked run.
14. **SSOT**: must follow [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for the on-call library; no multi-source.
15. **Contract test**: must follow [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md); no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); SRE / platform / algorithm / TL owners.
17. **Freeze period**: during launches follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) with strengthened on-call.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for page-storm alerts.
20. **Retrospective**: after an on-call incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) and archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether rotation is still accurate / escalation still reasonable.
22. **ADR**: on-call decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good on-call → fast response → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — incident response
- Related journey: [../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md) — incident commander
- Related journey: [./prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) — alerting
- Related journey: [./prepare-an-sre-strategy.md](./prepare-an-sre-strategy.md) — SRE
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
