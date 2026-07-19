# §0 Effect Sketch — Newcomer Onboarding

```mermaid
flowchart LR
  start([0 min read README + CLAUDE]):::entry --> charter[10 min project charter and domain language]:::step
  charter --> entrypoints[20 min identify popup / background / inject entry points]:::step
  entrypoints --> extension[35 min read Extension class]:::step
  extension --> flow[50 min trace one end-to-end message flow]:::step
  flow --> ready([60 min ready for first change]):::done

  classDef entry fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef step fill:#e0f2fe,stroke:#0891b2,color:#164e63
  classDef done fill:#dcfce7,stroke:#16a34a,color:#166534
```

### Chart-first summary
- **Focus**: This chart turns Newcomer Onboarding into a diagram-led overview before the detailed design and report sections.
- **Why**: It lets the reader understand the critical path before reading the detailed verification steps.
- **How to read**: Move from docs to runtime entry points, then to the end-to-end extension flow; each stop is a milestone rather than a raw file list.
# §1 Test Design — Verification Steps

## Step 1: Read system view + domain language
**Action**: `head -60 README.md` then jump to `## Domain Language`
**Expected**: reader can define "Dynamic Theme" vs "SVG filter" vs "stylesheet"
**File**: `README.md`

## Step 2: Read operating charter
**Action**: `cat CLAUDE.md`
**Expected**: reader can name the four iron laws
**File**: `CLAUDE.md`

## Step 3: Identify extension entry points
**Action**: `cat src/manifest.json`
**Expected**: reader can name the background page, popup, content script
**File**: `src/manifest.json`

## Step 4: Read the Extension class
**Action**: `head -80 src/background/extension.ts`
**Expected**: reader knows where settings + tab mgmt live
**File**: `src/background/extension.ts`

## Step 5: Read the content script entry
**Action**: `head -60 src/inject/index.ts`
**Expected**: reader knows the message types handled
**File**: `src/inject/index.ts`

## Step 6: Walk the end-to-end flow
**Action**: open `docs/arch/scene-2-data-flow-tracing/index.md`
**Expected**: reader can describe the 6 hops from click to DOM
**File**: `docs/arch/scene-2-data-flow-tracing/index.md`

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `README.md` | file | System view, command flow, quick start, project structure, domain language |
| `CLAUDE.md` | file | Foundational beliefs, iron laws, project profile, constraints, guidance |
| `src/manifest.json` | file | MV2 manifest — declares background, popup, content scripts, permissions |
| `src/background/extension.ts` | file | `Extension` class — the extension's brain |
| `src/inject/index.ts` | file | Content script entry — runs on every page at `document_start` |
| `docs/arch/scene-2-data-flow-tracing/index.md` | file | End-to-end data-flow trace |
| `CONTRIBUTING.md` | file | Upstream contributing guide |
| `eslint.config.js` | file | Lint rules — read before writing code |

**Architecture decisions**:
- The reading order goes breadth-first: identity → charter → manifest →
  brain → hot path → trace. Depth-first would drown a newcomer in
  `dynamic-theme/` internals before they have the skeleton.
- `CONTRIBUTING.md` is preserved from upstream; YiPet-specific
  onboarding lives in this scene.

---

# §3 Test Report — 2026-07-14

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | README.md has System view + Domain Language sections |
| 2 | ✅ | CLAUDE.md has Foundational Beliefs + Iron Laws |
| 3 | ✅ | `src/manifest.json` declares background, popup, content_scripts |
| 4 | ✅ | `src/background/extension.ts` exports `Extension` class |
| 5 | ✅ | `src/inject/index.ts` imports `MessageBGtoCS`, `MessageCStoBG` |
| 6 | ✅ | `docs/arch/scene-2-data-flow-tracing/index.md` covers 6 hops |

**Overall**: pass — 6/6 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- Newcomers who skip CLAUDE.md often violate the "Surgical Changes"
  law in their first PR — the charter must be read first.
- The `+Plus` variant (`@plus/*` imports) is not in the reading order;
  it's opt-in and should be introduced only after the MV2 path is
  clear.

## Suggested Improvements
- Add a 7th stop: "run `npm test` and read one failing test" to
  anchor theory in practice.
- Cross-link this scene from `CONTRIBUTING.md` so the upstream guide
  points into YiPet's own onboarding.

## Limitations
- Reading order assumes the newcomer has TypeScript + browser-extension
  baseline knowledge. Total newcomers may need a pre-step that
  explains MV2/MV3 service workers.
