---
title: customer feedback and satisfaction dashboard
aliases:
- customer satisfaction dashboard
- NPS dashboard
- CSAT dashboard
- customer sentiment dashboard
- feedback loop dashboard
- voice of customer dashboard
tags:
- dashboard
- customer-feedback
- nps
- csat
- customer-satisfaction
- sentiment
- feedback-loop
- voice-of-customer
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
- engineer
- tech-lead
benefit: customer satisfaction, feedback quality, and voice-of-customer impact visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- NPS/CSAT/CES trends, feedback collection, sentiment analysis, feedback-to-feature closure, customer effort, and churn risk defined
related:
- ./dashboard-customer-health.md
- ./dashboard-customer-journey.md
- ./dashboard-user-engagement-retention.md
- ./dashboard-product-portfolio.md
- ../strategy/dashboard-product-strategy.md
tacit: false
---

# customer feedback and satisfaction dashboard

> **As a** product manager, **I want to** track customer feedback and satisfaction across all channels, **so that** every piece of feedback is captured, analyzed, and acted upon — turning the voice of the customer from scattered anecdotes into a systematic, measurable, and continuously improving product development input.

> Customer feedback is the raw material of product decisions. This dashboard tracks NPS, CSAT, CES, feedback collection, sentiment analysis, feedback-to-feature closure, customer effort, and churn risk — turning customer sentiment from "someone said something in a support ticket" into a structured, actionable, and continuously improving feedback engine.

## Summary

- 6 feedback dimensions: NPS/CSAT/CES trends, feedback collection channels, sentiment analysis, feedback-to-feature closure, customer effort score, churn risk from sentiment
- 2.1M MAU; 850 NPS responses/month; 12,500 CSAT responses/month; 3,200 CES responses/month; 8,500 support tickets/month
- NPS: 42 (industry avg 38); CSAT: 4.2/5.0; CES: 3.8/5.0 (ease); 850 detractor follow-ups/month; 52% detractor recovery rate
- Feedback collection: 8 channels; 15,000 feedback items/month; 68% structured (surveys, ratings), 32% unstructured (reviews, support, social)
- Sentiment analysis: 85% accuracy; 62% positive, 22% neutral, 16% negative; 8 negative sentiment spikes/month (alerted)
- Dashboard reviewed weekly; voice-of-customer deep-dive with product and support monthly

## Core viewpoints

- NPS tells you loyalty, CSAT tells you satisfaction, CES tells you friction — no single metric captures the full customer experience; NPS 42 means customers recommend you, but CES 3.8 means they're still working too hard to use your product
- The feedback-to-feature loop is the most important product metric nobody tracks — collecting feedback is easy, closing the loop (feedback → analysis → insight → feature → customer notification) is hard; every open feedback loop is a customer who feels unheard
- Negative feedback is more valuable than positive feedback — a detractor who tells you exactly why they're unhappy is giving you a free product roadmap; a promoter who gives you a 10 but no comments is giving you a vanity metric
- Sentiment is a leading indicator of churn — a customer whose sentiment shifts from positive to neutral over 30 days has a 45% chance of churning in the next 60 days; by the time they submit a cancellation request, you're 90 days late

## Key information

### 6-panel customer feedback overview

