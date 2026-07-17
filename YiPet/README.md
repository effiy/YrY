# YiPet

> A customized fork of Dark Reader — the open-source browser
> extension that analyzes web pages and generates a dark theme to
> reduce eyestrain while browsing. YiPet inherits Dark Reader's
> dynamic-theme engine, MV2/MV3 manifest matrix, and UI surfaces
> (popup / options / devtools / stylesheet-editor), and extends them
> with an activation layer (`ui/options/activation`) and an about
> panel (`ui/options/about`).

## System view

YiPet is a Manifest V2 + V3 browser extension that runs in Chrome,
Firefox, Edge, Safari, and Thunderbird. It has no backend. On
install, a background service worker (`src/background/`) registers
listeners for tab lifecycle, alarms, and commands. For every page
load, a content script (`src/inject/`) runs at `document_start` and
either applies a dynamic-theme CSS overlay, an SVG-filter inversion,
or a stylesheet fallback, depending on the site's
`dynamic-theme-fixes` / `inversion-fixes` config. The popup and
options pages (`src/ui/`) read and write user settings through a
messenger bridge to the background. A public API (`src/api/`) is
exposed for third-party pages that opt into programmatic dark mode.

## Command flow

| Intent | Command |
|--------|---------|
| Lint | `npm run lint` |
| Build (debug + release + api) | `npm run build:all` |
| Build (release) | `npm run build` |
| Build (Firefox release) | `npm run build:firefox` |
| Build (Plus variant) | `npm run build:plus` |
| Build (debug, watch) | `npm run debug:watch` |
| Build (debug, MV3 watch) | `npm run debug:watch:mv3` |
| Unit tests | `npm run test:unit` (= `npm test`) |
| Unit tests with coverage | `npm run test:coverage` |
| Browser e2e (Chrome MV2) | `npm run test:chrome` |
| Browser e2e (Chrome MV3) | `npm run test:chrome-mv3` |
| Browser e2e (Firefox MV2) | `npm run test:firefox` |
| Browser e2e (Edge / Plus) | `npm run test:edge` |
| Inject tests (Karma) | `npm run test:inject` |
| Translate messages | `npm run translate-new-en-messages` |
| Upgrade dependencies | `npm run dependencies:upgrade` |
| Ping config sources | `npm run config-cleanup` |

## Quick start

1. Install Node.js (LTS recommended; ≥15 required).
2. `npm install` — fetch dev dependencies (no runtime deps beyond
   `malevic`).
3. `npm run build` — produces `build/release/chrome/`.
4. Load unpacked:
   - Chrome / Edge: `chrome://extensions` → Developer mode →
     "Load unpacked" → select `build/release/chrome`.
   - Firefox: `about:debugging` → This Firefox → "Load Temporary
     Add-on" → select `build/release/firefox/manifest.json`.
5. `npm test` — run the unit suite; `npm run test:chrome-mv3` for
   browser e2e.

Goal-Driven Execution: success = `build/release/chrome/manifest.json`
exists after `npm run build`, and `npm test` exits 0.

## Project structure

```
YiPet/
├── src/                    # Extension source (single-tree, no workspaces)
│   ├── _locales/           # i18n message stores
│   ├── api/                # Public Dark Reader API (third-party sites)
│   ├── background/         # Service worker / bg page: lifecycle, messaging
│   ├── config/             # Curated per-site fixes (dark-sites, inversion, dynamic-theme)
│   ├── generators/         # Theme engines: dynamic, SVG filter, stylesheet
│   ├── icons/              # Extension icons (PNG assets)
│   ├── inject/             # Content scripts — run on every page at document_start
│   ├── stubs/              # Build-time stubs for MV2/MV3 / platform diffs
│   ├── ui/                 # Extension UI surfaces
│   │   ├── options/        # about / activation / advanced / automation / general / hotkeys / site-list
│   │   ├── popup/          # toolbar popup
│   │   ├── devtools/       # DevTools panel
│   │   ├── stylesheet-editor/  # per-site CSS override editor
│   │   ├── controls/       # shared UI controls
│   │   ├── connect/        # messenger bridge between UI and background
│   │   └── assets/         # shared UI assets
│   ├── utils/              # state-manager, platform, media-query, network, links
│   ├── defaults.ts         # default theme + user settings
│   ├── definitions.d.ts    # shared types
│   └── manifest*.json      # MV2 + MV3 + Firefox + Thunderbird manifests
├── tasks/                  # Build scripts (rollup, bundle-*, paths, cli, watch)
├── tests/                  # unit / browser / inject suites (jest + karma)
├── eslint.config.js        # ESLint flat config (typescript-eslint)
├── package.json            # npm scripts + devDependencies
└── CLAUDE.md               # Operating charter for Claude Code
```

