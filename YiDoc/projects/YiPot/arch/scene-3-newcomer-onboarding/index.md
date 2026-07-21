# §0 Effect Sketch — Newcomer Onboarding

**What this scene demonstrates**: A structured reading order for developers new to the YiPot codebase. Starting from the highest-level architectural decisions and descending into implementation details, the scene provides a 30-minute guided tour that covers the Tauri dual-codebase model, the service plugin architecture, the window dispatch system, and the config store as the single source of truth.

**Why it matters**: YiPot is a non-trivial fullstack project — 39 service engines, 5 Tauri windows, a Rust backend with 14 modules, and a React frontend with NextUI + Jotai + i18next. Without a guided onboarding path, newcomers face a steep learning curve. This scene reduces time-to-first-contribution by prescribing a reading order and explaining the "why" behind each architectural decision.

---

# §1 Test Design — Verification Steps

## Step 1: Understand the dual-codebase model
**Action**: Read `src-tauri/Cargo.toml` and `package.json` side by side, then read `src-tauri/src/main.rs` and `src/main.jsx`.
**Expected**: The newcomer understands that Tauri wraps a Rust binary that opens webview windows, each running the React frontend. The `tauri.conf.json` defines window labels; `App.jsx` dispatches them.
**File**: `src-tauri/Cargo.toml`, `package.json`, `src-tauri/src/main.rs`, `src/main.jsx`.

## Step 2: Understand the service plugin architecture
**Action**: Read one translate engine triad (e.g., `src/services/translate/deepl/`), then the barrel file `src/services/translate/index.jsx`. Repeat for a recognize engine (e.g., `src/services/recognize/system/`).
**Expected**: The newcomer grasps the three-file pattern: `info.ts` (metadata), `Config.jsx` (settings UI), `index.jsx` (invocation logic). The barrel file re-exports all engines, and the config store (`config.json`) holds the user's ordered service list.
**File**: `src/services/translate/deepl/` (info.ts, Config.jsx, index.jsx).

## Step 3: Understand the window dispatch system
**Action**: Read `src/App.jsx` → trace the `windowMap` object → open `src/window/Translate/index.jsx` to see how a window panel consumes the config store and invokes services.
**Expected**: The newcomer understands that `appWindow.label` (from `@tauri-apps/api/window`) is the single routing key, that every window runs the full React app tree but only renders one panel, and that panels communicate through the shared config store (not React context).
**File**: `src/App.jsx`, `src/window/Translate/index.jsx`.

## Step 4: Understand the config store
**Action**: Read `src-tauri/src/config.rs` (Rust side) and `src/utils/store.js` (JS side).
**Expected**: The newcomer understands that `config.json` in Tauri's app config directory is the single source of truth, accessed via `tauri-plugin-store` (Rust) and `tauri-plugin-store-api` (JS), with `fs-watch` for live sync.
**File**: `src-tauri/src/config.rs`, `src/utils/store.js`.

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `CLAUDE.md` | file | Project beliefs, iron laws, profile, constraints — read first |
| `README.md` | file | System view, commands, structure, domain language — read second |
| `src-tauri/Cargo.toml` | file | Rust dependencies — understand the native layer |
| `package.json` | file | NPM dependencies — understand the frontend layer |
| `src-tauri/tauri.conf.json` | file | Tauri config — window definitions, allowlist, bundle settings |
| `src-tauri/src/main.rs` | file | Rust entry — plugin wiring, setup hook, invoke handler |
| `src/App.jsx` | file | Frontend root — window routing, theme/language config |
| `src/services/translate/deepl/` | dir | Canonical service engine example — the simplest translation engine triad |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | Dual-codebase model clearly documented — Tauri builder in Rust, React app in webview |
| 2 | ✅ | Service plugin pattern is consistent — every engine follows the `{info.ts, Config.jsx, index.jsx}` triad |
| 3 | ✅ | Window dispatch via `windowMap[appWindow.label]` is a clean pattern — single routing key |
| 4 | ✅ | Config store is well-abstracted — Rust `get/set` mirrors JS `store.get/store.set` |

**Overall**: pass — 4/4 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- The `daemon` window (label "daemon", visible: false) is used as a background runner for the HTTP server and isn't documented in any onboarding material.
- Platform-specific code in Rust uses `#[cfg(target_os = "macos")]` / `#[cfg(windows)]` — newcomers on Linux may encounter compile-time exclusions.
- `tauri-plugin-sql` (SQLite) is wired but not obviously used in the frontend — its purpose (future history storage?) needs clarification.

## Suggested Improvements
- Add an `ARCHITECTURE.md` with a Mermaid diagram showing the three tiers (Rust system layer → Tauri IPC bridge → React service layer).
- Add a "Your First Engine" guide showing how to add a new translation engine end-to-end (create the triad → register in barrel → add to builtin list in `config.rs`).
- Document the `pnpm tauri dev` workflow including the Vite dev server at port 1420 and how hot-reload works across Rust recompiles vs JS HMR.

## Limitations
- No automated "project tour" command exists — onboarding is entirely manual via documentation reading.
- The service engine interface (`translate()`, `recognize()`, `tts()`) has no TypeScript interface definition — engines rely on implicit contracts.
