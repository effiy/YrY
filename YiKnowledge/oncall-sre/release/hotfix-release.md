---
aliases:
- Hotfix Release Process
title: Hotfix Release Process
tags:
- Process
- hotfix
- urgent-fix
- release
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
- ./release.md
- ../../engineer/process/incident-response.md
- ./release-freeze.md
- ./canary-release.md
tacit: false
---

# Hotfix Release Process

> **As a** oncall sre, **I want to** hotfix release, **so that** release safe. 

## 1. Purpose and applicable scope

In incident response mitigation or production critical-defect scenarios, skip full review and quickly launch a fix; ensure actions are traceable and rollbackable. 

Applicable to: P0/P1 incident mitigation, blocking main process of production defects, security vulnerability emergency patch. 

Not applicable to: regular requirements, non-urgent optimizations (go through normal [Release Process](./release.md)).

## 2. Role and responsibility

| Role | Responsibility |
|---|---|
| Fix author (R) | Positioning and fix; smallest change |
| Tech owner (A) | Decide whether to go hotfix; review fix solution |
| Iteration PM (C) | Coordinate resources; simplify review; fill records afterward |
| Test owner (C) | Minimum use-case validation |
| Oncall (I) | Coordinate observation and rollback decision |

## 3. Step breakdown

```
Triage → Minimum fix plan → Quick review → Release → Observe → Post-fill record
```

| Step | Key action | Time limit |
|---|---|---|
| 1. Triage | Tech owner confirms urgency; whether it meets hotfix criteria | 5 minutes |
| 2. Minimum fix plan | Fix author describes root cause, change scope, rollback method; no incidental refactor | 15 minutes |
| 3. Quick review | Tech owner + test owner review verbally or in group; record conclusion | within 30 minutes |
| 4. Release | Go [Release Process](./release.md) simplified version; smoke test must pass | — |
| 5. Observe | Watch core metrics for at least 30 minutes | — |
| 6. Post-fill record | Within 24 hours fill PR description, release record, retrospective | — |

## 4. Input / output artifacts

- **Input**: incident response record / defect description, root cause analysis
- **Output**: hotfix PR, release record, retrospective document (see [incident-postmortem-template](../../engineer/lessons/failure-incident-postmortem.md)) 

## 5. Measurement metrics

- Hotfix count (target: trending down) 
- Hotfix average duration (discover to recovery) 
- Secondary incident rate caused by hotfix (target: 0) 

## 6. Exception handling and upgrade path

| Scenario | Handling |
|---|---|
| Fix solution unclear | Do not go hotfix; switch to normal process |
| Change scope exceeds "minimum fix" | Split; non-urgent parts enter backlog |
| Hotfix triggers new issues | Rollback immediately; escalate via [incident response process](../../engineer/process/incident-response.md) |
| Same issue repeatedly hotfixed | Escalate to tech owner; root-cause immediately |

## 7. Notes

- Hotfix is an exception, not the norm — high-frequency hotfix indicates process problems
- Changes must be minimized; incidental refactor breeds incidents
- Review can be simplified but not skipped — must leave written record
- After hotfix must run retrospective; root-cause items enter tech-debt list
- Within 24 hours complete all documentation; do not "ship first, talk later"
