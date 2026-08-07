---
title: sustainability dashboard
aliases:
- green engineering dashboard
- carbon footprint dashboard
- cloud sustainability dashboard
- ESG engineering dashboard
tags:
- dashboard
- sustainability
- green-engineering
- carbon-footprint
- energy-efficiency
- esg
category: executive/strategy
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- executive
- tech-lead
- oncall-sre
benefit: engineering sustainability and carbon footprint visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-executive-kpi.md
- ../../oncall-sre/observability/dashboard-cost-and-resource.md
- ../../engineer/architecture-design/dashboard-architecture-health.md
- ../../oncall-sre/observability/dashboard-system-health.md
tacit: false
---

# sustainability dashboard

> **As an** executive, **I want to** track engineering sustainability and carbon footprint, **so that** environmental impact is measured, reduced, and aligned with corporate ESG goals.

> Sustainable engineering is both a responsibility and an efficiency driver — the most carbon-efficient architecture is usually the most cost-efficient. This dashboard tracks carbon footprint, energy efficiency, resource optimization, green architecture, and sustainability culture.

## Summary

- 5 sustainability dimensions: carbon footprint, energy efficiency, resource optimization, green architecture, sustainability culture
- Carbon tracked across Scope 1 (direct), Scope 2 (electricity), and Scope 3 (cloud, vendor, commute) emissions
- Energy efficiency measured by PUE, server utilization, and energy per request
- Resource optimization tracked by waste elimination, idle resource termination, and right-sizing
- Dashboard reviewed quarterly; sustainability report published annually

## Core viewpoints

- Carbon is a cost proxy — high carbon footprint correlates with high infrastructure cost; optimizing for carbon often optimizes for cost
- The greenest compute is the compute you don't use — idle resources, over-provisioned instances, and unused environments are both carbon and cost waste
- Sustainability is architectural — green software principles (carbon-aware scheduling, demand shaping, efficient data storage) are architecture decisions
- You can't improve what you don't measure — carbon accounting for software is emerging but essential; start with what you can measure

## Key information

### 5-panel sustainability overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CARBON FOOTPRINT                │  ENERGY EFFICIENCY               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:    285 tCO2e/yr │   │  │  PUE (cloud):  1.15     │   │
│  │  Scope 2:  180 (63%)    │   │  │  Server util:  62% ███  │   │
│  │  Scope 3:   95 (33%)    │   │  │  Energy/req:   0.8 Wh   │   │
│  │  Scope 1:   10 (4%)     │   │  │  Renewable:    72% ███▌ │   │
│  │  Per user:  2.3 kg/yr   │   │  │  Carbon/req:   0.15 g   │   │
│  │  Trend:     ↓ 8% YoY    │   │  │  Idle waste:   18%      │   │
│  │  Target:    ↓ 25% by 2028│  │  │  Green region: 65% ███  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RESOURCE OPTIMIZATION           │  GREEN ARCHITECTURE              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Waste:      $32K/mo    │   │  │  Carbon-aware: 3 services│   │
│  │  Idle:       15% of EC2 │   │  │  Demand shaping: 2 svcs │   │
│  │  Right-size: 68% ███▌   │   │  │  Lightweight:  78% ███▌ │   │
│  │  Orphaned:   22 volumes │   │  │  Caching:      85% ████ │   │
│  │  Over-provision: 12 svc │   │  │  Data min:     72% ███▌ │   │
│  │  Lifecycle:   72% ███▌  │   │  │  Dark data:     8 TB    │   │
│  │  Spot:        35% █▌    │   │  │  Green score:  72/100   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Carbon footprint breakdown

| Emission source | Scope | tCO2e/year | % of total | YoY change | Reduction lever |
|---|---|---|---|---|---|
| Cloud compute (AWS us-east-1) | 2 | 95 | 33% | ↓ 5% | Right-sizing, spot instances |
| Cloud compute (AWS eu-west-1) | 2 | 45 | 16% | ↓ 8% | Green region (renewable) |
| Cloud compute (AWS ap-southeast-1) | 2 | 40 | 14% | → | Migration to green region |
| Cloud storage (S3, EBS) | 2 | 28 | 10% | ↑ 3% | Lifecycle policies, tiering |
| Cloud networking (data transfer) | 2 | 22 | 8% | ↑ 5% | CDN optimization, compression |
| SaaS/third-party vendors | 3 | 55 | 19% | ↑ 10% | Vendor sustainability assessment |
| Employee commute | 3 | 25 | 9% | ↓ 15% | Remote work policy |
| Business travel | 3 | 12 | 4% | ↓ 20% | Virtual-first meetings |
| Office energy | 1 | 8 | 3% | ↓ 10% | LED, smart HVAC |
| Other (devices, catering) | 1 | 2 | 1% | → | Device lifecycle extension |
| **Total** | | **285** | | **↓ 8%** | |

### Carbon per workload

