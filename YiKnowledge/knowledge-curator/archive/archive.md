---
title: Archive Index / Archive
aliases:
- archive-index
- deprecated-registry
tags:
- lifecycle
- archive
- deprecated
category: knowledge-curator/archive
created: 2026-08-03
updated: 2026-08-03
source: internal
type: template
status: stable
lifecycle: archive
review_cycle: yearly
roles:
- knowledge-curator
benefit: archive traceable
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ../governance/inbox.md
- ../governance/triage.md
- ../README.md
- ../../executive/industry/README.md
- ../../engineer/process/knowledge-deprecation-policy.md
tacit: false
---

# Archive Index / Archive

> **As a** knowledge curator, **I want to** archive, **so that** archive traceable.

> A list of files with `status: deprecated` or superseded.

## Summary

- Physical location stays in the original leaf; only the state stream changes; this index supports yearly consolidated cleanup
- Archive cause: `superseded` / `outdated` / `duplicate` / `out-of-scope`
- State transition: `active → deprecated → archive (physical removal vs retention)`
- Yearly review decides on physical cleanup

## Core ideas

- **deprecated is a state, not a physical move** — keeping the original location eases reference tracing and avoids broken links
- **superseded is physically deleted only after one year** — the replacement file must run stably for a year to confirm no rollback risk

## Key information

### Archive list

| filepath | archive date | archive cause | replacement file |
|---|---|---|---|
| _(empty)_ | | | |

### Archive cause enumeration

- `superseded`: replaced by a new version (replacement file column is required)
- `outdated`: external content is outdated (`last_verified` not verified for over 1 year)
- `duplicate`: duplicates another file
- `out-of-scope`: beyond YiKnowledge scope

### State transition

```
active → deprecated → archive (physical removal / decide retain vs delete)
```

Detailed rules: [../../engineer/process/knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md)

## Action recommendations

1. Quarterly review: register newly appearing `status: deprecated` files in this table
2. Year-start review: for `superseded` files whose replacement has been stable for 1 year, physically delete the original file
3. `outdated` still referenced: try to update; if it cannot be updated, keep as deprecated
4. `out-of-scope`: move to an external note system or do not retain

## Anti-patterns / common misuses

- **Directly physically deleting deprecated files** — consequence: external references break, no history tracing
- **Not registering deprecated files in this table** — consequence: yearly cleanup misses them, garbage accumulates
- **Not filling the replacement file for superseded** — consequence: readers cannot find the new version, knowledge gap

## Related

- Same category: [inbox.md](../governance/inbox.md) (capture), [triage.md](../governance/triage.md) (refine)
- Upstream: [README.md](../README.md) (Lifecycle view layer overview)
- Physical archive area: [../../executive/industry/README.md](../../executive/industry/README.md)
- SOP: [../../engineer/process/knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md), [../../engineer/processes/knowledge-review.md](../../engineer/process/knowledge-review.md)
