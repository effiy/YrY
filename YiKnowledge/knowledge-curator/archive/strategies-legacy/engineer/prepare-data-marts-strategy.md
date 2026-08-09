---
title: I want to build a Data Marts strategy / Prepare a data marts strategy
aliases: [i-want-to-prepare-data-marts-strategy, data-marts-strategy, data-mart-strategy]
tags: [journey, methodology, data, analytics, planning]
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
  - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-data-warehouse-strategy.md
  - ./prepare-a-data-lakehouse-strategy.md
  - ./prepare-a-bi-strategy.md
  - ./prepare-a-self-service-analytics-strategy.md
  - ./prepare-a-data-governance-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Data Marts not just slicing; it is a contract. audience + topic + model + Governance + Measurement five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build a Data Marts strategy

> **As an** engineer, **I want to** prepare data marts, **so that** launch is safe.

## Summary

- Data Marts = contract; not just slicing
- audience + topic + model + Governance + Measurement five dimensions; no missing dimension
- business-value driven; not by gut feel
- coverage sales / finance / marketing / operations / HR multiple topics
- link with data-warehouse + data-lakehouse + bi + self-service + data-governance
- publicly discoverable; not hidden
- regular review; evolve and update
- first principles / inversion / second-order / Occam's razor

## Scenario description

Data Marts is a contract; not just slicing. This entry gives Data Marts full path, coverage of audience + topic + model + Governance + Measurement, business-value driven not by gut feel, covering sales / finance / marketing / operations / HR multiple topics, and links with prepare-a-data-warehouse-strategy + prepare-a-data-lakehouse-strategy + prepare-a-bi-strategy + prepare-a-self-service-analytics-strategy + prepare-a-data-governance-strategy, publicly discoverable, regular review, and links to warehouse / lakehouse / bi / self-service / governance and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | data-warehouse | [./prepare-a-data-warehouse-strategy.md](./prepare-a-data-warehouse-strategy.md) |
| 1 hop | bi | [./prepare-a-bi-strategy.md](./prepare-a-bi-strategy.md) |
| 2 hop | data-lakehouse | [./prepare-a-data-lakehouse-strategy.md](./prepare-a-data-lakehouse-strategy.md) |
| 2 hop | self-service-analytics | [./prepare-a-self-service-analytics-strategy.md](./prepare-a-self-service-analytics-strategy.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **five dimensions**: audience + topic + model + Governance + Measurement; no missing dimension
2. **Business-value driven**: set priority by speed + consistent + cost + trust + Risk; no empty slogans
3. **audience Audience**: executives / sales / finance / marketing / Operations; no leakage
4. **topic Subject**: sales / finance / marketing / operations / HR; no leakage
5. **model Model**: star / snowflake / fact / dimension / derived; no leakage
6. **Governance Governance**: owner / cadence / review / documentation / drift; no leakage
7. **Measurement Measure**: speed + consistent + cost + trust + Risk; no leakage
8. **Not one-shot**: progressive from audience → topic → model → Governance → Measurement; no skipping levels
9. **no report-ism**: report is just the start; not the end
10. **no empty slogans**: every principle must mark implementation evidence; no vagueness
11. **Versioned**: strategy is versioned; evolution is traceable
12. **link with data-warehouse**: Marts + Warehouse co-build
13. **link with data-lakehouse**: Marts + Lakehouse co-build
14. **link with bi**: Marts + BI co-build
15. **link with self-service**: Marts + Self-Service co-build
16. **link with data-governance**: Marts + Governance co-build
17. **Toolchain**: Snowflake / BigQuery / Databricks / Redshift / dbt
18. **Publicly discoverable**: strategy is publicly discoverable; not hidden
19. **Regular review**: evolve and update; not one-shot
20. **First principles**: why must Data Marts; worst consequence of not doing
21. **Inversion**: how much can direct warehouse querying solve; if solvable, do not introduce heavy strategy
22. **Second-order thinking**: second-order consequence after strategy (speed / consistent / cost / Risk)
23. **Occam's razor**: Data Marts simpler is better; redundant topic cut

## Related

- data-warehouse: [./prepare-a-data-warehouse-strategy.md](./prepare-a-data-warehouse-strategy.md) — Warehouse co-build
- data-lakehouse: [./prepare-a-data-lakehouse-strategy.md](./prepare-a-data-lakehouse-strategy.md) — Lakehouse co-build
- bi: [./prepare-a-bi-strategy.md](./prepare-a-bi-strategy.md) — BI co-build
- self-service-analytics: [./prepare-a-self-service-analytics-strategy.md](./prepare-a-self-service-analytics-strategy.md) — Self-Service co-build
- data-governance: [./prepare-a-data-governance-strategy.md](./prepare-a-data-governance-strategy.md) — Governance co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
