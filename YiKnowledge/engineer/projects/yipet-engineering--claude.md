---
lifecycle: active
status: stable
type: summary
category: engineer/projects/yipet/engineering
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"review_cycle: quarterly
tacit: false
related:
  - ./readme.md
  - ../README.md
---

# CLAUDE.md — YiPet

> **As an** engineer，**I want to** claude，**so that** project context preserved。

> Chrome MV3 browser extension. Gentle Companion — an interactive pet companion in the browser, with multi-role chat, a React 18 + Ant Design 5 popup, on-demand CDN resource injection, full i18n (en + zh_CN), and timezone-aware display. Built with **Rsbuild + TypeScript**.

## Summary

- YiPet is a Chrome MV3 extension with React 18.3 + Ant Design 5.21, Biome 2.5 linting, and Vitest 2 testing — the dual-world boundary (ISOLATED + MAIN) is its single most important architectural constraint
- The four-tier API layer (client → endpoints → types → services) is over-engineered for a single-backend project but pays off in cross-project consistency; the CDN catalog in `src/content/cdn/catalog.ts` is load-bearing infrastructure where a single version mismatch can break the entire extension
- Rsbuild multi-entry builds (popup, chat, CDN utils, bootstrap) multiply configuration complexity; the `--mode production` requirement for the chat bundle avoids `jsxDEV is not a function` caused by dev-mode React plugin + production NODE_ENV conflict
- The `filter`/`query` bug in `SessionService.list/get` was a silent failure — the backend ignored `query` and returned all documents — demonstrating why cross-project contract documentation matters
- MV3 CSP compliance means no remote code, no `eval`, no inline scripts — all 80+ vendor libraries must be bundled locally under `public/cdn/vendor/` and loaded via `chrome-extension://` URLs

## Core viewpoints

**The dual-world boundary (ISOLATED + MAIN) is the single most important architectural constraint in YiPet.** Chrome MV3 isolates content scripts from page JavaScript. The bootstrap module's self-injection pattern bridges this gap, but every line of code must respect which APIs are available in which world. `chrome.runtime.*` only works in ISOLATED; page-context globals only in MAIN. Breaking this boundary causes silent failures that are hard to debug because the error surfaces in a different execution context than the source code.

**The four-tier API layer is over-engineered for a single-backend project but pays off in cross-project consistency.** The `client -> endpoints -> types -> services` four-tier architecture is a pattern typically seen in large enterprise applications. For a Chrome extension talking to a single FastAPI backend, it is more structure than strictly necessary. However, the payoff is that the same pattern is used across YiPet and YiVad, making cross-project navigation predictable and the `filter`/`query` bug fixable in one place.

**CDN resource injection is the most brittle part of YiPet's architecture.** Loading 80+ vendor libraries from local `chrome-extension://` URLs requires precise catalog maintenance, version alignment, and global-existence checks to prevent double-loading. A single version mismatch between React and ReactDOM, or a missing CDN entry, can break the entire extension. The catalog in `src/content/cdn/catalog.ts` is load-bearing infrastructure, not a convenience file.

**Rsbuild multi-entry builds multiply configuration complexity.** YiPet has four separate Rsbuild configs (popup, chat, CDN utils, bootstrap), each with its own entry, output, and plugin set. The `--mode production` requirement for the chat bundle (to avoid `jsxDEV is not a function`) is a gotcha that would not exist in a single-entry build. Each new entry point adds a new Rsbuild config, a new build script, and new failure modes.

**The `filter`/`query` bug is a case study in why cross-project contract documentation matters.** YiPet's `SessionService.list/get` was sending `query: {...}` but YiAi's `query_documents` only recognizes `filter`. The bug was silent -- no error, just wrong results. It took cross-project debugging to find. The fix was simple (rename the field), but the root cause (no automated contract testing) means similar bugs are waiting to happen.

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
> See also: [../../rules/architecture-direction.md](../../../../../.claude/skills/yry-init/rules/architecture-direction.md)

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

### 2026-07-28 — Bug fixes (API layer)

- **`src/api/services/sessions.ts`**: `SessionService.list()` and `SessionService.get(id)` were sending `query: {...}` but YiAi's `query_documents` only recognises `filter`. Both now send `filter: {...}`. Without this fix, list/get silently returned ALL sessions or none.
- **`src/api/types.ts`**: `QueryParams.query` renamed to `QueryParams.filter` with a docstring noting the backend merge contract.

### 2026-07-27 — Chat box port (YiPett)

