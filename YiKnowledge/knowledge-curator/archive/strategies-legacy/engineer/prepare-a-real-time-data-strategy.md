---

title: I want to prepare a real-time data strategy
aliases:
- I want to prepare a real-time data strategy
- real-time-data-journey
- streaming-journey
- stream-processing-journey
- real-time data entry
tags:
- journeys
- real-time-data
- stream-processing
- kafka
- flink
- streaming-analytics
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
- ../tools/set-up-a-data-pipeline.md
- ./prepare-a-data-warehouse-strategy.md
- ../../tech-lead/roadmap/prepare-an-event-driven-architecture-strategy.md
- ../../ai-engineer/methodology/rag-design-patterns.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a real-time data strategy

> **As an** engineer, **I want to** prepare a real time data, **so that** launch is safe. 

> "Collection + stream processing + state + window + exactly-once + backpressure + monitoring + quarterly audit" 2-hop reachable process + thinking + cases. 

## Summary

- Process via [data-governance-process.md](../../ai-engineer/data/data-governance.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [graceful-degradation-pattern.md](../../engineer/patterns/graceful-degradation.md) + [circuit-breaker-pattern.md](../../engineer/patterns/circuit-breaker.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md)
- Cases via [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/wins/yiai-rag-hybrid-retrieval.md) + [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md)

## Scenario

When preparing real-time data strategy / stream processing / Kafka / Flink / Pulsar / Spark Streaming / real-time data warehouse / stream-batch unified / exactly-once / state management / window / backpressure / watermark / real-time dashboard / real-time alerts / real-time reporting / real-time big-promo freeze / quarterly real-time audit / real-time retrospective, TL + data + architects + AI + sponsor need to look up process + thinking + cases. This entry aggregates real-time-data-related process + thinking + cases to a 2-hop path, avoiding "missing collection / slow processing / wrong state / backpressure collapse / missing monitoring / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category / leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [data-governance-process.md](../../ai-engineer/data/data-governance.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) |
| `methodology/engineering-patterns/` | [graceful-degradation-pattern.md](../../engineer/patterns/graceful-degradation.md) · [circuit-breaker-pattern.md](../../engineer/patterns/circuit-breaker.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [rate-limiting-pattern.md](../../engineer/patterns/rate-limiting.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — stream essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think loss · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) |
| `tech/ai-platform/` | [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — real-time reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — data matrix |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) — real-time North Star |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/wins/yiai-rag-hybrid-retrieval.md) · [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [bugs/](../../engineer/lessons/failures/bugs) — real-time failure archive |
| `lessons/gotchas/` | [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [scenarios](../../brd/) — real-time business |
| `projects/` | each project `architecture-summary.md` §real-time + `adr-*` §stream |
| `journeys/` | [../tools/set-up-a-data-pipeline.md](../tools/set-up-a-data-pipeline.md) · [./prepare-a-data-warehouse-strategy.md](./prepare-a-data-warehouse-strategy.md) · [../../tech-lead/roadmap/prepare-an-event-driven-architecture-strategy.md](../../tech-lead/roadmap/prepare-an-event-driven-architecture-strategy.md) · [./prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does real-time solve / what happens if not done / ROI / user impact"; do not go real-time for the sake of real-time; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First imagine "real-time could go out of control (loss / duplication / backpressure collapse / trust collapse) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: One round of real-time → user behavior changes → another round of adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest stream that meets business wins; do not pile up engines; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Collection**: Must run collection + must define schema + must have backpressure + avoid loss. 
6. **Selection**: Must run Kafka / Flink / Pulsar / Spark Streaming + must select per business. 
7. **Exactly-once**: Must run exactly-once + must checkpoint + avoid at-most-once. 
8. **State**: Must run state management + must have backend + must have TTL + avoid unbounded growth. 
9. **Window**: Must run windows (tumbling / sliding / session) + must have watermark + avoid out-of-order. 
10. **Backpressure**: Must run backpressure + must degrade + must buffer; follow [graceful-degradation-pattern.md](../../engineer/patterns/graceful-degradation.md). 
11. **Stream-batch unified**: Must run stream-batch unification + must unify SQL + avoid dual pipelines. 
12. **Real-time data warehouse**: Must run real-time data warehouse + must use OLAP + avoid batch-runs instead. 
13. **AI real-time**: LLM must run [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) + must have real-time vectors + must have streaming evaluation. 
14. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); data / AI / TL / sponsor owner. 
15. **Freeze period**: During big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change stream processing. 
16. **Reporting**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report to sponsor + business. 
17. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for lag / throughput / latency alerts. 
18. **Drill**: Must run [i-want-to-run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) + must include broker failure. 
19. **Retrospective**: After real-time failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs). 
20. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether schema is still accurate + whether lag is still reasonable. 
21. **ADR**: Real-time decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **Flywheel**: Real-time done well → faster decisions → experience rises → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-class journey: [../tools/set-up-a-data-pipeline.md](../tools/set-up-a-data-pipeline.md) — data pipeline
- Same-class journey: [./prepare-a-data-warehouse-strategy.md](./prepare-a-data-warehouse-strategy.md) — data warehouse
- Same-class journey: [../../tech-lead/roadmap/prepare-an-event-driven-architecture-strategy.md](../../tech-lead/roadmap/prepare-an-event-driven-architecture-strategy.md) — event-driven
- Same-class journey: [./prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) — alerting
- Upstream: [../../ai-engineer/data/README.md](../../ai-engineer/data/README.md) — data leaf entry
