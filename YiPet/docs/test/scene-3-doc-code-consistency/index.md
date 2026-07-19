# §0 Effect Sketch — Doc-code Consistency

```mermaid
flowchart LR
  docs[CLAUDE.md / README.md / docs/data.js]:::source --> claims[documented entry points and terms]:::doc
  claims --> code[src/* and docs/arch/* targets]:::check
  code --> dashboard[dashboard cards and scene hrefs]:::check
  dashboard --> gate{all claims resolve?}:::decision
  gate -->|yes| pass([docs match code]):::done
  gate -->|no| fail([refresh stale references]):::risk

  classDef source fill:#dcfce7,stroke:#16a34a,color:#166534
  classDef doc fill:#ede9fe,stroke:#7c3aed,color:#5b21b6
  classDef check fill:#e0f2fe,stroke:#0891b2,color:#164e63
  classDef decision fill:#fef3c7,stroke:#d97706,color:#92400e
  classDef done fill:#dcfce7,stroke:#16a34a,color:#166534
  classDef risk fill:#fee2e2,stroke:#dc2626,color:#991b1b
```

### Chart-first summary
- **Focus**: This chart turns Doc-code Consistency into a diagram-led overview before the detailed design and report sections.
- **Why**: It lets the reader understand the critical path before reading the detailed verification steps.
- **How to read**: Start from the documentation sources, follow the assertions into real code locations, and stop at the drift gate if any mapping breaks.
# §1 Test Design — Verification Steps

## Step 1: CLAUDE.md entry points exist
**Action**: for each path in CLAUDE.md "Entry points" row, `ls` the file
**Expected**: all 5 paths exist
**File**: `CLAUDE.md`

## Step 2: README project structure matches src/
**Action**: diff `ls src/` against README "Project structure" tree
**Expected**: every top-level src/ dir is in the README tree
**File**: `README.md`

## Step 3: Domain language terms reference real files
**Action**: for each term, verify the file path it cites exists
**Expected**: e.g. `src/inject/dynamic-theme/` exists for "Dynamic Theme"
**File**: `README.md` → Domain Language

## Step 4: docs/data.js sections match CLAUDE.md headings
**Action**: count sections in data.js vs H2 headings in CLAUDE.md
**Expected**: at least one section per CLAUDE.md H2
**File**: `docs/data.js`

## Step 5: docs/arch scenes cite real files
**Action**: for each arch scene, sample 3 file paths from §2 inventory
**Expected**: all sampled paths exist
**File**: `docs/arch/scene-*/index.md`

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `CLAUDE.md` | file | Project profile with entry points + constraints |
| `README.md` | file | Project structure tree + domain language |
| `docs/data.js` | file | Dashboard sections derived from CLAUDE.md headings |
| `docs/arch/scene-*/index.md` | files | Each scene cites real source paths in §2 |
| `docs/test/scene-*/index.md` | files | Each scene cites real source paths in §2 |
| `src/` | dir | The actual code the docs describe |

---

# §3 Test Report — 2026-07-14

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | All 5 CLAUDE.md entry points exist in src/ |
| 2 | ✅ | README project structure tree matches `ls src/` |
| 3 | ✅ | Domain language term citations resolve: `src/inject/dynamic-theme/`, `src/utils/message.ts`, etc. |
| 4 | ✅ | data.js sections match CLAUDE.md H2 count (5 + 2 story sections) |
| 5 | ✅ | arch scenes cite real paths; spot-checked 3 per scene |

**Overall**: pass — 5/5 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- The `+Plus` variant (`@plus/*` imports) is not in the README
  structure tree — it's a sibling repo linked via `npm run plus-link`.
  A contributor who sees `import ... from '@plus/...'` may be confused.
- `src/stubs/` is build-time only; its absence in a fresh clone is
  expected but looks like a doc/structure mismatch.

## Suggested Improvements
- Add a `scripts/check-docs.mjs` that automates steps 1–5 and fails
  CI on drift.
- Cross-link `+Plus` imports in README project structure with a note
  explaining the sibling-repo link.

## Limitations
- This scene samples; it does not exhaustively verify every path
  citation. A typo in a rarely-cited path may slip through.
