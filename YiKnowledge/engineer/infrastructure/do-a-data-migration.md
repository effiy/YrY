---
title: Do a data migration
aliases:
- I want to do a data migration
- data-migration-journey
- schema-migration-journey
- etl-migration-journey
- data migration entry
tags:
- journeys
- data-migration
- schema-migration
- etl
- dual-run
- backfill
- rollback
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: review is structured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../strategies/prepare-a-deployment-strategy.md
- ../../tech-lead/roadmap/deprecate-a-feature.md
- ../../executive/strategy/do-a-data-retention-review.md
- ../../engineer/engineering/dual-world-boundary.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to do a data migration

> **As an** engineer, **I want to** do a data migration, **so that** review is structured. 

> "Assessment + mapping + dual-run + traffic cut + rollback + validation + monitoring + retrospective" reach process + thinking + case study within 2 hops. 

## Summary

- Process follows [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) + [monitoring-governance-process.md](../process/monitoring-governance.md) + [incident-response-process.md](../process/incident-response.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) + [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md)
- Case study follows [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) + [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md)

## Core viewpoints

**The data migration is a deployment, not a database operation.** A migration that is run manually by a DBA at a terminal is a migration that has no version control, no review, no rollback plan, and no audit trail. The migration script must be checked into version control, reviewed like any other code change, deployed through the CI/CD pipeline, and executed by the deployment system, not by a human at a terminal.

**The dual-run period is the migration's insurance policy.** Running the old and new systems in parallel, writing to both, and comparing the outputs catches migration errors before they affect users. The dual-run must last long enough to cover a full business cycle (typically 1-2 weeks), and the reconciliation must be continuous, not a one-time check. The cost of the dual-run is the insurance premium against data corruption.

**The rollback path must be designed before the migration, not during the incident.** A migration that is rolled back by reversing the migration script is a migration that will take as long to roll back as it took to run. The rollback must be instantaneous (traffic cut to the old system) or near-instantaneous (the old system is still running and receiving writes). A rollback that takes longer than 5 minutes is a rollback that will cause a business disruption.

**The migration's success is measured by data correctness, not by the migration script's exit code.** A migration script that returns 0 (success) but silently dropped 2% of rows due to constraint violations is a migration that failed. The migration must include verification steps that run after the script completes: row counts, checksums, sampling, and business-rule validation. The script's exit code is a necessary but not sufficient condition for success.

**The migration is not complete until the old system is decommissioned.** Running the old and new systems in parallel indefinitely doubles the operational burden and creates ambiguity about which system is authoritative. The migration plan must include a decommissioning date for the old system, and the decommissioning must be enforced. A migration that never decommissions the old system is a migration that never finishes, and the old system will eventually become a source of data inconsistency.

## Key info

- **Data migration phase checklist (8 phases)**: (1) Assessment — inventory all data sources, schemas, volumes, dependencies, and consumers; estimate migration duration and downtime window; (2) Mapping — field-by-field mapping from old schema to new schema, including type conversions, default values, and transformations; (3) Dry-run — execute migration against a production-scale copy, measure duration, verify row counts and checksums; (4) Dual-write — application writes to both old and new systems, reads from old system only, run for 1-2 weeks; (5) Backfill — migrate historical data while dual-write is active, verify consistency between old and new; (6) Dual-read — application reads from both systems, compares results, alerts on discrepancies; (7) Traffic cut — switch reads to new system, keep writing to old system for rollback, observe for 24-48 hours; (8) Decommission — stop writes to old system, archive old data, remove old system infrastructure. Each phase has a go/no-go gate; skipping a phase because "this migration is small" is the normalization of deviance.
- **Migration script requirements**: (1) Version controlled — checked into the repository alongside application code, reviewed in PR; (2) Idempotent — running the script twice produces the same result, achieved via `IF NOT EXISTS` guards, upsert semantics, or checkpointing; (3) Reversible — every `UP` migration has a corresponding `DOWN` migration that returns the schema to the previous state; (4) Batch processing — processes data in batches (1000-10000 rows) to avoid long-running transactions and table locks; (5) Progress reporting — logs progress every N rows with ETA, so the operator knows whether the migration is 10% or 90% complete; (6) Timeout — has a maximum execution time after which it aborts and rolls back, preventing a stuck migration from blocking deployments indefinitely.
- **Dual-run reconciliation strategy**: During the dual-write and dual-read phases, reconcile old and new systems: (1) Row count comparison — total rows must match within 0.1% tolerance; (2) Checksum comparison — per-table checksums must match; (3) Sampling — random sample of 1000 rows per table, field-by-field comparison; (4) Business rule validation — key business invariants must hold in both systems (e.g., "sum of all account balances = X"). Reconciliation runs continuously (every hour) during the dual-run period; discrepancies are logged and investigated within 2 hours. The dual-run must cover at least one full business cycle (typically 1-2 weeks).
- **Rollback mechanisms by migration type**: (1) Schema-only migration (add column, change type) — reverse migration script, tested in dry-run, <5 minute execution; (2) Data migration with dual-write — traffic cut back to old system, <1 minute via feature flag or load balancer; (3) Data migration without dual-write — restore from backup taken immediately before migration, 30+ minutes, potential data loss of writes during migration; (4) Database switch (MySQL → PostgreSQL) — cut back to old database, old system must remain running and receiving writes for the entire dual-run period. The rollback mechanism must be tested in the dry-run phase; an untested rollback is not a rollback plan.
- **Yi-family data migration history**: YiPet stack migration — MongoDB document structure unchanged, migration was code-only (React 15 → 18.3, Bootstrap → Ant Design), no data migration required. YiVad aicr port — knowledge base leaf data migrated from YiWeb MongoDB collection to YiVad MongoDB collection via one-time script, verified with row count + checksum. YiAi RAG pipeline — knowledge base markdown files re-indexed when switching embedding models, migration was a re-index operation (delete old embeddings, generate new embeddings), verified with ragas retrieval metrics. The Yi-family projects have not yet executed a large-scale schema migration with dual-write/dual-read.

