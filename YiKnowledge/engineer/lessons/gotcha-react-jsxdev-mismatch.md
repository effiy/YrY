---
title: React 18 + jsxDEV mismatch
aliases: [react-18-jsxdev-mismatch, jsxdev-not-a-function]
tags: [pitfall, React, jsxDEV, bundling, SWC, Babel]
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
  - "anti-patterns or when-not-to-use are identified
related:
---

# React 18 + jsxDEV mismatch

> **As an** engineer, **I want to** react jsxdev mismatch, **so that** same mistake avoided.

> React 18 production build reports `jsxDEV is not a function` — SWC/Babel dev mode and NODE_ENV=production mismatch.

## Summary

- Symptom: React 18 production build reports `jsxDEV is not a function` or `Cannot read properties of undefined (reading 'jsxDEV')`, dev works fine.
- Root cause: SWC/Babel config hardcodes `development: true`, but at build time NODE_ENV=production, source imports `jsxDEV` while production React switches to `jsx-runtime`.
- Fix: align build mode with NODE_ENV, or do not hardcode `development` in SWC/Babel so it follows NODE_ENV.
- YiPet chat.js dev script uses `--mode production` as a workaround (not elegant but practical).

## Core viewpoints

- **The jsxDEV mismatch is not a React bug -- it is a build configuration error that is invisible in development and catastrophic in production**: The fact that the dev server works perfectly while the production build crashes with `jsxDEV is not a function` is the defining characteristic of this failure mode. It creates a false sense of security because the most-tested environment (dev) never triggers the error, while the least-tested environment (prod build) always does.

- **Hardcoding `development: true` in a bundler config is a time bomb that will explode on the next production build**: The SWC/Babel `development` flag controls which JSX runtime is imported. When `development: true` is hardcoded, the dev runtime (`jsx-dev-runtime`) is imported regardless of `NODE_ENV`. The production React build does not export `jsxDEV`, so the import resolves to `undefined`, and the first JSX expression throws. The fix is never to hardcode this flag -- let it follow `NODE_ENV` automatically.

