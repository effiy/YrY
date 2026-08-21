---
title: "ADR: YiVad AiCR Phase Port from YiWeb"
tags: [adr, yivad, aicr, port, migration]
category: leader/decisions/yivad
created: 2026-08-21
updated: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the decision to phase-port AiCR from YiWeb into YiVad"
related:
  - ../../../engineer/learn/projects/yivad/README.md
---

# ADR: YiVad AiCR Phase Port from YiWeb

> **Status**: Accepted (2026-07-27) — aiChat ported; AiCR functionality subsumed into aiChat components

## Context

YiWeb had a standalone AiCR (AI Code Review) page with 9 Pinia stores, 8 modal components, and full CodeViewer/ChatPanel parity. The decision was whether to port AiCR as a separate page tree or subsume its functionality into the existing aiChat components.

## Decision

**Phase-port AiCR from YiWeb, starting with the core aiChat page, then subsuming AiCR-specific functionality into aiChat components rather than a separate page tree.**

The aiChat port (2026-07-27) brought over the sessionChat page with per-message actions, streaming, and abort handling. AiCR-specific functionality (code review, analysis views) was integrated into aiChat components rather than creating a separate `src/views/aicr/` tree.

## Outcome (audited 2026-08-04)

- `src/views/aicr/` and `src/stores/modules/aicr/` do NOT exist on master
- AiCR-style functionality has been subsumed into aiChat components
- Code review views live under `src/views/code-review/` with specific sub-pages (i18n-a11y, error-handling, explain, security, dead-code, observability-gap, tests, bugs, style, access-review)

## Rationale

- Avoiding a separate page tree reduces route/component duplication
- aiChat already provides the chat infrastructure that AiCR needs
- Code review is a specialized chat mode, not a separate application