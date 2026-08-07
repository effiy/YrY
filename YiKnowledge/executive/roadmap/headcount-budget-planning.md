---
title: Headcount and Budget Planning
aliases:
- headcount-budget-planning
- budget-planning
- headcount-planning
- resource-planning
- financial-planning
tags:
- roadmap
- headcount
- budget
- resource-planning
- financial-planning
- capacity
category: executive/roadmap
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- executive
- tech-lead
benefit: "Resource allocation decisions are grounded in a clear understanding of headcount costs, capacity constraints, and the trade-offs between build-vs-buy and in-house-vs-outsource"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./annual-strategic-planning.md
- ./quarterly-business-review.md
- ../../tech-lead/capacity/README.md
- ../../tech-lead/capacity/tl-capacity-cost-2026-08-trend.md
tacit: false
---

# Headcount and Budget Planning

> **As an** executive, **I want to** run a disciplined headcount and budget planning process, **so that** resource allocation reflects strategic priorities, capacity constraints are visible, and the organization scales sustainably.

> Headcount and budget planning is where strategy meets reality. Every strategic choice implies a resource allocation decision. The process must be zero-based, transparent, and directly linked to the prioritized initiative portfolio from annual planning.

## Summary

- Headcount is typically 60-80% of a software company's operating budget. Getting headcount planning right is the single most impactful financial decision.
- The planning process should be zero-based: start from the prioritized initiative portfolio, estimate the resources each initiative requires, and allocate from the top down. Never start from "last year's headcount + growth."
- Key categories: Core team (maintain existing products), Growth initiatives (new products/features), Platform/infrastructure (shared capabilities), and Exploration (R&D, experiments)
- Critical constraint: Hiring capacity. A team can effectively onboard ~1 new person per 5 existing team members per quarter without productivity loss. Planning more headcount than you can absorb is waste.
- The budget should model at least 3 scenarios: base case, stretch case (if revenue exceeds plan), and conservative case (if revenue falls short)

## Core viewpoints

### 1. Headcount is a lagging indicator of strategy, not a leading one

Decide what you want to achieve, then determine the headcount needed to achieve it. Not the reverse. "We have budget for 10 hires" should never drive strategy. "Our strategy requires 10 hires in these specific roles" should drive budget.

### 2. Hiring capacity is the binding constraint

Most teams overestimate how many people they can effectively hire and onboard. A team of 5 engineers can absorb roughly 1 new hire per quarter without productivity loss. Planning to double a team in one quarter guarantees 3-6 months of reduced productivity while existing team members onboard new hires.

### 3. The four-bucket allocation model

Allocate headcount and budget into four buckets with different decision processes:
- **Core** (50-60%): Maintain existing products, fix bugs, keep the lights on. Stable, predictable allocation.
- **Growth** (25-30%): New features, new products, market expansion. Allocated to highest-ROI initiatives.
- **Platform** (10-15%): Shared infrastructure, developer tools, security. Prevents technical debt accumulation.
- **Exploration** (5-10%): R&D, experiments, optionality bets. Funded in 3-month chunks with explicit kill criteria.

### 4. The fully-loaded cost of a hire is 1.3-1.5x salary

Budget planning must account for: salary + benefits (~15-20%) + equipment/tools (~5%) + office/remote stipend (~5%) + recruiting cost (amortized, ~3-5%) + management overhead (~5-10%). A $100K salary translates to a $130-150K fully-loaded cost.

### 5. Budget scenarios create optionality

A single budget number is a plan, not a strategy. Three scenarios (base/stretch/conservative) linked to revenue triggers create organizational agility: if revenue exceeds plan by X%, unlock stretch budget; if revenue falls short by Y%, trigger conservative budget. This avoids the "emergency budget cut" panic that damages morale.

## Key info

### Four-bucket allocation model