```
┌──────────────────────────────────────────────────────────────────┐
│  NPS, CSAT, CES TRENDS               │  FEEDBACK COLLECTION CHANNELS         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  NPS: 42 (target: 50)    │   │  │  Channels: 8 active      │   │
│  │  Promoters: 38%          │   │  │  In-app survey: 35%      │   │
│  │  Passives: 36%           │   │  │  Support tickets: 28%    │   │
│  │  Detractors: 26%         │   │  │  Email NPS: 18%          │   │
│  │  CSAT: 4.2/5.0           │   │  │  App store reviews: 8%   │   │
│  │  CES: 3.8/5.0 (ease)     │   │  │  Social media: 5%        │   │
│  │  Satisfaction: B+ (82)   │   │  │  Collection score: B(78) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SENTIMENT ANALYSIS                   │  FEEDBACK-TO-FEATURE CLOSURE         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Positive: 62%           │   │  │  Feedback items/mo: 15K │   │
│  │  Neutral: 22%            │   │  │  Analyzed: 85% (12,750) │   │
│  │  Negative: 16%           │   │  │  Insights generated: 285│   │
│  │  Sentiment accuracy: 85% │   │  │  Features shipped: 22   │   │
│  │  Negative spikes: 8/mo   │   │  │  Customer notified: 68% │   │
│  │  Sentiment shift alerts: │   │  │  Avg closure time: 45d  │   │
│  │  12/mo (pre-churn)       │   │  │  Closure score: C+(68)  │   │
│  │  Sentiment score: B(78)  │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CUSTOMER EFFORT SCORE                │  CHURN RISK FROM SENTIMENT           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  CES: 3.8/5.0 (target:  │   │  │  Predicted churn: 285/mo│   │
│  │  4.5) — too much effort  │   │  │  From sentiment: 185    │   │
│  │  High-effort journeys: 4 │   │  │  (65% of predicted)     │   │
│  │  Top friction: setup     │   │  │  Sentiment→churn lag:   │   │
│  │  (2.8), onboarding (3.2),│   │  │  45 days (avg)          │   │
│  │  billing (3.5)           │   │  │  Detractor recovery: 52%│   │
│  │  Effort trend: -0.2 (worsening)│  │  Recovery cost: $85/   │   │
│  │  CES score: C+ (68)      │   │  │  customer (vs $1,500    │   │
│  └─────────────────────────┘   │  │  acquisition cost)       │   │
│                                │  │  Churn risk score: B(78) │   │
│                                │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### NPS by product and segment

| Product/Segment | NPS | Promoters | Passives | Detractors | Responses/mo | Trend | Target |
|---|---|---|---|---|---|---|---|
| **YiVad** (AI chat) | 48 | 45% | 35% | 20% | 320 | +3 | 55 |
| **YiWeb** (dashboard) | 38 | 35% | 38% | 27% | 250 | +1 | 45 |
| **YiPet** (browser ext) | 45 | 42% | 38% | 20% | 180 | +2 | 50 |
| **YiAi** (agent platform) | 35 | 32% | 36% | 32% | 100 | +5 | 45 |
| **B2B (team admin)** | 52 | 55% | 32% | 13% | 85 | +4 | 55 |
| **B2B (team member)** | 40 | 38% | 36% | 26% | 120 | +1 | 48 |
| **B2C (individual)** | 38 | 35% | 36% | 29% | 445 | 0 | 45 |
| **Enterprise** | 55 | 58% | 30% | 12% | 35 | +2 | 60 |
| **Overall** | **42** | **38%** | **36%** | **26%** | **850** | **+2** | **50** |

### CSAT by interaction type

| Interaction | CSAT (1-5) | Responses/mo | 5-star % | 1-star % | Top driver of dissatisfaction | Top driver of satisfaction |
|---|---|---|---|---|---|---|
| **Support ticket resolution** | 4.5 | 5,200 | 58% | 5% | Resolution time > 24h | First-contact resolution |
| **Onboarding experience** | 3.8 | 1,800 | 32% | 15% | Too many steps, confusing UI | Guided setup wizard |
| **Feature discovery** | 3.5 | 2,200 | 28% | 18% | Can't find feature, poor search | Contextual tips, in-app guidance |
| **Billing/payment** | 3.9 | 850 | 42% | 12% | Unexpected charges, confusing invoice | Clear pricing, easy upgrade |
| **API/docs experience** | 4.1 | 1,500 | 45% | 8% | Missing examples, outdated docs | Interactive API playground |
| **Mobile app** | 4.3 | 950 | 52% | 5% | Slow load, missing desktop features | Push notifications, offline mode |
| **Overall** | **4.2** | **12,500** | **45%** | **8%** | | |

### Customer effort score by journey

| Journey | CES (1-5) | Responses/mo | High effort (> 3 steps) | Top friction point | Impact on retention | Action |
|---|---|---|---|---|---|---|
| **Sign up** | 4.2 | 850 | 18% | Email verification delay | Low | Streamline to social login |
| **Setup/configuration** | 2.8 | 650 | 52% | Too many required fields, unclear setup | High (35% drop at setup) | Simplify setup wizard, add defaults |
| **First core action** | 3.2 | 720 | 38% | Can't find action, terminology confusion | High (28% drop) | Guided first action, templates |
| **Onboarding completion** | 3.5 | 580 | 32% | Time-consuming, repetitive steps | Medium | Skip option, progress indicator |
| **Invite team** (B2B) | 3.8 | 320 | 28% | Permission confusion, email delays | Medium | Bulk invite, pre-configured roles |
| **Billing/upgrade** | 3.5 | 420 | 35% | Hidden pricing, confusing plan comparison | High (22% churn at billing) | Transparent pricing, proration |
| **Integration setup** | 3.0 | 280 | 45% | API key management, auth complexity | Medium | Pre-built integrations, OAuth |
| **Data export** | 3.2 | 180 | 38% | Format limitations, large data timeout | Low (but high sentiment impact) | Async export, multiple formats |
| **Overall** | **3.8** | **3,200** | **35%** | | | |

### Feedback collection channels

| Channel | Volume/mo | Structured % | Response rate | Avg sentiment | Insights generated | Cost/item | Coverage |
|---|---|---|---|---|---|---|---|
| **In-app NPS survey** | 850 | 100% | 12% of active users | 3.8/5 | 45/mo | $0.50 | B2C + B2B |
| **In-app CSAT (post-interaction)** | 5,200 | 100% | 22% of interactions | 4.2/5 | 85/mo | $0.25 | Support, onboarding |
| **In-app CES (post-journey)** | 3,200 | 100% | 18% of journey completions | 3.8/5 | 55/mo | $0.25 | Key journeys |
| **Email NPS (quarterly)** | 2,800 | 100% | 8% of email base | 3.5/5 | 28/mo | $0.15 | All users |
| **Support tickets** | 8,500 | 45% | 100% of tickets | 3.2/5 | 72/mo | $2.50 | All users |
| **App store reviews** | 650 | 55% | 2% of app users | 3.6/5 | 18/mo | $0.00 | Mobile users |
| **Social media** | 1,200 | 5% | N/A | 3.0/5 | 12/mo | $0.00 | Public |
| **Sales/customer success calls** | 450 | 20% | 15% of B2B accounts | 3.8/5 | 35/mo | $15.00 | B2B accounts |
| **Overall** | **~15,000** | **68%** | | **3.6/5** | **285** | **$1.20** | |

### Sentiment analysis performance

| Sentiment category | % of feedback | Accuracy | Precision | Recall | Volume trend | Typical topics |
|---|---|---|---|---|---|---|
| **Positive — delighted** | 28% | 92% | 90% | 88% | +3% | "Love the new feature", "Saved me hours", "Best support" |
| **Positive — satisfied** | 34% | 85% | 82% | 80% | +1% | "Works well", "Good value", "Reliable" |
| **Neutral — indifferent** | 22% | 78% | 75% | 72% | -2% | "It's fine", "Does the job", "No strong feelings" |
| **Negative — frustrated** | 12% | 88% | 85% | 82% | -1% | "Too slow", "Confusing", "Missing feature X" |
| **Negative — angry** | 4% | 95% | 92% | 90% | 0% | "Switching to competitor", "Waste of money", "Bug destroyed my data" |
| **Overall** | **100%** | **85%** | **82%** | **80%** | | |

### Feedback-to-feature closure

| Product | Feedback received | Analyzed | Insights | In backlog | In development | Shipped | Customer notified | Avg closure (days) |
|---|---|---|---|---|---|---|---|---|
| **YiVad** | 4,800 | 4,200 (88%) | 95 | 42 | 18 | 8 | 75% | 38 |
| **YiWeb** | 3,500 | 3,000 (86%) | 72 | 35 | 12 | 6 | 68% | 52 |
| **YiPet** | 2,800 | 2,400 (86%) | 58 | 28 | 10 | 5 | 62% | 48 |
| **YiAi** | 1,800 | 1,500 (83%) | 32 | 15 | 8 | 3 | 55% | 58 |
| **Platform/infra** | 2,100 | 1,650 (79%) | 28 | 18 | 5 | 2 | 70% | 65 |
| **Overall** | **15,000** | **12,750 (85%)** | **285** | **138** | **53** | **22** | **68%** | **45** |

## Action recommendations

1. **Customer effort score improvement**: CES 3.8/5.0, worsening trend (-0.2); simplify setup wizard (2.8→4.0), reduce required fields, add pre-configured templates, target CES 4.5
2. **Detractor recovery program**: 26% detractors (221/month), 52% recovery rate; implement 24-hour detractor response SLA, add executive sponsor for enterprise detractors, target 65% recovery
3. **Feedback-to-feature closure acceleration**: 45-day avg closure, only 68% customer notification; implement 30-day closure SLA, add automated customer notification on feature ship, target 85% closure + 90% notification
4. **Unstructured feedback analysis**: 32% of feedback is unstructured (support tickets, social, reviews); improve NLP sentiment accuracy to 90%, add topic modeling for unstructured feedback, integrate social listening
5. **Negative sentiment spike detection**: 8 negative spikes/month; implement real-time sentiment monitoring, auto-trigger investigation when negative sentiment > 2σ above baseline, add sentiment to incident response
6. **Billing experience friction**: CES 3.5 for billing, 35% high-effort; simplify plan comparison, add transparent pricing calculator, implement proration preview, target CES 4.2
7. **Integration setup friction**: CES 3.0 for integrations, 45% high-effort; build pre-built integration connectors, add OAuth wizard, implement integration health dashboard, target CES 4.0
8. **Sentiment-based churn prediction**: 65% of predicted churn preceded by sentiment shift; integrate sentiment into churn prediction model, trigger retention outreach at sentiment shift (not at churn prediction), target 45-day advance warning
9. **Feedback channel consolidation**: 8 channels, inconsistent data quality; unify feedback into single data model, add consistent taxonomy across channels, implement deduplication for cross-channel feedback
10. **Weekly voice-of-customer review**: review NPS/CSAT/CES trends, sentiment analysis, feedback-to-feature closure, customer effort, and churn risk with product, support, and engineering



- The NPS obsession → optimizing for NPS score instead of customer outcomes; sending "how did we do?" emails after every micro-interaction, gaming the survey with "only respond if you love us" — NPS is a thermometer, not a treatment plan
- The feedback black hole → collecting thousands of feedback items but never closing the loop; a customer who takes the time to write detailed feedback and never hears back is more alienated than a customer who was never asked — silence is the worst response
- Survey fatigue → bombarding customers with NPS, CSAT, CES, and "quick pulse" surveys after every interaction; a customer who receives 8 surveys/month stops responding to all of them — survey strategically, not exhaustively
- Sentiment as a single number → reducing complex customer emotion to "positive/neutral/negative"; a customer who says "this feature is great but the pricing is predatory" is not 50% positive — they're a detractor who happens to like one feature
- The "we'll fix it with AI" sentiment trap → deploying sentiment analysis and calling it "voice of customer"; AI can classify sentiment but can't understand the nuance of "I've been a loyal customer for 5 years and this is the first time I'm disappointed" — that human signal requires human response

## Related

- Same class: [dashboard-customer-health](dashboard-customer-health.md) — customer health
- Same class: [dashboard-customer-journey](dashboard-customer-journey.md) — customer journey
- Same class: [dashboard-user-engagement-retention](dashboard-user-engagement-retention.md) — user engagement and retention
- Same class: [dashboard-product-portfolio](dashboard-product-portfolio.md) — product portfolio
- Same class: [dashboard-product-strategy](../strategy/dashboard-product-strategy.md) — product strategy
- References: Fred Reichheld — *The One Number You Need to Grow*; Gartner — *Customer Effort Score Research*; Qualtrics — *XM Best Practices*; Medallia — *Customer Experience Management*; Forrester — *Voice of the Customer Maturity Model*; Jared Spool — *Beyond NPS*; Bain & Company — *NPS Prism*