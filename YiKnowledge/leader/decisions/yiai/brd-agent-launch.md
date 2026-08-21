---
title: "ADR: BRD Agent Launch Methodology"
tags: [adr, yiai, brd, agent, launch]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-03
source: internal
type: decision
status: accepted
lifecycle: in-progress
review_cycle: quarterly
roles: [leader, producter, engineer]
benefit: "Understand the 5-stage methodology for launching the BRD agent"
acceptance_criteria:
  - "5 stages are clearly defined with rationale"
related:
  - ../../../engineer/learn/projects/yiai/README.md
  - ../../../producter/projects/yiai/project-management.md
---

# ADR: BRD Agent Launch Methodology

> **Status**: Accepted (2026-08-03) — 5-stage launch in progress

## Context

The BRD (Business Requirements Document) agent is a multi-turn AI agent that generates BRD drafts for overseas after-sales business. Launching it requires careful staging to ensure quality and user trust.

## Decision

**5-stage launch methodology:**

1. **Structure contract first** — Define the BRD output schema (sections, fields, validation rules) before building generation logic. The contract is the source of truth.
2. **RAG > long prompt** — Ground BRD generation in YiKnowledge documents via RAG rather than stuffing everything into the system prompt. This keeps prompts manageable and content updatable.
3. **Streaming** — Stream BRD generation for perceived responsiveness. Users see sections appear in real-time.
4. **Editable stream back** — Allow users to edit generated sections and feed corrections back to the agent. Closed-loop improvement.
5. **Gradual rollout + feedback closed loop** — Start with internal users, collect feedback, iterate before wider release.

## Rationale

- Structure-first prevents the agent from generating unstructured or invalid BRDs
- RAG grounding ensures BRDs reference actual business knowledge, not hallucinated content
- Streaming + editable feedback creates a collaborative human-AI workflow

## Consequences

- BRD output schema must be versioned and backward-compatible
- RAG knowledge base must cover BRD-relevant domains
- Feedback collection mechanism needed for stage 5