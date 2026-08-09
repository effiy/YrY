---
title: BFF Pattern / Backend for Frontend Pattern
aliases: [bff-pattern, backend-for-frontend-pattern, bff]
tags: [pattern, engineering patterns, BFF, frontend, gateway]
category: engineer/architecture-design
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
benefit: "Each frontend gets a tailored backend that aggregates and transforms data, reducing client complexity and over-fetching"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
- ./api-gateway.md
  - ./anti-corruption-layer.md
  - ./aggregator.md
  - ./ssot-view-layer.md
  - ./circuit-breaker.md
  - ../architecture-design/implement-an-api.md
---

# BFF Pattern / Backend for Frontend Pattern

> **As an** engineer, **I want to** bff, **so that** pattern applied consistently.

## Summary

A separate backend per client; trim + aggregate + translate; do not share a generic API; interplay with api-gateway / anti-corruption-layer / dual-world; suitable for multi-client + cross-team + personalization needs; not suitable for single client / simple backend.

## Core viewpoints

**The BFF is a team-boundary enabler, not a performance optimization.** The primary value of a BFF is that it gives the frontend team ownership of their own backend adapter. The frontend team can iterate on the API shape, add fields, remove fields, and change aggregation logic without negotiating with backend teams. This organizational decoupling is worth more than any latency reduction from reduced round-trips.

**A BFF that contains business logic is a distributed monolith in disguise.** The moment a BFF implements business rules -- calculating discounts, validating order eligibility, applying pricing logic -- it duplicates backend logic and creates a consistency risk. The BFF should be a pure adapter: transform, aggregate, trim, translate. Business logic lives in downstream services. The test for this is: if you delete the BFF and rewrite it from scratch, does any business behavior change? If yes, the BFF has too much logic.

**BFF + API Gateway is a layered architecture, not a competing choice.** The API gateway handles cross-cutting concerns (auth, rate limiting, routing, TLS termination) that apply to all clients. The BFF handles client-specific concerns (field trimming, aggregation, protocol translation) that differ per client. Trying to make the API gateway do BFF work creates a bloated gateway; trying to make each BFF handle auth and rate limiting creates duplicated security logic. Each layer has a distinct responsibility.

**One BFF per client is non-negotiable at scale.** Sharing a single BFF across mobile, web, and third-party clients creates the same lowest-common-denominator problem that BFF was designed to solve. Each client has different latency budgets, payload size constraints, and data shape requirements. The overhead of maintaining separate BFFs is justified by the velocity gain: each client team can move at its own speed without blocking others.

**BFF caching is a footgun if done without per-user dimensioning.** Caching aggregated responses by URL alone means that user A's personalized data is served to user B. BFF cache keys must include user context (user_id, tenant_id, session scope), and cache invalidation must be precise enough to avoid serving stale personalized data. A badly configured BFF cache is a data-leak incident waiting to happen.

## Problem

- **Trim pressure on generic APIs**: mobile + web + desktop share one API; mobile wants lightweight / web wants rich / desktop wants full-featured; everyone compromises; the frontend trims itself; payload wasted.
- **Multiple round-trips for aggregation**: frontend pulls 5 APIs to assemble; N round-trips + N x latency + client complexity; bad network + mobile weak network is fatal.
- **Cross-team boundary breach**: frontend team modifies backend API; backend team reluctant to change; block + high coordination cost.
- **Protocol mismatch**: backend gRPC + frontend REST; backend Thrift + frontend JSON; translation scattered in the frontend.
- **Limited personalization**: A/B + personalization + canary done in backend; conflicts with multi-client; slow to release.
- **Scattered observability**: cross-end trace hard to follow; frontend + gateway + backend link broken.

## Pattern

**Core**: A separate BFF per client; trim + aggregate + translate + personalize; BFF contains no business rules; only an adapter layer; communicates with downstream services via RPC / event.

**Three forms**:
- **Trim BFF**: Select fields from a generic API and return; no aggregation; lightweight; suitable for scenarios with large field differences.
- **Aggregate BFF**: Call multiple downstream services and merge; N->1 request; reduces round-trips; suitable for rich clients.
- **Translate BFF**: Protocol conversion + field renaming + data shape adjustment; decouples frontend/backend contract.

**Key code**:

```python
class BFF:
    """Per-client independent BFF; trim + aggregate + translate."""
    def __init__(self, downstream_services, translator):
        self.services = downstream_services  # user_svc, order_svc, product_svc
        self.translator = translator

    @cached(ttl=30)  # cache aggregated results
    async def mobile_home(self, user_id):
        # aggregate multiple services + trim fields + mobile-specific
        user, orders, recommends = await asyncio.gather(
            self.services.user.get(user_id),
            self.services.order.recent(user_id, limit=3),
            self.services.product.recommend(user_id, limit=5),
            return_exceptions=True,
        )
        # any failure degrades + does not block the whole page
        return self.translator.to_mobile_home(user, orders, recommends)

    async def web_detail(self, product_id):
        # web rich display + all fields
        product = await self.services.product.get(product_id)
        reviews = await self.services.review.list(product_id)
        related = await self.services.product.related(product_id)
        return self.translator.to_web_detail(product, reviews, related)


class BFFTranslator:
    """Frontend contract translation; no business rules."""
    def to_mobile_home(self, user, orders, recommends):
        return {
            "user_name": user["name"] if user else None,  # trim + rename
            "recent_orders": [
                {"id": o["id"], "status": o["status"]} for o in (orders or [])
            ][:3],  # trim fields
            "recommends": [
                {"id": r["id"], "title": r["title"], "price": r["price"]}
                for r in (recommends or [])
            ][:5],
        }
```

