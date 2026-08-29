---
title: Demo project — Mobile App
aliases: [demo-mobile-app, example-mobile, demo-app]
tags: [demo, mobile, cross-platform, project-management, seed-data]
category: demos/projects
created: 2026-08-23
updated: 2026-08-23
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "A ready-to-instantiate example mobile app showing a single-cycle MVP with auth and offline sync"
acceptance_criteria:
  - "project profile includes name, identifier, status, and description"
  - "seed issues, cycles, and releases are described and machine-readable"
demo_identifier: APP
demo_category: Mobile
demo_tagline: "A cross-platform mobile app with auth, feed, and offline sync."
related:
  - ../README.md
  - ../INDEX.md
  - ./demo-ecommerce-platform.md
  - ../../YiVad/src/api/modules/demoService.ts
---

# Demo Project — Mobile App

> **As a** producter/engineer, **I want to** start from a mobile-app example, **so that** I can see a lean single-cycle MVP with auth and offline sync.

## Overview

A cross-platform mobile app with user authentication, an activity feed, offline sync, push notifications, and dark mode. A compact single-cycle MVP — the mobile counterpart to the Chrome Extension demo.

## Project profile

| Field | Value |
|---|---|
| Identifier | `APP` |
| Name | Mobile App |
| Status | active |
| Domain | Mobile |
| Description | A cross-platform mobile app with user authentication, activity feed, offline sync, push notifications, and dark mode. |

## Members

| Username | Role |
|---|---|
| Admin | owner |
| Eve Wang | member |

## Seed issues

| Title | Type | Status | Priority | Cycle | Release |
|---|---|---|---|---|---|
| User authentication | feature | done | high | MVP | v0.3.0 |
| Activity feed | feature | done | high | MVP | v0.3.0 |
| Offline sync | feature | in_progress | urgent | MVP | v0.3.0 |
| Push notifications | task | todo | medium | MVP | v0.3.0 |
| Dark mode | improvement | backlog | low | — | — |

## Seed cycles

| Name | Status | Start | End | Goal |
|---|---|---|---|---|
| MVP | active | 2026-08-19 | 2026-08-29 | Auth, feed, offline sync |

## Seed releases

| Version | Name | Status | Target |
|---|---|---|---|
| v0.3.0 | Mobile MVP | planned | 2026-08-29 |

## JSON seed block

```json
{
  "project": {
    "name": "Mobile App",
    "identifier": "APP",
    "status": "active",
    "description": "A cross-platform mobile app with user authentication, activity feed, offline sync, push notifications, and dark mode."
  },
  "members": [
    { "user_id": "admin", "username": "Admin", "role": "owner" },
    { "user_id": "eve", "username": "Eve Wang", "role": "member" }
  ],
  "issues": [
    { "title": "User authentication", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "Activity feed", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "Offline sync", "issue_type": "feature", "status": "in_progress", "priority": "urgent", "cycle": 0, "release": 0 },
    { "title": "Push notifications", "issue_type": "task", "status": "todo", "priority": "medium", "cycle": 0, "release": 0 },
    { "title": "Dark mode", "issue_type": "improvement", "status": "backlog", "priority": "low" }
  ],
  "cycles": [
    { "name": "MVP", "status": "active", "start_date": "2026-08-19", "end_date": "2026-08-29", "goal": "Auth, feed, offline sync" }
  ],
  "releases": [
    { "version": "v0.3.0", "name": "Mobile MVP", "status": "planned", "target_date": "2026-08-29" }
  ]
}
```

## Related

- [Demo system overview](../README.md)
- [E-Commerce Platform demo](./demo-ecommerce-platform.md)
- YiVad consumer: `YiVad/src/api/modules/demoService.ts`
