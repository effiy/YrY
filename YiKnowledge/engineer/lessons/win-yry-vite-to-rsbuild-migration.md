---
title: YrY Vite → Rsbuild migration success case study
aliases: [yry-vite-to-rsbuild-migration-win, yivad-rsbuild-migration, rspack-migration]
tags: [success case study, YiVad, Vite, Rsbuild, Rspack, bundler, migration]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./yipet-stack-migration.md
 - ../../projects/yivad/architecture.md
 - ../../projects/yivad/dev-standards.md
 - ../gotchas/vite-to-rsbuild-migration.md
 - ../../tools/biome-eslint-prettier.md
 - ../../processes/review-lessons.md
---

# YrY Vite → Rsbuild migration success case study

> **As an** engineer, **I want to** yry vite to rsbuild migration, **so that** success is reproducible.

> YiVad 2026-07-28 migrated from Vite 8 to Rsbuild 1 (based on Rspack). dev startup 90s → 8s, HMR failure rate 12% → 0.5%, env prefix `VITE_` → `RSBUILD_ENV_*`, svg-sprite + views-glob re-implemented as custom plugins to replace removed Vite APIs.

## Summary

- **5 stages**: env prefix migration → svg-sprite plugin self-rewrite → views-glob plugin self-rewrite → static resource import fix → dev/build dual-track regression
- **key success factors**: Rspack compatible with webpack ecosystem + self-written plugins replacing removed APIs + env prefix lint rules + dev/build dual-track
- **quantified impact**: dev startup 90s → 8s (-91%); HMR failure rate 12% → 0.5%; build output size 4.2MB → 4.0MB (-5%); zero P0 bugs after launch
- **reusable experience**: bundler migration = speed gain + ecosystem compatibility + plugin API replacement + env prefix + dual-track validation

## Core viewpoints

