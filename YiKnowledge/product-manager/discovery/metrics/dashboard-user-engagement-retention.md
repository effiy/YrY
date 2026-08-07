---
title: user engagement and retention dashboard
aliases:
- user engagement dashboard
- retention dashboard
- user stickiness dashboard
- cohort retention dashboard
- user health dashboard
tags:
- dashboard
- user-engagement
- retention
- churn
- stickiness
- cohort-analysis
- activation
category: product-manager/discovery/metrics
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- product-manager
- executive
- engineer
benefit: user engagement depth, retention health, and churn dynamics visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- engagement depth, retention cohorts, churn dynamics, stickiness, activation health, and resurrection rate defined
related:
- ./dashboard-product-portfolio.md
- ./dashboard-feature-adoption.md
- ./dashboard-customer-health.md
- ./dashboard-customer-journey.md
- ../strategy/dashboard-product-strategy.md
tacit: false
---

# user engagement and retention dashboard

> **As a** product manager, **I want to** track user engagement and retention, **so that** every user segment is deeply engaged, retention is predictable, churn is caught early, and user health is a measured, continuously improving practice — not a surprise in the monthly report.

> Engagement is the heartbeat of the product. Retention is the proof of value. This dashboard tracks engagement depth, cohort retention, churn dynamics, stickiness, activation health, and resurrection — turning user behavior from "are people using it?" into a precise, segmented, and actionable growth engine.

## Summary

- 6 engagement dimensions: engagement depth, cohort retention, churn dynamics, stickiness, activation health, resurrection rate
- 2.1M monthly active users (MAU); 850K daily active users (DAU); 42% DAU/MAU stickiness; 12 user segments
- Engagement depth: 28% power users (daily, > 10 actions); 35% core users (3-6×/week); 22% casual (1-2×/week); 15% at-risk (< 1×/week)
- Cohort retention: 58% Day 1; 32% Day 7; 22% Day 30; 8% Day 90; 12-month avg retention 15%; best cohort: 28% (12-month)
- Churn dynamics: 5.8% monthly churn (B2C); 2.2% monthly churn (B2B); 850 churn predictions/month (85% accuracy); 12% involuntary churn (payment)
- Dashboard reviewed weekly; retention deep-dive with product and growth monthly

## Core viewpoints

- Retention is a lagging indicator of value — users don't churn because they're "not engaged"; they churn because the product stopped solving their problem; engagement metrics tell you what's happening, qualitative research tells you why
- The first 7 days predict the next 12 months — a user who performs the core action 3× in their first week has a 65% chance of being retained at 12 months; a user who performs it 0× has a 5% chance; the activation window is everything
- Churn is not one number — involuntary churn (payment failure, expired card), voluntary churn (found alternative, no longer needed), and silent churn (still has account, stopped using) require different interventions; treating all churn the same means fixing none of it
- Power users are not your target — designing for the 28% of power users alienates the 72% who aren't; the goal is to move casual users to core, not to make power users more powerful

## Key information

### 6-panel user engagement overview

