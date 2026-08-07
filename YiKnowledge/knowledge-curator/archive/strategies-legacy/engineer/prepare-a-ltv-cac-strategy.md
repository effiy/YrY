---
title: I want to build an LTV/CAC strategy / Prepare an LTV CAC strategy
aliases: [i-want-to-prepare-a-ltv-cac-strategy, ltv-cac-strategy]
tags: [journey, methodology, sales, ltv, cac, planning]
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
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-an-arr-strategy.md
  - ./prepare-a-saas-metrics-strategy.md
  - ./prepare-a-customer-lifecycle-strategy.md
  - ./prepare-a-budget-planning-strategy.md
  - ./prepare-a-marketing-attribution-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: LTV/CAC is not just a ratio; it is a contract. LTV + CAC + ratio + governance + measurement are five dimensions; business-value driven; not one-shot; measurable
---

# I want to build an LTV/CAC strategy

> **As an** engineer, **I want to** prepare a ltv cac, **so that** launch is safe. 

## Summary

- LTV/CAC = contract; not just a ratio
- LTV + CAC + ratio + governance + measurement are five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers 3:1 / 5:1 / channel / cohort / segment multiple perspectives
- Links with arr + saas-metrics + customer-lifecycle + budget-planning + marketing-attribution
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

LTV/CAC is a contract; not just a ratio. This entry provides the full LTV/CAC path, covering LTV + CAC + ratio + governance + measurement, business-value driven not by gut feel, covering 3:1 / 5:1 / channel / cohort / segment multiple perspectives, linking with prepare-an-arr-strategy + prepare-a-saas-metrics-strategy + prepare-a-customer-lifecycle-strategy + prepare-a-budget-planning-strategy + prepare-a-marketing-attribution-strategy, publicly queryable, periodic review, and links to arr / saas-metrics / customer-lifecycle / budget-planning / marketing-attribution and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | arr | [./prepare-an-arr-strategy.md](./prepare-an-arr-strategy.md) |
| 1 hop | saas-metrics | [./prepare-a-saas-metrics-strategy.md](./prepare-a-saas-metrics-strategy.md) |
| 2 hop | customer-lifecycle | [./prepare-a-customer-lifecycle-strategy.md](./prepare-a-customer-lifecycle-strategy.md) |
| 2 hop | budget-planning | [./prepare-a-budget-planning-strategy.md](./prepare-a-budget-planning-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: LTV + CAC + ratio + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by LTV/CAC ratio + revenue + renewal + retention + efficiency; not sloganeering
3. **LTV**: revenue / renewal / retention / cost / time; do not omit
4. **CAC**: marketing / sales / tools / resources / time; do not omit
5. **Ratio**: 3:1 / 5:1 / channel / cohort / segment; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measure**: LTV/CAC ratio + revenue + renewal + retention + efficiency; do not omit
8. **not one-shot**: progressive from LTV → CAC → ratio → governance → measurement; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **link with arr**: LTV/CAC + ARR co-built
13. **link with saas-metrics**: LTV/CAC + SaaS metrics co-built
14. **link with customer-lifecycle**: LTV/CAC + lifecycle co-built
15. **link with budget-planning**: LTV/CAC + budget co-built
16. **link with marketing-attribution**: LTV/CAC + marketing attribution co-built
17. **Toolchain**: Snowflake / ChartMogul / Baremetrics / Salesforce / Marketo / 6sense
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **first principles**: why must LTV/CAC; worst consequence of not doing
21. **inversion thinking**: rely on CAC total how much can be solved; if solvable, do not introduce heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (cost / risk / revenue / retention)
23. **Occam**: LTV/CAC the simpler the better; cut redundant assumptions

## Related

- arr: [./prepare-an-arr-strategy.md](./prepare-an-arr-strategy.md) — ARR co-built
- saas-metrics: [./prepare-a-saas-metrics-strategy.md](./prepare-a-saas-metrics-strategy.md) — SaaS metrics co-built
- customer-lifecycle: [./prepare-a-customer-lifecycle-strategy.md](./prepare-a-customer-lifecycle-strategy.md) — lifecycle co-built
- budget-planning: [./prepare-a-budget-planning-strategy.md](./prepare-a-budget-planning-strategy.md) — budget co-built
- marketing-attribution: [./prepare-a-marketing-attribution-strategy.md](./prepare-a-marketing-attribution-strategy.md) — marketing attribution co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
