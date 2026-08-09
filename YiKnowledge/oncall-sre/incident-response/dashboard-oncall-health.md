---
title: on-call health dashboard
aliases:
- oncall dashboard
- on-call burden dashboard
- alert fatigue dashboard
- on-call rotation dashboard
tags:
- dashboard
- on-call
- oncall
- alert-fatigue
- rotation
- pager
category: oncall-sre/incident-response
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- oncall-sre
- tech-lead
- engineer
benefit: on-call health and alert burden visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-incident-trends.md
- ./respond-to-an-incident.md
- ../observability/dashboard-system-health.md
- ../../engineer/process/monitoring-governance.md
tacit: false
---

# on-call health dashboard

> **As a** sre, **I want to** track on-call health and alert burden across all rotations, **so that** on-call burnout is prevented and alert quality continuously improves.

> On-call health is the single best predictor of team retention. This dashboard tracks on-call burden, alert fatigue, rotation health, pager load, and quality of life.

## Summary

- 5 on-call dimensions: on-call burden, alert fatigue, rotation health, pager load analysis, quality of life
- On-call burden measured by pages per shift, after-hours pages, and time-to-acknowledge
- Alert fatigue tracked via false positive rate, alert-to-action ratio, and noise trends
- Rotation health assessed by rotation coverage, handoff quality, and escalation path effectiveness
- Dashboard reviewed monthly; on-call survey quarterly

## Core viewpoints

- On-call burnout is the #1 cause of SRE attrition — if on-call is painful, your best people will leave
- Every page is an interruption — a page at 3am costs 4+ hours of productivity the next day
- Alert fatigue is a downward spiral — noisy alerts → ignored alerts → missed real incidents → more alerts
- On-call is a team responsibility, not an individual burden — if one person bears the weight, the system is broken

## Key information

### 5-panel on-call overview

```
┌──────────────────────────────────────────────────────────────────┐
│  ON-CALL BURDEN                  │  ALERT FATIGUE                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Pages/shift: 3.2 avg   │   │  │  False positive: 12%     │   │
│  │  After-hours: 42%       │   │  │  Alert-to-action: 28%    │   │
│  │  MTTA:        4.2 min   │   │  │  Noise alerts:   45/day  │   │
│  │  Weekend:     18%       │   │  │  Actionable:     18/day  │   │
│  │  Burnout risk: 1 person │   │  │  Silence ratio:  2.5x    │   │
│  │  Max shift:    8 pages  │   │  │  Tuned this mo:  12      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ROTATION HEALTH                 │  PAGER LOAD ANALYSIS           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Rotations:  4 active   │   │  │  Total pages: 285/mo    │   │
│  │  Coverage:   24/7 ✅    │   │  │  Day (8-18):   45%      │   │
│  │  Handoff:    92% score  │   │  │  Evening:      32%      │   │
│  │  Escalation: 95% clear  │   │  │  Night (22-8): 23%      │   │
│  │  Shadow:     2 active   │   │  │  Sev 0-1:      8%       │   │
│  │  Gap:        0 hours    │   │  │  Auto-resolved: 35%     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### On-call burden by rotation

| Rotation | Team size | Pages/shift | After-hours % | Weekend % | MTTA | Burnout risk |
|---|---|---|---|---|---|---|
| Platform/Infra | 5 | 5.2 | 48% | 22% | 3.8 min | Medium (1 person) |
| AI/ML | 8 | 1.8 | 35% | 12% | 5.2 min | Low |
| Web Frontend | 6 | 2.4 | 40% | 15% | 4.5 min | Low |
| Security | 2 | 1.2 | 55% | 25% | 4.0 min | Medium (small team) |
| **Overall** | **21** | **3.2** | **42%** | **18%** | **4.2 min** | |

### On-call burden thresholds

| Metric | Healthy | Concerning | Dangerous | Current |
|---|---|---|---|---|
| Pages per shift (avg) | < 3 | 3-6 | > 6 | 3.2 |
| After-hours page % | < 30% | 30-50% | > 50% | 42% |
| Weekend page % | < 15% | 15-25% | > 25% | 18% |
| Max pages in one shift | < 10 | 10-20 | > 20 | 8 |
| MTTA (minutes) | < 5 | 5-15 | > 15 | 4.2 |
| Consecutive shifts with pages | < 5 | 5-10 | > 10 | 4 |

### Alert fatigue indicators

| Metric | Current | Target | Trend | Status |
|---|---|---|---|---|
| False positive rate | 12% | < 10% | ↓ 2% | Yellow |
| Alert-to-action ratio | 28% | > 40% | ↑ 3% | Yellow |
| Noise alerts per day | 45 | < 30 | ↓ 8 | Yellow |
| Actionable alerts per day | 18 | 15-25 | → stable | Green |
| Silence ratio (noise:action) | 2.5:1 | < 2:1 | ↓ 0.3 | Yellow |
| Alerts tuned this month | 12 | > 10 | ↑ | Green |
| Alerts with runbooks | 78% | > 90% | ↑ 5% | Yellow |

### Alert classification

| Alert category | Count/day | % of total | Actionable? | Avg MTTA | Has runbook? |
|---|---|---|---|---|---|
| CPU threshold | 8 | 12.7% | 25% | 5.2 min | 60% |
| Memory threshold | 5 | 7.9% | 20% | 4.8 min | 50% |
| Disk space | 3 | 4.8% | 60% | 3.5 min | 85% |
| Error rate spike | 12 | 19.0% | 45% | 3.2 min | 90% |
| Latency spike | 8 | 12.7% | 35% | 4.0 min | 80% |
| Health check fail | 15 | 23.8% | 15% | 2.8 min | 70% |
| Certificate expiry | 2 | 3.2% | 100% | 2.0 min | 100% |
| Dependency down | 5 | 7.9% | 80% | 5.5 min | 75% |
| Custom business metric | 5 | 7.9% | 40% | 6.0 min | 65% |
| **Total** | **63** | | **28% action** | | **78% runbook** |

### Alert noise reduction plan

| Alert | Current/day | Issue | Fix | Estimated reduction |
|---|---|---|---|---|
| Health check flapping | 15/day | 85% false positive | Increase threshold, add retry | -12/day |
| CPU threshold | 8/day | 75% false positive | Raise threshold, use sustained | -6/day |
| Memory threshold | 5/day | 80% false positive | Tune based on actual usage | -4/day |
| Latency spike | 8/day | 65% false positive | Use P95 instead of avg, longer window | -3/day |
| **Total noise reduction** | | | | **-25/day (55%)** |

### Rotation health

| Rotation | Members | Shadow | Schedule | Handoff score | Escalation clarity | Coverage gaps |
|---|---|---|---|---|---|---|
| Platform/Infra | 5 | 1 | Weekly | 90% | 95% | 0 hours |
| AI/ML | 8 | 1 | Weekly | 95% | 100% | 0 hours |
| Web Frontend | 6 | 0 | Weekly | 88% | 90% | 0 hours |
| Security | 2 | 0 | Weekly | 92% | 95% | 0 hours |

### Handoff quality assessment

| Component | % Complete | Target |
|---|---|---|
| Current incidents status | 95% | 100% |
| Ongoing investigations | 88% | 90% |
| Known issues/watchlist | 82% | 85% |
| Recent changes/deployments | 90% | 90% |
| Upcoming maintenance | 95% | 95% |
| Escalation contacts | 100% | 100% |
| **Overall handoff score** | **92%** | **> 90%** |

### Pager load by hour of day

```
Pages per hour (30-day average)

  3.0 │
      │
  2.5 │              ▄▄
      │              ██
  2.0 │         ▄▄   ██   ▄▄
      │    ▄▄   ██   ██   ██
  1.5 │    ██   ██   ██   ██
      │    ██   ██   ██   ██   ▄▄
  1.0 │ ▄▄ ██   ██   ██   ██   ██
      │ ██ ██   ██   ██   ██   ██   ▄▄
  0.5 │ ██ ██   ██   ██   ██   ██   ██
      │ ██ ██   ██   ██   ██   ██   ██
  0.0 └─────────────────────────────────
      0  2  4  6  8  10 12 14 16 18 20 22
              Hour of Day

