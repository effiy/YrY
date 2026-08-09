---
title: onboarding progress dashboard
aliases:
- new hire dashboard
- onboarding dashboard
- ramp-up dashboard
- time-to-productivity dashboard
tags:
- dashboard
- onboarding
- new-hire
- ramp-up
- buddy
- productivity
category: new-hire/onboarding
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
- engineer
- executive
benefit: new hire onboarding progress and time-to-productivity visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../../engineer/process/dashboard-team-velocity.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
- ../../knowledge-curator/governance/dashboard-knowledge-health.md
tacit: false
---

# onboarding progress dashboard

> **As a** tech lead, **I want to** track new hire onboarding progress and time-to-productivity, **so that** onboarding bottlenecks are identified and every new hire reaches full productivity predictably.

> Onboarding is the first experience a new hire has with your engineering culture. This dashboard tracks onboarding progress, time-to-productivity milestones, buddy program effectiveness, new hire satisfaction, and retention.

## Summary

- 5 onboarding dimensions: onboarding progress by cohort, time-to-productivity, buddy program health, new hire satisfaction, retention and early attrition
- Onboarding tracked in 4 phases: setup (week 1), first contribution (week 2-3), independent work (month 1-2), full productivity (month 3-6)
- Time-to-productivity measured from start date to: first commit, first PR merged, first solo feature, independent on-call
- Buddy program tracked with buddy assignment, meeting cadence, and buddy effectiveness score
- Dashboard reviewed monthly; new hire check-ins at 30/60/90 days

## Core viewpoints

- Time-to-productivity is the ROI of hiring — reducing it by 1 month for a team of 10 saves 10 months of engineering time per year
- The first 90 days predict retention — new hires who haven't shipped by day 30 are 3x more likely to leave within 6 months
- Buddy programs are not optional — new hires with a dedicated buddy reach productivity 40% faster
- Onboarding is a team sport — the buddy, manager, and team all share responsibility for new hire success

## Key information

### 5-panel onboarding overview

