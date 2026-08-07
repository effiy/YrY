---
title: I want to prepare a data quality strategy / Prepare a data quality strategy
aliases: [i-want-to-prepare-a-data-quality-strategy, data-quality-strategy, dq-strategy]
tags: [journey, methodology, data, quality, governance, planning]
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
 - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
 - "body contains user story header + 7 fixed-order sections"
related:
 - ../processes/do-a-data-quality-audit.md
 - ./prepare-a-data-governance-framework.md
 - ./prepare-a-data-lineage-strategy.md
 - ./prepare-a-data-engineering-strategy.md
 - ../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md
 - ../tools/set-up-a-data-pipeline.md
 - ../../oncall-sre/observability/set-up-observability.md
 - ./prepare-a-data-classification.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Data quality is not just validation; it is a contract. Completeness + accuracy + consistency + timeliness + uniqueness; business-value driven; not one-shot; measurable
---

# I want to prepare a data quality strategy

> **As an** engineer, **I want to** prepare a data quality, **so that** launch is safe. 

## Summary

- Data quality = contract; not just validation
- Completeness + accuracy + consistency + timeliness + uniqueness; no missing dimension
- Business-value driven; not by feel
- Covers collection + processing + storage + query + alert
- Links with audit + governance + lineage + engineering + arch + pipeline + observability + classification
- Publicly accessible; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Data quality is a contract; not just validation. This entry provides the data quality full path, covering completeness + accuracy + consistency + timeliness + uniqueness, business-value driven not by feel, covering collection + processing + storage + query + alert, linking with do-a-data-quality-audit + prepare-a-data-governance-framework + prepare-a-data-lineage-strategy + prepare-a-data-engineering-strategy + prepare-a-data-architecture-strategy + set-up-a-data-pipeline + set-up-observability + prepare-a-data-classification, publicly accessible, regular review, and links to do-a-data-quality-audit / prepare-a-data-governance-framework / prepare-a-data-lineage-strategy / prepare-a-data-engineering-strategy / prepare-a-data-architecture-strategy / set-up-a-data-pipeline / set-up-observability / prepare-a-data-classification and other leaves. 

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | audit | [../processes/do-a-data-quality-audit.md](../processes/do-a-data-quality-audit.md) |
| 2 hops | governance | [./prepare-a-data-governance-framework.md](./prepare-a-data-governance-framework.md) |
| 2 hops | lineage | [./prepare-a-data-lineage-strategy.md](./prepare-a-data-lineage-strategy.md) |
| 2 hops | engineering | [./prepare-a-data-engineering-strategy.md](./prepare-a-data-engineering-strategy.md) |
| 2 hops | arch | [../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md) |
| 2 hops | pipeline | [../tools/set-up-a-data-pipeline.md](../tools/set-up-a-data-pipeline.md) |
| 2 hops | observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: completeness + accuracy + consistency + timeliness + uniqueness; no missing dimension
2. **Business-value driven**: prioritize by business scenario + data value + risk; no empty slogans
3. **Completeness**: non-null + required fields + scope; none missing
4. **Accuracy**: business validation + cross-source + sampling; none missing
5. **Consistency**: cross-system + cross-time + cross-format; none missing
6. **Timeliness**: freshness + SLA + latency monitoring; none missing
7. **Uniqueness**: primary key + dedup + duplicate rate; none missing
8. **Not one-shot**: progressive from validation -> monitoring -> alert -> auto-fix; no skipping levels
9. **Not report-only**: reports are only the starting point; not the endpoint
10. **No empty slogans**: every principle must have landed evidence; no ambiguity
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with audit**: quality + audit co-build
13. **Link with governance**: quality + governance co-build
14. **Link with lineage**: quality + lineage co-build
15. **Link with engineering**: quality + engineering co-build
16. **Link with arch**: quality + architecture co-build
17. **Link with pipeline**: quality + pipeline co-build
18. **Link with observability**: quality + observe co-build
19. **Toolchain**: Great Expectations / Soda / dbt tests / Monte Carlo / Databand
20. **Publicly accessible**: strategy accessible to everyone; not hidden
21. **Regular review**: evolve and update; not one-shot
22. **First principles**: why must data quality; worst consequence of not doing it
23. **Inversion**: how much can be solved with SQL validation + manual sampling; if solvable, don't introduce a heavy strategy
24. **Second-order thinking**: second-order consequences after the strategy (cost / complexity / trust / business) 
25. **Occam**: quality the simpler the better; cut redundant steps

## Related

- audit: [../processes/do-a-data-quality-audit.md](../processes/do-a-data-quality-audit.md) — audit co-build
- governance: [./prepare-a-data-governance-framework.md](./prepare-a-data-governance-framework.md) — governance co-build
- lineage: [./prepare-a-data-lineage-strategy.md](./prepare-a-data-lineage-strategy.md) — lineage co-build
- engineering: [./prepare-a-data-engineering-strategy.md](./prepare-a-data-engineering-strategy.md) — engineering co-build
- arch: [../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md) — architecture co-build
- pipeline: [../tools/set-up-a-data-pipeline.md](../tools/set-up-a-data-pipeline.md) — pipeline co-build
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — observe co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
