---
title: Architecture and Design Patterns Directory
tags: [leaf, architecture, design, api, patterns, system-design]
category: engineer/architecture-design
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, tech-lead]
benefit: "Engineers find architecture patterns, API design guides, and system design references in one place"
acceptance_criteria:
  - "Design patterns and architecture references categorized"
  - "API design and RPC contract documentation present"
  - "Cross-references to tech-lead ADRs"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../tech-lead/architecture/
  - ../../tech-lead/decisions/
---

# Architecture and Design Patterns Directory

> **As an** engineer, **I want to** find architecture patterns, API design guides, and system design references, **so that** I can design systems that are maintainable, scalable, and consistent.

## Design patterns

| Pattern | File | Type |
|---|---|---|
| Domain-driven design | [apply-domain-driven-design.md](./apply-domain-driven-design.md) | methodology |
| Team topologies | [apply-team-topologies.md](./apply-team-topologies.md) | org-design |
| Docs-as-code | [adopt-docs-as-code.md](./adopt-docs-as-code.md) | process |
| Anti-corruption layer | [anti-corruption-layer.md](./anti-corruption-layer.md) | pattern |
| API gateway | [api-gateway.md](./api-gateway.md) | pattern |
| BFF | [bff.md](./bff.md) | pattern |
| Aggregator | [aggregator.md](./aggregator.md) | pattern |
| Batch processing | [batch-processing.md](./batch-processing.md) | pattern |
| Graceful degradation | [graceful-degradation.md](./graceful-degradation.md) | pattern |
| Multi-tenancy | [handle-multi-tenancy.md](./handle-multi-tenancy.md) | pattern |

## API & contracts

| File | Description |
|---|---|
| [implement-an-api.md](./implement-an-api.md) | API implementation patterns |
| [rpc-envelope.md](./rpc-envelope.md) | RPC envelope contract |
| [rpc-envelope-contract.md](./rpc-envelope-contract.md) | RPC contract specification |
| [sse-streaming.md](./sse-streaming.md) | SSE streaming contract |
| [ssot-view-layer.md](./ssot-view-layer.md) | Single source of truth view layer |
| [event-schema.md](./event-schema.md) | Event schema design |

## Data & state

| File | Description |
|---|---|
| [design-a-data-model.md](./design-a-data-model.md) | Data modeling guide |
| [one-to-one-mapping-migration.md](./one-to-one-mapping-migration.md) | 1:1 mapping migration |
| [staged-port-methodology.md](./staged-port-methodology.md) | Staged port methodology |

## Cross-references

- [../../tech-lead/architecture/](../../tech-lead/architecture/) — Tech selection, maturity models, DORA
- [../../tech-lead/decisions/](../../tech-lead/decisions/) — Architecture Decision Records
- [../ENGINEERING.md](../ENGINEERING.md) — Engineering domain index