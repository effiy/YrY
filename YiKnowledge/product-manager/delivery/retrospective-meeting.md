---
title: retrospective meeting template
aliases:
- retrospective-meeting-template
- retro-template
- postmortem-meeting
tags:
- Templates
- meeting
- retrospective
- 5-why
- blameless
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
- ./review-meeting.md
- ../../engineer/process/sprint-retrospective.md
- ../../engineer/lessons/failures/incident-postmortem.md
tacit: false
---

# retrospective meeting template

> **As a** product manager, **I want to** retrospective meeting, **so that** meeting effective.

> Template used at iteration end / project milestone / after incident; principles: blameless, focus on process and system, must produce executable actions.

## Summary

- retrospective core: blameless toward individuals, focus on process and system, 5-Why is mandatory, must produce action items, must track, must publicly archive.
- 60-90 minutes 8-segment agenda: background and timeline 10min → Keep 10min → Problem 15min → root cause 20min → Action 10min → luck factors 5min → next commitment 5min → summary.
- required fields: background and timeline (quantified), Keep 3-5 items, Problem 3-5 items, root cause (5-Why), Action (owner + due date + verification), next commitment 3-5 items.
- facilitation tips: encourage speaking, do not let one person dominate, ask "why did the system allow this" rather than "who did it", publicly praise good retrospective, do not link to performance.
- within 24h after meeting send retrospective documentation, accessible to all, action items enter task system and tracked weekly, completion rate reviewed quarterly.

## Core viewpoints

- 90% of incident root causes are in the system not the individual — after blame employees will cover up problems next time, blameless makes employees willing to report proactively.
- 5-Why is mandatory, do not stop at "human error" — "human error" is the starting point not the endpoint, ask 5 layers to find the system root cause.
- Action must have owner + due date + verification method — Action without verification method equals no change.
- retrospective must be tracked, must be public — enter task system tracked weekly, completion rate reviewed quarterly, accessible to all so they can learn.

## Key information

### template body (copy and use)

```markdown
# {Project/Iteration/Incident} retrospective meeting

**Date**: YYYY-MM-DD
**Facilitator**: {name} (responsible for process, not judging)
**Note-taker**: {name}
**Participants**: {on-call + affected parties + TL}
**Duration**: 60-90 minutes
**retrospective type**: iteration / project / incident

## Pre-meeting prep (facilitator sends 24h before meeting)

- retrospective background document (incident timeline / project goal vs actual)
- data and evidence (monitoring, PR list, user feedback)
- encourage participants to write down their views first

## 1. Background and timeline (10 minutes)

- project goals / OKR
- expected vs actual (quantified)
- key timeline
- impact scope

## 2. What went well (Keep) (10 minutes)

- {3-5 items, with data and reasons}
- encourage all to share

## 3. What did not go well (Problem) (15 minutes)

- {3-5 items, with impact and reasons}
- **blameless toward individuals**: ask "why did the system allow this to happen"

## 4. Root cause analysis (20 minutes)

For each Problem do 5-Why or fishbone:

### Problem 1: {description}

- Why 1: ...
- Why 2: ...
- Why 3: ...
- Why 4: ...
- Why 5: ...

**Root cause**: {one sentence}

### Problem 2: ...

## 5. Improvement actions (Action) (10 minutes)

| # | Improvement item | Priority | Owner | Due date | Verification method |
|---|---|---|---|---|---|
| 1 | {action} | P0 | {name} | YYYY-MM-DD | {metric / artifact} |
| 2 | ... | ... | ... | ... | ... |

## 6. Luck factors (5 minutes)

- {which steps only avoided bigger problems by luck}
- how to eliminate luck dependence

## 7. Next commitment (5 minutes)

- {3-5 items, quantifiable}

## 8. Summary (1 sentence)

## After meeting

- send retrospective document within 24h
- accessible to all
- action items enter task system, tracked weekly
- quarterly completion rate review
```

### Field filling specification

| Field | Required | Specification |
|---|---|---|
| background and timeline | yes | quantified |
| Keep | yes | 3-5 items |
| Problem | yes | 3-5 items |
| root cause | yes | 5-Why |
| Action | yes | owner + due date + verification |
| next commitment | yes | 3-5 items |

### Facilitation tips

- encourage speaking, do not let one person dominate
- ask "why did the system allow this" rather than "who did it"
- publicly praise good retrospective
- do not link to performance

### Applicable scenarios

- iteration end, project milestone
- after incident (P0/P1 incident within 24h)
- quarterly strategy retrospective
- after large cross-team collaboration ends

## Action recommendations

1. facilitator sends background documentation + data evidence 24h before meeting
2. encourage participants to write down their views first before meeting
3. facilitator controls time: background 10 / Keep 10 / Problem 15 / root cause 20 / Action 10 / luck 5 / commitment 5 / summary
4. Problem stage must ask "why did the system allow this to happen"
5. for each Problem do 5-Why, do not stop at "human error"
6. Action table must fill owner + due date + verification method (metric / artifact)
7. send retrospective documentation within 24h after meeting, accessible to all
8. action items enter task system, tracked weekly, completion rate reviewed quarterly



- retrospective as ceremony — 5-Why + must produce Action
- scapegoating — blameless, focus on process and system
- Action without owner — required field
- written but not public — accessible to all
- not tracked — tracked weekly, completion rate reviewed quarterly
- not publicly praising good retrospective — culture building must reward

## Related

- same category: [weekly meeting template](./weekly-meeting.md), [review meeting template](./review-meeting.md)
- upstream: [Sprint retrospective template](../../engineer/process/sprint-retrospective.md)
- downstream: [incident retrospective summary](../../engineer/lessons/failure-incident-postmortem.md)
