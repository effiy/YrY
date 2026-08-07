---
title: Cross-team collaboration RACI matrix
aliases:
- raci-matrix
- raci
- role-assignment
tags:
- collaboration
- raci
- cross-team
- role
- responsibility-assignment
category: engineer/process
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
- product-manager
benefit: process followed predictably
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./async-collaboration-principles.md
- ../cross-team-collaboration.md
- ../../../product-manager/processes/requirement-review.md
- ../project-handover.md
tacit: false
---

# Cross-team collaboration RACI matrix

> **As an** engineer, **I want to** a RACI matrix, **so that** process is followed predictably. 

> Use the R/A/C/I four roles to clarify the assignment of every item/task, avoiding "three teams all doing each other's work / the right party ends up doing it".

## Summary

- RACI = Responsible (execute) / Accountable (accountability, only 1 person per task) / Consulted (consult, bidirectional) / Informed (notify, one-way). 
- Typical cross-team pain points: no one does it, decisions drag for a week, blame-shifting when problems arise, upstream does not know downstream requirements — RACI marks each task's "what to do / who decides / who to consult / who to inform" columns clearly. 
- Implementation steps: list key tasks (10-20 items) → list teams / roles → fill RACI for each task → validate each task has exactly one A → publish so everyone can look it up → review quarterly. 
- Anti-patterns: multiple A's per task (mutual buck-passing), all R with no decision-maker, C and I confused, matrix not public, set once and never updated, no escalation path. 
- Variants: RACI-VS (adds Verifier + Signoff), RASCI (adds Support), DACI (Driver/Approver/Contributor/Informed). 

## Core viewpoints

- Each task must have exactly one A — A is the ultimate responsibility holder; multiple A's equals no A; it leads to buck-passing. 
- C is bidirectional, I is one-way — what should be consulted cannot be only notified; skipping C leads to rejection and rework; skipping I leaves downstream out of sync. 
- The RACI matrix must be public — differing role views per team is the biggest barrier to cross-team collaboration; if everyone can look it up, alignment follows. 
- Quarterly review, not set-and-forget — half a year-old RACI is already outdated; regular review + escalation path needed. 

## Key information

### Four-role definition

- **R**esponsible (execute): the person doing the actual work; can be multiple people (parallel tasks); if not done, blocked.
- **A**ccountable (accountability): the person ultimately responsible for the result, **only 1 person per task**, decides and is the final decision-maker; R reports to A after completion.
- **C**onsulted (consult): must be consulted before execution, bidirectional communication (not one-way notification); consequences of skipping C: solution rejected, rework.
- **I**nformed (notify): notified after execution, one-way notification; consequences of skipping I: downstream does not know, out of sync.

### Matrix example

| task | team A | team B | team C | legal |
|---|---|---|---|---|
| requirement review | A | R | C | I |
| tech solution | R | C | I | - |
| data compliance | C | A | I | R |
| launch release | A | R | R | I |

> Each task has at least 1 A (accountability) and 1 R (execute). Multiple R can run in parallel; multiple C must all be consulted. 

### Variants

| Variant | What is added | Use case |
|---|---|---|
| RACI-VS | Verifier + Signoff | needs independent verification + signature |
| RASCI | Support | distinguish executor from auxiliary |
| DACI | Driver / Approver / Contributor / Informed | focus on decision roles |

### Apply scenarios

- Draw a RACI matrix when a cross-team project kicks off
- Decisions need 4-party signature, the "dragged for a week" pain scenario
- Teams that blame each other when problems arise
- Collaboration chains where upstream does not know downstream requirements
- Project handover, quarterly review

## Action recommendations

1. List key tasks (10-20 items) when every cross-team project kicks off
2. List related teams / roles
3. Fill R / A / C / I for each task
4. Validation: each task has exactly one A
5. Publish the matrix to all related parties; store in team wiki so everyone can look it up
6. During task execution, call the right role per the matrix
7. Quarterly review whether the matrix is still accurate
8. Define escalation path: A disagreement → upper-layer arbitration

## Anti-patterns

- **Assigning multiple A's to a single task** — when two people are both Accountable, neither feels ultimate ownership, and buck-passing becomes the default when the task stalls. Every task must have exactly one A, and that person is the final decision-maker whose name is on the outcome.

- **Having tasks with only R's and no A** — when everyone is Responsible but no one is Accountable, work gets done but decisions are never made, and the task drifts without a clear owner to unblock it. Every task needs at least one A to make the call when ambiguity arises.

- **Confusing Consulted with Informed** — treating C as a one-way notification means stakeholders who need to provide input before execution are only told after the fact, leading to rejected solutions and rework. C is bidirectional and must happen before the work begins; I is one-way and happens after.

- **Keeping the RACI matrix private** — when each team maintains its own mental model of who does what, role misalignment is the default state. The matrix must be published to a shared wiki where every team member can look it up, eliminating the "I thought your team was doing that" conversation.

- **Setting the matrix once and never reviewing it** — a RACI matrix that is six months old reflects an organization that no longer exists, with people who have moved roles and teams that have reorganized. Quarterly reviews are mandatory to keep the matrix accurate and to catch tasks that have drifted into no-owner territory.

## Related

- [./async-collaboration-principles.md](./async-collaboration-principles.md) — Async collaboration principles complementing the RACI framework
- [./cross-team-collaboration.md](./cross-team-collaboration.md) — Cross-team collaboration patterns where RACI is applied
- [./project-handover.md](./project-handover.md) — Project handover process where RACI role assignments transfer
- [../../product-manager/delivery/requirement-review.md](../../product-manager/delivery/requirement-review.md) — Requirement review process using RACI for stakeholder identification
