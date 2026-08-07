---
name: architecture-direction
description: >
  Canonical architecture direction for the YrY monorepo.
  Frontend projects push toward stronger componentization; backend
  projects push toward stronger modularization. Applied by yry-init
  when generating CLAUDE.md and by the 04-arch step when emitting arch
  scenes. Also referenced by yry-init-verify as a gate item.
---

# Architecture Direction — Frontend Componentization, Backend Modularization

> Single load-bearing principle for all YrY projects. Every project
> under this monorepo is expected to advance along exactly one of two
> axes, decided by project type. Init, arch scenes, and verify gates
  all draw on this principle.

## Principle

| Project type | Direction | Core move |
|--------------|-----------|-----------|
| Frontend (Vue / HTML / H5 / Tauri-renderer) | **Componentization** | Extract reusable components, composables, shared UI primitives; define clear props/events APIs; eliminate duplicated markup |
| Backend (Node / FastAPI / server runtime) | **Modularization** | Split by domain into named modules; expose clear public APIs between modules; separate entry / domain / persistence / external layers |

## Why

Stated by the user on 2026-07-24 as the overarching direction for the
monorepo's next phase. The codebase has grown to seven top-level
projects (`YiAi`, `YiDoc`, `YiH5`, `YiPet`, `YiPot`, `YiviY`, `YiWeb`)
and the next priority is tightening internal structure along these two
axes — not adding features.

## How to apply

### In yry-init (this skill)

- **03-generate (CLAUDE.md)**: every project's CLAUDE.md must include
  a short "Architecture Direction" section naming the axis
  (`componentization` or `modularization`) and linking back to this
  rule. This section is regenerated each run (not append-once).
- **04-arch (arch scenes)**: add a required scene type
  `componentization-or-modularization` (see 04-arch STEP.md scene list)
  that walks the project's current standing on the axis and names the
  next concrete extraction / module-boundary moves.
- **05-verify**: the gate checks that CLAUDE.md carries the
  Architecture Direction section and that the arch story includes the
  `componentization-or-modularization` scene.

### In ongoing work (outside init)

- Frontend projects: when reviewing or extending a feature, look for
  component-extraction opportunities. Prefer props/events contracts
  over shared mutable state. Prefer composable functions over
  copy-pasted logic. Three similar markup blocks is the trigger to
  extract.
- Backend projects: when adding a feature, group it into a named
  module under `src/modules/<domain>/` (or the project's convention)
  rather than scattering handlers across existing files. Each module
  exposes a public API surface (an `index.ts` / `__init__.py` /
  router) and other modules depend only on that surface, not on
  internal files.
- When proposing refactor plans, frame recommendations in these terms
  (component extraction vs. module boundary) so the direction stays
  legible across PRs.

### Story report (per-project artifact)

Each project carries a `story/` leaf under
`YiDoc/projects/<project>/story/` materializing the direction
above as concrete user stories. Hierarchical layout:

- `story/index.{md,html}` — catalog page listing the project's stories
  with scene counts and links into each story.
- `story/<story-slug>/index.{md,html}` — one story (a page for
  frontend projects, an architecture module for backend projects).
  Lists the story's scenes (US-XX-N form) with links into each scene.
- `story/<story-slug>/scene-<N>-<slug>/index.{md,html}` — one scene.
  Carries: user story, 3-bullet acceptance criteria, 2-bullet
  componentization (frontend) or modularization (backend) use case.

Content shape:

- Frontend projects: **pages** are the big modules → each becomes a
  story directory. Scenes under it are user stories for that page
  (US-XX-N). Each scene's *使用场景 · 组件化* note names the
  components / composables that serve that story and the next
  extraction opportunity.
- Backend projects: **architecture-design modules** (domain
  boundaries) are the big modules → each becomes a story directory.
  Scenes under it are user stories for that module. Each scene's
  *使用场景 · 模块化* note names the public API surface and the next
  boundary-hardening move.

Every `index.html` in the tree is self-contained (dark theme, no
external assets). The central `YiDoc/dashboard/data.js` wires a
"Story Report →" link on each project card pointing to
`../projects/<project>/story/index.html`; each per-project `data.js`
mirrors this in `footerLinks` pointing to `story/index.html`.

## Classification (per project)

| Project | Type | Direction |
|---------|------|-----------|
| `YiAi` | backend (FastAPI server) | modularization |
| `YiDoc` | static docs catalog (no server) | N/A — `modularization` axis does not apply; `templates/` is already the repo-level shared SoT |
| `YiH5` | frontend (mobile H5, Vue 3) | componentization |
| `YiPet` | mixed (MV3 extension: popup/content front + background side) | FE parts → componentization; background → modularization |
| `YiPot` | frontend (Tauri + React renderer) | componentization |
| `YiviY` | backend (Python video-translation pipeline, not a server) | modularization |
| `YiWeb` | frontend (web admin, Vue 3) | componentization |

This table is the canonical classification. If a project's actual
layout diverges, update this table before applying the rule. Projects
classified `N/A` are exempt from the axis gate; the 04-arch
`componentization-or-modularization` scene for them should document
*why* they are exempt rather than propose moves.

## Non-goals

- This rule does **not** mandate a specific component library or
  module layout. Projects keep their existing conventions; this rule
  only fixes the *direction*.
- This rule does **not** override project-specific conventions already
  captured in a project's CLAUDE.md. When in conflict, the
  project-level CLAUDE.md wins; raise the conflict to the user.
- This rule is **not** a one-shot refactor ticket. It is the
  standing direction; progress is incremental, PR by PR.
