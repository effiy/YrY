---
title: "ADR: YiPet React 18 + Ant Design 5 Migration"
tags: [adr, yipet, react, ant-design, migration, stack]
category: leader/decisions/yipet
created: 2026-08-24
updated: 2026-08-24
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the React 15→18 + Bootstrap→Ant Design 5 migration decision and its consequences"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ../../../engineer/learn/projects/yipet/架构设计.md
  - ./biome-lint-format.md
---

# ADR: YiPet React 18 + Ant Design 5 Migration

> **Status**: Accepted (2026-07-28) — implemented

## Context

YiPet was built on React 15 with Bootstrap CSS for both the popup control panel and chat window. React 15 was end-of-life, lacked hooks (all components were class-based), and Bootstrap's jQuery dependency created conflicts with Chrome MV3's CSP. The codebase had accumulated significant tech debt from the class-component pattern.

## Decision

**Migrate from React 15 + Bootstrap to React 18.3 + Ant Design 5.21, replacing ESLint + Prettier with Biome 2.5 in the same migration.**

### Changes

- **React 15 → React 18.3**: Class components rewritten to function components with hooks. `createRoot` API replacing `ReactDOM.render`. Concurrent features available but not yet used.
- **Bootstrap → Ant Design 5.21**: Popup and chat UI rebuilt with Ant Design components (`ConfigProvider` for theme switching, `Tree` for knowledge browser, `Modal`/`Button`/`Input` patterns). CSS-in-JS via Ant Design's token system replaces Bootstrap's global CSS.
- **ESLint + Prettier → Biome 2.5**: Rust-based linter/formatter for faster CI runs. Configuration in `biome.json`.
- **CDN catalog update**: 80+ vendor libraries under `public/cdn/vendor/` updated — React 18.3.1, ReactDOM 18.3.1, dayjs 1.11.21, antd 5.21.x bundled locally for MV3 CSP compliance.

### Consequences

- **Positive**: Hooks enable code reuse via custom hooks; Ant Design provides consistent component API; Biome is significantly faster than ESLint
- **Negative**: `--mode production` required for chat bundle to avoid `jsxDEV is not a function` error; CDN catalog must stay in sync with npm versions
- **Risk**: 80+ library version alignment is manual — a single mismatch between React and ReactDOM breaks the entire extension

## Alternatives considered

1. **React 18 + keep Bootstrap** — rejected because Bootstrap's jQuery dependency violates MV3 CSP and class-component patterns lack hooks
2. **Preact + Ant Design** — rejected because Preact's React compatibility layer adds risk for the CDN-injected architecture
3. **Keep ESLint** — rejected because Biome's Rust-based parser is 10-20x faster, critical for the multi-entry Rsbuild build