| Workload | Compute (tCO2e) | Storage (tCO2e) | Network (tCO2e) | Total | Per 1M requests | Trend |
|---|---|---|---|---|---|---|
| AI Chat inference | 52 | 5 | 8 | 65 | 0.18 g | ↑ 12% (volume growth) |
| AI Code Review | 28 | 3 | 4 | 35 | 0.22 g | ↑ 8% |
| Knowledge Search | 22 | 8 | 5 | 35 | 0.12 g | → |
| Knowledge Indexing | 15 | 4 | 2 | 21 | 0.45 g | ↑ 5% |
| User Authentication | 8 | 2 | 1 | 11 | 0.05 g | → |
| API Gateway | 12 | 1 | 3 | 16 | 0.03 g | → |
| CI/CD Pipeline | 18 | 2 | 1 | 21 | N/A | ↓ 5% |
| Dev/Test Environments | 25 | 5 | 2 | 32 | N/A | ↓ 8% |
| Analytics/Reporting | 10 | 15 | 3 | 28 | 0.35 g | ↑ 3% |
| Other | 12 | 4 | 5 | 21 | — | → |
| **Total** | **202** | **49** | **34** | **285** | | |

### Energy efficiency metrics

| Metric | Current | Target | Industry benchmark | Status |
|---|---|---|---|---|
| Server utilization (avg) | 62% | > 70% | 50-65% | Yellow |
| Energy per API request | 0.8 Wh | < 0.6 Wh | 1.0 Wh | Yellow |
| Renewable energy (% of cloud) | 72% | > 90% | 50-75% | Yellow |
| Carbon intensity (gCO2e/kWh) | 285 | < 200 | 300-400 | Yellow |
| Network data transfer efficiency | 78% | > 85% | 70-80% | Yellow |
| Storage efficiency (GB per user) | 2.8 GB | < 2.0 GB | 3-5 GB | Yellow |
| Idle resource waste (% of spend) | 18% | < 10% | 15-25% | Red |
| GPU utilization (AI workloads) | 58% | > 75% | 50-65% | Red |

### Resource waste audit

| Waste category | Monthly cost | Annualized | Carbon impact | Root cause | Remediation effort |
|---|---|---|---|---|---|
| Idle EC2 instances (non-prod nights/weekends) | $8,500 | $102K | 15 tCO2e | No auto-stop for dev environments | 2 days (auto-scheduling) |
| Over-provisioned instances (30%+ headroom) | $7,200 | $86K | 12 tCO2e | Conservative capacity planning | 5 days (right-sizing review) |
| Orphaned EBS volumes | $3,800 | $46K | 8 tCO2e | No cleanup on instance termination | 1 day (automation) |
| Unused elastic IPs | $1,200 | $14K | 2 tCO2e | Poor IP lifecycle management | 0.5 day |
| Old snapshots (beyond retention) | $4,500 | $54K | 10 tCO2e | Snapshot lifecycle not enforced | 1 day (lifecycle policy) |
| Non-production RDS (24/7) | $4,800 | $58K | 8 tCO2e | Dev databases run 24/7 | 3 days (auto-stop) |
| Dark data (unused S3 objects > 90 days) | $2,000 | $24K | 5 tCO2e | No lifecycle policies | 1 day (S3 lifecycle) |
| **Total waste** | **$32,000/mo** | **$384K/yr** | **60 tCO2e** | | **13.5 days** |

### Green architecture scorecard

| Green software principle | Services compliant | % of 25 services | Target | Gap |
|---|---|---|---|---|
| **Carbon-aware scheduling** — run workloads when/where carbon is lowest | 3 | 12% | 50% | 10 services |
| **Demand shaping** — shift flexible workloads to low-carbon periods | 2 | 8% | 30% | 6 services |
| **Lightweight design** — minimize compute/memory/storage per function | 19 | 76% | 90% | 6 services |
| **Caching efficiency** — reduce redundant computation | 21 | 84% | 95% | 4 services |
| **Data minimization** — collect, store, process only what's needed | 18 | 72% | 85% | 7 services |
| **Network optimization** — minimize data transfer, compress, CDN | 20 | 80% | 90% | 5 services |
| **Resource lifecycle** — auto-scale, auto-terminate, use spot | 14 | 56% | 80% | 11 services |
| **Observability efficiency** — right-size logs, metrics, traces | 15 | 60% | 80% | 10 services |
| **Overall green architecture score** | | **72/100** | **> 85** | |

### Dark data inventory

| Data category | Volume | Age (avg) | Last accessed | Annual storage cost | Carbon footprint | Action |
|---|---|---|---|---|---|---|
| Old logs (> 1 year) | 3.2 TB | 18 months | Never | $4,800 | 2.5 tCO2e | Archive to glacier or delete |
| Unused database snapshots | 1.8 TB | 8 months | Never | $3,200 | 1.8 tCO2e | Delete after retention check |
| Abandoned test data | 1.2 TB | 14 months | 6+ months | $2,100 | 1.2 tCO2e | Delete |
| Duplicate backups | 0.8 TB | 6 months | Never | $1,500 | 0.8 tCO2e | Deduplicate |
| Legacy analytics exports | 0.6 TB | 22 months | 12+ months | $900 | 0.5 tCO2e | Delete or archive |
| Other | 0.4 TB | Various | Various | $700 | 0.4 tCO2e | Review |
| **Total dark data** | **8.0 TB** | | | **$13,200/yr** | **7.2 tCO2e** | |

