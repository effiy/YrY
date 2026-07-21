---
name: yry-init-arch
description: >
  Build the project's two story directories from the detect + explore
  outputs: arch (system architecture knowledge) and
  test (self-check strategy). All generated story directories and
  files live under `docs/`. Each scene directory ships an `index.md`
  following the §0–§4 lifecycle. Run this skill after
  yry-init-generate, before yry-init-verify.
---

# yry-init-arch

> Single responsibility: emit the two story directories
> `docs/arch` (system architecture knowledge) and
> `docs/test` (self-check strategy) under the docs root.
> This skill does not run tests, does not generate maturity reports,
> and does not verify the artifacts — those are separate skills.
>
> Triggered by the parent pipeline (yry-init), right after
> yry-init-generate.
>
> **Story naming**: `arch` and `test`
> (kebab-case, lowercase). For example, a project named `rui`
> produces `yry-arch` and `yry-test`.

[Inputs](#inputs) · [Outputs](#outputs) · [1. arch Layout](#1-arch-layout) · [2. test Layout](#2-test-layout) · [3. Scene §0–§4 Lifecycle](#3-scene-04-lifecycle) · [Fallback](#fallback) · [Active Markers](#active-markers)

## Inputs

| Field | Type | Description |
|-------|------|-------------|
| `profile` | `Profile` | The fact baseline emitted by yry-init-detect. Required. |
| `exploration` | `Exploration` | The module map + conventions emitted by yry-init-explore. Required. |
| `cwd` | path (optional) | Project root. Defaults to current working directory. |

## Outputs

| Path | Description |
|------|-------------|
| `docs/arch/` | System architecture story |
| `docs/arch/scene-N-<slug>/` | ≥ 5 architecture reference scenes |
| `docs/arch/scene-N-<slug>/index.md` | Per-scene full lifecycle (§0–§4) |
| `docs/test/` | Self-check story (same internal layout) |

## 1. arch Layout

Built from the module map, project topology, baseline docs
(`CLAUDE.md` / `README.md`), and the docs home entry (the yry-init
dashboard) produced by yry-init-generate.

| # | File | Content |
|---|------|---------|
| 1 | `scene-N-<slug>/index.md` | Architecture reference scenes, each self-contained §0–§4 |

### Required Scenes (≥ 5)

The arch story must include at least the following scene types.
Slug names are kebab-case.

1. **module-location** — "Where does module X live in the source tree?"
2. **data-flow-tracing** — "Trace a request from entry to persistence."
3. **newcomer-onboarding** — "I'm new here; what should I read first?"
4. **dependency-change-impact** — "What breaks if I upgrade dependency Y?"
5. **trust-boundary-security-surface** — "Where are the trust boundaries, and what is exposed at each?"

Additional scenes are allowed.

All `arch` outputs live under `docs/arch/`; nothing is written to the
project root.

## 2. test Layout

Built from the baseline docs, docs home entry, and the project type /
inventory.

| # | File | Content |
|---|------|---------|
| 1 | `scene-N-<slug>/index.md` | Self-check scenes, each self-contained §0–§4 |

### Required Scenes (≥ 6)

1. **post-init-full-self-check** — "Does the project pass a full self-check after a fresh init?"
2. **pre-commit-incremental-self-check** — "What is the minimum check before committing?"
3. **doc-code-consistency** — "Do the docs still match the code?"
4. **security-surface-regression** — "Has the security surface changed since the last baseline?"
5. **cross-story-integration-regression** — "Do the story directories still pass cross-story integration checks?"
6. **third-party-framework-service** — "Are third-party frameworks and services still healthy?"

Additional scenes are allowed.

All `test` outputs live under `docs/test/`; nothing is
written to the project root.

## 3. Scene §0–§4 Lifecycle

Each scene's `index.md` follows the §0–§4 lifecycle:

- **§0 — Effect sketch**: Mermaid diagram + scene overview
- **§1 — Test design**: AC / SC mapping
- **§2 — Output inventory + architecture decisions**
- **§3 — Test report**: pass / fail breakdown
- **§4 — Self-improvement**: D0–D8 diagnosis + follow-up actions

The module map, data flows, and topology layers (entry / domain / persistence / external) are
documented inside each scene's `index.md` (§2 Output inventory) — there is no separate
structured graph file.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `cwd` does not exist | Abort with `cwd-not-found` |
| Module map is empty | Emit a single "stub" scene in `docs/arch` with a `# TODO: module map empty` note; `docs/test` is still fully populated |
| A scene cannot be emitted | Abort the entire arch emit; let the parent pipeline surface the failure to yry-init-verify |
| `docs/arch/` already exists | **Full rebuild** — overwrite the directory contents |
| `docs/test/` already exists | **Full rebuild** — overwrite the directory contents |

## Active Markers

| Marker | Verification | Expected behavior |
|--------|--------------|-------------------|
| `docs/arch/` exists | `test -d` | Pipeline may proceed |
| `docs/arch/` has ≥ 5 scenes | count | Pipeline may proceed |
| Every scene has `index.md` | per-scene check | Pipeline may proceed |
| `docs/test/` exists | `test -d` | Pipeline may proceed |
| `docs/test/` has ≥ 6 scenes | count | Pipeline may proceed |
| Every test scene has `index.md` | per-scene check | Pipeline may proceed |


## Rules

- [scene-constraints.md](./rules/scene-constraints.md) — ---
- [story-generation-contracts.md](./rules/story-generation-contracts.md) — ---

## Specialized Agents

- [scene-builder.md](./agents/scene-builder.md) — ---
- [scene-validator.md](./agents/scene-validator.md) — ---

## References

- [scene-catalog.md](./references/scene-catalog.md) — ---
- [test-scenes.md](./references/test-scenes.md) — ---

## Rules

- [scene-constraints.md](./rules/scene-constraints.md) — ---
- [story-generation-contracts.md](./rules/story-generation-contracts.md) — ---

## Specialized Agents

- [scene-builder.md](./agents/scene-builder.md) — ---
- [scene-validator.md](./agents/scene-validator.md) — ---

## References

- [scene-catalog.md](./references/scene-catalog.md) — ---
- [test-scenes.md](./references/test-scenes.md) — ---

## Templates

- [scene-index.md](./templates/scene-index.md) — ---
