# YiPot · Tauri Desktop Translation Tool

> Cross-platform desktop translator & OCR — 21 translation engines ·
> 16 recognize backends · TTS & collection services · Tauri + React
> fullstack architecture. Source root: `/Users/ruiyi/Downloads/YrY/YiPot/`.

## System view

YiPot is a Tauri 1.8 desktop application that bundles a React 18 frontend
(`src/`) and a Rust backend (`src-tauri/`). The frontend hosts five window
panels — `Translate`, `Recognize`, `Screenshot`, `Config`, `Updater` —
dispatched by `appWindow.label` via `src/App.jsx`'s `windowMap`. The backend
owns system interaction (clipboard, screenshot, OCR, language detection,
hotkey, tray, updater) and a tiny_http bridge on port 60828 that ferries
OS-side data into the JS service layer. The service layer hosts 21
translation engines, 16 recognition engines, TTS engines, and collection
services, each as a self-contained directory under `src/services/`. State
is split between Jotai atoms (ephemeral UI) and `tauri-plugin-store-api`
(persistent `config.json` in the Tauri app config directory).

## Command flow

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install frontend deps (33 runtime + 9 dev) |
| `pnpm dev` | Start Vite dev server (HMR for the React frontend) |
| `pnpm tauri dev` | Boot the full Tauri desktop app with devtools |
| `pnpm build` | Vite production build of the frontend |
| `pnpm tauri build` | Build per-OS installers (msi/nsis, dmg/app, deb/AppImage) |
| `pnpm updater` | Regenerate the updater manifest (`updater/updater.mjs`) |
| `cargo build` (in `src-tauri/`) | Build the Rust backend standalone |
| No `pnpm test` | No automated test runner; verify via `test/scene-*/index.md` |

## Quick start

1. `pnpm install` in `/Users/ruiyi/Downloads/YrY/YiPot/`.
2. `pnpm tauri dev` to boot the desktop app (Vite dev + Tauri webview).
3. Configure engine API keys via the `Config` window — values persist to
   `config.json` in the Tauri app config directory via
   `tauri-plugin-store-api`.
4. Open the `Translate` window, pick an engine, translate.
5. To inspect the documentation catalog entry for this project, open
   `/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiPot/index.html` in a
   browser.

**Goal-Driven Execution** — success criteria: (a) `pnpm tauri dev` boots
the webview without Rust compile errors, (b) the `Translate` window
renders the engine list filtered by `check_service_available()`, (c) a
clipboard-triggered translate round-trips through the tiny_http bridge on
port 60828, (d) the `Config` window persists a key reload after restart.

## Project structure

```
YiPot/
├── package.json             # 33 runtime + 9 dev deps, pnpm
├── pnpm-lock.yaml
├── vite.config.js           # Vite 5 + @vitejs/plugin-react
├── tailwind.config.cjs       # Tailwind 3 + NextUI preset
├── postcss.config.js
├── index.html               # Vite SPA entry
├── daemon.html              # daemon-mode shell
├── updater/                 # updater manifest scripts
├── patches/                 # pnpm patch files
├── public/                  # static assets
├── asset/                   # app icons / screenshots
├── src/                     # React 18 frontend
│   ├── main.jsx             # ReactDOM root
│   ├── App.jsx              # windowMap dispatch by appWindow.label
│   ├── style.css
│   ├── window/              # 5 window panels
│   │   ├── Translate/       # main translation window
│   │   ├── Recognize/       # OCR window
│   │   ├── Screenshot/      # screenshot OCR
│   │   ├── Config/          # settings UI
│   │   └── Updater/         # self-update UI
│   ├── services/            # service engine registry
│   │   ├── translate/        # 21 engines (openai, deepl, google, bing, ...)
│   │   ├── recognize/       # 16 engines (tesseract, baidu, iflytek, ...)
│   │   ├── tts/             # TTS engines
│   │   └── collection/      # collection services
│   ├── components/          # shared React components
│   ├── hooks/               # React hooks
│   ├── utils/               # JS utils
│   └── i18n/                # i18next (en_US, es_ES)
└── src-tauri/               # Rust + Tauri 1.8 backend
    ├── Cargo.toml           # tauri 1.8, tiny_http, lingua, screenshots, ...
    ├── tauri.conf.json      # main config
    ├── tauri.{linux,macos,windows}.conf.json  # per-OS overrides
    ├── webview.{x64,x86,arm64}.json            # per-arch webview
    ├── build.rs
    ├── icons/  icons_mac/  resources/
    └── src/
        ├── main.rs          # Tauri entry + mod declarations
        ├── cmd.rs           # #[tauri::command] handlers
        ├── window.rs        # window lifecycle
        ├── tray.rs          # system tray
        ├── hotkey.rs        # global shortcut
        ├── clipboard.rs     # clipboard monitor
        ├── screenshot.rs    # screenshot capture
        ├── system_ocr.rs    # OS OCR bridge
        ├── lang_detect.rs   # lingua language detection
        ├── config.rs        # config store I/O
        ├── server.rs        # tiny_http bridge on :60828
        ├── backup.rs        # config backup
        ├── updater.rs       # self-update
        └── error.rs         # error enum
```

