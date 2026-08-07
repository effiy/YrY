---
title: Incident Retrospective Template (Blameless Postmortem)
aliases:
- incident-postmortem-template
- blameless-postmortem-template
tags:
- Templates
- incident retrospective
- Postmortem
- blameless
- SRE
category: engineer/lessons
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: yearly
roles:
- engineer
- oncall-sre
benefit: failure does not repeat
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./incident-postmortem.md
- ../../processes/incident-response.md
tacit: false
---

# Incident Retrospective Template (Blameless Postmortem)

> **As an** engineer, **I want to** use an incident postmortem template, **so that** failure does not repeat.

> For any P0/P1/P2 incident, hold a retrospective meeting within 5 working days and fill in this template following the blameless principle. Copy to `lessons/failures/{date}-{incident-name}-postmortem.md`.

## Summary

- Ten-section retrospective form: basic info -> impact scope -> timeline -> root cause chain -> measures -> action items -> lessons -> monitoring regression -> notification & archival -> retrospective meeting meta info.
- Root cause analysis uses 5-Why to trace layer by layer; stopping at "human error" is prohibited.
- Action items must have responsible person + due date + acceptance method + status; tracked in the task system.

## Core viewpoints

- **Blameless is the template baseline** — "is it blameless" is a required field in retrospective meeting meta info; if "no", the meeting must be reopened.
- **Root cause chain must run 5-Why to the bottom** — stopping at "human error" equals no retrospective.
- **Action items must be acceptable** — the "acceptance method" column is indispensable, otherwise improvement cannot be falsified.

## Key information

### 1. Basic info

| Field | Content |
|------|------|
| Incident ID | (example: INC-2026-0142) |
| Incident name | (example: AI large-area timeout) |
| Severity | P0 / P1 / P2 |
| Impact scope | (example: 6 countries 12k users unresponsive within 4h) |
| Duration | triggered __ -> recovered __, total __ |
| Detection method | alert / user feedback / upstream error |
| Incident time | (example: 2026-07-29 14:30 ~ 18:30) |
| Retrospective date | (example: 2026-07-30) |
| Retrospective facilitator | (example: SRE Zhang San) |
| Participants | backend, model team, ops, customer service |
| Incident owner | (example: model team Li Si) |
| Status | Open / Action Items Pending / Closed |

### 2. Impact scope

| Dimension | data |
|---|---|
| Affected users | 12k |
| Affected countries | 6 |
| Business loss estimate | ¥__ |
| Data integrity | whether data loss / corruption |
| SLA breach | yes / no |
| Media / customer complaints | yes / no |
| Related incidents | (example: same source as INC-2026-0138) |

### 3. Incident timeline

| Time | Event | Operator | Source |
|---|---|---|---|
| 14:30 | Alert triggered | SRE | monitoring |
| 14:35 | Confirm P1 | oncall | manual |
| 14:40 | Pull response group | SRE | IM |
| 15:00 | Temporary rate limit | model team | config change |
| 16:20 | Locate root cause | backend | logs |
| 17:50 | Fix deployed | backend | CI |
| 18:30 | Full recovery | SRE | monitoring |

### 4. Root cause chain

Use 5 Why to trace layer by layer; stopping at "human error" is prohibited.

| Why level | Phenomenon | Direct cause |
|---|---|---|
| Why 1 | Model timeout | Compute squeezed |
| Why 2 | Compute squeezed | No quota mechanism |
| Why 3 | No quota mechanism | Multiple teams sharing 1 card |
| Why 4 | Sharing 1 card | Cost control |
| Why 5 | Cost control one-size-fits-all | No model SLA |

**Root cause type** (multi-select):
- [x] Process gap (quota / SLA)
- [ ] Code defect
- [ ] Config error
- [ ] Insufficient capacity
- [ ] Monitoring gap
- [ ] Third-party dependency
- [ ] Human operation

### 5. Temporary and fundamental measures

| Type | Measure | Owner | Due date | Status |
|---|---|---|---|---|
| Temporary | Rate limit | Model team | 2026-07-29 | Done |
| Fundamental | Compute quota mechanism | Model team | 2026-08-15 | Pending |
| Fundamental | Model SLA upgrade | Model team + product | 2026-08-30 | Pending |
| Fundamental | Alert threshold tuning | SRE | 2026-08-05 | Pending |

### 6. Action items

| # | Action item | Type | Owner | Due date | Acceptance method | Status |
|---|---|---|---|---|---|---|
| 1 | Add GPU quota SLA | Process | Model team | 2026-08-15 | Documentation published | Pending |
| 2 | Lower alert threshold | Monitoring | SRE | 2026-08-05 | Alert verification | Pending |
| 3 | Capacity drill | Drill | Ops | 2026-09-01 | Drill report | Pending |
| 4 | Add runbook | Documentation | Backend | 2026-08-10 | Runbook review | Pending |

### 7. Lessons learned

- Done well: oncall pulled the response group within 5 minutes; temporary rate limit stopped the bleeding quickly.
- To improve: no compute quota mechanism; model team squeezed by multiple teams; alert threshold too high led to delayed detection.
- Reusable: temporary rate limit + quota playbook template (captured in runbook).

### 8. Monitoring metrics regression

| Metric | Before incident | During incident | Current | Goal |
|---|---|---|---|---|
| P95 latency | 1.2s | 30s | 1.5s | < 1.5s |
| Error rate | 0.1% | 35% | 0.2% | < 0.5% |
| Alert detection time | — | 5min | — | <= 3min |

### 9. Notification and archival

- Notification audience: business stakeholders, customer success, management
- Notification date: __
- Archive path: `lessons/failures/{file}`
| Related ADR / TD: __

### 10. Retrospective meeting meta info

- Duration: __ minutes
- Blameless: yes / no
- Previous action item completion rate: __%

## Action recommendations

1. Copy this template to `lessons/failures/{date}-{incident-name}-postmortem.md`, fill in basic info and impact scope first.
2. Restore the timeline with the four columns "time / event / operator / source"; do not omit timestamps.
3. The root cause chain must run 5-Why to the bottom; check multiple root cause types; selecting only "human operation" is prohibited.
4. Separate temporary and fundamental measures into two tables; fundamental measures must have owner + due date.
5. Push action items into the task system (JIRA / Linear); track unfinished items weekly.
6. Retrospective meeting meta info must include "blameless"; if "no", the retrospective must be reopened.



- **Root cause stops at "human operation"** — equals no retrospective; must run 5-Why to the system layer.
- **Action items without acceptance method** — improvement cannot be falsified; status still "pending" half a year later.
- **Retrospective meeting over 90 minutes** — speaking quality drops after fatigue; split complex incidents into multiple retrospectives.
- **Not archived publicly** — only when the whole company can query it can other teams learn.

## Related

- Same class: [incident-postmortem-summary.md](failure-incident-postmortem.md) — retrospective culture and process summary
- Upstream: [../../processes/incident-response.md](../process/incident-response.md) — incident response process
- Reference: Google SRE Book — *Postmortem Culture*
