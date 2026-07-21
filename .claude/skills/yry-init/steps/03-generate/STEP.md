---
name: yry-init-generate
description: >
  Generate the project's baseline docs (CLAUDE.md + README.md) and the
  docs home entry (`docs/index.html`, `docs/index.css`,
  `docs/index.js`, `docs/data.js`) from the
  detect-phase profile and the explore-phase module map. The docs
  home is emitted from the yry-init standalone dashboard template
  (`yry-init/templates/`) — the generator does not redefine the
  dashboard layout, only the data model. Run this skill after
  yry-init-explore and before yry-init-arch.
---

# yry-init-generate

> Single responsibility: emit `CLAUDE.md`, `README.md`, and the docs
> home entry files (`docs/index.html`, `docs/index.css`,
> `docs/index.js`, `docs/data.js`) from the
> `profile` + `exploration` objects. The docs home layout (HTML
> shell, CSS, Vue 3 mount, theme tokens) is the yry-init standalone
> dashboard template at `yry-init/templates/`; this skill only
> produces the data model that the template consumes. It does not
> read source code (that is yry-init-explore's job), and it does not
> produce arch stories (that is yry-init-arch's job).
>
> Triggered by the parent pipeline (yry-init), right after
> yry-init-explore.
>
> **Repeatable**: every init run fully rebuilds `CLAUDE.md`, the
> non-domain-language sections of `README.md`, and the docs home
> data model. The template files in `yry-init/templates/` are the
> single source of truth for the dashboard layout.

[Inputs](#inputs) · [Outputs](#outputs) · [1. CLAUDE.md Layout](#1-claudemd-layout) · [2. README.md Layout](#2-readmemd-layout) · [3. docs Home Layout](#3-docs-home-layout) · [4. Domain Language Section](#4-domain-language-section) · [5. Rebuild Semantics](#5-rebuild-semantics) · [6. Generation Principles](#6-generation-principles) · [Fallback](#fallback) · [Active Markers](#active-markers)

## Inputs

| Field | Type | Description |
|-------|------|-------------|
| `profile` | `Profile` | The fact baseline emitted by yry-init-detect. Required. |
| `exploration` | `Exploration` | The module map + conventions emitted by yry-init-explore. Required. |
| `cwd` | path (optional) | Project root. Defaults to current working directory. |
| `principles` | `PrincipleSource[]` (optional) | Generation principles that shape the CLAUDE.md "Foundational beliefs" and "Iron laws" sections. Defaults to the four principles from <https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md> (Think Before Coding · Simplicity First · Surgical Changes · Goal-Driven Execution). |

## Outputs

| File | Location | Section emitted |
|------|----------|-----------------|
| `CLAUDE.md` | `<cwd>/CLAUDE.md` | Full file (rebuilt) |
| `README.md` | `<cwd>/README.md` | Full file (rebuilt); domain-language section appended if not present |
| `index.html` | `<cwd>/docs/index.html` | Standalone dashboard shell copied from `yry-init/templates/index.html` and rewritten to the project root (`../yry-html-cdn/...` paths) |
| `index.css` | `<cwd>/docs/index.css` | Standalone dashboard styles copied from `yry-init/templates/index.css` |
| `index.js` | `<cwd>/docs/index.js` | Standalone dashboard Vue 3 mount copied from `yry-init/templates/index.js`; registers `<yry-scene-card>` + `<yry-tag-chip>` + `<yry-back-top>`, mounts from `window.HELP_CONFIG`, and wires reading-progress + teardown via `window.__ruiInitTeardown()` |
| `data.js` | `<cwd>/docs/data.js` | Standalone dashboard data model, derived from the freshly rebuilt `CLAUDE.md` + `README.md` and exposed as `window.HELP_CONFIG` with `stats` / `crossLinks` / `sections[].groups[].items` shape |
| `theme.css` | `<cwd>/docs/theme.css` | `--yry-*` design tokens copied from `yry-init/templates/theme.css` (Code Dark) |

## 1. CLAUDE.md Layout

| Section | Content |
|---------|---------|
| Foundational beliefs | Trust the model · value attention · verify reality · **Think Before Coding** (Karpathy §1) |
| Iron laws | Four non-negotiable rules — **Simplicity First** (Karpathy §2) + **Surgical Changes** (Karpathy §3) |
| Project profile | Project name / type / version / architecture / ecosystem / self-hosted |
| Project constraints | Non-negotiable baselines + degradation countermeasures + self-constraints |
| Guidance | Documentation navigation table |

Every section above is emitted by this skill from `profile` +
`exploration`. The whole file is rebuilt on every init run.

## 2. README.md Layout

| Section | Content |
|---------|---------|
| System view | One-paragraph summary of what the project is |
| Command flow | Common commands (build / test / lint) lifted from `profile.inventory` |
| Quick start | Minimum steps to get the project running |
| Project structure | Top-level directory tree, derived from `exploration.moduleMap` |
| Domain Language | Term definitions + relationships + example dialogue + disambiguation markers (see §3) |

If a previous `README.md` exists, the system view / command flow /
quick start / project structure sections are **rebuilt**. The
domain-language section is **appended** if absent, and **preserved**
if present.

## 3. docs Home Layout

The docs home entry is emitted under `<cwd>/docs/` as five files
that match the yry-init standalone dashboard template. The
**layout** (HTML shell, CSS, Vue 3 mount, theme tokens) is the
single source of truth at `yry-init/templates/`; this skill
**copies** the layout files into `<cwd>/docs/` (rewriting CDN
paths from `../../yry-html-cdn/...` to `../yry-html-cdn/...`) and
**emits** the data model (`data.js`) that the template consumes.

| File | Generation rule |
|------|-----------------|
| `docs/theme.css` | Copied verbatim from `yry-init/templates/theme.css` (Code Dark `--yry-*` tokens) |
| `docs/index.html` | Copied from `yry-init/templates/index.html`; rewrite CDN paths to `../yry-html-cdn/...`; rewrite page title to `<project profile> · Documentation Center`; rewrite body class to `yry-doc dashboard-page` |
| `docs/index.css` | Copied verbatim from `yry-init/templates/index.css` (dashboard chrome, `--dashboard-*` token bridge, `.items-grid` / `.stories-grid` / `.scenes-grid` wrappers, `.yry-scene-card` print overrides) |
| `docs/index.js` | Copied verbatim from `yry-init/templates/index.js` (Vue 3 mount, `<yry-scene-card>` / `<yry-tag-chip>` / `<yry-back-top>` registration, `sceneCardFor(group)` per-kind dispatch, `window.__ruiInitTeardown()`) |
| `docs/data.js` | Emitted from the freshly rebuilt `CLAUDE.md` + `README.md`. Shape matches the template's `window.HELP_CONFIG` (see §3.1) |

### 3.1 `data.js` shape (dashboard model)

```ts
type DataModel = {
  titleIcon:    string;             // leading glyph, e.g. "★"
  title:        string;             // dashboard title
  tagline:      string;             // one-line subtitle
  footerNote:   string;             // footer caption
  stats:        Stat[];             // top stat cards
  crossLinks:   CrossLink[];        // top cross-panel nav cards
  sections:     Section[];          // main content sections (3, fixed order)
  footerLinks:  FooterLink[];       // bottom nav row
};
type Stat        = { label, value, tone?, href };
type CrossLink   = { icon, title, description, href, targetBlank? };
type FooterLink  = { label, href, targetBlank? };
type Section     = { id, badge, badgeTone?, title, meta, groups: Group[] };
type Group       = { id?, kind: "items" | "stories" | "scenes", icon, title, items };
```

### 3.2 `sections[]` order (immutable)

The dashboard home page always emits **exactly three sections in
this fixed order**. Reordering or skipping a section is a verify
failure (see `05-verify`).

| # | `id` (required) | Title | Groups | Source in rebuilt docs |
|---|-----------------|-------|--------|------------------------|
| 1 | `section-dependencies` | Third-Party Dependencies / Frameworks | `deps-runtime` (kind: `items`) + `deps-dev` (kind: `items`) | `profile.inventory.dependencies` + `profile.inventory.devDependencies` (manifest-parser output) |
| 2 | `section-stories`      | Story Documents & Scenes     | single `kind: 'stories'` group with arch + test stories | `docs/arch/` + `docs/test/` (yry-init-arch output) |
| 3 | `section-source`       | Main Source Code         | one `kind: 'items'` group per source-code category (vue / runtime / scss / entry) | `exploration.moduleMap` grouped by directory |

| Field | Source in rebuilt docs |
|-------|-------------------------|
| `title` / `tagline` | README.md `## System view` first sentence + first tagline line |
| `stats` | Top-line counts from `profile` + `exploration`: runtime-dep count, dev-dep count, story count, source-file count (rendered by `<yry-stats-grid>`) |
| `crossLinks` | Highest-priority sub-skills (e.g. `yry-html-cdn`, `yry-html-vue`, `yry-skill-help`) |
| `sections[0].groups[deps-runtime].items` | One card per package in `profile.inventory.dependencies` (name + version + one-line role) |
| `sections[0].groups[deps-dev].items`     | One card per package in `profile.inventory.devDependencies` |
| `sections[1].groups[*].items`            | One story per `docs/arch/index.md` and `docs/test/index.md` (kind: `stories`, with `sceneLinks`) |
| `sections[2].groups[*].items`            | One file card per node in `exploration.moduleMap`, grouped by top-level directory under `src/` |
| `footerLinks` | Top sub-skill reference links + `CLAUDE.md` + `README.md` |

> The runtime + dev dependency groups are both `kind: 'items'`
> (the same shape as the source-code groups). The difference is
> that dependency items use a per-item `icon` letter (e.g. "V"
> for Vue) and a `meta` line of the form
> `<span class="accent">Runtime</span> · ^x.y.z`, while source
> items use a per-item file-icon emoji and a path-style `meta`
> like `<span class="accent">Example</span> · src/views/Home.vue`.

Required rules:

- The generated docs home must preserve the dashboard layout
  (5-file shape) from `yry-init/templates/`. Do **not** edit the
  copied `index.html` / `index.css` / `index.js`
  beyond the documented path and title rewrites.
- The generated `docs/data.js` must be derived from the current
  `CLAUDE.md` and `README.md`; only the data model is emitted by
  this skill.
- The generated docs home must link to the story outputs emitted
  by `yry-init-arch` under `docs/arch/` and `docs/test/`.
- The skill is the single source of truth for the docs data
  model; the template is the single source of truth for the
  layout. They never drift.

## 4. Domain Language Section

The domain-language section is required and must contain:

- **Term definitions** — at least three project-specific terms, each
  with a one-sentence definition.
- **Relationships** — how the terms relate to each other (parent /
  child, cause / effect, producer / consumer).
- **Example dialogue** — at least one natural-language exchange
  between a user and the system that uses the defined terms.
- **Disambiguation markers** — for each term, list the surface forms
  that should **not** be confused with it.

The section header is `## Domain Language` and it begins with a
one-line description of the project's domain.

## 5. Rebuild Semantics

| File | On repeat run | Rationale |
|------|---------------|-----------|
| `CLAUDE.md` | **Rebuilt** fully | Pure function of `profile` + `exploration` |
| `README.md` (system view / commands / quick start / structure) | **Rebuilt** | Driven by `profile` + `exploration` |
| `README.md` (domain-language section) | **Appended** if absent, **preserved** if present | Domain language is user-curated |
| `docs/index.html` / `docs/index.css` / `docs/index.js` / `docs/theme.css` | **Copied from `yry-init/templates/`** with the documented path and title rewrites | The template is the single source of truth for the dashboard layout |
| `docs/data.js` | **Rebuilt** | Pure function of this skill's data-model contract + current `CLAUDE.md` + `README.md` |

The skill must not silently drop any pre-existing file. If a
rebuild would discard user content, abort and surface the conflict
to the parent pipeline.

## 6. Generation Principles

The `principles` input shapes the **Foundational beliefs** and
**Iron laws** sections of the generated `CLAUDE.md`. When
`principles` is omitted, the four principles from
<https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md>
are used as the default. These four are mapped to the output
sections as follows:

| # | Principle | Maps to | One-line emission |
|---|-----------|---------|-------------------|
| 1 | **Think Before Coding** — Don't assume, surface tradeoffs | `CLAUDE.md` → Foundational beliefs | State assumptions explicitly; if multiple interpretations exist, present them; if a simpler approach exists, say so. |
| 2 | **Simplicity First** — Minimum code, nothing speculative | `CLAUDE.md` → Iron laws | No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenes. |
| 3 | **Surgical Changes** — Touch only what you must | `CLAUDE.md` → Iron laws | Don't "improve" adjacent code; match existing style; every changed line traces to the user's request. |
| 4 | **Goal-Driven Execution** — Define success criteria, loop until verified | `README.md` → Quick start | Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step. |

### Custom `principles` Override

A caller may pass an explicit `principles` array to override the
default four. Each entry is a `{ title, body, target }` tuple where:

- `title` — the principle heading (kebab-case friendly).
- `body` — the one-paragraph rationale.
- `target` — which section of the generated doc the principle
  feeds into: `'foundational-beliefs' | 'iron-laws' | 'quick-start'`.

The `target` mapping keeps the four Karpathy defaults
behaviour-equivalent when no override is given.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `cwd` does not exist | Abort with `cwd-not-found` |
| `README.md` exists but is not valid Markdown | Rebuild fully, log a warning |
| Domain-language section is missing all four parts | Add a placeholder that names each missing part and a one-line prompt to fill it in |
| `profile.projectType === 'unknown'` | Emit a `# TODO: project type unknown` note in CLAUDE.md; do not block generation |

## Active Markers

| Marker | Verification | Expected behavior |
|--------|--------------|-------------------|
| `README.md` contains `## Domain Language` heading | grep | Section present |
| `README.md` domain-language section has ≥ 3 term definitions | count | Section populated |
| `CLAUDE.md` contains the four Karpathy principle headings | grep | Principles emitted |
| `docs/index.html`, `docs/index.css`, `docs/index.js`, `docs/data.js`, `docs/theme.css` all exist | file check | Docs home entry emitted |
| `docs/index.html` body class is `yry-doc dashboard-page` | grep | Template layout adopted |
| `docs/index.html` references `../yry-html-cdn/...` CDN scripts | grep | CDN paths rewritten for the project root |
| `docs/data.js` `window.HELP_CONFIG` has `stats` + `crossLinks` + `sections[].groups[].items` | shape check | Dashboard data model adopted |


## Rules

- [generation-contracts.md](./rules/generation-contracts.md) — ---
- [output-ownership.md](./rules/output-ownership.md) — ---

## Specialized Agents

- [document-validator.md](./agents/document-validator.md) — ---
- [template-renderer.md](./agents/template-renderer.md) — ---

## Rules

- [generation-contracts.md](./rules/generation-contracts.md) — ---
- [output-ownership.md](./rules/output-ownership.md) — ---

## Specialized Agents

- [document-validator.md](./agents/document-validator.md) — ---
- [template-renderer.md](./agents/template-renderer.md) — ---

## References

- [doc-templates.md](./references/doc-templates.md) — ---
- [principle-sources.md](./references/principle-sources.md) — ---
