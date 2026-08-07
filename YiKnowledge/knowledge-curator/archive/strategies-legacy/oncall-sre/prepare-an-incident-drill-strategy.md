---

title: I want to prepare an incident drill strategy
aliases:
- I want to prepare an incident drill strategy
- incident-drill-journey
- game-day-journey
- incident drill entry
tags:
- journeys
- incident-drill
- game-day
- chaos-drill
- sre
- readiness
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
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-an-incident-playbook-strategy.md
- ./prepare-an-incident-response-strategy.md
- ./prepare-an-incident-commander-strategy.md
- ./run-a-chaos-engineering-experiment.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an incident drill strategy

> **As a** oncall sre, **I want to** prepare an incident drill, **so that** launch is safe.

> "Drill + exercise + big-promo + governance + quarterly audit" — reach process + thinking + cases within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing incident drills / exercises / big-promo readiness / governance / quarterly audits / retrospectives, TLs + platform + algorithm + data + sponsors need to look up process + thinking + cases. This entry aggregates drill-related process + thinking + cases into a 2-hop path to avoid "scattered drills / missing exercises / drift / chaotic closed loops / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — drill essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion thinking on scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | incident-drill · game-day · chaos-drill · readiness |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | drill-runtime · scenario-store · readiness-engine · audit-log |
| `tech/ai-foundations/` | drill-patterns · scenario-suite · readiness-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — drill notifications |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — drill wreck archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — drill business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §drill |
| `journeys/` | [./prepare-an-incident-playbook-strategy.md](./prepare-an-incident-playbook-strategy.md) · [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) · [./prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) · [./run-a-chaos-engineering-experiment.md](./run-a-chaos-engineering-experiment.md) · [./i-want-to-prepare-a-release-freeze-strategy.md](../release/release-freeze.md) |

## Action recommendations

1. **First principles**: First ask "what should the drill solve / what happens if not done / ROI / business impact"; do not drill for drilling's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "the drill could go out of control (scattered drills / missing exercises / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One drill → behavior changes → another drill; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest drill that satisfies business wins; do not pile up scenarios; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Drill**: Must run drills / scenarios / frequency + prevent scatter.
6. **Playbook**: Must run playbooks / steps / roles + prevent omissions.
7. **Retrospective**: Must run retrospectives / action items / closed loops + prevent omissions.
8. **Readiness**: Must run readiness / checklists / assessments + prevent omissions.
9. **Incident playbook**: Must run [i-want-to-prepare-an-incident-playbook-strategy.md](./prepare-an-incident-playbook-strategy.md) + no naked run.
10. **Incident response**: Must run [i-want-to-prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) + no naked run.
11. **Incident commander**: Must run [i-want-to-prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) + no naked run.
12. **Chaos experiment**: Must run [i-want-to-run-a-chaos-engineering-experiment.md](./run-a-chaos-engineering-experiment.md) + no naked run.
13. **Freeze period**: Must run [i-want-to-prepare-a-release-freeze-strategy.md](../release/release-freeze.md) + no naked run.
14. **SSOT**: Must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for the drill library + no multi-source.
15. **Contract test**: Must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: Must follow [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owners.
17. **Freeze period**: During big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not move drills.
18. **Reporting**: Must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for drill alert coverage.
20. **Retrospective**: After a drill wreck must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether drills are still accurate / scenarios still reasonable.
22. **ADR**: Drill decisions must land as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: Drills done well → readiness rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [./prepare-an-incident-playbook-strategy.md](./prepare-an-incident-playbook-strategy.md) — incident playbook
- similar journey: [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) — incident response
- similar journey: [./prepare-an-incident-commander-strategy.md](./prepare-an-incident-commander-strategy.md) — incident commander
- similar journey: [./run-a-chaos-engineering-experiment.md](./run-a-chaos-engineering-experiment.md) — chaos experiment
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry
