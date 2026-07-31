---
title: Global app.use(ElementPlus) broke HMR — element-plus/es/index.mjs not accepted, forces full reload on route change
key: bug_2026_07_30_elementplus_global_hmr
tags:
- element-plus
- hmr
- rsbuild
- main.ts
- regression
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: src/main.ts
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (rsbuild serve, port 8848)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
After `el-watermark` and `el-menu` resolve warnings surfaced in the console (unplugin-vue-components auto-resolver was not injecting imports for those two components in `src/layouts/`), a "fix" was attempted by globally registering Element Plus: `import ElementPlus from "element-plus"` + `app.use(ElementPlus)` in `src/main.ts`. This silenced the resolve warnings but introduced a worse regression — navigating to the `/story` page (in fact any route that triggers an HMR update from a component that traces up through `main.ts`) produced: `[rsbuild] HMR update failed, performing full reload: Error: Aborted because ./node_modules/.pnpm/element-plus@2.14.3.../element-plus/es/index.mjs is not accepted. Update propagation: ./node_modules/.../element-plus/es/index.mjs -> ./src/main.ts`. Every route change devolved into a full page reload, destroying HMR for the whole SPA.

## Steps to Reproduce
1. With `src/main.ts` modified to `import ElementPlus from "element-plus"` and `app.use(ElementPlus).use(directives)...mount()`.
2. Start dev server (`pnpm dev`) on port 8848.
3. Open the app in the browser, navigate from any page to `/story` (or any route whose component receives an HMR update).
4. Browser console logs: `[rsbuild] HMR update failed, performing full reload: Error: Aborted because ./node_modules/.pnpm/element-plus@2.14.3_vue@3.5.40_typescript@6.0.3_/node_modules/element-plus/es/index.mjs is not accepted.`
5. Page does a full reload instead of an HMR patch.

## Expected Result
HMR updates should be accepted in-place. `main.ts` should not side-effect-import the entire `element-plus/es/index.mjs` module graph — rspack's HMR cannot propagate an update through a module that is not HMR-accepted, so the whole entry gets rejected and the page reloads.

## Actual Result
Globally `app.use(ElementPlus)` pulls the full `element-plus/es/index.mjs` graph into `main.ts`'s module closure. When any dependent module fires an HMR update, the propagation chain reaches `element-plus/es/index.mjs` and aborts because that module is not HMR-accepted. rspack falls back to a full reload on every route change.

## Cause
Two compounding mistakes:
1. The original warnings (`Failed to resolve component: el-watermark`, `el-menu`) were treated as a global-registration problem when they were actually a per-file resolver-coverage problem. `unplugin-vue-components` with `ElementPlusResolver()` was auto-importing `el-*` for most SFCs under `src/views/` and `src/components/`, but the auto-resolver was not consistently injecting imports for `el-watermark` (used in `layouts/index.vue` + `indexAsync.vue`) and `el-menu` / `el-sub-menu` / `el-menu-item` (used in the four `Layout*/index.vue` files and `components/Menu/SubMenu.vue`).
2. Global registration via `app.use(ElementPlus)` is a category error for HMR: Element Plus does not ship HMR boundaries for its umbrella `es/index.mjs`, so importing it as a side-effect in `main.ts` makes every HMR propagation that touches it fail. The CSS side (`element-plus/dist/index.css`) is fine to import globally because CSS has its own HMR handling; the JS side is not.

## Solution
Reverted `src/main.ts` — removed `import ElementPlus from "element-plus"` and `app.use(ElementPlus)`. Restored the previous `app.use(directives).use(router).use(I18n).use(pinia).mount("#app")`. Added explicit per-file imports in the affected layout files (the same pattern already used by `App.vue` for `ElConfigProvider`):
- `src/layouts/index.vue` and `indexAsync.vue` — `import { ElWatermark } from "element-plus"`
- `src/layouts/LayoutVertical/index.vue`, `LayoutClassic/index.vue`, `LayoutColumns/index.vue` — `import { ElMenu } from "element-plus"`
- `src/layouts/LayoutTransverse/index.vue` — `import { ElMenu, ElSubMenu, ElMenuItem } from "element-plus"`
- `src/layouts/components/Menu/SubMenu.vue` — `import { ElSubMenu, ElMenuItem } from "element-plus"`

HMR propagation no longer touches the `element-plus/es/index.mjs` graph from `main.ts`, so route changes patch in-place. The `el-watermark` and `el-menu` resolve warnings are also gone because the explicit imports take precedence over resolver behavior. `vue-tsc --noEmit` passes.

Follow-up (not yet landed): root-cause why `unplugin-vue-components`' `ElementPlusResolver` is not auto-injecting for some `el-*` components under `src/layouts/` when it does for `src/views/` and `src/components/`. Suspect the `include: [/src\/layouts\/.*\.vue$/]` regex is matching but the resolver's per-component import path resolution is silently failing for `ElWatermark` / `ElMenu`. If confirmed, file upstream at `unplugin/unplugin-vue-components`. For now, the explicit-import pattern is the project's defense — matches `App.vue`'s existing `ElConfigProvider` precedent.
