---
title: Knowledge Curator — Archive
tags: [leaf, curator, archive, deprecated, legacy]
category: curator/archive
created: 2026-08-06
updated: 2026-08-10
last_verified: 2026-08-10
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: yearly
roles: [curator]
benefit: "Knowledge curators find archived and deprecated content"
acceptance_criteria:
  - "Archive index accessible"
  - "Deprecation policy linked"
related:
  - ../INDEX.md
  - ../governance/governance.md
  - ../../engineer/run/knowledge-deprecation-policy.md
---

# Knowledge Curator — Archive

> **As a** knowledge curator, **I want to** find archived and deprecated content, **so that** I can reference historical material without cluttering active directories.

## Archive contents

| File | Description |
|---|---|
| [archive.md](./archive.md) | Archive index — registry of deprecated files |

## When to archive

1. File is superseded by a newer version
2. File has been unverified for 6+ months (`status: deprecated`)
3. Content is no longer relevant to active projects
4. Move file here, then update [archive.md](./archive.md) with the deprecation record

## Cross-references

- [../governance/governance.md](../governance/governance.md) — Governance flow and lifecycle rules
- [../../engineer/run/knowledge-deprecation-policy.md](../../engineer/run/knowledge-deprecation-policy.md) — Deprecation policy