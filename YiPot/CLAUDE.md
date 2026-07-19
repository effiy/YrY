# CLAUDE.md — YiPot

## Foundational Beliefs

- **Trust the model.** Default to direct action over re-confirming what the
  user already said.
- **Value attention.** Keep the working set small; prefer surgical reads and
  writes over sweeping scans.
- **Verify reality.** Read the file before editing; never assume a symbol
  exists from memory.
- **Think Before Coding (Karpathy §1).** State assumptions explicitly. When
  multiple interpretations exist, present them. When a simpler approach
  exists, say so.

## Iron Laws

- **Simplicity First (Karpathy §2).** No features beyond what was asked. No
  abstractions for single-use code. No error handling for impossible scenes.
- **Surgical Changes (Karpathy §3).** Touch only what you must. Don't
  "improve" adjacent code. Match existing style. Every changed line traces
  to the user's request.

## Project Profile

| Field | Value |
|-------|-------|
| Name | `YiPot` (a Tauri-based cross-platform selection translator; downstream of pot-app/pot-desktop) |
| Type | `fullstack` — React 18 + Vite frontend + Rust backend (`src-tauri/`) |
| Version | 3.0.7 (frontend) / 0.0.0 (Rust crate) |
| Architecture | `plugin` — one React `src/` plus a bundled Tauri Rust shell in `src-tauri/`. Service backends under `src/services/{translate,recognize,tts,collection}/<name>/` are pluggable units, each shipping `index.jsx` + `Config.jsx` + `info.ts`. |
| Ecosystem | Node (pnpm) + Cargo (Rust 2021) |
| Self-hosted | No — builds into platform installers (Windows / macOS / Linux) via `tauri build` |

## Project Inventory

### Framework Versions

| Framework | Version | Role |
|-----------|---------|------|
| React | ^18.3.1 | UI runtime |
| Vite | ^5.4.10 | Bundler / dev server |
| TypeScript | ^5.6.3 | Type system (used by `info.ts` per service) |
| Tailwind CSS | ^3.4.14 | Utility-first styling (PostCSS pipeline) |
| NextUI | ^2.4.8 | Component library |
| Jotai | ^2.10.1 | Atom-based state (alongside `tauri-plugin-store`) |
| react-router-dom | ^6.27.0 | In-window routing (single window per route label) |
| i18next + react-i18next | ^23.16.4 / ^15.1.0 | i18n (20 locale files under `src/i18n/locales/`) |
| Tesseract.js | ^5.1.1 | WASM OCR fallback |
| @tauri-apps/api | ^1.6.0 | JS bridge to Rust |
| Tauri (Rust) | 1.8 | Desktop shell + IPC |
| framer-motion / @react-spring/web | ^11 / ^9.7 | Animation |

### Build Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Vite dev server (port 1420, Tauri-fixed) |
| `pnpm build` | Vite production build (frontend only) |
| `pnpm preview` | Preview the production Vite output |
| `pnpm tauri` | Pass-through to Tauri CLI (`pnpm tauri dev` / `pnpm tauri build`) |
| `pnpm tauri dev` | Run the full desktop app in dev mode |
| `pnpm tauri build` | Build platform installer (frontend + Rust) |
| `pnpm updater` | Generate updater artifacts (`updater/updater.mjs`) |
| `pnpm updater:fixRuntime` | Generate fix-runtime updater (`updater/updater-for-fix-runtime.mjs`) |

### Test Commands

None declared in `package.json`. `testFramework: 'none'` — manual smoke
testing through the Tauri dev window is the current verification path.
Rely on `pnpm tauri dev` plus a real selection-translate round-trip.

## Project Constraints

### Non-negotiable Baselines

- **Tauri 1.x WebView target.** Frontend must run in Tauri's webview (Safari
  11 on macOS, WebView2 on Windows, WebKitGTK on Linux). Avoid modern
  browser features beyond those targets (see `vite.config.js` `build.target`).
- **Dual entry points.** `index.html` (main app) and `daemon.html` (external
  invocation / HTTP daemon) are both rolled up by Vite — don't drop either.
- **Rust ↔ JS bridge.** All native capabilities (clipboard, hotkey,
  screenshot, system OCR, tray, updater, server, backup) are Tauri commands
  invoked from JS via `@tauri-apps/api/tauri::invoke`. The Rust side lives
  in `src-tauri/src/`. Mirror-module pairs (`lang_detect.rs` ↔ `lang_detect.js`)
  are intentional: native speed vs. in-window previews.
- **Plugin system.** External `.potext` plugins are loaded at runtime via
  `src/utils/invoke_plugin.js`. Built-in services and plugins share the same
  resolution path through `src/utils/service_instance.ts`.

### Degradation Countermeasures

- **Missing CDN components.** The dashboard at `docs/index.html` depends on
  the rui-html-cdn shared library; if it is not installed, the page still
  renders structure but interactive Vue components degrade to empty custom
  elements. Non-blocking.
- **Missing system OCR.** Linux depends on Tesseract; if absent, OCR falls
  back to `tesseract.js` (WASM).
- **Wayland.** Tauri shortcuts and built-in screenshot don't work on pure
  Wayland; the app documents an external-invocation workaround (curl to
  `127.0.0.1:60828/...`).
- **External invocation offline.** If `server.rs` fails to bind, the app
  still works for hotkey-driven selection; only outbound triggering from
  PopClip / SnipDo / shell scripts is affected.

### Self-Constraints

- No automated test suite yet — every change must be smoke-tested in
  `pnpm tauri dev` before reporting done.
- The `server.rs` HTTP daemon (default port 60828) listens on localhost
  only; do not expose it externally without an auth layer.
- Service `Config.jsx` panels must accept a per-instance `key` so multiple
  instances of the same backend (e.g. two OpenAI accounts) can coexist.

## Guidance

| Document | Where |
|----------|------|
| README.md | `./README.md` |
| Docs home | `./docs/index.html` |
| Architecture stories | `./docs/arch/` |
| Self-check stories | `./docs/test/` |

### Documentation Navigation

- **Onboarding** → `docs/arch/scene-3-newcomer-onboarding/index.md`
- **Module location** → `docs/arch/scene-1-module-location/index.md`
- **Data flow** → `docs/arch/scene-2-data-flow-tracing/index.md`
- **Dependency change** → `docs/arch/scene-4-dependency-change-impact/index.md`
- **Trust boundary** → `docs/arch/scene-5-trust-boundary-security-surface/index.md`
- **Post-init self-check** → `docs/test/scene-1-post-init-full-self-check/index.md`
- **Pre-commit check** → `docs/test/scene-2-pre-commit-incremental-self-check/index.md`
- **Doc-code consistency** → `docs/test/scene-3-doc-code-consistency/index.md`
- **Security regression** → `docs/test/scene-4-security-surface-regression/index.md`
- **Cross-story regression** → `docs/test/scene-5-cross-story-integration-regression/index.md`
- **Third-party service health** → `docs/test/scene-6-third-party-framework-service/index.md`
