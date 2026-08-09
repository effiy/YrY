---
title: customer success health dashboard
aliases:
- CS health dashboard
- customer success dashboard
- CSM dashboard
- adoption health dashboard
- NRR dashboard
- churn prevention dashboard
tags:
- dashboard
- customer-success
- adoption
- churn
- NRR
- expansion
- CSAT
- support
category: product-manager/discovery/metrics
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- product-manager
- executive
- tech-lead
benefit: customer adoption, NRR, churn risk, and CS effectiveness visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- customer health scoring, adoption depth, NRR/churn, CSM effectiveness, support health, and expansion pipeline defined
related:
- ./dashboard-customer-health.md
- ./dashboard-customer-journey.md
- ./dashboard-customer-feedback-satisfaction.md
- ./dashboard-user-engagement-retention.md
- ../../strategy/dashboard-pricing-packaging.md
- ../../../executive/strategy/dashboard-executive-kpi.md
tacit: false
---

# customer success health dashboard

> **As a** product manager, **I want to** track customer success health, **so that** every customer achieves their desired outcome, every churn risk is detected early, every expansion opportunity is captured, and customer success is a measured, proactive, and continuously improving practice — not a "we only hear from them when they're angry" support queue.

> Customer success is where revenue meets relationships. This dashboard tracks customer health scoring, adoption depth, NRR/churn, CSM effectiveness, support health, and expansion pipeline — turning customer success from reactive firefighting into a systematic, predictive, and continuously improving value-delivery engine.

## Summary

- 6 customer success dimensions: customer health scoring, adoption depth, NRR/churn, CSM effectiveness, support health, expansion pipeline
- 1,850 customers; 18 CSMs (1:103 ratio); 48,500 support tickets/year; $85M ARR; 92% gross retention; 115% NRR
- Customer health scoring: 62% healthy (green), 25% at-risk (yellow), 13% critical (red); 8 health dimensions; health score re-calculated weekly
- Adoption depth: 58% feature adoption rate (target 70%); 42% of customers using < 3 features; 15% power users (> 10 features); 22% of licenses unutilized
- NRR/churn: 115% NRR (target 120%); 8% gross churn; 4.5% logo churn; 18% of churn is "silent" (detected after cancellation); average churn warning: 42 days before cancellation
- Dashboard reviewed weekly; CS leadership review with product and executive biweekly

## Core viewpoints

- The best churn prediction is usage — customers who use < 3 features are 4× more likely to churn than customers who use > 10; adoption depth is a more reliable leading indicator than NPS, CSAT, or any survey-based metric
- Customer health is a vector, not a score — a single health score (green/yellow/red) hides the reason: a customer can be green on support (low tickets) but red on adoption (only 2 features used); health scoring must be multi-dimensional and actionable
- Silent churn is a CS process failure — 18% of churn is detected after the customer has already decided to leave; if the first signal of churn is the cancellation email, the CSM wasn't doing their job, or the customer health scoring wasn't working
- NRR is the compound interest of SaaS — 115% NRR means every $1 of ARR becomes $1.15 next year without acquiring a single new customer; improving NRR from 115% to 120% is equivalent to adding $4.25M in new ARR with zero acquisition cost

## Key information

