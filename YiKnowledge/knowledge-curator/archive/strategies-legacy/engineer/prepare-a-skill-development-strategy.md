---

title: I want to prepare a skill development strategy
aliases:
- i-want-to-prepare-a-skill-development-strategy
- skill-development-journey
- upskilling-journey
- skill-development-entry
tags:
- journeys
- skill-development
- upskilling
- reskilling
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
- ./prepare-a-learning-development-strategy.md
- ./prepare-a-skill-matrix-strategy.md
- ./prepare-a-learning-management-strategy.md
- ./prepare-a-mentoring-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a skill development strategy

> **As an** engineer, **I want to** prepare a skill development, **so that** launch is safe.

> "Skill development + upskilling + reskilling + governance + quarterly audit" reachable within 2 hops across process + thinking + cases.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing skill development / upskilling / reskilling / governance / big-promo freeze / quarterly audit / retrospective, TL + HR + L&D + business + sponsor need to look up process + thinking + cases. This entry aggregates skill-development-related process + thinking + cases into a 2-hop path, avoiding "goals scattered / learning missing / obsolescence risk / messy closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (by class/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — skill intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking on scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | skill-development · upskilling · reskilling · competency |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | skilldev-runtime · path-store · assess-engine · audit-log |
| `tech/ai-foundations/` | skilldev-patterns · path-suite · assess-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — skill notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — skill incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — skill business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §skill |
| `journeys/` | [./prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) · [./prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) · [./prepare-a-learning-management-strategy.md](./prepare-a-learning-management-strategy.md) · [./prepare-a-mentoring-strategy.md](./prepare-a-mentoring-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what skill development solves / what happens if not done / ROI / business impact"; do not learn for learning's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "skill development going out of control (goals scattered / learning missing / obsolescence risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one learning → behavior change → another learning; via [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest path that meets business needs wins; do not pile up courses; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **goals**: must run goals / skills / assessment + anti-scatter.
6. **upskilling**: must run upskilling / reskilling / path + anti-missing.
7. **observable**: must run observable / traceable / audit + anti-missing.
8. **closed loop**: must run closed loop / retrospective / archive + anti-missing.
9. **learning-development**: must run [i-want-to-prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) + anti-naked-run.
10. **skill matrix**: must run [i-want-to-prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) + anti-naked-run.
11. **LMS**: must run [i-want-to-prepare-a-learning-management-strategy.md](./prepare-a-learning-management-strategy.md) + anti-naked-run.
12. **mentoring**: must run [i-want-to-prepare-a-mentoring-strategy.md](./prepare-a-mentoring-strategy.md) + anti-naked-run.
13. **security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + anti-naked-run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) skill store + anti-multi-source.
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + anti-naked-run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / L&D / business owner.
17. **freeze period**: big promos via [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not touch skill goals.
18. **notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify internal and external.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for skill exception alerts.
20. **retrospective**: after skill incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **quarterly audit**: via [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether skill goals are still accurate / whether path is still reasonable.
22. **ADR**: skill decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **flywheel**: good skills → retention rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-learning-development-strategy.md](./prepare-a-learning-development-strategy.md) — learning & development
- Same-class journey: [./prepare-a-skill-matrix-strategy.md](./prepare-a-skill-matrix-strategy.md) — skill matrix
- Same-class journey: [./prepare-a-learning-management-strategy.md](./prepare-a-learning-management-strategy.md) — LMS
- Same-class journey: [./prepare-a-mentoring-strategy.md](./prepare-a-mentoring-strategy.md) — mentoring
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
