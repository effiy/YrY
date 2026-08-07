---
title: slo error budget dashboard
aliases:
- error budget dashboard
- SLO dashboard
- SLI dashboard
- service level dashboard
- reliability budget dashboard
tags:
- dashboard
- slo
- sli
- error-budget
- reliability
- service-level
- burn-rate
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- oncall-sre
- tech-lead
- engineer
benefit: SLO compliance, error budget health, and burn rate visible at a glance across all critical services
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- SLO compliance, error budget, burn rate, SLI quality, dependent service reliability, and SLO governance defined
related:
- ./dashboard-system-health.md
- ./dashboard-alert-tuning.md
- ./dashboard-incident-trends.md
- ./dashboard-capacity-planning.md
- ../incident-response/dashboard-postmortem-quality.md
tacit: false
---

# slo error budget dashboard

> **As an** SRE, **I want to** track SLO compliance and error budget health across all critical services, **so that** every service meets its reliability target, error budgets are protected from unnecessary burnout, burn rates trigger action before users notice, and reliability is a measurable, governed, and continuously improving practice — not a guessing game.

> Error budgets are the bridge between reliability and velocity. This dashboard tracks SLO compliance, error budget remaining, burn rate, SLI quality, dependent service reliability, and SLO governance — turning reliability from "the site feels slow today" into a precise, actionable, and accountable engineering discipline.

## Summary

- 6 SLO dimensions: SLO compliance, error budget, burn rate, SLI quality, dependent service reliability, SLO governance
- 28 SLOs across 22 critical services; 4 SLI types: availability (12), latency (8), error rate (5), durability (3)
- SLO compliance: 24/28 SLOs met (85.7%); 4 SLOs in violation; 2 under active remediation; avg compliance 99.92%
- Error budget: avg 68% budget remaining (target > 50%); 4 services with < 20% budget; 2 services exhausted budget; budget reset monthly
- Burn rate: 2 services in critical burn (exhaust budget in < 3 days); 5 services in warning burn; avg burn rate 0.8× (target < 1.0×)
- SLI quality: 99.95% avg availability; 99.8% avg latency within threshold; measurement gap: 3 services with incomplete SLI data
- Dashboard reviewed weekly; SLO review with service owners and SRE monthly

## Core viewpoints

- Error budgets are not just for SRE — they're a business decision about how much unreliability is acceptable; a 99.9% SLO means 43 minutes of acceptable downtime per month — the product team should decide if that's the right number, not SRE
- Burn rate is more important than budget remaining — a service with 80% budget remaining but burning at 10× will exhaust in 2 days; a service with 20% budget burning at 0.5× has weeks of runway; the burn rate tells you when to act, not the budget
- SLOs without consequences are just metrics — if you have an SLO but no one changes behavior when the error budget burns (no feature freeze, no reliability sprint, no root cause analysis), the SLO is theater; the error budget must gate feature velocity
- Multi-service SLOs are multiplicative — if the checkout flow depends on 5 services each with 99.9% availability, the composite availability is 99.5%; you need higher SLOs for services in critical paths, or you need to decouple the dependency chain

## Key information

### 6-panel SLO error budget overview

