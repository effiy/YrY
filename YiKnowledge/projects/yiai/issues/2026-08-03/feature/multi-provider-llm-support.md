---
title: Multi-Provider LLM support
tags: [feature, backend]
category: issues/feature
created: 2026-08-03
updated: 2026-08-03
source: internal
type: issue
status: todo
priority: medium
issue_type: feature
project: YiAi
project_key: yiai
assignee: Chengliang Yi
estimate_points: 8
start_date: 2026-08-03
due_date: 2026-09-30
cycle_key: yiai-c1
goal_id: aier-001
goal: AI Core Infrastructure
---
# Multi-Provider LLM support

| Field | Value |
|-------|-------|
| **Key** | `yiai-2` |
| **Project** | YiAi |
| **Type** | Feature |
| **Status** | To Do |
| **Priority** | 🟡 Medium |
| **Assignee** | Chengliang Yi |
| **Points** | 8 |
| **Source** | internal |
| **Start** | 2026-08-03 |
| **Due** | 2026-09-30 |
| **Review** | - |
| **Cycle** | `yiai-c1` |
| **Release** | - |
| **Goal** | AI Core Infrastructure (`aier-001`) |
| **Labels** | `feature`, `backend` |
| **Created** | 2026-08-03 |
| **Updated** | 2026-08-03 |

## Description

Abstract the model runtime beyond Ollama so other providers can be plugged in behind the same chat interface.

## Context

This issue belongs to the **YiAi** backend (FastAPI + MongoDB). YiAi is the single source of truth for all data, serving both YiVad and YiPet via the RPC envelope.

### Goal Alignment
This issue contributes to **AI Core Infrastructure** (`aier-001`).

### Delivery Tracking
- Assigned to cycle `yiai-c1`
