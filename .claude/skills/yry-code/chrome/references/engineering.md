# Engineering & Publishing

> Covers the full engineering pipeline: module system, CDN bootstrap,
> config layering, service factories, TypeScript, bundling, testing, CI,
> versioning, and Chrome Web Store submission. All projects use
> **Vite + TypeScript** as the build toolchain. Patterns are drawn from
> real extension codebases — see YiPet for the CDN catalog and popup
> component patterns that inform the approach below.

## Project Layout

A single layout that scales from a minimal popup to a multi-surface
extension with CDN resource injection. Uses **Vite + TypeScript** as the
build toolchain; third-party dependencies live under `public/cdn/vendor/`
(copied as-is to `dist/` — MV3 CSP compliant, no remote fetch).

```
my-extension/
├── manifest.json
├── src/
│   ├── background/
│   │   └── index.ts              # service worker entry
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts              # root component + mount
│   │   ├── popup.css             # layout styles
│   │   ├── data.ts               # config → popup shape adapter
│   │   ├── services/             # one factory per concern
│   │   │   ├── chrome.ts         #   chrome.tabs/storage wrapper
│   │   │   ├── connect.ts        #   connection manager (ping + backoff)
│   │   │   └── notify.ts         #   toast notification (auto-dismiss)
│   │   └── components/           # one folder per UI component
│   │       ├── AppHeader/
│   │       │   ├── AppHeader.ts
│   │       │   └── AppHeader.css
│   │       ├── SettingsCard/
│   │       │   ├── SettingsCard.ts
│   │       │   └── SettingsCard.css
│   │       └── ...
│   ├── options/                  # same shape as popup/
│   ├── sidepanel/                # sidePanel entry — same shape as popup/
│   ├── content/
│   │   ├── index.ts              # content script entry
│   │   ├── bootstrap.ts          # dual-world self-injection + YiPet API
│   │   ├── catalog.ts            # CDN resource catalog
│   │   └── injector.ts           # script/link DOM injector
│   ├── offscreen/                # offscreen document entry
│   ├── config/
│   │   ├── defaults.ts           # pure data — no logic
│   │   └── config.ts             # env-aware orchestrator + URL builders
│   └── shared/
│       ├── messages.ts           # IPC message type definitions
│       ├── state.ts              # chrome.storage read/write helpers
│       └── component.ts          # lifecycle contract (mount/ready/unmount)
├── public/
│   ├── cdn/                      # copied to dist/ as-is — local only
│   │   ├── styles/
│   │   │   ├── variables.css     #   CSS design tokens
│   │   │   └── reset.css         #   browser default reset
│   │   ├── utils/
│   │   │   ├── url.ts            #   UrlBuilder
│   │   │   └── log.ts            #   LoggerUtils (dev-mode silent)
│   │   └── vendor/
│   │       ├── react@18.3.1/     #   react.production.min.js + react-dom
│   │       ├── vue@3.5.13/       #   vue.global.prod.js
│   │       ├── bootstrap@5.3.3/  #   bootstrap.bundle.min.js + bootstrap.min.css
│   │       ├── gsap/             #   TweenMax.min.js
│   │       ├── dayjs@1.11.21/    #   dayjs.min.js + locale + plugins
│   │       ├── apexcharts@3.46.0/#   apexcharts.min.js
│   │       └── ...               #   other versioned minified libs
│   ├── icons/                    # 16, 32, 48, 128 px PNGs
│   ├── images/                   # role/theme images
│   └── _locales/<lang>/messages.json
├── rules/                        # declarativeNetRequest rule files
├── tests/
│   ├── unit/                     # vitest
│   └── e2e/                      # playwright (chromium channel)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Key decisions in this layout:**

1. **`public/cdn/vendor/` is the local dependency store.** Every
   third-party library is versioned here as a pre-bundled `.min.js` or
   `.min.css` file. Vite copies `public/` → `dist/` as-is. Content
   scripts inject these into the page DOM at runtime via
   `chrome-extension://` URLs. The CDN catalog in `catalog.ts` maps
   short keys (e.g. `vue`, `dayjs`) to these paths.
2. **Config is layered.** `defaults.ts` → `config.ts` → `data.ts`
   (popup adapter). Three single-purpose layers, not one fat file.
3. **Popup is a component tree.** `components/` has one folder per UI
   component, each with co-located `.ts` + `.css`. `services/` has
   one factory per cross-cutting concern. `data.ts` projects
   `config.ts` into the shape the popup expects.
4. **Content script is dual-world.** `bootstrap.ts` self-injects from
   ISOLATED → MAIN world to expose `window.YiPet` for DevTools access.
   `index.ts` handles the standard content script responsibilities
   (DOM mutation, message relay).
5. **`shared/` is the contract layer.** `messages.ts` is the single
   source of truth for all IPC; `component.ts` defines the lifecycle
   interface every surface implements.

## Module System & Component File Structure

Every file is an ES module with explicit imports — no global namespace,
no IIFE wrappers, no `<script>` tag ordering. Vite resolves the import
graph; the directory structure IS the namespace.

### Module Export Contract

Each directory maps 1:1 to the component structure. What YiPet's
`window.YiPetPopup.components.AppHeader` expressed as a global
namespace, `import { AppHeader } from './components/AppHeader/AppHeader'`
expresses as a static import:

```
src/popup/
├── popup.tsx           → exports <Popup /> (root component + mount)
├── data.ts             → exports createPopupConfig(cfg: AppConfig): PopupConfig
├── services/
│   ├── chrome.ts       → exports createChromeService(tabRef): ChromeService
│   ├── connect.ts      → exports connect(deps): void
│   └── notify.ts       → exports createNotifyController(deps): NotifyController
└── components/
    ├── AppHeader/
    │   ├── AppHeader.tsx → exports AppHeader(props): ReactNode
    │   └── AppHeader.css → co-located styles
    ├── SettingsCard/
    │   ├── SettingsCard.tsx
    │   └── SettingsCard.css
    └── ...
```

### Per-Component Co-Location

Each UI component is a folder containing its TSX and CSS. This is the
same directory-per-component pattern from YiPet's `popup/components/`,
lifted into ES modules:

```tsx
// src/popup/components/AppHeader/AppHeader.tsx
import type { FC } from "react";
import "./AppHeader.css";

export interface AppHeaderProps {
  model: string | null;
  visible: boolean;
  statusText: string;
}

export const AppHeader: FC<AppHeaderProps> = ({ model, visible, statusText }) => (
  <header className="app-header">
    <span className={`status-dot ${visible ? "active" : ""}`} />
    <span className="status-text">{statusText}</span>
    {model && <span className="model-badge">{model}</span>}
  </header>
);
```

```css
/* src/popup/components/AppHeader/AppHeader.css */
.app-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
}
.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-inactive);
}
.status-dot.active { background: var(--color-success); }
```

### Popup Entry — Composing the Component Tree

The root component wires services → connection discovery → state
restoration → UI render in a single `useEffect`:

```tsx
// src/popup/popup.tsx
import { useRef, useState, useEffect, useMemo } from "react";
import { createChromeService } from "./services/chrome";
import { createNotificationController } from "./services/notify";
import { connectToContentScript } from "./services/connect";
import { createPopupConfig } from "./data";
import { createConfig, type Env } from "../config/config";
import { AppHeader } from "./components/AppHeader/AppHeader";
import { SettingsCard } from "./components/SettingsCard/SettingsCard";
import { Notification } from "./components/Notification/Notification";
import type { PopupConfig } from "./data";

declare const VITE_ENV: Env;
declare const VITE_API_BASE: string;

const cfg: AppConfig = createConfig(VITE_ENV, VITE_API_BASE);
const popupConfig: PopupConfig = createPopupConfig(cfg);

export function Popup() {
  const tabRef = useRef<chrome.tabs.Tab | null>(null);
  const timerRef = useRef<number | null>(null);

  const [prefs, setPrefs] = useState<Record<string, unknown>>({});
  const [ready, setReady] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    visible: false, message: "", type: "info",
  });

  const chromeSvc = useMemo(() => createChromeService(tabRef), []);
  const notify = useMemo(
    () => createNotificationController(setNotification, timerRef),
    []
  );

  useEffect(() => {
    chromeSvc.getActiveTab().then((tab) => {
      if (!tab) {
        notify.show("Cannot access current tab", "error");
        return;
      }

      // Transient notification if content script is unavailable
      const fallbackTimer = setTimeout(() => {
        notify.show("Content script may be starting up", "info");
      }, 800);

      connectToContentScript({
        sendMessage: (msg) => chromeSvc.sendMessage(msg),
        loadState: () => chromeSvc.loadState(),
        onConnected: (stored) => {
          clearTimeout(fallbackTimer);
          if (stored) setPrefs((p) => ({ ...p, ...stored }));
          setReady(true);
        },
        onFailed: () => {
          clearTimeout(fallbackTimer);
          notify.show("Page is not ready", "error");
          setReady(true); // controls still work; content script is absent
        },
      });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="popup-container">
      <AppHeader
        model={prefs.model as string | null}
        visible={(prefs.visible as boolean) ?? false}
        statusText={ready ? "Ready" : "Connecting…"}
      />
      <SettingsCard
        config={popupConfig}
        prefs={prefs}
        disabled={!ready}
        onChange={(patch) => {
          setPrefs((p) => ({ ...p, ...patch }));
          chromeSvc.sendMessage({ action: "applyPrefs", prefs: patch });
          chromeSvc.saveState(patch);
        }}
      />
      <Notification {...notification} />
    </div>
  );
}
```

### Key Rules

1. **Every dependency is in the import graph.** No hidden coupling, no
   `window.something.global`. Tree-shaking eliminates unused code.
2. **Co-location: TSX + CSS in one folder.** A component's styles live
   next to its logic. Deleting the folder removes everything.
3. **Services are factories, not singletons.** Each call to
   `createChromeService(tabRef)` returns a fresh instance bound to a
   specific tab ref.
