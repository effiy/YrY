---
title: Read Replica / Read Replica
aliases: [read-replica-pattern, replica-pattern, read-replica]
tags: [pattern, engineering patterns, read replica, database, scalability]
category: engineer/infrastructure
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
benefit: "Read-heavy workloads are offloaded to replicas, reducing primary database load and improving read scalability"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./connection-pooling.md
  - ./timeout-budget.md
  - ../engineering/scale-a-service.md
  - ../../tech-lead/roadmap/define-an-slo.md
---

# Read Replica / Read Replica

> **As an** engineer, **I want to** read replica, **so that** pattern applied consistently.

## Summary

Primary writes, replicas read; read throughput scales horizontally. Read Replica = primary-replica sync + read/write split + replication-lag observation + replica failover + read/write consistency; suitable for read-heavy workloads + reporting / analytics / remote reads; not suitable for strong-consistency reads / write-heavy / single-instance-is-enough.

## Core viewpoints

**Replication lag is the difference between a correct read and a wrong read, and it must be monitored at the application level.** A replica that is 5 seconds behind the primary will return stale data for any read that depends on a write within the last 5 seconds. Database-level lag metrics (seconds_behind_master) are a lagging indicator; the application must have its own heartbeat table that measures the actual end-to-end lag from write to readable-on-replica.

**Read-your-write consistency is not optional for user-facing applications.** A user who submits a form and then cannot see their own submission on the next page view will assume the application is broken, not that the replica is lagging. Session stickiness (route the user to the primary or a specific replica for a window after their write) is the minimum acceptable behavior. The stickiness window should be configurable and should be at least as long as the P99 replication lag.

**Read replicas solve read throughput, not write throughput.** A team that adds read replicas expecting to solve a write bottleneck is scaling the wrong dimension. Write throughput is limited by the primary's ability to process writes and ship replication logs. Adding replicas increases the write load on the primary (replication log shipping is a write operation) and can actually worsen the write bottleneck. The correct solution for write bottlenecks is sharding or partitioning.

**A single replica is a single point of failure for reads.** If the replica goes down and all reads are routed to the single remaining replica, the primary is now handling both reads and writes, which is the scenario the replica was supposed to prevent. At least two replicas are required for read availability, and the load balancer must be able to detect and route around a failed replica automatically.

**The replication mode determines the data loss window, not the performance.** Asynchronous replication means the primary does not wait for the replica to acknowledge a write, which means a primary failure can lose committed writes. Semi-synchronous replication (at least one replica acknowledges) reduces the data loss window to near zero at the cost of a small write latency increase. The choice between async and semi-sync is a business decision about data loss tolerance, not a performance decision.

## Key info

