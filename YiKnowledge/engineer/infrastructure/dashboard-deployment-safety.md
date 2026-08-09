---
title: deployment safety dashboard
aliases:
- deployment risk dashboard
- release safety dashboard
- progressive delivery dashboard
- deployment quality dashboard
tags:
- dashboard
- deployment
- release
- canary
- progressive-delivery
- rollback
- safety
category: engineer/infrastructure
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- engineer
- tech-lead
- oncall-sre
benefit: deployment safety and risk posture visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - visualization choices are explained and accessible
related:
- ./dashboard-dora-metrics.md
- ../../oncall-sre/release/dashboard-release-management.md
- ../../oncall-sre/observability/dashboard-system-health.md
- ../quality-security/dashboard-quality-metrics.md
tacit: false
---

# deployment safety dashboard

> **As an** engineer, **I want to** track deployment safety and risk posture, **so that** every deployment is safe, reversible, and validated before it reaches all users.

> Deployment safety is the difference between shipping with confidence and shipping with fear. This dashboard tracks canary analysis, progressive delivery, rollback readiness, deployment risk scoring, and change management.

## Summary

- 5 deployment safety dimensions: canary analysis, progressive delivery, rollback readiness, deployment risk scoring, change management
- 85 deployments/month across 25 services; 4.2% require rollback; 0.8% cause incidents
- Every deployment goes through pre-deployment risk assessment, canary validation (5%→25%→100% over 30 minutes), and automated rollback triggers
- Canary analysis compares key metrics (error rate, latency, saturation) against baseline with automatic p-value testing
- Dashboard reviewed weekly; deployment safety review monthly with SRE and platform teams

## Core viewpoints

- Every deployment is an experiment — the hypothesis is "this change is safe"; canary analysis validates the hypothesis before full rollout
- Speed of rollback > speed of fix — it's better to roll back in 30 seconds and debug calmly than to fix-forward under pressure for 30 minutes
- Deployment risk is predictable — change size, change type, service criticality, and time of day are leading indicators of deployment risk
- Progressive delivery limits blast radius — 5% of users experiencing a bug is an incident; 100% of users experiencing it is a crisis

## Key information

### 5-panel deployment safety overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CANARY ANALYSIS                  │  PROGRESSIVE DELIVERY            │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Deployments: 85/mo     │   │  │  Canary→25%:  30 min    │   │
│  │  Canary analyzed: 82%   │   │  │  25%→50%:     60 min    │   │
│  │  Auto-passed:   72%     │   │  │  50%→100%:    90 min    │   │
│  │  Auto-failed:    8%     │   │  │  Total pipeline: 3 hrs  │   │
│  │  Manual check:  20%     │   │  │  Services covered: 22/25│   │
│  │  False positive: 2.1%   │   │  │  Not covered:   3 (12%) │   │
│  │  False negative: 0.3%   │   │  │  Manual deploy: 2 svcs  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ROLLBACK READINESS               │  DEPLOYMENT RISK SCORING         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Rollback rate: 4.2%    │   │  │  Low risk:    52% ██▌   │   │
│  │  Auto rollback: 2.8%    │   │  │  Medium risk: 32% █▌    │   │
│  │  Manual rollback: 1.4%  │   │  │  High risk:   12% ▌     │   │
│  │  Avg rollback: 38s      │   │  │  Critical:     4% ▏    │   │
│  │  Rollback success: 98%  │   │  │  Risk score:  32/100    │   │
│  │  DB rollback:    85%    │   │  │  Incidents: 0.8% of depl │   │
│  │  Failed rollback: 2%    │   │  │  Change fail: 5.2%      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Canary analysis metrics

