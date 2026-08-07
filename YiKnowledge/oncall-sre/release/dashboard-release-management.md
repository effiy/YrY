---
title: release management dashboard
aliases:
- release dashboard
- deployment dashboard
- release health dashboard
- release metrics dashboard
tags:
- dashboard
- release
- deployment
- canary
- rollback
- hotfix
- release-freeze
category: oncall-sre/release
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
- product-manager
benefit: release pipeline health and deployment risk visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- release.md
- canary-release.md
- hotfix-release.md
- rollback-drill.md
- release-freeze.md
- ../observability/dashboard-system-health.md
tacit: false
---

# release management dashboard

> **As a** sre, **I want to** track release pipeline health and deployment risk across all services, **so that** release failures are minimized and recovery is fast when they occur.

> Release management is the bridge between development and production. This dashboard tracks release cadence, success rate, rollback frequency, hotfix volume, and freeze compliance.

## Summary

- 5 release dimensions: release cadence and volume, release success and failure, rollback and recovery, hotfix management, release freeze compliance
- Release tracked per service, per environment, with success/failure/rollback outcomes
- Canary progression: 1% → 10% → 50% → 100% with health gates at each stage
- Hotfix tracked separately from regular releases; hotfix frequency is a reliability signal
- Dashboard refreshes per release; weekly release review; quarterly release health audit

## Core viewpoints

- Every release should be rollbackable — if you can't rollback, you can't deploy with confidence
- Hotfix frequency is a quality metric — too many hotfixes means the regular release process is broken
- Release freeze compliance is non-negotiable — a freeze violation during a critical period is a SEV2 incident
- Canary duration is proportional to risk — higher-risk changes need longer canary observation

## Key information

### 5-panel release overview

