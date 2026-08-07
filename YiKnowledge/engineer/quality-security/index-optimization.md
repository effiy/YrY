---
title: Index optimization pattern / Index Optimization Pattern
aliases: [index-optimization-pattern, index-pattern, db-index]
tags: [pattern, engineeringPattern, index-optimization, database, performance]
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-03
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Database indexes are strategically designed to match query patterns, minimizing full table scans"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./query-optimization.md
  - ../quality-security/do-a-performance-audit.md
  - ../engineering/scale-a-service.md
---

# Index optimization pattern / Index Optimization Pattern

> **As an** engineer, **I want to** index optimization, **so that** pattern applied consistently.

## Summary

Choose index type by selectivity + cardinality + query pattern; B-tree / hash / GIN / GiST / BRIN / partial / covering / composite multiple strategies; monitor unused + duplicate + invalid; maintain statistics + refresh; link with caching / materialized-view / read-replica; suits query-heavy + large tables; not suited for write-heavy small tables / extreme OLTP.

## Question

- **Slow queries**: every read scans the table; P99 > 2s; slow queries during peak saturate the connection pool; CPU persistent 80%+.
- **Index bloat**: indexing everything; writes slow + storage cost + maintenance cost.
- **Index invalid**: function + implicit cast + type mismatch → index unusable; scanned rows explode.
- **Duplicate indexes**: composite index prefix coverage; redundant indexes; storage waste + slow writes.
- **Unused indexes**: nobody looks them up; occupy storage + slow down writes; not monitoring, unknown.
- **Stale statistics**: optimizer picks wrong execution plan; new data distribution mismatches old stats; slow query surge.
- **Index not maintained**: fragmentation + bloat + dead tuples; slow queries; vacuum not in time.

## Pattern

**Core**: choose index type by query pattern + selectivity + cardinality; cover queries + reduce table lookups + monitor unused + maintain statistics; link with cache / materialized view / replica.

**Index type matrix**:

| Type | Suited | Not suited |
|---|---|---|
| B-tree | equality + range + sort + unique | full text / high-cardinality enum |
| Hash | equality (PG does not support cross-page) | range + sort |
| GIN | full text + array + JSONB + multi-column | high update + write amplification |
| GiST | geometry + range + KNN | equality (use B-tree) |
| BRIN | large tables + sorted storage + low dimension | random distribution |
| Partial | subset queries + saves storage | full-table queries |
| Covering | cover queries + avoid table lookup | write-heavy |
| Composite | multi-column equality + sort | single-column queries unusable |
| Unique | uniqueness constraint + business idempotency | allows duplicates |

**Selection principles**:
- **Selectivity**: high selectivity (cardinality / rows > 0.1) build index; low selectivity (gender / status) do not build.
- **Query pattern**: equality → B-tree / hash; range → B-tree; sort → B-tree; full text → GIN; KNN → GiST.
- **Covering query**: covering index includes query fields; avoid table lookup; `INCLUDE` clause.
- **Composite index column order**: equality → range → sort; leftmost prefix.
- **Partial index**: `WHERE status='active'` subset index; saves storage + speeds up.

**Key code**:

```sql
-- Composite index: equality + range + sort
CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at DESC);

-- Covering index: avoid table lookup
CREATE INDEX idx_orders_user_covering
ON orders(user_id)
INCLUDE (status, total, created_at);

-- Partial index: subset query
CREATE INDEX idx_orders_active
ON orders(created_at)
WHERE status = 'active';

-- GIN: JSONB / full text
CREATE INDEX idx_docs_metadata ON docs USING GIN (metadata);
CREATE INDEX idx_docs_fts ON docs USING GIN (to_tsvector('english', body));

-- BRIN: large table + sorted storage
CREATE INDEX idx_logs_ts_brin ON logs USING BRIN (ts);

-- Monitor unused indexes (PG)
SELECT schemaname, relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public';

-- Duplicate indexes
SELECT pg_get_indexdef(indexrelid), count(*)
FROM pg_index
GROUP BY pg_get_indexdef(indexrelid)
HAVING count(*) > 1;

-- Refresh statistics
ANALYZE orders;
VACUUM (ANALYZE, VERBOSE) orders;
```

**Index invalid scenarios**:
- Function wrapping: `WHERE LOWER(email) = 'x'` → function index or expression index
- Implicit cast: `WHERE varchar_col = 123` → type alignment
- Type mismatch: `WHERE date_col = '2026-08-03 10:00'` → range lookup
- OR not using index: `WHERE a=1 OR b=2` → union or composite
- `LIKE '%xxx'` prefix wildcard: not using index → full text / trigram
- `!=` / `<>`: not using index → change to range or partial

## Applicable

