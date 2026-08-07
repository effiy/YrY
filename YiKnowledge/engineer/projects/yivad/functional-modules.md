---
title: YiVad functional module inventory
aliases: [yivad-modules, yivad-functional-modules, yivad-views-map]
tags: [yivad, modules, views, stores, api-modules, pro-table, pinia]
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
roles: [engineer, new-hire]
benefit: "Engineers understand YiVad functional module boundaries, responsibilities, and dependencies"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./architecture.md
 - ./engineering/claude.md
 - ./knowledge-preview-local-chat.md
 - ./knowledge-preview-dialog-modules.md
 - ./one-screen-layout.md
 - ../yiai/functional-modules.md
 - ../yipet/functional-modules.md
---

# YiVad functional module inventory

> **As an** engineer, **I want to** functional modules, **so that** project context preserved.

## Summary

YiVad is a Vue 3.5 + Rsbuild 1 SPA. Pages are organized by business domain in `src/views/<feature>/`, coordinating `src/api/modules/*.ts` domain service functions, `src/stores/modules/*.ts` Pinia setup-function stores, `src/components/` shared components, and `src/hooks/` composables. Currently 20 view domains, 18 API modules, 11 stores. ProTable is the sole table pattern, `v-auth` is the sole button-permission entry, and all HTTP goes through `RequestHttp`. A new page = view + API module + store (as needed) + route registration.

## Core viewpoints

- **Page domain = `src/views/<feature>/`** — one business domain per directory; the directory contains `index.vue` + sub-components + `columns.ts` etc.
- **API module = `src/api/modules/<feature>.ts`** — one file per domain, exporting functions that call `http.post(...)`; do not import `axios` directly.
- **Store = `src/stores/modules/<feature>.ts`** — setup-function syntax; may import `@/api/modules/*` and `@/hooks/*`; directly importing axios is forbidden.
- **Composable = `src/hooks/useXxx.ts`** — file name = composable name; cross-page reusable logic extracted here.
- **Shared component = `src/components/`** — ProTable / ECharts / Upload / WangEditor / SearchForm; new components also land here.
- **Routing = static + dynamic** — static in `src/routers/modules/staticRouter.ts`; dynamic loaded from the backend menu API (fallback `authMenuList.json`). Earlier session claims of "56 knowledge leaf literal routes" are all STALE and never landed.

## Key information

### Views layer (20 domains)

| Domain | Purpose |
|---|---|
| `about/` | About page |
| `aiChat/` | AI dialogue (ported from YiWeb `sessionChat`; each message can regenerate / retry / resend / delete / edit; `streamingType` + `aborted` flag + `scrollTick` throttle stream) |
| `assembly/` | Assembly page |
| `auth/` | Authentication / login session |
| `brd/` | BRD management (includes YiAi BRD Agent link) |
| `code-review/` | Code review page (aicr entry as simplified view) |
| `dashboard/` | Dashboard |
| `dataScreen/` | Data big screen |
| `directives/` | Directive demo page |
| `echarts/` | Chart demo page |
| `form/` | Form demo page |
| `home/` | Home page |
| `link/` | External link redirect |
| `login/` | Login page |
| `menu/` | Menu management |
| `proTable/` | ProTable demo page |
| `rag/` | RAG five-page menu (query / chat / per-file query / per-file chat + scope filter) |
| `story/` | Story Board list + detail drawer (renders `story.md` + frontmatter) |
| `system/` | System management (users / roles / permissions) |
| `tech-leadership/` | Tech leadership topics page |

> Implicit domains: Knowledge base browsing is not under an independent `/knowledge/*` route, but embedded in `src/views/aiChat/components/KnowledgePreviewDialog.vue` + `src/views/story/index.vue`. There is no `leaves.ts` SSOT, no 28 leaf wrappers, no literal routes in `staticRouter.ts` (earlier session related claims are all STALE).

### API module layer (18 files)

| File | Service |
|---|---|
| `login.ts` | Login / logout / token |
| `user.ts` | Users CRUD |
| `sessions.ts` | Session management |
| `chatService.ts` | SSE chat calling `services.ai.chat_service.chat` |
| `dataService.ts` | Generic docs CRUD calling `services.database.data_service.*` |
| `fileService.ts` | File read/write (`target_file` field) |
| `faqService.ts` | FAQ CRUD |
| `weChatService.ts` | WeCom messaging |
| `knowledgeService.ts` | YiKnowledge scan / read / write / metadata |
| `ragService.ts` | RAG query / chat / per-file variants |
| `searchService.ts` | Generic search |
| `story.ts` | Story / Scene business logic |
| `topic.ts` | Topic management |
| `bug.ts` | Bug list + detail |
| `aiCodingHistory.ts` | AI coding history records |
| `claudeService.ts` | Claude-specific service |
| `system.ts` | System config |
| `upload.ts` | File upload (OSS) |

### Store layer (11 stores)