4. **Cleanup in the effect return.** Timer handles, event listeners,
   and subscription callbacks are all torn down when the component
   unmounts.

## CDN Bootstrap & Resource Injection

When an extension injects third-party libraries into the page's MAIN
world on demand (DevTools console, runtime feature toggles), maintain a
**catalog module** that maps short keys to file paths and global checks.
This is the core pattern from YiPet's bootstrap, expressed in TypeScript.

### Catalog (`src/content/catalog.ts`)

A single array of entries — the source of truth for every injectable
resource:

```ts
// src/content/catalog.ts
export interface CdnEntry {
  key: string;         // short key, e.g. 'vue', 'dayjs'
  path: string;        // relative to CDN base, e.g. 'vendor/vue@3.5.13/vue.global.prod.js'
  type: 'js' | 'css';
  global?: string;     // window property to check for already-loaded
  desc: string;        // human-readable label
}

export const CDN_CATALOG: CdnEntry[] = [
  // Frameworks
  { key: 'vue',       path: 'vendor/vue@3.5.13/vue.global.prod.js',
    type: 'js',  global: 'Vue',      desc: 'Vue 3.5.13' },
  { key: 'react',     path: 'vendor/react@18.3.1/react.production.min.js',
    type: 'js',  global: 'React',    desc: 'React 18.3.1' },
  { key: 'react-dom', path: 'vendor/react@18.3.1/react-dom.production.min.js',
    type: 'js',  global: 'ReactDOM', desc: 'ReactDOM 18.3.1' },
  // UI Frameworks
  { key: 'bootstrap', path: 'vendor/bootstrap@5.3.3/js/bootstrap.bundle.min.js',
    type: 'js',  global: 'bootstrap', desc: 'Bootstrap 5.3.3 JS' },
  { key: 'bootstrap-css', path: 'vendor/bootstrap@5.3.3/css/bootstrap.min.css',
    type: 'css', desc: 'Bootstrap 5.3.3 CSS' },
  // Charts
  { key: 'apexcharts', path: 'vendor/apexcharts@3.46.0/apexcharts.min.js',
    type: 'js',  global: 'ApexCharts', desc: 'ApexCharts 3.46.0' },
  // Date & time
  { key: 'dayjs',     path: 'vendor/dayjs@1.11.21/dayjs.min.js',
    type: 'js',  global: 'dayjs',    desc: 'Day.js 1.11.21' },
  // Export
  { key: 'html2canvas', path: 'vendor/html2canvas@1.4.1/html2canvas.min.js',
    type: 'js',  global: 'html2canvas', desc: 'html2canvas 1.4.1' },
  // ... more entries as needed
];

/** Index by key for O(1) lookup. */
export const catalogByKey: Record<string, CdnEntry> = Object.fromEntries(
  CDN_CATALOG.map(e => [e.key, e])
);
```

### Injector (`src/content/injector.ts`)

A factory that creates load functions bound to a CDN base URL. JS
injection is async (Promise-based); CSS injection is synchronous:

```ts
// src/content/injector.ts
import { CDN_CATALOG, catalogByKey, type CdnEntry } from './catalog';

export interface CdnInjector {
  loadJS(path: string): Promise<boolean>;
  loadCSS(path: string): boolean;
  loadByKey(key: string): Promise<boolean> | boolean;
  injectAll(): Promise<void>;
  isLoaded(path: string): boolean;
}

export function createInjector(baseUrl: string): CdnInjector {
  const loaded = new Map<string, boolean>();

  function resolveUrl(path: string): string {
    return baseUrl + path;
  }

  function loadJS(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (loaded.has(path)) { resolve(false); return; }
      const el = document.createElement('script');
      el.src = resolveUrl(path);
      el.onload = () => { loaded.set(path, true); resolve(true); };
      el.onerror = () => reject(new Error(`Failed to load: ${path}`));
      document.head.appendChild(el);
    });
  }

  function loadCSS(path: string): boolean {
    if (loaded.has(path)) return false;
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = resolveUrl(path);
    el.onload = () => { loaded.set(path, true); };
    document.head.appendChild(el);
    loaded.set(path, true);
    return true;
  }

  function loadByKey(key: string): Promise<boolean> | boolean {
    const entry = catalogByKey[key];
    if (!entry) {
      console.warn(`[CDN] Unknown resource: "${key}"`);
      return false;
    }
    // Skip if already present on page
    if (entry.global && (window as any)[entry.global] !== undefined) {
      console.log(`⊘ ${entry.desc} — already present, skipped`);
      return entry.type === 'js' ? Promise.resolve(false) : false;
    }
    return entry.type === 'js' ? loadJS(entry.path) : loadCSS(entry.path);
  }

  async function injectAll(): Promise<void> {
    // CSS first (order-safe, parallel injection)
    for (const entry of CDN_CATALOG) {
      if (entry.type === 'css') loadCSS(entry.path);
    }
    // JS: sequential to respect inter-library dependencies
    for (const entry of CDN_CATALOG) {
      if (entry.type === 'js') {
        try { await loadJS(entry.path); } catch { /* continue */ }
      }
    }
  }

  function isLoaded(path: string): boolean {
    return loaded.has(path);
  }

  return { loadJS, loadCSS, loadByKey, injectAll, isLoaded };
}
```

### Shorthand Methods (Dynamic API Surface)

Attach shortcut methods to the public API so users can call
`YiPet.vue()` instead of `YiPet.loadByKey('vue')`:

```ts
// src/content/bootstrap.ts (inside createYiPet)
function attachShortcuts(api: Record<string, unknown>, injector: CdnInjector) {
  for (const entry of CDN_CATALOG) {
    // Convert kebab-case key to camelCase method name
    // e.g. 'bootstrap-css' → 'bootstrapCSS'
    const method = entry.key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (!(method in api)) {
      api[method] = () => injector.loadByKey(entry.key);
    }
  }
}
```

**Key rules for the CDN catalog:**

1. **Single source of truth.** The catalog array is the ONLY place that
   maps keys to paths. Nothing is hardcoded elsewhere.
2. **Global detection before injection.** Check `window[entry.global]`
   before creating a `<script>` tag. If the page already loaded Vue,
   skip the injection.
3. **CSS first, JS sequential.** CSS is order-safe and injected in
   parallel. JS respects inter-library dependencies (e.g. jQuery before
   Bootstrap) and loads sequentially.
4. **All resources are local.** Every path resolves to
   `chrome-extension://<id>/cdn/...` — no remote CDN, no `eval`, MV3
   CSP compliant.
5. **`web_accessible_resources` must list every injected file.** Use
   globs: `"cdn/**/*.js"`, `"cdn/**/*.css"`.

## Config Layering

Don't put config, defaults, and env detection in one file. Use a
three-layer pattern:

```
defaults.ts  →  config.ts  →  data.ts  →  popup components
 (pure data)   (env + URLs)   (popup adapter)   (consume popupConfig)
```

**Layer 1 — `defaults.ts`:** Pure data, no logic. Declares default
values, endpoint templates, timing constants, error messages:

```ts
// src/config/defaults.ts
export const PET_DEFAULTS = {
  defaultVisible: false,
  defaultSize: 260,
  defaultColorIndex: 0,
  sizeLimits: { min: 80, max: 400 },
} as const;

export const PET_ENDPOINTS = {
  chat: '/api/v1/chat',
  stream: '/api/v1/stream',
  health: '/api/v1/health',
} as const;
```

**Layer 2 — `config.ts`:** Reads defaults, applies environment
overrides (`production` / `staging` / `development`), attaches URL
builder functions:

```ts
// src/config/config.ts
import { PET_DEFAULTS, PET_ENDPOINTS } from './defaults';

export type Env = 'production' | 'staging' | 'development';

export function createConfig(env: Env, apiBase: string) {
  const isProd = env === 'production';

  return {
    env,
    constants: {
      DEFAULTS: {
        PET_ROLE: 'Teacher' as const,
        VERSION: '1.0.0',
      },
      TIMING: {
        NOTIFICATION_DURATION: 3000,
      },
      RETRY: {
        MAX_RETRIES: 3,
        INITIAL_DELAY: 500,
      },
      UI: {
        STATUS_DOT_ACTIVE: '#22c55e',
        STATUS_DOT_INACTIVE: '#f59e0b',
      },
    },
    pet: { ...PET_DEFAULTS },
    // URL builders
    url(path: string): string {
      return `${apiBase}${path}`;
    },
    chatUrl(): string {
      return `${apiBase}${PET_ENDPOINTS.chat}`;
    },
  };
}

export type AppConfig = ReturnType<typeof createConfig>;
```

**Layer 3 — `data.ts`:** The popup adapter. Projects `AppConfig` into
the shape the popup expects. Uses a `pick()` helper for safe nested
access with fallbacks:

```ts
// src/popup/data.ts
import type { AppConfig } from '../config/config';

/** Safe nested property access with default fallback. */
function pick<T>(obj: unknown, path: string, fallback: T): T {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null) return fallback;
    cur = (cur as Record<string, unknown>)[part];
  }
  return (cur !== undefined && cur !== null ? cur : fallback) as T;
}

export interface PopupConfig {
  ROLES: string[];
  COLORS: { value: number; label: string }[];
  SIZE: { MIN: number; MAX: number; STEP: number };
  STORAGE_KEY: string;
  TIMING: {
    NOTIFICATION_DURATION: number;
    CONNECT_RETRY_MAX: number;
    CONNECT_RETRY_BASE_MS: number;
  };
  DEFAULTS: {
    VISIBLE: boolean;
    SIZE: number;
    ROLE: string;
    COLOR: number;
  };
}

export function createPopupConfig(cfg: AppConfig): PopupConfig {
  const C = cfg.constants;
  const P = cfg.pet;

  return {
    ROLES: ['Teacher', 'Doctor', 'Pastry Chef', 'Police Officer'],
    COLORS: (P.colors || []).map((_, i) => ({
      value: i,
      label: `Theme ${i + 1}`,
    })),
    SIZE: {
      MIN: pick(P, 'sizeLimits.min', 80),
      MAX: pick(P, 'sizeLimits.max', 400),
      STEP: 10,
    },
    STORAGE_KEY: 'pet_global_state',
    TIMING: {
      NOTIFICATION_DURATION: pick(C, 'TIMING.NOTIFICATION_DURATION', 3000),
      CONNECT_RETRY_MAX: pick(C, 'RETRY.MAX_RETRIES', 3),
      CONNECT_RETRY_BASE_MS: pick(C, 'RETRY.INITIAL_DELAY', 500),
    },
    DEFAULTS: {
      VISIBLE: pick(P, 'defaultVisible', false),
      SIZE: pick(P, 'defaultSize', 260),
      ROLE: pick(C, 'DEFAULTS.PET_ROLE', 'Teacher'),
      COLOR: pick(P, 'defaultColorIndex', 0),
    },
  };
}
```

