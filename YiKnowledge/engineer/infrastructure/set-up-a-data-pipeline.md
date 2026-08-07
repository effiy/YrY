---
title: Set up a data pipeline
aliases:
- i-want-to-set-up-a-data-pipeline
- data-pipeline-journey
- etl-journey
- data-pipeline-entry
tags:
- journeys
- data
- etl
- elt
- lakehouse
- pipeline
- cdc
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: baseline is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../strategies/migrate-data.md
- ../../executive/strategy/handle-data-compliance.md
- ./reduce-cost.md
- ../../ai-engineer/data/README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to set up a data pipeline

> **As an** engineer, **I want to** set up a data pipeline, **so that** baseline is reproducible.

> "Source → collection → ETL/ELT → storage → governance → quality + CDC + lakehouse + monitoring + cost" reach data stack + patterns + thinking + case studies within 2 hops.

## Summary

- Data stack goes via [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) + [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) + [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md)
- Process goes via [data-migration-process.md](data-migration.md) + [data-compliance-process.md](data-compliance.md) + [monitoring-governance-process.md](../process/monitoring-governance.md)
- Thinking goes via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)

## Core viewpoints

**The data pipeline is a product, not a one-off script.** A pipeline that serves 3 consumers today will serve 15 consumers next year. Every consumer has different expectations for latency, consistency, schema, and SLA. The pipeline must be designed with a product mindset: versioned, documented, monitored, and supported. A one-off script that nobody understands and nobody can modify is a pipeline that will be rewritten from scratch when the first consumer's requirements change.

**Schema drift is inevitable; the pipeline must handle it by design.** The source system will add columns, rename fields, and change types without notifying the pipeline team. A pipeline that fails on schema drift is a pipeline that fails regularly. The pipeline must be designed to tolerate schema changes: unknown fields are ignored, missing fields are backfilled with defaults, and type mismatches are caught and quarantined rather than crashing the pipeline.

**Idempotency is the difference between a reliable pipeline and an unreliable one.** A pipeline that cannot be replayed from a checkpoint is a pipeline that cannot recover from a failure. Every stage of the pipeline must be idempotent: running the same data through the same stage twice produces the same output. Idempotency is not a nice-to-have; it is the property that makes the pipeline debuggable, recoverable, and auditable.

**Data quality monitoring must be part of the pipeline, not a separate system.** A pipeline that reports "all tasks completed successfully" while silently producing null values for 30% of rows is a pipeline that is lying to the operator. Data quality checks (completeness, uniqueness, timeliness, consistency, accuracy) must run as part of the pipeline and must alert on degradation. The pipeline is not complete until the quality checks pass.

**The pipeline cost is dominated by the slowest stage, not the average stage.** A pipeline with 5 stages, where 4 stages take 5 minutes and 1 stage takes 2 hours, costs as much as a 2-hour pipeline. The optimization effort must focus on the bottleneck stage, not on making the fast stages faster. Sharding the bottleneck stage, switching to incremental processing, or moving the bottleneck to a more cost-efficient compute tier are the highest-leverage optimizations.

## Key info

