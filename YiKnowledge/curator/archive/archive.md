---
title: Archive Index — Deprecated Content Registry
aliases: [archive, deprecated, legacy-content]
tags: [curator, archive, deprecated, registry]
category: curator/archive
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: yearly
roles: [curator]
benefit: "Curators track deprecated content — what was removed, why, and what replaced it"
acceptance_criteria:
  - "every deprecated file has a record with deprecation date, reason, and replacement"
  - "archive is the single source of truth for removed content"
related:
  - ./README.md
  - ../治理/governance.md
  - ../治理/readiness-checklist.md
---

# Archive Index

> **Purpose:** Registry of all deprecated and removed content. When a file is archived, add a record here. Never delete a record — this is the permanent audit trail.

## Deprecation Records

| File | Deprecated | Reason | Replaced by |
|---|---|---|---|
| (No entries yet) | — | — | — |

## Archive Procedure

1. Move the file from its role directory to `curator/archive/`
2. Add a record to the table above
3. Update any `related:` links in other files that pointed to the deprecated file
4. If the file is superseded, add a `superseded_by:` field to the deprecated file's frontmatter

## Deprecation Criteria

| Criterion | Action |
|---|---|
| `last_verified` > 6 months old | Mark `status: deprecated`; move to archive if no one updates it within 30 days |
| Content superseded by a newer file | Move to archive immediately; add `superseded_by:` link |
| Content no longer relevant | Move to archive; note reason in the record |
| Broken or incorrect content | Fix if possible; archive if the topic is no longer relevant |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Deleting deprecated files | Audit trail is lost; can't see what was tried and abandoned | Always move to archive, never delete |
| Archiving without updating cross-references | Dead links in other files; RAG retrieves broken references | Update all `related:` links before archiving |
| Archive with no deprecation reason | Future readers don't know why it was removed | Always include a reason and replacement in the record |