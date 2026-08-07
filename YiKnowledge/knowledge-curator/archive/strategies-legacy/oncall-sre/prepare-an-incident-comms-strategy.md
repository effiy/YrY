---

title: I want to prepare an incident comms strategy
aliases:
- I want to prepare an incident comms strategy
- incident-comms-journey
- status-page-journey
- incident comms entry
tags:
- journeys
- incident-comms
- status-page
- stakeholder-comms
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
- ./prepare-an-incident-commander-strategy.md
- ./prepare-an-incident-response-strategy.md
- ./prepare-an-incident-triage-strategy.md
- ../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an incident comms strategy

> **As a** oncall sre, **I want to** prepare an incident comms, **so that** launch is safe.

> "Comms + status page + notification + governance + quarterly audit" reaches process + thinking + case study within 2 hops.

## Summary

- Process goes through [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking goes through [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform goes through [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies go through [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing incident comms / status page / notification / governance / big-promo freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + case study. This entry aggregates comms-related process + thinking + case study into 2-hop paths, avoiding "comms scattered / status page gaps / notification chaos / closed-loop missing / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of comms · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert the scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | incident-comms · status-page · stakeholder-comms · crisis-comms |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | comms-runtime · status-store · notify-engine · audit-log |
| `tech/ai-foundations/` | comms-patterns · status-suite · notify-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — comms notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — comms failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — comms business |
| `projects/` | Each project `architecture-summary.md` § PM + `adr-*` § comms |
| `journeys/` | [./prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) · [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) · [./prepare-an-incident-triage-strategy.md](./prepare-an-incident-triage-strategy.md) · [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) · [./prepare-an-incident-drill-strategy.md](./prepare-an-incident-drill-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what comms to solve / what happens if not done / ROI / business impact"; do not do comms for comms' sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "comms could go out of control (comms scattered / status page gaps / notification chaos / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one comms → behavior changes → another comms; go through [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest comms that satisfies business wins; do not pile up channels; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Comms**: must run comms / channels / cadence + no scatter.
6. **Status page**: must run status page / public / update + no gaps.
7. **Notification**: must run notification / internal-external / template + no gaps.
8. **Closed loop**: must run closed loop / retrospective / archive + no gaps.
9. **Incident command**: must run [i-want-to-prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) + no naked runs.
10. **Incident response**: must run [i-want-to-prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) + no naked runs.
11. **Incident triage**: must run [i-want-to-prepare-an-incident-triage-strategy.md](./prepare-an-incident-triage-strategy.md) + no naked runs.
12. **Blameless retrospective**: must run [i-want-to-prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) + no naked runs.
13. **Drill**: must run [i-want-to-prepare-an-incident-drill-strategy.md](./prepare-an-incident-drill-strategy.md) + no naked runs.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) comms library + no multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked runs.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner.
17. **Freeze period**: during big promos go through [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change comms.
18. **Notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) inside and outside.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for status-page availability alerts.
20. **Retrospective**: after a comms failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: go through [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether comms are still accurate / whether templates are still reasonable.
22. **ADR**: comms decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: comms done well → trust rises → business stabilizes → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) — incident command
- Same-class journey: [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) — incident response
- Same-class journey: [./prepare-an-incident-triage-strategy.md](./prepare-an-incident-triage-strategy.md) — incident triage
- Same-class journey: [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) — blameless retrospective
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