## Applicable

- Multiple clients (mobile + web + desktop + smart speaker)
- Rich frontend + multi-service aggregation (dashboard / large boards)
- Cross-team boundary (frontend team owns BFF; backend team owns services)
- Protocol mismatch (backend gRPC + frontend REST)
- Personalization + A/B + canary (BFF does stream switching)
- Weak network + mobile scenarios (trim + aggregate reduces latency)
- Multi-device adaptation (mobile lightweight / web rich / desktop full)

## Not applicable

- Single client (generic API suffices; BFF is over-design)
- Simple backend (CRUD + single service; BFF is redundant)
- Strong-consistency transactions (BFF does not do transactions; use saga)
- Concentrated business rules (BFF contains no business rules; use backend services)
- Real-time bidirectional communication (use WebSocket / SSE; BFF synchronous aggregation not suitable)
- Extremely low latency (BFF adds +1 hop; use direct)

## Landing checklist

1. **Identify clients**: mobile / web / desktop / smart speaker / third-party; list differentiated needs.
2. **Independent BFF per client**: do not share; frontend team owns; tech stack frontend-friendly (Node / TS).
3. **Trim strategy**: trim fields per client needs; do not return full payload; minimize payload.
4. **Aggregate strategy**: parallel call multiple services + asyncio.gather / Promise.all + failure degrade + do not block whole page.
5. **Translate strategy**: protocol conversion + field renaming + data shape adjustment; no business rules.
6. **Cache strategy**: cache aggregated results 30s-5min; by user / session dimension; cache stampede mutex.
7. **Degrade strategy**: any downstream failure + return partial + do not block whole page + fallback response.
8. **Circuit-break + rate-limit**: independent circuit-break + rate-limit per downstream; downstream failure does not block BFF.
9. **trace_id propagation**: BFF entry generates trace_id; downstream calls must pass; distributed tracing throughout.
10. **Contract test**: BFF <-> frontend contract baseline; BFF <-> downstream service contract; CI diff blocks.
11. **Feature-flag**: A/B + personalization + canary switched in BFF; does not impact downstream services.
12. **Observability**: BFF-dimension latency + error rate + cache hit rate + downstream call latency; by client dimension.
13. **Independent deploy**: BFF deploys independently of downstream services; BFF scales independently; no mutual impact.
14. **Schema evolution**: BFF schema versioned independently; decoupled from downstream service contract; upcaster.



- **Shared generic API**: frontend trims + aggregates itself; payload waste + N round-trips; fix: BFF trim + aggregate.
- **BFF contains business rules**: BFF implements business logic; duplicates downstream; fix: BFF only adapts; business rules go downstream.
- **Single BFF for all clients**: mobile + web + desktop share BFF; mutual compromise; fix: independent BFF per client.
- **BFF directly hits DB**: BFF queries DB directly; bypasses downstream services; couples schema; fix: BFF calls downstream services via RPC.
- **No degradation**: downstream failure returns 500 for whole page; fix: failure degrades + return partial + fallback.
- **No circuit-break**: downstream failure avalanches BFF; fix: independent circuit-break + rate-limit per downstream.
- **Trace not propagated**: cross-end link broken; fix: BFF entry generates trace_id; downstream must propagate.
- **BFF cache avalanche**: all users share one key; simultaneous expiry overloads downstream; fix: per-user dimension + jitter TTL + mutex lock.
- **BFF deploy coupling**: BFF deploys with downstream services; mutual impact; fix: BFF independent deploy.
- **Schema strong coupling**: BFF schema maps one-to-one to downstream fields; downstream change breaks BFF; fix: BFF schema versioned independently + upcaster.
- **Not interplaying with api-gateway**: BFF acts as api-gateway; duplicates routing + auth + rate-limit; fix: api-gateway entry + BFF adapter layer.
- **BFF as saga**: BFF does cross-service transactions; breaks transaction boundary; fix: BFF does no transactions; use saga.

## Related

- [api-gateway-pattern](./api-gateway.md) — api-gateway entry + BFF adapter
- [anti-corruption-layer-pattern](./anti-corruption-layer.md) — BFF as frontend ACL
- [dual-world-boundary-pattern](../engineering/dual-world-boundary.md) — frontend/backend boundary
- [ssot-view-layer-pattern](./ssot-view-layer.md) — frontend view layer SSOT
- [circuit-breaker-pattern](./circuit-breaker.md) — independent circuit-break per downstream
- [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md) — BFF bidirectional contract
- [observability-pattern](../engineering/observability.md) — BFF-dimension observability
- [distributed-tracing-pattern](../engineering/distributed-tracing.md) — trace_id propagation
- [graceful-degradation-pattern](./graceful-degradation.md) — failure degrade
- [bulkhead-pattern](./bulkhead.md) — BFF and downstream isolation
- landing cases: pending landing YiVad aicr BFF + YiPet frontend BFF
- upstream: [../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-a-frontend-architecture-strategy.md)
- upstream: [../strategies/implement-an-api.md](implement-an-api.md)
- downstream: [../lessons/gotchas/README.md](../lessons/README.md)
