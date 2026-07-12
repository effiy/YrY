---
name: git-commit
description: >
  Stage and commit changes in a local Git repository. Standard workflow:
  status → diff → add → diff_staged → commit. Uses Git MCP Server.
---

# Git — Staging & Committing

Stage files and create commits via the Git MCP Server.

## Available Tools

| Tool | Purpose |
|------|---------|
| `git_add` | Stage file contents |
| `git_reset` | Unstage all staged changes |
| `git_commit` | Record staged changes |

## Standard Commit Workflow

```
1. git_status → Review current state
2. git_diff_unstaged → Review unstaged changes
3. git_add(files=[...]) → Stage specific files (or ["."] for all)
4. git_diff_staged → Review what will be committed
5. git_commit(message="...") → Commit
```

## Undo Staging

```
git_reset(repo_path="...") → Unstages all files, working directory untouched
```

## Safety Rules

- Always read before write: check status + diff before staging
- Never commit without user explicitly asking
- Never run `git reset` without user confirmation (destructive)
- Flag injection prevention: arguments starting with `-` are rejected
- Stage specific files by name; avoid `git_add(["."])` unless explicitly requested
