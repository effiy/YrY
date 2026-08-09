---
title: API Gateway pattern
aliases:
- api-gateway-pattern
- api-gateway
- gateway-pattern
- backend-for-frontend
tags:
- methodology
- engineering-patterns
- api-gateway
- bff
- gateway
- routing
- cross-cutting-concerns
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
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
- ./circuit-breaker.md
- ./observability.md
- ./distributed-tracing.md
- ./graceful-degradation.md
- ./bulkhead.md
- ../../ai-engineer/foundations/prepare-an-llm-observability-strategy.md
- ../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md
tacit: A gateway is not just a reverse proxy; it is a contract. Routing + auth + rate limiting + circuit breaking + observability + protocol conversion; single entry; composable
---

# API Gateway pattern

> **As an** engineer, **I want to** api gateway, **so that** pattern applied consistently.

## Core viewpoints

**The gateway is a centralized failure domain, not a silver bullet.** Every request flows through the gateway, which means a gateway outage is a total system outage. The gateway must be deployed with the same rigor as the most critical service: multi-instance, auto-scaling, health-checked, and chaos-tested. A gateway that is not itself highly available becomes the single point of failure it was supposed to eliminate.

**Gateway routing config is infrastructure code and must be version-controlled.** Routing rules, rate-limit policies, and circuit-breaker thresholds that are configured via a UI and not stored in git are unreviewable, unrollbackable, and untestable. Every config change must go through the same CI/CD pipeline as application code: PR review, diff preview, staged rollout, and automated rollback on alert. Config-as-code is not optional for the gateway.

**A gateway without hot reload is a deployment bottleneck.** If a routing change requires a gateway restart, teams will batch changes, delay critical fixes, and route around the gateway entirely. Hot reload enables the gateway to be a transparent layer that teams can configure independently without coordination. The absence of hot reload turns the gateway from an enabler into a gatekeeper.

**The gateway should be dumb; intelligence belongs in backend services and BFFs.** Business logic in the gateway -- transformation rules, aggregation logic, conditional routing based on payload content -- creates a layer that is hard to test, hard to version, and owned by no specific team. The gateway should do authentication, rate limiting, routing, and protocol conversion. Everything else belongs in backend services or dedicated BFF layers.

**Multi-provider routing is table stakes for LLM applications.** When the gateway fronts LLM providers, it must support model-based routing, cost-based routing, latency-based routing, and automatic failover. Hard-coding a single provider in the gateway is architecturally equivalent to hard-coding a single database -- it creates a vendor lock-in that will be expensive to unwind. The gateway is the natural enforcement point for provider abstraction.

## Problem

In a microservices architecture, clients should not directly connect to backend services — if cross-service auth / rate limiting / routing / protocol conversion / observability logic is scattered across services, it is duplicated and hard to govern; a single entry is needed to centralize cross-cutting concerns, letting backend services focus on business.

## Pattern

- **Routing**: route to backends by path / host / header; no business logic mixed in
- **Auth / authorization**: unified auth + token validation + user context injection; not duplicated in backends
- **Rate limiting**: per-client / per-service rate limiting; no direct backend access
- **Circuit breaking**: circuit break on backend failure; no cascading
- **Protocol conversion**: HTTP / gRPC / WebSocket / SSE interconversion; not bound to one
- **Observability**: trace context injection + metrics + logs; not duplicated in backends
- **Response transformation**: aggregation + trimming + renaming; customized per client
- **Caching**: gateway-layer caching; reduces backend pressure
- **BFF variant**: one gateway per client (web / mobile / third-party); not mixed
- **Config SSOT**: routing + rate limiting + circuit breaker strategy as SSOT; not scattered
- **Hot config reload**: no restart; no interruption

## Applicable

- Multi-client (web / mobile / third-party) backends
- LLM multi-provider routing (routing layer)
- Multi-protocol backends (HTTP + gRPC + WebSocket)
- Multi-tenant rate limiting + auth

## Not applicable

- Monolithic apps (direct connection is enough)
- Internal service-to-service calls (sidecar / service mesh is more appropriate)
- Simple CRUD APIs (no cross-cutting needs)

## Landing checklist

- [ ] Routing config SSOT: path / host / header rules centralized; not scattered
- [ ] Unified auth: JWT / OAuth2 / API key validated at gateway layer; not duplicated in backends
- [ ] User context injection: X-User-Id / X-Tenant-Id header injection; not parsed in backends
- [ ] Rate limiting: per-client + per-service independent; not mixed
- [ ] Circuit breaking: each backend independent circuit break + fallback; no cascading
- [ ] Protocol conversion: HTTP ↔ gRPC ↔ WebSocket ↔ SSE; as needed
- [ ] Observability: trace context injection + access log + metrics; not duplicated in backends
- [ ] Response transformation: aggregation + trimming + renaming; customized per client
- [ ] Caching: gateway-layer cache for GET responses; TTL + ETag + invalidation
- [ ] BFF layering: web / mobile / third-party each its own gateway; not mixed
- [ ] Hot config reload: no restart; no interruption
- [ ] Multi-provider routing: primary + backup + failover; not directly bound
- [ ] LLM routing: switch by model / cost / latency / availability; not hard-bound
- [ ] Link with rate limiting: gateway is the rate-limit enforcement point
- [ ] Link with circuit breaking: gateway is the circuit-break enforcement point
- [ ] Link with observability: trace context injection entry
- [ ] Link with bulkhead: each backend independent connection pool; not shared
- [ ] Link with graceful degradation: backend failure degrades to fallback response
- [ ] Health check: active health check + passive failure detection; not manual
- [ ] Gray / canary: traffic split by header / cookie; not all at once
- [ ] Security: WAF + injection protection + size limits; not naked
- [ ] Toolchain: Kong / APISIX / Envoy / Nginx / self-built; chosen per team
- [ ] Versioned config: git-managed; rollbackable
- [ ] Drills: chaos + game day to validate routing + failover + degradation

## Anti-patterns

- Gateway writing business logic — violates single responsibility
- Backends duplicating auth — gateway fails, backends naked
- Routing config scattered across services — config SSOT broken
- Not injecting trace context — end-to-end tracing broken
- Multi-provider hard-bound without failover — primary fails, all dead
- No rate limiting, direct backend access — backend overwhelmed
- No circuit breaking on backend failure cascading — site-wide failure
- BFF mixed in one gateway — client customization fails
- No hot config reload — routing change requires restart
- Config not versioned — cannot rollback on issues
- No health check — dead instances still routed to
- No gray release — full rollout is risky
- No security — missing WAF leads to injection
- LLM without multi-provider routing — primary provider failure kills all
- No drills, relying on real failures — only real failures reveal whether routing switches
