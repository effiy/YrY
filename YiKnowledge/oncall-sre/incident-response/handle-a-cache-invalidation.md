---
title: Handle cache invalidation
aliases: [i-want-to-handle-a-cache-invalidation, cache-invalidation, cache-eviction]
tags: [journey, methodology, cache, invalidation, consistency, performance]
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [oncall-sre, engineer]
benefit: "Cache invalidation is handled systematically, preventing stale data from causing incorrect behavior"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
  - ../../engineer/engineering/scale-a-service.md
  - ../../engineer/quality-security/do-a-performance-audit.md
  - ../../engineer/infrastructure/migrate-a-database.md
  - ../observability/set-up-observability.md
  - ./respond-to-an-incident.md
  - ../../engineer/architecture-design/implement-an-api.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
  - ../../knowledge-curator/templates/thinking--inversion.md
tacit: Cache invalidation is one of the two hard problems in computer science; write-through / write-back / invalidation-broadcast three tiers; TTL as a fallback; data consistency is the bottom line
---

# I want to handle cache invalidation

> **As a** oncall sre, **I want to** handle a cache invalidation, **so that** incident is contained. 

## Summary

- Invalidation three tiers: cache-aside write-through / write-through / invalidation broadcast
- TTL fallback: must set; not infinite
- Consistency: weak / eventual / strong; choose per business
- Cache breakdown: mutex lock; non-expiring + async rebuild
- Cache avalanche: jitter TTL; avoid simultaneous expiration
- Cache penetration: empty object / Bloom filter
- Invalidation broadcast: multi-instance sync; message queue
- Do not cache unstable sources

## Scenario

Cache invalidation is one of the two hard problems in computer science (naming + cache invalidation); if not handled, data goes stale. This entry provides the full path of cache invalidation, covering three tiers of invalidation, TTL fallback, consistency choice, cache breakdown/avalanche/penetration, invalidation broadcast, not caching unstable sources, and links to scale-a-service / do-a-performance-audit / migrate-a-database / set-up-observability / respond-to-an-incident / implement-an-api and other leaves. 

## 2-hop reachability paths

| Hop | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Service scaling | [../../engineer/engineering/scale-a-service.md](../../engineer/engineering/scale-a-service.md) |
| 2 hop | Performance audit | [../../engineer/quality-security/do-a-performance-audit.md](../../engineer/quality-security/do-a-performance-audit.md) |
| 2 hop | Database migration | [../../engineer/infrastructure/migrate-a-database.md](../../engineer/infrastructure/migrate-a-database.md) |
| 2 hop | Observability | [../observability/set-up-observability.md](../observability/set-up-observability.md) |
| 2 hop | Incident response | [./respond-to-an-incident.md](./respond-to-an-incident.md) |
| 2 hop | Implement an API | [../../engineer/architecture-design/implement-an-api.md](../../engineer/architecture-design/implement-an-api.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hop | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |

## Action recommendations

1. **Invalidation three tiers**: cache-aside read cache miss query DB write-back / write-through dual-write on write / invalidation broadcast multi-instance sync; choose per scenario
2. **TTL fallback**: must set; not infinite; per data freshness
3. **Consistency choice**: weak (cache may be stale) / eventual (invalidate after write) / strong (dual-write + lock); per business
4. **Cache breakdown**: hot key expires and hits DB instantly; mutex lock; non-expiring + async rebuild
5. **Cache avalanche**: many keys expire simultaneously; jitter TTL; avoid simultaneous expiration
6. **Cache penetration**: querying non-existent keys repeatedly hits DB; cache empty object / Bloom filter
7. **Invalidation broadcast**: multi-instance cache; message queue / Redis pub-sub for sync invalidation
8. **Write-through invalidation**: write DB -> delete cache; do not delete cache before writing DB
9. **Double-delete with delay**: write DB -> delete cache -> delayed double-delete; prevents stale value read-backfill
10. **Do not cache unstable sources**: frequently changing data not cached; or short TTL
11. **Warm-up**: warm up hot keys before launch; do not cold-start hitting DB
12. **Degradation**: cache all-down goes to DB with rate limiting; no avalanche
13. **Observability**: hit rate / failure rate / invalidation rate / long tail
14. **First principles**: why must cache; worst consequence of not caching
15. **Inversion thinking**: how much can be solved with direct DB query + rate limiting; if solvable, do not introduce cache
16. **Second-order thinking**: second-order consequence after caching (consistency / maintenance / avalanche / breakdown) 
17. **Occam**: cache solution, simpler is better; cut redundant layers

## Related

- Service scaling: [../../engineer/engineering/scale-a-service.md](../../engineer/engineering/scale-a-service.md) — cache before scaling
- Performance audit: [../../engineer/quality-security/do-a-performance-audit.md](../../engineer/quality-security/do-a-performance-audit.md) — cache bottleneck locating
- Database migration: [../../engineer/infrastructure/migrate-a-database.md](../../engineer/infrastructure/migrate-a-database.md) — cache alignment during migration
- Observability: [../observability/set-up-observability.md](../observability/set-up-observability.md) — hit rate monitoring
- Incident response: [./respond-to-an-incident.md](./respond-to-an-incident.md) — avalanche/breakdown emergency
- Implement an API: [../../engineer/architecture-design/implement-an-api.md](../../engineer/architecture-design/implement-an-api.md) — API cache strategy
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md)