- Ported YiPett's shortcut + chat box: `Esc` closes chat, `Ctrl+Shift+X` toggles, role system prompt wired, conversations persist. YiPett's full feature set stays out of scope.

### 2026-07-28 — Stack migration

- React 15 + Bootstrap → **React 18.3 + Ant Design 5.21**. ESLint → **Biome 2.5**. Docs updated to match.

### 2026-07-28 — Chat dev-mode jsxDEV mismatch

- Dev-mode React plugin + production `NODE_ENV` define = `jsxDEV is not a function`. Chat bundle dev script now runs `--mode production`.

### 2026-07-31 — Backend RAG/knowledge capability (not yet wired into YiPet)

- YiAi backend now exposes `/rag` (query + chat + per-file variants) and `/knowledge` (scan / read / write / metadata CRUD) endpoints. YiPet's `ApiClient` already supports SSE streaming; a future `RagService` and `KnowledgeService` in `src/api/services/` can be added when the chat window needs grounding in the YiKnowledge markdown tree. No client changes yet — documented here so the contract is known.

## Action recommendations

1. **Add a CDN catalog integrity check to the build pipeline:** The CDN catalog in `src/content/cdn/catalog.ts` is load-bearing infrastructure. A single version mismatch or missing entry can break the entire extension. Add a build step that: (1) reads the `CDN_CATALOG` array, (2) verifies every file path exists in `public/cdn/vendor/`, and (3) verifies that the global-existence check keys in `injector.ts` match the expected global names in the catalog. Fail the build if any check fails. This is a 30-minute script that prevents the most common and hardest-to-debug class of YiPet failures.

2. **Create a dual-world boundary lint rule for Biome:** The rule "chrome.runtime.* is only available in ISOLATED" is currently enforced by convention. Create a custom Biome lint rule that: (1) flags any `chrome.runtime.*` or `chrome.storage.*` call in a file with `main-` prefix, (2) flags any `document.*` or `window.*` access in a file with `isolated-` prefix, and (3) flags any `as any` cast across world boundaries. This catches the most common MV3 bug at build time instead of runtime. The Biome plugin API supports custom rules; this is a 2-hour investment that prevents hours of debugging per quarter.

3. **Add a new Rsbuild entry template with the `--mode production` gotcha documented:** Every new Rsbuild entry in YiPet must use `--mode production` if it uses React. Create a template file `rsbuild.config.template.ts` that includes this flag with a comment explaining the `jsxDEV is not a function` root cause. The template should also include the `@/` path alias, the Vitest configuration, and the `buildChatCSS()` pattern. This prevents the most common gotcha in YiPet's build configuration from being rediscovered by every new developer.

4. **Implement a `MessageKey` type union synchronization check in CI:** The `MessageKey` type union must stay in sync with `public/_locales/en/messages.json`. Add a CI step that reads keys from both, diffs them, and fails the build if any key exists in one but not the other. This prevents the most common i18n bug: a runtime error when a key referenced in TypeScript code is missing from the locale file. This is a 20-line script that saves hours of debugging.

5. **Add a Chrome extension E2E test for the full popup-to-content-script-to-MAIN-world communication chain:** Create a Puppeteer test that: (1) loads the extension in a test Chrome instance, (2) toggles a setting in the popup, (3) verifies that `window.YiPet` in the page context reflects the change, and (4) verifies the chat window opens on `Ctrl+Shift+X`. Start with one test (toggle pet visibility) and expand to cover the full command flow. This catches regressions in the three-hop communication chain -- the most complex and brittle part of YiPet.

## Anti-patterns

- **Calling `chrome.runtime.*` APIs from MAIN world code.** The dual-world boundary is absolute: `chrome.runtime.getURL`, `chrome.storage`, and `chrome.tabs` are only available in the ISOLATED world. Calling them from MAIN world code injected via bootstrap will throw silently or produce `undefined`. All Chrome API calls must stay in ISOLATED world code (content scripts, background service worker, popup).

- **Adding a new Rsbuild entry without understanding the `--mode production` requirement.** The chat bundle requires `--mode production` to avoid the `jsxDEV is not a function` error caused by the dev-mode React plugin conflicting with production `NODE_ENV`. A new Rsbuild entry that uses React but runs in dev mode will hit the same bug. Always test new entries with both `npm run dev` and `npm run build`.

- **Skipping the `npm run typecheck` step before commit.** Rsbuild/SWC strips types at build time but does not check them. `tsc --noEmit` is the only type-checking pass. A build that succeeds with type errors will produce a runtime error that could have been caught at compile time. The Iron Law "Build before commit" means `npm run typecheck && npm run build`, not just `npm run build`.

