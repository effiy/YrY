---

title: I want to prepare an incident triage strategy
aliases:
- I want to prepare an incident triage strategy
- incident-triage-journey
- triage-strategy-journey
- incident triage entry
tags:
- journeys
- incident-triage
- triage
- severity-routing
- paging
- sre
category: oncall-sre/incident-response
created: 2026-08-04
updated: 2026-08-04
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-an-incident-response-strategy.md
- ./prepare-an-incident-commander-strategy.md
- ../../engineer/strategies/prepare-an-on-call-strategy.md
- ./prepare-an-incident-drill-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an incident triage strategy

> **As a** oncall sre, **I want to** prepare an incident triage, **so that** launch is safe.

> "Triage + severity + route + governance + quarterly audit" reaches process + thinking + cases within 2 hops.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing incident triage / severity / route / governance / promotion freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + cases. This entry aggregates triage-related process + thinking + cases into a 2-hop path, avoiding "triage scattered / severity drift / route missed / closed-loop chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of triage · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert to imagine scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | incident-triage · triage · severity-routing · paging |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | triage-runtime · severity-store · routing-engine · audit-log |
| `tech/ai-foundations/` | triage-patterns · severity-suite · routing-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — triage notifications |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — triage incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — triage business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §triage |
| `journeys/` | [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) · [./prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) · [../../engineer/strategies/prepare-an-on-call-strategy.md](../../engineer/strategies/prepare-an-on-call-strategy.md) · [./prepare-an-incident-drill-strategy.md](./prepare-an-incident-drill-strategy.md) · [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what triage problem to solve / what happens if not done / ROI / business impact"; do not triage for the sake of triage; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "triage could go out of control (triage scattered / severity drift / route missed / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One triage → behavior changes → another triage; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest triage that meets business needs wins; do not pile up tiers; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Triage**: Must run triage / screening / priority + avoid scatter.
6. **Severity**: Must run severity / Sev / standards + avoid misses.
7. **Route**: Must run route / responsible person / escalation + avoid misses.
8. **Closed loop**: Must run closed loop / action items / retrospective + avoid misses.
9. **Incident response**: Must run [i-want-to-prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) + avoid naked runs.
10. **Incident command**: Must run [i-want-to-prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) + avoid naked runs.
11. **On-call**: Must run [i-want-to-prepare-an-on-call-strategy.md](../../engineer/strategies/prepare-an-on-call-strategy.md) + avoid naked runs.
12. **Drill**: Must run [i-want-to-prepare-an-incident-drill-strategy.md](./prepare-an-incident-drill-strategy.md) + avoid naked runs.
13. **Blameless retrospective**: Must run [i-want-to-prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) + avoid naked runs.
14. **SSOT**: Must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for the triage library + avoid multi-source.
15. **Contract test**: Must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + avoid naked runs.
16. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner.
17. **Freeze period**: During promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change triage rules.
18. **Notifications**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify inside and outside.
19. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for triage coverage alerts.
20. **Retrospective**: After a triage incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: Use [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether triage is still accurate / whether Sev is still reasonable.
22. **ADR**: Triage decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: Good triage → faster response → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) — incident response
- similar journey: [./prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) — incident command
- similar journey: [../../engineer/strategies/prepare-an-on-call-strategy.md](../../engineer/strategies/prepare-an-on-call-strategy.md) — on-call
- similar journey: [./prepare-an-incident-drill-strategy.md](./prepare-an-incident-drill-strategy.md) — drill
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
