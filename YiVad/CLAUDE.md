# CLAUDE.md — YiVad

> Vue 3.5 admin dashboard — the management UI member of the Yi family. ProTable-driven, four layout modes, dynamic routing with backend menu API, button-level permissions via `v-auth`. Companion to **YiAi** (FastAPI backend) and **YiPet** (Chrome MV3 extension).

---

## Table of Contents

- [Foundational Beliefs](#foundational-beliefs)
- [Iron Laws](#iron-laws)
- [Architecture Direction](#architecture-direction)
- [Project Profile](#project-profile)
- [Project Structure](#project-structure)
- [Module Boundaries](#module-boundaries)
- [Data Flow](#data-flow)
- [Project Constraints](#project-constraints)
- [Degradation Countermeasures](#degradation-countermeasures)
- [Self-Constraints](#self-constraints)
- [Recent Changes](#recent-changes)
- [Guidance](#guidance)

---

## Foundational Beliefs

- **Trust the model.** Claude is capable of understanding this codebase at a deep level. Give it the context it needs and trust it to make the right calls.
- **Value attention.** Every line of code you write will be read many more times than it was written. Write for the reader, not the writer.
- **Verify reality.** Run the code. Read the results. Assertions beat confidence. The quickest way to be wrong is to skip verification.
- **Think before coding.** State assumptions explicitly; if multiple interpretations exist, present them; if a simpler approach exists, say so.

## Iron Laws

- **Simplicity first.** No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenes.
- **Surgical changes.** Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
- **Goal-driven execution.** Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.

## Architecture Direction

> **Componentization.**
>
> As a Vue 3 frontend project, YiVad advances along the component-extraction axis. Extract reusable components, composables, and shared UI primitives. Define clear props/events APIs. Eliminate duplicated markup.
>
> Reference: [../../../rules/architecture-direction.md](../../rules/architecture-direction.md)

## Project Profile

| Property | Value |
|----------|-------|
| Name | YiVad |
| Type | Frontend (SPA) |
| Version | 1.0.0 |
| Framework | Vue 3.5 + TypeScript 6 |
| Build | Rsbuild 1 |
| State | Pinia 4 (with `pinia-plugin-persistedstate`) |
| UI | Element Plus 2.14 |
| Charts | ECharts 6 |
| Router | Vue Router 5 (hash mode, dynamic routes) |
| HTTP | Axios (custom `RequestHttp` wrapper) |
| i18n | Vue-i18n 11 (zh + en) |
| Architecture | Single SPA with dynamic routing |
| Test framework | None (add Vitest when coverage becomes a priority) |
| Lint / format | ESLint 10 + Prettier 3 + Stylelint 17, husky 9 + lint-staged 17 |
| Commits | commitlint 21 + cz-git |
| Runtime | Browser (Chrome, Edge, Firefox, Safari — last 2 versions) |

## Project Structure

```
src/
├── api/          — HTTP request layer (Axios interceptors, cancellation, error handling)
├── assets/       — Static resources (fonts, icons, images, mock JSON)
├── components/   — Reusable components (ProTable, ECharts, Upload, WangEditor, etc.)
├── config/       — Global constants (HOME_URL, DEFAULT_PRIMARY, route whitelist)
├── directives/   — Custom directives (auth, copy, debounce, throttle, draggable, longpress, watermark)
├── enums/        — HTTP status codes, request methods, content types
├── hooks/        — Composables (useTable, useTheme, useAuthButtons, useSelection, etc.)
├── languages/    — i18n setup (zh-CN + en)
├── layouts/      — Multi-layout system (vertical, classic, transverse, columns)
├── routers/      — Dynamic routing with permission guards and menu-to-route mapping
├── stores/       — Pinia stores (global, user, auth, tabs, keepAlive, aiChat, knowledge, knowledgeTree, rag, story, bug)
├── styles/       — Global SCSS, Element overrides, theme variables
├── typings/      — Global TypeScript type declarations
├── utils/        — General utilities (color, menu tree ops, localStorage, etc.)
└── views/        — Page components organized by feature domain
```

## Module Boundaries

### Frontend layers (top-down)

| Layer | Public API |
|---|---|
| `src/views/` | Page components organized by feature domain. Each page imports from `@/components`, `@/hooks`, `@/stores`, `@/api/modules`. |
| `src/layouts/` | Four layout modes (vertical, classic, transverse, columns) — share Header / Menu / Footer / Tabs components. Don't fork per layout. |
| `src/components/` | Reusable components: `ProTable/`, `ECharts/`, `Upload/`, `WangEditor/`, `SearchForm/`, etc. ProTable is the canonical table — don't use raw `el-table`. |
| `src/hooks/` | Composables: `useTable`, `useTheme`, `useAuthButtons`, `useSelection`, etc. Name file same as composable (`useTable.ts`). |
| `src/stores/` | Pinia setup-function stores. Stores may import from `@/api/modules` and `@/hooks` but MUST NOT import `axios` directly. |
| `src/api/modules/` | Domain service functions (`sessions.ts`, `chatService.ts`, `dataService.ts`, `fileService.ts`, `faqService.ts`, `weChatService.ts`, `knowledgeService.ts`, `ragService.ts`, ...). The public API surface for stores and views. |
| `src/api/index.ts` | `RequestHttp` class — Axios wrapper with interceptors, cancellation, error mapping. Modules call `http.post(...)`; nothing else imports axios. |
| `src/directives/` | `v-auth`, `v-copy`, `v-watermark`, `v-drag`, `v-debounce`, `v-throttle`, `v-longpress`. Register via `src/directives/index.ts`. |
| `src/routers/` | Hash-mode Vue Router 5 with dynamic routes from backend menu API. Guards in `src/routers/beforeEach.ts`. |

### Cross-project protocol (YiVad ↔ YiAi)

The "RPC envelope" used for every cross-project call:

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

| Method | Contract |
|---|---|
| `data_service.query_documents` | `parameters: { cname | collection_name, filter?: dict, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }`. The `filter` dict is merged into the Mongo query via `_build_filter`. **Do NOT use `query` — it is silently ignored.** |
| `data_service.create_document` | `parameters: { cname, data }` |
| `data_service.update_document` | `parameters: { cname, key, data }` |
| `data_service.delete_document` | `parameters: { cname, key }` |
| Chat (SSE) | `streamChat({model, messages, system?, images?})` via `services.ai.chat_service.chat` |
| `/read-file`, `/write-file` | Field name is **`target_file`** (not `path`); `content`; optional `is_base64` |
| `/upload-image-to-oss` | `{ data_url, filename, directory }` |
| `/delete-file`, `/delete-folder`, `/rename-file`, `/rename-folder` | `target_file` / `target_dir` / `old_path`+`new_path` / `old_dir`+`new_dir` |
| `/knowledge/*` | Knowledge-base scan / read / write / metadata CRUD (markdown tree mirror in MongoDB `knowledge_files`) |
| `/rag/*` | RAG query (one-shot) + RAG chat (SSE) + per-file variants; `scope` filters by `file_path` substring |

## Data Flow

### Table fetch (ProTable)

```
View defines columns + requestApi
   ▼ requestApi({ pageNum, pageSize, ...filters })
api/modules/<domain>.ts → callService("services.database.data_service",
                                      "query_documents",
                                      { cname, filter, pageNum, pageSize })
   ▼ http.post("", {module_name, method_name, parameters})
RequestHttp interceptor: attach X-Token, transform response, checkStatus on error
   ▼ fetch POST http://localhost:10086/
YiAi data_service.query_documents → repository.query_documents
   ▼ _build_filter(query_params) → MongoDB find().sort().skip().limit()
   ▼ { list: [...], total, pageNum, pageSize, totalPages }
ProTable receives { list, total } → renders rows + Pagination
```

### Chat (SSE streaming)

```
aiChat store — sendMessage / regenerateMessageAt / resendMessageAt
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
streamChat parses SSE line-by-line → onChunk(text) / onDone() / onError(err)
   ▼
Store appends deltas to the in-flight pet message; on abort marks aborted=true
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

## Project Constraints

### Non-Negotiable Baselines

- TypeScript strict mode (`tsconfig.json`) — `vue-tsc --noEmit` must pass.
- ESLint 10 + Prettier 3 + Stylelint 17 pre-commit hooks (via husky 9 + lint-staged 17).
- Conventional commits enforced by commitlint 21 + cz-git.
- All API calls go through `src/api/index.ts` `RequestHttp` class — never call raw `axios`.
- Button permissions checked via `v-auth` directive — never inline `v-if` based on permissions.
- Dynamic routes loaded from backend menu API (falls back to `authMenuList.json`).
- Page components use `<script setup lang="ts">` — no Options API.

### Coding Standards

| Area | Standard |
|---|---|
| Component style | `<script setup lang="ts">` + Composition API |
| Props / Emits | `defineProps<{...}>()` and `defineEmits<{...}>()` with type generics |
| State | Pinia with setup-function syntax (`defineStore(() => {...})`) |
| Styles | Scoped SCSS, variables from `src/styles/`, no inline styles except dynamic values |
| Element Plus | `el-` prefix, follow Element Plus 2.14 API |
| Path imports | Use `@/` alias for cross-module imports, relative for siblings |
| Naming | PascalCase for components, camelCase for composables, kebab-case for CSS classes |
| Env vars | Prefix `RSBUILD_ENV_*` (since Vite→Rsbuild migration) |

## Degradation Countermeasures

| Condition | Action |
|-----------|--------|
| Menu API unavailable | Falls back to `src/assets/json/authMenuList.json` |
| Token expired | 401 interceptor redirects to login, clears user/auth stores |
| Build / type-check fails | `vue-tsc --noEmit` blocks `pnpm build:*`; commit hooks block on lint errors |
| Test framework absent | No test infrastructure yet — add Vitest when test coverage becomes a priority |
| Browser unsupported (IE) | Build targets modern browsers only; ES module output |
| SSE stream aborted | Pet message flagged `aborted=true`; persistence writes partial content; auto-forward to WeCom is skipped (see `aiChat.ts` fix) |

## Self-Constraints

- **ProTable is the canonical table pattern** — new table pages must use it; don't reach for raw `el-table`.
- **New composables go in `src/hooks/`**, new directives in `src/directives/modules/` — register via the central `index.ts`.
- **Layout modes share the Header / Menu / Footer / Tabs component set** — don't fork per layout.
- **No Options API** — `<script setup>` only; define state with `ref` / `reactive`, not `data()`.
- **Stores must not import axios** — they call `@/api/modules/*` functions, which in turn call `http.post(...)` from `@/api/index.ts`.
- **`filter` (not `query`) and `target_file` (not `path`)** — these two field names have been the source of past bugs. Always use the contract names when calling YiAi.
- **SSE `onDone` must check `!aborted && !error`** before auto-forwarding to external channels (WeCom) — see `src/stores/modules/aiChat.ts` 2026-07-28 fix. (Earlier references to `aicr/chat.ts` were STALE — no aicr store exists.)

## Recent Changes

### 2026-08-08 — Live agent turn-progress indicator (user sees the budget)

- **`src/stores/modules/aiChat.ts`**: new `agentTurnProgress` computed — `{ current, max, active, nearLimit }` — derived from the reactive `agentTurnSummaries` (last `turnIndex`), `agentMaxTurns` (user-configurable), and `streamingPhase`. `active` = the agent is mid-run (`thinking`/`streaming`/`retrieving`); `nearLimit` = within 2 turns of `max_turns`. Exposed in the store return.
- **`src/views/aiChat/components/MessageBubble.vue`**: while the agent runs, a compact line above the per-turn timelines shows `Agent 运行中 · 第 X / N 轮` with an `el-progress` bar; it turns warning-colored when `nearLimit`, so the user sees the agent approaching the turn wall and can reply 继续 (or steer) instead of waiting for a `max_turns_reached` stop. Complements the backend budget awareness (the model knows its budget; now the user sees it live). Type-check: 0 new errors (18 pre-existing, all in unrelated files).

### 2026-08-08 — Resume-by-session for 继续 (pi persistent loop)

- **`src/stores/modules/aiChat.ts`**: after `agent_end` with `stop_reason=max_turns_reached`, the next send in the same session no longer re-sends the full history — it sends **only** the user's continuation with `resume: true`. The backend restores the persisted faithful trajectory (incl. `tool_result` messages), so the model sees the real completed calls and continues instead of redoing them. Previously the resume re-sent text-only narration and the model re-ran completed writes (measured 3/3 resumed runs re-created a menu `db_create` had already made; now 8/8 resumed runs complete the full lifecycle with zero duplicates). `lastAgentInterrupt` (set at `max_turns_reached` agent_end) marks the session; `resumeMessages` = the trailing user message only, one-shot cleared.
- **`src/api/modules/agentService.ts`**: `AgentChatPayload.resume?: boolean` → forwarded as `resume: true` on the `/agent/chat` body.

### 2026-08-08 — Incomplete-task surfacing (max_turns_reached)

- **`src/stores/modules/aiChat.ts`** + **`src/views/aiChat/components/KnowledgeChatPanel.vue`**: the backend now distinguishes `agent_end` `stop_reason="max_turns_reached"` (loop ran out of turns mid-task) from `"completed"` — previously both were "completed", so an unfinished task looked done. Both chat surfaces append `> ⚠️ 已达到最大轮次，任务可能未完成。回复「继续」可接着完成。` so the user knows to reply 继续 and the loop resumes from the accumulated history.

### 2026-08-08 — aiChat agent model_switch surfacing (main panel)

- **`src/stores/modules/aiChat.ts`**: Added the missing `model_switch` case to the agent `onEvent` switch (parity with `KnowledgeChatPanel`). When the backend escalates mid-task (stalled model → stronger fallback), the main chat panel now appends `> ⚙️ 模型自动切换：from → to` to the streamed pet message instead of staying silent about the handoff. Escalation is how the loop recovers to finish concrete tasks; now the recovery is visible in the primary chat surface.
- **`src/views/aiChat/components/AgentEventsPanel.vue`**: Widened the `events` prop's `message` field to `{ role, content } | { from, to }` — fixes a pre-existing TS error from the earlier `AgentStreamEvent.message` widening (`model_switch`'s `{from,to}` payload didn't fit the panel's local type). Verified `pnpm type:check` — zero errors in agent-related files (18 pre-existing errors remain only in unrelated dashboard/proTable/rag views).

### 2026-08-08 — aiChat agent tool confirmation UI

- **`src/views/aiChat/components/MessageList.vue`**: Tool confirmation banner with **Approve / Reject** buttons (replaces the old "skipped for safety" dead end). Renders the pending tool name + args; auto-rejects after 120s to match the backend wait timeout.
- **`src/stores/modules/aiChat.ts`**: `pendingConfirmation` now carries `confirmationId`; added `approvePendingConfirmation()` / `rejectPendingConfirmation()` actions that call `confirmAgentTool` with the active conversation key; the `confirmation_required` handler captures `event.confirmation_id`. Agent-mode `system_prompt` omits the frontend `getToolsForSystemPrompt()` block (it contradicted the backend `<tool_call>` loop). Added `tool_execution_start` / `tool_execution_end` handlers: start pushes a `(running)` entry into the current turn's toolCalls (AgentTimeline renders a Loading spinner), end fills in the final content/error — completing Pi's live tool lifecycle so the timeline shows tools as they execute instead of only at `turn_end` (this also unblocks the pre-existing `tool_execution_update` partial-progress handler, which previously could never match a call because toolCalls was empty until turn end).
- **`src/api/modules/agentService.ts`**: Added `confirmAgentTool(sessionId, confirmationId, approve)` → `POST /agent/confirm`; `AgentStreamEvent` gains `confirmation_id`/`tool_name`/`tool_args`.

Backed by `YiAi`'s generic data tools (`db_list`/`db_schema`/`db_create`/`db_update`/`db_delete` — the agent reasons over the `menus` collection via `db_schema` instead of menu-specific code) + native Ollama tool calling — see `YiAi/CLAUDE.md` and `YiKnowledge/engineer/projects/yivad/manage-menu-catalog.md` → "Agent chat data tools (aiChat)".

- **`src/views/aiChat/components/KnowledgeChatPanel.vue`**: The knowledge-file preview popup's chat module now supports **agent mode** end-to-end (Pi-inspired), so the previously-dead Agent toggle actually works. The `ChatToolbar` Agent controls are fully wired (`agentMode` + max-turns + system-prompt + model-rotation, persisted per file). `send()` routes to `/agent/chat` via `streamAgentChat` when agent mode is on (takes precedence over RAG), handling turn/tool-lifecycle events: multi-turn `---` separators, live `tool_execution_start`/`end` chips rendered on the pet message (expandable tool results), and a `confirmation_required` banner above the input with **Approve/Reject** calling `confirmAgentTool` against a stable per-file `kchat:{path}` session id. This lets the user complete concrete tasks — e.g. menu catalog CRUD via the generic `db_*` data tools over the `menus` collection — directly from the file preview chat. Also handles the backend's `model_switch` event (Pi-inspired escalation — the active model stalled so the loop handed off to a stronger one): surfaces `> ⚙️ 模型自动切换：from → to` in the streamed message.
- **`src/api/modules/agentService.ts`**: `AgentStreamEvent.message` widened to `{role,content} | {from,to}` for the `model_switch` event; `AgentChatPayload` gains optional `model_fallback` (ordered fallback models to escalate to on stall — omit ⇒ server default, `[]` ⇒ disabled).

### 2026-08-05 — KnowledgeMetaStrip UX improvements

- **`src/components/KnowledgeMetaStrip.vue`**: Two UX fixes on the frontmatter strip surfaced in `KnowledgePreviewDialog` and Story Board drawer:
  - **String `tacit` rendering** — 1573 knowledge files use `tacit:` as a string statement (e.g., "Brand Architecture is more than a logo; it is a contract..."), not a boolean. Previously the strip only rendered `tacit === true` (boolean), hiding these statements. Now string values render as a warning-toned callout (left border + background + 3-line clamp) above the badges row; boolean `true` still renders as a "tacit: yes" warning badge.
  - **External `related` links** — `related:` entries with `http(s):` / `mailto:` / `tel:` schemes previously rendered as non-clickable tags (click did nothing). Now they open in a new browser tab via `window.open(href, "_blank", "noopener,noreferrer")`; internal relative paths still navigate via the parent's `navigate-related` event.
- **`src/api/interface/yiweb.ts:411`**: Widened `KnowledgeMeta.tacit` from `boolean` to `boolean | string` to match the actual data shape.

### 2026-07-31 — Knowledge + RAG api modules

- **`src/api/modules/`**: Added `knowledgeService.ts` (scan / read / write / stories) and `ragService.ts` (RAG chat uses the existing SSE parser). Backend routes live in `YiAi/src/server/routes/knowledge.py` and `rag.py`.
- **`src/stores/modules/`**: Added `knowledge.ts`, `knowledgeTree.ts`, `story.ts` Pinia stores backing the aiChat knowledge features. `story.ts` exposes `storyMarkdown` (KnowledgeReadResponse) + `loadStoryMarkdown(story)` action called from `openDetail`.
- **`src/views/aiChat/components/KnowledgePreviewDialog.vue`**: Knowledge detail dialog — renders markdown body + (since 2026-08-05) a frontmatter strip surfacing `status / lifecycle / review_cycle / tacit / type / roles / tags` and clickable `related` links.
- **`src/views/story/index.vue`**: Story Board list + detail drawer. Since 2026-08-05 the Overview tab renders `store.storyMarkdown` (markdown body + frontmatter meta strip) — previously the store loaded it but the view didn't surface it.
- **No standalone `/knowledge/*`, `/aicr/*`, or `/bug/*` routes or pages exist** — the "knowledge leaf view folders" + "KnowledgeLeafList/Detail" + `src/views/{knowledge,aicr,bug}/` + `KnowledgeTree.vue` + `useAicrKnowledgeStore` claims from earlier sessions were never landed on master. The stores and api modules back the aiChat features only.

### 2026-07-30 — Sidebar parity + RSS → YiKnowledge offload

- **Sidebar parity**: ChatSidebar + ConversationSidebar + ConversationSessionSidebar (all under `src/views/aiChat/components/`) aligned to a FileTree-style baseline — favorites + batch operations + hover action row + inline rename. (Earlier-session claims of `ConversationSidebar (aicr)` + `FileTree (aicr)` were STALE — no aicr page tree exists.)
- **RSS offload**: RSS body content moved to YiKnowledge markdown under `YiKnowledge/{category}`; MongoDB now stores metadata only (`category_path` + `file_path`).

### 2026-07-28 — Bug fixes

- **`src/api/modules/fileService.ts`**: `readFile` and `writeFile` were sending `{ path }` but YiAi's `/read-file` / `/write-file` endpoints require `target_file` (Pydantic `FileReadRequest` / `FileWriteRequest`). Every call would 422. Fixed both to send `{ target_file: path, content }`.
- **`src/stores/modules/aiChat.ts`**: On SSE `onDone`, the store now checks `!lastPet?.aborted && !lastPet?.error` before calling `autoForwardToRobots(streamed)`. Previously, if the user aborted mid-stream, partial content would still auto-forward to WeCom robots. (Earlier references to `aicr/chat.ts` were STALE — this guard lives in the aiChat store, not aicr.)

### 2026-07-28 — Vite → Rsbuild migration

- Migrated from Vite 8 to **Rsbuild 1**. Env prefix is now `RSBUILD_ENV_*` (no more `VITE_` leaks). `svg-sprite` + `views-glob` custom plugins replicate dropped Vite features.

### 2026-07-27 — aiChat port (from YiWeb)

- Ported YiWeb's `sessionChat` page. Per-message actions (regenerate / retry / resend / delete / edit), `streamingType`, `aborted` flag, `scrollTick` throttle. Fixed `index.vue` `useResizable` scaffold bug.

### 2026-07-27 — aicr port (from YiWeb) — STALE

- **Claimed**: Ported YiWeb's `aicr` page end-to-end: 9 Pinia stores (`aicr/chat`, `sessions`, `faqs`, `fileTree`, `filters`, `modals`, `models`, `ui`, `weChat`) + 8 modal components + cards/graph views + full `CodeViewer`/`ChatPanel` parity. Build OK.
- **Reality (audited 2026-08-04)**: `src/views/aicr/` and `src/stores/modules/aicr/` do not exist on master. 0 aicr-specific commits. The claim was never landed — earlier-session hallucination. The aiChat port (above) is real and shipped; aicr-style functionality has been subsumed into aiChat components (`ConversationSidebar.vue`, `ConversationSessionSidebar.vue`, `KnowledgeChatPanel.vue`, `LlamaIndexPanel.vue`, etc.) rather than a separate aicr page tree.

## Guidance

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview, quick start, domain language |
| [.env](./.env) | Environment variables |
| [rsbuild.config.ts](./rsbuild.config.ts) | Build configuration |
| [tsconfig.json](./tsconfig.json) | TypeScript configuration |
| [src/config/index.ts](./src/config/index.ts) | App-level constants |
| [.claude/rules/api-request-layer.md](./.claude/rules/api-request-layer.md) | HTTP request layer rules |
| [.claude/rules/protable-patterns.md](./.claude/rules/protable-patterns.md) | ProTable conventions |
| [.claude/rules/vue-component-patterns.md](./.claude/rules/vue-component-patterns.md) | Vue 3 SFC patterns |
| `../../rules/architecture-direction.md` | Canonical architecture-direction rule |
