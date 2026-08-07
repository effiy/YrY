---

title: I want to prepare a 360 feedback strategy
aliases:
- I want to prepare a 360 feedback strategy
- 360-feedback-journey
- feedback-360-journey
- 360 feedback entry
tags:
- journeys
- 360-feedback
- multi-rater
- performance
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
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-performance-review.md
- ./prepare-a-talent-review-strategy.md
- ./prepare-a-mentoring-strategy.md
- ./prepare-a-compensation-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a 360 feedback strategy

> **As an** engineer, **I want to** prepare a 360 feedback, **so that** launch is safe.

> Reach Process + Thinking + Case study within 2 hops for "360 feedback + multi-source + anonymous + governance + quarterly audit".

## Summary

- Process: go [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: go [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: go [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study: go [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing 360 feedback / multi-source / anonymous / governance / big-promo freeze / quarterly audit / retrospective, TL + platform + HR + business + sponsor need to look up Process + Thinking + Case study. This entry aggregates 360 feedback related Process + Thinking + Case study into a 2-hop path, avoiding "feedback scattered / anonymous missed / bias risk / closed-loop chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — feedback intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | 360-feedback · multi-rater · anonymous · survey |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | feedback-runtime · survey-store · anonymize-engine · audit-log |
| `tech/ai-foundations/` | feedback-patterns · survey-suite · anonymize-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — feedback notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — feedback incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — feedback business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §feedback |
| `journeys/` | [./prepare-a-performance-review.md](./prepare-a-performance-review.md) · [./prepare-a-talent-review-strategy.md](./prepare-a-talent-review-strategy.md) · [./prepare-a-mentoring-strategy.md](./prepare-a-mentoring-strategy.md) · [./prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does 360 feedback solve / what happens if not done / ROI / business impact"; do not assess for the sake of assessing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "how feedback could go out of control (feedback scattered / anonymous missed / bias risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one assessment -> behavior changes -> another assessment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest feedback that satisfies business wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **multi-source**: must run multi-source / up / down / peer + no scattering.
6. **anonymous**: must run anonymous / de-identification / anti-retaliation + no gaps.
7. **observable**: must run observable / traceable / audit + no gaps.
8. **closed loop**: must run closed loop / retrospective / archive + no gaps.
9. **performance review**: must run [i-want-to-prepare-a-performance-review.md](./prepare-a-performance-review.md) + no naked run.
10. **talent review**: must run [i-want-to-prepare-a-talent-review-strategy.md](./prepare-a-talent-review-strategy.md) + no naked run.
11. **mentoring**: must run [i-want-to-prepare-a-mentoring-strategy.md](./prepare-a-mentoring-strategy.md) + no naked run.
12. **compensation**: must run [i-want-to-prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) + no naked run.
13. **security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) feedback library + no multi-source.
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / business / TL owner.
17. **freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move feedback process.
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) feedback exception alerts.
20. **retrospective**: after feedback incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether dimensions are still accurate / anonymous is still reasonable.
22. **ADR**: feedback decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **flywheel**: feedback good -> culture up -> trust up -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [./prepare-a-performance-review.md](./prepare-a-performance-review.md) — performance review
- similar journey: [./prepare-a-talent-review-strategy.md](./prepare-a-talent-review-strategy.md) — talent review
- similar journey: [./prepare-a-mentoring-strategy.md](./prepare-a-mentoring-strategy.md) — mentoring
- similar journey: [./prepare-a-compensation-strategy.md](./prepare-a-compensation-strategy.md) — compensation
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry
