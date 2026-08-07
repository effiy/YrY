---
title: Iteration PM Handbook Summary
aliases:
- iteration-pm-handbook
- project-iteration-pm
tags:
- project-management
- iteration-PM
- milestone
- review
- risk-management
category: engineer/process
created: 2026-07-30
updated: 2026-08-07
source: others/project-management-handbook.md (internal handbook, redacted and rewritten)
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../product-manager/delivery/review-meeting.md
- ../../product-manager/delivery/weekly-meeting.md
- ../../product-manager/processes/requirement-review.md
- ../../oncall-sre/release/release.md
tacit: false
---

# Iteration PM Handbook Summary

> **As an** engineer, **I want to** iteration pm handbook, **so that** process followed predictably.

> The iteration PM is the first person responsible for any issue in the project; this handbook defines the full process stages, milestone nodes, and common techniques.

## Summary

- General rule: once an iteration PM is assigned, they are responsible for any issue in the project.
- Full process has 18 stages: requirement internal review → pre-estimation → pre-requirement review → formal requirement review → design review → technical proposal internal review → formal technical proposal review → milestone determination → development → test case review → Code Review → pre-test demo → testing → release plan review → design/product/business acceptance → release → retrospective → value retrospective.
- 14 milestone nodes: start/complete development, start/complete joint debugging, start/complete SIT, start/complete UAT, start/complete product acceptance, start/complete acceptance, start/complete release.
- Key points: identifying and confirming stakeholders is critical (delays often stem from unclear identification); product must attend technical proposal review and test case review; milestone determination ≤1 day after technical review pass; task granularity ≤4 hours; release plan must consider rollback; online acceptance must be done.
- Common techniques: learn to refuse-yield; written commitments; find interface person across teams; batch test submission; report progress and risk upward; meet to discuss, discuss to decide, decide to act; tight early, loose later; reserve buffer.

## Core viewpoints

- **The iteration PM is not a coordinator — they are the first responsible party** — A coordinator passes information between teams; a responsible party owns the outcome. The difference is that when something goes wrong, the coordinator asks "who should fix this?" and the responsible party asks "how do I fix this?" The iteration PM role is the latter: any issue in the project is the iteration PM's issue to resolve.

- **Stakeholder identification is the highest-leverage activity in the first week** — The single most common cause of project delays is not technical complexity; it is that a key stakeholder was not identified until the review stage. The first week of any project should be spent identifying stakeholders, confirming their participation, and getting written commitment. A stakeholder discovered in week 4 is a 3-week delay.

- **Task granularity ≤ 4 hours is not about micromanagement — it is about risk detection** — A task estimated at 16 hours that is 50% complete after 2 days looks on track. But it could be 50% complete on the easy part and 0% on the hard part. A 4-hour task that is incomplete after 4 hours is a signal that the estimate was wrong, surfacing risk immediately. The 4-hour granularity is a risk detection mechanism, not a tracking tool.

- **"Tight early, loose later" is project management's most counterintuitive principle** — The instinct is to start relaxed and accelerate as the deadline approaches. But the reverse works: tight early work (detailed planning, rigorous reviews, time-boxed milestones) creates a buffer that absorbs the inevitable late-stage surprises. Loose early work consumes the buffer before it exists, leaving no margin for the problems that always emerge at the end.

- **The 18-stage process is not bureaucracy — it is a checklist against omission** — The 18 stages (requirement review → design review → development → testing → release → retrospective) are not paperwork; they are checkpoints that force the team to consider every aspect of the project before proceeding. Skipping a stage is not efficient; it is gambling that the skipped stage's concerns won't materialize. They usually do.


- The iteration PM is the first responsible party — not a coordinator; any issue in the project is the iteration PM's responsibility.
- Identifying stakeholders is the top killer of delays — delays often stem from unclear identification or lack of consensus; stakeholders must be identified and engaged before review.
- Product must attend technical proposal review and test case review — absence or not taking it seriously leads to proposals / cases deviating from PRD.
- Milestone determination ≤1 day after technical review pass — delay causes development / test investment ratios to shift, risk accumulates.
- Task granularity ≤4 hours — too coarse means progress cannot be tracked, risk cannot be identified.
- Tight early, loose later — the later in the project, the more issues; only with tight early work can there be buffer later.
- Release plan must consider rollback; online acceptance must be done — not considering rollback equals running blind; not doing online acceptance equals going blind after release.

## Key information

### Full process stage table

