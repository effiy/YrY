---
title: Product strategy framework summary
aliases:
- Product Strategy Framework
- product strategy layers
- strategy framework overview
tags:
- product-strategy
- framework
- JTBD
- North Star
- AARRR
- Kano
- OKR
category: executive/strategy
created: 2024-05-12
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- executive
- product-manager
benefit: strategy aligned
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./business-model-canvas.md
- ./now-next-later-roadmap.md
- ./porter-five-forces.md
- ./blue-ocean.md
- ./second-curve.md
- ../../product-manager/discovery/metrics--north-star-metric.md
tacit: false
---

# Product strategy framework summary

> **As an** executive,**I want to** product strategy framework,**so that** strategy aligned.

> Overview framework of strategy layers + analysis tools + goal management + user analysis + growth metrics + priority decisions.

## Summary

- Strategy layers, four levels: vision → strategy → roadmap → tactics
- Strategy analysis tools: SWOT, Porter five forces, PEST/PESTEL, blue ocean strategy
- Goal management: OKR (quarterly + biweekly alignment), balanced scorecard
- User analysis: JTBD (hire a product to get a job done), Kano (basic / expected / excited)
- Growth metrics: North Star, AARRR / RARRA, growth loops; priority: RICE / MoSCoW / ICE

## Core viewpoints

- Strategy layers must be separated — vision (3-5 years) → strategy (key path) → roadmap (milestones) → tactics (execution); mixing layers lets tactical decisions hijack strategy
- Focus on core user value — be wary of "what can be done" vs "what should be done"; subtraction is harder than addition but more important
- Balance long-term and short-term — 70% resources for current business, 30% for the future; use Second-order thinking to consider second-order consequences
- Do not go against trends, but be alert to FOMO-driven false demand

## Key information

### Concept breakdown: strategy layers

1. **Vision**: what do we want to become? 3-5 year long-term goal
2. **Strategy**: how do we achieve the vision? Key path selection
3. **Roadmap**: phase goals and milestones
4. **Tactics**: specific execution plan

### Concept breakdown: strategy analysis tools

**SWOT analysis**: internal analysis (strengths / weaknesses) + external analysis (opportunities / threats).

**Porter five forces**: supplier bargaining power, buyer bargaining power, threat of new entrants, threat of substitutes, intra-industry competition.

**PEST / PESTEL**: macro-environment analysis — Political / Economic / Social / Technological (+ Environmental / Legal), suitable for evaluating overseas market entry.

**Blue ocean strategy**: jump out of the red ocean via "value innovation" — eliminate, reduce, raise, create four-step action framework.

### Concept breakdown: goal management

**OKR**: Objective (inspiring qualitative goal) + Key Results (measurable quantitative results, 3-5 of them). Trend: shift from annual OKR to quarterly + biweekly alignment.

**Balanced scorecard**: balance short-term and long-term across four dimensions — financial, customer, internal process, learning and growth.

### Concept breakdown: user and demand analysis

**Jobs-to-be-Done (JTBD)**: users do not buy products, they "hire" products to get a job done.
- Formula: when I [situation], I want to [motivation], so that [expected result]
- Value: jump out of feature piling, focus on what users actually want to accomplish

**Kano model**:
- Basic attributes: absent → dissatisfied, present → no effect
- Expected attributes: more is better, linear
- Excitement attributes: absent → no dissatisfaction, present → delight
- Application: evaluate feature priority, avoid over-investing in basic attributes

### Concept breakdown: growth and metrics

**North Star Metric**: a single metric that represents the product's core value. E.g. Airbnb = bookings; Spotify = total listening time. Key: strongly correlated with long-term value, decomposable into input metrics.

**AARRR pirate metrics**: Acquisition (new users) → Activation (first experience of core value) → Retention (retention, most important) → Revenue (monetization) → Referral (spread). Trend: supplemented as RARRA (retention first), reflecting the mobile era where retention is harder than acquisition.

**Growth loops**: acquisition loop (content SEO → traffic → conversion), viral loop (invite rewards → user fission), retention loop (core value → habit → payment). Key: each loop is quantifiable and scalable.

