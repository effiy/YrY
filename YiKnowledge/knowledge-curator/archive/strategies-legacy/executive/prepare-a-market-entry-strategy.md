---

title: I want to prepare a market entry strategy
aliases:
- i-want-to-prepare-a-market-entry-strategy
- market-entry-journey
- country-entry-journey
- region-entry-journey
- market-entry-portal
tags:
- journeys
- market-entry
- country-entry
- gtm
- localization
- compliance
- channel
category: executive/strategy
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- executive
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive filename verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ../../product-manager/frameworks/prepare-a-go-to-market.md
- ./prepare-a-market-research-strategy.md
- ../../engineer/strategies/prepare-a-compliance-framework.md
- ../../product-manager/frameworks/prepare-a-go-to-market.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a market entry strategy

> **As an** executive, **I want to** prepare a market entry, **so that** launch is safe.

> "Assessment + selection + compliance + localization + channel + GTM + governance + quarterly audit" — processes + thinking + cases reachable within 2 hops.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platforms: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) + [caching-pattern.md](../../engineer/patterns/caching.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing market entry / country entry / region entry / GTM / compliance / localization / channel / governance / reporting / promotion freeze / quarterly audit / retrospective, TL + strategy + marketing + legal + sponsor need to look up processes + thinking + cases. This entry aggregates market-entry-related processes + thinking + cases into 2-hop paths to avoid "weak assessment / compliance gaps / localization missing / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — entry essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think collapse · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [positioning-summary.md](../../engineer/strategies/prepare-a-positioning-strategy.md) · [market-research-summary.md](../../executive/strategy/prepare-a-market-research-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `industry/` | [competitors/](../../executive/industry/competitors) · [market-trends/](../../executive/industry/market-trends) · [use-cases/](../../product-manager/industry-cases) — entering the market |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — entering reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — entering the matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — entering the failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-risks](../../brd/) · [reference](../../brd/) — entering compliance |
| `projects/` | Each project `architecture-summary.md` § strategy + `adr-*` § entry |
| `journeys/` | [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [./prepare-a-market-research-strategy.md](./prepare-a-market-research-strategy.md) · [../../engineer/strategies/prepare-a-compliance-framework.md](../../engineer/strategies/prepare-a-compliance-framework.md) · [../../engineer/strategies/prepare-a-multi-region-strategy.md](../../engineer/strategies/prepare-a-multi-region-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does entry solve / what happens if not done / ROI / business impact"; don't enter for entry's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "how could entry go out of control (compliance gaps / localization missing / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one entry → behavior changes → another adjustment; use [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest entry that meets business needs wins; don't pile on countries; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Assessment**: must run market assessment (scale / competitors / channels) + no gut calls; see [i-want-to-prepare-a-market-research-strategy.md](./prepare-a-market-research-strategy.md).
6. **Selection**: must run country / region selection + no one-size-fits-all.
7. **Compliance**: must run compliance framework + no naked run; see [i-want-to-prepare-a-compliance-framework.md](../../engineer/strategies/prepare-a-compliance-framework.md).
8. **Localization**: must run localization (language / currency / culture) + no naked run.
9. **Channels**: must run channel partners + no naked run; see [i-want-to-prepare-a-partner-strategy.md](../../engineer/strategies/prepare-a-partner-strategy.md).
10. **GTM**: must run [i-want-to-prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) + no naked run.
11. **Multi-region**: must run [i-want-to-prepare-a-multi-region-strategy.md](../../engineer/strategies/prepare-a-multi-region-strategy.md) + no single region only.
12. **Privacy**: must run [i-want-to-prepare-a-data-privacy-strategy.md](../../engineer/strategies/prepare-a-data-privacy-strategy.md) + no violations.
13. **Pricing**: must run [i-want-to-prepare-a-pricing-strategy.md](../../engineer/strategies/prepare-a-pricing-strategy.md) local pricing + no one-size-fits-all.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for entry materials + no multiple sources.
15. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) for gradual entry.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); strategy / marketing / legal / TL / sponsor owners.
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); don't change entry strategy.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal/external reporting.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for entry progress / compliance / anomaly alerts.
20. **Retrospective**: after entry failure, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: use [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether entry is still accurate + whether compliance is still reasonable.
22. **ADR**: entry decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good entry → broader market → higher revenue → more regions; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Similar journeys: [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) — GTM
- Similar journeys: [./prepare-a-market-research-strategy.md](./prepare-a-market-research-strategy.md) — market research
- Similar journeys: [../../engineer/strategies/prepare-a-compliance-framework.md](../../engineer/strategies/prepare-a-compliance-framework.md) — compliance
- Similar journeys: [../../engineer/strategies/prepare-a-multi-region-strategy.md](../../engineer/strategies/prepare-a-multi-region-strategy.md) — multi-region
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
