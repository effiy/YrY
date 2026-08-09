---
title: YiPet functional modules list
aliases: [yipet-modules, yipet-functional-modules, yipet-package-map]
tags: [yipet, modules, mv3, popup, chat, content-script, api-four-tier]
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
roles: [engineer, new-hire]
benefit: "Engineers understand YiPet functional module boundaries, responsibilities, and dependencies"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./architecture.md
  - ./engineering/claude.md
  - ../yiai/functional-modules.md
  - ../yivad/functional-modules.md
---

# YiPet functional modules list

> **As an** engineer, **I want to** functional modules, **so that** project context preserved.

## Summary

YiPet is a Chrome MV3 extension (React 18.3 + Ant Design 5.21 + Rsbuild + TypeScript 5.5 strict + Biome 2.5 + Vitest 2). 10 top-level `src/` catalogs: `api/` (four tier) / `background/` (service worker) / `chat/` (chat window) / `config/` / `content/` (dual world bootstrap) / `popup/` (popup UI) / `shared/` (cross-cutting) / `utils/` / `types/`. 6 api services, 19 chat components, 4 popup components. MV3 dual execution context (ISOLATED + MAIN) is the core reality. New feature = popup component + chat component (if needed) + api service (if needed) + background route (if needed) + i18n key.

## Core viewpoints

- **MV3 dual world boundary is load-bearing** — `chrome.runtime.*` only in ISOLATED; page globals only in MAIN. `src/content/bootstrap.ts` runs in ISOLATED first, then self-injects into MAIN. Mixing breaks things.
- **API layer four tier, no skipping** — `client.ts` → `endpoints.ts` → `types.ts` → `services/*.ts`; service receives injected `ApiClient`, direct `fetch` calls forbidden.
- **Style and component co-located in same catalog** — `ChatWindow/ChatWindow.tsx` + `ChatWindow/ChatWindow.css`; `buildChatCSS()` assembles runtime-loaded `dist/cdn/styles/chat.css`.
- **i18n key and message file strongly synced** — new key must be added in both `public/_locales/{en,zh_CN}/messages.json` and `src/shared/i18n/index.ts`'s `MessageKey` type union.
- **Cross-project RPC envelope** — same contract as YiVad; `filter` not `query`, `target_file` not `path`.
- **Path alias `@/`** — cross-module imports use `@/`, same catalog uses relative path.

## Key information

### Top-level catalogs (10)

| Catalog | Responsibility |
|---|---|
| `api/` | Four-tier API layer (client → endpoints → types → services) |
| `background/` | Service worker — command dispatch + message routing |
| `chat/` | Chat window (Rsbuild multi-entry build; state + streaming + actions via `useSyncExternalStore`) |
| `config/` | `defaults.ts` (data) + `config.ts` (env-aware orchestration) |
| `content/` | `bootstrap.ts` (dual world entry) + `cdn/catalog.ts` + `cdn/injector.ts` + `ipc/messages.ts` + `rendering/overlay.ts` + `state/` |
| `popup/` | React popup — `App.tsx` + `index.tsx` + `data.ts` + `components/` + `services/` |
| `shared/` | i18n / theme / roles / locale / timezone / datetime / env / log / state |
| `utils/` | datetime / env / log helpers |
| `types/` | React CDN globals + JSX namespace |

### API layer four tier

| Tier | File | Public API |
|---|---|---|
| 1 — Client | `src/api/client.ts` | `ApiClient` class — wraps `public/cdn/utils/api-client.ts` (fetch + retry + error extraction) + dev-gated logger + SSE streaming; other tiers forbidden from direct `fetch` |
| 2 — Endpoints | `src/api/endpoints.ts` | Path constants grouped by domain |
| 3 — Types | `src/api/types.ts` | Request / response interface SSOT; tier 4 and callers consume |
| 4 — Services | `src/api/services/*.ts` | Domain service class, constructor-injected `ApiClient`; `createApiServices(config)` aggregates |

### Services layer (6 files)

| File | Service | YiAi counterpart |
|---|---|---|
| `auth.ts` | `AuthService` | `domain/auth/` |
| `chat.ts` | `ChatService` — `stream({user, system?, model?, images?, conversation_id?})` | `services.ai.chat_service.chat` |
| `sessions.ts` | `SessionService` — `list` / `get` / `upsert` / `delete` | `services.database.data_service.*` (`cname: "sessions"`) |
| `database.ts` | `DatabaseService` — generic document CRUD | `services.database.data_service.*` |
| `wework.ts` | `WeWorkService` (placeholder / candidate) | `domain/wework/` |
| `index.ts` | `createApiServices(config)` aggregate export | — |

### Popup module

| Sub-module | Responsibility |
|---|---|
| `src/popup/App.tsx` | React root |
| `src/popup/index.tsx` | React mount entry |
| `src/popup/data.ts` | Config adapter |
| `src/popup/components/` | 4 components — `AboutCard` / `AppFooter` / `AppHeader` / `index.ts` barrel |
| `src/popup/services/` | `chrome.ts` (tabs/storage) / `connect.ts` (content-script ping) / `notify.ts` (toasts) |

### Chat module (19 components)

