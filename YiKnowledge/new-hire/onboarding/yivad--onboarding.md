---
title: YiVad Onboarding
aliases:
- YiVad onboarding
tags:
- new-hire
- onboarding
- frontend
- Vue
- TypeScript
- Rsbuild
- YiVad
category: new-hire/onboarding/yivad
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- new-hire
benefit: onboarded quickly
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../../engineer/projects/yivad/README.md
- ../../../engineer/projects/yivad/engineering/claude.md
- ../../../engineer/projects/yivad/engineering/readme.md
- ../../../engineer/projects/yivad/engineering/changelog.md
- ../../../engineer/projects/yivad/rag-system-pages-reference.md
- ../../../engineer/projects/INDEX.md
tacit: false
---

# YiVad Onboarding

> **As a** new hire, **I want to** onboarding, **so that** onboarded quickly.

> Vue 3.5 admin dashboard framework. ProTable, dynamic routing, button-level permissions, aicr code review, aiChat, RAG playground all live here.

## Summary

- YiVad is the Vue 3.5 + TypeScript admin dashboard of the Yi family, running on port 8848, providing operations and development with YiAi data visualization, AI chat, aicr code review, and RAG playground UIs
- Day-1 setup compresses time from clone to PR merged to under 4 hours, with a verification checklist covering the login page, proxied API requests, and type checking
- Three high-frequency workflows cover 80% of daily tasks: adding a ProTable menu page, adding a store + service, and reviewing code in aicr with RAG chat
- The pitfalls cheatsheet is the highest-ROI section — every entry represents a real incident where a previous new hire lost hours to a non-obvious convention (use `filter` not `query`, use `target_file` not `path`, use `v-auth` not `v-if`)
- Onboarding documentation rots faster than any other documentation; every convention change (Vite to Rsbuild, env var prefix) must update the cheatsheet in the same PR

## 1. Project positioning

YiVad is the admin dashboard of the Yi family, port `8848` (dev). Provides operations/dev with YiAi data visualization, AI chat, aicr code review, RAG playground, story/requirement management UIs. Tech stack: Vue 3.5 + TypeScript 6 + Rsbuild 1 + Pinia 4 + Element Plus 2.14.

## 2. Day-1 setup (30 minutes to get going)

### Prerequisites

- Node.js 18+ / pnpm 8+
- YiAi backend running at `http://localhost:10086` (frontend dev proxies to it)

### Steps

```bash
# 1. Clone (skip if already inside the YrY repo)
cd /path/to/YrY/YiVad

# 2. Install dependencies
pnpm install

# 3. Confirm backend is running
curl http://localhost:10086/health/observer
# should return {"code":0,...}

# 4. Start frontend (auto-opens http://localhost:8848)
pnpm dev

# 5. Type-check + build (optional, verify environment)
pnpm type:check      # vue-tsc --noEmit
pnpm build:dev       # dev environment build
```

### Verification checklist

- [ ] Browser auto-opens `http://localhost:8848`, shows login page
- [ ] DevTools Console has no errors
- [ ] DevTools Network shows `/api` requests proxied to `localhost:10086`
- [ ] Navigate to `/rag` and see the RAG playground
- [ ] `pnpm type:check` exits 0

## 3. Three high-frequency workflows

### Workflow A: add a menu page (ProTable list)

Example: add a "Todo list" page.

1. Create `index.vue` under `src/views/todo/`:
   ```vue
   <script setup lang="ts" name="TodoList">
   import ProTable from "@/components/ProTable/index.vue";
   import { callService } from "@/api/modules/dataService";
   const columns = [
     { prop: "title", label: "Title", search: { el: "input" } },
     { prop: "done", label: "Status", render: row => row.done ? "Done" : "Pending" }
   ];
   const requestApi = params => callService("services.database.data_service", "query_documents",
     { cname: "todos", filter: { ...params }, pageNum: params.pageNum, pageSize: params.pageSize });
   </script>
   <template><ProTable :columns="columns" :request-api="requestApi" /></template>
   ```
2. Add a menu item in the backend menu API (path / name / component path), or directly edit `src/assets/json/authMenuList.json` as a fallback
3. Re-login → menu appears → click to see the list

### Workflow B: add a store + service

Example: add CRUD service for "Todo".

1. `src/api/modules/todoService.ts`: export `listTodos / createTodo / updateTodo / deleteTodo`, all via `callService("services.database.data_service", ...)`
2. `src/stores/modules/todo.ts`: Pinia setup-style store, calls the service
3. views call the store, **do not directly import axios** (stores must not import axios)

### Workflow C: review code in aicr + RAG chat

1. Navigate to `/aicr`
2. Pick a file to review from the left FileTree → right CodeViewer displays it
3. Toggle the `RAG` switch at the top of ChatPanel (icon turns blue)
4. Ask a question → backend goes through llama_index to retrieve the project's `story.md` / `scene.md` from YiKnowledge as context
5. Sources are listed below the assistant answer; click to jump to the corresponding knowledge file

## 4. New-hire pitfalls cheatsheet

