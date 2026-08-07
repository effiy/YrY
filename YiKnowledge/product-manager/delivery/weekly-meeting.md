---
title: weekly meeting template
aliases:
- weekly-meeting-template
- team-sync-template
tags:
- Template
- meeting
- weekly meeting
- teamalign
- async-first
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
- ./review-meeting.md
- ./retrospective-meeting.md
- ../../engineer/process/async-collaboration-principles.md
- ../processes/requirement-review.md
tacit: false
---

# weekly meeting template

> **As a** product manager, **I want to** weekly meeting, **so that** meeting effective. 

> Template for team weekly alignment; principle: only discuss things the whole team needs to know or decide, status goes to async documentation.

## Summary

- Weekly meeting core: status goes async, only discuss things needing alignment, 30-minute limit, each topic has a time box, must produce action items.
- Status report is not read in the meeting; read it before the meeting. The meeting only covers decisions, dependencies, and risks.
- Over time → immediately parking lot; do not force decisions in the main meeting.
- Required fields: last week's key events, this week's focus, cross-team alignment, risks and blockers, action items, status report (async link).
- Cadence recommendation: Monday morning to set this week's direction, no Friday meeting to avoid status reporting, 30-minute parking lot when over time, monthly 60 minutes plus quarterly alignment.

## Core viewpoints

- Status goes async is the first principle of a lean weekly meeting — reciting a stream of events on Monday turns the meeting into a status report; status report can be read before the meeting.
- The weekly meeting only discusses things that need alignment — three things: decisions, dependencies, risks. Everything else goes async.
- The 30-minute limit protects deep work — over time, parking lot; unresolved topics move offline / to next time.
- Action items required is the minimum standard for an effective meeting — each item has an owner + due date, otherwise it equals not having met.

## Key information

### Template body (copy and use)

```markdown
# {Team} Weekly Meeting

**Date**: YYYY-MM-DD
**Host**: {name}
**Participants**: {list}
**Duration**: 30 minutes (parking lot when over time)

## 1. Last Week's Key Events Review (5 minutes)

- {3-5 team-level outcomes}
- {Data: north star / DORA / retention}

## 2. This Week's Focus (10 minutes)

2 minutes per sub-team:

- Business A: this week's delivery goal + risk
- Business B: ...
- Platform: this week's delivery goal + risk

## 3. Cross-Team Alignment (10 minutes)

- Alignment topic 1: {decision or dependency}
- Alignment topic 2: ...

## 4. Risks and Blockers (5 minutes)

| Risk | Impact | Owner | Action |
|---|---|---|---|
| {risk} | {impact} | {name} | {action} |

## 5. Action Items (wrap-up)

| # | Action | Owner | Due |
|---|---|---|---|
| 1 | ... | ... | YYYY-MM-DD |

## 6. Next Week Preview

- {Next week's key milestones}

## Appendix: Status Report (async reading, not read in the meeting)

- Business A last week: {link to doc}
- Business B last week: {link to doc}
- Platform last week: {link to doc}
```

### Field filling standard

| field | required | standard |
|---|---|---|
| last week's key events | yes | 3-5 items, with data |
| this week's focus | yes | 2 minutes per sub-team |
| cross-team alignment | yes | decision or dependency |
| risks and blockers | yes | with impact and owner |
| action items | yes | owner + due date |
| status report | yes | async link, not read in meeting |

### Cadence recommendation

- Monday morning: set this week's direction
- No Friday: avoid status reporting
- 30 minutes: parking lot when over time
- Monthly: 60 minutes, plus quarterly alignment

### Applicable scenarios

- Team weekly alignment on direction and risks
- Multiple sub-teams need to sync focus within 10 minutes
- Cross-team dependencies need a fixed window for alignment
- Data-driven discussion using DORA / north star

## Action recommendations

1. Send the status report link 24h before the meeting; require participants to read it
2. Host controls time; 2-minute cap per sub-team
3. Risk table must include impact and owner, not just list phenomena
4. Must produce an action item table; each item has an owner + due date
5. Topics over time enter the parking lot; move offline / to next time
6. Send minutes to the sync group within 24h after the meeting

## Anti-patterns

- Reciting a stream of events on Monday — status goes async; read before the meeting
- One person talking for 30 minutes — everyone participates; 2 minutes per sub-team
- No action items — must produce action items + owner + due date
- Sync meeting turns into a reporting meeting — only discuss things needing alignment; status goes async
- Forcing decisions when over time — over time, parking lot; move to next time

## Related

- Same category: [Review Meeting Template](./review-meeting.md), [Retrospective Meeting Template](./retrospective-meeting.md)
- Upstream: [Async Collaboration Principles](../../engineer/process/async-collaboration-principles.md)
- Downstream: [Requirement Review Process](requirement-review.md)
