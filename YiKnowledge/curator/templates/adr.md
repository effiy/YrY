---
title: ADR Template — Architecture Decision Record
aliases: [adr-template, architecture-decision-template]
tags: [template, adr, architecture, decision, leader]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Leaders write consistent, traceable architecture decisions that engineers can reference during implementation"
acceptance_criteria:
  - "5 sections: Context, Decision, Alternatives Considered, Consequences, Status"
  - "every ADR captures tradeoffs, not just the chosen option"
  - "status field enforces lifecycle (proposed → accepted → deprecated → superseded)"
related:
  - ./README.md
  - ./knowledge-leaf.md
  - ./tech-design.md
  - ../../leader/decisions/
  - ../../leader/architecture/design-architecture-decision.md
---

# ADR Template — Architecture Decision Record

> **When to use:** For any architecturally significant decision — technology choice, pattern adoption, protocol change, or architectural constraint. An ADR captures *why* we chose A over B, with tradeoffs documented.

## Context

> What's the situation that calls for a decision? Describe the problem, constraints, and forces at play.

{{2-4 sentences. What are we building? What constraints exist (time, team, budget, technical)? What forces are pushing us toward a decision?}}

## Decision

> What did we decide? Be specific and unambiguous.

**We will {{describe the decision in one sentence}}.**

**Rationale:** {{1-2 sentences on why this is the right choice given the context.}}

## Alternatives Considered

> What other options did we evaluate, and why were they rejected?

| Alternative | Pros | Cons | Why rejected |
|---|---|---|---|
| {{Option A}} | {{Benefits}} | {{Drawbacks}} | {{Reason}} |
| {{Option B}} | {{Benefits}} | {{Drawbacks}} | {{Reason}} |
| {{Option C (chosen)}} | {{Benefits}} | {{Drawbacks}} | N/A — chosen |

## Consequences

> What becomes easier, harder, or different because of this decision?

### Positive

- {{What improves? What new capabilities do we gain?}}

### Negative (tradeoffs)

- {{What becomes harder? What do we give up?}}

### Neutral (things to watch)

- {{What could change? What assumptions are we making?}}

## Status

> One of: `proposed` | `accepted` | `deprecated` | `superseded`

**Status:** {{proposed}}

**Date:** {{YYYY-MM-DD}}

**Superseded by:** {{link to replacement ADR, if applicable}}

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| ADR without alternatives | No one can tell if the decision was thoughtful or just the first idea | Always list at least 2 alternatives with pros/cons |
| ADR as a blog post (no decision) | No actual decision is recorded; it's just context | The decision must be one specific, falsifiable sentence |
| Status never updated | Decisions look active but have been superseded for months | Update status when a decision is replaced or deprecated |
| No consequences section | Tradeoffs are invisible; future readers repeat the same mistakes | Be honest about what gets worse — every decision has tradeoffs |