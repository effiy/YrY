---
title: Do a Capacity Plan
aliases: [capacity-planning, capacity, resourcing]
tags: [roadmap, capacity, planning, leader]
category: leader/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [leader]
benefit: "Calculate available engineering capacity in person-weeks, accounting for overhead, to make realistic roadmap commitments"
related:
  - ./plan-tech-roadmap.md
  - ./manage-tech-debt.md
  - ../../executiver/roadmap/headcount-budget-planning.md
  - ../README.md
  - ../INDEX.md
---

# Do a Capacity Plan

> **As a** tech lead, **I want to** calculate the team's available capacity, **so that** I can make realistic commitments and avoid overloading the team.

## Definition

Capacity planning estimates how much work a team can realistically complete in a given period (typically a quarter), accounting for all forms of overhead.

## Trigger condition

- **Scheduled**: Beginning of each quarter, before roadmap planning
- **Event-driven**:
  - Team size changes (hire, departure, rotation)
  - Significant change in operational load
  - Major reorganization or team restructure
  - Before committing to a large project or deadline

## Step-by-step walkthrough

### Step 1: Calculate raw capacity

```
Raw capacity (person-weeks) = Team size × Weeks in quarter
```

Example: 5 engineers × 13 weeks = 65 person-weeks

### Step 2: Subtract known time off

| Deduction | How to calculate |
|---|---|
| **Holidays** | Company holidays in the quarter |
| **Planned leave** | Known vacation, parental leave, sabbatical |
| **Company events** | All-hands, offsites, team building |

```
Available capacity = Raw capacity - Known time off
```

### Step 3: Subtract operational overhead

Not all available time goes to roadmap work:

| Overhead category | Typical % | What's included |
|---|---|---|
| **On-call** | 5–10% | Rotating on-call, incident response |
| **Meetings** | 10–15% | Standups, planning, reviews, 1:1s |
| **Support** | 5–10% | Customer escalations, internal support |
| **Hiring** | 0–5% | Interviews, onboarding, mentoring |
| **Other** | 0–5% | Training, knowledge sharing, open source |

Track actual overhead for 2–3 quarters to get your team's real numbers. Typical total overhead is 25–35%.

### Step 4: Calculate net roadmap capacity

```
Net capacity = Available capacity × (1 - Overhead %)
```

Example: 65 raw - 5 holidays = 60 available × 0.70 (30% overhead) = **42 person-weeks for roadmap work**

### Step 5: Allocate by category

Using the [tech roadmap](./plan-tech-roadmap.md) categories:

| Category | Target % | Person-weeks (example) |
|---|---|---|
| Product features | 55% | 23 |
| Tech investment | 25% | 10.5 |
| Exploration | 10% | 4 |
| Buffer | 10% | 4.5 |
| **Total** | **100%** | **42** |

### Step 6: Track actuals and calibrate

After each quarter, compare planned vs. actual:

| Metric | Planned | Actual | Variance |
|---|---|---|---|
| Net capacity (person-weeks) | 42 | 38 | -10% |
| Features delivered | 5 | 4 | -20% |
| Unplanned work | 4.5 (buffer) | 8 | +78% |

If actual consistently differs from planned, adjust your overhead % or buffer.

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| Overhead is higher than expected | Reduce overhead / Accept and plan with less | Automate first (CI/CD, alerts); then reduce meetings |
| Key person is the bottleneck | Hire / Train / Redistribute | Train others before they leave; bus factor > 1 for all critical systems |
| Buffer was consumed by unplanned work | Investigate root cause / Increase buffer | If unplanned work is recurring, it's planned work — put it on the roadmap |
| Team is consistently under capacity | Scope down / Hire / Extend timeline | Don't hope for heroics; reduce scope to match capacity |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Calculation | Capacity spreadsheet with all deductions |
| Allocation | Category breakdown with person-weeks |
| Tracking | Quarterly planned vs. actual comparison |
| Calibration | Next quarter's overhead % adjusted based on actuals |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Assuming 100% utilization | No one works at 100% on roadmap items | Track actual overhead; use 25–35% as a starting estimate |
| Capacity plan as a one-time exercise | Doesn't adapt to changes in team or ops load | Update quarterly; revisit if team size changes |
| Ignoring the bus factor | Single points of failure in the plan | Every critical path should have at least 2 people who can execute |
| Planning for the team you wish you had | 5-person team plans for 8-person output | Plan for actual headcount, not budgeted headcount |
| No buffer | Every surprise becomes a missed commitment | 10% minimum buffer; increase if the environment is volatile |

## This product's landing instance

*To be filled in with the current quarter's capacity plan. Include team size, available person-weeks, overhead %, and the category allocation.*