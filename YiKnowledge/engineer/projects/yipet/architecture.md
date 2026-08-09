---
title: YiPet architecture overview
aliases: [yipet-architecture, yipet-extension-architecture]
tags: [yipet, architecture, chrome-extension, mv3, react18, rsbuild, dual-world]
category: engineer/projects/yipet
created: 2026-08-03
updated: 2026-08-07
source: ../../YiPet/CLAUDE.md
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, new-hire, tech-lead]
benefit: "Engineers understand YiPet system architecture, tech stack decisions, and browser-extension patterns"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
- ./engineering/claude.md
  - ./engineering/readme.md
  - ../../../new-hire/onboarding/yipet--onboarding.md
  - ../yiai/architecture.md
---

# YiPet architecture overview

> **As an** engineer, **I want to** architecture, **so that** project context preserved. 

## Summary

YiPet is the browser extension of the Yi family (Chrome MV3 + React 18.3 + Ant Design 5.21 + Rsbuild 1 + TypeScript 5.5 strict + Biome 2.5 + Vitest 2). Form: desktop pet companion + multi-role chat + popup console + on-demand CDN resource injection + full i18n (en + zh_CN) + timezone-aware. Core reality: **MV3 dual execution context** (ISOLATED world content script + MAIN world injection); all code changes must respect this boundary. Architecture direction: **componentization + API layering** (frontend React 18 function components + hooks; API layer four tiers: client -> endpoints -> types -> services; styles co-located with components in the same directory). 

## Core viewpoints

- **MV3 dual execution context is the core reality** — `src/content/bootstrap.ts` first runs as a content script in the ISOLATED world, then self-injects into the MAIN world. `chrome.runtime.*` is only available in ISOLATED; page-context globals are only in MAIN. Mixing them breaks things. 
- **API layer four tiers, no skipping** — `client.ts` (fetch wrapper) -> `endpoints.ts` (path constants) -> `types.ts` (interface SSOT) -> `services/*.ts` (domain service classes). Services get `ApiClient` injected via constructor; types do not import services; client does not import services. 
- **Styles co-located with components in the same directory** — `ChatWindow/ChatWindow.tsx` + `ChatWindow/ChatWindow.css`; `rsbuild.config.ts -> buildChatCSS()` concatenates each component's CSS into the runtime-loaded `dist/cdn/styles/chat.css`. 
- **Cross-project RPC envelope** — same contract as YiVad: `{module_name, method_name, parameters}` calls YiAi; `filter` not `query`, `target_file` not `path`. 
- **UTC-first time** — all timestamps stored ISO 8601 UTC; display via `src/shared/datetime.ts` using `Intl.DateTimeFormat` + explicit timezone conversion. 
- **MV3 CSP compliance** — no remote code / no eval / no inline script; all vendors local at `public/cdn/vendor/`. 

## Key information

### Tech stack

| Dimension | Value |
|---|---|
| Project type | Frontend (Chrome MV3 extension)  |
| Version | 1.2.0 |
| Architecture | Single repo, no workspace |
| Runtime | Chrome Extension Manifest V3 |
| Language | TypeScript 5.5 strict |
| Build | Rsbuild 1.0 (multi-entry: popup / chat / CDN utils / bootstrap)  |
| UI | React 18.3 + Ant Design 5.21 |
| Lint / formatting | Biome 2.5 (replaces ESLint + Prettier)  |
| Test | Vitest 2 + jsdom 29 |
| Backend | self-hosted YiAi (`http://localhost:10086`)  |

### Source topology

```
src/
├── api/           # four-tier API layer (client -> endpoints -> types -> services) 
├── background/    # Service worker — command dispatch + message routing
├── chat/          # Chat window (Rsbuild multi-entry build) 
├── config/        # defaults.ts (data)  + config.ts (env-aware orchestration) 
├── content/       # bootstrap, cdn catalog/injector, ipc, rendering, state
├── popup/         # React popup — App.tsx / components/ / services/
├── shared/        # i18n / theme / roles / locale / timezone / datetime / env / log / state
├── types/         # React CDN globals + JSX namespace
└── utils/         # datetime / env / log helpers
```

### API layer four tiers

| Tier | File | Public API |
|---|---|---|
| 1 — Client | `src/api/client.ts` | `ApiClient` class — wraps `public/cdn/utils/api-client.ts` (fetch + retry + error extraction), adds dev-gated logger + SSE streaming. Other tiers must not call `fetch` directly.  |
| 2 — Endpoints | `src/api/endpoints.ts` | Path constants grouped by domain.  |
| 3 — Types | `src/api/types.ts` | Request / response interfaces — the SSOT for all API shapes; tier 4 and callers consume them.  |
| 4 — Services | `src/api/services/*.ts` | Domain service classes (`AuthService` / `ChatService` / `SessionService` / `ConfigService` / `DatabaseService` / `FaqService`). Each gets `ApiClient` injected via constructor; `createApiServices(config)` aggregates them.  |

### UI layer

| Module | Public API |
|---|---|
| `src/popup/` | `App.tsx` root / `index.tsx` mount / `data.ts` configure adapter / `components/*` (one component per directory, TSX + CSS co-located)  |
| `src/chat/` | `controller.ts` (state/streaming/actions via `useSyncExternalStore`) / `components/*` / `types.ts` |
| `src/content/` | `bootstrap.ts` (dual-world entry) / `cdn/catalog.ts` + `cdn/injector.ts` / `ipc/messages.ts` / `rendering/overlay.ts` / `state/` |
| `src/shared/` | i18n / theme / roles / locale / timezone / datetime / env / log / state |
| `src/popup/services/` | `chrome.ts` (tabs/storage) / `connect.ts` (content-script ping) / `notify.ts` (toasts)  |

