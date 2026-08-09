---
title: Aggregator Pattern
aliases: [aggregator-pattern, composite-aggregator-pattern, backend-aggregator-pattern]
tags: [pattern, engineering patterns, aggregator, aggregation, gateway]
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
benefit: "Multiple downstream service responses are combined into a single cohesive response, reducing client round-trips"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
- ./bff.md
  - ./api-gateway.md
  - ./cqrs.md
  - ./materialized-view.md
  - ./circuit-breaker.md
  - ./graceful-degradation.md
  - ./caching.md
  - ../architecture-design/implement-an-api.md
---

# Aggregator Pattern

> **As an** engineer, **I want to** aggregator, **so that** pattern applied consistently. 

## Summary

Aggregates N→1 over multiple downstreams + in parallel + degrades on failure + trims fields + caches + holds no business rules; works with BFF / API gateway / CQRS / materialized-view; suited to rich frontends + dashboards + multi-service orchestration; not suited to single-client / simple CRUD / strong consistency transactions. 

## Problem

- **N round trips from the frontend**: a dashboard pulls 8 APIs; latency multiplied N times + fatal on weak networks; mobile 5s+ load. 
- **Aggregation scattered across frontends**: each client stitches its own; logic duplicated + inconsistent + hard to evolve. 
- **Synchronous blocking aggregation**: call downstreams sequentially; total latency = sum; timeouts accumulate; P99 out of control. 
- **No degradation**: any downstream failure returns 500 for the whole page; user experience collapses. 
- **No cache**: every visit recomputes; downstreams crushed; cost high. 
- **Aggregator holds business rules**: business rules scattered across the aggregator; duplicated downstream; overlaps with BFF. 
- **No observation on aggregation**: aggregation latency + cache hit rate + downstream failure rate not reported; no basis for optimization. 
- **Schema strongly coupled**: aggregator schema maps 1:1 to downstream fields; downstream changes break the aggregator; evolution chaos. 

## Pattern

**Core**: the aggregator N→1 merges multiple downstreams + in parallel + degrades on failure + trims fields + caches + holds no business rules; divides labor with BFF (per-client independent) vs API gateway (unified entry). 

**Three forms**: 
- **Query aggregation**: call multiple downstreams in parallel + merge + trim fields + cache; suited to dashboard / overview / rich frontend. 
- **Command aggregation**: multi-write orchestration + partial-failure compensation + not strongly consistent transactions; use saga, not the aggregator. 
- **Hybrid aggregation**: read aggregation + write pass-through; suited to BFF / API gateway combinations. 

**Key code**: 

```python
class Aggregator:
    """N→1 aggregation; parallel + degrade + trim + cache; holds no business rules."""
    def __init__(self, downstream_services, cache, translator):
        self.services = downstream_services
        self.cache = cache
        self.translator = translator

    @cached(ttl=30, key_fn=lambda s, q: f"agg:{q.user_id}:{q.scenario}")
    async def aggregate(self, query):
        # Call multiple downstreams in parallel + degrade on failure + do not block the whole page
        results = await asyncio.gather(
            self.services.user.get(query.user_id, raise_on_fail=False),
            self.services.order.recent(query.user_id, limit=5, raise_on_fail=False),
            self.services.product.recommend(query.user_id, limit=5, raise_on_fail=False),
            self.services.review.list(query.user_id, limit=3, raise_on_fail=False),
            return_exceptions=True,
        )
        return self.translator.to_aggregate(results, query)


class PartialFailureTranslator:
    """Partial-failure degradation; on any failure return partial + fallback; no 500."""
    def to_aggregate(self, results, query):
        user, orders, recommends, reviews = results
        return {
            "user": self._unwrap(user, default=None),
            "orders": self._unwrap(orders, default=[])[:5],
            "recommends": self._unwrap(recommends, default=[])[:5],
            "reviews": self._unwrap(reviews, default=[])[:3],
            "degraded": [k for k, v in [("user", user), ("orders", orders),
                                       ("recommends", recommends), ("reviews", reviews)]
                         if isinstance(v, Exception)],
        }


class AggregatorCache:
    """Aggregation cache + jittered TTL + mutex lock to prevent stampede."""
    def __init__(self, store, default_ttl=30, jitter_pct=0.1):
        self.store = store
        self.ttl = default_ttl
        self.jitter = jitter_pct

    async def get_or_compute(self, key, compute_fn):
        cached = await self.store.get(key)
        if cached:
            return cached
        # mutex lock to prevent cache stampede
        async with self._lock(key):
            cached = await self.store.get(key)  # double-check
            if cached:
                return cached
            value = await compute_fn()
            ttl = self.ttl * (1 + random.uniform(-self.jitter, self.jitter))
            await self.store.set(key, value, ttl=ttl)
            return value
```

## Applicable

- Rich frontend + dashboard + overview (multi-service aggregation) 
- Multiple clients share the aggregation (mobile + web + desktop) 
- BFF / API gateway combination (unified entry + trim + aggregate) 
- Cross-service orchestration (command aggregation uses saga; query aggregation uses this pattern) 
- Weak network + mobile scenarios (trim + aggregate reduces latency) 
- Cross-team boundary (frontend team owns the aggregator) 
- A/B + personalization + gradual rollout (the aggregator switches the stream) 

