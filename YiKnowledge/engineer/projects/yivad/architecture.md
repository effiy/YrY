---
title: YiVad Architecture overview
aliases: [yivad-architecture, yivad-frontend-architecture]
tags: [yivad, architecture, frontend, vue3, componentization, pro-table, rpc-envelope]
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
roles: [engineer, new-hire, tech-lead]
benefit: "Engineers understand YiVad system architecture, tech stack decisions, and integration patterns"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./engineering/claude.md
  - ./engineering/readme.md
  - ./engineering/changelog.md
  - ./rag-system-pages-reference.md
  - ../../../new-hire/onboarding/yivad--onboarding.md
  - ../yiai/architecture.md
  - ../../../ai-engineer/methodology/rag-design-patterns.md
---

# YiVad Architecture overview

> **As an** engineer, **I want to** architecture, **so that** project context preserved.

## Summary

YiVad is the front-end management console of the Yi family (Vue 3.5 + TypeScript 6 + Rsbuild 1 + Pinia 4 + Element Plus 2.14 + ECharts 6 + Vue Router 5 hash mode) . ProTable-driven list paradigm + four layout modes + dynamic routes from the backend menu API + `v-auth` button-level permissions. Hosts AI Chat, AICR code review, Knowledge base browsing, RAG Q&A, Story/BRD management, Bug tracking and other pages. Collaborates with YiAi (FastAPI backend) and YiPet (Chrome extension) via a unified RPC envelope. Architecture direction: **front-end componentization** (extract reusable components / composables / shared UI atoms, define clear props/events APIs, eliminate duplicate markup) . 

## Core viewpoints

- **ProTable is the only table paradigm** — new list pages must use ProTable; bare `el-table` is forbidden; ProTable integrates search, pagination, selection, column settings. 
- **Dynamic route + button-level permission** — routes load from backend menu API (falls back to `authMenuList.json` on failure) , button permissions use the `v-auth` directive; `v-if` based on permission is forbidden. 
- **API layer single entry** — all HTTP requests go through `src/api/index.ts`'s `RequestHttp` class (Axios wrapper) ; importing `axios` directly is forbidden. 
- **Pinia setup-function syntax** — `defineStore(() => {...})`; stores can import `@/api/modules` and `@/hooks`, **directly importing axios is forbidden**. 
- **Cross-project RPC envelope** — `{module_name, method_name, parameters}` calls YiAi; the field name is `filter` not `query`, `target_file` not `path`. 
- **SSE streaming + AbortController** — aiChat uses SSE; `onDone` must first check `!aborted && !error` before auto-forwarding to WeCom, to avoid sending partial messages. 

## Key information

### Tech stack

| Dimension | Value |
|---|---|
| Framework | Vue 3.5 + TypeScript 6 |
| Build | Rsbuild 1 (after Vite -> Rsbuild migration, env prefix `RSBUILD_ENV_*`)  |
| State | Pinia 4 + `pinia-plugin-persistedstate` |
| UI | Element Plus 2.14 |
| Charts | ECharts 6 |
| Router | Vue Router 5 hash mode + dynamic route |
| HTTP | Axios + in-house `RequestHttp` wrapper |
| i18n | Vue-i18n 11 (zh + en)  |
| Lint / format | ESLint 10 + Prettier 3 + Stylelint 17 + husky 9 + lint-staged 17 |
| Commit spec | commitlint 21 + cz-git |
| Tests | None yet (introduce Vitest when necessary)  |

### Source topology

