---
title: Pytest coverage
tags: [improvement, backend]
category: issues/improvement
created: 2026-08-21
updated: 2026-08-21
source: internal
type: issue
status: in_progress
priority: medium
issue_type: improvement
project: YiAi
project_key: yiai
assignee: Chengliang Yi
estimate_points: 5
start_date: 2026-08-21
due_date: 2026-09-15
cycle_key: yiai-c1
goal_id: sre-001
goal: Reliability & Quality
---
# Pytest coverage

| Field | Value |
|-------|-------|
| **Key** | `yiai-3` |
| **Project** | YiAi |
| **Type** | Improvement |
| **Status** | In Progress |
| **Priority** | 🟡 Medium |
| **Assignee** | Chengliang Yi |
| **Points** | 5 |
| **Source** | internal |
| **Start** | 2026-08-21 |
| **Due** | 2026-09-15 |
| **Review** | - |
| **Cycle** | `yiai-c1` |
| **Release** | - |
| **Goal** | Reliability & Quality (`sre-001`) |
| **Labels** | `improvement`, `backend` |
| **Created** | 2026-08-21 |
| **Updated** | 2026-08-21 |

## Description

Expand pytest coverage across shared/, data/, and domain modules. 76 tests landed 2026-08-21; shared/ is near 100%.

## Context

This issue belongs to the **YiAi** backend (FastAPI + MongoDB). YiAi is the single source of truth for all data, serving both YiVad and YiPet via the RPC envelope.

### Goal Alignment
This issue contributes to **Reliability & Quality** (`sre-001`).

### Delivery Tracking
- Assigned to cycle `yiai-c1`
