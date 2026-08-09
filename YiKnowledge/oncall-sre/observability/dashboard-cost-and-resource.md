---
title: cost and cloud resource dashboard
aliases:
- cost dashboard
- cloud cost dashboard
- finops dashboard
- resource cost dashboard
tags:
- dashboard
- cost
- cloud
- finops
- resource
- budget
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
- executive
- engineer
benefit: cloud and infrastructure cost visible at a glance with optimization opportunities
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./capacity-and-cost.md
- ./dashboard-system-health.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
- ../../executive/strategy/dashboard-executive-kpi.md
tacit: false
---

# cost and cloud resource dashboard

> **As a** tech lead, **I want to** track cloud and infrastructure costs across all services, **so that** cost anomalies are detected early and optimization opportunities are identified.

> Cloud cost is one of the largest engineering expenses. This dashboard tracks cost by service, resource type, and team, with optimization recommendations and budget forecasting.

## Summary

- 5 cost dimensions: cost by service, cost by resource type, cost by team, cost trends and forecasting, optimization opportunities
- Cost tracked per service, per environment (prod/staging/dev), per resource type
- Anomaly detection: cost spikes > 20% day-over-day trigger alerts
- Optimization savings tracked: reserved instances, right-sizing, unused resources, storage tiering
- Dashboard refreshes daily; monthly cost review with engineering leadership

## Core viewpoints

- Every service has a cost — engineers must see the cost impact of their architectural decisions
- Cost optimization is continuous, not a one-time project — review monthly, act quarterly
- Reserved instances and committed use discounts are the highest-leverage savings (30-50%)
- Unused resources are pure waste — idle load balancers, unattached disks, orphaned IPs

## Key information

### 5-panel cost overview

