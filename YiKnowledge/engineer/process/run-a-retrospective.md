---
title: Run a retrospective
aliases:
- I want to run a retrospective meeting
- retro-journey
- postmortem-journey
- retrospective entry
tags:
- journeys
- retrospective
- postmortem
- blameless
- 5whys
- sprint-retro
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../strategies/run-iteration-meetings.md
- ../../product-manager/delivery/README.md
review_cycle: quarterly
tacit: false
---

# I want to run a retrospective

> **As an** engineer, **I want to** run a retrospective, **so that** process is repeatable. 

> "Iteration retrospective / incident retrospective / 5whys / blameless / action items land in process" reaches within 2 hops the retrospective template + incident retrospective + sprint retro + review meeting. 

## Summary

- template via [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) + [sprint-retrospective-template.md](sprint-retrospective.md)
- incident retrospective via [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md)
- samples via [retrospective-sample.md](../../product-manager/delivery/retrospective.md) + [review-meeting-template.md](../../product-manager/delivery/review-meeting.md)
- archive via [lessons/failures/bugs/](../lessons) + [lessons/wins/](../lessons)

## Core viewpoints

- **A retrospective without action items is not a retrospective — it is a complaint session** — The most common failure mode is a retrospective that produces great discussion but zero action items. The output of a retrospective is not insight; it is action. Every retrospective must produce at least one action item with an owner and a due date. A retrospective with zero action items is a meeting that happened but a process that didn't change.

- **Blameless is not a posture — it is a contract** — Declaring a retrospective "blameless" does not make it blameless. The contract is: the facilitator enforces no personal blame, the timeline uses objective facts (not names), and the root cause analysis goes deep enough to find systemic causes (not individual errors). A retrospective that ends with "X was careless" has violated the blameless contract.

- **The 5-Whys is not a formality — it is a depth requirement** — Asking "why" once usually produces "someone made a mistake." Asking "why" five times usually produces "the process made the mistake inevitable." The first "why" is always about the individual; the fifth "why" is always about the system. Stopping at the first "why" is the single most common cause of repeated incidents.

- **Action items without follow-up are promises without accountability** — An action item with an owner and a due date but no follow-up mechanism is a promise that will be forgotten. The 30/60/90-day retrospective check is the accountability mechanism. An action item that is overdue at the 30-day check must be escalated, not deferred.

- **The retrospective archive is the organization's institutional memory** — A retrospective that is not archived in `lessons/wins/` or `lessons/failures/` is a lesson learned by one team and forgotten by the organization. The archive is the mechanism that prevents the same mistake from being made by a different team. A retrospective that is not archived is a retrospective that will be repeated.

## Key info

- **Retrospective formats**: (1) Start-Stop-Continue (what should we start doing, stop doing, continue doing -- simplest, 30 minutes, best for weekly sprint retros), (2) 4Ls (Liked, Learned, Lacked, Longed For -- 45 minutes, best for project post-mortems), (3) Sailboat (wind = what helped, anchor = what held us back, rocks = risks ahead, island = goal -- 60 minutes, best for quarterly retros), (4) 5-Whys (drill into root cause, 60-90 minutes, best for incident postmortems). The format should match the retro scope: sprint retros use Start-Stop-Continue; incident retros use 5-Whys.
- **5-Whys depth**: Why 1 (proximate cause: "the deploy broke production") → Why 2 (immediate cause: "the migration script had a bug") → Why 3 (process cause: "the migration script wasn't tested in staging") → Why 4 (systemic cause: "staging doesn't have production-like data volume") → Why 5 (root cause: "there's no requirement for staging to mirror production data"). The jump from Why 3 to Why 4 is the most important: it crosses from individual action to systemic gap. Most retros stop at Why 3.
- **Action item format**: `[Action] <what> | Owner: <name> | Due: <date> | Success metric: <measurable> | Follow-up: <date>`. Example: `[Action] Add production-data-volume staging test | Owner: Alice | Due: 2026-08-21 | Success metric: staging test catches migration failures before deploy | Follow-up: 2026-09-07`. The success metric is the most frequently omitted field: without it, "done" is subjective. The follow-up date is the second most omitted: without it, the action item is assumed done until proven otherwise.
- **Retrospective timing**: sprint retro (30-45 minutes at sprint end, full team, mandatory), incident retro (60-90 minutes within 48 hours of incident resolution, involved team + oncall, mandatory), project post-mortem (60-90 minutes within 1 week of project completion, full project team + stakeholders, mandatory), quarterly retro (2-3 hours, entire engineering org, optional but recommended). The timing rule: the longer you wait, the less accurate the memory. Incident retros within 24 hours have the most accurate timelines; retros after 1 week have significant memory decay.
- **Retrospective facilitation anti-patterns**: (1) the manager facilitates (power dynamic inhibits honesty -- use a peer or external facilitator), (2) the loudest voice dominates (use round-robin or silent writing first), (3) the retro becomes a planning meeting (facilitator must redirect: "that's a planning discussion, let's capture it for the planning meeting"), (4) only problems are discussed (must also capture what went well -- wins are patterns to repeat).

