---
title: "Knowledge Curator role index"
tags: [index, knowledge-curator, governance, diagrams, templates, archive]
category: knowledge-curator
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [knowledge-curator]
benefit: "Knowledge curators find governance, diagrams, templates, and archive in one index"
acceptance_criteria:
  - "6 subdirectories with file counts"
  - "Governance lifecycle documented"
related:
  - ./README.md
  - ../INDEX.md
  - ../README.md
---

# Knowledge Curator — Role Index

> **As a** knowledge curator, **I want to** navigate governance rules, diagrams, templates, and archive, **so that** I maintain knowledge base quality.

## Subdirectories

| Domain | Content | Files |
|---|---|---|
| [governance/](./governance/) | KB lifecycle, inbox/triage, readiness checklist, tacit knowledge backlog | 8 |
| [diagrams/](./diagrams/) | 4 diagrams: knowledge map, user journey, directory blueprint | 3+ |
| [archive/](./archive/) | Deprecated files index + strategies-legacy (2041 archived templates) | 2+ |
| [templates/](./templates/) | Knowledge leaf template, thinking models | 2+ |
| [people/](./people/) | Experts, stakeholders, team | 3+ |
| [notes/](./notes/) | Curator working notes | — |

## Governance lifecycle

1. **Inbox** — unclassified content lands in [governance/inbox.md](./governance/inbox.md)
2. **Triage** — classified but unsummarized content in [governance/triage.md](./governance/triage.md)
3. **Active** — files with `lifecycle: active` are searchable and maintained
4. **Deprecated** — files with `status: deprecated` move to [archive/](./archive/)

## 4 diagrams

| Diagram | File |
|---|---|
| Knowledge map | [diagrams/knowledge-map.md](./diagrams/knowledge-map.md) |
| User-journey map | [diagrams/user-journey.md](./diagrams/user-journey.md) |
| Directory blueprint | [diagrams/directory-blueprint.md](./diagrams/directory-blueprint.md) |
| Governance flow | [governance/governance.md](./governance/governance.md) |

## Cross-role references

- [../README.md](../README.md) — KB overview and design principles
- [../INDEX.md](../INDEX.md) — Full-library index
- [./COLLABORATION.md](./COLLABORATION.md) — Collaboration domain index
