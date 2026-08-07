---
aliases:
- Release Process
title: LaunchreleaseProcessand checklist
tags:
- Process
- release
- Launch
- checklist
- SOP
category: oncall-sre/release
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: yearly
roles:
- oncall-sre
- engineer
benefit: release safe
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./canary-release.md
- ./hotfix-release.md
- ./release-freeze.md
- ./rollback-drill.md
tacit: false
---

# LaunchreleaseProcessand checklist

> **As a** oncall sre, **I want to** release, **so that** release safe.

## 1. Purpose and scope

spec release actions, drop the probability of incidents above the line; guarantee release can rollback, observable, traceable.

applies to: all production environment releases, including regular releases and emergency fix releases.

## 2. Role and responsibility (RACI)

| Role | responsibility |
|---|---|
| release owner (R)  | convene release solution review; execute release; on-call observation |
| Iteration PM (A) | ensure review passed; track action items |
| Tech Lead (C) | assess rollback, canary degree, dependency |
| QA Lead (C) | above-line regression and acceptance |
| product (I)  | release after business acceptance |
| ops / SRE (C)  | infrastructure, permission, monitoring alert config |

## 3. Step breakdown

```
release solution review -> pre-release preparation -> release execution -> above-line observation -> release wrap-up
```

| steps | key actions | exit standard |
|---|---|---|
| 1. release solution review | ensure all attendees present; control cadence; designate recorder; confirm on-site whether passed; align minutes before ending; minutes synced to group | solution passed; a single release cannot start without organized docs posted to the group |
| 2. pre-release prepare | smoke passed; release window confirmed; dependency parties notified; monitoring dashboard in place; rollback script in place | all checklist passed |
| 3. release execute | execute step by step per release plan; each step has someone watching; pause on exception | all steps complete |
| 4. above-line observe | observe core metrics for 30 minutes above-line; business acceptance passed | no alert, no complaints |
| 5. release wrap-up | rename group to "[released] XXX"; archive release record; retrospective (if problems exist)  | archive complete |

## 4. pre-release checklist

- [ ] release solution review already passed
- [ ] smoke QA passed (minimum standard: no problems blocking the main process)
- [ ] release window already confirmed (avoid business peak)
- [ ] dependency parties already notified
- [ ] database changes already executed and validated
- [ ] config / switches already prepared
- [ ] rollback script already prepared and validated can roll back
- [ ] monitoring dashboard and alerts already configured
- [ ] on-call personnel already in place
- [ ] business acceptance person already notified

## 5. Measurement metric

- release success rate
- number of incidents caused by release (Target 0)
- time from release to rollback
- release window compliance rate

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| smoke not passed | treat as development delay; return to fix |
| release process exception | pause immediately; assess impact; rollback if necessary |
| above-line alert | decide whether rollback within 15 minutes; report to iteration PM |
| business acceptance not passed | log as must-fix item; assess whether rollback |
| emergency fix | follow hotfix process, simplify review but must retain record |

## 7. Notes

- **release solution must consider rollback**
- enter UAT: must complete release plan review in advance
- release process must have record; "ship one offhand" is forbidden
- canary release see [canary release process](./canary-release.md)