### Concept breakdown: priority and decisions

| Framework | Formula / meaning | Suitable for |
|---|---|---|
| RICE | Reach × Impact × Confidence / Effort | Quantitative priority ranking |
| MoSCoW | Must / Should / Could / Won't | Version scope control |
| ICE | Impact / Confidence / Ease | Lightweight quick assessment |

### Applicable scenarios

- New business strategy alignment
- Strategy review and transformation discussion
- Quarterly planning and priority ranking

## Action recommendations

1. **Clarify strategy layers**: vision → strategy → roadmap → tactics, identify which layer the discussion is on
2. **Run strategy analysis**: use SWOT + five forces + PEST together
3. **Set OKR**: quarterly Objective + 3-5 Key Results, biweekly alignment
4. **Use JTBD formula for user analysis**: when I [situation], I want to [motivation], so that [expected result]
5. **Use Kano for feature priority**: satisfy basic attributes first, then invest in expected attributes, use excitement attributes for differentiation
6. **Define North Star**: pick one metric that reflects strategy, decompose into input metrics for teams
7. **Use RICE for priority ranking**: avoid gut feel, rank quantitatively

## Anti-patterns

- **Mixing strategy layers by letting tactical execution decisions override strategic direction.** When a quarterly planning meeting starts with "what can we build in the next two weeks" instead of "what strategic goal are we advancing," tactics have hijacked strategy. The result is a product that optimizes for short-term delivery velocity at the expense of long-term coherence. Every tactical decision must be traceable back to a strategic layer: this feature advances this OKR which serves this strategy which moves toward this vision.
- **Treating "what can be done" as equivalent to "what should be done."** The engineering team's capability to build something is not a sufficient reason to build it. Feature factories are built on this confusion: every idea that is technically feasible gets added to the backlog, and the product becomes a collection of capabilities rather than a coherent solution to a specific problem. The harder skill is subtraction -- saying no to good ideas that do not serve the core strategy.
- **Allocating 100% of resources to the current business with no reserve for the second curve.** When every engineer is assigned to current-quarter features, there is no capacity to explore what comes next. The 70/30 split is not a luxury for companies with spare capacity; it is a survival mechanism. The 30% allocated to the future is what ensures the company still exists when the current business reaches its peak and begins to decline.
- **Using first-order thinking to evaluate strategic decisions without considering second-order consequences.** A decision to cut prices to gain market share produces the first-order effect of increased adoption. The second-order effects -- competitors matching the price cut, margin compression across the industry, customers expecting permanent discounts, reduced budget for product investment -- may destroy more value than the initial gain created. Every strategic decision must be evaluated through at least two levels of consequence.
- **Chasing FOMO-driven trends without validating whether the trend creates genuine demand for your specific product and customer base.** The AI boom of 2023-2025 produced a graveyard of "AI-powered" features that customers did not want and would not pay for. The fact that a technology is transformative at the industry level does not mean it is transformative for your specific product. The correct response to a trend is not "how do we add this" but "does this change what our customers need, and if so, how?"

## Related

- Similar: [business-model-canvas-summary.md](./business-model-canvas.md) — business model description
- Similar: [now-next-later-roadmap-summary.md](./now-next-later-roadmap.md) — roadmap design
- Similar: [porter-five-forces-summary.md](./porter-five-forces.md) — five forces analysis
- Similar: [blue-ocean-strategy-summary.md](./blue-ocean.md) — blue ocean strategy
- Similar: [second-curve-summary.md](./second-curve.md) — second curve
- Downstream: [../../product-manager/discovery/metrics--north-star-metric.md](../../product-manager/discovery/metrics--north-star-metric.md) — north-star metric
- Downstream: [../../product-manager/discovery/metrics--ai-product-metrics.md](../../product-manager/discovery/metrics--ai-product-metrics.md) — AI metrics
- Downstream: [../../product-manager/discovery/metrics--retention-and-churn.md](../../product-manager/discovery/metrics--retention-and-churn.md) — retention metrics