- **Replication mode comparison (async vs. semi-sync vs. sync)**: Async — primary does not wait for replica acknowledgment, write latency unaffected, data loss window = replication lag (typically 0.1-5 seconds), best for read-heavy workloads where occasional data loss is acceptable; Semi-sync — primary waits for at least 1 replica to acknowledge, write latency +1-5ms, data loss window = near zero (only unacknowledged in-flight writes), best for most production workloads; Sync — primary waits for ALL replicas to acknowledge, write latency = slowest replica, data loss window = zero, best for financial/regulatory data where data loss is unacceptable. The Yi-family projects use MongoDB Atlas with async replication (default); semi-sync is available on M10+ clusters.
- **Read-your-write consistency implementation patterns (3 approaches)**: (1) Session stickiness — after a write, route the user's subsequent reads to the primary for N seconds (the "sticky window"); simplest to implement, but adds load to the primary; (2) Version check — after a write, the client receives a version token; subsequent reads check that the replica is at or past that version; most robust, but requires version tracking; (3) Write-through cache — write to both the primary and a cache; reads go to the cache for the sticky window; fastest, but adds cache infrastructure. The sticky window duration should be: P99 replication lag × 2 (safety margin). The Yi-family projects: MongoDB Atlas read preference is "primary" (no read replicas in use); read-your-write consistency is not a concern at current scale.
- **Replication lag monitoring (3 metrics)**: (1) Seconds behind master — the replica's reported lag in seconds; available via `SHOW SLAVE STATUS` (MySQL) or `rs.printSlaveReplicationInfo()` (MongoDB); (2) Heartbeat lag — application-level measurement: write a timestamp to a heartbeat table on the primary, read it from the replica, compute the difference; more accurate than database-level metrics because it measures end-to-end lag; (3) Replication log bytes — the size of the unapplied replication log on the replica; a growing log indicates the replica is falling behind and may never catch up. Alert thresholds: seconds behind master > 5s = warning, > 30s = critical; heartbeat lag > 10s = warning, > 60s = critical. The Yi-family projects do not monitor replication lag (single MongoDB instance, no replicas).
- **Replica topology and load balancing**: Minimum viable topology — 1 primary + 2 replicas (3 nodes total); 2 replicas required for read availability (if 1 fails, the other still handles reads). Load balancing strategies: (1) Round-robin — distribute reads evenly across replicas; simple but ignores replica health; (2) Least connections — send reads to the replica with the fewest active connections; balances load but ignores lag; (3) Lag-aware — route reads away from replicas with lag > threshold; best for consistency but requires lag monitoring. The connection pool for replicas should be sized: pool_size = (max_read_qps × avg_query_time_ms) / 1000 per replica. The Yi-family projects: MongoDB Atlas M0 (free tier) is a single-node deployment; replicas are available on M10+ clusters.
- **Read replica cost-benefit analysis**: Add read replicas when: (1) Read QPS exceeds 70% of the primary's capacity and cannot be reduced by caching; (2) Reporting/analytics queries compete with user-facing reads for CPU; (3) Cross-region reads have unacceptable latency (> 200ms RTT). Do NOT add read replicas when: (1) The bottleneck is write throughput (replicas increase write load via replication); (2) The application requires strong read consistency on every read; (3) The data fits in cache (add Redis/Memcached instead). The cost: each replica adds ~1x the primary's infrastructure cost. The Yi-family projects: no read replicas needed at current scale (development usage, < 100 QPS).
- **Yi-family database scaling state (2026-08)**: All 3 projects use MongoDB Atlas M0 (free tier) — single node, no replicas, no sharding, 512MB storage. The current scale does not require read replicas: YiAi serves < 10 requests/minute, YiVad/YiPet are client-side with no direct database access. The read replica pattern and monitoring are documented for future production scaling; the first scaling trigger will be when YiAi API QPS exceeds 100 (estimated at 10+ concurrent users). The MongoDB Atlas upgrade path: M0 → M10 (dedicated cluster, 2GB+ RAM, replicas, backups) → M30+ (sharding).

## Problem

Single-instance DB read bottlenecks:
- Reporting / analytics queries hog primary CPU → writes blocked
- High read QPS → single-instance max_connections insufficient
- Cross-region reads: long-distance RTT 200ms+ → poor experience
- Primary failure radius: reads and writes both break
- Quantified: single-instance 1k QPS reads + 100 QPS writes; replica scaling can reach 10k+ QPS reads

## Pattern

Read replica five essentials:
1. **Replication mode**: synchronous / semi-synchronous / asynchronous
   - synchronous: strong consistency; primary write latency
   - semi-synchronous: at least 1 replica confirms; compromise
   - asynchronous: primary no wait; replica may lag
2. **Read/write split**: writes to primary + reads to replicas; routing at the connection layer
3. **Replication lag observation**: lag metrics + heartbeat table + alert threshold
4. **Replica failover**: single replica down doesn't impact reads; multi-replica redundancy
5. **Read/write consistency**: read-your-write / session sticky / version readback

```python
class ReadWriteSplitter:
    def __init__(self, primary, replicas, sticky_sessions):
        self.primary = primary
        self.replicas = replicas
        self.sticky = sticky_sessions  # session_id -> replica index

    async def read(self, query, session_id=None):
        if session_id and session_id in self.sticky:
            # A user's recent write must be readable → route to sticky replica or primary
            return await self.replicas[self.sticky[session_id]].read(query)
        return await self._pick_least_lag_replica().read(query)

    async def write(self, stmt, session_id=None):
        result = await self.primary.write(stmt)
        if session_id:
            # Mark this session to read from primary or fixed replica until lag catches up
            self.sticky[session_id] = await self._pick_replica_for_stick()
        return result
```

## Applicable

- Read-heavy SaaS: list / detail / reports
- Remote reads: read nearby across regions
- BI / analytics: analytics replicas isolate queries from the primary
- Data backup: replicas as backup sources that don't disturb the primary
- Canary reads: run new SQL on replicas

## Not applicable

- Strong-consistency reads: balance / inventory / auth decisions → use primary
- Write-heavy: replicas underutilized; don't introduce
- Small data volume: single instance is enough
- Cross-replica transactions: replicas are read-only; writes only on primary
- Real-time analytics: use a dedicated OLAP engine; do not query OLTP replicas

