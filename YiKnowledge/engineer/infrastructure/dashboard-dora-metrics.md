---
title: engineering dora metrics dashboard
aliases:
- DORA dashboard
- engineering metrics dashboard
- delivery performance dashboard
tags:
- dashboard
- dora
- metrics
- engineering
- deployment-frequency
- lead-time
- change-failure-rate
- mttr
category: engineer/infrastructure
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
- tech-lead
- executive
benefit: engineering delivery performance visible at a glance with DORA 4 key metrics
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../process/monitoring-governance.md
- ../../oncall-sre/release/release.md
- ../../oncall-sre/release/canary-release.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../../product-manager/discovery/metrics--north-star-metric.md
tacit: false
---

# engineering dora metrics dashboard

> **As a** tech lead, **I want to** track DORA 4 key metrics across all engineering teams, **so that** delivery performance is visible at a glance and bottlenecks are identified early.

> The DORA (DevOps Research and Assessment) framework defines 4 key metrics that measure software delivery performance. Elite performers deploy on-demand with lead time < 1 hour and change failure rate < 5%.

## Summary

- DORA 4 key metrics: Deployment Frequency, Lead Time for Changes, Change Failure Rate, Mean Time to Restore (MTTR)
- 4 performance tiers: Elite / Good / Medium / Low — benchmark against industry peers
- Each metric decomposes into team-level input metrics for actionable improvement
- Dashboard refreshes daily with weekly rolling aggregates; quarterly deep-dive review
- Red thresholds trigger automated alerts to team leads and platform engineering

## Core viewpoints

- DORA metrics measure outcomes, not output — deployment frequency measures value delivery speed, not lines of code
- The 4 metrics are interconnected — improving one without the others often creates bottlenecks elsewhere
- Elite performers are not just faster — they are more stable (lower change failure rate, faster MTTR)
- Metrics must be paired with guardrails: security incidents, cost per deployment, developer experience

## Key information

### DORA 4 key metrics — definition and thresholds

| Metric | Definition | Elite | Good | Medium | Low |
|---|---|---|---|---|---|
| **Deployment Frequency** | How often code is deployed to production | On-demand (multiple/day) | Once/day ~ once/week | Once/week ~ once/month | < once/month |
| **Lead Time for Changes** | Time from commit to production | < 1 hour | 1 hour ~ 1 day | 1 day ~ 1 week | > 1 week |
| **Change Failure Rate** | % of deployments causing failure | < 5% | 5% ~ 10% | 10% ~ 15% | > 15% |
| **Mean Time to Restore** | Time to recover from failure | < 1 hour | 1 hour ~ 1 day | 1 day ~ 1 week | > 1 week |

### Dashboard layout — 4-panel overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DEPLOYMENT FREQUENCY          │  LEAD TIME FOR CHANGES          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  ████▌ 12/day (Elite)   │   │  │  ██▌ 45min (Elite)     │   │
│  │  Trend: ↑ 20% WoW       │   │  │  Trend: ↓ 15% WoW      │   │
│  │  Team breakdown ▼       │   │  │  Pipeline stages ▼     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CHANGE FAILURE RATE           │  MEAN TIME TO RESTORE           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  ██ 3.2% (Elite)        │   │  │  ███ 28min (Elite)     │   │
│  │  Trend: → stable        │   │  │  Trend: ↓ 40% WoW      │   │
│  │  Failure categories ▼   │   │  │  Incident timeline ▼   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Drill-down dimensions

| Dimension | Drill-down target | Related file |
|---|---|---|
| By team | Per-team DORA scorecard | [team-velocity-dashboard](../process/dashboard-team-velocity.md) |
| By service | Per-service deployment frequency / CFR | [system-health-dashboard](../../oncall-sre/observability/dashboard-system-health.md) |
| By time | Weekly / monthly / quarterly trend | [executive-kpi-dashboard](../../executive/strategy/dashboard-executive-kpi.md) |
| By deployment type | Feature / hotfix / rollback ratio | [release-process](../../oncall-sre/release/release.md) |
| By failure root cause | Infrastructure / code / config / dependency | [incident-postmortem](../lessons/failure-incident-postmortem.md) |

### Metric decomposition — team-level input metrics