| Service | Canary coverage | Duration | Metrics analyzed | Auto-pass threshold | Auto-fail threshold | False positive | False negative |
|---|---|---|---|---|---|---|---|
| API Gateway | Yes | 10 min | Error rate, latency, throughput | All metrics < 1.5× baseline | Any metric > 3× baseline | 1.5% | 0.1% |
| Chat Inference | Yes | 15 min | Error rate, latency, token quality | All metrics < 1.3× baseline | Any metric > 2× baseline | 2.8% | 0.5% |
| Knowledge Search | Yes | 10 min | Error rate, latency, recall@10 | Recall@10 < 2% degradation | Recall@10 > 5% degradation | 1.8% | 0.3% |
| Code Review | Yes | 12 min | Error rate, latency, suggestion quality | Quality score > 90% baseline | Quality score < 80% baseline | 2.2% | 0.4% |
| Auth Service | Yes | 8 min | Error rate, latency, auth success rate | Auth success > 99.9% | Auth success < 99.5% | 0.8% | 0.0% |
| Database Primary | No | — | — | — | — | — | — |
| Payment Service | Yes | 15 min | Error rate, transaction success | Transaction success > 99.95% | Transaction success < 99.5% | 1.2% | 0.0% |
| File Storage | Yes | 8 min | Error rate, latency, upload success | Upload success > 99.5% | Upload success < 98% | 1.5% | 0.2% |
| **Overall** | **22/25 (88%)** | **12 min avg** | | | | **2.1%** | **0.3%** |

### Deployment risk score matrix

| Risk factor | Weight | Low (1) | Medium (2) | High (3) | Critical (4) |
|---|---|---|---|---|---|
| Change size (lines) | 25% | < 100 | 100-500 | 500-2000 | > 2000 |
| Change type | 20% | Config, docs | Feature flag, refactor | New feature, API change | DB migration, auth change |
| Service tier | 20% | Tier 3 (dev) | Tier 2 (internal) | Tier 1 (business) | Tier 0 (critical) |
| Test coverage delta | 15% | Coverage ↑ | Coverage → | Coverage ↓ < 5% | Coverage ↓ > 5% |
| Deployment window | 10% | Business hours | Evening | Weekend | Friday after 4pm |
| Dependencies changed | 10% | 0 | 1-2 | 3-5 | > 5 |

### Deployment outcomes by risk score

| Risk level | Score range | Deployments/mo | Rollback rate | Incident rate | Avg canary duration | Recommendation |
|---|---|---|---|---|---|---|
| **Low** | 0-25 | 44 (52%) | 1.2% | 0.1% | 10 min | Standard progressive delivery |
| **Medium** | 26-50 | 27 (32%) | 4.8% | 0.8% | 15 min | Extended canary, peer review |
| **High** | 51-75 | 10 (12%) | 12.5% | 3.2% | 30 min | Staged rollout, SRE on standby |
| **Critical** | 76-100 | 4 (4%) | 28% | 8.5% | 60 min | Change advisory board, executive approval |

### Rollback readiness

| Service | Rollback method | Rollback time | DB rollback | Success rate | Last tested | Gaps |
|---|---|---|---|---|---|---|
| API Gateway | Blue-green | 25s | N/A | 100% | 2026-08-01 | None |
| Chat Inference | Canary + traffic shift | 45s | N/A | 98% | 2026-07-28 | Model warm-up delay |
| Knowledge Search | Blue-green | 30s | N/A | 100% | 2026-08-02 | None |
| Code Review | Canary + traffic shift | 50s | N/A | 96% | 2026-07-25 | GPU reallocation time |
| Auth Service | Rolling update | 60s | N/A | 100% | 2026-08-03 | None |
| Database Primary | Manual | 180s | 85% | 85% | 2026-06-15 | **DB migration rollback unreliable** |
| Payment Service | Blue-green | 20s | Yes (idempotent) | 100% | 2026-08-01 | None |
| File Storage | Rolling update | 40s | N/A | 100% | 2026-07-30 | None |
| Notification Service | Canary | 35s | N/A | 99% | 2026-07-28 | None |
| **Overall** | | **38s avg** | **85% (DB)** | **98%** | | |

### Deployment freeze and exception log

| Date | Service | Type | Reason | Risk | Approved by | Outcome |
|---|---|---|---|---|---|---|
| 2026-08-04 | Auth Service | Exception | Critical security patch (CVE-2026-8842) | High | CISO | Deployed successfully |
| 2026-07-31 | All services | Freeze | Monthly freeze window (last business day) | — | VP Eng | No deployments |
| 2026-07-15 | Database | Exception | Index rebuild for performance emergency | Critical | CTO, SRE Lead | Rolled back, re-attempted |
| 2026-06-30 | All services | Freeze | Quarter-end freeze | — | VP Eng | No deployments |
| 2026-06-12 | Payment | Exception | Regulatory deadline (CCPA compliance) | High | VP Eng, Legal | Deployed with extended canary |

### Change failure analysis

