---
title: Content Review Log
aliases:
- review-log
- operations-history
tags:
- lifecycle
- review-log
- template
category: knowledge-curator/governance
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: monthly
roles:
- knowledge-curator
benefit: kb stays curated
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./governance.md
- ../README.md
- ../../engineer/process/knowledge-review.md
tacit: false
---

# Content Review Log

> **As a** knowledge curator, **I want to** review log, **so that** kb stays curated.

> Add one row per review (week/month/quarter/year). Trace operations history and decision rationale.

## Summary

- Add at least one row per review, even if no operation was performed (`review` + "no change")
- Nine operation types: create/update/triage/promote/deprecate/archive/delete/restructure/review
- Seven scope enumerations: inbox/triage-queue/external-staleness/archive-cleanup/structure-audit/tacit-capture/full-sweep
- "Files handled" means the number of actual changes/decisions; scanning only does not count
- Owner is required for multi-person collaboration traceability

## Core viewpoints

- **The review log is the traceable asset of operations** — without the log, quarterly reviews rely on memory and decision rationale is lost
- **"No change" must still be logged** — proving the scan happened prevents gaps in the operations loop
- **Structured fields enable aggregate analysis** — scope + operation type combinations let you quantify investment per stage

## Key information

### Log table

| Date | Scope | Files handled | Operation type | Owner | Notes |
|---|---|---|---|---|---|
| 2026-08-03 | full-sweep | ~80 | create | ruiyi | lifecycle/ + journeys/ + 9 INDEX.md + 46 leaf README + 18 content skeletons + 3 process |

### Operation type enumeration

- `create`: create a new file
- `update`: update content
- `triage`: move from inbox stream to triage
- `promote`: triage → active (summary written)
- `deprecate`: active → deprecated
- `archive`: deprecated → archive (physical archival)
- `delete`: physical delete
- `restructure`: architecture adjustment (move files, change leaves)
- `review`: scan only, no change

### Scope enumeration

- `inbox`: clean `inbox.md`
- `triage-queue`: scan `triage.md`
- `external-staleness`: scan external content past `last_verified`
- `archive-cleanup`: scan `archive/`
- `structure-audit`: hierarchy/link reachability
- `tacit-capture`: scan `tacit-knowledge-backlog.md` progress
- `full-sweep`: full library scan

## Action recommendations

1. Fill in the table immediately at the end of each review; do not backfill later
2. Pick the single most fitting operation type; for cross-type actions, use the primary operation
3. Files handled = actual changes/decisions; for scan-only, enter 0 + `review`
4. For the owner field in future multi-person collaboration, fill in the actual executor



- **Logging only create/update but not review** — consequence: scan history is lost, cannot tell which files were already scanned
- **Leaving the notes column empty** — consequence: future readers cannot tell the decision rationale at the time
- **Filling multiple rows for one review without aggregating** — consequence: fragmented log, difficult quarterly statistics

## Related

- Same class: [governance.md](./governance.md) (operations process diagram, defines cadence)
- Upstream: [README.md](../README.md) (Lifecycle view layer overview)
- SOP: [../../engineer/process/knowledge-review.md](../../engineer/process/knowledge-review.md)
