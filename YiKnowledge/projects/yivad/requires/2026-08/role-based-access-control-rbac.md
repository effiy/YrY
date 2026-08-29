---
title: "Role-based access control (RBAC)"
aliases: [yivad-9, rbac, role-based-access-control]
tags: [requirement, security, compliance, permissions]
category: projects/yivad/requires
created: 2026-08-22
updated: 2026-08-22
source: compliance
type: original
status: stable
lifecycle: active
roles: [engineer, srer]
benefit: "Defines fine-grained button/route permissions mapped to roles, auditable per user — compliance requirement for external onboarding"
acceptance_criteria:
  - "Button-level permissions enforceable per role"
  - "Route-level permissions enforceable per role"
  - "Permission changes are auditable per user"
  - "Passes compliance review for external onboarding"
related:
  - ../../docs/architecture/权限管理.md
  - ../../docs/architecture/路由菜单.md
---

# Role-based access control (RBAC)

| Field | Value |
|-------|-------|
| **Key** | `yivad-9` |
| **Type** | Requirement |
| **Status** | In Progress |
| **Priority** | High |
| **Assignee** | Chengliang Yi |
| **Points** | 8 |
| **Source** | Compliance |
| **Review** | In Review |
| **Goal** | Compliance & Security Baseline (`exec-002`) |

## Description

Fine-grained button/route permissions mapped to roles, auditable per user. Compliance requirement before external onboarding.

## Context

This requirement belongs to the **YiVad** frontend dashboard (Vue 3.5 + TypeScript). YiVad is the management UI consuming YiAi for chat, data, files, and knowledge features.

### Goal Alignment

Contributes to **Compliance & Security Baseline** (`exec-002`).