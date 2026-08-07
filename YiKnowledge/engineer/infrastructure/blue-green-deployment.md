---
title: Blue-Green Deployment Pattern / Blue-Green Deployment Pattern
aliases: [blue-green-deployment-pattern, blue-green, bg-deployment]
tags: [pattern, engineeringPattern, deployment, release, zero-downtime]
category: engineer/infrastructure
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
benefit: "New versions are deployed alongside existing ones with instant rollback capability, reducing deployment risk"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
- ./feature-flag.md
  - ./canary-deployment.md
  - ../infrastructure/ship-a-release.md
  - ../../oncall-sre/incident-response/do-a-rollback-drill.md
---

# Blue-Green Deployment Pattern / Blue-Green Deployment Pattern

> **As an** engineer, **I want to** blue green deployment, **so that** pattern applied consistently.

## Summary

Blue-green deployment is a release contract; not just traffic cut. Two environments exist in parallel + one-click traffic switch + switch-back enabled + database migration aligned; and feature flag + contract test + observe + degradation links; LLM scenario multi-provider dual-active traffic cut.

## Question

Pain points of rolling release:
- new and old versions run mixed during deployment → behavior inconsistent
- rollback needed when issues arise → rolling rollback is slow + uncontrollable
- database migration and code out of sync → compatibility issues
- insufficient validation → bugs discovered only after traffic cut
- users disconnect during traffic cut → poor experience
- rollback path unclear → scrambling when issues arise

## Pattern

### Dual environment

```
                ┌─── Blue (new version)  ← currently active
Router (DNS/LB) ─┤
                └─── Green (old version) ← standby fallback
```

- **Blue / Green**: two completely independent environments (application + config + cache)
- **Database**: shared + dual-compatible schema (forward + backward compatible)
- **traffic cut**: routing layer (DNS / LB / API gateway) one-click switch
- **rollback**: routing switch back to Green takes effect immediately

### Key code

```python
class BlueGreenRouter:
    def __init__(self, lb: LoadBalancer, flag: FeatureFlag):
        self.lb = lb
        self.flag = flag

    def switch(self, target: str, shadow: bool = False):
        # Health check before switching
        if not self.lb.health_check(target):
            raise HealthCheckError
        # Shadow mode does not switch real traffic, validate first
        if shadow:
            self.lb.add_weighted(target, weight=0)
            return
        # One-click traffic cut
        self.lb.set_active(target)
        # Old version kept on standby for N hours
        self.lb.set_standby(other(target), ttl=3600 * 4)
```

### Traffic cut steps

1. Green deploys new version (do not move Blue traffic)
2. Health check + contract test baseline align
3. Shadow pattern validation (0% traffic, dual-run comparison)
4. Cut 1% → 10% → 50% → 100%
5. Observe metrics for N minutes with no exceptions
6. After 100% cut → old version on standby 4 hours
7. Confirm stable → take old version offline

## Applicable

- Non-stoppable key services (API / payment / authentication)
- Major version upgrades (framework / DB schema)
- Multi-provider traffic cut (LLM primary/backup switch)
- Gradual rollout release + emergency rollback
- Insufficiently validated high-risk changes

## Not applicable

- Extremely high traffic (dual environment cost high)
- Non-compatible database migration (schema hard to dual-compatible)
- Stateless simple services (rolling is enough)
- Single-instance small projects (blue-green cost > benefit)
- Strong data consistency required (data conflicts during traffic cut)

## Implementation list

1. Change 1: dual environment resources + config align (IaC)
2. Change 2: routing layer supports one-click traffic cut (LB / DNS)
3. Change 3: contract test baseline validation of new environment behavior alignment
4. Change 4: shadow pattern + dual-run comparison
5. Change 5: 1% / 10% / 50% / 100% gradual rollout traffic cut
6. Change 6: observe dashboard + SLO burn rate alert
7. Change 7: database dual-compatible schema (forward + backward)
8. Change 8: old version on standby 4 hours + one-click rollback
9. Change 9: drill to validate rollback path

## Anti-patterns

- **Direct 100% cut**: no gradual rollout, full volume directly
- **No health check**: no validation before traffic cut
- **No contract test**: inconsistent behavior not discovered
- **No shadow**: traffic cut immediately to real traffic
- **Database not dual-compatible**: data conflicts during traffic cut
- **Take old offline immediately after cut**: no rollback window
- **No observe**: no monitoring after traffic cut
- **No rollback drill**: scrambling in emergencies

## Related

- Implementation case study: YiAi LLM multi-provider 5-stage gradual rollout (blue-green style traffic cut)
- Upstream gotcha: database migration and code out of sync
- Downstream ADR: release strategy ADR
- Related pattern: [feature-flag-pattern](./feature-flag.md) gradual rollout toggle / [canary-deployment-pattern](./canary-deployment.md) progressive traffic cut / [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md) behavior alignment
