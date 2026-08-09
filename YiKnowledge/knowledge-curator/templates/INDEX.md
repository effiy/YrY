---
title: Templates Directory MOC
aliases: [resources-moc, resources-index]
tags: [MOC, resources, index]
category: knowledge-curator/templates
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [knowledge-curator]
benefit: "Content creators find the right template (PRD, ADR, tech design, retrospective) with consistent structure and usage guidance"
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category or domain"
  - one-liner descriptions are specific enough to disambiguate
related:
  - ./README.md
  - ../../ai-engineer/methodology/prompts--README.md
  - ./README.md
  - ../../executive/reading-list/README.md
  - ../../engineer/engineering/find-templates-and-prompts.md
---

# Templates Directory MOC

> **As a** knowledge curator, **I want to** INDEX, **so that** template reusable. 

> PARA: Resources. Prompt words, templates, reading lists. This MOC is the navigation entry for the resources layer; all leaves are indexed within the README of their subdirectories. 

## Leaf overview

| Leaf | Content | File count |
|---|---|---|
| [prompts/](../../ai-engineer/methodology/prompts) | Prompt words (BRD / RAG / Agent / SQL / translation / weekly report / code review)  | 7 |
| [templates/](./) | Templates (PRD / BRD / tech design / selection / ADR / retrospective / meeting / 1on1 / user research / usability)  | 11 |
| [reading-list/](../../executive/reading-list/reading-list.md) | Monthly reading list + reading notes template | 3 |

## prompts/

| File | Type | One-line summary |
|---|---|---|
| [brd-generation-prompt.md](../../ai-engineer/methodology/prompts--brd-generation.md) | prompt | BRD single-section generator |
| [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) | prompt | Answer from retrieved context, references enforced |
| [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) | prompt | Agent decision loop + tool calling |
| [sql-generation-prompt.md](../../ai-engineer/methodology/prompts--sql-generation.md) | prompt | Natural language to read-only SQL |
| [multilingual-translation-prompt.md](../../ai-engineer/methodology/prompts--multilingual-translation.md) | prompt | Multilingual translation locked by glossary |
| [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) | prompt | Weekly report / retrospective generation |
| [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) | summary | Code review (multilingual variant)  |

## templates/

| File | Type | One-line summary |
|---|---|---|
| [knowledge-leaf-template.md](./knowledge-leaf.md) | template | Unified leaf template across the knowledge base (SSOT)  |
| [tech-design-template.md](./tech-design.md) | template | Tech design (business / architecture / detailed / non-functional)  |
| [retrospective-template.md](./retrospective.md) | template | Retrospective (Keep / Problem / 5-Why / Action)  |
| [meeting-notes-template.md](./meeting-notes.md) | template | Meeting notes (agenda / decisions / action items)  |
| [one-on-one-template.md](./one-on-one.md) | template | 1on1 (employee-led + two-way feedback)  |
| [user-research-interview-template.md](./user-research-interview.md) | template | Semi-structured user research interview outline |
| [usability-test-report-template.md](./usability-test-report.md) | template | Usability test report |
| [prd.md](./prd.md) | template | Product requirements documentation |
| [brd.md](./brd.md) | template | Business requirements documentation |
| [adr-template.md](./adr.md) | template | Architecture decision record form |
| [adr-summary.md](./adr.md) | summary | ADR methodology and lifecycle cadence |
| [tech-selection-evaluation-template.md](./tech-selection-evaluation.md) | template | Tech selection evaluation form |
| [tech-selection-evaluation-summary.md](./tech-selection-evaluation.md) | summary | Selection methodology and trade-offs |

## reading-list/

| File | Type | One-line summary |
|---|---|---|
| [reading-list.md](../../executive/reading-list/reading-list.md) | summary | 2026 monthly rolling reading list |
| [reading-notes-template.md](../../executive/reading-list/reading-notes.md) | template | Reading notes template |

## Cross-category exits

- [find-templates-and-prompts.md](../../engineer/engineering/find-templates-and-prompts.md) — scenario entry
- [methodology/ai-specific/](../../ai-engineer/methodology) — Prompt engineering methodology
- [work/meetings/](../../product-manager/delivery) — Meeting templates (instance) 
- [lifecycle/directory-blueprint.md](../diagrams/directory-blueprint.md) — Knowledge base blueprint
