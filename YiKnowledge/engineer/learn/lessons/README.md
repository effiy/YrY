---
title: Lessons
aliases: [lessons-category-readme, lessons-readme]
tags: [leaf, lessons, engineering, wins, failures]
chip: lessons-learned
category: engineer/learn/lessons
created: 2026-08-03
updated: 2026-08-10
last_verified: 2026-08-10
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
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../../leader/risk/write-a-postmortem.md
  - ../../../srer/incident-response/respond-to-an-incident.md
  - ./INDEX.md
  - ../INDEX.md
  - ../../run/check-engineering-gotchas.md
  - ../../run/review-lessons.md
  - ../../../projects/
---

# Lessons

> **As an** engineer, **I want to** learn from past wins, failures, and gotchas, **so that** I can avoid repeating mistakes and replicate success.

> Top-level entry for product, technology, and process lessons: successes, failures, gotchas, and bugs.

## Subdirectories

| Leaf | Contents |
|---|---|
| [wins/](./wins/) | Success cases and reusable experience |
| [failures/](./failures/) | Failure cases and retrospectives |
| [gotchas/](./gotchas/) | Engineering pitfalls and notes |
| [bugs/](./bugs/) | Bug tracking and resolution notes |

## Archiving principles

- Retrospective reports use **blameless postmortem** writing
- Quantify impact scope and severity
- Every lesson must be traceable to a specific event or evidence
- Improvement actions need an owner and a follow-up date
- Gotchas added within 24h of hitting them (hard requirement, see [../../run/knowledge-contributor-charter.md](../../run/knowledge-contributor-charter.md))

## Frequently referenced

- [gotchas/macos-fsevents-silent-drop.md](./gotchas/gotcha-macos-fsevents-silent-drop.md) — macOS FSEvents silently drops events
- [gotchas/vite-to-rsbuild-migration.md](./gotchas/gotcha-vite-to-rsbuild-migration.md) — Vite → Rsbuild migration gotchas
- [failures/incident-postmortem.md](./failures/failure-incident-postmortem.md) — Incident retrospective summary
- [failures/ai-product-launch-lessons.md](./failures/failure-ai-product-launch-lessons.md) — AI product launch failure cases
- [wins/yiai-brd-agent-launch.md](./wins/win-yiai-brd-agent-launch.md) — YiAi BRD agent launch
- [dashboard-lessons-learned.md](./dashboard-lessons-learned.md) — Lessons learned dashboard

## Related

- [INDEX.md](./INDEX.md) — Index for this category
- [../../run/check-engineering-gotchas.md](../../run/check-engineering-gotchas.md) — scenario entry: engineering gotchas
- [../../run/review-lessons.md](../../run/review-lessons.md) — scenario entry: retrospectives and lessons
