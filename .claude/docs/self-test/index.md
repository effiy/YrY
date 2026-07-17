# Self-test Story · Index

> Six self-check scenes for the `.claude` skills catalog. Generated
> by `rui-init` step 04-arch on 2026-07-15 15:20. Each scene follows
> the §0–§4 lifecycle (effect sketch · test design · output inventory +
> architecture decisions · test report · self-improvement).

## Scenes

| # | Slug | What it answers |
|---|------|-----------------|
| 1 | [post-init-full-self-check](./scene-1-post-init-full-self-check/index.md) | Does the project pass a full self-check after a fresh init? |
| 2 | [pre-commit-incremental-self-check](./scene-2-pre-commit-incremental-self-check/index.md) | What is the minimum check before committing? |
| 3 | [doc-code-consistency](./scene-3-doc-code-consistency/index.md) | Do the docs still match the code? |
| 4 | [security-surface-regression](./scene-4-security-surface-regression/index.md) | Has the security surface changed since the last baseline? |
| 5 | [cross-story-integration-regression](./scene-5-cross-story-integration-regression/index.md) | Do the story directories still pass cross-story integration checks? |
| 6 | [third-party-framework-service](./scene-6-third-party-framework-service/index.md) | Are third-party frameworks and services still healthy? |

## Lifecycle

Every scene's `index.md` follows the same 5-section lifecycle:

- **§0 — Effect sketch** — Mermaid diagram + scene overview
- **§1 — Test design** — Acceptance criteria (AC) + success conditions (SC)
- **§2 — Output inventory + architecture decisions** — what files
  this scene produces + the D-1..D-N decisions it encodes
- **§3 — Test report** — pass / fail breakdown of every AC
- **§4 — Self-improvement** — D-0..D-8 diagnoses + follow-up actions

The lifecycle is shared with `docs/arch/` so the two story
trees are structurally consistent.

## Source of truth

- [`docs/.pipeline-state/profile.json`](../.pipeline-state/profile.json) —
  the 5-boolean `securitySurface` and the inventory
- [`docs/.pipeline-state/exploration.json`](../.pipeline-state/exploration.json) —
  the module map and the per-group counters
- [`../CLAUDE.md`](../../CLAUDE.md) — the auto-generated baseline
- [`../README.md`](../../README.md) — the auto-generated README
- [`../arch/index.md`](../arch/index.md) — the architecture story index
