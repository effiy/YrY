---
title: Async collaboration principles
aliases:
- async-collaboration-principles
- asynchronous-collaboration
tags:
- collaboration
- async
- documentation-first
- PR-review
- remote-work
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
- ./cross-timezone-collaboration.md
- ./raci-matrix.md
- ../cross-team-collaboration.md
- ../../../product-manager/delivery/weekly-meeting.md
tacit: false
---

# Async collaboration principles

> **As an** engineer, **I want to** async collaboration principles, **so that** process followed predictably. 

> Does not depend on real-time sync; a working style centered on "documentation first + PR first". 

## Summary

- Async collaboration = documentation first + PR first + default no meetings; especially needed for cross-timezone and remote teams. 
- Decisions, proposals, problems — write documentation first then discuss; feedback via PR review. 
- PR response SLA written into team norms: respond within 24h, substantive review within 48h, escalate if no response by 72h. 
- Meetings are expensive; must have agenda and minutes; sync scenarios limited to brainstorming, urgent incidents, complex disputes, 1on1s, cross-cultural misunderstandings. 
- Toolset: ADR/RFC (decisions) , Git/PR (code) , Linear/Jira (tasks) , Slack/Feishu (async instant) , phone/SMS (urgent) .

## Core viewpoints

- **Documentation-first is not about writing more -- it is about shifting the cost of alignment from synchronous calendar time to asynchronous reading time.** Every hour spent in a meeting burns calendar-hours from every attendee in parallel; the same hour spent writing documentation is consumed once and read asynchronously by everyone. The real efficiency gain is not in the writing itself but in decoupling information transfer from schedule coordination.

- **PR review is the highest-leverage collaboration mechanism because it creates a permanent, egalitarian, and searchable artifact.** Unlike meetings where the loudest voice often wins and absentees are excluded, PR comments level the playing field -- junior engineers can challenge senior architects on equal footing, and decisions remain traceable years later. The archive alone justifies the practice.

- **Response SLAs are not bureaucracy -- they are the social contract that makes async work possible.** Without an explicit 24h/48h/72h cadence, the anxious party escalates to synchronous channels prematurely, and the whole async system collapses. The SLA is a promise that replaces the urge to tap someone on the shoulder.

- **The real enemy of async collaboration is not meetings -- it is the expectation of instant response on instant messaging.** Slack and Feishu are technically async tools, but cultural norms often treat them as synchronous. The team that defaults to "respond within 4 hours" preserves deep work; the team that expects acknowledgment within 4 minutes is doing sync work with extra steps.

- **Meetings are not evil -- they are a scarce resource that must be allocated with the same discipline as budget.** Brainstorming, urgent incidents, complex disputes, 1on1s, and cross-cultural misunderstandings genuinely benefit from synchronous bandwidth. The problem is not having meetings; the problem is defaulting to meetings for everything, which depletes the budget for the scenarios that actually need them. 


- Documentation first is more efficient than meetings — self-contained, structured documentation gives discussion a foundation; meetings shift from "reading material" to "making decisions". 
- PR is the discussion vehicle, not just code review — comments persist permanently, cross-level conversations are equal, absent members can catch up, meetings have no record. 
- Default async protects deep work — instant messages expecting instant response disrupt deep work; responding within 4h is enough. 
- Meetings are expensive, not the default option — meet when necessary, with agenda and minutes, 30 minutes as the upper limit. 

## Key information

### Core principles

| Principle | Meaning |
|---|---|
| Documentation first | Decisions, proposals, problems — write documentation first, then discuss |
| PR first | Feedback via PR review; can progress without meetings |
| Default async | Avoid verbal discussion when possible; leave a record |
| Meetings are expensive | Meet when necessary; meetings must have agenda and minutes |
| Timezone friendly | Don't expect others to respond during your working hours |

### When to write documentation

- Proposing a new solution → RFC / ADR
- Feedback on design → documentation / PR comments
- Reporting an issue → issue tracker
- Sharing knowledge → internal wiki

### Documentation quality requirements

