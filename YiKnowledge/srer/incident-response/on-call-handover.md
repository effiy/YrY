---
title: On-Call Handover Procedure
aliases: [on-call-handover, oncall-handover, shift-handover]
tags: [sre, on-call, handover, incident-response, procedure]
category: srer/incident-response
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "SREs execute consistent on-call handovers so the incoming on-call engineer has full context on active incidents, known issues, and pending actions"
acceptance_criteria:
  - "handover template covers active incidents, known issues, pending actions, and upcoming changes"
  - "includes a pre-handover checklist for the outgoing on-call"
  - "defines handover cadence and communication channel"
related:
  - ./respond-to-an-incident.md
  - ./README.md
  - ../observability/set-up-observability.md
---

# On-Call Handover Procedure

> **When to use:** At the end of every on-call shift. A structured handover ensures the incoming engineer has everything they need to respond effectively.

## Handover cadence

- **Frequency:** At shift change (weekly or biweekly depending on rotation)
- **Channel:** Dedicated Slack/WeCom channel + handover document
- **Duration:** 15-30 min synchronous handover call

## Pre-handover checklist (outgoing on-call)

Before the handover, the outgoing on-call must:

- [ ] Resolve or escalate all active incidents
- [ ] Update all incident tickets with current status
- [ ] Document any workarounds applied during the shift
- [ ] Verify all alerts are acknowledged (no stale alerts)
- [ ] Update the runbook with any new findings
- [ ] Prepare the handover document (see template below)

## Handover document template

### Active Incidents

| Incident ID | Severity | Started | Status | Current action | ETA |
|---|---|---|---|---|---|
| {{INC-001}} | {{P1/P2/P3}} | {{YYYY-MM-DD HH:MM}} | {{investigating/mitigating/resolved}} | {{What's happening now}} | {{HH:MM}} |

### Known Issues (non-incident)

> Things that are not incidents but the incoming on-call should know about.

- {{Issue description}} — {{impact}} — {{workaround if any}}
- {{Issue description}} — {{impact}} — {{workaround if any}}

### Pending Actions

| Action | Owner | Deadline | Notes |
|---|---|---|---|
| {{Action}} | {{name}} | {{YYYY-MM-DD}} | {{context}} |

### Upcoming Changes

> Planned deployments, maintenance windows, or known risk events during the next shift.

| Change | When | Risk | Rollback plan |
|---|---|---|---|
| {{Change description}} | {{YYYY-MM-DD HH:MM}} | Low/Med/High | {{How to rollback}} |

### Health Dashboard

| Service | SLO status | Error budget remaining | Recent trend |
|---|---|---|---|
| {{service}} | {{healthy/at-risk/burned}} | {{%}} | {{stable/degrading/improving}} |

## During the handover call

1. **Outgoing walks through the handover document** (10 min) — active incidents first, then known issues, then pending actions
2. **Incoming asks questions** (5 min) — clarify anything unclear, ask about edge cases
3. **Both acknowledge the handover** — outgoing is now off-call; incoming is now responsible

## Post-handover (incoming on-call)

- [ ] Verify access to all systems (dashboards, runbooks, incident management)
- [ ] Acknowledge all open alerts
- [ ] Review the alert history from the past 24 hours
- [ ] Confirm contact information is up to date in the on-call rotation

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| "Nothing happened, no handover needed" | Incoming has zero context; misses subtle issues | Always do a handover, even if the shift was quiet |
| Verbal handover only (no document) | Information is lost; no async reference for the incoming | Always write the handover document before the call |
| Handover document written 5 min before | Rushed, incomplete, misses important context | Update the document throughout the shift as things happen |
| No upcoming changes section | Incoming is blindsided by a deployment they didn't know about | Check the deployment calendar as part of pre-handover |