**Why three layers:** Defaults and config are reused by multiple
surfaces (popup, chat window, pet overlay). The adapter layer keeps
each surface clean — it only sees the fields it needs.

## Service Factory Pattern

Instead of singletons, extension services use factories that accept
dependencies from the caller. This is dependency injection without a
framework:

```ts
// src/popup/services/chrome.ts
export interface TabRef {
  current: chrome.tabs.Tab | null;
}

export interface ChromeService {
  getActiveTab(): Promise<chrome.tabs.Tab>;
  sendMessage(msg: unknown): Promise<unknown>;
  loadState(): Promise<Record<string, unknown>>;
  saveState(patch: Record<string, unknown>): Promise<void>;
}

export function createChromeService(tabRef: TabRef): ChromeService {
  return {
    async getActiveTab() {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      tabRef.current = tab;
      return tab;
    },

    sendMessage(msg: unknown) {
      if (!tabRef.current?.id) return Promise.resolve(null);
      return chrome.tabs.sendMessage(tabRef.current.id, msg);
    },

    async loadState() {
      const result = await chrome.storage.local.get('pet_global_state');
      return result.pet_global_state || {};
    },

    async saveState(patch: Record<string, unknown>) {
      const current = await this.loadState();
      await chrome.storage.local.set({
        pet_global_state: { ...current, ...patch },
      });
    },
  };
}
```

The factory aggregator — called once by the root component:

```ts
// src/popup/services/index.ts
import type { TabRef } from './chrome';
import { createChromeService } from './chrome';
import { createNotifyController } from './notify';

export interface PopupServices {
  chrome: ReturnType<typeof createChromeService>;
  notify: ReturnType<typeof createNotifyController>;
}

export function createPopupServices(ctx: {
  tabRef: TabRef;
  timerRef: { current: ReturnType<typeof setTimeout> | null };
  component: { rootEl: HTMLElement };
}): PopupServices {
  return {
    chrome: createChromeService(ctx.tabRef),
    notify: createNotifyController(ctx.component.rootEl, ctx.timerRef),
  };
}
```

**Why factories over singletons:**

1. **Testability** — inject mock refs and spy on method calls.
2. **Cleanup** — each component instance owns its refs; no global state
   leaks between popup opens.
3. **Explicit ownership** — the component explicitly passes `tabRef`
   and `timerRef` to the services. No hidden coupling.

## Connection Manager with Backoff

`services/connect.ts` demonstrates the fire-and-forget + retry pattern
for content script discovery:

```ts
// src/popup/services/connect.ts
export interface ConnectDeps {
  sendMessage(msg: unknown): Promise<unknown>;
  loadState(): Promise<Record<string, unknown> | null>;
  onConnected(state: Record<string, unknown> | null): void;
  onFailed(): void;
}

export function connect(
  deps: ConnectDeps,
  maxRetries = 3,
  baseMs = 500,
): void {
  let retries = 0;

  function tryConnect(): void {
    Promise.resolve(deps.sendMessage({ action: 'ping' })).then((response) => {
      if (response) {
        deps.loadState().then(deps.onConnected);
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(tryConnect, baseMs * retries); // exponential backoff
      } else {
        deps.onFailed();
      }
    });
  }

  tryConnect();
}
```

**Why discovery matters:**

- The popup can open *before* the content script has injected (race
  condition on page load).