```
┌──────────────────────────────────────────────────────────────────┐
│  SLO COMPLIANCE                      │  ERROR BUDGET                        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total SLOs: 28          │   │  │  Avg budget: 68%         │   │
│  │  Compliant: 24 (85.7%)   │   │  │  Critical (< 20%): 4     │   │
│  │  In violation: 4 (14.3%) │   │  │  Exhausted: 2 svc        │   │
│  │  Under remediation: 2    │   │  │  Budget reset: monthly    │   │
│  │  Avg compliance: 99.92%  │   │  │  Avg monthly burn: 32%   │   │
│  │  Services tracked: 22    │   │  │  Over-budget services: 4 │   │
│  │  Compliance score: B(78) │   │  │  Budget score: B- (72)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  BURN RATE                           │  SLI QUALITY                         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Critical burn: 2 svc    │   │  │  Availability: 99.95%    │   │
│  │  Warning burn: 5 svc     │   │  │  Latency (P95): 99.8%    │   │
│  │  Normal burn: 15 svc     │   │  │  Error rate: 0.05% avg   │   │
│  │  Avg burn rate: 0.8×     │   │  │  Durability: 99.99%      │   │
│  │  Fastest burn: 12×       │   │  │  Measurement gap: 3 svc  │   │
│  │  Burn alerts: 8/mo       │   │  │  SLI freshness: 2.5 min  │   │
│  │  Burn score: B- (72)     │   │  │  SLI score: B+ (82)      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DEPENDENT SERVICE RELIABILITY       │  SLO GOVERNANCE                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Critical path services:│   │  │  SLOs with owners: 26/28 │   │
│  │  12 tracked, 2 at risk  │   │  │  SLOs reviewed: 22/28    │   │
│  │  Composite SLO: 99.5%   │   │  │  SLOs auto-calculated:18 │   │
│  │  Dependency chains: 8   │   │  │  Aspirational SLOs: 5    │   │
│  │  SPOF dependencies: 3   │   │  │  Overly strict: 2        │   │
│  │  Worst dependency:      │   │  │  Overly loose: 3        │   │
│  │  Payment API (99.5%)    │   │  │  Governance score: B(78) │   │
│  │  Dependency: B- (72)    │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### SLO compliance by service

| Service | SLI type | SLO target | Actual (30d) | Compliance | Budget remaining | Burn rate | Status |
|---|---|---|---|---|---|---|---|
| **API Gateway** | Availability | 99.95% | 99.97% | Met | 82% | 0.6× | Healthy |
| **API Gateway** | Latency (P95) | 200ms | 185ms | Met | 78% | 0.7× | Healthy |
| **YiVad Core** | Availability | 99.9% | 99.94% | Met | 75% | 0.8× | Healthy |
| **YiVad Core** | Latency (P95) | 500ms | 420ms | Met | 85% | 0.5× | Healthy |
| **YiAi Agents** | Availability | 99.9% | 99.85% | **Violation** | **8%** | **3.2×** | Critical burn |
| **YiAi Agents** | Error rate | 0.1% | 0.18% | **Violation** | **12%** | 2.8× | Warning burn |
| **Auth Service** | Availability | 99.99% | 99.995% | Met | 92% | 0.3× | Healthy |
| **Auth Service** | Latency (P95) | 100ms | 88ms | Met | 88% | 0.4× | Healthy |
| **Payment Service** | Availability | 99.95% | 99.92% | Met | 55% | 1.5× | Warning burn |
| **Payment Service** | Durability | 99.999% | 99.999% | Met | 95% | 0.2× | Healthy |
| **Database Proxy** | Availability | 99.95% | 99.96% | Met | 72% | 0.9× | Healthy |
| **Database Proxy** | Latency (P95) | 50ms | 48ms | Met | 68% | 1.1× | Warning burn |
| **Search Service** | Availability | 99.9% | 99.93% | Met | 82% | 0.6× | Healthy |
| **Search Service** | Latency (P95) | 300ms | 285ms | Met | 75% | 0.8× | Healthy |
| **Notification** | Availability | 99.5% | 99.2% | **Violation** | **-5% (exhausted)** | **4.5×** | Critical burn |
| **CDN** | Availability | 99.9% | 99.88% | **Violation** | **15%** | 2.8× | Warning burn |
| **YiWeb** | Availability | 99.9% | 99.92% | Met | 70% | 1.0× | Warning burn |
| **YiWeb** | Latency (P95) | 800ms | 720ms | Met | 82% | 0.6× | Healthy |
| **File Storage (S3)** | Availability | 99.99% | 99.995% | Met | 95% | 0.2× | Healthy |
| **File Storage (S3)** | Durability | 99.9999999% | 99.9999999% | Met | 100% | 0.0× | Healthy |
| **Cache (Redis)** | Availability | 99.95% | 99.97% | Met | 90% | 0.3× | Healthy |
| **Cache (Redis)** | Latency (P95) | 5ms | 3.8ms | Met | 92% | 0.3× | Healthy |
| **LLM Proxy** | Availability | 99.5% | 99.6% | Met | 65% | 1.2× | Warning burn |
| **LLM Proxy** | Latency (P95) | 5s | 4.2s | Met | 78% | 0.7× | Healthy |
| **Message Queue** | Availability | 99.95% | 99.96% | Met | 85% | 0.5× | Healthy |
| **Message Queue** | Durability | 99.999% | 99.998% | Met | 90% | 0.3× | Healthy |
| **Analytics Pipeline** | Availability | 99.5% | 99.7% | Met | 88% | 0.4× | Healthy |
| **ML Inference** | Latency (P95) | 2s | 1.8s | Met | 80% | 0.7× | Healthy |

### Error budget burn rate detail

| Service | SLO target | Budget/month | Consumed | Remaining | Burn rate | Days to exhaust | Alert threshold | Action |
|---|---|---|---|---|---|---|---|---|
| **YiAi Agents** (availability) | 99.9% | 43.2 min | 39.7 min | 3.5 min (8%) | 3.2× | 2.7 days | 5× (1 day) | Freeze features, reliability sprint |
| **Notification** (availability) | 99.5% | 216 min | 228 min | -12 min (exhausted) | 4.5× | 0 days | Already exhausted | Incident declared, postmortem in progress |
| **CDN** (availability) | 99.9% | 43.2 min | 36.7 min | 6.5 min (15%) | 2.8× | 5.6 days | 3× (3 days) | Investigate CDN provider, add failover |
| **Payment Service** (availability) | 99.95% | 21.6 min | 9.7 min | 11.9 min (55%) | 1.5× | 12 days | 2× (5 days) | Monitor, prepare rollback for recent deploy |
| **Database Proxy** (latency) | 50ms P95 | 43.2 min | 13.8 min | 29.4 min (68%) | 1.1× | 18 days | 2× (5 days) | Optimize slow queries, add read replica |
| **LLM Proxy** (availability) | 99.5% | 216 min | 75.6 min | 140.4 min (65%) | 1.2× | 20 days | 2× (5 days) | Add provider fallback, circuit breaker |
| **YiWeb** (availability) | 99.9% | 43.2 min | 12.9 min | 30.3 min (70%) | 1.0× | 22 days | 2× (5 days) | Monitor, no action needed |

### Burn rate alerting policy

| Burn rate | Budget consumed in | Alert severity | Response | Example (99.9% SLO) |
|---|---|---|---|---|
| **Critical** (> 10×) | < 1 day | P1 — Immediate page | Wake up on-call, freeze features, incident declared | 14.4 min error in 1 hour |
| **High** (5×–10×) | 1–3 days | P2 — Page within 30 min | On-call investigates, halt deployments, prepare rollback | 7.2 min error in 1 hour |
| **Elevated** (2×–5×) | 3–7 days | P3 — Ticket + Slack | Team investigates during business hours, slow deployments | 2.8 min error in 1 hour |
| **Normal** (1×–2×) | 7–30 days | P4 — Dashboard alert | Monitor, include in weekly review | 1.4 min error in 1 hour |
| **Low** (< 1×) | > 30 days | None | Within budget, no action | < 1.4 min error in 1 hour |

### SLI measurement quality

| Service | SLI type | Measurement method | Data freshness | Coverage | Accuracy | Gaps |
|---|---|---|---|---|---|---|
| **API Gateway** | Availability | Load balancer metrics + synthetic probes | 1 min | 99.9% | High | Internal health checks excluded |
| **API Gateway** | Latency | Server-side timing (P95 over 5 min window) | 1 min | 99.5% | High | Client-side latency not captured |
| **YiVad Core** | Availability | Kubernetes readiness probe + request success rate | 30s | 99.9% | High | — |
| **YiAi Agents** | Availability | Application health endpoint + task completion rate | 1 min | 98.5% | Medium | Task queue depth not factored in |
| **Auth Service** | Availability | Synthetic login probes every 30s | 30s | 99.9% | High | — |
| **Payment Service** | Availability | Real transaction success rate | 1 min | 99.9% | High | Partial failures (3DS) not counted |
| **Notification** | Availability | Delivery success rate (all channels) | 5 min | 95.0% | **Low** | Provider-side delivery not tracked |
| **CDN** | Availability | Synthetic probes from 5 regions | 1 min | 99.0% | Medium | Regional partial outages may be averaged |
| **Cache (Redis)** | Availability | Connection success + ping latency | 10s | 99.9% | High | — |
| **ML Inference** | Latency | Model inference time (server-side) | 1 min | 98.0% | Medium | Queue wait time not included in latency |

### Dependent service reliability chain

| Critical path | Services in chain | Individual SLOs | Composite SLO | Actual composite | Bottleneck | Risk |
|---|---|---|---|---|---|---|
| **User login** | CDN → API Gateway → Auth → DB Proxy | 99.9% × 99.95% × 99.99% × 99.95% | 99.79% | 99.85% | CDN (99.9%) | CDN degradation impacts all flows |
| **Checkout/Payment** | API Gateway → YiWeb → Payment → DB Proxy | 99.95% × 99.9% × 99.95% × 99.95% | 99.75% | 99.70% | Payment (99.92% actual) | Revenue-critical, cascading failure risk |
| **AI chat** | API Gateway → YiVad → YiAi Agents → LLM Proxy | 99.95% × 99.9% × 99.9% × 99.5% | 99.26% | 99.10% | YiAi Agents (99.85% actual) | Core product feature, multi-model dependency |
| **Search** | API Gateway → YiVad → Search → Cache | 99.95% × 99.9% × 99.9% × 99.95% | 99.70% | 99.75% | Search (99.93% actual) | Cache failover tested, low risk |
| **Notification delivery** | Event → Message Queue → Notification → Email/Push | 99.9% × 99.95% × 99.5% × 99.9% | 99.26% | 98.80% | Notification (99.2% actual) | Already in violation, degraded UX |
| **Data ingestion** | API Gateway → Analytics Pipeline → DB Proxy → S3 | 99.95% × 99.5% × 99.95% × 99.99% | 99.39% | 99.50% | Analytics Pipeline (99.7% actual) | Batch processing, latency-tolerant |

### SLO governance maturity

| Governance dimension | Current state | Target | Gap |
|---|---|---|---|
| **SLO coverage** | 22/42 services have SLOs (52%) | 35/42 (83%) | Define SLOs for 13 unmeasured services |
| **SLO ownership** | 26/28 SLOs have named owners | 28/28 (100%) | Assign owners for 2 orphaned SLOs |
| **SLO review cadence** | 22/28 reviewed in last 90 days | 28/28 reviewed quarterly | Schedule reviews for 6 stale SLOs |
| **Auto-calculation** | 18/28 SLOs auto-calculated from metrics | 26/28 auto-calculated | Instrument remaining 8 with Prometheus/Grafana |
| **SLO as code** | 12/28 defined in Terraform/Jsonnet | 24/28 as code | Migrate 12 manually managed SLOs to code |
| **Error budget policy** | 8/22 services have defined budget policies | 22/22 | Define budget exhaustion policy for all services |
| **Aspirational SLOs** | 5 SLOs are aspirational (not enforced) | 0 aspirational | Either enforce or downgrade to informational |
| **SLO accuracy audit** | 15/28 audited for measurement accuracy | 28/28 audited | Audit 13 SLOs for measurement correctness |

## Action recommendations

1. **YiAi Agents availability remediation**: 99.85% actual vs 99.9% target, 8% budget remaining, 3.2× burn rate; freeze features, investigate root cause (LLM dependency timeout patterns), add circuit breaker and retry budget
2. **Notification service SLO reset**: budget exhausted, 99.2% actual vs 99.5% target; complete postmortem, add provider failover, consider lowering SLO to 99.5% if multi-channel delivery is inherently unreliable
3. **CDN multi-region failover**: 15% budget remaining, 2.8× burn rate; implement multi-CDN failover (CloudFront + Cloudflare), add regional synthetic probes, renegotiate CDN provider SLA
4. **Payment service SLO tightening**: 55% budget remaining, 1.5× burn rate; the most critical revenue path needs higher reliability — add payment retry with idempotency, add circuit breaker for downstream dependency
5. **SLI measurement gap closure**: 3 services with incomplete data (Notification delivery, ML Inference queue time, CDN regional); add client-side metrics, queue-wait instrumentation, per-region probes
6. **Composite SLO dashboard**: critical paths have composite SLOs 0.5-1.0% lower than individual SLOs; create composite SLO tracking for all 8 critical paths, alert on composite degradation
7. **Error budget policy enforcement**: only 8/22 services have defined budget policies; create standardized error budget policy (freeze features at 20% budget, reliability sprint at 10%, incident at 0%)
8. **SLO as code migration**: 12/28 SLOs manually managed; migrate to Terraform/Jsonnet, version control all SLO definitions, add CI/CD validation for SLO changes
9. **Burn rate alert tuning**: 8 burn rate alerts/month, 3 were false positives; adjust burn rate windows (use 1h and 5 min windows), reduce alert sensitivity for batch services
10. **Weekly SLO review**: review SLO compliance, error budget burn, SLI quality, and dependent service chains with SRE and service owners



- The 100% SLO → setting 100% as an SLO target; 100% reliability is impossible and pursuing it eliminates your ability to ship features — the error budget exists precisely because some unreliability is acceptable
- SLOs without customer impact → defining SLOs on metrics that don't map to user pain; a 99.9% availability SLO on an internal batch job that runs once a day is meaningless — every SLO should trace to a user-visible outcome
- The "set and forget" SLO → defining SLOs once and never reviewing them; as services evolve, traffic patterns change, and dependencies shift, SLOs must be recalibrated — a 99.9% SLO that was appropriate for 100 QPS may be inappropriate for 10,000 QPS
- Alerting on SLO violations directly → paging when an SLO breaches instead of paging on burn rate; a 99.9% SLO violation takes 43 minutes of downtime — you want to be paged in the first 5 minutes (based on burn rate), not after 43 minutes
- The error budget as a blank check → treating the error budget as "we can use this downtime for risky deployments"; the error budget is for unavoidable failures, not for intentional risk-taking — if you deliberately consume error budget, you're gambling with user trust

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-alert-tuning](dashboard-alert-tuning.md) — alert tuning and noise reduction
- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident trends
- Same class: [dashboard-capacity-planning](dashboard-capacity-planning.md) — capacity planning
- Same class: [dashboard-postmortem-quality](../incident-response/dashboard-postmortem-quality.md) — postmortem quality
- References: Google — *SRE Workbook: SLOs and Error Budgets*; Alex Hidalgo — *Implementing Service Level Objectives*; Nobl9 — *SLO Platform Best Practices*; Datadog — *SLO Monitoring Guide*; Liz Fong-Jones — *SLOs for Mortals*; Honeycomb — *SLOs with High-Cardinality Data*