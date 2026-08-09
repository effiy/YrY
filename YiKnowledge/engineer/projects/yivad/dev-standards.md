---
title: YiVad development standards
aliases: [yivad-dev-standards, yivad-coding-conventions, yivad-frontend-standards]
tags: [yivad, dev-standards, conventions, vue3, typescript, eslint, prettier, commitlint, pro-table]
category: engineer/projects/yivad
created: 2026-08-03
updated: 2026-08-07
source: ../../YiVad/CLAUDE.md
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer]
benefit: "Engineers follow YiVad coding standards, conventions, and development workflow"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./architecture.md
  - ./functional-modules.md
  - ./engineering/claude.md
  - ../yiai/dev-standards.md
  - ../yipet/dev-standards.md
---

# YiVad development standards

> **As an** engineer, **I want to** dev standards, **so that** project context preserved.

## Summary

YiVad is a Vue 3.5 + TypeScript 6 SPA. SFCs must use `<script setup lang="ts">` + Composition API; Options API is forbidden. Props / Emits use typed generics `defineProps<{...}>()`. State uses Pinia setup-function syntax `defineStore(() => {...})`. All HTTP goes through `RequestHttp` (`src/api/index.ts`); direct `axios` imports are forbidden. Tables must use ProTable; raw `el-table` is forbidden. Button permissions use `v-auth`; `v-if` based on permission is forbidden. Env variable prefix is `RSBUILD_ENV_*`. Naming: components PascalCase, composables camelCase, CSS classes kebab-case, filenames kebab-case. `@/` crosses modules, relative paths are for siblings. Commits follow Conventional Commits + commitlint 21 + cz-git. Pre-commit runs ESLint 10 + Prettier 3 + Stylelint 17 + husky 9 + lint-staged 17.

## Core viewpoints

- **`<script setup>` is the only SFC paradigm** — Options API is forbidden; state uses `ref` / `reactive`, not `data()`.
- **Typed Props / Emits** — `defineProps<{...}>()` + `defineEmits<{...}>()` typed generics; no runtime default declarations.
- **ProTable is the only table paradigm** — new list pages must not use raw `el-table`; ProTable integrates search / pagination / selection / column settings.
- **`v-auth` is the only button permission entry** — `v-if` based on permission checks is forbidden.
- **Single HTTP entry `RequestHttp`** — direct `axios` imports are forbidden; modules call indirectly through `@/api/modules/*`.
- **Pinia setup-function syntax** — `defineStore(() => {...})`; options syntax is forbidden; stores may import `@/api/modules` and `@/hooks`, but must not import axios directly.
- **Dynamic routing takes priority** — loaded via the backend menu API; falls back to `authMenuList.json` on failure; static routing is only for login / home / knowledge leaf literal routes.
- **Four layouts share the component set** — vertical / classic / transverse / columns share Header / Menu / Footer / Tabs; per-layout forks are forbidden.

## Key information

### Naming conventions

| Category | Standard | Example |
|---|---|---|
| Filename | kebab-case | `chat-service.ts`, `use-table.ts` |
| Component file | PascalCase directory + PascalCase `.vue` | `ProTable/index.vue`, `ChatSidebar.vue` |
| Component usage | PascalCase | `<ProTable />`, `<ChatSidebar />` |
| Composable | camelCase + `use` prefix | `useTable`, `useAuthButtons` |
| Composable file | Same name | `useTable.ts` |
| Store | camelCase + suffix `Store` or domain name | `useAiChatStore`, `useAuthStore` |
| Store file | Same name | `aiChat.ts` |
| CSS class | kebab-case | `.chat-window`, `.message-bubble` |
| TS interface / type | PascalCase | `SessionItem`, `ChatMessage` |
| Constant | UPPER_SNAKE | `HOME_URL`, `DEFAULT_PRIMARY` |
| Enum | PascalCase + PascalCase members | `enum HttpMethod { Get, Post }` |

### SFC structure (recommended order)

```vue
<script setup lang="ts">
// 1. Imports
// 2. Props + Emits
// 3. Composables
// 4. Reactive state
// 5. Computed + Watchers
// 6. Methods
// 7. Lifecycle hooks
</script>

<template>
  <!-- template -->
</template>

<style scoped lang="scss">
/* scoped styles */
</style>
```

### Layered hard constraints

| Rule | Description |
|---|---|
| No direct `axios` import | Must go through `@/api/modules/*` → `RequestHttp` |
| Store must not import `axios` directly | Store calls indirectly via `@/api/modules/*` |
| Views must not call `data/` etc. value layers | Go through store + api module |
| No Options API | `<script setup>` only |
| No raw `el-table` | ProTable only |
| No `v-if` based on permission | `v-auth` only |
| No per-layout fork of Header / Menu / Footer / Tabs | Shared across four layouts |
| No `map`-generated knowledge leaf routes | Literal declaration (Rsbuild static analysis) |

