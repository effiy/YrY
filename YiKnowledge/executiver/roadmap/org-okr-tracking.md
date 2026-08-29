---
title: Org-Level OKR Tracking
aliases: [okr, objectives, key-results, goal-tracking]
tags: [roadmap, okr, goals, tracking, cascade]
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
benefit: "Define, cascade, and track organization-wide OKRs with a clear methodology, grading scale, and check-in cadence"
related:
  - ./annual-strategic-planning.md
  - ./quarterly-business-review.md
  - ../strategy/now-next-later-roadmap.md
  - ../../producter/discovery/metrics/README.md
  - ../README.md
  - ../INDEX.md
---

# Org-Level OKR Tracking

> **As an** executiver, **I want to** define, cascade, and track OKRs across the organization, **so that** everyone is aligned on what matters and how we measure success.

## Definition

OKRs (Objectives and Key Results) are a goal-setting framework:

- **Objective**: A qualitative, inspiring goal. Answers "Where do we want to go?"
- **Key Results**: 2–5 quantitative measures. Answers "How do we know we're getting there?"

```
Objective: Become the most trusted AI platform for enterprise compliance

  KR1: Achieve SOC 2 Type II certification by Q2
  KR2: 0 critical security incidents with customer data exposure
  KR3: NPS > 60 among enterprise customers ($100K+ ARR)
  KR4: Publish 12 compliance-related content pieces; generate 500 qualified leads
```

## Applicable scenarios

- Translating the [annual plan](./annual-strategic-planning.md) into measurable goals
- Quarterly OKR setting during [QBR](./quarterly-business-review.md)
- Aligning multiple teams around shared outcomes
- Board/investor reporting on company performance
- Identifying misalignment early when teams pursue conflicting goals

## Design steps

### Step 1: Set org-level OKRs (top-down)

Start with the company's strategic pillars from the [annual plan](./annual-strategic-planning.md). For each pillar, define 1 objective with 2–5 key results.

**Rules for good Objectives**:
- Qualitative and aspirational (not "Hit $X revenue")
- Action-oriented (start with a verb)
- Time-bound (quarterly cycle)
- Memorable (people should be able to recite them)

**Rules for good Key Results**:
- Measurable with a clear number and baseline
- Outcome-focused, not output-focused
- Achievable but ambitious (target ~70% confidence)
- 2–5 KRs per objective (3 is the sweet spot)

| Bad KR | Good KR |
|---|---|
| "Launch new onboarding" (output) | "Reduce new user time-to-first-value from 3 days to 1 hour" (outcome) |
| "Improve performance" (vague) | "p95 API latency < 200ms (currently 450ms)" (specific) |
| "10 new customers" (sandbagging) | "25 new enterprise customers" (ambitious) |

### Step 2: Cascade to teams (bottom-up alignment)

Each team defines their OKRs that align to org-level OKRs:

```
Org OKRs (3-5 objectives)
  ├── Team A OKRs (2-3 objectives)
  ├── Team B OKRs (2-3 objectives)
  └── Team C OKRs (2-3 objectives)
```

**Alignment, not cascade**: Team OKRs don't need to map 1:1 to org OKRs. A team might contribute to 2 org objectives, or an org KR might be owned by 2 teams.

**Check for alignment gaps**:
- Does every org KR have at least one team working on it?
- Does every team OKR connect to at least one org objective?
- Are there teams with OKRs that don't connect to any org objective? (Possible misalignment or missing org objective)

### Step 3: Define the grading scale

Use a 0.0–1.0 scale with clear meaning:

| Score | Meaning | Action |
|---|---|---|
| 0.0–0.3 | Missed significantly | Root cause analysis; was it strategy, execution, or external? |
| 0.4–0.6 | Made progress but fell short | Good progress; stretch goal was appropriately ambitious |
| 0.7–0.8 | Achieved | Delivered what we committed to |
| 0.9–1.0 | Exceeded | Stretch goal wasn't stretchy enough; calibrate next quarter |

**The sweet spot is 0.6–0.8**: If you consistently hit 1.0, your KRs aren't ambitious enough. If you consistently hit 0.3, you're setting unrealistic goals or have execution problems.

### Step 4: Establish check-in cadence

| Cadence | Activity | Format |
|---|---|---|
| **Weekly** | KR progress update (number only) | Async: update the tracker |
| **Bi-weekly** | Team OKR standup | 15 min: what moved, what's blocked, any risks |
| **Monthly** | OKR health review | 30 min: on-track/at-risk/off-track assessment |
| **Quarterly** | OKR grading and retro | [QBR](./quarterly-business-review.md): score, reflect, set next quarter |

### Step 5: Run the quarterly OKR cycle

```
Week 1:     Leadership sets org OKRs (draft)
Week 2:     Teams review and propose team OKRs
Week 3:     Alignment review: do team OKRs cover org OKRs?
Week 4:     Finalize and publish OKRs
Week 5-12:  Weekly async updates + bi-weekly standups
Week 13:    Final grading; QBR retro
```

## Key outputs

| Deliverable | Format | Audience |
|---|---|---|
| Org OKRs (3–5 objectives) | Document or tracker | Company-wide |
| Team OKRs (2–3 per team) | Tracker | Teams |
| OKR alignment map | Diagram showing team-to-org alignment | Leadership |
| Weekly KR scores | Dashboard | Company-wide |
| Quarterly grades and retro | QBR section | Leadership |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| OKRs as a task list | KRs become "ship feature X" instead of outcome measures | Every KR must have a number and measure an outcome |
| OKRs tied to compensation | People sandbag to protect their bonus | OKRs are for alignment and ambition, not compensation |
| Too many OKRs | 10 objectives with 5 KRs each = nothing is a priority | 3–5 org objectives with 2–5 KRs each |
| Set-and-forget | OKRs set in week 1, never looked at until week 13 | Weekly async updates; bi-weekly standups |
| Cascading without alignment | Teams write their own OKRs without looking at org OKRs | Step 2 alignment check is mandatory |

## This product's landing instance

*To be filled in with the current quarter's OKRs. Include a link to the OKR tracker, the org-level objectives, and the most recent grading summary.*