- **ETL vs. ELT — decision framework**: ETL (Extract → Transform → Load) — transform before loading, best when: (1) transformation logic is complex and computationally expensive, (2) target system is a relational database with schema enforcement, (3) data volume is moderate (<1TB/day). ELT (Extract → Load → Transform) — load raw data first, transform in-place, best when: (1) target system is a data lake/lakehouse with scalable compute, (2) transformation logic is evolving (schema-on-read), (3) data volume is large (>1TB/day). The Yi-family projects use ETL for simple pipelines (RSS → MongoDB) and would use ELT for any future analytics pipeline on a lakehouse.
- **Pipeline idempotency patterns**: (1) Upsert (INSERT ... ON CONFLICT UPDATE) — safest for row-level operations, handles both new and existing rows; (2) Checkpointing — record the last successfully processed offset (Kafka offset, timestamp, row ID), resume from checkpoint on retry; (3) Idempotency keys — generate a deterministic key from the input data (hash of all fields), use as the primary key to prevent duplicates; (4) Watermark-based deduplication — for streaming pipelines, maintain a watermark (e.g., "processed up to timestamp T"), discard events older than the watermark. The idempotency pattern must be chosen at pipeline design time, not retrofitted after the first duplicate data incident.
- **Data quality dimensions (the 6 checks)**: (1) Completeness — are any required fields null? Alert if null rate >1%; (2) Uniqueness — are any supposed-to-be-unique fields duplicated? Alert on any duplicates; (3) Timeliness — is data arriving within the expected latency SLA? Alert if lag >2x normal; (4) Consistency — do related datasets agree? (e.g., order count in orders table = order count in payments table); (5) Accuracy — do values match known business rules? (e.g., age between 0-120, email matches regex); (6) Validity — do values conform to expected types and ranges? Alert on schema violations. These checks run as part of the pipeline, not as a separate system; the pipeline is not complete until all 6 checks pass.
- **Schema drift handling strategies**: (1) Ignore unknown fields — log a warning, continue processing (default); (2) Backfill missing fields — use a default value or derived value for new required fields; (3) Quarantine incompatible rows — rows that fail type conversion are moved to a dead-letter queue for manual inspection; (4) Schema evolution — automatically apply backward-compatible schema changes (add column, widen type) and alert on breaking changes (remove column, narrow type). The strategy must be configured per field, not per pipeline; critical fields (user ID, timestamp) should quarantine on drift, informational fields can ignore.
- **Pipeline monitoring metrics**: (1) Throughput — rows/events per second, alert if drops >50% from baseline; (2) Latency — end-to-end time from source to target, alert if p99 >2x SLA; (3) Error rate — percentage of rows that fail processing, alert if >0.1%; (4) Dead-letter queue size — number of quarantined rows, alert if >1000 or growing; (5) Schema drift events — count of schema changes detected, alert on any breaking change; (6) Cost — compute + storage cost per day, alert if >20% above baseline. The Yi-family projects currently have no formal data pipeline monitoring.
- **Yi-family data pipeline landscape**: YiAi — knowledge watcher pipeline (file system → Python watcher → markdown parser → MongoDB), RSS ingestion pipeline (RSS feed → Python fetcher → html2text → MongoDB), RAG indexing pipeline (MongoDB → embedding model → vector store). YiVad — no data pipeline (consumes data from YiAi MongoDB via RPC). YiPet — no data pipeline (consumes data from YiAi via RPC, Chrome storage for local state). All pipelines are Python-based, use MongoDB as the central data store, and are batch-oriented (not streaming).

## Scenario

When building a data pipeline / ETL / ELT / CDC / real-time stream / lakehouse / data governance / data quality / cost optimization, data engineering + platform + architects + business owners need to look up data stack + process + patterns + thinking + case studies. This entry aggregates data-pipeline-related stack + process + thinking into 2-hop paths, avoiding "pipeline without monitoring / data without governance / schema drift unwatched / cost explosion / compliance gaps / reinventing the wheel".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `work/processes/` | [data-migration-process.md](data-migration.md) · [data-compliance-process.md](data-compliance.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [incident-response-process.md](../process/incident-response.md) · [capacity-planning-process.md](capacity-planning.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `tech/ai-platform/` | [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) — AI data pipeline |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) — RAG data pipeline |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) |
| `brd/reference/` | [countries.md](./../../brd/README.md) · [regulations.md](./../../brd/README.md) — cross-border data compliance |
| `brd/domains/` | [data.md](./../../brd/README.md) — data domain BRD |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — data stakeholders |
| `projects/` | each project `adr-*.md` — data pipeline ADR; `architecture-summary.md` §data |

## Action recommendations

