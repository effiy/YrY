---

title: I want to prepare a Van Westendorp strategy
aliases:
- I want to prepare a price sensitivity strategy
- van-westendorp-journey
- psm-journey
- Van Westendorp entry
tags:
- journeys
- van-westendorp
- psm
- price-sensitivity
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-conjoint-analysis-strategy.md
- ./prepare-a-pricing-strategy.md
- ../../product-manager/frameworks/prepare-a-kano-strategy.md
- ./prepare-a-packaging-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a Van Westendorp strategy

> **As an** engineer, **I want to** prepare a van westendorp, **so that** launch is safe.

> "Van Westendorp + four questions + acceptable range + Governance + Quarterly audit" reach process + thinking + case within 2 hops.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing Van Westendorp / four questions / acceptable range / Governance / promotion freeze / quarterly audit / retrospective, TL + product + pricing + algorithm + sponsor need to look up process + thinking + case. This entry aggregates Van Westendorp-related process + thinking + case into a 2-hop path, avoiding "scattered categories / missing cross / truth loss / closed loop chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — price intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — cascade · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | van-westendorp · psm · price-sensitivity · acceptable-range |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | psm-runtime · survey-store · curve-engine · audit-log |
| `tech/ai-foundations/` | psm-patterns · survey-suite · curve-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — price communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — Platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — price incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — price business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §price |
| `journeys/` | [./prepare-a-conjoint-analysis-strategy.md](./prepare-a-conjoint-analysis-strategy.md) · [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) · [../../product-manager/frameworks/prepare-a-kano-strategy.md](../../product-manager/frameworks/prepare-a-kano-strategy.md) · [./prepare-a-packaging-strategy.md](./prepare-a-packaging-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: ask first "what does Van Westendorp solve / what if not done / ROI / business impact"; do not ask for the sake of asking; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: imagine "Van Westendorp could go out of control (scattered categories / missing cross / truth loss / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one question → row behavior changes → another question; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest four questions that meet business wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Four questions**: must run four questions / too cheap / cheap / expensive / too expensive + no scatter.
6. **Curve**: must run curve / cross / range + no gaps.
7. **Observable**: must run observable / traceable / audit + no gaps.
8. **Closed loop**: must run closed loop / retrospective / archive + no gaps.
9. **Conjoint analysis**: must run [i-want-to-prepare-a-conjoint-analysis-strategy.md](./prepare-a-conjoint-analysis-strategy.md) + no naked run.
10. **Pricing**: must run [i-want-to-prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) + no naked run.
11. **Kano**: must run [i-want-to-prepare-a-kano-strategy.md](../../product-manager/frameworks/prepare-a-kano-strategy.md) + no naked run.
12. **Packaging**: must run [i-want-to-prepare-a-packaging-strategy.md](./prepare-a-packaging-strategy.md) + no naked run.
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) question library + no multi-source.
15. **Contract QA**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / product / pricing / algorithm owners.
17. **Freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not touch four questions.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for price anomaly alerts.
20. **Retrospective**: after price incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md); scan whether four questions still accurate / range still reasonable.
22. **ADR**: price decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good pricing → conversion up → trust up → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-conjoint-analysis-strategy.md](./prepare-a-conjoint-analysis-strategy.md) — conjoint analysis
- Related journey: [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) — pricing
- Related journey: [../../product-manager/frameworks/prepare-a-kano-strategy.md](../../product-manager/frameworks/prepare-a-kano-strategy.md) — Kano
- Related journey: [./prepare-a-packaging-strategy.md](./prepare-a-packaging-strategy.md) — packaging
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