```
src/
├── api/          — HTTP request layer (Axios interceptors, cancellation, error mapping) 
├── assets/       — static assets (fonts / icons / images / mock JSON) 
├── components/   — common components (ProTable / ECharts / Upload / WangEditor etc) 
├── config/       — global constants (HOME_URL / DEFAULT_PRIMARY / route allowlist) 
├── directives/   — custom directives (auth / copy / debounce / throttle / draggable / longpress / watermark) 
├── enums/        — HTTP status codes / request methods / content-type
├── hooks/        — composables (useTable / useTheme / useAuthButtons / useSelection etc) 
├── languages/    — i18n (zh-CN + en) 
├── layouts/      — multiple layouts (vertical / classic / transverse / columns) 
├── routers/      — hash routing + permission guards + menu-to-route mapping
├── stores/       — Pinia stores (global / user / auth / tabs / keepAlive / aiChat / knowledge / knowledgeTree / rag / story / bug) 
├── styles/       — global SCSS / Element overrides / theme variables
├── typings/      — global TS type declarations
├── utils/        — common utilities (color / menu tree ops / localStorage etc) 
└── views/        — page components organized by business domain
```

### Layer boundaries (top-down) 

| Layer | Public API |
|---|---|
| `src/views/` | Pages organized by business domain, import from `@/components` / `@/hooks` / `@/stores` / `@/api/modules` |
| `src/layouts/` | Four layouts share Header / Menu / Footer / Tabs components; forking per layout is forbidden |
| `src/components/` | `ProTable/` (table paradigm) / `ECharts/` / `Upload/` / `WangEditor/` / `SearchForm/` etc |
| `src/hooks/` | `useTable` / `useTheme` / `useAuthButtons` / `useSelection` etc; file name = composable name |
| `src/stores/` | setup-function stores, can import `@/api/modules` and `@/hooks`, direct import of `axios` is forbidden |
| `src/api/modules/` | Domain service functions (sessions / chatService / dataService / fileService / faqService / weChatService / knowledgeService / ragService etc)  |
| `src/api/index.ts` | `RequestHttp` class — Axios wrapper + interceptor + cancel + error mapping; other modules must not import `axios` |
| `src/directives/` | `v-auth` / `v-copy` / `v-watermark` / `v-drag` / `v-debounce` / `v-throttle` / `v-longpress`, registered in `index.ts` |
| `src/routers/` | hash mode + dynamic route from backend menu API; guard in `beforeEach.ts` |

### Key data flow

1. **ProTable data fetch**: View defines columns + `requestApi` -> `requestApi({pageNum, pageSize, ...filters})` -> `api/modules/<domain>.ts` calls `callService("services.database.data_service", "query_documents", {cname, filter, pageNum, pageSize})` -> `http.post("", {module_name, method_name, parameters})` -> `RequestHttp` interceptor attaches X-Token / unwraps response / error checkStatus -> YiAi -> `{list, total, pageNum, pageSize, totalPages}` -> ProTable renders rows + Pagination. 
2. **Chat (SSE streaming) **: aiChat store -> `streamChat(payload, onChunk, onDone, onError)` -> `fetch POST /` body `{module_name: "services.ai.chat_service", method_name: "chat", parameters: {model, messages, stream: true, system?, images?}}` + `signal: AbortController` -> YiAi `StreamingResponse(text/event-stream)` -> frame-by-frame `data: {"data": {"message": "..."}}` -> `streamChat` line-level parsing -> `onChunk(text)` -> store accumulates in-flight pet message; terminal frame `data: {"done": true}` -> `onDone()`; abort marks `aborted=true`; only on success `upsertSession(...)` + `autoForwardToWeCom(streamed)` (aborted skipped) . 
3. **File read/write**: View -> `fileService.readFile(path)` -> `fetch POST /read-file` body `{target_file: path}` -> YiAi disk-first + MongoDB fallback -> `{content}`; writes go to `/write-file` body `{target_file, content}`, dual-write to disk + MongoDB. 

### Coding conventions

| Dimension | Convention |
|---|---|
| Component style | `<script setup lang="ts">` + Composition API; Options API forbidden |
| Props / Emits | `defineProps<{...}>()` + `defineEmits<{...}>()` type generics |
| State | Pinia setup-function syntax `defineStore(() => {...})` |
| Style | Scoped SCSS + variables from `src/styles/`; inline styles forbidden (except dynamic values)  |
| Element Plus | `el-` prefix, follow 2.14 API |
| Paths | `@/` alias across modules, relative paths for siblings |
| Naming | Components PascalCase, composables camelCase, CSS classes kebab-case |
| Env variables | prefix `RSBUILD_ENV_*` (after Vite -> Rsbuild migration)  |

