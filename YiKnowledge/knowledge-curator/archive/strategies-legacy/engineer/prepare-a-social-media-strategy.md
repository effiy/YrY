---

title: I want to prepare a social media strategy
aliases:
- I want to prepare a social media strategy
- social-media-journey
- organic-social-journey
- social-listening-journey
- Social media entry
tags:
- journeys
- social-media
- organic-social
- content-calendar
- social-listening
- community-engagement
- crisis-comms
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
- ./prepare-a-content-strategy.md
- ./prepare-a-brand-strategy.md
- ./prepare-a-community-strategy.md
- ./prepare-a-crisis-communications-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a social media strategy

> **As an** engineer, **I want to** prepare a social media, **so that** launch is safe.

> "Organic social + content calendar + engagement + community + listening + crisis + governance + quarterly audit" reachable within 2 hops: process + thinking + case study.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing social media / organic social / content calendar / engagement / community / listening / crisis / governance / reporting / big-promo freeze / quarterly audit / retrospective, TL + marketing + brand + PR + sponsor need to look up process + thinking + case study. This entry aggregates social-media-related process + thinking + case study into a 2-hop path, avoiding "calendar scattered / engagement hollow / listening missed / crisis silent / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — social intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [content-strategy-summary.md](./prepare-a-content-strategy.md) · [brand-strategy-summary.md](./prepare-a-brand-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — social reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — social matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — social incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — social business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §social |
| `journeys/` | [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) · [./prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) · [./prepare-a-community-strategy.md](./prepare-a-community-strategy.md) · [./prepare-an-influencer-marketing-strategy.md](./prepare-an-influencer-marketing-strategy.md) · [./prepare-a-crisis-communications-strategy.md](./prepare-a-crisis-communications-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does social media solve / what happens if not done / ROI / business impact"; do not post for posting's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "social could go out of control (calendar scattered / engagement hollow / listening missed / crisis silent / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one post -> behavior changes -> another post; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest social that satisfies business wins; do not pile up platforms; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Organic social**: must run organic content matrix + no scattering; see [i-want-to-prepare-a-content-strategy.md](./prepare-a-content-strategy.md).
6. **Content calendar**: must run content calendar + no breaks; see [i-want-to-prepare-a-content-strategy.md](./prepare-a-content-strategy.md).
7. **Engagement**: must run engagement replies + no naked run.
8. **Community**: must run community operations + no emptiness; see [i-want-to-prepare-a-community-strategy.md](./prepare-a-community-strategy.md).
9. **Listening**: must run social listening + no leakage.
10. **Crisis**: must run [i-want-to-prepare-a-crisis-communications-strategy.md](./prepare-a-crisis-communications-strategy.md) + no silence.
11. **Brand**: must run [i-want-to-prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) + no drift.
12. **KOL**: must run [i-want-to-prepare-an-influencer-marketing-strategy.md](./prepare-an-influencer-marketing-strategy.md) + no naked run.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) social content library + no multi-source.
14. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) gradual publish.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); marketing / brand / PR / TL owner.
17. **Freeze period**: during big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move content calendar.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) reporting internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) engagement / mention / sentiment alerts.
20. **Retrospective**: after social incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether platforms are still reasonable / whether content is still accurate.
22. **ADR**: social decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good social -> engagement rises -> brand rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) — content
- Same-category journey: [./prepare-a-brand-strategy.md](./prepare-a-brand-strategy.md) — brand
- Same-category journey: [./prepare-a-community-strategy.md](./prepare-a-community-strategy.md) — community
- Same-category journey: [./prepare-an-influencer-marketing-strategy.md](./prepare-an-influencer-marketing-strategy.md) — KOL
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
