---
title: Quarterly Business Review
aliases: [qbr, quarterly-review, business-review]
tags: [roadmap, review, quarterly, decision-log]
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
benefit: "Run effective quarterly business reviews with a structured framework, decision log, and focus area definition for the coming quarter"
related:
  - ./annual-strategic-planning.md
  - ./org-okr-tracking.md
  - ./headcount-budget-planning.md
  - ../README.md
  - ../INDEX.md
---

# Quarterly Business Review (QBR)

> **As an** executiver, **I want to** run structured quarterly business reviews, **so that** the organization reflects on what worked, makes course corrections, and aligns on the next quarter's priorities.

## Definition

A QBR is a structured quarterly reflection and planning session. It answers four questions:

1. **What happened** last quarter? (Results vs. plan)
2. **What did we learn**? (Insights and surprises)
3. **What changes**? (Course corrections to the annual plan)
4. **What's the focus** for next quarter? (Priorities and success criteria)

## Trigger condition

- **Scheduled**: End of each quarter (March, June, September, December)
- **Event-driven** (mini-QBR):
  - Major strategy pivot
  - Significant miss on quarterly OKRs (>30% deviation)
  - Key competitor move that changes the landscape
  - Leadership change affecting the plan

## Step-by-step walkthrough

### Step 1: Pre-work (2 weeks before QBR)

Each function prepares a **1-page QBR brief**:

| Section | Content |
|---|---|
| **OKR results** | Score each OKR (0.0–1.0); brief explanation for each |
| **What worked** | Top 3 wins; what contributed to them? |
| **What didn't** | Top 3 misses; root cause? |
| **Surprises** | What happened that we didn't anticipate? |
| **Proposed changes** | What should we start, stop, or continue? |
| **Next quarter focus** | Proposed 2–3 focus areas for the coming quarter |

### Step 2: QBR Session (half-day to full day)

**Agenda**:

| Time | Topic | Format |
|---|---|---|
| 30 min | CEO/executive overview: state of the business | Presentation |
| 45 min | OKR review: what we achieved vs. planned | Data walkthrough |
| 60 min | Deep dive: top 2 wins and top 2 misses | Discussion |
| 30 min | Break | — |
| 45 min | External environment update | [P5F](../strategy/porter-five-forces.md) refresh |
| 60 min | Course corrections: what changes in the plan? | Facilitated debate |
| 45 min | Next quarter focus areas and success criteria | Decision |
| 15 min | Action items and owners | Wrap-up |

**Facilitation rules**:
- No presentation decks longer than 5 slides
- Start with data, not opinions
- Debate the decision, not the person
- Every decision gets an owner and a deadline

### Step 3: Decision Log

Document every significant decision made during the QBR:

| Decision | Rationale | Alternatives considered | Owner | Review date |
|---|---|---|---|---|
| Delay Project X to Q3 | Engineering capacity reallocated to Y | Continue as planned, reduce scope | CTO | Next QBR |
| Increase investment in Market Z | Q2 traction exceeded threshold | Maintain current investment | CEO | Next QBR |

### Step 4: Quarterly Focus Areas

Define 2–3 focus areas for the coming quarter. These are **not** OKRs — they are thematic priorities that OKRs should align to.

Example:
```
Q3 2026 Focus Areas:

1. Platform Reliability
   Why: Q2 had 3 critical incidents; customer trust is at risk
   Success: <1 critical incident; p99 latency < 200ms

2. Enterprise GTM
   Why: 3 enterprise pilots are in evaluation; need to convert
   Success: 2/3 pilots converted to paid contracts
```

### Step 5: Communication

Within 1 week of the QBR:
1. Share QBR summary with the company (all-hands or written)
2. Publish the decision log
3. Update the [annual plan](./annual-strategic-planning.md) if course corrections were made
4. Teams update their OKRs to align with new focus areas

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| OKR is significantly behind (>50% miss) | Kill it / Extend it / Pivot it | Kill if strategy no longer supports it; extend if execution was the issue |
| New opportunity emerged mid-quarter | Ignore / Add to Next / Swap with Now | Swap only if the opportunity is 2x the value of what you're swapping out |
| Team disagrees on root cause of a miss | Investigate / Table it / Escalate | Assign a 1-week investigation with a specific hypothesis to test |
| Annual plan assumption invalidated | Minor adjustment / Major re-plan | Major re-plan if a strategic pillar is affected; minor adjustment otherwise |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Pre-work | 1-page QBR briefs from each function |
| QBR session | Decision log; next quarter focus areas |
| Post-QBR | Company-wide summary; updated plan; cascaded OKR adjustments |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| QBR as a status meeting | Reading out slides that everyone has already read | Pre-read materials; session is for discussion and decisions |
| No difficult conversations | Real issues are avoided; plan diverges from reality | Facilitator must surface the elephant in the room |
| Decision log as an afterthought | Decisions are made but not tracked; nothing changes | Assign a note-taker; review the decision log monthly |
| OKR scores without reflection | Numbers without context don't drive improvement | Every score must have a 1-sentence "why" |
| Skipping the external environment update | Plan becomes disconnected from market reality | 45 minutes minimum on external changes; use [strategy frameworks](../strategy/) |

## This product's landing instance

*To be filled in with the most recent QBR. Include the quarter, the key decisions made, the focus areas for the next quarter, and a link to the decision log.*