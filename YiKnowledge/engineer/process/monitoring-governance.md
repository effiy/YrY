---
title: Monitoring Alert Governance process
aliases:
- monitoring-governance-process
- alert-governance
tags:
- Process
- Monitoring
- alertGovernance
- SLO
- noise-reduction
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
- ./oncall-rotation.md
- ./incident-response.md
- ../lessons/failures/incident-postmortem.md
tacit: false
---

# Monitoring Alert governance process

> **As an** engineer, **I want to** monitoring governance, **so that** process followed predictably.

> Prevent alert flooding from causing oncall fatigue and drowning out true-positive emergencies; core proposition: alerts must be actionable, attributable, and recoverable.

## Summary

- Alerts are classified into 4 types: emergency alert (Page, P0/P1) / work item alert (Ticket, P2) / notification alert (Info, P3) / self-healing alert (no notification).
- Alert quality 5 standards: actionable, attributable, recoverable, low noise (no duplicates within 5 minutes), severity correctly set.
- Governance process: new alert launch goes through requirement assess -> design -> review -> trial run (Ticket pattern 1 week) -> escalate to Page.
- Existing alerts run weekly stats: trigger count / response time / effectiveness / disposition (delete / change / retain).
- Delete / change / retain decision: no response -> delete; looked at but not actionable -> change; responded but no reason -> add monitoring context; heavy noise -> adjust threshold / add duration / aggregate; true emergency -> retain and drill regularly.
- SLO linkage: SLO achievement rate <50% Page / <80% Ticket / error budget exhausted Page.
- Landing cadence: every Sunday primary oncall reviews alert cluster / every week alert stats and governance / every month alert quality retrospective / every quarter full alert library re-audit.

## Core viewpoints

- Non-actionable alert = noise — too much noise and true alerts get ignored, oncall fatigue.
- Self-healing first — if a script can automatically recover, don't alert and let a person handle it, e.g. disk full automatically cleans old logs.
- Threshold not gut call — based on historical data + SLA, add duration (5-15 minutes) to avoid transient jitter.
- Context complete — every alert must carry trigger condition + impact scope + investigation guide (runbook link) + related charts (Grafana link).
- Alerts must link to SLO — alert and SLA decoupling is a severe severity misalignment of root cause.

## Key information

### Alert classification

| Type | Meaning | Disposition |
|---|---|---|
| Emergency alert (Page) | Immediate response, oncall needed | P0/P1 |
| Work item alert (Ticket) | Handle in work hours | P2 |
| Notification alert (Info) | Record only, no response | P3 |
| Self-healing alert | System handles automatically, record only | No notification |

### Alert quality standards (5 items)

1. **Actionable**: what to do when received? Not actionable -> delete / change
2. **Attributable**: root cause traceable (monitoring context complete)
3. **Recoverable**: clear "recovered" signal, alert auto-closes
4. **Low noise**: avoid jitter (no duplicate same alert within 5 minutes)
5. **Severity correct**: severity matches impact scope

### New alert launch process

1. Requirement assess: what to monitor, why, who responds
2. Design: metric, threshold, duration, severity, notification channel
3. Review: compare with existing alerts to check for duplication
4. Trial run: first run Ticket pattern for 1 week, confirm stable
5. Escalate to Page: after trial run with no noise, convert to Page

### Existing alert governance (weekly stats)

| Alert | Trigger count | Response time | Effective | Disposition |
|---|---|---|---|---|
| A | 200 | 0s (no response) | No | Delete / change |
| B | 50 | 30 min | Yes | Retain |
| C | 5 | 5 min | Yes | Retain |

### Delete / change / retain decision

| Standard | Disposition |
|---|---|
| No response (not looked at) | Delete |
| Looked at not actionable | Delete or change (add actionable suggestion) |
| Responded but no reason | Add monitoring context |
| Heavy noise (frequent) | Adjust threshold / add duration / aggregate |
| True emergency | Retain, drill regularly |

### Alert design principles

