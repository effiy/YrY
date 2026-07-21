# §0 Effect Sketch — Module Location

**What this scene demonstrates**: How to locate any module — frontend service engine, window panel, React hook, or Rust backend module — within YiPot's source tree. Given a feature description (e.g. "DeepL translation" or "clipboard monitor"), the scene traces the exact file path, its module dependencies, and where it fits in the overall architecture.

**Why it matters**: YiPot has 39 service engines, 5 window panels, 7 hook modules, and 14 Rust modules spread across two codebases. Without a systematic module-location strategy, developers waste time guessing file paths. This scene maps the naming conventions and directory hierarchy so every module is findable in seconds.

---

# §1 Test Design — Verification Steps

## Step 1: Locate a translate service engine
**Action**: Given "OpenAI translation engine", trace to its source location.
**Expected**: `src/services/translate/openai/` with files `Config.jsx`, `index.jsx`, `info.ts`.
**File**: `src/services/translate/index.jsx` — the barrel file re-exports all 21 engines as named exports.

## Step 2: Locate a Rust backend module
**Action**: Given "language detection in Rust backend", trace to its source location.
**Expected**: `src-tauri/src/lang_detect.rs` and the `lingua` crate dependency in `src-tauri/Cargo.toml`.
**File**: `src-tauri/src/main.rs` line `mod lang_detect;` and `use lang_detect::*;`.

## Step 3: Locate a window panel
**Action**: Given "the OCR recognize window", trace from App.jsx to the component tree.
**Expected**: `App.jsx` imports `Recognize` from `./window/Recognize`, and `windowMap['recognize']` dispatches to `<Recognize />`. The component lives at `src/window/Recognize/index.jsx`.
**File**: `src/App.jsx` — the `windowMap` object.

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `src/services/translate/` | dir | 21 sub-directories, each a translation engine |
| `src/services/recognize/` | dir | 15 sub-directories, each an OCR backend |
| `src/services/tts/` | dir | 1 TTS service (Lingva) |
| `src/services/collection/` | dir | 2 collection backends (Anki, Eudic) |
| `src/window/` | dir | 5 window panels (Translate, Recognize, Screenshot, Config, Updater) |
| `src/hooks/` | dir | 7 React hooks (useConfig, useGetState, useSyncAtom, etc.) |
| `src/utils/` | dir | 7 utility modules (store, env, invoke_plugin, lang_detect, etc.) |
| `src-tauri/src/` | dir | 14 Rust modules (main, config, server, clipboard, hotkey, etc.) |
| `src-tauri/Cargo.toml` | file | Rust dependency manifest with 20+ crates |
| `package.json` | file | NPM dependency manifest with 29 runtime + 9 dev deps |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | Translate engines follow the `{engine}/Config.jsx + index.jsx + info.ts` triad pattern consistently |
| 2 | ✅ | Rust modules declared in `main.rs` with `mod X;` and imported with `use X::*;` |
| 3 | ✅ | Window dispatch via `windowMap[appWindow.label]` in App.jsx is the single entry point |

**Overall**: pass — 3/3 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- The `daemon` window (label "daemon") has `visible: false` in tauri.conf.json and is not in `windowMap` — it's a hidden background runner.
- Service engines prefixed with "plugin" are loaded from `{config_dir}/plugins/{type}/` at runtime, not from `src/services/`.
- Multiple engines map to the same provider (e.g., 3 Baidu OCR variants: `baidu_ocr`, `baidu_accurate_ocr`, `baidu_img_ocr`).

## Suggested Improvements
- Add a `CONTRIBUTING.md` with a visual module dependency graph showing the Tauri IPC bridge between Rust modules and JS service engines.
- Document the barrel-file re-export pattern (`src/services/translate/index.jsx`) as the canonical way to register a new engine.
- Add TypeScript path aliases in `tsconfig.json` for `@services/`, `@window/`, `@hooks/` to make imports self-documenting.

## Limitations
- No automated module-to-feature reverse index exists. Finding "which module does X" requires manual traversal of barrel files.
- Plugin engines (dynamically loaded from config dir) are invisible in the static source tree.
