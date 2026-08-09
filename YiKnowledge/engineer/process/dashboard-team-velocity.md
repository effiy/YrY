---
title: team velocity dashboard
aliases:
- team dashboard
- sprint dashboard
- agile metrics dashboard
- velocity dashboard
tags:
- dashboard
- team
- velocity
- sprint
- agile
- collaboration
category: engineer/process
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
- product-manager
benefit: team health and delivery velocity visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../infrastructure/dashboard-dora-metrics.md
- ../../product-manager/discovery/metrics--dashboard-product-portfolio.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
- daily-standup.md
- retrospective-cadence.md
tacit: false
---

# team velocity dashboard

> **As a** tech lead, **I want to** track team velocity, predictability, and collaboration health, **so that** delivery bottlenecks are identified early and team effectiveness continuously improves.

> Team velocity is more than story points completed — it's a composite of delivery predictability, code review health, collaboration patterns, and team satisfaction. This dashboard provides a holistic view.

## Summary

- 5 team dimensions: delivery velocity, predictability, code review health, collaboration patterns, team satisfaction
- Velocity measured in story points with trend analysis; predictability measured by sprint commitment accuracy
- Code review metrics: time-to-review, review depth, PR size distribution
- Collaboration metrics: cross-team contributions, knowledge sharing, meeting health
- Dashboard reviewed at sprint retrospective; trends analyzed monthly

## Core viewpoints

- Velocity is a planning tool, not a performance metric — never use velocity to compare teams
- Predictability > velocity — a team that consistently delivers 80% of commitment is healthier than one swinging 50-150%
- Code review is a team practice, not a gatekeeping activity — review speed and depth indicate team health
- Team satisfaction is a leading indicator of delivery — burned-out teams eventually slow down

## Key information

### 5-panel team overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DELIVERY VELOCITY              │  PREDICTABILITY                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Sprint:  42/50 pts     │   │  │  Commitment: 84% ████   │   │
│  │  3-sprint avg: 44 pts   │   │  │  Carry-over: 12%        │   │
│  │  Trend:   → stable      │   │  │  Unplanned:  18%        │   │
│  │  Per eng: 8.4 pts       │   │  │  Scope chg:   6%        │   │
│  │  Throughput: 12 tix     │   │  │  Forecast:    ±5 pts    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CODE REVIEW HEALTH             │  COLLABORATION PATTERNS         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Time-to-review: 3.2h   │   │  │  Cross-team PRs: 18%    │   │
│  │  Review depth: 4.2/PR   │   │  │  Knowledge sharing: 2/w │   │
│  │  PR size: 245 loc avg   │   │  │  Pair programming: 12%  │   │
│  │  Rework: 1.2 cycles     │   │  │  Meeting load: 22%      │   │
│  │  Stale: 2 PRs (> 48h)   │   │  │  Focus time: 62%        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Sprint velocity history

| Sprint | Committed | Completed | Carry-over | Unplanned | Accuracy | Trend |
|---|---|---|---|---|---|---|
| Sprint 32 (current) | 50 | 42 (in prog) | 6 | 4 | 84% | → |
| Sprint 31 | 48 | 44 | 4 | 6 | 92% | ↑ |
| Sprint 30 | 45 | 38 | 5 | 8 | 84% | → |
| Sprint 29 | 50 | 46 | 3 | 3 | 92% | ↑ |
| Sprint 28 | 42 | 36 | 4 | 10 | 86% | → |
| Sprint 27 | 46 | 42 | 2 | 5 | 91% | ↑ |
| 6-sprint avg | 46.8 | 41.3 | 4.0 | 6.0 | 88% | → |

### Predictability metrics

| Metric | Definition | Green | Yellow | Red | Current |
|---|---|---|---|---|---|
| Sprint commitment accuracy | Completed / committed | > 85% | 70-85% | < 70% | 84% |
| Carry-over rate | Points carried to next sprint / committed | < 10% | 10-20% | > 20% | 12% |
| Unplanned work ratio | Unplanned points / total completed | < 15% | 15-25% | > 25% | 18% |
| Scope change frequency | Stories added/removed mid-sprint | < 10% | 10-20% | > 20% | 6% |
| Forecast range | Std dev of last 6 sprints | < 5 pts | 5-10 pts | > 10 pts | ±5 pts |

### Code review health