| Component | Responsibility |
|---|---|
| `ChatWindow/` | Window container |
| `ChatHeader/` | Top bar (title / role / close) |
| `ChatInput/` | Input box (shortcuts / image paste) |
| `ChatMessages/` | Message list |
| `ChatSidebar/` | Session sidebar (favorites / batch / hover action row / inline rename) |
| `ChatToolbar/` | Toolbar |
| `MessageBubble/` | Single message render |
| `DraftImageList/` | Draft image list |
| `FaqDialog/` | FAQ dialog |
| `PageContextEditor/` | Page context editor |
| `QuickButtons/` | Quick buttons |
| `RequestStatusButton/` | Request status button |
| `SearchBar/` | Session search |
| `SessionEditDialog/` | Session edit dialog |
| `SessionListItem/` | Session list item |
| `TagManagerDialog/` | Tag management dialog |
| `WeChatSettingsModal/` | WeCom settings dialog |
| `WelcomeCard/` | Welcome card |
| `index.ts` | barrel export |

Chat state layer: `src/chat/controller.ts` uses `useSyncExternalStore` to manage state / streaming / actions.

### Content module

| Sub-module | Responsibility |
|---|---|
| `src/content/bootstrap.ts` | Dual world entry (ISOLATED → MAIN) |
| `src/content/cdn/catalog.ts` | CDN resource catalog (SSOT) |
| `src/content/cdn/injector.ts` | CDN resource injection mechanism |
| `src/content/ipc/messages.ts` | IPC message types |
| `src/content/rendering/overlay.ts` | Pet render overlay |
| `src/content/state/` | Content state |

### Shared module (cross-cutting)

`src/shared/`: `i18n/` (includes `locale.ts` / `timezone.ts`) / `theme/` / `roles.ts` / `datetime.ts` / `env.ts` / `log.ts` / `state.ts`.

### Background module

`src/background/`: Service worker — command dispatch + message routing (popup ↔ content ↔ MAIN world).

### Config module

| File | Responsibility |
|---|---|
| `src/config/defaults.ts` | Default config (data) |
| `src/config/config.ts` | Env-aware orchestration |

### Cross-project RPC contract

| Operation | Request shape | Notes |
|---|---|---|
| RPC | `{module_name, method_name, parameters}` | All data operations |
| `data_service.query_documents` | `{cname, filter?, pageNum?, pageSize?, limit?}` | `filter` not `query` |
| `data_service.create_document` | `{cname, data}` | — |
| `data_service.update_document` | `{cname, key, data}` | — |
| `data_service.delete_document` | `{cname, key}` | — |
| Chat (SSE) | `{model, messages, stream: true, system?, images?}` | via `services.ai.chat_service.chat` |
| RAG query/chat | `{question, scope?}` / `{messages, scope?}` | YiAi `/rag` (available, YiPet not yet calling) |
| Knowledge scan/read | `{path?, ...}` | YiAi `/knowledge` (available, YiPet not yet calling) |

## Action recommendations

1. **New popup component → `src/popup/components/`** — One component per catalog, TSX + CSS co-located; barrel export `index.ts`.
2. **New chat component → `src/chat/components/`** — Same as above; state via `controller.ts` using `useSyncExternalStore`.
3. **New api service → `src/api/services/`** — Constructor-injected `ApiClient`; types go into `types.ts`; paths into `endpoints.ts`; `index.ts` aggregates export.
4. **i18n new key** — Sync update `public/_locales/{en,zh_CN}/messages.json` + `src/shared/i18n/index.ts`'s `MessageKey`.
5. **New CDN resource** — Add to `src/content/cdn/catalog.ts` (`CDN_CATALOG` array), do not write manifest directly.
6. **Cross-project call field names follow contract** — `filter` not `query`, `target_file` not `path`.
7. **RAG / Knowledge landing window** — When chat needs grounding, add `RagService` + `KnowledgeService` (YiAi endpoints ready, `ApiClient` supports SSE).
8. **Dual world boundary** — ISOLATED only can use `chrome.runtime.*`; MAIN only can use page globals; do not mix.

## Anti-patterns

- **API tier skipping** — types import services, client import services, service skip client direct `fetch`: all violate the four tier.
- **MV3 CSP violation** — remote code / eval / inline script; vendor must be local `public/cdn/vendor/`.
- **`query` field call `data_service.query_documents`** — silently drops filter; must use `filter`.
- **MAIN world call `chrome.runtime.*`** — unavailable; only in ISOLATED.
- **Dev mode chat bundle without `--mode production`** — triggers `jsxDEV is not a function`.
- **Cross-component shared state not via `useSyncExternalStore`** — direct mutate global loses reactivity.
- **i18n key changed only on one side** — `messages.json` and `MessageKey` type union lose sync, TS doesn't report but runtime falls back to key itself.
- **New CDN resource directly written to manifest** — bypasses catalog; injection mechanism fails.

## Related

- [YiPet architecture overview](./architecture.md) — dual world boundary / API four tier / data flow / degradation
- [YiPet dev standards](./dev-standards.md)
- [YiAi functional modules list](../yiai/functional-modules.md) — backend call counterpart
- [YiVad functional modules list](../yivad/functional-modules.md) — sibling frontend comparison
- [Pi Agent Harness evolution tracking](../../engineering/pi-agent-harness-evolution.md) — TS multi-provider candidate paradigm
- [llama_index evolution tracking](../../../ai-engineer/platform/llama-index-evolution.md)