1. **First principles**: first ask "who is the data consumer / SLA / scale / frequency / latency requirement / consistency / cost"; do not directly pick tools; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how pipeline can blow up (schema drift / data loss / replay / latency pile-up / cost explosion / compliance fines)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: pipeline multiplies → lineage complex → rebuild hard → team knowledge gap; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest stack meeting SLA wins; do not over-engineer for "future"; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **ETL vs ELT**: ETL (transform-then-load, traditional) / ELT (load-then-transform, lakehouse preferred); pick by scenario; see [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md).
6. **Lakehouse**: underlying object storage + tabular (Iceberg / Delta / Hudi) + metadata; see [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md).
7. **CDC**: change data capture (Debezium / incremental log); better than full batch; suitable for high-frequency sync.
8. **Data modeling**: dimensional modeling (fact / dimension) / Data Vault / OneBigTable; pick by scenario; see [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md).
9. **Data governance**: lineage + dictionary + quality + permissions + lifecycle cadence; see [data-governance-summary.md](../../ai-engineer/data/data-governance.md).
10. **Data quality**: must monitor completeness / uniqueness / timeliness / consistency / accuracy; SLA violation alerts.
11. **Monitoring**: follow [monitoring-governance-process.md](../process/monitoring-governance.md); must monitor latency / throughput / error rate / cost / quality.
12. **Cost**: must run [capacity-planning-process.md](capacity-planning.md) + [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md); scan duplicate pipelines / cold data / excessive replicas.
13. **Compliance**: follow [data-compliance-process.md](data-compliance.md) + [regulations.md](./../../brd/README.md); cross-border via [countries.md](./../../brd/README.md).
14. **Replay**: pipeline must be replayable (idempotent + versioned + checkpoint); non-replayable use dual-write + validation.
15. **Dual world**: new and old pipelines parallel + dual-write + sample compare then cut; see [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md).
16. **ADR**: pipeline architecture must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
17. **Retrospective**: pipeline incidents follow [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) retrospective + archive to [lessons/failures/bugs/](../lessons).

## Anti-patterns

- **Building the pipeline before defining the consumer's requirements.** The engineering team builds a beautiful, scalable, real-time pipeline, and then discovers that the consumer only needs a daily batch export of 3 columns. The pipeline is over-engineered, expensive to maintain, and does not solve the actual problem. Start with the consumer's SLA (latency, completeness, schema) and work backward to the pipeline design.

- **Hardcoding schema assumptions in the pipeline code.** A pipeline that assumes column 5 is always a string will fail when the source system changes column 5 to an integer. The pipeline must validate the schema at runtime, not assume it at compile time. Schema validation rules should be declarative (configuration, not code) so they can be updated without redeploying the pipeline.

- **Treating the pipeline as a black box with no intermediate visibility.** A pipeline that only reports success or failure at the end gives the operator no information about where the failure occurred or how much data was affected. Every stage must report its own metrics (rows processed, rows failed, latency, throughput) so that the operator can pinpoint the failing stage and the affected data range.

- **Assuming full refresh is always sufficient.** A pipeline that truncates and reloads the entire dataset every run is simple, but it does not scale to terabyte-scale data and it destroys the history needed for time-series analysis. Incremental processing (CDC, change tracking, watermark-based) must be the default, with full refresh reserved for the initial load and recovery scenarios.

- **Neglecting the pipeline's own observability.** A pipeline that is monitored by the same system it feeds is a pipeline that cannot be monitored when it fails. The pipeline's own monitoring (logs, metrics, alerts) must be in a separate system with a separate dependency chain. If the pipeline goes down, the monitoring must still be up.

## Related

- Same category journey: [../strategies/migrate-data.md](migrate-data.md) — data migration
- Same category journey: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — data compliance
- Same category journey: [./reduce-cost.md](../engineering/reduce-cost.md) — cost optimization
- Same category journey: [../projects/build-a-rag-pipeline.md](../projects/build-a-rag-pipeline.md) — RAG data pipeline
- Upstream: [../../ai-engineer/data/README.md](../../ai-engineer/data/README.md) — data leaf entry
