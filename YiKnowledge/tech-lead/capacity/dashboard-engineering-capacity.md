---
title: engineering capacity dashboard
aliases:
- capacity dashboard
- resource planning dashboard
- headcount dashboard
- engineering resource dashboard
tags:
- dashboard
- capacity
- resource
- planning
- headcount
- allocation
category: tech-lead/capacity
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- tech-lead
- executive
- product-manager
benefit: engineering capacity and resource allocation visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../roadmap/plan-tech-roadmap.md
- ../../engineer/infrastructure/dashboard-dora-metrics.md
- ../../engineer/process/dashboard-team-velocity.md
- ../../executive/strategy/dashboard-executive-kpi.md
tacit: false
---

# engineering capacity dashboard

> **As a** tech lead, **I want to** track engineering capacity and resource allocation across teams, **so that** hiring, team composition, and project staffing decisions are data-driven.

> Engineering capacity is the organization's most constrained resource. This dashboard tracks headcount, allocation, skill coverage, hiring pipeline, and infrastructure budget.

## Summary

- 5 capacity dimensions: headcount and allocation, skill coverage, team composition, hiring pipeline, infrastructure budget
- Allocation tracked by initiative (feature work, tech debt, innovation, support, unplanned)
- Skill coverage matrix identifies single points of failure and critical gaps
- Hiring pipeline with time-to-fill and acceptance rate tracking
- Dashboard reviewed monthly at engineering leadership meeting; quarterly capacity planning

## Core viewpoints

- Capacity is finite — every new initiative means something else doesn't get done
- Allocation reveals true priorities — if tech debt is 30% of incidents but 5% of allocation, priorities are misaligned
- Skill coverage is a risk metric — every critical system needs at least 2 people who understand it
- Hiring is a lagging indicator of capacity — plan 3-6 months ahead for senior roles

## Key information

### 5-panel capacity overview

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADCOUNT & ALLOCATION         │  SKILL COVERAGE                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:     47 engineers│   │  │  Bus factor 1: 3 sys    │   │
│  │  Feature:   55% █████▌  │   │  │  Bus factor 2: 8 sys    │   │
│  │  Tech debt: 15% █▌      │   │  │  Critical gap: 2 roles  │   │
│  │  Innovation: 10% █      │   │  │  SPOF:        3 people  │   │
│  │  Support:   12% █       │   │  │  Coverage:    78%       │   │
│  │  Unplanned: 8% ▊        │   │  │  Cross-train: 12 active │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TEAM COMPOSITION               │  HIRING PIPELINE                │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Senior:     28% █▌     │   │  │  Open:     5 positions  │   │
│  │  Mid:        42% ████   │   │  │  Pipeline: 18 active    │   │
│  │  Junior:     18% █▌     │   │  │  Offer:    3 pending    │   │
│  │  Intern:     6% ▌       │   │  │  Time-to-fill: 32 days  │   │
│  │  Contractor: 6% ▌       │   │  │  Accept:    78%         │   │
│  │  Ratio: 1:1.5:0.6       │   │  │  Projected: +3 by Q4    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Allocation by team and initiative

| Team | Headcount | Feature | Tech Debt | Innovation | Support | Unplanned |
|---|---|---|---|---|---|---|
| Platform | 8 | 50% | 20% | 15% | 10% | 5% |
| AI/ML | 10 | 60% | 10% | 15% | 8% | 7% |
| Product (Web) | 12 | 65% | 10% | 5% | 10% | 10% |
| Product (Mobile) | 6 | 55% | 15% | 5% | 15% | 10% |
| SRE/Infra | 5 | 30% | 20% | 10% | 25% | 15% |
| Data | 4 | 45% | 15% | 15% | 15% | 10% |
| Security | 2 | 35% | 25% | 10% | 20% | 10% |
| **Total** | **47** | **55%** | **15%** | **10%** | **12%** | **8%** |

### Allocation health check

| Allocation category | Current | Target | Health |
|---|---|---|---|
| Feature work | 55% | 50-60% | Green |
| Tech debt / quality | 15% | 15-20% | Green |
| Innovation / exploration | 10% | 10-15% | Yellow |
| Support / on-call | 12% | < 10% | Yellow |
| Unplanned / interrupt | 8% | < 10% | Green |

### Skill coverage matrix