## Scenario

At iteration end / after incident / after project delivery / quarterly review, PM + primary owner need to run a retrospective to consolidate lessons. this entry aggregates retrospective template, incident retrospective template, sprint retro, review meeting, 5whys method into a 2-hop path, avoiding "retrospective turns into complaint session / action items have no owner and no follow-up / same problems repeated". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) |
| `work/processes/` | [sprint-retrospective-template.md](sprint-retrospective.md) · [iteration-pm-handbook-summary.md](iteration-pm-handbook.md) · [knowledge-transfer-process.md](knowledge-transfer.md) — knowledge consolidation after retrospective |
| `work/meetings/` | [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [retrospective-meeting-template.md](../../product-manager/delivery/retrospective-meeting.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) — success retrospective samples |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) — retrospective root-cause thinking tools |
| `work/collaboration/` | [async-collaboration-principles-summary.md](async-collaboration-principles.md) — async retrospective collaboration |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) — retrospective material generation |

## Action recommendations

1. **Three categories of retrospective**: iteration retrospective (fixed cadence) / incident retrospective (event-triggered) / project retrospective (delivery-triggered); templates differ, don't mix. 
2. **Principles**: focus on the issue not the person / don't look for culprits / look for root cause not excuses / improvement items land in process not individuals; see [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md). 
3. **5whys**: keep asking 5 whys to chase root cause; do not stop at first-layer symptom. 
4. **Action items**: each must have owner + due date + acceptance criteria; next retrospective must review previous action items completion. 
5. **Time box**: iteration retrospective 60-90 min; incident retrospective within 24h, 60-90 min; project retrospective 2h. 
6. **Archive**: iteration retrospective stored in [work/meetings/](../../product-manager/delivery); incident retrospective stored in [lessons/failures/bugs/](../lessons); success lessons stored in [lessons/wins/](../lessons). 
7. **Avoid traps**: don't turn into complaint session (must have action items) / don't turn into self-praise session (must acknowledge failure) / don't turn into blame session (must focus on issue not person). 
8. **Cadence**: each iteration retro + each incident postmortem + each project close-out + each quarterly major retrospective; see [iteration-pm-handbook-summary.md](iteration-pm-handbook.md). 

## Anti-patterns

- **Retrospective turning into complaint session** — A retrospective that produces great discussion but zero action items is a complaint session, not a process improvement. Every retrospective must produce at least one action item with an owner and a due date. The output is action, not insight.

- **5-Whys stopping at the first "why"** — The first "why" is always about the individual ("X made a mistake"). The fifth "why" is always about the system ("the process allowed X to make the mistake"). Stopping at the first "why" is the single most common cause of repeated incidents. The 5-Whys is a depth requirement, not a formality.

- **Blameless in name only** — Declaring a retrospective "blameless" does not make it blameless. If the timeline includes names, the root cause is "X was careless," or the action items are "X needs to be more careful," the retrospective violated the blameless contract. The contract requires the facilitator to enforce it actively.

- **Action items without follow-up** — An action item with an owner and a due date but no follow-up mechanism is a promise that will be forgotten. The 30/60/90-day retrospective check is the accountability mechanism. Overdue action items must be escalated, not deferred.

- **Retrospective not archived** — A retrospective that is not archived in `lessons/wins/` or `lessons/failures/` is a lesson learned by one team and forgotten by the organization. The archive is the mechanism that prevents the same mistake from being made by a different team. An unarchived retrospective is a retrospective that will be repeated.

## Related

- Same-category journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — incident retrospective
- Same-category journey: [../strategies/run-iteration-meetings.md](run-iteration-meetings.md) — iteration meetings
- Same-category journey: [./review-lessons.md](./review-lessons.md) — lessons consolidation
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — retrospective cadence quarterly audit
