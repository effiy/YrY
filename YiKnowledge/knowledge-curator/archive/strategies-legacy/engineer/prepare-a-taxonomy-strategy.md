---
title: Build a taxonomy strategy / Prepare a taxonomy strategy
aliases: [i-want-to-prepare-a-taxonomy-strategy, taxonomy-strategy]
tags: [journey, methodology, data, knowledge, planning]
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
  - ./prepare-an-ontology-strategy.md
  - ./prepare-a-knowledge-graph-strategy.md
  - ./prepare-a-data-catalog-strategy.md
  - ./prepare-a-metadata-management-strategy.md
  - ./prepare-a-data-classification-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A taxonomy is not just classification; it is a contract. Five dimensions: hierarchy + naming + relations + governance + measurement; business-value driven; not one-shot; measurable
status: deprecated
---

# Build a taxonomy strategy

> **As an** engineer, **I want to** prepare a taxonomy, **so that** launch is safe. 

## Summary

- Taxonomy = contract; not just classification
- Hierarchy + naming + relations + governance + measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers flat / hierarchical / polyhierarchical / faceted / network — multiple types
- Links with ontology + knowledge-graph + data-catalog + metadata-management + data-classification
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

A taxonomy is a contract; not just classification. This entry provides the taxonomy full path, covering hierarchy + naming + relations + governance + measurement, business-value driven rather than gut feel, covering flat / hierarchical / polyhierarchical / faceted / network — multiple types, linking with prepare-an-ontology + prepare-a-knowledge-graph + prepare-a-data-catalog + prepare-a-metadata-management + prepare-a-data-classification, publicly queryable, periodic review, and links to Ontology / KnowledgeGraph / DataCatalog / MetadataManagement / DataClassification and other leaves. 

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | ontology | [./prepare-an-ontology-strategy.md](./prepare-an-ontology-strategy.md) |
| 1 hop | knowledge-graph | [./prepare-a-knowledge-graph-strategy.md](./prepare-a-knowledge-graph-strategy.md) |
| 2 hops | data-catalog | [./prepare-a-data-catalog-strategy.md](./prepare-a-data-catalog-strategy.md) |
| 2 hops | metadata-management | [./prepare-a-metadata-management-strategy.md](./prepare-a-metadata-management-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: hierarchy + naming + relations + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Hierarchy**: parent / child / depth; do not omit
4. **Naming**: conventions / uniqueness / internationalization; do not omit
5. **Relations**: equivalent / contains / related; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: coverage + consistency + drift + risk + cost; do not omit
8. **Not one-shot**: progressive from hierarchy -> naming -> relations -> governance -> measurement; no skipping
9. **Not report-ized**: node counts are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with ontology**: taxonomy + ontology co-built
13. **Link with knowledge-graph**: taxonomy + knowledge graph co-built
14. **Link with data-catalog**: taxonomy + catalog co-built
15. **Link with metadata-management**: taxonomy + metadata co-built
16. **Link with data-classification**: taxonomy + data classification co-built
17. **Toolchain**: PoolParty / SKOS / Apache Jena / TopBraid / in-house taxonomy-manager
18. **Publicly queryable**: everyone can look up the strategy; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why a taxonomy is necessary; worst consequence of not doing it
21. **Inversion thinking**: how much can be solved with free tagging; if solvable do not introduce heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk) 
23. **Occam**: taxonomy the simpler the better; cut redundant layers

## Related

- ontology: [./prepare-an-ontology-strategy.md](./prepare-an-ontology-strategy.md) — Ontology co-built
- knowledge-graph: [./prepare-a-knowledge-graph-strategy.md](./prepare-a-knowledge-graph-strategy.md) — KnowledgeGraph co-built
- data-catalog: [./prepare-a-data-catalog-strategy.md](./prepare-a-data-catalog-strategy.md) — DataCatalog co-built
- metadata-management: [./prepare-a-metadata-management-strategy.md](./prepare-a-metadata-management-strategy.md) — MetadataManagement co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
