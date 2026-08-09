---
title: Marginal Utility and Diminishing Returns
aliases:
- Marginal Utility
- Diminishing Returns
- Law of Diminishing Returns
tags:
- thinking
- methodology
- economics
- optimization
- resource-allocation
category: knowledge-curator/templates/thinking
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
- product-manager
- tech-lead
- ai-engineer
- knowledge-curator
- executive
- oncall-sre
- new-hire
benefit: Know when to stop — every additional unit of investment delivers less value than the one before it
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- opportunity-cost.md
- sunk-cost-fallacy.md
- compound-interest.md
- first-principles.md
- ../../../product-manager/frameworks/rice-ice-prioritization.md
tacit: false
---

# Marginal Utility and Diminishing Returns

> **As a** tech lead or engineering manager, **I want to** recognize the point of diminishing returns in engineering investments, **so that** I can stop investing before the marginal cost exceeds the marginal benefit and redirect resources to higher-value work.

> The first unit of any investment delivers the highest value. Each subsequent unit delivers less. The 10th engineer on a team adds less value than the 5th. The 3rd month of performance optimization yields less than the 1st. The art is knowing when to stop.

## Summary

- Marginal utility is the additional value (utility) gained from one additional unit of investment. The law of diminishing marginal utility states that as investment increases, the marginal utility of each additional unit eventually decreases.
- In engineering, this applies to almost every resource allocation decision: team size, performance optimization, test coverage, feature development, code review depth, documentation completeness, and monitoring coverage.
- The first 80% of the result comes from 20% of the effort (Pareto principle). The remaining 20% of the result requires 80% of the effort — and each additional percentage point costs more than the last.
- The optimal stopping point is where marginal cost equals marginal benefit. Beyond that point, you are destroying value — the resources could have been better used elsewhere.
- The most common failure mode is not recognizing the curve: teams invest linearly (same effort each sprint) while returns diminish exponentially, leading to massive waste in the tail of every optimization effort.

## Core viewpoints

### 1. The marginal utility curve is universal in engineering
Every engineering investment follows the same shape: steep initial returns, then a plateau, then negative returns. The first 80% of test coverage catches the most critical bugs. The next 15% catches fewer, less critical bugs. The last 5% catches edge cases that may never occur in production, while the test suite becomes so slow that developers skip running it — negative marginal utility. Recognizing this curve is the first step to disciplined resource allocation.

### 2. Team scaling — Brooks's Law is marginal utility in action
Adding a 5th engineer to a 4-person team might increase output by 20%. Adding a 10th engineer to a 9-person team might increase output by 5%. Adding a 15th engineer might decrease output (negative marginal utility) due to coordination overhead. The optimal team size is not "as many as we can get" — it is the point where the marginal value of the next engineer equals the marginal cost (salary + coordination overhead + onboarding drag). This is why small, autonomous teams consistently outperform large teams per capita.

### 3. Performance optimization — the 80/20 trap
Month 1 of performance optimization: identify the 3 slowest queries, add indexes, add caching — 80% improvement. Month 2: optimize ORM patterns, reduce payload sizes — 10% improvement. Month 3: micro-optimize algorithms, inline functions, reduce allocations — 3% improvement. Month 4: assembly-level optimizations, custom memory allocators — 1% improvement. The first month delivered 80% of the value. The fourth month delivered 1% at the same cost. The marginal utility of each additional month of optimization drops precipitously. The right question is not "how fast can we make it?" but "what is the performance target, and what is the cheapest way to hit it?"

### 4. Feature development — the completeness trap
The first 3 features of a product deliver the core value proposition. Features 4-10 add convenience and differentiation. Features 11-50 add complexity, cognitive load, and maintenance burden. Each additional feature has lower marginal utility for users and higher marginal cost for the engineering team. The "feature factory" anti-pattern — shipping features continuously without evaluating their marginal value — leads to bloated products that are hard to use and expensive to maintain. The best products are defined as much by what they omit as by what they include.

### 5. The optimal stopping point
The economic rule: stop when marginal benefit = marginal cost. In practice, this means defining a target (acceptable performance, acceptable test coverage, acceptable team velocity) and stopping when you hit it — not when you run out of ideas for improvement. The target should be based on user value, not engineering idealism. A 99.9% uptime SLA costs 10x more than 99% uptime. Is the 0.9% difference worth 10x the cost? The answer depends on the business, but the question must be asked explicitly.

## Key info

### The marginal utility curve visualized

```
Value
  ^
  |   ***
  |       **
  |         *
  |          *
  |           *
  |            *
  |             *
  |              *
  +---------------------------> Investment (time, people, money)
     Zone A    Zone B   Zone C
     (invest)  (evaluate) (stop)
```

- **Zone A (High marginal utility)**: Each unit of investment returns high value. Invest aggressively.
- **Zone B (Diminishing returns)**: Each unit returns less than the previous. Evaluate carefully. Compare marginal benefit against the opportunity cost of using those resources elsewhere.
- **Zone C (Negative marginal utility)**: Each unit returns negative value. The investment is actively harmful. Stop immediately.