| Bucket | Allocation | Purpose | Decision Process | Review Cadence |
|---|---|---|---|---|
| **Core** | 50-60% | Maintain existing products, reliability, customer support | Stable allocation, minimal change YoY | Quarterly |
| **Growth** | 25-30% | New features, market expansion, new products | Competitive prioritization across initiatives | Quarterly (reallocate based on results) |
| **Platform** | 10-15% | Shared infrastructure, security, developer tools, tech debt | Tech lead prioritization | Quarterly |
| **Exploration** | 5-10% | R&D, experiments, optionality | Time-boxed with explicit kill criteria | Monthly |

### Hiring capacity calculator

| Team Size | Max New Hires/Quarter | Rationale |
|---|---|---|
| 1-3 | 1 per quarter | Small teams have limited onboarding bandwidth |
| 4-8 | 2 per quarter | One senior engineer can onboard ~2 new hires |
| 9-15 | 3 per quarter | Can form onboarding cohorts of 2-3 |
| 16-30 | 5 per quarter | Dedicated onboarding process needed |
| 30+ | 15-20% of team size | Requires formal onboarding program |

### Fully-loaded cost model (per $100K salary)

| Component | % of Salary | Amount |
|---|---|---|
| Base salary | 100% | $100,000 |
| Benefits (health, retirement, etc.) | 15-20% | $15,000-20,000 |
| Equipment & tools | 5% | $5,000 |
| Office/remote | 5% | $5,000 |
| Recruiting (amortized) | 3-5% | $3,000-5,000 |
| Management overhead | 5-10% | $5,000-10,000 |
| **Total fully-loaded** | **133-145%** | **$133,000-145,000** |

### Budget scenario triggers

| Scenario | Revenue Trigger | Headcount Action | Budget Action |
|---|---|---|---|
| **Conservative** | Revenue < 90% of plan | Freeze backfills, slow growth hiring | Cut exploration bucket, reduce platform |
| **Base** | Revenue 90-110% of plan | Execute planned hiring | Execute planned budget |
| **Stretch** | Revenue > 110% of plan | Accelerate growth hiring, add exploration | Increase growth bucket, fund new initiatives |

## Action recommendations

1. **Start from the initiative portfolio, not last year's budget**: Each initiative in the annual plan should have a resource estimate. Sum the estimates for the top-priority initiatives. This is your headcount demand.
2. **Apply the hiring capacity constraint**: Compare headcount demand to hiring capacity. If demand exceeds capacity, either extend timelines, reduce scope, or accept that hiring will take longer than planned.
3. **Use the four-bucket model**: Allocate headcount and budget into Core/Growth/Platform/Exploration. Track actual spending against each bucket quarterly.
4. **Build three budget scenarios**: Link each scenario to a revenue trigger. This gives the organization a pre-agreed playbook for both upside and downside.
5. **Review headcount allocation quarterly**: Reallocate Growth bucket based on initiative performance. Move underperforming initiative headcount to better-performing initiatives.

## Anti-patterns

- **Last year + X%**: Starting from last year's allocation and adding a percentage. This perpetuates past decisions and ignores strategic shifts.
- **Over-hiring**: Planning headcount beyond the organization's capacity to onboard effectively. This wastes money and reduces productivity.
- **No scenario planning**: A single budget number with no contingency plan. When revenue misses, the organization scrambles and makes panicked cuts.
- **Headcount as a status symbol**: Teams requesting headcount to signal importance rather than to achieve specific outcomes. Headcount should be tied to initiative outcomes, not team status.
- **Ignoring fully-loaded costs**: Budgeting only for salary. The 30-50% overhead on top of salary is real and must be accounted for.
- **No platform bucket**: Starving shared infrastructure and tools in favor of feature teams. Technical debt accumulates and eventually consumes the growth budget.

## Related

- [Annual Strategic Planning](./annual-strategic-planning.md) — The plan that drives resource allocation
- [Quarterly Business Review](./quarterly-business-review.md) — Quarterly review of resource allocation effectiveness
- [Tech Lead Capacity Planning](../../tech-lead/capacity/README.md) — Engineering capacity analysis
- [Capacity Cost Trend](../../tech-lead/capacity/tl-capacity-cost-2026-08-trend.md) — Current cost trend analysis