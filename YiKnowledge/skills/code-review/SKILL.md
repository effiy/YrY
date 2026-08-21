---
title: code-review
name: code-review
description: >
  Two-axis code review of pending changes. Axis 1 (Standards): does the code
  follow the project's coding standards, lint rules, and conventions? Axis 2
  (Spec): does it faithfully implement the originating issue or spec? Run as
  parallel sub-agents so neither axis pollutes the other. Use this skill before
  committing, before creating a PR, or when the user asks for a review.
  Trigger words: code review, review this, 代码审查, 审查一下, check my code,
  review my changes, pre-commit review, 提交前检查.
  Do NOT trigger for: work-in-progress that the user hasn't said is ready,
  or when the built-in `/review` command is more appropriate (PR review).
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/code-review
review_cycle: quarterly
roles:
  - engineer
  - aier
tags:
  - skill
  - ai
  - review
  - quality
  - code-review
chip: ai-engineering
---

# code-review

> Two-axis review of pending changes. Inspired by superpowers'
> requesting-code-review/receiving-code-review and mattpocock's code-review —
> adapted for the YrY monorepo's lint and convention landscape.

## What this skill does

- Review the git diff (staged + unstaged) against two independent axes:
  - **Standards**: lint rules, coding conventions, naming, style, structure
  - **Spec**: does the change implement what was asked for?
- Run the two axes as parallel sub-agents so neither biases the other.
- Flag issues by severity: blocking (must fix), warning (should fix), note
  (consider).
- Reference the target project's CLAUDE.md Iron Laws and Self-Constraints.

## What this skill does NOT do

- Does NOT fix issues — it identifies them; the user decides what to fix.
- Does NOT review code that hasn't been changed (no "while you're at it").
- Does NOT replace the project's lint tools (ESLint, Biome, Stylelint) — it
  augments them with semantic review.
- Does NOT review tests unless they're part of the diff.

## Workflow

```
Git diff in hand
  → Dispatch two parallel sub-agents:
      Agent A: Standards review (lint, conventions, style)
      Agent B: Spec review (matches the requirement?)
  → Merge findings, deduplicate
  → Present findings organized by severity
  → User decides what to fix
```

### Standards review checklist

| Check | YiVad | YiAi | YiPet |
|-------|-------|------|-------|
| Lint rules | ESLint 10 + Prettier 3 + Stylelint 17 | ruff (configured, not enforced) | Biome 2.5 |
| Type check | `vue-tsc --noEmit` | Python 3.10+ typing | `npm run typecheck` |
| Component style | `<script setup lang="ts">` | N/A | React 18 function components |
| Naming | PascalCase components, camelCase composables | snake_case | PascalCase components, camelCase functions |
| Imports | `@/` alias for cross-module | Relative imports | `@/` alias for cross-module |
| File structure | Views → components → hooks → stores → api | Domain → services → server → routes | API (4-tier) → chat → popup → content |
| No Options API | Required | N/A | N/A |
| No axios in stores | Required | N/A | N/A |
| ProTable for tables | Required | N/A | N/A |
| API layer | Through `RequestHttp` | Through `services/` | Through `ApiClient` (4-tier) |

### Spec review checklist

| Check | Description |
|-------|-------------|
| Goal match | Does the change implement what the spec/issue asked for? |
| Scope creep | Are there changes outside the spec's scope? |
| Edge cases | Are the spec's edge cases handled? |
| Cross-project | If the spec mentions cross-project impact, is it addressed? |
| Degradation | If the spec mentions degradation, is it implemented? |
| Verification | Does the spec's verification checklist pass? |

### Severity levels

| Level | Mark | Example |
|-------|------|---------|
| Blocking | 🔴 | Raw `axios` call in a Pinia store (YiVad) |
| Warning | 🟡 | Missing edge case handling |
| Note | 🔵 | Alternative approach suggestion |

## YrY-specific review checks

1. **Field name contracts**: `filter` (not `query`), `target_file` (not `path`).
   Grep the diff for `query` and `path` in API calls.
2. **SSE `onDone` guard**: Any SSE change must check `!aborted && !error` before
   side effects.
3. **RPC envelope**: Changes to `module_name` / `method_name` / `parameters`
   must be consistent across YiVad, YiPet, and YiAi.
4. **No silent writes**: Every new file write must have a corresponding read
   (Read tool or explicit file read in code).
5. **Degradation**: New API calls must have a degradation path or explicit
   error handling.

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Standards and spec reviews run in parallel | Serial review biases the second axis |
| 2 | Every finding must cite the specific line | "The code is messy" is not actionable |
| 3 | Severity must be justified | Don't flag stylistic preferences as blocking |
| 4 | Reference the CLAUDE.md rule being violated | The developer needs to understand why |
| 5 | Don't review code outside the diff | Stay focused on what changed |
| 6 | Flag what's missing, not just what's wrong | A missing edge case is as important as a bug |
| 7 | One finding per issue | Don't bundle multiple issues into one comment |

## Borders

| Boundary | Permission |
|----------|-----------|
| Git diff (staged + unstaged) | read |
| Project source files (for context) | read |
| CLAUDE.md files | read |
| Lint config files | read |
| YiKnowledge/skills/** | read |

## Supporting resources

- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — coding standards, module boundaries, self-constraints
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — domain layer, service layer, naming conventions
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — API layer, component patterns, dual-world boundary

## Fallback

| Situation | Behavior |
|-----------|----------|
| No diff available (clean working tree) | Report nothing to review |
| Subagent times out | Run the review axis serially |
| Project has no lint tooling | Note it as a warning; apply manual convention checks |
| Diff is very large (> 500 lines) | Sample the most critical files; suggest breaking into smaller PRs |