---
lifecycle: active
title: YiVad Engineering — README
status: stable
type: summary
category: engineer/learn/projects/yivad
tags:
  - yivad
  - engineering
  - readme
  - project-meta
created: 2026-08-03
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
roles:
- engineer
benefit: "Engineers can understand and apply yivad engineering — readme with clear frameworks, actionable recommendations, and anti-pattern awareness"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
tacit: false
related:
  - ./changelog.md
  - ./claude.md
  - ../README.md
---

# YiVad

> **As a** engineer, **I want to** understand and apply yivad engineering — readme, **so that** project context is preserved and accessible to the team. 

> Open-source admin management framework built with Vue 3.5, TypeScript 6, Rsbuild 1, Pinia 4, and Element Plus 2.14. Provides a powerful ProTable component for declarative table configuration, plus dynamic routing, button-level permission control, four layout modes, and a full hooks / directives / composables library.

> **New hire onboarding** → `YiKnowledge/engineer/run/onboarding/yivad/onboarding.md` (8 sections: setup / workflow / gotchas quick-reference / Day-1 tasks) 

## Summary

- YiVad is a Vue 3.5 + TypeScript 6 admin dashboard framework with Rsbuild 1, Pinia 4, and Element Plus 2.14, providing ProTable-driven declarative tables, dynamic routing from backend menu API, and button-level permissions via `v-auth` directive
- ProTable is the single most important architectural pattern — it encapsulates search, pagination, sorting, and column configuration into a declarative API, and deviating from it is the most common source of inconsistency across pages
- The `filter`/`query` and `target_file`/`path` bugs are the same pattern in different domains: silent RPC parameter name mismatches between YiVad and YiAi caused by the absence of automated contract testing between the two codebases
- The SSE `onDone` guard (`!aborted && !error`) in `aiChat.ts` prevents partial or aborted chat content from being auto-forwarded to WeCom — every SSE handler with external side effects must include this guard
- Dynamic routing depends on the `authMenuList.json` static fallback being maintained as a first-class asset; when the backend menu API is unavailable, a stale fallback means users see a broken menu

## Core viewpoints

**ProTable is the single most important architectural pattern in YiVad, and deviating from it is the most common source of inconsistency.** ProTable encapsulates search, pagination, sorting, and column configuration into a declarative API. Using raw `el-table` instead of ProTable means reimplementing pagination, search, and column config from scratch. The self-constraint "ProTable is the canonical table pattern" exists because every table built without ProTable eventually needs the features ProTable provides.

**The `v-auth` directive is the correct granularity for permission control, and inline `v-if` permission checks are always wrong.** Button-level permissions via `v-auth` are decoupled from route guards and support fine-grained operation-level control. Using `v-if` based on permission state creates tight coupling between the permission model and the view layer.

**The `filter`/`query` and `target_file`/`path` bugs are the same bug pattern in different domains.** Both are RPC parameter name mismatches between YiVad and YiAi. Both are silent (no error, wrong results or 422). Both were fixed in the same week (2026-07-28). The root cause is the absence of automated contract testing between the two codebases.

**Dynamic routing from backend menu API is powerful but the static fallback (`authMenuList.json`) must be maintained as a first-class asset.** When the backend menu API is unavailable, the entire navigation structure depends on the static JSON fallback. If the fallback is stale, users see an outdated or broken menu. The fallback must be updated whenever new routes are added.

