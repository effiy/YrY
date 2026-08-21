---
title: YiVad Architecture
tags: [yivad, architecture, frontend, vue]
category: engineer/learn/projects/yivad
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Quick reference to YiVad architecture layers and data flows"
related:
  - ./README.md
  - ./functional-modules.md
  - ./dev-standards.md
---

# YiVad Architecture

> Full architecture in [README.md](./README.md). Quick reference below.

## Layer stack

```
Layout (4 modes) → Router (dynamic, hash mode) → ProTable (declarative) → Auth (v-auth) → YiAi Backend
```

## Key components

| Layer | Implementation |
|-------|---------------|
| Layout | 4 modes (vertical, classic, transverse, columns) via `globalStore.layout` |
| Router | Vue Router 5 hash mode, dynamic routes from backend menu API, static fallback `authMenuList.json` |
| ProTable | Declarative table driven by `ColumnProps[]`, encapsulates search/pagination/sorting |
| Auth | `v-auth` directive for button-level permissions, decoupled from route guards |
| HTTP | `RequestHttp` Axios wrapper with interceptors, cancellation, error mapping |
| State | Pinia 4 stores with `pinia-plugin-persistedstate` |

## Data flows

- **Table fetch**: View → ProTable → `api/modules/` → `callService` → `RequestHttp.post` → YiAi RPC → MongoDB
- **Chat SSE**: `aiChat` store → `streamChat` → `fetch POST /` → SSE parsing → incremental UI updates
- **File I/O**: `fileService` → `POST /read-file` or `/write-file` with `target_file` (NOT `path`)

## Cross-cutting

- **i18n**: Vue-i18n 11 with `zh-CN` + `en`
- **Directives**: `v-auth`, `v-copy`, `v-watermark`, `v-drag`, `v-debounce`, `v-throttle`, `v-longpress`
- **Hooks**: `useTable`, `useTheme`, `useAuthButtons`, `useSelection`, etc.