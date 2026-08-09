---
title: Lessons
aliases: [lessons-category-readme, lessons-readme]
tags: [leaf, lessons, engineering, wins, failures]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [engineer]
benefit: "README outcome clear"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
- ./INDEX.md
  - ../process/check-engineering-gotchas.md
  - ../process/review-lessons.md
---

# Lessons

> **As an** engineer, **I want to** learn from past wins, failures, and gotchas, **so that** I can avoid repeating mistakes and replicate success.

> Top-level entry for product, technology, and process lessons: successes, failures, and gotchas.

## Subdirectories

| Leaf | Contents |
|---|---|
| [wins/](.) | Success cases and reusable experience |
| [failures/](.) | Failure cases and retrospectives (includes `bugs/` subcategory) |
| [gotchas/](.) | Engineering pitfalls and notes |

## Archiving principles

- Retrospective reports use **blameless postmortem** writing
- Quantify impact scope and severity
- Every lesson must be traceable to a specific event or evidence
- Improvement actions need an owner and a follow-up date
- Gotchas added within 24h of hitting them (hard requirement, see [../processes/knowledge-contributor-charter.md](../process/knowledge-contributor-charter.md))

## Frequently referenced top

- [gotchas/macos-fsevents-silent-drop.md](gotcha-macos-fsevents-silent-drop.md) — macOS FSEvents silently drops events
- [gotchas/vite-to-rsbuild-migration.md](gotcha-vite-to-rsbuild-migration.md) — Vite → Rsbuild migration gotchas
- [failures/incident-postmortem-summary.md](failure-incident-postmortem.md) — Incident retrospective summary
- [failures/ai-product-launch-lessons-summary.md](failure-ai-product-launch-lessons.md) — AI product launch failure cases
- [wins/yiai-brd-agent-launch.md](win-yiai-brd-agent-launch.md) — YiAi BRD agent launch

## Related

- [INDEX.md](./INDEX.md) — MOC for this category
- [../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — scenario entry: engineering gotchas
- [../processes/review-lessons.md](../process/review-lessons.md) — scenario entry: retrospectives and lessons
