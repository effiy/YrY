---
title: Strangler Fig Pattern
aliases: [strangler-fig-pattern, strangler-pattern, incremental-migration]
tags: [pattern, engineering patterns, migration, monolith-decomposition, incremental]
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
benefit: "Legacy systems are incrementally replaced without a big-bang rewrite, reducing risk and enabling continuous delivery"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - at least one concrete example or code snippet is provided
related:
- ./one-to-one-mapping-migration.md
  - ./staged-port-methodology.md
  - ./saga.md
  - ./cqrs.md
  - ../architecture-design/decompose-a-monolith.md
  - ../infrastructure/roll-out-a-migration.md
---

# Strangler Fig Pattern

> **As an** engineer, **I want to** strangler fig, **so that** pattern applied consistently.

## Summary

Strangler fig is a migration contract; not one-shot rewrite. New features go to the new system + old system gradually route-by-route traffic switched + old code gradually strangled to zero; linked with feature flag + contract test + dual-write + monitoring; LLM scenarios old rule engine → new LLM agent gradual replacement.

## Core viewpoints

**The strangler fig is a risk-management pattern, not a speed pattern.** Big-bang rewrites are faster on paper because they skip the facade layer, dual-write, and gradual rollout. But they are faster only if nothing goes wrong. The strangler fig is slower upfront but eliminates the catastrophic failure mode where the new system fails on launch day with no rollback path. The premium you pay in extra engineering time buys you the ability to sleep the night before launch.

**The facade layer is the most important code you will write in the migration.** The routing layer that decides whether a request goes to the old or new system is the single point of control for the entire migration. It must be: fast (sub-millisecond overhead), correct (no routing bugs), observable (per-route traffic percentages), and feature-flagged (instant rollback). Invest disproportionately in testing and monitoring the facade.

**Shadow mode is the only way to build confidence in the new system.** Running the new system alongside the old system in read-only shadow mode -- comparing outputs without serving them to users -- surfaces divergence before it affects users. This requires the old and new systems to produce comparable outputs, which is a non-trivial engineering investment. But without shadow mode, every traffic switch is a leap of faith.

**Deleting old code is a feature, not cleanup.** The strangler fig is not complete until the old code path is deleted. Old code that remains behind a feature flag becomes zombie code: it is never tested, never updated, and gradually diverges from the system's assumptions. The deletion step must be tracked as a milestone with a deadline. If old code survives more than two release cycles after migration, it will survive forever.

**The hardest routes to migrate are the ones you should migrate first.** The lowest-risk routes (simple, low-traffic, well-understood) are tempting starting points, but they teach you little about the migration's real challenges. Migrating a moderately complex route first -- one that exercises the facade, dual-write, shadow mode, and rollback -- validates the entire migration machinery. Once that route works, the remaining routes are a known quantity.

## Problem

One-shot rewrite pain points:
- Big bang risk → launch-time failure
- Long switch cadence → business blockage
- No rollback path → once switched irreversible
- Dual-run high cost → resource waste
- Incomplete test coverage → launch discovers hidden dependencies
- Team confidence low → repeated delays
- Old code not deleted → long-term zombie code

## Pattern

### Three phases

```
1. New system coexists (strangler seedling): new features go to new system, old features unchanged
2. Route-by-route traffic switch (strangler growth): gradually switch from old system to new system by route / module
3. Old system strangled (wither and die): old code deleted to zero, old system decommissioned
```

### Key code

```python
# 1. Facade layer does route dispatch
class StranglerFacade:
    def __init__(self, old, new, routes_new: set, flag: FeatureFlag):
        self.old, self.new = old, new
        self.routes_new = routes_new
        self.flag = flag

    async def handle(self, request):
        # Gray release judgment
        if request.route in self.routes_new and self.flag.is_enabled(request.user):
            try:
                result = await self.new.handle(request)
                # Dual-run shadow validation (read-only comparison)
                if self.flag.shadow_enabled(request.user):
                    shadow = await self.old.handle(request)
                    self._compare(result, shadow)
                return result
            except Exception as e:
                if self.flag.fallback_enabled():
                    return await self.old.handle(request)
                raise
        return await self.old.handle(request)

# 2. Route-by-route gray release 1% → 10% → 50% → 100%
# 3. After old routes 100% switched, delete old code
```

### Traffic-switch dimensions

- **By route**: API endpoint dimension switch, fine-grained controllable
- **By tenant**: small tenants first, then large tenants
- **By user**: internal users → gray users → full
- **By read / write**: read first then write, read can dual-run validate
- **By feature module**: feature dimension switch, non-key first then key

## Applicable

- Monolith to microservices (decompose routes by business domain)
- Old tech stack to new tech stack (e.g. monolith → microservices)
- Old rule engine to LLM agent (old rules → LLM)
- Old DB to new DB (by table traffic switch)
- Third-party dependency switch (pi-ai → llama_index)

## Not applicable

- Emergency replacement (no time for facade)
- Old system completely unusable (must switch immediately)
- Single-point refactor (few routes, direct switch)
- Simple CRUD (decomposition cost > benefit)

## Landing checklist

1. Step 1: inventory old system all entry routes + dependency graph
2. Step 2: build Facade layer (reverse proxy / API gateway) route dispatch
3. Step 3: new system parallel implementation + contract test baseline aligned
4. Step 4: pick lowest-risk route → 1% gray traffic switch
5. Step 5: dual-run shadow mode validate consistency (read-only comparison)
6. Step 6: gradually 10% → 50% → 100% traffic switch
7. Step 7: delete old route code that has been switched away
8. Step 8: all routes switched → old system decommissioned + long-term observation



- **Big bang**: one-shot switch without gray release
- **Switch but not delete**: old code long-term coexisting zombie
- **No contract test**: new system behavior inconsistent
- **No shadow validation**: differences not found before launch
- **No fallback**: new system failure business interruption
- **Switch key route first**: should be non-key first
- **No monitoring**: do not watch metrics after traffic switch
- **LLM one-shot replace rules**: should be strangler-style gradual

## Related

- Landing cases: YiPet stack 5-phase migration (strangler-style React 15 → 18) + YiVad aicr 7-phase port
- Upstream gotcha: dual-write data inconsistency during migration
- Downstream ADR: migration ADR + strangler-style traffic-switch strategy
- Related pattern: [one-to-one-mapping-migration-pattern](./one-to-one-mapping-migration.md) behavior mapping / [staged-port-methodology-pattern](./staged-port-methodology.md) staged / [feature-flag-pattern](../infrastructure/feature-flag.md) gray switch / [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md) behavior alignment