```
┌──────────────────────────────────────────────────────────────────┐
│  COST BY SERVICE                │  COST BY RESOURCE TYPE          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  LLM API:    $28.0k (23%)│  │  │  Compute:  $42.0k (35%) │   │
│  │  Compute:    $22.5k (19%)│  │  │  API:      $28.0k (23%) │   │
│  │  Database:   $15.2k (13%)│  │  │  Database: $15.2k (13%) │   │
│  │  Storage:    $11.8k (10%)│  │  │  Storage:  $11.8k (10%) │   │
│  │  Network:    $8.5k  (7%) │  │  │  Network:  $8.5k  (7%)  │   │
│  │  Other:      $34.0k (28%)│  │  │  Other:    $14.5k (12%) │   │
│  │  TOTAL:      $120.0k     │  │  │  TOTAL:    $120.0k      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  COST TRENDS (6 MONTHS)         │  OPTIMIZATION OPPORTUNITIES     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Jan: $85k  Apr: $98k   │   │  │  Reserved:    $8.2k/mo  │   │
│  │  Feb: $88k  May: $105k  │   │  │  Right-size:  $3.5k/mo  │   │
│  │  Mar: $92k  Jun: $112k  │   │  │  Unused:      $2.1k/mo  │   │
│  │  Jul: $118k  Aug: $120k │   │  │  Storage:     $1.8k/mo  │   │
│  │  Trend:  ↑ 8% MoM       │   │  │  Arch:        $4.2k/mo  │   │
│  │  Budget:  68% of $175k  │   │  │  Total save:  $19.8k/mo │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Cost by service (monthly)

| Service | Compute | Storage | Network | API/External | Total | % of total | MoM |
|---|---|---|---|---|---|---|---|
| AI Chat Platform | $5,200 | $1,800 | $1,200 | $22,000 | $30,200 | 25.2% | +8% |
| User/Account Service | $3,800 | $2,400 | $900 | $500 | $7,600 | 6.3% | +2% |
| Search Service | $4,200 | $3,200 | $1,100 | $1,200 | $9,700 | 8.1% | +5% |
| Knowledge/Storage | $2,800 | $4,400 | $800 | $2,800 | $10,800 | 9.0% | +12% |
| Analytics Pipeline | $6,500 | $2,200 | $1,500 | $800 | $11,000 | 9.2% | +3% |
| CI/CD + Dev Tools | $3,200 | $1,200 | $600 | $400 | $5,400 | 4.5% | +1% |
| Monitoring/Observ | $2,800 | $3,800 | $500 | $200 | $7,300 | 6.1% | +5% |
| API Gateway | $4,500 | $800 | $1,200 | $100 | $6,600 | 5.5% | +2% |
| Development/Staging | $6,500 | $2,400 | $600 | $500 | $10,000 | 8.3% | +4% |
| Security/Compliance | $1,800 | $600 | $300 | $1,200 | $3,900 | 3.3% | +2% |
| Shared/Overhead | $2,200 | $1,500 | $800 | $1,000 | $5,500 | 4.6% | +3% |
| Other | $4,500 | $3,600 | $1,000 | $2,900 | $12,000 | 10.0% | +5% |

### Cost by environment

| Environment | Monthly cost | % of total | Cost per engineer | Target |
|---|---|---|---|---|
| Production | $82,000 | 68.3% | $1,745 | < 70% |
| Staging | $18,000 | 15.0% | $383 | < 15% |
| Development | $12,000 | 10.0% | $255 | < 10% |
| CI/CD | $5,000 | 4.2% | $106 | < 5% |
| Sandbox/Experiment | $3,000 | 2.5% | $64 | < 5% |

### Cost anomaly detection (last 7 days)

| Date | Service | Expected | Actual | Variance | Root cause | Action |
|---|---|---|---|---|---|---|
| Aug 5 | Knowledge/Storage | $350/day | $520/day | +48% | RAG index rebuild | Expected, one-time |
| Aug 3 | AI Chat | $950/day | $1,340/day | +41% | Traffic spike from launch | Scaling expected |
| Aug 2 | Dev/Staging | $425/day | $680/day | +60% | Staging env left at full scale | **Action: scale down** |

### Optimization opportunities

| Opportunity | Monthly savings | Implementation effort | Payback | Status |
|---|---|---|---|---|
| Reserved instances (compute) | $5,200 | Low (purchase commitment) | Immediate | In progress |
| Committed use (LLM API) | $3,000 | Low (contract) | Immediate | Evaluating |
| Right-size over-provisioned VMs | $2,400 | Medium (analysis + migration) | 2 weeks | Planned |
| Delete unused resources | $1,800 | Low (cleanup) | 1 week | Partial |
| Storage tiering (hot → cold) | $1,500 | Medium (policy setup) | 2 weeks | Not started |
| Auto-scale dev/staging (off-hours) | $1,200 | Low (scheduler) | 1 week | Not started |
| CDN/cache optimization | $1,100 | Medium | 3 weeks | Not started |
| Log retention tuning | $800 | Low (policy change) | Immediate | Not started |
| Container right-sizing | $600 | Medium (analysis) | 2 weeks | Not started |
| **Total identified** | **$17,600** | | | |

### Cost per key metric

| Metric | Cost | Benchmark | Health |
|---|---|---|---|
| Cost per DAU | $0.42 | $0.30-0.60 (SaaS) | Green |
| Cost per API request | $0.008 | $0.005-0.015 | Green |
| Cost per LLM task | $0.12 | $0.05-0.20 | Yellow |
| Infrastructure cost / revenue | 14.2% | 10-20% (SaaS) | Green |
| Cost per engineer (tools + infra) | $2,553 | $2,000-4,000 | Green |

### Monthly budget vs actual

| Month | Budget | Actual | Variance | Cumulative variance |
|---|---|---|---|---|
| Jan | $90,000 | $85,000 | -$5,000 (5.6%) | -$5,000 |
| Feb | $92,000 | $88,000 | -$4,000 (4.3%) | -$9,000 |
| Mar | $95,000 | $92,000 | -$3,000 (3.2%) | -$12,000 |
| Apr | $100,000 | $98,000 | -$2,000 (2.0%) | -$14,000 |
| May | $105,000 | $105,000 | $0 (0%) | -$14,000 |
| Jun | $112,000 | $112,000 | $0 (0%) | -$14,000 |
| Jul | $118,000 | $118,000 | $0 (0%) | -$14,000 |
| Aug | $125,000 | $120,000 (proj) | -$5,000 (4.0%) | -$19,000 |

## Action recommendations

1. **Tag everything**: every resource must have `service`, `environment`, `team`, and `cost-center` tags
2. **Monthly cost review**: first week of each month, review cost by service; identify top 3 optimization opportunities
3. **Anomaly alerts**: any service with > 20% day-over-day cost increase triggers Slack notification to team lead
4. **Dev/staging shutdown**: auto-scale non-production environments to zero during off-hours (nights, weekends)
5. **Reserved instances**: commit to 1-year reserved instances for stable production workloads; target 60% coverage
6. **Unused resource cleanup**: monthly automated scan for unattached resources; delete after 7-day grace period
7. **Cost per feature attribution**: track cost of each product feature; identify high-cost, low-value features
8. **Budget forecasting**: use 3-month rolling average to forecast next quarter; request budget adjustments early



- No cost visibility → engineers don't know what their services cost; every team should see their cost dashboard
- Over-provisioning as default → "just in case" capacity; right-size based on actual peak + 20% buffer
- Dev/staging at production scale → non-production environments running 24/7 at full capacity; auto-scale down
- Ignoring committed use discounts → paying on-demand rates for stable workloads; reserved instances save 30-50%
- Cost optimization as afterthought → optimizing only when budget is overrun; cost optimization is continuous

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system health and availability
- Same class: [capacity-and-cost](capacity-and-cost.md) — capacity and cost template
- Upstream: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — engineering capacity
- Upstream: [dashboard-executive-kpi](../../executive/strategy/dashboard-executive-kpi.md) — executive KPI rollup
- References: AWS — *Well-Architected Framework (Cost Optimization)*; FinOps Foundation — *FinOps Framework*; Google — *Cost Optimization Best Practices*