```
┌──────────────────────────────────────────────────────────────────┐
│  RELEASE CADENCE & VOLUME        │  RELEASE SUCCESS & FAILURE      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  This week:  18 releases│   │  │  Success:  94.5% ████▌  │   │
│  │  This month: 72 releases│   │  │  Failed:    3.0% ▏      │   │
│  │  Regular:    85%        │   │  │  Rollback:  2.5% ▏      │   │
│  │  Hotfix:     8%         │   │  │  Canary catch: 82%      │   │
│  │  Emergency:  2%         │   │  │  Mean detect: 4.2 min   │   │
│  │  Rollback:   5%         │   │  │  Rollback: 100% success  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ROLLBACK & RECOVERY            │  HOTFIX MANAGEMENT              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Rollbacks:   2 this wk │   │  │  Hotfixes:    6/mo      │   │
│  │  Time-to-rollback: 3min │   │  │  Mean time:   2.8h      │   │
│  │  Recovery:    100%      │   │  │  Post-fix:    100%      │   │
│  │  Drill:       Aug 15    │   │  │  Root cause:  85%       │   │
│  │  Last drill:  May 15    │   │  │  Backport:    72%       │   │
│  │  Drill score: 92/100    │   │  │  Process gap: 2 found   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Release cadence by service (last 30 days)

| Service | Regular | Hotfix | Emergency | Rollback | Total | Avg/day |
|---|---|---|---|---|---|---|
| api-gateway | 8 | 1 | 0 | 0 | 9 | 0.3 |
| user-service | 6 | 0 | 0 | 0 | 6 | 0.2 |
| ai-chat | 12 | 2 | 1 | 1 | 16 | 0.5 |
| search-service | 5 | 0 | 0 | 0 | 5 | 0.2 |
| payment-service | 3 | 0 | 0 | 0 | 3 | 0.1 |
| notification-svc | 4 | 1 | 0 | 0 | 5 | 0.2 |
| rag-service | 8 | 1 | 0 | 1 | 10 | 0.3 |
| analytics-svc | 4 | 0 | 0 | 0 | 4 | 0.1 |
| web-frontend | 18 | 2 | 0 | 0 | 20 | 0.7 |
| mobile-app | 4 | 0 | 0 | 0 | 4 | 0.1 |
| **Total** | **72** | **7** | **1** | **2** | **82** | |

### Release success breakdown

| Outcome | Count | % | Definition |
|---|---|---|---|
| Success (no issues) | 68 | 82.9% | Deployed, canary passed, no alerts |
| Success (minor issues) | 8 | 9.8% | Deployed, minor alerts, self-healed |
| Canary catch (halted) | 2 | 2.4% | Halted at canary stage, no production impact |
| Failed (remediated) | 2 | 2.4% | Failed in production, fixed forward |
| Rollback | 2 | 2.4% | Failed in production, rolled back |
| **Total** | **82** | | |

### Canary progression health

| Stage | Traffic % | Duration | Health check | Pass rate | Action on fail |
|---|---|---|---|---|---|
| Stage 1 | 1% | 30 min | Error rate, latency P95 | 98.5% | Auto-rollback |
| Stage 2 | 10% | 2 hours | Error rate, latency, CPU, memory | 96.2% | Pause, investigate |
| Stage 3 | 50% | 24 hours | Full golden signals + business metrics | 94.8% | Halt, manual review |
| Stage 4 | 100% | Continuous | Standard monitoring | 100% | Standard incident response |

### Canary health gate details

| Gate | Metrics checked | Threshold | Window | Auto-action |
|---|---|---|---|---|
| Gate 1 (1%) | Error rate, P95 latency | > 2x baseline | 30 min | Auto-rollback within 2 min |
| Gate 2 (10%) | Error rate, P95 latency, CPU, memory | > 1.5x baseline | 2 hours | Pause, notify on-call |
| Gate 3 (50%) | Golden signals + business metrics | Any regression | 24 hours | Halt, manual review |
| Gate 4 (100%) | Standard monitoring | Per SLO | Continuous | Standard incident |

### Rollback metrics

| Metric | Current | Target | Status |
|---|---|---|---|
| Rollback rate | 2.4% | < 5% | Green |
| Time-to-detect failure | 4.2 min | < 5 min | Green |
| Time-to-decide rollback | 2.1 min | < 3 min | Green |
| Time-to-execute rollback | 3.0 min | < 5 min | Green |
| Total time-to-recovery | 9.3 min | < 15 min | Green |
| Rollback success rate | 100% | 100% | Green |
| Automated rollback % | 60% | > 80% | Yellow |

### Hotfix analysis

| Month | Hotfixes | % of total releases | Mean time to deploy | Root cause found | Backport completed |
|---|---|---|---|---|---|
| Jan | 5 | 8.2% | 3.2 hours | 80% | 60% |
| Feb | 4 | 6.5% | 2.8 hours | 85% | 65% |
| Mar | 8 | 11.2% | 3.5 hours | 78% | 58% |
| Apr | 6 | 9.0% | 2.9 hours | 82% | 62% |
| May | 5 | 7.5% | 2.6 hours | 85% | 68% |
| Jun | 7 | 9.8% | 2.4 hours | 88% | 72% |
| Jul | 6 | 8.3% | 2.2 hours | 90% | 75% |
| **Trend** | ↓ | ↓ | ↓ | ↑ | ↑ |

### Hotfix root cause categories

| Root cause | % | Systemic fix |
|---|---|---|
| Edge case not covered by tests | 35% | Add edge case to test suite |
| Configuration error | 22% | Config validation in CI |
| Dependency issue | 18% | Dependency update tests |
| Race condition | 12% | Concurrency testing |
| Data migration issue | 8% | Migration dry-run |
| Unknown | 5% | Better observability |

### Release freeze calendar

| Freeze period | Start | End | Reason | Services affected |
|---|---|---|---|---|
| Chinese New Year | Jan 25 | Feb 5 | Reduced staff | All production |
| Qingming Festival | Apr 3 | Apr 6 | Holiday | All production |
| Labor Day | Apr 30 | May 4 | Holiday | All production |
| Mid-year Review | Jun 28 | Jul 2 | Executive review | All production |
| National Day | Sep 30 | Oct 7 | Holiday | All production |
| Black Friday | Nov 25 | Nov 28 | Peak traffic | Payment, checkout |
| Christmas/New Year | Dec 22 | Jan 2 | Reduced staff | All production |

### Freeze compliance

| Freeze period | Total releases | Violations | Emergency exceptions | Compliance |
|---|---|---|---|---|
| 2026 Labor Day | 0 | 0 | 0 | 100% |
| 2026 Mid-year | 2 | 0 | 2 (approved) | 100% |
| 2025 National Day | 1 | 0 | 1 (approved) | 100% |
| 2025 Christmas | 0 | 0 | 0 | 100% |

### Release lead time breakdown

| Stage | Duration | % of total | Trend |
|---|---|---|---|
| Code review | 3.2 hours | 28% | ↓ |
| CI pipeline | 15.5 min | 2% | ↓ |
| Staging validation | 2.5 hours | 22% | → |
| Canary stage 1-2 | 2.5 hours | 22% | → |
| Canary stage 3 | 24 hours | 85%* | → |
| Full rollout | 1.2 hours | 10% | → |
| **Total (to 100%)** | **~34 hours** | | |

*Stage 3 is 24 hours by design for high-risk changes; low-risk changes skip to 4 hours.

## Action recommendations

1. **Reduce rollback rate**: 2.4% is within target but each rollback is a learning opportunity; root cause every rollback
2. **Automate rollback decisions**: 60% → 80%+ automated; configure auto-rollback for canary gate 1 failures
3. **Hotfix root cause**: 90% root cause found is good; target 95%+; every hotfix without root cause is a repeat incident waiting to happen
4. **Hotfix backport**: 75% backport rate is low; every hotfix must be backported to main branch within 24 hours
5. **Quarterly rollback drill**: next drill Aug 15; target < 10 min time-to-recovery; every drill must include a real rollback
6. **Freeze exception process**: document and approve all freeze exceptions before deployment; no retroactive approvals
7. **Release notes automation**: auto-generate release notes from commit messages; reduce manual release documentation
8. **Canary duration optimization**: review canary stage 3 (24h) for low-risk changes; consider risk-based duration



- Fix-forward instead of rollback → trying to fix a broken release in production; rollback first, fix later
- Skipping canary → "it's a small change" deployments; every change can break production
- Hotfix bypassing process → hotfix without review or testing; hotfixes need the same gates, just faster
- Freeze exceptions as norm → "it's always approved anyway"; freeze exceptions should be rare and justified
- No rollback practice → rollback exists in theory but never tested; an untested rollback is not a rollback

## Related

- Same class: [dashboard-system-health](../observability/dashboard-system-health.md) — system health
- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident trends
- Downstream: [release](release.md) — release process
- Downstream: [canary-release](canary-release.md) — canary deployment
- Downstream: [hotfix-release](hotfix-release.md) — hotfix process
- Downstream: [rollback-drill](rollback-drill.md) — rollback drill
- References: Google — *Site Reliability Engineering* (Chapter 8: Release Engineering); Jez Humble — *Continuous Delivery*; Charity Majors — *Observability for Releases*