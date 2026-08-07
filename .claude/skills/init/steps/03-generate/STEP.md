---
name: generate-step
description: >
  Generate the project's baseline docs (CLAUDE.md + README.md) from the
  detect-phase profile and the explore-phase module map. Run this step
  after step 02-explore and before step 05-verify.
---

# yry-init-generate (step ③ of yry-init)

> Single responsibility: emit `CLAUDE.md` and `README.md` from the
> `profile` + `exploration` objects. It does not read source
> code (that is step 02-explore's job), and it does not produce any
> other artifacts.
>
> Triggered by the parent pipeline (yry-init), right after
> yry-init-explore.
>
> **Repeatable**: every init run fully rebuilds `CLAUDE.md` and the
> non-domain-language sections of `README.md`.

[Inputs](#inputs) · [Outputs](#outputs) · [1. CLAUDE.md Layout](#1-claudemd-layout) · [2. README.md Layout](#2-readmemd-layout) · [3. Domain Language Section](#3-domain-language-section) · [4. Rebuild Semantics](#4-rebuild-semantics) · [5. Generation Principles](#5-generation-principles) · [Fallback](#fallback) · [Active Markers](#active-markers)

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

## 1. CLAUDE.md Layout

| Section | Content |
|---------|---------|
| Foundational beliefs | Trust the model · value attention · verify reality · **Think Before Coding** (Karpathy §1) |
| Iron laws | Four non-negotiable rules — **Simplicity First** (Karpathy §2) + **Surgical Changes** (Karpathy §3) |
| Architecture direction | One-line classification: project type (frontend/backend) → axis (`componentization` or `modularization`), linking to [../../rules/architecture-direction.md](../../rules/architecture-direction.md). Required section — see rule. |
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

## 3. Domain Language Section

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

## 4. Rebuild Semantics

| File | On repeat run | Rationale |
|------|---------------|-----------|
| `CLAUDE.md` | **Rebuilt** fully | Pure function of `profile` + `exploration` |
| `README.md` (system view / commands / quick start / structure) | **Rebuilt** | Driven by `profile` + `exploration` |
| `README.md` (domain-language section) | **Appended** if absent, **preserved** if present | Domain language is user-curated |

The skill must not silently drop any pre-existing file. If a
rebuild would discard user content, abort and surface the conflict
to the parent pipeline.

## 5. Generation Principles

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


## Rules

- [generation-contracts.md](./rules/generation-contracts.md) — ---
- [output-ownership.md](./rules/output-ownership.md) — ---

## Specialized Agents

- [document-validator.md](./agents/document-validator.md) — ---
- [template-renderer.md](./agents/template-renderer.md) — ---

## References

- [doc-templates.md](./references/doc-templates.md) — ---
- [principle-sources.md](./references/principle-sources.md) — ---
