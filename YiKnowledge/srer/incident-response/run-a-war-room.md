---
title: Run a War Room
aliases: [run-a-war-room, war-room, incident-command, major-incident]
tags: [sre, incident-response, war-room, major-incident, coordination]
category: srer/incident-response
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, leader, engineer]
benefit: "SREs and leaders run effective war rooms for major incidents — clear roles, structured communication, and fast resolution"
acceptance_criteria:
  - "5 roles: commander, responder, communicator, scribe, liaison"
  - "includes war room lifecycle: open → investigate → resolve → close"
  - "communication templates for status updates"
related:
  - ./respond-to-an-incident.md
  - ./handle-a-data-breach.md
  - ../../leader/risk/write-a-postmortem.md
---

# Run a War Room

> **When to use:** For P1 incidents affecting the critical user journey. A war room is the coordination hub for major incidents — it's not a meeting, it's a command center.

## When to Open a War Room

| Trigger | Action |
|---|---|
| P1 incident (critical user journey broken) | Open war room immediately |
| Incident unresolved after 30 minutes | Escalate to war room |
| Multiple services affected | Open war room for coordination |
| Customer-facing outage | Open war room + assign communicator |

## War Room Roles

| Role | Who | Responsibility |
|---|---|---|
| **Commander** (IC) | Most senior on-call | Makes decisions, sets direction, delegates |
| **Responder** | Engineer(s) | Investigates and fixes the issue |
| **Communicator** | PM or manager | Updates stakeholders, customers, status page |
| **Scribe** | Anyone | Documents timeline, actions, decisions in real-time |
| **Liaison** | Optional | Coordinates with external teams (security, legal, support) |

**Minimum staffing:** Commander + Responder. Other roles can be combined.

## War Room Lifecycle

### 1. Open (First 5 Minutes)

```
Commander: "War room open. Incident: {{one-line description}}. 
            Commander: {{name}}. Responder: {{name}}. 
            Channel: #incidents. Document: {{link}}."
```

**Immediate actions:**
- [ ] Create a shared document for the timeline
- [ ] Start a video call or voice channel
- [ ] Assign roles
- [ ] Post the first status update

### 2. Investigate (Ongoing)

```
Commander sets the direction:
  "Hypothesis: {{most likely cause}}. 
   Responder: check {{specific thing}}.
   Communicator: draft a status update for customers."
```

**Rules:**
- Commander sets one hypothesis at a time
- Responder reports findings every 5-10 minutes
- Scribe records every action and finding in the timeline
- No one works on their own — all actions are visible to the team

### 3. Resolve

```
Commander: "We've identified the root cause as {{cause}}. 
            Fix: {{action}}. ETA: {{time}}.
            Responder: execute the fix.
            Communicator: prepare the resolution announcement."
```

**Before closing:**
- [ ] Fix is deployed and verified
- [ ] Monitoring shows recovery
- [ ] Customer impact is resolved
- [ ] Rollback plan is ready (if fix fails)

### 4. Close

```
Commander: "War room closed at {{time}}. 
            Duration: {{duration}}. 
            Root cause: {{cause}}. 
            Fix: {{action}}.
            Postmortem: scheduled for {{date}}.
            Thank you everyone."
```

## Communication Templates

### Status Update (Every 30 Minutes)

```
Incident Update #{{N}} — {{HH:MM UTC}}

Status: {{Investigating / Mitigating / Resolved}}
Impact: {{What users are experiencing}}
Scope: {{Services/regions affected}}
Action: {{What we're doing}}
ETA: {{Next update or resolution time}}
```

### Resolution Announcement

```
Incident Resolved — {{HH:MM UTC}}

Duration: {{start}} — {{end}} ({{duration}})
Root cause: {{1-2 sentences}}
Fix: {{1-2 sentences}}
Impact: {{users affected, data loss, revenue}}
Prevention: {{what we're changing}}

Postmortem will be published within 24 hours.
```

## War Room Best Practices

| Practice | Why |
|---|---|
| **One voice at a time** | Multiple people talking = chaos |
| **Commander delegates, doesn't do** | The commander needs to see the whole picture |
| **No silent investigation** | If the responder goes quiet for > 10 minutes, something is wrong |
| **Time-box investigations** | "Try X for 10 minutes, then report back" |
| **No blame** | War rooms are for solving problems, not assigning fault |
| **Take breaks** | After 2 hours, rotate roles if possible |

## After the War Room

- [ ] Schedule the postmortem within 24 hours
- [ ] Publish the timeline document
- [ ] Thank the team (publicly, specifically)
- [ ] Review war room effectiveness — what worked? What didn't?
- [ ] Update runbooks with any new findings

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| No commander | Everyone investigates in different directions; no coordination | Assign a commander as the first action |
| Commander also investigates | Commander loses situational awareness; misses the big picture | Commander delegates investigation; focuses on direction |
| No scribe | Timeline is reconstructed from memory; postmortem is inaccurate | Assign a scribe; document every action in real-time |
| War room stays open after resolution | Team is exhausted; no clear closure | Commander explicitly closes the war room; thank the team |