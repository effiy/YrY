---

title: I want to prepare a marketing mix strategy
aliases:
- Marketing mix strategy
- marketing-mix-journey
- 4p-journey
- marketing mix entry
tags:
- journeys
- marketing-mix
- 4p
- product-price-place
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
- ../../product-manager/frameworks/prepare-a-product-strategy.md
- ./prepare-a-pricing-strategy.md
- ./prepare-a-promotion-strategy.md
- ./prepare-a-channel-management-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a marketing mix strategy

> **As an** engineer, **I want to** prepare a marketing mix, **so that** launch is safe.

> Reach process + thinking + cases within 2 hops across "marketing mix + 4P + channel + governance + quarterly audit".

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing the marketing mix / 4P / channel / governance / launch freeze / quarterly audit / retrospective, TL + marketing + product + channel + sponsor need to look up process + thinking + cases. This entry aggregates marketing-mix-related process + thinking + cases into a 2-hop path, avoiding "scattered 4P / missed channel / drift risk / messy closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of the mix · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | marketing-mix · 4p · product-price-place · mix |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | mix-runtime · 4p-store · allocation-engine · audit-log |
| `tech/ai-foundations/` | mix-patterns · 4p-suite · allocation-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — mix comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — mix failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — mix business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §mix |
| `journeys/` | [../../product-manager/frameworks/prepare-a-product-strategy.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) · [./prepare-a-promotion-strategy.md](./prepare-a-promotion-strategy.md) · [./prepare-a-channel-management-strategy.md](./prepare-a-channel-management-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does the mix solve / what happens if not done / ROI / business impact"; do not mix for mixing's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "the mix could go out of control (scattered 4P / missed channel / drift risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one mix → behavior changes → another mix; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest 4P that meets business needs wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **4P**: must run 4P / product / price / channel / promotion; no scatter.
6. **Allocation**: must run allocation / weighting / retrospective; no leaks.
7. **Observable**: must run observable / traceability / audit; no leaks.
8. **Closed loop**: must run closed loop / retrospective / archive; no leaks.
9. **Product**: must follow [i-want-to-prepare-a-product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md); no bare run.
10. **Pricing**: must follow [i-want-to-prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md); no bare run.
11. **Promotion**: must follow [i-want-to-prepare-a-promotion-strategy.md](./prepare-a-promotion-strategy.md); no bare run.
12. **Channel management**: must follow [i-want-to-prepare-a-channel-management-strategy.md](./prepare-a-channel-management-strategy.md); no bare run.
13. **Security**: must follow [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md); no bare run.
14. **SSOT**: must follow [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for the 4P library; no multi-source.
15. **Contract tests**: must follow [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md); no bare run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / marketing / product / channel owners.
17. **Freeze window**: during launches follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not touch the 4P mix.
18. **Comms**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for mix exception alerts.
20. **Retrospective**: after a mix failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) and archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether 4P is still accurate / allocation still reasonable.
22. **ADR**: mix decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good mix → growth rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [../../product-manager/frameworks/prepare-a-product-strategy.md](../../product-manager/frameworks/prepare-a-product-strategy.md) — product
- Same-class journey: [./prepare-a-pricing-strategy.md](./prepare-a-pricing-strategy.md) — pricing
- Same-class journey: [./prepare-a-promotion-strategy.md](./prepare-a-promotion-strategy.md) — promotion
- Same-class journey: [./prepare-a-channel-management-strategy.md](./prepare-a-channel-management-strategy.md) — channel management
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