## Scenario

When doing data migration / schema evolution / table-structure changes / ETL migration / DB switch / multi-tenant migration / data backfill / data cleansing / data dual-run / traffic cut / rollback / data validation / migration communication / migration monitoring / migration retrospective / quarterly migration audit / pre-big-promo migration freeze, TL + architect + DBA + data + sponsor need to look up process + thinking + case study. This entry aggregates migration-related process + thinking + case study into 2-hop paths, avoiding "hollow assessment / wrong mapping / missing dual-run / chaotic traffic cut / slow rollback / missing validation / missing monitoring". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [incident-response-process.md](../process/incident-response.md) · [data-governance-process.md](../../ai-engineer/data/data-governance.md) · [code-review.md](../quality-security/do-a-code-review.md) · [capacity-planning-process.md](capacity-planning.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [graceful-degradation-pattern.md](../architecture-design/graceful-degradation.md) · [observability-pattern.md](../engineering/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — migration essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert dirty data · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../infrastructure/write-a-runbook.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../process/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — migration communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — migration team |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — migration failure archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-risks](../../brd/) · [scenarios](../../brd/) — business impact |
| `projects/` | each project `architecture-summary.md` §data + `adr-*` §migration |
| `journeys/` | [../strategies/prepare-a-deployment-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-deployment-strategy.md) · [../../tech-lead/roadmap/deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md) · [../../executive/strategy/do-a-data-retention-review.md](../../executive/strategy/do-a-data-retention-review.md) · [../strategies/decompose-a-monolith.md](../architecture-design/decompose-a-monolith.md) |

## Action recommendations

1. **First principles**: first ask "what does migration solve / what if not migrated / ROI / user impact"; do not migrate for the sake of migrating; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how migration could go out of control (dirty data / data loss / wrong cut / slow rollback / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one migration → capacity changes → another expansion; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest migration that satisfies business wins; do not pile up tools; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Assessment**: must run schema diff + capacity + dependencies + rollback feasibility; see [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md). 
6. **Mapping**: must run field mapping + type mapping + default values + validation. 
7. **Dual-run**: must run [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + dual-write + diff + reconciliation. 
8. **Backfill**: must run backfill + batches + reentrant + progress. 
9. **Traffic cut**: must run ratio + batches + second-level rollback + readiness probes. 
10. **Rollback**: must run rollback drill + time window + data compatibility. 
11. **Contract**: must run [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) + before/after contract validation. 
12. **ETL**: must run [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) + idempotent + incremental + monitoring. 
13. **Data governance**: must run [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + masking + audit. 
14. **RACI**: must run [raci-matrix-summary.md](../process/raci-matrix.md); DBA / data / TL / sponsor owners. 
15. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) leaving data migration untouched. 
16. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicating inside and outside. 
17. **Monitoring**: must run [monitoring-governance-process.md](../process/monitoring-governance.md) data metrics + thresholds + alerts. 
18. **Retrospective**: after migration failure must run [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) retrospective + archive in [bugs/](../lessons). 
19. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether migration is still accurate + whether schema is still reasonable. 
20. **ADR**: migration decision must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
21. **Flywheel**: migration done well → data grows → speed grows → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Anti-patterns

- **Running the migration script directly in production without a dry-run.** The migration script is developed in a staging environment with 10K rows and then executed against production with 100M rows. The script runs for 12 hours, locks critical tables, and blocks production traffic. The dry-run must be executed against a production-scale replica, and the dry-run must measure the actual runtime, lock contention, and resource consumption.

- **Assuming the migration is idempotent without testing it.** The migration script is written assuming it will only run once. Midway through the migration, the script fails, and the operator re-runs it. The script double-processes the first half of the data, producing duplicates or incorrect values. The migration script must be tested for idempotency: running it twice produces the same result as running it once.

- **Migrating data without a schema version marker.** The migration is applied to the database, and the team moves on. Six months later, nobody knows which migrations have been applied to which database, and the next migration assumes the wrong starting state. Every migration must include a schema version marker (a table that records the applied migrations) that the migration system checks before running.

- **Performing the migration during peak traffic hours.** The migration competes with production traffic for database resources, and both the migration and the production workload slow down. Users experience degraded performance, and the migration takes longer than expected. The migration must be scheduled during a low-traffic window, and the migration's resource consumption must be throttled to leave headroom for production traffic.

- **Treating the migration as a one-time event with no post-migration monitoring.** The migration completes, the team celebrates, and nobody monitors the new system. A week later, a user discovers that their data is missing because the migration failed to process their specific edge case. The migration must include a monitoring period (at least one full business cycle) where the migration team actively monitors the new system's data quality and user reports.

## Related

- Similar journey: [../strategies/prepare-a-deployment-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-deployment-strategy.md) — deploy strategy
- Similar journey: [../../tech-lead/roadmap/deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md) — deprecation
- Similar journey: [../../executive/strategy/do-a-data-retention-review.md](../../executive/strategy/do-a-data-retention-review.md) — data retention
- Similar journey: [../strategies/decompose-a-monolith.md](../architecture-design/decompose-a-monolith.md) — decomposition
- Upstream: [../../ai-engineer/data/README.md](../../ai-engineer/data/README.md) — data leaf entry
