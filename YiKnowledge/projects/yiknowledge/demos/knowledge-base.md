---
title: Demo project — Knowledge Base
aliases: [demo-knowledge-base, example-kb, demo-kbase]
tags: [demo, knowledge-base, ai, rag, project-management]
category: demos/projects
created: 2026-08-23
updated: 2026-08-23
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "A ready-to-instantiate example knowledge-base project demonstrating an AI/RAG-oriented backlog"
acceptance_criteria:
  - "project profile includes name, identifier, status, and description"
  - "seed issues, cycles, and releases are described and machine-readable"
demo_identifier: KBASE
demo_category: AI
demo_tagline: "A markdown knowledge base with full-text search and RAG."
related:
  - ../README.md
  - ../INDEX.md
  - ./demo-ecommerce-platform.md
  - ../../YiVad/src/api/modules/demoService.ts
---

# Demo Project — Knowledge Base

> **As a** producter/engineer, **I want to** start from a knowledge-management example, **so that** I can see an AI/RAG-flavored backlog and cadence.

## Overview

A markdown knowledge base with a rich editor, full-text search, and a RAG retrieval pipeline. Models an AI/data product where the core feature is retrieval, not CRUD.

## Project profile

| Field | Value |
|---|---|
| Identifier | `KBASE` |
| Name | Knowledge Base |
| Status | active |
| Domain | AI |
| Description | A markdown knowledge base with full-text search, RAG retrieval, access control, and version history. |

## Members

| Username | Role |
|---|---|
| Admin | owner |
| Dana Liu | member |

## Seed issues

| Title | Type | Status | Priority | Cycle | Release |
|---|---|---|---|---|---|
| Markdown editor | feature | done | high | Core features | v0.2.0 |
| Full-text search | feature | done | high | Core features | v0.2.0 |
| RAG retrieval pipeline | feature | in_progress | urgent | Core features | v0.2.0 |
| Access control | task | todo | medium | Core features | v0.2.0 |
| Version history | improvement | backlog | low | — | — |

## Seed cycles

| Name | Status | Start | End | Goal |
|---|---|---|---|---|
| Core features | active | 2026-08-18 | 2026-09-04 | Editor, search, RAG, access control |

## Seed releases

| Version | Name | Status | Target |
|---|---|---|---|
| v0.2.0 | RAG beta | planned | 2026-09-04 |

## JSON seed block

```json
{
  "project": {
    "name": "Knowledge Base",
    "identifier": "KBASE",
    "status": "active",
    "description": "A markdown knowledge base with full-text search, RAG retrieval, access control, and version history."
  },
  "members": [
    { "user_id": "admin", "username": "Admin", "role": "owner" },
    { "user_id": "dana", "username": "Dana Liu", "role": "member" }
  ],
  "issues": [
    { "title": "Markdown editor", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "Full-text search", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "RAG retrieval pipeline", "issue_type": "feature", "status": "in_progress", "priority": "urgent", "cycle": 0, "release": 0 },
    { "title": "Access control", "issue_type": "task", "status": "todo", "priority": "medium", "cycle": 0, "release": 0 },
    { "title": "Version history", "issue_type": "improvement", "status": "backlog", "priority": "low" }
  ],
  "cycles": [
    { "name": "Core features", "status": "active", "start_date": "2026-08-18", "end_date": "2026-09-04", "goal": "Editor, search, RAG, access control" }
  ],
  "releases": [
    { "version": "v0.2.0", "name": "RAG beta", "status": "planned", "target_date": "2026-09-04" }
  ]
}
```

## Related

- [Demo system overview](../README.md)
- [E-Commerce Platform demo](./demo-ecommerce-platform.md)
- YiVad consumer: `YiVad/src/api/modules/demoService.ts`
