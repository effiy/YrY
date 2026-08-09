---
aliases:
- Incident Response Process
title: Incident response process (P0/P1/P2) 
tags:
- process
- incident response
- oncall
- SOP
category: engineer/process
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ../../oncall-sre/release/hotfix-release.md
- ../../oncall-sre/release/rollback-drill.md
- ../../oncall-sre/release/release-freeze.md
- ./monitoring-governance.md
tacit: false
---

# Incident response process (P0/P1/P2) 

> **As an** engineer, **I want to** incident response, **so that** process followed predictably. 

## 1. Purpose and applicable scope

Standardize in-event response for production incidents, reduce MTTR; complementary to `lessons/failures/incident-postmortem-template.md` — response process is during event, retrospective is after. 

Applicable to: all production incidents (P0/P1/P2). 

## 2. Severity level definitions

| Level | Definition | Response time | Escalation |
|---|---|---|---|
| P0 | Core function unavailable; large-scale user impact; financial/data risk | Respond within 5 minutes | Immediately notify iteration PM + tech owner + business stakeholders |
| P1 | Partial function unavailable; impact can be bypassed; medium-scope users | Respond within 15 minutes | Notify iteration PM + tech owner |
| P2 | Experience issue; small-scope users; does not impact main process | Respond within 1 hour | Inform iteration PM |

## 3. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Oncall (R)  | First responder; initial triage; spin up response group |
| Tech owner (A)  | Decide rollback/fix/scale-up |
| Iteration PM (C)  | Coordinate resources; external communication |
| Business stakeholder (I)  | Business-side decision (whether to stop loss)  |
| Retrospective owner (R, post-event)  | Produce postmortem |

## 4. Response steps

```
Discover → Response group → Triage → Stop loss → Recover → Report → Retrospective
```

| Step | Action | Time limit |
|---|---|---|
| 1. Discover | Alert / user feedback enters on-call channel | — |
| 2. Response group | Oncall creates group; named "[Incident-Px]XXX-YYYYMMDD"; @relevant people | P0 ≤ 5min |
| 3. Triage | Investigate changes, dependencies, infrastructure; clarify impact scope | P0 ≤ 15min |
| 4. Stop loss | Prefer rollback, degrade, switch, rate-limit; don't fix bug in place | P0 ≤ 30min |
| 5. Recover | Validate core flow recovered | — |
| 6. Report | Report recovery in group; external report per business decision | — |
| 7. Retrospective | Produce postmortem within 24 hours | See incident-postmortem-template.md |

## 5. Measurement metrics

- MTTA: average response time
- MTTI: average triage time
- MTTR: average recovery time
- Incident recurrence rate: number of same-root-cause recurrences within 30 days

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Oncall cannot triage | Escalate to tech owner within 15 minutes |
| Impact expands | Raise severity level; expand communication |
| Stop-loss decision disagreement | Tech owner decides; for major incidents business stakeholder co-decides |
| Involves third party | Start emergency contact; sync business expectations |
| Retrospective finds systemic issue | Enter tech debt list; iteration PM schedules governance |

## 7. Notes

- During event only stop loss, don't fix bug — bug is fixed after event
- In-group info must have timeline: changes / impact / stop-loss actions / recovery validation
- Reporting must be honest, don't sugarcoat
- P0/P1 must retrospective within 24 hours
