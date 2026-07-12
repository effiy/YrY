---
name: git-repo-state
description: >
  Inspect local Git repository state — status, diffs, history, and
  branch listing. Read-only operations via the Git MCP Server.
---

# Git — Repository State Inspection

Inspect the working tree, view diffs, browse commit history, and list
branches. All read-only.

## Available Tools

| Tool | Purpose |
|------|---------|
| `git_status` | Working tree status |
| `git_diff_unstaged` | Changes not yet staged |
| `git_diff_staged` | Changes staged for commit |
| `git_diff` | Diff vs branch/commit |
| `git_log` | Commit history with date filtering |
| `git_show` | Full contents of a commit |
| `git_branch` | List branches with filtering |

## Common Queries

```
"What changed since last commit?"    → git_diff_unstaged
"What's staged for commit?"          → git_diff_staged
"Show last 20 commits"               → git_log(max_count=20)
"Show commits from last week"        → git_log(start_timestamp="1 week ago")
"What did commit abc1234 do?"        → git_show(revision="abc1234")
"Show diff between my branch and main" → git_diff(target="main")
```

## Constraints

- `repo_path` is mandatory for every tool
- Local only — push/pull/merge requires GitHub MCP
