---
title: HEART / AARRR Metrics Framework
aliases:
- HEART Framework
- AARRR Pirate Metrics
tags:
- PM
- methodology
- metrics
- growth
category: product-manager/frameworks
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
- executive
benefit: PMs can select and apply the right PM framework for their specific product challenge
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- okr-design.md
- rice-ice-prioritization.md
- agile-product-management.md
- ../product/metrics/README.md
tacit: false
---

# HEART / AARRR Metrics Framework

> **As a** product manager, **I want to** heart aarrr metrics, **so that** framework applied.

> HEART asks "is this feature good to use" (experience), AARRR asks "is the product growing overall" (funnel); different perspectives but complementary.

## Summary
- HEART was proposed by Google's Kerry Rodden (2011), UX-oriented; AARRR was proposed by Dave McClure (2007), funnel-oriented.
- HEART five dimensions: Happiness / Engagement / Adoption / Retention / Task Success, choose 1-2 dimensions per feature.
- AARRR funnel: Acquisition → Activation → Retention → Referral → Revenue, find the weakest link to optimize.
- Don't spread effort evenly, don't rely on a single metric, set baseline + target for each metric, segment by new/existing/paid, watch LTV/CAC > 3.
- AI product extensions: regeneration rate, tokens per user, first-time success task rate, single-user token cost vs subscription price.

## Core viewpoints

- **Metrics without segmentation are averages that lie.** A 40% D7 retention looks healthy until you split by acquisition channel and discover that organic users retain at 60% while paid-ad users retain at 15%. The overall number masks the fact that you are burning money on ads that acquire users who leave. Every metric dashboard must support one-click segmentation by at least channel, cohort, and plan tier.

- **The AARRR funnel is a diagnostic tool, not a growth strategy.** Dave McClure's key insight is frequently misunderstood: the funnel is for finding the weakest link, not for optimizing every stage simultaneously. A team that tries to improve Acquisition, Activation, and Retention all at once will make marginal progress on all three. A team that focuses exclusively on the bottleneck (e.g., Activation from 20% to 40%) will see a compounding effect throughout the entire funnel.

- **HEART's Task Success dimension is the most underused and most powerful.** Happiness and Engagement are easy to measure (surveys, DAU) but Task Success tells you whether the product actually works. A user who is happy and engaged but fails to complete their task is a user who will eventually churn. For AI products especially, Task Success (did the model produce a correct, usable output?) is the single most important metric and the one most teams skip because it requires human evaluation.

- **Retention is the only metric that compounds, and it is the hardest to move.** Acquisition can be bought with money, Activation can be improved with onboarding, but Retention requires the product to deliver sustained value week after week. A 5% improvement in D30 retention compounds into a 30-50% increase in LTV over 12 months. This is why retention deserves disproportionate investment relative to its visibility in dashboards.

- **Metric goals must be set before the feature ships, not after.** The most common measurement failure is launching a feature and then searching for a metric that moved positively. This is confirmation bias. The discipline: define the success metric and its expected lift before development starts. If the feature ships and the metric does not move, the feature failed — regardless of how much users say they like it.


- **HEART and AARRR perspectives are complementary** — HEART experience (single feature), AARRR growth (whole product); complete measurement needs both.
- **Don't use everything** — HEART all five dimensions creates too many metrics and loses focus, choose 1-2 per feature; AARRR even effort means no focus.
- **Dave McClure emphasizes finding the weakest link to optimize** — the lowest conversion segment in the funnel is the leverage point.
- **LTV / CAC > 3 is healthy** — growth at a loss is an anti-pattern.
- **Segment by new / existing / paid** — healthy overall retention may mask paid churn.

## Key information

### Framework origin

- **HEART**: Google's Kerry Rodden + Philip Hodgson (2011), UX design oriented, focused on single feature / single product experience measurement.
- **AARRR**: Dave McClure (2007, 500 Startups), Pirate Metrics, funnel-oriented growth metrics.

The two perspectives differ but complement: HEART asks "is this feature good to use", AARRR asks "is the product growing overall".

### HEART five dimensions

| dimension | meaning | typical metrics |
|---|---|---|
| Happiness | user satisfaction | NPS, CSAT, ratings |
| Engagement | activity depth | DAU, WAU, usage count per user, session duration per user |
| Adoption | new feature adoption rate | users using new feature / total users |
| Retention | retention rate | D7 / D30 / W4 retention |
| Task Success | task completion | task completion rate, average steps, error rate |

Choose 1-2 dimensions per feature as the goal, no need to use all.

### AARRR funnel

```
Acquisition → Activation → Retention → Referral → Revenue
```

| stage | typical metrics |
|---|---|
| Acquisition | visits, registration conversion rate, customer acquisition cost (CAC) |
| Activation | proportion completing key action (first Aha! moment) |
| Retention | D7/D30/W4 retention |
| Referral | invites, K factor |
| Revenue | ARPU, LTV, paid conversion rate |

Dave McClure emphasizes: **don't spread effort evenly, find the weakest link to optimize**.

### Implementation steps

**HEART**

1. Choose the goal feature (not "whole product")
2. List candidate metrics per dimension
3. Select 1-2 key ones as signals
4. Define the "goal-method-signal-metric" quartet
5. Run AB on data

