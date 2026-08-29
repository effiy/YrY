---
title: Demo project — Data Platform
aliases: [demo-data-platform, example-data, demo-data]
tags: [demo, data, analytics, streaming, project-management]
category: demos/projects
created: 2026-08-23
updated: 2026-08-23
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "A ready-to-instantiate example data platform showing a two-cycle ingestion → dashboard shape"
acceptance_criteria:
  - "project profile includes name, identifier, status, and description"
  - "seed issues, cycles, and releases are described and machine-readable"
demo_identifier: DATA
demo_category: Data
demo_tagline: "A batch + streaming analytics platform with dashboards."
related:
  - ../README.md
  - ../INDEX.md
  - ./demo-ecommerce-platform.md
  - ../../YiVad/src/api/modules/demoService.ts
---

# Demo Project — Data Platform

> **As a** producter/engineer, **I want to** start from a data-platform example, **so that** I can see a two-cycle ingestion → dashboard pipeline.

## Overview

A batch and streaming analytics platform with ingestion, dashboards, data-quality checks, and a metadata catalog. The two-cycle demo — the richest data-engineering shape in the catalog.

## Project profile

| Field | Value |
|---|---|
| Identifier | `DATA` |
| Name | Data Platform |
| Status | active |
| Domain | Data |
| Description | A batch and streaming analytics platform with ingestion, dashboards, data-quality checks, and a metadata catalog. |

## Members

| Username | Role |
|---|---|
| Admin | owner |
| Frank Zhou | member |

## Seed issues

| Title | Type | Status | Priority | Cycle | Release |
|---|---|---|---|---|---|
| Data ingestion (batch) | feature | done | high | Ingestion | v0.4.0 |
| Streaming pipeline | feature | in_progress | urgent | Streaming & Dashboards | v0.4.0 |
| Analytics dashboards | feature | todo | high | Streaming & Dashboards | v0.4.0 |
| Data quality checks | task | todo | medium | Streaming & Dashboards | — |
| Metadata catalog | requirement | backlog | low | — | — |

## Seed cycles

| Name | Status | Start | End | Goal |
|---|---|---|---|---|
| Ingestion | completed | 2026-08-05 | 2026-08-18 | Batch + streaming ingestion |
| Streaming & Dashboards | active | 2026-08-19 | 2026-09-02 | Dashboards + quality checks |

## Seed releases

| Version | Name | Status | Target |
|---|---|---|---|
| v0.4.0 | Analytics beta | in_progress | 2026-09-02 |

## JSON seed block

```json
{
  "project": {
    "name": "Data Platform",
    "identifier": "DATA",
    "status": "active",
    "description": "A batch and streaming analytics platform with ingestion, dashboards, data-quality checks, and a metadata catalog."
  },
  "members": [
    { "user_id": "admin", "username": "Admin", "role": "owner" },
    { "user_id": "frank", "username": "Frank Zhou", "role": "member" }
  ],
  "issues": [
    { "title": "Data ingestion (batch)", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "Streaming pipeline", "issue_type": "feature", "status": "in_progress", "priority": "urgent", "cycle": 1, "release": 0 },
    { "title": "Analytics dashboards", "issue_type": "feature", "status": "todo", "priority": "high", "cycle": 1, "release": 0 },
    { "title": "Data quality checks", "issue_type": "task", "status": "todo", "priority": "medium", "cycle": 1 },
    { "title": "Metadata catalog", "issue_type": "requirement", "status": "backlog", "priority": "low" }
  ],
  "cycles": [
    { "name": "Ingestion", "status": "completed", "start_date": "2026-08-05", "end_date": "2026-08-18", "goal": "Batch + streaming ingestion" },
    { "name": "Streaming & Dashboards", "status": "active", "start_date": "2026-08-19", "end_date": "2026-09-02", "goal": "Dashboards + quality checks" }
  ],
  "releases": [
    { "version": "v0.4.0", "name": "Analytics beta", "status": "in_progress", "target_date": "2026-09-02" }
  ]
}
```

## Related

- [Demo system overview](../README.md)
- [E-Commerce Platform demo](./demo-ecommerce-platform.md)
- YiVad consumer: `YiVad/src/api/modules/demoService.ts`
