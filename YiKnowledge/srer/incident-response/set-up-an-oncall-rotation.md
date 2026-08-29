---
title: Set Up an On-Call Rotation
aliases: [oncall-rotation, on-call-setup, rotation-setup]
tags: [sre, on-call, rotation, incident-response, operations]
category: srer/incident-response
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, leader]
benefit: "Teams set up fair, sustainable on-call rotations that prevent burnout and ensure coverage"
acceptance_criteria:
  - "covers rotation types, team sizing, and compensation"
  - "includes escalation policy design"
  - "defines sustainable on-call load"
related:
  - ./handle-an-oncall-shift.md
  - ./on-call-handover.md
  - ./respond-to-an-incident.md
---

# Set Up an On-Call Rotation

> **When to use:** When a service reaches production and needs 24/7 coverage, or when the current rotation is causing burnout.

## Rotation Types

| Type | How it works | Best for | Drawback |
|---|---|---|---|
| **Weekly** | One person on-call for a full week | Most common; good context depth | Can be intense if the week is bad |
| **Daily** | Rotate every day | High-intensity services | High context-switching overhead |
| **Follow-the-sun** | Teams in different time zones cover their daytime | Global teams; no night shifts | Requires 3+ geo-distributed teams |
| **Primary/Secondary** | Primary handles alerts; secondary is backup | Critical services | Requires 2x staffing |

**Recommendation:** Start with weekly rotation + primary/secondary for critical services.

## Team Sizing

| Team size | Max on-call frequency | Sustainable? |
|---|---|---|
| 2 people | Every other week | No — burnout in 3 months |
| 3 people | Every 3 weeks | Borderline — sustainable if incident load is low |
| 4-5 people | Every 4-5 weeks | Yes — sustainable for most teams |
| 6+ people | Every 6+ weeks | Yes — comfortable |

**Rule of thumb:** No one should be on-call more than 1 week out of 4.

## Setting Up the Rotation

### 1. Define the service catalog

List every service that needs on-call coverage:

| Service | Criticality | Hours | Notes |
|---|---|---|---|
| YiAi API | Critical | 24/7 | Single backend for all frontends |
| MongoDB | Critical | 24/7 | Data integrity |
| Ollama | High | Business hours + weekend best-effort | Self-hosted; can degrade gracefully |

### 2. Assign rotation slots

```
Week 1: Alice (primary), Bob (secondary)
Week 2: Bob (primary), Carol (secondary)
Week 3: Carol (primary), Alice (secondary)
Week 4: Alice (primary), Bob (secondary)
...
```

### 3. Define escalation policy

```
Level 1: Primary on-call (5 min ack, 30 min response)
    ↓ if no response or needs help
Level 2: Secondary on-call (15 min response)
    ↓ if incident severity is P1 or unresolved > 1h
Level 3: Engineering manager (30 min response)
    ↓ if customer-facing outage > 2h
Level 4: VP Engineering / CTO
```

### 4. Set up alerting channels

- `#on-call` — shift changes, handovers, low-urgency discussion
- `#incidents` — incident declarations, updates, resolutions
- `#sre-alerts` — automated alert feed (integrate with monitoring)

### 5. Define compensation

| Policy | Description |
|---|---|
| **Time off in lieu** | For every week on-call with incidents, get half a day off |
| **On-call stipend** | Flat rate per week on-call |
| **Incident bonus** | Per-incident bonus for P1/P2 responses |

## On-Call Health Check

Review the rotation quarterly:

- [ ] Average incidents per week: is it trending up or down?
- [ ] Any team member showing signs of burnout?
- [ ] Are escalation paths working? (Test with a drill)
- [ ] Is the rotation size still adequate? (Team grew? Service grew?)
- [ ] Are alerts actionable? (>50% should require action, not just notification)

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| One-person rotation (no backup) | Single point of failure; burnout guaranteed | Minimum 2 people in rotation; 3+ for 24/7 |
| No escalation policy | On-call can't get help when needed | Define clear escalation paths with timeouts |
| No compensation | On-call feels like punishment; retention suffers | Compensate with time off or stipend |
| Alerting on everything | Alert fatigue; on-call ignores real incidents | Only alert on conditions that require human action |