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
