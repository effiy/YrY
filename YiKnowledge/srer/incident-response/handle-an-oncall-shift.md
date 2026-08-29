---
title: Handle an On-Call Shift
aliases: [oncall-shift, handle-oncall, on-call-procedure]
tags: [sre, on-call, incident-response, procedure, operations]
category: srer/incident-response
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "On-call engineers know exactly what to do at each phase of their shift — start, during, and end"
acceptance_criteria:
  - "3 phases: shift start, during shift, shift end"
  - "includes a daily checklist for the on-call engineer"
  - "covers escalation paths and communication channels"
related:
  - ./respond-to-an-incident.md
  - ./on-call-handover.md
  - ./set-up-an-oncall-rotation.md
  - ../observability/set-up-observability.md
---

# Handle an On-Call Shift

> **When to use:** At the start of every on-call shift. A structured shift routine prevents missed alerts, stale context, and handover gaps.

## Phase 1: Shift Start (first 30 min)

### System Access Check

- [ ] Can access all dashboards (Grafana, MongoDB Atlas, server logs)
- [ ] Can access incident management tool
- [ ] Can access runbooks and documentation
- [ ] Alerting channels are working (Slack/WeCom `#on-call`, `#incidents`)
- [ ] Phone/pager is on and receiving alerts

### Context Loading

- [ ] Read the handover document from the previous shift
- [ ] Review all open incidents and their current status
- [ ] Check the deployment calendar for planned changes during your shift
- [ ] Review error budgets for critical services
- [ ] Acknowledge all open alerts

### Communication

- [ ] Announce shift start in `#on-call` channel
- [ ] Confirm contact information is up to date
- [ ] Verify escalation path: who's your backup?

## Phase 2: During Shift

### Daily Routine

| Time | Activity |
|---|---|
| Start of day | Check dashboards — any anomalies overnight? |
| Mid-morning | Review open incidents — any need escalation? |
| After lunch | Check deployment pipeline — any stuck deployments? |
| End of day | Quick scan of all alerts — anything new? |

### When an Alert Fires

1. **Acknowledge** within 5 minutes — silence the pager
2. **Triage** — is this a real incident or noise?
3. **Respond** — follow [respond-to-an-incident.md](./respond-to-an-incident.md)
4. **Communicate** — update `#incidents` channel
5. **Document** — update the incident ticket in real time

### When You Need Help

| Situation | Escalate to |
|---|---|
| Incident exceeds your expertise | Secondary on-call |
| Incident exceeds 30 min without resolution | Engineering manager |
| Security incident | Security on-call + CISO |
| Data loss or corruption | DBA on-call + engineering director |
| Customer-facing outage > 1 hour | VP Engineering |

### Self-Care

- Take breaks — fatigued on-call makes worse decisions
- If an incident runs past 2 hours, tag in your backup
- Don't make risky changes during your shift without a buddy

## Phase 3: Shift End

### Pre-handover

- [ ] All incidents are resolved or escalated
- [ ] All incident tickets are updated with current status
- [ ] Any workarounds are documented in runbooks
- [ ] No stale alerts (all acknowledged)
- [ ] Handover document is written (see [on-call-handover.md](./on-call-handover.md))

### Handover Call

1. Walk through the handover document with the incoming on-call
2. Highlight any unresolved issues or upcoming risks
3. Answer questions
4. Both acknowledge the handover

### Post-shift

- [ ] Announce shift end in `#on-call`
- [ ] Silence your pager (if not automatic)
- [ ] Take a notes for any process improvements

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Skipping the system access check | Discover you can't log in during an incident | Verify all access at shift start |
| Not reading the handover document | Stumble into an ongoing incident with no context | Always read the handover before starting |
| Hero mode (never escalating) | Burnout + single point of failure | Escalate early; it's a sign of good judgment |
| Making risky changes during on-call | Incidents compound when a "fix" breaks something else | Buddy-check all changes; defer non-urgent changes |