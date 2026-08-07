---

title: I want to prepare a skill matrix strategy
aliases:
- I want to prepare a skill matrix strategy
- skill-matrix-journey
- competency-matrix-journey
- Skill matrix entry
tags:
- journeys
- skill-matrix
- competency-matrix
- skills
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
- ./prepare-a-competency-matrix-strategy.md
- ./prepare-a-career-framework-strategy.md
- ./prepare-a-career-strategy.md
- ./prepare-a-learning-development-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a skill matrix strategy

> **As an** engineer, **I want to** prepare a skill matrix, **so that** launch is safe.

> "Skill matrix + assessment + gap + governance + quarterly audit" reach process + thinking + cases within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing skill matrix / assessment / gap / governance / promotion freeze / quarterly audit / retrospective, TL + HR + L&D + business + sponsor need to look up process + thinking + cases. This entry aggregates skill matrix related process + thinking + cases into 2-hop paths, avoiding "assessments scattered / gaps missed / misjudgment risk / closed loop messy / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — matrix intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effect · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | skill-matrix · competency-matrix · skills · gap |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | matrix-runtime · skill-store · gap-engine · audit-log |
| `tech/ai-foundations/` | matrix-patterns · skill-suite · gap-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — matrix notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — matrix failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — matrix business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §matrix |
| `journeys/` | [./prepare-a-competency-matrix-strategy.md](./prepare-a-competency-matrix-strategy.md) · [./prepare-a-career-framework-strategy.md](./prepare-a-career-framework-strategy.md) · [./i-want-to-prepare-a-career-ladder-strategy.md](./prepare-an-engineering-career-ladder.md) · [./prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what skill matrix needs to solve / what happens if not done / ROI / business impact"; do not assess for assessment's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "matrix could go out of control (assessments scattered / gaps missed / misjudgment risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effect**: one assessment → behavior change → another assessment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest matrix that meets business needs wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Assessment**: must run assessment / self-assessment / 360 + prevent scattering.
6. **Gap**: must run gap / priority / plan + prevent missing.
7. **Observability**: must run observability / traceability / audit + prevent missing.
8. **Closed loop**: must run closed loop / retrospective / archive + prevent missing.
9. **Competency**: must run [i-want-to-prepare-a-competency-matrix-strategy.md](./prepare-a-competency-matrix-strategy.md) + prevent bare running.
10. **Career framework**: must run [i-want-to-prepare-a-career-framework-strategy.md](./prepare-a-career-framework-strategy.md) + prevent bare running.
11. **Career ladder**: must run [i-want-to-prepare-a-career-ladder-strategy.md](./prepare-an-engineering-career-ladder.md) + prevent bare running.
12. **Learning & development**: must run [i-want-to-prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) + prevent bare running.
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + prevent bare running.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) matrix repository + prevent multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + prevent bare running.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / L&D / business owner.
17. **Freeze period**: promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) without touching assessments.
18. **Notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify internal and external.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for matrix exception alerts.
20. **Retrospective**: after a matrix failure, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether assessments are still accurate / gaps are still reasonable.
22. **ADR**: matrix decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: matrix good → gaps closed → trust up → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same category journey: [./prepare-a-competency-matrix-strategy.md](./prepare-a-competency-matrix-strategy.md) — competency
- Same category journey: [./prepare-a-career-framework-strategy.md](./prepare-a-career-framework-strategy.md) — career framework
- Same category journey: [./i-want-to-prepare-a-career-ladder-strategy.md](./prepare-an-engineering-career-ladder.md) — career ladder
- Same category journey: [./prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) — learning & development
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
