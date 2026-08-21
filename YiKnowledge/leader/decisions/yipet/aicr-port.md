---
title: "ADR: YiPet AiCR Port Decision"
tags: [adr, yipet, aicr, port, cross-project]
category: leader/decisions/yipet
created: 2026-08-21
updated: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the decision to integrate AiCR functionality into YiPet's chat"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ../../yivad/aicr-phase-port.md
---

# ADR: YiPet AiCR Port Decision

> **Status**: Accepted (2026-07-27) — AiCR functionality integrated into chat window

## Context

YiWeb had a standalone AiCR (AI Code Review) page. During the port to YiPet, the decision was whether to build a separate AiCR view or integrate AiCR functionality into the existing chat window.

## Decision

**Integrate AiCR functionality into YiPet's chat window rather than building a separate AiCR view.**

The chat window already supports multi-role AI chat with SSE streaming, per-message actions, and session persistence. AiCR is a specialized chat mode — the infrastructure is the same.

## Rationale

- Chat window already has the infrastructure (streaming, sessions, message actions)
- Separate AiCR view would duplicate chat infrastructure
- YiPet's floating chat window is better suited for inline code review than a separate page
- Cross-project consistency: YiVad made the same decision (AiCR subsumed into aiChat)

## Consequences

- Code review happens in the chat window with specialized prompts
- No separate AiCR route, store, or component tree
- Cross-project bridge to YiVad aiChat for deeper code review sessions