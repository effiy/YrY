---
title: brainstorm
name: brainstorm
description: >
  Before writing any code, conduct a structured interview to clarify the user's
  intent, surface hidden assumptions, and produce a concrete spec. Use this skill
  when the user describes a new feature, refactoring, or bug fix but the
  requirements are ambiguous, OR when the user explicitly asks to brainstorm,
  discuss a design, or "grill me." The skill probes the user with focused
  questions about scope, edge cases, cross-project impact, and success criteria
  until every branch of the design tree is resolved — then outputs a structured
  spec document. Trigger words: brainstorm, 需求分析, 设计方案, 讨论方案,
  grill me, 理清需求, 先讨论, 帮我分析, 设计一下, 怎么做.
  Do NOT trigger for: well-defined one-line tasks (typo fixes, single-line
  config changes, exact instructions), or when the user has already provided
  a detailed spec.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/brainstorm
review_cycle: quarterly
roles:
  - aier
  - engineer
  - producter
tags:
  - skill
  - ai
  - workflow
  - design
  - brainstorming
chip: ai-workflow
---

# brainstorm

> Structured interview to clarify intent before coding. Inspired by
> superpowers' brainstorming and mattpocock's grill-me — but adapted for
> the YrY monorepo's cross-project reality.

## What this skill does

- Conduct a Socratic interview: ask focused questions, one at a time,
  until the design tree is fully resolved.
- Surface hidden assumptions: which project(s) are affected, what cross-project
  protocol contracts change, what edge cases exist.
- Output a structured spec document with: goal, scope, affected projects,
  cross-project impact, edge cases, success criteria.
- Adapt questioning depth based on the task's complexity — a one-field form
  change gets fewer questions than a cross-project API migration.

## What this skill does NOT do

- Does NOT write code or implementation plans (hand off to `write-plan`).
- Does NOT ask questions the user has already answered in the prompt.
- Does NOT override an already-detailed spec — if the user provides a complete
  spec, skip to `write-plan`.
- Does NOT replace domain expertise — it surfaces what the user knows but
  hasn't stated.

## Workflow

```
User describes need
  → Interview: probe scope, projects, contracts, edge cases
  → Synthesize: structured spec document
  → Confirm: user approves the spec
  → Handoff: suggest /write-plan
```

### Interview phases

| Phase | Focus | Sample questions |
|-------|-------|-----------------|
| **Goal** | What problem does this solve? | "这个功能的核心目标是什么？谁会用？" |
| **Scope** | What's in, what's out? | "只改 YiVad 前端还是 YiAi 后端也要动？" |
| **Projects** | Which sub-projects are affected? | "YiPet 的 API 层需要改吗？" |
| **Contracts** | Cross-project protocol impact | "RPC envelope 的 parameters 会变吗？" |
| **Edge cases** | What could go wrong? | "如果 MongoDB 不可达，降级策略是什么？" |
| **Success** | How do we know it's done? | "完成的标准是什么？type-check 通过？e2e 验证？" |

### YrY-specific probes

When the task touches multiple projects, always probe:

1. **RPC envelope**: Does `module_name` / `method_name` / `parameters` change?
2. **Field names**: Are `filter` (not `query`), `target_file` (not `path`) respected?
3. **SSE streaming**: Does the streaming contract change?
4. **Degradation**: What happens when each backend dependency is unavailable?
5. **CLAUDE.md**: Which project's Iron Laws and Self-Constraints apply?

## Spec document template

After the interview, output a spec with these sections:

```markdown
## Goal
[One sentence: what problem this solves]

## Scope
- In scope: [bullet list]
- Out of scope: [bullet list]

## Affected projects
| Project | What changes | Risk level |
|---------|-------------|------------|
| YiVad   | ...         | low/med/high |
| YiAi    | ...         | low/med/high |
| YiPet   | ...         | low/med/high |

## Cross-project impact
- [ ] RPC envelope changes
- [ ] SSE streaming contract changes
- [ ] Field name contracts (filter/target_file)
- [ ] Degradation path changes

## Edge cases
[Bullet list of edge cases and how they're handled]

## Success criteria
- [ ] Verifiable checklist items
```

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Ask one question at a time | The user can only answer one thing well |
| 2 | Skip questions the user already answered | Don't waste the user's attention |
| 3 | Depth scales with complexity | A typo fix doesn't need a full interview |
| 4 | Always check cross-project impact | YrY is a monorepo — changes ripple |
| 5 | Output the spec before asking for approval | The user needs to see the full picture |
| 6 | Use the user's language (zh/en) | Match the language the user started with |
| 7 | Reference CLAUDE.md constraints | Every project has Iron Laws that must be respected |

## Borders

| Boundary | Permission |
|----------|-----------|
| Project source files | read (for context) |
| CLAUDE.md files | read |
| YiKnowledge/skills/** | read |
| YiKnowledge/engineer/** | read |
| Output spec | write to conversation (not to disk unless user asks) |

## Supporting resources

- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — Iron Laws, module boundaries, cross-project protocol
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — domain layer, data flow, degradation countermeasures
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — API layer, dual-world boundary, MV3 constraints
- [YiKnowledge/MEMORY.md](../../../YiKnowledge/MEMORY.md) — naming conventions, frontmatter spec

## Fallback

| Situation | Behavior |
|-----------|----------|
| User provides a detailed spec already | Skip the interview; suggest proceeding to `/write-plan` |
| User declines to answer a question | Note it as an unresolved assumption in the spec; proceed |
| Task is trivially simple | Confirm scope in one sentence; don't over-interview |
| User asks in a language other than zh/en | Respond in the user's language; keep resource titles in original |