| Symptom | Cause | Fix |
|---|---|---|
| ProTable list returns empty / all | RPC param used `query` | Switch to `filter` (iron rule) |
| `/read-file` 422 | field name used `path` | Switch to `target_file` (iron rule) |
| Button not showing | used `v-if="hasPermission"` | Switch to `v-auth="'perm:xxx'"` (iron rule) |
| `vue-tsc` reports Options API error | used `data()` / `methods` | Switch to `<script setup>` + `ref/reactive` |
| `Cannot find module 'axios'` inside store | store directly imports axios | Use functions from `@/api/modules/*` |
| env var not taking effect | used `VITE_` prefix | After Rsbuild, use `RSBUILD_ENV_` prefix |
| SSE stream interrupted but content still forwards to WeCom | `onDone` didn't check `!aborted` | See the `aicr/chat.ts` fix pattern |
| `useResizable` scaffold error | legacy scaffold remnant | Look at the current `src/hooks/useResizable.ts` |

## 5. What to read next

| Doc | What to look at |
|---|---|
| `YiVad/CLAUDE.md` (repo root) | Module boundaries, cross-project protocol, iron rules |
| `YiKnowledge/engineer/projects/yivad/engineering/readme.md` | Architecture diagram, data flow, directory structure |
| `YiVad/.claude/rules/protable-patterns.md` | ProTable usage |
| `YiVad/.claude/rules/api-request-layer.md` | HTTP layer conventions |
| `YiVad/.claude/rules/vue-component-patterns.md` | Vue 3 SFC conventions |
| `YiVad/src/api/index.ts` | `RequestHttp` Axios wrapper |

## 6. Day-1 task checklist

- [ ] `pnpm install` + `pnpm dev` runs, browser auto-opens `localhost:8848`
- [ ] `pnpm type:check` exits 0
- [ ] Read the Module Boundaries + Cross-project protocol sections of `YiVad/CLAUDE.md`
- [ ] Add a `/hello` page under `src/views/` (route + component), submit a PR
- [ ] Use ProTable to render an empty table, confirm RPC uses `filter` not `query`
- [ ] Do a 30-minute walkthrough with a colleague

## 7. Owners / contacts

| Role | Name | Contact |
|---|---|---|
| Project owner | TBD | TBD |
| Frontend architecture | TBD | TBD |
| ProTable / component library | TBD | TBD |
| aicr / aiChat | TBD | TBD |
| Code review | TBD | TBD |

> Placeholder fields — please have the project owner fill them in and then delete this line.

## 8. Common error cheatsheet

| Error message | Cause | Fix |
|---|---|---|
| `Cannot find module '@/xxx'` | path alias broken | Check `tsconfig.json` `paths`; use `@/` alias |
| `ElementPlus is not defined` | not registered globally / not on-demand | Check Element Plus import in `src/main.ts` |
| `ProTable ... requestApi is required` | didn't pass `:request-api` | See `protable-patterns.md` convention |
| `401 Unauthorized` | token expired | interceptor will redirect to login; re-login |
| `Network Error` calling `/api` | backend not running / proxy not configured | Start YiAi; check `RSBUILD_ENV_PROXY` in `.env.development` |
| `vue-tsc` reports `Type X is not assignable` | props type mismatch | Use `defineProps<{...}>()` generic |
| SSE stream didn't receive done | onDone not called / abort too early | See `streamChat` implementation, check `AbortController` |
| `pnpm type:check` slow | full `vue-tsc --noEmit` | normal, ~30s; rely on IDE for incremental |

---

If in doubt, check §4 and §8 first; if you can't find the answer, ask the relevant owner in §7.

## Core viewpoints

- **The fastest way to build trust in a new codebase is to ship a trivial change on day one.** The day-1 task checklist is designed to compress the time from "clone" to "PR merged" to under 4 hours. This is deliberate: the psychological barrier of a new codebase is broken by the act of shipping, not by reading documentation. Every onboarding should include a "hello world" PR that touches the real build pipeline, not a sandbox.

- **High-frequency workflow documentation is more valuable than architecture diagrams for the first week.** A new hire does not need to understand the full architecture to add a menu page. They need the three workflows that cover 80% of daily tasks. Architecture understanding grows organically as they execute these workflows and encounter the boundaries. The onboarding doc should prioritize "how do I do X" over "how does X work."

- **The pitfalls cheatsheet is the highest-ROI section of onboarding documentation.** Every item in the cheatsheet represents a real incident where a previous new hire lost hours to a non-obvious convention. The iron rules (use `filter` not `query`, use `target_file` not `path`, use `v-auth` not `v-if`) are not arbitrary — they are the scars of past debugging sessions. Maintaining this cheatsheet is a continuous investment in reducing the time-to-productivity for every future hire.

- **Onboarding documentation rots faster than any other documentation because it describes the current state of the codebase.** The §4 pitfalls cheatsheet, §8 common error cheatsheet, and §3 high-frequency workflows are accurate only as long as the codebase conventions don't change. Every convention change (e.g., switching from Vite to Rsbuild, changing the env var prefix) must be accompanied by an onboarding doc update within the same PR.