- The content script can be absent entirely (`chrome://` pages, system
  pages, pages where the extension isn't allowed).
- Retry with backoff handles transient unavailability without
  flooding the message bus.

## Content Script Self-Injection (Dual-World Pattern)

The canonical pattern for injecting an API from the ISOLATED content
script world into the page's MAIN world, expressed in TypeScript:

```
Chrome loads dist/content/bootstrap.js as content script (ISOLATED world)
  → detects chrome.runtime.getURL() is available
  → resolves the extension base URL for CDN resources
  → creates <script src="bootstrap.js" data-base="chrome-extension://.../cdn/">
  → injects into page DOM
    → browser loads the same file again, this time in MAIN world
    → bootstrap.js detects data-base attribute (not a content script)
    → initializes window.YiPet with the resolved CDN base
    → loads all catalog resources sequentially
```

Key implementation:

```ts
// src/content/bootstrap.ts
import { createInjector, type CdnInjector } from './injector';
import { CDN_CATALOG } from './catalog';

// ── Context detection ─────────────────────────────────────────────
const _isContentScript: boolean = (() => {
  try {
    return !!(typeof chrome !== 'undefined' && chrome.runtime?.getURL);
  } catch { return false; }
})();

const _injectedBase: string =
  (typeof document !== 'undefined' && document.currentScript
    ? (document.currentScript as HTMLScriptElement).dataset?.base
    : undefined) || '';

// ── Phase 1: Content Script — inject self into MAIN world ─────────
if (_isContentScript && !_injectedBase) {
  const extBase = chrome.runtime.getURL('cdn/');
  const selfUrl = chrome.runtime.getURL('src/content/bootstrap.ts');
  // Note: the bundled output path must be in web_accessible_resources

  const el = document.createElement('script');
  el.src = selfUrl;
  el.dataset.base = extBase;
  el.id = 'yipet-bootstrap';

  el.onerror = () => {
    console.warn(
      `[YiPet] CSP blocked MAIN world injection. ` +
      `Switch DevTools console to the extension context to use YiPet.`
    );
    // Fallback: set YiPet in ISOLATED world
    createYiPet(window, extBase);
  };

  (document.head || document.documentElement).appendChild(el);
  // ISOLATED world done — return; MAIN world execution will follow
}

// ── Phase 2: MAIN world — initialize YiPet API ────────────────────
const BASE = _injectedBase || 'cdn/';
createYiPet(window, BASE);

// ── Implementation ────────────────────────────────────────────────
function createYiPet(root: typeof globalThis, BASE: string): void {
  const injector = createInjector(BASE);

  const YiPet = {
    version: '1.0.0',

    cdn(path: string): string {
      return BASE + path;
    },

    async load(pathOrKey: string): Promise<boolean> {
      try {
        return await injector.loadByKey(pathOrKey) as Promise<boolean>;
      } catch (e) {
        console.error(`[YiPet] ${e}`);
        return false;
      }
    },

    css(key: string): boolean {
      return injector.loadCSS(key);
    },

    loaded(): string[] {
      return CDN_CATALOG
        .filter(e => injector.isLoaded(e.path))
        .map(e => e.key);
    },

    list(filter?: string): void {
      const q = (filter || '').toLowerCase();
      const rows = CDN_CATALOG
        .filter(e => !q || e.key.includes(q) || e.desc.toLowerCase().includes(q))
        .map(e => ({
          Key: e.key,
          Type: e.type.toUpperCase(),
          Status: injector.isLoaded(e.path) ? '✓ Loaded' : '-',
          Description: e.desc,
        }));
      console.table(rows);
    },

    help(): void {
      console.log(
        '%c🐾 YiPet CDN Bootstrap %c v1.0.0\n' +
        '  YiPet.cdn(path)     — Get full URL\n' +
        '  YiPet.load(key)     — Load JS (async)\n' +
        '  YiPet.css(key)      — Load CSS\n' +
        '  YiPet.list(filter?) — List resources\n' +
        '  YiPet.help()        — This help',
        'color:#6366f1;font-weight:bold', 'color:#888'
      );
    },
  };

  // Attach shorthand methods: YiPet.vue(), YiPet.bootstrap(), etc.
  for (const entry of CDN_CATALOG) {
    const method = entry.key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (!(method in YiPet)) {
      (YiPet as any)[method] = () => injector.loadByKey(entry.key);
    }
  }

  (root as any).YiPet = YiPet;

  // Auto-inject all catalog resources
  injector.injectAll();
}
```

**Why this pattern:**

1. `window.YiPet` is accessible from the DevTools console (main page
   context), which is where users expect it.
2. CDN resources are resolved via `chrome-extension://` URLs — only
   the content script can call `chrome.runtime.getURL()`, so the BASE
   must be passed into the MAIN world via `data-base`.
3. If the page's CSP blocks extension scripts, the `onerror` handler
   falls back to ISOLATED-world initialization.

**Vite-specific notes:**

- The bundled `bootstrap.js` must be in `web_accessible_resources`.
- Use `vite.config.ts` multi-entry to produce a separate bundle for
  the bootstrap that runs in both worlds (see Bundling section).
- The `_isContentScript` check uses a try/catch because `chrome` may
  not exist in the MAIN world.

## Component Architecture

A Chrome extension is a distributed system of loosely coupled
components, each with a distinct lifecycle, runtime environment, and
permission boundary. Thinking in components — not a monolith — is the
key difference between a maintainable extension and one that collapses
under its own weight.

### Guiding Principles

1. **Single responsibility.** Each component has one reason to
   change. The popup handles user input; the content script drives the
   page DOM; the background worker routes messages and manages
   persistent state.
2. **Explicit contracts.** Every cross-component boundary has a
   documented message schema. No "I know the other side will
   understand this shape."
3. **Graceful degradation.** No component assumes another is present.
   If the content script hasn't loaded yet, the popup shows "Ready
   (Offline)" — not a crash.
4. **Isolation in depth.** A bug in the content script should not
   break the options page. A heavy popup render should not delay the
   background worker's cold start. Each surface fails independently.

### Component Decomposition

Every extension surface maps to an independently testable component:

| Component | Runtime | Lifecycle | Has DOM | Has chrome.* APIs | Depends on |
|---|---|---|---|---|---|
| **Background** (service worker) | worker thread | event-driven, ~30s idle teardown | no | yes (full) | — (root of trust) |
| **Popup** (`action.default_popup`) | isolated page | open → close (ephemeral) | yes | limited | Background (for state), Content Script (for tab commands) |
| **Options** (`options_ui`) | isolated page | open → close / tab stays | yes | limited | Background (for state) |
| **Side Panel** (`sidePanel`) | isolated page | per-tab, persists while open | yes | limited | Background + Content Script (per-tab) |
| **Content Script** | injected into page's ISOLATED world | page load → unload | yes (shared DOM) | partial | Background (for storage relay) |
| **Offscreen Document** | hidden page | created → explicitly closed | yes | partial | Background (creator + message relay) |

**Rule of thumb:** two surfaces is fine (content script + popup);
three is a deliberate choice; four or more should trigger a
re-evaluation.

### Component Lifecycle Contract

Every component follows a three-phase lifecycle. Formalizing this as
an interface makes testing, onboarding, and debugging predictable:

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│  mount() │ ──→ │  ready()  │ ──→ │ unmount()│
│ (setup)  │     │(operating)│     │(cleanup) │
└──────────┘     └───────────┘     └──────────┘
                      │
                      ├─ onMessage(msg)   — handle incoming IPC
                      ├─ onStateChange()  — react to storage changes
                      └─ onError(err)     — component-level error
```

| Phase | Responsibility | Fail mode |
|---|---|---|
| `mount()` | Register listeners, create DOM, connect to dependencies | Fail fast — log and report the reason |
| `ready()` | Announce readiness, enable UI controls, start accepting messages | Already mounted; can retry discovery |
| `unmount()` | Remove listeners, destroy DOM, clear timers, disconnect ports | Must never throw — wrap in try/finally |

```ts
// src/shared/component.ts — lifecycle contract
export interface ExtensionComponent {
  readonly id: string;
  mount(): Promise<void>;
  unmount(): Promise<void>;
  readonly isReady: boolean;
}

// src/popup/popup.ts — implements the contract
class PopupComponent implements ExtensionComponent {
  readonly id = "popup";
  isReady = false;
  private rootEl!: HTMLElement;
  private listeners: (() => void)[] = [];

  async mount() {
    this.renderShell();                          // instant shell
    const stored = await chrome.storage.local.get();
    this.patchData(stored);                      // non-blocking
    this.isReady = true;
    this.enableControls();
  }

  async unmount() {
    try {
      this.isReady = false;
      this.listeners.forEach(fn => fn());        // remove all listeners
      this.listeners = [];
      this.clearTimers();
    } catch (e) {
      console.error("[popup] unmount error:", e);
    }
  }

  private renderShell() { /* ... */ }
  private patchData(_data: Record<string, unknown>) { /* ... */ }
  private enableControls() { /* ... */ }
  private clearTimers() { /* ... */ }
}
```

### Component Composition & Topology

An extension's topology is the graph of which component talks to
which. Document it explicitly. A two-surface topology:

```
┌──────────────────────────────────────────────────────────┐
│  Extension Topology                                       │
│                                                           │
│  ┌──────────────┐    chrome.tabs.sendMessage    ┌───────┐ │
│  │   Popup      │ ──────────────────────────→  │Content│ │
│  │(action_popup)│ ←──────────────────────────  │Script │ │
│  │              │    { success, visible, ... }  │       │ │
│  └──────┬───────┘                               └───┬───┘ │
│         │                                           │     │
│         │ chrome.storage.local                      │     │
│         │ (read/write global state)                 │     │
│         ▼                                           ▼     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              chrome.storage.local                     │ │
│  │       pet_global_state: { visible, size, role, ... }  │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Rules for documenting topology:**

1. Draw the graph. Two components and an arrow is enough.
2. Label each edge with the API used (`chrome.tabs.sendMessage`,
   `chrome.storage.local`, `chrome.runtime.connect`).
3. Note the direction. Popup *sends* commands; Content Script
   *responds* with results. State flows both ways through storage.
4. When adding a third component (e.g. Options page), redraw the
   graph before writing code. The new component must fit.

### Component Discovery

Components discover each other at runtime. The canonical pattern is a
**ping handshake** with retry:

```
Popup opens → sends { action: "ping" } to content script
  ├─ response received → content script is ready → restore state → enable controls
  ├─ null / error → retry with exponential backoff (500ms, 1000ms, 1500ms)
  └─ max retries exhausted → show "Ready (Offline)" → controls work without the content script
```

See the Connection Manager with Backoff section above for the
implementation.

### Component Error Boundaries

No component should crash another. Each surface isolates failures:

```ts
// src/shared/error-boundary.ts
export function wrapComponent(
  component: ExtensionComponent
): ExtensionComponent {
  const originalMount = component.mount.bind(component);
  const originalUnmount = component.unmount.bind(component);

  return {
    ...component,
    async mount() {
      try {
        await originalMount();
      } catch (err) {
        console.error(`[${component.id}] mount failed:`, err);
        component.isReady = false; // degrade gracefully
      }
    },
    async unmount() {
      try {
        await originalUnmount();
      } catch (err) {
        console.error(`[${component.id}] unmount failed:`, err);
        // unmount failures are logged but never re-thrown
      }
    },
  };
}
```

Error boundary rules:

- **Service factories return `null`** when a dependency is
  unavailable. Callers check `if (!this._chrome) return` before every
  message send.
- **CSS loading failures don't break JS.** A missing `.css` file
  leaves the popup unstyled but functional.
- **Timer cleanup in `unmount()`** prevents state updates on
  unmounted components.

### Component Contract — Message Types as Shared Schema

Every component communicates via `chrome.runtime.sendMessage` /
`chrome.tabs.sendMessage` / `chrome.runtime.connect`. These calls
cross trust boundaries — the receiver has no compile-time knowledge of
who sent the message. Define a shared message schema in
`src/shared/messages.ts`:

```ts
// src/shared/messages.ts — the single source of truth for all IPC

// --- Direction: Popup → Content Script ---
export type PopupToContent =
  | { type: "ping" }
  | { type: "toggleVisibility" }
  | { type: "changeSize"; size: number }
  | { type: "setRole"; role: string }
  | { type: "setColor"; color: number };

// --- Direction: Content Script → Popup (response) ---
export type ContentToPopup =
  | { type: "pong"; success: true }
  | { type: "visibilityChanged"; visible: boolean }
  | { type: "stateUpdated"; state: Partial<AppState> };

// --- Response wrappers ---
export type MessageResponse<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
```

### Cross-Component State Management

Components share state through `chrome.storage` — never through
module-level variables:

```ts
// src/shared/state.ts
import type { UserPrefs } from "./messages";

const DEFAULT_PREFS: UserPrefs = {
  theme: "auto",
  fontSize: 14,
  features: {},
};

// Single writer pattern: only one component writes prefs
export async function getPrefs(): Promise<UserPrefs> {
  const { prefs } = await chrome.storage.local.get("prefs");
  return { ...DEFAULT_PREFS, ...(prefs ?? {}) };
}

export async function setPrefs(patch: Partial<UserPrefs>): Promise<UserPrefs> {
  const current = await getPrefs();
  const updated = { ...current, ...patch };
  await chrome.storage.local.set({ prefs: updated });
  return updated;
}

// React to external changes (e.g. options page changed a setting)
export function onPrefsChanged(cb: (prefs: UserPrefs) => void): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string
  ) => {
    if (area === "local" && changes.prefs) {
      cb(changes.prefs.newValue as UserPrefs);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
```

## Internationalization & Timezone

Chrome extensions ship globally. Every user-facing string and every
timestamp must adapt to the user's locale and timezone. Chrome's
built-in `chrome.i18n` API covers string localization; timezone
handling is a data-layer concern solved with `Intl` and dayjs.

### Chrome i18n: `_locales/` + `chrome.i18n`

Chrome resolves localized strings from a `_locales/<locale>/messages.json`
directory. Each locale gets one file; Chrome selects the best match
from the user's browser language preferences.

```
public/_locales/
├── en/
│   └── messages.json
├── zh_CN/
│   └── messages.json
├── ja/
│   └── messages.json
└── ...
```

**messages.json format:**

```jsonc
// public/_locales/en/messages.json
{
  "extName":        { "message": "My Extension" },
  "extDescription": { "message": "A helpful browser companion" },
  "popupTitle":     { "message": "Settings" },
  "btnSave":        { "message": "Save" },
  "btnCancel":      { "message": "Cancel" },

  "greeting": {
    "message": "Hello, $NAME$!",
    "placeholders": {
      "name": { "content": "$1", "example": "Alice" }
    }
  },

  "itemCount": {
    "message": "You have $COUNT$ item(s)",
    "placeholders": {
      "count": { "content": "$1", "example": "3" }
    }
  }
}
```

```jsonc
// public/_locales/zh_CN/messages.json
{
  "extName":        { "message": "我的扩展" },
  "popupTitle":     { "message": "设置" },
  "greeting": {
    "message": "你好，$NAME$！",
    "placeholders": {
      "name": { "content": "$1", "example": "小明" }
    }
  }
}
```

### Manifest & HTML i18n

Use `__MSG_key__` placeholders in `manifest.json` and HTML files:

```jsonc
// manifest.json
{
  "name": "__MSG_extName__",
  "description": "__MSG_extDescription__",
  "default_locale": "en"
}
```

```html
<!-- popup/popup.html -->
<!DOCTYPE html>
<html lang="__MSG_@@ui_locale__">
<head>
  <meta charset="UTF-8" />
  <title data-i18n="popupTitle">__MSG_popupTitle__</title>
</head>
<body>
  <button id="save-btn">__MSG_btnSave__</button>
</body>
</html>
```

The `@@ui_locale` predefined message resolves to the active locale
code (e.g. `en`, `zh_CN`). Set it on `<html lang>` so CSS `:lang()`
selectors and screen readers work correctly.

### Type-Safe i18n Wrapper

`chrome.i18n.getMessage(key, ...substitutions)` accepts raw strings.
Wrap it in a typed module so TypeScript catches missing keys at
compile time:

```ts
// src/shared/i18n.ts

/**
 * All known message keys — derived from _locales/en/messages.json.
 * Generate this type with a build script or maintain it manually.
 */
export type MessageKey =
  | 'extName'
  | 'extDescription'
  | 'popupTitle'
  | 'btnSave'
  | 'btnCancel'
  | 'greeting'
  | 'itemCount'
  | 'errorNetworkTimeout'
  | 'errorPermissionDenied'
  // ... add every key from your messages.json

/**
 * Typed wrapper around chrome.i18n.getMessage.
 * Falls back to the key itself when no translation is found (dev safety).
 */
export function t(key: MessageKey, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/**
 * Convenience: inject translated strings into DOM elements with [data-i18n].
 * Call once after mount.
 */
export function localizeDOM(root: HTMLElement = document.body): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as MessageKey;
    if (key) el.textContent = t(key);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle as MessageKey;
    if (key) el.title = t(key);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder as MessageKey;
    if (key && el instanceof HTMLInputElement) el.placeholder = t(key);
  });
}
```

**Usage in components:**

```ts
// src/popup/components/SettingsCard/SettingsCard.ts
import { t, localizeDOM } from '../../../shared/i18n';

export function SettingsCard(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <h2 data-i18n="popupTitle">__MSG_popupTitle__</h2>
    <p>${t('greeting', 'Alice')}</p>
    <button data-i18n="btnSave">__MSG_btnSave__</button>
  `;
  return root;
}

