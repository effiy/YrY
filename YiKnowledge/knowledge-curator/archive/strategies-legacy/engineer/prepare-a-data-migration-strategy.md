---
title: I want to build a data migration strategy / Prepare a data migration strategy
aliases: [i-want-to-prepare-a-data-migration-strategy, data-migration-strategy, migration-strategy]
tags: [journey, methodology, data, migration, cutover, planning]
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer, tech-lead]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./migrate-data.md
  - ./prepare-a-data-pipeline-strategy.md
  - ./prepare-a-data-governance-strategy.md
  - ./prepare-a-data-quality-strategy.md
  - ./prepare-a-data-security-strategy.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../processes/roll-out-a-migration.md
  - ../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Data migration is not just moving data; it is a contract. Extract + transform + load + validate + cutover five dimensions; business-value driven; not one-shot; measurable
---

# I want to build a data migration strategy

> **As an** engineer, **I want to** prepare a data migration, **so that** launch is safe.

## Summary

- Data migration = contract; not just moving data
- Extract + transform + load + validate + cutover five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers offline + online + incremental + dual-write + traffic-cut multiple modes
- Links to migrate-data + data-pipeline + data-governance + data-quality + data-security + data-compliance + roll-out-a-migration + disaster-recovery
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Data migration is a contract; not just moving data. This entry provides the data migration full path, covering extract + transform + load + validate + cutover, business-value driven (not by gut feel), covering offline + online + incremental + dual-write + traffic-cut multiple modes, linking to migrate-data + prepare-a-data-pipeline-strategy + prepare-a-data-governance-strategy + prepare-a-data-quality-strategy + prepare-a-data-security-strategy + handle-data-compliance + roll-out-a-migration + prepare-a-disaster-recovery-plan, publicly queryable, periodic review, and links to migrate-data / prepare-a-data-pipeline-strategy / prepare-a-data-governance-strategy / prepare-a-data-quality-strategy / prepare-a-data-security-strategy / handle-data-compliance / roll-out-a-migration / prepare-a-disaster-recovery-plan and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | migrate-data | [./migrate-data.md](./migrate-data.md) |
| 1 hop | data-pipeline | [./prepare-a-data-pipeline-strategy.md](./prepare-a-data-pipeline-strategy.md) |
| 2 hops | data-governance | [./prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md) |
| 2 hops | data-quality | [./prepare-a-data-quality-strategy.md](./prepare-a-data-quality-strategy.md) |
| 2 hops | data-security | [./prepare-a-data-security-strategy.md](./prepare-a-data-security-strategy.md) |
| 2 hops | data-compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: extract + transform + load + validate + cutover; no missing dimension
2. **Business-value driven**: prioritize by business downtime window + risk + data volume + consistency; not sloganeering
3. **Extract**: source full + incremental + CDC + log-based + trigger-based; do not omit
4. **Transform**: clean + standardize + field mapping + business rules + desensitize + validate; do not omit
5. **Load**: batch + streaming + idempotent + retry + rate limit + replica; do not omit
6. **Validate**: count + checksum + business rules + dual-run comparison + sample audit; do not omit
7. **Cutover**: cutover + dual-write + traffic cut + rollback + gradual + rehearsal; do not omit
8. **Not one-shot**: progressive from full → incremental → dual-write → traffic cut → source decommission; no skipping
9. **Not report-only**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Links to migrate-data**: strategy + implementation co-build
13. **Links to data-pipeline**: migration + pipeline co-build
14. **Links to data-governance**: migration + governance co-build
15. **Links to data-quality**: migration + quality co-build
16. **Links to data-security**: migration + security co-build
17. **Links to data-compliance**: migration + compliance co-build
18. **Toolchain**: AWS DMS / GCP Datastream / Azure DMS / Striim / Debezium / Airbyte / Fivetran / Spark / Flink / dbt / self-built
19. **Publicly queryable**: strategy everyone can look up; not hidden
20. **Periodic review**: evolution updates; not one-shot
21. **First principles**: why data migration strategy is a must; worst consequence of not doing it
22. **Inversion thinking**: how much can one-shot dump-load solve; if solvable, don't introduce a heavy strategy
23. **Second-order thinking**: second-order consequences after the strategy (cost / risk / downtime / business)
24. **Occam**: migration — the simpler the better; cut redundant steps

## Related

- migrate-data: [./migrate-data.md](./migrate-data.md) — implementation co-build
- data-pipeline: [./prepare-a-data-pipeline-strategy.md](./prepare-a-data-pipeline-strategy.md) — pipeline co-build
- data-governance: [./prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md) — governance co-build
- data-quality: [./prepare-a-data-quality-strategy.md](./prepare-a-data-quality-strategy.md) — quality co-build
- data-security: [./prepare-a-data-security-strategy.md](./prepare-a-data-security-strategy.md) — security co-build
- data-compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — compliance co-build
- roll-out-a-migration: [../processes/roll-out-a-migration.md](../processes/roll-out-a-migration.md) — traffic cut co-build
- disaster-recovery: [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md) — DR co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
