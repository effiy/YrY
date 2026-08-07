---
title: Retry with backoff pattern
aliases: [retry-with-backoff-pattern, retry-pattern, exponential-backoff-pattern]
tags: [methodology, engineering-patterns, retry, backoff, jitter, resilience, distributed-systems]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: Retry is not blindly trying again; it is backoff + jitter + ceiling + idempotent + not retrying non-recoverable errors; exponential backoff + jitter; no more than 3 attempts
roles: [engineer, tech-lead, oncall-sre]
benefit: "Transient failures are handled with exponential backoff and jitter, preventing thundering herd retry storms"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
 - ./idempotency.md
 - ./circuit-breaker.md
 - ./rate-limiting.md
 - ./observability.md
 - ./sse-streaming.md
 - ./rpc-envelope.md
 - ../tools/scale-a-service.md
 - ../../oncall-sre/incident-response/respond-to-an-incident.md
 - ../strategies/implement-an-api.md
 - ../../oncall-sre/observability/set-up-observability.md
 - ../../tech-lead/roadmap/define-an-slo.md
 - ../lessons/wins/yiai-llm-phase-five.md
 - ../lessons/wins/yiai-knowledge-watcher.md
---

# Retry with backoff pattern

> **As an** engineer, **I want to** retry with backoff, **so that** pattern applied consistently.

## Summary

- Four pieces of retry backoff: exponential backoff + jitter + ceiling + idempotent
- Do not retry non-recoverable errors: 4xx no retry; 5xx / timeout / network error retry
- Exponential backoff: 1s / 2s / 4s / 8s; not fixed
- Jitter: ± 50%; prevents thundering herd
- Retry ceiling: ≤ 3 attempts; not unlimited
- Idempotent: retries must be idempotent; non-idempotent operations must not retry
- Retry + circuit breaker + rate limit three-piece set
- Observable: retry rate / success rate / abort rate

## Applicable scenarios

Distributed system calls / third-party APIs / network jitter / transient faults / database momentary connection / LLM provider rate limits / message queue consumption / any "right side not stable so retry" scenario; do not retry non-recoverable errors.

## Core points

### 1. Four pieces of retry backoff

Not blindly retrying; four pieces together.

- **Exponential backoff**: 1s / 2s / 4s / 8s; not fixed
- **Jitter**: ± 50%; prevents thundering herd
- **Ceiling**: ≤ 3 attempts; not unlimited
- **Idempotent**: retries must be idempotent

### 2. Do not retry non-recoverable errors

Classify errors; do not blindly retry.

| Error class | Retry | Reason |
|---|---|---|
| 4xx (except 408/429) | No retry | Request itself wrong; retry meaningless |
| 5xx | Retry | Server-side transient fault |
| Timeout | Retry | Network / server slow |
| Network error | Retry | Connection broken |
| 408 Request Timeout | Retry | Request timeout |
| 429 Too Many Requests | Retry + Retry-After | Rate limited |

### 3. Exponential backoff

Not fixed interval; exponential growth.

```
1s → 2s → 4s → 8s → 16s
```

- Not fixed 1s; prevents avalanche
- Exponential growth; gives service recovery time
- Capped ceiling (e.g. max 30s)

### 4. Jitter

Prevents thundering herd; jitter.

- ± 50% jitter
- Randomizes backoff
- Prevents many clients retrying simultaneously
- Prevents synchronized retry overwhelming the service

### 5. Retry ceiling

Not unlimited retry; ≤ 3 attempts.

- Retry ≤ 3 attempts
- Exceed ceiling + fallback
- No infinite loop
- Retry + fallback linked

### 6. Idempotent

Retries must be idempotent; non-idempotent operations must not retry.

- Retry = sending the same request again
- Must be idempotent: GET / PUT / DELETE are idempotent
- POST is not idempotent; use idempotency-key
- Non-idempotent interfaces do not retry; switch to query + conditional write
- See [idempotency-pattern](./idempotency.md)

### 7. Retry + circuit breaker + rate limit

Three-piece set linked; not isolated.

- **Retry**: transient faults
- **Circuit breaker**: sustained faults
- **Rate limit**: burst traffic
- Retry hitting threshold triggers circuit breaker; circuit breaker open does not retry

### 8. Retry context

Not blind retry; carry context.

- Carry request ID (idempotency-key)
- Carry timestamp
- Server can dedupe
- No duplicate side effects

### 9. Timeout and retry aligned

Timeout + retry aligned; not disjoint.

- Per-call timeout + total timeout
- Total timeout = per-call timeout × (retry count + 1) + backoff sum
- No unlimited waiting
- Not "timeout only retry" = resource exhaustion

### 10. Observable

Retries must be monitored; not blind retries.

- Retry rate (trigger rate)
- Success rate (after retry)
- Abort rate (retries exhausted still fail)
- Alert by error class
- Retry exception growth alert

### 11. LLM retry

LLM call retry; special scenarios.

- 429 rate limit: backoff per Retry-After
- 5xx: exponential backoff
- Timeout: first-token timeout + completion timeout
- Partial output: no retry; stream continuation
- Switch provider: switch after circuit breaker
- Cost: retries also incur cost; cap

## Anti-patterns

- **Blind retry**: 4xx also retried → waste → must classify errors
- **Fixed interval**: fixed 1s → thundering herd → must exponential + jitter
- **Unlimited retry**: unlimited retry → infinite loop → must ≤ 3 attempts
- **Non-idempotent retry**: POST non-idempotent retry → duplicate create → must idempotent
- **Timeout and retry disjoint**: timeout long retry many → resource exhaustion → must align
- **Retry not monitored**: retry not monitored → do not know triggers → must observable
- **Retry without circuit breaker**: retry without circuit breaker → sustained retry crushes → must three-piece set
- **No jitter**: no jitter → synchronized retry → must jitter
- **LLM partial output retry**: partial output retry → duplicate billing → must stream continuation

## Co-build

- Journeys: [scale-a-service](../engineering/scale-a-service.md) + [respond-to-an-incident](../../oncall-sre/incident-response/respond-to-an-incident.md) + [implement-an-api](../architecture-design/implement-an-api.md) + [set-up-observability](../../oncall-sre/observability/set-up-observability.md) + [define-an-slo](../../tech-lead/roadmap/define-an-slo.md)
- Landed wins: [yiai-llm-phase-five-win](../lessons/win-yiai-llm-phase-five.md) + [yiai-knowledge-watcher-win](../lessons/win-yiai-knowledge-watcher.md)
- Companion patterns: [idempotency-pattern](./idempotency.md) + [circuit-breaker-pattern](../architecture-design/circuit-breaker.md) + [rate-limiting-pattern](../engineering/rate-limiting.md) + [observability-pattern](../engineering/observability.md) + [sse-streaming-pattern](../architecture-design/sse-streaming.md) + [rpc-envelope-pattern](../architecture-design/rpc-envelope.md)
