---
title: Run iteration meetings
aliases:
- I want to run iteration meetings
- iteration-meetings-journey
- Weekly report / Daily report / Retrospective entry
tags:
- journeys
- meetings
- weekly-report
- daily-report
- retrospective
- iteration-pm
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
- ../../new-hire/onboarding/handoff-project.md
- ../processes/review-lessons.md
- ../../product-manager/delivery/README.md
- ../../README.md
review_cycle: quarterly
tacit: false
---

# I want to run iteration meetings

> **As an** engineer, **I want to** run iteration meetings, **so that** process is repeatable. 

> "weekly report / daily report / Retrospective / weekly meeting / review meeting — how to run + what templates to use" reachable within 2 hops to meeting templates + report instances + Retrospective Keep/Drop/Try + iteration PM handbook. 

## Summary

- weekly report / daily report / Retrospective instance via [../../product-manager/delivery/](../../product-manager/delivery): weekly-report-sample / daily-report-sample / retrospective-sample
- Templates via `../../product-manager/delivery/*-template.md`: weekly meeting / review meeting / retrospective meeting + `work/onboarding/*` checklist
- Retrospective Keep/Drop/Try via [retrospective-template](../../knowledge-curator/templates/retrospective.md)
- iteration cadence via [iteration-pm-handbook-summary](iteration-pm-handbook.md)

## Core viewpoints

- **The weekly report is not a status update — it is a risk signal** — A weekly report that says "everything is on track" for 4 weeks followed by a crisis in week 5 is a failure of reporting. The purpose of the weekly report is to surface risks before they become crises. Every report must answer: what is the biggest risk this week, and what is being done about it? A report without a risk section is a status update, not a risk signal.

- **The daily report is the most underutilized tool for detecting schedule drift** — A daily report that takes 5 minutes to write but reveals that a 4-hour task took 8 hours saves days of schedule drift. The daily report is not about accountability; it is about early detection. The iteration PM who reads daily reports can detect schedule drift on day 2, not in week 4.