### 6-panel customer success overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CUSTOMER HEALTH SCORING                │  ADOPTION DEPTH                         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Healthy (green): 62%    │   │  │  Feature adoption: 58%   │   │
│  │  At-risk (yellow): 25%   │   │  │  < 3 features: 42%       │   │
│  │  Critical (red): 13%     │   │  │  3-10 features: 43%      │   │
│  │  Health dimensions: 8    │   │  │  > 10 features: 15%      │   │
│  │  Score updated: weekly   │   │  │  License utilization:78% │   │
│  │  Red→yellow: 35% (30d)   │   │  │  Time-to-first-value:    │   │
│  │  Yellow→green: 28% (30d) │   │  │  22 days (target 14)    │   │
│  │  Health score: B- (72)   │   │  │  Adoption score: C+(68) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  NRR & CHURN                           │  CSM EFFECTIVENESS                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  NRR: 115% (target 120%) │   │  │  CSMs: 18 (1:103 ratio)  │   │
│  │  Gross churn: 8%         │   │  │  Avg book: $4.7M ARR     │   │
│  │  Logo churn: 4.5%        │   │  │  QBR completion: 72%     │   │
│  │  Silent churn: 18% of    │   │  │  Touch cadence: 8.5 days │   │
│  │  churn                    │   │  │  (target 7)              │   │
│  │  Expansion ARR: +$12.5M  │   │  │  CSAT for CSM: 4.2/5     │   │
│  │  Churn ARR: -$6.8M       │   │  │  CSM retention: 82%      │   │
│  │  NRR score: B+ (82)      │   │  │  CSM score: B (78)      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SUPPORT HEALTH                        │  EXPANSION PIPELINE                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Tickets/yr: 48,500      │   │  │  Expansion pipeline:     │   │
│  │  Avg FRT: 4.5 hrs        │   │  │  $42M (target $55M)     │   │
│  │  CSAT: 4.0/5 (target 4.3)│   │  │  Upsell: $28M (67%)      │   │
│  │  Escalation rate: 12%    │   │  │  Cross-sell: $14M (33%)  │   │
│  │  Ticket deflection: 35%  │   │  │  Expansion win rate: 42% │   │
│  │  Self-service: 28% (targ │   │  │  Expansion cycle: 12 days│   │
│  │  45%)                    │   │  │  Expansion pipeline       │   │
│  │  Support score: B- (72)  │   │  │  score: B (78)           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Customer health scoring by dimension

| Health dimension | Weight | Green threshold | Yellow threshold | Red threshold | % Green | % Yellow | % Red | Top driver |
|---|---|---|---|---|---|---|---|---|
| **Product adoption** (features used) | 25% | > 5 features | 3-5 features | < 3 features | 52% | 28% | 20% | Onboarding quality, feature discovery |
| **Usage frequency** (DAU/MAU ratio) | 20% | > 40% | 20-40% | < 20% | 58% | 25% | 17% | Workflow integration, habit formation |
| **License utilization** | 10% | > 85% | 60-85% | < 60% | 62% | 22% | 16% | Seat management, procurement |
| **Support health** (ticket volume/severity) | 15% | < 2 tickets/mo | 2-5 tickets/mo | > 5 tickets/mo | 65% | 22% | 13% | Product quality, documentation |
| **NPS/CSAT** | 10% | NPS > 30 | NPS 0-30 | NPS < 0 | 58% | 28% | 14% | Value delivery, relationship |
| **Executive engagement** | 8% | QBR completed, exec sponsor | QBR scheduled | No QBR in 6 months | 55% | 30% | 15% | CSM engagement, exec alignment |
| **Payment health** | 7% | On-time, no disputes | 1-2 late payments | > 2 late, disputes | 82% | 12% | 6% | Billing, procurement, value |
| **Renewal timeline** | 5% | Renewed/ > 6 months | 3-6 months | < 3 months, no conversation | 72% | 18% | 10% | CSM pipeline, proactive renewal |
| **Overall** | **100%** | | | | **62%** | **25%** | **13%** | |

### Adoption depth by customer segment

| Customer segment | Customers | Avg ARR | Feature adoption rate | < 3 features | > 10 features | License utilization | Time-to-first-value | Adoption health |
|---|---|---|---|---|---|---|---|---|
| **Enterprise (> 5K)** | 285 | $280K | 52% | 18% | 22% | 82% | 35 days | Yellow — complex onboarding, slow adoption |
| **Mid-market (500-5K)** | 520 | $95K | 58% | 28% | 15% | 75% | 22 days | Yellow — moderate adoption, good trajectory |
| **SMB (< 500)** | 845 | $35K | 62% | 42% | 8% | 68% | 12 days | Red — high churn risk, shallow adoption |
| **PLG/self-serve** | 200 | $5K | 48% | 55% | 5% | 55% | 8 days | Red — very shallow, high churn |
| **Overall** | **1,850** | **$46K avg** | **58%** | **42%** | **15%** | **78%** | **22 days** | |

### NRR and churn analysis

