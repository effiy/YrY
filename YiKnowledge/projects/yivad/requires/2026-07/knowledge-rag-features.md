---
title: "Knowledge + RAG features"
aliases: [yivad-4, knowledge-rag-features]
tags: [requirement, feature, knowledge, rag, frontend, backend]
category: projects/yivad/requires
created: 2026-07-29
updated: 2026-07-31
source: internal
type: original
status: stable
lifecycle: archive
roles: [engineer, aier]
benefit: "Records the addition of knowledge and RAG API modules, Pinia stores, knowledge preview dialog, and Story Board"
acceptance_criteria:
  - "knowledgeService + ragService API modules added"
  - "Pinia stores for knowledge and RAG state"
  - "Knowledge preview dialog and Story Board surfaced in UI"
related:
  - ../../docs/architecture/架构设计.md
  - ../../docs/architecture/网络请求.md
---

# Knowledge + RAG features

| Field | Value |
|-------|-------|
| **Key** | `yivad-4` |
| **Type** | Feature |
| **Status** | Done |
| **Priority** | High |
| **Assignee** | Chengliang Yi |
| **Points** | 5 |
| **Cycle** | `yivad-c2` |
| **Release** | `yivad-r1` |
| **Goal** | AI Core Infrastructure (`aier-001`) |
| **Start** | 2026-07-29 |
| **Due** | 2026-07-31 |
| **Review** | Approved |

## Description

Add knowledgeService + ragService api modules and their Pinia stores; surface knowledge preview dialog and Story Board.

## Context

This requirement belongs to the **YiVad** frontend dashboard (Vue 3.5 + TypeScript). YiVad is the management UI consuming YiAi for chat, data, files, and knowledge features.

### Goal Alignment

Contributes to **AI Core Infrastructure** (`aier-001`).

### Delivery

- Assigned to cycle `yivad-c2`
- Targeted for release `yivad-r1`
- Review status: **approved**