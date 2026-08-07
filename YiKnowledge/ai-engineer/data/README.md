---
title: AI Data Directory
tags: [leaf, tech, data]
category: ai-engineer/data
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: leaf-readme
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [ai-engineer]
benefit: "data clean"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../platform/README.md
  - ../../oncall-sre/observability/README.md
  - ../../engineer/projects/yivad/README.md
---

# AI Data Directory

> **As an** AI engineer, **I want to** manage datasets and data pipelines effectively, **so that** AI models are trained and evaluated on quality data.

Collects data engineering, data governance, and data-science knowledge.

## Scope

- Data modeling (dimensional modeling / Data Vault)
- ETL / ELT patterns
- Data lake / data warehouse / Lakehouse
- Data governance (lineage, quality, catalog)
- Privacy computing (differential privacy, federated learning)
- MongoDB indexing and sharding
- Redis caching patterns

## File types and naming

- `*-summary.md`: topic summary
- `*-template.md`: reusable template

## Frontmatter template

```yaml
---
title: Some data topic
tags: [data, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: 2026-08-07
source: <link or internal>
type: summary
lifecycle: active
review_cycle: quarterly
related:
  - ./dashboard-data-governance.md
  - ./dashboard-data-pipeline.md
  - ./data-governance.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended structure

1. Concept definition and applicable scenarios
2. Key components and terminology
3. Design patterns / step breakdown
4. Selection comparison (vs alternatives)
5. Anti-patterns and pitfalls
6. Local team landing cases (linked to projects/)

## Included

- `data-modeling.md` — Data modeling patterns for AI
- `etl-elt-patterns.md` — ETL/ELT patterns for AI data pipelines
- `lakehouse-architecture.md` — Data lakehouse architecture
- `data-governance.md` — Data governance for AI
- `mongodb-indexing.md` — MongoDB indexing strategies
- `redis-caching-patterns.md` — Redis caching patterns

## Related leaves

- [../platform](../platform) — vector DB, Embedding (data dimension)
- [../../oncall-sre/observability](../../oncall-sre/observability) — capacity and cost (FinOps)
- [../../engineer/projects/yivad](../../engineer/projects/yivad) — MongoDB in practice
- [../../engineer/engineering/find-ai-deployment-cases.md](../../engineer/engineering/find-ai-deployment-cases.md) — RAG data link
- [../methodology/rag-design-patterns.md](../methodology/rag-design-patterns.md) — RAG design
