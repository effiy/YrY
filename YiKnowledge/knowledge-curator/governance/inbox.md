---
title: Knowledge Inbox / Inbox
aliases:
- inbox
- capture-staging
tags:
- lifecycle
- inbox
- fallback directory
category: knowledge-curator/governance
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: inbox
review_cycle: weekly
roles:
- knowledge-curator
benefit: kb stays curated
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./triage.md
- ./tacit-knowledge-backlog.md
- ../README.md
- ../../engineer/process/knowledge-review.md
tacit: false
---

# Knowledge Inbox / Inbox

> **As a** knowledge curator, **I want to** inbox, **so that** kb stays curated. 

> Fallback directory: freshly captured, not-yet-classified or refined content is staged here. 

## Summary

- New content that doesn't yet have a home goes here first; cleared once a week
- Staging file name: `_inbox-{YYYYMMDD}-{short-slug}.md`
- Every entry must flow to a goal leaf or be explicitly rejected with `status: declined`
- Goal: empty this table; all staged content flows to `lifecycle: triage`

## Core viewpoints

- **The fallback directory is one of the three iron rules of directories** — without a fallback directory, employees "don't know where to put it so don't write it"; knowledge flows are lost in group chat
- **Inbox is a temporary state, not a destination** — the weekly review must clear it; otherwise the inbox becomes a junk pile and signal is drowned by noise

## Key information

### Workflow

```
New content arrives -> staged in this table -> classified during weekly review -> moved to the matching leaf (lifecycle: triage) -> table cleared
```

### Staging queue

| File (temp name) | Source | Capture date | To be classified into | State |
|---|---|---|---|---|
| _(empty)_ | | | | |

### State enum

- `raw`: only the original link/path, unread
- `scanned`: scanned once, can be located to a leaf but not yet refined
- `assigned`: goal leaf determined, pending move

### Naming convention

Staging file name: `_inbox-{YYYYMMDD}-{short-slug}.md`, e.g. `_inbox-20260803-rag-chunking.md`

## Action recommendations

1. Register in the table immediately upon capture, with original link/path + source + date
2. During the weekly review, decide each item: move to goal leaf or explicitly reject
3. Record rejection reason: low source quality / duplicates existing / out of scope
4. For moved files, change frontmatter to `lifecycle: triage` and register in [triage.md](./triage.md)



- **Inbox accumulates beyond 7 days** — consequence: signal drowned by noise, new content forgotten
- **Rejection without a reason** — consequence: same-class content keeps arriving; repeated decision cost
- **Writing a summary directly instead of flowing to triage** — consequence: skips the triage queue tracking; operations cannot measure refinement progress

## Related

- Same class: [triage.md](./triage.md) (queue to refine), [archive.md](../archive/archive.md) (archive index)
- Upstream: [README.md](../README.md) (Lifecycle view overview)
- Downstream: [tacit-knowledge-backlog.md](./tacit-knowledge-backlog.md) (tacit knowledge backlog)
- SOP: [../../engineer/process/knowledge-review.md](../../engineer/process/knowledge-review.md)
