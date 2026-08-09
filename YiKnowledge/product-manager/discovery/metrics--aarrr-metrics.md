---
title: AARRR Pirate Metrics Framework
aliases:
  - AARRR metrics
  - Pirate metrics
  - AARRR framework
  - Acquisition Activation Retention Revenue Referral
tags:
  - metrics
  - growth
  - aarrr
  - pirate-metrics
  - product-management
  - funnel
category: product-manager/discovery/metrics
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - product-manager
  - executive
benefit: PMs can diagnose growth bottlenecks across the full user lifecycle from acquisition through referral, using a proven five-stage funnel framework
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - north-star-metric.md
  - retention-and-churn.md
  - funnel-conversion.md
  - ../../frameworks/heart-aarrr-metrics.md
  - ../../../executive/strategy/README.md
tacit: false
---

# AARRR Pirate Metrics Framework

> **As a** product manager, **I want to** measure and optimize each stage of the AARRR funnel, **so that** I can identify the specific growth bottleneck and focus the team on the right metric at the right stage.

> "Pirate Metrics" (AARRR) is a framework for measuring and optimizing the user lifecycle across five stages: Acquisition, Activation, Retention, Revenue, Referral. The name comes from the acronym sounding like a pirate's "Aarrr!" -- coined by Dave McClure at 500 Startups in 2007.

## Summary

- AARRR organizes the user lifecycle into five sequential stages, each with its own metrics, optimization levers, and typical bottlenecks. The framework is a diagnostic tool, not a dashboard.
- The stages are not equally important at all times. Early-stage products focus on Acquisition and Activation; growth-stage products focus on Retention and Revenue; mature products focus on Referral and defending against churn.
- The biggest insight from AARRR is that Retention is the most important and most neglected stage. Optimizing Acquisition while Retention is broken is like pouring water into a leaky bucket.
- Each stage has a "one metric that matters" (OMTM) during a given quarter. The team should align on the OMTM and focus all experiments on improving it.
- AARRR is a framework for consumer/internet products. For B2B/SaaS products, it is often adapted to include Expansion (upsell) as a separate stage between Retention and Revenue.

## Core viewpoints

- **Retention is the keystone metric** -- without Retention, everything else is vanity. A product with strong Retention but weak Acquisition has a marketing problem. A product with strong Acquisition but weak Retention has a product problem. The latter is far more common and far more dangerous.
- **Activation is the "aha moment"** -- the point where the user first experiences the core value of the product. It is not "created an account" or "logged in for the first time." It is the specific action that correlates with long-term retention. For Facebook, it was "added 7 friends in 10 days." For your product, you must find your own activation metric.
- **Each stage has a leak, and the leaks are not equal** -- a 10% improvement in Retention is typically worth more than a 10% improvement in Acquisition, because retained users compound over time. Diagnose the biggest leak first, not the easiest one.
- **Revenue is a lagging indicator of Activation and Retention** -- if users are not activating and retaining, revenue will not follow. Do not optimize Revenue before Activation and Retention are healthy.
- **Referral is the multiplier** -- it amplifies the effects of all other stages. A product with strong Retention and high Referral has a viral growth loop. A product with strong Referral but weak Retention has a leaky viral loop (users invite friends, but both leave).

## Key information

### Framework origin

Dave McClure coined the AARRR framework in 2007 at 500 Startups as a practical model for startup metrics. The framework was designed to counteract the tendency of startups to focus on vanity metrics (total users, page views) and instead focus on the metrics that actually matter for growth.

### The five stages

| Stage | Definition | Key metric | Optimization lever |
|---|---|---|---|
| Acquisition | How users find and arrive at your product | Cost per acquisition (CPA), channel conversion rate | Marketing channels, landing pages, SEO, content marketing |
| Activation | Users' first experience -- the "aha moment" | Activation rate (% of signups who reach the activation event) | Onboarding flow, first-run experience, guided tours |
| Retention | Users coming back repeatedly | Day-7/30/90 retention, weekly active users (WAU) | Push notifications, email re-engagement, habit-forming features |
| Revenue | Users paying for the product | ARPU, LTV, conversion to paid, churn rate | Pricing, packaging, payment flows, upsell/cross-sell |
| Referral | Users telling others about the product | Net Promoter Score (NPS), viral coefficient (k-factor), referral rate | Referral programs, social sharing, word-of-mouth incentives |

### Detailed stage metrics

**Acquisition metrics:**
- Channel breakdown: % of users from organic search, paid, social, referral, direct
- Cost per acquisition (CPA) by channel
- Conversion rate from visitor to signup
- Time to first visit

**Activation metrics:**
- Activation rate: % of signups who complete the activation event
- Time to activation: how long from signup to activation event
- Activation event definition: the specific action that correlates with long-term retention (varies by product)
- Bounce rate on key onboarding screens

**Retention metrics:**
- Day-1, Day-7, Day-30 retention: % of users who return on each day
- Weekly active users (WAU) / Monthly active users (MAU)
- DAU/MAU ratio (stickiness): > 20% is good, > 50% is exceptional
- Churn rate: % of users who stop using the product
- Cohort retention curves: retention by signup cohort

