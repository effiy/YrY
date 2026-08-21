---
title: Knowledge Base Inbox
tags: [governance, inbox, curator]
category: curator/governance
created: 2026-08-21
updated: 2026-08-21
source: internal
type: index
status: stable
lifecycle: active
review_cycle: weekly
roles: [curator]
benefit: "Curators find unclassified content that needs to be triaged into the correct role directory"
acceptance_criteria:
  - "All inbox items have a date and source"
  - "Inbox is drained within 24 hours (daily scan)"
  - "Items older than 7 days are escalated"
related:
  - ./governance.md
  - ./triage.md
  - ./README.md
---

# Knowledge Base Inbox

> **Catch-all for unclassified content.** Items here need to be classified into a role directory and moved to `triage.md` within 24 hours. If this list grows beyond 10 items, pause new collection until the backlog is drained.

## Inbox items

| # | Date | Source | Description | Action |
|---|---|---|---|---|
| — | — | — | — | — |

## Drain procedure

1. For each item, determine the correct role directory using the [role boundary decision tree](../../README.md#role-boundary-quick-reference)
2. Create a stub file in the target directory with minimal frontmatter (`title`, `tags`, `category`, `created`, `source`, `type: original`, `status: draft`, `lifecycle: triage`)
3. Move the item from this list to `triage.md`
4. If the role is unclear, leave in inbox and tag with `[needs-classification]`

## Escalation

Items older than 7 days should be escalated to the curator for a decision: classify now, or archive as `lifecycle: archive` with a note explaining why it wasn't classified.