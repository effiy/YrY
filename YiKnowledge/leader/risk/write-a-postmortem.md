---
title: Write a Postmortem — Methodology and Template
aliases: [write-a-postmortem, postmortem-methodology, blameless-postmortem]
tags: [leader, risk, postmortem, incident, methodology, template]
category: leader/risk
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, srer, engineer]
benefit: "Leaders and SREs write consistent, blameless postmortems that produce actionable prevention, not just a timeline"
acceptance_criteria:
  - "5 sections: Timeline, Root Cause, Impact, Prevention, Lessons Learned"
  - "blameless language guide included"
  - "distinguishes postmortem methodology (leader/) from postmortem records (srer/)"
related:
  - ./README.md
  - ../../srer/incident-response/respond-to-an-incident.md
  - ../../curator/templates/retrospective.md
  - ../../engineer/learn/lessons/failures/
---

# Write a Postmortem

> **When to use:** After every P1 or P2 incident, and after any incident that taught the team something new. A postmortem's purpose is **learning and prevention**, not blame.

## Boundary: Methodology vs. Records

| Aspect | Owner | Location |
|---|---|---|
| **Postmortem methodology** (this file) | leader/risk/ | How to write a good postmortem |
| **Postmortem records** (actual incidents) | srer/incident-response/ | Specific incident postmortems |
| **Postmortem lessons** (field notes) | engineer/learn/lessons/ | Patterns extracted from postmortems |

## When to Write a Postmortem

| Trigger | Required? |
|---|---|
| P1 incident (critical user journey broken) | **Required** — within 24 hours |
| P2 incident (significant degradation) | **Required** — within 48 hours |
| P3 incident (minor issue) | Optional — if the team learned something |
| Near-miss (almost an incident) | **Recommended** — cheapest time to learn |
| Successful recovery (caught early) | **Recommended** — what worked? |

## Postmortem Structure

### 1. Summary

One paragraph: what happened, impact, duration.

**Example:** "On 2026-08-15, YiAi was unavailable for 23 minutes. The root cause was a MongoDB connection pool exhaustion triggered by a deployment that doubled the default pool size without increasing the server's `maxIncomingConnections`. Impact: 142 failed chat requests. No data was lost."

### 2. Timeline (UTC)

| Time | Event |
|---|---|
| 14:32 | Deployment v2.1.0 rolled out (doubled connection pool from 50 to 100) |
| 14:35 | First `connection pool exhausted` error in logs |
| 14:38 | PagerDuty alert: error rate > 5% |
| 14:40 | On-call acknowledged, began investigation |
| 14:45 | Identified connection pool as root cause |
| 14:50 | Rollback initiated |
| 14:55 | Service restored; error rate back to baseline |

**Key:** Include the **detection time** (when the problem started), **awareness time** (when the team knew), and **resolution time** (when it was fixed).

### 3. Root Cause Analysis

Use **5-Whys** to go beyond the surface:

| Why # | Answer |
|---|---|
| 1. Why did chat requests fail? | MongoDB connection pool was exhausted |
| 2. Why was the pool exhausted? | Deployment doubled the pool size without increasing server limit |
| 3. Why did the deployment change the pool size? | The config change was in a PR that only reviewed code logic, not infra impact |
| 4. Why wasn't infra impact reviewed? | No checklist for connection pool changes in the deployment process |
| 5. Why is there no checklist? | We've never had a connection pool incident before |

**Root cause:** Missing process — no infrastructure impact review for config changes that affect external resources.

### 4. Impact

| Dimension | Detail |
|---|---|
| **Users affected** | 142 chat requests failed (23 unique users) |
| **Duration** | 23 minutes (14:32 — 14:55 UTC) |
| **Data loss** | None |
| **Revenue impact** | None (internal tool) |
| **SLO impact** | Availability dropped to 99.7% for August (below 99.9% SLO) |

### 5. Prevention (Action Items)

| # | Action | Owner | Due | Priority |
|---|---|---|---|---|
| 1 | Add connection pool config changes to deployment checklist | Alice | 2026-08-20 | P0 |
| 2 | Add `maxIncomingConnections` alert when usage > 80% | Bob | 2026-08-22 | P0 |
| 3 | Run a game day: "MongoDB connection pool exhaustion" | Carol | 2026-09-01 | P1 |
| 4 | Document connection pool sizing in runbook | Alice | 2026-08-25 | P1 |

### 6. Lessons Learned

#### What Went Well
- On-call acknowledged the alert within 3 minutes
- Rollback was clean and fast (5 minutes)
- Incident channel communication was clear and timely

#### What Went Poorly
- No pre-deployment checklist caught the config change
- Alert fired 6 minutes after the first error (too slow)
- Dashboard didn't show connection pool usage (blind spot)

#### Surprises
- MongoDB Atlas didn't reject connections — it queued them, causing latency spikes before the errors

## Blameless Language Guide

| Instead of... | Say... |
|---|---|
| "Alice made a mistake in the config" | "The config change doubled the pool size without updating the server limit" |
| "Bob should have caught this in review" | "The review process didn't check for infrastructure impact" |
| "Why did you..." | "What led to..." |
| "Who is responsible?" | "What process change will prevent this?" |

**Rule:** Every "who" question should be converted to a "what" question. Blame is about people; learning is about systems.

## Postmortem Lifecycle

```
Draft (within 24h) → Review (team + stakeholders) → Published → Action items tracked → Closed (all actions done)
```

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Postmortem without 5-Whys | Timeline without root cause; same incident recurs | Always go 5 levels deep; the first answer is never the root cause |
| Blaming individuals | Team hides incidents; learning stops | Focus on process and systems; use blameless language |
| Action items without owners or due dates | Nothing changes; postmortem is a write-only document | Every action has one owner and a specific due date |
| Postmortem delayed by weeks | Memory fades; details are lost; team moves on | Write within 24 hours for P1, 48 hours for P2 |
| No follow-up on action items | Postmortem is published and forgotten | Track action items in the same system as feature work; review at next incident review |