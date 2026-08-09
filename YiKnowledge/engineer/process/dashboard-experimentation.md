---
title: experimentation dashboard
aliases:
- A/B testing dashboard
- feature flag dashboard
- experiment velocity dashboard
- feature experimentation dashboard
tags:
- dashboard
- experimentation
- ab-testing
- feature-flags
- experiment
- hypothesis
category: engineer/process
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- product-manager
- tech-lead
benefit: experimentation velocity and feature flag hygiene visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-team-velocity.md
- ../../product-manager/discovery/metrics--dashboard-product-portfolio.md
- ../../product-manager/delivery/dashboard-product-delivery.md
- ../../engineer/infrastructure/dashboard-dora-metrics.md
tacit: false
---

# experimentation dashboard

> **As an** engineer, **I want to** track experimentation velocity and feature flag hygiene, **so that** product decisions are data-driven and feature flags don't become technical debt.

> Experimentation is how we learn what works. This dashboard tracks the experiment pipeline, A/B test quality, feature flag hygiene, statistical rigor, and experiment impact across the product.

## Summary

- 5 experimentation dimensions: experiment pipeline, A/B test quality, feature flag hygiene, statistical rigor, experiment impact
- Experiment lifecycle: hypothesis → design → implementation → ramp → analysis → ship/kill decision
- Feature flags classified by type: experiment (temporary), release (transitional), operational (permanent), permission (permanent)
- Statistical rigor measured by power analysis, sample size adequacy, significance threshold adherence, and peeking prevention
- Dashboard reviewed monthly; experiment program review quarterly

## Core viewpoints

- Every feature is a hypothesis until proven — the default state is "we don't know if this works"; experimentation is how we find out
- Feature flags are not free — every flag adds code complexity and testing surface; flags that outlive their purpose become technical debt
- Statistical rigor is a product requirement — bad statistics lead to bad decisions; p-hacking, peeking, and low power are bugs
- Experiment velocity measures learning, not shipping — a well-run experiment that kills a bad idea is a success, not a failure

## Key information

### 5-panel experimentation overview

