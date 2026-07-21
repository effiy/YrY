# §0 Effect Sketch — Dependency Change Impact

**What this scene demonstrates**: What breaks when a dependency is upgraded. YiPot has three dependency manifests (`package.json` for NPM, `Cargo.toml` for Rust crates, and platform-specific sections). This scene maps the impact surface for each category — framework upgrades (React, Tauri, Vite), service SDK upgrades (OpenAI client, ollama JS client), and native crate upgrades (lingua, screenshots, arboard).

**Why it matters**: YiPot aggregates 29 NPM runtime deps, 9 dev deps, and 20+ Rust crates. A single `pnpm update` or `cargo update` can silently break the clipboard monitor, the OCR pipeline, or an LLM translation engine. This scene provides a risk matrix and a verification protocol so upgrades can be assessed before they land.

---

# §1 Test Design — Verification Steps

## Step 1: Tauri major version upgrade impact
**Action**: Hypothesize upgrading Tauri from 1.8 to 2.x. Scan `src-tauri/Cargo.toml`, `tauri.conf.json`, and all `use tauri::*` imports in Rust source.
**Expected**: Breaking changes would affect: the plugin ecosystem (v1 plugins use git-based imports from `tauri-apps/plugins-workspace` branch `v1`), the `tauri.conf.json` schema (v2 changed allowlist to permissions), and the IPC invoke API (`@tauri-apps/api` v1 → v2).
**File**: `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `package.json`.

## Step 2: React version upgrade impact
**Action**: Hypothesize upgrading React from 18 to 19. Scan all JSX files for deprecated patterns and hooks usage.
**Expected**: React 19 would require: updating `react-dom/client` APIs (if changed), auditing `useEffect` dependency arrays, and verifying NextUI 2.x compatibility with React 19. The 7 custom hooks in `src/hooks/` would need review.
**File**: `src/main.jsx`, `src/hooks/`, `src/App.jsx`.

## Step 3: Rust crate upgrade impact (lingua)
**Action**: Hypothesize upgrading `lingua` from 1.6.2 to 2.x. Scan `lang_detect.rs` for the API surface used.
**Expected**: The `lingua` crate's language feature flags (21 languages declared in Cargo.toml) may change in v2. The `init_lang_detect()` and `lang_detect()` functions in `lang_detect.rs` need testing across all supported languages.
**File**: `src-tauri/src/lang_detect.rs`, `src-tauri/Cargo.toml`.

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `package.json` | file | NPM dependency manifest — 38 total packages |
| `pnpm-lock.yaml` | file | Exact version resolution for all NPM dependencies |
| `src-tauri/Cargo.toml` | file | Rust dependency manifest — 20+ crates with platform-gated sections |
| `src-tauri/Cargo.lock` | file | Exact version resolution for all Rust dependencies |
| `src-tauri/src/lang_detect.rs` | file | Lingua crate consumer — language detection API surface |
| `src-tauri/src/screenshot.rs` | file | Screenshots crate consumer — cross-platform screen capture |
| `src/utils/lang_detect.js` | file | JS-side language detection — interacts with Rust via `invoke('lang_detect')` |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | Tauri v1 → v2 migration surface documented — plugins, config schema, JS API are the main risk areas |
| 2 | ✅ | React 18 → 19 impact mapped — hooks audit, NextUI compatibility check, `createRoot` API verification |
| 3 | ✅ | Lingua upgrade impact traced — language features in Cargo.toml and the two functions in `lang_detect.rs` |

**Overall**: pass — 3/3 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- `tauri-plugin-sql` is imported but its SQLite usage in the frontend is unclear — an upgrade may break a feature that isn't obviously used.
- Platform-gated dependencies (`[target.'cfg(target_os = "macos")'.dependencies]`, `[target.'cfg(windows)'.dependencies]`) mean an upgrade that passes on macOS may fail on Windows.
- The `lingua` crate's 21 language feature flags are exhaustive — removing one would silently drop language detection support.
- `node-fetch` is in devDependencies but used in the `updater/` scripts — its version matters for the build pipeline, not the runtime.

## Suggested Improvements
- Add a `scripts/check-deps.sh` that runs `pnpm outdated` and `cargo outdated` and produces a structured risk report.
- Pin all `tauri-plugin-*` crates to exact git commits instead of branches to make upgrades reproducible.
- Add CI that builds on all three platforms (macOS, Windows, Linux) to catch platform-gated compilation failures.

## Limitations
- No automated dependency vulnerability scanner (e.g., `cargo audit`, `npm audit`) is integrated into the development workflow.
- The impact of upgrading LLM SDKs (ollama JS client, OpenAI client) is hard to predict without running integration tests against live API endpoints.