**Threshold and duration**:
- Threshold: based on historical data + SLA, not gut call
- Duration: avoid transient jitter, 5-15 minutes sustained
- Multi-stage threshold: warning (Ticket) -> critical (Page)

**Context complete**: every alert trigger must carry:
- Trigger condition (metric + threshold + time)
- Impact scope (which users / services)
- Investigation guide (link to runbook)
- Related charts (Grafana link)

**Self-healing first**: if a script can automatically recover, don't alert and let a person handle. Example: disk full -> auto clean old logs.

### SLO and alert linkage

- SLO achievement rate < 50% -> Page
- SLO achievement rate < 80% -> Ticket
- SLO error budget exhausted -> Page

> Error budget = 100% - SLO. Example: 99.9% SLO allows 43 minutes of error per month; alert when exceeding 50% i.e. 22 minutes.

### Toolchain

| Use | Tool |
|---|---|
| Metric collection | Prometheus / Datadog |
| Alert routing | Alertmanager / PagerDuty |
| Log alert | Loki / ELK |
| Self-healing script | Runbook automation |
| Alert governance | Self-built or OpsGenie Analytics |

### Landing cadence

| Time | Activity |
|---|---|
| Every Sunday | Primary oncall reviews alert cluster |
| Every week | Alert stats and governance |
| Every month | Alert quality retrospective |
| Every quarter | Full alert library re-audit |

### Applicable scenarios

- Alert flooding (oncall one night 200 alerts)
- True alerts ignored causing incident escalation
- SLO linkage missing
- Oncall fatigue governance

## Action recommendations

1. Run alert stats every week (trigger count / response time / effectiveness / disposition)
2. New alert launch follows 5-step process: requirement assess -> design -> review -> trial run (Ticket 1 week) -> escalate to Page
3. Every alert must carry context: trigger condition + impact scope + runbook link + Grafana link
4. Threshold based on historical data + SLA, add 5-15 minute duration to avoid transient jitter
5. Self-healing first: if a script can automatically recover, don't alert
6. SLO linkage: <50% Page / <80% Ticket / error budget exhausted Page
7. Every month alert quality retrospective, every quarter full alert library re-audit
8. Periodically clean up old alerts older than half a year

## Anti-patterns

- **Firing alerts that are not actionable** — an alert that says "CPU high" with no runbook link, no impact scope, and no recovery steps forces the oncall engineer to investigate from scratch every time. Every alert must carry a trigger condition, impact scope, investigation guide, and related charts.

- **Skipping the trial-run phase for new alerts** — promoting a new alert directly to Page without a 1-week Ticket-mode trial guarantees false positives will wake someone up at night. New alerts must first run as Tickets for a week and only escalate to Page after the noise level is confirmed to be zero.

- **Tolerating alert flooding without governance** — when oncall receives 200 alerts in a single night, true emergencies are buried in the noise. Weekly alert stats (trigger count, response time, effectiveness) and a disposition decision (delete, change, retain) for every alert are mandatory to keep the signal-to-noise ratio healthy.

- **Setting thresholds by gut feel instead of historical data** — a threshold picked without consulting historical baselines will either fire constantly (noise) or never fire (blind spot). Thresholds must be based on historical data plus SLA requirements, with a 5-15 minute duration to filter out transient spikes.

- **Decoupling alerts from SLOs** — when alert severity is assigned independently of the service's SLO, a P0 page may fire for a service that is still within its error budget. Alerts must be linked to SLO achievement rates: below 50% triggers Page, below 80% triggers Ticket, and error budget exhaustion triggers Page.

## Related

- [Oncall rotation](./oncall-rotation.md) — oncall rotation process governance
- [Incident response](./incident-response.md) — incident response process
- [Set up an oncall rotation](../../oncall-sre/incident-response/set-up-an-oncall-rotation.md) — oncall rotation setup guide
- [Handle an oncall shift](../../oncall-sre/incident-response/handle-an-oncall-shift.md) — operational guide for the oncall engineer
- [Bug-logging protocol](../quality-security/bug-logging-protocol.md) — bug logging protocol with incident escalation path
