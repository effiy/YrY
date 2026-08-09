---
title: north-star metric
aliases:
- North Star Metric
- NSM
- North Star
tags:
- metrics
- strategy
- north-star
- growth
- product-management
category: product-manager/discovery/metrics
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
benefit: PMs can make data-informed product decisions with clear metrics and frameworks
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./ai-product-metrics.md
- ./retention-and-churn.md
- ../../../executive/strategy/product-strategy-framework.md
- ../../../executive/strategy/now-next-later-roadmap.md
tacit: false
---

# north-star metric (North Star Metric)

> **As a** product manager, **I want to** north star metric, **so that** product decision clear.

> The single core metric that best reflects the value a product creates for customers — the whole company aligns on "the most important thing".

## Summary

- The north-star metric is the single core metric that reflects the value a product creates for customers (not company revenue)
- Popularized by Sean Ellis and Andrew Chen, used to reduce metric fragmentation, distinguish vanity metrics from value metrics
- Six characteristics: measures customer value, reflects strategy, measurable, decomposable, reflects sustainable growth, hard to game
- Must pair with guardrail metrics — prevent "gaming the north star" from harming other values (e.g. LTV/CAC, security incident count)

## Core viewpoints

- **The North Star is a strategic choice, not a measurement choice. It declares what kind of value the company believes matters most.** Choosing "messages sent per user" as the North Star optimizes for engagement depth; choosing "successful tasks completed per user" optimizes for utility. Both are valid metrics, but they lead to fundamentally different product decisions. The North Star is not "what can we measure" — it is "what do we want to become?"

- **A North Star that cannot be decomposed into team-level input metrics is a slogan, not a metric.** "Delight our customers" is a mission statement, not a North Star. The North Star must be a number that can be broken down into the specific behaviors that drive it. If the engineering team cannot point to a specific metric they own that feeds into the North Star, the North Star is not operational. The decomposition is the bridge between company strategy and team execution.

- **The guardrail metrics are as important as the North Star, and they are the ones teams ignore until it is too late.** The North Star says "go faster"; the guardrails say "don't crash." When the North Star is green and the guardrails are red, the team is optimizing for the metric at the expense of the business. The most famous example: a marketplace that optimizes for GMV but ignores fraud rate, only to discover that 30% of transactions are fraudulent. The guardrails must be reviewed in the same meeting as the North Star, with equal weight.

- **The North Star should be stable for years, but the input metrics should change every quarter.** The North Star defines the enduring value the company creates. It should change only when the company's strategy fundamentally shifts. But the input metrics — the specific behaviors that drive the North Star — should change as the team learns which levers actually move the needle. A team that keeps the same input metrics for 4 quarters is not learning; they are executing on autopilot.

- **The most common North Star mistake is choosing a metric that can be gamed by a single team acting alone.** If the marketing team can increase the North Star by buying more ads, the North Star is measuring spend, not value. A robust North Star requires cross-functional contribution: product, engineering, marketing, and customer success must all be able to impact it through their specific domains. This forces alignment because no single team can succeed in isolation.


- Value metric ≠ vanity metric — DAU / PV / registration count are vanity metrics, cannot be the north star
- Must be decomposable — decompose the north star into input metrics to teams, otherwise teams don't know how to impact it
- Cannot celebrate if guardrails miss — north star up but guardrails collapse (hallucination rate / LTV/CAC / security) equals failure
- Quarterly review — strategy changed, north star may also need to change

## Key information

### Concept breakdown: six characteristics

| Characteristic | Meaning |
|---|---|
| Measures customer value | Not measuring company revenue |
| Reflects strategy | Concrete embodiment of strategic goal |
| Measurable | Has numbers and definitions |
| Decomposable | Can be broken into sub-metrics to teams |
| Reflects sustainable growth | Not a short-term gameable metric |
| Hard to game | Gaming cannot lift it |

### Key parameter: candidate templates (by business type)

| Business type | North star candidate | Example |
|---|---|---|
| Content community | Per-user content consumption time | Reddit: view time per user |
| Tool | Count of successfully completed tasks | Calendly: meetings booked |
| SaaS | Number of highly active customers | Atlassian: paid active accounts |
| Marketplace | GMV / match count | Airbnb: nights booked |
| Subscription | Retained paying user LTV | Netflix: monthly retention |
| AI assistant | Per-user successful task count | OpenAI: useful sessions per user |
| Education | Learning completion | Coursera: completed modules |

