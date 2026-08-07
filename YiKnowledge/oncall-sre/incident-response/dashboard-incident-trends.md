---
title: incident trends dashboard
aliases:
- incident dashboard
- incident metrics dashboard
- postmortem dashboard
tags:
- dashboard
- incident
- postmortem
- mttr
- mtta
- reliability
category: oncall-sre/incident-response
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- oncall-sre
- engineer
- tech-lead
- executive
benefit: incident patterns and response effectiveness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- respond-to-an-incident.md
- ../observability/dashboard-system-health.md
- ../../engineer/lessons/failure-incident-postmortem.md
- ../../engineer/process/monitoring-governance.md
tacit: false
---

# incident trends dashboard

> **As a** oncall sre, **I want to** track incident patterns and response effectiveness, **so that** recurring failures are identified and systemic reliability improvements are prioritized.

> Incident metrics reveal the true health of your systems and teams. This dashboard tracks frequency, severity, response performance, and root cause patterns.

## Summary

- 5 incident dimensions: frequency and severity, response performance (MTTA/MTTR), root cause distribution, detection source, postmortem quality
- Severity levels: SEV0 (critical) through SEV4 (minor), each with defined response SLA
- Root cause categorization enables pattern detection — recurring causes get systemic fixes
- Postmortem completion rate and action-item closure rate track organizational learning
- Dashboard refreshes per incident; monthly trend analysis; quarterly deep-dive

## Core viewpoints

- Incidents are inevitable — the goal is not zero incidents, it's fast detection, fast recovery, and never repeating the same mistake
- MTTA (acknowledge) + MTTR (resolve) = total user impact time; optimize both
- Root cause distribution reveals systemic weaknesses — if 40% are config errors, invest in config validation
- Postmortems without action items are wasted learning — every postmortem must produce tracked, time-bound actions

## Key information

### 5-panel incident overview

