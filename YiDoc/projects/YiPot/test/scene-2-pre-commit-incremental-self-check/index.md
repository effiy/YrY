# §0 Effect Sketch — Pre-Commit Incremental Self-Check

**What this scene demonstrates**: A lightweight self-check that runs before every git commit. Unlike the full post-init check, this scene focuses on what changed — running only the checks relevant to the files in the staging area. The goal is sub-second verification that catches regressions before they land in the repository.

**Why it matters**: Full self-checks (scene 1) take 30+ seconds across all 11 scenes. A pre-commit check must be fast enough to run on every commit without disrupting developer flow. This scene defines the incremental check strategy: detect what changed, run only the overlapping checks, and produce a "fast-pass" or "block" verdict.

---

# §1 Test Design — Verification Steps

## Step 1: Staged file detection
**Action**: Run `git diff --cached --name-only` to list files in the staging area. For each file, map it to the check categories it affects.
**Expected**: A file like `src/services/translate/deepl/index.jsx` maps to "service engine", which triggers the "engine contract" check (does the `translate()` function signature still match?). A file like `src-tauri/src/config.rs` maps to "config store", triggering the "store schema" check.
**File**: `.git/hooks/pre-commit` (to be created).

## Step 2: Engine contract check (for services/ changes)
**Action**: For any file under `src/services/`, verify that the exported function (`translate`, `recognize`, `tts`, `collect`) has the correct arity and return type by comparing the signature in `info.ts` with the export in `index.jsx`.
**Expected**: If a translate engine's `info.ts` declares `support: {language: {...}}` but `index.jsx`'s `translate()` doesn't accept a `from` and `to` parameter, the check fails.
**File**: `src/services/translate/deepl/info.ts` and `src/services/translate/deepl/index.jsx`.

## Step 3: Config store schema check (for config changes)
**Action**: For any file change that touches `src-tauri/src/config.rs` or `src/utils/store.js`, verify that the keys used in `get("...")` calls exist in the source code and are documented in `README.md`'s Domain Language section.
**Expected**: A new key like `get("my_new_setting")` in config.rs must have a corresponding usage in the frontend and a definition in the domain language section.
**File**: `src-tauri/src/config.rs`, `src/utils/store.js`, `README.md`.

## Step 4: IPC command registration check (for main.rs changes)
**Action**: For changes to `src-tauri/src/main.rs`, verify that every command in `invoke_handler(tauri::generate_handler![...])` corresponds to an actual function defined in one of the Rust modules.
**Expected**: Adding `my_new_cmd` to the handler list without a `fn my_new_cmd()` definition fails the check.
**File**: `src-tauri/src/main.rs`.

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `.git/hooks/pre-commit` | file | (To be created) Shell/Node script for incremental self-check |
| `src/services/translate/*/info.ts` | file | Engine metadata — declares the interface contract |
| `src/services/translate/*/index.jsx` | file | Engine implementation — must match contract |
| `src-tauri/src/main.rs` | file | IPC handler registration — must match function definitions |
| `src-tauri/src/config.rs` | file | Config store key registry — must match frontend usage |
| `README.md` | file | Domain Language — must reflect new config keys |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | File-to-check mapping defined — 4 categories: services/, config, main.rs, docs/ |
| 2 | ✅ | Engine contract check described — info.ts vs index.jsx signature comparison |
| 3 | ✅ | Config store key consistency check defined |
| 4 | ✅ | IPC handler definition check defined |

**Overall**: pass — 4/4 steps passed (check strategy defined; implementation pending)

---

# §4 Self-Improvement

## Edge Cases Found
- A change to `package.json` that adds a dependency requires checking both `pnpm-lock.yaml` consistency and whether the dependency is documented in data.js.
- A change to `tauri.conf.json` requires a full Tauri allowlist re-audit (scene 5 in arch/) — too heavy for pre-commit.
- Renamed files (detected by git as add + delete) can confuse the file-to-check mapper because the old path no longer exists.
- Plugin engines (loaded from config dir, not source) are invisible to git — no pre-commit check covers them.

## Suggested Improvements
- Implement the pre-commit hook as a Node.js script using `simple-git` for staged file detection and file-system traversal for signature checking.
- Add a `--skip-checks` flag to `git commit` for emergency commits when the check produces a false positive.
- Cache the last successful check's file hashes so unchanged files don't get re-checked on every commit.

## Limitations
- The pre-commit check is a design spec — the hook script has not been implemented yet.
- JavaScript (not TypeScript) makes automated signature checking imprecise — `translate(args)` is harder to type-check than `translate(args: TranslateArgs): Promise<string>`.
