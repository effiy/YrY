---
description: "Reference for the rui-init pipeline: Profile and Exploration type definitions, verify check catalog, and filesystem output layout."
---

# Pipeline State Reference

Detailed type definitions and field descriptions for the `pipelineState` object that flows through the rui-init pipeline.

## Profile (from rui-init-detect)

| Field | Type | Description |
|-------|------|-------------|
| `identity.projectName` | string | Project name from package.json / pyproject.toml / directory name |
| `identity.branchPrefix` | string | Git branch prefix (e.g. `claude/`) |
| `projectType` | string enum | `node`, `python`, `go`, `rust`, `unknown`, ... |
| `inventory.topLevelFiles` | string[] | Files in project root (excluding dotfiles) |
| `inventory.topLevelDirs` | string[] | Directories in project root |
| `inventory.manifests` | Record<string,string> | Manifest path → type (e.g. `package.json` → `npm`) |
| `securitySurface.authFiles` | string[] | Files referencing auth/token/session |
| `securitySurface.secretFiles` | string[] | Files with secrets (.env, credentials) |
| `securitySurface.envFiles` | string[] | Environment config files |
| `testFramework` | string\|null | Detected test framework (jest, pytest, go test, ...) |
| `architecturePattern` | string\|null | Detected pattern (monorepo, layered, microservices, ...) |

## Exploration (from rui-init-explore)

| Field | Type | Description |
|-------|------|-------------|
| `moduleMap` | Record<string,string[]> | Module → dependency list |
| `architecture.pattern` | string | Refined architecture pattern |
| `architecture.notes` | string | Human-readable architecture notes |
| `securitySurface` | same as Profile.securitySurface | Corrected security surface |
| `conventions` | Record<string,string> | Coding conventions (naming, formatting, import style) |

## Verify Checks (7-point)

| # | Check | What it verifies |
|---|-------|-----------------|
| 1 | `claude-md-exists` | `CLAUDE.md` present and non-empty |
| 2 | `readme-exists` | `README.md` present and non-empty |
| 3 | `docs-home-exists` | `docs/index.html` + CSS + JS + data.js present |
| 4 | `cross-refs-valid` | All markdown links in CLAUDE.md resolve |
| 5 | `arch-complete` | `docs/arch/` has 5 scene directories with `index.md` |
| 6 | `self-test-complete` | `docs/self-test/` has 6 scene directories with `index.md` |
| 7 | `domain-language-preserved` | README.md Domain Language section preserved if pre-existing |

## Filesystem Output Layout

```
<project-root>/
├── CLAUDE.md                          # Generated from profile + exploration
├── README.md                          # Generated (domain language preserved)
└── docs/
    ├── index.html                     # Dashboard home (layout from templates/)
    ├── index.css
    ├── index.js
    ├── data.js                        # window.HELP_CONFIG (regenerated)
    ├── arch/                          # 5 scene dirs
    │   ├── module-location/
    │   ├── data-flow-tracing/
    │   ├── newcomer-onboarding/
    │   ├── dependency-change-impact/
    │   └── trust-boundary-security-surface/
    └── self-test/                     # 6 scene dirs
        ├── post-init-full-self-check/
        ├── pre-commit-incremental-self-check/
        ├── doc-code-consistency/
        ├── security-surface-regression/
        ├── cross-story-integration-regression/
        └── third-party-framework-service/
```
