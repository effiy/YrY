---

title: I want to prepare a follow the sun strategy
aliases:
- prepare a follow the sun strategy
- follow-the-sun-journey
- global-rotation-journey
- follow-the-sun entry
tags:
- journeys
- follow-the-sun
- global-rotation
- handoff
- cross-timezone
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
- ./prepare-an-on-call-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a follow the sun strategy

> **As an** engineer, **I want to** prepare a follow the sun, **so that** launch is safe. 

> Reach "follow-the-sun + rotation + handoff + governance + quarterly audit" processes + thinking + cases within 2 hops. 

## Summary

- Processes: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platforms: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing follow-the-sun / rotation / handoff / governance / big-promotion freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up processes + thinking + cases. This entry aggregates follow-the-sun-related processes + thinking + cases into a 2-hop path, avoiding "scattered shifts / missed handoffs / timezone misalignment / chaotic closure / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of follow-the-sun · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking on scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reactions · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | follow-the-sun · global-rotation · handoff · cross-timezone |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | rotation-runtime · handoff-store · timezone-engine · audit-log |
| `tech/ai-foundations/` | rotation-patterns · handoff-suite · coverage-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — rotation reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — rotation failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — rotation business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §rotation |
| `journeys/` | [./prepare-an-on-call-strategy.md](./prepare-an-on-call-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-comms-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-comms-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does follow-the-sun solve / what happens if not done / ROI / business impact"; do not do it for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how follow-the-sun could go out of control (scattered shifts / missed handoffs / timezone misalignment / trust collapse) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one rotation -> behavior change -> another rotation; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest shift schedule that meets business needs wins; do not pile up shifts; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Rotation**: must run rotation / shifts / timezones + avoid scatter. 
6. **Handoff**: must run handoff / transfer / checklist + avoid misses. 
7. **Coverage**: must run coverage / 7x24 / holidays + avoid misses. 
8. **Closure**: must run closure / retrospective / archive + avoid misses. 
9. **On-call**: must run [i-want-to-prepare-an-on-call-strategy.md](./prepare-an-on-call-strategy.md) + avoid running bare. 
10. **Incident commander**: must run [i-want-to-prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md) + avoid running bare. 
11. **Incident response**: must run [i-want-to-prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) + avoid running bare. 
12. **Drill**: must run [i-want-to-prepare-an-incident-drill-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md) + avoid running bare. 
13. **Incident comms**: must run [i-want-to-prepare-an-incident-comms-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-comms-strategy.md) + avoid running bare. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) rotation library + avoid multi-source. 
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + avoid running bare. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owners. 
17. **Freeze period**: big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not change rotation. 
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) to cover rotation alerts. 
20. **Retrospective**: after a rotation failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the rotation is still accurate / shifts are still reasonable. 
22. **ADR**: rotation decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: good rotation -> stable coverage -> rising trust -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-category journey: [./prepare-an-on-call-strategy.md](./prepare-an-on-call-strategy.md) — on-call
- Same-category journey: [../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md) — incident commander
- Same-category journey: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — incident response
- Same-category journey: [../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md) — drill
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
