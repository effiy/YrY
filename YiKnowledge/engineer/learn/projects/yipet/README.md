---
lifecycle: active
title: YiPet Engineering — README
status: stable
type: summary
category: engineer/learn/projects/yipet
tags:
  - yipet
  - engineering
  - readme
  - project-meta
created: 2026-08-03
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
roles:
- engineer
benefit: "Engineers can understand and apply yipet engineering — readme with clear frameworks, actionable recommendations, and anti-pattern awareness"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
tacit: false
related:
  - ./claude.md
  - ../README.md
---

# YiPet — Gentle Companion

> **As a** engineer, **I want to** understand and apply yipet engineering — readme, **so that** project context is preserved and accessible to the team. 

> A Chrome MV3 browser extension that injects an interactive companion into any web page, with multi-role AI chat, a React 18 + Ant Design 5 popup, on-demand CDN resource injection, full i18n (en + zh_CN), and timezone-aware display. Powered by a local YiAi FastAPI backend. Built with **Rsbuild + TypeScript**.

> **New-hire onboarding** -> `YiKnowledge/engineer/run/onboarding/yipet/onboarding.md` (8 sections: setup / workflow / pitfall quick-lookup / Day-1 tasks)

## Summary

- YiPet is a Chrome MV3 browser extension with a three-layer architecture: content scripts (ISOLATED + MAIN dual worlds), a React 18 + Ant Design 5 popup control panel, and a chat window with SSE streaming and per-message actions — all powered by a local YiAi FastAPI backend
- The dual-world boundary (ISOLATED + MAIN) is the single most important architectural constraint — `chrome.runtime.*` only works in ISOLATED, page-context globals only in MAIN, and breaking this boundary causes silent failures that are hard to debug
- CDN resource injection is the most brittle part of the architecture — loading 80+ vendor libraries from local `chrome-extension://` URLs requires precise catalog maintenance, version alignment, and global-existence checks to prevent double-loading
- The four-tier API layer (client → endpoints → types → services) is over-engineered for a single-backend project but pays off in cross-project consistency with YiVad
- Rsbuild multi-entry builds (popup, chat, CDN utils, bootstrap) multiply configuration complexity — the `--mode production` requirement for the chat bundle is a gotcha that would not exist in a single-entry build

## Core viewpoints

**The dual-world boundary (ISOLATED + MAIN) is the single most important architectural constraint in YiPet.** Chrome MV3 isolates content scripts from page JavaScript. The bootstrap module's self-injection pattern bridges this gap, but every line of code must respect which APIs are available in which world. `chrome.runtime.*` only works in ISOLATED; page-context globals only in MAIN. Breaking this boundary causes silent failures that are hard to debug because the error surfaces in a different execution context than the source code.

**The four-tier API layer is over-engineered for a single-backend project but pays off in cross-project consistency.** The `client -> endpoints -> types -> services` architecture is more structure than strictly necessary for a Chrome extension talking to a single FastAPI backend. However, the payoff is that the same pattern is used across YiPet and YiVad, making cross-project navigation predictable and the `filter`/`query` bug fixable in one place.

**CDN resource injection is the most brittle part of YiPet's architecture.** Loading 80+ vendor libraries from local `chrome-extension://` URLs requires precise catalog maintenance, version alignment, and global-existence checks to prevent double-loading. A single version mismatch between React and ReactDOM, or a missing CDN entry, can break the entire extension. The catalog in `src/content/cdn/catalog.ts` is load-bearing infrastructure.

**Rsbuild multi-entry builds multiply configuration complexity.** YiPet has four separate Rsbuild configs (popup, chat, CDN utils, bootstrap), each with its own entry, output, and plugin set. The `--mode production` requirement for the chat bundle (to avoid `jsxDEV is not a function`) is a gotcha that would not exist in a single-entry build. Each new entry point adds a new Rsbuild config, a new build script, and new failure modes.

**MV3 CSP compliance is not optional, and every dependency must be bundled locally.** The `script-src 'self'` policy means no remote code, no `eval`, no inline scripts. All 80+ vendor libraries must live under `public/cdn/vendor/` and be loaded via `chrome-extension://` URLs. Adding a new dependency means adding it to the CDN catalog, not just `npm install`. This constraint is a security feature, but it makes dependency management significantly more manual.

---

## Table of Contents

