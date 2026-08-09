---
title: Database Sharding / Database Sharding
aliases: [database-sharding-pattern, sharding-pattern, db-shard]
tags: [pattern, engineering patterns, sharding, database, scalability]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Databases scale horizontally by partitioning data across shards based on a consistent sharding key"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./cqrs.md
  - ./bulkhead.md
  - ./saga.md
  - ./caching.md
  - ../engineering/scale-a-service.md
---

# Database Sharding / Database Sharding

> **As an** engineer, **I want to** database sharding, **so that** pattern applied consistently.

## Summary

Split large tables by dimension into multiple independent DB instances; each shard has independent resources + independent scaling + independent failure. Shard = key + routing + cross-shard query + rebalancing + global ID; applicable when a single instance hits the ceiling on capacity / write / connection count; not applicable for small data volumes / strict cross-shard consistency transactions / complex joins.

## Core viewpoints

**Sharding is a last resort, not a growth milestone.** Before sharding, exhaust every alternative: read replicas, query optimization, caching, connection pooling, vertical scaling. Sharding introduces cross-shard query complexity, rebalancing overhead, and operational burden that compound with every new shard. You should be able to articulate exactly which ceiling (storage, write throughput, connections, memory) you are hitting before you shard.

**The shard key decision is irreversible without a full data migration.** Changing the shard key after the system is live means rewriting every row to a new shard. This is a multi-week or multi-month project. The shard key must be chosen based on the access patterns that will exist two years from now, not the ones that exist today. The most common mistake is sharding by the current primary key without checking whether future queries will use it for routing.

**Virtual slots are not an optimization -- they are the only way to rebalance without downtime.** Physical shard count that is fixed at design time becomes a scaling ceiling. Virtual slots (e.g., 1024 slots mapped to 4 physical shards) let you add a 5th shard by moving slots, not by resharding the entire dataset. Without virtual slots, every scaling event is a full data migration.

**Cross-shard queries are not slow queries -- they are architectural violations.** A query that scatters to all shards and gathers results is a sign that the shard key is wrong for that access pattern. The correct response is not to optimize the scatter-gather; it is to denormalize the data or build a secondary index so the query hits a single shard.

**Monitoring per shard is not optional -- it is the only way to detect hotspots.** Aggregate metrics (total QPS, average latency) hide the shard that is at 90% capacity while others are at 10%. Each shard must have independent dashboards, independent alerts, and independent capacity planning.

## Key info

