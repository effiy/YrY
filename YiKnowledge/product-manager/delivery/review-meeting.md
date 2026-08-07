---
title: Review meeting template
aliases:
- review-meeting-template
- requirement-design-tech-review
tags:
- template
- meeting
- review
- decision
- parking-lot
category: product-manager/delivery
created: 2026-07-31
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
- tech-lead
benefit: PMs can run effective meetings and delivery ceremonies that keep teams aligned
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./weekly-meeting.md
- ./retrospective-meeting.md
- ../processes/requirement-review.md
- ../processes/design-review.md
- ../processes/tech-review.md
tacit: false
---

# Review meeting template

> **As a** product manager, **I want to** review meeting, **so that** meeting effective.

> A shared template for requirement / design / tech / security / launch reviews; principle: make decisions in the meeting, do not keep discussing afterward.

## Summary

- Common goal of review meetings: make decisions in the meeting, do not keep discussing afterward; materials sent 24h in advance, no reading during the meeting.
- 60-minute cap, 5 fixed agenda items: background 5min → material walkthrough 15min → key decision 30min → risk and dependencies 10min → parking lot 5min.
- Required fields: business goal (OKR related), key decision (option + resolution + owner), risk and dependencies (including impact), action items (owner + due date), review materials (sent 24h in advance).
- Review-type differences: requirement review emphasizes value feasibility, design review emphasizes experience usability, tech review emphasizes architecture risk, security review emphasizes compliance, launch review emphasizes risk and rollback.
- Six principles: materials sent 24h in advance, only make decisions, must produce a decision, unresolved items go to parking lot, must produce action items, 60-minute cap.

## Core viewpoints

- Sending materials 24h in advance is the prerequisite for an effective review meeting — reading materials during the meeting wastes everyone's time.
- Review meetings are only for decisions; pure discussion moves offline — the host controls the floor, off-topic items go to parking lot.
- Every decision point must produce a resolution + owner + due date — no conclusion means no meeting happened, and nothing gets executed afterward.
- The 60-minute cap forces focus — split if over time, do not force decisions on unlisted topics in the main meeting.

## Key information

### Template body (copy and use)

```markdown
# {Review type}: {Project / Requirement}

**Date**: YYYY-MM-DD
**Host**: {name}
**Participants**: {required fields: PM / design / dev / QA / security / legal}
**Review materials**: {link sent 24h in advance}
**Duration**: 60 minutes

## 1. Background and goals (5 minutes)

- Business goal: {OKR link}
- User pain point: {JTBD}
- Expected output: {what this review should decide}

## 2. Material walkthrough (15 minutes)

- PRD / design draft / tech plan walkthrough
- Host guidance: only check alignment with goals; detailed questions go offline

## 3. Key decisions (30 minutes)

| # | Decision point | Options | Resolution | Owner | Due |
|---|---|---|---|---|---|
| 1 | {key decision} | A/B/C | Pick B | {name} | YYYY-MM-DD |
| 2 | ... | ... | ... | ... | ... |

## 4. Risks and dependencies (10 minutes)

| Risk / dependency | Impact | Handling | Owner |
|---|---|---|---|
| ... | ... | ... | ... |

## 5. Unresolved items (Parking Lot, 5 minutes)

- Move offline / to next meeting
- Do not force-decide in the main meeting

## 6. Action items

| # | Action | Owner | Due date |
|---|---|---|---|
| 1 | ... | ... | YYYY-MM-DD |

## 7. Re-review time (if applicable)

- Re-review date: YYYY-MM-DD
- Re-review condition: {what change triggers re-review}
```

### Field filling guidelines

| Field | Required | Guideline |
|---|---|---|
| Business goal | Yes | OKR related |
| Key decision | Yes | option + resolution + owner |
| Risk and dependencies | Yes | includes impact |
| Action items | Yes | owner + due date |
| Review materials | Yes | sent 24h in advance |

### Review-type differences

| Review type | Focus | Participants |
|---|---|---|
| Requirement review | Value and feasibility | PM + dev + QA + design |
| Design review | Experience and usability | Design + PM + dev |
| Tech review | Architecture and risk | Senior dev + architect + PM |
| Security review | Security and compliance | Security + legal + dev |
| Launch review | Risk and rollback | PM + dev + QA + ops |

### Applicable scenarios

- Requirement review, design review, tech review, security review, launch review
- Scenarios where a decision needs alignment across 4 or more parties
- Cross-team dependencies that need to align within a fixed window
- High-risk changes that require written resolutions and re-review conditions

## Action recommendations

1. Send the review-material link to participants 24h before the meeting, require pre-reading
2. Host time control: background 5min / walkthrough 15min / decision 30min / risk 10min / parking lot 5min
3. Key-decision table must fill in option + resolution + owner + due date
4. Risk-and-dependencies table must fill in impact and handling
5. Unresolved items go to parking lot, move offline / to next time
6. Send minutes within 24h after the meeting, including action items and re-review conditions
7. Re-review trigger conditions must be clear: what change requires re-review



- Reading materials during the meeting — send 24h in advance, do not read during
- No decision — must produce resolution + owner
- No action items — must produce + owner + due date
- Off-topic — host controls the floor + parking lot
- Everyone attends — only invite necessary roles
- 60 minutes over-run forced decision — split or move to next time

## Related

- Same class: [weekly meeting template](./weekly-meeting.md), [retrospective meeting template](./retrospective-meeting.md)
- Upstream: [requirement review process](requirement-review.md), [design review process](design-review.md), [tech review process](tech-review.md)
- Downstream: [iteration PM handbook](../../engineer/process/iteration-pm-handbook.md) (review cadence within an iteration)