## Domain Language

The domain language of YiPet (a Dark Reader fork) covers the
extension's runtime concepts. Terms are deliberately distinct from
generic web-dev vocabulary.

**Dark Reader** — The upstream open-source browser extension that
analyzes web pages and generates a dark theme. YiPet is a fork of
Dark Reader at version 4.9.128; "Dark Reader" in the codebase refers
to the upstream engine, not the YiPet fork.

**Dynamic Theme** — The default theme engine (`src/inject/dynamic-theme/`):
instead of inverting colors, it parses the page's CSS, regenerates
color values for dark mode, and re-applies them as an overlay
stylesheet. Distinct from "SVG filter" and "stylesheet fallback".

**Inject Script** — The content script bundle (`src/inject/index.ts`)
that runs at `document_start` on every page in every frame, applies
the active theme engine, and forwards messages to the background.

**Background** — The extension's persistent context (`src/background/`):
MV2 uses a persistent background page; MV3 uses a service worker.
Owns tab state, config management, and the messenger bridge to UI
and content scripts. Not a "backend" — there is no server.

**Messenger** — The typed message-passing bridge
(`src/background/messenger.ts`, `src/ui/connect/`) between the
background and the UI / content scripts. Not the DOM
`postMessage` API.

**Theme Engine** — A strategy in `src/generators/theme-engines.ts`
that decides which visual approach to use (dynamic theme, SVG
filter, or stylesheet). Only one engine is active per tab at a time.

**Config Fixes** — Curated per-site overrides in `src/config/`
(`dynamic-theme-fixes.config`, `inversion-fixes.config`,
`dark-sites.config`) that tell the inject script how to handle
sites that don't auto-darken well. Not user settings.

**Activation** — A YiPet-specific layer (`src/ui/options/activation/`)
that gates features behind an activation state; not present in
upstream Dark Reader.

### Relationships

- **Dark Reader** ⊃ **Dynamic Theme** — the dynamic theme is one
  strategy inside the Dark Reader engine.
- **Theme Engine** → **Dynamic Theme | SVG Filter | Stylesheet
  fallback** — the engine selects exactly one per tab.
- **Inject Script** → **Theme Engine** — the inject script invokes
  the active engine on every page load.
- **Background** ↔ **Inject Script**, **Background** ↔ **UI** —
  both pairs communicate over the **Messenger**.
- **Config Fixes** → **Inject Script** — the inject script reads
  fixes at runtime to adjust per-site behavior.
- **Activation** → **UI** — the activation layer gates which UI
  features are reachable.

### Example dialogue

> User: "Why is `nyt.com` still white after I enable YiPet?"
> Extension dev: "Check `src/config/dynamic-theme-fixes.config` for
> a `nyt.com` entry — the **Config Fixes** tell the **Inject Script**
> which **Theme Engine** to use there. If no entry, the **Dynamic
> Theme** runs on raw CSS and may miss late-applied styles; add a
> fix or switch the site to the **SVG filter** engine in the popup."

### Disambiguation markers

- **Dark Reader** — do not confuse with the `darkreader` npm package
  name (the published artifact) or with YiPet itself (the fork).
- **Dynamic Theme** — do not confuse with "dark theme" (the visual
  result) or with "dynamic theme" in CMS contexts.
- **Inject Script** — do not confuse with the `src/inject/` directory
  (the source tree) or with the `inject` npm script bundle.
- **Background** — do not confuse with the CSS `background` property
  or with the `background/index.html` page (the MV2 host).
- **Messenger** — do not confuse with `window.postMessage` or with
  the `DebugMessageType*` debug-channel enums.
- **Theme Engine** — do not confuse with the `Theme` type (a single
  color-scheme config) or with `ThemeEngines` (the enum).
- **Config Fixes** — do not confuse with user settings stored in
  `chrome.storage` via `user-storage.ts`.
- **Activation** — do not confuse with browser extension activation
  (install/enable) or with the `active` state of the toolbar icon.