| Metric | Definition | Target | Current |
|---|---|---|---|
| Time-to-first-review | PR open to first comment | < 4 hours | 3.2 hours |
| Time-to-merge | PR open to merged | < 1 day | 0.8 days |
| Review depth | Comments per PR (non-trivial) | 3-8 | 4.2 |
| PR size | Average lines changed | < 400 | 245 |
| Rework cycles | Review rounds before merge | < 2 | 1.2 |
| Stale PRs | PRs open > 48 hours without review | 0 | 2 |
| Reviewer distribution | % of team active in reviews | > 80% | 85% |

### PR size distribution

| Size | Lines changed | % of PRs | Review time | Merge time | Bug rate |
|---|---|---|---|---|---|
| XS | < 50 | 25% | 0.5 hours | 0.3 days | 2% |
| S | 50-200 | 40% | 1.2 hours | 0.6 days | 3% |
| M | 200-500 | 25% | 3.5 hours | 1.2 days | 5% |
| L | 500-1000 | 8% | 8.2 hours | 2.5 days | 12% |
| XL | > 1000 | 2% | 18 hours | 4.2 days | 22% |

### Collaboration patterns

| Metric | Current | Target | Trend |
|---|---|---|---|
| Cross-team PR contributions | 18% | > 15% | ↑ +3% |
| Knowledge sharing sessions/month | 8 | > 6 | ↑ +2 |
| Pair programming hours/week | 12% | 10-20% | → stable |
| Internal docs contributions | 24/month | > 20 | ↑ +4 |
| Mentoring relationships | 6 active | > 5 | → stable |

### Meeting load analysis

| Meeting type | Hours/week | % of week | Target |
|---|---|---|---|
| Stand-ups | 1.5 | 3.8% | < 5% |
| Sprint planning/retro | 2.0 | 5.0% | < 5% |
| 1:1s | 1.0 | 2.5% | < 5% |
| Team syncs | 1.5 | 3.8% | < 5% |
| Cross-team | 1.5 | 3.8% | < 5% |
| Ad-hoc | 1.3 | 3.3% | < 5% |
| **Total meetings** | **8.8** | **22%** | **< 25%** |
| Focus time | 24.8 | 62% | > 60% |

### Team satisfaction pulse

| Question | Score (1-5) | Trend |
|---|---|---|
| I feel productive most days | 4.1 | ↑ |
| Code review culture is healthy | 4.3 | → |
| I have enough focus time | 3.8 | ↑ |
| Our sprint planning is realistic | 3.9 | ↑ |
| I learn from my teammates | 4.5 | ↑ |
| Technical debt is manageable | 3.2 | ↓ |
| Our on-call burden is reasonable | 3.6 | → |
| Overall satisfaction | 4.0 | ↑ |

## Action recommendations

1. **Don't compare velocity across teams**: velocity is for the team's own planning; never use it for performance reviews
2. **Find the right batch size**: if PRs > 500 lines cause 12%+ bug rate, enforce smaller PRs
3. **Reduce carry-over**: if carry-over > 15% for 3 consecutive sprints, reduce sprint commitment
4. **Stale PR alarm**: any PR open > 48 hours gets escalated; review is the team's top priority after writing code
5. **Meeting audit quarterly**: if meeting load > 25%, audit every recurring meeting for necessity
6. **Address tech debt satisfaction**: 3.2/5 is a warning sign; allocate 20% of sprint capacity to tech debt
7. **Celebrate predictability**: when the team hits 90%+ accuracy for 3 sprints, celebrate it



- Velocity as performance KPI → comparing developers by story points; velocity is for planning, not evaluation
- Story point inflation → same work gets more points over time; use reference stories to calibrate
- 100% commitment target → aiming for 100% leaves no room for unplanned work; target 85-90%
- Review bottleneck → one person reviews all PRs; distribute review load across the team
- Meeting creep → "just a quick sync" becomes a recurring meeting; every meeting needs a clear purpose and owner

## Related

- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — DORA delivery metrics
- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — engineering capacity
- Downstream: [daily-standup](daily-standup.md) — daily standup process
- Downstream: [retrospective-cadence](retrospective-cadence.md) — retrospective cadence
- References: Daniel Vacanti — *Actionable Agile Metrics for Predictability*; Spotify — *Squad Health Check Model*; Google — *Project Aristotle* (team effectiveness research)