- [Overview](#overview)
- [Highlights](#highlights)
- [Architecture](#architecture)
- [Module Boundaries](#module-boundaries)
- [Data Flow](#data-flow)
- [Quick Start](#quick-start)
- [Command Flow](#command-flow)
- [Project Structure](#project-structure)
- [Internationalization (i18n)](#internationalization-i18n)
- [Timezone Handling](#timezone-handling)
- [Permissions & Security](#permissions--security)
- [Domain Language](#domain-language)
- [Configuration](#configuration)
- [Recent Changes](#recent-changes)
- [Browser Support](#browser-support)

---

## Overview

YiPet is a Chrome Manifest V3 extension with a three-layer architecture:

1. **Content Script** — declared in `manifest.json`, runs in the ISOLATED world on every page. The bootstrap module self-injects into the MAIN world to expose `window.YiPet` and auto-load CDN resources on demand.
2. **Popup Control Panel** (`action.default_popup`) — a React 18 + Ant Design 5 single-page app for toggling pet visibility, size, role, and color theme. All user-facing strings are externalised via `chrome.i18n`.
3. **Chat Window** — a React 18 + Ant Design 5 widget (separate Rsbuild entry) supporting multi-role AI chat with SSE streaming and per-message actions (regenerate / retry / resend / delete / edit).
4. **HTTP API Layer** — typed service classes (`AuthService`, `SessionService`, `ChatService`, etc.) wrapping a `fetch`-based client with retry, timeout, and SSE streaming support.

State is persisted via `chrome.storage.local`. Popup-to-content-script communication uses `chrome.tabs.sendMessage`. The YiAi backend serves chat, sessions, auth, and config at `http://localhost:10086`.

---

## Highlights

- **Interactive pet companion** — animated DOM element injected into any page, with role image, color theme gradient, and configurable size.
- **Multi-role AI chat window** — streaming responses via SSE, per-message actions (regenerate / retry / resend / delete / edit), rename, sidebar, and Esc-to-close.
- **React 18.3 + Ant Design 5.21 popup + chat** — function components + hooks, live `ConfigProvider` theme switching.
- **On-demand CDN resource injection** — 80+ versioned libraries bundled locally under `public/cdn/vendor/`, MV3 CSP-compliant.
- **Full i18n** — English + Simplified Chinese via `chrome.i18n`, typed `t()` wrapper for compile-time safety.
- **Timezone-aware display** — ISO 8601 UTC storage, `Intl.DateTimeFormat` rendering with user/system timezone detection.
- **Four-tier API layer** — `client → endpoints → types → services`, with constructor-injected `ApiClient`.
- **Dual execution context** — ISOLATED world for chrome.runtime APIs, MAIN world for page-context globals.
- **Biome 2.5 linting** — fast Rust-based linter/formatter replacing ESLint + Prettier.
- **Vitest 2 testing** — jsdom-backed unit-test runner.

---

## Architecture

YiPet advances along the **componentization + four-tier API** axis: the popup and chat UIs use React 18 function components + hooks with co-located CSS; the API layer follows a strict four-tier architecture.

```
┌────────────────────────────────────────────────────────────────┐
│  Popup (action.default_popup)                                  │
│  React 18.3 + Ant Design 5.21 · Rsbuild-bundled TSX            │
│  i18n via chrome.i18n · reads chrome.storage.local on mount    │
│  dispatches chrome.tabs.sendMessage → content script           │
└──────────────────────┬─────────────────────────────────────────┘
                       │ chrome.tabs.sendMessage
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  Content Script (ISOLATED world)                               │
│  src/content/index.ts — message relay to MAIN world            │
│  src/content/bootstrap.ts — self-injects into MAIN world        │
└──────────────────────┬─────────────────────────────────────────┘
                       │ <script> injection + CustomEvent
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  MAIN World (page's JS context)                                │
│  window.YiPet API · CDN resource loader (80+ libraries)        │
│  pet DOM element · interactive behaviors                        │
│  DevTools: YiPet.help() / YiPet.list() / YiPet.load()          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Chat Window (separate Rsbuild entry)                          │
│  src/chat/controller.ts — state, streaming, actions            │
│  src/chat/components/ — one folder per UI component             │
│  SSE via fetch + AbortController · per-message actions          │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTP (fetch)
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  HTTP API Layer (src/api/)                                     │
│  client.ts → endpoints.ts → types.ts → services/*.ts            │
│  SSE streaming for chat · retry + timeout · error parsing       │
│  bound to RSBUILD_API_BASE (default: http://localhost:10086)   │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTP (fetch)
                       ▼
              ┌──────────────────┐
              │  YiAi Backend    │
              │  (FastAPI :10086)│
              └──────────────────┘
```

**Data flow:**

- **Popup → Content Script:** `chrome.tabs.sendMessage` with typed action payloads.
- **Content Script → MAIN World:** `<script>` element injection bridging the ISOLATED-world boundary, with `CustomEvent` for state handoff.
- **Bootstrap → CDN Catalog:** Sequential JS + parallel CSS injection from local `chrome-extension://` URLs. Global-existence checks prevent double-loading.
- **Chat → YiAi:** `api.chat.stream()` returns an abort function + chunk callback; SSE parsed line-by-line.
- **API Layer → YiAi:** Typed service classes (`api.auth.login()`, `api.chat.stream()`, `api.sessions.list()`) wrapping a shared `ApiClient` with retry and SSE support.

---

## Module Boundaries

### API layer (four-tier)

| Tier | File | Public API |
|---|---|---|
| 1 — Client | `src/api/client.ts` | `ApiClient` class — wraps `public/cdn/utils/api-client.ts` (fetch + retry + error extraction) with dev-gated logger + SSE streaming. Other tiers must NOT call `fetch` directly. |
| 2 — Endpoints | `src/api/endpoints.ts` | Path constants by domain (`/auth/login`, `/sessions`, `/chat`, ...). |
| 3 — Types | `src/api/types.ts` | Request/response interfaces (`LoginRequest`, `RpcRequest`, `QueryParams`, `ChatParams`, `SessionRecord`, ...). Single source of truth — services and callers import types from here. |
| 4 — Services | `src/api/services/*.ts` | Domain service classes (`AuthService`, `ChatService`, `SessionService`, `ConfigService`, `DatabaseService`, `FaqService`). Each takes `ApiClient` via constructor injection. `createApiServices(config)` aggregates them. |

### Cross-project protocol contract

| Operation | Request shape | Notes |
|---|---|---|
| RPC | `{ module_name, method_name, parameters }` | The envelope used by every data operation |
| `data_service.query_documents` | `{ cname, filter?: dict, pageNum?, pageSize?, limit? }` | **`filter`, not `query`** — backend silently ignores `query`. |
| `data_service.create_document` | `{ cname, data }` | |
| `data_service.update_document` | `{ cname, key, data }` | |
| `data_service.delete_document` | `{ cname, key }` | |
| Chat (SSE) | `{ model, messages, stream: true, system?, images? }` | Sent via `services.ai.chat_service.chat` |
| RAG query/chat | `{ question, scope? }` / `{ messages, scope? }` | YiAi `/rag` endpoints (fully wired — per-file and folder-scoped) |
| Knowledge scan/read | `{ path?, ... }` | YiAi `/knowledge` endpoints (fully wired — tree browser + preview + save) |

### UI layer

| Module | Public API |
|---|---|
| `src/popup/` | `App.tsx` (root), `index.tsx` (mount), `data.ts` (config adaptor), `components/*` (one folder per UI component, co-located TSX + CSS) |
| `src/chat/` | `controller.ts` (state/streaming/actions), `components/*`, `types.ts` |
| `src/content/` | `bootstrap.ts` (dual-world entry), `cdn/catalog.ts` + `cdn/injector.ts`, `ipc/messages.ts`, `rendering/overlay.ts`, `state/` |
| `src/shared/` | `i18n/`, `theme/`, `roles.ts`, `locale/`, `timezone/`, `datetime/`, `env.ts`, `log.ts`, `state.ts` |
| `src/popup/services/` | `chrome.ts` (tabs/storage), `connect.ts` (content-script ping), `notify.ts` (toasts) |

---

## Data Flow

### Chat (streaming)

```
User types in chat box
   │
   │ ChatController.send(text)
   ▼
api.chat.stream({ user, system?, model?, images?, conversation_id? })
   │
   │ fetch POST /  body: {module_name: "services.ai.chat_service",
   │                      method_name: "chat",
   │                      parameters: {model, messages, stream: true, system?, images?}}
   │ signal: AbortController
   ▼
YiAi FastAPI  →  StreamingResponse(text/event-stream)
   │  yields: data: {"data": {"message": "..."}}\n\n
   │  ends:   data: {"done": true}\n\n
   ▼
ApiClient parses SSE line-by-line, calls onChunk(text) / onDone() / onError(err)
   │
   ▼
ChatController appends deltas to the in-flight pet message
   │
   ▼
React re-renders; on abort, message flagged aborted=true and persisted
```

### Session persistence

```
ChatController on send / receive / edit / delete
   │
   ▼
api.sessions.upsert({key, messages, ...})
   │ fetch POST /  body: {module_name: "services.database.data_service",
   │                      method_name: "update_document" or "create_document",
   │                      parameters: {cname: "sessions", key, data}}
   ▼
YiAi data_service → repository.create_document / update_document
   ▼
MongoDB sessions collection
```

### Popup → content script → MAIN world

```
Popup (React) dispatches action
   │ chrome.tabs.sendMessage(tabId, {type: 'TOGGLE_PET', payload})
   ▼
Content Script (ISOLATED) receives via chrome.runtime.onMessage
   │ forwards to MAIN world via CustomEvent
   ▼
Bootstrap (MAIN world) listens on window, mutates pet DOM
```

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- The [YiAi backend](../../../../../YiAi/) running on `http://localhost:10086`

### Install & Build

```bash
# Install dependencies
npm install

# Production build (popup + chat + CDN utils + bootstrap)
npm run build

# Development build with file watch and sourcemaps
npm run dev

# Type-check (no emit)
npm run typecheck

# Run unit tests
npm test
```

### Load the Extension

1. Build the project (see above).
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** → select the `YiPet/dist/` directory.
5. Open any web page. Click the YiPet toolbar icon or use the keyboard shortcuts.

---

## Command Flow

| Trigger | Action |
|---|---|
| Toolbar icon click / `Ctrl+Shift+P` (⌘+Shift+P on macOS) | Open the popup control panel |
| `Ctrl+Shift+X` (⌘+Shift+X on macOS) | Toggle the chat window |
| `Esc` (when chat is open) | Close the chat window |
| DevTools console → `YiPet.help()` | Print CDN resource usage guide |
| DevTools console → `YiPet.list()` | List all 80+ available CDN resources |
| DevTools console → `YiPet.load(key)` | Programmatically load a CDN resource |

---

## Project Structure

```
YiPet/
├── manifest.json              # MV3 manifest — default_locale, __MSG__ i18n, content_scripts, commands
├── package.json               # npm scripts: dev, build, typecheck, test, lint
├── tsconfig.base.json         # Shared TS strict config
├── tsconfig.json              # Popup TS config (path alias @/)
├── rsbuild.config.ts          # Popup build entry (HTML)
├── rsbuild.config.cdn.ts      # CDN utils IIFE bundle (UrlBuilder, LoggerUtils, YiPetApi)
├── rsbuild.config.chat.ts     # Chat window build entry
├── rsbuild.config.bootstrap.ts# Content script bootstrap build entry
├── vitest.config.ts           # Vitest + jsdom test runner
├── biome.json                 # Biome linter/formatter config (replaces ESLint + Prettier)
├── .env / .env.production     # Environment variables
├── public/                    # Copied to dist/ as-is by Rsbuild
│   ├── cdn/                   # Pre-bundled vendor libs (React, dayjs, Ant Design, GSAP…)
│   │   ├── styles/            # CSS design tokens + reset
│   │   ├── utils/             # UrlBuilder, LoggerUtils, YiPetApi — built as CDN IIFE
│   │   └── vendor/            # 80+ versioned libraries (react@18.3.1, dayjs@1.11.21, …)
│   ├── _locales/              # Chrome i18n message files
│   │   ├── en/messages.json   # English (source locale, 55+ keys)
│   │   └── zh_CN/messages.json # Chinese translations
│   └── assets/                # Icons (16/32/48/128 px) + pet role images
└── src/
    ├── api/                   # HTTP API layer (four-tier architecture)
    │   ├── client.ts          #   Layer 1: wraps CDN api-client, adds logger + SSE streaming
    │   ├── endpoints.ts       #   Layer 2: path constants by domain (auth, sessions, chat…)
    │   ├── types.ts           #   Layer 3: request/response interfaces
    │   ├── index.ts           #   Barrel export
    │   └── services/          #   Layer 4: domain service classes
    │       ├── auth.ts        #     Login, logout, refresh, profile
    │       ├── chat.ts        #     Prompt + SSE streaming
    │       ├── config.ts      #     App config get/update/reset
    │       ├── database.ts    #     Generic collection CRUD
    │       ├── faq.ts         #     FAQ management + batch reorder
    │       ├── sessions.ts   #     Session CRUD, search, favorites, export/import
    │       └── index.ts       #     createApiServices() aggregator
    ├── background/            # Service worker — command dispatch + message routing
    ├── chat/                  # Chat window (Rsbuild multi-entry build)
    │   ├── controller.ts      #   Chat controller (state, streaming, actions)
    │   ├── components/         #   One folder per chat UI component
    │   ├── styles/            #   Chat-specific CSS (markdown, window)
    │   └── types.ts           #   Chat domain types
    ├── config/
    │   ├── defaults.ts        # Pure data config (no logic)
    │   └── config.ts          # Env-aware orchestrator + API client config
    ├── content/
    │   ├── bootstrap.ts       # Dual-world self-injection + YiPet API setup
    │   ├── cdn/               # CDN resource catalog + injector
    │   ├── ipc/               # Inter-process message types
    │   ├── rendering/         # Pet overlay rendering
    │   └── state/             # In-content state management
    ├── popup/
    │   ├── App.tsx            # Root component (hooks, lifecycle, i18n init)
    │   ├── index.tsx          # React root mount
    │   ├── popup.html         # Rsbuild entry — Ant Design + module entry
    │   ├── data.ts            # Config adaptor (AppConfig → PopupConfig shape)
    │   ├── services/          # Factory-pattern service modules (chrome, connect, notify)
    │   └── components/        # One folder per UI component (co-located TSX + CSS)
    ├── shared/                # Cross-layer shared modules
    │   ├── i18n/              # Typed t() wrapper + MessageKey union
    │   ├── theme/             # Color palettes + Ant Design theme tokens
    │   ├── roles.ts           # Role validation (Teacher, Doctor, Chef, Police)
    │   └── ...                # locale, timezone, datetime, env, log, messages, state
    ├── typings.d.ts           # Module declarations (*.css, *.png)
    ├── types/                 # React CDN globals + JSX namespace
    └── utils/                 # datetime, env, log helpers
```

---

## Internationalization (i18n)

YiPet uses Chrome's built-in `chrome.i18n` API. All 55+ user-facing strings are externalised into `public/_locales/<lang>/messages.json`.

| Locale | File | Coverage |
|---|---|---|
| English (en) | `_locales/en/messages.json` | Source locale — all keys |
| Chinese (zh_CN) | `_locales/zh_CN/messages.json` | Full translation |

**How it works:**

- `manifest.json` uses `__MSG_extName__`, `__MSG_cmd*__` placeholders.
- `popup.html` uses `__MSG_popupTitle__` for static content and `data-i18n` attributes for dynamic switching.
- TypeScript code uses the typed `t('key')` wrapper — `t('popupSwitchLabel')` → `"Show Pet"` (en) / `"Show Pet"` (zh_CN — English mirror).
- Locale resolution: user preference (`chrome.storage`) → Chrome UI language → fallback to `en`.
- Add a new locale by creating `_locales/<lang>/messages.json` and appending the locale code to `SUPPORTED_LOCALES` in `src/shared/i18n/locale.ts`.

---

## Timezone Handling

Timezone-aware datetime display via `Intl.DateTimeFormat` and dayjs with timezone plugin.

- **Storage:** all timestamps in ISO 8601 UTC (`new Date().toISOString()`).
- **Display:** `formatDateTime(utcISO, locale, timeZone)` converts to the user's timezone.
- **Resolution:** user preference (`chrome.storage`) → system timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
- **Relative time:** `formatRelativeTime(utcISO, locale)` uses `Intl.RelativeTimeFormat`.
- **dayjs:** `timezone.js` plugin available in the CDN catalog at `dayjs-tz` key.

---

## Permissions & Security

| Permission | Purpose |
|---|---|
| `storage` | Persist user preferences, locale, and timezone |
| `tabs` | Access active tab for message relay |
| `scripting` | Programmatic content script injection |
| `webRequest` | Network request observation |
| `host_permissions: <all_urls>` | Content script runs on every page |

> **CSP note:** MV3 enforces `script-src 'self'; object-src 'self'` by default. YiPet complies — all CDN libraries are bundled locally under `public/cdn/vendor/` and loaded via `chrome-extension://` URLs through `web_accessible_resources`. No remote code, no `eval`, no inline scripts.

---

## Domain Language

### Core Terms

- **Pet** — The interactive visual element injected into the page DOM. Has a role image, color theme gradient, and configurable size.
- **Role** — The pet's occupational identity (Teacher / Doctor / Pastry Chef / Police Officer). Determines appearance. Four roles.
- **Popup** — The `action.default_popup` page. A React 18 + Ant Design 5 settings panel. Lives as a short-lived, ephemeral page — closes on outside click.
- **Chat Window** — A separate React 18 + Ant Design 5 widget (own Rsbuild entry) for multi-role AI chat with streaming, per-message actions, and rename.
- **Content Script** — Declared in `manifest.json`'s `content_scripts`. Runs in the ISOLATED world at `document_end`. Has `chrome.runtime.*` APIs but cannot see page JS globals.
- **MAIN World** — The web page's own JS execution context. After bootstrap self-injects, `window.YiPet` is accessible from DevTools (page context, not extension context).
- **ISOLATED World** — Default content script environment. Shares page DOM but not JS globals. Use `"world": "ISOLATED"` (MV3 default).
- **CDN Catalog** — Resource manifest in `src/content/cdn/catalog.ts` (the `CDN_CATALOG` array). Maps short keys (`vue`, `react`, `gsap`) to file paths under `cdn/vendor/`. All local — no remote CDN.
- **Bootstrap** — Not CSS Bootstrap. Refers to `src/content/bootstrap.ts`, the dual-world entry that self-injects into MAIN world and sets up `window.YiPet`.
- **ChatController** — The state machine in `src/chat/controller.ts` that owns streaming, per-message actions (regenerate / retry / resend / delete / edit), rename, and abort. Uses `useSyncExternalStore` to expose React-friendly state.
- **RPC envelope** — The `{module_name, method_name, parameters}` request shape used for every cross-project call to YiAi.
- **`filter` (not `query`)** — The MongoDB-filter parameter name in `query_documents`. The backend silently ignores `query`; always use `filter`.

### Relationship Map

- **Popup → Content Script → MAIN World:** User toggles → `chrome.tabs.sendMessage({ action })` → content script relays → page DOM updates.
- **Bootstrap → CDN Catalog:** Bootstrap injects JS (sequential) and CSS (parallel) from the catalog on every page load.
- **Config → Popup (via data.ts):** `defaults.ts` + `config.ts` → `data.ts` adapts into `PopupConfig` → React components consume.
- **Popup Services → Chrome APIs:** `services/chrome.ts` wraps `chrome.tabs.*`/`chrome.storage.*`; `services/connect.ts` pings content script with backoff; `services/notify.ts` manages toast auto-dismiss.
- **ChatController → YiAi:** `api.chat.stream()` → SSE → onChunk deltas → React re-render.
- **API Services → YiAi Backend:** `src/api/services/*.ts` → `client.ts` → `fetch()` to `http://localhost:10086`.

### Disambiguation

| Term | Do NOT confuse with |
|---|---|
| **Bootstrap** (the dual-world entry) | CSS Bootstrap framework — YiPet uses Ant Design, not Bootstrap |
| **CDN Catalog** | Remote CDN — all entries are local files bundled into the extension |
| **Pet** | The chat window — the Pet is the injected DOM companion; the chat window is a separate UI |
| **Role** | User account role — here it refers to the pet's occupational appearance |
| **`filter`** | Not `query`; not the Mongo `$filter` aggregation stage |

---

## Configuration

Environment variables live in `.env` and `.env.production`:

| Variable | Default | Purpose |
|---|---|---|
| `RSBUILD_API_BASE` | `http://localhost:10086` | YiAi FastAPI backend URL |
| `RSBUILD_LOG_LEVEL` | `info` | Dev-gated logger verbosity |

User preferences persisted in `chrome.storage.local`:

| Key | Type | Purpose |
|---|---|---|
| `locale` | `'en' \| 'zh_CN' \| null` | Override Chrome UI language |
| `timezone` | `string \| null` | Override system timezone |
| `petVisible` | `boolean` | Show/hide the pet |
| `petSize` | `number` | Pet display size |
| `petRole` | `Role` | Active role |
| `petTheme` | `string` | Active color theme |

---

## Action recommendations

1. **Add a CI check that verifies the CDN catalog and global-existence checks are in sync within the next sprint.** The CDN catalog (`CDN_CATALOG` array) and the injector's global-existence checks (`window.React`, `window.dayjs`, etc.) must match for every resource. A single mismatch causes double-loading or missing dependencies. Write a script that extracts all `global` field values from the catalog and verifies that the injector has a corresponding existence check for each one. This should run in CI and block merge on failure.

2. **RAG and Knowledge services are now fully wired (completed 2026-08-05).** The YiPet chat window supports per-file and folder-scoped RAG grounding, knowledge tree browsing, file preview, and save-to-knowledge. The remaining gap is agent mode (Pi-inspired tool loop) — YiVad's aiChat already has it; porting the agent SSE protocol to YiPet's chat controller would enable multi-turn tool-calling tasks from the floating chat window.

3. **Add a pre-commit hook that verifies `npm run typecheck` passes before allowing a commit.** The "Build before commit" iron law is documented but unenforced. Rsbuild/SWC strips types at build time without checking them, so a build that succeeds with type errors will produce a runtime failure. A pre-commit hook that runs `tsc --noEmit` and blocks the commit on failure would catch type errors at the earliest possible point. This is a 3-line husky configuration change.

4. **Consolidate the four Rsbuild configs into a single config with multi-entry support within the next quarter.** The current setup (popup, chat, CDN utils, bootstrap each with their own config) multiplies configuration complexity and creates gotchas like the `--mode production` requirement for the chat bundle. Rsbuild supports multiple entry points in a single config. Consolidating would reduce the config surface area from 4 files to 1 and eliminate the per-entry build script differences.

5. **Write an integration test that verifies the dual-world bootstrap self-injection works end-to-end in a real Chrome extension context.** The current Vitest tests with happy-dom can simulate message passing but cannot simulate Chrome's actual ISOLATED/MAIN execution environment. Use `@anthropic-ai/chrome-extension-testing` or a puppeteer-based test that loads the extension in a real Chrome instance, sends a message from popup to content script, and verifies the MAIN world receives it. This catches world-crossing bugs that only manifest in the real Chrome runtime.

## Anti-patterns

- **Calling `chrome.runtime.*` APIs from MAIN world code.** The dual-world boundary is absolute: Chrome APIs are only available in the ISOLATED world. Calling them from MAIN world code injected via bootstrap will throw silently or produce `undefined`. All Chrome API calls must stay in ISOLATED world code.

- **Adding a new Rsbuild entry without understanding the `--mode production` requirement.** The chat bundle requires `--mode production` to avoid the `jsxDEV is not a function` error. A new Rsbuild entry that uses React but runs in dev mode will hit the same bug. Always test new entries with both `npm run dev` and `npm run build`.

- **Skipping `npm run typecheck` before commit.** Rsbuild/SWC strips types at build time but does not check them. `tsc --noEmit` is the only type-checking pass. A build that succeeds with type errors will produce a runtime error that could have been caught at compile time.

- **Using `query` instead of `filter` in RPC calls to `data_service.query_documents`.** The YiAi backend's `_build_filter` reads the `filter` key, not `query`. Passing `query` silently returns all documents or none. This caused a real bug in `SessionService.list/get`. Always use `filter` in the parameters dict.

- **Modifying the CDN catalog without updating the global-existence check logic.** The `CDN_CATALOG` array is the single source of truth for all injectable resources. Adding a new entry without verifying that the global-existence check is correct will cause double-loading or missing dependencies. The catalog and injector must stay in sync.

## Recent Changes

### 2026-07-28 — Bug fixes (API layer)

- **`src/api/services/sessions.ts`**: `SessionService.list()` and `SessionService.get(id)` were sending `query: {...}` in the RPC parameters, but YiAi's `query_documents` only recognises `filter`. Both now send `filter: {...}`. Without this fix, list/get silently returned ALL sessions or none.
- **`src/api/types.ts`**: `QueryParams.query?: Record<string, unknown>` renamed to `QueryParams.filter?: Record<string, unknown>` with a docstring noting the backend merge contract.

### 2026-07-27 — Chat box port

- Ported YiPett's shortcut + chat box into the extension. `Esc` closes chat, `Ctrl+Shift+X` toggles, role system prompt wired, conversations persist. YiPett's full feature set stays out of scope.

### 2026-07-28 — Stack migration

- React 15 + Bootstrap → **React 18.3 + Ant Design 5.21**. ESLint → **Biome 2.5**. Docs updated to match.

### 2026-07-28 — Chat dev-mode jsxDEV mismatch

- Dev-mode React plugin + production `NODE_ENV` define produced `jsxDEV is not a function` at runtime. Fix: chat bundle dev script now runs with `--mode production`.

### 2026-08-05 — Knowledge + RAG fully wired into chat

- **Knowledge tree browser in sidebar**: `ChatSidebar` gained a Knowledge tab with antd `Tree` rendering. Click a node → `setRagScopeFromNode(path)` → scope pill appears. Category filter dropdown narrows the visible tree + applies to RAG queries. Drag-and-drop a knowledge file into the chat area to seed a session.
- **RAG status + per-file grounding**: `ChatController` routes grounded asks by `ragScopeIsFile`: leaf scope → `RagService.streamFileChat` (per-file index); folder scope → `RagService.streamChat`. RAG status badge in toolbar (green/yellow/blue) with rebuild action. RAG sources rendered under the latest pet message with path + score.
- **RAG pre-flight source preview + sub-question decomposition**: Preview sources before sending (one-shot retrieval, no LLM). Decompose complex questions into sub-questions with per-sub answers + synthesis.
- **KnowledgePreviewDialog**: Double-click any knowledge leaf node to open a modal rendering the file's markdown body + frontmatter meta strip (status/lifecycle/review_cycle/tacit/type/category/tags) + clickable `related` links.
- **Save to YiKnowledge**: Pet messages now have a Save button → modal with path/title/category/type/tags → `KnowledgeService.write` → auto-refreshes the knowledge tree.
- **Stories tab in sidebar**: Third sidebar tab renders project onboarding stories from `KnowledgeService.listStories`; click opens the story markdown in `KnowledgePreviewDialog`.

### 2026-08-05 — Cross-project hub (bug reporting + bridges + navigation)

- **Cross-project bug reporting**: `BugReportDialog` modal with full form (severity/priority/status/type/frequency/project/module/assignee/tags/description/steps/expected/actual). Metadata → MongoDB `bugs` collection; long-form body → `YiKnowledge/lessons/failures/bugs/<key>.md`. `detectProjectFromUrl` auto-fills the project field.
- **Recent Bugs tab in sidebar**: Fourth sidebar tab listing 30 most recent bugs from MongoDB. Click → open detail in YiVad; "Discuss" button → seeds chat input + RAG scope from the bug's `contentPath`.
- **Cross-project bridge to YiVad aiChat**: Toolbar button seeds a YiVad aiChat session with page context (URL + title + body) via `SessionService.create`, then `window.open`s `http://localhost:8848/#/aiChat?session=<key>`.
- **Per-message "Open in YiVad aiChat"**: Each pet message has an `ExportOutlined` button that seeds a YiVad session with the message content + preceding user question.
- **Cross-project navigation dropdown**: Toolbar dropdown with quick links to YiAi backend, YiVad admin, aiChat, code-review/bugs, BRD, and Story Board.
- **Page-aware session filter**: `EnvironmentOutlined` button filters sessions to only those from the current page (hostname + pathname + hash-path). Toggle on/off.
- **Page-aware context chip**: Detects YiVad detail pages (bug/BRD/story) and offers a one-click contextual prompt ("Discuss bug <key>", "Summarize BRD <key>", "Walk me through <key>").

### 2026-08-05 — Session features (export, branch, summarize, auto-title)

- **Export session as markdown**: `DownloadOutlined` button formats messages as a markdown document with frontmatter header + per-message sections, triggers a `.md` download.
- **Branch from message**: `BranchesOutlined` button on any message forks a new session with messages up to that point. Tags include `branch-of:<origId>` for lineage.
- **Session summary modal**: `ProfileOutlined` button streams a 5-8 bullet LLM summary of the current session. Copyable, stays in modal (doesn't append to chat).
- **Auto-generated session title**: `ThunderboltOutlined` button in session edit dialog asks the LLM for a 4-6 word title from the first 4 user messages. Lands in the input for review before saving.

### 2026-08-05 — UX improvements (chat window + input + status)

- **SessionStatusBar (Pi-inspired compact)**: Between messages and input — model, message count, ~token estimate vs 8K context window (low/mid/high), context/RAG indicator pills, streaming phase pill (send/regenerate/resend).
- **ContextScopeBar**: Compact chips above the chat area showing active RAG scope + page context. Click to view, X to clear.
- **@-mention file dropdown in chat input**: Type `@` in the input → live file search from knowledge tree → pick → RAG scope set + knowledge grounding auto-enabled.
- **Prompt history**: ArrowUp/ArrowDown in the input recalls previous prompts (persisted to `chrome.storage.local`). Toolbar popover for visual browsing.
- **"Insert selection as prompt"**: `HighlightOutlined` toolbar button reads `window.getSelection()` and pushes it into the chat input.
- **Per-message token chip**: Each message bubble shows `~Nt` (chars/4 estimate), color-coded by role (input=blue, output=green).
- **Compact cost sparkline**: SVG sparkline in SessionStatusBar showing cumulative $ spend trajectory. Hover bands scroll to the corresponding message.
- **Tool-call timeline (3-segment phase indicator)**: thinking | retrieving | streaming mini-timeline in the status bar. Active segment lights up with glow.
- **Top-edge drag-resize handle**: Drag the top edge of the chat window to push it down while growing taller — keeps the upper portion of project pages visible.
- **Sidebar drag-resize handle**: 4px vertical separator between sidebar and chat area with `col-resize` cursor. Width persisted to `chrome.storage.local`.

---

## Browser Support

- Chrome 114+ (Manifest V3 required).
- Edge 114+ (Chromium-based, MV3 supported).
- Other Chromium browsers — untested but should work.

> Firefox uses a different extension model — YiPet does not support Firefox.

## Related

- [YiPet engineering CLAUDE.md](./claude.md) — project profile, module boundaries, data flow, self-constraints, and recent changes
- [YiPet architecture](../architecture.md) — dual-world boundary, four-tier API layer, CDN resource injection
- [YiPet development standards](../dev-standards.md) — coding conventions, build configuration, and API layer standards
- [YiPet functional modules](../functional-modules.md) — popup, chat, content, API, and shared module inventory
- [YiVad README](../../yivad/README.md) — cross-project companion, shared RPC envelope contract
