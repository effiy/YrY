---
aliases:
- Knowledge Deprecation Policy
title: Knowledge Deprecation Policy
tags:
- process
- knowledge base
- deprecation
- statestream transition
category: engineer/process
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./knowledge-review.md
- ../../knowledge-curator/archive/archive.md
- ../../executive/industry/README.md
tacit: false
---

# Knowledge Deprecation Policy

> **As an** engineer, **I want to** knowledge deprecation policy, **so that** process followed predictably. 

Deprecated state stream transition rule: `active → deprecated → archive`. 

## When to mark deprecated

Meets any one of: 

1. **superseded**: replaced by new version (replacement file stable for 30 days) 
2. **outdated**: `last_verified` over 1 year unverified, and cannot update
3. **duplicate**: duplicates another file (keep the more complete version) 
4. **out-of-scope**: exceeds YiKnowledge scope

## Marking method

```yaml
---
# existing fields...
status: deprecated
deprecation:
  reason: superseded | outdated | duplicate | out-of-scope
  date: YYYY-MM-DD
  replacement: <path/to/new-file.md>  # if applicable
  notes: <optional notes>
---
```

## Stream transition actions

### active → deprecated

1. File frontmatter add `status: deprecated` + `deprecation` block
2. Add to [lifecycle/archive.md](../../knowledge-curator/archive/archive.md) archive list
3. In the original leaf README's "included" section mark as `(deprecated)`
4. Fill in retrospective log [lifecycle/review-log.md](../../knowledge-curator/governance/review-log.md), operation type `deprecate`

### deprecated → archive (physical archive) 

Only when meets one of the [archive/README.md](../../executive/industry/README.md) physical archive principles: 

1. `superseded` and replacement file stable for 1 year
2. `out-of-scope` but has historical reference value
3. `outdated` but cannot update and still occasionally referenced

Operations: 
1. Move file to `archive/`, frontmatter `lifecycle: archive`
2. In [lifecycle/archive.md](../../knowledge-curator/archive/archive.md) table update physical location
3. In original leaf README remove entry (or keep link pointing to archive) 
4. Fill in retrospective log, operation type `archive`

### archive → delete (physical delete) 

- Only executed during yearly retrospective
- `superseded` replacement file stable for 1 year
- `out-of-scope` with no historical reference value
- Still referenced cannot be deleted

## Reverse: recover deprecated → active

If deprecated file re-verified accurate and still needs to be kept: 

1. Remove `status: deprecated` and `deprecation` block
2. In archive list mark `recovered: YYYY-MM-DD`
3. Update frontmatter `last_verified`
4. Fill in retrospective log, operation type `update`

## Relationship with lifecycle cadence fields

`status` and `lifecycle` are different dimensions: 

- `status`: content timeliness (`stable` / `deprecated`) 
- `lifecycle`: file stream transition state (`inbox` / `triage` / `active` / `reference` / `archive`) 

Deprecated file `lifecycle` can still be `active` (only content outdated) or `archive` (already physically archived) . 

## Maintenance cadence

- Monthly review: scan `last_verified` over half year external content → evaluate deprecated
- Yearly review: scan archive area to decide physical cleanup
