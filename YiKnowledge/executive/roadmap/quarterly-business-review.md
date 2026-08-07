---
title: Quarterly Business Review
aliases:
- quarterly-business-review
- QBR
- quarterly-review
- business-review
tags:
- roadmap
- quarterly-review
- business-review
- executive
- performance-management
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
- product-manager
benefit: "Quarterly business reviews provide a structured cadence for assessing strategy execution, identifying course corrections, and maintaining organizational alignment"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./annual-strategic-planning.md
- ./org-okr-tracking.md
- ../strategy/product-strategy-instance.md
- ../../product-manager/delivery/retrospective.md
tacit: false
---

# Quarterly Business Review (QBR)

> **As an** executive, **I want to** run effective quarterly business reviews, **so that** strategy execution stays on track, course corrections happen early, and the organization maintains alignment between annual plans and quarterly reality.

> QBRs are the primary mechanism for strategy-to-execution feedback. They are not status updates — they are decision forums where the organization confronts the gap between plan and reality, and decides what to do about it.

## Summary

- QBR is a structured quarterly review of strategy execution, business performance, and organizational health, typically involving the executive team and department heads
- Core purpose: Compare actual performance against the annual plan, identify deviations, diagnose root causes, and decide on course corrections
- Rhythm: Q1 QBR (validate plan assumptions), Q2 QBR (course correct if needed), Q3 QBR (prepare next year's planning), Q4 QBR (year-end assessment + next year plan preview)
- Each QBR has a distinct focus: Q1 is about launch and early signals, Q2 about mid-year correction, Q3 about next-year preparation, Q4 about synthesis
- Key output: An updated "state of the business" document, a prioritized list of decisions made, and any adjustments to OKRs, resource allocation, or strategic priorities

## Core viewpoints

### 1. QBRs are decision forums, not update meetings

The most common QBR failure is treating it as a series of status presentations. If the QBR doesn't produce at least 3-5 material decisions (stop something, start something, change resource allocation, revise a target), it wasn't a QBR — it was a show-and-tell. Pre-read materials should be distributed 48 hours in advance; meeting time is for debate and decisions.

### 2. Red is good, green is suspicious

If every initiative is "on track" (green), either the targets are too easy, the status reporting is dishonest, or the organization isn't taking enough risk. A healthy QBR has 20-30% red/yellow items — these are where the meaningful conversations happen. Celebrate the reds as opportunities to learn and correct.

### 3. Each quarter has a distinct strategic purpose

Q1 QBR validates whether the annual plan's assumptions are holding. Q2 QBR is the primary course-correction moment — enough data exists to make informed adjustments. Q3 QBR feeds directly into next year's planning process. Q4 QBR synthesizes the year's learnings and previews next year's plan.

### 4. External context must be part of every QBR

A QBR that only looks at internal metrics is incomplete. Every QBR should include: competitor moves this quarter, market shifts, customer feedback trends, and technology developments. Internal performance without external context is self-referential.

### 5. The QBR document is a living artifact, not a quarterly tombstone

The QBR document should be updated continuously throughout the quarter, not assembled in the week before the review. Key metrics, significant events, and decision logs should be maintained in real time. The QBR meeting is the discussion of an already-understood document, not the first time anyone sees the data.

## Key info

### QBR structure (4 hours)

| Time | Agenda Item | Format | Output |
|---|---|---|---|
| 30 min | External context: market, competitors, customers | Presentation + discussion | Updated external context |
| 60 min | Business performance: KPIs, OKRs, financials | Data review + Q&A | Performance assessment |
| 60 min | Initiative deep-dives: top 3-5 initiatives | Deep-dive per initiative | Go/No-Go/Adjust decisions |
| 30 min | Organizational health: hiring, retention, culture | Brief presentation | People priorities |
| 60 min | Decisions and actions: what changes? | Facilitated discussion | Decision log + action items |

### QBR decision log template

| Decision | Rationale | Owner | Due Date | Impact |
|---|---|---|---|---|
| Accelerate initiative X | Early signals strong, market window closing | CTO | Immediate | +2 engineers, -$200K budget |
| Kill initiative Y | No traction after 2 quarters, better alternatives | CPO | EoQ | -$500K saved, redirect 3 engineers |
| Revise KPI target Z | External benchmark shows target was too conservative | CEO | Next month | Raise target from 20% to 35% |

### Quarterly focus

| Quarter | Primary Question | Key Activities |
|---|---|---|
| Q1 | Are our plan assumptions valid? | Early signal detection, launch execution, team formation |
| Q2 | What needs to change? | Course correction, resource reallocation, kill underperforming initiatives |
| Q3 | What does next year need? | Strategic refresh, capability gap analysis, next-year planning prep |
| Q4 | What did we learn? | Year synthesis, annual planning kickoff, team performance review |

## Action recommendations

1. **Distribute pre-read 48 hours in advance**: The QBR document should be read before the meeting. Meeting time is for debate and decisions, not presentation.
2. **Mandate red/yellow honesty**: Create a culture where reporting "red" is rewarded, not punished. Red means the system is working — it's detecting problems early.
3. **Log every decision**: Maintain a running QBR decision log. Review last quarter's decisions at the start of each QBR to track follow-through.
4. **Include external context**: Add a standing agenda item for competitor, market, and customer intelligence. Rotate who presents it.
5. **Time-box presentations, maximize discussion**: Aim for 30% presentation, 70% discussion. If a topic doesn't generate debate, it doesn't need QBR time.

## Anti-patterns

- **Status update theater**: 20 slides of green status indicators with no decisions. Cancel the meeting if there are no decisions to make.
- **No external context**: Reviewing only internal metrics without market/competitor/customer context. You can be improving while losing the market.
- **QBR as a one-way presentation**: Leadership presents to the team with no discussion. QBRs are dialogue, not broadcast.
- **No follow-through**: Decisions are made but not tracked. The next QBR starts fresh without reviewing last quarter's decisions.
- **Quarterly scramble**: Data is assembled in the week before the QBR. Metrics should be tracked continuously; the QBR is the synthesis moment.
- **No red items**: Everything is green. Either targets are too easy, reporting is dishonest, or risk-taking is insufficient.

## Related

- [Annual Strategic Planning](./annual-strategic-planning.md) — The plan that QBRs track against
- [Org OKR Tracking](./org-okr-tracking.md) — OKR methodology for goal cascade
- [Product Strategy Instance](../strategy/product-strategy-instance.md) — Our strategy
- [Retrospective](../../product-manager/delivery/retrospective.md) — Team-level retrospective practice