### Engineering domains and their diminishing returns

| Domain | Zone A (High Return) | Zone B (Evaluate) | Zone C (Stop) |
|---|---|---|---|
| Test coverage | 0% → 80% coverage | 80% → 95% coverage | 95% → 100% coverage |
| Performance optimization | Fix slow queries, add caching | ORM optimization, payload reduction | Assembly-level micro-optimizations |
| Team size | 3 → 7 engineers | 7 → 10 engineers | 10+ engineers (split into two teams) |
| Code review depth | Catch logic errors, design issues | Catch style issues, naming conventions | Catch whitespace, personal preference |
| Documentation | Architecture overview, API docs | Edge cases, troubleshooting guides | Every function, every parameter |
| Monitoring | Critical path metrics, error rates | Per-endpoint latency, dependency health | Every internal function call |
| Feature count | Core value proposition (3-5 features) | Convenience features (5-10 features) | Feature bloat (10+ features) |

### How to calculate the stopping point

1. **Define the target**: what is the minimum acceptable level? (e.g., 95% test coverage, 200ms p95 latency, 99.5% uptime)
2. **Estimate the cost of the next increment**: how many engineering hours to go from the current level to the target?
3. **Estimate the benefit of the next increment**: what is the user or business value of that improvement?
4. **Compare**: if benefit > cost, invest. If cost > benefit, stop.
5. **Recalibrate**: the target itself may be wrong. If hitting 99.9% uptime costs 10x more than 99.5%, is the business actually better off?

### The Pareto principle (80/20 rule) as a special case

The Pareto principle is a specific instance of diminishing marginal utility: 80% of results come from 20% of causes. The remaining 20% of results requires 80% of the effort. This is not a law of nature, but it is a useful heuristic for identifying the point of diminishing returns. In practice, the ratio varies — it might be 70/30 or 90/10 — but the principle holds: a small fraction of the effort produces a large fraction of the results.

## Action recommendations

1. For every optimization effort, define the target and the stopping criteria before starting — not during the effort when sunk cost and momentum bias kick in.
2. Use the 80/20 heuristic as a starting point: identify the 20% of the work that delivers 80% of the value, do that first, and then re-evaluate whether the remaining 80% of effort is worth the 20% of value.
3. When scaling a team, add engineers one at a time and measure the actual marginal output — do not assume linear scaling. If the marginal output drops below the marginal cost, stop adding or split the team.
4. For feature development, require explicit marginal value justification for every feature beyond the core set — "what additional value does this feature deliver, and is it worth the additional complexity?"
5. In performance optimization, define the performance budget (e.g., p95 < 200ms) and stop when you hit it — do not optimize beyond the budget.
6. For test coverage, set a target (e.g., 80% line coverage) and a quality gate — do not chase 100% unless the domain requires it (medical devices, aerospace).

## Anti-patterns

- **Optimizing for the sake of optimizing**: "we can make it faster" is not a sufficient reason to optimize. The marginal benefit must exceed the marginal cost.
- **Ignoring the baseline**: in some contexts, the marginal utility is actually increasing, not decreasing — the first unit of investment in a completely neglected area may have zero value until a threshold is reached. This is rare but real (e.g., documentation: the first 10% of documentation may be useless if it does not cover the critical path).
- **Confusing diminishing returns with zero returns**: diminishing returns means less value per unit, not zero value. The 10th feature may still have positive value — the question is whether that value exceeds the opportunity cost.
- **Using diminishing returns as an excuse to under-invest**: "we hit diminishing returns, so we should stop" can be used to justify under-investment in critical areas like security or reliability. The target must be based on the actual requirements, not on the effort expended.
- **Treating the 80/20 rule as a universal law**: 80/20 is a heuristic, not a guarantee. In some domains, the ratio is 95/5 or 50/50. Measure the actual distribution, do not assume it.

## Related

- Same class: [opportunity-cost.md](./opportunity-cost.md) (the marginal cost of one investment is the opportunity cost of not investing elsewhere); [sunk-cost-fallacy.md](./sunk-cost-fallacy.md) (past investment does not justify future investment — each unit is evaluated on its marginal value); [compound-interest.md](./compound-interest.md) (small, consistent investments can compound, but each individual unit still has diminishing marginal returns); [first-principles.md](./first-principles.md) (decompose the optimization to fundamentals to find the highest-leverage units).
- Upstream: [../../../product-manager/frameworks/rice-ice-prioritization.md](../../../product-manager/frameworks/rice-ice-prioritization.md) (prioritization frameworks should account for diminishing returns across features).
- Downstream: sprint planning, performance optimization roadmaps, hiring plans, test coverage targets.

## References

- Alfred Marshall — *Principles of Economics* (formalized the law of diminishing marginal utility)
- Frederick Brooks — *The Mythical Man-Month* (Brooks's Law as a specific case of diminishing returns in team scaling)
- Vilfredo Pareto — origin of the 80/20 principle
- Donald Reinertsen — *The Principles of Product Development Flow* (economic framework for when to stop investing)