| Failure type | Count/mo | % of deployments | Top cause | Prevention |
|---|---|---|---|---|
| Performance regression | 2.2 | 2.6% | Missing load test, inadequate canary | Load test gate for API changes |
| Functional bug | 1.5 | 1.8% | Insufficient test coverage, edge case | Risk-based testing, mutation testing |
| Configuration error | 0.8 | 0.9% | Manual config, missing validation | Config-as-code, pre-deploy validation |
| Dependency issue | 0.5 | 0.6% | Unpinned dependency, breaking change | Dependency lock, Renovate with tests |
| Infrastructure change | 0.3 | 0.4% | Terraform drift, missing plan review | Atlantis apply, plan review required |
| Data migration failure | 0.2 | 0.2% | Unvalidated migration, no rollback plan | Migration dry-run, mandatory rollback script |
| **Total** | **5.5** | **5.2%** | | |

### Deployment health trends

| Metric | Current | 3 months ago | 6 months ago | Trend | Target |
|---|---|---|---|---|---|
| Deployment frequency | 85/mo | 72/mo | 58/mo | ↑ | 100/mo |
| Change failure rate | 5.2% | 6.8% | 8.5% | ↓ | < 3% |
| Rollback rate | 4.2% | 5.5% | 7.2% | ↓ | < 3% |
| Canary coverage | 88% | 82% | 72% | ↑ | 100% |
| Deployment incident rate | 0.8% | 1.2% | 2.1% | ↓ | < 0.5% |
| Mean time to rollback | 38s | 52s | 75s | ↓ | < 30s |
| DB rollback success | 85% | 78% | 70% | ↑ | > 95% |
| Friday deployment % | 8% | 12% | 18% | ↓ | < 5% |

## Action recommendations

1. **Database migration rollback**: 85% success, 180s rollback time; implement migration testing in CI, require rollback script for every migration, target 95% success
2. **Canary coverage expansion**: 88% coverage, 3 services uncovered; add canary analysis to Database Primary, Notification Service, and CDN, target 100%
3. **False positive reduction**: 2.1% false positive rate; tune canary thresholds per service, implement Bayesian analysis instead of simple threshold comparison
4. **Critical deployment risk reduction**: 4% of deployments are critical risk, 28% rollback rate; split large changes into smaller deployments, increase pre-deployment testing
5. **Friday deployment elimination**: 8% of deployments on Friday; enforce no-Friday-deploy policy (except critical fixes), redirect to Monday
6. **Change failure root cause**: 5.2% change failure rate; implement post-deployment review for every rollback, share learnings in deployment review
7. **Deployment risk scoring automation**: integrate risk scoring into CI/CD pipeline, auto-adjust canary duration based on risk score
8. **Rollback drill program**: conduct monthly rollback drills for each Tier 0 service, verify rollback time and success rate
9. **Deployment safety dashboard**: add real-time deployment safety view to team monitors, show active canary status, risk scores, and rollback readiness
10. **Weekly deployment safety review**: review rollback rate, change failure rate, false positive/negative trends, and canary effectiveness



- Skipping canary on "small changes" → "it's just a one-line config change"; config changes are the #2 cause of deployment failures, every change goes through canary
- Canary without statistical rigor → eyeballing dashboards for 2 minutes and saying "looks good"; without statistical tests, canary is just theater
- Fix-forward under pressure → trying to fix a broken deployment in production instead of rolling back; rollback is the safest, fastest path to recovery
- Friday deployments → deploying on Friday afternoon because "we need to ship"; the team that deploys on Friday owns the weekend pager
- Rollback as failure → treating rollback as a sign of incompetence; rollback is a sign of good deployment hygiene — it means the safety system works

## Related

- Same class: [dashboard-dora-metrics](dashboard-dora-metrics.md) — DORA delivery metrics
- Same class: [dashboard-release-management](../../oncall-sre/release/dashboard-release-management.md) — release management
- Same class: [dashboard-system-health](../../oncall-sre/observability/dashboard-system-health.md) — system health and SLOs
- Same class: [dashboard-quality-metrics](../quality-security/dashboard-quality-metrics.md) — code quality and testing
- References: Google — *Site Reliability Engineering (Chapter: Release Engineering)*; DORA — *Accelerate State of DevOps*; Netflix — *Spinnaker and Canary Analysis*; Charity Majors — *Observability for Deployments*; AWS — *Well-Architected Operational Excellence Pillar*