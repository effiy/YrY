---
title: Demo project — SRE Operations
aliases: [demo-sre, example-operations, demo-ops, demo-reliability]
tags: [demo, sre, operations, observability, project-management, seed-data]
category: demos/projects
created: 2026-08-23
updated: 2026-08-23
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "A ready-to-instantiate reliability-engineering project: observability, on-call, SLOs, and incident response"
acceptance_criteria:
  - "project profile includes name, identifier, status, and description"
  - "seed issues, cycles, and releases are described and machine-readable"
demo_identifier: OPS
demo_category: SRE
demo_tagline: "Observability, SLOs, and on-call for a reliable service."
related:
  - ../README.md
  - ../INDEX.md
  - ./demo-data-platform.md
  - ../../YiVad/src/api/modules/demoService.ts
---

# Demo Project — SRE Operations

> **As a** srer/engineer, **I want to** start from a realistic reliability-engineering backlog, **so that** I can see how observability, on-call, SLO, and incident-response work tracks across cycles and releases.

## Overview

A service-reliability program: golden-signal dashboards, on-call rotation, SLO definitions, incident runbooks, and postmortem automation. Two cycles model the move from initial observability to a full reliability-engineering practice.

## Project profile

| Field | Value |
|---|---|
| Identifier | `OPS` |
| Name | SRE Operations |
| Status | active |
| Domain | SRE |
| Description | A service-reliability program covering observability, on-call rotation, SLOs, incident response runbooks, and postmortem automation. |

## Members

| Username | Role |
|---|---|
| Admin | owner |
| Grace Lin | member |

## Seed issues

| Title | Type | Status | Priority | Cycle | Release |
|---|---|---|---|---|---|
| Golden signals dashboards | feature | done | high | Observability MVP | v0.1.0 |
| On-call rotation & paging | feature | done | high | Observability MVP | v0.1.0 |
| SLO definitions & alerting | requirement | in_progress | urgent | Reliability Engineering | v0.1.0 |
| Incident response runbooks | task | todo | high | Reliability Engineering | v0.1.0 |
| Postmortem automation | task | backlog | medium | — | — |

## Seed cycles

| Name | Status | Start | End | Goal |
|---|---|---|---|---|
| Observability MVP | completed | 2026-08-01 | 2026-08-14 | Golden signals + on-call |
| Reliability Engineering | active | 2026-08-15 | 2026-08-28 | SLOs + runbooks |

## Seed releases

| Version | Name | Status | Target |
|---|---|---|---|
| v0.1.0 | Observability baseline | in_progress | 2026-08-28 |

## JSON seed block

```json
{
  "project": {
    "name": "SRE Operations",
    "identifier": "OPS",
    "status": "active",
    "description": "A service-reliability program covering observability, on-call rotation, SLOs, incident response runbooks, and postmortem automation."
  },
  "members": [
    { "user_id": "admin", "username": "Admin", "role": "owner" },
    { "user_id": "grace", "username": "Grace Lin", "role": "member" }
  ],
  "issues": [
    { "title": "Golden signals dashboards", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "On-call rotation & paging", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "SLO definitions & alerting", "issue_type": "requirement", "status": "in_progress", "priority": "urgent", "cycle": 1, "release": 0 },
    { "title": "Incident response runbooks", "issue_type": "task", "status": "todo", "priority": "high", "cycle": 1, "release": 0 },
    { "title": "Postmortem automation", "issue_type": "task", "status": "backlog", "priority": "medium" }
  ],
  "cycles": [
    { "name": "Observability MVP", "status": "completed", "start_date": "2026-08-01", "end_date": "2026-08-14", "goal": "Golden signals + on-call" },
    { "name": "Reliability Engineering", "status": "active", "start_date": "2026-08-15", "end_date": "2026-08-28", "goal": "SLOs + runbooks" }
  ],
  "releases": [
    { "version": "v0.1.0", "name": "Observability baseline", "status": "in_progress", "target_date": "2026-08-28" }
  ]
}
```

## Related

- [Demo system overview](../README.md)
- [Data Platform demo](./demo-data-platform.md)
- YiVad consumer: `YiVad/src/api/modules/demoService.ts`
