---
title: domain-modeling
name: domain-modeling
description: >
  Build and sharpen a project's shared language (domain model) to reduce
  agent verbosity and improve code consistency. Use this skill when the
  project lacks a CONTEXT.md glossary, when the agent uses inconsistent
  terminology, or when the user wants to document hard-to-explain design
  decisions. The skill extracts key terms from the codebase and CLAUDE.md,
  stress-tests them against edge cases, and produces a concise CONTEXT.md
  that future sessions can reference. Trigger words: domain model, 领域建模,
  shared language, 统一术语, CONTEXT.md, glossary, 术语表, ubiquitous language,
  命名规范, 概念模型.
  Do NOT trigger for: simple naming discussions, or when the user just wants
  to rename one variable.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/domain-modeling
review_cycle: quarterly
roles:
  - engineer
  - aier
tags:
  - skill
  - ai
  - design
  - domain-modeling
  - context
chip: ai-engineering
---

# domain-modeling

> Build a shared language between you and your agent. Inspired by
> mattpocock's domain-modeling — adapted for the YrY monorepo where
> three projects share a common protocol but have distinct domains.

## What this skill does

- Extract the project's key terms from existing CLAUDE.md files, code,
  and YiKnowledge entries.
- Identify terms that are ambiguous, overloaded, or inconsistent across
  the monorepo (e.g., "session" means different things in YiVad, YiAi,
  and YiPet).
- Build a CONTEXT.md glossary with concise definitions that the agent
  can reference to use fewer tokens and more precise language.
- Stress-test the glossary against edge cases and real scenarios.
- Record architectural decisions (ADRs) for non-obvious design choices.

## What this skill does NOT do

- Does NOT rewrite the codebase to match the glossary (that's a separate
  refactoring task).
- Does NOT replace CLAUDE.md — CONTEXT.md is a companion document for
  domain language, not project conventions.
- Does NOT create a glossary for its own sake — only terms that actually
  reduce ambiguity.

## Workflow

```
Identify candidate terms
  → Read CLAUDE.md, key source files, YiKnowledge entries
  → Extract terms that are: ambiguous, overloaded, or missing from docs
  → For each term: define it, challenge it, test it against edge cases
  → Write CONTEXT.md with the glossary + ADRs
  → Verify: does the agent use fewer tokens with the same precision?
```

### YrY-specific domain boundaries

Each sub-project has its own domain. Terms that mean different things
in different projects MUST be disambiguated:

| Term | YiVad | YiAi | YiPet |
|------|-------|------|-------|
| session | Chat session (aiChat store) | MongoDB session document | Chrome extension session |
| store | Pinia store | MongoDB data store | chrome.storage.local |
| agent | N/A | AI agent loop | N/A |
| chat | aiChat page component | chat_service | ChatController |
| knowledge | KnowledgePreviewDialog | knowledge domain module | KnowledgeService |
| file | fileService (read/write API) | domain/files/ | CDN catalog file |

### CONTEXT.md template

```markdown
## Domain Glossary

### [Term]
**Definition**: [One sentence — what it IS, not what it does]
**Used in**: [YiVad | YiAi | YiPet | All]
**Not to be confused with**: [disambiguation if needed]

## Architecture Decision Records

### ADR-001: [Title]
**Date**: YYYY-MM-DD
**Context**: [Why this decision was needed]
**Decision**: [What we chose]
**Consequences**: [What this enables + what it prevents]
```

### Glossary quality checklist

| Check | Good | Bad |
|-------|------|-----|
| Concise | "RPC envelope: the `{module_name, method_name, parameters}` wrapper for every YiAi API call" | "The RPC envelope is a JSON object that contains three fields which are used to route..." |
| Disambiguated | "session (YiVad): the chat conversation state in aiChat Pinia store" | "session: a user's interaction" |
| Testable | Can you use the term in a sentence and be understood? | — |
| Stable | The definition won't change next sprint | "currently we use X but might switch to Y" |

## YrY-specific modeling rules

1. **Cross-project terms get priority**: Terms used in the RPC envelope
   (`module_name`, `method_name`, `parameters`, `filter`, `target_file`,
   `cname`) must be defined first — they're the shared contract.
2. **Field name gotchas are terms**: `filter` (not `query`), `target_file`
   (not `path`) — these are the #1 source of cross-project bugs and deserve
   their own glossary entries with a warning.
3. **YiKnowledge is the source of truth for domain knowledge**: Before
   adding a term, check if it's already defined in YiKnowledge under
   `engineer/`, `leader/`, or `producter/`.
4. **CONTEXT.md lives in the project root**: One per sub-project
   (`YiVad/CONTEXT.md`, `YiAi/CONTEXT.md`, `YiPet/CONTEXT.md`), not a
   single monorepo-wide file.
5. **ADR format**: Use the YiKnowledge ADR convention from
   `YiKnowledge/leader/decisions/` if one exists.

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Define terms by what they ARE, not what they DO | "A Pinia store" > "Manages chat state" |
| 2 | One term, one meaning per project | If a term means two things, split it |
| 3 | Disambiguate cross-project terms first | These cause the most confusion |
| 4 | Challenge every definition | If a junior dev wouldn't understand it, rewrite |
| 5 | Include the "not to be confused with" field | Prevents the agent from conflating terms |
| 6 | Keep glossary under 30 terms | More than 30 = the terms are too granular or the domain is too broad |
| 7 | Update CONTEXT.md when the domain changes | A stale glossary is worse than no glossary |

## Borders

| Boundary | Permission |
|----------|-----------|
| CLAUDE.md files | read |
| Project source files | read |
| YiKnowledge/** | read |
| CONTEXT.md (if exists) | read + write |
| New CONTEXT.md | write (with user approval) |

## Supporting resources

- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — module boundaries, cross-project protocol
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — domain layer, service layer
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — API layer, dual-world boundary
- [YiKnowledge/leader/decisions/](../../../YiKnowledge/leader/decisions/) — ADR examples (if they exist)
- [YiKnowledge/engineer/ENGINEERING.md](../../../YiKnowledge/engineer/ENGINEERING.md) — engineering conventions

## Fallback

| Situation | Behavior |
|-----------|----------|
| Project already has CONTEXT.md | Review and suggest improvements; don't rewrite from scratch |
| User doesn't want a separate file | Embed the glossary in the conversation; don't force file creation |
| Term is genuinely ambiguous across projects | Flag it; don't force a false consensus |
| No clear domain terms found | Skip; not every project needs a glossary |