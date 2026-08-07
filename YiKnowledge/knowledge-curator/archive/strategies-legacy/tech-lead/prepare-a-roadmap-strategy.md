---

title: I want to prepare a roadmap strategy
aliases:
- I want to prepare a roadmap strategy
- roadmap-journey
- product-roadmap-journey
- now-next-later-journey
- roadmap entry
tags:
- journeys
- roadmap
- product-roadmap
- now-next-later
- outcome-based
- planning
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- file names are descriptive verb-phrases, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-prioritization-strategy.md
- ../../product-manager/frameworks/prepare-a-product-launch-strategy.md
- ../../product-manager/frameworks/prepare-an-okr-cycle-process.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a roadmap strategy

> **As a** tech lead, **I want to** prepare a roadmap, **so that** launch is safe.

> "now/next/later + outcome + assumptions + dependencies + governance + quarterly audit" within 2 hops reach process + thinking + cases.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing a roadmap / now/next/later / outcome / assumptions / dependencies / governance / comms / big-promo freeze / quarterly audit / retrospective, TL + PM + PMM + sales + sponsor need to look up process + thinking + cases. This entry aggregates roadmap-related process + thinking + cases into 2-hop paths, avoiding "hollow promises / missed dependencies / chaotic priority / scattered closure / no quarterly audit."

## 2-hop reachable paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — roadmap intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert hollow · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [opportunity-solution-tree-summary.md](../../engineer/strategies/prepare-an-opportunity-solution-tree-strategy.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [business-model-summary.md](../../executive/strategy/business-model-canvas.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — roadmap comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — PM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — roadmap failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — roadmap business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §roadmap |
| `journeys/` | [./i-want-to-prepare-a-prioritization-strategy.md](./prepare-a-prioritization-strategy.md) · [../../product-manager/frameworks/prepare-a-product-launch-strategy.md](../../product-manager/frameworks/prepare-a-product-launch-strategy.md) · [../../engineer/strategies/prepare-release-notes.md](../../engineer/strategies/prepare-release-notes.md) · [../../product-manager/frameworks/prepare-an-okr-cycle-process.md](../../product-manager/frameworks/prepare-an-okr-cycle-process.md) · [../../product-manager/frameworks/prepare-a-product-strategy.md](../../product-manager/frameworks/prepare-a-product-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does the roadmap solve / what if not done / ROI / business impact"; do not draw for drawing's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how the roadmap will go out of control (hollow promises / missed dependencies / chaotic priority / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one promise → behavior changes → another promise; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest roadmap that meets business wins; do not stack fields; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **now/next/later**: must use now/next/later three sections + no hollow dates.
6. **outcome-based**: must use outcome / problem / opportunity + no feature-list-only.
7. **Assumptions**: must have assumption list / source + no gut-feel.
8. **Dependencies**: must have dependency / blocker + no omissions; see [i-want-to-prepare-a-prioritization-strategy.md](./prepare-a-prioritization-strategy.md).
9. **Priority**: must use RICE / ICE / Kano + no subjective.
10. **NSM**: must align to [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) + no metric drift.
11. **JTBD**: must use [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) + no feature-bias.
12. **OST**: must use [opportunity-solution-tree-summary.md](../../engineer/strategies/prepare-an-opportunity-solution-tree-strategy.md) + no omissions.
13. **OKR**: must align to [i-want-to-prepare-an-okr-cycle-process.md](../../product-manager/frameworks/prepare-an-okr-cycle-process.md) + no bare run.
14. **SSOT**: must use [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) roadmap library + no multi-source.
15. **feature flag**: must use [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) for grayscale promises.
16. **cache**: must use [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
17. **RACI**: must use [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PM / PMM / sales / TL owners.
18. **Freeze window**: during big promos use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not move roadmap.
19. **Comms**: must use [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
20. **Monitoring**: must use [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for deviation / sliding-window alerts.
21. **Retrospective**: after roadmap failures must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) and archive to [bugs/](../../engineer/lessons/failures/bugs).
22. **Quarterly audit**: use [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether promises are still accurate / dependencies still reasonable.
23. **ADR**: roadmap decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **Flywheel**: accurate roadmap → trust up → sales strong → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-kind journey: [./i-want-to-prepare-a-prioritization-strategy.md](./prepare-a-prioritization-strategy.md) — priority
- Same-kind journey: [../../product-manager/frameworks/prepare-a-product-launch-strategy.md](../../product-manager/frameworks/prepare-a-product-launch-strategy.md) — launch
- Same-kind journey: [../../engineer/strategies/prepare-release-notes.md](../../engineer/strategies/prepare-release-notes.md) — release notes
- Same-kind journey: [../../product-manager/frameworks/prepare-an-okr-cycle-process.md](../../product-manager/frameworks/prepare-an-okr-cycle-process.md) — OKR
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
