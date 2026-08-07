---
title: Resources
aliases:
- resources
- resources-category
tags:
- category
- resources
- moc
category: knowledge-curator/templates
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: leaf-readme
status: stable
lifecycle: reference
review_cycle: quarterly
roles:
- knowledge-curator
benefit: template reusable
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present"
related:
- ./INDEX.md
- ../../executive/industry/README.md
- ../../executive/industry/README.md
- ../../executive/industry/README.md
- ../../engineer/engineering/find-templates-and-prompts.md
tacit: false
---

# Resources

> **As a** knowledge curator, **I want to** README resources, **so that** template reusable.

> YiKnowledge's reusable asset layer: Prompts, templates, and reading lists. All leaves follow the unified `knowledge-leaf-template.md` structure; frontmatter is the first signal for RAG retrieval.

## Subdirectories

| Leaf | Content | File count |
|---|---|---|
| `prompts/` | Reusable prompt assets (BRD / RAG / Agent / SQL / translation / weekly report) | 7 |
| `templates/` | Documentation templates (PRD / BRD / tech design / vendor selection / ADR / retrospective / meeting / 1on1 / user research / usability) | 11 |
| [reading-list/](../../executive/reading-list/reading-list.md) | Monthly reading lists and book notes | 3 |

## Inclusion principles

- Templates and prompts must include usage scenario explanation, variable/field list, and anti-patterns
- All leaves follow the seven-section `knowledge-leaf-template.md` structure; frontmatter fields are required
- Sensitive information such as test accounts and keys only stores a metadata pointer; credentials are kept in a password manager
- Reading lists are archived monthly; items that have been read and have lasting value are distilled into the corresponding semantic leaves (`methodology/` `tech/`)
- Naming: all English kebab-case, filename `<topic>-<type>.md` (type ∈ prompt/template/summary)

## Frequently referenced

- [prompts/brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md)
- [prompts/rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md)
- [templates/tech-design-template.md](./tech-design.md)
- [templates/retrospective-template.md](./retrospective.md)

## Related

- [INDEX.md](./INDEX.md) — MOC for this category
- [find-templates-and-prompts.md](../../engineer/engineering/find-templates-and-prompts.md) — Scenario entry
- `methodology/ai-specific/` — Prompt engineering methodology
