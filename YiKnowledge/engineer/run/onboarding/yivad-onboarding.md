---
title: YiVad Onboarding — Day 1 Quick Start
tags: [onboarding, yivad, setup, quick-start]
category: engineer/run/onboarding
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "New YiVad engineers set up their dev environment and understand the architecture within the first day"
acceptance_criteria:
  - "Setup steps verified working"
  - "Key architectural concepts explained"
  - "Common gotchas documented"
  - "Day-1 task checklist included"
related:
  - ./README.md
  - ../../../../YiVad/CLAUDE.md
  - ../../../../YiVad/README.md
  - ../../learn/projects/yivad/README.md
---

# YiVad Onboarding — Day 1

> **Goal**: By end of day 1, you can run YiVad locally, understand the architecture, and make a small change.

## Prerequisites

- Node.js 18+ and pnpm
- YiAi backend running on `http://localhost:10086` (see [YiAi onboarding](../yiai/onboarding.md))
- Chrome or Edge (last 2 versions)

## Setup (30 min)

```bash
cd YiVad
pnpm install
pnpm dev        # Starts dev server on http://localhost:8848
pnpm type:check # Verify TypeScript: vue-tsc --noEmit
```

## Architecture overview (read first)

Start with the project [CLAUDE.md](../../../../YiVad/CLAUDE.md). Key concepts:

| Concept | What it is | Where |
|---|---|---|
| ProTable | Declarative table component (search, pagination, sorting, columns) | `src/components/ProTable/` |
| Dynamic Router | Routes fetched from backend menu API at runtime | `src/routers/` |
| RequestHttp | Axios wrapper with interceptors, RPC envelope | `src/api/index.ts` |
| v-auth | Button-level permission directive | `src/directives/modules/auth.ts` |
| Pinia stores | State management (setup-function syntax) | `src/stores/modules/` |
| RPC envelope | `{module_name, method_name, parameters}` → YiAi | All API calls |

## Data flow (trace a request)

```
User clicks in browser
  → Vue component (src/views/)
  → API module (src/api/modules/) calls http.post()
  → RequestHttp attaches RPC envelope + X-Token
  → POST http://localhost:10086/
  → YiAi FastAPI → MongoDB → response
  → ProTable/store consumes response
```

## Common gotchas

1. **`filter` not `query`** — When calling `data_service.query_documents`, the parameter is `filter`, not `query`. Using `query` silently returns wrong results.
2. **`target_file` not `path`** — When calling `/read-file` or `/write-file`, the field is `target_file`. Using `path` returns 422.
3. **ProTable is canonical** — New table pages must use ProTable, not raw `el-table`. ProTable encapsulates search, pagination, sorting, and column config.
4. **Stores must not import axios** — Stores call `@/api/modules/*` functions, which call `http.post()`. Never import axios directly in a store.
5. **`<script setup lang="ts">` only** — No Options API. Use Composition API with `defineProps<T>()` and `defineEmits<T>()`.

## Day-1 task checklist

- [ ] Run `pnpm dev` and open `http://localhost:8848`
- [ ] Read `YiVad/CLAUDE.md` (this takes ~30 min, do it)
- [ ] Open `src/api/index.ts` and trace the `RequestHttp` class
- [ ] Open `src/components/ProTable/` and understand the column config pattern
- [ ] Open `src/routers/` and understand dynamic route registration
- [ ] Make a small change: add a console.log to a page, verify it appears
- [ ] Run `pnpm type:check` and verify 0 new errors
- [ ] Read the cross-project RPC protocol: `YiKnowledge/engineer/build/cross-project-rpc-protocol.md`

## Next steps

- [YiVad engineering README](../../learn/projects/yivad/README.md) — deeper architecture, anti-patterns, action recommendations
- [YiVad CLAUDE.md](../../../../YiVad/CLAUDE.md) — authoritative reference for module boundaries, constraints, recent changes
- [Cross-project RPC protocol](../../build/cross-project-rpc-protocol.md) — complete API contract between YiVad and YiAi