---
name: github-issue
description: >
  Manage GitHub issues — create, search, read, update, close, and manage
  sub-issues. Uses the GitHub MCP server for all operations.
---

# GitHub Issue Management

Create, search, read, update, and close issues via the GitHub MCP server.

## Available Tools

| Tool | Purpose |
|------|--------|
| `list_issues` | List repository issues with state/labels/since filters |
| `search_issues` | Full-text issue search |
| `issue_read` | Read issue details, comments, sub-issues, labels |
| `issue_write` | Create or update an issue |
| `add_issue_comment` | Add comment or reactions |
| `sub_issue_write` | Add/remove/reorder sub-issues |
| `list_issue_types` | Query supported issue types |
| `list_issue_fields` | Query custom field definitions |
| `get_label` | Get label details |

## Workflows

### Create an Issue

1. `list_issue_types` — Confirm supported types
2. `search_issues` — Check for duplicates
3. `issue_write` (method=create) — Create with labels/assignees/milestone
4. Set custom fields via `issue_fields` if applicable

### Close an Issue

```
issue_write(method=update, state_reason="completed"|"not_planned"|"duplicate")
```
For duplicates, pass `duplicate_of` pointing to the original issue number.

### Manage Sub-Issues

- Add: `sub_issue_write(method=add, sub_issue_id=...)`
- Reparent: `replace_parent: true`
- Reorder: `reprioritize` + `after_id` / `before_id`

## Example

```
User: "Create a bug issue in owner/repo: title 'Login page crashes'"
→ list_issue_types → search_issues("login crash") → issue_write(create, labels=["bug"])
```
