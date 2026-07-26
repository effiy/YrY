# YiPet — Gentle Companion

> Chrome MV3 extension. Injects an interactive companion into any page, with multi-role chat, a React control panel, on-demand CDN resource injection, i18n (en + zh_CN), and timezone-aware display. Powered by a local YiAi FastAPI backend. Built with **Vite + TypeScript**.

## System View

YiPet is a Chrome MV3 extension with three layers:

1. **Content script** — declared in `manifest.json`, runs in the ISOLATED world on matching pages. Handles popup-to-page message relay. The bootstrap module self-injects into the MAIN world to expose `window.YiPet` and auto-load CDN resources.
2. **Popup control panel** (`action.default_popup`) — a React 15 app for toggling pet visibility, size (slider), role (select), and color theme (select). All strings are i18n'd via `chrome.i18n` — switches automatically with Chrome's UI language.
3. **HTTP API layer** — typed service classes (`AuthService`, `SessionService`, `ChatService`, etc.) wrapping a `fetch`-based client with retry, timeout, and SSE streaming support. The base client lives in `public/cdn/utils/api-client.ts` (shared with MAIN-world CDN injection); `src/api/client.ts` extends it with the extension's dev-gated logger and SSE streaming. Endpoints are organised by domain.

State is persisted via `chrome.storage.local`. Popup-to-content-script communication uses `chrome.tabs.sendMessage`. The YiAi backend serves chat, sessions, auth, and config at `http://localhost:10086`.

## Quick Start

1. Ensure the [YiAi backend](../YiAi/) is running on `http://localhost:10086`.
2. Install dependencies and build:
   ```bash
   npm install
   npm run build          # production build
   # or: npm run dev      # development build with sourcemaps
   npm run typecheck      # verify TypeScript
   ```
3. Open `chrome://extensions`, enable **Developer mode**.
4. Click **Load unpacked** → select the `YiPet/dist/` directory.
5. Open any web page. Click the YiPet toolbar icon or use the keyboard shortcuts.

## Command Flow

| Trigger | Action |
|---|---|
| Toolbar icon click / `Cmd+Shift+P` | Open the popup control panel |
| `Cmd+Shift+X` | Open the chat window |
| DevTools console → `YiPet.help()` | Print CDN resource usage guide |
| DevTools console → `YiPet.list()` | List all 80+ available CDN resources |

## Project Structure

