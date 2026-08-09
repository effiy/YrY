---
title: circuit breaker pattern / Circuit breaker pattern
aliases:
- circuit-breaker-pattern
- breaker-pattern
- fallback-pattern
tags:
- methodology
- engineering-patterns
- circuit-breaker
- resilience
- fallback
- downstream-protection
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: circuit breaker is not abandoning downstream; is avalanche prevention + fast failure + fallback + self-heal; three states closed / open / half-open; failure rate + timeout dual trigger; not circuit breaker is worse
roles:
- engineer
- tech-lead
- oncall-sre
benefit: pattern applied consistently
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
- ./rate-limiting.md
- ./observability.md
- ./feature-flag.md
- ./sse-streaming.md
- ./rpc-envelope.md
- ../tools/scale-a-service.md
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../../oncall-sre/observability/set-up-observability.md
- ../strategies/implement-an-api.md
- ../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md
- ../lessons/wins/yiai-llm-phase-five.md
---

# circuit breaker pattern

> **As an** engineer, **I want to** circuit breaker, **so that** pattern applied consistently.

## Summary

- circuit breaker three states: closed (normal) / open (circuit breaker) / half-open (probe)
- dual trigger: failure rate + timeout; not single dimension
- fast failure: not waiting for downstream timeout; immediately return fallback
- fallback response: cache / default / partial response / degradation
- self-heal: half-open probe; success recovery / failure then circuit breaker
- circuit breaker + rate limiting + degradation triad
- observability: circuit breaker status / trigger rate / recovery time
- not circuit breaker is worse: avalanche / chain failure / global unavailability

## Applicable scenarios

downstream service uncontrollable / dependency third-party API / cross-service call / LLM provider switch / database failure / cache penetration protection; any scenario where "downstream failure should not drag down upstream"; incident should urgently circuit break; prevent avalanche.

## core points

### 1. circuit breaker three states

state machine driven; not blind retry.

```
closed → open (trigger threshold) → half-open (probe window) → closed / open
```

- **closed**: normal pass; count failure rate
- **open**: circuit breaker; fast failure; return fallback
- **half-open**: probe with few requests; success recovery / failure then open

### 2. dual trigger

not single dimension trigger; failure rate + timeout.

- **failure rate**: failure rate within N seconds > threshold (e.g. 50%)
- **timeout**: timeout count within N seconds > threshold
- **combination**: any trigger immediately opens
- don't blindly look at failure rate; timeout is also a signal

### 3. fast failure

after circuit breaker don't wait for downstream; immediately return.

- don't wait for downstream timeout
- immediately return fallback
- user perceives fast
- don't waste resources
- prevent avalanche

### 4. fallback response

circuit breaker must fallback; not blank.

- **cache fallback**: last successful result
- **default response**: default value
- **partial response**: return what can be returned
- **degradation**: function degradation
- **async queue**: write deferred

### 5. self-heal

half-open probe; auto recovery.

- after open, wait for cooldown (e.g. 30s)
- half-open allows few requests (e.g. 5%)
- success → closed recovery
- failure → open then circuit breaker
- no manual intervention

### 6. triad

circuit breaker + rate limiting + degradation; not biased.

- **circuit breaker**: downstream failure
- **rate limiting**: burst traffic
- **degradation**: fallback response
- three linked; not isolated

### 7. multi-downstream independent circuit breaker

multi-downstream independent circuit breaker; not mixed.

- each downstream item independent breaker
- one downstream item open does not impact others
- no global circuit breaker
- isolate blast radius by downstream

### 8. observability

circuit breaker must be monitored; not blind break.

- circuit breaker status (closed/open/half-open)
- trigger rate
- recovery time
- fallback hit rate
- circuit breaker alert (exception growth)

### 9. config adjustable

don't restart to adjust; feature flag link.

- threshold config in config center
- don't restart to adjust
- feature flag link (kill switch)
- gradual rollout adjust
- allowlist (key customers not broken)

### 10. LLM provider circuit breaker

multi provider must circuit breaker; not single point.

- each provider independent breaker
- failure rate / timeout / 429 trigger
- after breaker switch provider
- fallback: cache / simplified prompt / degradation model
- not single provider failure all stop

## Anti-patterns

- **no circuit breaker**: downstream failure upstream waits for timeout → avalanche → must circuit breaker
- **single dimension trigger**: only failure rate → timeout missed → must dual trigger
- **no fallback**: blank after circuit breaker → user confused → must fallback response
- **no self-heal**: after open no half-open → forever open → must self-heal
- **global circuit breaker**: one downstream item open global break → false harm → must by downstream independent
- **no monitoring**: circuit breaker not monitored → don't know trigger → must observability
- **restart to adjust**: threshold hardcoded → emergency too late → must config center
- **retry without circuit breaker**: retry without circuit breaker → avalanche worse → must circuit breaker + retry link
- **LLM single provider no circuit breaker**: single provider failure all stop → must multi provider circuit breaker switch

## Co-build

- journeys: [scale-a-service](../engineering/scale-a-service.md) + [respond-to-an-incident](../../oncall-sre/incident-response/respond-to-an-incident.md) + [set-up-observability](../../oncall-sre/observability/set-up-observability.md) + [implement-an-api](implement-an-api.md) + [handle-outage-communication](./../../oncall-sre/incident-response/handle-a-cache-invalidation.md) + [prepare-a-disaster-recovery-plan](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md)
- implementation win: [yiai-llm-phase-five-win](../lessons/win-yiai-llm-phase-five.md) + [yivad-aicr-phase-port-win](../lessons/win-yivad-aicr-phase-port.md)
- supporting pattern: [rate-limiting-pattern](../engineering/rate-limiting.md) + [observability-pattern](../engineering/observability.md) + [feature-flag-pattern](../infrastructure/feature-flag.md) + [sse-streaming-pattern](./sse-streaming.md) + [rpc-envelope-pattern](./rpc-envelope.md)
