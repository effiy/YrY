---
title: product portfolio dashboard
aliases:
- product dashboard
- product metrics dashboard
- feature adoption dashboard
- product kpi dashboard
tags:
- dashboard
- product
- metrics
- kpi
- north-star
- adoption
- retention
category: product-manager/discovery/metrics
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- product-manager
- executive
- tech-lead
benefit: product performance and feature adoption visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./north-star-metric.md
- ./ai-product-metrics.md
- ./retention-and-churn.md
- ../../../executive/strategy/dashboard-executive-kpi.md
- ../../../executive/strategy/product-strategy-framework.md
tacit: false
---

# product portfolio dashboard

> **As a** product manager, **I want to** track product performance and feature adoption across the portfolio, **so that** investment decisions are data-driven and underperforming features are identified early.

> A product dashboard connects business strategy to execution metrics. It tracks the north star, feature adoption, user retention, conversion funnel, and user satisfaction in a single view.

## Summary

- 5 product dimensions: north star and guardrails, feature adoption, user retention and churn, conversion funnel, user satisfaction
- North star decomposes into input metrics per team; guardrails prevent metric gaming
- Feature adoption tracked via adoption rate, DAU/WAU/MAU, time-to-adopt, and feature retention
- Cohort-based retention analysis; churn early warning signals
- Dashboard refreshes daily; weekly product review; monthly strategy alignment

## Core viewpoints

- North star is the single most important metric — every team understands how their work impacts it
- Feature adoption ≠ feature success — a widely adopted feature that doesn't improve retention is a failure
- Retention is the ceiling of growth — if retention is broken, acquisition spending is wasted
- Funnel metrics reveal where users struggle — the biggest conversion lever is usually the step with the largest drop-off

## Key information

### 5-panel product overview

```
┌──────────────────────────────────────────────────────────────────┐
│  NORTH STAR & GUARDRAILS        │  FEATURE ADOPTION               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  NS: Tasks/user 8.2 ↑   │   │  │  Chat:    78% ███▌     │   │
│  │  Target: 10.0            │   │  │  Search:  62% ███      │   │
│  │  Guard 1: Hallu 4.2% ✓  │   │  │  AICR:    45% ██       │   │
│  │  Guard 2: LTV/CAC 3.8 ✓ │   │  │  Knowledge: 38% █▌     │   │
│  │  Guard 3: Sec 0 ✓       │   │  │  Settings: 22% █       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RETENTION & CHURN              │  CONVERSION FUNNEL              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  D1:  42%  D7:  28%     │   │  │  Visit→Signup:  12%    │   │
│  │  D30: 18%  D90: 11%     │   │  │  Signup→Active: 45%    │   │
│  │  Churn: 4.2%/month      │   │  │  Active→Pay:    22%    │   │
│  │  At-risk: 340 users     │   │  │  Pay→Advocate:  15%    │   │
│  │  Winback: 18% (30d)     │   │  │  Overall: 0.18%        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### North star decomposition

```
North Star: Successful tasks per user per week (target: 10.0)
  │
  ├─ Input 1: Task success rate (current: 87%, target: 92%)
  │   ├─ Faithfulness ≥ 95% (current: 95.8% ✓)
  │   ├─ Tool call success ≥ 90% (current: 88% → needs work)
  │   └─ Response relevance ≥ 85% (current: 89% ✓)
  │
  ├─ Input 2: Tasks initiated per user (current: 9.4, target: 10.9)
  │   ├─ Sessions per week (current: 5.8, target: 6.5)
  │   ├─ Tasks per session (current: 1.62, target: 1.68)
  │   └─ First-session success rate (current: 72%, target: 80%)
  │
  └─ Input 3: Weekly active users (current: 12.4k, target: 15k)
      ├─ New user activation rate (current: 38%, target: 45%)
      └─ Existing user retention (current: 28% D7, target: 32%)
