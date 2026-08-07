---
title: customer journey mapping dashboard
aliases:
- journey mapping dashboard
- customer lifecycle dashboard
- user journey dashboard
- conversion journey dashboard
tags:
- dashboard
- customer-journey
- user-journey
- lifecycle
- conversion
- retention
- churn
- onboarding
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
- engineer
benefit: customer journey health, lifecycle progression, and journey friction visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- journey stages, lifecycle progression, drop-off, time-in-stage, journey friction, and activation defined
related:
- ./dashboard-customer-health.md
- ./dashboard-feature-adoption.md
- ./dashboard-product-portfolio.md
- ../../strategy/dashboard-pricing-packaging.md
- ../../strategy/dashboard-product-strategy.md
tacit: false
---

# customer journey mapping dashboard

> **As a** product manager, **I want to** track the customer journey and lifecycle progression, **so that** every stage of the journey is measured, drop-off points are identified and fixed, time-to-value is minimized, and the journey from signup to champion is a well-paved path — not a maze of friction.

> The customer journey is the product's story told through the customer's eyes. This dashboard tracks journey stages, lifecycle progression, stage-to-stage conversion, time-in-stage, journey friction points, and activation health — turning the customer journey from a wall of sticky notes into a continuously measured, quantitatively optimized experience.

## Summary

- 6 journey dimensions: journey stages, lifecycle progression, stage conversion, time-in-stage, journey friction, activation health
- 7 journey stages: Awareness, Signup, Activation, Engagement, Conversion (paid), Retention, Advocacy; 2.1M total users across all stages
- Stage distribution: Awareness (1.5M/mo visitors), Signup (2.1M total), Activated (1.55M, 74%), Engaged (820K, 53%), Paid (85K, 4.2%), Retained (62K, 73%), Advocates (8.5K, 14%)
- Drop-off hotspots: Signup→Activation (26% drop), Engagement→Paid (78% drop), Paid→Retained (27% monthly churn)
- Time-to-value: 28 days avg signup→paid (target < 21 days); 14 days signup→activation (target < 7 days); 8 months avg time-to-upgrade
- Journey friction: 4.2 friction points per journey avg; top friction: onboarding complexity (28%), feature discovery (22%), pricing confusion (18%)
- Dashboard reviewed monthly; journey optimization sprint quarterly with product, UX, and growth

## Core viewpoints

- The journey is a funnel, not a staircase — customers don't ascend smoothly from signup to advocate; they drop off, come back, skip stages, and sometimes regress; measure the real journey, not the ideal one
- Every stage has a "why leave" — for every drop-off point, there's a reason; if you don't know why customers leave at each stage, you're guessing at the fix
- Time-in-stage is the silent conversion killer — the longer a customer sits in a stage without progressing, the less likely they ever will; a customer stuck in "engaged but not paid" for 6 months is not a future customer, they're a free rider
- Activation is the only stage that matters for new users — if a user doesn't reach the "aha moment" within the first session, they're 80% likely to never return; the entire onboarding experience should be optimized for time-to-activation, not feature education

## Key information

### 6-panel journey overview