```
YiPet/
├── manifest.json              # MV3 manifest — default_locale, __MSG__ i18n, content_scripts, commands
├── package.json               # npm scripts: dev, build, typecheck
├── tsconfig.json              # TypeScript strict mode, JSX via React.createElement
├── vite.config.ts             # Multi-entry: popup (HTML) + content + bootstrap
├── .env / .env.production     # Environment variables (VITE_API_BASE, VITE_LOG_LEVEL)
├── public/                    # Copied to dist/ as-is by Vite
│   ├── cdn/                   # Pre-bundled vendor libs (React, Vue, dayjs, Bootstrap, GSAP…)
│   │   ├── styles/            # CSS design tokens + reset
│   │   ├── utils/             # UrlBuilder, LoggerUtils, YiPetApi — built as CDN IIFE
│   │   │   ├── url.ts         #   UrlBuilder
│   │   │   ├── log.ts         #   LoggerUtils (dev-mode silent)
│   │   │   ├── api-client.ts  #   YiPetApi.createClient() — canonical HTTP client base
│   │   │   └── index.ts       #   IIFE entry — bundles all three + window globals
│   │   └── vendor/            # 80+ versioned libraries (react@15.6.1, dayjs@1.11.21, …)
│   ├── _locales/              # Chrome i18n message files
│   │   ├── en/messages.json   # English (source locale, 55 keys)
│   │   └── zh_CN/messages.json # Chinese translations
│   └── assets/                # Icons (16/32/48/128 px) + pet role images
└── src/
    ├── api/                   # HTTP API layer (4-tier architecture)
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
    │       ├── sessions.ts    #     Session CRUD, search, favorites, export/import
    │       └── index.ts       #     createApiServices() aggregator
    ├── config/
    │   ├── defaults.ts        # Pure data config (no logic)
    │   └── config.ts          # Env-aware orchestrator + API client config
    ├── content/
    │   ├── bootstrap.ts       # Dual-world self-injection + YiPet API setup
    │   ├── catalog.ts         # CDN resource catalog (single source of truth)
    │   ├── index.ts           # Content script entry (message relay)
    │   └── injector.ts        # DOM script/stylesheet injector factory
    ├── shared/
    │   ├── i18n.ts            # Typed t() wrapper + MessageKey union
    │   ├── locale.ts          # Locale detection + user preference override
    │   ├── timezone.ts        # Timezone detection + user preference
    │   ├── datetime.ts        # UTC-first helpers + locale-aware formatters
    │   ├── env.ts             # Vite env access (IS_DEV, MODE, API_BASE)
    │   ├── log.ts             # Dev-gated logger
    │   ├── messages.ts        # IPC message type definitions
    │   ├── state.ts           # chrome.storage read/write helpers
    │   ├── component.ts       # ExtensionComponent lifecycle interface
    │   └── globals.ts         # CDN-provided library type declarations
    ├── types/
    │   └── react-cdn.d.ts     # React 15.6.1 CDN globals + JSX namespace
    ├── vite-env.d.ts          # Vite client type references
    └── popup/
        ├── popup.html         # Vite entry — React CDN scripts + module entry
        ├── popup.tsx          # Root PopupComponent (state, actions, lifecycle, i18n init)
        ├── popup.css          # Popup layout styles
        ├── data.ts            # Config adaptor (AppConfig → PopupConfig shape)
        ├── services/          # Factory-pattern service modules
        │   ├── chrome.ts      #   chrome.tabs / chrome.storage wrapper
        │   ├── connect.ts     #   Connection manager with exponential backoff
        │   ├── notify.ts      #   Auto-dismiss toast notification controller
        │   └── index.ts       #   createPopupServices() aggregator
        └── components/        # One folder per UI component (co-located TSX + CSS)
            ├── AppHeader/     #   Brand, model, status indicator
            ├── SettingsCard/  #   Settings card container
            ├── SwitchRow/     #   Toggle switch (show/hide pet)
            ├── SliderRow/     #   Range slider (pet size)
            ├── SelectRow/     #   Dropdown (role, color theme)
            ├── Notification/  #   Toast notification banner
            └── AppFooter/     #   Version badge, status hint
```

## Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  Popup (action.default_popup)                             │
│  Vite-bundled React 15 TSX · i18n via chrome.i18n        │
│  reads chrome.storage.local on mount · locale detection   │
│  dispatches chrome.tabs.sendMessage → content script      │
└──────────────────────┬───────────────────────────────────┘
                       │ chrome.tabs.sendMessage
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Content Script (ISOLATED world)                          │
│  src/content/index.ts — message relay to MAIN world       │
│  src/content/bootstrap.ts — self-injects into MAIN world  │
└──────────────────────┬───────────────────────────────────┘
                       │ <script> injection + CustomEvent
                       ▼
