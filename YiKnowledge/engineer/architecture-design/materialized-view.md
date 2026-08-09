---
title: Materialized View Pattern / Materialized View Pattern
aliases: [materialized-view-pattern, mv-pattern, materialized-view]
tags: [pattern, engineeringPattern, materialized-view, derived-read-model, pre-computation]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Pre-computed query results are stored for fast reads, trading storage for query performance on complex aggregations"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
 - ./cqrs.md
 - ./event-sourcing.md
 - ./caching.md
 - ./database-sharding.md
 - ../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-a-data-architecture-strategy.md
 - ../engineering/scale-a-service.md
 - ../quality-security/do-a-performance-audit.md
 - ../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-data-engineering-strategy.md
---

# Materialized View Pattern

> **As an** engineer, **I want to** materialized view, **so that** pattern applied consistently.

## Summary

Derived read models are pre-computed and persisted; queries don't re-compute on every read; links with CQRS / event-sourcing / caching / read-replica; suitable for complex aggregation / high-QPS reads / cross-table joins; not suitable for strong-consistency real-time reads / single read-write.

## Problem

- Every read re-computes: complex join / aggregation query latency P99 > 2s; peak slow queries exhaust connection pools; CPU persistently 80%+; users report 5s+ load.
- Primary DB under pressure: analytical queries hit the primary DB; write requests blocked; connection pools depleted; cascading failure.
- Cache mismatch: cache only caches raw rows; aggregation results recomputed every time; cache breakdown; penetration to DB.
- Consistency traps: reports stale; users write then can't read back; operations report errors; decision latency.
- Maintenance cost: hand-written materialized view scripts scattered; refresh failures silent; schema evolution breaks views.

## Pattern

**Core**: derived read models are pre-computed + persisted from raw data; queries hit the materialized view, not the raw table; refresh strategy explicitly defined; links with CQRS read/write split / event-sourcing projections / caching layer.

**Four refresh strategies**:
- **Trigger-based**: raw table changes immediately trigger refresh; strong consistency; suits low-frequency writes + high-frequency reads.
- **Scheduled refresh**: timed full / incremental refresh; eventual consistency; suits reports / dashboards.
- **Streaming refresh**: consume CDC events / outbox incremental updates; near real-time; suits monitoring / real-time dashboards.
- **On-demand refresh**: triggered by user request; check cached view; suits low-frequency high-complexity queries.

**Consistency tiers**:
- **Strong consistency**: trigger + sync refresh; read = write; suits transactional systems.
- **Eventual consistency**: scheduled / streaming; latency < 1min; suits reports / dashboards.
- **Session consistency**: session sticky + version readback; users read back what they wrote; suits user dashboards.
- **Weak consistency**: scheduled + 5min latency; suits trend analysis.

**Key code**:

```python
class MaterializedView:
 def __init__(self, name, source_tables, refresh_strategy, refresh_interval=60):
 self.name = name
 self.source_tables = source_tables
 self.strategy = refresh_strategy # trigger / scheduled / streaming / on-demand
 self.refresh_interval = refresh_interval
 self.last_refresh_at = None
 self._metrics = {"refresh_count": 0, "refresh_duration_ms": [], "last_error": None}

 def query(self, filters):
 # query hits the materialized view; not the raw table
 return self._store.scan(self.name, filters)

 def refresh(self, since=None):
 start = time.monotonic()
 try:
 if self.strategy == "trigger":
 self._refresh_incremental(since)
 elif self.strategy == "scheduled":
 self._refresh_full()
 elif self.strategy == "streaming":
 self._apply_events(self._drain_cdc())
 elif self.strategy == "on-demand":
 if self._is_stale():
 self._refresh_incremental(since)
 self.last_refresh_at = time.time()
 self._metrics["refresh_count"] += 1
 except Exception as e:
 self._metrics["last_error"] = str(e)
 raise
 finally:
 self._metrics["refresh_duration_ms"].append((time.monotonic() - start) * 1000)

 def _is_stale(self):
 return (time.time() - (self.last_refresh_at or 0)) > self.refresh_interval


class ViewRegistry:
 """Manage multiple materialized views; subscribe to CDC for unified refresh."""
 def __init__(self, cdc_consumer):
 self.views = {}
 self.cdc = cdc_consumer

 def register(self, view):
 for table in view.source_tables:
 self.views.setdefault(table, []).append(view)

 def on_cdc_event(self, event):
 table = event["table"]
 for view in self.views.get(table, []):
 if view.strategy in ("trigger", "streaming"):
 view.refresh(since=event["ts"])
```

