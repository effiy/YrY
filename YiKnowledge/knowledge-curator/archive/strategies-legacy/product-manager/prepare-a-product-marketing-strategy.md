---

title: I want to prepare a product marketing strategy
aliases:
- I want to prepare a product marketing strategy
- product-marketing-journey
- pmm-journey
- messaging-journey
- product marketing entry
tags:
- journeys
- product-marketing
- pmm
- messaging-house
- launch
- positioning
- sales-enablement
category: product-manager/frameworks
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- product-manager
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-go-to-market.md
- ../../engineer/strategies/prepare-a-brand-strategy.md
- ../../engineer/strategies/prepare-a-sales-enablement-strategy.md
- ../../engineer/strategies/prepare-a-positioning-strategy.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a product marketing strategy

> **As a** product manager, **I want to** prepare a product marketing, **so that** launch is safe.

> "Positioning + messaging house + launch + materials + marketing + sales + governance + quarterly audit" reach process + thinking + case studies within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) + [caching-pattern.md](../../engineer/patterns/caching.md)
- Case studies follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing product marketing / PMM / messaging house / launch / materials / sales / marketing / governance / comms / big-promo freeze / quarterly audit / retrospective, TL + marketing + sales + sponsor need to look up process + thinking + case studies. This entry aggregates product-marketing-related process + thinking + case studies into a 2-hop path, avoiding "vague positioning / scattered messaging / launch missed / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — original intent of marketing · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reaction · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [brand-strategy-summary.md](../../engineer/strategies/prepare-a-brand-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `industry/` | [competitors/](../../executive/industry/competitors) · [market-trends/](../../executive/industry/market-trends) · [use-cases/](../../product-manager/industry-cases) — marketing market |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — marketing comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — marketing matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — marketing incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — marketing business |
| `projects/` | each project's `architecture-summary.md` §marketing + `adr-*` §marketing |
| `journeys/` | [./prepare-a-go-to-market.md](./prepare-a-go-to-market.md) · [../../engineer/strategies/prepare-a-brand-strategy.md](../../engineer/strategies/prepare-a-brand-strategy.md) · [../../engineer/strategies/prepare-a-sales-enablement-strategy.md](../../engineer/strategies/prepare-a-sales-enablement-strategy.md) · [../../engineer/strategies/prepare-a-content-strategy.md](../../engineer/strategies/prepare-a-content-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does marketing solve / what happens if not done / ROI / business impact"; do not market for the sake of marketing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "how marketing could go out of control (vague positioning / scattered messaging / launch missed / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one adjustment -> behavior change -> another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest message that satisfies the business wins; do not pile up decks; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Positioning**: must define product positioning + avoid vagueness; follow [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md).
6. **Messaging house**: must define messaging house + avoid scattering.
7. **launch**: must run launch checklist + avoid naked launch; follow [i-want-to-prepare-a-product-launch-checklist.md](./prepare-a-product-launch-checklist.md).
8. **Materials**: must prepare sales materials + avoid scattering; follow [i-want-to-prepare-a-sales-enablement-strategy.md](../../engineer/strategies/prepare-a-sales-enablement-strategy.md).
9. **Content**: must run [i-want-to-prepare-a-content-strategy.md](../../engineer/strategies/prepare-a-content-strategy.md) + avoid naked launch.
10. **Brand**: must run [i-want-to-prepare-a-brand-strategy.md](../../engineer/strategies/prepare-a-brand-strategy.md) + avoid scattering.
11. **GTM**: must run [i-want-to-prepare-a-go-to-market.md](./prepare-a-go-to-market.md) + avoid naked launch.
12. **Competitors**: must run [i-want-to-understand-competitors.md](../../engineer/process/understand-competitors.md) + avoid gut calls.
13. **Market**: must run [i-want-to-prepare-a-market-research-strategy.md](../../executive/strategy/prepare-a-market-research-strategy.md) + avoid gut calls.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) as the messaging repository + avoid multiple sources.
15. **feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) for gradual message rollout.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); marketing / sales / TL / sponsor owner.
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change messaging.
18. **Comms**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for message usage / launch progress alerts.
20. **retrospective**: after a marketing incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether positioning is still accurate + whether messaging is still reasonable.
22. **ADR**: marketing decisions must be captured as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good marketing -> conversion rises -> revenue rises -> more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-go-to-market.md](./prepare-a-go-to-market.md) — GTM
- Same-class journey: [../../engineer/strategies/prepare-a-brand-strategy.md](../../engineer/strategies/prepare-a-brand-strategy.md) — brand
- Same-class journey: [../../engineer/strategies/prepare-a-sales-enablement-strategy.md](../../engineer/strategies/prepare-a-sales-enablement-strategy.md) — sales enablement
- Same-class journey: [../../engineer/strategies/prepare-a-content-strategy.md](../../engineer/strategies/prepare-a-content-strategy.md) — content
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