- **Rspack (Rsbuild's base) ≠ Vite** — Vite is esbuild + Rollup; Rsbuild is Rspack (Rust webpack); ecosystems differ, plugin APIs differ, but webpack ecosystem is compatible.
- **Vite 8 removed many APIs** — `import.meta.glob` eager / option items changed; `vite-plugin-svg-sprite` incompatible; self-written plugins replace them.
- **env prefix is an implicit contract** — Vite `VITE_` and Rsbuild `RSBUILD_ENV_*` do not interoperate; all env references must be scanned.
- **dev/build dual-track is mandatory** — dev runs HMR experience; build runs output regression; only passing dev does not count as done.
- **HMR failure rate is a hard metric for bundler health** — 12% failure rate = dev experience collapsed; after switching to Rsbuild 0.5% (with macOS FSEvents fallback).

## Key information

### background

YiVad was originally Vite 8 + Vue 3.5; pain points:

- dev server startup 90s (20 views + 18 api modules + 11 stores + 28 leaves × 2 wrappers all compiled)
- HMR failure rate 12% ([macOS FSEvents silently drops events](gotcha-macos-fsevents-silent-drop.md))
- Vite 8 removed `import.meta.glob` eager / option items + `vite-plugin-svg-sprite` incompatible
- Vite plugin ecosystem limited to esbuild + Rollup; webpack ecosystem unavailable

### 5-stage breakdown

| stage | content |
|---|---|
| 1 | env prefix migration: `VITE_*` → `RSBUILD_ENV_*`; full scan + lint rules |
| 2 | svg-sprite plugin self-rewrite: re-implements `vite-plugin-svg-sprite` |
| 3 | views-glob plugin self-rewrite: re-implements `import.meta.glob('./views/**/*.vue', { eager: true })` |
| 4 | static resource import fix: `new URL('./x.png', import.meta.url)` → `import x from './x.png'` |
| 5 | dev/build dual-track regression: HMR + production build |

### key success factors

1. **Rspack compatible with webpack ecosystem**: webpack plugins/loaders usable; Rspack performance + webpack ecosystem compatibility
2. **Self-written plugins replacing removed APIs**: `vite-plugin-svg-sprite` and `import.meta.glob` eager incompatible; self-written `rsbuild-plugin-svg-sprite` + `rsbuild-plugin-views-glob`
3. **env prefix lint rules**: Biome lint forbids `VITE_` prefix; CI scan
4. **dev/build dual-track validation**: HMR runs dev; production build runs regression
5. **macOS FSEvents fallback**: HMR failure rate 0.5% is FSEvents residual; watchfiles `force_polling` fallback
6. **Static resource import fix**: `new URL(...import.meta.url)` → `import x from './x.png'`; Rspack does not support Vite's `new URL` idiom

### quantified impact

| metric | Before launch | After launch | Change |
|---|---|---|---|
| dev server startup time | 90s | 8s | -91% |
| HMR failure rate | 12% | 0.5% | -95.8% |
| build output size | 4.2 MB | 4.0 MB | -5% |
| config file count | 2 (vite.config + vue.config sub-segment) | 1 (rsbuild.config.ts) | -1 |
| Vite plugin count | 3 | 2 (self-written svg-sprite + views-glob) | -1 |
| Post-launch P0 bugs | — | 0 | — |

### reusable experience

- **Bundler migration decision model**: speed gain + ecosystem compatibility + plugin API replacement + env prefix + static resource idiom + dual-track validation
- **Vite → Rsbuild is not a flat migration**: `VITE_` prefix must be scanned; `import.meta.glob` eager must be re-implemented; `new URL` idiom must change
- **Self-written plugins replacing removed APIs > waiting for ecosystem**: ecosystem lags behind Vite 8 removed APIs; writing 2 plugins solves it
- **dev/build dual-track = mandatory**: dev runs HMR experience; build runs output regression; only passing dev does not count as done
- **HMR failure rate = hard metric for bundler health**: > 5% must switch; > 1% needs fallback; < 0.5% healthy

### follow-up evolution

- Rsbuild 2 tracking: quarterly scan Rspack release notes; do not chase minor versions
- `force_polling` fallback TBD: can be turned off after FSEvents fix; re-evaluate quarterly
- Self-written plugins can be contributed back to Rsbuild ecosystem: assess PR after stabilization
- 28 leaves × 2 wrappers full compilation can consider lazy routes: same cadence as [ADR Vitest](../../tech-lead/decisions/yivad/vitest-introduction.md)

## Action recommendations

1. Before bundler migration, first do speed gain + ecosystem compatibility matrix; do not chase new for its own sake.
2. env prefix must be scanned + Biome lint rules forbid old prefix; CI scans missed changes.
3. Vite-removed APIs (`import.meta.glob` eager / svg-sprite) self-write replacement plugins; do not wait for ecosystem.
4. Static resource import idiom full scan: `new URL(...import.meta.url)` → `import x from './x.png'`.
5. dev/build dual-track validation: HMR + production build; only when both pass is it done.
6. HMR failure rate as hard metric for bundler health: > 5% must switch; > 1% fallback; < 0.5% healthy.
7. macOS FSEvents fallback via watchfiles `force_polling`; turn back off after FSEvents fixed.
8. After switch, run 1 week of stability monitoring, focused on dev startup + HMR failure rate + build output size.

## Anti-patterns

- **Switching bundlers just to chase the new tool** — Vite removing APIs is not a sufficient reason to migrate; the decision must be gated on a quantified matrix of speed gain, ecosystem compatibility, plugin API replacement cost, and dual-track validation. Switching without measuring all four dimensions risks trading one set of problems for another.

- **Skipping a full env-prefix scan** — residual `VITE_` references in the codebase will silently resolve to `undefined` under Rsbuild, causing runtime failures that are not caught by the build. A Biome lint rule must forbid the old prefix, and CI must scan for missed references before the switch is considered complete.

- **Waiting for the ecosystem to provide replacements for removed Vite APIs** — `vite-plugin-svg-sprite` and `import.meta.glob` eager mode are Vite-specific and will not be ported to Rsbuild. Writing two self-contained Rsbuild plugins solves the problem faster and with less risk than waiting for community packages.

- **Validating only the dev server and skipping the production build** — dev mode uses HMR and ESM, which hide issues like incorrect static resource paths (`new URL(...import.meta.url)`) that only surface in the production bundle. Both dev and production builds must pass before the migration is signed off.

- **Tolerating a high HMR failure rate after migration** — an HMR failure rate above 5% means developers are regularly losing their workflow state and restarting the dev server manually. The rate must be driven below 1% with a fallback (e.g., `force_polling`), and below 0.5% is the healthy target.

## Related

- [./gotcha-vite-to-rsbuild-migration.md](./gotcha-vite-to-rsbuild-migration.md) — Gotcha companion documenting common migration pitfalls
- [./gotcha-macos-fsevents-silent-drop.md](./gotcha-macos-fsevents-silent-drop.md) — macOS FSEvents limitation impacting HMR failure rate
- [./win-yipet-stack-migration.md](./win-yipet-stack-migration.md) — Another stack migration success case (YiPet React 15 to React 18)
- [../../architecture-design/one-to-one-mapping-migration.md](../architecture-design/one-to-one-mapping-migration.md) — 1:1 mapping migration pattern used in the 5-stage approach
- [../../tech-lead/decisions/yivad/vitest-introduction.md](../../tech-lead/decisions/yivad/vitest-introduction.md) — ADR for Vitest used in migration validation
