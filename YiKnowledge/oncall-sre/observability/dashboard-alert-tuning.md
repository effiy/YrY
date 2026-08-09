---
title: alert tuning and noise reduction dashboard
aliases:
- alert noise dashboard
- alert fatigue dashboard
- alert quality dashboard
- signal-to-noise dashboard
tags:
- dashboard
- alerting
- alert-fatigue
- noise-reduction
- signal-to-noise
- notification
- false-positive
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- oncall-sre
- tech-lead
- engineer
benefit: alert quality, noise reduction, and on-call effectiveness visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- alert volume, signal-to-noise, false positives, correlation, notification routing, and fatigue defined
related:
- ./dashboard-system-health.md
- ./dashboard-observability-coverage.md
- ../incident-response/dashboard-oncall-health.md
- ../incident-response/dashboard-incident-trends.md
- ../incident-response/dashboard-incident-command.md
tacit: false
---

# alert tuning and noise reduction dashboard

> **As an** SRE, **I want to** track alert quality and reduce noise, **so that** every alert demands action, on-call engineers are not desensitized by false alarms, and critical signals are never buried in the noise.

> Alert fatigue is the #1 cause of missed incidents. This dashboard tracks alert volume, signal-to-noise ratio, false positive rate, alert correlation, notification routing, and on-call engineer fatigue — turning alerting from a firehose of anxiety into a precise, trustworthy, continuously tuned signal detection system.

## Summary

- 6 alert tuning dimensions: alert volume, signal-to-noise, false positive rate, alert correlation, notification routing, fatigue impact
- 8,500 alerts/month across 42 services; 280 alerts/day average; 420 alert rules defined; 85 are "noisy" (> 50% false positive)
- Signal-to-noise ratio: 0.35 (35% of alerts are actionable; target > 60%); 65% of alerts are noise (false positive, duplicate, or informational)
- False positive rate: 42% (target < 15%); 8 alert rules account for 55% of all false positives; 12 rules have never fired a true positive
- Alert correlation: 38% of alerts are part of a correlated group; 850 alert storms (5+ correlated alerts) in 12 months; 22% of alert storms are cascading failures
- Notification routing: 72% of alerts routed correctly; 18% misrouted (wrong team, wrong severity); 10% of P1 alerts went to the wrong person
- Dashboard reviewed weekly; alert tuning sprint monthly with SRE and service owners

## Core viewpoints

- Every alert must demand action — if an alert fires and the correct response is "acknowledge and ignore," it's not an alert, it's a log entry; alerts should be actionable, not informational
- Alert fatigue is a systems problem, not a willpower problem — you can't "just pay more attention" to 280 alerts/day; the human brain treats alerts as background noise after the first dozen
- Signal-to-noise is a ratio, not a count — reducing alert volume without improving signal is just hiding the problem; the goal is to increase the numerator (true positives) while decreasing the denominator (total alerts)
- False positives are worse than no alerts — every false positive trains the on-call engineer to distrust the alerting system; a system that cries wolf is more dangerous than a system that's silent

## Key information

### 6-panel alert tuning overview

