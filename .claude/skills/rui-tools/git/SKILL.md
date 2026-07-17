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

> Perform local Git repository operations via the Git MCP Server —
> inspecting repository state, committing changes, and managing branches.

## What this skill does

1. **Inspect repository state** — working tree status, diffs
   (unstaged / staged / vs-branch), commit history, branch listing.
2. **Stage and commit changes** with a read-before-write safety workflow.
3. **Create, checkout, and list Git branches.**
4. **Run composite workflows** — explore-and-commit, branch-and-switch,
   history investigation, pre-merge checklist.

## What this skill does NOT do

- Does NOT push, pull, fetch, or merge — those require the GitHub MCP
  server or direct git CLI.
- Does NOT modify remote repositories.
- Does NOT handle authentication or remote configuration.
- Does NOT run destructive operations without user confirmation.

## Workflow

```
git_status → git_diff_unstaged → git_add → git_diff_staged → git_commit
```

All tools require `repo_path` (absolute path). Every destructive tool
(`git_reset`) requires user confirmation. The standard commit workflow
enforces "read before write": always inspect state and diffs before
staging and committing.

## Borders

| Boundary | Permission |
|----------|-----------|
| `<repo_path>/**` (local Git repository) | read + write (staging, commit) |
| `<repo_path>/` outside allowed directory | blocked |
| Remote repositories | no access |

## Supporting resources

- [commands/status.md](./commands/status.md) — Inspect repository state: status, diffs, log, show, branch listing.
- [commands/commit.md](./commands/commit.md) — Stage and commit changes with the standard safety workflow.
- [commands/branch.md](./commands/branch.md) — Create, checkout, and list branches with filtering.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `repo_path` is not a valid Git repository | Error; surface the invalid path. |
| Working tree has merge conflicts | Show conflicted files; block commit. |
| Diff has no output | Means no changes in that category — surface empty message. |
| File path starts with `-` | Reject with CLI flag injection error. |
| Path traversal detected (`../../etc/passwd`) | Block the operation. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