### Cross-project RPC field contract

| Field | Standard | Common pitfall |
|---|---|---|
| `filter` | Mongo query condition | Not `query` (silently dropped) |
| `target_file` | File path | Not `path` (422) |
| `cname` / `collection_name` | MongoDB collection name | Pick one |
| `pageNum` / `pageSize` | 1-based page | — |
| `stream: true` | SSE marker | Required for chat |
| `scope` | RAG `file_path` substring filter | — |
| `images?` | Multimodal images | Optional |

### Encoding standard matrix

| Dimension | Standard |
|---|---|
| Component style | `<script setup lang="ts">` + Composition API |
| Props / Emits | `defineProps<{...}>()` + `defineEmits<{...}>()` typed generics |
| State | Pinia setup-function syntax |
| Styles | Scoped SCSS + variables from `src/styles/`; no inline styles (except dynamic values) |
| Element Plus | `el-` prefix, follows 2.14 API |
| Paths | `@/` across modules, relative paths for siblings |
| Naming | Components PascalCase, composables camelCase, CSS classes kebab-case |
| Env variables | Prefix `RSBUILD_ENV_*` (after Vite → Rsbuild migration) |
| TypeScript | Strict mode; `vue-tsc --noEmit` must pass |
| i18n | All user-facing copy via `t('key')`; no raw Chinese / English |

### ProTable standard

| Item | Standard |
|---|---|
| Column definition | `ColumnProps` from `src/components/ProTable/interface/`; in-page or same-directory `columns.ts` |
| `prop` | Data field key |
| `label` | Column header |
| `width` | Optional fixed width |
| `search` | Search item config (`SelectFilter` / `TreeFilter` etc.) |
| `render` | Custom cell render function |
| `requestApi` | Receives `{pageNum, pageSize, ...searchParams}`; returns `{list, total, pageNum, pageSize, totalPages}` |
| `:selection="true"` | Enable multi-select; get selected rows via `ref` |
| Pagination | ProTable sub-component; no second paginator |

### Custom directives standard

| Directive | Usage | Registration |
|---|---|---|
| `v-auth` | `v-auth="['user:add']"` button permission | `src/directives/index.ts` |
| `v-copy` | Copy to clipboard | Same |
| `v-watermark` | Watermark | Same |
| `v-drag` | Drag | Same |
| `v-debounce` | Debounce | Same |
| `v-throttle` | Throttle | Same |
| `v-longpress` | Long press | Same |

New directives live in `src/directives/modules/` and are registered in `index.ts`.

### Composable standard

| Item | Standard |
|---|---|
| Naming | `useXxx`, camelCase |
| File | Same name `useXxx.ts` |
| Location | `src/hooks/` |
| Return | Reactive ref / computed / method object |
| Cross-page state | Prefer store over composable |

### Store standard

| Item | Standard |
|---|---|
| Syntax | setup-function `defineStore(() => {...})` |
| File | `src/stores/modules/<feature>.ts` |
| Naming | `useXxxStore` |
| Persistence | `pinia-plugin-persistedstate`; enable `persist: true` as needed |
| Dependencies | May import `@/api/modules/*` and `@/hooks/*`; direct `axios` import forbidden |
| Mutations | Mutate state directly (setup syntax has no mutations) |

### Routing standard

| Item | Standard |
|---|---|
| Mode | hash |
| Static routes | `src/routers/modules/staticRouter.ts` (login / home / code-review sub-routes etc.; no knowledge leaf routes — earlier claims of "56 entries" are STALE) |
| Dynamic routes | Loaded via backend menu API (`authMenuList.json` fallback) |
| Guard | `src/routers/beforeEach.ts` (token / permission code / tabs) |
| Post hook | `src/routers/afterEach.ts` (title) |
| Knowledge leaf routes | Literal declaration (`staticRouter.ts`); `map`-generated forbidden |

### SSE streaming standard

| Item | Standard |
|---|---|
| Entry | `streamChat(payload, onChunk, onDone, onError)` |
| Signal | `AbortController` |
| Frame parsing | Line-level SSE parsing; `data: {"data": {"message": "..."}}` |
| Termination | `data: {"done": true}` |
| Abort | Mark `aborted=true`; persist partial content |
| `onDone` guard | Must check `!aborted && !error` then auto-forward to WeCom (see `src/stores/modules/aiChat.ts` 2026-07-28 fix; earlier references to `aicr/chat.ts` are STALE) |

### Env variable standard

