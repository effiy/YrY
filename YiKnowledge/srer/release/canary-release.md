---
title: Canary Release Procedure
aliases: [canary-release, canary-deployment, gradual-rollout]
tags: [sre, release, canary, deployment, reliability]
category: srer/release
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Teams execute canary releases safely — deploying to a small subset first, validating, then gradually rolling out"
acceptance_criteria:
  - "5 phases: preparation, canary deploy, validation, ramp-up, full rollout"
  - "includes canary size guidelines and rollback triggers"
  - "covers monitoring and metric comparison during canary"
related:
  - ./release-procedure.md
  - ./rollback-drill.md
  - ./hotfix-release.md
  - ../observability/slo-sli-definition.md
---

# Canary Release Procedure

> **When to use:** For any change that carries non-trivial risk — new features, infrastructure changes, database migrations. Canary reduces blast radius by exposing the change to a small subset of users first.

## Canary Size Guidelines

| Risk level | Initial canary | Example |
|---|---|---|
| Low (config change, copy update) | 10% | Ramp over 30 min |
| Medium (new feature, dependency update) | 5% | Ramp over 2 hours |
| High (database migration, auth change) | 1% | Ramp over 24 hours |
| Critical (data format change, API break) | 0.1% (internal only) | Ramp over 48 hours |

## Phase 1: Preparation

### Pre-canary Checklist

- [ ] All tests pass in staging
- [ ] Rollback plan is documented and tested
- [ ] Monitoring dashboards are ready (compare canary vs. baseline)
- [ ] Feature flags are in place (if applicable)
- [ ] On-call engineer is notified
- [ ] Canary announcement posted in `#releases`

### Define Success Criteria

| Metric | Baseline (current) | Acceptable range | Trigger rollback if |
|---|---|---|---|
| Error rate | {{X%}} | ≤ 1.2x baseline | > 2x baseline |
| P99 latency | {{Yms}} | ≤ 1.3x baseline | > 3x baseline |
| Throughput | {{Z rps}} | ≥ 0.9x baseline | < 0.5x baseline |
| Crash rate | 0 | 0 | Any crash |

## Phase 2: Deploy Canary

1. Deploy new version to canary instances (1-10% of traffic)
2. Verify deployment health (all instances up, no crash loops)
3. Route canary traffic to new instances
4. Start the observation timer

## Phase 3: Validate Canary

### Observation Period

| Risk level | Minimum observation |
|---|---|
| Low | 15 minutes |
| Medium | 1 hour |
| High | 4 hours |
| Critical | 24 hours |

### What to Monitor

| Signal | Compare | Tools |
|---|---|---|
| Error rate | Canary vs. baseline | Grafana, error tracking |
| Latency (P50, P95, P99) | Canary vs. baseline | Grafana, APM |
| Crash rate | Canary only | Sentry, crash tracking |
| Business metrics | Canary vs. baseline | Analytics, revenue tracking |
| User feedback | Any new complaints | Support tickets, social media |

### Go/No-Go Decision

After the observation period:

- **GO** → All metrics within acceptable range → Proceed to Phase 4
- **NO-GO** → Any metric exceeds threshold → Rollback immediately

## Phase 4: Ramp Up

Gradually increase canary percentage:

```
1%  → observe 30 min → ✓
5%  → observe 30 min → ✓
10% → observe 30 min → ✓
25% → observe 30 min → ✓
50% → observe 30 min → ✓
100%
```

At each step, re-validate metrics. If any step fails, rollback.

## Phase 5: Full Rollout

1. Deploy to 100% of instances
2. Monitor for 30 minutes post-full-rollout
3. Keep canary instances running for 24 hours (fast rollback if needed)
4. Decommission canary instances after 24 hours of clean operation
5. Announce completion in `#releases`

## Rollback Decision Matrix

| Condition | Action |
|---|---|
| Error rate > 2x baseline for > 2 min | Immediate rollback |
| P99 latency > 3x baseline for > 5 min | Immediate rollback |
| Any crash in canary | Immediate rollback |
| Business metric drops > 10% | Discuss with PM; likely rollback |
| User complaints spike | Investigate; rollback if confirmed regression |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| 50% canary on first deploy | Blast radius is too large; defeats the purpose | Start with 1-5%, ramp gradually |
| No comparison metrics | Can't tell if canary is better or worse than baseline | Always compare canary metrics against baseline side-by-side |
| "It's a small change, skip canary" | Small changes cause big outages (config typos, dependency bumps) | Canary everything; vary the observation period by risk |
| Ignoring canary during ramp-up | Metrics drift after each ramp step; miss the signal | Validate at every ramp step before proceeding |