| Churn type | Count/year | ARR impact | % of total churn | Detectable before | Avg warning | Root cause | Prevention |
|---|---|---|---|---|---|---|---|
| **Feature gap** (competitor has it) | 35 | $2.8M | 28% | Yes (support tickets, feature requests) | 55 days | Product roadmap gap, competitive loss | Feature request tracking, competitive intel |
| **Poor adoption** (never activated) | 28 | $1.8M | 18% | Yes (adoption metrics) | 48 days | Failed onboarding, no time-to-value | 30-60-90 day onboarding, CSM-led activation |
| **Price/value** (too expensive) | 22 | $1.5M | 15% | Yes (payment issues, NPS) | 62 days | Perceived low ROI, budget pressure | Value realization review, ROI calculator |
| **Champion loss** (key contact left) | 18 | $1.2M | 12% | Yes (LinkedIn, relationship) | 35 days | Single point of contact, no multi-thread | Multi-threading, exec sponsor program |
| **Silent churn** (no warning) | 15 | $1.0M | 10% | No (no signal detected) | 0 days | No engagement, CSM didn't detect | Health scoring improvements, automated alerts |
| **M&A/org change** | 12 | $0.8M | 8% | Sometimes | 20 days | Acquired, reorg, strategy change | Multi-threading, contract protection |
| **Support failure** (unresolved issues) | 10 | $0.5M | 5% | Yes (escalation history) | 40 days | Critical bugs, slow resolution | Escalation management, bug prioritization |
| **Other** | 8 | $0.4M | 4% | Varies | Varies | Various | |
| **Overall** | **148** | **$10.0M** | **100%** | | **42 days avg** | | |

### CSM effectiveness by portfolio

| CSM tier | CSMs | Avg accounts | Book of business | QBR completion | Touch cadence | Red accounts per CSM | Red→yellow conversion | CSAT |
|---|---|---|---|---|---|---|---|---|
| **Enterprise CSM** (1:25) | 6 | 25 | $7.0M | 85% | 5 days | 3.2 | 35% | 4.5/5 |
| **Mid-market CSM** (1:80) | 7 | 80 | $6.6M | 68% | 8 days | 10.5 | 28% | 4.2/5 |
| **SMB CSM** (1:200) | 3 | 200 | $7.0M | 45% | 15 days | 26.0 | 18% | 3.8/5 |
| **Digital CS** (1:500) | 2 | 500 | $2.5M | 25% (automated) | Automated | 65.0 | 12% | 3.5/5 |
| **Overall** | **18** | **103** | **$4.7M** | **72%** | **8.5 days** | **13.5** | **28%** | **4.2/5** |

### Support ticket analysis

| Ticket category | Volume/year | % of total | Avg FRT | Avg resolution | CSAT | Escalation rate | Self-service potential | Deflection opportunity |
|---|---|---|---|---|---|---|---|---|
| **How-to/configuration** | 14,500 | 30% | 3.5 hrs | 8.5 hrs | 3.8/5 | 5% | 65% (docs, in-app guides) | 9,400 tickets deflectable |
| **Bug/issue** | 9,700 | 20% | 4.5 hrs | 18.5 hrs | 3.2/5 | 22% | 15% (known issues KB) | 1,500 tickets |
| **Account/billing** | 7,200 | 15% | 2.5 hrs | 5.5 hrs | 3.5/5 | 8% | 35% (self-serve portal) | 2,500 tickets |
| **Feature request** | 5,800 | 12% | 6.5 hrs | 72 hrs | 3.8/5 | 2% | 10% (public roadmap) | 580 tickets |
| **Integration/API** | 4,800 | 10% | 5.5 hrs | 22 hrs | 3.5/5 | 18% | 45% (API docs, examples) | 2,200 tickets |
| **Onboarding/setup** | 3,500 | 7% | 3.5 hrs | 12 hrs | 3.8/5 | 5% | 55% (guided onboarding) | 1,900 tickets |
| **Performance/speed** | 1,800 | 4% | 3.5 hrs | 28 hrs | 2.8/5 | 28% | 10% | 180 tickets |
| **Security/compliance** | 1,200 | 2% | 6.5 hrs | 48 hrs | 3.5/5 | 15% | 20% (security docs, trust center) | 240 tickets |
| **Overall** | **48,500** | **100%** | **4.5 hrs** | **18.5 hrs** | **3.6/5** | **12%** | **35%** | **18,500 deflectable** |

### Expansion pipeline by trigger

| Expansion trigger | Pipeline value | Opportunities | Win rate | Avg deal size | Cycle time | CSM involvement | Top barrier |
|---|---|---|---|---|---|---|---|
| **Usage-based** (exceeded limits) | $15.5M | 185 | 52% | $84K | 8 days | High (proactive) | Procurement for new SKU |
| **Seat expansion** (growing team) | $8.5M | 145 | 48% | $59K | 10 days | Medium (monitoring) | Budget approval, license management |
| **Cross-sell** (new product) | $10.2M | 98 | 32% | $104K | 18 days | High (orchestration) | Product fit, multi-product complexity |
| **Edition upgrade** (premium features) | $5.5M | 72 | 38% | $76K | 14 days | Medium (positioning) | Feature value demonstration |
| **QBR-identified** (quarterly review) | $2.3M | 42 | 45% | $55K | 12 days | High (discovery) | Competing priorities, budget cycle |
| **Overall** | **$42.0M** | **542** | **42%** | **$77K** | **12 days** | | |

