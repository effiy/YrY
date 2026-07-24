# §0 Effect Sketch — Doc-Code Consistency

**What this scene demonstrates**: A systematic check that YiPot's documentation (CLAUDE.md, README.md, docs/data.js, arch and test scenes) accurately reflects the current state of the source code. Doc-code drift happens silently: a service engine is added but not listed in data.js, a Rust module is renamed but README.md still references the old name, or the config store gains a new key without a domain language entry.

**Why it matters**: Generated documentation is only as good as its freshness. Without a periodic consistency check, the docs become a liability — misleading newcomers and wasting debugging time. This scene defines a cross-reference protocol between the source tree and the docs tree.

---

# §1 Test Design — Verification Steps

## Step 1: Service engine count consistency
**Action**: Count directories in `src/services/translate/`, `src/services/recognize/`, `src/services/tts/`, `src/services/collection/`. Compare against the numbers claimed in `data.js`'s stats and the README.md's project structure.
**Expected**: Translate engines = 21, Recognize engines = 15, TTS = 1, Collection = 2. Data.js `stats[0].value` should be "21", `stats[1].value` should be "15".
**File**: `src/services/translate/`, `docs/data.js`, `README.md`.

## Step 2: Rust module count consistency
**Action**: Count `mod X;` declarations in `src-tauri/src/main.rs`. Count `*.rs` files in `src-tauri/src/`. Compare against README.md's project structure listing.
**Expected**: 14 Rust modules declared. README.md's "Project structure" section should list all 14.
**File**: `src-tauri/src/main.rs`, `README.md`.

## Step 3: Data.js reference accuracy
**Action**: Check that every `meta` path in `data.js`'s `section-source` groups (e.g., `src/services/translate/`, `src-tauri/src/clipboard.rs`) corresponds to an actual file or directory on disk.
**Expected**: All `meta` paths resolve. No stale references to deleted or renamed files.
**File**: `docs/data.js`.

## Step 4: Arch/test scene content freshness
**Action**: For each arch and test scene, verify that file paths mentioned in the §2 Output Inventory still exist on disk. Check that module names in scene content match current source.
**Expected**: All referenced paths resolve. No scenes reference deleted modules.
**File**: `docs/arch/scene-*/index.md`, `docs/test/scene-*/index.md`.

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `src/services/` | dir | Source of truth — actual service engine directories |
| `src-tauri/src/` | dir | Source of truth — actual Rust module files |
| `docs/data.js` | file | Dashboard data model — must reflect actual counts |
| `README.md` | file | Project structure listing — must match source tree |
| `CLAUDE.md` | file | Project profile — must match actual type/version |
| `docs/arch/scene-1-module-location/index.md` | file | Module location scene — must reference actual paths |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | Service counts match: 21 translate, 15 recognize, 1 TTS, 2 collection |
| 2 | ✅ | 14 Rust modules in main.rs match README.md structure listing |
| 3 | ✅ | All data.js meta paths resolve to existing files/directories |
| 4 | ✅ | All arch/test scene file references resolve correctly |

**Overall**: pass — 4/4 steps passed (verified at generation time; periodic re-check needed)

---

# §4 Self-Improvement

## Edge Cases Found
- Service engine directories contain 3 files each (Config.jsx, index.jsx, info.ts) — if a new engine is added with only 2 files, the count would pass but the engine would be malformed.
- The data.js stats are hardcoded strings, not computed from the source tree — they will drift as engines are added/removed.
- File renames (e.g., `ocr_recognize.rs` → `system_ocr.rs`) would break scene references without a corresponding doc update.
- The `daemon` window has no source code representation in the frontend `window/` directory — it's invisible to a file-count check.

## Suggested Improvements
- Generate data.js stats dynamically from a script that counts service directories and Rust modules, rather than hardcoding numbers.
- Add a pre-push CI step that runs a doc-code consistency check using the protocol defined in this scene.
- Add a `"lastVerified": "2026-07-21"` field to data.js so consumers can see when the docs were last validated against source.

## Limitations
- This check was run once at generation time. Without automation, it will drift within weeks as the project evolves.
- Semantic consistency (does the description match what the code does?) cannot be verified by counting files — it requires human review.
