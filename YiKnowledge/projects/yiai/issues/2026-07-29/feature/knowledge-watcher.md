---
title: Knowledge watcher
tags: [feature, backend]
category: issues/feature
created: 2026-07-29
updated: 2026-07-31
source: internal
type: issue
status: done
priority: medium
issue_type: feature
project: YiAi
project_key: yiai
assignee: Chengliang Yi
estimate_points: 3
start_date: 2026-07-29
due_date: 2026-07-31
review_status: approved
cycle_key: yiai-c2
release_key: yiai-r1
goal_id: cur-001
goal: Knowledge Curation
---
# Knowledge watcher

| Field | Value |
|-------|-------|
| **Key** | `yiai-5` |
| **Project** | YiAi |
| **Type** | Feature |
| **Status** | Done |
| **Priority** | 🟡 Medium |
| **Assignee** | Chengliang Yi |
| **Points** | 3 |
| **Source** | internal |
| **Start** | 2026-07-29 |
| **Due** | 2026-07-31 |
| **Review** | approved |
| **Cycle** | `yiai-c2` |
| **Release** | `yiai-r1` |
| **Goal** | Knowledge Curation (`cur-001`) |
| **Labels** | `feature`, `backend` |
| **Created** | 2026-07-29 |
| **Updated** | 2026-07-31 |

## Description

apscheduler poll loop that scans the YiKnowledge markdown tree into MongoDB + vector index (macOS FSEvents fallback).

## Context

This issue belongs to the **YiAi** backend (FastAPI + MongoDB). YiAi is the single source of truth for all data, serving both YiVad and YiPet via the RPC envelope.

### Goal Alignment
This issue contributes to **Knowledge Curation** (`cur-001`).

### Delivery Tracking
- Assigned to cycle `yiai-c2`
- Targeted for release `yiai-r1`

### Completion
- Review status: **approved**
