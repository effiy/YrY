---
title: Now / Next / Later roadmap
aliases:
- Now Next Later Roadmap
- NNL Roadmap
- outcome-oriented roadmap
tags:
- strategy
- roadmap
- product planning
- OKR
- stakeholder management
category: executive/strategy
created: 2026-07-31
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
- ./product-strategy-framework.md
- ../../product-manager/discovery/metrics/north-star-metric.md
tacit: false
---

# Now / Next / Later roadmap

> **As an** executive, **I want to** now next later roadmap, **so that** strategy aligned.

> An outcome-oriented (not date-oriented) roadmap, organized into three tiers — "Now / Next / Later" — without nailing down dates.

## Summary

- Split planning into three tiers: Now (current iteration) / Next (next quarter) / Later (half-year to one year), ranked by value priority
- Key principle: items outside Now are not bound to dates; Later is direction, not commitment
- Originated as a critique of traditional Gantt roadmaps — dates are often wrong, and broken dates erode trust
- Each item must have three fields: goal, assumption, dependency; quarterly review promotes Later to Next, Next to Now

## Core viewpoints

- **Feature value and dependency relationships are more stable than dates, and the roadmap's primary job is to communicate the former, not the latter.** A Gantt chart with dates creates an illusion of precision that erodes trust every time a date slips. The Now/Next/Later structure communicates what the organization values, what it is investing in now, and what direction it is heading — without pretending to know exactly when each item will ship. The roadmap is a communication tool for alignment, not a project plan for tracking.

- **The distinction between "commitment" (Now) and "direction" (Next/Later) is the single most important structural feature of the roadmap.** Putting dates on Next and Later items is a commitment in disguise — it signals to stakeholders that those items are promised, not explored. When a Later item with a date inevitably slips, the stakeholder trust loss is the same as if it were a committed Now item. The tier structure exists to prevent this: Now is committed with dates, Next is planned without dates, Later is explored without commitment.

- **Assumptions must be explicit and falsifiable for every item outside the Now tier.** A Later item without an explicit assumption — "we believe this opportunity exists because [data], and this assumption is overturned if [signal]" — is an unfalsifiable bet. The quarterly review of Later items should test each assumption against new data and promote or deprecate items based on the signal, not based on the original enthusiasm. Without explicit assumptions, the roadmap becomes a wish list that never shrinks.

- **The roadmap is a living document that must be updated quarterly, not a yearly planning artifact.** The quarterly review cycle — promote Later to Next, Next to Now, validate assumptions, deprecate items that failed their signal check — is the engine that keeps the roadmap grounded in reality. A roadmap that is updated only during annual planning is a snapshot of one moment's optimism, not a reflection of current organizational priorities.

- **The Now/Next/Later structure is a stakeholder management tool as much as a planning tool.** When a stakeholder requests a new feature, the roadmap provides the framework for the response: "this is currently in the Later tier, which means we believe in the opportunity but haven't validated the assumptions yet. Here's what would need to be true for it to move to Next." The structure converts ad-hoc feature requests into a disciplined prioritization conversation.

## Key information

### Concept breakdown: three-tier structure

| Tier | Time window (reference) | Contents | Level of detail |
|---|---|---|---|
| Now | current iteration / this quarter | confirmed, in progress | detailed (feature, owner, status) |
| Next | next quarter | direction aligned, pending design | medium (value, goal, dependency) |
| Later | half-year to one year | strategic direction and exploration | brief (opportunity, assumption, signal) |

### Key parameters: each item must have three fields

- Goal (what it solves / metric)
- Assumption (what data would overturn it)
- Dependency (key resources / upstream)

### Comparison with other roadmap forms

| Roadmap form | Suits | Drawbacks |
|---|---|---|
| Gantt timeline | contracts, hard constraints | loses trust fast, expensive to update |
| Now / Next / Later | continuously evolving products | no date commitment, hard to explain to management |
| Theme-based | strategic themes | lacks concrete features |
| Story Map | user-experience flow | single-product scope |

### Relationship with OKR

- OKR is quarterly goals and key results; Now / Next / Later is medium-to-long-term understanding
- Now usually corresponds to the concrete actions of this quarter's OKR
- Next / Later correspond to next quarter and strategic themes

### Applicable scenarios

- Product direction evolving continuously
- Stakeholders need expectation management (do not want hard date commitments)
- Cross-team strategic alignment

## Action recommendations

1. **Now**: list the features confirmed for delivery in the current iteration (with PRD / acceptance criteria)
2. **Next**: list feature clusters whose direction is aligned for next quarter (not yet designed, but the goal is clear)
3. **Later**: list strategic directions and assumptions (e.g. "explore Agent across knowledge bases")
4. **Each item answers three fields**: goal / assumption / dependency
5. **Rank by value priority** (not by time)
6. **Quarterly review**: Later → Next → Now progressively promoted
7. **Visible company-wide**: publish to the team + key stakeholders, to avoid top-down gut-feel commitments

## Anti-patterns

- **Treating Next and Later items as date-bound commitments rather than directional hypotheses.** The entire point of the Now/Next/Later framework is to decouple planning from dates for everything beyond the current iteration. Putting a delivery date on a Later item -- "Q3 2026" -- converts a strategic direction into a promise, and when that promise is inevitably broken because the underlying assumptions change, stakeholder trust erodes. Next and Later items carry goals, assumptions, and dependencies, not dates.
- **Overloading the Now column with more items than the team can realistically deliver.** A Now column with 20 items is not a plan; it is a wish list that guarantees half the items will slip to Next. The constraint is not aspirational -- it is the team's demonstrated historical velocity. If the team consistently delivers 5-7 items per cycle, the Now column should contain 5-7 items. Anything beyond that is a lie that the roadmap tells to itself.
- **Writing Later items without explicit assumptions that would invalidate them.** A Later item that says "explore Agent across knowledge bases" with no stated assumption is a placeholder, not a strategic direction. The assumption field is the mechanism that determines whether the item stays in Later or gets promoted. Without it -- "this assumes multi-agent orchestration becomes a standard pattern, not a research project" -- there is no basis for the quarterly review to evaluate whether the item is still relevant.
- **Skipping the quarterly review cadence so that Later items never move.** A roadmap that is written once and never revisited is a historical document, not a planning tool. The quarterly review is the engine that promotes Later to Next, Next to Now, and archives items whose assumptions no longer hold. Without this cadence, the roadmap becomes a static artifact that the team ignores, and actual work is driven by whoever shouts loudest in the weekly standup.
- **Keeping the roadmap private to the product team instead of publishing it company-wide.** A roadmap that only the product manager and engineering lead can see does not manage expectations -- it creates a vacuum that stakeholders fill with their own assumptions. When the sales team promises a feature to a customer because they never saw the roadmap, the roadmap has failed its primary purpose. The Now/Next/Later roadmap must be visible to every stakeholder whose decisions depend on what the team is building.

## Related

- Peer: [business-model-canvas-summary.md](./business-model-canvas.md) — strategy description
- Peer: [product-strategy-framework-summary.md](./product-strategy-framework.md) — strategy layers
- Downstream: [../../product-manager/discovery/metrics/north-star-metric.md](../../product-manager/discovery/metrics/north-star-metric.md) — roadmap corresponds to the north-star metric
- References: Janna Bastow — *The Now-Next-Later Roadmap*; Bruce McCarthy — *Roadmaps Relaunched*; ProductPlan — https://www.productplan.com
