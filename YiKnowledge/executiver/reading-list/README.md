---
title: Reading List
aliases:
- reading-list
- resources-reading-list
tags:
- leaf
- resources
- reading-list
- moc
category: executiver/reading-list
created: '2026-08-03'
updated: '2026-08-18'
last_verified: '2026-08-18'
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: monthly
roles:
- executiver
benefit: "Executives can maintain a curated reading list for continuous learning, with book notes and templates for capturing actionable insights"
acceptance_criteria:
- scope of the leaf directory is clearly bounded
- file inventory table is complete with one-liner descriptions
- cross-references to related leaves and parent INDEX are present
related:
- ./reading-list.md
- ./reading-notes.md
- ./reading-note-high-output-management.md
- ../../curator/governance/README.md
- ../../curator/templates/README.md
- ../../aier/README.md
- ../../aier/methodology/prompts/README.md
- ../../engineer/build/README.md
---

# Reading List

> **As an** executiver, **I want to** maintain a curated reading list, **so that** I can continuously learn and stay ahead of industry trends.
> Collects articles, books, and papers to read or already read. Read items with sedimentation value are distilled into the matching semantic leaves (`methodology/` `tech/`); this leaf is only a list and reading-notes index.

## Scope

- Monthly reading list (rolling updates)
- Reading-note summaries
- Paper reading notes
- Long-form reading notes

## File inventory

| File | Type | One-liner |
|---|---|---|
| [reading-list.md](./reading-list.md) | summary | 2026 monthly rolling reading list with status tracking and backlog |
| [reading-notes.md](./reading-notes.md) | template | Reading-notes template with 5-section structure and field guidance |
| [reading-note-high-output-management.md](./reading-note-high-output-management.md) | summary | Andy Grove's High Output Management — key frameworks and action implications |

## Workflow

```
New article/book captured → curator/governance/ → read → notes captured with reading-notes template
→ has sedimentation value → distill into the matching semantic leaf (methodology/tech/strategy/...)
→ the notes' related field points to the final landing
```

### Detailed steps

1. **Capture**: Add candidate readings to the backlog in [reading-list.md](./reading-list.md)
2. **Prioritize**: Monthly review — move top-priority items from backlog to current month
3. **Read & Note**: Use [reading-notes.md](./reading-notes.md) template to capture structured notes
4. **Sediment**: Distill actionable insights into the matching semantic leaf within 1 week
5. **Review**: Quarterly review of reading notes to identify cross-cutting patterns

## Recommended structure (reading notes)

1. **One-sentence core viewpoint** — the author's central thesis in one sentence
2. **Key chapter summary** — table: core argument + key evidence + quoted highlights
3. **Action implications** — what this team's work can borrow, immediately actionable items
4. **Quoted highlights** — memorable or provocative quotes
5. **Sedimentation destination** — table tracking which viewpoints have been distilled into which YiKnowledge file

## Related leaves

- [../../curator/governance/README.md](../../curator/governance/README.md) — Knowledge lifecycle governance, inbox, triage, and review processes
- [../../curator/templates/README.md](../../curator/templates/README.md) — Reusable documentation templates (PRD, BRD, ADR, etc.)
- [../../aier/README.md](../../aier/README.md) — AI engineering resources for technical distillation
- [../../aier/methodology/prompts/README.md](../../aier/methodology/prompts/README.md) — Supporting prompts for content creation
- [../../engineer/build/README.md](../../engineer/build/README.md) — Build and development resources

## Navigation

- Parent: [../README.md](../README.md) — Executiver role overview
- Index: [../INDEX.md](../INDEX.md) — Executiver role index
- Role home: [../../INDEX.md](../../INDEX.md) — YiKnowledge root index