**AARRR**

1. Draw the current funnel, mark each segment's conversion rate
2. Find the weakest segment (lowest share)
3. Set an improvement goal (increase X% in 30 days)
4. Run improvement experiments (AB / new feature / copy)
5. Re-draw the funnel after retrospective

### Input / output artifacts

- input: event tracking data, user feedback, surveys
- output:
  - HEART: metric definition table + current value + improvement goal
  - AARRR: funnel chart + conversion rate per segment + priority optimization segment

### Comparison with other frameworks

| framework | perspective | suited for |
|---|---|---|
| HEART | experience and feature | single feature optimization |
| AARRR | growth funnel | whole product growth |
| North Star | single focused metric | whole company alignment |
| HEART + AARRR | experience + growth | complete product measurement |

### AI product specific extensions

| HEART dimension | AI product metric |
|---|---|
| Happiness | user regeneration rate, like/dislike ratio |
| Engagement | sessions per user, tokens per user |
| Adoption | new feature usage rate (e.g., adoption rate after Agent launch) |
| Retention | D7 retention, paid renewal rate |
| Task Success | task completion rate, faithfulness, tool call success rate |

| AARRR stage | AI product metric |
|---|---|
| Acquisition | trial registration rate, trial-to-paid conversion rate |
| Activation | first-time success task completion rate |
| Retention | weekly active rate, sessions per user |
| Referral | successful invite count |
| Revenue | single-user token cost vs subscription price |

### Applicable scenarios and boundaries

**HEART suits**:

- Single feature optimization, AB evaluation
- Experience-class products (SaaS, C-end)

**AARRR suits**:

- Whole product growth diagnosis
- Growth hacking experiments

**Not suited for**:

- Internal tools (no Acquisition / Referral)
- Early products (insufficient data samples)

## Action recommendations
1. For single feature optimization use HEART: choose goal feature → choose 1-2 dimensions → define "goal-method-signal-metric" quartet → run AB on data.
2. For whole product growth use AARRR: draw current funnel → mark conversion rates → find weakest segment → 30-day improvement goal → retrospective re-draw.
3. Set baseline + target for each metric; numbers without a goal equal no metric.
4. Segment by new / existing / paid, to avoid overall retention masking paid churn.
5. Watch LTV / CAC > 3; if growth loses money, stop immediately.
6. AI product extension metrics: regeneration rate, tokens per user, first-time success task rate, token cost vs subscription price.
7. Pair with North Star metric for whole company alignment.

## Anti-patterns

- **The dashboard graveyard: 50 metrics, zero action.** Teams that instrument everything but act on nothing are performing measurement theater. Each metric on the dashboard should have a named owner, a target threshold, and a playbook for what happens when the threshold is breached. If a metric has been green for 6 months with no action taken, remove it from the dashboard — it is noise.

- **Using NPS as a product health metric.** NPS measures brand sentiment, not product quality. A user who loves the brand but hates the latest feature will still give a high NPS. Conversely, a user who loves the product but is indifferent to the brand gives a low NPS. For product decisions, use CSAT for specific features, Task Success for usability, and Retention for long-term value. Reserve NPS for brand-level quarterly tracking.

- **AARRR applied to products where the funnel does not apply.** Internal tools, developer APIs, and infrastructure products do not have viral Acquisition or Referral stages. Forcing these products into the AARRR framework produces metrics that are misleading (e.g., "Acquisition" = number of employees who have accounts) and wastes time that should be spent on adoption and task success metrics.

- **Correlation mistaken for causation in metric movements.** When DAU goes up 10% after a feature launch, the temptation is to claim credit. But perhaps it was a holiday, a competitor's outage, or a marketing campaign. The discipline: always check the counterfactual. Did the control group (users who did not see the feature) also show the same lift? If so, the feature was not the cause.

- **Metric targets that are inherited, not derived.** "We want to increase DAU by 20%" without an explanation of why 20% is the right number is a target without a theory. Targets should be derived from a model: if we improve Activation from 20% to 30%, and our acquisition rate stays constant, then DAU should increase by approximately X%. The target is a hypothesis, not a quota.


- **Use all five HEART dimensions** — too many metrics lose focus; choose 1-2 key ones.
- **AARRR even effort** — tweak every segment; attack the weakest link first.
- **Rely on a single metric** — "we look at DAU"; pair with multi-dimension cross-checks.
- **Metrics without goals** — numbers without goals; set baseline + target for each metric.
- **No segmentation** — overall retention looks good; segment by new / existing / paid.
- **Ignore LTV / CAC ratio** — growth at a loss; LTV / CAC > 3 is healthy.

## Related
- Same class: [okr-design-summary.md](./okr-design.md) (OKR sets direction, HEART/AARRR measures progress); [rice-ice-prioritization-summary.md](./rice-ice-prioritization.md) (metric-driven prioritization); [agile-product-management-summary.md](./agile-product-management.md) (iteration cadence + metric regression)
- Upstream: [../product/metrics/README.md](../discovery/metrics--README.md)
- Downstream: YiVad (Engagement + Task Success), YiAi BRD (Activation + Retention)

## References
- Rodden, K. (2011) — *Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Apps* (HEART)
- Dave McClure — *Startup Metrics for Pirates* (AARRR)
