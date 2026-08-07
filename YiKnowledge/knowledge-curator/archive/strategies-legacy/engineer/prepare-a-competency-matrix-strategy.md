---

title: I want to prepare a competency matrix strategy
aliases:
- I want to prepare a competency matrix strategy
- competency-matrix-journey
- competency-framework-journey
- competency matrix entry
tags:
- journeys
- competency-matrix
- competency-framework
- competency
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
- ./prepare-a-skill-matrix-strategy.md
- ./prepare-a-career-framework-strategy.md
- ../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md
- ./prepare-a-learning-development-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a competency matrix strategy

> **As an** engineer, **I want to** prepare a competency matrix, **so that** launch is safe. 

> "Competency + matrix + model + governance + quarterly audit" 2-hop reach covers process + thinking + case studies.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing competency / matrix / model / governance / peak-season freeze / quarterly audit / retrospective, TL + HR + L&D + business + sponsors need to look up process + thinking + case studies. This entry aggregates competency-matrix-related process + thinking + case studies into 2-hop paths, avoiding "scattered model / skipped assessment / risky misjudgment / chaotic closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (class/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of competency · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reactions · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | competency-matrix · competency-framework · competency · model |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | competency-runtime · model-store · assess-engine · audit-log |
| `tech/ai-foundations/` | competency-patterns · model-suite · assess-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — competency reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — competency incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — competency business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §competency |
| `journeys/` | [./prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) · [./prepare-a-career-framework-strategy.md](./prepare-a-career-framework-strategy.md) · [../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md) · [./prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does the competency matrix solve / what happens if not done / ROI / business impact"; do not model for the sake of modeling; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First think "how competency could go out of control (scattered model / skipped assessment / risky misjudgment / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: One assessment → behavior changes → another assessment; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest model that satisfies the business wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Model**: Must run model / dimension / level + scatter prevention. 
6. **Assessment**: Must run assessment / 360 / calibration + leak prevention. 
7. **Observable**: Must run observable / traceability / audit + leak prevention. 
8. **Closed loop**: Must run closed loop / retrospective / archive + leak prevention. 
9. **Skill matrix**: Must run [i-want-to-prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) + naked-run prevention. 
10. **Career framework**: Must run [i-want-to-prepare-a-career-framework-strategy.md](./prepare-a-career-framework-strategy.md) + naked-run prevention. 
11. **Job architecture**: Must run [i-want-to-prepare-a-job-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md) + naked-run prevention. 
12. **Learning & development**: Must run [i-want-to-prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) + naked-run prevention. 
13. **Security**: Must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + naked-run prevention. 
14. **SSOT**: Must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) model library + multi-source prevention. 
15. **Contract test**: Must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + naked-run prevention. 
16. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / L&D / business owners. 
17. **Freeze window**: During peak promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move the model. 
18. **Reporting**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally. 
19. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for competency exception alerts. 
20. **Retrospective**: After a competency incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: Run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the model is still accurate / assessments are still reasonable. 
22. **ADR**: Competency decisions must produce an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: Competency done well → matching is accurate → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-class journey: [./prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) — skill matrix
- Same-class journey: [./prepare-a-career-framework-strategy.md](./prepare-a-career-framework-strategy.md) — career framework
- Same-class journey: [../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-job-architecture-strategy.md) — job architecture
- Same-class journey: [./prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) — learning & development
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
