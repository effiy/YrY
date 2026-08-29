---
title: "Native messaging host bridge (cancelled)"
aliases: [yipet-6, native-messaging-bridge]
tags: [requirement, task, native-messaging, cancelled]
category: projects/yipet/requires
created: 2026-08-22
updated: 2026-08-22
source: internal
type: original
status: stable
lifecycle: archive
roles: [engineer]
benefit: "Records the decision to cancel native messaging in favor of the simpler content-script fetch path"
acceptance_criteria:
  - "Decision rationale documented: content-script fetch is simpler and already works"
related:
  - ../../docs/architecture/网络请求.md
---

# Native messaging host bridge (cancelled)

| Field | Value |
|-------|-------|
| **Key** | `yipet-6` |
| **Type** | Task |
| **Status** | Cancelled |
| **Priority** | Low |
| **Assignee** | Chengliang Yi |
| **Points** | 3 |
| **Goal** | Engineering Excellence (`eng-001`) |

## Description

Bridge the extension to a native helper via Chrome native messaging. **Cancelled** — the content-script fetch path is simpler and already works.

## Context

This requirement belongs to the **YiPet** Chrome MV3 extension. YiPet injects an interactive pet companion into any page and consumes YiAi for chat and data.

### Goal Alignment

Contributes to **Engineering Excellence** (`eng-001`).

### Cancellation

The content-script fetch approach was validated as sufficient. Native messaging added complexity without proportional benefit.