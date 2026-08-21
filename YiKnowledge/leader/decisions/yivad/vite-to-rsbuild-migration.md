---
title: "ADR: YiVad Vite to Rsbuild Migration"
tags: [adr, yivad, rsbuild, vite, migration, build]
category: leader/decisions/yivad
created: 2026-08-21
updated: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the Vite to Rsbuild migration decision and its consequences"
related:
  - ../../../engineer/learn/projects/yivad/README.md
---

# ADR: YiVad Vite to Rsbuild Migration

> **Status**: Accepted (2026-07-28) — implemented

## Context

YiVad was built on Vite 8. The team decided to migrate to Rsbuild 1 for better build performance and ecosystem alignment.

## Decision

**Migrate from Vite 8 to Rsbuild 1, replacing Vite-specific plugins with custom Rsbuild plugins.**

### Changes

| Vite | Rsbuild |
|------|---------|
| `VITE_*` env prefix | `RSBUILD_ENV_*` prefix |
| `vite-plugin-svg-icons` | Custom `svg-sprite` plugin |
| `import.meta.glob` for views | Custom `views-glob` plugin |

### Consequences

- Env var prefix changed from `VITE_` to `RSBUILD_ENV_` — any remaining `VITE_` references are bugs
- Two custom plugins (`svg-sprite`, `views-glob`) replicate dropped Vite features
- A lint rule to catch `import.meta.env.VITE_` references is recommended for pre-commit hooks