**The SSE `onDone` guard (`!aborted && !error`) is a lesson in side-effect safety for streaming protocols.** The 2026-07-28 fix in `aiChat.ts` prevents partial or aborted chat content from being auto-forwarded to WeCom robots. Every SSE `onDone` handler that has external side effects (persistence, forwarding, notifications) must include a similar guard. Without it, users who abort mid-stream will have incomplete content sent to external channels.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Architecture](#architecture)
- [Module Boundaries](#module-boundaries)
- [Data Flow](#data-flow)
- [Installation & Usage](#installation--usage)
- [Directory Structure](#directory-structure)
- [Browser Support](#browser-support)
- [Domain Language](#domain-language)
- [Recent Changes](#recent-changes)

---

## Introduction

YiVad is an open-source admin management framework built with Vue 3.5, TypeScript 6, Rsbuild 1, Pinia 4, and Element Plus 2.14. The project provides a powerful ProTable component that greatly improves development efficiency, along with commonly used components, hooks, directives, dynamic routing, button-level permission control, four layout modes, KeepAlive caching, and full i18n (zh + en).

It is the admin dashboard member of the Yi family — companion to **YiAi** (FastAPI backend) and **YiPet** (Chrome MV3 extension).

---

## Features

- **Vue 3.5 + TypeScript 6**, single-file components with `<script setup>`.
- **Rsbuild 1 build tooling** with Sass, TSX syntax, CORS proxy, and SVG icon sprites.
- **Pinia 4** state management with `pinia-plugin-persistedstate` for localStorage sync.
- **Full Axios wrapper** in TypeScript — request interception, cancellation, common request encapsulation, error mapping.
- **ProTable** component built on Element Plus — table pages driven entirely by column configuration.
- **Element Plus 2.14** — size switching, multi-theme, dark mode, i18n.
- **Dynamic route permission guards** with Vue Router 5 — lazy loading + button-level permission control.
- **Page caching via KeepAlive** with multi-level nested route support.
- **Custom directives** — `v-auth`, `v-copy`, `v-watermark`, `v-drag`, `v-throttle`, `v-debounce`, `v-longpress`.
- **Unified code formatting** with ESLint 10 + Prettier 3 + Stylelint 17.
- **Standardized commits** with husky 9, lint-staged 17, commitlint 21, cz-git + czg.
- **Browser support**: Chrome, Edge, Firefox, Safari (last 2 versions). IE is no longer supported.

---

## Architecture

YiVad advances along the **componentization** axis: extract reusable components, composables, shared UI primitives; define clear props/events APIs; eliminate duplicated markup.

```
┌──────────────────────────────────────────────────────────┐
│  Layout (4 Modes)                                         │
│  vertical · classic · transverse · columns               │
│  Switchable dynamically via globalStore.layout           │
└──────────────────────┬───────────────────────────────────┘
                       │ mounts pages into
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Router (Dynamic)                                        │
│  Vue Router 5 (hash mode) · routes from backend menu API│
│  Falls back to src/assets/json/authMenuList.json         │
│  Guards: beforeEach → permission check → 401 → login    │
└──────────────────────┬───────────────────────────────────┘
                       │ renders
                       ▼
┌──────────────────────────────────────────────────────────┐
│  ProTable (Columns Config)                               │
│  Declarative table: search · pagination · sorting       │
│  Driven by ColumnProps[] (no repetitive table markup)   │
└──────────────────────┬───────────────────────────────────┘
                       │ gated by
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Auth (v-auth Directive)                                │
│  Button-level visibility via permission string list     │
│  Decoupled from route guards — operation-level control  │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP via RequestHttp
                       ▼
┌──────────────────────────────────────────────────────────┐
│  YiAi Backend (FastAPI :10086)                           │
│  RPC envelope: {module_name, method_name, parameters}   │
│  data_service · chat_service · /read-file · /write-file │
└──────────────────────────────────────────────────────────┘
```

### Cross-Cutting Concerns

- **HTTP layer** — Axios `RequestHttp` wrapper with interceptors, cancellation, and `checkStatus` error mapping (`src/api/`).
- **State layer** — Pinia stores (`global`, `user`, `auth`, `tabs`, `keepAlive`, plus per-feature stores: `aiChat`, `knowledge`, `knowledgeTree`, `rag`, `story`, `bug`) with persistence (`src/stores/`).
- **Hooks** — composables (`useTable`, `useTheme`, `useAuthButtons`, `useSelection`, etc.) in `src/hooks/`.
- **Directives** — custom directives in `src/directives/modules/`, registered via `src/directives/index.ts`.
- **i18n** — Vue-i18n 11 with `zh-CN` + `en` locale files in `src/languages/`.

---

## Module Boundaries

### Frontend layers (top-down)

| Layer | Public API |
|---|---|
| `src/views/` | Page components organized by feature domain. Each page imports from `@/components`, `@/hooks`, `@/stores`, `@/api/modules`. |
| `src/layouts/` | Four layout modes (vertical, classic, transverse, columns) — share Header / Menu / Footer / Tabs components. Don't fork per layout. |
| `src/components/` | Reusable components: `ProTable/`, `ECharts/`, `Upload/`, `WangEditor/`, `SearchForm/`, etc. ProTable is the canonical table — don't use raw `el-table`. |
| `src/hooks/` | Composables: `useTable`, `useTheme`, `useAuthButtons`, `useSelection`, etc. Name file same as composable (`useTable.ts`). |
| `src/stores/` | Pinia setup-function stores. Stores may import from `@/api/modules` and `@/hooks` but MUST NOT import `axios` directly. |
| `src/api/modules/` | Domain service functions (`sessions.ts`, `chatService.ts`, `dataService.ts`, `fileService.ts`, `faqService.ts`, `weChatService.ts`, ...). The public API surface for stores and views. |
| `src/api/index.ts` | `RequestHttp` class — Axios wrapper with interceptors, cancellation, error mapping. Modules call `http.post(...)`; nothing else imports axios. |
| `src/directives/` | `v-auth`, `v-copy`, `v-watermark`, `v-drag`, `v-debounce`, `v-throttle`, `v-longpress`. Register via `src/directives/index.ts`. |
| `src/routers/` | Hash-mode Vue Router 5 with dynamic routes from backend menu API. Guards in `src/routers/beforeEach.ts`. |

### Cross-project protocol (YiVad ↔ YiAi)

| Operation | Contract |
|---|---|
| RPC envelope | `{ module_name, method_name, parameters }` POSTed to `/` |
| `data_service.query_documents` | `parameters: { cname, filter?: dict, pageNum?, pageSize?, limit?, orderBy?, orderType? }`. **`filter`, not `query`.** |
| `data_service.create_document` / `update_document` / `delete_document` | `{ cname, key, data }` (create/update) or `{ cname, key }` (delete) |
| Chat (SSE) | `streamChat({model, messages, system?, images?})` via `services.ai.chat_service.chat` |
| `/read-file`, `/write-file` | Field name is `target_file` (not `path`) |
| `/upload-image-to-oss` | `{ data_url, filename, directory }` |
| `/knowledge/*` | Knowledge-base scan / read / write / metadata CRUD |
| `/rag/*` | RAG query (one-shot) + RAG chat (SSE) + per-file variants; `scope` filters by `file_path` substring |

---

## Data Flow

### Table fetch (ProTable)

```
View component defines columns + requestApi
   │
   ▼
ProTable renders SearchForm from column.search configs
   │ on search/pagination: requestApi({ pageNum, pageSize, ...filters })
   ▼
api/modules/<domain>.ts → callService("services.database.data_service",
                                      "query_documents",
                                      { cname, filter, pageNum, pageSize })
   │ http.post("", {module_name, method_name, parameters})
   ▼
RequestHttp interceptor: attach X-Token, transform response, checkStatus on error
   │
   ▼ fetch POST http://localhost:10086/
YiAi data_service.query_documents
   ▼ repository.query_documents → _build_filter → MongoDB find().sort().skip().limit()
   ▼ { list: [...], total, pageNum, pageSize, totalPages }
ProTable receives { list, total } → renders rows + Pagination
```

### Chat (SSE streaming)

```
aiChat store — sendMessage / regenerateMessageAt / resendMessageAt
   │
   ▼ streamChat(payload, onChunk, onDone, onError)
fetch POST /  body: {module_name: "services.ai.chat_service",
                     method_name: "chat",
                     parameters: {model, messages, stream: true, system?, images?}}
                     signal: AbortController
   ▼
YiAi FastAPI → StreamingResponse(text/event-stream)
   yields: data: {"data": {"message": "..."}}\n\n
   ends:   data: {"done": true}\n\n
   ▼
streamChat parses SSE line-by-line, calls onChunk(text) / onDone() / onError(err)
   ▼
Store appends deltas to the in-flight pet message; on abort, marks aborted=true
   on done: upsertSession(...) + autoForwardToWeCom(streamed) [skipped if aborted]
```

### File read/write

```
View → fileService.readFile(path)
   ▼ fetch POST /read-file  body: { target_file: path }
   ▼ YiAi read_file → disk (primary) + MongoDB (fallback) → { content }
View → fileService.writeFile(path, content)
   ▼ fetch POST /write-file  body: { target_file: path, content }
   ▼ YiAi write_file → disk + MongoDB upsert → success
```

---

## Installation & Usage

### Install

```bash
pnpm install
```

### Run

```bash
pnpm dev      # Start dev server with HMR
pnpm serve    # Alias for dev
```

### Build

```bash
# Development environment
pnpm build:dev

# Test environment
pnpm build:test

# Production environment
pnpm build:pro
```

### Lint

```bash
# ESLint code check
pnpm lint:eslint

# Prettier code formatting
pnpm lint:prettier

# Stylelint style formatting
pnpm lint:stylelint
```

### Commit

```bash
# Commit code (automatically runs lint:lint-staged before committing)
pnpm commit
```

### Type Check

```bash
pnpm type:check   # vue-tsc --noEmit --skipLibCheck
```

---

## Directory Structure

```text
YiVad
├─ .husky                  # husky config files
├─ .vscode                 # VSCode recommended config
├─ build                   # Rsbuild config options (svg-sprite, views-glob, proxy)
├─ public                  # Static assets (this folder is not bundled)
├─ src
│  ├─ api                  # API interface management (RequestHttp + modules)
│  ├─ assets               # Static assets (fonts, icons, images, mock JSON)
│  ├─ components           # Global components (ProTable, ECharts, Upload, WangEditor)
│  ├─ config               # Global config (HOME_URL, DEFAULT_PRIMARY, route whitelist)
│  ├─ directives           # Global directives (auth, copy, debounce, throttle, drag, longpress, watermark)
│  ├─ enums                # Common enumerations (HTTP status, request methods, content types)
│  ├─ hooks                # Common hooks (useTable, useTheme, useAuthButtons, useSelection)
│  ├─ languages            # i18n internationalization (zh-CN + en)
│  ├─ layouts              # Layout modules (vertical, classic, transverse, columns)
│  ├─ routers             # Route management (dynamic routes, guards, menu-to-route mapping)
│  ├─ stores              # Pinia stores (global, user, auth, tabs, keepAlive, aiChat, knowledge, knowledgeTree, rag, story, bug)
│  ├─ styles              # Global styles (SCSS, Element overrides, theme variables)
│  ├─ typings             # Global TypeScript declarations
│  ├─ utils               # Utility functions (color, menu tree ops, localStorage)
│  ├─ views               # All project pages (organized by feature domain)
│  │  ├─ about            #   About family pages (yivad, yiai, yipet subpages)
│  │  ├─ aiChat           #   AI chat page (ported from YiWeb sessionChat; includes knowledge/rag/story/chatpanel)
│  │  ├─ code-review      #   Code review sub-pages (i18n-a11y, error-handling, explain, security, dead-code, observability-gap, tests, bugs, style, access-review)
│  │  ├─ story            #   Story Board list + detail drawer
│  │  ├─ assembly, auth, dashboard, dataScreen, echarts, form,
│  │  │  home, link, login, menu, proTable, story, system
│  ├─ App.vue             # Root component
│  ├─ main.ts             # Entry file
│  └─ rsbuild-env.d.ts    # TypeScript declaration for Rsbuild client types
├─ .editorconfig           # Unified editor coding style config
├─ .env                    # Rsbuild common config
├─ .env.development        # Development environment config
├─ .env.production         # Production environment config
├─ .env.test               # Test environment config
├─ .eslintignore           # Ignore ESLint checks
├─ .eslintrc.cjs           # ESLint config file
├─ .gitignore              # Ignore git commits
├─ .prettierignore         # Ignore Prettier formatting
├─ .prettierrc.cjs         # Prettier config
├─ .stylelintignore        # Ignore stylelint formatting
├─ .stylelintrc.cjs        # stylelint config
├─ CHANGELOG.md            # Project changelog
├─ commitlint.config.cjs   # Git commit convention config
├─ index.html              # Entry HTML
├─ LICENSE                 # Open source license
├─ lint-staged.config.cjs  # lint-staged config
├─ package-lock.json       # Dependency version lock
├─ package.json            # Dependency management
├─ postcss.config.cjs      # PostCSS config
├─ README.md               # README introduction
├─ tsconfig.json           # TypeScript global config
└─ rsbuild.config.ts      # Rsbuild global config
```

---

## Browser Support

- For local development, the latest version of Chrome is recommended — [Download](https://www.google.com/intl/zh-CN/chrome/).
- Production supports modern browsers only. IE is no longer supported. For more details, see [Can I Use ES Module](https://caniuse.com/?search=ESModule).

| IE | Edge | Firefox | Chrome | Safari |
| :---: | :---: | :---: | :---: | :---: |
| not supported | last 2 versions | last 2 versions | last 2 versions | last 2 versions |

---

## Domain Language

YiVad is a domain model for admin management systems, built around three core concepts: **menu permission**, **dynamic routing**, and **component configuration**.

### Terminology

- **ProTable** — A declarative table component built on Element Plus `el-table`, driven by a `columns` configuration array for table rendering, search, pagination, and sorting, eliminating repetitive table template code.
- **Dynamic Router** — A mechanism that fetches the permission menu tree from the backend menu API, flattens it, and registers routes at runtime via `router.addRoute()`. Unlike static routes, dynamic routes are visible only based on the user's permissions.
- **AuthButton** — A permission model that controls page button visibility via the `v-auth` directive. Button permission lists are fetched from the backend API, decoupled from page routes, and support fine-grained operation-level permission control.
- **Pinia Store Persist** — A mechanism that uses `pinia-plugin-persistedstate` to automatically sync Pinia store state to `localStorage`, ensuring user state (token, theme, tabs) is preserved after page refresh.
- **Layout Mode** — YiVad supports four layout modes: `vertical` (sidebar), `classic` (classic), `transverse` (top navigation), `columns` (split), switchable dynamically via `globalStore.layout`.
- **RPC envelope** — The `{module_name, method_name, parameters}` request shape used for every cross-project call to the YiAi backend's execution endpoint.
- **`filter` (not `query`)** — The Mongo-filter parameter name in `data_service.query_documents`. The backend's `_build_filter` reads `filter`, not `query`. YiVad had been sending `query` in earlier versions and getting empty results.
- **`target_file` (not `path`)** — The file-path field name for `/read-file` and `/write-file`. YiVad's `fileService.readFile/writeFile` had been sending `path` and getting 422s.

### Term Relationships

- **Dynamic Router** depends on permission data from **AuthButton** to determine which menus are visible.
- **ProTable** relies on the `useTable` hook to handle pagination and data fetching.
- **Pinia Store Persist** applies to the `global`, `user`, and `tabs` stores.
- **Layout Mode** consumes theme and layout configuration from `globalStore`.
- All data operations go through the **RPC envelope** to YiAi's execution engine or the dedicated `/read-file`, `/write-file`, `/upload-image-to-oss` endpoints.

### Example Conversations

> **User:** I want to add an edit button to the "User Management" page, but only the admin role should see it.
>
> **System:** Add the `v-auth="'user:edit'"` directive to the button. The backend returns the current role's button permission list via the `authButtonList` API. If `user:edit` is not in the list, the button will be automatically hidden.

> **User:** How do I add a new page to the sidebar menu?
>
> **System:** Create the page component under `src/views/`, then configure the menu item (path, name, component path) in the backend menu management API. The frontend uses **dynamic routing** to automatically fetch and register routes after login. If the backend is unavailable, you can add menu items directly in `src/assets/json/authMenuList.json`.

### Disambiguation Markers

| Term | Easily Confused Concept |
|------|---------------|
| **ProTable** | Not Element Plus's `el-table`; ProTable is a full table solution with search, pagination, and column configuration |
| **Dynamic Router** | Not Vue Router's lazy loading (`() => import()`) or nested routes (children); dynamic routing specifically refers to runtime route registration based on permissions |
| **AuthButton** | Not a route guard (`beforeEach`); route guards control page-level access, while AuthButton controls button-level visibility within a page |
| **Persist** | Not the browser's `localStorage` API; refers to the Pinia plugin's automatic bidirectional sync mechanism |
| **Layout Mode** | Not CSS layout or Element Plus's `el-row/el-col` grid; it is page-level framework structure switching |
| **`filter`** | Not `query` (the backend's `query_documents` only recognises `filter`); not the Mongo `$filter` aggregation stage |
| **`target_file`** | Not `path` — the backend's Pydantic model `FileReadRequest`/`FileWriteRequest` requires `target_file` |

---

## Action recommendations

1. **Introduce Vitest for the ProTable data-fetching pipeline within the next sprint.** The current architecture has zero test coverage, and the ProTable requestApi -> callService -> RequestHttp -> YiAi chain is the most frequently modified code path. Write 3 composable tests (useTable, useSelection, useAuthButtons) and 1 integration test that verifies a `query_documents` call with `filter` (not `query`) reaches the correct RPC envelope shape. This is the highest-ROI testing investment because it catches the parameter-name regression that has caused real bugs.

2. **Add a `staticRouter.ts` validation step to the CI pipeline that verifies every route in `authMenuList.json` has a corresponding component file.** The current fallback mechanism depends on the static JSON being in sync with the actual component files. When a new route is added but the fallback is not updated, users who start the app without the backend menu API see a broken menu. A CI check that reads `authMenuList.json` and verifies each `component` path exists on disk prevents this silently broken state.

3. **Create a one-page "ProTable Cheatsheet" that maps every `ColumnProps` field to its visual effect and its RPC contract implications.** The current documentation references ProTable in multiple places (CLAUDE.md, ProTable patterns rule, readme) but nowhere is there a single reference that answers: "I want to add a searchable, sortable column with a custom render function -- what do I write?" This cheatsheet should be co-located with the ProTable component and linked from the onboarding doc.

4. **Schedule a monthly cross-project contract alignment check as a 15-minute calendar event.** The `filter`/`query` and `target_file`/`path` bugs were the same pattern in different domains. A monthly check where one engineer from YiVad and one from YiAi review the cross-project protocol table for any new parameters or changed field names would catch the next contract mismatch before it becomes a bug. The check should be a recurring calendar event, not an ad-hoc task.

5. **Add a `RSBUILD_ENV_` prefix validation lint rule to catch any remaining `VITE_` references.** The Vite-to-Rsbuild migration changed the env var prefix, but it is easy for a developer to add a new `VITE_` variable by habit. A simple grep-based lint rule in the pre-commit hooks that rejects any file containing `import.meta.env.VITE_` would prevent the next env var prefix regression before it reaches a PR.

6. **Add agent-mode E2E tests for the confirmation/steering/followup/resume lifecycle.** The pi Agent loop (2026-08-08) introduced a complex multi-turn protocol with confirmation gates, natural-language steering, followup queuing, and resume-by-session. A Vitest suite that simulates the full agent lifecycle (create → confirm → steer → followup → max_turns → resume) against a running YiAi instance would catch regressions in the most complex frontend state machine. Start with the `confirmationAnswerFor` and `isContinuationMessage` pure-util tests (already unit-tested 51/51 and 21/21) and layer on store-level integration tests for `runStream` with mocked SSE events.

## Anti-patterns

- **Using raw `el-table` instead of ProTable for new table pages.** ProTable is the canonical table pattern. It encapsulates search, pagination, sorting, and column configuration into a declarative API. Using raw `el-table` means reimplementing all of these features from scratch, creating inconsistency across pages.

- **Using `v-if` with permission state instead of `v-auth` directive.** The `v-auth` directive decouples permission logic from the view layer. Using `v-if` with `authStore.hasPermission('user:edit')` inline creates tight coupling and makes it impossible to change the permission model without touching every view.

- **Calling `axios` directly instead of going through `RequestHttp`.** The `RequestHttp` class wraps Axios with interceptors, cancellation, error mapping, and the RPC envelope. Importing `axios` directly bypasses all of these layers, breaking authentication, error handling, and the unified response envelope.

- **Using `query` instead of `filter` or `path` instead of `target_file` in RPC calls.** Both parameter name mismatches have caused real bugs. The backend silently ignores `query` and returns 422 for `path`. Always use the contract names as documented in the cross-project protocol table.

- **Skipping the `!aborted && !error` guard before auto-forwarding SSE results to WeCom.** The 2026-07-28 fix in `aiChat.ts` prevents partial or aborted chat content from being auto-forwarded. Every SSE `onDone` handler that has external side effects must include this guard.

## Related

- [YiVad CLAUDE.md](./claude.md) — project profile, module boundaries, self-constraints, and recent changes
- [YiVad changelog](./changelog.md) — changelog index with entry pointers and STALE markers
- [YiVad architecture](../architecture.md) — tech stack, layer boundaries, key data flow, and degradation strategy
- [YiVad development standards](../dev-standards.md) — coding conventions, naming, ProTable, SSE, and RPC field contract
- [YiVad functional modules](../functional-modules.md) — 20 view domains, 18 API modules, 11 stores inventory

## Recent Changes

### 2026-07-31 — Knowledge + RAG api modules

- **`src/api/modules/`**: Added `knowledgeService.ts` (scan / read / write / stories) and `ragService.ts` (RAG chat uses the existing SSE parser). Backend routes live in `YiAi/src/server/routes/knowledge.py` and `rag.py`.
- **`src/stores/modules/`**: Added `knowledge.ts`, `knowledgeTree.ts`, `story.ts` Pinia stores backing the aiChat knowledge features.
- **`src/views/aiChat/components/KnowledgePreviewDialog.vue`**: Knowledge detail dialog — renders markdown body + a frontmatter strip (status / lifecycle / review_cycle / tacit / type / roles / tags + clickable `related` links).
- **`src/views/story/index.vue`**: Story Board list + detail drawer. Overview tab renders `store.storyMarkdown` (markdown body + frontmatter meta strip).
- **No standalone `/knowledge/*`, `/aicr/*`, or `/bug/*` routes or pages exist** — the `src/views/{knowledge,aicr,bug}/` + `KnowledgeTree.vue` + `useAicrKnowledgeStore` claims from earlier sessions were never landed on master. The stores and api modules back the aiChat features only. Bug UI lives at `src/views/code-review/bugs/` (not `src/views/bug/`).

### 2026-07-30 — Sidebar parity + RSS → YiKnowledge offload

- **Sidebar parity**: ChatSidebar + ConversationSidebar + ConversationSessionSidebar (all under `src/views/aiChat/components/`) aligned to a FileTree-style baseline — favorites + batch operations + hover action row + inline rename.
- **RSS offload**: RSS body content moved to YiKnowledge markdown under `YiKnowledge/{category}`; MongoDB now stores metadata only (`category_path` + `file_path`).

### 2026-07-28 — Bug fixes

- **`src/api/modules/fileService.ts`**: `readFile` and `writeFile` were sending `{ path }` but YiAi's `/read-file` and `/write-file` endpoints require `target_file` (Pydantic `FileReadRequest` / `FileWriteRequest`). Every call would 422. Fixed both to send `{ target_file: path, content }`.
- **`src/stores/modules/aiChat.ts`**: On SSE `onDone`, the store now checks `!lastPet?.aborted && !lastPet?.error` before calling `autoForwardToRobots(streamed)`. Previously, if the user aborted mid-stream, partial content would still auto-forward to WeCom robots. (Earlier-session references to `aicr/chat.ts` were STALE — no aicr store exists; this guard lives in the aiChat store.)

### 2026-07-28 — Vite → Rsbuild migration

- Migrated from Vite 8 to **Rsbuild 1**. Env prefix is now `RSBUILD_ENV_*` (no more `VITE_` leaks). `svg-sprite` + `views-glob` custom plugins replicate dropped Vite features.

### 2026-07-27 — aiChat port (from YiWeb)

- Ported YiWeb's `sessionChat` page. Per-message actions (regenerate / retry / resend / delete / edit), `streamingType`, `aborted` flag, `scrollTick` throttle. Fixed `index.vue` `useResizable` scaffold bug.

### 2026-07-27 — aicr port (from YiWeb) — STALE

- **Claimed**: Ported YiWeb's `aicr` page end-to-end: 9 Pinia stores (`aicr/chat`, `sessions`, `faqs`, `fileTree`, `filters`, `modals`, `models`, `ui`, `weChat`) + 8 modal components + cards/graph views + full `CodeViewer`/`ChatPanel` parity.
- **Reality (audited 2026-08-04)**: `src/views/aicr/` and `src/stores/modules/aicr/` do not exist on master. 0 aicr-specific commits. The claim was never landed. The aiChat port (line above) is real and shipped; aicr-style functionality has been subsumed into aiChat components rather than a separate aicr page tree.

### 2026-08-08 — aiChat agent mode (pi Agent loop)

- **Agent tool confirmation UI**: `MessageList.vue` renders a confirmation banner with Approve/Reject buttons for write operations (`db_create`/`db_update`/`db_delete`). Auto-rejects after 120s. `aiChat.ts` `pendingConfirmation` carries `confirmationId`; `approvePendingConfirmation()`/`rejectPendingConfirmation()` call `POST /agent/confirm`.
- **Agent tool timeline**: `tool_execution_start`/`tool_execution_end` handlers render live tool calls in `AgentTimeline` — Loading spinner while running, final content/error on completion. `AgentEventsPanel.vue` widened to handle `model_switch` events.
- **Auto-steer plain messages into running agent**: `sendMessage` no longer drops mid-run messages — plain text now calls `POST /agent/steer`, reflects as a user bubble, and toasts confirmation. Slash commands and images keep prior behavior.
- **Chat confirmation answers (natural-language permission)**: `confirmationAnswerFor(text)` in `src/utils/confirmationAnswer.ts` classifies chat messages as approve/reject — type `approve`/`yes` to approve, `reject`/`no` to reject. Reject with extra text both rejects AND steers the correction. Unit-tested 51/51.
- **Resume-by-session for continue (persistent loop)**: After `max_turns_reached`, the next send with a genuine continuation (`continue`/`resume`/...) sends only the user message with `resume: true`. The backend restores the persisted tool trajectory. New tasks after max_turns go as fresh runs.
- **Continuation detection**: `src/utils/continuation.ts` `isContinuationMessage(text)` mirrors `YiAi`'s `_is_continuation` exactly — frontend/backend classify post-max_turns messages identically. Unit-tested 21/21.
- **Incomplete-task surfacing**: `agent_end` with `stop_reason=max_turns_reached` appends `> ⚠️ Max turns reached, task may be incomplete. Reply "continue" to resume.` so the user knows to continue.
- **Live agent turn-progress indicator**: `agentTurnProgress` computed (`{current, max, active, nearLimit}`) renders an `el-progress` bar above the per-turn timeline. Turns warning-colored when within 2 turns of max_turns.
- **Model switch surfacing**: `model_switch` events append `> ⚙️ Model auto-switched: from → to` to the streamed message — the escalation recovery is visible.
- **Skipped tool calls in timeline**: `tool_execution_end` handler clears `pendingConfirmation` immediately when the ending tool matches — confirmation is resolved the moment the backend surfaces the tool's end (executed OR skipped).
- **Queued /followup messages**: `/followup` messages render as `followup`-typed bubbles on the user side with a "Follow-up queued" pill. Kept out of request history so consumed follow-ups are never re-sent.
- **KnowledgeChatPanel agent mode**: The knowledge-file preview popup's chat module supports agent mode end-to-end — agent toggle, max-turns, system-prompt, model-rotation, tool lifecycle events, confirmation banner, and `model_switch` surfacing. Persisted per file.