- **The `NODE_ENV` vs `mode` distinction in Vite/Rsbuild is a footgun that only fires in production**: `mode` controls the bundler's optimization behavior (minification, tree-shaking). `NODE_ENV` controls the application's runtime behavior (React's JSX runtime selection). When `define` overrides `NODE_ENV` to `production` but `mode` stays `development`, the bundler produces a dev build that imports the prod JSX runtime -- and breaks. These two settings must be aligned or the build will fail in ways that are deeply confusing to debug.

- **The chat bundle workaround (`--mode production` for dev) is a compromise, not a solution**: Running the dev script in production mode means losing HMR, source maps, and fast refresh during chat development. The workaround is practical but it trades developer experience for build correctness. The proper fix is to align the JSX runtime configuration so that dev mode can be used for development without triggering the mismatch.

- **This failure mode is not React-specific -- any framework with separate dev and prod runtimes has the same vulnerability**: Vue's template compiler, SolidJS's JSX transform, and Svelte's compiler all have dev/prod mode distinctions. The pattern is universal: hardcode the mode flag, and the build will break when the runtime switches. The triage steps (check for `jsxDEV`/`jsx-runtime` in the error, verify NODE_ENV, check bundler config, compare import paths) apply across frameworks.


- **dev mode uses jsxDEV, prod mode uses jsx** — React 18 SWC / Babel plugin switches runtime by NODE_ENV.
- **Hardcoding `development: true` in config is the source of the pitfall** — when NODE_ENV=production it still imports jsxDEV, production React does not export that.
- **Build mode and NODE_ENV must align** — Vite / Rsbuild `define` with NODE_ENV inconsistent with build mode will always break.

## Key information

### Symptom

React 18 project errors after bundling:

```
jsxDEV is not a function
```

or:

```
TypeError: Cannot read properties of undefined (reading 'jsxDEV')
```

Only happens in production build (NODE_ENV=production), dev mode works.

### Root cause

React 18 SWC / Babel plugin distinguishes dev / prod:

- dev mode: calls `jsxDEV` (with source position info, for debugging)
- prod mode: calls `jsx` or `jsxRuntime.jsx` (minimized)

Pitfall: **SWC/Babel config uses dev mode, but build runs with NODE_ENV=production**.

- In source: `import { jsxDEV } from 'react/jsx-dev-runtime'`
- At production build React switches to `react/jsx-runtime` (no jsxDEV)
- Error "jsxDEV is not a function"

### Typical trigger scenarios

- Babel config `runtime: 'automatic'`, but `development: true` hardcoded
- SWC config `jsc.transform.react.development: true` hardcoded
- Vite / Rsbuild `define` `NODE_ENV` inconsistent with build mode
- Using esbuild for React but NODE_ENV handled incorrectly

### Solution

**Option 1: Align build mode with NODE_ENV**

```bash
# Dev
NODE_ENV=development vite

# Prod
NODE_ENV=production vite build
```

**Option 2: SWC config follows NODE_ENV automatically**

```json
{
  "jsc": {
    "transform": {
      "react": {
        "runtime": "automatic",
        "development": false
      }
    }
  }
}
```

Do not write the `development` field and let SWC follow NODE_ENV automatically.

**Option 3: Babel config follows automatically**

```js
// babel.config.js
module.exports = (api) => {
  const isDev = api.env('development');
  return {
    presets: [
      ['@babel/preset-react', { runtime: 'automatic', development: isDev }]
    ]
  };
};
```

**Option 4: Separate dev script uses production mode**

YiPet chat.js example: the dev script still runs production mode build to avoid jsxDEV:

```json
{
  "scripts": {
    "build:chat": "NODE_ENV=production webpack --mode production",
    "dev:chat": "NODE_ENV=production webpack --mode production --watch"
  }
}
```

Not elegant but practical.

### Similar pitfalls

- Vue 3 vs Vue 2 template compile differences
- Vue JSX vs React JSX config differences
- SolidJS jsxDEV similar pitfall

## Action recommendations

1. Do not hardcode `development` in Babel / SWC config for React projects; let it follow NODE_ENV.
2. Before CI runs production build, always run dev build verification; both must pass before merging.
3. Monitor production environment errors; when jsxDEV-class issues appear, immediately check whether NODE_ENV and mode are consistent.
4. When upgrading React major versions, run the full test suite (dev + prod build).
5. New React projects default to Vite / Rsbuild to avoid hand-writing Babel.
6. Triage steps: check whether error contains `jsxDEV` / `jsx-runtime` → check build NODE_ENV and mode → check whether Babel/SWC hardcodes development → check `process.env.NODE_ENV` define → run dev and prod build to compare React import paths.



- **Babel/SWC hardcoding `development: true`** — when NODE_ENV=production still imports jsxDEV, error guaranteed.
- **`define` NODE_ENV inconsistent with build mode** — Vite/Rsbuild define overrides NODE_ENV but mode stays, mismatch breaks the build.
- **Only running dev build, not prod build** — dev passing does not mean prod passes; CI must run both.
- **No error monitoring in production environment** — jsxDEV-class issues hit users first; must proactively monitor.

## Anti-patterns

- **Using the dev script's `--mode production` workaround as a permanent solution instead of fixing the root cause.** Running the dev script in production mode means losing HMR, fast refresh, and source maps during development. The developer experience degrades with every file save because the full production build runs instead of an incremental HMR update. The workaround is acceptable for a single bundle while the root cause is investigated, but it must be tracked as technical debt with a due date for the proper fix.
- **Assuming that the `NODE_ENV` value at build time is the same as the `NODE_ENV` value at runtime.** Vite and Rsbuild allow `define` to override `process.env.NODE_ENV` at build time, but this only affects code that references `process.env.NODE_ENV`. The bundler's own `mode` setting controls tree-shaking, minification, and plugin behavior independently. The two settings can diverge, and when they do, the build produces a hybrid that is neither a proper dev build nor a proper prod build.
- **Upgrading React across major versions without running the production build as part of the upgrade checklist.** React 17 to 18 changed the JSX transform from `React.createElement` to the automatic runtime. React 18 to 19 may introduce further changes. A dev build that passes after an upgrade is not evidence that the production build will pass. The upgrade checklist must include both `NODE_ENV=development vite build` and `NODE_ENV=production vite build` as separate verification steps.
- **Copying a Babel/SWC config from a blog post or template without understanding the `development` flag.** Tutorials and starter templates often hardcode `development: true` to make the dev experience work out of the box, because the author assumes the reader will not build for production. When that config is used in a real project, the first production build will fail with `jsxDEV is not a function`. Every config file copied from an external source must be audited for hardcoded environment-specific flags.
- **Relying on the production build as the only signal that the JSX runtime is misconfigured.** The error `jsxDEV is not a function` only appears when the first JSX component renders. If the application's entry point is a non-JSX module that imports JSX components lazily, the error may not surface until a user navigates to a specific route. A smoke test that renders every route's root component in the production build catches the mismatch before it reaches users.

## Related

- Same class: [./README.md](./) — gotchas leaf entry
- Same class: [./vite-to-rsbuild-migration.md](gotcha-vite-to-rsbuild-migration.md) — build tool migration pitfalls
- Upstream: [../../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — scenario entry
- Reference: [SWC React configure](https://swc.rs/docs/configuration/compatibility/#react)