## Action recommendations

1. **Red account recovery**: 13% of accounts (240) are critical red; implement red account SWAT program, assign executive sponsor, create 30-day recovery plan per account, target < 8% red
2. **Adoption depth improvement**: 42% of customers using < 3 features; implement guided onboarding with feature discovery, add in-app "next best feature" recommendation, create use-case playbooks, target 70% adoption rate
3. **Silent churn elimination**: 18% of churn undetected before cancellation; implement automated health score alerts, add engagement anomaly detection, require CSM weekly review of low-engagement accounts, target < 5% silent churn
4. **Time-to-first-value acceleration**: 22 days avg (target 14); implement 30-60-90 day onboarding plan, add CSM-led kickoff for all enterprise, create quick-start templates, target 14 days
5. **NRR improvement**: 115% → 120% target; improve expansion pipeline coverage to 4×, reduce gross churn from 8% to 6%, increase cross-sell win rate, target 120% NRR
6. **CSM ratio optimization**: 1:103 ratio, SMB CSMs at 1:200; hire 4 additional CSMs, implement digital CS program for low-touch segment, add CS operations role, target 1:80 ratio
7. **Self-service deflection**: 35% ticket deflection (target 45%); improve knowledge base, add in-app help, implement chatbot, create community forum, target 45% deflection
8. **QBR completion**: 72% completion (target 90%); standardize QBR template, add QBR scheduling automation, tie QBR to renewal process, target 90% completion
9. **Champion loss multi-threading**: 12% of churn from champion departure; implement multi-threading program (3+ contacts per account), add executive sponsor, create relationship map, target < 5% champion-loss churn
10. **Weekly CS review**: review customer health scoring, adoption depth, NRR/churn, CSM effectiveness, support health, and expansion pipeline with CS leadership and product



- The green-score complacency → a customer with a green health score (62%) who hasn't logged in for 30 days is not green — they're a churn time bomb that the scoring model missed; health scores are lagging indicators, engagement is leading
- The QBR-as-checkbox → completing a QBR (72%) doesn't mean the QBR was valuable; a QBR that's a slide deck review of usage stats is a waste of the customer's time — the QBR should uncover new value, not report on existing value
- The "we'll save them at renewal" rescue → noticing a red account 90 days before renewal and launching a rescue plan; by the time the health score is red, the customer has already decided to leave — the decision was made 6 months ago, and the renewal conversation is just the notification
- The CSM-as-support-queue → CSMs spending 60% of their time on reactive support tickets instead of proactive value delivery; the CSM is not tier-2 support — if the CSM is answering "how do I" questions, the self-service and documentation are broken
- The NRR-through-price-increase → growing NRR by raising prices on existing customers without delivering additional value; 115% NRR with 8% gross churn and 15% price increase is not healthy growth — it's extracting more revenue from a shrinking, increasingly dissatisfied base

## Related

- Same class: [dashboard-customer-health](dashboard-customer-health.md) — customer health
- Same class: [dashboard-customer-journey](dashboard-customer-journey.md) — customer journey
- Same class: [dashboard-customer-feedback-satisfaction](dashboard-customer-feedback-satisfaction.md) — customer feedback and satisfaction
- Same class: [dashboard-user-engagement-retention](dashboard-user-engagement-retention.md) — user engagement and retention
- Same class: [dashboard-pricing-packaging](../../strategy/dashboard-pricing-packaging.md) — pricing and packaging
- Same class: [dashboard-executive-kpi](../../../executive/strategy/dashboard-executive-kpi.md) — executive KPI
- References: Gainsight — *Customer Success Maturity Model*; TSIA — *Customer Success Benchmarking*; Nick Mehta — *Customer Success*; Lincoln Murphy — *Customer Success Economics*; Jason Lemkin — *NRR: The North Star of SaaS*; OpenView — *Product-Led Growth Playbook*; ChurnZero — *Customer Health Scoring Guide*