```
Deployment Frequency
  ├─ CI pipeline duration (target: < 15 min)
  ├─ Code review turnaround (target: < 4 hours)
  ├─ Automated test coverage (target: > 80%)
  └─ Feature flag adoption rate (target: > 90%)

Lead Time for Changes
  ├─ PR open-to-merge time (target: < 1 day)
  ├─ Build queue wait time (target: < 5 min)
  ├─ Staging validation time (target: < 30 min)
  └─ Canary observation time (target: 1 day)

Change Failure Rate
  ├─ Pre-production bug catch rate (target: > 95%)
  ├─ Canary detection rate (target: > 90%)
  ├─ Rollback automation success rate (target: 100%)
  └─ Contract test coverage (target: > 20 cases)

Mean Time to Restore
  ├─ Alert-to-acknowledge time (target: < 5 min)
  ├─ Incident diagnosis time (target: < 15 min)
  ├─ Rollback execution time (target: < 5 min)
  └─ Post-incident verification time (target: < 10 min)
```

### Health thresholds and alerting

| Color | Deployment Frequency | Lead Time | CFR | MTTR | Action |
|---|---|---|---|---|---|
| Green | ≥ Elite threshold | ≤ Elite threshold | ≤ Elite threshold | ≤ Elite threshold | Maintain |
| Yellow | 1 tier below target | 1 tier above target | 1 tier above target | 1 tier above target | Weekly review |
| Red | ≥ 2 tiers below | ≥ 2 tiers above | ≥ 2 tiers above | ≥ 2 tiers above | Pause feature work, focus on stability |

### Benchmarks by team size

| Team size | Typical Deployment Frequency | Typical Lead Time | Notes |
|---|---|---|---|
| 1-5 engineers | 5-20/day | < 30 min | Small batch, fast iteration |
| 5-20 engineers | 3-10/day | 30 min ~ 2 hours | Coordination overhead increases |
| 20-50 engineers | 1-5/day | 2 hours ~ 1 day | Service boundaries matter |
| 50+ engineers | Varies by service | Varies by service | Measure per-service, not aggregate |

## Action recommendations

1. **Baseline first**: measure current DORA 4 metrics for 2 sprints before setting targets
2. **Automate collection**: wire CI/CD pipeline events to dashboard (no manual data entry)
3. **Start with CFR**: if change failure rate > 10%, fix stability before increasing speed
4. **Reduce batch size**: smaller, more frequent deployments reduce both lead time and CFR
5. **Invest in testing**: automated regression + contract tests are the highest-leverage investment
6. **Canary everything**: 1% → 10% → 50% → 100% rollout with automated health checks
7. **Practice recovery**: quarterly rollback drills; a drill without rollback equals no rollback
8. **Review quarterly**: DORA metrics trend review with all tech leads; adjust targets
9. **Pair with DevEx**: track developer experience alongside DORA — fast pipelines with poor DX are unsustainable
10. **Celebrate improvement**: public recognition when a team moves up a tier



- Speed without stability → increasing deployment frequency while CFR rises; slow down, fix quality first
- Gaming the metric → splitting one deployment into many micro-deployments to boost frequency; measure value delivery, not commit count
- Ignoring context → comparing monolith deployment frequency to microservice frequency; normalize by service architecture
- MTTR measured wrong → measuring "time to close ticket" instead of "time to restore service"; measure user-impact recovery
- Single-team focus → optimizing one team's DORA at the expense of downstream teams; measure end-to-end value stream

## Related

- Same class: [dashboard-team-velocity](../process/dashboard-team-velocity.md) — team-level sprint metrics
- Same class: [dashboard-quality-metrics](../quality-security/dashboard-quality-metrics.md) — quality and test metrics
- Upstream: [../../executive/strategy/dashboard-executive-kpi.md](../../executive/strategy/dashboard-executive-kpi.md) — executive-level KPI rollup
- Upstream: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — capacity planning and roadmap
- Downstream: [release-process](../../oncall-sre/release/release.md) — release process details
- Downstream: [canary-release](../../oncall-sre/release/canary-release.md) — canary deployment pattern
- References: DORA — *Accelerate: State of DevOps* (annual report); Google — *DORA Metrics Guide*; Nicole Forsgren et al. — *Accelerate*