| Store | Responsibility |
|---|---|
| `global.ts` | Global UI state (theme / collapse / language) |
| `user.ts` | User info + token + permission codes |
| `auth.ts` | Auth state + `v-auth` button permissions |
| `tabs.ts` | Multi-tab pages |
| `keepAlive.ts` | Keep-alive cache |
| `aiChat.ts` | AI dialogue state (message list / session / streaming state) |
| `knowledge.ts` | YiKnowledge file list + metadata |
| `knowledgeTree.ts` | Embedded knowledge metadata bridge in aiChat (for FileTree view) |
| `rag.ts` | RAG state (scope / Q&A history) |
| `story.ts` | Story detail state |
| `bug.ts` | Bug list + detail state |

### Shared component layer (`src/components/`)

| Component | Purpose |
|---|---|
| `ProTable/` | Table pattern (integrated search / pagination / selection / column settings) — bare `el-table` forbidden |
| `ECharts/` | Chart wrapper |
| `Upload/` | Upload component (OSS) |
| `WangEditor/` | Rich text editor |
| `SearchForm/` | Search form (linked with ProTable columns' `search`) |
| `FileCard/` / `MarkdownView/` | File card + markdown render (shared by knowledge / story) |
| `KnowledgeMetaStrip/` | Metadata badge strip (status / lifecycle / tacit / roles / tags / related) |

### Composables layer (`src/hooks/`)

| Composable | Purpose |
|---|---|
| `useTable.ts` | ProTable data fetching + pagination + selection state |
| `useTheme.ts` | Theme switch + persistence |
| `useAuthButtons.ts` | Button permission code reading |
| `useSelection.ts` | Cross-page selection state sharing |
| `useResizable.ts` | Draggable split panes (used by aiChat) |

### Directives layer (`src/directives/`)

`v-auth` (button permission) / `v-copy` (copy to clipboard) / `v-watermark` (watermark) / `v-drag` (drag) / `v-debounce` (debounce) / `v-throttle` (throttle) / `v-longpress` (long press). All registered in `src/directives/index.ts`.

### Routing layer (`src/routers/`)

| File | Responsibility |
|---|---|
| `index.ts` | Vue Router 5 instance (hash mode) |
| `modules/staticRouter.ts` | Static routes (login / home / code-review sub-routes etc. declared literally; no knowledge leaf routes) |
| `modules/dynamicRouter.ts` | Dynamic routes (loaded from backend menu API) |
| `beforeEach.ts` | Global guard (token check / permission codes / tab registration) |
| `afterEach.ts` | After hook (title setting) |

### Layouts layer (4 layouts)

`src/layouts/`: `vertical` / `classic` / `transverse` / `columns`. They share the Header / Menu / Footer / Tabs component set; forking by layout is forbidden.

## Action recommendations

1. **New business page three-piece set** — `src/views/<feature>/index.vue` + `src/api/modules/<feature>.ts` + `src/stores/modules/<feature>.ts` (as needed); static or dynamic routing decided by visibility.
2. **New table page must use ProTable** — columns in the page or same directory as `columns.ts`; `requestApi` receives `{pageNum, pageSize, ...searchParams}`; bare `el-table` forbidden.
3. **New button permission** — backend configures permission code + frontend `v-auth="['code']"`; `v-if` based on permission forbidden.
4. **New composable → `src/hooks/`** — file name = composable name; extract cross-page logic.
5. **New directive → `src/directives/modules/`** — register in `index.ts`.
6. **Knowledge base content changes** — directly add markdown under the `YiKnowledge/` tree; no need to change frontend routing; the embedded `KnowledgePreviewDialog` + `KnowledgeChatPanel` in aiChat auto-loads.
7. **Cross-project YiAi calls** — field names by contract: `filter` not `query`, `target_file` not `path`.

## Anti-patterns

- **SSE `onDone` not guarding `!aborted && !error` then auto-forwarding to WeCom** — sends half a message (see `src/stores/modules/aiChat.ts` 2026-07-28 fix; earlier session claims about `aicr/chat.ts` citations are STALE).

- **Knowledge leaf via `map` generated routes** — earlier session claims of 28 leaves + 56 literal routes never landed; knowledge browsing is embedded in `KnowledgePreviewDialog`, no independent route.

- **Adding a new page without creating the corresponding API module** — when a view calls `http.post` directly instead of going through a dedicated `src/api/modules/<feature>.ts` file, the API surface is scattered across views and cannot be reused by other pages or stores. Every new page must include its API module in the triad.

- **Putting business logic directly in the view component** — views that contain data fetching, state management, and business rules become untestable monoliths. Business logic belongs in stores and API modules; views should only orchestrate rendering and delegate to the store layer.

- **Creating a new store with Options API syntax** — Pinia's options syntax (`state: () => ({})`, `getters`, `actions`) is forbidden in YiVad. All stores must use the setup-function syntax (`defineStore(() => {...})`) to maintain consistency with the Composition API paradigm.

## Related

- [YiVad architecture](./architecture.md) — tech stack, layer boundaries, key data flow, and degradation strategy
- [YiVad development standards](./dev-standards.md) — coding conventions, naming, ProTable, SSE, and RPC field contract
- [Knowledge preview dialog modules](./knowledge-preview-dialog-modules.md) — 10 functional modules within the aiChat knowledge preview dialog
- [RAG system pages reference](./rag-system-pages-reference.md) — five-page RAG menu, retrieval explorer, chat, and citation system
- [YiVad engineering CLAUDE.md](./engineering/claude.md) — project profile, module boundaries, data flow, and self-constraints
