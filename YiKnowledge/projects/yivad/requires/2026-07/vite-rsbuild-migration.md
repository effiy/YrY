---
title: "Vite → Rsbuild migration"
aliases: [yivad-2, vite-rsbuild-migration]
tags: [requirement, feature, build, frontend]
category: projects/yivad/requires
created: 2026-07-27
updated: 2026-07-28
source: internal
type: original
status: stable
lifecycle: archive
roles: [engineer]
benefit: "Records the build system migration from Vite 8 to Rsbuild 1 with env prefix change and plugin replacements"
acceptance_criteria:
  - "Build migrated from Vite 8 to Rsbuild 1"
  - "Env prefix changed to RSBUILD_ENV_*"
  - "svg-sprite and views-glob plugins replicate dropped Vite features"
related:
  - ../../docs/dependencies/构建依赖.md
  - ../../docs/deployment/构建部署.md
---

# Vite → Rsbuild migration

| Field | Value |
|-------|-------|
| **Key** | `yivad-2` |
| **Type** | Feature |
| **Status** | Done |
| **Priority** | Medium |
| **Assignee** | Chengliang Yi |
| **Points** | 3 |
| **Cycle** | `yivad-c2` |
| **Release** | `yivad-r1` |
| **Goal** | Engineering Excellence (`eng-001`) |
| **Start** | 2026-07-27 |
| **Due** | 2026-07-28 |
| **Review** | Approved |

## Description

Migrate the build from Vite 8 to Rsbuild 1. Env prefix becomes `RSBUILD_ENV_*`. Replicate dropped Vite features with svg-sprite + views-glob plugins.

## Context

This requirement belongs to the **YiVad** frontend dashboard (Vue 3.5 + TypeScript). YiVad is the management UI consuming YiAi for chat, data, files, and knowledge features.

### Goal Alignment

Contributes to **Engineering Excellence** (`eng-001`).

### Delivery

- Assigned to cycle `yivad-c2`
- Targeted for release `yivad-r1`
- Review status: **approved**