---
name: rui-tools-git
description: >
  Local Git repository operations via the Git MCP Server — status,
  diff, commit, branch, log, and history inspection.
  Trigger words: git status, git diff, git commit, git add, git reset,
  git log, git branch, git checkout, git show, stage, unstage,
  working tree, commit history.
lifecycle: default-pipeline
user_invocable: true
---

# rui-tools-git

> Perform all local Git repository operations via the Git MCP Server — from inspecting repository state to committing changes and managing branches.

## Quick Start

```
/rui-tools-git status    → Show working tree state
/rui-tools-git commit    → Stage and commit changes
/rui-tools-git branch    → Create, checkout, or list branches
```

## What This Skill Does

- Inspect repository state: working tree status, diffs (unstaged/staged/vs-branch), commit history, branch listing
- Stage and commit changes with a read-before-write safety workflow
- Create, checkout, and list Git branches
- Run composite workflows: explore-and-commit, branch-and-switch, history investigation, pre-merge checklist

## What This Skill Does NOT Do

- Does NOT push, pull, fetch, or merge — those require the GitHub MCP server or direct git CLI
- Does NOT modify remote repositories
- Does NOT handle authentication or remote configuration
- Does NOT run destructive operations without user confirmation

## Workflow

```
git_status → git_diff_unstaged → git_add → git_diff_staged → git_commit
```

All tools require `repo_path` (absolute path). Every destructive tool (git_reset) requires user confirmation. The standard commit workflow enforces "read before write": always inspect state and diffs before staging and committing.

## Borders

| Boundary | Permission |
|----------|-----------|
| `<repo_path>/**` (local Git repository) | read + write (staging, commit) |
| `<repo_path>/` outside allowed directory | blocked |
| Remote repositories | no access |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | `repo_path` is mandatory for every tool | Ensures correct repository context |
| 2 | Read before write — check status + diff before commit | Safety |
| 3 | Never commit without user explicitly asking | User control |
| 4 | `git_reset` requires user confirmation | Destructive operation |
| 5 | Stage specific files by name when possible | Avoid accidental staging |
| 6 | Arguments starting with `-` are rejected | CLI flag injection prevention |

## Commands

- [status.md](./commands/status.md) — Inspect repository state: status, diffs, log, show, branch listing.
- [commit.md](./commands/commit.md) — Stage and commit changes with the standard safety workflow.
- [branch.md](./commands/branch.md) — Create, checkout, and list branches with filtering.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `repo_path` is not a valid Git repository | Error; surface the invalid path |
| Working tree has merge conflicts | Show conflicted files; block commit |
| Diff has no output | Means no changes in that category — surface empty message |
| File path starts with `-` | Reject with CLI flag injection error |
| Path traversal detected (`../../etc/passwd`) | Block the operation |


