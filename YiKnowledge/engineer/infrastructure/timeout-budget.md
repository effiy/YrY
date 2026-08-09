---
title: Timeout Budget Pattern
aliases: [timeout-budget-pattern, timeout-budget, request-budget, latency-budget]
tags: [pattern, engineering-pattern, timeout, latency, slt, resilience, distributed-systems]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: Timeout is not guessed; it is a budget. End-to-end SLA reverse-derives per-hop budget; over budget must fail, must degrade, must not pile up; timeout is a circuit breaker trigger; cascading link timeouts; client budget ≤ server budget
roles: [engineer, tech-lead, oncall-sre]
benefit: "End-to-end request latency is bounded by cascading timeout budgets, preventing resource exhaustion from slow dependencies"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./retry-with-backoff.md
  - ../../tech-lead/roadmap/define-an-slo.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../engineering/scale-a-service.md
  - ../../oncall-sre/incident-response/do-a-rollback-drill.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
---

# Timeout Budget Pattern

> **As an** engineer, **I want to** timeout budget, **so that** pattern applied consistently.

## Summary

- Timeout is not a gut call; it is reverse-derived from a budget
- End-to-end SLA → per-hop budget → per-operation budget
- Client budget ≤ server budget (no wasted client waiting)
- Over budget must fail, must degrade, must not pile up (no infinite wait)
- Timeout is a circuit breaker trigger (alongside failure rate)
- Cascading link timeouts (upstream timeout, downstream must release)
- Each layer independent budget (not shared, not contagious)
- Budget observable (P99 actual duration vs budget)

## Problem

Pain points of not setting a timeout budget:

1. **Gut-call timeouts**: all timeouts uniformly 30s / 60s / 120s, unrelated to actual link
2. **Wasted client waiting**: client budget 60s, server budget 30s, client waits 30s for nothing
3. **Link pile-up**: upstream does not time out, downstream times out but upstream still running, resources exhausted
4. **Circuit breaker not triggered**: only failure rate triggers, timeout not counted, slow failures not broken
5. **Degradation not triggered**: timeout has no fallback, user waits for empty response
6. **Retry amplification**: timeout not budgeted, retry times out again, worse
7. **Resource exhaustion**: connection pool / thread pool occupied by slow requests, new requests rejected
8. **Not observable**: do not know actual duration distribution, do not know budget remainder, do not know which layer timed out
9. **LLM streaming timeout**: LLM streaming token-level timeout not budgeted, single token stuck blocks entire request
10. **Cross-region timeout not adjusted**: cross-region RTT not in budget, remote must time out

Quantified: systems without budgets, slow-failure MTTR averages 3-5x longer; meaningless client waiting accounts for 20-40% of total requests.

## Pattern

### End-to-end SLA reverse derivation

```
end_user_SLA = 1.0s (P99)
  ├─ edge (CDN/gateway) budget = 100ms
  ├─ backend service budget = 500ms
  │    ├─ auth budget = 50ms
  │    ├─ business logic budget = 200ms
  │    │    ├─ db query budget = 100ms
  │    │    └─ downstream call budget = 100ms
  │    └─ cache lookup budget = 50ms
  ├─ serialization / transport budget = 100ms
  └─ margin / safety budget = 300ms (30%)
```

- **SLA reverse derivation**: start from user experience P99 SLA, allocate budget layer by layer
- **30% safety margin**: reserved for network jitter / GC / queueing / retry
- **Per-hop budget ≤ upstream budget**: no waste no pile-up
- **Critical path exclusive budget**: non-critical path degrades async, does not occupy critical path

### Client ≤ Server

```yaml
# Correct: client budget 50ms, server budget 100ms
client.timeout: 50ms
server.timeout: 100ms

# Wrong: client 60s, server 30s (client waits 30s for nothing)
client.timeout: 60s  # ❌
server.timeout: 30s
```

- **Client times out first**: client timeout cancels downstream request (fail fast)
- **Server continues to complete**: client timeout does not forcibly cancel server, avoids half-done side effects
- **Side-effect operations**: after client timeout server continues to consistent state (idempotency protection)
- **Cancel propagation**: client timeout sends cancel signal, downstream releases resources, no pile-up

### Per-layer independent budget

```python
# Each layer independent budget, not shared
async def handle_request(ctx):
    async with ctx.timeout(500ms):  # backend budget
        auth = await call_auth(ctx.with_timeout(50ms))   # auth budget
        data = await call_db(ctx.with_timeout(100ms))    # db budget
        result = await call_downstream(ctx.with_timeout(100ms))  # downstream budget
    return result
```

- **deadline propagation**: each layer derives child deadline from parent deadline (no new creation)
- **Budget cannot be borrowed**: budget A layer did not use up cannot go to B layer
- **Critical path exclusive**: critical path budget not shared with non-critical
- **Over budget = fail**: do not continue past budget, fail directly + fallback

### Timeout triggers circuit breaker

```python
# circuit breaker dual trigger: failure rate + slow request rate
breaker = CircuitBreaker(
    failure_rate_threshold=0.5,
    slow_call_rate_threshold=0.5,  # slow request share > 50% also breaks
    slow_call_duration_threshold=500ms,  # slow = over 500ms
    ...
)
```

- **Dual trigger condition**: failure rate + slow request rate (either triggers break)
- **Slow request definition**: actual duration > budget treated as slow
- **Slow request separately counted**: not mixed into failure rate (slow ≠ failure, but = risk)
- **Post-break degrade**: break goes to fallback, no empty wait

### Cascading link timeout

