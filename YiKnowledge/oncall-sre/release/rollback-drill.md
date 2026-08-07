---
aliases:
- Rollback Drill Process
title: Emergency Rollback Drill Process
tags:
- process
- rollback-drill
- resilience
- SOP
category: oncall-sre/release
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- oncall-sre
- engineer
benefit: release safe
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./release.md
- ./canary-release.md
- ../../engineer/process/incident-response.md
- ../../engineer/quality-security/chaos-engineering.md
tacit: false
---

# Emergency Rollback Drill Process

> **As an** oncall sre, **I want to** rollback drill, **so that** release safe.

## 1. Purpose and scope

Verify via regular drills whether the rollback plan is truly executable; avoid discovering at real-incident time that scripts fail, dependencies are missing, or personnel are unfamiliar.

Applies to: all production core services; within 1 week after high-risk release; quarterly routine drill.

## 2. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Drill Owner (R) | Write drill script; execute; record |
| Tech Owner (A) | Decide drill scope; review script |
| Ops / SRE (C) | Execute rollback actions; monitoring |
| Oncall (C) | Simulate real response |
| Iteration PM (I) | Coordinate window and reporting |

## 3. Step breakdown

```
Script prep → dry run → drill execution → verification → retrospective → improvement
```

| Step | Key actions | Exit criteria |
|---|---|---|
| 1. Script prep | Select service; define rollback triggers, commands, verification points; assess drill impact on real users | Script passes review |
| 2. Dry run | Simulate once in shadow environment or low-traffic window; verify script feasibility | Dry run passes |
| 3. Drill execution | Execute per script in drill window; record timeline and timing | Drill completes |
| 4. Verification | Core chain recovered; data consistent; no residual issues | Verification passes |
| 5. Retrospective | Record MTTR; compare with expected for real incidents; find script gaps | Retrospective report archived |
| 6. Improvement | Fix scripts, monitoring, personnel skill gaps; list as actions | Action loop closed |

## 4. Input / output artifacts

- **Input**: rollback scripts, monitoring dashboards, dependency checklists, historical incident retrospectives
- **Output**: drill script, drill record, retrospective report, improvement action list

## 5. Measurement metrics

- Drill MTTR vs expected MTTR
- Drill pass rate
- Number of script gaps
- Improvement action closure rate

## 6. Exception handling and upgrade path

| Scenario | Handling |
|---|---|
| Drill triggers a real issue | Abort immediately; handle per [incident response process](../../engineer/process/incident-response.md) |
| Rollback failure | Upgrade immediately; assess whether data fix is needed |
| Script failure | Pause drill; fix then re-run |
| Personnel unfamiliar | Add to training actions; strengthen oncall rotation |
| Data inconsistency | Pause; fix data then re-drill |

## 7. Notes

- **A drill is not an exercise — there must be real rollback actions**
- Prefer low-traffic windows; brief business stakeholders in advance
- Backup before drill; rollback SQL must be validated first
- Must drill once within 1 week after high-risk release
- Quarterly routine covers core services at least once
- Drill results link with MTTR measurement in [incident response process](../../engineer/process/incident-response.md)
