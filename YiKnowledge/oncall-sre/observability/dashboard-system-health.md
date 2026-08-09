---
title: system health dashboard
aliases:
- SRE dashboard
- infrastructure dashboard
- service health dashboard
- availability dashboard
tags:
- dashboard
- sre
- availability
- slo
- latency
- capacity
- error-budget
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- oncall-sre
- engineer
- tech-lead
benefit: system health and SLO compliance visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../incident-response/dashboard-incident-trends.md
- ../../engineer/infrastructure/dashboard-dora-metrics.md
- set-up-observability.md
- ../incident-response/respond-to-an-incident.md
tacit: false
---

# system health dashboard

> **As a** oncall sre, **I want to** track system health and SLO compliance across all services, **so that** degradation is detected before users notice and error budgets guide release decisions.

> System health is measured through the golden signals (latency, traffic, errors, saturation) plus SLO compliance. This dashboard is the primary on-call monitoring surface.

## Summary

- 4 golden signals: Latency, Traffic, Errors, Saturation — per service, per endpoint
- SLO tracking with error budget burn rate alerts (fast burn: 2% in 1 hour; slow burn: 5% in 24 hours)
- Capacity forecasting: CPU, memory, storage, connection pool utilization with 30-day projections
- Dependency health: upstream/downstream service status, external API health
- Dashboard refreshes every 60 seconds; critical alerts page on-call within 5 minutes

## Core viewpoints

- SLOs are user-centric, not system-centric — measure what users experience, not what servers report
- Error budgets are a decision-making tool — budget remaining determines whether to ship features or fix reliability
- The 4 golden signals must be monitored together — low latency with high error rate is still a degraded service
- Alert on symptoms, not causes — alert on "user-facing error rate > 1%" not "CPU > 80%"

## Key information

### 4-panel golden signals overview