- **Retrospective Keep/Drop/Try is not a format — it is a decision framework** — Keep (what worked, continue doing it), Drop (what didn't work, stop doing it), Try (what might work, experiment with it). The framework forces the team to make concrete decisions, not just share feelings. "The deployment process was slow" is a feeling; "Drop: manual deployment step 3; Try: automated deployment pipeline" is a decision.

- **Meeting templates are the difference between a meeting and a ceremony** — A meeting without a template is a conversation that may or may not produce decisions. A meeting with a template is a process that produces a structured output. The template forces the facilitator to prepare an agenda, the participants to prepare their input, and the meeting to produce decisions with owners and due dates.

- **The iteration meeting cadence is a rhythm, not a schedule** — Weekly report (Friday), daily report (daily), retrospective (iteration end), review meeting (milestone) — the cadence is not about filling slots on a calendar; it is about creating a rhythm of plan-do-check-adjust. A team that skips retrospectives loses the "check" and "adjust" phases; a team that skips weekly reports loses the "plan" phase.

## Key info

- **Weekly report structure (5 sections)**: (1) This week delivered — concrete outputs with links to PRs, documents, or deployed features; (2) Next week plan — prioritized list with estimated effort; (3) Blocking — what is preventing progress and who can unblock it; (4) Cross-project links — dependencies on or impacts to YiAi/YiVad/YiPet; (5) Risk radar — the biggest risk this week and the mitigation in progress. The risk section is the most frequently omitted and the most important: a report without risk is a status update, not a risk signal. The Yi-family projects use a shared weekly report template generated via the `weekly-report-prompt.md` AI prompt.
- **Daily report structure (5 sections)**: (1) Today completed — what was done, with PR links; (2) PR quick view — open PRs, review status, merge readiness; (3) Tomorrow plan — what will be worked on; (4) Blocking — immediate blockers needing same-day resolution; (5) Risk radar — any schedule deviation detected today. The daily report takes 5 minutes to write and is the primary mechanism for detecting schedule drift. A 4-hour task that took 8 hours is visible in the daily report on the same day; without it, the drift is discovered at the end of the iteration.
- **Retrospective Keep/Drop/Try decision tracking**: Keep items must have a continuation plan (who will ensure it continues, how it will be measured); Drop items must have a stop date and a replacement process (what replaces the dropped activity); Try items must have an experiment duration (typically one iteration), a success metric, and an owner. The retrospective output is not complete until every Keep/Drop/Try item has an owner and a due date. The Yi-family projects currently run retrospectives ad-hoc; there is no formal iteration-end retrospective cadence.
- **Iteration PM handbook metrics**: The iteration PM tracks: (1) velocity (story points completed per iteration, rolling 3-iteration average), (2) cycle time (time from "in progress" to "done," target <3 days for small tasks), (3) throughput (number of tasks completed per iteration), (4) blocker resolution time (time from blocker reported to blocker resolved, target <24 hours), (5) retrospective action completion rate (percentage of previous retrospective actions completed by the next retrospective). These 5 metrics are the minimum set for data-driven iteration management.
- **Meeting template effectiveness**: A meeting with a template produces decisions with owners and due dates; a meeting without a template produces a conversation. The template must include: (1) agenda with timeboxes per item, (2) pre-read materials sent 24 hours before, (3) decision log (what was decided, by whom, with what rationale), (4) action items with single owner and due date, (5) next meeting date and agenda preview. The Yi-family projects use shared meeting templates from `product-manager/delivery/` for weekly, review, and retrospective meetings.
- **Cadence failure modes by phase**: Skip weekly reports → lose the "plan" phase → team works on unprioritized tasks. Skip daily reports → lose early drift detection → 4-hour delays compound into week-long slips. Skip retrospectives → lose the "check" and "adjust" phases → same mistakes repeat across iterations. Skip review meetings → lose stakeholder alignment → the team builds the wrong thing. The full cadence (weekly + daily + retrospective + review) is the minimum viable rhythm; removing any one phase breaks the plan-do-check-adjust cycle.

## Scenario description

Every week / every day / every iteration end, PM + main owner need to run weekly meeting / write weekly report / write daily report / run Retrospective meeting / run review meeting. This entry aggregates meeting templates, report instances, Retrospective Keep/Drop/Try, iteration PM handbook into a 2-hop path, avoiding "no meeting template / report from memory / Retrospective going through motions". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/meetings/` | [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-meeting-template.md](../../product-manager/delivery/retrospective-meeting.md) |
| `resources/templates/` | [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [adr-summary.md](../../knowledge-curator/templates/adr.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) — weekly report / Retrospective generation prompt |
| `work/processes/` | [iteration-pm-handbook-summary.md](iteration-pm-handbook.md) · [tech-roadmap-review-summary.md](tech-roadmap-review.md) · [engineering-productivity-metrics-summary.md](engineering-productivity-metrics.md) · [org-productivity-diagnosis-summary.md](org-productivity-diagnosis.md) |
| `work/collaboration/` | [async-collaboration-principles-summary.md](async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](cross-timezone-collaboration.md) · [raci-matrix-summary.md](raci-matrix.md) |
| `projects/{YiAi,YiVad,YiPet}/` | [project-management-summary.md](../../product-manager/projects/yiai--project-management.md) · [YiVad PM](../../product-manager/projects/yivad--project-management.md) · [YiPet PM](../../product-manager/projects/yipet--project-management.md) — iteration cadence / deliverables / cross-project links |
| `lessons/wins/` | [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) — Retrospective outputs |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) |
| `methodology/thinking/` | [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — Retrospective thinking frameworks |

## Action recommendations

1. Weekly report via `weekly-report-sample.md` (this week delivered / next week plan / blocking / cross-project links / risk), use `weekly-report-prompt.md` to generate draft. 
2. Daily report via `daily-report-sample.md` (today complete / PR quick view / tomorrow plan / blocking / risk radar). 
3. Retrospective via `retrospective-sample.md` Keep/Drop/Try + sedimented outputs + key event timeline. 
4. Weekly meeting / review meeting / retrospective meeting use `*-meeting-template.md`, meeting minutes via `meeting-notes-template.md`. 
5. 1on1 via `one-on-one-template.md`, quarterly trace to grow long. 
6. Iteration cadence via `iteration-pm-handbook-summary.md`, cross-project links sync every week. 
7. Retrospective outputs must enter `lessons/wins/` or `lessons/failures/`, no sediment = repeat mistakes. 
8. Incident Retrospective via `incident-postmortem-summary.md`, archive to `lessons/failures/bugs/`. 
9. Retrospective uses thinking frameworks (SOLH / Inversion / second-order) to extend ideas, not just columns Keep/Drop/Try. 

## Anti-patterns

- **Weekly report without a risk section** — A weekly report that says "everything is on track" for 4 weeks followed by a crisis in week 5 is a failure of reporting. Every report must answer: what is the biggest risk this week, and what is being done about it? A report without risk is a status update, not a risk signal.

- **Retrospective turning into a ceremony** — Keep/Drop/Try without concrete decisions, owners, and due dates is a ceremony, not a retrospective. "Keep: good communication" is a feeling; "Keep: async PR review process, owner: @team-lead, review: next retro" is a decision. The output of a retrospective is action, not sentiment.

- **Retrospective outputs not archived** — A retrospective that is not archived in `lessons/wins/` or `lessons/failures/` is a lesson learned by one team and forgotten by the organization. The archive is the mechanism that prevents the same mistake from being made by a different team. An unarchived retrospective is a retrospective that will be repeated.

- **Daily reports that are skipped when "too busy"** — The daily report is the first thing to be dropped when the team is busy, but it is precisely when the team is busy that schedule drift is most likely. A daily report that takes 5 minutes to write can reveal a 4-hour delay that saves days of schedule drift. Skipping daily reports during crunch time is the most expensive form of time-saving.

- **Meeting without a template** — A meeting without a template is a conversation that may or may not produce decisions. A meeting with a template is a process that produces a structured output with owners and due dates. The template is the difference between "we should do something about X" and "owner: @Y, action: do Z, due: Friday."

## Related

- Related journey: [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) — handoff = Retrospective output transferred
- Related journey: [../processes/review-lessons.md](review-lessons.md) — Retrospective output sediment
- Related journey: [./find-templates-and-prompts.md](../engineering/find-templates-and-prompts.md) — Templates and Prompts
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — Operations 4 Roles 3 Cadences
