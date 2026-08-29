---
title: "CSP + data-privacy compliance"
aliases: [yipet-7, csp-compliance, privacy-manifest]
tags: [requirement, security, compliance, csp, privacy]
category: projects/yipet/requires
created: 2026-08-22
updated: 2026-08-22
source: compliance
type: original
status: stable
lifecycle: active
roles: [engineer, srer]
benefit: "Defines Content Security Policy hardening and privacy manifest requirements for Chrome Web Store review"
acceptance_criteria:
  - "Content Security Policy hardened per Chrome Web Store requirements"
  - "Privacy manifest completed and accurate"
  - "Passes Chrome Web Store review"
related:
  - ../../docs/architecture/权限管理.md
---

# CSP + data-privacy compliance

| Field | Value |
|-------|-------|
| **Key** | `yipet-7` |
| **Type** | Requirement |
| **Status** | To Do |
| **Priority** | Medium |
| **Assignee** | Chengliang Yi |
| **Points** | 5 |
| **Source** | Compliance |
| **Goal** | Compliance & Security Baseline (`exec-002`) |

## Description

Content Security Policy hardening and privacy manifest for the Chrome Web Store review.

## Context

This requirement belongs to the **YiPet** Chrome MV3 extension. YiPet injects an interactive pet companion into any page and consumes YiAi for chat and data.

### Goal Alignment

Contributes to **Compliance & Security Baseline** (`exec-002`).