## Not applicable

- Single client (direct connection suffices; aggregator is over-engineering) 
- Simple CRUD (one service suffices; aggregator is redundant) 
- Strongly consistent cross-service transactions (the aggregator does not do transactions; use saga) 
- Centralized business rules (the aggregator holds no rules; put them in downstream services) 
- Real-time bidirectional communication (use WebSocket / SSE; synchronous aggregation is unsuitable) 
- Extreme low latency (aggregator adds one hop; use direct connection) 

## Landing checklist

1. **Identify aggregation points**: dashboard / overview / rich frontend / multi-client; list N downstream needs. 
2. **Aggregator independent**: do not share BFF; own per scenario; frontend team owns; tech stack frontend-friendly. 
3. **Call downstreams in parallel**: asyncio.gather / Promise.all + return_exceptions; do not block sequentially. 
4. **Trim fields**: trim by client need; do not return full payload; payload minimized. 
5. **Failure degradation**: any downstream failure + return partial + fallback + no 500; mark degraded field. 
6. **Cache strategy**: aggregate result cache 30s-5min + jittered TTL + mutex lock to prevent stampede + per user / session dimension. 
7. **Circuit breaker + rate limit**: each downstream independent circuit breaker + rate limit; downstream failure does not block the aggregator. 
8. **trace_id threaded through**: aggregator entry generates trace_id; downstream calls must pass it; distributed tracing end to end. 
9. **Contract test**: aggregator ↔ frontend contract baseline; aggregator ↔ downstream contract; CI diff blocks. 
10. **Feature flag**: A/B + personalization + gradual rollout switch the stream at the aggregator; no impact on downstream services. 
11. **Observation**: aggregator-dimension latency + error rate + cache hit rate + downstream latency + degraded ratio. 
12. **Independent deploy**: aggregator and downstream deploy independently + scale independently; no mutual impact. 
13. **Schema evolution**: aggregator schema independently versioned + upcaster + decoupled from downstream; not 1:1. 
14. **Timeout budget**: each downstream independent timeout + total budget; over budget degrades. 
15. **Cache invalidation**: cache-aside double delete + broadcast invalidation across instances; no dirty data. 
16. **CI gate**: aggregator schema change baseline diff blocks; performance baseline regression alerts. 
17. **Cost observation**: aggregation calls + cache + compute + bandwidth; delete if unused; do not hoard. 



- **Sequential aggregation**: await one by one; total latency = sum; fix: parallel gather. 
- **No degradation**: any failure 500s; fix: return_exceptions + degraded field. 
- **Aggregator holds business rules**: rules scattered; duplicated with downstream; fix: aggregator only trims + aggregates + translates. 
- **Direct DB connection**: aggregator queries the DB; bypasses downstream services; schema coupling; fix: go through downstream RPC. 
- **No cache**: every visit recomputes; downstreams crushed; fix: @cached + jittered TTL + mutex. 
- **Cache stampede**: all users share one key; simultaneous expiry overwhelms; fix: per-user dimension + jitter + mutex. 
- **No circuit breaker**: downstream failure cascades the aggregator; fix: each downstream independent circuit breaker + rate limit. 
- **trace_id not propagated**: cross-service trace broken; fix: aggregator entry generates trace_id; downstream must propagate. 
- **Schema strongly coupled**: 1:1 with downstream fields; downstream changes break aggregator; fix: independent versioning + upcaster. 
- **Aggregator as saga**: cross-service transactions; transaction boundary broken; fix: aggregator does not do transactions; use saga. 
- **Aggregator directly connects to downstream DB**: bypasses ACL; schema coupling; fix: go through downstream RPC. 
- **No labor division with BFF**: aggregator = BFF? Confused responsibilities; fix: aggregator general N→1 + BFF per-client independent. 

## Related

- [bff-pattern](./bff.md) — per-client independent BFF vs general aggregator co-built
- [api-gateway-pattern](./api-gateway.md) — gateway entry + aggregator adapter co-built
- [cqrs-pattern](./cqrs.md) — aggregator is a read-model derivative co-built
- [materialized-view-pattern](./materialized-view.md) — aggregate result is a materialized view co-built
- [caching-pattern](./caching.md) — aggregate cache co-built
- [circuit-breaker-pattern](./circuit-breaker.md) — each downstream independent circuit breaker co-built
- [graceful-degradation-pattern](./graceful-degradation.md) — failure degradation co-built
- [timeout-budget-pattern](../infrastructure/timeout-budget.md) — aggregate timeout budget co-built
- [distributed-tracing-pattern](../engineering/distributed-tracing.md) — trace_id threaded through co-built
- [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md) — bidirectional contract co-built
- [observability-pattern](../engineering/observability.md) — aggregate dimension observation co-built
- landing cases: to land YiVad aicr aggregator + YiPet frontend aggregator
- upstream: [../strategies/prepare-an-api-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-api-strategy.md)
- upstream: [../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-a-frontend-architecture-strategy.md)
- downstream: [../lessons/gotchas/README.md](../lessons/README.md)
