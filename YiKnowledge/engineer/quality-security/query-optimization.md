---
title: Query optimization pattern / Query Optimization Pattern
aliases: [query-optimization-pattern, sql-optimization-pattern, slow-query-pattern]
tags: [pattern, engineering-pattern, sql, database, query-optimization, performance]
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: Query optimization is not just adding indexes; it is a contract. Read path + plan + index + rewrite + measurement five dimensions; business-value driven; measurable
roles: [engineer, tech-lead, oncall-sre]
benefit: "Database queries are systematically profiled and optimized to reduce load and improve response times"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
- ./index-optimization.md
  - ./contract-test-baseline.md
  - ../projects/yiai/architecture.md
  - ../lessons/gotcha-README.md
---

# Query optimization pattern / Query Optimization Pattern

> **As an** engineer, **I want to** query optimization, **so that** pattern applied consistently.

## Summary

- Query optimization = contract; not just adding indexes
- Read path + plan + index + rewrite + measurement five dimensions; no missing dimension
- Complementary to index-optimization; do not mix
- EXPLAIN / ANALYZE / pg_stat_statements / slow query log / hint toolchain

## Core viewpoints

**Query optimization is a contract, not a one-time fix.** Every query must have a declared SLO (p50/p99), an expected plan, and a regression gate. Without a contract, the same query degrades silently over time as data volume grows, and the team only discovers it when users complain. The contract turns optimization from reactive firefighting into a measurable, owned engineering practice.

**Index design is driven by the read path, not by guessing.** An index should be designed from the WHERE + ORDER BY + JOIN columns of a specific query, not added preemptively to columns that "look important." Every unused index carries a write amplification cost that compounds with traffic. The right approach is to let the read path declare its needs, then design the narrowest index that satisfies them.

**EXPLAIN is a baseline, not a one-time check.** Query plans drift as statistics change, data volume grows, and the query planner updates its cost model. A plan that was an index scan last quarter may silently become a sequential scan this quarter. EXPLAIN must be captured as a contract baseline and compared on every deploy, not just run once during development.

**P99 latency matters more than P50 for user experience.** Average latency hides the tail, and the tail is what users remember. A query with p50=20ms and p99=2000ms delivers a worse experience than one with p50=50ms and p99=100ms. Optimization targets must include tail latency, and the SLO should gate on p99, not on the mean.

**Keyset pagination is not optional for any production list endpoint.** OFFSET-based pagination degrades linearly with page depth, and the query planner cannot rescue it. Every list endpoint that serves user-facing data must use keyset pagination (WHERE id > ? ORDER BY id) from day one, not retrofitted after the data set grows.

## Key info

