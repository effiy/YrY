---
title: roadmap progress dashboard
aliases:
- roadmap dashboard
- initiative tracking dashboard
- milestone dashboard
- project roadmap dashboard
tags:
- dashboard
- roadmap
- initiative
- milestone
- dependency
- progress
category: tech-lead/roadmap
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- tech-lead
- product-manager
- executive
- engineer
benefit: roadmap execution and milestone progress visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../capacity/dashboard-engineering-capacity.md
- ../risk/dashboard-risk-management.md
- ../../product-manager/strategy/dashboard-product-strategy.md
- ../../executive/strategy/dashboard-executive-kpi.md
tacit: false
---

# roadmap progress dashboard

> **As a** tech lead, **I want to** track roadmap execution and milestone progress across all initiatives, **so that** delivery risks and dependency blockers are identified before they delay critical commitments.

> A roadmap is a promise to the business. This dashboard tracks initiative progress, milestone completion, dependency health, resource allocation, and timeline confidence.

## Summary

- 5 roadmap dimensions: initiative progress, milestone tracking, dependency health, resource allocation, timeline confidence
- Initiatives tracked with earned-value analysis: planned vs. actual progress, schedule variance, cost variance
- Milestone completion rate, on-time %, and slip patterns tracked per initiative
- Cross-team dependencies mapped with critical path analysis; blocked dependencies escalated
- Dashboard reviewed biweekly at roadmap sync; monthly stakeholder review

## Core viewpoints

- A roadmap is a living plan, not a contract — it should change when new information arrives, but changes must be communicated
- Dependencies are the #1 roadmap killer — unmanaged cross-team dependencies cause more delays than technical challenges
- Milestone slip is cumulative — a 1-week slip in an early milestone compounds to a 4-week slip in the final delivery
- Resource allocation must match roadmap priorities — if your #1 initiative has 2 engineers and #3 has 5, your roadmap is wrong

## Key information

### 5-panel roadmap overview