| System / Domain | Primary | Backup | Bus factor | Risk |
|---|---|---|---|---|
| API Gateway | Alice (Sr) | Bob (Mid) | 2 | Low |
| Auth Service | Charlie (Sr) | None | 1 | **High** |
| Payment Integration | Diana (Sr) | Eve (Mid) | 2 | Low |
| LLM Pipeline | Frank (Sr) | Grace (Mid) | 2 | Low |
| RAG Pipeline | Frank (Sr) | None | 1 | **High** |
| Data Warehouse | Henry (Sr) | None | 1 | **High** |
| CI/CD Pipeline | Bob (Mid) | Alice (Sr) | 2 | Low |
| Monitoring/Observability | Ian (Mid) | Jack (Jr) | 2 | Low |
| Frontend Architecture | Karen (Sr) | Leo (Mid) | 2 | Low |
| Mobile (iOS) | Mary (Sr) | None | 1 | **High** |
| Mobile (Android) | Nick (Mid) | Mary (Sr) | 2 | Low |

### Critical skill gaps

| Skill | Demand | Supply | Gap | Impact | Mitigation |
|---|---|---|---|---|---|
| LLM/GenAI engineering | 8 | 5 | +3 | Slows AI feature delivery | External hire + internal training |
| Kubernetes/Infra | 4 | 3 | +1 | SRE team stretched | Backfill open SRE role |
| iOS Development | 3 | 2 | +1 | Single point of failure | Cross-train Android engineer |
| Data Engineering | 3 | 2 | +1 | Data pipeline bottleneck | Contract-to-hire in progress |

### Team composition ratios

| Level | Current | Industry benchmark | Target |
|---|---|---|---|
| Senior+ (Staff, Principal) | 28% | 20-30% | 25-30% |
| Mid-level | 42% | 40-50% | 40-45% |
| Junior | 18% | 15-25% | 15-20% |
| Intern | 6% | 5-10% | 5-10% |
| Contractor | 6% | 5-15% | 5-10% |

### Hiring pipeline

| Position | Level | Pipeline | Stage | Days open | Target close |
|---|---|---|---|---|---|
| Senior LLM Engineer | Sr | 5 candidates | 2 in final round | 28 | Aug 30 |
| SRE | Mid | 3 candidates | 1 offer pending | 35 | Aug 15 |
| iOS Developer | Sr | 2 candidates | 1 in technical screen | 42 | Sep 15 |
| Data Engineer | Mid | 4 candidates | 2 in technical screen | 21 | Aug 30 |
| Security Engineer | Sr | 4 candidates | 1 in team match | 18 | Aug 22 |

### Infrastructure budget allocation

| Category | Monthly | % of budget | YoY change |
|---|---|---|---|
| Cloud (compute) | $42,000 | 35% | +12% |
| Cloud (storage) | $18,000 | 15% | +8% |
| LLM API costs | $28,000 | 23% | +45% |
| SaaS tools | $15,000 | 13% | +5% |
| Monitoring/Observability | $8,000 | 7% | +10% |
| CI/CD and Dev tools | $5,000 | 4% | → stable |
| Other | $4,000 | 3% | → stable |
| **Total** | **$120,000** | **100%** | **+18%** |

## Action recommendations

1. **Address bus factor 1 immediately**: Auth Service, RAG Pipeline, Data Warehouse, iOS — each needs a backup within 60 days
2. **Increase tech debt allocation**: at 15% with 30% of incidents from tech debt, consider moving to 20%
3. **Reduce support burden**: SRE team at 25% support; automate common support tasks, improve self-service
4. **Hire for critical gaps**: LLM Engineer and iOS Developer are the most critical; prioritize these searches
5. **Cross-training program**: pair engineers on bus-factor-1 systems; target 2 trained backups per system
6. **Quarterly capacity planning**: review allocation against roadmap; adjust before sprints are committed
7. **Monitor LLM API cost growth**: 45% YoY increase is significant; evaluate caching, model routing, and batch processing



- 100% allocation → no slack for innovation, unplanned work, or learning; target 85-90% planned allocation
- Senior-only teams → too expensive, no growth path for juniors; maintain healthy junior pipeline
- Single point of failure tolerated → "we'll document it later"; documentation doesn't replace a trained backup
- Hiring reactively → starting search when someone leaves; maintain a warm pipeline for critical roles
- Feature factory allocation → 80%+ feature work with no tech debt or innovation; technical bankruptcy is inevitable

## Related

- Same class: [dashboard-dora-metrics](../../engineer/infrastructure/dashboard-dora-metrics.md) — delivery performance
- Same class: [dashboard-team-velocity](../../engineer/process/dashboard-team-velocity.md) — team velocity
- Same class: [dashboard-executive-kpi](../../executive/strategy/dashboard-executive-kpi.md) — executive rollup
- Downstream: [plan-tech-roadmap](../roadmap/plan-tech-roadmap.md) — roadmap planning
- References: Will Larson — *An Elegant Puzzle: Systems of Engineering Management*; Camille Fournier — *The Manager's Path*; Team Topologies — *Matthew Skelton and Manuel Pais*