```
┌──────────────────────────────────────────────────────────────────┐
│  ALERT VOLUME                      │  SIGNAL-TO-NOISE                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Alerts/mo: 8,500        │   │  │  Signal-to-noise: 0.35   │   │
│  │  Alerts/day: 280 (avg)   │   │  │  Actionable: 35%          │   │
│  │  P1: 85/mo (1%)          │   │  │  Noise: 65%               │   │
│  │  P2: 580/mo (7%)         │   │  │  Duplicate: 18%           │   │
│  │  P3: 2,200/mo (26%)      │   │  │  False positive: 42%      │   │
│  │  P4/Warning: 5,635 (66%) │   │  │  Informational: 5%        │   │
│  │  After-hours: 2,200/mo   │   │  │  SNR trend: ↑ (was 0.28)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  FALSE POSITIVE ANALYSIS           │  ALERT CORRELATION                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  FP rate: 42%            │   │  │  Correlated: 38%          │   │
│  │  Top 8 rules: 55% of FP  │   │  │  Alert storms/yr: 850     │   │
│  │  Never-fired true: 12    │   │  │  Cascading: 22% of storms │   │
│  │  FP cost: 85 hrs/mo      │   │  │  Avg storm size: 12 alerts│   │
│  │  FP→rule fix: 22 days    │   │  │  Storm duration: 8 min    │   │
│  │  Rules tuned/mo: 18      │   │  │  Correlation engine: 65%  │   │
│  │  FP score: D (45)        │   │  │  Correlation score: C+    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  NOTIFICATION ROUTING              │  FATIGUE IMPACT                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Correct routing: 72%    │   │  │  Alerts/on-call/day: 42  │   │
│  │  Misrouted: 18%          │   │  │  Pages after-hours: 2.8  │   │
│  │  Wrong team: 10%         │   │  │  Ack time (fatigued):+85%│   │
│  │  Wrong severity: 8%      │   │  │  Missed alerts: 12/yr    │   │
│  │  Escalation needed: 12%  │   │  │  Alert burnout: 22%      │   │
│  │  Notification latency:3s │   │  │  Alert trust: 58/100     │   │
│  │  Routing score: B-       │   │  │  Fatigue score: C+       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Alert volume by severity

| Severity | Alerts/month | Alerts/day | % of total | Actionable | Noise % | After-hours | Trend |
|---|---|---|---|---|---|---|---|
| **P1 (Critical)** | 85 | 2.8 | 1% | 92% | 8% | 28 (33%) | → |
| **P2 (Warning)** | 580 | 19.3 | 7% | 72% | 28% | 145 (25%) | ↓ |
| **P3 (Info)** | 2,200 | 73.3 | 26% | 38% | 62% | 420 (19%) | → |
| **P4 (Debug/Noise)** | 5,635 | 187.8 | 66% | 8% | 92% | 1,610 (29%) | ↑ |
| **Total** | **8,500** | **283.3** | | **35%** | **65%** | **2,203 (26%)** | |

### Alert volume by service

| Service | Alerts/mo | % of total | Actionable % | P1 alerts | Top alert rule | Noise trend |
|---|---|---|---|---|---|---|
| **API Gateway** | 1,250 | 14.7% | 28% | 12 | Rate limit threshold (85% FP) | ↑ |
| **Database (primary)** | 980 | 11.5% | 45% | 8 | Connection pool utilization (60% FP) | → |
| **Payment service** | 820 | 9.6% | 52% | 15 | 3rd-party latency (38% FP) | → |
| **Auth service** | 720 | 8.5% | 38% | 5 | LDAP connection timeout (55% FP) | ↓ |
| **Search service** | 650 | 7.6% | 32% | 3 | Indexing lag (72% FP) | ↑ |
| **Message queue** | 580 | 6.8% | 48% | 2 | Queue depth (25% FP) | → |
| **CDN** | 520 | 6.1% | 55% | 8 | Origin response time (30% FP) | ↓ |
| **Cache (Redis)** | 480 | 5.6% | 18% | 0 | Memory usage (90% FP) | ↑ |
| **File storage** | 420 | 4.9% | 42% | 1 | Throughput limit (45% FP) | → |
| **Other (32 services)** | 2,080 | 24.5% | 38% | 31 | Various | → |
| **Total** | **8,500** | | **35%** | **85** | | |

### Signal-to-noise ratio by service

| Service | Total alerts | True positive | False positive | Duplicate | Informational | SNR | Grade |
|---|---|---|---|---|---|---|---|
| **API Gateway** | 1,250 | 350 (28%) | 525 (42%) | 225 (18%) | 150 (12%) | 0.39 | D |
| **Database** | 980 | 441 (45%) | 294 (30%) | 196 (20%) | 49 (5%) | 0.82 | C+ |
| **Payment** | 820 | 426 (52%) | 246 (30%) | 98 (12%) | 50 (6%) | 1.08 | B- |
| **Auth** | 720 | 274 (38%) | 288 (40%) | 108 (15%) | 50 (7%) | 0.61 | D+ |
| **Search** | 650 | 208 (32%) | 325 (50%) | 78 (12%) | 39 (6%) | 0.47 | D |
| **Message queue** | 580 | 278 (48%) | 174 (30%) | 87 (15%) | 41 (7%) | 0.92 | C+ |
| **CDN** | 520 | 286 (55%) | 156 (30%) | 52 (10%) | 26 (5%) | 1.22 | B- |
| **Cache** | 480 | 86 (18%) | 336 (70%) | 48 (10%) | 10 (2%) | 0.22 | F |
| **File storage** | 420 | 176 (42%) | 168 (40%) | 63 (15%) | 13 (3%) | 0.72 | D+ |
| **Overall** | **8,500** | **2,975 (35%)** | **3,570 (42%)** | **1,530 (18%)** | **425 (5%)** | **0.35** | **D+** |

### Top false positive alert rules

| Alert rule | Service | Alerts/mo | FP rate | True positives | False positives | FP cost (hrs/mo) | Root cause | Action |
|---|---|---|---|---|---|---|---|---|
| **Redis memory usage > 80%** | Cache | 420 | 90% | 42 | 378 | 18.5 hrs | Threshold too low, normal spikes | Raise to 90%, add 5-min sustained |
| **Rate limit threshold reached** | API GW | 380 | 85% | 57 | 323 | 15.2 hrs | Threshold matches normal bursts | Raise limit, per-endpoint thresholds |
| **Indexing lag > 30s** | Search | 280 | 72% | 78 | 202 | 10.8 hrs | Normal during batch indexing | Increase to 120s, suppress during batch |
| **CPU usage > 70%** (non-prod) | Platform | 250 | 88% | 30 | 220 | 8.5 hrs | Non-prod build spikes | Remove non-prod CPU alerts entirely |
| **LDAP connection timeout** | Auth | 220 | 55% | 99 | 121 | 6.2 hrs | Network jitter, not actual timeout | Add 3 consecutive failures requirement |
| **Connection pool > 80%** | DB | 200 | 60% | 80 | 120 | 5.8 hrs | Normal peak usage | Raise to 90%, add connection wait time |
| **Disk usage > 75%** | Infra | 180 | 65% | 63 | 117 | 4.5 hrs | Log rotation not keeping up | Fix log rotation, raise to 85% |
| **Health check flap** | Various | 150 | 80% | 30 | 120 | 3.8 hrs | 1-second interval too aggressive | Increase to 5s, 3 failures |

### Never-fired-true alert rules

| Alert rule | Service | Created | Alerts fired | All false positive | Last reviewed | Action |
|---|---|---|---|---|---|---|
| **Memory leak detection** | API GW | 2025-06 | 185 | 185 (100%) | Never | Remove or rewrite with actual leak detection |
| **Dead letter queue > 0** | Queue | 2025-03 | 420 | 420 (100%) | 2025-03 | Change to DLQ > 10 in 5 min |
| **Cache miss rate > 50%** | Cache | 2025-09 | 320 | 320 (100%) | 2025-09 | Normal during deployments, suppress then |
| **WebSocket disconnect spike** | Real-time | 2025-11 | 95 | 95 (100%) | 2025-11 | Expected during deploy, add deploy suppress |
| **GraphQL query complexity** | GraphQL | 2026-01 | 62 | 62 (100%) | 2026-01 | Threshold too low, recalibrate |
| **SSL handshake time** | CDN | 2025-08 | 180 | 180 (100%) | Never | 0.1s threshold too aggressive, raise to 0.5s |
| **DB replication lag > 1s** | DB | 2025-04 | 340 | 340 (100%) | 2025-04 | Normal during backups, add backup suppress |
| **Pod restart count** | K8s | 2025-07 | 520 | 520 (100%) | Never | Normal OOM restarts, change to crash loop only |
| **File descriptor usage** | All | 2025-05 | 280 | 280 (100%) | 2025-05 | Normal growth, change to rate of growth |
| **DNS resolution time** | Network | 2025-10 | 145 | 145 (100%) | 2025-10 | 10ms threshold too low, raise to 50ms |
| **Garbage collection pause** | JVM svcs | 2025-02 | 220 | 220 (100%) | Never | Normal GC pauses, alert on > 5s only |
| **Circuit breaker half-open** | Mesh | 2025-12 | 88 | 88 (100%) | 2025-12 | Informational, change to P4 or remove |

### Alert correlation

| Correlation metric | Current | 3 months ago | Target | Notes |
|---|---|---|---|---|
| **Alerts in correlated groups** | 38% | 32% | > 60% | 3,230 alerts/mo part of a group |
| **Alert storms** (5+ correlated) | 850/yr | 920/yr | < 500/yr | 71/month average |
| **Average storm size** | 12 alerts | 14 alerts | < 5 alerts | Some storms > 50 alerts |
| **Storm duration** | 8 min avg | 10 min | < 3 min | Time from first to last alert in storm |
| **Cascading failure %** | 22% | 25% | < 10% | Alerts caused by other alerts |
| **Correlation engine accuracy** | 65% | 58% | > 85% | 35% of correlations are wrong |
| **Correlation reduction** | 15% | 10% | > 40% | % of alerts suppressed by correlation |
| **Overall correlation score** | **C+ (68)** | **C (62)** | **B+ (85)** | |

### Top alert storms (last 3 months)

| Storm | Date | Alerts | Services | Root cause | Duration | Cascading | Could correlation prevent? |
|---|---|---|---|---|---|---|---|
| DB connection pool exhaustion | 2026-07-28 | 48 | 8 | Connection leak in new deploy | 12 min | Yes (85% cascading) | Yes — single DB alert would suffice |
| CDN origin failure | 2026-07-15 | 35 | 6 | Origin shield misconfiguration | 8 min | Yes (72% cascading) | Yes — CDN origin alert is root |
| Kubernetes node failure | 2026-06-28 | 52 | 12 | Node OOM, pods rescheduled | 15 min | Yes (90% cascading) | Yes — node failure alert is root |
| Payment gateway timeout | 2026-06-15 | 28 | 5 | 3rd-party API degradation | 22 min | Yes (60% cascading) | Partial — external, hard to correlate |
| DNS resolution failure | 2026-05-20 | 42 | 15 | Internal DNS cache poisoning | 18 min | Yes (95% cascading) | Yes — DNS alert is the root |
| Redis memory pressure | 2026-05-05 | 18 | 4 | Memory fragmentation | 5 min | Yes (55% cascading) | Yes — single Redis alert |

### Notification routing

| Routing metric | Current | Target | Notes |
|---|---|---|---|
| **Correctly routed** | 72% | > 95% | Alert goes to the right team, right severity |
| **Misrouted — wrong team** | 10% | < 2% | Alert went to team that doesn't own the service |
| **Misrouted — wrong severity** | 8% | < 3% | P2 alert that should be P3 or vice versa |
| **Misrouted — wrong person** | 5% | < 1% | Within correct team but wrong on-call rotation |
| **Escalation needed** (not auto-escalated) | 12% | < 5% | Alert should have escalated but didn't |
| **Notification latency** | 3.0s avg | < 1s | Time from alert fire to notification delivery |
| **Notification delivery rate** | 99.5% | 99.9% | 0.5% of notifications not delivered |
| **Overall routing score** | **B- (72)** | **A (92)** | |

### Routing errors by service

| Service | Alerts/mo | Correct route | Wrong team | Wrong severity | Wrong person | Top routing error |
|---|---|---|---|---|---|---|
| **API Gateway** | 1,250 | 72% | 12% | 10% | 6% | Rate limit → wrong team (should be API, goes to Network) |
| **Database** | 980 | 82% | 5% | 8% | 5% | Replication lag → wrong severity (should be P2, marked P1) |
| **Payment** | 820 | 78% | 8% | 8% | 6% | 3rd-party timeout → wrong team (should be Payment, goes to SRE) |
| **Auth** | 720 | 75% | 10% | 10% | 5% | LDAP timeout → wrong team (should be Auth, goes to Network) |
| **CDN** | 520 | 68% | 15% | 10% | 7% | Cache hit rate → wrong team (should be CDN, goes to App) |
| **Kubernetes** | 350 | 58% | 25% | 12% | 5% | Pod OOM → wrong team (should be service owner, goes to Platform) |

### Alert fatigue impact

| Fatigue metric | Current | 6 months ago | Target | Notes |
|---|---|---|---|---|
| **Alerts per on-call engineer per day** | 42 | 48 | < 15 | 8-hour shift: 5+ alerts/hour |
| **After-hours pages per night** | 2.8 | 3.2 | < 1 | 2.8 wake-ups per on-call night |
| **Ack time (fresh)** | 2.5 min | 3.0 min | < 3 min | First 2 hours of shift |
| **Ack time (fatigued)** | 4.6 min | 5.5 min | < 3 min | Last 2 hours of shift (+85%) |
| **Missed alerts** (not acked > 10 min) | 12/yr | 18/yr | 0 | 12 alerts escalated because primary missed |
| **Alert trust survey** | 58/100 | 52/100 | > 80 | "I trust that alerts are actionable" |
| **On-call stress score** | 72/100 | 76/100 | < 50 | Self-reported stress during on-call |
| **Alert burnout risk** | 22% | 28% | < 10% | Engineers showing signs of alert burnout |
| **Overall fatigue score** | **C+ (65)** | **D+ (55)** | **B+ (85)** | |

### Alert rule lifecycle

| Lifecycle stage | Rules | % | Avg age | Review cycle | Action |
|---|---|---|---|---|---|
| **Active (healthy)** | 245 | 58% | 8 months | < 90 days | Maintain |
| **Active (noisy)** | 85 | 20% | 14 months | > 180 days | Tune or suppress |
| **Active (unreviewed > 6 mo)** | 48 | 11% | 22 months | Never reviewed | Immediate review |
| **Never fired** | 22 | 5% | 18 months | Never | Evaluate need, remove or adjust |
| **Never fired true** | 12 | 3% | 15 months | Never | Remove or rewrite |
| **Deprecated (service retired)** | 8 | 2% | 28 months | N/A | Delete immediately |
| **Total** | **420** | | **12 months avg** | | |

## Action recommendations

1. **Top-8 FP rules elimination**: 55% of all false positives from 8 rules; tune each rule within 2 weeks, target 50% reduction in total false positives
2. **Never-fired-true rule removal**: 12 rules with 0 true positives, 2,855 false positives/month; remove or rewrite all 12, save 38 hrs/mo of on-call time
3. **Redis cache alert overhaul**: 90% FP rate, 0.22 SNR (F grade); complete redesign of cache alerting with realistic thresholds and sustained-duration requirements
4. **Non-production alert suppression**: 250 non-prod CPU alerts/month (88% FP); remove all non-production alerts or route to separate non-critical channel
5. **Alert correlation improvement**: 38% correlation, 65% accuracy; implement topology-aware correlation engine, target 60% correlation and 85% accuracy
6. **Notification routing audit**: 28% misrouted; audit all alert routing rules, update service ownership, implement automated routing validation
7. **Alert storm reduction**: 850 storms/year, avg 12 alerts; implement root-cause alert grouping, suppress cascading alerts within 2 minutes of root alert
8. **After-hours page reduction**: 2.8 pages/night; batch non-urgent alerts to business hours, implement alert snooze for known maintenance windows
9. **Alert rule lifecycle management**: 20% of rules noisy, 11% unreviewed > 6 months; implement mandatory 90-day rule review cycle, auto-flag rules for review
10. **Weekly alert tuning review**: review alert volume, SNR, FP rate, top noisy rules, correlation effectiveness, and fatigue metrics with SRE and service owners



- Alerting on everything → "we'll add an alert just in case"; every alert has a cost — the on-call engineer's attention, sleep, and trust in the system; alert only on what requires human action
- Copy-paste thresholds → using the same "> 80% CPU" threshold for every service without understanding the baseline; thresholds should be service-specific, derived from historical data, and reviewed monthly
- The PagerDuty firehose → routing every alert to the on-call engineer without filtering, correlation, or suppression; the on-call engineer is not a human log processor — they're a decision-maker
- Alert and forget → creating an alert rule and never revisiting it; alert rules accrue drift just like code — what was a good threshold 12 months ago may be noise today
- Severity inflation → marking everything as P1 "to be safe"; when everything is critical, nothing is — severity should reflect impact, not anxiety

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-observability-coverage](dashboard-observability-coverage.md) — observability coverage
- Same class: [dashboard-oncall-health](../incident-response/dashboard-oncall-health.md) — on-call health
- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident trends
- Same class: [dashboard-incident-command](../incident-response/dashboard-incident-command.md) — incident command
- References: Google SRE — *Chapter 6: Monitoring Distributed Systems*; Rob Ewaschuk — *My Philosophy on Alerting*; PagerDuty — *Alert Noise Reduction Guide*; Cindy Sridharan — *Monitoring in the Time of Cloud Native*; Baron Schwartz — *Alerting on Latency and Error Budgets*