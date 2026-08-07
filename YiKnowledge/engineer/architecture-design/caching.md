---
title: Multi-tier Caching Pattern
aliases: [caching-pattern, multi-tier-caching, cache-aside-write-through]
tags: [pattern, engineering patterns, cache, performance, multi-tier cache]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Multi-tier caching reduces latency and database load through layered in-process, distributed, and edge caches"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./graceful-degradation.md
  - ./bulkhead.md
  - ./cqrs.md
  - ./api-gateway.md
  - ../../oncall-sre/incident-response/handle-a-cache-invalidation.md
---

# Multi-tier Caching Pattern

> **As an** engineer, **I want to** caching, **so that** pattern applied consistently. 

## Summary

Multi-tier caching is a performance contract; not just Redis. L1 in-process + L2 distributed + L3 edge + L4 database layer; each tier has a responsibility; works with degradation + bulkhead + observability; LLM scenarios use KV-cache + semantic cache + prompt cache. 

## Problem

Pain points without caching: 
- The same query repeatedly hits the DB / LLM, latency P99 spikes
- High QPS saturates the DB, downstream cascades
- LLM calls 5s+ are unacceptable
- Repeated tokens waste cost
- Single-point Redis failure → full DB penetration
- Cache stampede (hot key expiry) → avalanche
- Cache penetration (non-existent key) → database attacked
- Cache and DB inconsistent → dirty data
- No cache observation → no idea of hit rate / invalidation cause

## Pattern

### Multi-tier layering

```
Request → L1 in-process (LruCache) → L2 distributed (Redis) → L3 edge (CDN) → L4 DB / LLM
```

- **L1 in-process**: single-instance memory, sub-millisecond; short TTL; suited to hot spots + immutable data
- **L2 distributed**: Redis Cluster; shared across instances; medium TTL; main cache tier
- **L3 edge CDN**: geographic proximity; static + semi-static; long TTL
- **L4 database / model layer**: materialized view / KV-cache / semantic cache

### Key code

```python
class TieredCache:
    def __init__(self, l1: LRUCache, l2: RedisCluster, l3: CDNClient):
        self.l1, self.l2, self.l3 = l1, l2, l3

    async def get(self, key: str, loader: Callable):
        # L1
        if (v := self.l1.get(key)) is not None:
            return v
        # L2
        if (v := await self.l2.get(key)) is not None:
            self.l1.set(key, v, ttl=60)
            return v
        # L3 (edge)
        if (v := await self.l3.get(key)) is not None:
            self.l2.set(key, v, ttl=300)
            return v
        # L4 loader + mutex to prevent penetration
        v = await self._load_with_lock(key, loader)
        self.l1.set(key, v, ttl=60)
        await self.l2.set(key, v, ttl=300)
        return v

    async def _load_with_lock(self, key, loader):
        lock = self.l2.lock(f"lock:{key}", timeout=10)
        if not await lock.acquire(blocking=False):
            # Prevent stampede: wait for the result if the lock is not acquired
            await asyncio.sleep(0.05)
            if (v := await self.l2.get(key)) is not None:
                return v
        try:
            return await loader()
        finally:
            await lock.release()
```

### Invalidation strategy

- **TTL**: mandatory fallback; expires automatically
- **Active invalidation**: delete after write cache-aside (write DB first → then delete cache → delayed double delete) 
- **Broadcast invalidation**: sync multi-instance L1, Redis Pub/Sub notifies L1 deletes
- **Preload**: warm up during off-peak to avoid cold start
- **TTL jitter**: ±10% jitter to avoid collective expiry avalanche

### Consistency tiers

- Weak consistency: pure TTL (edge CDN) 
- Eventual consistency: cache-aside + active invalidation (most business) 
- Strong consistency: write-through cache + synchronous dual-write (key config / counters) 

## Applicable

- Read-heavy write-light (user config / meta-data / dictionary) 
- Expensive compute (LLM inference / complex aggregation / vector top-k retrieval) 
- Cross-region low latency (CDN edge) 
- QPS inflection point (DB near saturation) 
- Repeated prompts (semantic cache hits) 

## Not applicable

- Write-heavy read-light (cache is net negative) 
- Strong consistency + frequent updates (cache frequently invalidated) 
- Real-time data (order book / monitoring metrics / billing) 
- Single key with huge data (cache cost > benefit) 
- Key reads that cannot tolerate stale (go directly to DB) 

## Landing checklist

1. Pass 1: inventory top-10 hot queries + hit-rate baseline
2. Pass 2: L2 Redis Cluster + Sentinel
3. Pass 3: L1 in-process LRU + invalidation broadcast (Redis Pub/Sub) 
4. Pass 4: mutex lock to prevent stampede + empty object / Bloom filter to prevent penetration
5. Pass 5: TTL jitter + active invalidation double delete + delayed double delete
6. Pass 6: edge CDN static assets + HTML SSR cache
7. Pass 7: LLM semantic cache (hit when similarity ≥ 0.95) 
8. Pass 8: cache observability dashboard (hit rate / latency / failure / large key) 



- **Unbounded cache**: no TTL → dirty data persists forever
- **No stampede protection**: hot key expiry → everything hits the DB
- **No penetration protection**: non-existent keys queried repeatedly → add empty-object cache or Bloom filter
- **No delete after write**: cache-aside not invalidated → dirty data
- **L1 not broadcasted**: multi-instance L1 inconsistent
- **Strong consistency forced**: write-through + dual-write → poor performance
- **Cache large key**: single value > 1MB → network blockage
- **No cache observation**: hit rate unknown → cannot optimize
- **No warm-up at cold start**: off-peak not preloaded → peak stampede
- **LLM without semantic cache**: similar prompts repeatedly call LLM → wasted cost

## Related

- landing cases: YiAi RAG retrieval result cache + LLM semantic cache
- Upstream gotcha: cache stampede / cache penetration / cache avalanche
- Downstream ADR: cache selection ADR (Redis vs Memcached) 
- related pattern: [graceful-degradation-pattern](./graceful-degradation.md) cache fallback / [bulkhead-pattern](./bulkhead.md) cache isolated pool / [observability-pattern](../engineering/observability.md) hit-rate metrics / [cqrs-pattern](./cqrs.md) read-model cache
