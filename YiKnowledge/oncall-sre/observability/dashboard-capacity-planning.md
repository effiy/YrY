---
title: capacity planning dashboard
aliases:
- resource forecasting dashboard
- infrastructure capacity dashboard
- scaling readiness dashboard
- headroom dashboard
tags:
- dashboard
- capacity
- forecasting
- scaling
- infrastructure
- headroom
- resource-planning
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- oncall-sre
- tech-lead
- executive
benefit: infrastructure capacity and scaling readiness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-system-health.md
- ./dashboard-cost-and-resource.md
- ./dashboard-business-continuity.md
- ../../tech-lead/roadmap/dashboard-roadmap-progress.md
tacit: false
---

# capacity planning dashboard

> **As an** SRE, **I want to** track infrastructure capacity and forecast future demand, **so that** resources are provisioned ahead of demand, scaling is automated, and capacity-related incidents are prevented.

> Capacity planning is the bridge between business growth and infrastructure reality. This dashboard tracks demand forecasting, resource headroom, scaling triggers, cost efficiency, and capacity governance across all services and environments.

## Summary

- 5 capacity dimensions: demand forecasting, resource headroom, scaling triggers, cost efficiency, capacity governance
- 42 services tracked across compute, storage, network, and database tiers
- Capacity forecast 12 months forward using historical growth + pipeline input from product/engineering
- Headroom thresholds: warning at 30%, critical at 15%, emergency procurement at 5%
- Dashboard reviewed monthly; capacity planning review quarterly with finance and engineering leadership

## Core viewpoints

- Capacity is a lead indicator, not a lag indicator — you need to know about capacity constraints 3-6 months before they become incidents
- Headroom is insurance, not waste — running at 100% utilization is a capacity incident waiting to happen; target 60-70% utilization with 30-40% headroom
- Demand comes from many sources — organic user growth, feature launches, marketing campaigns, seasonal patterns, and data growth all consume capacity
- Capacity planning is a cross-functional sport — SRE owns the infrastructure, but product, engineering, and finance all drive demand

## Key information

### 5-panel capacity overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DEMAND FORECASTING               │  RESOURCE HEADROOM               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Current:   8,500 cores  │   │  │  Compute:    38% █▌     │   │
│  │  Forecast 3m: 9,800      │   │  │  Storage:    42% ██     │   │
│  │  Forecast 6m: 11,200     │   │  │  Network:    55% ██▌    │   │
│  │  Forecast 12m: 14,500    │   │  │  Database:   28% █▌     │   │
│  │  Growth rate: 5.8%/mo    │   │  │  Memory:     45% ██     │   │
│  │  Pipeline: 3 launches    │   │  │  Critical:    2 services│   │
│  │  Seasonality: Q4 +35%    │   │  │  Warning:     5 services│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SCALING TRIGGERS                 │  COST EFFICIENCY                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Auto-scale: 28 (67%)   │   │  │  Cost/vCPU:  $0.042/hr  │   │
│  │  Manual:     10 (24%)   │   │  │  Cost/TB:    $23/mo     │   │
│  │  None:        4 (9%)    │   │  │  Cost/req:   $0.0012    │   │
│  │  Trigger time: 90s avg  │   │  │  Reserved:   62% ███    │   │
│  │  False positive: 3.2%   │   │  │  Spot:       28% █▌     │   │
│  │  Scale-in:     85% eff. │   │  │  On-demand:   10% ▌     │   │
│  │  Cold start:   4.2s avg │   │  │  Waste:       $28K/mo   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Service capacity by tier

| Tier | Services | Current usage | Headroom | 3-month forecast | 6-month forecast | Status |
|---|---|---|---|---|---|---|
| **Tier 0 (critical)** | 6 | 62% | 38% | 71% | 82% | Green |
| — API Gateway | | 58% | 42% | 65% | 74% | Green |
| — Auth Service | | 45% | 55% | 52% | 60% | Green |
| — Chat Inference | | 72% | 28% | 85% | 98% | **Warning** |
| — Knowledge Search | | 55% | 45% | 62% | 71% | Green |
| — Database Primary | | 68% | 32% | 78% | 89% | **Warning** |
| — Message Queue | | 48% | 52% | 55% | 63% | Green |
| **Tier 1 (business)** | 12 | 55% | 45% | 62% | 71% | Green |
| **Tier 2 (internal)** | 14 | 42% | 58% | 48% | 55% | Green |
| **Tier 3 (dev/test)** | 10 | 35% | 65% | 38% | 42% | Green |
| **Overall** | **42** | **52%** | **48%** | **59%** | **68%** | Green |

### Demand forecast detail

