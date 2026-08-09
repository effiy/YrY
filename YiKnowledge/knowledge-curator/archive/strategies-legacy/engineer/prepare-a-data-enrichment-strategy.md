---
title: I want to build a data enrichment strategy / Prepare a data-enrichment strategy
aliases: [i-want-to-prepare-a-data-enrichment-strategy, data-enrichment-strategy]
tags: [journey, methodology, data, quality, planning]
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
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-data-pipeline-strategy.md
  - ./prepare-a-data-quality-strategy.md
  - ./prepare-a-data-cleaning-strategy.md
  - ./prepare-a-data-catalog-strategy.md
  - ./prepare-a-master-data-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Data enrichment is not just concatenation; it is a contract. source + matching + merging + governance + measurement as five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build a data enrichment strategy

> **As an** engineer, **I want to** prepare a data enrichment, **so that** launch is safe. 

## Summary

- Data enrichment = contract; not just concatenation
- source + matching + merging + governance + measurement as five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers third-party / geo / firmographic / technographic / intent multiple types
- Links with data-pipeline + data-quality + data-cleaning + data-catalog + master-data
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Data enrichment is a contract; not just concatenation. This entry provides the full data enrichment path, covering source + matching + merging + governance + measurement, business-value driven (not by gut feel), covering third-party / geo / firmographic / technographic / intent multiple types, linking with prepare-a-data-pipeline + prepare-a-data-quality + prepare-a-data-cleaning + prepare-a-data-catalog + prepare-a-master-data, publicly queryable, periodic review, and linking to DataPipeline / DataQuality / DataCleaning / DataCatalog / MasterData and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | data-pipeline | [./prepare-a-data-pipeline-strategy.md](./prepare-a-data-pipeline-strategy.md) |
| 1 hop | data-quality | [./prepare-a-data-quality-strategy.md](./prepare-a-data-quality-strategy.md) |
| 2 hops | data-cleaning | [./prepare-a-data-cleaning-strategy.md](./prepare-a-data-cleaning-strategy.md) |
| 2 hops | data-catalog | [./prepare-a-data-catalog-strategy.md](./prepare-a-data-catalog-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: source + matching + merging + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Source**: third-party / open / internal; do not omit
4. **Match**: key / fuzzy / entity; do not omit
5. **Merge**: conflict / priority / audit; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: enrichment rate + match rate + incremental value + risk + cost; do not omit
8. **Not one-shot**: progress from source → matching → merging → governance → measurement; no skipping
9. **Not report-ized**: field counts are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with data-pipeline**: enrichment + pipeline co-built
13. **Link with data-quality**: enrichment + quality co-built
14. **Link with data-cleaning**: enrichment + cleaning co-built
15. **Link with data-catalog**: enrichment + catalog co-built
16. **Link with master-data**: enrichment + master data co-built
17. **Toolchain**: Clearbit / ZoomInfo / Dun & Bradstreet / Experian / internal API
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why data enrichment is necessary; worst consequence of not doing it
21. **Inversion thinking**: how much can be solved with raw data; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk)
23. **Occam**: data enrichment: the simpler the better; cut redundant layers

## Related

- data-pipeline: [./prepare-a-data-pipeline-strategy.md](./prepare-a-data-pipeline-strategy.md) — DataPipeline co-built
- data-quality: [./prepare-a-data-quality-strategy.md](./prepare-a-data-quality-strategy.md) — DataQuality co-built
- data-cleaning: [./prepare-a-data-cleaning-strategy.md](./prepare-a-data-cleaning-strategy.md) — DataCleaning co-built
- data-catalog: [./prepare-a-data-catalog-strategy.md](./prepare-a-data-catalog-strategy.md) — DataCatalog co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
