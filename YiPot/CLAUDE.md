# YiPot · CLAUDE.md

## Foundational beliefs

- **Trust the model** — YiPot is a Tauri desktop app. Trust the Tauri IPC model, the plugin
  ecosystem (single-instance, autostart, sql, store, fs-watch), and the React component tree.
  The Rust backend owns system interaction; the JS frontend owns UI.
- **Value attention** — Every window (Translate, Recognize, Screenshot, Config, Updater) is its
  own Tauri window instance, dispatched by `appWindow.label`. Attention should flow from the
  active window's label to the correct component in `windowMap`.
- **Verify reality** — YiPot's translation pipeline involves three tiers: Rust system layer
  (clipboard, screenshot, OCR, language detection), a local HTTP server bridge (tiny_http on
  port 60828), and JS service layer (21 translate + 15 recognize + 1 TTS + 2 collection engines).
  Verify that data passes cleanly across all three.
- **Think Before Coding** — Don't assume, surface tradeoffs. If multiple translation engines can
  serve a request, present the options. If a simpler approach exists, say so.

## Iron laws

- **Simplicity First** — No features beyond what was asked; no abstractions for single-use code;
  no error handling for impossible scenes. The service plugin architecture (each engine is a
  self-contained directory with Config.jsx + index.jsx + info.ts) is already clean — don't
  disrupt it.
- **Surgical Changes** — Touch only what you must. Don't "improve" adjacent services. Match
  existing style: JSX with React hooks, camelCase file naming, snake_case for Rust modules.
  Every changed line traces to the user's request.
- **Goal-Driven Execution** — Define success criteria, loop until verified. For multi-step tasks,
  state a brief plan with verify checks per step. The Tauri `invoke` bridge means changes
  often span JS → Rust → OS — verify at each boundary.

## Project profile

| Field | Value |
|-------|-------|
| Project name | YiPot (package name: "pot") |
| Project type | Fullstack (Tauri + React) |
| Version | 3.0.7 |
| Architecture | Single-package (one `src/` + one `src-tauri/`) |
| Frontend | React 18 + Vite 5 + NextUI + Tailwind CSS |
| Backend | Rust · Tauri 1.8 · tiny_http · lingua · screenshots |
| State management | Jotai (React) + tauri-plugin-store (Rust) |
| i18n | i18next · en_US + es_ES |
| Package manager | pnpm |
| Test framework | None |

## Project constraints

- **Non-negotiable baselines**: Tauri 1.8 API surface; React 18; pnpm as package manager;
  `config.json` in Tauri's app config directory as the single source of truth for settings.
- **Degradation countermeasures**: Each service engine (translate/recognize/TTS/collection)
  must fail independently — one engine's API error must not cascade. The config store's
  `check_service_available()` runs on startup to prune unavailable services.
- **Self-constraints**: Windows (macOS, Linux, Windows) behave differently for OCR and
  accessibility; platform-gated code uses `#[cfg(target_os = "...")]` in Rust and
  `appWindow.label` in JS.

## Guidance

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | This file — project beliefs, iron laws, profile, constraints |
| `README.md` | System view, command flow, quick start, project structure, domain language |
| `docs/` | Dashboard home entry (`docs/index.html` + `data.js`) |
| `docs/arch/` | Architecture reference scenes (5+) |
| `docs/test/` | Self-check strategy scenes (6+) |
