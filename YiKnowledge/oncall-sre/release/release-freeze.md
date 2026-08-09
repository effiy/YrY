---
aliases:
- Release Freeze Process
title: Code Freeze Period Process (release freeze) 
tags:
- process
- code-freeze
- release freeze
- SOP
category: oncall-sre/release
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
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
- ./hotfix-release.md
- ../../engineer/process/incident-response.md
tacit: false
---

# Code Freeze Period Process (release freeze) 

> **As a** oncall sre, **I want to** release freeze, **so that** release safe. 

## 1. Purpose and Applicable Scope

At key business milestones (major promotions, major events, compliance windows, holidays) pause non-essential changes to reduce the probability of production incidents. 

Applies to: all production environment releases; the freeze window is jointly determined by the business owner and the iteration PM. 

## 2. Roles and Responsibilities

| role | responsibility |
|---|---|
| Iteration PM (R) | publish the freeze-period calendar; approve exceptions |
| Business Owner (A) | decide freeze start/end and scope |
| Tech Owner (C) | evaluate exception requests |
| Oncall (C) | on-call duty and emergency response during freeze |
| Project Owner (I) | comply with the freeze; submit exception requests |

## 3. Freeze Tiers

| tier | description | typical scenario |
|---|---|---|
| Hard freeze | only P0 fixes allowed; all others rejected | Double 11, regulatory audit, major release |
| Soft freeze | requires iteration PM + tech owner dual sign-off | holidays, month-end close |
| Golden week | everyone off; only Oncall on duty | Spring Festival, National Day |

## 4. Step Breakdown

```
Freeze calendar published -> pre-freeze prep -> freeze-period on-call -> exception approval -> unfreeze -> retrospective
```

| step | key action | exit criteria |
|---|---|---|
| 1. Publish freeze calendar | iteration PM publishes the freeze calendar each quarter; notifies everyone | calendar sent out |
| 2. Pre-freeze prep | finish key releases; outstanding bugs zeroed out; Oncall schedule confirmed | prep complete |
| 3. Freeze-period on-call | Oncall on duty; monitoring alerts; non-essential releases forbidden | on-call log archived |
| 4. Exception approval | applicant submits exception request; tech owner + iteration PM dual sign-off | approval conclusion sent |
| 5. Unfreeze | batch releases after unfreeze; queued by priority | unfreeze announcement sent |
| 6. Retrospective | record freeze-period incidents and exceptions; evaluate effectiveness | retrospective archived |

## 5. Exception Approval Criteria

- **Allowed exceptions**: P0/P1 production incident loss-stopping, security compliance requirements, regulatory notifications, fund/order blockers
- **Not allowed**: routine requirements, non-urgent optimizations, tech-debt governance, new feature launches

## 6. Measurement Metrics

- Number of incidents during freeze (goal 0) 
- Number of exception requests and approval rate
- Congestion of batch releases after unfreeze
- Number of on-call alerts during freeze and handling rate

## 7. Exception Handling and Escalation Path

| scenario | handling |
|---|---|
| Emergency incident | handle per [incident response process](../../engineer/process/incident-response.md); follow [hotfix process](./hotfix-release.md) |
| Exception rejected | applicant escalates to business owner; business owner decides |
| Not finished before freeze | evaluate whether to postpone or hold until after unfreeze |
| Post-unfreeze congestion | queue by priority; do not squeeze all in at once |
| Golden-week emergency incident | Oncall responds; business owner supports remotely |

## 8. Notes

- **Freeze does not mean no releases** — it means only release what should be released
- Publish the freeze calendar early (one quarter ahead) so product/R&D/test can plan their rhythm
- "Rushing releases" right before a freeze is a breeding ground for incidents — do not push to the last day
- Exception approval must have dual sign-off; do not pass verbal messages
- Queue releases after unfreeze; do not squeeze all in at once
- Works in conjunction with [release-process](./release.md) and [incident-response-process](../../engineer/process/incident-response.md)
