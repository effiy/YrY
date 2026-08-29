---
title: Architecture Decision Record — Template
tags: [template, adr, architecture, decision, leader]
category: leader/architecture
created: 2026-08-21
updated: 2026-08-21
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: yearly
roles: [leader, engineer]
benefit: "Tech leads and engineers use this template to write consistent, searchable Architecture Decision Records"
acceptance_criteria:
  - "12 sections covering context, decision, consequences, and metadata"
  - "Each section has a concrete example"
  - "Frontmatter spec for ADR files included"
related:
  - ../decisions/README.md
  - ../../engineer/build/
  - ../../../YiAi/CLAUDE.md
  - ../../../YiVad/CLAUDE.md
---

# Architecture Decision Record (ADR) — Template

> **ADR = Context + Decision + Consequences.** An ADR captures a significant technical decision, why it was made, and what trade-offs were accepted. It is immutable after acceptance — superseded, not edited.

## When to write an ADR

Write an ADR when:
- Choosing between multiple viable technical approaches (e.g., library A vs library B)
- Making a decision that affects multiple projects or modules
- Introducing a new architectural pattern or constraint
- Deprecating or replacing an existing system
- Making a decision with significant cost, risk, or irreversibility

Skip an ADR when:
- The decision is obvious (only one viable approach)
- The decision is reversible at low cost (e.g., a config change)
- The decision is purely implementation detail within a single module

## Frontmatter

```yaml
---
title: ADR: <decision title>
tags: [adr, <project>, <domain>, <topic>]
category: leader/decisions/<project>
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: internal
type: adr
status: accepted | proposed | deprecated | superseded
lifecycle: active | reference
review_cycle: yearly
roles: [leader]
benefit: "<one sentence: what does this decision enable or prevent?>"
acceptance_criteria:
  - "decision is documented with context and trade-offs"
  - "superseded by: <link to newer ADR>"  # only if status: superseded
related:
  - <links to related ADRs, code, or docs>
---
```

## Template

### 1. Title

A short, descriptive phrase in the form of an imperative statement. Start with a verb.

**Example**: "Use apscheduler polling for knowledge watcher instead of FSEvents"

### 2. Status

One of: `proposed` (under discussion), `accepted` (approved and active), `deprecated` (no longer followed), `superseded` (replaced by a newer ADR).

If superseded, link to the newer ADR.

### 3. Context

What is the problem this decision addresses? Describe the forces at play:
- **Business context**: What user need or business goal drives this?
- **Technical context**: What existing system or constraint creates the need?
- **Constraints**: What can't we change? (budget, timeline, existing stack, team skills)

**Example**: "macOS FSEvents silently drops file change events on this machine, causing the knowledge watcher to miss updates. The watcher must detect file changes in YiKnowledge within a reasonable latency to keep MongoDB and the RAG index in sync."

### 4. Decision

What did we decide to do? State it clearly and unambiguously. Use active voice.

**Example**: "Replace FSEvents with apscheduler polling at a 5-second interval. The poll loop walks the YiKnowledge directory tree, compares file hashes against the last known state, and syncs changed files to MongoDB."

### 5. Alternatives Considered

List the other options we evaluated and why we rejected them:

| Alternative | Why rejected |
|---|---|
| FSEvents (keep) | Unreliable on this machine — silent event drops |
| inotify | Linux-only, not available on macOS |
| Polling at 1s | Higher CPU usage, no meaningful latency improvement over 5s |
| Polling at 30s | Too stale — knowledge changes take 30s to appear in RAG |

### 6. Consequences

What becomes easier, harder, or different because of this decision?

**Positive**:
- Knowledge file changes are reliably detected within 5 seconds
- No dependency on platform-specific file watching APIs
- Works consistently across macOS, Linux, and container environments

**Negative**:
- 5-second polling adds constant low-level CPU usage
- File changes are not instant (<1s) — 5-second latency ceiling
- Directory walk of ~1000 files every 5 seconds

**Neutral**:
- The watcher architecture is now polling-based, not event-based
- Future migration to a more efficient watcher requires reverting to an event-based model

### 7. Implementation Plan

How will this decision be implemented? High-level steps:

1. Add `apscheduler` to requirements.txt
2. Implement `KnowledgeWatcher` class with `scan_and_sync` method
3. Schedule at 5-second interval in `app.py` lifecycle
4. Remove FSEvents/watchdog dependency
5. Add health check endpoint for watcher status
6. Verify: create a test file, confirm it appears in MongoDB within 5 seconds

### 8. Rollback Plan

Can this decision be reversed? If so, how?

**Example**: "Yes — revert to FSEvents by restoring the watchdog dependency and removing the apscheduler job. The watcher interface (`scan_and_sync`) is unchanged, so only the scheduling mechanism changes."

### 9. Related Decisions

What other ADRs does this decision depend on or influence?

**Example**: "Depends on ADR: Knowledge Watcher Deployment (which established the watcher as a YiAi component). Influences future ADRs on RAG index freshness guarantees."

### 10. References

- Code: `YiAi/src/domain/knowledge/watcher.py`
- Issue: macOS FSEvents bug report
- CLAUDE.md: `YiAi/CLAUDE.md` — Knowledge watcher section

### 11. Changelog

| Date | Change | Author |
|---|---|---|
| 2026-08-21 | ADR created | — |
| — | — | — |

### 12. Acceptance

| Role | Name | Date | Decision |
|---|---|---|---|
| Tech Lead | — | — | — |
| Engineer | — | — | — |

## Naming convention

ADR files follow the pattern: `<project>/<number>-<slug>.md`

**Example**: `yiai/001-knowledge-watcher-polling.md`

The number is sequential within the project directory. The slug is a short kebab-case description of the decision.

## Anti-patterns

- **Writing an ADR after implementation without documenting alternatives.** The value of an ADR is the decision rationale, not the decision itself. If you've already implemented it, you've lost the context of what you rejected.
- **Too vague to be useful.** "We decided to use microservices" is not an ADR. "We decided to split the monolith into 3 services (auth, chat, data) with the following boundaries..." is.
- **No consequences section.** Every decision has trade-offs. If you can't think of any negative consequences, you haven't thought hard enough.