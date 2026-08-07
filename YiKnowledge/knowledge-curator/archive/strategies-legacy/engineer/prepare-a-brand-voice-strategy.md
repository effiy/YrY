---

title: I want to prepare a brand voice strategy
aliases:
- I want to prepare a brand voice strategy
- brand-voice-journey
- tone-of-voice-journey
- voice-and-tone-journey
- brand voice entry
tags:
- journeys
- brand-voice
- tone-of-voice
- brand-guidelines
- voice-consistency
- content-style
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
- ./prepare-a-brand-strategy.md
- ./prepare-a-messaging-house-strategy.md
- ./prepare-a-content-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a brand voice strategy

> **As an** engineer, **I want to** prepare a brand voice, **so that** launch is safe.

> "Tone + voice + style guide + consistency + audience + channel fit + governance + quarterly audit" reachable within 2 hops: process + thinking + cases.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing brand voice / voice / tone / style guide / consistency / audience / channel fit / governance / communication / big-sale freeze / quarterly audit / retrospective, TL + PMM + marketing + content + sponsor need process + thinking + cases. This entry aggregates brand-voice-related process + thinking + cases into a 2-hop path, avoiding "scattered tone / hollow style guide / consistency gaps / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of tone · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert the scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [brand-strategy-summary.md](./prepare-a-brand-strategy.md) · [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [content-strategy-summary.md](./prepare-a-content-strategy.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — voice communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — PMM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — voice failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — voice business |
| `projects/` | each project `architecture-summary.md` §PMM + `adr-*` §voice |
| `journeys/` | [./prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) · [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) · [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) · [./prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does voice solve / what happens if not done / ROI / business impact"; do not tone for the sake of tone; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "voice could go out of control (scattered tone / hollow style guide / consistency gaps / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one tuning → behavior change → another tuning; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest tone that meets business needs wins; do not pile up adjectives; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Voice**: must run voice definition (personality / values) + anti-vagueness.
6. **Tone**: must run tone adaptation (scenario / audience) + anti-one-size-fits-all.
7. **Style guide**: must run style guide (word choice / sentence patterns / banned words) + anti-empty.
8. **Consistency**: must run cross-channel consistency + anti-scatter; see [i-want-to-prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md).
9. **Audience**: must run audience fit + anti-one-size-fits-all.
10. **Channel**: must run channel fit (website / social / email) + anti-scatter.
11. **Messaging house**: must run [i-want-to-prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) + anti-scatter.
12. **Content**: must run [i-want-to-prepare-a-content-strategy.md](./prepare-a-content-strategy.md) + anti-bare-run.
13. **Narrative**: must run [i-want-to-prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md) + anti-bare-run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) voice library + anti-multi-source.
15. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) to gray-release voice.
16. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + anti-recompute.
17. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PMM / marketing / content / TL owner.
18. **Freeze window**: big-sale uses [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not touch tone.
19. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
20. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for consistency / drift alerts.
21. **Retrospective**: after a voice failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
22. **Quarterly audit**: walk through [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether tone is still accurate + whether style is still reasonable.
23. **ADR**: voice decisions must be captured in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **Flywheel**: voice goes well → trust rises → retention rises → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) — brand
- Same-class journey: [./prepare-a-messaging-house-strategy.md](./prepare-a-messaging-house-strategy.md) — messaging house
- Same-class journey: [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) — content
- Same-class journey: [./prepare-a-narrative-strategy.md](./prepare-a-narrative-strategy.md) — narrative
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
