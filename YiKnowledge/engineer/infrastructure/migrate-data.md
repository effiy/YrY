---
title: Migrate data
aliases:
- i-want-to-migrate-data
- data-migration-journey
- etl-journey
- data-migration-entry
tags:
- journeys
- data-migration
- etl
- lakehouse
- dual-world
- mongodb-indexing
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
benefit: migration is reversible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../processes/roll-out-a-migration.md
- ../../executive/strategy/handle-data-compliance.md
- ../processes/ship-a-release.md
- ../../ai-engineer/data/README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to migrate data

> **As an** engineer, **I want to** migrate data, **so that** migration is reversible.

> "Data migration execution + ETL/ELT + dry-run + backup + gradual rollout + rollback + consistency check" reach data governance + modeling + ETL + lakehouse + dual-world + process within 2 hops.

## Summary

- Process goes via [data-migration-process.md](data-migration.md): dry-run + backup + gradual rollout + rollback
- ETL goes via [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) + [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md)
- Modeling goes via [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) + [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md)
- Governance goes via [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + [data-compliance-process.md](data-compliance.md)
- Dual world goes via [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md)

## Core viewpoints

**The dry-run is the migration's most important step, and it must be run against production-scale data.** A dry-run that succeeds on a 1GB staging dataset tells you nothing about a 1TB production dataset. The dry-run must use production-scale data (a snapshot or a replica), must measure the actual runtime and resource consumption, and must surface schema mismatches, constraint violations, and performance regressions before the production run.

**A migration without a tested rollback plan is a migration that is not ready.** The rollback path must be designed, implemented, and tested before the migration starts. The rollback must be faster than the migration (seconds, not hours) and must be reversible at any point in the migration process, not just at the beginning. A rollback that takes as long as the migration is not a rollback; it is a reverse migration.

**The dual-write period is the safety net that catches migration errors before they affect users.** Writing to both the old and new systems simultaneously, with reconciliation that compares the two, allows the team to detect and fix migration errors without user impact. The dual-write period should last at least one full business cycle (typically 1-2 weeks) before the cutover, and the reconciliation must run continuously, not just once.

**Consistency verification must go beyond row counts.** A row count that matches between source and target does not mean the data is identical. A row with a null in a critical field, a truncated string, or a timezone-shifted timestamp counts as one row but is corrupt data. The verification must include checksum comparison of key fields, sampling of edge cases, and full diff of a representative subset of the data.

**The migration is not complete until the old system is decommissioned.** Running the old and new systems in parallel indefinitely doubles the operational burden and creates confusion about which system is authoritative. The cutover plan must include a decommissioning date for the old system, and that date must be enforced. A migration that never decommissions the old system is a migration that never finishes.

## Key info

- **Data migration phase checklist (8 phases with verification gates)**: (1) Pre-migration audit — inventory all data sources, schemas, constraints, and dependencies; measure data volume and growth rate; (2) Schema mapping — define the target schema, map every source field to a target field, document transformations and default values; (3) Dry-run — run the migration on a production-scale snapshot (not a staging subset), measure runtime and resource consumption, surface all errors; (4) Backup — take a full backup of the source system, verify backup integrity, document the restore procedure; (5) Dual-write — write to both old and new systems simultaneously, run reconciliation continuously, fix discrepancies; (6) Backfill — migrate historical data, verify consistency with checksums and sampling; (7) Cutover — switch reads to the new system (canary 1% → 100%), keep old system read-only for the rollback window; (8) Decommission — after the rollback window expires, decommission the old system, archive the data per retention policy. Each phase has a verification gate; the next phase does not start until the current gate is confirmed.
- **Migration script requirements (6 must-haves)**: (1) Idempotent — running the script twice produces the same result (no duplicate records, no double-transformations); (2) Resumable — if the script fails at 60%, restarting it continues from where it left off (track progress by primary key or cursor); (3) Batch processing — process records in batches (e.g., 1000 records per batch) to control memory and allow progress tracking; (4) Logging — log every batch: start time, end time, records processed, errors, and the primary key range; (5) Error handling — log errors per-record, continue processing the rest of the batch, produce an error report at the end; (6) Verification — after migration, run row counts, checksum comparison, and sampling verification automatically. The Yi-family data migration scripts follow these requirements.
- **Dual-write reconciliation strategy**: During the dual-write period, every write goes to both old and new systems. A reconciliation job runs continuously (every 5-15 minutes) comparing records between the two systems. The reconciliation compares: row count per table/collection, checksum of key fields for the last N records, and a full diff of a random 1% sample. Discrepancies are logged and alerted. The dual-write period lasts at least one full business cycle (1-2 weeks). The cutover to the new system only happens when reconciliation shows 0 discrepancies for 3 consecutive runs. The Yi-family projects use dual-write for migrations where both systems must be active (e.g., RSS body → markdown migration).
- **Rollback mechanism by migration type**: (1) Schema migration (add/remove columns) — rollback is the reverse schema change; keep the old column for 30 days before dropping; (2) Data migration (transform data in place) — rollback is restoring from backup; test the restore procedure before the migration; (3) System migration (old DB → new DB) — rollback is switching reads back to the old system; keep the old system in read-only mode for the full rollback window; (4) Dual-write migration — rollback is stopping writes to the new system and reverting to old-system-only. The rollback must be testable in < 5 minutes and must be tested within 30 days before the migration. The Yi-family standard: rollback is tested in the dry-run phase, not in production.
- **Consistency verification methods (4 levels)**: Level 1 (Row count) — `COUNT(*)` in source vs. target; necessary but not sufficient; Level 2 (Checksum) — `MD5(CONCAT(col1, col2, ...))` for each row, compare checksums; catches data corruption but not semantic errors; Level 3 (Sampling) — full comparison of a random 1-5% sample, including null handling, encoding, timezone, and precision; Level 4 (Business rule) — run business-specific validation queries (e.g., "total sales by month in source vs. target must match ±0.1%"). The Yi-family standard: Level 1 and 2 for all migrations, Level 3 for migrations affecting > 1000 records, Level 4 for financial/reporting data.
- **Yi-family data migration history (2026-08)**: RSS body → markdown — RSS body content moved from MongoDB to YiKnowledge markdown files, MongoDB stores only metadata (category_path + file_path); migration type: dual-write (old system preserved for rollback), ~200 RSS entries migrated. YiKnowledge 14→19 role directory restructure — 14 category directories restructured to 19 bare-role directories, 5822 broken links → 20, migration type: in-place with backup. YiPet stack migration — React 15→18.3, Bootstrap→Ant Design 5.21, ESLint→Biome 2.5; migration type: system migration with dual-world pattern. No migration has required rollback.

## Scenario

When migrating databases / tables / collections / ETL refactor / lakehouse migration / DB version upgrade / field rename, DBA + engineering + data team need to look up process + ETL + modeling + governance + dual-world + case studies. This entry aggregates data-migration-related 5 leaves + process + dual-world into 2-hop paths, avoiding "no dry-run / no backup / all-in-one / consistency breach / non-rollback-able".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `work/processes/` | [data-migration-process.md](data-migration.md) · [data-compliance-process.md](data-compliance.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [incident-response-process.md](../process/incident-response.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — migration capacity assessment |
| `methodology/ai-specific/` | [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) — vector DB migration |
| `tech/ai-platform/` | [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) — vector DB + Embedding migration |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) — migration landing |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) — migration incident retrospective |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) — incremental sync dropped events · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `projects/YiAi/` | [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md) · [adr-rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) · [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) — migration design documentation |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — cross-team migration reporting |

