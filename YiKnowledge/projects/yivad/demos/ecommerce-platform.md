---
title: Demo project — E-Commerce Platform
aliases: [demo-ecommerce, example-storefront, demo-shop]
tags: [demo, ecommerce, web, project-management, seed-data]
category: demos/projects
created: 2026-08-23
updated: 2026-08-23
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "A ready-to-instantiate example storefront project that shows the full project-management flow"
acceptance_criteria:
  - "project profile includes name, identifier, status, and description"
  - "seed issues, cycles, and releases are described and machine-readable"
demo_identifier: SHOP
demo_category: Web
demo_tagline: "A complete online storefront with cart, checkout, and inventory."
related:
  - ../README.md
  - ../INDEX.md
  - ./demo-knowledge-base.md
  - ../../YiVad/src/api/modules/demoService.ts
---

# Demo Project — E-Commerce Platform

> **As a** producter/engineer, **I want to** start from a realistic storefront example, **so that** I can see the full flow — requirements, features, tasks, cycles, releases — populated end to end.

## Overview

A complete online storefront: catalog browsing, cart, checkout, order management, and inventory. The richest demo in the catalog — two cycles and a mixed-issue backlog make it the best first example for Project Management.

## Project profile

| Field | Value |
|---|---|
| Identifier | `SHOP` |
| Name | E-Commerce Platform |
| Status | active |
| Domain | Web |
| Description | A complete online storefront with product catalog, cart, checkout, order management, and inventory tracking. |

## Members

| Username | Role |
|---|---|
| Admin | owner |
| Alice Chen | admin |
| Bob Wu | member |

## Seed issues

| Title | Type | Status | Priority | Cycle | Release |
|---|---|---|---|---|---|
| Product catalog & search | requirement | done | high | MVP | v0.1.0 |
| Shopping cart | feature | done | high | MVP | v0.1.0 |
| Checkout & payments | feature | in_progress | urgent | Checkout & Fulfillment | v0.1.0 |
| Order management | task | todo | high | Checkout & Fulfillment | v0.1.0 |
| Inventory tracking | task | todo | medium | Checkout & Fulfillment | — |
| Customer accounts | requirement | backlog | low | — | — |

## Seed cycles

| Name | Status | Start | End | Goal |
|---|---|---|---|---|
| MVP | completed | 2026-08-01 | 2026-08-14 | Launch catalog, cart, checkout |
| Checkout & Fulfillment | active | 2026-08-15 | 2026-08-28 | Orders + inventory |

## Seed releases

| Version | Name | Status | Target |
|---|---|---|---|
| v0.1.0 | Initial storefront | in_progress | 2026-08-28 |

## JSON seed block

```json
{
  "project": {
    "name": "E-Commerce Platform",
    "identifier": "SHOP",
    "status": "active",
    "description": "A complete online storefront with product catalog, cart, checkout, order management, and inventory tracking."
  },
  "members": [
    { "user_id": "admin", "username": "Admin", "role": "owner" },
    { "user_id": "alice", "username": "Alice Chen", "role": "admin" },
    { "user_id": "bob", "username": "Bob Wu", "role": "member" }
  ],
  "issues": [
    { "title": "Product catalog & search", "issue_type": "requirement", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "Shopping cart", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "Checkout & payments", "issue_type": "feature", "status": "in_progress", "priority": "urgent", "cycle": 1, "release": 0 },
    { "title": "Order management", "issue_type": "task", "status": "todo", "priority": "high", "cycle": 1, "release": 0 },
    { "title": "Inventory tracking", "issue_type": "task", "status": "todo", "priority": "medium", "cycle": 1 },
    { "title": "Customer accounts", "issue_type": "requirement", "status": "backlog", "priority": "low" }
  ],
  "cycles": [
    { "name": "MVP", "status": "completed", "start_date": "2026-08-01", "end_date": "2026-08-14", "goal": "Launch catalog, cart, checkout" },
    { "name": "Checkout & Fulfillment", "status": "active", "start_date": "2026-08-15", "end_date": "2026-08-28", "goal": "Orders + inventory" }
  ],
  "releases": [
    { "version": "v0.1.0", "name": "Initial storefront", "status": "in_progress", "target_date": "2026-08-28" }
  ]
}
```

## Related

- [Demo system overview](../README.md)
- [Knowledge Base demo](./demo-knowledge-base.md)
- YiVad consumer: `YiVad/src/api/modules/demoService.ts`
