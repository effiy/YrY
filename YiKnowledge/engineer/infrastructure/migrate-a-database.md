---
title: Migrate a database
aliases: [i-want-to-migrate-a-database, migrate-a-database, schema-migration]
tags: [journey, methodology, database, migration, schema, dual-write, cut-over]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer, tech-lead]
benefit: "migration is reversible"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
- ./roll-out-a-migration.md
  - ../architecture-design/decompose-a-monolith.md
  - ../../tech-lead/architecture/design-architecture-decision.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ./ship-a-release.md
  - ../infrastructure/set-up-ci-cd.md
  - ../../engineer/architecture-design/one-to-one-mapping-migration.md
  - ../../engineer/architecture-design/staged-port-methodology.md
  - ../../engineer/engineering/evaluation-driven-development.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--inversion.md
tacit: Database migration is not just running ALTER and being done; it is schema dual-write + dual-read + cut-over + rollback fallback, with forward and backward compatibility maintained in parallel
---

# I want to migrate a database

> **As an** engineer, **I want to** migrate a database, **so that** migration is reversible. 

## Summary

- Database migration in six steps: extend schema → dual-write → data backfill → dual-read → cut write → retire old schema
- Extend schema: add forward-compatible columns (nullable / default); do not drop columns or change types; old code keeps working
- Dual-write: write path writes to both new and old fields / tables simultaneously; reads still go to old; reconcile differences between new and old
- Data backfill: batch backfill historical data; batched transactions; progress visible; do not lock tables
- Dual-read: gradual rollout of read traffic 1% → 10% → 50% → 100%; eval set + monitoring guardrails
- Cut write: cut write traffic to new field / table; keep old field as fallback; observe for one cadence before retirement

## Scenario description

As the business develops, the schema evolves, the database engine is replaced, or the database is sharded; database migration is a high-incident area, so it must proceed in stages. This entry provides the full path from extending the schema to retiring the old schema, covering forward and backward compatibility, dual-write, data backfill, dual-read gradual rollout, cut-write, rollback fallback, and links to general migration, monolith decomposition, incident response, release, CI/CD and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | General migration | [./roll-out-a-migration.md](./roll-out-a-migration.md) |
| 2 hop | ADR | [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) |
| 2 hop | Monolith decomposition | [../strategies/decompose-a-monolith.md](../architecture-design/decompose-a-monolith.md) |
| 2 hop | 1:1 mapping | [../../engineer/architecture-design/one-to-one-mapping-migration.md](../architecture-design/one-to-one-mapping-migration.md) |
| 2 hop | Staged port | [../../engineer/architecture-design/staged-port-methodology.md](../architecture-design/staged-port-methodology.md) |
| 2 hop | Evaluation driven | [../../engineer/engineering/evaluation-driven-development.md](../engineering/evaluation-driven-development.md) |
| 2 hop | Observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hop | Incident response | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| 2 hop | Release | [./ship-a-release.md](./ship-a-release.md) |
| 2 hop | CI/CD | [../tools/set-up-ci-cd.md](set-up-ci-cd.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |

## Action recommendations

1. **Extend schema forward-compatibly**: add nullable / default columns; do not drop columns or change types; old code keeps working
2. **Backward-compatible code before schema**: code is made compatible with the new schema first; then deploy the schema; then deploy dual-write
3. **Dual-write + reconciliation**: write path writes to both new and old; reconcile differences; block read cut-over if difference > threshold
4. **Batched data backfill**: backfill history in batches; batched transactions; progress visible; do not lock tables; transaction size < 1000 rows
5. **Backfill + dual-write in parallel**: dual-write covers new data; backfill covers historical data; the two do not conflict
6. **Dual-read gradual rollout in 4 stages**: 1% → 10% → 50% → 100%; observe each stage + monitoring triad + eval set
7. **Cut write last**: only cut write after dual-read passes 100%; keep fallback rollback before cutting write
8. **Keep old schema for one cadence**: after cutting write, keep old schema as fallback; observe for one cadence before retirement
9. **Do not drop columns until the next release**: drop columns in two steps — first mark deprecated → then drop in the next release; leave a rollback window
10. **Large-table migration via pt-osc / gh-ost**: do not ALTER directly; online DDL tool chunked in batches
11. **Rollback contingency**: prepare rollback contingency for every stage; cut-write stage keeps dual-write fallback; retirement stage keeps old schema
12. **Monitoring alerts**: see [observability](../../oncall-sre/observability/set-up-observability.md); latency + error rate + data inconsistency
13. **Incident drill**: see [incident response](../../oncall-sre/incident-response/respond-to-an-incident.md); during the read-cut stage, inject artificial differences to validate alerts
14. **First principles**: why migrate at all; worst consequence of not migrating; migration cost ÷ benefit
15. **Second-order thinking**: second-order consequences after migration (performance / compatibility / maintenance cost); not just short-term output
16. **Inversion**: if you only extend but do not migrate, can it be solved? If solvable, do not migrate

## Related

- General migration: [./roll-out-a-migration.md](./roll-out-a-migration.md) — general migration methodology
- Monolith decomposition: [../strategies/decompose-a-monolith.md](../architecture-design/decompose-a-monolith.md) — splitting services with splitting databases
- ADR: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — migration decision
- Pattern co-build: [1:1 mapping migration](../architecture-design/one-to-one-mapping-migration.md) + [staged-port](../architecture-design/staged-port-methodology.md) + [evaluation driven](../engineering/evaluation-driven-development.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md)
- Observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — traffic cut-over monitoring
- Incident response: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — read-cut stage incidents
- Release: [./ship-a-release.md](./ship-a-release.md) — data migration gate
- CI/CD: [../tools/set-up-ci-cd.md](set-up-ci-cd.md) — data-migration gate