```
┌──────────────────────────────────────────────────────────────────┐
│  EXPERIMENT PIPELINE              │  A/B TEST QUALITY               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active:     8 exps     │   │  │  Power (>80%): 72%      │   │
│  │  Designing:  5 exps     │   │  │  Sample size met: 85%   │   │
│  │  Ramping:    3 exps     │   │  │  Duration: 14 days avg  │   │
│  │  Analyzing:  4 exps     │   │  │  Peeking: 2 detected    │   │
│  │  Completed: 28 this Q   │   │  │  MDE: 2.5% avg          │   │
│  │  Win rate:   38%        │   │  │  Significance: 95% std  │   │
│  │  Time-to-result: 18d    │   │  │  Segmentation: 4.2 avg  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  FEATURE FLAG HYGIENE            │  EXPERIMENT IMPACT              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total flags: 85        │   │  │  Shipped:    18 (47%)   │   │
│  │  Experiment: 28 (33%)   │   │  │  Killed:     12 (32%)   │   │
│  │  Release:    22 (26%)   │   │  │  Inconclusive: 8 (21%)  │   │
│  │  Operational: 20 (24%)  │   │  │  Revenue Δ:  +$1.2M/yr  │   │
│  │  Permission: 15 (18%)   │   │  │  Retention Δ: +2.8%     │   │
│  │  Stale:       8 (9%)    │   │  │  NPS Δ:       +3.5 pts  │   │
│  │  Debt days:   125 days  │   │  │  Learnings:   38 docs   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Experiment pipeline

| Stage | Count | Avg duration | Target | Bottleneck |
|---|---|---|---|---|
| Hypothesis drafted | 5 | 3 days | < 3 days | No |
| Experiment designed | 5 | 5 days | < 5 days | Yes — power analysis often missing |
| Implementation | 3 | 8 days | < 7 days | Yes — flag + metrics + logging |
| Ramping (1% → 10% → 50%) | 3 | 7 days | < 5 days | Minor — safety checks |
| Full traffic (50/50) | 8 | 14 days | 10-14 days | No |
| Analysis | 4 | 4 days | < 3 days | Yes — segmentation slows analysis |
| Decision (ship/kill) | 2 | 2 days | < 2 days | No |
| **End-to-end** | | **18 days** | **< 14 days** | |

### Active experiments

| Experiment | Owner | Hypothesis | Start | Ramp | Traffic | Primary metric | Status |
|---|---|---|---|---|---|---|---|
| AI Chat — Streaming v2 | AI Team | Streaming v2 reduces time-to-first-token by 30% | Jul 25 | 50% | 50/50 | TTFT | Analyzing |
| Code Review — Inline comments | Web Team | Inline comments increase review completion by 15% | Jul 20 | 10% | 10/90 | Completion rate | Ramping |
| Search — Semantic ranking | Platform | Semantic ranking improves click-through by 20% | Jul 28 | 50% | 50/50 | CTR@3 | Running |
| Onboarding — Simplified flow | Mobile | 3-step onboarding increases activation by 25% | Aug 1 | 1% | 1/99 | Day-7 activation | Ramping |
| Pricing — Annual upsell | Billing | Annual plan prompt increases annual conversion by 10% | Jul 15 | 50% | 50/50 | Annual conversion | Analyzing |
| Knowledge — Tree nav v2 | Web Team | Tree navigation reduces search time by 20% | Jul 22 | 10% | 10/90 | Time-to-find | Ramping |
| Notifications — Batching | Platform | Batched notifications increase CTR by 18% | Aug 2 | 1% | 1/99 | Notification CTR | Ramping |
| Billing — Usage alerts | Billing | Usage alerts reduce churn by 12% | Jul 18 | 50% | 50/50 | Churn rate | Analyzing |

### Experiment results (this quarter)

| Experiment | Primary metric | Control | Variant | Lift | p-value | Significant? | Decision |
|---|---|---|---|---|---|---|---|
| Chat — Model selector UI | Model usage | 45% | 62% | +17% | 0.003 | Yes | **Shipped** |
| Code Review — Diff collapse | Review time | 12.5 min | 10.2 min | -18% | 0.001 | Yes | **Shipped** |
| Search — Query suggestions | Query refinement | 22% | 28% | +6% | 0.08 | No | Killed |
| Onboarding — Social proof | Sign-up rate | 18% | 18.5% | +0.5% | 0.42 | No | Killed |
| Pricing — Free trial length | Conversion | 12% | 14% | +2% | 0.04 | Yes | **Shipped** |
| Knowledge — Related articles | Time on page | 3.2 min | 3.8 min | +19% | 0.01 | Yes | **Shipped** |
| Mobile — Dark mode default | Daily active | 62% | 64% | +2% | 0.15 | No | Inconclusive |
| Notifications — Timing | CTR | 8% | 9.5% | +1.5% | 0.06 | No | Inconclusive |

### Feature flag inventory by type

| Flag type | Count | % of total | Avg age | Target lifespan | Stale (>90 days) | Cleanup rate |
|---|---|---|---|---|---|---|
| **Experiment** | 28 | 33% | 22 days | < 30 days | 2 | 85% |
| **Release** | 22 | 26% | 45 days | < 60 days | 3 | 72% |
| **Operational** | 20 | 24% | 180 days | Permanent | 0 | N/A |
| **Permission** | 15 | 18% | 250 days | Permanent | 0 | N/A |
| **Total** | **85** | | | | **8 (9%)** | |

### Feature flag debt analysis

| Flag | Type | Age | Owner | Last toggled | Reason stale | Risk | Cleanup effort |
|---|---|---|---|---|---|---|---|
| `chat-v1-legacy-mode` | Release | 145 days | AI Team | 120 days ago | v1 deprecation incomplete | Medium | 3 days |
| `code-review-diff-v1` | Release | 132 days | Web Team | 110 days ago | v2 fully rolled out | Low | 1 day |
| `search-experimental-ranking` | Experiment | 98 days | Platform | 95 days ago | Experiment ended, flag not removed | Medium | 2 days |
| `onboarding-old-flow` | Release | 115 days | Mobile | 100 days ago | New flow at 100% | Low | 1 day |
| `pricing-2025-legacy` | Experiment | 105 days | Billing | 90 days ago | Analysis complete, cleanup pending | Low | 1 day |
| `notifications-v1-deprecated` | Experiment | 92 days | Platform | 88 days ago | Kill decision made, flag still in code | Low | 0.5 day |
| `knowledge-tree-beta` | Experiment | 88 days | Web Team | 85 days ago | Beta ended, GA shipped | Low | 1 day |
| `auth-session-v1` | Release | 156 days | Platform | 140 days ago | v2 migration blocked by 1 consumer | **High** | 5 days |
| **Total flag debt** | | **125 avg days** | | | | | **14.5 days** |

### Statistical rigor audit

| Experiment | Power analysis | Sample size | MDE defined | Peeking detected | Multiple comparisons corrected | Segmentation pre-registered | Rigor score |
|---|---|---|---|---|---|---|---|
| Chat — Streaming v2 | Yes (85%) | 12,000 | 5% | No | Yes | Yes | 92% |
| Code Review — Inline | Yes (80%) | 8,500 | 8% | No | No | Partial | 72% |
| Search — Semantic | No | 15,000 | Undefined | Yes | No | No | 45% |
| Onboarding — Simplified | Yes (82%) | 5,200 | 10% | No | Yes | Yes | 88% |
| Pricing — Annual | Yes (90%) | 22,000 | 3% | No | Yes | Yes | 95% |
| Knowledge — Tree nav | No | 6,800 | Undefined | No | No | No | 50% |
| Notifications — Batching | Yes (78%) | 18,000 | 7% | No | Yes | Partial | 80% |
| Billing — Usage alerts | Yes (85%) | 28,000 | 5% | Yes | Yes | Yes | 78% |

### Experiment decision quality

| Decision type | Count | % of completed | Correct decision? | Retrospective finding |
|---|---|---|---|---|
| Ship (significant positive) | 18 | 47% | 16 correct (89%) | 2 shipped with false positives (segment effect) |
| Kill (not significant) | 12 | 32% | 10 correct (83%) | 2 killed prematurely (underpowered) |
| Inconclusive (extend/redesign) | 8 | 21% | — | 5 extended, 3 redesigned with better metrics |
| **Total completed** | **38** | | **89% decision accuracy** | |

### Experiment learnings repository

| Learning category | Count | Examples |
|---|---|---|
| UI/UX patterns that work | 12 | Inline actions > modal dialogs; progressive disclosure increases completion |
| User behavior insights | 10 | Model selector increases engagement; social proof doesn't affect technical users |
| Performance sensitivity | 6 | 100ms latency increase → 2% drop in chat usage; streaming reduces perceived wait |
| Pricing psychology | 5 | Annual discount framing works; usage alerts reduce involuntary churn |
| Mobile-specific | 3 | Simplified onboarding increases activation; dark mode doesn't affect engagement |
| Negative results (what didn't work) | 12 | Query suggestions without intent understanding; aggressive notification timing |
| **Total learnings** | **38** | |

### Experiment velocity trend

| Quarter | Experiments started | Experiments completed | Win rate | Time-to-result | Decision accuracy |
|---|---|---|---|---|---|
| 2025-Q3 | 18 | 15 | 35% | 24 days | 82% |
| 2025-Q4 | 22 | 20 | 38% | 22 days | 85% |
| 2026-Q1 | 25 | 22 | 40% | 20 days | 87% |
| 2026-Q2 | 28 | 25 | 42% | 19 days | 88% |
| 2026-Q3 (to date) | 20 | 13 | 38% | 18 days | 89% |

## Action recommendations

1. **Clean up stale flags**: 8 flags (9%) stale, 125 avg days old; remove all 8 within 14 days, starting with `auth-session-v1` (156 days, high risk)
2. **Enforce power analysis**: 2 experiments without power analysis (Search, Knowledge); make power analysis mandatory before experiment launch
3. **Prevent peeking**: 2 experiments with peeking detected; implement peeking detection in experiment platform, lock results until duration reached
4. **Reduce time-to-result**: 18 days → 14 days; streamline implementation (pre-built experiment templates), automate ramp checks
5. **Improve statistical rigor**: 72% average rigor score; mandatory power analysis, MDE definition, and segmentation pre-registration
6. **Flag cleanup automation**: create automated flag removal after 30 days (experiment) / 60 days (release); Jira ticket auto-created
7. **Experiment review board**: weekly review of active experiments, ramp decisions, and analysis quality; prevent bad statistics
8. **Increase experiment velocity**: 28/quarter → 35/quarter; add experiment templates, self-serve metrics, and pre-approved experiment patterns
9. **Publish learnings**: 38 learnings documented; create searchable experiment knowledge base, share monthly experiment digest
10. **Monthly experiment program review**: review velocity, win rate, decision quality, and flag hygiene



- Peeking and shipping → checking experiment results daily and stopping when p < 0.05; peeking inflates false positive rate to ~30%
- Underpowered experiments → running experiments with too little traffic or too short duration; low power means real effects are missed
- Flag cemetery → feature flags that outlive their purpose by months or years; every flag should have a removal date
- Experiment as rubber stamp → "we already decided to ship, let's just run an experiment to confirm"; experimentation is for discovery, not justification
- Metric myopia → optimizing for a single metric without checking guardrail metrics; every experiment needs guardrails (regression, latency, error rate)

## Related

- Same class: [dashboard-team-velocity](dashboard-team-velocity.md) — team velocity and collaboration
- Same class: [dashboard-product-portfolio](../../product-manager/discovery/metrics--dashboard-product-portfolio.md) — product metrics
- Same class: [dashboard-product-delivery](../../product-manager/delivery/dashboard-product-delivery.md) — delivery execution
- Same class: [dashboard-dora-metrics](../../engineer/infrastructure/dashboard-dora-metrics.md) — DORA metrics
- References: Ron Kohavi — *Trustworthy Online Controlled Experiments*; Stefan Thomke — *Experimentation Works*; Microsoft — *Experimentation Platform*; Optimizely — *Statistical Significance in A/B Testing*; LaunchDarkly — *Feature Flag Best Practices*