# CLAUDE.md — YiPet

> Chrome MV3 browser extension. Gentle Companion — an interactive pet companion in the browser, with multi-role chat, a React 18 + Ant Design 5 popup, on-demand CDN resource injection, full i18n (en + zh_CN), and timezone-aware display. Built with **Rsbuild + TypeScript**.

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

- **Trust the model, verify reality** — Code structure reflects the runtime architecture. The MV3 dual execution context (ISOLATED world + MAIN world) is YiPet's core reality; all code changes must respect this boundary. TypeScript types describe the contract, but only Chrome's runtime validates it.
- **Value attention** — Be aware of context-window economics. Prefer concise code and avoid verbose scaffolding. Every token spent on boilerplate is a token not spent on the problem.
- **Think before coding** — State assumptions explicitly. If multiple interpretations exist, present them. If a simpler approach exists, say so.

## Iron Laws

1. **Simplicity first** — No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenarios.
2. **Surgical changes** — Touch only what you must. Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
3. **Goal-driven execution** — Define success criteria, loop until verified. Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.
4. **Build before commit** — Run `npm run typecheck && npm run build` before considering work complete. Type errors and build failures are not acceptable.

## Architecture Direction

> **Componentization + API layering.**
>
> YiPet is an Rsbuild + TypeScript Chrome extension. The frontend (popup UI, content script pet rendering, chat window) uses React 18.3 from npm with function components + hooks. The API layer (`src/api/`) follows a four-tier architecture: **client → endpoints → types → services**. The HTTP client wraps `public/cdn/utils/api-client.ts` (the canonical base shared with MAIN-world CDN injection), adding the extension's dev-gated logger and SSE streaming.
>
> Engineering conventions are inspired by **Ant Design Pro** patterns: `@/` path alias, barrel exports (`index.ts`), co-located components (`components/` per feature), `.editorconfig` for editor consistency, and `src/typings.d.ts` for module declarations. **Component styles are co-located** — a component's CSS lives in the same directory as the component (e.g. `ChatWindow/ChatWindow.tsx` + `ChatWindow/ChatWindow.css`); `rsbuild.config.ts → buildChatCSS()` concatenates these per-component CSS files into the runtime-loaded `dist/cdn/styles/chat.css`.
>
> See also: [../../rules/architecture-direction.md](../../rules/architecture-direction.md)

## Project Profile

| Dimension | Value |
|-----------|-------|
| Project name | YiPet |
| Type | Frontend (Chrome MV3 extension) |
| Version | 1.2.0 |
| Architecture | Single repo, no workspace |
| Runtime | Chrome Extension Manifest V3 |
| Language | TypeScript 5.5 (strict mode) |
| Build tool | Rsbuild 1.0 (multi-entry: popup, chat, CDN utils, bootstrap) |
| UI framework | React 18.3 + Ant Design 5.21 |
| Linter / formatter | Biome 2.5 (replaces ESLint + Prettier) |
| Test framework | Vitest 2 + jsdom 29 |
| Self-hosted | Yes (API → `http://localhost:10086` / YiAi FastAPI backend) |

## Project Structure

```
src/
├── api/           # Four-tier API layer (client → endpoints → types → services)
├── background/    # Service worker — command dispatch + message routing
├── chat/           # Chat window (Rsbuild multi-entry build)
├── config/         # defaults.ts (data) + config.ts (env-aware orchestrator)
├── content/        # bootstrap, cdn catalog/injector, ipc, rendering, state
├── popup/          # React popup — App.tsx, components/, services/
├── shared/         # i18n, theme, roles, locale, timezone, datetime, env, log, state
├── types/          # React CDN globals + JSX namespace
└── utils/          # datetime, env, log helpers
```

## Module Boundaries

### API layer (four-tier)

| Tier | File | Public API |
|---|---|---|
| 1 — Client | `src/api/client.ts` | `ApiClient` class — wraps `public/cdn/utils/api-client.ts` (fetch + retry + error extraction) with dev-gated logger + SSE streaming. Other tiers must NOT call `fetch` directly. |
| 2 — Endpoints | `src/api/endpoints.ts` | Path constants by domain. |
| 3 — Types | `src/api/types.ts` | Request/response interfaces — single source of truth for all API shapes. Layer 4 + callers consume. |
| 4 — Services | `src/api/services/*.ts` | Domain service classes (`AuthService`, `ChatService`, `SessionService`, `ConfigService`, `DatabaseService`, `FaqService`). Each takes `ApiClient` via constructor injection. `createApiServices(config)` aggregates. |

### Cross-project protocol contract

| Operation | Request shape | Notes |
|---|---|---|
| RPC | `{ module_name, method_name, parameters }` | The envelope used by every data operation |
| `data_service.query_documents` | `{ cname, filter?: dict, pageNum?, pageSize?, limit? }` | **`filter`, not `query`** — backend silently ignores `query`. |
| `data_service.create_document` | `{ cname, data }` | |
| `data_service.update_document` | `{ cname, key, data }` | |
| `data_service.delete_document` | `{ cname, key }` | |
| Chat (SSE) | `{ model, messages, stream: true, system?, images? }` | Sent via `services.ai.chat_service.chat` |
| RAG query/chat | `{ question, scope? }` / `{ messages, scope? }` | YiAi `/rag` endpoints (available, not yet called by YiPet) |
| Knowledge scan/read | `{ path?, ... }` | YiAi `/knowledge` endpoints (available, not yet called by YiPet) |

### UI layer

| Module | Public API |
|---|---|
| `src/popup/` | `App.tsx` (root), `index.tsx` (mount), `data.ts` (config adaptor), `components/*` (one folder per UI component, co-located TSX + CSS) |
| `src/chat/` | `controller.ts` (state/streaming/actions via `useSyncExternalStore`), `components/*`, `types.ts` |
| `src/content/` | `bootstrap.ts` (dual-world entry), `cdn/catalog.ts` + `cdn/injector.ts`, `ipc/messages.ts`, `rendering/overlay.ts`, `state/` |
| `src/shared/` | `i18n/`, `theme/`, `roles.ts`, `locale/`, `timezone/`, `datetime/`, `env.ts`, `log.ts`, `state.ts` |
| `src/popup/services/` | `chrome.ts` (tabs/storage), `connect.ts` (content-script ping), `notify.ts` (toasts) |

## Data Flow

### Chat (streaming)

```
User types in chat box
   ▼
api.chat.stream({ user, system?, model?, images?, conversation_id? })
   ▼ fetch POST /  body: {module_name: "services.ai.chat_service",
                         method_name: "chat",
                         parameters: {model, messages, stream: true, system?, images?}}
                         signal: AbortController
   ▼
YiAi FastAPI → StreamingResponse(text/event-stream)
   yields: data: {"data": {"message": "..."}}\n\n
   ends:   data: {"done": true}\n\n
   ▼
ApiClient parses SSE → onChunk(text) / onDone() / onError(err)
   ▼
ChatController appends deltas → useSyncExternalStore → React re-render
   on abort: message flagged aborted=true and persisted
```

### Session persistence

```
ChatController on send/receive/edit/delete
   ▼ api.sessions.upsert({key, messages, ...})
   ▼ fetch POST /  body: {module_name: "services.database.data_service",
                         method_name: "update_document" | "create_document",
                         parameters: {cname: "sessions", key, data}}
   ▼ YiAi data_service → repository → MongoDB sessions collection
```

### Popup → content script → MAIN world

```
Popup (React) dispatches action
   ▼ chrome.tabs.sendMessage(tabId, {type: 'TOGGLE_PET', payload})
   ▼ Content Script (ISOLATED) receives via chrome.runtime.onMessage
   ▼ Forwards to MAIN world via CustomEvent
   ▼ Bootstrap (MAIN world) listens on window, mutates pet DOM
```

## Project Constraints

