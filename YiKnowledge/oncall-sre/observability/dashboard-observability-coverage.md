---
title: observability coverage dashboard
aliases:
- monitoring coverage dashboard
- telemetry coverage dashboard
- observability maturity dashboard
- logging coverage dashboard
tags:
- dashboard
- observability
- monitoring
- logging
- metrics
- tracing
- alerting
- slo
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
- tech-lead
- engineer
benefit: observability coverage and monitoring maturity visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-system-health.md
- ./dashboard-capacity-planning.md
- ./dashboard-cost-and-resource.md
- ../incident-response/dashboard-incident-trends.md
- ../incident-response/dashboard-oncall-health.md
tacit: false
---

# observability coverage dashboard

> **As an** SRE, **I want to** track observability coverage across all services, **so that** every service is observable, every failure mode is alerted, and no production issue goes undetected.

> Observability is the foundation of reliability — you can't fix what you can't see. This dashboard tracks logging coverage, metrics coverage, tracing coverage, alerting coverage, and dashboard completeness across all services and environments.

## Summary

- 5 observability dimensions: logging coverage, metrics coverage, tracing coverage, alerting coverage, dashboard completeness
- 42 services tracked across 3 environments (prod, staging, dev); 4 golden signals measured per service
- Observability maturity model: L1 (none) → L2 (basic) → L3 (standardized) → L4 (comprehensive) → L5 (predictive)
- 312 alerts defined across 18 alert policies; 8.5% alert coverage gap; 6 orphaned dashboards
- Dashboard reviewed monthly; observability maturity review quarterly with SRE and platform teams

## Core viewpoints

- Observability is a prerequisite for reliability, not a nice-to-have — a service without observability is a service running blind; every service must emit logs, metrics, and traces
- Coverage is not quality — having logs doesn't mean you have the right logs; coverage measures the presence of telemetry, quality measures its usefulness during incidents
- The four golden signals are the minimum bar — latency, traffic, errors, saturation; if you can't measure these four, you can't operate the service
- Alert coverage gaps are incidents waiting to happen — every known failure mode without an alert is a production incident that will be discovered by users, not by the monitoring system

## Key information

### 5-panel observability coverage overview

