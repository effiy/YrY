---
aliases:
- Sprint Retrospective Template
title: Sprint Retrospective Meeting Template
tags:
- template
- Sprint
- retrospective
- agile
- process
category: engineer/process
created: 2024-01-15
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./iteration-pm-handbook.md
- ./engineering-productivity-metrics.md
- ./org-productivity-diagnosis.md
tacit: false
---

# Sprint Retrospective Meeting Template

> **As an** engineer, **I want to** sprint retrospective, **so that** process followed predictably.

> Method: 24 hours before the meeting have the team fill in the fields below, during the meeting discuss by Start / Stop / Continue three columns, finally produce action items. Keep the meeting within 60 minutes.

## 1. Basic info

| Field | Content |
|------|------|
| Sprint number | (example: Sprint 42) |
| Start-end date | (example: 2026-07-15 ~ 2026-07-28) |
| Team | (example: YiVad frontend group) |
| Participants | (example: Zhang San, Li Si, Wang Wu) |
| Facilitator | (example: Zhang San, rotating) |
| Note taker | (example: Li Si) |
| Meeting date | (example: 2026-07-29) |

## 2. Retrospective dimensions

### Start (things to start doing)
- (example: every PR must attach AI review screenshot)
- (example: Wednesday afternoon set as no-meeting day)

### Stop (things to stop doing)
- (example: stop discussing technical details in Daily standup)
- (example: stop inserting urgent requests mid-Sprint, unless P0)

### Continue (things to keep doing)
- (example: continue bi-weekly Wednesday architecture sharing session)
- (example: continue PR under 400 lines constraint)

## 3. Data retrospective

| Metric | Planned | Actual | Deviation | Note |
|------|------|------|------|------|
| Story points | 38 | 32 | -16% | 1 story spillover |
| Bug count (new) | - | 12 | - | 3 P1 |
| Bug count (closed) | - | 10 | - | |
| Velocity (rolling 3 periods) | 35 | 34 | -3% | |
| Deploy count | 2 | 4 | +100% | Enabled continuous deployment |
| Change failure rate | < 15% | 0% | - | |
| MTTR | < 1h | 25m | - | |

## 4. Team satisfaction

| Dimension | Score (1-5) | explanation |
|------|------------|------|
| Goal clarity | 4 | |
| Collaboration smoothness | 3 | (example: insufficient cross-group communication) |
| Work rhythm | 4 | |
| Technical growth | 5 | |
| Psychological safety | 4 | |
| **Overall morale** | **4.0** | |

## 5. Improvement action items

| Number | Action item | Type | Owner | Due date | Status |
|------|--------|------|--------|----------|------|
| 1 | (example: Establish cross-group sync mechanism) | Start | Zhang San | 2026-08-05 | Todo |
| 2 | (example: Daily standup changed to 10 minutes) | Stop | Li Si | 2026-08-01 | Todo |
| 3 | (example: Architecture sharing session continues) | Continue | Wang Wu | Long-term | Ongoing |

## 6. Next Sprint focus

- (example: Complete aicr module regression test)
- (example: Launch BRD agent MVP)
- (example: Performance optimization - first screen < 1.5s)

## 7. Meeting meta info

- Meeting duration: __ minutes
- Next retrospective date: __
- Follow up on last period action items: __% completed
