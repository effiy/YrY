---
title: Tech Lead — Decisions (ADRs)
tags: [leaf, tech-lead, adr, decisions, architecture]
category: tech-lead/decisions
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [tech-lead, engineer]
benefit: "Tech leads find all project-level Architecture Decision Records organized by project"
acceptance_criteria:
  - "ADRs organized by project (YiAi, YiVad, YiPet, FDE)"
  - "Cross-project ADR dashboard accessible"
  - "Each ADR follows the 12-section template"
related:
  - ../INDEX.md
  - ../architecture/design-architecture-decision.md
  - ../../engineer/architecture-design/
---

# Tech Lead — Decisions (ADRs)

> **As a** tech lead, **I want to** find all project-level Architecture Decision Records, **so that** I can understand why past decisions were made and make consistent future ones.

## Projects

| Project | ADRs | Key decisions |
|---|---|---|
| [yiai/](./yiai/) | 6 | BRD agent launch, LLM multi-provider routing, RAG eval infra, pytest, knowledge watcher |
| [yivad/](./yivad/) | 3 | AiCR phase port, Vitest introduction and rollout |
| [yipet/](./yipet/) | 3 | Biome lint/format, AiCR port, Chrome MV3 dual-world boundary |
| [fde/](./fde/) | 4 | Air-gap first, Delta as contract, enterprise RAG hybrid search, two-loop eval |

## Cross-project

| File | Description |
|---|---|
| [dashboard-architecture-decisions.md](./dashboard-architecture-decisions.md) | ADR status dashboard across all projects |
| [stack-migration-sequencing.md](./stack-migration-sequencing.md) | Multi-project stack migration sequencing |

## Cross-references

- [../architecture/design-architecture-decision.md](../architecture/design-architecture-decision.md) — ADR framework and template
- [../../engineer/architecture-design/](../../engineer/architecture-design/) — System design patterns