```
┌──────────────────────────────────────────────────────────────────┐
│  ONBOARDING PROGRESS BY COHORT   │  TIME-TO-PRODUCTIVITY          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active:     5 hires    │   │  │  First commit: 2.5 days  │   │
│  │  Phase 1:    1 (20%)    │   │  │  First PR:     4.8 days  │   │
│  │  Phase 2:    2 (40%)    │   │  │  First feature: 18 days  │   │
│  │  Phase 3:    1 (20%)    │   │  │  Independent:   45 days  │   │
│  │  Phase 4:    1 (20%)    │   │  │  On-call ready: 82 days  │   │
│  │  Completed:  8 this yr  │   │  │  Full ramp:     95 days  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  BUDDY PROGRAM HEALTH           │  NEW HIRE SATISFACTION          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Buddies:    12 active  │   │  │  Overall:    4.2/5      │   │
│  │  Assigned:   100%        │   │  │  Clarity:    4.0/5      │   │
│  │  Meet/week:  1.8 avg     │   │  │  Support:    4.5/5      │   │
│  │  Score:      4.3/5      │   │  │  Growth:     4.1/5      │   │
│  │  Trained:    85%         │   │  │  Belonging:  4.3/5      │   │
│  │  Burnout:    0           │   │  │  Recommend:  92%        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Active new hire cohort

| Name | Role | Team | Start date | Day | Phase | First commit | First PR | Buddy | Status |
|---|---|---|---|---|---|---|---|---|---|
| Zhang Wei | Senior FE | Web | Jul 10 | 27 | Phase 3 | Day 1 | Day 3 | Li Ming | On track |
| Tanaka Yuki | Mid BE | AI | Jul 24 | 13 | Phase 2 | Day 3 | Day 5 | Frank | On track |
| Kim Soo-ah | Junior FE | Web | Aug 1 | 5 | Phase 1 | Day 2 | — | Karen | On track |
| Alex Chen | Senior SRE | Platform | Jul 5 | 32 | Phase 3 | Day 1 | Day 2 | Bob | On track |
| Priya Patel | Mid ML | AI | Aug 3 | 3 | Phase 1 | — | — | Grace | On track |

### Onboarding phase definitions

| Phase | Timeline | Goals | Success criteria | Exit gate |
|---|---|---|---|---|
| **Phase 1: Setup** | Week 1 | Environment, tools, access, team intro | Dev env running, first commit | Deploy to dev |
| **Phase 2: First Contribution** | Week 2-3 | First PR, code review, small bug fix | PR merged to main | Ship to production |
| **Phase 3: Independent Work** | Month 1-2 | Own feature, participate in planning | Solo feature shipped | Lead a feature E2E |
| **Phase 4: Full Productivity** | Month 3-6 | On-call, design review, mentorship | On-call rotation, design doc | Independent on-call |

### Time-to-productivity benchmarks

| Milestone | Current avg | Target | Industry benchmark | Best (last 12 mo) | Worst (last 12 mo) |
|---|---|---|---|---|---|
| First commit | 2.5 days | < 3 days | < 5 days | 0.5 days | 8 days |
| First PR merged | 4.8 days | < 5 days | < 7 days | 1.5 days | 12 days |
| First solo feature | 18 days | < 21 days | < 30 days | 8 days | 35 days |
| Independent (no buddy needed) | 45 days | < 45 days | < 60 days | 28 days | 72 days |
| On-call ready | 82 days | < 90 days | < 120 days | 55 days | 130 days |
| Full ramp (10th percentile) | 95 days | < 90 days | < 180 days | 62 days | 145 days |

### Time-to-productivity by experience level

| Level | First commit | First PR | First feature | Independent | On-call | Full ramp |
|---|---|---|---|---|---|---|
| Senior (5+ yr) | 1.5 days | 3.0 days | 12 days | 30 days | 55 days | 65 days |
| Mid (2-5 yr) | 2.5 days | 5.0 days | 18 days | 45 days | 82 days | 95 days |
| Junior (0-2 yr) | 4.0 days | 7.5 days | 28 days | 65 days | 120 days | 140 days |
| Intern | 5.0 days | 10.0 days | 35 days | N/A | N/A | N/A |

### Buddy program health

| Buddy | New hires (active) | New hires (total) | Avg score | Meet/week | Trained | Burnout risk |
|---|---|---|---|---|---|---|
| Li Ming | 1 | 3 | 4.5 | 2.0 | Yes | Low |
| Frank | 1 | 4 | 4.8 | 2.5 | Yes | Low |
| Karen | 1 | 2 | 4.2 | 1.5 | Yes | Low |
| Bob | 1 | 2 | 4.5 | 2.0 | Yes | Low |
| Grace | 1 | 1 | — | 2.0 | In training | Low |
| Diana | 0 | 3 | 4.3 | — | Yes | Low |
| Henry | 0 | 2 | 4.0 | — | Yes | Low |
| Alice | 0 | 2 | 3.8 | — | Yes | Medium |
| Eve | 0 | 1 | 4.5 | — | Yes | Low |
| Jack | 0 | 1 | 4.0 | — | Yes | Low |

### Buddy program metrics

| Metric | Current | Target | Status |
|---|---|---|---|
| Buddy assignment rate | 100% | 100% | Green |
| Buddy training completion | 85% | > 90% | Yellow |
| Avg meetings per week (first month) | 1.8 | > 2 | Yellow |
| Buddy satisfaction score | 4.3/5 | > 4.0 | Green |
| Buddy burnout rate | 0% | 0% | Green |
| Max new hires per buddy | 1 | ≤ 2 | Green |
| Buddy-to-new-hire ratio | 2.4:1 | > 2:1 | Green |

### New hire satisfaction (30/60/90 day check-ins)

| Question | 30-day | 60-day | 90-day | Trend |
|---|---|---|---|---|
| I understand my role and responsibilities | 4.2 | 4.5 | 4.6 | ↑ |
| I have the tools and resources I need | 4.0 | 4.3 | 4.5 | ↑ |
| My buddy is helpful and available | 4.5 | 4.3 | 4.0 | ↓ |
| I feel supported by my manager | 4.3 | 4.5 | 4.5 | → |
| I see a growth path for myself | 3.8 | 4.0 | 4.2 | ↑ |
| I feel a sense of belonging | 3.9 | 4.2 | 4.4 | ↑ |
| I would recommend this company to a friend | 4.5 | 4.5 | 4.5 | → |
| **Overall satisfaction** | **4.2** | **4.3** | **4.4** | ↑ |

### Retention and early attrition

| Metric | Current | Target | Industry benchmark |
|---|---|---|---|
| 30-day retention | 100% | 100% | 97% |
| 90-day retention | 96% | > 95% | 92% |
| 6-month retention | 92% | > 90% | 85% |
| 12-month retention | 88% | > 85% | 78% |
| Early attrition (< 6 months) | 4% | < 5% | 8% |
| Voluntary attrition (annual) | 8.5% | < 10% | 13% |

### Onboarding completion by cohort

| Cohort | Size | Completed | Phase 1 fail | Phase 2 fail | Avg time to complete | % on time |
|---|---|---|---|---|---|---|
| 2026-Q1 | 4 | 4 (100%) | 0 | 0 | 88 days | 100% |
| 2026-Q2 | 5 | 4 (80%) | 0 | 1 | 95 days | 80% |
| 2026-Q3 (active) | 5 | 1 (20%) | 0 | 0 | In progress | TBD |

### Onboarding bottleneck analysis

| Bottleneck | Frequency | Avg delay | Root cause | Fix |
|---|---|---|---|---|
| Access and permissions | 2/13 hires | 3 days | IT ticket queue | Pre-provision accounts before day 1 |
| Dev environment setup | 3/13 hires | 2 days | Docker on macOS performance | Native dev setup guide |
| First code review | 2/13 hires | 4 days | Reviewer availability | Assign dedicated reviewer for week 1 |
| Domain knowledge gap | 4/13 hires | 5 days | Missing documentation | Improve onboarding docs per project |
| CI/CD understanding | 2/13 hires | 2 days | Complex pipeline | Simplified onboarding CI guide |

## Action recommendations

1. **Pre-provision access before day 1**: IT ticket queue is the #1 preventable delay; provision accounts 3 days before start
2. **Improve first-week code review**: assign dedicated reviewer for each new hire's first week; target < 4 hours review time
3. **Buddy training**: 85% trained → target 100%; 2 buddies in training need to complete by month end
4. **Address first PR delay**: 2 hires took > 10 days for first PR; root cause was domain knowledge gap; improve project-specific onboarding docs
5. **30/60/90 check-in consistency**: ensure all new hires complete satisfaction surveys; current compliance 85%
6. **Monitor buddy satisfaction drop**: scores drop from 4.5 (day 30) to 4.0 (day 90); new hires need less buddy support over time — this is expected, but ensure smooth transition
7. **Reduce time-to-first-feature for juniors**: 28 days for juniors vs. 12 days for seniors; add structured junior onboarding projects
8. **Celebrate onboarding milestones**: first commit, first PR, first feature, first on-call — each gets team recognition



- Sink-or-swim → no structured onboarding; new hire is expected to "figure it out"; this increases time-to-productivity by 2-3x
- Buddy as formality → buddy assigned but never meets; buddy must have dedicated time (2+ hours/week in first month)
- No exit criteria → new hire stays in "onboarding" indefinitely; each phase has clear exit gates
- Ignoring early signals → new hire struggling but no intervention until it's too late; 30-day check-in should trigger action
- One-size-fits-all → same onboarding for senior and junior; tailor to experience level

## Related

- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — capacity and hiring
- Same class: [dashboard-team-velocity](../../engineer/process/dashboard-team-velocity.md) — team health
- Same class: [dashboard-knowledge-health](../../knowledge-curator/governance/dashboard-knowledge-health.md) — knowledge base coverage
- Downstream: onboarding guides in [./yiai](./yiai/), [./yipet](./yipet/), [./yivad](./yivad/)
- References: Google — *re:Work New Hire Onboarding*; Ramp — *The Ramp Playbook*; First Round Review — *The First 90 Days*