- **The "What to read next" section is the bridge from onboarding to deep understanding.** A new hire who completes the day-1 checklist has a working development environment but a shallow understanding of the system. The reading list in §5 provides the graduated path: CLAUDE.md for module boundaries, architecture readme for data flow, and specific rule files for conventions. Each document is chosen because it answers the questions that naturally arise after completing the day-1 tasks.

## Action recommendations

1. **Update the pitfalls cheatsheet within the same PR that changes a convention:** Every time an iron rule changes (env var prefix, build tool, RPC parameter name), the §4 pitfalls cheatsheet must be updated in the same commit. Add a pre-commit hook or a PR checklist item that forces the reviewer to verify that the onboarding doc is in sync with the code change. An outdated cheatsheet is worse than no cheatsheet because it teaches new hires the wrong conventions with confidence. The current cheatsheet has 8 entries; schedule a quarterly audit to verify each one against the actual codebase.

2. **Add a "First PR" automated checklist to the day-1 task list:** Create a GitHub issue template for the "Hello World" PR that new hires submit on day one. The template should include a checklist: (1) `pnpm type:check` passes, (2) `pnpm lint:eslint` passes, (3) the component uses `<script setup lang="ts">`, (4) the route is registered in `authMenuList.json`, (5) the page renders at the expected URL. This automates the verification that the new hire has a working development environment and reduces the time the reviewer spends on basic checks.

3. **Schedule a recurring 30-minute onboarding doc review as part of every quarterly planning cycle:** The §4 pitfalls cheatsheet, §8 common error cheatsheet, and §3 high-frequency workflows are the most valuable sections of the onboarding doc. They also rot the fastest. Assign one engineer per quarter to spend 30 minutes verifying every item in these sections against the current codebase. The engineer should try to reproduce each error in the cheatsheet and confirm that the cause and fix are still accurate. Any outdated entries should be updated or removed.

4. **Fill in the owner/contact table (§7) before the next new hire starts:** The current owner table has "TBD" for every role. This is a blocker for any new hire who encounters an issue not covered by the cheatsheet. Assign a project owner, a frontend architecture lead, a ProTable/component library owner, an aiChat/aicr owner, and a code review owner. Each owner should have a name, a role description, and a contact method (Slack handle or email). This is a 15-minute task with outsized impact on the new hire's ability to unblock themselves.

5. **Create a "Second Week" reading path that bridges from onboarding to architecture understanding:** The current §5 "What to read next" is a reference list, not a guided path. Create a structured reading order: (1) re-read CLAUDE.md module boundaries, (2) read the architecture readme data flow section, (3) trace one ProTable request from the view through the API layer to the YiAi backend and back, (4) read the aiChat SSE streaming pipeline end-to-end, (5) read the Vitest introduction plan. Each step should have a concrete verification: "After step 3, explain why `filter` is used instead of `query` in the RPC call." This turns passive reading into active learning.

## Anti-patterns

- **Treating onboarding documentation as a one-time write-and-forget artifact.** The §4 pitfalls cheatsheet reflects the current state of the codebase. When the env var prefix changes from `VITE_` to `RSBUILD_ENV_`, the cheatsheet must be updated in the same PR. An outdated cheatsheet is worse than no cheatsheet — it teaches new hires the wrong conventions.

- **Writing onboarding docs that assume the reader has the same context as the author.** "ProTable list returns empty" is only meaningful to someone who already knows what ProTable is and what "empty" means in context. The pitfalls cheatsheet pairs each symptom with its cause and fix because the new hire may not know which layer is responsible for the failure.

- **Omitting the "why" behind iron rules.** "Use `filter` not `query`" is a rule. "Because the backend `_build_filter` only reads the `filter` parameter" is the understanding that prevents the new hire from making the same mistake in a different context. Rules without reasons are cargo cults.

- **Expecting new hires to find the relevant documentation on their own.** The "What to read next" section exists because new hires don't know what they don't know. Without explicit guidance, they will read the most accessible document (often the README) rather than the most important one (often the CLAUDE.md module boundaries).

- **Using the onboarding doc as a substitute for a 30-minute walkthrough with a colleague.** The onboarding doc can teach conventions, but it cannot answer "why is this module structured this way?" or "what was the context behind this decision?" The walkthrough is where tacit knowledge transfers; the doc is the reference material that reinforces it.

---

## Related

- [../../../engineer/projects/yivad/README.md](../../../engineer/projects/yivad/README.md) — YiVad project README
- [../../../engineer/projects/yivad/engineering/readme.md](../../../engineer/projects/yivad/engineering/readme.md) — YiVad architecture and data flow
- [../../../engineer/projects/yivad/engineering/claude.md](../../../engineer/projects/yivad/engineering/claude.md) — YiVad CLAUDE.md module boundaries and iron rules
- [../../../engineer/projects/INDEX.md](../../../engineer/projects/INDEX.md) — Project index with all Yi-family projects
- [../../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md](../../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) — YiVad Rsbuild migration context for new hires
