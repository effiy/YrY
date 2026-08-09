---
title: I want to build a Pension strategy / Prepare a Pension strategy
aliases: [i-want-to-prepare-a-pension-strategy, pension-strategy]
tags: [journey, methodology, finance, pension, planning]
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
  - ./prepare-a-treasury-strategy.md
  - ./prepare-a-benefits-strategy.md
  - ./prepare-a-payroll-strategy.md
  - ./prepare-a-financial-reporting-strategy.md
  - ./prepare-an-hr-operations-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Pension is not just retirement benefits; it is a contract. Five dimensions: liability + assets + governance + governance + measurement; business-value driven; not one-shot; measurable"
status: deprecated
---

# I want to build a Pension strategy

> **As an** engineer, **I want to** prepare a pension, **so that** launch is safe.

## Summary

- Pension = contract; not just retirement benefits
- five dimensions: liability + assets + governance + governance + measurement; no missing dimension
- business-value driven; not by gut feel
- covers db / dc / hybrid / opeb / annuity multiple types
- links with treasury + benefits + payroll + financial-reporting + hr-operations
- publicly queryable; not hidden
- periodic review; evolution updates
- first principles / inversion / second-order / Occam

## Scenario

Pension is a contract; not just retirement benefits. This entry provides the Pension full path, covering liability + assets + governance + governance + measurement, business-value driven not by gut feel, covering db / dc / hybrid / opeb / annuity multiple types, linking with prepare-a-treasury-strategy + prepare-a-benefits-strategy + prepare-a-payroll-strategy + prepare-a-financial-reporting-strategy + prepare-an-hr-operations-strategy, publicly queryable, periodic review, and links to Treasury / Benefits / Payroll / FinancialReporting / HROperations and other leaves.

## 2-hop reachability paths

| Hops | target | file |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | treasury | [./prepare-a-treasury-strategy.md](./prepare-a-treasury-strategy.md) |
| 1 hop | benefits | [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) |
| 2 hops | payroll | [./prepare-a-payroll-strategy.md](./prepare-a-payroll-strategy.md) |
| 2 hops | financial-reporting | [./prepare-a-financial-reporting-strategy.md](./prepare-a-financial-reporting-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: liability + assets + governance + governance + measurement; no missing dimension
2. **business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **liability Liability**: actuarial / closed loop; do not omit
4. **assets Asset**: allocation / closed loop; do not omit
5. **governance Govern**: fiduciary / closed loop; do not omit
6. **governance Governance**: owner / cadence / review / documentation / drift; do not omit
7. **measurement Measure**: efficiency + trust + speed + risk + cost; do not omit
8. **not one-shot**: progressive from liability → assets → governance → governance → measurement; no skipping
9. **not report-ized**: reports are only the start; not the end
10. **not sloganeering**: every principle must have landing evidence; not vague
11. **versioned**: strategy has versions; evolution is traceable
12. **links with treasury**: Pension + Treasury co-build
13. **links with benefits**: Pension + Benefits co-build
14. **links with payroll**: Pension + Payroll co-build
15. **links with financial-reporting**: Pension + FinancialReporting co-build
16. **links with hr-operations**: Pension + HROperations co-build
17. **toolchain**: Alight / WTW / Aon / Mercer / Russell Investments
18. **publicly queryable**: strategy everyone can look up; not hidden
19. **periodic review**: evolution updates; not one-shot
20. **first principles**: why Pension is necessary; worst consequence of not doing it
21. **inversion thinking**: how much can DC transfer solve; if solvable, don't introduce a heavy strategy
22. **second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk)
23. **Occam**: Pension — the simpler the better; cut redundant structures

## Related

- treasury: [./prepare-a-treasury-strategy.md](./prepare-a-treasury-strategy.md) — Treasury co-build
- benefits: [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) — Benefits co-build
- payroll: [./prepare-a-payroll-strategy.md](./prepare-a-payroll-strategy.md) — Payroll co-build
- financial-reporting: [./prepare-a-financial-reporting-strategy.md](./prepare-a-financial-reporting-strategy.md) — FinancialReporting co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
