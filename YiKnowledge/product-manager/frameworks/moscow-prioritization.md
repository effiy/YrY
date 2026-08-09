---
title: MoSCoW Prioritization Method
aliases:
  - MoSCoW
  - MoSCoW prioritization
  - Must-Should-Could-Won't
tags:
  - PM
  - methodology
  - prioritization
  - decision-making
  - requirements
category: product-manager/frameworks
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
  - tech-lead
  - executive
benefit: PMs can make clear trade-off decisions under resource constraints by categorizing requirements into four explicit commitment levels
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - rice-ice-prioritization.md
  - kano-model.md
  - prioritize-a-backlog.md
  - agile-product-management.md
  - ../discovery/metrics--README.md
tacit: false
---

# MoSCoW Prioritization Method

> **As a** product manager, **I want to** categorize requirements into Must/Should/Could/Won't commitment levels, **so that** the team makes explicit trade-offs under fixed time and resource constraints.

> MoSCoW is a constraint-driven prioritization method, not a value-ranking method. Its strength is forcing explicit "Won't" decisions -- saying what you will NOT do is as important as saying what you WILL do.

## Summary

- MoSCoW was developed by Dai Clegg at Oracle (1994) and popularized by the DSDM agile framework; four categories: Must have, Should have, Could have, Won't have this time.
- The core rule: Must <= 60% of total effort; if Must exceeds 60%, you are not prioritizing, you are wish-listing.
- Unlike RICE/ICE which rank by value, MoSCoW ranks by constraint -- it answers "what survives the cut" rather than "what is most valuable".
- Best applied in time-boxed projects with fixed deadlines and known capacity; weak in exploration phases where requirements are not yet enumerable.
- Common failure: everything becomes Must, Won't is empty, and MoSCoW degenerates into an unprioritized backlog.

## Core viewpoints

- **MoSCoW is a constraint tool, not a value tool** -- RICE tells you what is most valuable; MoSCoW tells you what fits within the time box. Use them together: RICE to rank, MoSCoW to commit.
- **Must <= 60% is non-negotiable** -- if Must exceeds 60% of sprint/quarter capacity, the team is overcommitted. The discipline is cutting Must items, not squeezing them in.
- **Won't this time, not Won't forever** -- the "W" category is explicitly scoped to the current time box. Items in Won't are parked, not deleted. Revisit them in the next planning cycle.
- **Should is the negotiation zone** -- Should items are important but not critical; they are the first to be cut when things go wrong. If a Should item is never cut across multiple cycles, it is really a Must.
- **MoSCoW requires stakeholder alignment** -- the categories are meaningless without shared definitions. Run a 30-minute alignment workshop before the first MoSCoW exercise.

## Key information

### Framework origin

Developed by Dai Clegg at Oracle in 1994 as part of the DSDM (Dynamic Systems Development Method) agile framework. Originally designed for time-boxed delivery where the deadline is fixed and scope is the variable.

### Four categories

| Category | Meaning | Commitment | % of effort | Cut when |
|---|---|---|---|---|
| Must have | Critical for this time box; without it, the delivery is a failure | Guaranteed | <= 60% | Only if the time box itself is invalid |
| Should have | Important but not critical; painful to leave out | Best effort | ~20% | First to cut if Must items slip |
| Could have | Nice to have; included if time permits | If easy | ~10% | Cut as soon as pressure appears |
| Won't have this time | Explicitly out of scope for this time box | None | ~10% | N/A -- already excluded |

### Implementation steps

1. **Define the time box**: What is the fixed deadline? What is the team's capacity in person-days?
2. **List all candidate requirements**: Every item the team or stakeholders have raised, no filtering.
3. **Run the categorization workshop**: Stakeholders + PM + tech lead, 60-90 minutes. Each item discussed and assigned a category.
4. **Enforce Must <= 60%**: Sum the effort estimates of all Must items. If > 60% of capacity, demote Must items to Should until the constraint is met.
5. **Get explicit sign-off on Won't**: Stakeholders must acknowledge that Won't items are excluded from this time box. Written record.
6. **Lock categories at the start of the time box**: After the time box begins, re-categorization requires a formal change request.
7. **Mid-cycle check**: At the halfway point, review whether Must items are on track. If not, demote Should items to Could/Won't to protect Must.

