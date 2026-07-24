# CLAUDE.md · YiH5

> Engineering guide for working inside the YiH5 docs hub. The actual
> H5 source lives at `/Users/ruiyi/Downloads/YrY/YiH5/` (vanilla JS
> ES-module SPA). This directory is the documentation hub for that
> source.

## Foundational beliefs

- **Trust the model.** When in doubt, ask for the user's intent before
  writing code.
- **Value attention.** Prefer one focused change over five speculative
  edits. Reading time is the scarcest resource on a code review.
- **Verify reality.** Every claim about the code must be backed by a
  file path or a search hit. No "I think" statements.
- **Think before coding** (Karpathy §1). State assumptions explicitly;
  if multiple interpretations exist, present them; if a simpler
  approach exists, say so. Do not assume — surface tradeoffs.

## Iron laws

- **Simplicity first** (Karpathy §2). No features beyond what was
  asked. No abstractions for single-use code. No error handling for
  impossible scenes.
- **Surgical changes** (Karpathy §3). Touch only what you must. Do not
  "improve" adjacent code; match existing style; every changed line
  traces to the user's request.

## Project profile

| Field | Value |
|-------|-------|
| Name | YiH5 |
| Type | frontend (vanilla JS ES-module SPA) |
| Version | unreleased |
| Architecture | single (one `src/` tree) |
| Ecosystem | none — no `package.json`, no build tooling |
| Self-hosted | yes — `YiPet/cdn/` provides Vue 3 + components |
| Source root | `/Users/ruiyi/Downloads/YrY/YiH5/` |
| Docs hub (cwd) | `/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5/` |

### Inventory

- `dependencies` — none (no `package.json`)
- `devDependencies` — none
- `buildCommands` — none (served statically)
- `testCommands` — none (no test framework)
- `frameworkVersions` — Vue 3.4.27 (via `YiPet/cdn/vendor/vue.global.prod.js`)

### Security surface

| Dimension | Status | Evidence |
|-----------|--------|----------|
| User input | true | chat input in `ChatView`, search/filter in `FilterBar`, FAQ query in `FaqPopup` |
| API endpoints | true | `fetch()` to `api.effiy.cn` via `services/client.js`, `prompt.js`, `news.js`, `faq.js`, `session.js` |
| Data storage | true | `localStorage` for X-Token in `services/auth.js` |
| Authentication | true | `X-Token` header set by `services/auth.js` + `services/client.js#fetchWithAuth` |
| Third-party | true | `fetch()` (native), `marked` + `mermaid` + `md5` loaded via HTML `<script>` tags |

### Test framework

`none` — no `vitest.config.*`, no `jest.config.*`, no test command.
Self-check is manual, driven by the `docs/test/` (here `test/`) story
tree.

### Architecture pattern

`single` — one `src/` tree under the H5 source repo, no workspace
manifest, no nested package manifests.

## Project constraints

### Non-negotiable baselines

- Do **not** modify files outside `cwd` (the docs hub). The H5 source
  repo at `/Users/ruiyi/Downloads/YrY/YiH5/` is read-only from the
  perspective of this hub — it is consulted for the module map, never
  edited from here.
- The dashboard 4-file set (`index.html` / `index.css` / `index.js` /
  `data.js`) lives at the **project root**, not under `docs/`. The
  `docs/` directory holds the H5 user-facing documentation site
  (Bootstrap-based) and must not be clobbered by dashboard artifacts.
- The CDN base for this project is `../../../YiPet/cdn/` (3 levels up
  from project root to `/Users/ruiyi/Downloads/YrY/`).

### Degradation countermeasures

- If the Vue 3 CDN at `YiPet/cdn/vendor/vue.global.prod.js` is
  unreachable, `index.html` falls back to
  `https://unpkg.com/vue@3.4.27/dist/vue.global.prod.js`.
- If the H5 source repo is moved or removed, the dashboard becomes
  stale; re-run `yry-init` to refresh `data.js` from the new location.
- If `YiPet/cdn/` is moved, the CDN prefix in `index.html` /
  `index.js` must be updated project-wide.

### Self-constraints

- All generated docs-facing artifacts (dashboard, story trees) live at
  project root (`./`, `./arch/`, `./test/`).
- Report-leaf outputs (`apis/`, `daily/`, `files/`) live alongside the
  dashboard at project root and link to it via the `panelHub`.
- No file under `docs/` is written by `yry-init`.

## Guidance · Documentation Navigation

| Artifact | Path (relative to cwd) | Purpose |
|----------|------------------------|---------|
| Dashboard home | `index.html` + `data.js` | Top-level KPIs + story catalog + cross-panel nav |
| Architecture story | `arch/` | 5 architecture scenes (module location → security surface) |
| Self-check story | `test/` | 6 self-check scenes (post-init → third-party) |
| Files report | `files/index.html` | File / asset inventory |
| APIs report | `apis/index.html` | API inventory + health |
| Daily report | `daily/index.html` | CTO daily report (dated entries) |
| H5 user docs | `docs/` | Bootstrap-based H5 user documentation site (separate from yry-init) |
| H5 source repo | `/Users/ruiyi/Downloads/YrY/YiH5/` | The actual application source code |

## Karpathy principle headers (verify marker)

- Think Before Coding
- Simplicity First
- Surgical Changes
- Goal-Driven Execution
