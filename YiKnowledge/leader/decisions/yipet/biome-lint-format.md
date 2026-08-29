---
title: "ADR: YiPet Biome Lint/Format Adoption"
tags: [adr, yipet, biome, linting, formatting]
category: leader/decisions/yipet
created: 2026-08-21
updated: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the decision to replace ESLint + Prettier with Biome"
related:
  - ../../../engineer/learn/projects/yipet/README.md
---

# ADR: YiPet Biome Lint/Format Adoption

> **Status**: Accepted (2026-07-28) — implemented

## Context

YiPet's stack migration (React 15 → 18, Bootstrap → Ant Design 5) was an opportunity to also modernize the linting and formatting toolchain. ESLint + Prettier added configuration complexity and slow run times.

## Decision

**Replace ESLint + Prettier with Biome 2.5 for both linting and formatting.**

Biome is a fast Rust-based tool that combines linting and formatting in a single binary. It covers the same ruleset as ESLint + Prettier for TypeScript/TSX projects.

## Rationale

- Single tool replaces two (ESLint + Prettier) — less config, fewer dependencies
- Rust-based → significantly faster than ESLint (JS-based)
- Native TypeScript/TSX support without additional parsers
- `biome check --write` handles both lint and format in one pass

## Consequences

- `biome.json` is the single config file
- Pre-commit hooks use `biome check --write` instead of `eslint --fix` + `prettier --write`
- YiVad still uses ESLint + Prettier — cross-project linting divergence accepted