| Driver | Current load | Growth rate | 3-month | 6-month | 12-month | Confidence |
|---|---|---|---|---|---|---|
| Organic user growth | 4,200 cores | 4.2%/mo | 4,750 | 5,380 | 6,900 | High (85%) |
| Feature launches (pipeline) | 0 | Event-based | 450 | 1,100 | 1,800 | Medium (60%) |
| — AI Code Review v2 GA | | | 150 | 350 | 500 | Medium |
| — Multi-modal Chat | | | 100 | 300 | 450 | Medium |
| — Real-time Collaboration | | | 200 | 450 | 850 | Low |
| Data growth (storage) | 280 TB | 6.5%/mo | 340 TB | 410 TB | 600 TB | High (90%) |
| Seasonal (Q4 holiday) | 0 | Seasonal | 0 | 850 | 0 | High (80%) |
| Marketing campaigns | 0 | Campaign-based | 200 | 350 | 500 | Low (40%) |
| **Total forecast** | **8,500 cores** | **5.8%/mo** | **9,800** | **11,200** | **14,500** | |

### Resource headroom by type

| Resource | Total capacity | Allocated | Available | Headroom % | Warning threshold | Critical threshold | Status |
|---|---|---|---|---|---|---|---|
| **Compute (vCPU)** | 12,000 | 7,800 | 4,200 | 35% | 30% | 15% | Green |
| — Production | 8,500 | 5,950 | 2,550 | 30% | 30% | 15% | **Warning** |
| — Non-production | 3,500 | 1,850 | 1,650 | 47% | 30% | 15% | Green |
| **Memory (GB)** | 48,000 | 26,400 | 21,600 | 45% | 30% | 15% | Green |
| **Storage (TB)** | 500 | 290 | 210 | 42% | 30% | 15% | Green |
| — SSD (performance) | 200 | 142 | 58 | 29% | 30% | 15% | **Warning** |
| — HDD (capacity) | 300 | 148 | 152 | 51% | 30% | 15% | Green |
| **Network (Gbps)** | 40 | 18 | 22 | 55% | 40% | 20% | Green |
| **Database connections** | 8,000 | 5,760 | 2,240 | 28% | 30% | 15% | **Warning** |
| **IP addresses (private)** | 4,096 | 2,458 | 1,638 | 40% | 30% | 15% | Green |
| **Kubernetes pods** | 5,000 | 2,850 | 2,150 | 43% | 30% | 15% | Green |

### Services at risk (headroom < 35%)

| Service | Resource | Current usage | Headroom | Trend | Exhaustion date (est.) | Action |
|---|---|---|---|---|---|---|
| Chat Inference | vCPU | 72% | 28% | ↑ 3%/mo | 2026-11 (5 months) | Add GPU nodes, evaluate model quantization |
| Database Primary | Connections | 68% | 32% | ↑ 2%/mo | 2027-02 (8 months) | Connection pooling review, read replica |
| Chat Inference | GPU Memory | 78% | 22% | ↑ 4%/mo | 2026-10 (4 months) | GPU expansion, model sharding |
| AI Code Review | vCPU | 65% | 35% | ↑ 5%/mo | 2026-12 (6 months) | Pre-provision for GA launch |
| Production SSD | Storage | 71% | 29% | ↑ 2.5%/mo | 2027-01 (7 months) | Tiered storage, data lifecycle |
| Elasticsearch Cluster | Memory | 64% | 36% | ↑ 3%/mo | 2027-02 (8 months) | Add data nodes, index optimization |

### Scaling trigger inventory

| Service | Scale metric | Trigger | Scale-out time | Scale-in time | Cooldown | False positive rate | Issues |
|---|---|---|---|---|---|---|---|
| API Gateway | CPU > 70% | Auto (HPA) | 60s | 300s | 180s | 2.1% | None |
| Chat Inference | GPU queue depth > 10 | Auto (KEDA) | 90s | 600s | 300s | 4.5% | Cold start latency spikes |
| Knowledge Search | Request latency > 500ms | Auto (HPA) | 45s | 180s | 120s | 1.8% | None |
| Auth Service | RPS > 5,000/node | Auto (HPA) | 30s | 120s | 90s | 0.5% | None |
| Database | Connection count > 80% | Manual | — | — | — | N/A | Needs auto-scaling |
| Code Review | GPU queue depth > 8 | Auto (KEDA) | 120s | 480s | 240s | 3.8% | GPU provisioning delay |
| Image Processing | SQS queue depth > 100 | Auto (KEDA) | 75s | 300s | 180s | 2.2% | None |
| Notification Service | CPU > 65% | Auto (HPA) | 45s | 150s | 90s | 1.5% | None |
| Cache Redis | Memory > 75% | Manual | — | — | — | N/A | Cluster mode migration |
| CDN | Bandwidth > 80% | Auto | 0s | 0s | 0s | 0% | Auto-scaling by provider |

### Capacity procurement pipeline

| Procurement | Resource | Quantity | Cost | Lead time | Needed by | Status | Approver |
|---|---|---|---|---|---|---|---|
| GPU nodes (A10G) | 8× GPU | 4 nodes | $48K/mo | 8 weeks | 2026-10-01 | In review | VP Eng |
| Compute nodes (c7i) | vCPU | 200 cores | $12K/mo | 4 weeks | 2026-09-15 | Approved | CTO |
| SSD storage expansion | Storage | 50 TB | $6K/mo | 2 weeks | 2026-09-01 | Approved | SRE Lead |
| Reserved Instances (3yr) | vCPU | 500 cores | -$18K/mo (savings) | 1 week | 2026-09-30 | In review | Finance |
| CDN capacity reservation | Bandwidth | 20 Gbps | $8K/mo | 1 week | 2026-11-01 | Planned | SRE Lead |
| Database read replicas | RDS | 3 replicas | $9K/mo | 1 week | 2026-10-15 | Planned | Platform Lead |