- Self-contained: others can understand without reading other materials
- Structured: background / decision / option / risk
- Clear recommendation: what decision to make / when to give feedback
- Deadline: feedback due date

### PR response SLA

| Timeframe | Action |
|---|---|
| Within 24h | Respond (even just "will look tomorrow")  |
| Within 48h | Substantive review |
| 72h no response | Escalate |

### Toolset

| Use | Tool |
|---|---|
| Decision records | ADR / RFC documentation |
| Code and proposals | Git / PR |
| Task tracking | Linear / Jira / Asana |
| Long-form discussion | Documentation comments |
| Instant but non-urgent | Slack / Feishu (async semantics)  |
| Urgent | Phone / SMS |

### Sync scenarios (still need meetings) 

| Scenario | Why sync |
|---|---|
| Brainstorming | Real-time interaction is more efficient |
| Urgent incident response | Decisions must be fast |
| Complex disputes | Async may go off-topic |
| 1on1 | Relationship building |
| Cross-cultural misunderstandings | Text lacks tone |

### Applicable scenarios

- Cross-timezone, remote, deep-work teams
- Leaders want teams to be self-driven rather than meeting-driven
- PR review load is heavy; needs structured feedback
- Decisions need to be archived and traceable

## Action recommendations

1. Team agrees on tools and cadence: ADR/RFC for decisions, PR for feedback, Linear for tasks
2. Write PR response SLA into team norms (24h/48h/72h) 
3. Set a weekly meeting budget cap (e.g. ≤ 5h / person) 
4. Standardize documentation templates (RFC / ADR / retrospective) 
5. Leaders set the example: send RFCs instead of organizing meetings
6. Include PR review time in working hours; don't treat as "casual work"
7. Give reviewers ample time; don't push



- Meetings for everything (six meetings a day)  — default async; meetings are the exception
- Discussing before writing documentation — discussion has no foundation; documentation must come first
- PR not responded to (stuck 3 days)  — must respond within 24h
- Sync discussions without minutes — decisions lost; must have minutes + sync to documentation
- Expecting instant response from instant messages — disrupts deep work; responding within 4h is fine

## Anti-patterns

- **Using meetings as the default communication channel.** When every decision requires a synchronous meeting, the team's calendar fills with status updates rather than decision-making. Consequence: deep work evaporates, cross-timezone members are excluded, and the organization becomes meeting-driven rather than outcome-driven. The fix is simple -- if it can be a document, make it a document first.

- **Writing documentation that presupposes meeting context.** A document that says "as discussed in the meeting" or references oral decisions without recapitulation is worse than no document at all, because it creates an illusion of completeness while excluding anyone who was not in the room. Documentation must be self-contained: a new hire six months later should be able to understand the decision without asking anyone.

- **Treating PR review as a gatekeeping checklist rather than a collaborative discussion.** When reviewers only look for style violations and approve mechanically, the PR loses its value as a design discussion vehicle. Consequence: architectural flaws pass through review, junior engineers learn nothing, and the review becomes a chore that everyone rushes through.

- **Using "urgent" as a workaround for poor planning.** When everything is urgent, nothing is. The P0 escalation path (phone/SMS) exists for genuine incidents, not for catching up on a deadline that was missed due to procrastination. Consequence: the team develops alarm fatigue, and real emergencies get buried in the noise.

- **Confusing "being responsive" with "being available."** Responding to messages within 4 hours is responsive; responding within 4 minutes is being on-call. When team members feel pressured to answer instantly, they stop doing deep work entirely and fragment their attention across the day. The async system only works if the team collectively agrees that delayed response is normal and expected.

## Related

- Same class: [cross-timezone collaboration conventions](./cross-timezone-collaboration.md) , [RACI matrix](./raci-matrix.md)
- Upstream: [cross-team collaboration process](cross-team-collaboration.md)
- Downstream: [weekly meeting template](../../product-manager/delivery/weekly-meeting.md) (meeting budget control) 
- References: GitLab *Remote Manifesto*, Basecamp *Shape Up*
