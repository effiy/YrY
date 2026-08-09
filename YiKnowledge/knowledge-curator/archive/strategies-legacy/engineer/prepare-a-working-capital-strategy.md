---
title: I want to build a Working Capital strategy / Prepare a Working Capital strategy
aliases: [i-want-to-prepare-a-working-capital-strategy, working-capital-strategy]
tags: [journey, methodology, finance, working-capital, planning]
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
  - ./prepare-a-cash-management-strategy.md
  - ./prepare-an-accounts-receivable-strategy.md
  - ./prepare-an-accounts-payable-strategy.md
  - ./prepare-an-inventory-management-strategy.md
  - ./prepare-a-treasury-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Working Capital is not just balance; it is a contract. Receivables + payables + inventory + governance + measurement five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build a Working Capital strategy

> **As an** engineer, **I want to** prepare a working capital, **so that** launch is safe.

## Summary

- Working Capital = contract; not just balance
- Receivables + payables + inventory + governance + measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers dso / dpo / dio / cash-conversion / liquidity multiple types
- Links with cash-management + accounts-receivable + accounts-payable + inventory-management + treasury
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Working Capital is a contract; not just balance. This entry provides the Working Capital full path, covering receivables + payables + inventory + governance + measurement, business-value driven not by gut feel, covering dso / dpo / dio / cash-conversion / liquidity multiple types, linking with prepare-a-cash-management-strategy + prepare-an-accounts-receivable-strategy + prepare-an-accounts-payable-strategy + prepare-an-inventory-management-strategy + prepare-a-treasury-strategy, publicly queryable, periodic review, and links to CashManagement / AccountsReceivable / AccountsPayable / InventoryManagement / Treasury and other leaves.

## 2-hop reachability paths

| Hop | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | cash-management | [./prepare-a-cash-management-strategy.md](./prepare-a-cash-management-strategy.md) |
| 1 hop | accounts-receivable | [./prepare-an-accounts-receivable-strategy.md](./prepare-an-accounts-receivable-strategy.md) |
| 2 hops | accounts-payable | [./prepare-an-accounts-payable-strategy.md](./prepare-an-accounts-payable-strategy.md) |
| 2 hops | inventory-management | [./prepare-an-inventory-management-strategy.md](./prepare-an-inventory-management-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: receivables + payables + inventory + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Receivables**: dso / collection / closed-loop; do not omit
4. **Payables**: dpo / cash discount / closed-loop; do not omit
5. **Inventory**: dio / turnover / closed-loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: progressive from receivables → payables → inventory → governance → measurement; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with cash-management**: WorkingCapital + CashManagement co-built
13. **Link with accounts-receivable**: WorkingCapital + AccountsReceivable co-built
14. **Link with accounts-payable**: WorkingCapital + AccountsPayable co-built
15. **Link with inventory-management**: WorkingCapital + InventoryManagement co-built
16. **Link with treasury**: WorkingCapital + Treasury co-built
17. **Toolchain**: Kyriba / TreasuryPrime / Nomentia / ION / FIS
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why must WorkingCapital; worst consequence of not doing it
21. **Inversion thinking**: how much can be solved by cash balance; if solvable, do not introduce heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam**: WorkingCapital the simpler the better; cut redundant levers

## Related

- cash-management: [./prepare-a-cash-management-strategy.md](./prepare-a-cash-management-strategy.md) — CashManagement co-built
- accounts-receivable: [./prepare-an-accounts-receivable-strategy.md](./prepare-an-accounts-receivable-strategy.md) — AccountsReceivable co-built
- accounts-payable: [./prepare-an-accounts-payable-strategy.md](./prepare-an-accounts-payable-strategy.md) — AccountsPayable co-built
- inventory-management: [./prepare-an-inventory-management-strategy.md](./prepare-an-inventory-management-strategy.md) — InventoryManagement co-built
- treasury: [./prepare-a-treasury-strategy.md](./prepare-a-treasury-strategy.md) — Treasury co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