- Query-heavy applications (report / dashboard / user panels)
- Large tables (> 1 million rows; slow table scan)
- Multiple query patterns (equality + range + sort + full text mixed)
- JSONB / full-text search / array queries
- High-selectivity columns (user_id / email / uuid)
- Uniqueness constraint + business idempotency (idempotency-key / event_id dedup)
- Composite queries (multi-column equality + range + sort)

## Not applicable

- Write-heavy small tables (slow writes + maintenance cost > benefit)
- Extreme OLTP high concurrency (index contention + locks)
- Full table scan faster (small tables + correct statistics)
- Frequently updated indexed columns (write amplification + bloat)
- Low selectivity (gender / status / boolean) alone
- Temporary tables / ETL intermediate tables (drop immediately after use)

## Implementation list

1. **Slow query log**: enable pg_stat_statements / slow_query_log; find top10 slow queries.
2. **Execution plan**: EXPLAIN ANALYZE; check seq scan / index scan / bitmap scan; estimated vs actual rows.
3. **Selectivity analysis**: `SELECT count(DISTINCT col) / count(*) FROM table`; build index for high selectivity.
4. **Query pattern categorization**: equality / range / sort / full text / JSONB; choose index type by pattern.
5. **Composite index column order**: equality → range → sort; leftmost prefix; avoid redundant single-column indexes.
6. **Covering index**: include query fields; `INCLUDE` clause; avoid table lookup.
7. **Partial index**: subset query + saves storage + speeds up.
8. **JSONB / full text**: GIN index + to_tsvector; not full-table scan.
9. **Uniqueness constraint**: business idempotency + event_id dedup + idempotency-key.
10. **Statistics refresh**: `ANALYZE` regularly; stale statistics alert; new data distribution mismatch.
11. **Unused index monitoring**: pg_stat_user_indexes; idx_scan=0 delete; saves storage + writes.
12. **Duplicate index dedup**: composite index prefix coverage; delete redundant.
13. **Fragmentation maintenance**: `VACUUM` + `REINDEX`; bloat > 30% rebuild; online `REINDEX CONCURRENTLY`.
14. **Index migration**: new index `CREATE INDEX CONCURRENTLY`; no table lock; does not block writes.
15. **Index pushdown**: distinguish `Index Cond` + `Filter`; push to index to reduce table lookups.
16. **CI gate**: slow query threshold blocks PR; new queries must have index; review must check execution plan.
17. **Index cost observation**: write latency + storage cost + maintenance cost; delete if unused; do not hoard.

## Anti-patterns

- **Index every column**: indexing everything; slow writes + storage waste; fix: choose by query pattern.
- **Composite index column order wrong**: range in front; equality unusable; fix: equality → range → sort.
- **Function wrapping invalid**: `WHERE LOWER(email)=x`; fix: expression index `LOWER(email)` or write small.
- **Implicit cast**: `WHERE varchar_col=123`; fix: type alignment.
- **Unused index not deleted**: occupies storage + slows writes; fix: idx_scan=0 delete.
- **Duplicate indexes**: composite index prefix coverage; fix: delete redundant.
- **Stale statistics**: optimizer picks wrong plan; fix: regular ANALYZE + stale statistics alert.
- **Index without CONCURRENTLY**: table lock + blocks writes; fix: `CREATE INDEX CONCURRENTLY`.
- **Partial index overuse**: partial everywhere; multi-condition queries miss; fix: only stable subsets use partial.
- **Covering index all fields**: includes all fields; slow writes + storage explosion; fix: only hot query fields.
- **BRIN wrong scenario**: random distribution uses BRIN; scanned rows explode; fix: BRIN only for large tables + sorted storage.
- **JSONB all GIN**: all keys GIN; write amplification; fix: choose GIN for hot keys.
- **Not linked with cache / materialized view**: independent index maintenance; rebuild repeatedly; fix: index + cache + materialized layered.
- **Not monitoring index cost**: slow writes unknown; fix: index maintenance latency + storage cost monitoring.

## Related

- [connection-pooling-pattern](../infrastructure/connection-pooling.md) — slow query guard + pool recycling co-build
- [caching-pattern](../architecture-design/caching.md) — cache hot queries + index reduces DB pressure co-build
- [materialized-view-pattern](../architecture-design/materialized-view.md) — materialized aggregates + index row lookup co-build
- [read-replica-pattern](../infrastructure/read-replica.md) — replica reduces reads + index reduces scans co-build
- [database-sharding-pattern](../architecture-design/database-sharding.md) — sharding + index double-layer scan reduction
- [distributed-tracing-pattern](../engineering/distributed-tracing.md) — slow query traces must carry SQL + plan
- Implementation case study: pending implementation of YiAi knowledge-watcher query index + YiVad aicr query index
- Upstream: [../strategies/prepare-a-database-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-database-strategy.md)
- Upstream: [../processes/do-a-performance-audit.md](do-a-performance-audit.md)
- Downstream: [../lessons/gotchas/README.md](../lessons/README.md)
