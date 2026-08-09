---
title: Bulkhead isolation pattern
aliases: [bulkhead-pattern, isolation-pattern, compartmentalization-pattern]
tags: [methodology, engineering-patterns, bulkhead, isolation, resilience, fault-containment]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: Bulkhead is isolation of blast radius; one compartment failing does not sink the whole ship; thread pools / connection pools / resource pools / instances / tenant-level isolation; no shared pools.
roles: [engineer, tech-lead, oncall-sre]
benefit: "Failures in one component are contained and cannot cascade to unrelated parts of the system"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
- ./circuit-breaker.md
  - ./graceful-degradation.md
  - ../engineering/scale-a-service.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../architecture-design/handle-multi-tenancy.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../architecture-design/decompose-a-monolith.md
  - ../../tech-lead/roadmap/define-an-slo.md
  - ../lessons/win-yiai-llm-phase-five.md
  - ../lessons/win-yipet-aicr-phase-one.md
---

# Bulkhead isolation pattern

> **As an** engineer, **I want to** bulkhead, **so that** pattern applied consistently.

## Summary

- Bulkhead is isolation of blast radius; one compartment failing does not sink the whole ship.
- Layered isolation: thread pools / connection pools / resource pools / instances / tenants.
- No shared pools; shared = global failure.
- Isolation dimensions: service / interface / tenant / downstream.
- Isolation + rate limiting + circuit breaker form a triad.
- Isolation observability: each pool has independent metrics.
- Isolation contingency is set up upfront; pools must be split before release.
- No sharing = no cascading.

## Applicable scenarios

Multiple services / multiple tenants / multiple downstreams / critical-business protection / failure isolation / resource isolation / any scenario where "one failure should not cascade globally"; microservices / multi-tenant SaaS / cross-team services.

## Core points

### 1. Bulkhead principle

Borrowed from ship bulkheads; one compartment flooding does not sink the whole ship.

- Each compartment is independent.
- One compartment failing does not cascade.
- The failure blast radius is bounded.
- No shared pools.
- No global failure.

### 2. Layered isolation

Not single-layer; layered isolation.

```
thread pool → connection pool → resource pool → instance → tenant
```

- **Thread pool**: each function has an independent thread pool.
- **Connection pool**: each downstream has an independent connection pool.
- **Resource pool**: each function has an independent quota.
- **Instance**: each service has an independent deployment.
- **Tenant**: each tenant has independent resources.

### 3. No shared pools

Shared = global failure; do not share.

- Shared thread pool: one slow path makes everything slow.
- Shared connection pool: one downstream hanging hangs everything.
- Shared resource pool: one consumer exhausting it exhausts all.
- Must split pools.

### 4. Isolation dimensions

Isolate independently by dimension; do not mix.

- **Service dimension**: each service has independent resources.
- **Interface dimension**: critical interfaces have independent thread pools.
- **Tenant dimension**: each tenant has an independent quota.
- **Downstream dimension**: each downstream has an independent connection pool.
- **Priority dimension**: paid / free use separate pools.

### 5. Isolation + rate limiting + circuit breaker

The triad is linked; not isolated.

- **Isolation**: failure does not cascade.
- **Rate limiting**: bursts do not overwhelm.
- **Circuit breaker**: fail fast on failure.
- All three are linked; do not favor one over the others.

### 6. Thread pool isolation

Critical interfaces have independent thread pools; not shared.

- Critical interfaces get independent thread pools.
- Non-critical interfaces share a pool.
- One slow interface does not impact others.
- When a pool is full, degrade; do not pile up.
- No unbounded queues.

### 7. Connection pool isolation

Each downstream has an independent connection pool; not shared.

- Each downstream has an independent connection pool.
- One downstream hanging does not impact others.
- Connection count quotas.
- Connection timeout + acquire timeout.
- Do not share the DB connection pool.

### 8. Resource quota isolation

Each function / tenant has an independent quota; not shared.

- CPU / memory quotas.
- Connection count quotas.
- Request rate quotas.
- Queue length quotas.
- One function exhausting its quota does not impact others.

### 9. Instance isolation

Each service has an independent deployment; do not mix deployments.

- Microservices have independent deployments.
- Critical services have independent instances.
- Do not mix deployments.
- One service failing does not cascade.
- Can scale independently.

### 10. Tenant isolation

Multiple tenants have independent resources; not shared.

- Shared schema + tenant_id: low starting cost, weak isolation.
- Shared database per tenant: mid-tier.
- Dedicated per tenant: high-end, strong isolation.
- Per-tenant failure isolation blast radius.
- Per-tenant resource quotas.

### 11. Isolation observability

Each pool has independent metrics; do not mix.

- Each pool has independent monitoring.
- Pool utilization / rejection rate / wait time.
- Pool-full alerts.
- Isolation-triggered alerts.
- No global-only metrics.

### 12. Isolation contingency set up upfront

Split before release; do not remediate after the fact.

- Split pools at design time.
- Each function must tag its isolation strategy.
- Capacity planning per pool.
- Do not split later.

## Anti-patterns

- **Shared thread pool**: all interfaces share one thread pool → one slow path makes everything slow → must split pools.
- **Shared connection pool**: all downstreams share one connection pool → one hanging hangs all → must split pools.
- **No quotas**: no quotas → one function exhausts everything → must add quotas.
- **Mixed deployments**: multiple services share a deployment → one failure cascades → must have independent deployments.
- **No tenant isolation**: no tenant isolation → one tenant failure impacts many → must do tenant isolation.
- **No monitoring**: no per-pool monitoring → cannot tell which pool is full → must have per-pool metrics.
- **Unbounded queues**: unbounded queues → one interface piles up → must be bounded.
- **No contingency**: splitting later → scrambling → must be set up upfront.

## Co-build

- Journeys: [scale-a-service](../engineering/scale-a-service.md) + [respond-to-an-incident](../../oncall-sre/incident-response/respond-to-an-incident.md) + [handle-multi-tenancy](handle-multi-tenancy.md) + [set-up-observability](../../oncall-sre/observability/set-up-observability.md) + [decompose-a-monolith](decompose-a-monolith.md) + [define-an-slo](../../tech-lead/roadmap/define-an-slo.md)
- Implementation win: [yiai-llm-phase-five-win](../lessons/win-yiai-llm-phase-five.md) + [yipet-aicr-phase-one-win](../lessons/win-yipet-aicr-phase-one.md)
- Companion patterns: [circuit-breaker-pattern](./circuit-breaker.md) + [rate-limiting-pattern](../engineering/rate-limiting.md) + [graceful-degradation-pattern](./graceful-degradation.md) + [observability-pattern](../engineering/observability.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md) + [dual-world-boundary-pattern](../engineering/dual-world-boundary.md)