### Capacity governance

| Policy | Compliance | Last audit | Owner | Issues |
|---|---|---|---|---|
| All Tier 0 services must have auto-scaling | 5/6 (83%) | 2026-07 | SRE Lead | Database Manual scaling |
| Capacity review before feature launch | 8/12 (67%) | 2026-08 | Platform Lead | 4 launches skipped review |
| Monthly headroom report to leadership | 6/6 (100%) | 2026-08 | SRE Lead | None |
| 12-month rolling forecast updated quarterly | 2/4 (50%) | 2026-07 | SRE Lead | Q2, Q3 forecast stale |
| Reserved instance coverage > 60% | 62% | 2026-08 | Finance | On track |
| Non-production auto-stop outside business hours | 18/20 (90%) | 2026-08 | Platform Lead | 2 dev envs exempted |
| Capacity incident postmortem required | 4/4 (100%) | 2026-07 | SRE Lead | None |
| Budget variance < 15% | 8% | 2026-08 | Finance | On track |

### Capacity incident log (last 12 months)

| Date | Service | Incident | Root cause | Duration | Impact | Prevention |
|---|---|---|---|---|---|---|
| 2026-07-12 | Chat Inference | GPU OOM | Model version increased memory 40% | 45 min | P1, 30% requests failed | Pre-deploy resource profiling |
| 2026-05-28 | Knowledge Search | CPU exhaustion | Indexing job + peak traffic overlap | 22 min | P2, 15% latency increase | Indexing job resource limits |
| 2026-03-15 | Database | Connection pool exhaustion | Connection leak in new API version | 65 min | P1, 100% writes blocked | Connection pool monitoring |
| 2026-01-08 | API Gateway | Rate limiter overload | Marketing campaign 3x traffic spike | 15 min | P2, rate limiting too aggressive | Pre-campaign capacity review |
| 2025-11-20 | File Storage | Disk full | Log rotation failure | 90 min | P1, file uploads blocked | Disk usage predictive alerts |

## Action recommendations

1. **Chat Inference GPU expansion**: 78% GPU memory, 4-month exhaustion; procure 4× A10G nodes, evaluate model quantization as interim measure
2. **Database auto-scaling**: only manual scaling for Tier 0 database; implement connection pool auto-scaling or migrate to Aurora Serverless v2
3. **Production SSD headroom**: 29% headroom, 7-month runway; add 50 TB, implement data lifecycle policies for cold data
4. **Q4 seasonal preparation**: +35% historical Q4 spike; pre-provision 850 cores by October, load test at 1.5× forecast
5. **Feature launch capacity review**: 67% compliance; mandate capacity review gate in launch checklist for all Tier 1+ features
6. **Reserved instance optimization**: 62% coverage, target 75%; analyze 12-month steady-state, convert 500+ cores to 3-year RIs
7. **Forecast accuracy improvement**: Q2/Q3 forecasts stale; automate forecast model with actuals feedback loop, review monthly
8. **GPU cold start optimization**: 4.2s cold start, 4.5% false positives; implement GPU instance pre-warming, model caching
9. **Non-production right-sizing**: 47% headroom in non-prod; reduce non-prod capacity 20% outside business hours, auto-stop
10. **Monthly capacity review**: review headroom, forecast accuracy, procurement pipeline, and capacity incidents with leadership



- Just-in-time capacity → ordering hardware when you're already at 85% utilization; lead times for hardware are 8-12 weeks, and cloud quotas take days to increase
- Average-based forecasting → using average utilization to plan capacity; you need to plan for peak, not average — the 95th percentile matters
- Over-provisioning as safety → buying 3× the needed capacity "just in case"; over-provisioning hides architecture inefficiencies and wastes budget
- Scaling without cost awareness → auto-scaling without cost guardrails; every auto-scale event should have a budget impact analysis
- Forecast as a one-time exercise → creating an annual forecast and never updating it; forecasts decay quickly, update monthly with actuals

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-cost-and-resource](dashboard-cost-and-resource.md) — cloud cost and FinOps
- Same class: [dashboard-business-continuity](dashboard-business-continuity.md) — BC/DR planning
- Same class: [dashboard-roadmap-progress](../../tech-lead/roadmap/dashboard-roadmap-progress.md) — feature pipeline
- References: Google SRE — *Demand Forecasting and Capacity Planning*; AWS — *Well-Architected Performance Efficiency Pillar*; Azure — *Capacity Planning Best Practices*; Gartner — *IT Infrastructure Capacity Planning*; NIST — *SP 800-34 Contingency Planning*