### Comparison with other frameworks

| Framework | What it answers | Best when |
|---|---|---|
| MoSCoW | What fits in the time box? | Fixed deadline, known capacity, enumerable requirements |
| RICE | Which is most valuable? | Many candidates, need quantitative ranking |
| Kano | What type of value does it create? | User experience, feature categorization |
| Cost-Value | What is the best ROI? | Few candidates, two-dimensional trade-off |

### When to use vs. when not to use

**Use MoSCoW when:**
- The deadline is fixed (regulatory, contractual, market window)
- The team has a known, stable capacity
- Requirements are enumerable and can be estimated
- Stakeholders need explicit "what we are NOT doing" clarity

**Do NOT use MoSCoW when:**
- Exploration/discovery phase where requirements are unknown
- Continuous delivery with no fixed time boxes (use RICE/ICE instead)
- The team is too small for formal categorization (use a simpler stack-rank)
- Stakeholders refuse to accept any "Won't" items (the framework collapses)

### MoSCoW + RICE combined workflow

1. List all requirements -> RICE-score each
2. Sort by RICE score descending
3. Apply MoSCoW categories top-down, respecting the 60% Must constraint
4. RICE informs the order within each MoSCoW category
5. Stakeholders review boundary cases: high-RICE Should items that nearly made Must

## Action recommendations

1. Before the first MoSCoW exercise, run a 30-minute alignment workshop: define exactly what Must/Should/Could/Won't mean for this team and this time box.
2. Enforce Must <= 60% of total capacity. If Must exceeds 60%, demote the lowest-impact Must items to Should until the constraint is met.
3. Allocate specific % to each category: Must ~60%, Should ~20%, Could ~10%, Won't ~10%. This leaves room for surprises.
4. Get explicit stakeholder sign-off on the Won't list. Write it down. Reference it in the next planning cycle.
5. Mid-cycle check: if Must items are slipping, immediately demote Should items to protect the time box. Do not add weekends.
6. Combine with RICE: RICE ranks within each MoSCoW category so the team knows what to pull first.
7. Revisit Won't items at the start of the next planning cycle. Do not let them accumulate indefinitely.

## Anti-patterns

- **Everything is Must** -- the most common failure. If every item is Must, MoSCoW is not being used. Enforce the 60% rule.
- **Won't is empty** -- the team is not saying "no" to anything. "Won't this time" is the most powerful category because it creates focus.
- **MoSCoW without effort estimates** -- categories without effort estimates are just opinions. Effort must be estimated by the people doing the work.
- **Re-categorizing mid-cycle without process** -- "this just became a Must" is scope creep. Formal change request required.
- **MoSCoW as a proxy for value** -- a Must item is not necessarily more valuable than a Should item; it is just more time-critical. Use RICE for value ranking.

## Related

- Same class: [rice-ice-prioritization.md](./rice-ice-prioritization.md) -- RICE ranks by value, MoSCoW commits by constraint; use together
- Same class: [kano-model.md](./kano-model.md) -- Kano categorizes by user satisfaction curve, MoSCoW categorizes by delivery commitment
- Same class: [prioritize-a-backlog.md](./prioritize-a-backlog.md) -- backlog prioritization workflow that incorporates MoSCoW
- Same class: [agile-product-management.md](./agile-product-management.md) -- iteration planning context
- Upstream: [../discovery/metrics--README.md](../discovery/metrics--README.md) -- metrics to validate MoSCoW decisions
- References: DSDM Consortium -- *MoSCoW Prioritization*; Dai Clegg (1994) -- *MoSCoW method for time-boxed delivery*