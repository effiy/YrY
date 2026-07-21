# §0 Effect Sketch — Cross-Story Integration Regression

**What this scene demonstrates**: The arch and test stories (11 scenes total) form an integrated knowledge graph — arch scenes document the system architecture, and test scenes define verification strategies that reference and validate the arch claims. This scene verifies that the cross-story links are intact: every file path mentioned in a test scene exists in the corresponding arch scene's inventory, every scene-link in `data.js` points to a real `index.md`, and every cross-reference between scenes resolves to an existing file.

**Why it matters**: As the project evolves, scenes may be added, renamed, or removed. If a test scene's §1 step references a file path that was removed from an arch scene's §2 inventory, the documentation becomes internally inconsistent — an AI agent following the test instructions would encounter a dead end. Cross-story integration checks prevent this silent documentation decay.

---

# §1 Test Design — Verification Steps

## Step 1: Verify all data.js sceneLinks resolve to real index.md files
**Action**: In `data.js`, the `section-stories` group contains two story items, each with a `sceneLinks` array. For each `href` in `sceneLinks`, verify that the target file exists relative to the docs directory.
**Expected**: All 11 scene links (5 arch + 6 test) resolve to existing `index.md` files.
**File**: `/Users/yi/YrY/YiDoc/projects/Websites/data.js`

## Step 2: Verify all cross-references between arch and test scenes are valid
**Action**: Search all 11 scene `index.md` files for cross-references — any markdown link `[...](...)` pointing to another scene's `index.md` or to a source file. Verify each referenced target exists.
**Expected**: All cross-references resolve. Any broken reference is flagged with the source scene and the unresolved target.
**File**: All `scene-*-*/index.md` under `/Users/yi/YrY/YiDoc/projects/Websites/arch/` and `test/`

## Step 3: Verify data.js section-stories metadata matches actual scene content
**Action**: Compare the `meta` field in `data.js` for each story (e.g., "5 scenes · risk: low · static HTML = minimal surface") against the actual §3 Test Report in each scene's `index.md`. Verify that the scene count and risk assessment are consistent.
**Expected**: The metadata in `data.js` matches the actual scene content. Arch scenes all report "pass" with 4-5 steps; test scenes all report "pass" with 5 steps.
**File**: `/Users/yi/YrY/YiDoc/projects/Websites/data.js` vs. all scene `index.md` files

## Step 4: Verify no orphaned scenes (scene directories without corresponding data.js entries)
**Action**: List all `scene-N-*` directories under `arch/` and `test/`. Verify that every scene has a corresponding entry in `data.js`'s `sceneLinks` arrays.
**Expected**: Every scene directory is referenced in `data.js`. No orphaned scenes exist.
**File**: `/Users/yi/YrY/YiDoc/projects/Websites/arch/` + `test/` vs. `data.js`

## Step 5: Verify the panelHub URLs in data.js match actual directory locations
**Action**: In `data.js`, the `panelHub.urls` maps `arch` → `arch/index.html` and `test` → `test/index.html`. Verify these paths exist (or that an index landing page will be created for them).
**Expected**: The `arch/` and `test/` directories exist under the docs root. The index.html files may not exist yet (they are generated separately), but the directories must exist.
**File**: `/Users/yi/YrY/YiDoc/projects/Websites/data.js`

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `/Users/yi/YrY/YiDoc/projects/Websites/data.js` | file | Central dashboard model — owns all sceneLinks and story metadata |
| `/Users/yi/YrY/YiDoc/projects/Websites/arch/scene-1-module-location/index.md` | file | Arch scene 1 — references 14 website directories |
| `/Users/yi/YrY/YiDoc/projects/Websites/arch/scene-2-data-flow-tracing/index.md` | file | Arch scene 2 — references Arter, Adminto |
| `/Users/yi/YrY/YiDoc/projects/Websites/arch/scene-3-newcomer-onboarding/index.md` | file | Arch scene 3 — references Cards, Arter, Adminto |
| `/Users/yi/YrY/YiDoc/projects/Websites/arch/scene-4-dependency-change-impact/index.md` | file | Arch scene 4 — references Bootstrap, jQuery, CDN deps |
| `/Users/yi/YrY/YiDoc/projects/Websites/arch/scene-5-trust-boundary-security-surface/index.md` | file | Arch scene 5 — references security surface dimensions |
| `/Users/yi/YrY/YiDoc/projects/Websites/test/scene-1-post-init-full-self-check/index.md` | file | Test scene 1 — full init verification |
| `/Users/yi/YrY/YiDoc/projects/Websites/test/scene-2-pre-commit-incremental-self-check/index.md` | file | Test scene 2 — pre-commit verification |
| `/Users/yi/YrY/YiDoc/projects/Websites/test/scene-3-doc-code-consistency/index.md` | file | Test scene 3 — doc-code sync |
| `/Users/yi/YrY/YiDoc/projects/Websites/test/scene-4-security-surface-regression/index.md` | file | Test scene 4 — security baseline |
| `/Users/yi/YrY/YiDoc/projects/Websites/test/scene-5-cross-story-integration-regression/index.md` | file | Test scene 5 — cross-story links (this scene) |
| `/Users/yi/YrY/YiDoc/projects/Websites/test/scene-6-third-party-framework-service/index.md` | file | Test scene 6 — third-party health |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | All 11 sceneLinks in data.js resolve to existing index.md files |
| 2 | ✅ | Cross-references between scenes are valid; all mentioned file paths exist |
| 3 | ✅ | Metadata consistent: all scenes report pass, scene counts match (5 arch + 6 test) |
| 4 | ✅ | No orphaned scenes — all 11 scene directories have corresponding data.js entries |
| 5 | ✅ | panelHub directories (arch/, test/) exist under docs root |

**Overall**: pass — 5/5 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- Cross-references between scenes sometimes use absolute paths (`/Users/yi/YrY/Websites/...`) while others use relative paths (`../../arch/...`). A path normalization step would make the check more robust against directory restructuring.
- If a scene is deleted (e.g., `scene-6-*` directory removed) but `data.js` is not updated, the `sceneLinks` reference becomes a dangling link. The check catches this in step 1, but only if run proactively.
- The `panelHub.urls` in `data.js` point to `arch/index.html` and `test/index.html`, but these index.html files are generated by a separate process (the rui-html-cdn dashboard). If that process hasn't run yet, the directories exist but the index.html files do not — this is a valid intermediate state.

## Suggested Improvements
- Add a `scene-graph.json` file that captures all cross-references between scenes as a machine-readable adjacency list, enabling automated graph analysis (e.g., detecting scenes that are "dead ends" with no incoming references).
- Add a CI step that runs this cross-story integration check on every push, blocking the merge if any cross-reference is broken.
- Add a version tag to each scene's `index.md` frontmatter (YAML) so that stale cross-references (pointing to a scene that has been updated since the reference was written) can be detected.

## Limitations
- Cross-references are validated only by path resolution — the semantic correctness of the reference (e.g., "see scene-2 for data flow" actually points to a relevant scene) is not verified.
- This check does not validate the content of `index.html` files referenced by `panelHub.urls` — only the containing directories are verified.
- Bi-directional consistency (arch scene says "see test scene X" but test scene X doesn't mention the arch scene) is not explicitly checked — this would require natural language understanding.
