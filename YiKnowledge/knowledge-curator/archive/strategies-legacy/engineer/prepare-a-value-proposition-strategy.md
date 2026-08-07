---

title: I want to prepare a value proposition strategy
aliases:
- I want to prepare a value proposition strategy
- value-proposition-journey
- vp-journey
- value-prop-journey
- value proposition entry
tags:
- journeys
- value-proposition
- value-prop-canvas
- differentiation
- jobs-to-be-done
- pains-gains
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
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-positioning-strategy.md
- prepare-a-differentiation-strategy.md
- ./prepare-a-messaging-house-strategy.md
- ../../engineer/strategies/prepare-a-positioning-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a value proposition strategy

> **As an** engineer, **I want to** prepare a value proposition, **so that** launch is safe.

> "Value proposition + canvas + pain points + gains + differentiation + evidence + governance + quarterly audit" reachable process + thinking + cases within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Cases follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing value proposition / value proposition canvas / pain points / gains / differentiation / evidence / governance / reporting / big-promotion freeze / quarterly audit / retrospective, TL + PMM + marketing + sponsor need to look up process + thinking + cases. This entry aggregates value-proposition-related process + thinking + cases into a 2-hop path, avoiding "hollow proposition / scattered pain points / missing evidence / quarterly audit missing."

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — value intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse think hollow · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [opportunity-solution-tree-summary.md](../../engineer/strategies/prepare-an-opportunity-solution-tree-strategy.md) |
| `product/strategy/` | [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [differentiation-summary.md](./../../executive/strategy/porter-five-forces.md) · [market-research-summary.md](../../executive/strategy/prepare-a-market-research-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `industry/` | [competitors/](../../executive/industry/competitors) · [market-trends/](../../executive/industry/market-trends) · [use-cases/](../../product-manager/industry-cases) — value proposition market |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — value proposition reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — PMM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — value proposition wreck archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — value proposition business |
| `projects/` | Each project's `architecture-summary.md` §strategy + `adr-*` §value proposition |
| `journeys/` | [./prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) · [./i-want-to-prepare-a-differentiation-strategy.md](./prepare-a-differentiation-strategy.md) · [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) · [../../product-manager/frameworks/prepare-a-jobs-to-be-done-strategy.md](../../product-manager/frameworks/prepare-a-jobs-to-be-done-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does the value proposition solve / what happens if not done / ROI / business impact"; do not proposition for proposition's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "value proposition could go out of control (hollow proposition / scattered pain points / missing evidence / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one tweak → behavior changes → another tweak; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: simplest proposition that meets business needs wins; do not pile up adjectives; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Canvas**: must run value proposition canvas (product / pains / gains) + anti-gut-call.
6. **Pain points**: must run customer pains review + anti-vague; follow [i-want-to-prepare-a-jobs-to-be-done-strategy.md](../../product-manager/frameworks/prepare-a-jobs-to-be-done-strategy.md).
7. **Gains**: must run customer gains review + anti-vague.
8. **Differentiation**: must run differentiation positioning + anti-sameness; follow [i-want-to-prepare-a-differentiation-strategy.md](./prepare-a-differentiation-strategy.md).
9. **Evidence**: must run evidence / proof points + anti-empty; follow [i-want-to-prepare-a-customer-advocacy-strategy.md](./prepare-a-customer-advocacy-strategy.md).
10. **Positioning**: must run [i-want-to-prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) + anti-naked-run.
11. **Messaging house**: must run [i-want-to-prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) + anti-scatter.
12. **JTBD**: must run [i-want-to-prepare-a-jobs-to-be-done-strategy.md](../../product-manager/frameworks/prepare-a-jobs-to-be-done-strategy.md) + anti-gut-call.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) value library + anti-multi-source.
14. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) gradual proposition rollout.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + anti-recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PMM / marketing / TL / sponsor owner.
17. **Freeze period**: big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not touch proposition.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) reporting internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) value proposition hit / win-rate alerts.
20. **Retrospective**: after value proposition wrecks must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether proposition still accurate + evidence still reasonable.
22. **ADR**: value proposition decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good value proposition → high win rate → revenue grows → more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-positioning-strategy.md](./prepare-a-positioning-strategy.md) — Positioning
- Same-class journey: [./i-want-to-prepare-a-differentiation-strategy.md](./prepare-a-differentiation-strategy.md) — Differentiation
- Same-class journey: [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) — Messaging house
- Same-class journey: [../../product-manager/frameworks/prepare-a-jobs-to-be-done-strategy.md](../../product-manager/frameworks/prepare-a-jobs-to-be-done-strategy.md) — JTBD
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
