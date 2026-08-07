---
title: Connection Pooling / Connection Pooling
aliases: [connection-pooling-pattern, pool-pattern, connection-pool]
tags: [pattern, engineering patterns, connection pool, resource management, performance]
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
benefit: "Database connections are reused efficiently through pooling, preventing connection exhaustion under load"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./timeout-budget.md
  - ./idempotency.md
  - ../engineering/scale-a-service.md
  - ../quality-security/do-a-performance-audit.md
---

# Connection Pooling / Connection Pooling

> **As an** engineer, **I want to** connection pooling, **so that** pattern applied consistently. 

## Summary

Reuse connections rather than creating new ones each time. The pool = warmup + reuse + upper bound + health check + timeout reclaim + idle cleanup; applicable to DB / HTTP / RPC / message middleware client; not applicable to one-off scripts / extremely low QPS / in-memory calls with no connection cost.

## Core viewpoints

**The pool size is a contract with the downstream, not a performance tuning knob.** A pool with max_size=100 that connects to a database with max_connections=100 means that a single instance of the service can exhaust the database's entire connection capacity. The pool size must be calculated as `downstream_max_connections / num_service_instances` with headroom for administrative connections and maintenance. Setting the pool size without knowing the downstream's capacity is capacity planning by guesswork.

**Connection health checks are the difference between a pool that self-heals and a pool that delivers errors.** A connection that has been idle for 30 minutes may have been silently killed by a network middlebox, a database timeout, or a load balancer. Without a health check before lending (SELECT 1, ping, or TCP keepalive), the pool will hand out dead connections that fail on first use. The health check cost is negligible (sub-millisecond) compared to the cost of a failed request that must be retried.

**Every pool must have a borrow timeout, and the timeout must be shorter than the upstream caller's timeout.** A pool that blocks forever when exhausted will cause the upstream caller to accumulate waiting threads until the service runs out of memory. The borrow timeout must be set to a value that allows the caller to fail fast and retry (or shed load), and it must be strictly shorter than the end-to-end request timeout budget.

**Independent pools per downstream are the cheapest form of bulkhead isolation.** A single shared pool that connects to database A (fast) and database B (slow) means that a slowdown in database B will exhaust the shared pool and starve database A, even though database A is healthy. Each downstream must have its own pool with its own size, timeout, and health check configuration. The isolation is free; the shared pool is the expensive option.

**The pool must be observable, not a black box.** Pool utilization, borrow wait time, timeout count, health check failure rate, and connection lifetime are the signals that predict a capacity problem before it becomes an outage. A pool that reports only "connections active" is a pool that will surprise the on-call engineer at 3 AM. The pool metrics must be exported to the monitoring system and must have alerts on utilization exceeding 80%. 

## Key info

