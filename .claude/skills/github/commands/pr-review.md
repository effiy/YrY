---
name: github-pr-review
description: >
  Review GitHub Pull Requests — read PR details, diff, files, check runs,
  create pending reviews with inline comments, and submit. Supports Copilot
  code review integration.
---

# GitHub Pull Request Review

Review pull requests via the GitHub MCP server with the standard 3-step
review workflow.

## Available Tools

| Tool | Purpose |
|------|--------|
| `list_pull_requests` | List PRs with state/base/head/sort |
| `search_pull_requests` | Search PRs with author filtering |
| `create_pull_request` | Create PR (supports draft/reviewers) |
| `update_pull_request` | Update PR status/title/desc/reviewers/base |
| `update_pull_request_branch` | Merge latest base changes into PR branch |
| `merge_pull_request` | Merge PR (merge/squash/rebase) |
| `pull_request_read` | Read details/diff/files/commits/reviews/comments/check runs |
| `pull_request_review_write` | Create/submit/delete pending review |
| `add_comment_to_pending_review` | Add inline comments |
| `add_reply_to_pull_request_comment` | Reply to PR comments |
| `request_copilot_review` | Request Copilot AI code review |

## Review Workflow (3 Steps)

```
1. pull_request_review_write(method=create, body="preliminary comments")
2. add_comment_to_pending_review(path, line, body, side=RIGHT)  (repeat as needed)
3. pull_request_review_write(method=submit_pending, event=APPROVE|REQUEST_CHANGES|COMMENT)
```

## Full Review Automation

```
User: "Review PR #42 in owner/repo"
→ pull_request_read(method=get) — basic info
→ pull_request_read(method=get_diff) — code changes
→ pull_request_read(method=get_files) — changed files list
→ pull_request_read(method=get_check_runs) — CI status
→ Analyze code quality + security
→ pull_request_review_write(method=create)
→ add_comment_to_pending_review (for each inline comment)
→ pull_request_review_write(method=submit_pending, event=...)
```

## Create PR Workflow

1. Search for PR templates: `get_file_contents(".github/PULL_REQUEST_TEMPLATE")`
2. Organize description per template
3. `create_pull_request(title, head, base, body, draft, reviewers)`

## Merge PR

```
merge_pull_request(merge_method="squash")  // Options: merge | squash | rebase
```