```
┌──────────────────────────────────────────────────────────────────┐
│  ENGAGEMENT DEPTH                    │  COHORT RETENTION                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Power users: 28% (588K) │   │  │  Day 1: 58%             │   │
│  │  Core users: 35% (735K)  │   │  │  Day 7: 32%             │   │
│  │  Casual users: 22% (462K)│   │  │  Day 30: 22%            │   │
│  │  At-risk: 15% (315K)     │   │  │  Day 90: 8%             │   │
│  │  Avg sessions/day: 3.2   │   │  │  12-month: 15%          │   │
│  │  Avg session length: 18m │   │  │  Best cohort: 28% (12mo)│   │
│  │  Engagement score: B(78) │   │  │  Retention score: B-(72)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CHURN DYNAMICS                      │  STICKINESS                          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Monthly churn: 5.8%     │   │  │  DAU/MAU: 42%           │   │
│  │  B2B churn: 2.2%         │   │  │  DAU/WAU: 65%           │   │
│  │  Involuntary: 12% of churn│  │  │  Weekly active: 1.3M    │   │
│  │  Churn predictions: 850/mo│  │  │  Avg days active/week:  │   │
│  │  Prediction accuracy: 85%│   │  │  3.8 (of 7)             │   │
│  │  Churn save rate: 22%    │   │  │  Stickiness trend: +2%  │   │
│  │  Churn score: B- (72)    │   │  │  Stickiness score: B(78)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ACTIVATION HEALTH                   │  RESURRECTION RATE                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Activation rate: 48%    │   │  │  Resurrected/mo: 28K    │   │
│  │  Time-to-activate: 3.2d  │   │  │  Resurrection rate: 8%  │   │
│  │  Core action 3× in 7d:   │   │  │  Win-back campaign: 12% │   │
│  │  42% of new users        │   │  │  Natural return: 5%     │   │
│  │  Aha moment reach: 55%   │   │  │  Product-triggered: 18% │   │
│  │  Onboarding completion:  │   │  │  Avg dormant period:    │   │
│  │  68% of new users        │   │  │  45 days before return  │   │
│  │  Activation score: C+(68)│   │  │  Resurrection: B- (72)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Engagement depth by segment

| User segment | Users | % of total | Sessions/week | Avg session | Actions/session | Feature diversity | Engagement trend |
|---|---|---|---|---|---|---|---|
| **Power users** (daily, > 10 actions) | 588K | 28% | 12.5 | 28 min | 15.2 | 8.5 features | +3% |
| **Core users** (3-6×/week) | 735K | 35% | 4.5 | 18 min | 8.5 | 5.2 features | +1% |
| **Casual users** (1-2×/week) | 462K | 22% | 1.5 | 12 min | 4.2 | 2.8 features | -2% |
| **At-risk users** (< 1×/week) | 315K | 15% | 0.3 | 8 min | 2.5 | 1.5 features | -5% |
| **B2B (team admin)** | 85K | 4% | 8.5 | 35 min | 22.0 | 12.0 features | +5% |
| **B2B (team member)** | 285K | 14% | 5.5 | 22 min | 10.5 | 6.5 features | +2% |
| **B2C (individual)** | 1.73M | 82% | 2.8 | 15 min | 5.8 | 3.5 features | -1% |

### Cohort retention (monthly cohorts)

| Cohort | Month 0 | Month 1 | Month 3 | Month 6 | Month 12 | Month 18 | Month 24 | 12-month grade |
|---|---|---|---|---|---|---|---|---|
| **2026-07** | 100% | 62% | 38% | — | — | — | — | Too early |
| **2026-04** | 100% | 58% | 35% | 22% | — | — | — | Too early |
| **2026-01** | 100% | 55% | 32% | 20% | 15% | — | — | B (average) |
| **2025-10** | 100% | 60% | 35% | 24% | 18% | — | — | B+ (good) |
| **2025-07** | 100% | 65% | 42% | 28% | 22% | 12% | — | A- (strong) |
| **2025-04** | 100% | 42% | 22% | 15% | 10% | 8% | — | D (poor) |
| **2025-01** | 100% | 68% | 45% | 32% | 28% | 18% | 12% | A (best) |
| **2024-07** | 100% | 58% | 35% | 22% | 18% | 12% | 8% | B+ (good) |
| **12-month avg** | 100% | 58% | 32% | 22% | 15% | 12% | 10% | B- (72) |

### Churn analysis by type

| Churn type | % of churn | Users/month | Predictable | Preventable | Avg LTV lost | Top reason | Intervention |
|---|---|---|---|---|---|---|---|
| **Voluntary — Found alternative** | 28% | 34K | 72% | 35% | $1,250 | Competitor has feature X | Feature gap analysis, competitive win-back |
| **Voluntary — No longer needed** | 22% | 26.8K | 45% | 15% | $850 | Project ended, use case resolved | Offboarding survey, nurture for future |
| **Voluntary — Poor experience** | 18% | 22K | 55% | 60% | $1,500 | Bugs, slow performance, UX friction | Fix top 3 pain points, proactive outreach |
| **Silent churn — Stopped using** | 20% | 24.4K | 85% | 70% | $950 | Didn't build habit, low activation | Re-engagement campaign, habit loops |
| **Involuntary — Payment failure** | 8% | 9.8K | 95% | 90% | $1,100 | Expired card, insufficient funds | Smart retry, dunning management |
| **Involuntary — Account issue** | 4% | 4.9K | 60% | 80% | $900 | Login issues, access revoked | Proactive account health check |

### Stickiness by product area

| Product area | DAU | WAU | MAU | DAU/MAU | DAU/WAU | Avg days/week | Trend | Target |
|---|---|---|---|---|---|---|---|---|
| **YiVad (AI chat)** | 320K | 520K | 850K | 37.6% | 61.5% | 3.5 | +3% | 45% |
| **YiWeb (dashboard)** | 180K | 320K | 580K | 31.0% | 56.3% | 3.0 | +1% | 38% |
| **YiAi (agent platform)** | 85K | 150K | 280K | 30.4% | 56.7% | 2.8 | +5% | 40% |
| **YiPet (browser extension)** | 220K | 380K | 620K | 35.5% | 57.9% | 3.5 | +2% | 42% |
| **Mobile app** | 145K | 250K | 450K | 32.2% | 58.0% | 3.2 | +1% | 38% |
| **API/integration** | 85K | 130K | 220K | 38.6% | 65.4% | 4.5 | +4% | 45% |
| **Overall** | **850K** | **1.3M** | **2.1M** | **42.0%** | **65.4%** | **3.8** | **+2%** | **48%** |

### Activation funnel

| Activation step | Users entering | Users completing | Conversion | Drop-off | Time in step | Optimization |
|---|---|---|---|---|---|---|
| **1. Sign up** | 85K/mo | 78K (91.8%) | 91.8% | 8.2% | 2.5 min | Social login, reduce fields |
| **2. Onboarding tutorial** | 78K | 53K (67.9%) | 67.9% | 32.1% | 5.5 min | Skip option, interactive walkthrough |
| **3. First core action** | 53K | 42K (79.2%) | 79.2% | 20.8% | 8.5 min | Guided first action, template |
| **4. Second core action** | 42K | 36K (85.7%) | 85.7% | 14.3% | 12.5 min | Prompt next action, suggestions |
| **5. Third core action** (within 7 days) | 36K | 30K (83.3%) | 83.3% | 16.7% | 3.2 days | Email reminder, push notification |
| **6. Aha moment** (value realization) | 30K | 25.5K (85.0%) | 85.0% | 15.0% | 1.5 days | Success milestone, celebration |
| **Overall activation** | **85K** | **25.5K** | **30.0%** | **70.0%** | **3.2 days** | |

### Churn prediction model performance

| Risk tier | Threshold | Users flagged | Actual churn rate | Precision | Recall | Intervention | Save rate |
|---|---|---|---|---|---|---|---|
| **Critical risk** | > 80% churn probability | 12K/mo | 72% | 72% | 58% | Personal outreach, discount offer | 28% |
| **High risk** | 50-80% churn probability | 28K/mo | 45% | 45% | 68% | Targeted email, feature highlight | 22% |
| **Medium risk** | 20-50% churn probability | 52K/mo | 22% | 22% | 72% | In-app message, usage tips | 18% |
| **Low risk** | < 20% churn probability | 850K/mo | 3% | 97% | 95% | No intervention | N/A |
| **Overall** | | 942K/mo | 5.8% | 85% | 82% | | 22% |

### Resurrection and win-back

| Win-back channel | Targeted/month | Responded | Resurrected | Conversion | Avg days dormant | Cost/resurrection | ROI |
|---|---|---|---|---|---|---|---|
| **Product-triggered email** (feature update) | 85K | 18% | 15.3K | 18.0% | 35 days | $0.85 | 12× |
| **Re-engagement campaign** (drip) | 45K | 12% | 5.4K | 12.0% | 52 days | $2.20 | 8× |
| **Discount/promotion offer** | 22K | 8% | 2.6K | 11.8% | 68 days | $8.50 | 3× |
| **Push notification** (mobile) | 65K | 15% | 5.2K | 8.0% | 28 days | $0.15 | 25× |
| **Natural return** (no intervention) | — | — | 12.5K | 5.0% | 45 days | $0.00 | ∞ |
| **Overall** | **217K** | **14.5%** | **28K** | **8.0%** | **45 days** | **$1.80** | **10×** |

## Action recommendations

1. **Activation rate improvement**: 30% overall activation, 70% drop-off; add skip option for onboarding tutorial, reduce time-to-first-core-action, target 40% activation
2. **At-risk user intervention**: 315K at-risk users (15%); implement automated re-engagement for users with < 1 session/week, add habit-building nudges, target < 10% at-risk
3. **Involuntary churn reduction**: 12% of churn is payment-related; implement smart retry logic (3 retries over 7 days), add card expiry notifications, target < 5% involuntary churn
4. **Day 7 retention improvement**: 32% Day 7 retention; analyze why 68% drop off, optimize onboarding completion (68%→80%), add "second visit" email, target 40% Day 7
5. **Silent churn detection**: 20% of churn is silent; implement usage threshold alerts (no action in 14 days), trigger re-engagement before churn prediction fires, target 15% silent churn
6. **Power user expansion**: 28% power users drive 55% of actions; create power user community, ambassador program, early access to features, target 32% power users
7. **Cohort analysis automation**: manual cohort analysis monthly; implement automated cohort dashboards, weekly retention review, segment-specific retention targets
8. **Win-back program optimization**: 8% resurrection rate; A/B test win-back messages, time offers to user's peak usage patterns, target 12% resurrection
9. **Aha moment acceleration**: 3.2 days to activation; create guided "quick win" path, show value in first 5 minutes, add social proof of value, target < 2 days
10. **Weekly engagement review**: review engagement depth, cohort retention, churn dynamics, stickiness, and activation health with product and growth



- The MAU vanity metric → celebrating MAU growth while DAU/MAU stickiness declines; 2.1M MAU with 30% stickiness is worse than 1.5M MAU with 50% stickiness — a large, disengaged user base is a churn time bomb
- The "average retention" trap → reporting a single retention number across all cohorts; the 2025-01 cohort (28% 12-month) and 2025-04 cohort (10% 12-month) have wildly different trajectories — averaging them hides the story
- Churn prediction without intervention → building a sophisticated churn model but not having a save strategy; predicting churn with 85% accuracy but only saving 22% means you're watching users leave in slow motion
- The engagement bait → driving engagement through notifications, streaks, and gamification without delivering real value; a user with a 100-day streak who hasn't accomplished anything meaningful is not retained — they're addicted, and they'll churn the moment the streak breaks
- Resurrection without retention → winning back churned users only to have them churn again in 30 days; if the reason they churned hasn't been fixed, resurrection is just delaying the inevitable

## Related

- Same class: [dashboard-product-portfolio](dashboard-product-portfolio.md) — product portfolio
- Same class: [dashboard-feature-adoption](dashboard-feature-adoption.md) — feature adoption
- Same class: [dashboard-customer-health](dashboard-customer-health.md) — customer health
- Same class: [dashboard-customer-journey](dashboard-customer-journey.md) — customer journey
- Same class: [dashboard-product-strategy](../strategy/dashboard-product-strategy.md) — product strategy
- References: Amplitude — *Retention and Engagement Playbook*; Mixpanel — *Product Analytics Guide*; Brian Balfour — *Retention is the King*; Lenny Rachitsky — *How to Measure Retention*; Casey Winters — *Seeking a New User Cockroach*; Chamath Palihapitiya — *Growth and Engagement Framework*