- **TypeScript strict mode** — `"strict": true` in `tsconfig.base.json`. `tsc --noEmit` must pass. Rsbuild/SWC strips types at build time but does not check them.
- **React 18 function components + hooks** — No class components, no `React.createElement` calls in user code (JSX handled by `@rsbuild/plugin-react`). Ant Design components via `antd` package; icons via `@ant-design/icons`.
- **Dual execution context** — `src/content/bootstrap.ts` first runs as a content script (ISOLATED world), then self-injects into the MAIN world. `chrome.runtime.getURL` is only available in ISOLATED.
- **Path alias `@/`** — `@/` maps to `src/` (configured in tsconfig, rsbuild, and vitest). Prefer `@/` for cross-module imports; use relative paths only for same-directory or sibling files. Example: `import { t } from '@/shared/i18n'` instead of `'../../../shared/i18n'`.
- **ES modules everywhere** — No IIFE, no global namespace. Imports are resolved by Rsbuild at build time. The directory structure IS the namespace.
- **CDN resources in `public/cdn/`** — Rsbuild copies `public/` → `dist/` as-is. All vendor libs are local (MV3 CSP compliant). The catalog in `src/content/cdn/catalog.ts` is the single source of truth.
- **i18n via `chrome.i18n`** — All user-facing strings use `t('key')` from `src/shared/i18n/index.ts`. Message files at `public/_locales/<lang>/messages.json`. `MessageKey` type union must stay in sync.
- **API layer in `src/api/`** — Four-tier: `client.ts` (fetch wrapper) → `endpoints.ts` (path constants) → `types.ts` (interfaces) → `services/*.ts` (domain classes). Service classes take `ApiClient` via constructor injection.
- **UTC-first datetime** — All timestamps stored in ISO 8601 UTC. Display conversion via `src/shared/datetime.ts` using `Intl.DateTimeFormat` with explicit timezone.
- **Build output in `dist/`** — Chrome loads from `dist/` directory. Run `npm run build` to produce a loadable extension (manifest copied automatically).

## Degradation Countermeasures

| Condition | Action |
|-----------|--------|
| YiAi backend unreachable | API client retries with exponential backoff, then surfaces a typed error to the caller |
| CDN resource already loaded | Global-existence check short-circuits re-injection |
| Chrome storage quota exceeded | State writes fail silently; logger emits warning in dev mode |
| Locale messages missing key | Fallback to `en` source locale, then to the key itself |
| TS strict-mode violation | `npm run typecheck` fails the build |
| Dev-mode React plugin + production `NODE_ENV` | Chat bundle dev script runs `--mode production` to avoid `jsxDEV is not a function` |

## Self-Constraints

- **API layer is four-tier.** No tier skips a level — services use client + endpoints + types; types never import services; client never imports services.
- **Co-located CSS.** A component's CSS lives in its component directory. `buildChatCSS()` concatenates per-component CSS into the runtime-loaded `dist/cdn/styles/chat.css`.
- **`filter` not `query`.** When calling `data_service.query_documents`, the Mongo-filter parameter is `filter`. The backend silently ignores `query`. This was a real bug — see Recent Changes.
- **MV3 CSP compliance.** No remote code, no `eval`, no inline scripts. All vendor libs under `public/cdn/vendor/` and loaded via `chrome-extension://` URLs.
- **Dual-world boundary.** `chrome.runtime.*` is only available in ISOLATED. Page-context globals only in MAIN. Don't try to use chrome APIs from MAIN world code.

## Recent Changes

### 2026-08-15 — Popup skin-center overhaul + pet overlay skin ring

Referencing deepseek-harness's "everything is a plugin / skin center / pet preview" aesthetic, the popup was rebuilt into a live skin center and the floating pet now wears the selected skin.

- **`src/popup/data.ts`**: `COLOR_OPTIONS` gains a `gradient` field per swatch (reusing `THEME_PALETTES[i].primaryGradient` / `NONE_PALETTE.primaryGradient`); new `ROLE_NAMES`, `roleImageUrl(role)` (chrome.runtime.getURL-resolved asset path), and `MODELS` (`qwen3.5` / `qwen3.5-think` / `qwen3-coder`). `DEFAULTS.MODEL` is now `'qwen3.5'` (was `null`); `PopupConfig.COLORS` is typed `ColorOption[]`.
- **`src/popup/types.ts`**: `PopupState.model` is `string` (was `string | null`).
- **`src/popup/components/AppHeader`**: gradient header with extension icon + title + subtitle + pulsing status pill (`visible` / `statusText` props).
- **`src/popup/components/PetPreview`** (new): live pet preview — role image inside a `--primary-gradient` ring, scaled by the size slider, with a float animation + `prefers-reduced-motion` guard.
- **`src/popup/components/ColorPicker`** (new): 6-swatch grid; selected swatch shows a check + ring highlight.
- **`src/popup/components/RolePicker`** (new): 2-column role cards with image + name, `--border-focus` highlight.
- **`src/popup/components/AppFooter`** + **`AboutCard`**: hint/version footer; About collapsed into an antd `Collapse` (prod/dev dep list removed).
- **`src/popup/App.tsx`**: integrates preview + pickers + model `Select`; new `updateModel` action persists directly to global state (no content-script action for model).
- **`src/content/rendering/overlay.ts`**: the floating pet now wears the active skin — `#yipet-overlay` gets a `--primary-gradient` ring + `--primary-rgb` glow (previously `padding:24px;border-radius:50%` with no background), the pet image is rounded + `draggable=false`, and the role name is surfaced as a native tooltip.
- **`src/chat/index.tsx` + `controller.ts` + `types.ts` + `ChatHeader` + `ChatWindow`**: the chat header now shows the active role's avatar (was a generic 💕). `ChatState` gains `roleName` / `roleImageUrl`; a new `setRole(name, imageUrl)` action is called at boot and on `yipet:roleChanged`, so the header avatar stays in lockstep with the overlay pet. `index.tsx` resolves the extension root (`EXT_ROOT`) and the role icon URL in the MAIN world (no `chrome.runtime.getURL` there).
- **`public/_locales/*/messages.json`** + **`src/shared/i18n/index.ts`**: added `popupSubtitle`, `popupPreviewTitle`, `popupModelLabel`, `notifyModelUpdated`.
- **`vitest.config.ts`**: dropped the unused `@vitejs/plugin-react` (v6 requires Vite 6, incompatible with Vitest 2's Vite 5) — tests are pure `.ts`, no JSX.
- **`tests/config/data.test.ts`**: `DEFAULTS.MODEL` assertion now expects `'qwen3.5'`; `COLORS` assertions use `toMatchObject` + a gradient-presence check.

Cross-project relevance: the popup is now a skin center — pick a role (persona system prompt), a color skin (full page-surface recolor via `applyThemeColors`), a model, and see the result live in the pet preview; the same skin ring renders on the floating pet on every host page. Mirrors the popup-preview ↔ on-page-pet loop that deepseek-harness's skin center establishes.

`npm run typecheck` ✓, `npm run build` ✓, `npm test` ✓ (97/97).

### 2026-08-05 — Auto-generated session title

- **`src/chat/controller.ts`**: new action `autoGenerateSessionTitle(opts?: { apply?: boolean; onResult?: (title: string) => void })` — takes the first 4 user messages (capped at 300 chars each), asks the LLM via `_chat.streamWithCallback` with a "title generator" system prompt + "4-6 word title, no quotes, no markdown, no trailing punctuation" user prompt. Strips residual quotes/punctuation from the LLM's response. Truncates to 80 chars. When `apply !== false` (default), persists the title via `_sessions.update` and updates `state.sessions[i].title` + `state.title`. Surfaces success/error notifications. When `onResult` is provided, fires with the generated title (used by SessionEditDialog to populate the input without saving — user can still edit before clicking Save).
- **`src/chat/components/SessionEditDialog/SessionEditDialog.tsx`**: new `ThunderboltOutlined` button as the `addonAfter` of the "Conversation title" `Input`. Loading state tracked by a local `titleLoading` useState. Calls `autoGenerateSessionTitle({ apply: false, onResult: (t) => setTitle(t) })` — so the title lands in the input for review; the existing Save button still has to persist it. Tooltip: "Auto-generate from messages".
- Cross-project relevance: YiPet sessions span across all projects (YiAi / YiVad / YiKnowledge / external pages). With auto-generated titles, the sidebar tree becomes recognizable — instead of "Current page title.md" for every session, the user sees "Branch · auth middleware refactor" or "Discuss YiVad bug 1234 root cause". Pairs with iter 11 (export) + iter 12 (branch) — the generated title makes exports and branches identifiable downstream. Also reduces cognitive load: the user no longer has to manually title every session they want to keep.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Session summary modal

- **`src/chat/types.ts`**: `ChatState` gained `sessionSummaryVisible`, `sessionSummaryLoading`, `sessionSummaryText`, `sessionSummaryError`.
- **`src/chat/controller.ts`**: new actions `summarizeCurrentSession()`, `closeSessionSummary()`, `copySessionSummary()`. `summarizeCurrentSession` builds a transcript from `state.messages` (per-message capped at 800 chars to keep the LLM payload sane), sends it through `_chat.streamWithCallback` with a "concise summarizer" system prompt and a "5-8 bullet points, focus on what was asked / decided / open questions" user prompt. The summary streams live into `sessionSummaryText` (token-by-token `_emit` so the modal updates in real time). On error, `sessionSummaryError` is populated and surfaced in an `Alert`. `copySessionSummary` uses `navigator.clipboard.writeText` + notifies on success/failure. The summary stays in the modal — does NOT append to the conversation thread, so the chat stays clean.
- **`src/chat/components/SessionSummaryDialog/`**: NEW — modal rendering the markdown summary via `renderMarkdown` + `dangerouslySetInnerHTML` (the source is the LLM, but `renderMarkdown` escapes untrusted input). Loading state shows a `Spin` with "Summarizing N messages — may take a few seconds" tip. Footer has Copy + Close buttons (Copy disabled while loading or when text is empty). Co-located CSS for bullet/list spacing + scroll container (max-height 60vh).
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**: modal mounted at root (always rendered, controller gates visibility).
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: new `ProfileOutlined` button next to "Export as markdown" (iter 11). Tooltip: "Summarize session". Disabled when no messages or while `isProcessing`.
- Cross-project relevance: at any point in a YiPet conversation about a project's page, the user can click "Summarize" to get a 5-8 bullet recap. Pairs with iter 11 (export as markdown — the summary is copyable, so the user can paste it elsewhere: a YiVad bug report's "Description" field, a YiKnowledge note's summary frontmatter, an external email). Pairs with iter 12 (branch from message — summary shows the user which message to branch from).
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Branch from message (fork a thread mid-conversation)

- **`src/chat/controller.ts`**: new action `branchFromMessage(timestamp)` — finds the message at the given timestamp, slices `messages[0..idx+1]` (deep-copied with `streaming: false`), creates a new session via `SessionService.create` with those messages (mapped to `{role, content, timestamp}` records) + `pageContent` carried over from the original + tags `[branch-of:<origId>, from:<url>, source:YiPet, project:<detected>]`. Title is `Branch · <origTitle>` (truncated to 80). Pushes the new session into `state.sessions`, switches `currentSessionId`, sets `state.messages` to the sliced branch, sets `viewState='messages'`. Notifies "Branched N messages into new session" on success.
- **`src/chat/components/MessageBubble/MessageBubble.tsx`**: new `BranchesOutlined` action button added to BOTH the pet-message and user-message action rows (any message is branchable — fork from the user's question or from the pet's response). Disabled while `isProcessing`. Tooltip: "Branch from here — new session with messages up to this point".
- Cross-project relevance: when a user is exploring an idea across projects (YiAi docs / YiVad admin / YiKnowledge / external) and the YiPet thread has diverged — say the first 5 messages were about Topic A, then it pivoted to Topic B — branching from message 5 lets them fork off a clean Topic-A thread without losing the Topic-B continuation. The branch's tags include `branch-of:<origId>` so the lineage is traceable. Pairs with iter 11 (export as markdown): branch when the conversation needs to diverge, export when it needs to land somewhere outside YiPet.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Export session as markdown

- **`src/chat/controller.ts`**: new action `exportCurrentSessionMarkdown()` — formats the current session's messages as a markdown document with frontmatter-style header (`# <title>`, exported-at timestamp, source URL, tags, created-at), then `---` separator, then per-message `## 🧑 User · <ts>` / `## 🐾 Pet · <ts>` sections with the raw content. Error/aborted messages get an italicised warning line. Triggers a download via `Blob` + `URL.createObjectURL` + a temporary `<a download>` element. Filename is the slugified session title truncated to 50 chars + `.md`. Notifies "Exported N messages as markdown" on success, or "Nothing to export" if the session is empty.
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: new `DownloadOutlined` button next to "Edit session" in the toolbar. Disabled when there are no messages. Tooltip: "Export session as markdown".
- Cross-project relevance: a YiPet conversation about any project's page can be captured as a portable markdown file — paste into YiKnowledge (knowledge base), into a YiVad doc / bug report / story, or into external notes. Pairs with iter 10 (per-message YiVad bridge): per-message = send one thread to YiVad, export = capture whole thread anywhere. Together they make YiPet a producer of cross-project artefacts, not just a consumer.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Per-message "Open in YiVad aiChat" bridge

- **`src/chat/controller.ts`**: new action `openMessageInYiVad(timestamp)` — finds the message at the given timestamp, then seeds a new YiVad aiChat session via `SessionService.create` and `window.open`s `http://localhost:8848/#/aiChat?session=<key>`. For pet responses, includes the preceding user question as the first user message + a second "Continue from this assistant response:\n\n<response>" user message, so YiVad's chat starts with full context (the user can immediately send a follow-up that builds on the pet's answer). For user messages, just seeds with that single message. Session title is `YiPet → <first 60 chars of message>`. Tags include `via:per-message-bridge` so the source is traceable.
- **`src/chat/components/MessageBubble/MessageBubble.tsx`**: new `ExportOutlined` action button in the pet-message action row (next to Save to YiKnowledge). Disabled while streaming/processing or when the message has no content. Tooltip: "Open in YiVad aiChat".
- Cross-project relevance: the existing toolbar-level `discussInYiVadAiChat()` seeds a session with page context (what's on the user's current page). This new per-message version seeds with what's in a *specific pet response* — useful when the user reads a pet answer and wants to go deeper in YiVad's richer UI (tool calls, file picker, longer context window). Together: toolbar = "discuss this page", per-message = "discuss this answer". One click on any pet response opens YiVad with the conversation already staged.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Tool-call timeline (3-segment phase indicator)

