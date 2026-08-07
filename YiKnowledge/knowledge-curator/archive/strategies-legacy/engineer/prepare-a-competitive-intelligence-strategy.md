---

title: I want to prepare a competitive intelligence strategy
aliases:
- I want to prepare a competitive intelligence strategy
- competitive-intelligence-journey
- ci-journey
- competitor-monitoring-journey
- competitive intelligence entry
tags:
- journeys
- competitive-intelligence
- ci
- competitor-monitoring
- battle-card
- win-loss
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
- ../processes/understand-competitors.md
- ./prepare-a-sales-enablement-strategy.md
- ../../executive/strategy/prepare-a-market-research-strategy.md
- ../../engineer/strategies/prepare-a-positioning-strategy.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a competitive intelligence strategy

> **As an** engineer, **I want to** prepare a competitive intelligence, **so that** launch is safe.

> "Monitoring + price + features + differentiation + win/loss + battle card + governance + quarterly audit" reach within 2 hops process + thinking + case study.

## Summary

- Processgo [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinkinggo [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platformgo [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studygo [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing competitive intelligence / CI / competitor monitoring / price / features / differentiation / win/loss / battle card / governance / communication / big-promo freeze / quarterly audit / retrospective, TL + strategy + marketing + sales + sponsor need to look up process + thinking + case study. This entry aggregates competitive-intelligence-related process + thinking + case study into a 2-hop path, avoiding "monitoring scattered / price illusory / differentiation missed / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intelligence intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine illusory · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [market-research-summary.md](../../executive/strategy/prepare-a-market-research-strategy.md) · [differentiation-summary.md](./../../executive/strategy/porter-five-forces.md) |
| `industry/` | [competitors/](../../executive/industry/competitors) · [market-trends/](../../executive/industry/market-trends) · [reports/](../../executive/industry/reports) — competitor market |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — intelligence communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — intelligence matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — intelligence incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-risks](../../brd/) · [reference](../../brd/) — intelligence business |
| `projects/` | each project `architecture-summary.md` §strategy + `adr-*` §intelligence |
| `journeys/` | [../processes/understand-competitors.md](../processes/understand-competitors.md) · [./prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) · [../../executive/strategy/prepare-a-market-research-strategy.md](../../executive/strategy/prepare-a-market-research-strategy.md) · [../../product-manager/frameworks/prepare-a-product-marketing-strategy.md](../../product-manager/frameworks/prepare-a-product-marketing-strategy.md) |

## Action recommendations

1. **First principles**: first ask "intelligence what to solve / what happens if not done / ROI / business impact"; do not pursue intelligence for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "intelligence could go out of control (monitoring scattered / price illusory / differentiation missed / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one tune → behavior changes → another tune; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: satisfy business with the simplest intelligence; do not pile up competitors; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Monitoring**: must run competitor monitoring (features / price / hiring / marketing) + avoid naked run; see [i-want-to-understand-competitors.md](../processes/understand-competitors.md).
6. **Price**: must run price monitoring + avoid gut call.
7. **Features**: must run feature matrix + avoid vagueness.
8. **Differentiation**: must run differentiation positioning + avoid vagueness; see [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md).
9. **Win/loss**: must run win/loss analysis + avoid naked run; see [i-want-to-run-a-retrospective.md](../processes/run-a-retrospective.md).
10. **Battle card**: must run battle card + avoid empty; see [i-want-to-prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md).
11. **Market**: must run [i-want-to-prepare-a-market-research-strategy.md](../../executive/strategy/prepare-a-market-research-strategy.md) + avoid gut call.
12. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) intelligence library + avoid multi-source.
13. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + avoid re-compute.
14. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); strategy / marketing / TL / sponsor owner.
15. **Freeze period**: big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move battle card.
16. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communication inside and outside.
17. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) intelligence coverage / win-rate alert.
18. **Retrospective**: intelligence incident after must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
19. **Quarterly audit**: see [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan intelligence whether still accurate + battle card whether still reasonable.
20. **ADR**: intelligence decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
21. **Flywheel**: intelligence good → win-rate rises → revenue rises → more resources; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [../processes/understand-competitors.md](../processes/understand-competitors.md) — competitors
- Same-class journey: [./prepare-a-sales-enablement-strategy.md](./prepare-a-sales-enablement-strategy.md) — sales enablement
- Same-class journey: [../../executive/strategy/prepare-a-market-research-strategy.md](../../executive/strategy/prepare-a-market-research-strategy.md) — market research
- Same-class journey: [../../product-manager/frameworks/prepare-a-product-marketing-strategy.md](../../product-manager/frameworks/prepare-a-product-marketing-strategy.md) — PMM
- Upstream: [../../executive/industry/README.md](../../executive/industry/README.md) — industry leaf entry