## Landing checklist

1. Replication mode: default semi-synchronous (data safety + write latency acceptable)
2. Replica count: ≥ 2; sized by read throughput + fault tolerance
3. Read/write split: route at the client layer (asyncpg pool / ProxySQL / pgcat)
4. Replication lag monitoring: lag_ms + heartbeat table + 1s alert threshold
5. Read/write consistency: session sticky or version readback
6. Replica failover: replica down auto-removal + alert; no impact on reads
7. Primary failover: auto-promote replica + DNS cutover + semi-sync to async switch
8. Index sync: replica indexes match primary; DDL on primary auto-replicated
9. Backup: replicas as backup sources; don't impact primary
10. Load testing: replica read throughput + failover drill + lag extreme test

## Action recommendations

1. **Add a heartbeat table to the application layer that measures end-to-end replication lag (write timestamp to primary, read timestamp from replica, compute delta) and alert if the lag exceeds the configured threshold.** Database-level lag metrics like `seconds_behind_master` are a lagging indicator. The heartbeat table measures the actual lag from the application's perspective: the time between a write being committed on the primary and that write being readable on the replica. This is the metric that users experience, not the database's internal metric.

2. **Implement session stickiness for read-your-write consistency in every user-facing write flow.** A user who submits a form and then cannot see their own submission on the next page view assumes the application is broken. After every write, route the user's session to the primary (or a specific replica) for a configurable stickiness window that is at least as long as the P99 replication lag. The stickiness window should be configurable per endpoint and should be exposed as a metric.

3. **Deploy at least two replicas for read availability, and configure the load balancer to detect and route around a failed replica automatically.** A single replica is a single point of failure for reads. If the replica goes down, all reads are routed to the primary, which is the scenario the replica was supposed to prevent. The load balancer must health-check each replica (SELECT 1 every 5 seconds) and remove failed replicas from the read pool within 30 seconds of failure.

4. **Run a replica failover drill quarterly: simulate a replica failure, verify that reads are automatically routed to the remaining replicas, and measure the time to full recovery.** A failover that exists only in documentation is a failover that will fail in production. The drill should be automated where possible and should include: replica failure detection, read pool rebalancing, alert generation, and replica restoration. The drill results should be documented and reviewed in the post-drill retrospective.

5. **Document the replication mode (async vs. semi-sync) for each replica set and the data loss window it implies, and get explicit sign-off from the product owner on the acceptable data loss tolerance.** The choice between async and semi-sync replication is a business decision about data loss tolerance, not a performance decision. The product owner must understand that async replication means a primary failure can lose committed writes (typically the last few seconds of transactions), and must explicitly accept that risk. This sign-off should be documented in the project's SLO definition.

## Anti-patterns

- **Strong-consistency reads on replicas**: balance / inventory read from replicas → double-spend or over-deduct; use primary
- **No lag observation**: only find out lag when business reports "can't see just-written data"
- **Replica single point**: only one replica → replica down breaks all reads
- **Wrong replication mode**: money / billing scenarios using async → data-loss risk
- **Session not sticky**: user writes then immediately can't read → poor experience
- **Long analytics queries on replicas**: long queries block replication → lag keeps growing
- **Inconsistent DDL**: primary DDL not yet on replica → replica query failures
- **No failover drill**: primary down causes panic → drill in advance
- **Shared connection pool**: primary and replica share pool → cascading failures

## Related

- [database-sharding-pattern](../architecture-design/database-sharding.md) — sharding handles writes / capacity; replicas handle read throughput
- [cqrs-pattern](../architecture-design/cqrs.md) — write to primary + read from replica = the simplest CQRS
- [connection-pooling-pattern](./connection-pooling.md) — primary and replica have separate pools
- [caching-pattern](../architecture-design/caching.md) — cache + replica dual-layer reduces primary pressure
- [bulkhead-pattern](../architecture-design/bulkhead.md) — replica isolation = bulkhead
- [timeout-budget-pattern](./timeout-budget.md) — replica read timeout must fit within the budget
- [circuit-breaker-pattern](../architecture-design/circuit-breaker.md) — replica failure circuit-breaker falls back to primary
- [journeys/i-want-to-prepare-a-database-strategy](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-database-strategy.md) — read replicas within database strategy
- [journeys/i-want-to-define-an-slo](../../tech-lead/roadmap/define-an-slo.md) — replication lag is part of the SLO
