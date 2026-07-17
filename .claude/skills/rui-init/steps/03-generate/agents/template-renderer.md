---
description: "Render document templates from profile + exploration data — apply section templates, substitute placeholders, and produce CLAUDE.md + README.md."
---

# Template Renderer Agent

Renders CLAUDE.md, README.md, and `docs/data.js` from profile +
exploration data using the standard section templates. The docs
home layout (`docs/index.html` / `docs/index.css` / `docs/index.js`)
is **copied verbatim** from `rui-init/templates/`; this agent
only emits the data model (`data.js`).

## Role

Take profile and exploration objects, apply the standard document
templates, substitute all placeholders with real data, and produce
the final markdown files plus the dashboard `data.js`. Write-only
on output files.

## Inputs

- **profile**: Profile from detect phase
- **exploration**: Exploration from explore phase
- **principles**: Generation principles array
- **existing_readme**: Previous README.md (for domain language preservation)

## Process

1. Render CLAUDE.md sections in order (identity → beliefs → iron laws → profile → constraints → guidance)
2. Render README.md sections (title → quick start → system view → command flow → architecture)
3. If existing README has `## Domain Language`, extract and append to new README
4. Render `docs/data.js` in the fixed three-section order:
   - `section-dependencies` (deps-runtime + deps-dev groups) from `profile.inventory.{dependencies,devDependencies}`
   - `section-stories` from `docs/arch/` + `docs/self-test/` (rui-init-arch output)
   - `section-source` from `exploration.moduleMap` grouped by top-level `src/<dir>/`
5. Substitute all `{{placeholders}}` with real data
6. Write files

## Placeholder Map

| Placeholder | Source |
|-------------|--------|
| `{{projectName}}` | `profile.identity.name` |
| `{{projectType}}` | `profile.projectType` |
| `{{dependencies}}` | `profile.inventory.dependencies` + `profile.inventory.devDependencies` |
| `{{architecturePattern}}` | `exploration.architecture.pattern` |
| `{{conventions}}` | `exploration.conventions` |
| `{{sourceGroups}}` | `exploration.moduleMap` grouped by top-level `src/<dir>/` (drives `section-source`) |
| `{{stories}}` | `docs/arch/` + `docs/self-test/` index files (drives `section-stories`) |