### Degradation strategy

| Condition | Behavior |
|---|---|
| Menu API unreachable | Fall back to `src/assets/json/authMenuList.json` |
| Token expired | 401 interceptor redirects to login, clears user/auth stores |
| Build / typeCheck failure | `vue-tsc --noEmit` blocks `pnpm build:*`; commit hook blocks lint errors |
| Tests missing | No test infrastructure yet; coverage is a pain point (introduce Vitest when necessary)  |
| Browser unsupported | Only targets modern browsers; ES module output |
| SSE stream aborted | pet message marked `aborted=true`; persist partial content; skip WeCom auto-forward (see `src/stores/modules/aiChat.ts` fix)  |

## Action recommendations

1. **New list page -> ProTable** — do not use bare `el-table`; columns defined in the page or same-directory `columns.ts`; `requestApi` accepts `{pageNum, pageSize, ...searchParams}`. 
2. **New composable -> `src/hooks/`** — file name = composable name; new directive -> `src/directives/modules/`, registered in `index.ts`. 
3. **New store -> setup-function syntax** — Options API syntax forbidden; direct import of axios forbidden. 
4. **Cross-project call field names per contract** — `filter` not `query`, `target_file` not `path`. 
5. **SSE `onDone` guard** — before auto-forwarding out, check `!aborted && !error` (see `src/stores/modules/aiChat.ts` 2026-07-28 fix; earlier session references to `aicr/chat.ts` are STALE) . 
6. **Knowledge base content additions/edits** — directly add markdown files under `YiKnowledge/` tree; the frontend aiChat embedded components `KnowledgePreviewDialog` and `KnowledgeChatPanel` auto-load; no standalone route. 

## Anti-patterns

- **Using bare `el-table` instead of ProTable** — raw `el-table` requires manually wiring search, pagination, selection, and column settings for every new list page. ProTable integrates all four concerns into a single component; bypassing it means reimplementing the same boilerplate for every list.

- **Checking permissions with `v-if` instead of `v-auth`** — inline `v-if` checks scatter permission logic across every component and make it impossible to audit who can see what from a single entry point. The `v-auth` directive centralizes all permission evaluation and must be the only mechanism.

- **Importing `axios` directly instead of going through `RequestHttp`** — direct axios imports bypass the unified interceptor chain (token attachment, error mapping, request cancellation), so any global change to HTTP behavior must be replicated in every direct-import site. All HTTP calls must go through `@/api/modules/*` which delegates to `RequestHttp`.

- **Forking shared layout components per layout mode** — Header, Menu, Footer, and Tabs are shared across all four layout modes (vertical, classic, transverse, columns). Creating per-layout copies of these components causes every header or menu change to require four parallel edits, exploding maintenance cost.

- **Using the wrong RPC field name in cross-project calls** — passing `query` instead of `filter` to `data_service.query_documents` causes the filter to be silently dropped with no error, returning unfiltered results. Passing `path` instead of `target_file` to `/read-file` triggers a hard 422. The field name contract is load-bearing and must never be violated.

## Related

- [YiVad development standards](./dev-standards.md) — coding conventions, naming, ProTable, SSE, and RPC field contract standards
- [YiVad functional modules](./functional-modules.md) — 20 view domains, 18 API modules, 11 stores inventory
- [YiVad one-screen layout](./one-screen-layout.md) — three-layer flex layout architecture and useResizable composable
- [RAG system pages reference](./rag-system-pages-reference.md) — five-page RAG menu, retrieval explorer, and citation system
- [YiVad engineering CLAUDE.md](./engineering/claude.md) — project profile, module boundaries, data flow, and self-constraints