| Stage | Owner | Purpose | Key work | Notes |
|---|---|---|---|---|
| Requirement internal review | product manager | Improve requirement quality; control requirement value | Internal review meeting with product, business, design, tech owner; reach consensus on background/value/goal/process/core features; assess PRD completeness | Schedule at least 1 day in advance |
| Pre-estimation | iteration PM | Align requirement list between R&D | Provide pre-estimation within 1 day after daily iteration alignment; project requires R&D-test alignment then output estimated milestones | Escalate if disagreement |
| Pre-requirement review | product + iteration PM | Reduce risk; reduce review meeting time | Confirm tech members (PM/frontend/backend/test) and design members; identify and engage stakeholders; confirm review time and ensure key people attend; familiarize with requirements and bring questions | **Identifying and confirming stakeholders is critical** — delays often stem from unclear identification or lack of consensus |
| Formal requirement review | product + iteration PM | All parties reach consensus on requirements | Ensure relevant people receive calendar and attend; control pace; designate note-taker for issues/conclusions/actions; confirm on-site whether passed, re-review if many issues; after pass, confirm technical proposal and visual review time; align notes before closing and @ relevant people; sync notes to project group | Relevant people must attend review, avoid word-of-mouth; conclusions must be aligned on-site and sent after meeting; requirement changes start being recorded, escalate disagreements |
| Design review | designer + iteration PM | All parties reach consensus on design | Ensure schedule and attendance; control pace; designate note-taker; confirm on-site whether passed; align notes before closing; sync notes to group | — |
| Technical proposal internal review | iteration PM | Align proposal internally before formal review, improve overall quality and efficiency, avoid wasting product/test/design time | Ensure relevant people receive calendar and attend; control pace; designate note-taker; align notes before closing; sync notes to group; remediate actions before entering formal review | — |
| Formal technical proposal review | iteration PM | All parties reach consensus on proposal; proposal matches PRD | Ensure schedule and attendance; control pace; designate note-taker; confirm on-site whether passed, re-review if many issues; after pass, confirm milestones and provide time; align notes before closing; sync notes to group | Control requirement changes, no changes unless necessary, escalate disagreements; **product must attend and take it seriously** |
| Milestone determination | iteration PM | All parties reach consensus on delivery time | Confirm joint debugging/test/release time and keep communication records; split tasks and review reasonableness; confirm each person's investment and completion time; check longest path and shortest path; call meeting to confirm milestones and regular meeting cadence; sync milestones to group and post as group announcement | Dev/test task granularity ≤ 4 hours; milestone determination ≤ 1 day after technical review pass; consider batch test submission/batch release; monitor investment ratio of non-100% invested members; identify risks early |
| Development | iteration PM | — | Regular meetings to identify risks/issues/blockers, sync to group and proactively avoid, resolve, clear | Avoid requirement changes; if changes are necessary, need sufficient reason and propagate records; issues affecting pace should pull people to communicate quickly and propagate conclusions |
| Test case review | test owner + iteration PM | All parties reach consensus on cases; cases match proposal and PRD | Send cases to group in advance; ensure attendance; control pace; designate note-taker; confirm on-site whether passed; align notes before closing; sync notes to group | Suggest completing within 2 days after technical review; meeting confirms smoke pass criteria (minimum: no issues blocking main process); **product must attend and take it seriously** |
| Code Review | iteration PM | Ensure quality; unify code style; improve team capability | Participants include domain tech owner/TO/tech owner/related developers; format flexible (meeting / offline pairing / link), but must have records; clarify what must change, what can be deferred | Must complete within 2 days after test submission |
| Pre-test internal demo | iteration PM | — | — | — |
| Test demo | iteration PM | Ensure quality, improve test efficiency | Send schedule 1 day in advance; developers demo to test on SIT environment; after pass, rename group to "[project-pending test]XXX" | Pass criteria set by test owner, minimum does not affect main process; not passing counts as development delay |
| Testing | iteration PM | — | Regular meetings to identify risks; rename group to "[project-testing]XXX"; urge developers to fix bugs promptly | Bugs accurately assigned to relevant developers; developers achieve daily bug cleanup |
| Release plan review | iteration PM | — | Ensure schedule and attendance; control pace; designate note-taker; confirm on-site whether passed; align notes before closing; sync notes to group | Simple releases can skip meeting, just organize documentation to group; publish plan review must complete on day UAT enters; **release plan must consider rollback** |
| Technical internal acceptance | iteration PM | — | — | — |
| Design acceptance | design owner + iteration PM | Ensure quality; ensure overall user experience meets expectations | Remind design acceptance | Milestone nodes set early, designers need to reserve time in advance; issues recorded uniformly for statistics |
| Product acceptance | product manager + iteration PM | Ensure quality; ensure R&D features are what product wants | Remind product acceptance | PO reserve time in advance; issues recorded uniformly, clarify what won't change this round, what must change |
| Business acceptance | ITBP + iteration PM | Ensure quality; ensure R&D features are what business wants | Remind business acceptance | Internal rehearsal must pass before business demo; business acceptance time set, product needs to manage business time |
| Release | iteration PM | — | Pre-release: config/tables/dependencies ready; during release: monitor logs and alerts, real-time test; post-release: developers and test do online joint test, invite product for online acceptance | **Online acceptance must be done**; if system doesn't support, it needs refactoring |
| Retrospective | iteration PM | Discover issues, continuously improve, improve quality and efficiency | Invite whole project team; select appropriate facilitator to discover more issues | Open mindset; relaxed atmosphere; gratitude segment |
| Value retrospective | iteration PM | Calculate benefits and costs | Track value, meeting not mandatory | — |

