---
title: Vite -> Rsbuild Migration Gotchas
aliases: [vite-to-rsbuild-migration, vite-rsbuild-gotcha]
tags: [gotcha, Vite, Rsbuild, migration, build]
category: engineer/lessons
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, oncall-sre]
benefit: "same mistake avoided"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./macos-fsevents-silent-drop.md
 - ./react-jsxdev-mismatch.md
 - ../../strategies/check-engineering-gotchas.md
---

# Vite -> Rsbuild Migration Gotchas

> **As an** engineer, **I want to** vite to rsbuild migration, **so that** same mistake avoided.

> Common migration gotchas and countermeasures when going from Vite (esbuild + Rollup) to Rsbuild (Rspack / Rust webpack).

## Summary

- Four big gotchas: env prefix (`VITE_` -> `RSBUILD_ENV_`), custom plugins not compatible, svg-sprite and other specialized features need rewriting, views glob import path handling differs.
- Root cause: Vite and Rsbuild use different underlying bundlers, plugin APIs are not compatible.
- YiVad has already migrated to Rsbuild; key path: env prefix + svg-sprite + views-glob three rewritten plugins.

## Core viewpoints

- **Vite and Rsbuild plugin APIs are not compatible, and the incompatibility is silent until build time.** vite-plugin-* packages assume Rollup/esbuild internals; Rsbuild is Rspack-based. A plugin that works in Vite will not throw a helpful error in Rsbuild — it will silently produce incorrect output or fail at the build step with a cryptic Rspack error. Every custom plugin must be rewritten as an Rsbuild plugin or replaced with a bundler-agnostic `unplugin-*` equivalent. The plugin audit is the first step of migration, not an afterthought.

- **Env prefix conventions are a migration tax that must be paid in full before the first build.** `VITE_` → `RSBUILD_ENV_` is not a config-only change. Every `import.meta.env.VITE_X` reference in source code — including third-party libraries, inline scripts, and CI pipelines — must be replaced with `process.env.RSBUILD_ENV_X`. A single missed reference produces a runtime `undefined` that may not surface until the affected feature is used in production.

- **The migration is a one-way door only if custom plugins are written as bundler-specific.** Writing an Rsbuild-specific plugin repeats the lock-in pattern that caused the Vite-to-Rsbuild migration pain. The `unplugin-*` abstraction layer supports Vite, Rollup, webpack, and Rsbuild from a single plugin definition. The correct migration strategy is: rewrite custom plugins as `unplugin-*` during the migration, not after. This converts the migration from a one-way door into a reversible decision.

- **HMR behavior differences are concentrated at the boundary cases, not the happy path.** Component state preservation, CSS module updates, and store hot-reload behave identically in most scenarios. The differences emerge at the edges: circular dependencies in HMR chains, module graphs with mixed ESM/CJS, and plugins that intercept HMR events. The QA checklist must explicitly test these boundary cases, because the standard test suite exercises only the happy path where HMR works identically.

- **The migration cost is justified by the compounding build-time savings, not by a one-time speedup.** Rsbuild's 5-10x faster build is not the primary justification — it is the compounding effect of faster builds on developer iteration speed. A developer who saves 30 seconds per build, 50 times per day, saves 25 minutes daily. Over a team of 5 engineers over a year, the savings compound to hundreds of engineering hours. The migration business case should be framed in terms of developer throughput, not build benchmarks.

## Key information

### Symptoms

When migrating a project from Vite to Rsbuild (Rspack-based), common gotchas:

- Env variable prefix changes (`VITE_` -> `RSBUILD_ENV_`)
- Custom plugins not compatible (vite-plugin-* cannot be used directly)
- svg-sprite and other specialized features need rewriting
- Views glob import path handling differs
- HMR behavior has minor differences

### Root cause

- Vite is based on esbuild + Rollup, Rsbuild is based on Rspack (Rust webpack)
- The two plugin APIs are not compatible
- Environment variable conventions differ
- Static resource handling paths differ

### Solution

**3.1 Environment variable prefix**

```bash
# Vite
VITE_API_URL=...

# Rsbuild
RSBUILD_ENV_API_URL=...
```

Batch replace during migration. In code `import.meta.env.VITE_X` -> `process.env.RSBUILD_ENV_X`.

**3.2 Custom plugins**