┌──────────────────────────────────────────────────────────┐
│  MAIN World (page's JS context)                           │
│  window.YiPet API · CDN resource loader (80+ libraries)   │
│  pet DOM element · interactive behaviors                  │
│  DevTools: YiPet.help() / YiPet.list() / YiPet.load()     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  HTTP API Layer (src/api/)                                │
│  client.ts → services/*.ts → typed fetch calls            │
│  SSE streaming for chat · retry + timeout · error parsing │
│  bound to VITE_API_BASE (default: http://localhost:10086) │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP (fetch)
                       ▼
              ┌──────────────────┐
              │  YiAi Backend    │
              │  (FastAPI :10086)│
              └──────────────────┘
```

- **Popup → Content Script:** `chrome.tabs.sendMessage` with typed action payloads.
- **Content Script → MAIN World:** `<script>` element injection bridging the ISOLATED-world boundary, with `CustomEvent` for state handoff.
- **Bootstrap → CDN Catalog:** Sequential JS + parallel CSS injection from local `chrome-extension://` URLs. Global-existence checks prevent double-loading.
- **API Layer → YiAi:** Typed service classes (`api.auth.login()`, `api.chat.stream()`, `api.sessions.list()`) wrapping a shared `ApiClient` with retry and SSE support. The client builds on `public/cdn/utils/api-client.ts` (the canonical base shared with CDN injection), adding the extension's dev-gated logger.

## Internationalization (i18n)

YiPet uses Chrome's built-in `chrome.i18n` API. All 55+ user-facing strings are externalised into `public/_locales/<lang>/messages.json`.

| Locale | File | Coverage |
|---|---|---|
| English (en) | `_locales/en/messages.json` | Source locale — all keys |
| Chinese (zh_CN) | `_locales/zh_CN/messages.json` | Full translation |

**How it works:**
- `manifest.json` uses `__MSG_extName__`, `__MSG_cmd*__` placeholders.
- `popup.html` uses `__MSG_popupTitle__` for static content and `data-i18n` attributes for dynamic switching.
- TypeScript code uses the typed `t('key')` wrapper — `t('popupSwitchLabel')` → `"Show Pet"` (en) / `"显示宠物"` (zh_CN).
- Locale resolution: user preference (`chrome.storage`) → Chrome UI language → fallback to `en`.
- Add a new locale by creating `_locales/<lang>/messages.json` and appending the locale code to `SUPPORTED_LOCALES` in `src/shared/locale.ts`.

## Timezone

Timezone-aware datetime display via `Intl.DateTimeFormat` and dayjs with timezone plugin.

- **Storage:** all timestamps in ISO 8601 UTC (`new Date().toISOString()`).
- **Display:** `formatDateTime(utcISO, locale, timeZone)` converts to the user's timezone.
- **Resolution:** user preference (`chrome.storage`) → system timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
- **Relative time:** `formatRelativeTime(utcISO, locale)` uses `Intl.RelativeTimeFormat`.
- **dayjs:** `timezone.js` plugin available in the CDN catalog at `dayjs-tz` key.

## Permissions & Security

| Permission | Purpose |
|---|---|
| `storage` | Persist user preferences, locale, and timezone |
| `tabs` | Access active tab for message relay |
| `scripting` | Programmatic content script injection |
| `webRequest` | Network request observation |
| `host_permissions: <all_urls>` | Content script runs on every page |

> **CSP note:** MV3 enforces `script-src 'self'; object-src 'self'` by default. YiPet complies — all CDN libraries are bundled locally under `public/cdn/vendor/` and loaded via `chrome-extension://` URLs through `web_accessible_resources`. No remote code, no `eval`, no inline scripts.

## Domain Language

### Core Terms

- **Pet** — The interactive visual element injected into the page DOM. Has a role image, color theme gradient, and configurable size.
- **Role** — The pet's occupational identity (Teacher / Doctor / Pastry Chef / Police Officer). Determines appearance. Four roles.
- **Popup** — The `action.default_popup` page. A React 15 settings panel. Lives as a short-lived, ephemeral page — closes on outside click.
- **Content Script** — Declared in `manifest.json`'s `content_scripts`. Runs in the ISOLATED world at `document_end`. Has `chrome.runtime.*` APIs but cannot see page JS globals.
- **MAIN World** — The web page's own JS execution context. After bootstrap self-injects, `window.YiPet` is accessible from DevTools (page context, not extension context).
- **ISOLATED World** — Default content script environment. Shares page DOM but not JS globals. Use `"world": "ISOLATED"` (MV3 default).
- **CDN Catalog** — Resource manifest in `src/content/catalog.ts` (the `CDN_CATALOG` array). Maps short keys (`vue`, `react`, `gsap`) to file paths under `cdn/vendor/`. All local — no remote CDN.
- **Bootstrap** — Not CSS Bootstrap. Refers to `src/content/bootstrap.ts`, the dual-world entry that self-injects into MAIN world and sets up `window.YiPet`.

### Relationship Map

- **Popup → Content Script → MAIN World:** User toggles → `chrome.tabs.sendMessage({ action })` → content script relays → page DOM updates.
- **Bootstrap → CDN Catalog:** Bootstrap injects JS (sequential) and CSS (parallel) from the catalog on every page load.
- **Config → Popup (via data.ts):** `defaults.ts` + `config.ts` → `data.ts` adapts into `PopupConfig` → React components consume.
- **Popup Services → Chrome APIs:** `services/chrome.ts` wraps `chrome.tabs.*`/`chrome.storage.*`; `services/connect.ts` pings content script with backoff; `services/notify.ts` manages toast auto-dismiss.
- **API Services → YiAi Backend:** `src/api/services/*.ts` → `client.ts` → `fetch()` to `http://localhost:10086`.