// Or: call localizeDOM after mount to process [data-i18n] attributes
// in static HTML — no need to manually call t() for each element.
```

**Why both `__MSG_xxx__` in HTML and `[data-i18n]`:**
- `__MSG_xxx__` is processed by Chrome at HTML parse time — reliable
  initial render.
- `[data-i18n]` + `localizeDOM()` enables dynamic locale switching
  without reloading the extension page.

### Message Organization

Naming conventions for message keys keep a growing locale file
navigable:

| Prefix | Scope | Example |
|---|---|---|
| `ext` | Extension metadata | `extName`, `extDescription` |
| `popup` | Popup surface | `popupTitle`, `popupStatusReady` |
| `options` | Options page | `optionsThemeLabel`, `optionsResetConfirm` |
| `cmd` | Keyboard command descriptions | `cmdToggleVisibility` |
| `error` | Error messages | `errorNetworkTimeout`, `errorTabNotFound` |
| `notify` | Toast notifications | `notifySaved`, `notifySizeUpdated` |
| `label` | Generic UI labels | `labelOk`, `labelCancel`, `labelClose` |

**Placeholder conventions:**
- Use `$NAME$` with uppercase for named placeholders.
- Use `$1`, `$2` for positional substitutions passed as an array.
- Declare `placeholders` in messages.json for every placeholder so
  translators see the intent.

### Locale Detection & Dynamic Switching

Chrome picks the best locale at install time and sticks with it. For
runtime switching (user preference override), you need a custom layer:

```ts
// src/shared/locale.ts
import type { MessageKey } from './i18n';

const STORAGE_KEY = 'user_locale';

/** Supported locales — must match _locales/ directories. */
export const SUPPORTED_LOCALES = ['en', 'zh_CN', 'ja', 'ko', 'de', 'fr', 'es'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

/** Resolve the effective locale: user preference → browser → default. */
export function getEffectiveLocale(): SupportedLocale {
  // 1. Chrome's built-in locale
  const chromeLocale = chrome.i18n.getUILanguage(); // e.g. "zh-CN", "en-US"
  const base = chromeLocale.split('-')[0];           // e.g. "zh", "en"

  // 2. Check for user override in storage (async — use in mount phase)
  //    For sync code paths, fall back to chromeLocale.

  // 3. Best match: try full locale, then base, then 'en'
  if (SUPPORTED_LOCALES.includes(chromeLocale as SupportedLocale)) {
    return chromeLocale as SupportedLocale;
  }
  if (base && SUPPORTED_LOCALES.includes(base as SupportedLocale)) {
    return base as SupportedLocale;
  }
  return 'en';
}

/** Persist user locale preference. */
export async function setUserLocale(locale: SupportedLocale): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: locale });
}

/** Load persisted locale preference. Returns null if never set. */
export async function getUserLocale(): Promise<SupportedLocale | null> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const val = result[STORAGE_KEY];
  if (val && SUPPORTED_LOCALES.includes(val as SupportedLocale)) {
    return val as SupportedLocale;
  }
  return null;
}
```

**Dynamic locale switching** (for popup / options pages):

```ts
// src/popup/popup.ts — in mount()
async mount() {
  // 1. Load user preference
  const stored = await getUserLocale();
  const effective = stored || getEffectiveLocale();

  // 2. Set <html lang> for CSS :lang() selectors
  document.documentElement.lang = effective;

  // 3. Re-localize all [data-i18n] elements
  localizeDOM();

  // 4. Handle RTL locales
  const rtlLocales = ['ar', 'fa', 'he', 'ur'];
  document.documentElement.dir = rtlLocales.includes(effective) ? 'rtl' : 'ltr';
}
```

**RTL (right-to-left) support:**

Keep RTL in mind from the start — it's much cheaper than retrofitting.
Two rules:

1. **Logical CSS properties** — use `margin-inline-start` instead of
   `margin-left`, `padding-inline-end` instead of `padding-right`,
   `inset-inline` instead of `left`/`right`. These flip automatically
   with `dir="rtl"`.
2. **Direction-aware icons** — arrows, chevrons, and back/forward
   icons should mirror in RTL. Use `transform: scaleX(-1)` on
   `<html dir="rtl">` for purely directional icons, or swap icon
   names programmatically.

```css
/* RTL-safe layout */
.settings-row {
  padding-inline-start: 16px;
  padding-inline-end: 8px;
}

.modal-close {
  inset-inline-end: 12px; /* right in LTR, left in RTL */
}

/* Flip directional icons */
html[dir="rtl"] .icon-chevron-right,
html[dir="rtl"] .icon-arrow-forward {
  transform: scaleX(-1);
}
```

### Multi-Timezone

Timezones are a data-layer concern independent of locale — a user
can prefer English (locale) while living in Tokyo (timezone). Handle
them separately.

#### UTC-First Storage

**Always store timestamps in UTC.** Every database, every
`chrome.storage.local` write, every API payload. UTC is the only
timezone with no ambiguity:

```ts
// src/shared/datetime.ts

/** Get the current instant as an ISO 8601 UTC string. */
export function nowUTC(): string {
  return new Date().toISOString(); // → "2026-07-26T09:30:00.000Z"
}

/** Convert a UTC timestamp to the user's local timezone for display. */
export function formatDateTime(
  utcISO: string,
  locale: string,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(utcISO);
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(date);
}

