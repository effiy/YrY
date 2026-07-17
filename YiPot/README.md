# YiPot

> A cross-platform selection translator — Tauri desktop app supporting
> multiple translation / OCR / TTS / vocabulary-book backends, with an
> external HTTP invocation interface and a plugin system.

## System View

YiPot is a Tauri 1.x desktop application that bundles a React 18 + Vite
frontend with a Rust backend. The frontend (under `src/`) renders five
windows — Translate, Recognize, Screenshot, Config, Updater — and orchestrates
pluggable services for translation, OCR, TTS, and vocabulary collection. The
Rust side (under `src-tauri/src/`) owns native capabilities: global hotkeys,
clipboard, screenshot, system OCR, tray, updater, backup, and a localhost HTTP
server that lets external software trigger the app. Users typically select
text and press a hotkey; the app surfaces a small translation panel with
parallel results from all configured backends.

## Command Flow

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Run frontend dev server | `pnpm dev` (port 1420) |
| Run desktop app in dev mode | `pnpm tauri dev` |
| Build frontend only | `pnpm build` |
| Preview production bundle | `pnpm preview` |
| Build platform installer | `pnpm tauri build` |
| Generate updater artifacts | `pnpm updater` |
| Fix-runtime updater | `pnpm updater:fixRuntime` |

> Rust ≥ 1.80.0, Node ≥ 18.0.0, pnpm ≥ 8.5.0. Linux builds additionally
> need `libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev
> librsvg2-dev patchelf libxdo-dev`.

## Quick Start

Goal: launch the desktop app locally and confirm a translation round-trip.

1. `pnpm install`
2. `pnpm tauri dev`
3. Once the app window opens, open Settings (Config window) and configure
   at least one translation backend (e.g. OpenAI API key or enable the
   offline Ollama endpoint).
4. Select any text in another app, press the configured selection-translate
   hotkey, and verify a translation panel appears with results.
5. Verify check: if the panel renders text from at least one backend,
   the round-trip passes.

## Project Structure

```
YiPot/
├── src/                      # React frontend
│   ├── App.jsx               # window switch by appWindow.label
│   ├── main.jsx              # React mount + NextUI/next-themes
│   ├── components/           # shared components (WindowControl)
│   ├── hooks/                # useConfig, useVoice, useSyncAtom, ...
│   ├── i18n/                 # i18next + 20 locale JSON files
│   ├── services/             # pluggable backends
│   │   ├── translate/        # openai, deepl, google, bing, baidu, ...
│   │   ├── recognize/        # baidu, tencent, iflytek, tesseract, system, ...
│   │   ├── tts/              # speech synthesis (lingva)
│   │   └── collection/       # anki, eudic
│   ├── utils/                # store, env, invoke_plugin, lang_detect, ...
│   └── window/               # per-window UI (Translate/Recognize/Screenshot/Config/Updater)
├── src-tauri/                # Rust backend
│   ├── src/                  # main, server, cmd, clipboard, hotkey, screenshot, system_ocr, tray, updater, backup, config, lang_detect, window, error
│   ├── tauri.conf.json       # Tauri config (with platform overrides)
│   ├── tauri.{macos,linux,windows}.conf.json
│   ├── resources/            # OCR binaries (macOS)
│   └── Cargo.toml
├── updater/                  # build-time updater scripts (.mjs)
├── patches/                  # dependency patches
├── public/                   # static assets (icon.svg, worker.min.js, tesseract wasm)
├── .scripts/                 # PopClip / SnipDo / Starry integrations
├── index.html                # main Vite entry
├── daemon.html               # daemon Vite entry (external invocation UI)
├── vite.config.js
└── package.json
```

## Domain Language

YiPot's domain is the intersection of desktop translation tools and plugin
architectures. The terms below recur across the codebase, README, and config
UI; understanding them is prerequisite to reading the source.

### Term Definitions

- **Selection Translate** — Triggering translation by selecting text in any
  app and pressing a global hotkey; the app surfaces a small panel near the
  cursor with results from all configured backends.
- **Service** — A pluggable backend of one of four kinds: `translate`,
  `recognize`, `tts`, `collection`. Each service lives under
  `src/services/<kind>/<name>/` and exposes an `index.jsx` plus an optional
  `Config.jsx` for its settings panel.
- **Plugin** — An external `.potext` file loaded at runtime via
  `src/utils/invoke_plugin.js`, extending the built-in services. Distinct
  from a built-in service: a plugin ships its own JS bundle and is installed
  by the user (not bundled with the app).
- **Window** — One of five React root views switched by `appWindow.label`
  in `App.jsx`: `translate`, `screenshot`, `recognize`, `config`, `updater`.
  Each window is a separate OS window managed by Tauri.
- **External Invocation** — The localhost HTTP server in
  `src-tauri/src/server.rs` (default port 60828) that lets other software
  trigger YiPot via `curl 127.0.0.1:port/selection_translate` and similar
  routes. Used for Wayland hotkey workarounds and SnipDo / PopClip / Starry
  integration.
- **Daemon** — The `daemon.html` Vite entry; a headless mode that runs the
  HTTP server without bringing up the main UI window.

### Relationships

- A **Service** produces **Translation / OCR / TTS / Collection** results that
  the **Window** renders.
- **Selection Translate** is one trigger; **External Invocation** is another.
  Both eventually route into the same `services/` layer.
- A **Plugin** extends the **Service** layer without touching the **Window**
  layer — service-instance resolution (`src/utils/service_instance.ts`) treats
  built-in and plugin services identically.
- **Daemon** is a sibling of the main **Window** app: both share `services/`
  and `utils/`, but `daemon.html` does not mount `<App />`.

### Example Dialogue

> User: "I selected 'hello' in my browser — what happens next?"
>
> App: "The global hotkey fires `selection_translate`; Tauri reads the
> active selection via the OS clipboard bridge (`src-tauri/src/clipboard.rs`),
> opens the `translate` **Window**, and dispatches the text to every enabled
> **Service** under `src/services/translate/`. Results stream back into the
> panel."
>
> User: "Can I add a custom backend without rebuilding?"
>
> App: "Yes — package it as a `.potext` **Plugin** following the template
> repo; install it via Preferences → Service Settings → Add External Plugin.
> `invoke_plugin.js` will load it the same way it loads a built-in service."
>
> User: "And from a shell script?"
>
> App: "Use **External Invocation** — `curl 127.0.0.1:60828/selection_translate`
> triggers the same flow the hotkey would."

### Disambiguation Markers

- **Selection Translate** ≠ clipboard-listener mode (the latter reacts to
  every clipboard write, the former to a hotkey only).
- **Service** ≠ **Plugin** — a service is built-in and ships with the app;
  a plugin is `.potext` and user-installed. Both implement the same contract.
- **Window** (React root view) ≠ OS window — Tauri may spawn multiple OS
  windows for a single `Window` (e.g. translation history popups).
- **External Invocation** ≠ the OpenAI / Google API calls — the former is
  the *inbound* HTTP surface YiPot exposes; the latter are *outbound* calls
  to translation backends.
- **Daemon** ≠ background OCR — daemon refers specifically to the
  `daemon.html` Vite entry / headless HTTP mode.
