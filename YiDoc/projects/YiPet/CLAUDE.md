# CLAUDE.md — YiPet

> This file is rebuilt in full on every `yry-init` run.
> It is a pure function of the detect-phase profile + explore-phase
> exploration. Do not hand-edit the non-domain sections; changes will
> be overwritten. The domain-language section on `README.md` is the
> only human-curated region and is preserved across runs.

---

## Foundational beliefs

- **Trust the model** — The LLM's first draft is usually close;
  spend attention on *reviewing* rather than rewriting.
- **Value attention** — Every line you read is a line you cannot
  unsee. Read the smallest surface area that still answers the
  question.
- **Verify reality** — Read the file. Run the command. Trust the
  output over the commit message, the commit message over the
  PR description, the PR description over the issue.
- **Think Before Coding** — State assumptions explicitly; if
  multiple interpretations exist, present them; if a simpler
  approach exists, say so.

## Iron laws

- **Simplicity First** — No features beyond what was asked; no
  abstractions for single-use code; no error handling for
  impossible scenes.
- **Surgical Changes** — Don't "improve" adjacent code; match
  existing style; every changed line traces to the user's request.
- **Verified Outputs** — Every task ends with a reproducible
  verification step (command run, assertion passed, screenshot
  captured). If you cannot verify, say so.
- **No Silent Drops** — Never discard user content. If a rebuild
  would overwrite hand-curated text, halt and surface the
  conflict.

## Project profile

| Field | Value |
|-------|-------|
| Name | `YiPet` |
| Type | `meta` · Documentation catalog hub for the YiPet Chrome extension |
| Architecture | `single` · IIFE 模块化 + Manifest V3 content script, 无构建工具 |
| Ecosystem | Chrome MV3 Extension (JavaScript, no Node runtime in cwd) |
| Source files | 275 (205 JS + 70 CSS) — located at the reference code path |
| CDN components | 26 (self-hosted, no public CDN dependency) |
| Self-hosted | ✅ 全量自托管 — 离线可用 |

## Project constraints

- **Non-negotiable baselines**:
  - Dashboard 4-file set (`index.html` / `index.css` / `index.js` / `data.js`) at project root.
  - Story directories `arch/` (≥ 5 scenes) and `test/` (≥ 6 scenes) each with per-scene `index.md` following the §0–§4 lifecycle.
  - `CLAUDE.md` + `README.md` at project root; README's `## Domain Language` section is append-once, preserve-on-repeat.
  - CDN shared components loaded from `../../.claude/shared/components/...` — absolute `/.claude/` paths are a verify failure.

- **Degradation countermeasures**:
  - Vue 3 loader fallback (primary + unpkg) is handled by `shared/loader.js`; `index.js` gates on `__vueLoadPromise` so mount errors are silent-no-op, not throw.
  - `yry-report` orchestrator absence → skip the reports phase, do not fail the pipeline.
  - `yry-init` verify is the engineering gate — any failed check halts the pipeline; no silent retries.

- **Self-constraints**:
  - The skill does not write outside `<cwd>`. Sibling projects (YiAi, YiH5, etc.) are never touched.
  - The skill does not modify source code in the reference code path (`/Users/yi/YrY/YiPet/`).
  - Domain-language section is the user's vocabulary; the skill appends if absent, preserves if present, and never rewrites it.

## Guidance

| Document | Path | Purpose |
|----------|------|---------|
| Baseline rules | `CLAUDE.md` | Pipeline invariants, foundational beliefs, iron laws |
| Domain language | `README.md § Domain Language` | Project vocabulary — terms, relationships, disambiguation |
| Architecture stories | `arch/` | 6 scenes · module location, data flow, onboarding, dep-impact, security, CDN lifecycle |
| Self-check stories | `test/` | 6 scenes · full self-check, pre-commit, doc consistency, security regression, integration, third-party health |
| File inventory | `files/` | 563 files · 21.8 MB audit |
| API inventory | `apis/` | 33 endpoints · 48-point scoring |
| Daily reports | `daily/` | Cadence-bucketed report archive |
| Reference docs | `docs/` | Changelog, FAQ, setup, specifications, modules, customization |
| Dashboard home | `index.html` | Standalone Vue 3 + CDN dashboard; open in browser, no build step |