## Action recommendations

1. **First principles**: first ask "why migrate / what happens if not / what is the core constraint"; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: first imagine "how migration can blow up (data loss / inconsistency / business disruption)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Dry-run**: must dry-run full + sample + boundary cases first; do not directly run in production.
4. **Backup**: before migration must back up source + target; retain at least 1 complete cycle (per business longest lookback window).
5. **Gradual rollout**: first 1% → 5% → 25% → 100%; observe consistency + error rate + latency at each tier; see [canary-release-process.md](../../oncall-sre/release/canary-release.md).
6. **Rollback plan**: must be able to rollback in seconds (traffic cut back to old version + data reversible); see [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
7. **Dual world**: new and old parallel + abstraction layer + cut traffic; do not cut all at once; see [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md).
8. **Consistency check**: row count + key field hash + sample manual + full diff; do not only look at row count.
9. **Incremental sync**: during migration must run incremental (CDC / dual-write / watch); see [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md) + [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md).
10. **Index rebuild**: after migration must rebuild indexes + collect statistics; see [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md).
11. **Freeze period**: big promos / holidays follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), avoiding stacking migration with release.
12. **Monitoring**: during migration must monitor error rate + latency + capacity + alerts; see [monitoring-governance-process.md](../process/monitoring-governance.md).
13. **Retrospective**: after migration follow [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) style retrospective + archive lessons.
14. **Compliance**: cross-border / PII migration follow [data-compliance-process.md](data-compliance.md) + [data-governance-summary.md](../../ai-engineer/data/data-governance.md).

## Anti-patterns

- **Migrating all data at once in a single cutover.** A big-bang migration that switches all traffic from the old system to the new system in one step has a blast radius of 100% of users. The migration must be gradual: 1% -> 5% -> 25% -> 100%, with consistency checks and error rate monitoring at each tier. If the migration fails at 1%, only 1% of users are affected.

- **Assuming the migration will succeed because the script worked in development.** A migration script that processes 100 rows in development will behave differently when processing 100 million rows in production. The script must be tested at production scale, and the test must include the full range of production data (edge cases, nulls, large fields, special characters) not just the happy path.

- **Skipping the backup because "the migration is low risk."** Every migration carries a non-zero risk of data corruption, and the only insurance against data corruption is a tested backup. The backup must be taken immediately before the migration starts, must be verified as restorable, and must be retained for at least one full business cycle after the migration is complete.

- **Running the migration during peak traffic.** A migration that competes with production traffic for database resources will slow down both the migration and the production workload. The migration should be scheduled during a low-traffic window, and the migration's resource consumption (CPU, I/O, connections) should be throttled to leave headroom for production traffic.

- **Declaring the migration complete without verifying the data in the new system.** The migration script reports "100% complete" and the team moves on. Two weeks later, a user reports that their data is missing, and the investigation reveals that the migration silently dropped rows that violated a constraint in the new system. The migration is not complete until a representative sample of data has been manually verified in the new system.

## Related

- Same category journey: [../processes/roll-out-a-migration.md](./roll-out-a-migration.md) — migration pattern entry
- Same category journey: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — data compliance
- Same category journey: [../processes/ship-a-release.md](./ship-a-release.md) — release includes migration
- Same category journey: [../../ai-engineer/platform/pick-a-vector-database.md](../../ai-engineer/platform/pick-a-vector-database.md) — vector DB migration
- Upstream: [../../ai-engineer/data/README.md](../../ai-engineer/data/README.md) — data leaf entry
