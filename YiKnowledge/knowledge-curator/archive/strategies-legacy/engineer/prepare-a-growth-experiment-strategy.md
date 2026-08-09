---
title: I want to build a growth experiment strategy / Prepare a growth experiment strategy
aliases: [i-want-to-prepare-a-growth-experiment-strategy, growth-experiment-strategy, growth-loop-experiment-strategy]
tags: [journey, methodology, product, growth, experimentation, planning]
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-growth-strategy.md
  - ./prepare-an-ab-testing-strategy.md
  - ./prepare-an-experiment-tracking-strategy.md
  - ./prepare-a-pirate-funnel-strategy.md
  - ../../product-manager/frameworks/prepare-a-north-star-metric-strategy.md
  - ../../product-manager/frameworks/prepare-a-product-strategy.md
  - ../../tech-lead/roadmap/prepare-a-product-roadmap.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A growth experiment is not just an experiment; it is a contract. Funnel + hypothesis + experiment + measurement + compounding — five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build a growth experiment strategy

> **As an** engineer, **I want to** prepare a growth experiment, **so that** launch is safe.

## Summary

- Growth experiment = contract; not just an experiment
- Funnel + hypothesis + experiment + measurement + compounding — five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers acquisition / activation / retention / revenue / referral — multiple stages
- Links with growth-strategy + ab-testing + experiment-tracking + pirate-funnel + north-star-metric + product-strategy + product-roadmap
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

A growth experiment is a contract; not just an experiment. This entry provides the full growth experiment path, covering funnel + hypothesis + experiment + measurement + compounding, business-value driven not by gut feel, covering acquisition / activation / retention / revenue / referral — multiple stages, linked with prepare-a-growth-strategy + prepare-an-ab-testing-strategy + prepare-an-experiment-tracking-strategy + prepare-a-pirate-funnel-strategy + prepare-a-north-star-metric-strategy + prepare-a-product-strategy + prepare-a-product-roadmap, publicly queryable, periodic review, and links to growth-strategy / ab-testing / experiment-tracking / pirate-funnel / north-star-metric / product-strategy / product-roadmap and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | growth-strategy | [./prepare-a-growth-strategy.md](./prepare-a-growth-strategy.md) |
| 1 hop | ab-testing | [./prepare-an-ab-testing-strategy.md](./prepare-an-ab-testing-strategy.md) |
| 2 hops | experiment-tracking | [./prepare-an-experiment-tracking-strategy.md](./prepare-an-experiment-tracking-strategy.md) |
| 2 hops | pirate-funnel | [./prepare-a-pirate-funnel-strategy.md](./prepare-a-pirate-funnel-strategy.md) |
| 2 hops | north-star-metric | [../../product-manager/frameworks/prepare-a-north-star-metric-strategy.md](../../product-manager/frameworks/prepare-a-north-star-metric-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: funnel + hypothesis + experiment + measurement + compounding; no missing dimension
2. **Business-value driven**: prioritize by business growth + user activation + retention + repurchase; not sloganeering
3. **Funnel**: AARRR + north star + key path + friction points + opportunity points; do not omit
4. **Hypothesis**: problem + ICE score + expectation + counter-metric + learning value; do not omit
5. **Experiment**: MVP + split stream + sample size + duration + false positives; do not omit
6. **Measurement**: primary + secondary + guardrails + tracking + LTV/CAC; do not omit
7. **Compounding**: winning experiments sediment + templatized + knowledge base + next experiment; do not omit
8. **Not one-shot**: progress from funnel → hypothesis → experiment → measurement → compounding; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with growth-strategy**: experiment + growth co-built
13. **Link with ab-testing**: experiment + A/B co-built
14. **Link with experiment-tracking**: experiment + tracking co-built
15. **Link with pirate-funnel**: experiment + funnel co-built
16. **Link with north-star-metric**: experiment + north star co-built
17. **Toolchain**: Growth-Experiment-Framework / GrowthBook / Statsig / Optimizely / Amplitude / Mixpanel / Heap / PostHog / Canny
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why must growth experiment; worst consequence of not doing it
21. **Inversion thinking**: how much can be solved by natural growth; if solvable, don't introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (cost / risk / growth / business)
23. **Occam**: growth experiment the simpler the better; cut redundant steps

## Related

- growth-strategy: [./prepare-a-growth-strategy.md](./prepare-a-growth-strategy.md) — growth co-built
- ab-testing: [./prepare-an-ab-testing-strategy.md](./prepare-an-ab-testing-strategy.md) — A/B co-built
- experiment-tracking: [./prepare-an-experiment-tracking-strategy.md](./prepare-an-experiment-tracking-strategy.md) — tracking co-built
- pirate-funnel: [./prepare-a-pirate-funnel-strategy.md](./prepare-a-pirate-funnel-strategy.md) — funnel co-built
- north-star-metric: [../../product-manager/frameworks/prepare-a-north-star-metric-strategy.md](../../product-manager/frameworks/prepare-a-north-star-metric-strategy.md) — north star co-built
- product-strategy: [../../product-manager/frameworks/prepare-a-product-strategy.md](../../product-manager/frameworks/prepare-a-product-strategy.md) — strategy co-built
- product-roadmap: [../../tech-lead/roadmap/prepare-a-product-roadmap.md](../../tech-lead/roadmap/prepare-a-product-roadmap.md) — roadmap co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
