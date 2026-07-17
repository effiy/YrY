# CLAUDE.md — YiPet

> Operating charter for Claude Code working in this repository. Every
> session reads this file first; every non-trivial change is anchored
> to the beliefs and laws below.

## Foundational Beliefs

- **Trust the model, value attention, verify reality.** Do not pad
  context with noise; carry the signal forward and verify claims
  against the source.
- **Think Before Coding.** State assumptions explicitly. If multiple
  interpretations of a request exist, present them before acting. If
  a simpler approach exists, name it. Don't assume — surface tradeoffs.
- **The harness executes, not memory.** Automated behaviors
  ("whenever X", "before/after Y") require hooks in `settings.json`;
  preferences saved to memory do not schedule work.

## Iron Laws

1. **Simplicity First.** No features beyond what was asked; no
   abstractions for single-use code; no error handling for impossible
   scenes. Three similar lines beats a premature abstraction.
2. **Surgical Changes.** Touch only what the task requires. Don't
   "improve" adjacent code; match existing style; every changed line
   traces to the user's request. No backwards-compatibility shims
   when the code can just be changed.
3. **No silent retries, no silent skips.** On any step failure,
   surface the failure to the user and halt. Do not mask errors.
4. **Comment only the non-obvious WHY.** Default to writing no
   comments. Never write multi-paragraph docstrings. Never explain
   WHAT — well-named identifiers already do that.

## Project Profile

| Field | Value |
|-------|-------|
| Name | `YiPet` |
| Type | `frontend` (browser extension — Manifest V2 + V3) |
| Version | `4.9.128` (upstream Dark Reader fork) |
| Architecture | `single` (one `src/` tree, no workspaces) |
| Ecosystem | Node.js (npm) + TypeScript + Rollup; tests via Jest + Karma |
| Self-hosted | Browser extension — runs in Chrome / Firefox / Edge / Safari / Thunderbird |
| Entry points | `src/background/index.ts`, `src/inject/index.ts`, `src/ui/popup/index.tsx`, `src/ui/options/index.tsx`, `src/api/index.ts` |
| UI library | `malevic` 0.20.2 |
| Test framework | `jest` 30.4.2 (unit), `karma` 6.4.4 (inject), `puppeteer-core` 25.1.0 (browser e2e) |
| License | MIT |

## Project Constraints

### Non-negotiable baselines

- MV2 and MV3 manifests must both build: `src/manifest.json`,
  `src/manifest-chrome-mv3.json`, `src/manifest-firefox.json`,
  `src/manifest-thunderbird.json`. A change that breaks one manifest
  breaks the release.
- Content scripts (`src/inject/`) run at `document_start` on
  `<all_urls>` in `all_frames`. Any code added there executes on every
  page load — performance and security sensitive.
- `chrome.storage` is the persistence layer (`user-storage.ts`,
  `state-manager.ts`). Do not introduce `localStorage` / `indexedDB`
  for user settings.
- The Dark Reader public API (`src/api/index.ts`) is a stable surface
  consumed by third-party sites; signature changes are breaking.

### Degradation countermeasures

- When a manifest variant fails to build, run
  `node tasks/cli.js build --debug --<variant>` to isolate the
  variant before retrying.
- When the inject script breaks on a specific site, check
  `src/config/dynamic-theme-fixes.config` and
  `src/config/inversion-fixes.config` — those are the curated
  per-site overrides.
- When tests stall under Karma, rerun with
  `npm run test:inject:debug` for an inspectable session.

### Self-constraints

- Do not introduce a server / backend; this is a browser extension.
- Do not add a new UI framework (React / Vue / Svelte). The UI is
  built on `malevic`; replacing it is out of scope.
- Do not edit generated build output under `build/`; regenerate via
  `npm run build` or `npm run debug`.

## Guidance

| Need | Pointer |
|------|---------|
| System view | `README.md` → System view |
| Commands | `README.md` → Command flow |
| Quick start | `README.md` → Quick start |
| Project structure | `README.md` → Project structure |
| Domain language | `README.md` → Domain Language |
| Architecture scenes | `docs/arch/scene-N-<slug>/index.md` |
| Self-check scenes | `docs/self-test/scene-N-<slug>/index.md` |
| Docs home | `docs/index.html` |
| Contributing | `CONTRIBUTING.md` |
| Code of conduct | `CODE_OF_CONDUCT.md` |
| Changelog | `CHANGELOG.md` |