```
┌──────────────────────────────────────────────────────────────────┐
│  INCIDENT FREQUENCY             │  SEVERITY DISTRIBUTION          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  This month:  8 ↓ 3     │   │  │  SEV0:  ▏ 1            │   │
│  │  Last month:  11        │   │  │  SEV1:  ▍ 3            │   │
│  │  3-month avg: 9.3       │   │  │  SEV2:  ▋ 5            │   │
│  │  Trend:      ↓ stable   │   │  │  SEV3:  █ 8            │   │
│  │  YoY:        ↓ 22%      │   │  │  SEV4:  ▂ 2            │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RESPONSE PERFORMANCE           │  ROOT CAUSE DISTRIBUTION        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  MTTA:  4 min (Elite)   │   │  │  Code:     ███ 32%     │   │
│  │  MTTR:  28 min (Elite)  │   │  │  Config:   ██ 22%     │   │
│  │  TTA:   8 min (Good)    │   │  │  Infra:    █▌ 15%     │   │
│  │  Trend:  ↓ 15% MoM      │   │  │  Deps:     █▌ 18%     │   │
│  │  On-call: 92% engaged   │   │  │  Human:    █ 8%       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Incident severity definitions

| Severity | Definition | Response SLA | Notification | Example |
|---|---|---|---|---|
| SEV0 | Complete service outage, data loss, security breach | Ack < 5 min, Resolve < 1 hour | Page on-call + escalate to EM | Payment service down, DB corruption |
| SEV1 | Core feature broken, no workaround, revenue impact | Ack < 15 min, Resolve < 4 hours | Page on-call | Login broken, checkout failure |
| SEV2 | Feature degraded, workaround exists | Ack < 30 min, Resolve < 24 hours | Notify on-call | Search slow, partial outage |
| SEV3 | Minor issue, low user impact | Ack < 2 hours, Resolve < 5 days | Create ticket | UI glitch, non-critical bug |
| SEV4 | Cosmetic, no user impact | Ack < 1 day, Next sprint | Backlog | Typo, minor style issue |

### Response performance metrics

| Metric | Definition | Elite | Good | Needs Improvement |
|---|---|---|---|---|
| MTTA (Mean Time to Acknowledge) | Alert fire → on-call acknowledges | < 5 min | 5-15 min | > 15 min |
| MTTR (Mean Time to Resolve) | Acknowledge → service restored | < 1 hour | 1-4 hours | > 4 hours |
| TTA (Time to Action) | Acknowledge → first meaningful action | < 10 min | 10-30 min | > 30 min |
| Escalation rate | % incidents requiring escalation | < 10% | 10-25% | > 25% |
| On-call engagement | % pages acknowledged within SLA | > 95% | 85-95% | < 85% |

### Root cause categories and systemic fixes

| Root cause | Current % | Target % | Systemic fix |
|---|---|---|---|
| Code logic error | 32% | < 25% | Stronger type systems, mutation testing, pre-production eval |
| Configuration error | 22% | < 10% | Config validation in CI, typed config schemas, canary config changes |
| Infrastructure failure | 15% | < 10% | Multi-AZ, auto-healing, chaos engineering |
| Dependency issue | 18% | < 10% | Circuit breakers, graceful degradation, dependency health checks |
| Human/process error | 8% | < 5% | Runbooks, automation, approval gates for risky operations |
| Unknown | 5% | < 5% | Better observability, distributed tracing |

### Detection source effectiveness

| Source | % Detected | MTTA | % False positives | Notes |
|---|---|---|---|---|
| Automated monitoring | 45% | 3 min | 8% | Primary detection mechanism |
| User/customer report | 25% | 45 min | 2% | Lagging indicator — users are your canary |
| Team member notice | 15% | 20 min | 5% | During business hours |
| External (vendor/partner) | 10% | 60 min | 3% | Dependency incidents |
| Scheduled test/drill | 5% | N/A | 0% | Proactive discovery |

### Postmortem quality tracking

| Metric | Target | Current |
|---|---|---|
| Postmortem completion rate (SEV0-SEV2) | 100% | 96% |
| Postmortem completed within 5 business days | > 90% | 87% |
| Action items per postmortem (avg) | 3-7 | 4.2 |
| Action item closure rate (30 days) | > 80% | 72% |
| Action item closure rate (90 days) | > 95% | 91% |
| Postmortem reviewed by independent team | 100% | 85% |

### Monthly incident trend (example)

| Month | SEV0 | SEV1 | SEV2 | SEV3 | Total | MTTR | Budget impact |
|---|---|---|---|---|---|---|---|
| Jan | 0 | 2 | 6 | 9 | 17 | 42 min | 12% |
| Feb | 1 | 3 | 5 | 7 | 16 | 38 min | 18% |
| Mar | 0 | 2 | 4 | 8 | 14 | 31 min | 8% |
| Apr | 0 | 1 | 5 | 10 | 16 | 35 min | 10% |
| May | 1 | 3 | 5 | 8 | 17 | 28 min | 22% |
| Jun | 0 | 2 | 3 | 6 | 11 | 25 min | 6% |
| Jul | 0 | 1 | 4 | 7 | 12 | 22 min | 5% |

## Action recommendations

1. **Track every incident**: no incident is too small to record; patterns emerge from aggregate data
2. **Reduce user-reported incidents**: target < 15% user-reported; each user report means monitoring missed it
3. **Postmortem for SEV0-SEV2**: every SEV0-SEV2 gets a blameless postmortem within 5 business days
4. **Action item accountability**: each postmortem action item has an owner and due date; track in sprint board
5. **Monthly incident review**: review all incidents with engineering leadership; identify top 3 systemic fixes
6. **Recurring root cause elimination**: if same root cause appears in 3+ incidents, it becomes a priority project
7. **On-call health**: monitor on-call engagement; if < 85%, investigate alert fatigue and team burnout
8. **Game day quarterly**: simulate SEV0 incident; measure actual MTTA/MTTR against targets



- Blame culture → postmortems that assign fault instead of finding systemic causes; adopt blameless postmortems
- No action items → postmortem written but no follow-through; every postmortem must produce actionable items
- Severity inflation → calling everything SEV1 to get attention; use clear severity definitions
- Ignoring near-misses → only tracking incidents that caused impact; near-misses are free learning opportunities
- MTTR gaming → "resolving" by restarting without root cause; restart is a mitigation, not a resolution

## Related

- Same class: [dashboard-system-health](../observability/dashboard-system-health.md) — system health and SLO compliance
- Same class: [dashboard-security-posture](../../engineer/quality-security/dashboard-security-posture.md) — security posture
- Downstream: [respond-to-an-incident](respond-to-an-incident.md) — incident response process
- Downstream: [incident-postmortem](../../engineer/lessons/failure-incident-postmortem.md) — postmortem template
- References: Google — *Site Reliability Engineering* (Chapter 15: Postmortem Culture); J. Paul Reed — *Beyond Blame*; John Allspaw — *Blameless Postmortems*