| Item | Standard |
|---|---|
| Prefix | `RSBUILD_ENV_*` (after Vite → Rsbuild migration) |
| File | `.env` / `.env.production` etc. |
| Read | `import.meta.env.RSBUILD_ENV_*` |
| Types | Declared in `src/rsbuild-env.d.ts` |

### Commit and version control

| Item | Standard |
|---|---|
| Commit standard | Conventional Commits (commitlint 21 + cz-git) |
| Format | `type(scope): subject` — `feat(aiChat): add regenerate action` |
| Pre-commit | husky 9 + lint-staged 17 run ESLint + Prettier + Stylelint |
| Pre-commit typecheck | `vue-tsc --noEmit` (must pass before build) |
| Branch | Main branch `master` |
| CHANGELOG | `CHANGELOG.md` (manually maintained, mirrored to `projects/YiVad/engineering/changelog.md`) |

### Lint / Format standard

| Tool | Purpose | Config |
|---|---|---|
| ESLint 10 | JS / TS / Vue linting | `eslint.config.js` |
| Prettier 3 | Formatting | Integrated into ESLint |
| Stylelint 17 | SCSS linting | `stylelint.config.cjs` |
| husky 9 | git hook | `.husky/` |
| lint-staged 17 | Lint staged area | `lint-staged.config.cjs` |
| commitlint 21 | Commit message validation | `commitlint.config.cjs` |

### Test standard

| Item | Current state | Expected |
|---|---|---|
| Framework | None | Introduce Vitest |
| Unit tests | None | Composables + stores first |
| Component tests | None | `@vue/test-utils` |
| E2E | None | Playwright (when needed) |
| Coverage | None | Introduce when coverage becomes a pain point |

## Action recommendations

1. **New page triad** — `views/<feature>/index.vue` + `api/modules/<feature>.ts` + `stores/modules/<feature>.ts` (as needed).
2. **New table → ProTable** — columns + `requestApi` + `:selection` as needed; no raw `el-table`.
3. **New button permission** — backend configures permission code + frontend `v-auth="['code']"`.
4. **New composable → `src/hooks/`** — filename = composable name.
5. **New directive → `src/directives/modules/`** — register in `index.ts`.
6. **New store → setup-function syntax** — no Options syntax; no direct `axios` import.
7. **New env variable** — prefix `RSBUILD_ENV_*`; declare types in `src/rsbuild-env.d.ts`.
8. **Knowledge base content changes** — add markdown directly under the `YiKnowledge/` tree; the embedded `KnowledgePreviewDialog` + `KnowledgeChatPanel` in aiChat auto-loads, no standalone routing (earlier claims of `leaves.ts` SSOT + `{index,detail}.vue` wrapper + `staticRouter.ts` literal routes are all STALE).
9. **Cross-project calls to YiAi** — field names per contract; SSE `onDone` guard `!aborted && !error` then auto-forward.
10. **CHANGELOG sync** — after editing YiVad root `CHANGELOG.md`, `cp` to `projects/YiVad/engineering/changelog.md`.

## Anti-patterns

- **Using Options API instead of `<script setup>`** — the Options API (`data()`, `methods`, `computed`) is syntactically incompatible with the Composition API patterns used throughout the codebase and prevents reuse of composables. Every SFC must use `<script setup lang="ts">` with `ref`/`reactive`/`computed`.

- **Using `map` to generate knowledge leaf routes** — Rsbuild performs static analysis at build time and cannot resolve dynamically generated routes. All routes must be literal declarations in `staticRouter.ts`; any `map`-based route generation will fail at build time.

- **Omitting the `!aborted && !error` guard in SSE `onDone`** — when the SSE stream is aborted or errors out, `onDone` may still fire with a partial message. Without the guard, the partial message is auto-forwarded to WeCom, sending incomplete content to external recipients.

- **Using inline styles instead of scoped SCSS** — inline styles bypass the SCSS variable system and make theme changes require hunting through every component. Scoped SCSS with `src/styles/` variables is the standard; inline styles are only permitted for truly dynamic values (e.g., computed widths).

- **Hardcoding user-facing strings instead of using `t('key')`** — raw Chinese or English strings in templates cannot be localized and create a scattered, untranslatable codebase. All user-facing copy must go through the `t()` i18n function, with keys registered in the language files.

## Related

- [YiVad architecture](./architecture.md) — tech stack, layer boundaries, key data flow, and degradation strategy
- [YiVad functional modules](./functional-modules.md) — 20 view domains, 18 API modules, 11 stores inventory
- [YiVad one-screen layout](./one-screen-layout.md) — three-layer flex layout, calc(100vh - Npx), and useResizable
- [YiVad engineering CLAUDE.md](./engineering/claude.md) — project constraints, self-constraints, and recent changes
- [YiAi development standards](../yiai/dev-standards.md) — cross-project RPC field contract, layering rules, SSE spec
