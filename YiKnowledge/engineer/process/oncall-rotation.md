---
title: Oncall rotation and handoff process
aliases:
- oncall-rotation-process
- oncall-handover
tags:
- Process
- oncall
- rotation
- handover
- SLA
category: engineer/process
created: 2026-07-31
updated: 2026-08-07
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
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./incident-response.md
- ../../oncall-sre/release/rollback-drill.md
- ./monitoring-governance.md
- ./collaboration/cross-timezone-collaboration.md
tacit: false
---

# Oncall rotation and handoff process

> **As an** engineer, **I want to** oncall rotation, **so that** process followed predictably.

> Ensure 7x24 response coverage, while avoiding individual burnout and responsibility misalignment.

## Summary

- 5 Roles: Primary oncall (first response) / Secondary oncall (escalation intervention) / Manager (resource allocation) / Service owner (complex incident technical decisions) / Comms (external communication).
- Rotation cadence: 1 week per turn (medium-sized) / 2 weeks per turn (large team to avoid frequent switching) / follow-the-sun (8h per timezone across regions).
- Handoff is a weekly fixed-time (e.g. Monday 10:00) 30-minute sync; handoff documentation is required: unresolved incidents / high-frequency alerts / pending action items / important changes / seasonal factors.
- Alert response SLA: P0 5min response 1h resolve (immediately escalate Secondary+Manager) / P1 15min 4h / P2 1h 24h / P3 4h one week.
- Non-response periods also do improvement: retrospective of last week's incidents, advance action items, monitoring alert governance, capacity and cost review.
- Culture: oncall is not punishment, it is responsibility and learning; leadership respects oncall time, does not let it double as other tasks; retrospective does not blame the oncall individual.

## Core viewpoints

- 1-2 week rotations avoid mental burnout — one person on call for a month causes burnout; the same person rotating repeatedly causes imbalance.
- Must have Secondary — without a second line Primary is stuck; when Primary can't handle it, must be able to escalate.
- Handoff must be sync + documentation — no documentation means no response; information will be lost.
- Alert response missing the SLA root cause — monitoring response time + escalation path; P0 must be responded to within 5min.
- Oncall with no output equals only firefighting with no improvement — non-response periods do improvement (retrospective + action + alert governance + capacity review).

## Key information

### Role and responsibility (RACI)

| Role | Responsibility |
|---|---|
| Primary oncall | First response, receives alerts |
| Secondary oncall | Escalates when Primary can't handle |
| Manager | Resource allocation, cross-team coordination |
| Service owner | Complex incident technical decisions |
| Comms | External communication (users, customers) |

### Rotation structure (first line / second line)

- Primary (first line): first to receive alerts, handles simple incidents
- Secondary (second line): escalates for intervention, deeper technical capability

### Rotation cadence

| Pattern | Cadence | Suited for |
|---|---|---|
| 1 week per turn | 7 days | Medium-sized |
| 2 weeks per turn | 14 days | Large team, avoid frequent switching |
| Follow-the-sun | 8h per timezone | Cross-timezone teams |

### Handoff process

- Handoff time: fixed weekly time (e.g. Monday 10:00)
- Duration: 30 minutes
- Must sync handoff; no leaving documentation without response

### Handoff content

1. **Currently unresolved incidents**: status, next step
2. **Recent high-frequency alerts**: whether there's a trend
3. **Pending improvement items**: last week's action item progress
4. **Important changes**: last week's deployments, config changes
5. **Seasonal factors**: big promotions, compliance audit periods

### Handoff documentation template

```
Week of YYYY-MM-DD
Primary: {name} -> {next name}

Open incidents:
- INC-123: {status} | current blocker | next step

Recent alerts trend:
- {alert} frequency X/day, reason

Pending action items:
- {action} owner progress

Recent changes:
- {deployment} {time}
```

### Alert response SLA

| Severity | Response deadline | Resolve deadline | Escalation |
|---|---|---|---|
| P0 | 5 minutes | 1 hour | Immediately Secondary + Manager |
| P1 | 15 minutes | 4 hours | Escalate Secondary if no response in 30 minutes |
| P2 | 1 hour | 24 hours | Response during work hours |
| P3 | 4 hours | One week | Response during work hours |

