---
description: "Document template reference for yry-init-generate — CLAUDE.md section layout, README.md structure, and docs/data.js shape."
---

# Document Templates Reference

## CLAUDE.md Section Layout

1. `# CLAUDE.md — <Project Name>` + context paragraph
2. `## Foundational beliefs` — from principles input
3. `## Iron laws` — from principles input
4. `## Project profile` — table from profile.inventory
5. `## Project constraints` — non-negotiable baselines, degradation countermeasures, self-constraints
6. `## Guidance` — table of links to generated artifacts
7. `## How this file is generated` — regeneration note

## README.md Section Layout

1. `# <Project Name>` + tagline
2. `## Quick Start`
3. `## System View`
4. `## Command Flow`
5. `## Architecture`
6. `## Domain Language` — preserved section (append-once)

## docs/data.js Shape

The dashboard data model is a fixed **three-section layout** (see
`STEP.md` §3.2). The shape template lives at
`yry-init/templates/data.js`; the snippet below is the canonical
section order, not a per-project field guide.

```javascript
window.HELP_CONFIG = {
  stats: {
    runtimeDeps: 8,
    devDeps:     6,
    stories:     2,
    sourceFiles: 38
  },
  crossLinks: [
    { href: "arch/index.html",      label: "Architecture (5 scenes)" },
    { href: "test/index.html", label: "test (6 scenes)" }
  ],
  // § 1  Third-party dependencies & frameworks — runtime + dev
  // § 2  Story documents & scenes              — arch + test
  // § 3  Main source code                      — vue / runtime / scss / entry
  sections: [
    {
      id:    "section-dependencies",
      title: "Third-Party Dependencies / Frameworks",
      groups: [
        { id: "deps-runtime", kind: "items",   title: "Runtime Dependencies (N)", items: [{...}] },
        { id: "deps-dev",     kind: "items",   title: "Dev Dependencies (N)",   items: [{...}] }
      ]
    },
    {
      id:    "section-stories",
      title: "Story Documents & Scenes",
      groups: [
        { kind: "stories", title: "Story Catalog", items: [{ sceneLinks: [...] }] }
      ]
    },
    {
      id:    "section-source",
      title: "Main Source Code",
      groups: [
        { id: "src-vue-pages", kind: "items", title: "Vue Page Core Modules (N)", items: [{...}] },
        { id: "src-runtime",   kind: "items", title: "Runtime Core Modules (N)",   items: [{...}] },
        { id: "src-scss",      kind: "items", title: "SCSS Style Source Files (N)",  items: [{...}] },
        { id: "src-entry",     kind: "items", title: "Entry & Build Scripts (N)",   items: [{...}] }
      ]
    }
  ]
};
```

### Section contract (id → kind)

| Section id | Allowed group kinds | Source |
|------------|---------------------|--------|
| `section-dependencies` | `items` (≥ 1, ≤ 2: `deps-runtime` + `deps-dev`) | `profile.inventory.dependencies` / `devDependencies` |
| `section-stories`      | `stories` (exactly 1)                                | `docs/arch/` + `docs/test/` (yry-init-arch) |
| `section-source`       | `items` (≥ 1; one per top-level source directory)    | `exploration.moduleMap` grouped by `src/<dir>/` |

The `yry-init-generate` step is responsible for emitting the data
model in this exact order; `05-verify` checks it.

## Rebuild Semantics

- `CLAUDE.md`: fully rebuilt each run (pure function of profile + exploration)
- `README.md`: main sections rebuilt; `## Domain Language` preserved if pre-existing
- `docs/data.js`: regenerated from freshly rebuilt CLAUDE.md + README.md
- Layout files: copied verbatim from `yry-init/templates/` with path rewrites