```
┌──────────────────────────────────────────────────────────────────┐
│  INITIATIVE PROGRESS             │  MILESTONE TRACKING             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  On track:   75% ███▌   │   │  │  Total:      42 MS     │   │
│  │  At risk:    17% ▊      │   │  │  Completed:  28 (67%)  │   │
│  │  Delayed:     8% ▍      │   │  │  On time:    22 (79%)  │   │
│  │  Blocked:     0%        │   │  │  Late:        5 (18%)  │   │
│  │  SPI:        0.92       │   │  │  Critical:    1 (3%)   │   │
│  │  CPI:        1.05       │   │  │  Upcoming:   14        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DEPENDENCY HEALTH               │  RESOURCE ALLOCATION           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:     28 deps     │   │  │  Allocated: 85% ████▌   │   │
│  │  Resolved:  18 (64%)    │   │  │  Available: 15% ▌       │   │
│  │  On track:   6 (21%)    │   │  │  Over-alloc: 2 teams    │   │
│  │  At risk:    3 (11%)    │   │  │  Under-alloc: 1 team    │   │
│  │  Blocked:    1 (4%)     │   │  │  Priority fit: 78%      │   │
│  │  Critical:   1 blocked  │   │  │  Vacancy risk: 5 open   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Initiative progress (earned value)

| Initiative | Planned % | Actual % | SPI | Schedule variance | CPI | Cost variance | Status |
|---|---|---|---|---|---|---|---|
| AI Platform Launch | 85% | 82% | 0.96 | -3 days | 1.02 | Under budget | On track |
| Enterprise Tier (SSO/RBAC) | 70% | 60% | 0.86 | -12 days | 0.92 | Over budget | At risk |
| International Expansion | 75% | 67% | 0.89 | -8 days | 1.05 | Under budget | At risk |
| Developer Ecosystem | 60% | 42% | 0.70 | -18 days | 0.85 | Over budget | Delayed |
| Mobile Experience | 65% | 55% | 0.85 | -10 days | 1.10 | Under budget | At risk |
| Platform Reliability | 80% | 75% | 0.94 | -5 days | 1.08 | Under budget | On track |
| AI Quality Leadership | 100% | 100% | 1.00 | 0 | 1.00 | On budget | Complete |
| Cost Optimization | 55% | 45% | 0.82 | -12 days | 1.15 | Under budget | At risk |

**SPI** = Schedule Performance Index (Actual/Planned). > 1.0 = ahead. **CPI** = Cost Performance Index (Earned/Actual). > 1.0 = under budget.

### Milestone tracking by initiative

| Initiative | Total MS | Done | On time | Late | Critical | Upcoming (next 30d) | On-time % |
|---|---|---|---|---|---|---|---|
| AI Platform Launch | 5 | 4 | 4 | 0 | 0 | 1 | 100% |
| Enterprise Tier | 6 | 3 | 2 | 1 | 0 | 3 | 67% |
| International Expansion | 4 | 3 | 2 | 1 | 0 | 1 | 67% |
| Developer Ecosystem | 5 | 2 | 1 | 1 | 1 | 3 | 50% |
| Mobile Experience | 5 | 3 | 3 | 0 | 0 | 2 | 100% |
| Platform Reliability | 3 | 2 | 2 | 0 | 0 | 1 | 100% |
| AI Quality Leadership | 4 | 4 | 4 | 0 | 0 | 0 | 100% |
| Cost Optimization | 4 | 2 | 1 | 1 | 0 | 2 | 50% |
| **Total** | **42** | **28** | **22** | **5** | **1** | **14** | **79%** |

### Upcoming critical milestones (next 30 days)

| Date | Milestone | Initiative | Dependencies | Confidence | Owner |
|---|---|---|---|---|---|
| Aug 15 | SSO integration complete | Enterprise Tier | Auth team API | Medium (70%) | Auth Lead |
| Aug 18 | Ramp code-completion to 100% | AI Platform | Canary results | High (95%) | AI Lead |
| Aug 22 | Japanese translation complete | International | External translator | High (90%) | PM Intl |
| Aug 25 | Public API beta feedback incorporated | Developer Ecosystem | Beta user feedback | Medium (65%) | PM Platform |
| Aug 28 | iOS app submission | Mobile Experience | App review | Medium (75%) | PM Mobile |
| Aug 30 | RBAC role editor shipped | Enterprise Tier | SSO integration | Medium (60%) | Auth Lead |
| Sep 5 | 99.99% uptime target achieved | Platform Reliability | Capacity upgrade | High (85%) | SRE Lead |
| Sep 10 | Cost optimization phase 2 complete | Cost Optimization | Reserved instance purchase | High (90%) | SRE Lead |

### Dependency matrix

| Dependency ID | From | To | Needed by | Status | Risk | Impact if blocked |
|---|---|---|---|---|---|---|
| DEP-001 | Enterprise Tier | Auth Team (SSO API) | Aug 15 | On track | Medium | Blocks SSO milestone |
| DEP-002 | Developer Ecosystem | Platform (API Gateway) | Aug 25 | At risk | High | Delays API GA by 2 weeks |
| DEP-003 | Mobile Experience | AI Team (model endpoint) | Aug 20 | On track | Low | Mobile uses fallback |
| DEP-004 | International | Content Team (translations) | Aug 22 | On track | Low | JP launch delay |
| DEP-005 | Enterprise Tier | Security (compliance review) | Sep 1 | At risk | High | Blocks enterprise launch |
| DEP-006 | AI Platform | SRE (GPU capacity) | Aug 10 | Resolved | — | — |
| DEP-007 | Cost Optimization | Finance (reserved instance approval) | Aug 15 | At risk | Medium | Delays cost savings |
| DEP-008 | Developer Ecosystem | AI Team (API documentation) | Aug 20 | Blocked | Critical | **Blocks API GA** |

### Critical dependency detail

| Dep | Blocker | Impact | Action needed | Escalation |
|---|---|---|---|---|
| DEP-008 | AI Team hasn't delivered API docs | API GA delayed by 2+ weeks | Reassign 1 writer from AI team to docs | Escalated to CTO Aug 5 |
| DEP-002 | API Gateway rate limiting not ready | API beta can't scale beyond 50 devs | Prioritize gateway work this sprint | Escalated to Platform Lead |
| DEP-005 | Security review backlog | Enterprise launch at risk | Expedite security review; add contractor | Escalated to Security Lead |

### Resource allocation by initiative

| Initiative | Engineers | Designers | PM | Total | % of capacity | Priority fit |
|---|---|---|---|---|---|---|
| AI Platform Launch | 8 | 1 | 1 | 10 | 21% | #1 → 21% (good) |
| Enterprise Tier | 5 | 2 | 1 | 8 | 17% | #2 → 17% (good) |
| International Expansion | 3 | 1 | 1 | 5 | 11% | #3 → 11% (good) |
| Developer Ecosystem | 4 | 0.5 | 1 | 5.5 | 12% | #4 → 12% (good) |
| Mobile Experience | 4 | 2 | 1 | 7 | 15% | #5 → 15% (over) |
| Platform Reliability | 3 | 0 | 0.5 | 3.5 | 7% | #6 → 7% (good) |
| Cost Optimization | 2 | 0 | 0.5 | 2.5 | 5% | #8 → 5% (under) |
| Unallocated / Flex | 7 | 0 | 0 | 7 | 15% | Buffer |

### Timeline confidence index

| Quarter | Initiatives | On track | Confidence score | Risk factors |
|---|---|---|---|---|
| Q3 2026 (current) | 8 | 6 (75%) | 7.5/10 | 2 at risk, 0 blocked |
| Q4 2026 | 5 planned | 4 (80%) | 6.8/10 | 1 dependency on external vendor |
| Q1 2027 | 3 planned | 3 (100%) | 5.0/10 | Early planning, high uncertainty |

### Roadmap change log (last 90 days)

| Date | Change | Initiative | Reason | Impact | Stakeholders notified |
|---|---|---|---|---|---|
| Aug 3 | Scope reduced | Developer Ecosystem | Team capacity constraint | 100 → 50 integrations target | Yes |
| Jul 28 | Date pushed | Enterprise Tier | Security review delay | Oct 30 (was Oct 1) | Yes |
| Jul 15 | Added | Cost Optimization | Executive mandate | New initiative, 5% capacity | Yes |
| Jun 20 | Completed early | AI Quality Leadership | Ahead of schedule | +2 weeks buffer for other initiatives | Yes |
| Jun 10 | Priority changed | Mobile Experience | Strategic refocus | Moved from #6 to #5 | Yes |

## Action recommendations

1. **Resolve DEP-008 immediately**: AI Team API docs blocking API GA; escalate to CTO; reassign writer today
2. **Address Developer Ecosystem delay**: SPI 0.70, CPI 0.85; reassess scope (100 → 50 integrations); add resources
3. **Rebalance Mobile Experience**: 15% allocation for #5 priority exceeds #4 (Developer Ecosystem at 12%); adjust
4. **Enterprise Tier dependency risk**: DEP-005 (security review) at risk; expedite or add contractor
5. **Milestone slip analysis**: 5 late milestones across 3 initiatives; root cause: dependency delays (3) and scope creep (2)
6. **Biweekly roadmap sync**: review progress, dependencies, and risks every other Monday with all initiative leads
7. **Stakeholder communication**: any milestone slip > 1 week requires stakeholder notification within 24 hours
8. **Q4 planning kickoff**: start Q4 planning by Sep 1; lock roadmap by Sep 30



- Roadmap as Gantt chart → detailed task-level plans that are obsolete in 2 weeks; roadmap is outcomes, not tasks
- 100% allocation → no buffer for unplanned work; 15% flex capacity is minimum for healthy teams
- Dependency blindness → "we'll figure it out when we get there"; dependencies must be tracked and escalated
- Milestone gaming → marking milestones "done" when they're 90% complete; milestone is binary: done or not done
- Stakeholder surprise → roadmap changes not communicated; every change needs a stakeholder update

## Related

- Same class: [dashboard-engineering-capacity](../capacity/dashboard-engineering-capacity.md) — resource capacity
- Same class: [dashboard-risk-management](../risk/dashboard-risk-management.md) — risk tracking
- Same class: [dashboard-product-strategy](../../product-manager/strategy/dashboard-product-strategy.md) — product strategy
- Upstream: [dashboard-executive-kpi](../../executive/strategy/dashboard-executive-kpi.md) — executive view
- References: Marty Cagan — *Inspired*; Janna Bastow — *Roadmaps Relaunched*; Bruce McCarthy — *Product Roadmaps Relaunched*