**Revenue metrics:**
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)
- LTV/CAC ratio: > 3 is healthy
- Conversion rate to paid
- Monthly Recurring Revenue (MRR) for SaaS
- Churn MRR

**Referral metrics:**
- Net Promoter Score (NPS)
- Viral coefficient (k-factor): average number of new users each existing user brings in
- Referral conversion rate: % of invited users who sign up
- Viral cycle time: how long it takes for one referral loop to complete

### Stage-by-stage diagnostic framework

When growth is not meeting targets, diagnose the AARRR funnel:

| Symptom | Likely stage problem | Diagnostic question |
|---|---|---|
| Traffic is growing but signups are flat | Acquisition | Is the right traffic arriving? Are landing pages converting? |
| Signups are growing but few reach activation | Activation | Is the onboarding too long? Is the activation event clear? |
| Activation is high but retention is low | Retention | Is the product delivering ongoing value? Are there habit loops? |
| Retention is high but revenue is low | Revenue | Is the pricing right? Is the value clear enough to justify paying? |
| Revenue is growing but referral is low | Referral | Is the product remarkable enough to talk about? Are there sharing mechanisms? |

### AARRR for AI products

AI products add specific metrics to each stage:

| Stage | AI-specific metric |
|---|---|
| Acquisition | % of users who heard about the product through AI model directories or benchmarks |
| Activation | First successful AI-assisted task completion (not just first message sent) |
| Retention | Weekly active AI users (% of users who used AI features at least once per week) |
| Revenue | Cost per AI query vs. revenue per AI query (margin per interaction) |
| Referral | Share rate of AI-generated outputs; users sharing AI results with colleagues |

### When to use vs. when not to use

**Use AARRR when:**
- The product is a consumer or self-serve internet product with a clear user lifecycle
- The team needs a shared language for growth metrics
- Growth is not meeting targets and the bottleneck is unclear
- The product has enough users to measure each stage meaningfully (> 1,000 MAU)

**Do NOT use AARRR when:**
- The product is enterprise SaaS with a sales-led motion (use a pipeline model instead)
- The product is a marketplace (use a GMV or liquidity model instead)
- The product is pre-product-market fit with fewer than 100 users (focus on qualitative feedback)
- The metric is being used as a dashboard rather than a diagnostic tool (AARRR is for diagnosis, not reporting)

## Action recommendations

1. For each AARRR stage, define the one metric that matters (OMTM) for this quarter. Choose the stage with the biggest bottleneck.
2. Define the activation event: the specific user action that correlates with Day-30 retention. Run a correlation analysis to find it.
3. Build cohort retention curves. Track Day-1, Day-7, Day-30 retention by signup cohort. If retention curves are not flattening, the product does not have product-market fit.
4. Calculate LTV/CAC ratio. If LTV/CAC < 3, the growth model is unsustainable. Either improve retention (increase LTV) or reduce acquisition cost (decrease CAC).
5. Measure the viral coefficient. If k-factor > 1, the product has viral growth. If k-factor < 0.5, referral is not a meaningful growth channel.
6. Focus experiments on the bottleneck stage. Do not optimize Referral if Activation is broken. The stages are sequential; fix them in order.
7. For AI products, add AI-specific metrics to each stage (see table above).

## Anti-patterns

- **Obsessing over Acquisition while ignoring Retention** -- the most common failure. A leaky bucket with a bigger hose is still a leaky bucket. Fix Retention before scaling Acquisition.
- **Vanity metrics as AARRR metrics** -- "total registered users" is not Acquisition; it is a vanity metric. "Organic signups per week by channel" is Acquisition. AARRR metrics must be actionable.
- **Skipping the activation event definition** -- "users who logged in" is not activation. Find the specific action that correlates with long-term retention. Run a correlation analysis.
- **AARRR as a fixed dashboard** -- treating AARRR as a report instead of a diagnostic tool. The framework is for finding bottlenecks, not for weekly status updates.
- **Optimizing Revenue before Retention** -- monetizing users who are about to churn generates short-term revenue but destroys long-term value. Retention must be healthy before Revenue optimization.

## Related

- Same class: [north-star-metric.md](./north-star-metric.md) -- the North Star metric is the single metric that aligns the company; AARRR metrics decompose the North Star into stages
- Same class: [retention-and-churn.md](./retention-and-churn.md) -- retention is the keystone of AARRR; detailed retention and churn analysis
- Same class: [funnel-conversion.md](./funnel-conversion.md) -- conversion funnel analysis within and across AARRR stages
- Upstream: [../../frameworks/heart-aarrr-metrics.md](../../frameworks/heart-aarrr-metrics.md) -- HEART + AARRR combined framework
- Upstream: [../../../executive/strategy/README.md](../../../executive/strategy/README.md) -- strategy alignment for AARRR stage focus
- References: Dave McClure -- *Startup Metrics for Pirates* (2007); Sean Ellis -- *Hacking Growth*; Andrew Chen -- *The Cold Start Problem*