### Key data streams

1. **Chat (streaming)**: user input -> `api.chat.stream({user, system?, model?, images?, conversation_id?})` -> `fetch POST /` body `{module_name: "services.ai.chat_service", method_name: "chat", parameters: {model, messages, stream: true, system?, images?}}` + `signal: AbortController` -> YiAi `StreamingResponse(text/event-stream)` -> `ApiClient` SSE parsing -> `onChunk(text)` / `onDone()` / `onError(err)` -> `ChatController` accumulates deltas -> `useSyncExternalStore` -> React re-render; abort sets `aborted=true` and persists it. 
2. **Session persistence**: ChatController on send/receive/edit/delete -> `api.sessions.upsert({key, messages, ...})` -> `fetch POST /` body `{module_name: "services.database.data_service", method_name: "update_document"|"create_document", parameters: {cname: "sessions", key, data}}` -> YiAi -> MongoDB `sessions` collection. 
3. **Popup -> content script -> MAIN world**: Popup (React) dispatches action -> `chrome.tabs.sendMessage(tabId, {type: 'TOGGLE_PET', payload})` -> Content Script (ISOLATED) receives via `chrome.runtime.onMessage` -> forwards to MAIN world via CustomEvent -> Bootstrap (MAIN world) listens to window events, mutates pet DOM. 

### Cross-project RPC contract

| Operation | Request shape | Notes |
|---|---|---|
| RPC | `{module_name, method_name, parameters }` | Envelope for all data operations |
| `data_service.query_documents` | `{cname, filter?, pageNum?, pageSize?, limit? }` | **`filter` not `query`** |
| `data_service.create_document` | `{cname, data}` | — |
| `data_service.update_document` | `{cname, key, data}` | — |
| `data_service.delete_document` | `{cname, key}` | — |
| Chat (SSE)  | `{model, messages, stream: true, system?, images?}` | via `services.ai.chat_service.chat` |
| RAG query/chat | `{question, scope?}` / `{messages, scope?}` | YiAi `/rag` endpoint (available, YiPet does not yet call)  |
| Knowledge scan/read | `{path?, ...}` | YiAi `/knowledge` endpoint (available, YiPet does not yet call)  |

### Degradation strategy

| Condition | Behavior |
|---|---|
| YiAi backend unreachable | API client exponential backoff retry, throws typed error to caller |
| CDN resource already loaded | Global existence check short-circuits re-injection |
| Chrome storage quota exceeded | State write silently fails; dev mode logger warning |
| Locale key missing | Falls back to `en` source locale, then to the key itself |
| TS strict violation | `npm run typecheck` blocks build |
| Dev React plugin + production `NODE_ENV` | chat bundle dev script runs `--mode production` to avoid `jsxDEV is not a function` |

## Action recommendations

1. **New service lands in `src/api/services/`** — inject `ApiClient` via constructor; types go into `types.ts`; path constants into `endpoints.ts`. 
2. **New UI component -> `src/popup/components/`** — one component per directory, TSX + CSS co-located; barrel-exported via `index.ts`. 
3. **i18n new key** — sync update `public/_locales/{en,zh_CN}/messages.json` + the `MessageKey` type union in `src/shared/i18n/index.ts`. 
4. **Cross-project call field names per contract** — `filter` not `query`, `target_file` not `path`. 
5. **When chat needs grounding in YiKnowledge** — add `RagService` + `KnowledgeService` in `src/api/services/` (YiAi endpoints are ready); `ApiClient` already supports SSE. 
6. **Dual-world boundary** — ISOLATED only can use `chrome.runtime.*`; MAIN only can use page globals; do not mix. 

## Anti-patterns

- **API tier skipping** — types import services, client imports services, service skips client to call fetch directly: all violate the four-tier boundary. 
- **MV3 CSP violation** — remote code / eval / inline script: forbidden; vendors must be local at `public/cdn/vendor/`. 
- **`query` field calling `data_service.query_documents`** — silently ignored; must be `filter`. 
- **MAIN world calling `chrome.runtime.*`** — not available; only in ISOLATED. 
- **Dev mode chat bundle without `--mode production`** — triggers `jsxDEV is not a function`. 
- **Cross-component shared state not via `useSyncExternalStore`** — directly mutating globals loses responsiveness. 

## Related

- Mirror: [engineering/claude.md](./engineering/claude.md) · [engineering/readme.md](./engineering/readme.md)
- Getting started: [onboarding.md](../../../new-hire/onboarding/yipet--onboarding.md)
- Same family: [../yiai/architecture.md](../yiai/architecture.md) · [../yivad/architecture.md](../yivad/architecture.md)
- Cross-project protocol: [../yiai/engineering/claude.md](../yiai/engineering/claude.md#cross-project-protocol)
- jsxDEV gotcha: [../../lessons/gotchas/react-jsxdev-mismatch.md](../../lessons/gotcha-react-jsxdev-mismatch.md)
- aicr port retrospective: [../../lessons/wins/yivad-aicr-phase-port.md](../../lessons/win-yivad-aicr-phase-port.md)
