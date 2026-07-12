---
name: git-branch
description: >
  Manage local Git branches — create, checkout, and list with flexible
  filtering. Uses Git MCP Server.
---

# Git — Branch Management

Create, switch, and list branches via the Git MCP Server.

## Available Tools

| Tool | Purpose |
|------|---------|
| `git_create_branch` | Create a new branch from an optional base |
| `git_checkout` | Switch to a different branch |
| `git_branch` | List branches with filtering |

## Common Workflows

### Create + Switch
```
git_create_branch(branch_name="feature/x", base_branch="main")
→ git_checkout(branch_name="feature/x")
```

### List Branches
```
"List all local branches"        → git_branch(branch_type="local")
"List branches containing commit" → git_branch(contains="<sha>")
```

### Pre-Merge Checklist
```
git_branch(branch_type="local") → Confirm branch exists
git_status → Ensure clean working tree
git_diff(target="main") → See what would be merged
git_log(max_count=10) → Review recent commits
```

## Constraints

- `branch_name` must not start with `-` (flag injection prevention)
- `repo_path` is mandatory
- Local only — no push/pull