/** Format a UTC timestamp as relative time (e.g. "3 minutes ago"). */
export function formatRelativeTime(
  utcISO: string,
  locale: string,
): string {
  const now = Date.now();
  const then = new Date(utcISO).getTime();
  const diffMs = now - then;
  const diffSec = Math.round(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second');
  if (Math.abs(diffSec) < 3600) return rtf.format(-Math.round(diffSec / 60), 'minute');
  if (Math.abs(diffSec) < 86400) return rtf.format(-Math.round(diffSec / 3600), 'hour');
  if (Math.abs(diffSec) < 2592000) return rtf.format(-Math.round(diffSec / 86400), 'day');
  return rtf.format(-Math.round(diffSec / 2592000), 'month');
}
```

#### Timezone Detection

The browser always knows the user's timezone — no permission needed:

```ts
/** Detect the user's system timezone (IANA name, e.g. "Asia/Tokyo"). */
export function detectTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

#### Timezone Preference Flow

Users may want a different timezone than their system setting
(e.g. remote workers, travelers). Use the same pattern as locale —
system default with a persisted override:

```ts
// src/shared/timezone.ts
export const STORAGE_KEY = 'user_timezone';

export function getSystemTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function getEffectiveTimezone(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || getSystemTimezone();
}

export async function setUserTimezone(tz: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: tz });
}
```

#### dayjs with Timezone Plugin

If your extension uses dayjs (see CDN catalog), the UTC and timezone
plugins provide a more ergonomic API than raw `Intl`:

```ts
// With dayjs + UTC + timezone plugins loaded (via catalog/injector)
import type { Dayjs } from 'dayjs';

declare const dayjs: {
  (date?: string | number | Date): Dayjs;
  utc: (date?: string | number | Date) => Dayjs;
  tz: {
    (date?: string | number | Date, tz?: string): Dayjs;
    guess(): string;
  };
};

// Parse from UTC storage
const stored = dayjs.utc('2026-07-26T09:30:00.000Z');

// Display in user's timezone
const userTz = await getEffectiveTimezone();
const display = stored.tz(userTz).format('YYYY-MM-DD HH:mm:ss');
// → "2026-07-26 18:30:00" in Asia/Tokyo

// Relative time with locale
const locale = await getEffectiveLocale();
const relative = stored.tz(userTz).locale(locale).fromNow();
// → "3 hours ago" (en) / "3 小時前" (zh_TW) / "3時間前" (ja)
```

**dayjs locale + timezone combination:**

Load the locale packs and plugins through the CDN catalog so they're
available on any page. The catalog entries for full i18n+tz support:

```ts
// Add these to src/content/catalog.ts CDN_CATALOG
{ key: 'dayjs-utc',   path: 'vendor/dayjs@1.11.21/plugin/utc.js',           type: 'js', desc: 'Day.js UTC plugin' },
{ key: 'dayjs-tz',    path: 'vendor/dayjs@1.11.21/plugin/timezone.js',       type: 'js', desc: 'Day.js Timezone plugin' },
{ key: 'dayjs-rel',   path: 'vendor/dayjs@1.11.21/plugin/relativeTime.js',   type: 'js', desc: 'Day.js RelativeTime' },
{ key: 'dayjs-locale-en', path: 'vendor/dayjs@1.11.21/locale/en.js',         type: 'js', desc: 'Day.js English locale' },
{ key: 'dayjs-locale-zh', path: 'vendor/dayjs@1.11.21/locale/zh-cn.js',      type: 'js', desc: 'Day.js Chinese locale' },
{ key: 'dayjs-locale-ja', path: 'vendor/dayjs@1.11.21/locale/ja.js',         type: 'js', desc: 'Day.js Japanese locale' },
```

#### Timezone-Aware i18n Messages

When you need to display a formatted date inside a translated string,
compose the date first, then inject it into the message:

```jsonc
// _locales/en/messages.json
{
  "lastSync": {
    "message": "Last synced: $DATETIME$",
    "placeholders": {
      "datetime": { "content": "$1", "example": "2026-07-26 18:30 JST" }
    }
  },
  "scheduledFor": {
    "message": "Scheduled for $DATE$ at $TIME$ ($TZ$)",
    "placeholders": {
      "date":    { "content": "$1", "example": "2026-07-26" },
      "time":    { "content": "$2", "example": "18:30" },
      "tz":      { "content": "$3", "example": "JST" }
    }
  }
}
```

```ts
// Usage — format locale-aware date strings before i18n substitution
import { t } from '../shared/i18n';

const tz = await getEffectiveTimezone();
const locale = await getEffectiveLocale();
const utcTimestamp = '2026-07-26T09:30:00.000Z';

// Short form: date + time injected into one placeholder
const formatted = formatDateTime(utcTimestamp, locale, tz, {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const lastSyncText = t('lastSync', formatted);
// → "Last synced: Jul 26, 2026, 6:30 PM" (en, Asia/Tokyo)
// → "上次同步：2026年7月26日 18:30" (zh_CN, Asia/Tokyo)

// Long form: separate date, time, and timezone name
const date = formatDateTime(utcTimestamp, locale, tz, { dateStyle: 'full' });
const time = formatDateTime(utcTimestamp, locale, tz, { timeStyle: 'short' });
const tzName = new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: 'short' })
  .formatToParts(new Date(utcTimestamp))
  .find(p => p.type === 'timeZoneName')?.value || tz;

const scheduledText = t('scheduledFor', [date, time, tzName]);
```

### Cross-Surface Locale & Timezone Contract

Any surface that displays user-facing text or timestamps needs locale
and timezone. Centralize the resolution so every surface gets the same
answer:

```ts
// src/shared/user-context.ts
import { getEffectiveLocale, type SupportedLocale } from './locale';
import { getEffectiveTimezone } from './timezone';

export interface UserContext {
  locale: SupportedLocale;
  timeZone: string;
}

/** Resolve once per surface mount. Cache for the lifetime of the page. */
export async function resolveUserContext(): Promise<UserContext> {
  const [locale, timeZone] = await Promise.all([
    getEffectiveLocale(),
    getEffectiveTimezone(),
  ]);
  return { locale, timeZone };
}
```

Each surface calls `resolveUserContext()` in its `mount()` phase and
passes the result down to components via props or a context object.
Never re-resolve mid-render — it's async and the answer doesn't
change during a single popup session.

### Review Checklist — i18n & Timezone

- [ ] `default_locale` is set in `manifest.json`.
- [ ] Every user-facing string uses `t()` or `__MSG_xxx__` — grep for
      bare English strings in HTML/TS.
- [ ] Every `messages.json` placeholder has an `example` value.
- [ ] `<html lang>` is set to the active locale (for CSS `:lang()` and
      screen readers).
- [ ] RTL: logical CSS properties used (`*-inline-*`); directional
      icons tested in an RTL locale.
- [ ] All timestamps in `chrome.storage` and API payloads are UTC.
- [ ] Timezone is resolved once per surface mount, not per render.
- [ ] Timezone and locale are separate preferences — changing the
      language does not change the displayed timezone, and vice versa.
- [ ] dayjs locale packs match the supported locales in
      `SUPPORTED_LOCALES`.
- [ ] `_locales/` directory has a message file for every supported
      locale.

## TypeScript

- `"module": "ESNext"`, `"moduleResolution": "Bundler"` for the
  worker and popup.
- Add `@types/chrome` to the dev dependencies. It declares
  `chrome.*` namespaces and catches API typos at compile time.
- `tsc --noEmit` in CI. Don't ship a build that has type errors
  just because Vite silenced them with esbuild.
- Strict mode (`"strict": true`) catches the kind of optional
  property access that bites you when an API returns `undefined`.
- **Per-component tsconfig inheritance.** A base `tsconfig.base.json`
  with `"strict": true` and `"moduleResolution": "Bundler"`; each
  component extends it with its own `include` and `lib`:

```jsonc
// tsconfig.popup.json
{
  "extends": "./tsconfig.base.json",
  "include": ["src/popup/**/*", "src/shared/**/*"],
  "compilerOptions": {
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "outDir": "./dist/popup"
  }
}
```

## Bundling

Use **Vite** with multiple entry points — one bundle per component:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve("src/background/index.ts"),
        popup:      resolve("src/popup/popup.html"),
        options:    resolve("src/options/options.html"),
        content:    resolve("src/content/index.ts"),
        bootstrap:  resolve("src/content/bootstrap.ts"),
      },
    },
  },
});
```

**Key bundling rules:**

- **One bundle per component.** Vite's `build.rollupOptions.input`
  declares multiple entries; each becomes a chunk the extension can
  reference from `manifest.json`.
- **`public/` is copied as-is to `dist/`.** Place `cdn/`, `icons/`,
  `_locales/` in `public/`. Vite copies them without processing.
- **Tree-shaking boundaries.** The `shared/` module is consumed by
  every component. Use explicit barrel exports per component:

  ```ts
  // src/shared/index.popup.ts   — only what the popup needs
  // src/shared/index.content.ts — only what the content script needs
  ```

- **Hashed filenames** — Chrome reads the path from the manifest at
  install time. Either disable hashing in production or generate the
  manifest *after* the build.
- **Source maps.** Include them in dev builds; strip them from
  production builds that go to the Web Store.
- **Component bundle budgets (guidelines):**

  | Component | Max bundle size | Rationale |
  |---|---|---|
  | Background (service worker) | 200 KB | Cold-start cost; paid on every event wake |
  | Popup | 100 KB | Sub-100ms first paint target |
  | Content script | 50 KB | Runs on every matching page; user-visible page load delay |
  | Options / Side Panel | 500 KB | Full page, user opted in |

**Note on `web_accessible_resources`:** Every file the content script
injects into the page DOM must be listed. Use globs:

```json
"web_accessible_resources": [{
  "resources": ["cdn/**/*.js", "cdn/**/*.css", "dist/content/bootstrap.js"],
  "matches": ["<all_urls>"]
}]
```

## Development & Production Modes

A single codebase, two runtimes. Dev mode is about fast iteration;
production mode is about small, secure, review-ready builds. Vite
provides the infrastructure; you provide the discipline to keep
dev-only code out of the shipped extension.

### Environment Detection via Vite

Vite exposes the current mode through `import.meta.env` — available
at build time, tree-shaken in production:

```ts
// src/shared/env.ts

/** True when running `vite dev` or `vite build --mode development`. */
export const IS_DEV = import.meta.env.DEV;

/** True when running `vite build` (the default build mode). */
export const IS_PROD = import.meta.env.PROD;

/** The mode string: 'development' | 'production' | custom. */
export const MODE: string = import.meta.env.MODE;

// Custom env vars — define them in .env, .env.development, .env.production
// Vite prefix requirement: VITE_
export const API_BASE: string = import.meta.env.VITE_API_BASE || 'http://localhost:10086';
export const LOG_LEVEL: string = import.meta.env.VITE_LOG_LEVEL || (IS_DEV ? 'debug' : 'error');
```

**`.env` file convention:**

```bash
# .env                    — checked into git, shared defaults
VITE_API_BASE=http://localhost:10086
VITE_LOG_LEVEL=debug
```

```bash
# .env.production         — overrides for production
VITE_API_BASE=https://api.example.com
VITE_LOG_LEVEL=error
```

```bash
# .env.development.local  — gitignored, per-developer overrides
VITE_API_BASE=http://192.168.1.50:10086
```

### Dev Mode: Fast Iteration

**1. Vite dev server with HMR:**

```ts
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  build: {
    minify: mode === 'production',
    sourcemap: mode === 'development' ? 'inline' : false,
    rollupOptions: {
      input: {
        background: resolve('src/background/index.ts'),
        popup:      resolve('src/popup/popup.html'),
        options:    resolve('src/options/options.html'),
        content:    resolve('src/content/index.ts'),
        bootstrap:  resolve('src/content/bootstrap.ts'),
      },
    },
  },
}));
```

**2. Conditional logging:**

Never `console.log` unconditionally. Gate every log call behind a
compile-time flag so it's stripped in production:

```ts
// src/shared/log.ts
import { IS_DEV, LOG_LEVEL } from './env';

type Level = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: Level): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL as Level];
}