```
┌──────────────────────────────────────────────────────────────────┐
│  LATENCY (P50/P95/P99)          │  TRAFFIC (RPS)                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  P50:  12ms             │   │  │  Current:  2.4k RPS    │   │
│  │  P95:  85ms  ████       │   │  │  Peak:     3.1k RPS    │   │
│  │  P99:  320ms ██         │   │  │  Growth:   +12% MoM    │   │
│  │  SLO:   P95 < 200ms ✓   │   │  │  Capacity: 62% used    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ERRORS (Rate / Budget)         │  SATURATION (Resources)         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Error rate: 0.12%      │   │  │  CPU:    45% ██▌       │   │
│  │  SLO target: < 0.5%     │   │  │  Memory: 72% ███▌      │   │
│  │  Budget:   76% remain   │   │  │  Disk:   58% ██▌       │   │
│  │  Burn rate: 0.3 (safe)  │   │  │  Conn:   34% █▌        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### SLO definitions by service tier

| Tier | Availability | Latency P95 | Latency P99 | Error rate | Example services |
|---|---|---|---|---|---|
| Tier 0 (Critical) | 99.99% | < 100ms | < 500ms | < 0.1% | Auth, Payment, API Gateway |
| Tier 1 (Core) | 99.95% | < 200ms | < 1s | < 0.5% | User, Search, Notification |
| Tier 2 (Supporting) | 99.9% | < 500ms | < 2s | < 1% | Analytics, Reporting, Admin |
| Tier 3 (Internal) | 99.5% | < 1s | < 5s | < 2% | Dev tools, CI systems |

### Error budget burn rate alerts

| Burn rate | Time window | Budget consumed | Alert severity | Action |
|---|---|---|---|---|
| 14.4x | 1 hour | 2% | Critical — page on-call | Immediate investigation |
| 6x | 6 hours | 5% | Critical — page on-call | Halt all deployments |
| 3x | 24 hours | 10% | High — notify team | Feature freeze, fix reliability |
| 1x | 3 days | 10% | Medium — ticket | Prioritize in next sprint |
| 0.5x | 30 days | ~15% | Low — weekly review | Track and plan |

### Service health matrix (example)

| Service | Tier | Uptime (30d) | P95 Lat | Error % | Budget | Status |
|---|---|---|---|---|---|---|
| api-gateway | T0 | 99.995% | 45ms | 0.03% | 89% | Green |
| auth-service | T0 | 99.991% | 32ms | 0.05% | 82% | Green |
| user-service | T1 | 99.96% | 120ms | 0.12% | 71% | Green |
| payment-service | T0 | 99.98% | 180ms | 0.08% | 34% | Yellow |
| search-service | T1 | 99.93% | 350ms | 0.42% | 18% | Yellow |
| notification-svc | T1 | 99.97% | 90ms | 0.15% | 65% | Green |
| analytics-svc | T2 | 99.85% | 420ms | 0.8% | 55% | Green |

### Capacity forecasting

| Resource | Current | 7-day trend | 30-day projection | Action needed |
|---|---|---|---|---|
| API Gateway CPU | 45% | +3%/week | 57% | None |
| DB Primary CPU | 62% | +5%/week | 82% | Plan vertical scale |
| Cache Memory | 78% | +2%/week | 86% | Monitor closely |
| Storage (Logs) | 68% | +8%/week | 98% | Add retention policy or scale |
| Connection Pool | 34% | Stable | 34% | None |
| K8s Node Capacity | 58% | +1%/week | 62% | None |

### Dependency health

| Dependency | Type | Status | Latency P95 | Error rate | SLA |
|---|---|---|---|---|---|
| PostgreSQL (primary) | Database | Green | 8ms | 0% | 99.95% |
| Redis (cache) | Cache | Green | 2ms | 0% | 99.9% |
| RabbitMQ | Queue | Green | 15ms | 0.01% | 99.9% |
| S3-compatible storage | Object | Green | 45ms | 0.02% | 99.9% |
| External Payment API | 3rd party | Green | 280ms | 0.1% | 99.5% |
| External SMS Gateway | 3rd party | Yellow | 850ms | 1.2% | 99.0% |

## Action recommendations

1. **Monitor golden signals per service**: every service exposes latency, traffic, errors, saturation metrics
2. **Define SLOs for every user-facing service**: start with 99.9% availability, refine based on user expectations
3. **Error budget policy**: budget > 50% = ship features; 20-50% = feature freeze, fix reliability; < 20% = all hands on reliability
4. **Burn rate alerts**: configure multi-window, multi-burn-rate alerts (2% in 1h + 5% in 24h)
5. **Capacity planning weekly**: review 30-day projections every Monday; order hardware before hitting 80%
6. **Dependency monitoring**: every external dependency gets a health check with alerting
7. **Runbook for every alert**: no alert fires without a corresponding runbook; on-call must know exactly what to do
8. **Quarterly SLO review**: are SLOs still matching user expectations? Adjust based on user feedback and incident data



- Monitoring everything → too many dashboards, no one knows what to look at; focus on golden signals + SLOs
- SLO as SLA → SLO is an internal target, SLA is a customer contract with financial penalties; don't confuse them
- 100% availability target → impossible and unnecessary; users don't notice 99.9% vs 99.99% for most services
- Alerting on CPU/memory → alert on symptoms (latency, errors), not causes; resource alerts are for capacity planning
- No error budget policy → error budget exists but no one knows what to do with it; define clear policy

## Related

- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident trends and patterns
- Same class: [dashboard-dora-metrics](../../engineer/infrastructure/dashboard-dora-metrics.md) — delivery performance
- Downstream: [set-up-observability](set-up-observability.md) — observability setup guide
- Downstream: [respond-to-an-incident](../incident-response/respond-to-an-incident.md) — incident response process
- References: Google — *Site Reliability Engineering* (Chapters 4-6: SLIs, SLOs, SLAs); Rob Ewaschuk — *Monitoring Distributed Systems*; Betsy Beyer et al. — *The Site Reliability Workbook*