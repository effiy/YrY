---
title: "Agent mode (pi Loop)"
aliases: [yivad-5, agent-mode-pi-loop]
tags: [requirement, feature, agent, ai, frontend]
category: projects/yivad/requires
created: 2026-08-05
updated: 2026-08-08
source: internal
type: original
status: stable
lifecycle: archive
roles: [engineer, aier]
benefit: "Records the agent loop implementation: tool confirmation UI, live tool lifecycle, model-switch, turn-budget, resume-by-session"
acceptance_criteria:
  - "Tool confirmation UI with live tool lifecycle display"
  - "Model-switch surfacing in chat"
  - "Turn-budget indicator visible"
  - "Resume-by-session works for interrupted agent runs"
related:
  - ../../docs/architecture/架构设计.md
  - ../../docs/core-code/核心代码.md
---

# Agent mode (pi Loop)

| Field | Value |
|-------|-------|
| **Key** | `yivad-5` |
| **Type** | Feature |
| **Status** | Done |
| **Priority** | High |
| **Assignee** | Chengliang Yi |
| **Points** | 8 |
| **Cycle** | `yivad-c2` |
| **Release** | `yivad-r1` |
| **Goal** | Agent Autonomy (`aier-002`) |
| **Start** | 2026-08-05 |
| **Due** | 2026-08-08 |
| **Review** | Approved |

## Description

Wire the aiChat agent loop: tool confirmation UI, live tool lifecycle, model-switch surfacing, turn-budget indicator, resume-by-session.

## Context

This requirement belongs to the **YiVad** frontend dashboard (Vue 3.5 + TypeScript). YiVad is the management UI consuming YiAi for chat, data, files, and knowledge features.

### Goal Alignment

Contributes to **Agent Autonomy** (`aier-002`).

### Delivery

- Assigned to cycle `yivad-c2`
- Targeted for release `yivad-r1`
- Review status: **approved**