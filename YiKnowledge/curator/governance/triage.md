---
title: Knowledge Base Triage Queue
tags: [governance, triage, curator]
category: curator/governance
created: 2026-08-21
updated: 2026-08-21
source: internal
type: index
status: stable
lifecycle: active
review_cycle: weekly
roles: [curator]
benefit: "Curators find classified-but-unsummarized content that needs frontmatter completion and quality review"
acceptance_criteria:
  - "All triage items have a target role directory and assigned reviewer"
  - "Triage queue is drained weekly (≤20 items)"
  - "Items older than 14 days are escalated"
related:
  - ./governance.md
  - ./inbox.md
  - ./readiness-checklist.md
  - ./README.md
---

# Knowledge Base Triage Queue

> **Classified but not yet summarized.** Items here have been assigned to a role directory but need frontmatter completion, content formatting, and quality review before promotion to `lifecycle: active`. Cap at 20 items. Weekly drain target: all items ≤14 days old.

## Triage queue

| # | Date | File | Role | Reviewer | Status |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

## Promotion procedure

For each item, complete the [readiness checklist](./readiness-checklist.md):

1. Verify frontmatter: all required fields present, `category` matches directory
2. Verify naming: kebab-case, no underscores or digits
3. Add `benefit:` and `acceptance_criteria:`
4. Check all `related:` links resolve
5. Set `lifecycle: active`, `status: stable`, `review_cycle: quarterly`
6. Move item from this list to `review-log.md` with a "promoted" entry

## Escalation

Items older than 14 days should be escalated: either promote immediately (if content is ready), move back to inbox (if classification was wrong), or archive (if no longer relevant).