```
┌──────────────────────────────────────────────────────────────────┐
│  LOGGING COVERAGE                 │  METRICS COVERAGE                │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Services logged: 40/42 │   │  │  Golden signals: 85%     │   │
│  │  Structured JSON: 35    │   │  │  Latency:  38/42 (90%)   │   │
│  │  Unstructured:    5     │   │  │  Traffic:  40/42 (95%)   │   │
│  │  Not logged:      2     │   │  │  Errors:   38/42 (90%)   │   │
│  │  Log retention: 30 days │   │  │  Saturation: 28/42 (67%) │   │
│  │  Sampling rate: 100%    │   │  │  Custom metrics: 42/42   │   │
│  │  Log quality score: B+  │   │  │  Metric gaps: 14 svc     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TRACING COVERAGE                 │  ALERTING COVERAGE               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Traced:     36/42 (86%)│   │  │  Alerts:     312 total   │   │
│  │  Full trace: 28/42 (67%)│   │  │  Covered:    286 (91.5%) │   │
│  │  Sampling:   10% (avg)  │   │  │  Gaps:        26 (8.5%)  │   │
│  │  Span count: 2.8M/hr    │   │  │  SLO-based:  58 (18.6%) │   │
│  │  Trace retention: 7 days│   │  │  Threshold:  198 (63.5%)│   │
│  │  Latency p99: 18ms      │   │  │  Anomaly:     38 (12.2%)│   │
│  │  Error rate:  0.4%      │   │  │  Composite:   18 (5.8%) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Logging coverage by service

| Service | Tier | Structured JSON | Log level | Sampling | Retention | PII redaction | Quality score | Gaps |
|---|---|---|---|---|---|---|---|---|
| API Gateway | 0 | Yes | DEBUG | 100% | 30 days | Yes | A (95) | None |
| Auth Service | 0 | Yes | INFO | 100% | 30 days | Yes | A (92) | None |
| Chat Inference | 0 | Yes | DEBUG | 100% | 30 days | Yes | B+ (88) | Token-level logging missing |
| Knowledge Search | 0 | Yes | INFO | 100% | 30 days | Yes | A (90) | None |
| Database Primary | 0 | Yes | INFO | 100% | 30 days | N/A | B (82) | Slow query log sampling |
| Message Queue | 0 | Yes | INFO | 100% | 30 days | Yes | B+ (85) | Dead letter queue logging |
| Code Review | 1 | Yes | DEBUG | 100% | 30 days | Yes | B+ (87) | Async job correlation IDs |
| Payment Service | 1 | Yes | INFO | 100% | 90 days | Yes | A (94) | None |
| Notification Service | 1 | Yes | INFO | 100% | 30 days | Yes | B (80) | Delivery status not logged |
| File Storage | 1 | Yes | INFO | 100% | 30 days | N/A | B+ (86) | Upload failure detail missing |
| Image Processing | 1 | Yes | DEBUG | 100% | 14 days | N/A | B (78) | Processing pipeline gaps |
| Admin Dashboard | 2 | Yes | INFO | 100% | 14 days | Yes | B (75) | Audit log incomplete |
| Search Index | 2 | Yes | INFO | 100% | 14 days | N/A | C+ (68) | Reindex failure logging missing |
| CDN | 2 | No | N/A | N/A | 7 days | N/A | D (45) | **No structured logging** |
| Webhook Service | 2 | No | N/A | N/A | 7 days | N/A | D (40) | **No structured logging** |
| **Overall** | | **93% JSON** | | | | | **B+ (83)** | |

### Metrics coverage — golden signals

| Service | Latency | Traffic | Errors | Saturation | Coverage % | Backfill needed |
|---|---|---|---|---|---|---|
| API Gateway | p50/p90/p99 | RPS, conn | 5xx rate, timeout | CPU, mem, fd | 100% | — |
| Auth Service | p50/p90/p99 | Auth RPS | Auth fail rate | CPU, mem, conn pool | 100% | — |
| Chat Inference | p50/p90/p99 | Tokens/sec | Error rate, timeout | GPU mem, queue depth | 100% | — |
| Knowledge Search | p50/p90/p99 | QPS, index size | Error rate, miss rate | CPU, mem, disk | 100% | — |
| Database Primary | p50/p90/p99 | QPS, conn count | Deadlock, timeout | CPU, mem, disk, conn | 100% | — |
| Message Queue | p50/p90/p99 | Msg/sec, backlog | DLQ rate, timeout | Disk, mem, conn | 100% | — |
| Code Review | p50/p90/p99 | Reviews/min | Error rate, timeout | GPU mem, queue depth | 100% | — |
| Payment Service | p50/p90/p99 | TPS | Decline rate, timeout | CPU, mem, conn | 100% | — |
| File Storage | p50/p90/p99 | Upload/sec, BW | Error rate, timeout | Disk, mem, conn | 100% | — |
| CDN | p50/p90/p99 | Bandwidth, req/s | 5xx rate, origin err | **Missing** | 75% | Saturation |
| Admin Dashboard | p50/p90 | Page views | 5xx rate | **Missing** | 75% | Saturation |
| Webhook Service | p50/p90 | Delivery/sec | Failure rate, retry | **Missing** | 75% | Saturation |
| Search Index | p50/p90 | Index QPS | Error rate | **Missing** | 75% | Saturation |
| Cache Redis | p50/p90 | Ops/sec, hit rate | Error rate, eviction | **Missing** | 75% | Saturation |
| **14 services with gaps** | | | | | **Avg 67%** | **Saturation metrics** |

### Tracing coverage

| Service | Tracing enabled | Sampling rate | Full trace context | Span count/hr | p99 latency | Error rate | Gaps |
|---|---|---|---|---|---|---|---|
| API Gateway | Yes | 10% | Yes | 850K | 12ms | 0.1% | None |
| Auth Service | Yes | 10% | Yes | 320K | 8ms | 0.05% | None |
| Chat Inference | Yes | 5% | Yes | 180K | 450ms | 0.8% | GPU span missing |
| Knowledge Search | Yes | 10% | Yes | 420K | 85ms | 0.3% | None |
| Code Review | Yes | 5% | Yes | 95K | 320ms | 0.6% | Model inference span |
| Payment Service | Yes | 100% | Yes | 180K | 25ms | 0.02% | None |
| Notification Service | Yes | 5% | Partial | 65K | 18ms | 0.4% | Downstream spans missing |
| File Storage | Yes | 5% | Yes | 42K | 15ms | 0.2% | None |
| Image Processing | Yes | 5% | Partial | 28K | 220ms | 0.5% | Pipeline step spans missing |
| Database Primary | Partial | 1% | No | 12K | 5ms | 0.01% | **No distributed tracing** |
| Message Queue | Yes | 5% | Yes | 85K | 3ms | 0.05% | None |
| Cache Redis | Partial | 1% | No | 8K | 1ms | 0.01% | **No distributed tracing** |
| CDN | No | — | — | 0 | — | — | **No tracing** |
| Webhook Service | No | — | — | 0 | — | — | **No tracing** |
| Admin Dashboard | No | — | — | 0 | — | — | **No tracing** |
| **Overall** | **86% enabled** | **10% avg** | **67% full** | **2.8M/hr** | **18ms** | **0.4%** | |

### Alerting coverage

| Alert policy | Alerts | Type | Coverage % | False positive | MTTA | Last tested | Gaps |
|---|---|---|---|---|---|---|---|
| API Gateway | 32 | SLO, threshold, anomaly | 95% | 2.1% | 2.5 min | 2026-08-01 | Rate limit burst detection |
| Auth Service | 24 | SLO, threshold, composite | 92% | 1.5% | 3.2 min | 2026-08-02 | Token brute force detection |
| Chat Inference | 28 | SLO, threshold, anomaly | 88% | 4.5% | 4.8 min | 2026-07-28 | GPU memory leak detection |
| Knowledge Search | 22 | SLO, threshold | 90% | 1.8% | 3.5 min | 2026-08-01 | Index corruption detection |
| Database Primary | 28 | SLO, threshold, composite | 85% | 2.2% | 5.2 min | 2026-07-25 | Connection pool exhaustion |
| Payment Service | 26 | SLO, threshold, anomaly | 95% | 0.8% | 2.1 min | 2026-08-03 | Settlement delay detection |
| Message Queue | 18 | Threshold, anomaly | 88% | 3.2% | 4.5 min | 2026-07-30 | Consumer group lag |
| Code Review | 20 | SLO, threshold, anomaly | 90% | 3.8% | 5.5 min | 2026-07-28 | GPU OOM prediction |
| File Storage | 16 | Threshold | 85% | 2.5% | 6.2 min | 2026-07-25 | Disk fill prediction |
| Notification Service | 14 | Threshold | 82% | 3.0% | 7.5 min | 2026-07-20 | Delivery rate anomaly |
| CDN | 8 | Threshold | 70% | 5.2% | 12.5 min | 2026-06-15 | Origin failure cascade |
| Other (12 services) | 76 | Threshold, basic | 65% | 6.5% | 18.2 min | Various | Multiple gaps |
| **Overall** | **312** | | **91.5%** | **3.1%** | **5.5 min** | | **26 gaps** |

### Alerting gap analysis

| Gap category | Count | Services affected | Severity | Detection method | Risk |
|---|---|---|---|---|---|
| Saturation alerts missing | 8 | CDN, Cache, Admin, Webhook, Search Index, +3 | High | Manual (user reports) | Resource exhaustion undetected |
| Composite/correlation alerts | 6 | API Gateway, Auth, Payment, +3 | High | Manual (incident investigation) | Cascading failures undetected |
| Anomaly detection gaps | 5 | File Storage, Notification, +3 | Medium | Manual (dashboard review) | Gradual degradation undetected |
| SLO burn rate alerts | 4 | Admin Dashboard, Webhook, +2 | Medium | Manual (monthly SLO review) | Error budget exhaustion |
| Dead letter queue alerts | 3 | Message Queue, Webhook, +1 | High | Manual (periodic check) | Message loss undetected |
| **Total** | **26** | **18 services** | | | |

### Dashboard completeness

| Dashboard category | Total | Complete | Partial | Missing | Completeness | Orphaned |
|---|---|---|---|---|---|---|
| Service health (per-service) | 42 | 30 | 8 | 4 | 71% | 2 |
| Infrastructure (shared) | 8 | 6 | 2 | 0 | 75% | 0 |
| Business metrics | 12 | 9 | 2 | 1 | 75% | 1 |
| SLO/SLI tracking | 15 | 12 | 2 | 1 | 80% | 0 |
| Capacity planning | 6 | 4 | 2 | 0 | 67% | 1 |
| Cost analysis | 5 | 4 | 1 | 0 | 80% | 0 |
| Incident response | 4 | 3 | 1 | 0 | 75% | 1 |
| Security monitoring | 4 | 3 | 1 | 0 | 75% | 1 |
| **Total** | **96** | **71** | **19** | **6** | **74%** | **6** |

### Observability maturity by service

| Maturity level | Description | Services | % | Target |
|---|---|---|---|---|
| **L1: None** | No logs, metrics, or traces | 2 (CDN, Webhook) | 5% | 0% |
| **L2: Basic** | Basic logging, minimal metrics, no tracing | 6 | 14% | 0% |
| **L3: Standardized** | Structured logs, golden signals, partial tracing | 18 | 43% | 20% |
| **L4: Comprehensive** | Full telemetry, SLO alerts, anomaly detection | 12 | 29% | 50% |
| **L5: Predictive** | ML-based anomaly detection, predictive alerting | 4 | 10% | 30% |
| **Overall maturity** | | **42 services** | **L3.2** | **L4.0** |

### Observability tooling stack

| Tool | Purpose | Coverage | Monthly cost | Maturity | Issues |
|---|---|---|---|---|---|
| OpenTelemetry | Instrumentation SDK | 36/42 services | $0 (OSS) | L3 | Legacy services not migrated |
| Elasticsearch + Kibana | Log aggregation | 40/42 services | $18K/mo | L3 | Retention cost growing |
| Prometheus + Thanos | Metrics storage | 42/42 services | $8K/mo | L4 | Long-term storage cost |
| Grafana | Visualization | 96 dashboards | $2K/mo | L3 | Dashboard sprawl |
| Jaeger | Distributed tracing | 36/42 services | $5K/mo | L3 | Sampling rate trade-offs |
| Alertmanager | Alert routing | 312 alerts | $0 (OSS) | L3 | Alert fatigue in 3 teams |
| PagerDuty | Incident management | 24/7 coverage | $12K/mo | L4 | Escalation policy gaps |
| Datadog APM | APM (legacy, migrating) | 8 services | $22K/mo | L4 | **Migration to OTel in progress** |
| **Total** | | | **$67K/mo** | | |

### Observability cost per signal

| Signal type | Monthly cost | % of observability budget | Cost per service | Trend | Optimization |
|---|---|---|---|---|---|
| Logs | $28K | 42% | $667/svc | ↑ 15%/mo | Log sampling, retention tiers |
| Metrics | $14K | 21% | $333/svc | ↑ 8%/mo | Cardinality limits, downsampling |
| Traces | $9K | 13% | $250/svc | ↑ 12%/mo | Tail-based sampling, 1%→0.5% |
| Alerting/Incident mgmt | $16K | 24% | $381/svc | → | Alert consolidation, noise reduction |
| **Total** | **$67K** | **100%** | **$1,595/svc** | **↑ 10%/mo** | |

### Observability maturity roadmap

| Initiative | Current | Target | Timeline | Owner | Investment |
|---|---|---|---|---|---|
| Structured logging for CDN + Webhook | L1 | L3 | Q3 2026 | SRE Lead | 2 weeks |
| Saturation metrics backfill | 67% | 100% | Q3 2026 | Platform Lead | 3 weeks |
| OpenTelemetry migration (Datadog → OTel) | 8 svc remaining | 0 svc | Q4 2026 | SRE Lead | 6 weeks |
| Alert gap closure (26 gaps) | 91.5% | 98% | Q4 2026 | SRE Lead | 4 weeks |
| Dashboard consolidation (6 orphaned) | 74% complete | 90% | Q4 2026 | Platform Lead | 3 weeks |
| Log sampling strategy | 100% retention | Tiered retention | Q4 2026 | SRE Lead | 2 weeks |
| Anomaly detection expansion | 5 services | 20 services | Q1 2027 | ML + SRE | 8 weeks |
| Predictive alerting (ML-based) | Pilot (4 svc) | 12 services | Q2 2027 | ML + SRE | 12 weeks |

## Action recommendations

1. **CDN and Webhook structured logging**: 2 services at L1 with no structured logging; implement JSON logging with correlation IDs, target L3 by Q3
2. **Saturation metrics backfill**: 14 services missing saturation monitoring; add CPU/memory/disk/connection saturation metrics, target 100% coverage
3. **Alert gap closure**: 26 alert coverage gaps across 18 services; prioritize saturation alerts (8 gaps) and composite alerts (6 gaps), target 98% coverage
4. **Distributed tracing for databases**: Database Primary, Cache Redis at partial tracing; implement full OpenTelemetry instrumentation, enable trace context propagation
5. **OpenTelemetry migration completion**: 8 services still on Datadog APM; complete migration to OTel, decommission Datadog APM, save $22K/mo
6. **Dashboard consolidation**: 6 orphaned dashboards, 19 partial; audit and consolidate, remove unused dashboards, enforce dashboard ownership
7. **Log cost optimization**: log costs growing 15%/mo; implement tiered retention (hot 7d, warm 30d, cold 90d), apply log sampling for DEBUG level
8. **Alert fatigue reduction**: 3.1% false positive rate; tune alert thresholds, implement alert correlation, reduce alert noise by 30%
9. **Observability maturity L4 target**: 29% at L4; move 9 services from L3→L4 through standardization, target 50% by Q4
10. **Monthly observability review**: review coverage metrics, alert gaps, tooling costs, and maturity progression with SRE and platform teams



- Dashboards as decoration → creating beautiful dashboards that nobody watches during incidents; dashboards must be battle-tested during actual incidents, not just admired during demos
- Alerting on everything → creating alerts for every metric "just in case"; every alert should require a response — if there's no action, it's noise, not an alert
- Logs without structure → `console.log("something happened")` without structured fields; unstructured logs are unsearchable during incidents, always use JSON with correlation IDs
- Tracing without sampling strategy → 100% tracing for all requests; this is cost-prohibitive at scale, use head-based sampling with tail-based retention for errors
- Observability as ops-only → "SRE handles monitoring"; every engineer is responsible for instrumenting their service, observability is a development practice, not an ops add-on

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-capacity-planning](dashboard-capacity-planning.md) — capacity planning and forecasting
- Same class: [dashboard-cost-and-resource](dashboard-cost-and-resource.md) — cloud cost and FinOps
- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident trends and analysis
- Same class: [dashboard-oncall-health](../incident-response/dashboard-oncall-health.md) — oncall health and alert fatigue
- References: Google SRE — *Monitoring Distributed Systems* (Chapter 6); Honeycomb — *Observability Engineering*; OpenTelemetry — *Observability Maturity Model*; Charity Majors — *Observability 2.0*; CNCF — *Cloud Native Observability Whitepaper*