```
┌──────────────────────────────────────────────────────────────────┐
│  JOURNEY STAGES                     │  LIFECYCLE PROGRESSION              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Awareness: 1.5M/mo      │   │  │  New: 35% (735K)         │   │
│  │  Signup: 2.1M total      │   │  │  Onboarding: 22% (462K)  │   │
│  │  Activated: 1.55M (74%)  │   │  │  Active: 25% (525K)      │   │
│  │  Engaged: 820K (53%)     │   │  │  Power: 12% (252K)       │   │
│  │  Paid: 85K (4.2%)        │   │  │  At-risk: 4% (84K)       │   │
│  │  Retained: 62K (73%)     │   │  │  Churned: 2% (42K)       │   │
│  │  Advocates: 8.5K (14%)   │   │  │  Lifecycle score: B (78) │   │
│  │  Journey score: B- (72)  │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  STAGE CONVERSION                   │  TIME-IN-STAGE                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Visitor→Signup: 8.5%   │   │  │  Signup→Activation: 14d  │   │
│  │  Signup→Activated: 74%  │   │  │  Activation→Engaged: 21d │   │
│  │  Activated→Engaged: 53% │   │  │  Engaged→Paid: 28d       │   │
│  │  Engaged→Paid: 10.4%    │   │  │  Paid→Upgrade: 8mo       │   │
│  │  Paid→Retained: 73%     │   │  │  Paid→Advocate: 14mo     │   │
│  │  Retained→Advocate: 14% │   │  │  Dormant recovery: 45d   │   │
│  │  Conversion score: C+   │   │  │  Time score: C+ (68)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  JOURNEY FRICTION                   │  ACTIVATION HEALTH                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Friction points: 4.2    │   │  │  Activation rate: 74%    │   │
│  │  Top: onboarding (28%)   │   │  │  Time-to-aha: 8.5 min    │   │
│  │  Feature discovery (22%) │   │  │  Aha moment reach: 68%   │   │
│  │  Pricing confusion (18%) │   │  │  First-session bounce:42%│   │
│  │  Support escalation (15%)│   │  │  Day-1 retention: 45%    │   │
│  │  Permission/setup (12%)  │   │  │  Day-7 retention: 28%    │   │
│  │  Integration (5%)        │   │  │  Day-30 retention: 18%   │   │
│  │  Friction score: C (65)  │   │  │  Activation: B- (72)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Journey stage distribution

| Stage | Users | % of total | Weekly inflow | Weekly outflow | Net flow | Stage duration (median) |
|---|---|---|---|---|---|---|
| **Awareness** (visitors) | 1.5M/mo | — | 375K/wk | 32K/wk signup | +343K/wk | 1 session |
| **Signup** (registered) | 2.1M | 100% | 32K/wk | 23.7K/wk activate | +8.3K/wk | 14 days |
| **Activated** (aha reached) | 1.55M | 74% | 23.7K/wk | 12.5K/wk engage | +11.2K/wk | 21 days |
| **Engaged** (weekly active) | 820K | 39% | 12.5K/wk | 1.3K/wk convert | +11.2K/wk | 28 days |
| **Paid** (converted) | 85K | 4.2% | 330/wk | 240/wk churn | +90/wk | 8 months (to upgrade) |
| **Retained** (> 3 months) | 62K | 3.0% | — | — | +240/wk (from paid) | 14 months (to advocate) |
| **Advocates** (NPS ≥ 9, refer) | 8.5K | 0.4% | 12/wk | — | +12/wk | 24+ months |

### Stage conversion funnel

| Transition | Conversion rate | 3 months ago | 6 months ago | Target | Industry benchmark | Gap |
|---|---|---|---|---|---|---|
| **Visitor → Signup** | 8.5% | 7.8% | 7.2% | 12% | 5-15% | -3.5 pts |
| **Signup → Activated** (aha reached) | 74% | 72% | 70% | 80% | 60-80% | -6 pts |
| **Activated → Engaged** (W1 active) | 53% | 50% | 48% | 60% | 40-60% | -7 pts |
| **Engaged → Trial** | 22% | 20% | 18% | 25% | 15-25% | -3 pts |
| **Trial → Paid** | 32% | 30% | 28% | 40% | 25-45% | -8 pts |
| **Free → Paid** (all paths) | 4.2% | 3.8% | 3.5% | 5.0% | 3-7% | -0.8 pts |
| **Paid → Retained** (3mo+) | 73% | 70% | 68% | 80% | 70-85% | -7 pts |
| **Retained → Advocate** (NPS ≥ 9) | 14% | 12% | 10% | 20% | 10-20% | -6 pts |
| **Overall conversion health** | **B- (72)** | **C+ (68)** | **C (65)** | **B+ (85)** | | |

### Drop-off analysis by stage

| Drop-off point | Drop-off rate | Users lost/mo | Top reason (survey) | Top reason (data) | Recovery rate | Action |
|---|---|---|---|---|---|---|
| **Signup → Activation** | 26% | 8,320 | "Didn't understand what to do" (35%) | Empty state after signup, no guidance | 12% (email re-engagement) | Guided onboarding wizard |
| **Activation → Engagement** | 47% | 11,200 | "Not useful enough to return" (28%) | No value in first session, no habit formed | 8% (push notification) | Accelerate time-to-aha |
| **Engagement → Trial** | 78% | 11,200 | "Not sure if worth paying" (32%) | Feature gate hit too early, no upgrade trigger | 5% (email offer) | Value-based upgrade prompts |
| **Trial → Paid** | 68% | 3,200 | "Too expensive" (38%) | Trial ended without conversion event | 10% (discount offer) | Usage-based pricing, extend trial for active users |
| **Paid → Churn** (monthly) | 27% (Starter) | 1,100 | "Not getting enough value" (42%) | Low feature usage, no stickiness | 15% (win-back) | Proactive outreach at 30 days inactive |

### Time-in-stage (days)

| Stage | Median | P25 | P75 | P90 | Target | Stuck threshold | Stuck % |
|---|---|---|---|---|---|---|---|
| **Signup → Activation** | 14 days | 3 days | 28 days | 45 days | < 7 days | > 30 days | 22% |
| **Activation → Engagement** | 21 days | 7 days | 42 days | 60 days | < 14 days | > 45 days | 18% |
| **Engagement → Paid** | 28 days | 10 days | 60 days | 120 days | < 21 days | > 90 days | 25% |
| **Starter → Pro upgrade** | 8 months | 3 months | 14 months | 22 months | < 6 months | > 12 months | 35% |
| **Pro → Enterprise** | 14 months | 6 months | 24 months | 36 months | < 12 months | > 24 months | 30% |
| **Dormant → Re-activated** | 45 days | 20 days | 90 days | 180 days | < 30 days | > 60 days | 40% |

### Journey friction points

| Friction category | Occurrences (avg/journey) | % of total friction | Impact on conversion | Top affected stage | Resolution |
|---|---|---|---|---|---|
| **Onboarding complexity** | 1.2 | 28% | -18% conversion | Signup→Activation | Simplify setup, reduce steps |
| **Feature discovery** | 0.9 | 22% | -15% engagement | Activation→Engagement | In-app guidance, contextual hints |
| **Pricing confusion** | 0.8 | 18% | -22% trial→paid | Engagement→Paid | Transparent pricing, calculator |
| **Support escalation** | 0.6 | 15% | -12% retention | Paid→Retained | Self-service, better docs |
| **Permission/setup** | 0.5 | 12% | -10% activation | Signup→Activation | Pre-configured defaults |
| **Integration complexity** | 0.2 | 5% | -8% engagement | Activation→Engagement | Pre-built integrations |
| **Total** | **4.2** | | | | |

### Friction heatmap by journey stage and persona

| Persona | Signup | Activation | Engagement | Trial | Paid | Retention | Avg friction |
|---|---|---|---|---|---|---|---|
| **Individual developer** | Low | Low | Low | Medium | Low | Low | 2.8 |
| **Small team (2-10)** | Low | Medium | Medium | High | Medium | Medium | 4.5 |
| **Mid-size (11-100)** | Medium | High | High | High | High | Medium | 5.8 |
| **Enterprise (100+)** | High | High | High | High | High | High | 6.2 |
| **Non-technical user** | High | High | High | High | High | High | 6.5 |

### Activation (aha moment) health

| Activation metric | Current | 3 months ago | Target | Notes |
|---|---|---|---|---|
| **Activation rate** (reach aha) | 74% | 72% | 80% | 74% of signups reach the defined aha moment |
| **Time-to-aha** (median) | 8.5 min | 10.2 min | < 5 min | Time from signup to first aha moment |
| **Aha moment reach** (ever) | 68% | 65% | 85% | 68% of all registered users ever reached aha |
| **First-session aha** | 42% | 38% | 60% | 42% reach aha in the first session |
| **First-session bounce** | 42% | 45% | < 30% | 42% leave within 5 min, never return |
| **Day-1 retention** | 45% | 42% | 55% | Return within 24 hours of signup |
| **Day-7 retention** | 28% | 25% | 35% | Active 7 days after signup |
| **Day-30 retention** | 18% | 16% | 25% | Active 30 days after signup |
| **Overall activation** | **B- (72)** | **C+ (68)** | **B+ (85)** | |

### Aha moment definition by plan

| Plan | Aha moment | Current reach rate | Time-to-aha | Actions to aha | Completion rate |
|---|---|---|---|---|---|
| **Free** | Create and share first project | 68% | 8.5 min | 5 actions | 74% |
| **Starter** | Invite 3+ team members, create 5+ projects | 52% | 14 days | 12 actions | 65% |
| **Pro** | Run first advanced report, set up API access | 38% | 21 days | 18 actions | 55% |
| **Enterprise** | Configure SSO, onboard 10+ users, create custom dashboard | 22% | 45 days | 25 actions | 42% |

### Onboarding step completion

| Onboarding step | Start rate | Completion rate | Drop-off rate | Time spent | Top drop-off reason |
|---|---|---|---|---|---|
| **Step 1: Create account** | 100% | 95% | 5% | 1.2 min | Password requirements |
| **Step 2: Verify email** | 95% | 82% | 13% | 2.5 min | Email delay, spam folder |
| **Step 3: Create first project** | 82% | 68% | 14% | 3.2 min | "Not sure what to name it" |
| **Step 4: Invite team member** | 68% | 45% | 23% | 4.5 min | "Not ready to invite yet" |
| **Step 5: Complete profile** | 45% | 32% | 13% | 2.8 min | "Why do you need this?" |
| **Step 6: Explore features** | 32% | 22% | 10% | 5.5 min | Overwhelmed by options |
| **Overall completion** | | **22%** | **78% total drop** | | |

### Lifecycle stage transitions (monthly)

| From → To | New | Onboarding | Active | Power | At-risk | Churned | Total |
|---|---|---|---|---|---|---|---|
| **New** | — | 52% (382K) | 28% (206K) | 8% (59K) | 8% (59K) | 4% (29K) | 735K |
| **Onboarding** | 5% (23K) | — | 65% (300K) | 15% (69K) | 10% (46K) | 5% (23K) | 462K |
| **Active** | 2% (11K) | 8% (42K) | — | 72% (378K) | 12% (63K) | 6% (32K) | 525K |
| **Power** | 1% (3K) | 3% (8K) | 18% (45K) | — | 68% (171K) | 10% (25K) | 252K |
| **At-risk** | 0% | 5% (4K) | 15% (13K) | 25% (21K) | — | 55% (46K) | 84K |
| **Churned** | 0% | 2% (1K) | 5% (2K) | 3% (1K) | 10% (4K) | — | 42K |

### Re-engagement effectiveness

| Channel | Reach rate | Open/click rate | Re-activation rate | Cost per re-activation | Best for stage |
|---|---|---|---|---|---|
| **Email (product update)** | 85% | 22% open, 8% click | 12% | $2.50 | At-risk, churned |
| **Email (personalized)** | 85% | 35% open, 15% click | 18% | $4.20 | At-risk, dormant |
| **Push notification** | 62% (opted-in) | 28% tap | 15% | $0.50 | Active, at-risk |
| **In-app message** | 100% (if active) | 42% view | 22% | $0.10 | Active, onboarding |
| **Retargeting ads** | 45% | 3% CTR | 5% | $12.00 | Churned > 30 days |
| **Sales outreach** | 95% (Enterprise) | 55% reply | 25% | $85.00 | Enterprise at-risk |

## Action recommendations

1. **First-session bounce reduction**: 42% bounce in first 5 min; implement guided onboarding wizard, skip optional steps, pre-fill with defaults, target < 30% bounce
2. **Time-to-aha acceleration**: 8.5 min to aha, only 42% reach in first session; reduce setup steps from 5 to 3, pre-create sample project, target < 5 min to aha
3. **Engagement→Paid conversion**: 78% drop-off, 25% stuck > 90 days; implement usage-based upgrade prompts, show value metrics ("you've saved 12 hours"), target 15% conversion
4. **Onboarding step optimization**: 78% total drop-off across 6 steps; reduce to 3 essential steps, make team invite optional, auto-complete profile from signup data
5. **Enterprise onboarding friction**: 6.5 friction score, 22% aha reach; dedicated onboarding specialist, pre-configured workspace, SSO setup assistance
6. **Dormant user re-engagement**: 40% of dormant users take > 60 days to re-activate; trigger personalized re-engagement at 14 days dormant, not 60 days
7. **Pricing friction reduction**: 18% of friction is pricing confusion; add pricing calculator, ROI estimator, transparent comparison, "start free, upgrade when ready" messaging
8. **Advocate program expansion**: 14% retained→advocate, 8.5K advocates; create formal advocate program, referral rewards, case study pipeline, target 20% advocate rate
9. **Trial extension for active users**: 68% trial→paid drop-off; auto-extend trial for users with high engagement, trigger conversion when usage hits natural limit
10. **Monthly journey review**: review stage conversion, drop-off hotspots, time-in-stage, friction points, activation health, and lifecycle progression with product, UX, and growth



- The ideal journey fallacy → designing the journey for the perfect customer who reads every tooltip, clicks every CTA, and follows every step in order; real customers are distracted, impatient, and on mobile — design for the messy journey
- Onboarding as feature tour → treating onboarding as a chance to show off every feature instead of getting the user to value as fast as possible; nobody cares about your features — they care about their problem being solved
- The "we'll fix it later" drop-off → seeing a 78% drop-off between engagement and paid and saying "that's normal for freemium"; every drop-off is a failure of the product to demonstrate value, not a law of nature
- Lifecycle stage as a permanent label → treating "at-risk" or "churned" as terminal states; customers move between stages constantly — a churned customer who had a great experience is a future advocate on a different product
- Journey mapping as a one-time workshop → creating a beautiful journey map in a 2-day workshop and never updating it; the journey changes with every feature, every pricing change, and every competitor move — it's a living document, not wall art

## Related

- Same class: [dashboard-customer-health](dashboard-customer-health.md) — customer health
- Same class: [dashboard-feature-adoption](dashboard-feature-adoption.md) — feature adoption
- Same class: [dashboard-product-portfolio](dashboard-product-portfolio.md) — product portfolio
- Same class: [dashboard-pricing-packaging](../../strategy/dashboard-pricing-packaging.md) — pricing and packaging
- Same class: [dashboard-product-strategy](../../strategy/dashboard-product-strategy.md) — product strategy
- References: Intercom — *The Onboarding Handbook*; Nir Eyal — *Hooked: How to Build Habit-Forming Products*; OpenView — *Product-Led Growth Framework*; Amplitude — *The North Star Playbook*; Lenny Rachitsky — *How to Build a Growth Model*; Casey Winters — *Retention and Engagement*