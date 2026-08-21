---
title: Annual Strategic Planning
aliases: [annual-planning, strategic-planning, yearly-planning]
tags: [roadmap, planning, strategy, annual]
category: executiver/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, leader, producter]
benefit: "Run the annual strategic planning process with a 4-phase framework, clear prioritization criteria, and structured decision-making"
related:
  - ./quarterly-business-review.md
  - ./org-okr-tracking.md
  - ./headcount-budget-planning.md
  - ../strategy/product-strategy-framework.md
  - ../README.md
  - ../INDEX.md
---

# Annual Strategic Planning

> **As an** executiver, **I want to** run a structured annual strategic planning process, **so that** the organization aligns on priorities, resource allocation, and success metrics for the coming year.

## Definition

Annual strategic planning is a 4-phase process that translates strategy into an executable plan with clear priorities, resource allocation, and measurable outcomes.

```
Q3-Q4 (PREVIOUS YEAR)          Q1-Q4 (CURRENT YEAR)
─────────────────────────────────────────────────────
Phase 1: Strategy Review  ──►
Phase 2: Bottom-Up Input  ──►
Phase 3: Synthesis & Debate ──►
Phase 4: Commit & Cascade ──►  Execution & Quarterly Review
```

## Applicable scenarios

- Annual planning cycle (typically Q3–Q4 for the following year)
- Major strategic pivot requiring full re-planning
- Post-merger or post-acquisition integration planning
- New executive team establishing their first joint plan

## Design steps

### Phase 1: Strategy Review (4–6 weeks)

**Goal**: Align on the strategic context before making resource decisions.

| Step | Activity | Output | Owner |
|---|---|---|---|
| 1.1 | Review current strategy document | Updated [strategy assessment](../strategy/product-strategy-framework.md) | Executiver |
| 1.2 | Assess external environment | [P5F](../strategy/porter-five-forces.md) + [Blue Ocean](../strategy/blue-ocean.md) refresh | Executiver |
| 1.3 | Assess internal capabilities | [VRIO](../strategy/vrio-framework.md) + [SWOT](../strategy/swot-analysis.md) refresh | Leader |
| 1.4 | Review current year performance | Actual vs. plan; what worked and what didn't | All |
| 1.5 | Define strategic pillars for next year | 3–5 strategic pillars with 1-paragraph descriptions | Executiver |

**Gate check**: Leadership team signs off on strategic pillars before proceeding to Phase 2.

### Phase 2: Bottom-Up Input (3–4 weeks)

**Goal**: Gather proposals and data from teams before top-down allocation.

| Step | Activity | Output | Owner |
|---|---|---|---|
| 2.1 | Teams submit initiatives | Initiative proposals with impact estimates, resource needs | Leader |
| 2.2 | Product submits roadmap draft | [Now/Next/Later](../strategy/now-next-later-roadmap.md) aligned to strategic pillars | Producter |
| 2.3 | Engineering submits capacity estimate | Available person-weeks for next year by team | Leader |
| 2.4 | Finance provides budget envelope | Revenue forecast, cost targets, investment capacity | Finance |

**Anti-pattern to avoid**: Don't let teams submit wishlists. Every initiative must map to a strategic pillar.

### Phase 3: Synthesis & Debate (3–4 weeks)

**Goal**: Reconcile top-down strategy with bottom-up proposals into a coherent plan.

| Step | Activity | Output | Owner |
|---|---|---|---|
| 3.1 | Map all initiatives to strategic pillars | Initiative-to-pillar mapping; identify orphans and gaps | Executiver |
| 3.2 | Prioritize using a scoring framework | Ranked initiative list | All |
| 3.3 | Run resource allocation scenarios | 2–3 scenarios (optimistic, baseline, conservative) | Executiver + Finance |
| 3.4 | Debate and resolve conflicts | Facilitated leadership session; decisions documented | Executiver |
| 3.5 | Produce draft plan | Draft annual plan document | Executiver |

**Prioritization scoring framework**:

| Criterion | Weight | Description |
|---|---|---|
| Strategic alignment | 30% | How directly does this support a strategic pillar? |
| Expected impact | 25% | Revenue, cost savings, or strategic position improvement |
| Confidence | 15% | How certain are we about the impact estimate? |
| Feasibility | 15% | Do we have the capability and capacity to execute? |
| Urgency | 15% | Is there a time-sensitive window or deadline? |

### Phase 4: Commit & Cascade (2–3 weeks)

**Goal**: Finalize the plan and cascade it into team-level OKRs and budgets.

| Step | Activity | Output | Owner |
|---|---|---|---|
| 4.1 | Final leadership review and approval | Approved annual plan | Executiver |
| 4.2 | Cascade to team-level OKRs | [Org OKRs](./org-okr-tracking.md) → team OKRs | Leader |
| 4.3 | Allocate headcount and budget | [Headcount plan](./headcount-budget-planning.md) | Executiver + Finance |
| 4.4 | Communicate to the organization | All-hands presentation, written plan, FAQ | Executiver |
| 4.5 | Set up review cadence | [QBR schedule](./quarterly-business-review.md) for the year | Executiver |

## Key outputs

| Deliverable | Format | Audience |
|---|---|---|
| Annual plan document | 5–10 page document | Leadership, board |
| Strategic pillars | One-pager | Company-wide |
| Prioritized initiative list | Spreadsheet | Leadership, teams |
| Resource allocation | Headcount + budget spreadsheet | Finance, HR, leadership |
| Cascaded OKRs | [OKR tracker](./org-okr-tracking.md) | Company-wide |
| Communication deck | Slides | All-hands |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Planning without strategy | Initiatives are prioritized by whoever shouts loudest | Phase 1 is non-negotiable; no strategy = no planning |
| Spreadsheet-driven planning | Numbers become the goal instead of outcomes | Start with strategic pillars, then resource allocation |
| No trade-off discussions | Everything is "priority #1" | Phase 3 debate must explicitly reject lower-priority items |
| Annual plan as a fixed contract | Circumstances change; the plan must adapt | Quarterly reviews via [QBR](./quarterly-business-review.md) to adjust |
| Skipping bottom-up input | Leadership plan ignores ground-level reality | Phase 2 is mandatory; teams know what's feasible |

## This product's landing instance

*To be filled in with the current annual plan. Include the year, the strategic pillars, the date of last leadership review, and a link to the full plan document.*