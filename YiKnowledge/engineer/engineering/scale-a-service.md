---
title: Scale a service
aliases: [i-want-to-scale-a-service, scale-a-service, horizontal-scaling]
tags: [journey, methodology, scaling, performance, sharding, caching]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers plan and execute service scaling to handle growth without degradation or cost overrun"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../quality-security/do-a-performance-audit.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../tech-lead/roadmap/plan-tech-roadmap.md
  - ../infrastructure/migrate-a-database.md
  - ./reduce-cost.md
  - ../architecture-design/decompose-a-monolith.md
  - ../../tech-lead/roadmap/do-a-tech-selection.md
  - ../../engineer/engineering/evaluation-driven-development.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
  - ../../knowledge-curator/templates/thinking--inversion.md
tacit: Scaling is the last resort; first profile to find bottleneck; first single-machine optimization; first cache / async / read replica; last horizontal scaling
---

# I want to scale a service

> **As an** engineer, **I want to** scale a service, **so that** outcome is traceable. 

## Summary

- Scaling five-step ladder: profile → single-machine optimization → cache → async / queue → horizontal scaling
- Profile must do: metric / trace / profile triad; not profile blind scaling is waste
- Single-machine optimization before scaling: algorithm / index / N+1 / internal leaks; don't scale before single machine squeezed dry
- Cache priority: local cache → distributed cache → CDN; cache hit rate > 80% to be effective
- Async / queue: write async; peak shaving valley filling; does not block main path
- Horizontal scaling last: only stateless services can scale horizontally; stateful ones first split state
- Database scaling: read replica → sharding; wrong shard key causes incident

## Scenario description

Service can't hold traffic, latency rises, error rate trends up; scaling is common response but often abused. This entry gives the five-step ladder path from profile to horizontal scaling, covering performance audit, single-machine optimization, cache strategy, async queue, horizontal scaling, database scaling, and links to performance-audit / observability / plan-tech-roadmap / migrate-a-database / reduce-cost and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | performance audit | [../processes/do-a-performance-audit.md](../quality-security/do-a-performance-audit.md) |
| 2 hop | observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hop | roadmap | [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) |
| 2 hop | database migration | [../processes/migrate-a-database.md](../infrastructure/migrate-a-database.md) |
| 2 hop | cost reduction | [./reduce-cost.md](./reduce-cost.md) |
| 2 hop | decompose monolith | [../strategies/decompose-a-monolith.md](../architecture-design/decompose-a-monolith.md) |
| 2 hop | tech-selection | [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) |
| 2 hop | CI/CD | [./set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md) |
| 2 hop | evaluation-driven | [../../engineer/engineering/evaluation-driven-development.md](../engineering/evaluation-driven-development.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hop | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |

## Action recommendations

1. **Profile must do**: metric / trace / profile triad; not profile blind scaling is waste
2. **Single-machine optimization before scaling**: algorithm / index / N+1 / internal leaks; don't scale before single machine squeezed dry
3. **Cache priority**: local cache → distributed cache → CDN; cache hit rate > 80% to be effective
4. **Async / queue**: write async; peak shaving valley filling; does not block main path
5. **Horizontal scaling last**: only stateless services can scale horizontally; stateful ones first split state
6. **Database scaling**: read replica → sharding; wrong shard key causes incident
7. **Read replica before sharding**: read replica is simple; sharding is complex; shard when read replica can't hold
8. **Pick the right shard key**: high-frequency query field; even distribution; avoid hotspots
9. **Rate limiting + circuit breaker**: deploy limit + circuit breaker before scaling; prevent avalanche
10. **Warm-up + fallback**: new instance warm-up; fallback degradation; can degrade during scaling
11. **Eval set gate**: run eval set after scaling; don't let it through without blocking
12. **Monitoring triad**: latency + error rate + resource; observe per stage after scaling
13. **First principles**: why must scale; worst consequence of not scaling; scaling cost ÷ benefit
14. **Second-order thinking**: second-order consequence after scaling (cost / complexity / maintenance) ; don't just look at short-term output
15. **Inversion**: if not scaling how much can be optimized; if can optimize don't scale
16. **Occam's razor**: scaling solution simpler is better; redundant actions cut

## Related

- performance audit: [../processes/do-a-performance-audit.md](../quality-security/do-a-performance-audit.md) — profile precondition
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — Monitoring triad
- roadmap: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — capacity planning
- database migration: [../processes/migrate-a-database.md](../infrastructure/migrate-a-database.md) — sharding
- cost reduction: [./reduce-cost.md](./reduce-cost.md) — scaling cost alignment
- decompose monolith: [../strategies/decompose-a-monolith.md](../architecture-design/decompose-a-monolith.md) — split state
- tech-selection: [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) — selection
- CI/CD: [./set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md) — scaling gate
- Pattern: [eval-driven](../engineering/evaluation-driven-development.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md)