### Milestone node checklist (14 nodes)

Start development / complete development / start joint debugging / complete joint debugging / start SIT / complete SIT / start UAT / complete UAT / start product acceptance / complete product acceptance / start acceptance / complete acceptance / start release / complete release.

### Common techniques

- Learn to refuse; refuse-yield
- Written commitments, apply pressure
- Find interface person for cross-team communication
- Batch test submission, improve efficiency
- Report upward, sync progress and risk
- Regular meetings, weekly meetings only for the most necessary — meet to discuss, discuss to decide, decide to act
- Control meeting time
- Focus on key project nodes; key projects can choose closed-door mode
- Reserve buffer time
- Personnel motivation
- Note communication conclusions for the record
- Pay attention to member state (life troubles, work dissatisfaction), report exceptions to corresponding TL promptly
- Pay attention to release time and holidays (e.g., leave around long holidays)
- Tight early, loose later (the later in the project, the more issues)
- Resource lock-in

### Applicable scenarios

- New iteration PM onboarding
- Project full-process standardization
- Cross-team large project coordination
- Milestone node management

## Action recommendations

1. Identify and engage stakeholders before requirement review (top killer of delays)
2. Formal reviews must produce notes, align before closing and @ relevant people, sync notes to project group
3. Milestone determination ≤1 day after technical review pass, dev/test task granularity ≤4 hours
4. Product must attend technical proposal review and test case review
5. Code Review must complete within 2 days after test submission
6. Release plan must consider rollback; publish plan review must complete on day UAT enters
7. Online acceptance must be done (if system doesn't support, it needs refactoring)
8. Tight early, loose later, reserve buffer; learn to refuse-yield; written commitments

## Anti-patterns

- **Skipping stakeholder identification** — The single most common cause of project delays is not technical complexity; it is that a key stakeholder was not identified until the review stage. A stakeholder discovered in week 4 is a 3-week delay. Stakeholders must be identified and engaged before the first review.

- **Product not attending technical proposal review and test case review** — When product is absent from technical reviews, proposals and test cases drift from the PRD. The drift is invisible until acceptance testing, when the product owner discovers that what was built is not what they asked for. Product attendance at these reviews is not optional.

- **Milestone determination delayed beyond 1 day after technical review pass** — Every day that milestones are undetermined, development and test investment ratios shift, and risk accumulates silently. The 1-day deadline is not a suggestion; it is the maximum window before risk starts compounding.

- **Task granularity > 4 hours** — A 16-hour task that is 50% complete after 2 days looks on track but may be 50% complete on the easy part and 0% on the hard part. The 4-hour granularity surfaces risk when a 4-hour task is incomplete after 4 hours.

- **Release plan without rollback consideration** — A release without a rollback plan is running blind. The rollback plan must be written, tested, and time-boxed before the release. A release that cannot be rolled back within 30 minutes is a release that should not proceed.

## Related

- Same category: [review meeting template](../../product-manager/delivery/review-meeting.md), [weekly meeting template](../../product-manager/delivery/weekly-meeting.md)
- upstream: [requirement review process](../../product-manager/delivery/requirement-review.md)
- downstream: [release process](../../oncall-sre/release/release.md), [project handover process](./project-handover.md)
