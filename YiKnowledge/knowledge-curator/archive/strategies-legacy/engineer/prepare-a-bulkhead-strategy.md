---

title: I want to prepare a bulkhead strategy
aliases:
- I want to prepare a bulkhead isolation strategy
- bulkhead-strategy-journey
- bulkhead-journey
- bulkhead entry
tags:
- journeys
- bulkhead
- isolation
- thread-pool
- semaphore
- resourced-partition
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
- ./prepare-a-circuit-breaker-strategy.md
- ./prepare-a-timeout-strategy.md
- ./prepare-a-backpressure-strategy.md
- ./prepare-a-connection-pool-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a bulkhead strategy

> **As an** engineer, **I want to** prepare a bulkhead, **so that** launch is safe.

> "Pool + semaphore + isolation + circuit breaker + governance + quarterly audit" — reach process + thinking + case within 2 hops.

## Summary

- Process goes through [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking goes through [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform goes through [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases go through [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing bulkhead / pool / semaphore / isolation / circuit breaker / governance / promotion freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + cases. This entry aggregates bulkhead-related process + thinking + cases into 2-hop paths to avoid "scattered pools / isolation gaps / drift / messy closed loops / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (by class/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — bulkhead intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-thinking scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | bulkhead · thread-pool · semaphore · resource-partition |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | bulkhead-runtime · pool-manager · semaphore-store · model-router |
| `tech/ai-foundations/` | bulkhead-patterns · isolation-suite · pool-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — bulkhead reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — bulkhead incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — bulkhead business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §bulkhead |
| `journeys/` | [./prepare-a-circuit-breaker-strategy.md](./prepare-a-circuit-breaker-strategy.md) · [./prepare-a-timeout-strategy.md](./prepare-a-timeout-strategy.md) · [./prepare-a-backpressure-strategy.md](./prepare-a-backpressure-strategy.md) · [./prepare-a-connection-pool-strategy.md](./prepare-a-connection-pool-strategy.md) · [./prepare-a-retry-strategy.md](./prepare-a-retry-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does bulkhead solve / what happens if not done / ROI / business impact"; do not build bulkheads for their own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "bulkhead could go out of control (scattered pools / isolation gaps / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one bulkhead → flow changes → another bulkhead; go through [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest bulkhead that satisfies the business wins; do not pile up pools; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Pool**: must run pool / size / queue + dispersion check.
6. **Semaphore**: must run semaphore / permit / concurrency limit + leak check.
7. **Isolation**: must run isolation / tenant / resource + leak check.
8. **Circuit breaker link**: must run link / circuit breaker / fallback + leak check.
9. **Circuit breaker**: must run [i-want-to-prepare-a-circuit-breaker-strategy.md](./prepare-a-circuit-breaker-strategy.md) + do not bare-run.
10. **Timeout**: must run [i-want-to-prepare-a-timeout-strategy.md](./prepare-a-timeout-strategy.md) + do not bare-run.
11. **Backpressure**: must run [i-want-to-prepare-a-backpressure-strategy.md](./prepare-a-backpressure-strategy.md) + do not bare-run.
12. **Connection pool**: must run [i-want-to-prepare-a-connection-pool-strategy.md](./prepare-a-connection-pool-strategy.md) + do not bare-run.
13. **Retry**: must run [i-want-to-prepare-a-retry-strategy.md](./prepare-a-retry-strategy.md) + do not bare-run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for bulkhead library + do not multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + do not bare-run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner.
17. **Freeze period**: during promotion go through [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not touch bulkheads.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for pool-full alerts.
20. **Retrospective**: after bulkhead incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: go through [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether pool is still accurate / isolation is still reasonable.
22. **ADR**: bulkhead decisions must be captured in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: bulkhead done well → availability rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-circuit-breaker-strategy.md](./prepare-a-circuit-breaker-strategy.md) — circuit breaker
- Same-class journey: [./prepare-a-timeout-strategy.md](./prepare-a-timeout-strategy.md) — timeout
- Same-class journey: [./prepare-a-backpressure-strategy.md](./prepare-a-backpressure-strategy.md) — backpressure
- Same-class journey: [./prepare-a-connection-pool-strategy.md](./prepare-a-connection-pool-strategy.md) — connection pool
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