- **Pool size calculation formula**: `pool_max_size = floor(downstream_max_connections / num_service_instances) - admin_reserve`. Example: PostgreSQL with `max_connections=200`, 4 service instances, `admin_reserve=5` → `floor(200/4) - 5 = 45` per instance. The `admin_reserve` is for DBA access, migrations, and monitoring tools. If the pool size is set to 100 per instance with 4 instances and the database has 200 connections, 200 of the 400 requested connections will fail, but only under peak load -- the worst time to discover the misconfiguration.
- **Pool configuration parameters**: `max_size` (hard limit, requests beyond this queue or fail), `min_idle` (connections kept warm, reduces cold-start latency, trade-off: idle connections consume database resources), `max_idle_time` (connections idle longer than this are closed, default 10 minutes, must be shorter than database `idle_in_transaction_session_timeout`), `max_lifetime` (connection closed after this duration regardless of health, default 30 minutes, prevents memory leaks in long-lived connections), `borrow_timeout` (how long a request waits for a connection from the pool, default 30 seconds, must be shorter than the upstream caller's timeout), `health_check` (SQL or ping before lending, default `SELECT 1`, adds ~0.5ms overhead).
- **Pool exhaustion symptoms**: (1) increasing `borrow_wait_time` (requests queuing for connections), (2) `borrow_timeout_count > 0` (requests timing out waiting for connections), (3) `active_connections = max_size` continuously (pool fully saturated), (4) downstream database showing `connections = max_connections` (all connections consumed). The order of symptoms: (1) → (2) → (4) → (3). If you catch it at (1), you can scale up before users are affected. If you catch it at (3), users are already experiencing errors.
- **Pool library comparison**: HikariCP (Java, fastest, 1M+ cps, `connectionTimeout`, `idleTimeout`, `maxLifetime`, `keepaliveTime`, metrics via Micrometer), PgBouncer (PostgreSQL, connection pooling proxy, transaction/session/statement pooling modes, runs as a separate process, reduces PostgreSQL connection overhead 100x), `asyncpg` pool (Python, async, `min_size`, `max_size`, `max_queries`, `max_inactive_connection_lifetime`), `generic-pool` (Node.js, `max`, `min`, `idleTimeoutMillis`, `acquireTimeoutMillis`). For the Yi family: YiAi uses Motor (MongoDB async driver) with built-in connection pooling (default max 100, configure via `maxPoolSize` in connection URI).
- **YiAi MongoDB connection pool**: Motor uses `maxPoolSize=100` by default. With MongoDB Atlas M0 (free tier, 100 connections max), the default is the ceiling. If YiAi runs 2 instances, each with `maxPoolSize=100`, the total of 200 exceeds MongoDB's 100, and the second instance will fail to connect. The fix: set `maxPoolSize=50` when running multiple instances. The most common production issue: the default pool size works in development (single instance) but fails in production (multiple instances).

## Problem

Creating a new connection each time means: 
- TCP three-way handshake + TLS handshake -> 50-200ms per connection overhead
- Backend auth / session setup -> another 20-100ms
- High QPS saturates backend connection tables -> service rejected
- Short-connection storms -> TIME_WAIT buildup -> port exhaustion
- Quantified: 1k QPS no-pool vs pooled: connection setup cost 100ms x 1000 = 100s CPU/sec; pooled: 0.1ms x 5 = 0.5ms/sec

## Pattern

Six elements of a connection pool: 
1. **Warmup**: at startup, build min_size connections to avoid cold-start latency
2. **Reuse**: borrow -> return after use; do not actually disconnect
3. **Upper bound**: max_size prevents avalanche; if exceeded, wait or reject
4. **Health check**: heartbeat ping / SELECT 1 before lending; bad connections discarded
5. **Timeout reclaim**: borrow_timeout controls wait; idle_timeout reclaims idle
6. **Idle cleanup**: shrink to min_size; avoid holding resources long-term

```python
class ConnectionPool:
    def __init__(self, factory, min_size=5, max_size=50,
                 borrow_timeout=5, idle_timeout=300, max_lifetime=1800):
        self.factory = factory
        self.min, self.max = min_size, max_size
        self.borrow_timeout = borrow_timeout
        self.idle_timeout = idle_timeout
        self.max_lifetime = max_lifetime
        self.pool = collections.deque()
        self.in_use = {}
        self._warmup()

    def _warmup(self):
        for _ in range(self.min):
            self.pool.append(self._new_conn())

    def _new_conn(self):
        c = self.factory()
        c.created_at = time.time()
        return c

    def acquire(self):
        deadline = time.monotonic() + self.borrow_timeout
        while True:
            if self.pool:
                conn = self.pool.popleft()
                if self._is_stale(conn):
                    continue
                self.in_use[id(conn)] = conn
                return conn
            if len(self.in_use) < self.max:
                conn = self._new_conn()
                self.in_use[id(conn)] = conn
                return conn
            if time.monotonic() > deadline:
                raise PoolExhaustedError
            time.sleep(0.01)

    def release(self, conn):
        del self.in_use[id(conn)]
        if time.time() - conn.created_at > self.max_lifetime:
            conn.close(); return
        self.pool.append(conn)

    def _is_stale(self, conn):
        if time.time() - conn.created_at > self.max_lifetime:
            return True
        try:
            conn.ping(); return False
        except Exception:
            conn.close(); return True
```

## Applicable

- DB connections: Postgres / MySQL / Mongo / Redis
- HTTP client: urllib3 / requests.Session / httpx.AsyncClient
- RPC client: gRPC channel pool
- Message middleware: Kafka producer / RabbitMQ channel
- LLM provider: OpenAI / Anthropic httpx pool (long connection saves TLS handshake) 
- RAG vector store: Milvus / Qdrant client pool

## Not applicable

- One-off scripts: pool overhead exceeds benefit
- Extremely low QPS (<1 QPS) : pool overhead > benefit
- In-memory calls with no connection cost: function calls / local IPC
- Short-lived cadence workers: connection exits before reuse

## Landing checklist

1. Choose a mature pool implementation: DB use asyncpg / SQLAlchemy pool; HTTP use httpx Limits / requests-toolbelt
2. Configure min/max: based on downstream max_connections and this service's concurrency; typically max = downstream capacity / N instances
3. borrow_timeout: <= the budget allocated to this hop in the timeout-budget end-to-end SLA
4. idle_timeout + max_lifetime: 5-30 minute lifecycle; avoid long connections being killed by middleware
5. Health check: SELECT 1 or TCP keepalive before borrowing; discard bad connections and create new
6. Independent pool per downstream: bulkhead isolation; no shared pool to prevent cascade
7. Observability: pool utilization / borrow wait time / timeout count / health check failure rate
8. Slow query guard: holding too long after borrow -> active reclaim + alert
9. Graceful shutdown: drain pool on service stop, wait for all in_use to return before exiting
10. Stress test verification: pool config does not degrade under peak RPS

## Action recommendations

1. **Calculate the pool size for every downstream connection using the formula `downstream_max_connections / num_service_instances - headroom` and document the calculation in the service's configuration file.** A pool with max_size=100 that connects to a database with max_connections=100 means a single service instance can exhaust the database's entire connection capacity. The calculation must include headroom for administrative connections (typically 5-10) and must be updated whenever the number of service instances changes.

2. **Add a health check (SELECT 1 or ping) before every connection borrow, and configure a max_lifetime of 30 minutes to prevent stale connections killed by network middleboxes.** A connection that has been idle for 30 minutes may have been silently killed by a database timeout, a load balancer, or a network middlebox. Without a health check before lending, the pool will hand out dead connections that fail on first use. The health check cost is sub-millisecond; the cost of a failed request is orders of magnitude higher.

3. **Set a borrow_timeout on every pool that is strictly shorter than the end-to-end request timeout budget, and export borrow_timeout_count as a metric with an alert threshold.** A pool that blocks forever when exhausted causes the upstream caller to accumulate waiting threads until the service runs out of memory. The borrow_timeout must be tuned to allow the caller to fail fast and retry or shed load. The metric should alert when the timeout count exceeds 1% of total borrows in any 5-minute window.

4. **Create an independent pool per downstream service, with its own size, timeout, and health check configuration.** A single shared pool that connects to database A (fast) and database B (slow) means a slowdown in database B exhausts the shared pool and starves database A, even though database A is healthy. Each downstream must have its own pool. The isolation is free; the shared pool is the expensive option.

5. **Export pool metrics (utilization, borrow wait time, timeout count, health check failure rate, connection lifetime) to the monitoring system with an alert on utilization exceeding 80%.** A pool that reports only "connections active" is a pool that will surprise the on-call engineer at 3 AM. The pool metrics are the signals that predict a capacity problem before it becomes an outage. The 80% utilization alert gives the team time to investigate and scale before the pool is exhausted.

## Anti-patterns

- **Pool too small**: max=10 but RPS=1000 -> queue wait avalanche
- **Pool too large**: max=1000 but downstream only accepts 100 -> connections rejected
- **No borrow timeout**: callers block forever when pool full
- **No health check**: bad connections returned directly error; not actively removed
- **No max lifetime**: long connections killed by MySQL wait_timeout; intermittent connection drops
- **Shared single pool**: all downstreams share one pool -> one slow downstream drags the whole service
- **Held and not returned**: borrow but forget to release -> pool drained; use contextmanager guard
- **Sync pool in async**: async framework using sync pool -> blocks event loop
- **No observability**: blind spot in pool utilization -> no basis for capacity planning

## Related

- [bulkhead-pattern](../architecture-design/bulkhead.md) — independent pool per downstream = bulkhead isolation
- [timeout-budget-pattern](./timeout-budget.md) — borrow_timeout must be within end-to-end budget
- [circuit-breaker-pattern](../architecture-design/circuit-breaker.md) — when downstream fails, breaker trips, in-pool connections reclaimed
- [rate-limiting-pattern](../engineering/rate-limiting.md) — ingress rate limit prevents pool being blown up
- [observability-pattern](../engineering/observability.md) — pool utilization is a golden metric
- [caching-pattern](../architecture-design/caching.md) — cache hit can bypass connection pool to reduce load
- [idempotency-pattern](./idempotency.md) — pool-full retry needs upstream idempotency
- [journeys/i-want-to-scale-a-service](../engineering/scale-a-service.md) — pool config must be tuned when scaling out
- [journeys/i-want-to-prepare-a-database-strategy](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-database-strategy.md) — DB pool strategy lives inside the database strategy