export const logger = {
  debug(...args: unknown[]): void {
    if (IS_DEV && shouldLog('debug')) console.debug('[DEBUG]', ...args);
  },
  info(...args: unknown[]): void {
    if (shouldLog('info')) console.info('[INFO]', ...args);
  },
  warn(...args: unknown[]): void {
    if (shouldLog('warn')) console.warn('[WARN]', ...args);
  },
  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args); // errors always log
  },
};
```

**Why `IS_DEV` instead of just checking `shouldLog`:** Vite's
tree-shaking removes the entire `if (IS_DEV && ...)` block in
production builds when `IS_DEV` resolves to `false` at compile time.
Zero bytes in the production bundle.

**3. Dev-only components and tools:**

```ts
// src/popup/popup.ts
import { IS_DEV } from '../shared/env';

async mount() {
  // ... standard setup ...

  if (IS_DEV) {
    // Dev toolbar — never appears in production
    const { DevToolbar } = await import('./components/DevToolbar/DevToolbar');
    this.rootEl.appendChild(DevToolbar());
  }
}
```

Dynamic `import()` for dev-only modules ensures Vite code-splits them.
In production, the entire `if (IS_DEV)` block is eliminated by
tree-shaking — the dynamic import is never reached.

**4. Extension auto-reload during development:**

Manually clicking "reload" on `chrome://extensions` for every change
is slow. Use a file watcher + WebSocket or polling to reload:

```ts
// src/background/dev-reload.ts — loaded only in dev mode
if (import.meta.env.DEV) {
  // Watch the dist/ directory for changes and reload the extension
  const RELOAD_POLL_MS = 1000;
  let lastModified: number | null = null;

  async function checkForUpdates(): Promise<void> {
    try {
      const response = await fetch(chrome.runtime.getURL('dist/build-meta.json'));
      if (!response.ok) return;
      const meta = await response.json() as { builtAt: number };
      if (lastModified && meta.builtAt > lastModified) {
        chrome.runtime.reload();
      }
      lastModified = meta.builtAt;
    } catch { /* network error — ignore */ }
  }

  setInterval(checkForUpdates, RELOAD_POLL_MS);
}
```

Generate `dist/build-meta.json` in the build step:

```ts
// vite.config.ts — write build metadata
import { writeFileSync } from 'node:fs';

export default defineConfig({
  plugins: [{
    name: 'build-meta',
    closeBundle() {
      writeFileSync('dist/build-meta.json', JSON.stringify({
        builtAt: Date.now(),
        mode: process.env.NODE_ENV || 'production',
      }));
    },
  }],
});
```

### Production Mode: Small, Fast, Secure

**1. Minification and dead-code elimination:**

Vite/esbuild handles this automatically in production builds. All
`if (IS_DEV)` blocks are removed. Dynamic `import()` paths guarded by
`IS_DEV` are never bundled.

**2. CSP hardening:**

Production CSP in `manifest.json` must be strict:

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'"
}
```

Dev mode may need a relaxed CSP for HMR (`'unsafe-inline'` for
scripts, `ws://localhost:*` for WebSocket). Generate the manifest
per mode (see Conditional Manifest below).

**3. Build-time assertions:**

Catch misconfiguration at build time with compile-time assertions:

```ts
// src/shared/assert-build.ts
import { IS_PROD } from './env';

// Event pages must register listeners synchronously — verify this at build time
// by asserting that background/index.ts has top-level listener registration.

// In production, assert that no dev-only imports leak through
if (IS_PROD) {
  // @ts-expect-error — this path should not resolve in production
  // If this line compiles, dev code leaked into the production bundle
}
```

The `@ts-expect-error` pattern catches dev-only imports — if the dev
module is accidentally bundled, TypeScript resolves the path and the
comment fails, turning into a real error.

**4. Bundle size enforcement:**

```jsonc
// package.json — size-limit config (optional, use @size-limit/preset-app)
{
  "size-limit": [
    { "path": "dist/assets/background-*.js", "limit": "200 KB" },
    { "path": "dist/assets/popup-*.js",      "limit": "100 KB" },
    { "path": "dist/assets/content-*.js",    "limit": "50 KB" }
  ]
}
```

### Conditional Manifest

One `manifest.json` cannot cover both dev (HMR, loose CSP) and
production (strict CSP, minimal permissions). Generate it:

```ts
// scripts/generate-manifest.ts
import { writeFileSync } from 'node:fs';
import base from '../manifest.base.json' with { type: 'json' };
import pkg from '../package.json' with { type: 'json' };

const isDev = process.argv.includes('--dev');

const manifest = {
  ...base,
  version: pkg.version,

  // Dev: relaxed CSP for HMR
  ...(isDev ? {
    content_security_policy: {
      extension_pages: "script-src 'self' 'unsafe-inline'; object-src 'self'; connect-src ws://localhost:*"
    },
  } : {
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'"
    },
  }),

  // Dev: broader permissions for testing
  host_permissions: isDev
    ? [...base.host_permissions, 'http://localhost:*/*']
    : base.host_permissions,
};

writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
console.log(`Generated manifest (${isDev ? 'dev' : 'production'})`);
```

**npm scripts wiring:**

```jsonc
// package.json
{
  "scripts": {
    "dev":         "vite build --mode development && tsx scripts/generate-manifest.ts --dev",
    "build":       "vite build && tsx scripts/generate-manifest.ts",
    "dev:watch":   "vite build --mode development --watch",
    "dev:reload":  "concurrently \"npm run dev:watch\" \"sleep 2 && echo 'Ready'\""
  }
}
```

### Feature Flags

Beyond the binary dev/production split, some features need to be
toggled per-user or per-deploy without a rebuild. Three tiers:

**Tier 1 — Compile-time flags (Vite `define`):**

```ts
// vite.config.ts
export default defineConfig({
  define: {
    __FEATURE_CHAT__: JSON.stringify(true),     // enabled everywhere
    __FEATURE_EXPORT__: JSON.stringify(false),  // disabled — code tree-shaken out
  },
});
```

Usage:
```ts
// Globals declared via vite.config.ts define
declare const __FEATURE_CHAT__: boolean;
declare const __FEATURE_EXPORT__: boolean;

if (__FEATURE_CHAT__) {
  // This entire block is removed from the bundle when __FEATURE_CHAT__ is false
}
```

**Tier 2 — Build-time flags (`.env`):**

For flags that change per deployment environment (staging vs
production), use env vars. See the `.env` file convention above.

```bash
# .env.staging
VITE_FEATURE_EXPERIMENTAL_UI=true
```

```ts
const EXPERIMENTAL_UI = import.meta.env.VITE_FEATURE_EXPERIMENTAL_UI === 'true';
```

**Tier 3 — Runtime flags (`chrome.storage`):**

For per-user feature toggles (beta features, A/B tests):

```ts
// src/shared/feature-flags.ts
import { IS_DEV } from './env';

export interface FeatureFlags {
  enableChat: boolean;
  enableExport: boolean;
  enableExperimentalUI: boolean;
}

const DEFAULTS: FeatureFlags = {
  enableChat: true,
  enableExport: false,
  enableExperimentalUI: false,
};

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const result = await chrome.storage.local.get('featureFlags');
  return { ...DEFAULTS, ...(result.featureFlags || {}) };
}

export async function setFeatureFlag<K extends keyof FeatureFlags>(
  key: K,
  value: FeatureFlags[K],
): Promise<void> {
  const flags = await getFeatureFlags();
  flags[key] = value;
  await chrome.storage.local.set({ featureFlags: flags });
}
```

**When to use each tier:**

| Tier | Mechanism | When changed | Example |
|---|---|---|---|
| Compile-time | `define` in vite.config | Code commit | Removing a deprecated feature entirely |
| Build-time | `.env` files | Per deploy | Different API base per environment |
| Runtime | `chrome.storage` | Per user, any time | Beta feature opt-in, A/B test assignment |

**Rule:** prefer the lowest tier that meets the need. Compile-time
flags produce the smallest bundle. Runtime flags are the most
flexible but add storage reads.

### Tying into Config Layering

The existing `createConfig(env, apiBase)` from Config Layering fits
directly into this system:

```ts
// src/config/config.ts
import { MODE, API_BASE } from '../shared/env';
import type { Env } from './types';

export function createAppConfig(): AppConfig {
  const env: Env = MODE === 'production' ? 'production'
    : MODE === 'staging' ? 'staging'
    : 'development';

  return createConfig(env, API_BASE);
}
```

The env string flows from Vite's `MODE` → `createConfig` → every
surface. No hardcoded `'production'` string anywhere except the
mapping above.

### Review Checklist — Dev/Production Modes

- [ ] `vite build` produces a production build (minified, no source
      maps, CSP strict). Run `npm run build` before every Web Store
      submission.
- [ ] All `console.log` calls are gated behind `IS_DEV` or routed
      through `logger.debug()`.
- [ ] Dev-only modules use dynamic `import()` guarded by `IS_DEV` so
      they're tree-shaken in production.
- [ ] `manifest.json` is generated with dev-specific sections only in
      dev mode (relaxed CSP, extra host_permissions).
- [ ] `.env.production` sets production API endpoints and disables
      verbose logging.
- [ ] No `import.meta.env` values contain secrets — they're inlined at
      build time and visible in the bundle.
- [ ] Bundle budgets are enforced in CI. Each component stays under
      its limit.
- [ ] Feature flags have a clear removal plan. Compile-time `false`
      flags should be deleted from the codebase, not left as
      documentation.

## Manifest Generation

For anything beyond a toy extension, generate `manifest.json` from
TypeScript or a JSON-with-comments variant. Two reasons:

1. The same `version` field has to live in three places:
   `manifest.json`, the Web Store dashboard, and the GitHub
   release tag. Centralize.
2. Conditional sections (e.g. dev-only `host_permissions`, relaxed
   dev CSP) are easier to express in code than in raw JSON. See the
   Conditional Manifest section above for a complete pattern.

A minimal pattern:

```ts
// scripts/build-manifest.ts
import pkg from "../package.json" with { type: "json" };
import base from "./manifest.base.json" with { type: "json" };

export default {
  ...base,
  version: pkg.version,
  // override per environment
};
```

