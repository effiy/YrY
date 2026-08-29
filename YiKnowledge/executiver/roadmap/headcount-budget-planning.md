---
title: Headcount and Budget Planning
aliases: [headcount-planning, budget-planning, resource-allocation]
tags: [roadmap, budget, headcount, hiring, finance]
category: executiver/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, leader]
benefit: "Allocate headcount and budget using a four-bucket model, plan hiring capacity, and model budget scenarios for strategic resource decisions"
related:
  - ./annual-strategic-planning.md
  - ./quarterly-business-review.md
  - ./org-okr-tracking.md
  - ../README.md
  - ../INDEX.md
---

# Headcount and Budget Planning

> **As an** executiver, **I want to** allocate headcount and budget strategically across competing priorities, **so that** resources match the organization's most important goals.

## Definition

Headcount and budget planning translates the [annual plan](./annual-strategic-planning.md) into concrete resource allocation. It answers: "Given our strategy, where should we put our people and money?"

## Trigger condition

- **Scheduled**: Annual planning cycle (alongside [annual strategic planning](./annual-strategic-planning.md))
- **Event-driven**:
  - Mid-year budget reforecast
  - New funding round
  - Major strategy pivot requiring reallocation
  - Acquisition or divestiture
  - Significant revenue miss or beat (>20% deviation from plan)

## Step-by-step walkthrough

### Step 1: Define the allocation model

Use the **Four-Bucket Allocation Model**:

| Bucket | What it funds | Typical % | Characteristics |
|---|---|---|---|
| **Run** | Keeping the lights on | 30–40% | Maintenance, support, bug fixes, compliance |
| **Grow** | Incremental improvement | 30–40% | Feature development, performance, scaling |
| **Transform** | New bets and innovation | 15–25% | New products, new markets, platform re-architecture |
| **Optionality** | Unallocated reserve | 5–10% | Unexpected opportunities, emergencies, experimentation |

**Growth-stage guidance**:
- Early stage: 50%+ Transform, 20–30% Grow, 10–20% Run
- Growth stage: 30–40% each Grow and Run, 20% Transform
- Mature: 40% Run, 40% Grow, 10–15% Transform

### Step 2: Map initiatives to buckets

Take the prioritized initiative list from the [annual plan](./annual-strategic-planning.md) and assign each to a bucket:

| Initiative | Bucket | Headcount needed | Budget needed |
|---|---|---|---|
| Platform reliability overhaul | Run | 4 engineers | $50K (infra) |
| Enterprise SSO/SCIM | Grow | 3 engineers | $20K (license) |
| AI-native search MVP | Transform | 5 engineers + 1 PM | $100K (compute) |
| Reserve | Optionality | 2 engineers | $50K |

### Step 3: Calculate hiring capacity

**Realistic hiring capacity = budgeted hires × fill-rate factor**

| Factor | Typical value | How to determine |
|---|---|---|
| **Budgeted hires** | From the plan | Sum of all headcount needs across buckets |
| **Time-to-fill** | 45–90 days | Historical average from job posting to start date |
| **Fill rate** | 70–85% | Historical % of approved roles actually filled in the year |
| **Ramp time** | 1–3 months | Time until new hire reaches full productivity |
| **Attrition** | 5–15% annual | Historical voluntary + involuntary turnover |

**Capacity formula**:

```
Effective capacity (person-years) =
  Current headcount
  + (budgeted hires × fill rate × (12 - time-to-fill-months) / 12)
  - (current headcount × attrition rate × 0.5)
```

### Step 4: Model budget scenarios

Build 3 scenarios:

| Scenario | Revenue assumption | Headcount | Budget |
|---|---|---|---|
| **Optimistic** | 120% of plan | Full plan + 10% | Full plan + 10% |
| **Baseline** | 100% of plan | Full plan | Full plan |
| **Conservative** | 80% of plan | Freeze backfills; delay Transform | Baseline - 20% |

For each scenario, define the **trigger** that would cause you to switch:

```
Switch to Conservative if:
  - Q1 revenue < 90% of plan
  - 2 of top 3 enterprise deals slip

Switch to Optimistic if:
  - Q1 revenue > 110% of plan
  - New funding round closes
```

### Step 5: Allocate budget by category

| Category | Typical % of budget | What's included |
|---|---|---|
| **People** | 60–75% | Salaries, benefits, contractors, recruiting |
| **Infrastructure** | 10–20% | Cloud, SaaS tools, data, compute |
| **G&A** | 5–10% | Office, legal, accounting, insurance |
| **Sales & Marketing** | 10–20% | Advertising, events, sales tools, commissions |
| **Optionality** | 5–10% | Unallocated reserve |

### Step 6: Review and approve

1. Finance validates the model and scenarios
2. Leadership reviews allocation against strategic pillars
3. Board/investors approve (if required)
4. Publish the approved headcount plan and budget
5. Set up quarterly re-forecast in [QBR](./quarterly-business-review.md)

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| Run bucket is growing too fast | Invest in automation / Reduce scope / Accept | If Run > 50%, you're underinvesting in growth; automate or reduce scope |
| Can't fill roles fast enough | Increase comp / Contractors / Reduce scope | Contractors for time-bound work; reduce scope for permanent capacity gap |
| Revenue miss triggers conservative scenario | Freeze hiring / Reduce discretionary spend / Both | Freeze backfills first (painless); reduce Transform before Grow |
| Two teams competing for the same headcount | Split / Prioritize / Sequence | Sequence: fully staff one team, then the other; splitting dilutes both |
| Transform bucket has no clear bets | Don't force it / Reallocate to Grow | Unallocated Transform funds go to Optionality, not to Run |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Allocation model | Four-bucket allocation with headcount and budget |
| Hiring plan | Quarterly hiring roadmap with role priorities |
| Budget scenarios | 3 scenarios with triggers |
| Budget by category | Category-level breakdown |
| Approval | Approved headcount plan and budget |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Last year + 10% | Budgeting without reference to strategy | Start from the [annual plan](./annual-strategic-planning.md) priorities, not last year's numbers |
| No optionality | Every dollar allocated; no room for opportunities | 5–10% reserve is non-negotiable |
| Hiring plan as a wishlist | 50 roles approved, 15 actually filled | Use realistic fill rate; plan for the capacity you'll actually have |
| Run bucket underestimated | Maintenance and support costs are always higher than expected | Track Run % for 3 quarters before setting next year's allocation |
| No scenario planning | Single-point budget with no contingencies | 3 scenarios minimum; define triggers for switching |

## This product's landing instance

*To be filled in with the current headcount and budget plan. Include the year, the four-bucket allocation, the hiring plan vs. actual, and the current scenario (optimistic/baseline/conservative).*