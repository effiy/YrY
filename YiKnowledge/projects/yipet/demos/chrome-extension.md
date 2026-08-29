---
title: Demo project — Chrome Extension
aliases: [demo-chrome-extension, example-extension, demo-pext]
tags: [demo, chrome-extension, browser, mv3, project-management]
category: demos/projects
created: 2026-08-23
updated: 2026-08-23
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "A ready-to-instantiate example browser-extension project showing a compact single-cycle MVP shape"
acceptance_criteria:
  - "project profile includes name, identifier, status, and description"
  - "seed issues, cycles, and releases are described and machine-readable"
demo_identifier: PEXT
demo_category: Extension
demo_tagline: "A Manifest V3 browser extension with an AI sidebar."
related:
  - ../README.md
  - ../INDEX.md
  - ./demo-knowledge-base.md
  - ../../YiVad/src/api/modules/demoService.ts
---

# Demo Project — Chrome Extension

> **As a** producter/engineer, **I want to** start from a compact browser-extension example, **so that** I can see a focused single-cycle MVP.

## Overview

A Manifest V3 browser extension with content-script injection, an AI sidebar panel, an options page, and OAuth login. The smallest demo — a single active cycle — for a lean MVP shape.

## Project profile

| Field | Value |
|---|---|
| Identifier | `PEXT` |
| Name | Chrome Extension |
| Status | active |
| Domain | Extension |
| Description | A Manifest V3 browser extension with content-script injection, an AI sidebar, an options page, and OAuth login. |

## Members

| Username | Role |
|---|---|
| Admin | owner |

## Seed issues

| Title | Type | Status | Priority | Cycle | Release |
|---|---|---|---|---|---|
| Content script injection | feature | done | high | Extension MVP | v0.1.0 |
| AI sidebar panel | feature | in_progress | high | Extension MVP | v0.1.0 |
| Options page | task | todo | medium | Extension MVP | v0.1.0 |
| OAuth login | task | backlog | medium | — | — |

## Seed cycles

| Name | Status | Start | End | Goal |
|---|---|---|---|---|
| Extension MVP | active | 2026-08-20 | 2026-08-27 | Injection, sidebar, options |

## Seed releases

| Version | Name | Status | Target |
|---|---|---|---|
| v0.1.0 | Extension MVP | in_progress | 2026-08-27 |

## JSON seed block

```json
{
  "project": {
    "name": "Chrome Extension",
    "identifier": "PEXT",
    "status": "active",
    "description": "A Manifest V3 browser extension with content-script injection, an AI sidebar, an options page, and OAuth login."
  },
  "members": [
    { "user_id": "admin", "username": "Admin", "role": "owner" }
  ],
  "issues": [
    { "title": "Content script injection", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "AI sidebar panel", "issue_type": "feature", "status": "in_progress", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "Options page", "issue_type": "task", "status": "todo", "priority": "medium", "cycle": 0, "release": 0 },
    { "title": "OAuth login", "issue_type": "task", "status": "backlog", "priority": "medium" }
  ],
  "cycles": [
    { "name": "Extension MVP", "status": "active", "start_date": "2026-08-20", "end_date": "2026-08-27", "goal": "Injection, sidebar, options" }
  ],
  "releases": [
    { "version": "v0.1.0", "name": "Extension MVP", "status": "in_progress", "target_date": "2026-08-27" }
  ]
}
```

## Related

- [Demo system overview](../README.md)
- [Knowledge Base demo](./demo-knowledge-base.md)
- YiVad consumer: `YiVad/src/api/modules/demoService.ts`