- vite-plugin-svg-sprite -> write your own rsbuild plugin
- vite-plugin-pages-glob -> use rsbuild's source glob
- Generic plugins (like unplugin-vue-components) Rsbuild also supports

**3.3 svg-sprite handling**

```js
// Vite old way
import { vitePluginSvgSprite } from 'vite-plugin-svg-sprite';

// Rsbuild new way
export const svgSpritePlugin = (options) => ({
 name: 'svg-sprite',
 setup(api) {
 api.transform({ pool: 'all' }, async (ctx) => {
 // handle .svg files
 });
 },
});
```

**3.4 views glob import**

```js
// Vite
const modules = import.meta.glob('./views/**/*.vue');

// Rsbuild (use webpack require.context equivalent)
const modules = {};
const ctx = require.context('./views', true, /\.vue$/);
ctx.keys().forEach(k => { modules[k] = ctx(k); });
```

**3.5 HMR**

- Vite: native ESM HMR
- Rsbuild: webpack HMR (some scenarios differ)
- Most scenarios are imperceptible; complex HMR boundary cases need QA

### Reasons to choose Rsbuild

- 5-10x faster than Vite for large projects
- Faster than webpack 5 (Rust implementation)
- Compatible with webpack ecosystem (lower migration cost)
- Monorepo friendly

### Reasons not to migrate

- Vite is already stable, migration not strictly necessary
- Team unfamiliar with Rspack
- Project small, Vite is fast enough

### Similar migration gotchas

- webpack -> Vite: env variables, CommonJS vs ESM, dynamic require
- Vue CLI -> Vite: node polyfill, CSS handling differences
- Any webpack family -> ESM family: dynamic require not supported

## Action recommendations

1. Back up the current vite config.
2. Install rsbuild + rsbuild core.
3. Create rsbuild.config.ts.
4. Migrate env variable prefix (batch replace + in code import.meta.env -> process.env).
5. Rewrite custom plugins (svg-sprite / views-glob / others).
6. QA svg-sprite / glob import / HMR three big easy-to-break points.
7. Run full QA and build.
8. Validate dev server and production build.
9. Team PR review then delete old vite config.
10. Wrap custom plugins as unplugin-* (cross-tool compatibility) to avoid rewriting on next migration.

## Anti-patterns

- **Assuming `vite-plugin-*` packages work under Rsbuild** — Vite and Rsbuild use incompatible plugin APIs (Rollup/esbuild vs. Rspack), so any vite-specific plugin will silently fail or throw at build time. Every custom plugin must be rewritten as an Rsbuild plugin or replaced with a `unplugin-*` equivalent.

- **Updating only the config file but not the runtime code** — changing `rsbuild.config.ts` to declare `RSBUILD_ENV_*` variables does nothing if the application code still references `import.meta.env.VITE_*`. Every `VITE_` reference in source code must be batch-replaced with `process.env.RSBUILD_ENV_*`.

- **Dropping the SVG sprite system during migration** — if the business UI depends on an SVG sprite icon system, deleting the vite-plugin-svg-sprite without replacing it with an Rsbuild equivalent breaks the entire icon layer. The sprite plugin must be rewritten, not removed.

- **Skipping HMR boundary-case QA** — most HMR scenarios behave identically, but edge cases (component state preservation, CSS module updates, store hot-reload) differ between Vite's native ESM HMR and Rsbuild's webpack HMR. Complex HMR boundaries must be tested explicitly.

- **Migrating without wrapping custom plugins as `unplugin-*`** — writing a bundler-specific plugin for Rsbuild locks the project into Rspack, repeating the same lock-in that caused the Vite-to-Rsbuild migration pain. Wrapping plugins as framework-agnostic `unplugin-*` packages avoids the next migration rewrite.

## Related

- [./win-yry-vite-to-rsbuild-migration.md](./win-yry-vite-to-rsbuild-migration.md) — Success case companion documenting the 5-stage migration methodology
- [./gotcha-macos-fsevents-silent-drop.md](./gotcha-macos-fsevents-silent-drop.md) — macOS FSEvents limitation impacting HMR during migration
- [./gotcha-react-jsxdev-mismatch.md](./gotcha-react-jsxdev-mismatch.md) — Another build toolchain gotcha with similar env-variable root cause
- [./win-yipet-stack-migration.md](./win-yipet-stack-migration.md) — Another stack migration reference (YiPet React 15 to React 18)
