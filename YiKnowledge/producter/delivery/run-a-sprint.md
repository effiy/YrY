---
title: Run a Sprint
aliases: [run-a-sprint, sprint-management, agile-sprint]
tags: [producter, delivery, sprint, agile, process]
category: producter/delivery
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer, leader]
benefit: "Producters run effective sprints — from planning to retrospective — with clear rituals and deliverables"
acceptance_criteria:
  - "5 sprint rituals: planning, daily standup, review, retrospective, grooming"
  - "includes sprint length guidelines and capacity planning"
  - "covers common sprint anti-patterns"
related:
  - ./README.md
  - ../frameworks/rice-ice-prioritization.md
  - ../../curator/templates/retrospective.md
  - ../../curator/templates/meeting-notes.md
---

# Run a Sprint

> **When to use:** For any team running 1-2 week development cycles. A well-run sprint turns a prioritized backlog into shipped value predictably.

## Sprint Cadence

| Ritual | When | Duration | Who |
|---|---|---|---|
| **Sprint Planning** | Start of sprint (Monday) | 1-2 hours | Full team |
| **Daily Standup** | Every day | 15 min | Full team |
| **Backlog Grooming** | Mid-sprint (Wednesday) | 1 hour | PM + Tech lead |
| **Sprint Review / Demo** | End of sprint (Friday) | 30-60 min | Full team + stakeholders |
| **Sprint Retrospective** | End of sprint (Friday) | 45-60 min | Full team |

## Sprint Length

| Length | Best for | Tradeoff |
|---|---|---|
| **1 week** | Fast-paced teams, early-stage products | High overhead; less time for deep work |
| **2 weeks** | Most teams — good balance | Standard; most common |
| **3-4 weeks** | Mature products, enterprise | Less feedback; harder to course-correct |

**Recommendation:** Start with 2-week sprints. Switch to 1-week only if the team consistently delivers early.

## 1. Sprint Planning

### Inputs
- Prioritized backlog (from [rice-ice-prioritization.md](../frameworks/rice-ice-prioritization.md))
- Team capacity (who's available, who's on vacation)
- Velocity from last 3 sprints

### Agenda

1. **Set the sprint goal** (5 min) — one sentence: "By the end of this sprint, we will {{outcome}}."
2. **Review capacity** (5 min) — "Alice is on vacation Thu-Fri; Bob has 50% on-call."
3. **Pull from backlog** (30-60 min) — top-priority items until capacity is full
4. **Break down stories** (15 min) — each story has clear acceptance criteria
5. **Commit** (5 min) — team agrees the plan is achievable

### Capacity Formula

```
Available hours = (team_size × work_days × 6h) - (on-call hours) - (vacation hours)
Sprint capacity = available hours × 0.7  (70% for meetings, context switch)
```

## 2. Daily Standup

Each person answers 3 questions in ≤ 1 minute:

1. What did I accomplish yesterday?
2. What am I working on today?
3. What's blocking me?

**Rules:**
- Same time, same place every day
- Stand up (literally — it keeps it short)
- No problem-solving during standup — take it offline
- If someone is blocked, the standup's job is to unblock them

## 3. Backlog Grooming

### Agenda

1. **Review new items** — triage incoming bugs, feature requests
2. **Estimate** — story points or t-shirt sizes (S/M/L/XL)
3. **Prioritize** — RICE/ICE scoring; move top items to the top
4. **Prune** — close items that are > 3 months stale with no activity

### Estimation Scale

| Size | Story Points | Meaning |
|---|---|---|
| XS | 1 | Trivial — one line change, config update |
| S | 2 | Small — one file, well-understood |
| M | 3-5 | Medium — multiple files, some uncertainty |
| L | 8 | Large — multiple services, significant uncertainty |
| XL | 13+ | Too large — must be broken down |

## 4. Sprint Review / Demo

- **Demo what was built** — not slides, actual working software
- **Stakeholders give feedback** — capture as new backlog items
- **Review metrics** — did we hit the sprint goal?
- **Celebrate wins** — recognize specific contributions

## 5. Sprint Retrospective

Use the [retrospective template](../../curator/templates/retrospective.md). Key questions:

1. What went well? (Keep doing)
2. What didn't go well? (Stop doing or change)
3. What did we learn? (Start doing)

Limit to 3 action items per retro. Track them to completion.

## Sprint Health Metrics

| Metric | Healthy | Warning | Critical |
|---|---|---|---|
| **Planned vs. delivered** | > 80% | 60-80% | < 60% |
| **Sprint goal met** | 4/5 sprints | 2-3/5 | < 2/5 |
| **Carry-over** | < 20% | 20-40% | > 40% |
| **Unplanned work** | < 20% | 20-40% | > 40% |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Sprint goal is "finish the tickets" | No outcome focus; team optimizes for ticket count, not value | Set a specific, outcome-oriented sprint goal |
| 100% capacity planning | No buffer for unplanned work; every sprint "fails" | Plan at 70% capacity; leave room for interruptions |
| Standup as status report to the PM | PM becomes bottleneck; team stops talking to each other | Standup is for the team to coordinate; PM listens |
| Skipping retro because "we're too busy" | Same problems repeat; team never improves | Retro is the most important ritual — never skip it |
| Stories without acceptance criteria | "Done" is ambiguous; QA doesn't know what to test | Every story has at least 1 verifiable acceptance criterion |