- **EXPLAIN output interpretation**: the key fields are `type` (access method: `ALL` = full table scan, `index` = full index scan, `range` = index range scan, `ref` = non-unique index lookup, `eq_ref` = unique index lookup, `const` = primary key lookup), `rows` (estimated rows examined, not returned -- the gap between these two is the optimization target), `Extra` (Using filesort = in-memory sort, Using temporary = temp table, Using index = covering index, Using where = filter after index scan). Rule: `type=ALL` and `rows > 1000` is a mandatory optimization target; `Extra: Using filesort` on a query returning >100 rows is a pagination problem.
- **Composite index column order**: the index `(a, b, c)` supports queries on `WHERE a=?`, `WHERE a=? AND b=?`, `WHERE a=? AND b=? AND c=?`, but NOT `WHERE b=?` or `WHERE c=?` (leftmost prefix rule). The column order should be: equality columns first (highest selectivity first), then range columns (one range column, all subsequent columns are not used for filtering), then ORDER BY columns. The most common mistake is putting the range column before the equality columns, which makes the index useless for the equality columns that follow.
- **pg_stat_statements metrics**: `calls` (total executions), `mean_exec_time` (average ms), `stddev_exec_time` (variance, high = plan instability), `rows` (total rows returned), `shared_blks_hit` (cache hit blocks), `shared_blks_read` (cache miss blocks, high = working set exceeds buffer). The ratio `shared_blks_hit / (shared_blks_hit + shared_blks_read)` is the cache hit ratio; below 95% means the buffer pool is too small or the query is scanning too much data.
- **N+1 detection**: the query with the highest `calls` in pg_stat_statements that also has the highest `total_exec_time` is the N+1 candidate. A query called 10,000 times with mean_exec_time 1ms = 10,000ms total, which is worse than a single query taking 5,000ms. The fix is either batch loading (WHERE id IN (...)) or eager loading (JOIN FETCH). The N+1 pattern is invisible in EXPLAIN (each query is fast individually) and only visible in aggregate metrics.
- **Keyset pagination implementation**: `SELECT * FROM t WHERE (created_at, id) > (?, ?) ORDER BY created_at, id LIMIT ?`. The tuple comparison `(created_at, id) > (?, ?)` handles ties on `created_at` by using `id` as the tiebreaker, ensuring no rows are skipped. The frontend receives a `next_cursor` (base64-encoded last row's tuple) instead of a `page` number. The trade-off: no "go to page 5" button, but O(1) pagination performance regardless of page depth.

## Problem

Pain points of not using this pattern (quantified):

1. **Slow query drags down DB**: 1 N+1 query takes 80% CPU; timeout avalanche
2. **Wrong index added**: write amplification + index bloat; query not much faster
3. **No read path**: business writes a JOIN per question; not reusable; not measurable
4. **No baseline**: fast today, slow tomorrow; no regression gate
5. **No tracing**: which user / which interface is slow; unknown

## Pattern

```python
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Callable, Awaitable
import asyncio
import json

class QueryPlan(Enum):
    SEQ_SCAN = "seq_scan"        # full table scan
    INDEX_SCAN = "index_scan"    # index scan
    INDEX_ONLY = "index_only"    # covering index
    BITMAP = "bitmap"            # bitmap
    HASH_JOIN = "hash_join"
    NESTED_LOOP = "nested_loop"  # large table join slow
    MERGE_JOIN = "merge_join"

@dataclass
class QueryOptimizer:
    query_id: str                # business unique identifier
    sql_template: str            # parameterized template (avoid SQL injection + plan cache)
    params: dict
    slos: dict = field(default_factory=lambda: {"p50_ms": 50, "p99_ms": 200, "timeout_ms": 1000})
    expected_plan: QueryPlan = QueryPlan.INDEX_SCAN
    trace_id: str = ""

    async def explain(self) -> dict:
        # EXPLAIN ANALYZE to get real plan
        rows = await self._exec(f"EXPLAIN ANALYZE {self.sql_template}", self.params)
        return self._parse_plan(rows)

    async def verify(self) -> tuple[bool, dict]:
        # Run once + measure
        start = datetime.now(timezone.utc)
        try:
            await self._exec(self.sql_template, self.params, timeout=self.slos["timeout_ms"]/1000)
        except TimeoutError:
            return False, {"reason": "timeout"}
        elapsed_ms = (datetime.now(timezone.utc) - start).total_seconds() * 1000
        plan = await self.explain()
        ok = (
            plan["plan"] == self.expected_plan.value
            and elapsed_ms <= self.slos["p99_ms"]
        )
        return ok, {"plan": plan, "elapsed_ms": elapsed_ms, "slo": self.slos}

    async def optimize(self) -> list[str]:
        # Give suggestions
        actions: list[str] = []
        ok, result = await self.verify()
        if not ok:
            if result.get("plan", {}).get("plan") == QueryPlan.SEQ_SCAN.value:
                actions.append(f"add index on where + order by columns: {result['plan']['tables']}")
            if result.get("plan", {}).get("plan") == QueryPlan.NESTED_LOOP.value:
                actions.append("rewrite join: use EXISTS / IN subquery or pre-aggregate")
            if result.get("elapsed_ms", 0) > self.slos["p99_ms"]:
                actions.append("consider materialized view / read replica / caching")
            if "OFFSET" in self.sql_template.upper():
                actions.append("replace OFFSET with keyset pagination (WHERE id > ? ORDER BY id)")
            if "SELECT *" in self.sql_template.upper():
                actions.append("project only needed columns (covering index)")
        return actions

    async def _exec(self, sql: str, params: dict, timeout=None) -> list: ...
    def _parse_plan(self, rows: list) -> dict: ...
```

## Applicable

- High QPS queries
- Slow query regression
- Reports / complex JOIN
- Pagination / OFFSET
- Multi-tenant read model

## Not applicable

- OLAP large queries (use batch / materialized view)
- Write path optimization (use idempotency / outbox)
- Cache layer (use caching-pattern)

## Landing checklist

1. Read path list: each business query has query_id + SLO + expected_plan
2. Parameterized SQL (plan cache + prevent injection)
3. EXPLAIN ANALYZE for real plan
4. Indexes designed by where + order by + join keys
5. Covering index (select columns in index)
6. Keyset pagination (replace OFFSET)
7. Materialized view / read-write separation (complex reads)
8. N+1 detection + unit test gate
9. Slow query log + pg_stat_statements + trace_id throughout
10. Contract test: plan + p99 + row count regression

## Action recommendations

1. **Add an SLO declaration to every new query before it reaches code review, including p50, p99, and expected plan type (index scan, index only, bitmap, etc.).** The SLO is the contract that turns query optimization from reactive firefighting into a measurable practice. Without a declared SLO, query degradation is invisible until users complain. The SLO must be part of the PR description, and the reviewer must verify it against the EXPLAIN ANALYZE output.

2. **Replace all OFFSET-based pagination with keyset pagination (WHERE id > ? ORDER BY id) in the next sprint, starting with the three most frequently accessed list endpoints.** OFFSET-based pagination degrades linearly with page depth and cannot be rescued by the query planner. Keyset pagination is the only production-grade pagination strategy for any list endpoint that serves user-facing data. The migration should be prioritized by QPS: the highest-traffic endpoints first.

3. **Add a CI check that captures EXPLAIN ANALYZE output for every query with a declared SLO and compares it against the expected plan on every PR.** A plan that was an index scan last quarter may silently become a sequential scan this quarter as statistics change and data volume grows. The CI check should fail the build if the actual plan diverges from the expected plan, or if the p99 latency exceeds the SLO by more than 10%.

4. **Set up pg_stat_statements tracking with a weekly slow-query report that ranks queries by total_time and flags any query whose p99 has increased by more than 20% week-over-week.** The slow query log tells you what is slow right now; pg_stat_statements tells you what is getting slower over time. The weekly report should be automatically sent to the engineering channel, and any query flagged for two consecutive weeks must be assigned an optimization ticket.

5. **Add a trace_id to every query execution path, from the API gateway through the service layer to the database, so that slow queries can be traced back to the specific user, interface, and request that triggered them.** Without trace_id, a slow query in the database logs is a needle in a haystack: the team knows the query is slow but not which user or which feature is affected. The trace_id bridges the gap between the database layer and the application layer, turning "this query is slow" into "this user's report page is slow because of this query."

## Anti-patterns

- **select-star**: pulls all columns; covering index invalid
- **OFFSET-pagination**: OFFSET 100000 slow
- **function-on-indexed-col**: `WHERE DATE(created_at) = ?`; index invalid
- **implicit-cast**: `WHERE id = '1'` (id is int); index may be invalid
- **OR-as-UNION**: OR not necessarily uses index; change to UNION ALL
- **correlated-subquery**: row-correlated subquery; N executions
- **N+1**: queries in loop; pre-load or IN
- **wrong-join-type**: large table nested loop join
- **no-stats**: stale statistics; plan degrades
- **over-index**: index on every column; write amplification
- **no-explain-baseline**: plan change unknown
- **hint-as-fix**: use hint instead of root fix; plan unstable
- **no-p99-slo**: only look at p50; tail latency drags
- **no-trace_id**: which interface is slow unknown
- **no-slow-query-log**: when discovered, already days behind

## Related

- Upstream: index-optimization-pattern (index) + caching-pattern (cache layer) + materialized-view-pattern (complex reads) + read-replica-pattern (read-write separation)
- Lateral: contract-test-baseline-pattern + distributed-tracing-pattern + observability-pattern + backpressure-pattern + connection-pooling-pattern
- Landing: YiAi RAG retrieval / YiVad aicr file query / YiPet list pagination