### Oncall work content

**Response period:**
- Receive alert -> assessment -> Mitigation -> fix -> Retrospective
- Continuous monitoring of alert groups
- Clear escalation path

**Non-response period:**
- Retrospective of last week's incidents ([incident-postmortem-summary](../lessons/failure-incident-postmortem.md))
- Advance action items
- Monitoring alert governance ([monitoring-governance-process](./monitoring-governance.md))
- Capacity and cost review ([capacity-and-cost-summary](../../oncall-sre/observability/capacity-and-cost.md))

### Tool stack

| Purpose | Tool |
|---|---|
| Alert routing | PagerDuty / Opsgenie |
| Communication | Slack / Lark oncall channel |
| Incident record | JIRA / Linear oncall project |
| Documentation | Handoff documentation template |
| Monitoring | Grafana / Datadog |

### Implementation cadence

| Time point | Item |
|---|---|
| Weekly fixed | Handoff 30 minutes |
| Daily | Primary monitors alerts |
| Per incident | Incident record required |
| Monthly | Oncall workload and quality assessment |
| Quarterly | Rotation schedule review + team satisfaction |

### Applicable scenarios

- Teams requiring 7x24 response coverage
- Cross-timezone teams needing follow-the-sun rotation
- Oncall workload and quality assessment
- Teams missing alert response SLA

## Action recommendations

1. Define 5 roles (Primary / Secondary / Manager / Service owner / Comms) RACI
2. Choose rotation cadence: medium-sized 1 week per turn, large team 2 weeks per turn, cross-timezone follow-the-sun
3. Weekly fixed time (e.g. Monday 10:00) 30-minute sync handoff, handoff documentation required
4. Define alert response SLA (P0 5min / P1 15min / P2 1h / P3 4h) + escalation path
5. Non-response period do improvement: retrospective last week's incidents + advance action + alert governance + capacity review
6. Tool stack: PagerDuty/Opsgenie + Slack/Lark + Jira/Linear + Grafana/Datadog
7. Culture building: oncall is not punishment; leadership respects oncall time; retrospective does not blame individuals
8. Monthly assessment of workload and quality; quarterly review of rotation schedule + team satisfaction

## Anti-patterns

- **Assigning one person to oncall for extended periods** — being on call for a month straight causes mental burnout and degrades response quality as fatigue sets in. Rotations must be capped at 1-2 weeks, and the same person must not rotate back in immediately after their shift ends.

- **Operating without a Secondary oncall** — when the Primary oncall is stuck on a complex incident, asleep, or unavailable, there is no one to escalate to, and the SLA is silently breached. A Secondary oncall must be designated for every rotation and must be reachable during the Primary's shift.

- **Handing off without synchronous communication** — leaving a handoff document without a live 30-minute sync means the incoming oncall cannot ask clarifying questions about unresolved incidents or subtle alert trends. The handoff must be a scheduled synchronous meeting with documentation as the artifact, not a substitute.

- **Treating oncall as purely firefighting with no improvement work** — if the oncall engineer only responds to alerts and does nothing else, the same incidents recur week after week. Non-response periods must be used for incident retrospectives, advancing action items, alert governance, and capacity review.

- **Blaming the oncall individual in retrospectives** — when post-incident reviews focus on who was on call rather than what system failure occurred, engineers avoid oncall duty and hide incidents. The retrospective must target the process and system gaps, not the individual who happened to be holding the pager.

## Related

- [./incident-response.md](./incident-response.md) — Incident response process that oncall engineers follow during alerts
- [../../oncall-sre/release/rollback-drill.md](../../oncall-sre/release/rollback-drill.md) — Rollback drill for oncall engineers during release incidents
- [./monitoring-governance.md](./monitoring-governance.md) — Monitoring governance during non-response periods
- [./cross-team-collaboration.md](./cross-team-collaboration.md) — Cross-team collaboration during incident escalation
- [../lessons/failure-incident-postmortem.md](../lessons/failure-incident-postmortem.md) — Incident postmortem process used in non-response retrospectives
