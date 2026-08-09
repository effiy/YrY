---
title: Reading List
aliases: [reading-list, resources-reading-list]
tags: [leaf, resources, reading-list, moc]
category: executive/reading-list
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: monthly
roles: [executive]
benefit: "reading list curated"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ./reading-list.md
  - ./reading-notes.md
  - ../../knowledge-curator/governance/inbox.md
  - ../../engineer/engineering/find-templates-and-prompts.md
---

# Reading List

> **As an** executive, **I want to** maintain a curated reading list, **so that** I can continuously learn and stay ahead of industry trends.

> Collects articles, books, and papers to read or already read. Read items with sedimentation value are distilled into the matching semantic leaves (`methodology/` `tech/`); this leaf is only a list and reading-notes index.

## Scope

- Monthly reading list (rolling updates)
- Reading-note summaries
- Paper reading notes
- Long-form reading notes

## Already indexed

| File | Type | One-liner |
|---|---|---|
| [reading-list.md](./reading-list.md) | summary | 2026 monthly rolling reading list |
| [reading-notes-template.md](./reading-notes.md) | template | reading-notes template |
| [reading-note-high-output-management.md](./reading-note-high-output-management.md) | summary | Andy Grove's High Output Management — key frameworks and application |

## Workflow

```
New article captured → lifecycle/inbox.md → read → notes to reading-list/
→ has sedimentation value → distill into the matching semantic leaf (methodology/tech/...)
→ the notes' related field points to the final landing
```

## Recommended structure (reading notes)

1. One-sentence core viewpoint
2. Key chapter summary (core argument + key evidence + quoted highlights)
3. Action implications (what this team's work can borrow, immediately actionable items)
4. Quoted highlights
5. Sedimentation destination (which viewpoints have been distilled into which YiKnowledge file)

## Related leaves

- [../../knowledge-curator/governance/inbox.md](../../knowledge-curator/governance/inbox.md) — articles enter inbox first, then get categorized
- [../../knowledge-curator/templates](../../knowledge-curator/templates) — destination for methodology distillation
- [../../ai-engineer](../../ai-engineer) — destination for technical distillation
- [../../ai-engineer/methodology/prompts](../../ai-engineer/methodology/prompts) — an article may produce a prompt
- [../../knowledge-curator/templates](../../knowledge-curator/templates) — an article may produce a template
- [../../engineer/engineering/find-templates-and-prompts.md](../../engineer/engineering/find-templates-and-prompts.md) — scenario entry