For component-aware manifest generation, derive `content_scripts`,
`web_accessible_resources`, `commands`, and `side_panel` entries from
a single source of truth — one place to change, no drift.

## Testing

A component-based extension demands a component-aligned testing
strategy: test each surface in isolation first, then test the
message-passing integration.

### Unit tests (Vitest) — Per Component

- **Background:** Pure logic tests. Mock `chrome.*` via a small
  shim. `@types/chrome` does not provide a runtime; you need a stub.
- **Popup / Options:** `vitest --environment jsdom`. Test UI
  interactions with a lightweight DOM (happy-dom or jsdom).
- **Content Script:** `jsdom` with a mock `document`. Test DOM
  manipulation and message handler dispatching.
- **Shared (`src/shared/`):** No mocking needed. Pure functions in
  `messages.ts`, `state.ts` are the highest-ROI tests.
- **Services:** Mock `chrome.*` to test factory output. Test the
  created service object's methods directly.

```ts
// tests/unit/shared/state.test.ts
import { describe, it, expect, vi } from "vitest";
import { getPrefs, setPrefs, onPrefsChanged } from "@/shared/state";

vi.stubGlobal("chrome", {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
});

describe("getPrefs", () => {
  it("returns defaults when storage is empty", async () => {
    vi.mocked(chrome.storage.local.get).mockResolvedValue({});
    const prefs = await getPrefs();
    expect(prefs.theme).toBe("auto");
  });
});
```

### Component Integration Tests

Test the message-passing contract between components in a simulated
Chrome environment:

```ts
// tests/integration/messages.test.ts
import { createMockSender } from "@/test-utils/chrome-mock";

describe("Popup → Content Script message flow", () => {
  it("ping receives success response", async () => {
    const sender = createMockSender({ id: chrome.runtime.id });
    const response = await simulateMessage(
      { type: "ping" },
      sender,
      contentScriptMessageHandler
    );
    expect(response.success).toBe(true);
  });

  it("unknown action returns error", async () => {
    const sender = createMockSender({ id: chrome.runtime.id });
    const response = await simulateMessage(
      { type: "unknownAction" },
      sender,
      contentScriptMessageHandler
    );
    expect(response.success).toBe(false);
  });
});
```

### End-to-end (Playwright on Chromium)

Playwright's `chromium` channel is a real Chrome with the
extension APIs available. To load an unpacked extension:

```ts
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";

const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "ext-"));
const context = await chromium.launchPersistentContext(userDataDir, {
  channel: "chromium",
  args: [
    `--disable-extensions-except=${path.resolve("dist")}`,
    `--load-extension=${path.resolve("dist")}`,
    "--headless=new",
  ],
});

const extensionId = await getExtensionId(context); // read from service worker page
const popup = context.newPage();
await popup.goto(`chrome-extension://${extensionId}/popup.html`);
```

Tips:

- **Read the extension id from the service worker page.** Chrome
  assigns a deterministic id based on the manifest's `key` field.
- **Reset state between tests.** Clear `chrome.storage.local` via
  `await page.evaluate(() => chrome.storage.local.clear())`.
- **Test the popup, options page, and content script separately.**
  Each has its own page; each needs its own test fixture.
- **Test cross-component message flow end-to-end.** Open the
  popup, click a button, then verify the content script received
  the expected action on the target page.

### Manual smoke test

- `npm run build` then `chrome://extensions` → enable Developer mode →
  "Load unpacked" → pick `dist/`.
- Reload after every code change (`npm run build && reload extension`).
- "Inspect views: service worker" opens the DevTools for the worker.
- Use `chrome://extensions` → "Errors" to surface manifest or
  runtime errors.

## Versioning

- `version` in `manifest.json` is a semver string with no
  pre-release suffix.
- Chrome's auto-update picks up the highest version on the Web
  Store. You can never ship `1.0.0` after `1.0.1`.
- Reserve major bumps for breaking changes to the extension's
  surface (renamed commands, removed features). Most updates are
  `0.0.x` or `0.x.0`.
- Tag the GitHub release with the same version string. The Web
  Store dashboard and the GitHub tag should match.

## Chrome Web Store Submission

1. **Build the production zip.** `npm run build && cd dist && zip -r
   ../dist.zip .`.
2. **Create a developer account** at
   [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
   ($5 one-time fee).
3. **Upload the zip.** Fill in:
   - **Detailed description** (longer than `manifest.description`).
   - **Single purpose** — one or two sentences on what the
     extension does. Be specific.
   - **Permission justifications** — for each `permission` and
     `host_permissions`, explain *why* you need it. Be honest;
     vague justifications trigger rejections. For `<all_urls>` with a
     content script that injects on every page, justify it: "The
     companion must be available on all pages the user visits."
   - **Privacy practices** — disclose every data type you collect,
     every network request you make, every third-party service.
     If you call `localhost:10086`, disclose it as a local-only
     backend service.
4. **Screenshots.** 1280×800 or 640×400 PNG. Show the popup, the
   options page, and the extension in action on a real page.
5. **Submit for review.** First review takes a few days; subsequent
   updates are usually hours.
6. **Monitor the dashboard** for review feedback. Rejections cite a
   specific policy; fix the underlying issue, not just the symptom.

## Review Checklist

- [ ] Extension does one thing well. (Single purpose.)
- [ ] No `<all_urls>` unless justified in the listing.
- [ ] No remote code, no `eval`, no inline scripts. All CDN libraries
      are bundled locally in `public/cdn/vendor/`.
- [ ] Permissions have a real consumer in the code.
- [ ] No `webRequest` blocking (use `declarativeNetRequest`).
- [ ] Privacy disclosure matches behavior. Local backend calls are
      disclosed as local-only.
- [ ] Icons at 16, 48, 128 px.
- [ ] Description is ≤ 132 chars and honest.
- [ ] No emoji in `name` / `description`.
- [ ] Screenshots show the actual UI, not a mockup.
- [ ] Each component has a single entry point; no code is shared
      across components via global imports.
- [ ] Message types are the single source of truth for all IPC
      (typed union in `messages.ts`).
- [ ] `web_accessible_resources` only lists files the content script
      genuinely needs to inject. No over-exposure.
- [ ] `default_locale` is set in `manifest.json`; every user-facing
      string uses `t()` or `__MSG_xxx__` — no bare English strings.
- [ ] All timestamps in storage and API payloads are UTC.
- [ ] `npm run build` produces a production build: minified, no source
      maps, strict CSP, all `console.log` calls gated behind `IS_DEV`.
- [ ] `manifest.json` is generated per mode (dev CSP relaxed only in
      dev; production uses strict CSP).
- [ ] No `import.meta.env` values contain secrets — they're inlined at
      build time.

## Update Cadence

- **Ship small, ship often.** The Web Store review queue moves
  faster for incremental updates.
- **Self-host updates** (the `update_url` mechanism) is a power
  move — only use it for enterprise / internal distributions. The
  Web Store is the right default.
- **Deprecate cleanly.** When a feature goes away, remove it from
  the manifest and the Web Store listing. Leaving a `permission`
  you no longer use is a review failure.

## CI Suggestions

- `npm run lint` (ESLint with the TypeScript ruleset)
- `npm run typecheck` (`tsc --noEmit`)
- `npm run test` (Vitest)
- `npm run test:e2e` (Playwright, runs against the built `dist/`)
- `npm run build` (Vite production build)
- `npm run size-check` — verify each component stays under its
  bundle budget
- `npm run i18n-check` — verify every `_locales/<lang>/messages.json`
  has the same keys as the source locale (en)
- A weekly or daily scheduled `npm audit` for transitive
  dependency CVEs.

## Common Mistakes

- Shipping a build with `console.log` left in.
- Forgetting to bump `version` between submissions.
- Including a `.map` file in the production zip.
- Reusing a single Vite bundle for background + popup — they
  have different shapes, different sizes, and different entry
  points. Declare both.
- Testing against `chromium` from Puppeteer — it has the right
  APIs but a different extension id strategy. Playwright with the
  `chromium` channel is closer to what the Web Store will see.
- **Treating the extension as a monolith.** The background worker
  should not import popup UI code; content scripts should not
  depend on the side panel's helpers.
- **Defining message types inline.** A `sendMessage({ type:
  "setSize", size: 320 })` written three times in three files will
  drift. Define the contract once in `messages.ts` and reference it
  everywhere.
- **Module-level state in the service worker.** It survives ~30s,
  not forever. Use `chrome.storage.local` or
  `chrome.storage.session`.
- **Async listener registration.** If `chrome.runtime.onMessage`
  is registered inside an `await`, the worker can be torn down
  before it fires.
- **Forgetting CSP fallback in dual-world injection.** Not all pages
  allow extension script injection. Always include `el.onerror` as a
  fallback to ISOLATED-world initialization.
- **Mixing config layers.** Defaults in one file, env detection in
  another, callers in a third. Use the three-layer pattern
  (defaults → config → adapter) to keep each layer single-purpose.
- **Hardcoding CDN paths in content scripts.** Every injectable
  resource path should live in `catalog.ts` — nowhere else.
- **Leaking service worker imports.** The background bundle should
  not transitively import DOM types or React. Keep the worker's
  dependency tree lean.
- **Shipping dev mode to the Web Store.** Always run `npm run build`,
  not `npm run dev` or `vite build --mode development`, before
  submitting. Check that the zip contains minified bundles and no
  source maps.
- **Storing timestamps in local time.** Always store UTC. Use
  `new Date().toISOString()` for writes and `Intl.DateTimeFormat`
  for display. Timezone is a display concern, not a storage concern.
- **Mixing locale and timezone.** They are independent. A user can
  prefer English (locale) while living in Tokyo (timezone). Store
  and resolve them as separate preferences.
- **Hardcoding strings in components.** Every user-facing string
  must pass through `t()` or `__MSG_xxx__`. Grep for bare English
  before submitting — a single hardcoded string in a shipped popup
  is a bug for 80%+ of Chrome users (non-English).
