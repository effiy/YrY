---
title: Canary Deployment Pattern / Canary Deployment Pattern
aliases:
- canary-deployment-pattern
- canary-release
- canary
tags:
- pattern
- engineeringPattern
- deployment
- release
- progressive
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
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
- ./blue-green-deployment.md
- ./feature-flag.md
- ./contract-test-baseline.md
- ./observability.md
- ./graceful-degradation.md
- ./circuit-breaker.md
- ../processes/ship-a-release.md
- ../processes/run-an-experiment.md
- ../../oncall-sre/incident-response/do-a-rollback-drill.md
---

# Canary Deployment Pattern / Canary Deployment Pattern

> **As an** engineer, **I want to** canary deployment, **so that** pattern applied consistently. 

## Summary

Canary is a progressive release contract; not just percentage traffic cut. A small batch of users try first + observe metrics + exception auto-rollback; link with feature flag + contract test + SLO burn rate + circuit breaker; LLM scenarios gradually roll out by model / tenant / user dimensions. 

## Question

Pain points of one-shot release: 
- Full-volume release fails immediately → impacts all users
- Issues discovered late → can no longer rollback
- Validation coverage incomplete → boundary scenarios not triggered
- Performance issues exposed late → only at peak
- A/B experiment no comparison → cannot attribute
- Emergency rollback no path → retreat beats fix

## Pattern

### Progressive traffic cut

```
1% (internal) → 5% (gray users) → 25% → 50% → 100%
```

- **Per-stage observe**: error rate + latency + business metrics + SLO burn rate
- **Per-stage duration**: 5 minutes ~ 1 hour (by risk)
- **Auto-rollback**: metrics exceed threshold auto-switch back to old version
- **Dimension cut**: by user / tenant / region / model

### Key code

```python
class CanaryDeployer:
    def __init__(self, router, flag, slo, baseline_metrics):
        self.router, self.flag, self.slo = router, flag, slo
        self.baseline = baseline_metrics

    async def deploy(self, new_version, stages):
        for weight, duration in stages:
            await self.router.set_weight(new_version, weight)
            metrics = await self._observe(duration)
            if self._is_anomaly(metrics):
                await self.router.rollback(new_version)
                self._alert(metrics)
                return False
        return True

    def _is_anomaly(self, metrics):
        # Error rate exceeds baseline 3x
        if metrics.error_rate > self.baseline.error_rate * 3:
            return True
        # P99 latency exceeds baseline 2x
        if metrics.p99_latency > self.baseline.p99 * 2:
            return True
        # SLO burn rate > 2x
        if self.slo.burn_rate > 2:
            return True
        return False
```

### Traffic cut dimensions

- **By user**: internal → gradual rollout users → full-volume
- **By tenant**: small tenant → medium tenant → large tenant
- **By region**: low-risk region → all regions
- **By model** (LLM) : low-cost model → high-cost model
- **By feature**: non-key → key function

## Applicable

- High-risk changes (Architecture / performance / algorithm / LLM model) 
- A/B experiment (same-period comparison) 
- Progressive discovery of boundary scenarios
- Performance validation (small-traffic validation P99) 
- Gradual rollout + emergency rollback

## Not applicable

- Emergency hotfix (needs immediate full-volume) 
- Simple CRUD (cost > benefit) 
- Database schema change (incompatible) 
- Strong consistency real-time data (dual-run cost high) 
- Single-instance small project

## Implementation checklist

1. Change 1: routing layer supports weighted traffic cut (LB / API gateway) 
2. Change 2: contract test baseline validates new version behavior
3. Change 3: observe dashboard + error rate + latency + SLO burn rate
4. Change 4: auto-rollback threshold + trigger logic
5. Change 5: traffic cut dimension selection (by user / tenant / region / model) 
6. Change 6: 1% → 5% → 25% → 50% → 100% staged traffic cut
7. Change 7: per-stage duration by risk (5 min ~ 1 h) 
8. Change 8: exception auto-switch back + alert + retrospective

## Anti-patterns

- **Direct 100%**: no progressive traffic cut
- **No observe**: don't watch metrics after traffic cut
- **No auto-rollback**: depends on manual judgment
- **Threshold too loose**: exception doesn't trigger rollback
- **Threshold too tight**: false trigger rollback
- **Wrong dimension selected**: try key users first
- **No contract test**: behavior inconsistent not discovered
- **LLM full-volume switch model**: should be progressive rollout by dimension

## Related

- Implementation case study: YiAi LLM multi-provider 5-stage gradual rollout (canary style) + BRD Agent Launch
- Upstream gotcha: canary traffic cut period data inconsistent
- Downstream ADR: release strategy ADR
- Related pattern: [blue-green-deployment-pattern](./blue-green-deployment.md) dual environment / [feature-flag-pattern](./feature-flag.md) gradual rollout switch / [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md) behavior alignment