## Apply

- Complex join / aggregation queries (reports / dashboards / big boards)
- High-QPS reads + low-frequency writes (user profile / config / counters)
- Cross-service / cross-DB read models (CQRS read side)
- Real-time dashboards / monitoring metrics
- Search engine indexes (Elasticsearch / OpenSearch)
- Vector DB indexes (embedding derived)
- Recommendation feature derived (feature store)
- Multi-tenant aggregate views

## Not apply

- Strong-consistency real-time reads (use primary DB / sync replica)
- Single read-write scenarios (CRUD suffices; materialized view is over-engineering)
- Write-then-read consistency requirements (trigger works but cost is high)
- Data changes frequently and refresh cost exceeds direct query
- Small tables / simple queries (direct query is faster)
- Ad-hoc queries (use ad-hoc query engine; materialized view is pre-computation)

## Landing checklist

1. **Identify read bottlenecks**: slow query log + QPS + P99 latency; find top 10 complex queries.
2. **Split read model**: CQRS read/write split; read model designed independently; materialized view list.
3. **Choose refresh strategy**: trigger / scheduled / streaming / on-demand; per scenario; don't force one type.
4. **Build CDC pipeline**: Debezium / Maxwell / AWS DMS / custom trigger; event stream to outbox or Kafka.
5. **Consume CDC to refresh views**: streaming refresh; idempotent; dedup; carry event_id.
6. **Scheduled refresh fallback**: weekly / hourly full; prevents CDC stream break causing stale views.
7. **Label consistency tiers**: every view labeled strong / eventual / session / weak; documented.
8. **Monitor refresh latency**: lag_ms / refresh_duration / last_refresh_at / error_rate; alert thresholds.
9. **Schema evolution**: upcaster / versioned view; don't directly ALTER; create new + switch + drop old.
10. **Fallback plan**: view failure -> fallback to raw table; feature flag switch; no impact on main path.
11. **Cost observability**: view storage cost + refresh cost; delete when unused; don't accumulate.
12. **CI gate**: new queries must use materialized view; slow query threshold blocks PR.

## Anti-patterns

- **Every read re-computes**: complex queries hit raw table every time; slow + primary DB pressure; fix: materialized view + refresh strategy.
- **View without refresh strategy**: built but not refreshed; stale data; users report errors; fix: explicit strategy + monitoring.
- **Strong-consistency reads via view**: users write then can't read back; poor experience; fix: session sticky or trigger sync refresh.
- **Materialize everything**: materialize all; storage explosion + refresh cost high; fix: filter by QPS + complexity.
- **No refresh latency monitoring**: CDC stream break unknown; views stale for hours; fix: lag_ms alert + scheduled fallback.
- **CDC without dedup**: event duplicate consumption; view state corrupt; fix: event_id idempotent.
- **Schema evolution breaks view**: source table changes field; view breaks; fix: versioned view + upcaster.
- **View and raw table schema tightly coupled**: source changes one place; all views change; fix: projection layer + intermediate table.
- **Refresh failure not alerted**: silent staleness; bad decisions; fix: error alert + scheduled fallback.
- **View queries raw table schema**: cross-service reads raw table; coupling; fix: view schema independent.
- **Don't integrate with CQRS / event-sourcing**: independent maintenance; duplicate work; fix: merge with read-side projections.

## Related

- [cqrs-pattern](./cqrs.md) — materialized view = CQRS read-side projection (core link)
- [event-sourcing-pattern](./event-sourcing.md) — materialized view = event replay projection (core link)
- [caching-pattern](./caching.md) — cache layer + materialized view layer complementary (cache hot data / materialize aggregate results)
- [read-replica-pattern](../infrastructure/read-replica.md) — replicas reduce read pressure + materialized views reduce aggregation pressure
- [database-sharding-pattern](./database-sharding.md) — cross-shard aggregates via materialized view
- [outbox-pattern](../infrastructure/outbox.md) — outbox events drive materialized view refresh
- [distributed-tracing-pattern](../engineering/distributed-tracing.md) — refresh trace must span CDC / consumer / view
- Landing case study: pending — YiAi RAG retrieval result materialization + Knowledge base stats dashboard
- Upstream: [prepare-a-data-architecture-strategy.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-a-data-architecture-strategy.md)
- Upstream: [prepare-a-data-engineering-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-data-engineering-strategy.md)
- Downstream: [../lessons/gotchas/README.md](../lessons/README.md)