### Concept breakdown: north star → input metrics

```
North star: successful tasks per user
  ├ Input 1: Task Success rate
  │   ├ Input 1.1: faithfulness ≥ 95%
  │   └ Input 1.2: tool call success rate ≥ 90%
  ├ Input 2: Tasks initiated per user (sessions per user × tasks/session)
  │   ├ Input 2.1: first-time success rate (Activation)
  │   └ Input 2.2: weekly active days
  └ Input 3: User base growth
```

Each team aligns on 1-2 input metrics as its team-level north star.

### Key parameter: health thresholds

| Color | Meaning | Action |
|---|---|---|
| Green | Reached goal | Maintain |
| Yellow | 10-20% below goal | Analyze attribution |
| Red | > 20% below goal | Pause new features, focus on north star |

### Related metric types

| Type | Meaning |
|---|---|
| North star | Whole company aligned |
| Input metric | Team-level goal |
| Guardrail metric | Prevent "gaming the north star" from harming other values, e.g. LTV / CAC, security incident count |
| Retention metric | Ceiling of the north star |

Guardrail example: north star = successful tasks per user; guardrails = hallucination rate ≤ 5%, LTV/CAC ≥ 3, security incidents 0.

### Applicable scenarios

- Whole company strategic alignment
- Quarterly planning and team goal decomposition
- Distinguishing vanity metrics from value metrics

## Action recommendations

1. **Clarify strategy**: long term, what value are we creating for customers?
2. **List candidate metrics**: 3-5 candidates
3. **Filter vanity**: remove DAU / PV / registration count etc.
4. **Confirm decomposable**: can be broken down to sub-teams and execution items
5. **Public commitment**: the whole company knows this is the north star
6. **Quarterly review**: strategy changed, the north star may also need to change
7. **Pair with guardrail metrics**: guardrails not met = cannot celebrate even if north star is achieved

## Anti-patterns

- **The North Star by committee: averaging everyone's favorite metric into a hybrid that measures nothing.** When the marketing team wants "reach," the product team wants "engagement," and the finance team wants "revenue," the compromise is a composite metric that is too vague to be actionable. The North Star is a leadership decision, not a consensus decision. The CEO or CPO must choose, and the rest of the organization must align. A committee-chosen North Star is a political document, not a strategic one.

- **Confusing the North Star with the business model.** Revenue is the result of a healthy business, not the North Star. A product that optimizes for revenue will add monetization features at the expense of user experience. The North Star should measure the value the product creates for users; revenue is the business's reward for creating that value. If revenue is the North Star, the product team is incentivized to extract value rather than create it.

- **The North Star that is too lagging to be actionable.** "Annual recurring revenue" is a critical business metric, but it moves too slowly to guide weekly product decisions. By the time ARR drops, the underlying user behavior problems have been present for months. The North Star should be a metric that moves within weeks, not quarters, so the team can see the effect of their decisions in a reasonable timeframe.

- **North Star decomposition that becomes a cascade of vanity metrics.** When the North Star is "successful tasks per user" and the decomposition produces "page views per user" as an input metric, the chain is broken. Page views do not lead to task success. The decomposition must be a causal model, not a correlation model. Each input metric should answer the question: "if we improve this, does the North Star predictably improve?" If the answer is "we don't know," the input metric is a guess.

- **The North Star that changes with every reorg.** When a new leader arrives and changes the North Star to signal a new direction, the organization learns that the North Star is a leadership communication tool, not a strategic commitment. The North Star should outlast individual leaders. If the strategy genuinely requires a new North Star, the change must be accompanied by a clear explanation of why the old North Star is no longer the right measure of customer value.



## Related

- Same class: [ai-product-metrics-summary.md](./ai-product-metrics.md) — AI product-specific metrics
- Same class: [retention-and-churn-summary.md](./retention-and-churn.md) — retention is the north star ceiling
- Upstream: [../../../executive/strategy/product-strategy-framework.md](../../../executive/strategy/product-strategy-framework.md) — strategy level
- Upstream: [../../../executive/strategy/now-next-later-roadmap.md](../../../executive/strategy/now-next-later-roadmap.md) — roadmap alignment
- References: Sean Ellis — *Hacking Growth*; Andrew Chen — *Growth Is a System, Not a Tactic*; Lenny Rachitsky — *The North Star Framework*