- **Shard key selection criteria**: (1) high cardinality (many distinct values, avoids hot shards), (2) even distribution (no single key gets 50% of traffic), (3) query locality (most queries route to a single shard), (4) immutability (the key value doesn't change, avoiding cross-shard moves). UUIDv4 passes (1) and (4) but fails (3) for most access patterns. Tenant ID passes (3) but often fails (2) when one tenant is 10x larger than others. The best shard key is usually a composite: `tenant_id + entity_type` to split large tenants across shards.
- **Virtual slot architectures**: Redis Cluster uses 16384 hash slots, each key hashed to a slot via CRC16, slots assigned to nodes. MongoDB uses hashed sharding (MD5 of shard key → chunks of ~64MB, auto-split on size threshold). Vitess (MySQL sharding) uses range-based sharding with resharding via VReplication. The common pattern: hash the shard key → map to a large virtual namespace (1024-16384 slots) → assign slots to physical shards. Adding a shard means moving slots, not changing the hash function.
- **Rebalancing cost**: moving a slot from shard A to shard B involves: (1) mark slot as migrating on A (writes rejected), (2) copy all data for that slot from A to B, (3) replay any writes that arrived during the copy, (4) atomically switch the slot assignment to B, (5) delete the slot data from A. The duration depends on slot size: a 10GB slot takes ~5-10 minutes at 1Gbps. The key metric is "time to rebalance one slot" -- if it exceeds your maintenance window, you need smaller slots.
- **Cross-shard transaction limits**: most sharded databases do not support ACID transactions across shards. MongoDB 4.2+ supports cross-shard transactions but with a 60-second default timeout and significant performance penalty (2-3x latency). CockroachDB and Spanner support distributed transactions via 2PC + consensus. The practical rule: if >5% of your transactions are cross-shard, your shard key is wrong for your workload.
- **Global ID generation**: auto-increment IDs fail in sharded systems (two shards can assign the same ID). Solutions: Snowflake (64-bit: timestamp 41 bits + machine ID 10 bits + sequence 12 bits, ~40k IDs/second per machine), UUIDv7 (time-ordered, sortable, 128-bit), or a centralized ID service (bottleneck). Snowflake is the most common choice for high-throughput systems because it generates roughly sortable IDs without a centralized coordinator.

## Problem

Physical limits of a single-instance DB:
- Storage capacity: a single table > 10TB backup/restore time is unacceptable
- Write throughput: single-machine IO / WAL write ceiling
- Connection count: single-instance max_connections 1000~5000
- Memory: working set does not fit → cache hit rate drops
- Failure radius: single-instance failure = global failure
- Quantification: single DB 100GB → backup 30min; 1TB → 5h; 10TB → 50h

## Pattern

Five elements of sharding:
1. **shard key**: choose evenly distributed + high-frequency query dimension; user ID / tenant ID / time window
2. **routing**: range / hash / directory three types
   - range: friendly to range queries; easy hotspots
   - hash: evenly distributed; many cross-shard queries
   - directory: flexible routing table; introduces a central component
3. **cross-shard query**: scatter-gather / denormalization / secondary index table
4. **rebalancing**: virtual slots (slot) + consistent hash / dual-write migration / reshard tooling
5. **global ID**: snowflake / uuid / database sequence + step

```python
class ShardRouter:
    def __init__(self, slots_to_shard):
        self.slots_to_shard = slots_to_shard  # virtual slots 0..1023

    def shard_for(self, tenant_id):
        h = self._hash(tenant_id)
        return self.slots_to_shard[h % 1024]

    def reshard(self, from_shard, to_shard, tenant_ids):
        # dual-write + verify + cutover + delete old
        for tid in tenant_ids:
            self._dual_write(tid, from_shard, to_shard)
        self._verify(tid, to_shard)
        self._cutover(tid, to_shard)
        self._cleanup(tid, from_shard)
```

## Applicable

- Multi-tenant SaaS: shard by tenant_id
- Time-series data: shard by time window (hot/cold separation)
- User center: shard by user_id
- Log / event stream: hash by trace_id
- Large-table historical archive: shard by month for TTL

## Not applicable

- Small data volume (<100GB): single instance + index optimization is enough
- Strict cross-shard consistency transactions: sharding does not guarantee ACID; use saga
- Complex multi-table joins: joins are hard after sharding; use denormalization or aggregation layer
- High-cardinality point queries infrequent: small sharding benefit
- Single-instance connections sufficient: sharding expands failure radius

## Landing checklist

1. Choose shard key: high-frequency query dimension + even writes + scope-query friendly
2. Routing scheme: directory (recommended) / hash (simple) / range (range friendly)
3. Global ID: snowflake service / step allocation; auto-increment within shard
4. Cross-shard queries: scatter-gather limit N; secondary index table (denormalization)
5. Global unique constraint: use outbox + idempotent dedup instead of DB unique index
6. Rebalancing: virtual slots + dual-write migration + verify + cutover + delete old
7. Cross-shard transactions: saga + compensation; no 2PC
8. Backup: each shard independent backup; restore by shard key scope
9. Monitoring: each shard QPS / latency / capacity / connection count independent metrics
10. Test: reshard drill + cross-shard query stress test + single-shard failure drill

## Action recommendations

1. **Exhaust every alternative before sharding: read replicas, query optimization, caching, connection pooling, and vertical scaling.** Sharding introduces cross-shard query complexity, rebalancing overhead, and operational burden that compound with every new shard. You should be able to articulate exactly which ceiling (storage, write throughput, connections, memory) you are hitting before you shard.

2. **Use virtual slots (e.g., 1024 slots mapped to N physical shards) to enable rebalancing without downtime.** Physical shard count fixed at design time becomes a scaling ceiling. Virtual slots let you add a new shard by moving slots, not by resharding the entire dataset. Without virtual slots, every scaling event is a full data migration.

3. **Choose the shard key based on the access patterns expected two years from now, not the ones that exist today.** Changing the shard key after the system is live means rewriting every row to a new shard -- a multi-month project. The most common mistake is sharding by the current primary key without checking whether future queries will use it for routing.

4. **Give each shard its own connection pool, dashboards, alerts, and capacity planning.** Aggregate metrics hide the shard at 90% capacity while others are at 10%. A shared connection pool means one slow shard exhausts connections and starves all other shards. Independent per-shard resources are not optional -- they are the only way to detect and isolate hotspots.

5. **Test the rebalancing plan in staging with a rollback procedure before attempting it in production.** A resharding operation that fails halfway through leaves data split across two shards with no way to query it correctly. The rebalancing plan must include a tested rollback procedure that restores the original shard mapping.

## Anti-patterns

**Sharding prematurely.** A database that is at 50GB with 500 QPS and 50 connections does not need sharding -- it needs indexes, query optimization, and connection pooling. Sharding before hitting a physical ceiling adds operational complexity without solving a real problem. The question is not "can we shard" but "which ceiling are we hitting and is there a simpler solution."

**Choosing a shard key by the most common query today.** The most common query today may not be the most common query in two years. If you shard by `user_id` because that is today's primary access pattern, and next year's primary feature requires querying by `organization_id`, every query will scatter-gather across all shards. The shard key must be chosen for the access patterns of the future, not the present.

**Cross-shard transactions with 2PC.** Two-phase commit across shards is a distributed consensus protocol that is slow, fragile, and blocks on coordinator failure. Cross-shard consistency should use saga patterns with compensating transactions, not 2PC. If the business truly requires cross-shard ACID transactions, the shard key is wrong -- the data should be on the same shard.

**Rebalancing without a rollback plan.** A resharding operation that moves data from shard A to shard B and fails halfway through leaves data split across two shards with no way to query it correctly. The rebalancing plan must include a rollback procedure that restores the original shard mapping, and it must be tested in a staging environment before production.

**No per-shard connection pooling.** If all shards share a single connection pool, one slow shard exhausts connections and starves all other shards. Each shard must have its own connection pool with independent limits, independent timeouts, and independent circuit breakers.



- **Hotspot shard key**: auto-increment ID monotonic → last shard write blows up; use hash to scatter
- **Cross-shard join**: business layer N+1 query; use denormalization or materialized view
- **No scaling headroom**: physical shard count fixed → scaling requires rebalancing; use virtual slots
- **Wrong shard key**: 90% of queries cannot use shard key for routing → scatter-gather
- **No global ID service**: ID conflicts within shards → snowflake / database sequence with shard prefix
- **No sub-tables within a shard**: single shard bloats again → add secondary shards or archive
- **No rebalancing drill**: post-launch scaling breaks → drill in advance
- **Shared resources**: multiple shards share one machine → isolation failure
- **No monitoring**: shard failure radius expands; each shard needs independent monitoring

## Related

- [read-replica-pattern](../infrastructure/read-replica.md) — read replicas handle read throughput; sharding handles write / capacity
- [cqrs-pattern](./cqrs.md) — write primary + read replica + materialized view combination
- [bulkhead-pattern](./bulkhead.md) — each shard's independent resources = bulkhead
- [connection-pooling-pattern](../infrastructure/connection-pooling.md) — each shard has independent connection pool
- [saga-pattern](./saga.md) — cross-shard transactions use saga + compensation
- [outbox-pattern](../infrastructure/outbox.md) — atomic DB change + event within a shard
- [caching-pattern](./caching.md) — cache reduces cross-shard queries
- [journeys/i-want-to-prepare-a-database-strategy](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-database-strategy.md) — sharding within the database strategy
- [journeys/i-want-to-scale-a-service](../engineering/scale-a-service.md) — horizontal scaling scenario
