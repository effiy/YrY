---
paths:
  - ".claude/rui-init-generate/SKILL.md"
  - ".claude/rui-init/templates/"
description: "Generation contracts: CLAUDE.md section structure, rebuild idempotence rules, domain language preservation, and docs/ output layout."
---

# Generation Contracts

`rui-init-generate` produces `CLAUDE.md`, `README.md`, and `docs/` home entry files from `profile` + `exploration`. These are the hard contracts.

## CLAUDE.md Structure (Immutable)

```
# CLAUDE.md — <Project Name>

> Project context paragraph

## Foundational beliefs (from principles input)

## Iron laws (from principles input)

## Project profile (table from profile.inventory)

## Project constraints
### Non-negotiable baselines
### Degradation countermeasures
### Self-constraints

## Guidance (table of links to generated artifacts)

## How this file is generated (regeneration note)
```

## README.md Structure

```
# <Project Name>

> Tagline

## Quick Start
## System View
## Command Flow
## Architecture
## Domain Language (preserved section — append-once)
```

## Rebuild Idempotence Rules

| Rule | Description |
|------|-------------|
| Full rebuild | `CLAUDE.md` is completely rewritten each run |
| Partial rebuild | `README.md`: main sections rebuilt; Domain Language section preserved |
| Pure function | Same `profile` + `exploration` → same output |
| Template-driven layout | `docs/` layout files copied from `rui-init/templates/` with path rewrites |

## Domain Language Preservation

1. Before writing `README.md`, read the existing file
2. Extract `## Domain Language` section if present
3. Write rebuilt sections, then append the preserved domain language section
4. If no existing domain language section, include an empty `## Domain Language` heading as a placeholder

## docs/ Layout

| File | Source | Transform |
|------|--------|-----------|
| `index.html` | `rui-init/templates/index.html` | Copy verbatim |
| `index.css`  | `rui-init/templates/index.css`  | Copy verbatim |
| `index.js`   | `rui-init/templates/index.js`   | Copy verbatim |
| `data.js`    | Generated | `window.HELP_CONFIG` from CLAUDE.md + README.md (see §3.1 / §3.2 of `STEP.md`) |

## Hard Constraints

1. Never modify `rui-init/templates/` — those are the source of truth.
2. Path rewrites in `index.html` must use the correct relative depth for the target project.
3. `data.js` must expose `window.HELP_CONFIG` with `stats`, `crossLinks`, and `sections[].groups[].items`.
4. `data.js`'s `sections[]` must contain **exactly three sections in this fixed order**:
   `section-dependencies` → `section-stories` → `section-source`. Reordering, dropping, or
   renaming any of these is a verify failure.
5. `section-dependencies` must have a `deps-runtime` group (kind `items`) sourced from
   `profile.inventory.dependencies` and a `deps-dev` group (kind `items`) sourced from
   `profile.inventory.devDependencies`. An empty inventory → empty `items: []` (still
   emits the groups, so the section remains visible).
6. `section-source` groups are derived from `exploration.moduleMap`, grouped by top-level
   directory under `src/` (e.g. `src/views/` → `src-vue-pages` group). At least one
   group must be emitted; an empty module map → single placeholder group with
   `# TODO: module map empty`.
