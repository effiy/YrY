---
title: Lean Startup Methodology
aliases:
  - Lean Startup
  - Build-Measure-Learn
  - Lean methodology
tags:
  - PM
  - methodology
  - startup
  - innovation
  - experimentation
  - MVP
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
  - executive
  - engineer
benefit: PMs can reduce waste by validating assumptions through rapid experimentation rather than building complete products on untested hypotheses
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - product-discovery-framework.md
  - dual-track-agile.md
  - agile-product-management.md
  - ../discovery/metrics--README.md
  - ../strategy/case-study.md
tacit: false
---

# Lean Startup Methodology

> **As a** product manager, **I want to** apply the Build-Measure-Learn loop to validate product hypotheses before full investment, **so that** the team avoids building products nobody wants and discovers the right product through rapid experimentation.

> A startup is a temporary organization designed to search for a repeatable and scalable business model. The Lean Startup is the methodology for conducting that search efficiently -- inside a startup or inside a large company.

## Summary

- Eric Ries published *The Lean Startup* in 2011, synthesizing lean manufacturing (Toyota), customer development (Steve Blank), and agile development into a single methodology for innovation under extreme uncertainty.
- Core loop: Build (a minimum viable product) -> Measure (with actionable metrics) -> Learn (pivot or persevere). The goal is to minimize the total time through this loop.
- An MVP is not a minimal product; it is the smallest experiment that tests a specific hypothesis. An MVP can be a landing page, a concierge service, a video demo, or a Wizard of Oz prototype.
- Innovation accounting replaces traditional vanity metrics (DAU, registered users) with actionable metrics (cohort retention, activation rate, revenue per user) that inform pivot/persevere decisions.
- The methodology applies to any initiative under extreme uncertainty, not just startups. Large companies use it for new product lines, new markets, and internal innovation.

## Core viewpoints

- **An MVP is an experiment, not a product** -- the purpose of an MVP is to test the riskiest assumption, not to deliver value to users. Once the assumption is validated, the MVP is typically discarded. Building a production-quality MVP violates the lean principle.
- **Vanity metrics kill startups** -- metrics that always go up (total users, total revenue) mask the truth. Only actionable metrics (cohort retention, activation funnel, per-user economics) inform the pivot/persevere decision.
- **Pivot is not failure** -- a pivot is a structured course correction based on validated learning. The failure is pivoting too late (after the runway is gone) or pivoting too early (before the experiment completes).
- **Innovation accounting is the missing discipline** -- teams measure output (features shipped) not outcome (learning validated). Innovation accounting establishes the learning milestones that define progress before revenue exists.
- **Lean Startup inside a large company requires executive air cover** -- the methodology conflicts with annual planning, stage-gate approvals, and ROI-based funding. Without explicit protection, Lean Startup teams are crushed by corporate antibodies.

## Key information

### Framework origin

Eric Ries, influenced by Steve Blank's customer development methodology and Toyota's lean manufacturing, developed the Lean Startup methodology during his time at IMVU (2004-2008). Published as *The Lean Startup* (Crown Business, 2011). Core influences: lean manufacturing (eliminate waste), customer development (get out of the building), agile development (iterate rapidly).

### The Build-Measure-Learn loop

```
Ideas -> Build -> Product -> Measure -> Data -> Learn -> (back to Ideas)
   ^                                                          |
   |__________________ Pivot or Persevere ____________________|
```

The goal is to minimize the total time through this loop. Speed is not about coding faster; it is about identifying the riskiest assumption and testing it with the smallest possible experiment.

### Three types of MVP

| MVP type | What it is | When to use | Example |
|---|---|---|---|
| Concierge MVP | A human manually performs the service the product would automate | Testing whether the problem is worth solving at all | A founder personally curates recommendations before building an algorithm |
| Wizard of Oz MVP | The user sees a product interface, but humans perform the backend work | Testing whether users will engage with the product concept | A chat interface where humans type responses, pretending to be AI |
| Landing page MVP | A single page describing the product with a call to action | Testing demand and willingness to pay | A "Buy Now" button that leads to a "Coming Soon" page; measure click-through rate |
| Single-feature MVP | A working product with exactly one feature | Testing whether a specific feature solves the core problem | A to-do app with only "add task" and "mark done" -- no categories, no dates, no sharing |

### Innovation accounting: three learning milestones

1. **Establish the baseline**: Use an MVP to measure where you are now. What is the current activation rate, retention rate, or revenue per user?
2. **Tune the engine**: Run experiments to improve the baseline metric. Each experiment should move the metric from baseline toward the ideal.
3. **Pivot or persevere**: When experiments stop moving the metric, decide whether to pivot (change the strategy) or persevere (continue optimizing).

