---
title: handoff
name: handoff
description: >
  Compact the current conversation into a handoff document so another agent
  (or the same agent in a new session) can continue the work without losing
  context. Use this skill when the conversation is getting long, when you're
  about to switch tasks, when you want to hand off to a colleague, or when
  the user says "summarize this," "handoff," "交接," or "会话总结." The
  handoff includes: what was decided, what was done, what's in progress,
  what's blocked, and what's next. Trigger words: handoff, 交接, 会话总结,
  summarize session, 记录一下, 整理一下, capture context, save progress,
  context dump.
  Do NOT trigger for: short conversations (< 5 messages), or when the user
  just wants to continue working in the same session.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/handoff
review_cycle: quarterly
roles:
  - aier
  - engineer
tags:
  - skill
  - ai
  - handoff
  - context
  - productivity
chip: ai-workflow
---

# handoff

> Compress a conversation into a handoff document. Inspired by mattpocock's
> handoff — adapted for the YrY monorepo's multi-project context and memory
> system.

## What this skill does

- Read the current conversation and extract the essential context.
- Produce a structured handoff document with: goal, decisions, progress,
  blockers, open questions, and next steps.
- Include file paths and line numbers for all changed files.
- Reference relevant CLAUDE.md sections and YiKnowledge entries.
- Optionally save to a YiKnowledge note or the project's memory system.

## What this skill does NOT do

- Does NOT include the full conversation history (that's what the session
  transcript is for) — it's a distillation, not a dump.
- Does NOT continue working — the handoff is the end of the current session's
  work, not a pause.
- Does NOT replace the memory system — it's a one-shot handoff, not persistent
  memory.

## Workflow

```
Conversation context
  → Extract: goal, decisions, progress, blockers, open questions
  → Structure into handoff document
  → Present to user for review
  → Optionally save to disk (YiKnowledge note or memory)
```

### Handoff document template

```markdown
## Handoff: [brief title]
**Date**: YYYY-MM-DD
**Project(s)**: [YiVad | YiAi | YiPet]
**From**: [current session]

### Goal
[One sentence: what we were trying to accomplish]

### Decisions made
- [Decision 1]: [why]
- [Decision 2]: [why]

### What was done
- [x] [Completed item] — [file:line]
- [x] [Completed item] — [file:line]

### What's in progress
- [~] [In-progress item] — [file:line, current state]
- [~] [In-progress item] — [file:line, current state]

### Blockers
- [ ] [Blocker]: [what's blocking it, what's needed to unblock]

### Open questions
- [?] [Question 1]
- [?] [Question 2]

### Next steps
1. [First thing to do when resuming]
2. [Second thing]
3. [Third thing]

### Key files
| File | What changed | Status |
|------|-------------|--------|
| path/to/file.ts | [description] | done/in-progress |

### Relevant context
- CLAUDE.md: [project]/CLAUDE.md — [relevant section]
- YiKnowledge: [path] — [relevant entry]
- Memory: [memory file] — [relevant context]
```

## YrY-specific handoff rules

1. **Cross-project awareness**: If the work spans multiple projects, list each
   project's completed and in-progress items separately.
2. **RPC contract changes**: If the RPC envelope changed, include the before/after
   in the handoff so the next agent doesn't revert it.
3. **Field name gotchas**: If the work involved `filter`/`query` or
   `target_file`/`path` fixes, flag them explicitly — these are the #1 source
   of cross-project bugs.
4. **SSE stream state**: If an SSE stream was in progress, note the abort
   status and the `onDone` handler state.
5. **Memory integration**: If the handoff contains decisions worth remembering
   long-term, suggest saving them to the project's memory system (see
   Supporting resources below for the memory system location).

### Memory integration

After producing the handoff, check if any decisions or context should be
persisted to the project's memory system. The memory system is managed by
Claude Code's auto-memory feature — ask the user or check the system prompt
for the memory directory location.

| What to save | Memory type | Example |
|-------------|-------------|---------|
| Architecture decision | project | "Chose Redis over in-memory cache for session store" |
| User preference discovered | feedback | "User prefers squashed commits for this repo" |
| External resource found | reference | "API docs at internal-wiki/yi-api" |
| Cross-project convention | project | "All new services must follow the RPC envelope pattern" |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Distill, don't dump | The next agent needs the essence, not the whole conversation |
| 2 | Include file paths and line numbers | The next agent needs to find the code |
| 3 | Separate done from in-progress | The next agent must know where to start |
| 4 | Flag blockers explicitly | The next agent can't fix what it doesn't know about |
| 5 | List next steps in order | The next agent needs a clear starting point |
| 6 | Reference CLAUDE.md sections | The next agent needs project context |
| 7 | Suggest memory saves | Non-obvious decisions should persist beyond the handoff |

## Borders

| Boundary | Permission |
|----------|-----------|
| Conversation context | read |
| Project source files (for file paths) | read |
| CLAUDE.md files | read |
| Memory system | read + write (with user approval) |
| YiKnowledge (for saving handoff) | read + write (with user approval) |

## Supporting resources

- [YiKnowledge/MEMORY.md](../../../YiKnowledge/MEMORY.md) — naming conventions, frontmatter spec
- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — recent changes (for context continuity)
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — recent changes (for context continuity)
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — recent changes (for context continuity)

## Fallback

| Situation | Behavior |
|-----------|----------|
| Conversation is too short for a handoff | Skip; tell the user there's not enough context to hand off |
| User wants to save to a specific location | Save to the specified path; otherwise default to conversation output |
| Memory system is full or unavailable | Skip memory integration; note it in the handoff |
| Cross-project work with no clear primary project | List all projects; don't force a single-project handoff |