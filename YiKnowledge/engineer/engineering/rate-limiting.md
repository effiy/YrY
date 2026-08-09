---
title: Rate limiting pattern
aliases: [rate-limiting-pattern, throttle-pattern, backpressure-pattern]
tags: [methodology, engineering-patterns, rate-limiting, throttle, backpressure, resilience]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: rate limiting is not about making things hard for users; it is about protecting the backend + fairness + cost control; four-tier algorithms token bucket / leaky bucket / sliding window / fixed window; layered by user/tenant/interface/global
roles: [engineer, tech-lead, oncall-sre]
benefit: "System protects itself from abuse and overload by enforcing per-client request rate limits"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - at least one concrete example or code snippet is provided
related:
  - ./observability.md
  - ./dual-world-boundary.md
  - ../engineering/scale-a-service.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../tech-lead/roadmap/define-an-slo.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../architecture-design/handle-multi-tenancy.md
  - ../architecture-design/implement-an-api.md
  - ../lessons/win-yiai-llm-phase-five.md
  - ../lessons/win-yivad-shared-client-vendor.md
---

# Rate limiting pattern

> **As an** engineer, **I want to** rate limiting, **so that** pattern applied consistently. 

## Summary

- rate limiting four purposes: protect backend + fair sharing + cost control + prevent abuse
- four-tier algorithms: token bucket / leaky bucket / sliding window / fixed window
- layered rate limiting: global / interface / user / tenant
- rate limiting response: 429 + Retry-After + degraded fallback
- rate limiting dimensions: user ID / interface / IP / tenant / global
- rate limiting observability: hit rate / pass rate / reject rate / trigger alert
- rate limiting configurable: adjust without restart; feature flag linkage
- rate limiting not unfair or grabbing: allowlist / priority

## Applicable scenarios

API gateway / service entry / downstream protection / multi-tenant quota / LLM token rate limiting / burst traffic peak shaving / cost control / anti-crawler / anti-abuse; any scenario requiring "if the other side does not limit, I limit first"; incident emergency rate limiting; capacity protection. 

## Core points

### 1. Four purposes of rate limiting

rate limiting is not about making things hard for users; it is protection + fairness + cost + anti-abuse. 

- **protect backend**: burst traffic does not overwhelm
- **fair sharing**: one user does not grab everything
- **cost control**: LLM token / third-party API not overspent
- **anti-abuse**: crawler / brute force / abuse

### 2. Four-tier algorithms

| algorithm | features | applicable |
|---|---|---|
| token bucket | allows bursts / average rate limit | most scenarios |
| leaky bucket | smooth output / no burst | strict smoothing |
| sliding window | precise / high memory | precise rate limiting |
| fixed window | simple / boundary burst | coarse-grained |

default token bucket; do not blindly choose. 

### 3. Layered rate limiting

not single-layer rate limiting; layered defense. 

```
global → interface → user → tenant
```

- **global**: protect the entire service
- **interface**: protect key interfaces
- **user**: fair sharing
- **tenant**: multi-tenant quota

### 4. Rate limiting response

after rate limiting must give signal; not silent. 

- HTTP 429 Too Many Requests
- `Retry-After` header
- `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset`
- degraded fallback (cache / default / partial response) 

### 5. Rate limiting dimensions

count independently by dimension; do not mix. 

- user ID
- interface
- IP (anti-crawler note NAT) 
- tenant
- global
- combined dimensions (user+interface) 

### 6. Rate limiting observability

rate limiting must be monitored; not blindly limited. 

- hit rate (trigger rate) 
- pass rate / reject rate
- trigger alert (exception growth) 
- rate limiting config change audit
- alert by dimension

### 7. Rate limiting configurable

adjust without restart; feature flag linkage. 

- rate limiting config through config center
- adjust without restart
- feature flag linkage (kill switch one line off) 
- gray release adjustment

### 8. Allowlist + priority

rate limiting is not unfair or grabbing; allowlist + priority. 

- allowlist: internal services / key customers
- priority: paid > free / key > ordinary
- not one-size-fits-all

### 9. Distributed rate limiting

multi-instance rate limiting must be distributed; not single-machine. 

- Redis centralized counting
- sliding window Redis ZSET
- token bucket Redis Lua
- local + async correction
- not single-machine inconsistent

### 10. Rate limiting + degradation linkage

rate limiting at threshold must degrade; not only reject. 

- cache fallback
- default response
- partial response
- async queue
- rate limiting + degradation + circuit breaker trio

## Anti-patterns

- **single-machine rate limiting**: multi-instance single-machine rate limiting → inconsistent → must be distributed
- **silent rejection**: rate limiting without 429 → user confused → must 429 + Retry-After
- **one-size-fits-all**: all users same threshold → key customers limited → must allowlist + priority
- **no monitoring**: rate limiting without monitoring → don't know triggers → must hit-rate alert
- **restart to adjust**: rate limiting config hardcoded → too late for emergency → must config center
- **dimension mixed**: user+interface mixed counting → wrong limit → must dimension independent
- **only reject no degradation**: rate limiting only returns 429 → poor user experience → must degraded fallback
- **algorithm blindly chosen**: blindly choose fixed window → boundary burst → must token bucket default
- **IP rate limiting false harm**: IP rate limiting false harm NAT → large numbers of users limited → must user ID priority

## Co-build

- journeys: [scale-a-service](../engineering/scale-a-service.md) + [set-up-observability](../../oncall-sre/observability/set-up-observability.md) + [define-an-slo](../../tech-lead/roadmap/define-an-slo.md) + [respond-to-an-incident](../../oncall-sre/incident-response/respond-to-an-incident.md) + [handle-multi-tenancy](../architecture-design/handle-multi-tenancy.md) + [implement-an-api](../architecture-design/implement-an-api.md)
- landing win: [yiai-llm-phase-five-win](../lessons/win-yiai-llm-phase-five.md) + [yivad-shared-client-vendor-win](../lessons/win-yivad-shared-client-vendor.md)
- companion pattern: [circuit-breaker-pattern](../architecture-design/circuit-breaker.md) + [observability-pattern](./observability.md) + [feature-flag-pattern](../infrastructure/feature-flag.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md) + [dual-world-boundary-pattern](./dual-world-boundary.md)