```
client.timeout=1s
  → gateway.timeout=900ms (leave 100ms for gateway processing)
    → service.timeout=800ms (leave 100ms for service processing)
      → downstream.timeout=700ms (leave 100ms for downstream processing)
```

- **Per-layer shrinking budget**: each layer leaves its own processing time
- **Downstream timeout, upstream also times out**: no pile-up, cascading release
- **Timeout cancel propagation**: upstream timeout sends cancel, downstream stops work
- **No reverse borrowing**: downstream timeout cannot borrow budget from upstream

### LLM streaming token-level budget

```python
# LLM streaming: total budget + token-level budget
async def stream_llm(prompt, total_budget=5s, token_budget=500ms):
    deadline = time.now() + total_budget
    async for token in llm.stream(prompt):
        if time.now() > deadline:
            yield partial_output; return  # total budget exceeded, return partial
        if (time.now() - last_token_time) > token_budget:
            yield partial_output; return  # single token exceeded, return partial
        yield token
        last_token_time = time.now()
```

- **Total budget**: entire LLM call cannot exceed
- **Token-level budget**: single token interval cannot exceed (prevent server hang)
- **Partial output must return**: timeout not empty, return generated partial (graceful degradation)
- **Resume not retry**: streaming timeout resumes not retries (idempotency link)

### Cross-region budget adjustment

```
region_A → region_B:
  baseline_RTT = 200ms
  budget = base_budget + RTT (300ms + 200ms = 500ms)
  client.timeout = 500ms + 50ms margin = 550ms
```

- **RTT in budget**: cross-region cannot use local budget
- **Baseline RTT probing**: periodically measure RTT, dynamically adjust budget
- **Cross-region degrade**: remote RTT spike triggers degrade (fallback local cache)
- **Multi-region priority**: local first then remote (latency-based routing)

### Budget observable

```python
metrics.histogram("request.duration", actual_duration, tags={
    "endpoint": endpoint,
    "budget": budget_ms,
    "budget_remaining": budget_ms - actual_duration,
    "over_budget": actual_duration > budget_ms,
})
```

- **P99 vs budget**: how far actual P99 is from budget
- **Budget remainder distribution**: share of requests with X budget left
- **Over budget count**: rate of budget overruns
- **Over budget consequence**: whether over budget leads to failure / degrade
- **Slow request top N**: trace slowest N requests, locate bottleneck layer

## Applicable

- **Distributed systems**: multi-hop links must set budget
- **LLM streaming**: dual layer total + token-level budget
- **Cross-region calls**: RTT in budget
- **Paid APIs**: over budget cancel avoids overage
- **User experience critical**: UX P99 SLA reverse derivation
- **Circuit breaker trigger**: slow request rate alongside failure rate
- **Pre-retry**: set budget before retry or amplify

## Not applicable

- **Local memory operations**: single-process sync no need for budget
- **Batch tasks**: long tasks use deadline not timeout
- **Streaming push**: server-initiated push not applicable (use heartbeat timeout)

## Landing checklist

1. **End-to-end SLA defined**: UX P99 SLA numeric (e.g. 1.0s)
2. **Per-layer budget allocation**: per-hop budget + 30% safety margin
3. **Client budget ≤ server budget**: per-client config
4. **Deadline propagation**: each layer derives from parent, no new
5. **Circuit breaker slow request rate trigger**: alongside failure rate
6. **Over budget degrade**: over goes to fallback, no empty wait
7. **Cascading link timeout**: per-layer shrink + cancel propagation
8. **LLM dual-layer budget**: total + token-level
9. **Cross-region RTT included**: baseline probing dynamic adjust
10. **Budget observable**: P99 / remainder / over-budget rate / top N slow requests
11. **CI verify budget**: contract test + slow request test block
12. **Quarterly review**: actual P99 vs budget drift then reallocate

## Anti-patterns

- **Gut-call timeout**: all timeouts uniformly 30s, unrelated to link
- **Client > server**: client waits while server already failed
- **Budget shared**: A layer's leftover given to B, critical path dragged
- **Timeout infinite retry**: timeout retry timeout again, worse
- **Slow request not in circuit breaker**: only failure rate, slow failures not broken
- **Timeout no degrade**: user waits for empty response
- **Link not cascading**: downstream times out but upstream still runs, resources exhausted
- **LLM total budget no token-level**: single token stuck blocks all
- **Cross-region as local**: remote must time out
- **Not observable**: do not know budget remainder, do not know bottleneck layer
- **No cancel propagation**: upstream times out, downstream unaware, continues wasting resources
- **margin = 0**: no safety margin, GC / jitter causes timeout

## Related

- Circuit breaker: [./circuit-breaker.md](../architecture-design/circuit-breaker.md) — slow request rate triggers breaker
- Retry backoff: [./retry-with-backoff.md](./retry-with-backoff.md) — set budget before retry
- Graceful degradation: [./graceful-degradation.md](../architecture-design/graceful-degradation.md) — over budget goes to fallback
- Bulkhead: [./bulkhead.md](../architecture-design/bulkhead.md) — slow requests do not occupy pool
- Observability: [./observability.md](../engineering/observability.md) — P99 / budget remainder
- Rate limiting: [./rate-limiting.md](../engineering/rate-limiting.md) — queueing in budget
- Journeys: [define-an-slo](../../tech-lead/roadmap/define-an-slo.md) + [respond-to-an-incident](../../oncall-sre/incident-response/respond-to-an-incident.md) + [scale-a-service](../engineering/scale-a-service.md) + [do-a-rollback-drill](../../oncall-sre/incident-response/do-a-rollback-drill.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) (reverse-derive budget) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) (second-order consequences of timeout) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) (per-layer budget the simpler the better)
