---
title: Triage Queue and Process
aliases:
- triage-queue
- summary-pending
tags:
- lifecycle
- triage
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
- ./inbox.md
- ../archive/archive.md
- ../README.md
- ../../engineer/process/knowledge-review.md
tacit: false
---

# Triage Queue and Process

> **As a** knowledge curator, **I want to** triage, **so that** kb stays curated.

> Original texts that have been classified into the correct leaf but whose summary has not yet been written.

## Summary

- Sweep monthly to chase summaries; over 30 days `pending` evaluate for rejection
- Summary state transitions: `pending → drafting → reviewing → done`
- Upon completion, change to `lifecycle: active`; original text changes to `lifecycle: reference`
- Remove from this table upon completion

## Core viewpoints

- **Triage is the bridge between inbox and active** — classified but not yet summarized; operations should focus on chasing summaries rather than re-classifying
- **Overdue without summarization means rejection** — 30 days `pending` or 90 days `drafting` indicates the explanatory value does not justify investment; cut losses promptly

## Key information

### Queue

| filepath | Original source | Classification date | Owner | Summary state |
|---|---|---|---|---|
| _(empty)_ | | | | |

### Summary state enumeration

- `pending`: summary writing has not started
- `drafting`: summary is half-written
- `reviewing`: summary complete, pending review
- `done`: summary complete, frontmatter complete → switch to `lifecycle: active`

### Summarization SOP

Summarization process for each `triage` file:

1. Read the original text → extract core insights, key data, and action recommendations
2. Write into `*-summary.md` (in the same leaf directory); frontmatter must include `lifecycle: active` + `source` pointing to the original text
3. Change the original file to `lifecycle: reference` (preserving traceability)
4. Remove from this table

## Action recommendations

1. Monthly review: sweep this table and advance or decide to reject each `pending`/`drafting` entry
2. Over 30 days `pending`: evaluate whether to reject (set `status: declined` and move to `archive/`)
3. Over 90 days `drafting`: split into smaller units or switch to `active` accepting imperfection
4. Immediately change lifecycle and delete from this table once summary is complete



- **Triage queue only grows, never shrinks** — consequence: summarization signals are diluted, operations lose rhythm
- **Summary completed without changing lifecycle** — consequence: active content is still treated as triage by operations, wasting effort
- **Original text deleted, summary kept only** — consequence: traceability lost, future verification of summary accuracy becomes impossible

## Related

- Same category: [inbox.md](./inbox.md) (capture queue), [archive.md](../archive/archive.md) (archive index)
- Upstream: [README.md](../README.md) (lifecycle view overview)
- Downstream: [review-log.md](./review-log.md) (operation type `promote` registration)
- SOP: [../../engineer/process/knowledge-review.md](../../engineer/process/knowledge-review.md)