## Domain Language

YiPot's domain is **multi-engine desktop translation & OCR** — a Tauri
shell that fans out to 21 translate engines and 16 recognize engines,
each a self-contained plugin, orchestrated across three tiers (Rust OS
layer, tiny_http bridge, JS service layer).

- **Engine** — a single translation/recognize/TTS/collection backend
  packaged as a directory under `src/services/<kind>/<engine>/` with
  `Config.jsx` + `index.jsx` + `info.ts`. Each engine owns its API key,
  request shape, and availability check; the registry is a barrel
  (`src/services/translate/index.jsx`).
- **Window panel** — a Tauri window instance dispatched by `appWindow.label`
  in `src/App.jsx`'s `windowMap`. Five panels: `Translate`, `Recognize`,
  `Screenshot`, `Config`, `Updater`. Each has its own React subtree.
- **tiny_http bridge** — the Rust-side HTTP server (`src-tauri/src/server.rs`,
  port 60828) that ferries OS-side data (clipboard, screenshot) into the JS
  service layer for engine calls.
- **`check_service_available()`** — per-engine availability gate run at
  startup; engines whose API key is missing are pruned from the registry
  before the UI renders.
- **`config.json`** — the single source of truth for settings, persisted
  in the Tauri app config directory via `tauri-plugin-store-api`. Engine
  keys, hotkeys, window geometry, and feature toggles all live here.

### Relationships

- **Engine** ⊂ **Window panel**: each panel consumes engines from the
  registry (Translate uses translate engines, Recognize uses recognize
  engines, etc.). The panel does not own the engine — it borrows it.
- **`config.json`** → **Engine**: every engine reads its API key from
  `config.json` via `Config.jsx`; `check_service_available()` is the
  gate that turns an engine on/off based on config presence.
- **tiny_http bridge** → **Engine**: the bridge carries OS-side data
  (clipboard text, screenshot bytes) into the active engine's request
  pipeline; without it, the Translate window falls back to manual paste.
- **Window panel** ↔ **Rust module**: each panel maps to one or more
  Rust modules (`Translate` ↔ `clipboard.rs` + `server.rs`;
  `Screenshot` ↔ `screenshot.rs` + `system_ocr.rs`; `Updater` ↔ `updater.rs`).

### Example dialogue

> User: "Translate the clipboard with DeepL."
> System (Translate window): `clipboard.rs` reads the OS clipboard →
> `server.rs` pushes it through the `:60828` bridge → the DeepL engine
> (`src/services/translate/deepl/index.jsx`) issues the API call →
> result rendered in the Translate panel.

> User: "OCR this screenshot."
> System (Screenshot window): `screenshot.rs` captures the region →
> `system_ocr.rs` tries the OS OCR first → on failure, `tesseract.js`
> (in-browser) runs as fallback → recognized text forwarded to the
> active recognize engine's pipeline.

> User: "Why is OpenAI not in the engine list?"
> System (Config window): `check_service_available()` ran at startup
> and pruned OpenAI because its API key was missing from `config.json`.
> Open the Config window, add the key, restart — OpenAI reappears.

### Disambiguation markers

- "engine" in this codebase **never** means a search engine or a JS
  template engine; it always means a translation/recognize/TTS/collection
  backend packaged under `src/services/`.
- "panel" **does not** mean a UI panel component — it specifically means
  a top-level Tauri window instance dispatched by `appWindow.label`.
- "bridge" **does not** mean a generic adapter; it refers to the
  `:60828` tiny_http server in `src-tauri/src/server.rs` that ferries
  OS-side data into JS.
- "config" **does not** mean a Vite/Tailwind config file; it means the
  runtime `config.json` in the Tauri app config directory, accessed via
  `tauri-plugin-store-api`.
