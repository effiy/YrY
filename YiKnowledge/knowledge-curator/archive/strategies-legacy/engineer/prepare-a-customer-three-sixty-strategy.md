---
title: I want to build a Customer 360 strategy / Prepare a Customer 360 strategy
aliases: [i-want-to-prepare-a-customer-360-strategy, customer-360-strategy]
tags: [journey, methodology, customer, 360, planning]
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
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
  - ./prepare-a-customer-data-platform-strategy.md
  - prepare-a-customer-master-data-strategy.md
  - prepare-a-customer-single-view-strategy.md
  - ./prepare-a-customer-profiling-strategy.md
  - ./prepare-a-customer-segmentation-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Customer 360 is not just data; it is a contract. Five dimensions: data + integration + application + governance + measurement; business-value driven; not one-shot; measurable"
---

# I want to build a Customer 360 strategy

> **As an** engineer, **I want to** prepare a customer three sixty, **so that** launch is safe. 

## Summary

- Customer 360 = contract; not just data
- Five dimensions: data + integration + application + governance + measurement; no missing dimension
- Business-value driven; not by gut feel
- Cover transactional / behavioral / attitudinal / social / demographic multiple types
- Linked with customer-data-platform + customer-master-data + customer-single-view + customer-profiling + customer-segmentation
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Customer 360 is a contract; not just data. This entry provides the Customer 360 full path, covering data + integration + application + governance + measurement, business-value driven not by gut feel, covering transactional / behavioral / attitudinal / social / demographic multiple types, linked with prepare-a-customer-data-platform + prepare-a-customer-master-data + prepare-a-customer-single-view + prepare-a-customer-profiling + prepare-a-customer-segmentation, publicly queryable, periodic review, and links to CDP / MasterData / SingleView / Profiling / Segmentation and other leaves. 

## 2-hop reachability paths

| hop count | goal | file |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | customer-data-platform | [./prepare-a-customer-data-platform-strategy.md](./prepare-a-customer-data-platform-strategy.md) |
| 1 hop | customer-master-data | [./i-want-to-prepare-a-customer-master-data-strategy.md](./prepare-a-customer-master-data-strategy.md) |
| 2 hops | customer-single-view | [./i-want-to-prepare-a-customer-single-view-strategy.md](./prepare-a-customer-single-view-strategy.md) |
| 2 hops | customer-profiling | [./prepare-a-customer-profiling-strategy.md](./prepare-a-customer-profiling-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: data + integration + application + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Data**: transaction / behavior / closed loop; do not omit
4. **Integrate**: source / ETL / closed loop; do not omit
5. **Apply**: marketing / service / closed loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measure**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: progressive from data -> integration -> application -> governance -> measurement; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with customer-data-platform**: 360 + CDP co-built
13. **Link with customer-master-data**: 360 + MasterData co-built
14. **Link with customer-single-view**: 360 + SingleView co-built
15. **Link with customer-profiling**: 360 + Profiling co-built
16. **Link with customer-segmentation**: 360 + Segmentation co-built
17. **Toolchain**: Salesforce / Segment / Tealium / Adobe RTCDP / Treasure Data
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why must 360; worst consequence of not doing it
21. **Inversion thinking**: how much can be solved by CRM; if solvable, do not introduce heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk) 
23. **Occam**: 360 the simpler the better; cut redundant layers

## Related

- customer-data-platform: [./prepare-a-customer-data-platform-strategy.md](./prepare-a-customer-data-platform-strategy.md) — CDP co-built
- customer-master-data: [./i-want-to-prepare-a-customer-master-data-strategy.md](./prepare-a-customer-master-data-strategy.md) — MasterData co-built
- customer-single-view: [./i-want-to-prepare-a-customer-single-view-strategy.md](./prepare-a-customer-single-view-strategy.md) — SingleView co-built
- customer-profiling: [./prepare-a-customer-profiling-strategy.md](./prepare-a-customer-profiling-strategy.md) — Profiling co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
