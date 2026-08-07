---

title: I want to prepare an FMEA strategy
aliases:
- i-want-to-prepare-an-fmea-strategy
- fmea-journey
- failure-mode-journey
- failure-mode-entry
tags:
- journeys
- fmea
- failure-mode
- risk
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
- ./prepare-a-risk-assessment-strategy.md
- ../../oncall-sre/incident-response/prepare-a-chaos-engineering-strategy.md
- ../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md
- ./prepare-a-root-cause-analysis-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an FMEA strategy

> **As an** engineer, **I want to** prepare an fmea, **so that** launch is safe. 

> "FMEA + failure mode + risk + governance + quarterly audit" reaches process + thinking + cases within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing FMEA / failure mode / risk / governance / big-promo freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + cases. This entry aggregates FMEA-related process + thinking + cases into a 2-hop path, avoiding "scattered failures / missed assessments / missed risk reporting / chaotic closure / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — FMEA intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking on scattered failures · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reactions · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | fmea · failure-mode · risk-priority · rpn |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | fmea-runtime · mode-store · assess-engine · audit-log |
| `tech/ai-foundations/` | fmea-patterns · mode-suite · assess-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — FMEA communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — FMEA crash archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — FMEA business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §FMEA |
| `journeys/` | [./prepare-a-risk-assessment-strategy.md](./prepare-a-risk-assessment-strategy.md) · [../../oncall-sre/incident-response/prepare-a-chaos-engineering-strategy.md](../../oncall-sre/incident-response/prepare-a-chaos-engineering-strategy.md) · [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) · [./prepare-a-root-cause-analysis-strategy.md](./prepare-a-root-cause-analysis-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does FMEA solve / what happens if not done / ROI / business impact"; do not do F for F's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "FMEA could go out of control (scattered failures / missed assessments / missed risk reporting / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One F → behavior change → another F; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest assessment that meets business needs wins; do not pile up patterns; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Failure modes**: Must run failure / mode / list + mitigate scattering.
6. **Assessment**: Must run assessment / severity / frequency / detection + mitigate misses.
7. **RPN**: Must run RPN / priority / disposition + mitigate misses.
8. **Closure**: Must run closure / retrospective / archive + mitigate misses.
9. **Risk assessment**: Must run [i-want-to-prepare-a-risk-assessment-strategy.md](./prepare-a-risk-assessment-strategy.md) + mitigate running blind.
10. **Chaos engineering**: Must run [i-want-to-prepare-a-chaos-engineering-strategy.md](../../oncall-sre/incident-response/prepare-a-chaos-engineering-strategy.md) + mitigate running blind.
11. **Blameless retrospective**: Must run [i-want-to-prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) + mitigate running blind.
12. **Root cause analysis**: Must run [i-want-to-prepare-a-root-cause-analysis-strategy.md](./prepare-a-root-cause-analysis-strategy.md) + mitigate running blind.
13. **Security**: Must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + mitigate running blind.
14. **SSOT**: Must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) failure library + mitigate multiple sources.
15. **Contract test**: Must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + mitigate running blind.
16. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owners.
17. **Freeze period**: Big-promo follows [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) frozen list.
18. **Communication**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
19. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for failure exception alerting.
20. **Retrospective**: After FMEA crash, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether patterns are still accurate / priorities still reasonable.
22. **ADR**: FMEA decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: Good FMEA → fewer failures → more trust → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same category journey: [./prepare-a-risk-assessment-strategy.md](./prepare-a-risk-assessment-strategy.md) — risk assessment
- Same category journey: [../../oncall-sre/incident-response/prepare-a-chaos-engineering-strategy.md](../../oncall-sre/incident-response/prepare-a-chaos-engineering-strategy.md) — chaos engineering
- Same category journey: [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) — blameless retrospective
- Same category journey: [./prepare-a-root-cause-analysis-strategy.md](./prepare-a-root-cause-analysis-strategy.md) — root cause analysis
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