- **`src/chat/types.ts`**: `ChatState` gained `streamingPhase: '' | 'thinking' | 'retrieving' | 'streaming'`.
- **`src/chat/controller.ts`**: `_runStream` now sets `streamingPhase` — `'retrieving'` if `knowledgeGrounded` is on (waiting for RAG retrieval + sources), `'thinking'` otherwise (waiting for the LLM's first token). On the first `onToken` callback, a `phaseFlipped` latch transitions it to `'streaming'`. Cleared in `finally` and in `stopSending` alongside `streamingType`.
- **`src/chat/components/SessionStatusBar/SessionStatusBar.tsx`**: the existing phase pill (send/regenerate/resend) now also renders a 3-segment mini-timeline `<span className="yp-ssb-timeline">` — three 14×4px bars (thinking | retrieving | streaming). The active segment lights up `currentColor` + a 4px box-shadow glow; the others stay dim grey. Tooltip on the pill now also surfaces the sub-phase: `Phase: send · streaming`.
- **`src/chat/components/SessionStatusBar/SessionStatusBar.css`**: `.yp-ssb-timeline` (inline-flex, 2px gap) + `.yp-ssb-tl-seg` (14×4, 2px radius, dim default) + `.yp-ssb-tl-seg.is-active` (currentColor + glow). `currentColor` lets the segments inherit the pill's phase colour (indigo for send, violet for regenerate, sky for resend).
- Cross-project relevance: Pi-inspired, simplified. YiVad aiChat's `ToolCallTimeline.vue` is a much larger surface surfacing individual tool calls + their args + their results. YiPet doesn't have MCP/tool-calls yet, so the timeline here surfaces the *streaming* phase granularly instead — useful when the user is waiting on a grounded ask (the "retrieving" segment lights up while the RAG backend scans the knowledge base, then hands off to "streaming" once tokens start flowing). At a glance the user knows whether the wait is on retrieval or on the LLM — important diagnostic when chatting about any project's page with knowledge grounding on.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Sparkline hover → scroll to message bubble

- **`src/chat/components/SessionStatusBar/SessionStatusBar.tsx`**: the cost sparkline is now interactive. The `stats` useMemo now returns `points[]` (per-message {x, y} coordinates on the 56×12 viewBox) and `bandW` (per-message hover-band width). Over the existing SVG path, renders N invisible `<rect>` bands — each covers a vertical slice of the sparkline. `onMouseEnter` and `onClick` on a band call `scrollToMessageByCostIdx(i)`, which queries `#yipet-chat-messages [data-chat-idx="i"]` and calls `scrollIntoView({ behavior: 'smooth', block: 'center' })`. Each band also exposes a `<title>` tooltip: `Msg N · $X.XXXX`.
- Relies on the pre-existing `data-chat-idx={index}` attribute on each `MessageBubble` — no MessageBubble changes needed.
- Cross-project relevance: ties together iter 5 (cost sparkline) and iter 4 (per-message token chip). While chatting about any project's page (YiAi / YiVad / YiKnowledge / external), the user can hover the sparkline to scan the cost trajectory and jump to any message — useful when a long grounded session has 20+ messages and the user wants to find the one that cost the most, or scroll back to compare an earlier answer with the current one.
- Pi-inspired: the sparkline is no longer just a static indicator; it's a navigation surface. YiVad aiChat has a similar `scrollToMessageByTs` pattern keyed by timestamp; here we key by message index since cost history is built in messages-array order.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Top-edge drag-resize handle on chat window

- **`src/chat/controller.ts`**: `_resizeStart` gained a `wy` (window Y origin) field. `_onResizeMove` now handles `'n'` direction — when dragging the top edge down, height shrinks and `y` follows (clamped so the window never grows past `MIN_HEIGHT` or flies off the top of the viewport). Mirrors the existing `'w'` (left-edge) branch: width/height changes are coupled with `x`/`y` so the opposite edge stays anchored.
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**: rendered a new `.yipet-resize-n` strip at the top edge of the window (alongside the existing SE/SW corner handles), wired to `onResizeMouseDown('n', …)`. Hidden when fullscreen (same conditional as the corner handles).
- **`src/chat/components/ChatWindow/ChatWindow.css`**: `.yipet-resize-n` — full-width strip (8px insets on each side to avoid clashing with the rounded corner), 4px tall, `cursor: ns-resize`, `z-index: 11` so it sits above the header (the header drag-to-move still works below it). Hover and `.resizing` states paint it primary-color-tinted like the corner handles.
- Cross-project relevance: the chat window sits on top of any project page. With only SE/SW corner handles, the user had to grab a bottom corner to resize — which meant the chat always grew downward, covering more of the underlying project page. With a top edge, the user can push the chat down to the bottom of the viewport while growing it taller — keeping the upper portion of any project page visible (e.g. a YiVad admin header, a YiAi doc title, a YiKnowledge tree). YiVad aiChat has top + left + right edge handles; this iteration adds the top edge (the most useful one for our floating window). Left/right edges can be added later if needed.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Drag-and-drop knowledge file → session

- **`src/chat/controller.ts`**: new action `createSessionFromKnowledgeFile(path)` — reads the file body via `KnowledgeService.read`, uses a synthetic URL `yipet://knowledge/<path>` for session dedup (re-dropping reopens the same thread instead of stacking duplicates, mirroring YiVad's `ensureKnowledgeSession` pattern). If a session with that synthetic URL exists, refreshes its `pageContent` from the file (so the thread always reflects the latest file body) and re-selects it; otherwise creates a new session doc via `SessionService.create` with tags `['source:YiKnowledge', 'from:<href>']`. Inlines `selectSession`'s message-load logic, then calls `setRagScopeFromNode(path, true)` + auto-enables knowledge grounding if not already on, so the very first ask draws on the file's body via per-file RAG.
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**: `renderKnowledgeTitle` now makes leaf nodes `draggable={true}` with `onDragStart` setting `e.dataTransfer.setData('application/x-yipet-knowledge-file', path)` + `effectAllowed = 'link'`. Tooltip updated to mention drag-to-chat.
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**: the `.yipet-chat-main` Layout is now a drop target — `onDragEnter`/`onDragOver`/`onDragLeave`/`onDrop` handlers gated on the custom MIME type. A `useRef<number>(0)` counter + `useState<boolean>` flag drives a `.yipet-chat-drop-overlay` rendered when the user is dragging a knowledge file over the chat area. On drop, parses the path and calls `ctrl.createSessionFromKnowledgeFile(path)`.
- **`src/chat/components/ChatWindow/ChatWindow.css`**: added `.yipet-chat-drop-overlay` (absolute inset-0, dashed primary-color border, 12% primary tint) + `.yipet-chat-drop-overlay-inner` (centered card with `FileTextOutlined` + caption). `pointer-events: none` so the overlay doesn't swallow the drop event itself.
- Cross-project relevance: while the user is on any page (YiAi / YiVad / YiKnowledge / external), they can drag a knowledge file from the sidebar directly into the chat area to seed a thread — the file's body becomes the session's `pageContent` AND the per-file RAG scope, so subsequent asks are grounded in that file. Pairs with the existing `@`-mention file dropdown: `@` for keyboard-driven scoping, drag-and-drop for mouse-driven session seeding.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Compact cost sparkline in SessionStatusBar

- **`src/chat/components/SessionStatusBar/SessionStatusBar.tsx`**: extended the existing `stats` useMemo to track a cumulative `costHistory[]` (per-message $ spend at chars/4 token estimate × `INPUT_RATE_PER_1K = $0.0005` / `OUTPUT_RATE_PER_1K = $0.0015`), compute `sparkPath` (SVG `M..L..` string, 56×12 viewBox), and surface `estimatedCost`. Renders a new chip between the token chip and the Ctx/RAG indicators: a small SVG sparkline + `$X.XXXX` label, wrapped in antd `Tooltip` showing the per-role breakdown + trajectory min/max/latest.
- **`src/chat/components/SessionStatusBar/SessionStatusBar.css`**: added `.yp-ssb-cost` (amber, tabular-nums) + `.yp-ssb-cost-spark` styles. Sparkline only renders when ≥2 messages (no trajectory to draw otherwise).
- Pi-inspired but compact: no reference lines / projections / p90 / stuck markers (YiVad's `SessionStatusBar.vue` is 2200 lines — this is a fraction of the surface). Pairs naturally with the per-message token chip in `MessageBubble` (iter 4) — the user sees per-msg cost via color-coded chips and cumulative trajectory via the sparkline.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Per-message token chip in MessageBubble

- **`src/chat/components/MessageBubble/MessageBubble.tsx`**: added a token chip next to the timestamp in `mb-meta`. Shows `~Nt` (coarse chars/4 estimate, same heuristic as `SessionStatusBar`). Color-coded: user messages = input (info blue), pet messages = output (success green). Tooltip breaks down input/output role + raw chars.
- **`src/chat/components/MessageBubble/MessageBubble.css`**: added `.mb-token-chip` + `--in` / `--out` variants — small pill (10px, 0 5px padding, 8px radius), tabular-nums, 70% opacity (matches the existing `mb-meta` dim styling so it doesn't dominate).
- Pi-inspired: input vs output economics surfaced at the message level — the user sees per-message token cost without opening a tooltip, with role color parity to the SessionStatusBar's stacked-bar.
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — Sidebar drag-resize handle wired

- **`src/chat/components/ChatWindow/ChatWindow.tsx`**: inserted a `<div className="yipet-sidebar-resizer">` between `<Sider>` and `<Layout className="yipet-chat-main">`. Wires `onMouseDown` to the controller's pre-existing `onSidebarResizeMouseDown` handler (which was already implemented in `controller.ts:2227-2252` with `MIN`/`MAX` clamp + persistence to `chrome.storage.local` under `sidebarWidth`, but had no UI).
- **`src/chat/components/ChatWindow/ChatWindow.css`**: added `.yipet-sidebar-resizer` — 4px-wide vertical separator with `cursor: col-resize`, transparent by default, primary-color highlight on hover or while `#yipet-chat-window.resizing` is set. `flex-shrink: 0` so the Layout flex container keeps the resizer as a sibling of the Sider/main Layout.
- Hidden when `sidebarCollapsed` is true (the resizer lives inside the same conditional block as the `Sider`).
- `npm run typecheck` ✓, `npm run build` ✓.

### 2026-08-05 — ContextScopeBar (active-context chips)

- **`src/chat/components/ContextScopeBar/`**: NEW — compact strip at the top of the chat area showing the active context that will ship with the next send. Mirrors YiVad aiChat's `ContextFilesPanel.vue` at a fraction of the surface — YiPet's floating window has no room for a separate context column, so context surfaces as chips.
- Chips:
  - **RAG scope** — file or folder path. File scope opens `KnowledgePreviewDialog` on click; folder scope is view-only (navigates to the sidebar Knowledge tab via existing flow). X clears scope via existing `clearRagScope()`.
  - **Page context** — enabled when `contextEnabled` AND the active session has `pageContent` (or `contextEditorDraft`). Click opens `PageContextEditor`; X disables page context via `toggleContext()` (keeps the saved content so re-toggle restores without re-typing).
- Cross-project relevance: while chatting about any project's page, the user sees at a glance what beyond the typed prompt is being sent to the LLM — and can mute either source with one click.
- Wired above `ChatMessages` in `ChatWindow.tsx`; added to barrel + `rsbuild.config.ts` `buildChatCSS` file list.
- `npm run typecheck` ✓, `npm run build` ✓ (chat.css contains `yp-csb-*` rules).

### 2026-08-05 — SessionStatusBar (Pi-inspired compact)

- **`src/chat/components/SessionStatusBar/`**: NEW — compact bar mirroring YiVad aiChat's `SessionStatusBar.vue` at a fraction of the surface. Renders between `ChatMessages` and `ChatInput` in `ChatWindow.tsx`.
- Shows: model (`DEFAULT_MODEL` = `qwen3.5`), message count (`user/pet`), ~token estimate (chars/4 vs 8192 context window) with low/mid/high color levels + tooltip breaking down input vs output tok + page-context tok, context-on / RAG-on indicator pills, and a streaming phase pill (`send` / `regenerate` / `resend` with distinct colors).
- Cross-project relevance: while chatting about any project's page (YiAi, YiVad, YiKnowledge, external), the user sees at a glance how much of the 8K context window is consumed — the budget pressure that matters most when page content is also shipped as context.
- Wired into `src/chat/components/index.ts` barrel + `rsbuild.config.ts` `buildChatCSS` file list (so co-located CSS lands in `dist/cdn/styles/chat.css`).
- Also fixed pre-existing `sessionProjectFilter` missing init in `controller.ts` `createInitialState` (TS2741 surfaced when typecheck ran).
- `npm run typecheck` ✓. `npm run build` ✓ (chat.css contains `yp-ssb-*` rules).

### 2026-08-05 — @-mention file dropdown in chat input

- **`src/chat/controller.ts`**: new `knowledgeFileMatches(query, limit = 8)` helper — walks `state.knowledgeTree`, returns file nodes (type === 'file') whose `path` or `name` contains the query (case-insensitive). Capped at `limit`.
- **`src/chat/components/FileMentionDropdown/`**: new component — renders a dropdown above the textarea when the user types `@` in the input. Each row shows the file's full path (mono, ellipsised). Empty state shows "No files match `<query>`" or "No knowledge files" (when the tree hasn't been loaded yet).
- **`src/chat/components/ChatInput/ChatInput.tsx`**: `useMemo` tracks `mentionVisible` / `mentionQuery` / `mentionAtIdx` based on `inputValue` + textarea caret. The `@` must be at start-of-input or preceded by whitespace, and no spaces allowed inside the @query (one token). When a file is picked: strips the `@query` substring from the input, calls `setRagScopeFromNode(path, true)`, and auto-enables knowledge grounding if not already on. Keyboard: when mention is visible, `Esc` strips the `@query` and closes; `Enter` picks the first match (or falls through to send when there are no matches); `ArrowUp`/`ArrowDown` are swallowed so they don't trigger prompt history recall.
- **`src/chat/components/index.ts`**: `FileMentionDropdown` exported.
- Mirrors YiVad's `FileMentionDropdown.vue`. Faster than opening the sidebar Knowledge tab and clicking a node — type `@`, see live matches, pick, RAG is scoped.

### 2026-08-05 — Prompt history popover in toolbar

- **`src/chat/types.ts`**: `ChatState` gained `promptHistoryVisible: boolean`.
- **`src/chat/controller.ts`**: new actions `openPromptHistory()` / `closePromptHistory()` / `invokePromptHistory(idx)` (pushes the prompt to `inputTemplate` + auto-opens chat if closed — does NOT auto-send, so the user can edit) / `removePromptHistoryAt(idx)`.
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: new `HistoryOutlined` button (next to FAQ) wrapped in an antd `Popover`. Content: most-recent-first list of `state.promptHistory`; each row click → `invokePromptHistory`; per-row delete button (stops propagation); footer "Clear all" button. Tooltip: "Prompt history (ArrowUp to recall in input)".
- Complements the ArrowUp/ArrowDown recall from the previous iteration — now the user can both navigate inline and pick visually from the popover.

### 2026-08-05 — Prompt history navigation (ArrowUp/ArrowDown recall)

- **`src/chat/types.ts`**: `ChatState` gained `promptHistory: string[]` (most recent last).
- **`src/chat/controller.ts`**: new actions `pushPromptHistory(text)` (dedupes consecutive duplicates, caps at 100, persists to chrome.storage.local under `promptHistory`), `recallPromptHistory(delta, currentIdx)` (returns `{ idx, text }` or `null`; delta -1 = older, +1 = newer; `idx === -1` signals "exit navigation, restore pre-history input"), and `clearPromptHistory()`. `sendMessage` pushes the trimmed text to history before streaming. `_loadPersistedState` now also pulls `promptHistory` from chrome.storage.local (filters non-strings, caps at 100).
- **`src/chat/components/ChatInput/ChatInput.tsx`**: tracks `historyIdxRef` (-1 = not navigating) + `preHistoryInputRef` (the user's pre-recall input, restored on ArrowDown past most-recent). On ArrowUp at caret 0 or empty input → recall older prompt and set input. On ArrowDown at caret end while navigating → recall newer (or restore pre-history input when idx reaches -1). Enter send + Escape reset `historyIdxRef` to -1.
- Mirrors YiVad's `usePromptHistory` Pi-inspired shell recall. Persisted via chrome.storage.local so the history survives across sessions and is shared across all host pages (extension storage, not per-origin localStorage).

### 2026-08-05 — Page-aware context chip (YiVad detail pages)

- **`src/api/services/bug.ts`**: new `detectPageTypeFromUrl(url)` helper — returns `{ kind, key? }` where `kind` is one of `yivad-bug-detail` / `yivad-brd-detail` / `yivad-story-detail` / `yivad-aichat` / `unknown`. `key` is the entity key extracted from the URL path (decoded).
- **`src/chat/controller.ts`**: new getter `pageContextChip` — based on the detected page type, returns `{ label, prompt, bugKey? }` (or `null`). For bug-detail pages, the chip label is `Discuss bug <key…>`, prompt asks for root cause + impact + fix plan, and `bugKey` is set. For BRD detail pages, label `Summarize BRD <key…>` + summary prompt. For story detail pages, label `Walk me through <key…>` + onboarding walkthrough prompt. New action `applyPageContextChip()` pushes the prompt to `state.inputTemplate`; for bug-detail chips, also scopes RAG to `lessons/failures/bugs/<key>.md` and auto-enables knowledge grounding so the answer draws on the bug's markdown body.
- **`src/chat/components/QuickButtons/QuickButtons.tsx`**: when `pageContextChip` is non-null, a green `success` chip renders at the front of the row with the chip's label. Click → `applyPageContextChip()`. Disabled while processing.
- Cross-project: YiPet detects which YiVad detail page the user is on and offers a one-click contextual prompt — no need to type or remember bug keys / BRD ids. Together with the existing `discussBugInChat` (sidebar Bugs tab) and `discussInYiVadAiChat` (toolbar), this means YiPet adapts its UI to whichever project page the user is currently visiting.

### 2026-08-05 — "Insert selection as prompt" toolbar button

- **`src/chat/controller.ts`**: new `insertSelectionAsInput()` action — reads `window.getSelection()?.toString()`, notifies "Select some text on the page first" if empty, otherwise auto-opens the chat (if closed) and pushes the selection into `state.inputTemplate` so the existing `ChatInput` template-sync mechanism picks it up.
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: `HighlightOutlined` button next to the cross-project dropdown — calls the new action. Tooltip: "Insert selection as prompt".
- Cross-project: works on any page in any project — the user selects text anywhere (YiAi docs, YiVad admin, YiKnowledge markdown, external sites), clicks the button (or it auto-opens), and the selection lands in the chat input ready to send.

### 2026-08-05 — Page-aware session filter (cross-project memory)

- **`src/chat/types.ts`**: `ChatState` gained `sessionSiteFilter: string`. When non-empty, `filteredSessions` only includes sessions whose URL's site key (hostname + pathname + hash-path, no query) matches.
- **`src/chat/controller.ts`**: new static helper `ChatController.siteKeyFromUrl(url)` (lowercased hostname + pathname + hash-path, query stripped). New actions: `filterSessionsByCurrentPage()` (toggle — if not already filtered, sets `sessionSiteFilter` to the current page's site key; if already filtered, clears) and `clearSessionSiteFilter()`. `filteredSessions` getter now applies the site filter before the existing search query.
- **`src/chat/components/SearchBar/SearchBar.tsx`**: new `EnvironmentOutlined` button next to the batch-mode button. Renders as `type="primary"` when the filter is active (so the user can see it's on). Tooltip: "Filter by current page" / "Filtering by this page — click to clear".
- Together with the existing "Discuss this page in YiVad aiChat" bridge, this lets YiPet remember per-page conversations: visit a page → click the filter → see every conversation you've ever had about this exact page (across YiAi, YiVad, YiPet, or any external site). Toggle off to see all sessions again.

### 2026-08-05 — Cross-project navigation dropdown in toolbar

- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: replaced the single `GlobalOutlined` button with a `Dropdown` menu (click-trigger, bottom-left placement). Items:
  - "Discuss this page in YiVad aiChat" (top, calls the existing `controller.discussInYiVadAiChat()` action that seeds a YiVad session with page context).
  - Divider.
  - "YiAi backend (port 10086)" → `http://localhost:10086`.
  - "YiVad admin" → `http://localhost:8848`.
  - "YiVad aiChat" → `http://localhost:8848/#/aiChat/index`.
  - "YiVad code-review / bugs" → `http://localhost:8848/#/code-review/bugs`.
  - "YiVad BRD" → `http://localhost:8848/#/brd`.
  - "YiVad Story Board" → `http://localhost:8848/#/story`.
- All external links open via `window.open(url, '_blank', 'noopener,noreferrer')`.
- Together with the existing bug-report + recent-bugs + discuss-bug + discuss-page bridges, this makes YiPet's toolbar the cross-project hub: any tab open in any project, YiPet sits on top and one click navigates anywhere.

### 2026-08-05 — Cross-project bridge to YiVad aiChat

- **`src/chat/controller.ts`**: new `discussInYiVadAiChat()` action — captures `state.pageInfo` (URL + title) + `state.contextEditorDraft` (or `document.body.innerText` sliced to 8000 chars) as page context, creates a `sessions` doc via `SessionService.create` with a first user message (`Page: <title>\nURL: <url>\n\n<content>`) + tags (`from:<url>`, `source:YiPet`, `project:<detected>`), then `window.open`s `http://localhost:8848/#/aiChat?session=<key>`. YiVad's `aiChat/index.vue` onMounted reads `?session=<key>` and selects the seeded conversation, so the user lands in YiVad aiChat with the page context already staged.
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: `GlobalOutlined` button next to the bug-report button — opens the bridge.
- Together with the BugReportDialog (logger) + Recent Bugs tab (viewer) + discussBugInChat (chat seed), this makes YiPet a true cross-project hub: capture any page → seed a bug or a chat → navigate to YiVad for detail / further work.

### 2026-08-05 — Recent Bugs tab in sidebar (cross-project bug hub)

- **`src/chat/types.ts`**: `ChatState.sidebarView` widened to `'sessions' | 'knowledge' | 'stories' | 'bugs'`; added `recentBugs: BugDocument[]`, `recentBugsLoading`, `recentBugsError`.
- **`src/chat/controller.ts`**: new actions `loadRecentBugs(params?)` (calls `BugService.listBugs` — pageSize 30, newest first), `openBugInYiVad(key)` (deep-links `http://localhost:8848/#/code-review/bugs/detail/<key>?mode=view` in a new tab), `discussBugInChat(bug)` (seeds the chat input with the bug's title + key + a "help me understand" prompt, scopes RAG to the bug's `contentPath` if known, and auto-enables knowledge grounding). `setSidebarView('bugs')` triggers `loadRecentBugs` on first visit.
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**: fourth tab "Bugs" — renders a `List` of `recentBugs`. Each row shows the bug title (ellipsis) + a red severity `Tag` + the project `Tag` + module; row click opens the bug detail in YiVad; an inline "Discuss" button stops propagation and calls `discussBugInChat`.
- Closes the loop with the 2026-08-05 BugReportDialog iteration: log a bug from any page → it shows up in the Bugs tab → click to open the detail in YiVad, or click "Discuss" to seed the chat input + RAG scope from the bug's `contentPath`. YiPet becomes the cross-project bug hub.

### 2026-08-05 — Cross-project bug reporting (YiPet as bug collector)

- **`src/api/types.ts`**: added `BugSeverity` / `BugPriority` / `BugStatus` / `BugType` / `BugFrequency` unions + `BugDocument` + `BugContent` interfaces. `BugDocument` mirrors YiVad's `/bug` MongoDB schema (`key`, `project`, `module`, `severity`, `priority`, `status`, `type`, `frequency`, `assignee`, `reporter`, `environment`, `affectedVersion`, `fixedVersion`, `tags`, `contentPath`, timestamps).
- **`src/api/services/bug.ts`** (new): `BugService.createBug(meta, content)` writes the long-form body to `~/YiKnowledge/lessons/failures/bugs/<key>.md` via `knowledge_service.write_entry_markdown` first, then creates the metadata doc in MongoDB `bugs` via `data_service.create_document`. `listBugs(params)` queries via `data_service.query_documents` with title/module regex + project/severity/priority/status/type filters. Helpers: `makeBugKey(title)` (slug + base36 timestamp), `detectProjectFromUrl(url)` (8848→YiVad, 10086→YiAi, YiKnowledge/YiPet/unknown), `bugToday()`.
- **`src/api/services/index.ts` + `src/api/index.ts`**: `BugService` added to `ApiServices` interface + `createApiServices` factory + type barrel.
- **`src/chat/types.ts`**: `ChatState` gained `bugReportVisible`, `bugReportLoading`, `bugReportDraft` (title/project/module/severity/priority/status/type/frequency/assignee/reporter/environment/affectedVersion/fixedVersion/tags/description/stepsToReproduce/expectedResult/actualResult — tags + steps as plain strings, split at submit time).
- **`src/chat/controller.ts`**: constructor now takes `bug: BugService`. New actions: `openBugReport()` (auto-fills `project` via `detectProjectFromUrl(state.pageInfo.url)` + `environment` from the URL), `closeBugReport()`, `setBugReportDraft(patch)`, `confirmBugReport()` (splits tags by comma, steps by newline, generates key, calls `bug.createBug`, surfaces notification).
- **`src/chat/components/BugReportDialog/`**: Form modal with antd `Select` for severity / priority / status / type / frequency / project, free-text for title/module/assignee/reporter/affectedVersion/fixedVersion/environment/tags, and `Input.TextArea` for description / steps / expected / actual. Two-column row layout for compact groups.
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: `BugOutlined` button always visible in the toolbar, opens the modal.
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**: dialog mounted at root.
- Closes the loop: spot a bug on any page → log it from YiPet → metadata in MongoDB, long-form body in YiKnowledge/lessons/failures/bugs → shows up in YiVad's `/bug` list view.

### 2026-08-05 — Stories tab in sidebar (project onboarding stories)

- **`src/chat/types.ts`**: `ChatState.sidebarView` widened to `'sessions' | 'knowledge' | 'stories'`; added `knowledgeStories: KnowledgeStory[]`, `knowledgeStoriesLoading`, `knowledgeStoriesError`.
- **`src/chat/controller.ts`**: new actions `loadKnowledgeStories(project?)` (calls `KnowledgeService.listStories` via `listStoriesAsItems`) and `openKnowledgeStory(project, storyName)` (calls `KnowledgeService.readStory`, populates the existing `knowledgePreviewData` so the existing `KnowledgePreviewDialog` renders the story markdown + frontmatter strip). `setSidebarView('stories')` triggers a load on first visit.
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**: third tab "Stories" — renders a `List` of projects with `ProjectOutlined` avatar; click opens the story preview modal. Mirrors YiVad's Story Board (`src/views/story/index.vue`) but in the chat sidebar.
- Reuses the existing `KnowledgePreviewDialog` — no new modal component needed.

### 2026-08-05 — Sub-question decomposition (rag.decompose)

- **`src/api/endpoints.ts`**: added `RAG.DECOMPOSE = '/rag-decompose'`.
- **`src/api/types.ts`**: added `RagSubQuestion { sub_q, answer, sources }` and `RagDecomposeResponse { original, synthesis, sub_questions, error? }`.
- **`src/api/services/rag.ts`**: new `decompose(params)` method — synchronous (non-streaming); the backend's SubQuestionQueryEngine composes multiple LLM calls internally.
- **`src/chat/types.ts`**: `ChatState` gained `ragDecomposeVisible`, `ragDecomposeLoading`, `ragDecomposeData: RagDecomposeResponse | null`, `ragDecomposeQuestion`.
- **`src/chat/controller.ts`**: new actions `decomposeRagQuestion(question)` (passes `scope` + `category`) and `closeRagDecompose()`.
- **`src/chat/components/RagDecomposeDialog/`**: modal showing each sub-question's text + synthesized answer (markdown) + sources list, followed by the final synthesis block and an optional error banner. Loading spinner with "may take a while" tip.
- **`src/chat/components/ChatInput/ChatInput.tsx`**: a "Decompose" button (`PartitionOutlined`) appears next to "Preview sources" when `knowledgeGrounded` is ON. Both buttons disable while either is loading.
- Completes a triad: pre-flight (sources only, no LLM) → decompose (sub-questions + per-sub answers + synthesis) → grounded chat (full streaming answer).

### 2026-08-05 — Category filter dropdown (knowledge tree + RAG queries)

- **`src/chat/types.ts`**: `ChatState` gained `ragCategories: RagCategoriesResponse | null`, `ragCategoriesLoading: boolean`, `knowledgeCategoryFilter: string`.
- **`src/chat/controller.ts`**:
  - New `loadRagCategories()` action — calls `RagService.categories()` and stores `{categories: [{name, file_count}], tags, total_files}`.
  - New `setKnowledgeCategoryFilter(category)` — writes the filter, then reloads `knowledgeTree` scoped to that category via `KnowledgeService.scan(category)`.
  - `loadKnowledgeTree(category?)` now defaults to the current filter when no arg passed.
  - `setSidebarView('knowledge')` triggers both `loadKnowledgeTree()` and `loadRagCategories()` on first visit.
  - `_runStream` grounded branch passes `category` to `RagService.streamChat` (when not file-scoped). `previewRagSources` passes `category` to `RagService.query`. Per-file chat / file query are inherently category-scoped (one file) — no `category` passed.
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**: a `Select` sits under the scope pill in the knowledge tab — options are "All categories" + each `{name} ({file_count})`. Selecting a value calls `setKnowledgeCategoryFilter`, which both narrows the visible tree and applies to subsequent RAG queries.

### 2026-08-05 — RAG pre-flight source preview

- **`src/chat/types.ts`**: `ChatState` gained `ragPreviewSources: RagSource[]`, `ragPreviewLoading`, `ragPreviewVisible`, `ragPreviewQuestion`.
- **`src/chat/controller.ts`**: new async action `previewRagSources(question)` — runs a one-shot retrieval (no LLM call) and stores the sources. Routes by `ragScopeIsFile`: leaf scope → `RagService.fileQuery({target_file, question})`; folder scope → `RagService.query({question, scope})`. `closeRagPreview()` clears state.
- **`src/chat/components/RagSourcesPreviewDialog/`**: modal listing each source's path (mono, ellipsised) + numeric score + 3-line snippet (clamped). Header shows the question + current scope.
- **`src/chat/components/ChatInput/ChatInput.tsx`**: when `knowledgeGrounded` is ON, a "Preview sources" button (with `FileSearchOutlined`) appears in the input meta row — passes the current `inputValue` to `previewRagSources`. Disabled while processing, loading, or empty input.
- **`src/chat/components/ChatInput/ChatInput.css`**: `.yipet-chat-preview-btn` styled as a small pill button.
- Closes the loop: type a question → preview sources → refine → send grounded answer.

### 2026-08-05 — Save to YiKnowledge (chat → knowledge producer)

- **`src/chat/types.ts`**: `ChatState` gained `saveToKnowledgeVisible`, `saveToKnowledgeDraftPath`, `saveToKnowledgeDraftMetadata {title, category, tags, type}`, `saveToKnowledgeLoading`, `saveToKnowledgeTimestamp`.
- **`src/chat/controller.ts`**: new actions `openSaveToKnowledge(timestamp)` (pre-populates a target path `notes/<today>/<slug>.md` + a slug derived from the message content), `closeSaveToKnowledge()`, `setSaveToKnowledgeDraft(patch)` (path / title / category / tags / type), and `confirmSaveToKnowledge()` (calls `KnowledgeService.write` with metadata → `title` / `category` / `type` / `tags[]` / `created` / `source_scope` if scoped; auto-refreshes the knowledge tree on success).
- **`src/chat/components/SaveToKnowledgeDialog/`**: new modal with Form fields for path, title, category, type, tags. Loading spinner during save.
- **`src/chat/components/MessageBubble/MessageBubble.tsx`**: new `SaveOutlined` action button on pet messages (disabled while streaming or empty content).
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**: modal mounted at root.

### 2026-08-05 — RAG status badge in toolbar

- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: when `knowledgeGrounded` is ON, a status badge appears next to the `BookOutlined` toggle. Badge colour: green (built) / yellow (not built) / blue-spinner (loading). Tooltip surfaces doc count + last-built time (`just now` / `5m ago` / `2h ago` / date). Clicking the badge triggers `rebuildRagIndex()` — disabled while loading.
- Uses `Badge` from antd with `status` prop + `DatabaseOutlined` icon.

### 2026-08-05 — RAG status + per-file grounding in ChatController

- **`src/chat/types.ts`**: `ChatState` gained `ragScopeIsFile: boolean`, `ragStatus: RagStatusResponse | null`, `ragStatusLoading: boolean`.
- **`src/chat/controller.ts`**:
  - `_runStream` grounded branch now routes by `ragScopeIsFile`. When the user scoped to a leaf (file), it calls `RagService.streamFileChat({target_file, question})` (per-file index — single-turn, system prompt folded into the question). When scoped to a folder, it still calls `streamChat({messages, scope})`.
  - `setRagScopeFromNode(path, isFile)` now takes an `isFile` flag and persists `ragScopeIsFile` alongside `ragScope`.
  - `toggleKnowledgeGrounded` auto-fetches `ragStatus` on first ON, so the UI can warn about an unbuilt index before the user asks.
  - New `loadRagStatus()` action pulls built / num_docs / last_built_at.
  - New `rebuildRagIndex()` action triggers `/rag-build` and re-polls status.
  - New `knowledgeNodeByPath(path)` helper — walks `state.knowledgeTree` to find a raw node (used by ChatSidebar to pass `isFile` from the clicked antd Tree key).
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**: `onKnowledgeSelect` looks up the raw node via `knowledgeNodeByPath`, infers `isFile = node.type === 'file'`, and passes it to `setRagScopeFromNode`.
- Both `ragScope` and `ragScopeIsFile` are restored from `chrome.storage.local` on init.

### 2026-07-28 — Bug fixes (API layer)

- **`src/api/services/sessions.ts`**: `SessionService.list()` and `SessionService.get(id)` were sending `query: {...}` but YiAi's `query_documents` only recognises `filter`. Both now send `filter: {...}`. Without this fix, list/get silently returned ALL sessions or none.
- **`src/api/types.ts`**: `QueryParams.query` renamed to `QueryParams.filter` with a docstring noting the backend merge contract.

### 2026-07-27 — Chat box port (YiPett)

- Ported YiPett's shortcut + chat box: `Esc` closes chat, `Ctrl+Shift+X` toggles, role system prompt wired, conversations persist. YiPett's full feature set stays out of scope.

### 2026-07-28 — Stack migration

- React 15 + Bootstrap → **React 18.3 + Ant Design 5.21**. ESLint → **Biome 2.5**. Docs updated to match.

### 2026-07-28 — Chat dev-mode jsxDEV mismatch

- Dev-mode React plugin + production `NODE_ENV` define = `jsxDEV is not a function`. Chat bundle dev script now runs `--mode production`.

### 2026-08-05 — KnowledgePreviewDialog (file preview modal)

- **`src/chat/types.ts`**: `ChatState` gained `knowledgePreviewVisible`, `knowledgePreviewPath`, `knowledgePreviewData: KnowledgeReadResponse | null`, `knowledgePreviewLoading`.
- **`src/chat/controller.ts`**: new async actions `openKnowledgePreview(path)` (calls `KnowledgeService.read`, sets state), `closeKnowledgePreview()`.
- **`src/chat/components/KnowledgePreviewDialog/KnowledgePreviewDialog.tsx` + `.css`**: modal rendering the file's markdown body (reusing `renderMarkdown`) + a frontmatter meta strip (status / lifecycle / review_cycle / tacit / type / category + tags) + clickable `related` links that re-open preview for the linked file. Esc closes. Mirrors YiVad's `KnowledgePreviewDialog.vue`.
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**: leaf nodes render a custom `titleRender` that captures `dblclick` to open preview; single-click still sets `ragScope`. Folder nodes are unaffected (just expand).
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**: modal mounted at the root, always rendered (controller gates visibility).

### 2026-08-05 — Knowledge tree browser in sidebar

- **`src/chat/types.ts`**: `ChatState` gained `sidebarView: 'sessions' | 'knowledge'`, `knowledgeTree: KnowledgeTreeNode[]`, `knowledgeLoading: boolean`, `knowledgeError: string`.
- **`src/chat/controller.ts`**: new actions `setSidebarView(view)`, `loadKnowledgeTree(category?)`, `setRagScopeFromNode(path)`, `clearRagScope()`, and `knowledgeTreeData()` (flat `KnowledgeTreeNode[]` → antd `TreeDataNode[]`). Switching to the knowledge tab triggers a scan on first load.
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**: tab switch at the top — Conversations / Knowledge. Knowledge tab shows the scanned tree (antd `Tree` with `showLine`), each node click calls `setRagScopeFromNode(path)`, which writes the path to `state.ragScope` and surfaces it via a pill at the top of the tree. A "Clear" button resets scope; a reload icon re-scans. The batch bar only shows under sessions view.
- Together with the toolbar `BookOutlined` toggle, this closes the loop: pick a knowledge node → turn grounding ON → ask → answer draws on that scope only.

### 2026-08-05 — RAG sources rendered in MessageBubble

- **`src/chat/components/MessageBubble/MessageBubble.tsx`**: under the latest pet message, when `knowledgeGrounded` is ON and `state.ragSources` is non-empty, render a "Sources" list — each source's path (mono, ellipsised) + numeric score. Uses a new `FileSearchOutlined` icon. Tied to `index === totalMessages - 1` so it doesn't show under older pet messages.
- **`src/chat/components/MessageBubble/MessageBubble.css`**: added `.mb-sources` / `__title` / `__list` / `__item` / `__path` / `__score` styles.
- Sources are cleared at the start of every `_runStream` call, so they only belong to the in-flight / just-finished grounded turn.

### 2026-08-05 — Knowledge + RAG wired into chat

**API layer** (services + types + endpoints): see the 2026-08-05 entry above.

**Controller + UI wiring**:

- **`src/chat/types.ts`**: `ChatState` gained `knowledgeGrounded: boolean`, `ragScope: string`, `ragSources: RagSource[]`.
- **`src/chat/controller.ts`**: constructor now takes `KnowledgeService` + `RagService`. New actions `toggleKnowledgeGrounded`, `setRagScope`, `clearRagSources`. `_runStream` branches: when `knowledgeGrounded` is on, it calls `RagService.streamChat({messages, scope})` instead of `ChatService.streamWithCallback`, and surfaces returned sources through the `onSources` callback into `state.ragSources`. The toggle + scope are persisted to `chrome.storage.local` (`knowledgeGrounded`, `ragScope`).
- **`src/chat/index.tsx`**: `ChatController` constructed with `api.knowledge` + `api.rag`.
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**: new `BookOutlined` toggle button. When ON, the button is rendered in solid-primary state; tooltip reflects current state.
- **Sources rendering**: not yet surfaced in the message bubble UI — `state.ragSources` is populated but not displayed. Next iteration: render sources under the latest pet message.

### 2026-08-05 — Knowledge + RAG services landed (API layer only)

- **`src/api/endpoints.ts`**: added `KNOWLEDGE` (`/knowledge-scan`, `/knowledge-read`, `/knowledge-stories`, `/knowledge-story-read`, `/knowledge-sync`, `/knowledge-write`) and `RAG` (`/rag-query`, `/rag-status`, `/rag-build`, `/rag-categories`, `/rag-chat`, `/rag-file-query`, `/rag-file-chat`) path groups.
- **`src/api/types.ts`**: added `KnowledgeTreeNode` / `KnowledgeScanResponse` / `KnowledgeReadResponse` / `KnowledgeStory` / `KnowledgeStoriesResponse` / `KnowledgeSyncResponse` / `KnowledgeWriteResponse` and `RagSource` / `RagQueryResponse` / `RagStatusResponse` / `RagBuildResponse` / `RagCategoriesResponse` / `RagChatPayload` / `RagFileChatPayload` / `RagFileQueryResponse`.
- **`src/api/services/knowledge.ts`**: `KnowledgeService` — scan / read / listStories / readStory / sync / write. Direct REST through the shared `ApiClient` (same X-Token auth path as every other service).
- **`src/api/services/rag.ts`**: `RagService` — query / status / build / categories / fileQuery / streamChat / streamFileChat. SSE streaming reuses `client.stream` so abort + envelope unwrapping share the existing path.
- **`src/api/services/index.ts` + `src/api/index.ts`**: `KnowledgeService` and `RagService` added to `ApiServices` and the barrel exports.
- **Next (not yet wired)**: chat controller + UI need a knowledge-grounded toggle and `sendGroundedAsk` action that calls `RagService.streamChat` instead of `ChatService.streamWithCallback`. The services are ready; only the controller + UI remain.

### 2026-07-31 — Backend RAG/knowledge capability (not yet wired into YiPet)

- YiAi backend now exposes `/rag` (query + chat + per-file variants) and `/knowledge` (scan / read / write / metadata CRUD) endpoints. YiPet's `ApiClient` already supports SSE streaming; the per-service wrappers were added 2026-08-05 (see above). Controller/UI wiring still pending.

## Guidance

| To do this | Look here |
|------------|-----------|
| Understand overall architecture | [CLAUDE.md](./CLAUDE.md) (this file) |
| Build and type-check the project | `npm run build`, `npm run typecheck` — see [package.json](./package.json) |
| Run unit tests | `npm test` — see [vitest.config.ts](./vitest.config.ts) |
| Lint / format | `npm run lint`, `npm run format` — see [biome.json](./biome.json) |
| Learn about Rsbuild multi-entry setup | [rsbuild.config.ts](./rsbuild.config.ts), [rsbuild.config.chat.ts](./rsbuild.config.chat.ts), [rsbuild.config.cdn.ts](./rsbuild.config.cdn.ts), [rsbuild.config.bootstrap.ts](./rsbuild.config.bootstrap.ts) |
| Learn about content script dual-world injection | [src/content/bootstrap.ts](./src/content/bootstrap.ts) + [src/content/ipc/](./src/content/ipc/) |
| Learn about CDN resource catalog | [src/content/cdn/catalog.ts](./src/content/cdn/catalog.ts) |
| Learn about CDN injection mechanism | [src/content/cdn/injector.ts](./src/content/cdn/injector.ts) |
| Learn about pet rendering overlay | [src/content/rendering/overlay.ts](./src/content/rendering/overlay.ts) |
| Modify default configuration | [src/config/defaults.ts](./src/config/defaults.ts) |
| Modify environment-aware config | [src/config/config.ts](./src/config/config.ts) |
| Modify popup UI (state, actions, lifecycle) | [src/popup/App.tsx](./src/popup/App.tsx) |
| Modify popup entry point | [src/popup/index.tsx](./src/popup/index.tsx) |
| Add/modify popup components | [src/popup/components/](./src/popup/components/) |
| Learn about service layer (Chrome API, connection) | [src/popup/services/](./src/popup/services/) |
| Add/modify i18n strings | [public/_locales/en/messages.json](./public/_locales/en/messages.json) + [src/shared/i18n/index.ts](./src/shared/i18n/index.ts) |
| Learn about locale detection | [src/shared/i18n/locale.ts](./src/shared/i18n/locale.ts) |
| Learn about timezone handling | [src/shared/i18n/timezone.ts](./src/shared/i18n/timezone.ts) |
| Learn about datetime formatting | [src/utils/datetime.ts](./src/utils/datetime.ts) |
| Learn about IPC message types | [src/shared/ipc/messages.ts](./src/shared/ipc/messages.ts) |
| Learn about Chrome storage helpers | [src/shared/state.ts](./src/shared/state.ts) |
| Learn about chat widget components | [src/chat/components/](./src/chat/components/) |
| Learn about chat controller | [src/chat/controller.ts](./src/chat/controller.ts) |
| Call the YiAi backend API | [src/api/services/](./src/api/services/) — use `createApiServices(config)`. Client wraps `public/cdn/utils/api-client.ts` with logger injection. |
| Understand API client (base: fetch, retry, error extraction) | [public/cdn/utils/api-client.ts](./public/cdn/utils/api-client.ts) |
| Understand API client (extension: logger + SSE streaming) | [src/api/client.ts](./src/api/client.ts) |
| Understand API endpoint paths | [src/api/endpoints.ts](./src/api/endpoints.ts) |
| Understand API request/response shapes | [src/api/types.ts](./src/api/types.ts) |
| Modify design variables | [public/cdn/styles/variables.css](./public/cdn/styles/variables.css) |
| Learn about extension permissions and entries | [manifest.json](./manifest.json) |
| Add new CDN resources | [src/content/cdn/catalog.ts](./src/content/cdn/catalog.ts) (CDN_CATALOG array) |
| Understand dev/production mode config | [.env](./.env) + [.env.production](./.env.production) + [src/utils/env.ts](./src/utils/env.ts) |
| Learn about shared utility functions | [src/utils/](./src/utils/) — datetime, env, log |
| Find barrel export indexes | [src/utils/index.ts](./src/utils/index.ts) + [src/popup/components/index.ts](./src/popup/components/index.ts) + [src/chat/components/index.ts](./src/chat/components/index.ts) |
| Module type declarations (*.css, *.png) | [src/typings.d.ts](./src/typings.d.ts) |
| Editor settings (indent, charset, etc.) | [.editorconfig](./.editorconfig) |
| Architecture-direction rule | `../../rules/architecture-direction.md` |