Peak: 10-12 (deploy window), 14-16 (peak traffic)
Trough: 2-6 (lowest traffic)
```

### On-call quality of life survey

| Question | Score (1-5) | Trend | Concern |
|---|---|---|---|
| I feel the on-call load is fair | 3.5 | ↑ | Platform team at 5.2 pages/shift |
| Alerts I receive are actionable | 2.8 | ↑ | 28% alert-to-action ratio |
| I have clear runbooks for most alerts | 3.8 | ↑ | 78% runbook coverage |
| Handoffs are thorough and helpful | 4.2 | → | |
| I can disconnect during off-hours | 3.2 | ↑ | 42% after-hours pages |
| On-call doesn't affect my work-life balance | 3.0 | → | 18% weekend pages |
| I feel supported when I escalate | 4.5 | → | |
| **Overall on-call satisfaction** | **3.6** | ↑ | |

### On-call compensation and support

| Support mechanism | Current | Industry standard |
|---|---|---|
| On-call pay (weekly stipend) | $350/week | $200-500/week |
| Time-off-in-lieu (per page after-hours) | 0.5 day | 0.5-1 day |
| Max consecutive on-call weeks | 1 | 1-2 |
| Min gap between rotations | 3 weeks | 2-4 weeks |
| Therapy/wellness benefit | Yes | Growing trend |
| On-call training program | Yes | Industry leading |

## Action recommendations

1. **Reduce noise alerts by 55%**: implement the noise reduction plan (health check flapping, CPU/memory thresholds); target < 30 noise/day
2. **Address Platform team burden**: 5.2 pages/shift is concerning; redistribute load or add 1 more team member to rotation
3. **Improve alert-to-action ratio**: 28% → 40%; every alert below 20% actionability should be tuned or removed
4. **Increase runbook coverage**: 78% → 90%; every alert without a runbook gets one within 30 days
5. **Security team rotation**: 2-person rotation is fragile; cross-train 1 engineer from Platform team
6. **Quarterly on-call survey**: track satisfaction trends; if overall score drops below 3.5, initiate on-call health review
7. **After-hours page reduction**: 42% is too high; identify top 3 after-hours alert sources and fix them
8. **On-call shadow program**: 2 shadows active is good; ensure every new team member shadows before joining rotation



- On-call hero culture → celebrating the person who gets the most pages; heroes burn out fastest
- Alert snooze → silencing alerts without fixing them; snoozed alerts are future incidents
- No on-call rotation → same person always on-call; rotation is mandatory for sustainable operations
- Runbook as afterthought → "we'll write the runbook after the incident"; runbooks must exist before the page
- Ignoring on-call survey → surveying but not acting on feedback; each survey must produce at least 2 improvements

## Related

- Same class: [dashboard-incident-trends](./dashboard-incident-trends.md) — incident trends
- Same class: [dashboard-system-health](../observability/dashboard-system-health.md) — system health
- Downstream: [respond-to-an-incident](./respond-to-an-incident.md) — incident response
- Downstream: [monitoring-governance](../../engineer/process/monitoring-governance.md) — monitoring governance
- References: Google — *SRE Workbook* (On-call chapter); PagerDuty — *State of On-call*; Charity Majors — *On-call Doesn't Have to Suck*