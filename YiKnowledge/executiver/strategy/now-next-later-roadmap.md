---
title: Now / Next / Later Roadmap
aliases: [nnl, roadmap, now-next-later, prioritization]
tags: [strategy, roadmap, planning, execution]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter, executiver, leader]
benefit: "Create an outcome-based roadmap without fixed dates, organizing work into three time horizons for stakeholder alignment and execution planning"
related:
  - ./product-strategy-framework.md
  - ./value-proposition-canvas.md
  - ./business-model-canvas.md
  - ../README.md
  - ../INDEX.md
---

# Now / Next / Later Roadmap

> **As a** producter, **I want to** organize work into three outcome-based horizons, **so that** stakeholders align on priorities without getting bogged down in dates that will inevitably change.

## Definition

Now / Next / Later (NNL) is a roadmap format that replaces fixed-date timelines with three time horizons:

```
┌──────────────────────────────────────────────────────────┐
│  NOW                    │  NEXT              │  LATER    │
│  (this quarter)         │  (next 1–2 qtrs)   │  (future) │
│                         │                    │           │
│  • Committed outcomes   │  • Planned outcomes│  • Ideas   │
│  • Teams actively       │  • Discovery        │  • Bets    │
│    working on these     │    underway         │  • Options │
│  • Clear success        │  • Scope becoming   │  • Not yet │
│    criteria             │    clearer          │    scoped  │
│                         │                    │           │
│  HIGH confidence        │  MEDIUM confidence  │  LOW conf │
└──────────────────────────────────────────────────────────┘
```

The key difference from a timeline roadmap: **you commit to outcomes, not dates**. Priorities are clear, but the exact timing of "Next" and "Later" items is intentionally flexible.

## Trigger condition

Use this roadmap format when:
- You need to communicate priorities to stakeholders without anchoring on dates
- Your environment changes frequently (dates would be wrong within weeks)
- You want to shift conversations from "when will X ship?" to "what outcomes are we driving?"
- You're aligning multiple teams around a shared set of priorities
- You're translating strategy ([product-strategy-framework.md](./product-strategy-framework.md)) into execution

## Step-by-step walkthrough

### Step 1: Define outcomes, not features

An outcome is a measurable change in user behavior or business metric. A feature is a solution.

| Feature (bad roadmap item) | Outcome (good roadmap item) |
|---|---|
| "Build dark mode" | "Increase mobile engagement by reducing eye strain during night usage" |
| "Add export to CSV" | "Enable users to do their own analysis without requesting custom reports" |
| "Integrate with Slack" | "Reduce time-to-notification from 30 min to <1 min" |

### Step 2: Source items from strategy

Feed the roadmap from:
- [product-strategy-framework.md](./product-strategy-framework.md) — strategic choices → roadmap outcomes
- [Value Proposition Canvas](./value-proposition-canvas.md) — uncovered customer pains → feature opportunities
- [Business Model Canvas](./business-model-canvas.md) — business model gaps → initiatives

Every roadmap item should trace back to a strategy document or a validated customer need.

### Step 3: Assign to Now / Next / Later

| Horizon | Criteria | Capacity guideline |
|---|---|---|
| **Now** | Actively being worked on; success criteria defined; team assigned | 60–70% of capacity |
| **Next** | Discovery underway; scope is forming; likely to start within 1–2 quarters | 20–30% of capacity (discovery only) |
| **Later** | Validated idea; not yet scoped; no committed timeline | 0–10% (light research only) |

Leave 10–20% of capacity unallocated for unexpected work and slack.

### Step 4: Write success criteria

Every Now item must have clear success criteria:

```
Outcome: "Reduce new user time-to-first-value from 3 days to 1 hour"

Success criteria:
  - 80% of new users complete onboarding within 1 hour
  - Time-to-first-value p50 < 60 minutes
  - New user activation rate increases from 40% to 60%
  - Measured 30 days after launch
```

### Step 5: Review and rebalance

Monthly review:
1. Move completed Now items to "Done" (celebrate!)
2. Promote Next items to Now as capacity opens
3. Promote Later items to Next as discovery completes
4. Remove items that no longer align with strategy
5. Add new items from latest strategy inputs

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| Item is too large for one quarter | Break into smaller outcomes | One Now item should be completable in 4–6 weeks |
| Stakeholder demands dates | Show the plan, not the schedule | "Here's what we're working on and why. Dates shift; priorities don't." |
| Everything is "Now" | Force-rank within Now | If everything is priority #1, nothing is |
| Emergency interrupts the roadmap | Absorb into slack or trade off | Swap an equal-sized Now item into Next to make room |
| Strategy changes mid-quarter | Re-evaluate Now items against new strategy | It's OK to stop a Now item if the strategy no longer supports it |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Initial creation | NNL board with outcomes, success criteria, and strategy traceability |
| Monthly review | Updated board; moved/completed items documented |
| Quarterly review | Full re-evaluation against updated strategy inputs |
| Stakeholder communication | One-pager showing Now/Next/Later with outcomes and progress |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| NNL as a timeline in disguise | "Next" becomes "next quarter" with implied dates | Never attach dates to columns; talk about outcomes, not timelines |
| Outcomes that are really features | "Build X" is not an outcome | Ask: "What user behavior change will this create?" |
| Later as a graveyard | Items sit in Later forever without review | Every review, either promote, remove, or explicitly decide to keep in Later |
| Overloading Now | Teams have 15 "Now" items, nothing finishes | Limit Now to 3–5 outcomes per team |
| No success criteria | You can't tell if a Now item actually delivered value | Every Now item must have at least one measurable criterion |

## This product's landing instance

*To be filled in with your current NNL roadmap. Include the date of last review, the top 3 Now outcomes with success criteria, and a link to the full roadmap board.*