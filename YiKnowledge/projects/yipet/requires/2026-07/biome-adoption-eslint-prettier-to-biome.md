---
title: "Biome adoption — ESLint+Prettier→Biome"
aliases: [yipet-2, biome-adoption]
tags: [requirement, tooling, linting, biome]
category: projects/yipet/requires
created: 2026-07-28
updated: 2026-07-28
source: internal
type: original
status: stable
lifecycle: archive
roles: [engineer]
benefit: "Records the consolidation of lint+format tooling into Biome, replacing the ESLint+Prettier pair"
acceptance_criteria:
  - "Biome replaces ESLint + Prettier for both linting and formatting"
  - "All existing rules migrated or intentionally dropped"
related:
  - ../../docs/conventions/项目规范.md
---

# Biome adoption — ESLint+Prettier→Biome

| Field | Value |
|-------|-------|
| **Key** | `yipet-2` |
| **Type** | Improvement |
| **Status** | Done |
| **Priority** | Medium |
| **Assignee** | Chengliang Yi |
| **Points** | 2 |
| **Cycle** | `yipet-c1` |
| **Release** | `yipet-r1` |
| **Goal** | Engineering Excellence (`eng-001`) |
| **Start** | 2026-07-28 |
| **Due** | 2026-07-28 |
| **Review** | Approved |

## Description

Consolidate lint + format into Biome to replace the ESLint + Prettier pair.

## Context

This requirement belongs to the **YiPet** Chrome MV3 extension. YiPet injects an interactive pet companion into any page and consumes YiAi for chat and data.

### Goal Alignment

Contributes to **Engineering Excellence** (`eng-001`).

### Delivery

- Assigned to cycle `yipet-c1`
- Targeted for release `yipet-r1`
- Review status: **approved**