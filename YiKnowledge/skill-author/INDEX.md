---
title: "Skill Author role index"
tags: [index, skill-author, claude-code, yry, skill-design]
category: skill-author
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: index
status: stable
lifecycle: active
roles: [skill-author, engineer]
benefit: "Skill authors find design patterns, yry-* family conventions, and lifecycle rules in one index"
acceptance_criteria:
  - "Patterns subdirectory with yry-skill-family.md"
  - "Skill lifecycle and design principles documented"
related:
  - ./README.md
  - ../INDEX.md
---

# Skill Author — Role Index

> **As a** skill author, **I want to** navigate skill design patterns, yry-* family conventions, and lifecycle rules, **so that** I create and maintain Claude Code skills consistently.

## Subdirectories

| Domain | Content | Files |
|---|---|---|
| [patterns/](./patterns/) | yry-* skill family contracts, design patterns | 1 |

## Key files

- [patterns/yry-skill-family.md](./patterns/yry-skill-family.md) — Frontmatter and invocation contracts for 5 yry-* custom skills + skill-creator

## Skill inventory (yry-* family)

| Skill | Command | Purpose |
|---|---|---|
| yry-init | `/yry-init` | Project initialization pipeline |
| yry-gen-brd | `/yry-gen-brd` | BRD entry generation |
| yry-npm | `/rui-npm` | Personal npm package management |
| yry-optimize-meta-columns | `/yry-optimize-meta-columns` | MetaColumn width optimization |
| yry-import | `/yry-import` | Document sync to remote API |

## Design principles

1. **SKILL.md frontmatter** — `name`, `description`, `user_invocable`, `lifecycle` required
2. **yry- prefix** — Project-specific skills only; public skills use their own namespacing
3. **skill-creator** — Meta-skill for generating new skill skeletons
4. **description as recall signal** — Write trigger scenarios, not feature descriptions

## Cross-role references

- [../engineer/engineering/](../engineer/engineering/) — Dev tooling patterns
- [../knowledge-curator/templates/](../knowledge-curator/templates/) — Knowledge leaf templates (shared origin)
- [../INDEX.md](../INDEX.md) — Full library navigation