### Pivot types

| Pivot type | Description | Example |
|---|---|---|
| Customer segment pivot | The product solves a real problem, but for a different customer | A tool built for developers gets adopted by designers |
| Customer need pivot | The customer has a different problem than the one you are solving | A food delivery app discovers users want meal planning, not delivery |
| Platform pivot | A single application becomes a platform for third-party applications | Amazon Web Services from internal infrastructure to external platform |
| Business architecture pivot | High-margin/low-volume shifts to low-margin/high-volume, or vice versa | Enterprise SaaS -> self-serve freemium |
| Technology pivot | The same solution is delivered with a different technology | Desktop app -> web app -> mobile app |
| Channel pivot | The same product is sold through a different distribution channel | Direct sales -> app store -> partnerships |

### When to use vs. when not to use

**Use Lean Startup when:**
- Extreme uncertainty about the customer, the problem, or the solution
- The cost of building the full product is high relative to the cost of an experiment
- The team has the autonomy to pivot without external approval
- The organization accepts that "learning" is a valid outcome of an initiative

**Do NOT use Lean Startup when:**
- The problem and solution are well understood (e.g., building a standard e-commerce site)
- The cost of failure is unacceptable (e.g., medical devices, safety-critical systems)
- The organization demands a fixed roadmap with guaranteed delivery dates
- The team cannot get access to real customers for experiments

### Lean Startup in large companies (internal startups)

Large companies adopting Lean Startup face unique challenges:
- **Funding model**: Annual budget cycles conflict with pivot/persevere decisions. Use staged funding gates (problem validation -> solution validation -> growth validation).
- **Success metrics**: ROI-based metrics are meaningless before product-market fit. Use innovation accounting learning milestones.
- **Corporate antibodies**: Legal, compliance, and brand teams may block MVPs. Secure executive sponsorship and create a "sandbox" with relaxed rules.
- **Talent**: The skills for running a Lean Startup team (experimentation, customer development) differ from the skills for scaling a mature product.

## Action recommendations

1. Identify the riskiest assumption: what must be true for this product to succeed, and what is least certain?
2. Design the smallest possible experiment to test that assumption. The experiment should be measured by an actionable metric, not a vanity metric.
3. Define the success criteria before running the experiment: "If the activation rate is above X%, we persevere. Below X%, we pivot." This prevents post-hoc rationalization.
4. Run the experiment to completion. Do not change the success criteria mid-experiment. Do not pivot before the data is in.
5. Hold a formal pivot/persevere meeting. Present the data, the hypothesis, and the recommendation. Record the decision.
6. If persevering, identify the next riskiest assumption and repeat. If pivoting, return to the Build step with a new hypothesis.
7. Establish innovation accounting: track actionable metrics per cohort, not aggregate vanity metrics. See [../discovery/metrics--README.md](../discovery/metrics--README.md).

## Anti-patterns

- **MVP as a production-quality product** -- spending months building a polished MVP defeats the purpose. An MVP is the smallest experiment, not the smallest product.
- **Vanity metrics as decision criteria** -- "total registered users is growing" does not tell you whether users are getting value. Use cohort retention and activation rates.
- **Pivoting without data** -- changing direction because the current approach "feels slow" or "the team is bored." Only pivot when the data says the hypothesis is invalid.
- **Never pivoting** -- running experiment after experiment without ever questioning the fundamental strategy. Set a maximum number of experiments before a forced pivot/persevere review.
- **Lean Startup as an excuse for no planning** -- "we are lean, we don't need a roadmap." Lean Startup is a search methodology; once you find product-market fit, you need a delivery roadmap.

## Related

- Same class: [product-discovery-framework.md](./product-discovery-framework.md) -- discovery framework that incorporates Lean Startup principles
- Same class: [dual-track-agile.md](./dual-track-agile.md) -- discovery track (Lean Startup) + delivery track (Agile) running in parallel
- Same class: [agile-product-management.md](./agile-product-management.md) -- delivery methodology after product-market fit is found
- Downstream: [../discovery/metrics--README.md](../discovery/metrics--README.md) -- actionable metrics and innovation accounting
- Downstream: [../strategy/case-study.md](../strategy/case-study.md) -- case study template for documenting validated learning
- References: Eric Ries -- *The Lean Startup* (2011); Steve Blank -- *The Four Steps to the Epiphany* (2005); Ash Maurya -- *Running Lean* (2012)