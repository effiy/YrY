---
title: AI & Data domain index
tags: [domain-index, ai, ml, data, rag, llm]
category: root
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: domain-index
status: stable
lifecycle: active
roles: [engineer, ai-engineer, tech-lead, product-manager]
benefit: "All AI/ML and data engineering content reachable from a single index"
acceptance_criteria:
  - "Aggregates AI/ML files from engineer/engineering/ and ai-engineer/"
  - "Aggregates data files from engineer/infrastructure/"
  - "Organized by subdomain: ai-patterns, ai-foundations, data-engineering"
related:
  - ./INDEX.md
  - ./README.md
  - .../engineer/SECURITY.md
  - ../knowledge-curator/COLLABORATION.md
---

# AI & Data Domain Index

Cross-role aggregation of all AI/ML, data engineering, and analytics content.

## AI/ML engineering patterns

| File | Role | Description |
|---|---|---|
| [evaluation-driven-development.md](../engineer/engineering/evaluation-driven-development.md) | engineer | Eval-driven AI development methodology |
| [inline-citation-rag.md](../engineer/engineering/inline-citation-rag.md) | engineer | RAG with inline citation patterns |
| [vector-index.md](../engineer/engineering/vector-index.md) | engineer | Vector database indexing strategies |
| [find-ai-deployment-cases.md](../engineer/engineering/find-ai-deployment-cases.md) | engineer | Identifying AI deployment opportunities |
| [handle-content-moderation.md](../engineer/engineering/handle-content-moderation.md) | engineer | AI content moderation patterns |
| [evaluate-a-vendor-saas.md](../engineer/engineering/evaluate-a-vendor-saas.md) | engineer | AI vendor/SaaS evaluation framework |
| [blameless-culture.md](../engineer/engineering/blameless-culture.md) | engineer | Blameless postmortem culture |
| [bootstrap-a-new-team.md](../engineer/engineering/bootstrap-a-new-team.md) | engineer | Team formation patterns |

## Observability & resilience (AI-systems)

| File | Role | Description |
|---|---|---|
| [observability.md](../engineer/engineering/observability.md) | engineer | Observability patterns for AI systems |
| [distributed-tracing.md](../engineer/engineering/distributed-tracing.md) | engineer | Distributed tracing implementation |
| [rate-limiting.md](../engineer/engineering/rate-limiting.md) | engineer | Rate limiting strategies |
| [shed-load.md](../engineer/engineering/shed-load.md) | engineer | Load shedding patterns |
| [cdc.md](../engineer/engineering/cdc.md) | engineer | Change data capture patterns |
| [dual-world-boundary.md](../engineer/engineering/dual-world-boundary.md) | engineer | Chrome MV3 dual-world boundary |

## AI engineer foundations

| File | Role | Description |
|---|---|---|
| [foundations/](./ai-engineer/foundations/) | ai-engineer | 10 AI/ML theory files (transformers, attention, RAG architectures) |
| [methodology/](./ai-engineer/methodology/) | ai-engineer | 43 prompt engineering and evaluation files |
| [platform/](./ai-engineer/platform/) | ai-engineer | 12 AI platform and deployment files |
| [data/](./ai-engineer/data/) | ai-engineer | 6 dataset and data pipeline files |

## Data engineering

| File | Role | Description |
|---|---|---|
| [data-persistence/](../engineer/infrastructure/) | engineer | 26 data patterns: idempotency, backpressure, connection pooling, retry, outbox, read replicas, migrations |
| [do-a-data-migration.md](../engineer/infrastructure/do-a-data-migration.md) | engineer | Data migration process |
| [do-a-data-quality-audit.md](../engineer/infrastructure/do-a-data-quality-audit.md) | engineer | Data quality audit framework |
| [mongodb-query-filter-contract.md](../engineer/infrastructure/mongodb-query-filter-contract.md) | engineer | MongoDB query/filter contract |

## Cross-cutting references

- [tech-lead/decisions/yiai--](./tech-lead/decisions/yiai--) — AI-related ADRs (multi-provider, RAG eval, BRD agent, knowledge watcher)
- [tech-lead/decisions/fde--](./tech-lead/decisions/fde--) — FDE AI decisions (delta contract, eval gate, air-gap, hybrid search)
- [product-manager/frameworks/](./product-manager/frameworks/) — AI product launch methodology