### Sustainability culture & practices

| Practice | Adoption | Target | Maturity |
|---|---|---|---|
| Carbon literacy training | 45% of engineers | 80% | L2 |
| Green software principles in code review | 35% | 75% | L2 |
| Carbon budget per team | 0% | 100% | L0 |
| Sustainability in architecture reviews | 25% | 90% | L1 |
| Carbon dashboards accessible to teams | 60% | 100% | L2 |
| Green procurement policy | 55% | 90% | L2 |
| Carbon-aware CI/CD decisions | 0% | 50% | L0 |
| Sustainability OKRs | 1 team (Platform) | All teams | L1 |
| **Overall sustainability maturity** | | | **L1-L2** |

### Carbon reduction initiatives

| Initiative | Carbon reduction | Cost savings | Effort | Priority | Status |
|---|---|---|---|---|---|
| Auto-stop non-production environments | 15 tCO2e/yr | $102K/yr | 2 days | P0 | Planned |
| Right-sizing over-provisioned instances | 12 tCO2e/yr | $86K/yr | 5 days | P0 | Planned |
| GPU spot instance migration (AI inference) | 18 tCO2e/yr | $65K/yr | 8 days | P0 | In progress |
| Migrate ap-southeast-1 → eu-west-1 (green region) | 22 tCO2e/yr | $12K/yr | 15 days | P1 | Evaluation |
| S3 lifecycle policy enforcement | 5 tCO2e/yr | $24K/yr | 1 day | P0 | Planned |
| CDN cache optimization | 3 tCO2e/yr | $8K/yr | 3 days | P2 | Backlog |
| Dark data cleanup | 7 tCO2e/yr | $13K/yr | 3 days | P1 | Planned |
| Carbon-aware model training scheduling | 12 tCO2e/yr | $18K/yr | 10 days | P2 | Research |
| **Total potential** | **94 tCO2e/yr (33%)** | **$328K/yr** | | | |

### Carbon reduction trajectory

| Year | tCO2e | Reduction | Key actions |
|---|---|---|---|
| 2025 (baseline) | 310 | — | Initial measurement |
| 2026 (current) | 285 | ↓ 8% | Right-sizing, spot instances |
| 2027 (target) | 240 | ↓ 16% vs baseline | Green region migration, auto-stop |
| 2028 (target) | 210 | ↓ 32% vs baseline | Carbon-aware architecture, GPU optimization |
| 2030 (goal) | 155 | ↓ 50% vs baseline | Carbon-neutral cloud operations |

## Action recommendations

1. **Auto-stop non-production**: $102K/yr waste, 15 tCO2e; implement auto-stop for all dev/test environments outside business hours
2. **Right-sizing sprint**: 12 over-provisioned services, $86K/yr; review and right-size all instances within 2 weeks
3. **GPU spot instance migration**: 58% GPU utilization, $65K savings; migrate AI inference to spot instances with fallback
4. **Dark data cleanup**: 8 TB dark data, $13K/yr; implement S3 lifecycle policies, delete abandoned snapshots and test data
5. **Green region migration**: ap-southeast-1 at 40 tCO2e; evaluate migration to eu-west-1 (renewable energy region)
6. **Carbon literacy**: 45% trained; roll out green software training to all engineers, add sustainability checklist to code review
7. **Sustainability OKRs**: 1 team with sustainability OKRs; add carbon reduction targets to all team OKRs by Q4
8. **Resource lifecycle automation**: 56% compliance; add auto-scaling, auto-termination, and spot instance usage to golden paths
9. **Carbon budgets**: introduce team-level carbon budgets based on service footprint; review monthly
10. **Quarterly sustainability review**: review carbon footprint, waste elimination, and green architecture progress



- Carbon as PR → publishing a sustainability report without measurable reduction; sustainability is about reduction, not reputation
- Greenwashing infrastructure → claiming "cloud is green" without optimizing usage; cloud providers are renewable, but waste is still waste
- Sustainability as someone else's problem → "the cloud provider handles carbon"; tenant choices (region, instance type, utilization) determine actual footprint
- Offset-first thinking → buying carbon offsets before reducing emissions; offsets are the last resort after reduction and optimization
- Sustainability vs. performance → treating sustainability and performance as trade-offs; the most efficient architecture is usually both the fastest and the greenest

## Related

- Same class: [dashboard-executive-kpi](dashboard-executive-kpi.md) — executive KPIs
- Same class: [dashboard-cost-and-resource](../../oncall-sre/observability/dashboard-cost-and-resource.md) — cloud cost and FinOps
- Same class: [dashboard-architecture-health](../../engineer/architecture-design/dashboard-architecture-health.md) — architecture health
- References: Green Software Foundation — *Software Carbon Intensity (SCI) Specification*; AWS — *Well-Architected Sustainability Pillar*; GHG Protocol — *Scope 1, 2, 3 Emissions*; Google — *Carbon-Aware Computing*; Thoughtworks — *Green Software Principles*