- **Using `query` instead of `filter` in RPC calls to `data_service.query_documents`.** The YiAi backend's `_build_filter` reads the `filter` key, not `query`. Passing `query` silently returns all documents or none. This caused a real bug in `SessionService.list/get` that was fixed in 2026-07-28. Always use `filter` in the parameters dict.

- **Modifying the CDN catalog without updating the global-existence check logic.** The `CDN_CATALOG` array in `src/content/cdn/catalog.ts` is the single source of truth for all injectable resources. Adding a new entry without verifying that the global-existence check (`window.React`, `window.dayjs`, etc.) is correct will cause double-loading or missing dependencies. The catalog and injector must stay in sync.

## Related

- [YiPet engineering README](./readme.md) — project overview, architecture, data flow, domain language, and quick start
- [YiPet architecture](../architecture.md) — dual-world boundary, four-tier API layer, CDN resource injection
- [YiPet development standards](../dev-standards.md) — coding conventions, build configuration, and API layer standards
- [YiPet functional modules](../functional-modules.md) — popup, chat, content, API, and shared module inventory
- [YiVad engineering CLAUDE.md](../../yivad/engineering/claude.md) — cross-project companion, shared RPC envelope contract

## Guidance

| To do this | Look here |
|------------|-----------|
| Understand overall architecture | [CLAUDE.md](claude.md) (this file) |
| Build and type-check the project | `npm run build`, `npm run typecheck` — see `package.json` |
| Run unit tests | `npm test` — see `vitest.config.ts` |
| Lint / format | `npm run lint`, `npm run format` — see `biome.json` |
| Learn about Rsbuild multi-entry setup | `rsbuild.config.ts`, `rsbuild.config.chat.ts`, `rsbuild.config.cdn.ts`, `rsbuild.config.bootstrap.ts` |
| Learn about content script dual-world injection | `src/content/bootstrap.ts` + `src/content/ipc/` |
| Learn about CDN resource catalog | `src/content/cdn/catalog.ts` |
| Learn about CDN injection mechanism | `src/content/cdn/injector.ts` |
| Learn about pet rendering overlay | `src/content/rendering/overlay.ts` |
| Modify default configuration | `src/config/defaults.ts` |
| Modify environment-aware config | `src/config/config.ts` |
| Modify popup UI (state, actions, lifecycle) | `src/popup/App.tsx` |
| Modify popup entry point | `src/popup/index.tsx` |
| Add/modify popup components | `src/popup/components/` |
| Learn about service layer (Chrome API, connection) | `src/popup/services/` |
| Add/modify i18n strings | `public/_locales/en/messages.json` + `src/shared/i18n/index.ts` |
| Learn about locale detection | `src/shared/i18n/locale.ts` |
| Learn about timezone handling | `src/shared/i18n/timezone.ts` |
| Learn about datetime formatting | `src/utils/datetime.ts` |
| Learn about IPC message types | `src/shared/ipc/messages.ts` |
| Learn about Chrome storage helpers | `src/shared/state.ts` |
| Learn about chat widget components | `src/chat/components/` |
| Learn about chat controller | `src/chat/controller.ts` |
| Call the YiAi backend API | `src/api/services/` — use `createApiServices(config)`. Client wraps `public/cdn/utils/api-client.ts` with logger injection. |
| Understand API client (base: fetch, retry, error extraction) | `public/cdn/utils/api-client.ts` |
| Understand API client (extension: logger + SSE streaming) | `src/api/client.ts` |
| Understand API endpoint paths | `src/api/endpoints.ts` |
| Understand API request/response shapes | `src/api/types.ts` |
| Modify design variables | `public/cdn/styles/variables.css` |
| Learn about extension permissions and entries | `manifest.json` |
| Add new CDN resources | `src/content/cdn/catalog.ts` (CDN_CATALOG array) |
| Understand dev/production mode config | `.env` + `.env.production` + `src/utils/env.ts` |
| Learn about shared utility functions | `src/utils/` — datetime, env, log |
| Find barrel export indexes | `src/utils/index.ts` + `src/popup/components/index.ts` + `src/chat/components/index.ts` |
| Module type declarations (*.css, *.png) | `src/typings.d.ts` |
| Editor settings (indent, charset, etc.) | `.editorconfig` |
| Architecture-direction rule | `../../rules/architecture-direction.md` |