```

### Feature adoption matrix

| Feature | Adoption rate | DAU | WAU | MAU | Time-to-adopt | Retention (D30) | Health |
|---|---|---|---|---|---|---|---|
| AI Chat | 78% | 6.2k | 9.8k | 14.2k | 2 days | 42% | Green |
| Smart Search | 62% | 4.1k | 7.5k | 11.0k | 5 days | 35% | Green |
| AI Code Review | 45% | 2.8k | 5.2k | 7.8k | 12 days | 28% | Yellow |
| Knowledge Base | 38% | 2.1k | 4.0k | 6.2k | 18 days | 22% | Yellow |
| Settings/Config | 22% | 0.8k | 1.5k | 2.4k | 30 days | 65% | Green |
| Export/Reports | 15% | 0.5k | 0.9k | 1.5k | 45 days | 18% | Red |

### Cohort retention table

| Cohort | Size | D1 | D7 | D30 | D90 | D180 |
|---|---|---|---|---|---|---|
| 2026-Jul | 1,240 | 44% | 30% | 19% | — | — |
| 2026-Jun | 1,180 | 42% | 28% | 18% | 12% | — |
| 2026-May | 1,320 | 40% | 27% | 17% | 11% | 8% |
| 2026-Apr | 1,150 | 41% | 28% | 18% | 12% | 9% |
| 2026-Mar | 1,080 | 39% | 26% | 16% | 10% | 7% |
| Trend | ↑ | ↑ | ↑ | ↑ | ↑ | ↑ |

### Churn early warning signals

| Signal | Threshold | Current | Alert |
|---|---|---|---|
| Login frequency decline | > 30% drop in 2 weeks | 12% of users | No |
| Session duration decline | > 50% drop in 2 weeks | 8% of users | No |
| Feature usage decline | > 40% drop in core features | 5% of users | No |
| Support ticket spike | > 2x normal volume | 1.1x | No |
| NPS decline | > 10 points in 30 days | -3 points | No |
| Payment failure rate | > 5% of active subscribers | 2.1% | No |

### Conversion funnel optimization

| Stage | Current rate | Industry benchmark | Gap | Priority |
|---|---|---|---|---|
| Landing → Sign-up | 12% | 8-15% | None | Low |
| Sign-up → Activation | 45% | 40-60% | None | Low |
| Activation → Engagement | 38% | 30-50% | None | Low |
| Engagement → Conversion | 22% | 15-25% | None | Low |
| Conversion → Expansion | 15% | 10-20% | None | Medium |
| Conversion → Advocacy | 8% | 5-15% | None | Medium |

### User satisfaction metrics

| Metric | Current | Target | Trend |
|---|---|---|---|
| NPS | 42 | > 40 | ↑ +3 |
| CSAT | 4.2/5 | > 4.0 | → stable |
| CES (Customer Effort) | 3.1/5 | < 3.0 | ↓ -0.2 |
| Feature requests fulfilled | 62% | > 60% | ↑ +5% |
| Support resolution time | 4.2 hours | < 4 hours | ↓ -0.5h |
| User-perceived quality | 8.2/10 | > 8.0 | ↑ +0.3 |

## Action recommendations

1. **North star weekly review**: every Monday, review north star and guardrails; if any guardrail is red, pause feature work
2. **Feature adoption funnel**: for features with < 30% adoption, investigate: is it discoverability, usability, or value?
3. **Retention cohort analysis**: compare each new cohort against previous; declining retention = product problem, not marketing
4. **Churn intervention**: when users hit 2+ early warning signals, trigger automated re-engagement (email, in-app prompt)
5. **Conversion optimization**: focus on the biggest drop-off step; a 10% improvement in the worst step beats 1% across all steps
6. **Kill underperforming features**: features with < 15% adoption and flat retention should be deprecated
7. **Monthly strategy alignment**: north star still aligned with strategy? Guardrails still the right ones?



- Vanity metrics as north star → DAU, page views, registrations; these measure activity, not value
- Feature factory → shipping features without measuring adoption or impact; every feature ships with success criteria
- Retention blindness → focusing on acquisition while retention decays; acquisition fills a leaky bucket
- NPS as sole metric → NPS is lagging and coarse; pair with behavioral metrics (adoption, retention, usage)
- Funnel obsession → optimizing for conversion at the expense of user experience; dark patterns boost short-term conversion, kill long-term retention

## Related

- Same class: [north-star-metric](north-star-metric.md) — north star metric deep dive
- Same class: [ai-product-metrics](ai-product-metrics.md) — AI-specific product metrics
- Same class: [retention-and-churn](retention-and-churn.md) — retention and churn analysis
- Upstream: [../../../executive/strategy/dashboard-executive-kpi.md](../../../executive/strategy/dashboard-executive-kpi.md) — executive rollup
- Upstream: [../../../executive/strategy/product-strategy-framework.md](../../../executive/strategy/product-strategy-framework.md) — strategy framework
- References: Sean Ellis — *Hacking Growth*; Lenny Rachitsky — *The North Star Framework*; Amplitude — *The Product Metrics Playbook*