---
title: I want to build a Data Mart strategy / Prepare a Data Mart strategy
aliases: [i-want-to-prepare-a-data-mart-strategy, data-mart-strategy]
tags: [journey, methodology, data, warehouse, planning]
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
  - ./prepare-a-data-warehouse-strategy.md
  - ./prepare-a-data-lake-strategy.md
  - ./prepare-an-etl-strategy.md
  - ./prepare-an-elt-strategy.md
  - ./prepare-a-data-catalog-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A Data Mart is not just a subset; it is a contract. Subject + model + service + governance + measurement, five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build a Data Mart strategy

> **As an** engineer, **I want to** prepare a data mart, **so that** launch is safe.

## Summary

- Data Mart = contract; not just a subset
- Subject + model + service + governance + measurement, five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers sales / marketing / finance / hr / operations multiple types
- Links with data-warehouse + data-lake + etl + elt + data-catalog
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

A Data Mart is a contract; not just a subset. This entry provides the full Data Mart path, covering subject + model + service + governance + measurement, business-value driven not by gut feel, covering sales / marketing / finance / hr / operations multiple types, linking with prepare-a-data-warehouse-strategy + prepare-a-data-lake-strategy + prepare-an-etl-strategy + prepare-an-elt-strategy + prepare-a-data-catalog-strategy, publicly queryable, periodic review, and links to DataWarehouse / DataLake / ETL / ELT / DataCatalog and other leaves.

## 2-hop reachability paths

| Hop | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | data-warehouse | [./prepare-a-data-warehouse-strategy.md](./prepare-a-data-warehouse-strategy.md) |
| 1 hop | data-lake | [./prepare-a-data-lake-strategy.md](./prepare-a-data-lake-strategy.md) |
| 2 hops | etl | [./prepare-an-etl-strategy.md](./prepare-an-etl-strategy.md) |
| 2 hops | elt | [./prepare-an-elt-strategy.md](./prepare-an-elt-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: subject + model + service + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; no sloganeering
3. **Subject**: sales / finance / closed-loop; do not omit
4. **Model**: star / snowflake / closed-loop; do not omit
5. **Service**: bi / query / closed-loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: progress from subject → model → service → governance → measurement; no skipping
9. **Not report-only**: reports are only the start; not the end
10. **No sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with data-warehouse**: DataMart + Warehouse co-build
13. **Link with data-lake**: DataMart + Lake co-build
14. **Link with etl**: DataMart + ETL co-build
15. **Link with elt**: DataMart + ELT co-build
16. **Link with data-catalog**: DataMart + Catalog co-build
17. **Toolchain**: Snowflake / BigQuery / Databricks / Redshift / ClickHouse
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why must DataMart; worst consequence of not doing it
21. **Inversion thinking**: how much can direct warehouse queries solve; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk)
23. **Occam**: DataMart the simpler the better; cut redundant subjects

## Related

- data-warehouse: [./prepare-a-data-warehouse-strategy.md](./prepare-a-data-warehouse-strategy.md) — Warehouse co-build
- data-lake: [./prepare-a-data-lake-strategy.md](./prepare-a-data-lake-strategy.md) — Lake co-build
- etl: [./prepare-an-etl-strategy.md](./prepare-an-etl-strategy.md) — ETL co-build
- elt: [./prepare-an-elt-strategy.md](./prepare-an-elt-strategy.md) — ELT co-build
- data-catalog: [./prepare-a-data-catalog-strategy.md](./prepare-a-data-catalog-strategy.md) — Catalog co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
