---
name: rui-tools-github
description: >
  GitHub platform operations via the GitHub MCP Server — Issue/PR
  management, code search, repository operations, release inspection,
  team collaboration, and secret scanning.
  Trigger words: GitHub, issue, PR, pull request, repository, commit,
  release, tag, secret scanning, code review, Copilot review, branch,
  search code, GitHub Actions.
lifecycle: default-pipeline
user_invocable: true
---

# rui-tools-github

> Perform all GitHub platform operations via the GitHub MCP Server — from simple repository queries to complex multi-step issue and PR workflows.

## Quick Start

```
/rui-tools-github issue         → Create, search, or manage issues
/rui-tools-github pr-review     → Review pull requests with the 3-step workflow
/rui-tools-github security-scan → Scan code for credential leaks
```

## What This Skill Does

- Manage issues: create, search, read, update, close, manage sub-issues and custom fields
- Manage pull requests: create, read, review (3-step workflow), merge, update branch, Copilot review
- Repository and file operations: file CRUD, batch push, fork, create repo, code search
- Branch, commit, tag management on GitHub (remote-side)
- Release inspection: list releases, get latest, get by tag
- User and team lookup: get_me, teams, members, user search
- Secret scanning: detect credentials, API keys, passwords, tokens in diffs and file contents
- Composite workflows: full bug-to-PR pipeline, PR review automation, security audit

## What This Skill Does NOT Do

- Does NOT operate on local Git repositories — use `rui-tools-git` for local operations
- Does NOT bypass GitHub API permissions — all operations are scoped to the authenticated user
- Does NOT create commits or branches locally — operates on GitHub's API, not the local filesystem

## Workflow

Each command follows a safety-first approach:

```
get_me (confirm identity) → search (avoid duplicates) → operate → verify
```

Core principles:
1. **Search before creating** — check for duplicate issues/PRs
2. **Paginated queries** — use `page`/`perPage` (5–10 per page recommended)
3. **Minimize output** — use `minimal_output: true` when details are not needed
4. **`get_me` first** — confirm identity and permissions before the first operation
5. **Secret scanning** — proactively scan file contents and diffs for credential leaks

## Borders

| Boundary | Permission |
|----------|-----------|
| GitHub API (issues, PRs, repos, releases, teams) | read + write (scoped to authenticated user) |
| Local filesystem | no access |
| Private repositories not in user's scope | blocked (permission-based) |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | `get_me` before first operation | Confirm identity and permission scope |
| 2 | Search before creating (issues/PRs) | Avoid duplicates |
| 3 | Use pagination (`page`/`perPage`) for list queries | Avoid rate limits and excessive data |
| 4 | Proactive secret scanning on file contents and diffs | Prevent credential leaks |
| 5 | PR reviews use the 3-step workflow (create → add_comment → submit) | GH API requires pending review for inline comments |
| 6 | File updates require SHA — always `get_file_contents` first | GH API contract |

## Commands

- [issue.md](./commands/issue.md) — Manage issues: create, search, read, update, close, sub-issues.
- [pr-review.md](./commands/pr-review.md) — Review pull requests with the 3-step workflow, create PRs, merge.
- [security-scan.md](./commands/security-scan.md) — Scan diffs and file contents for credentials and secrets.

## Fallback

| Situation | Behavior |
|-----------|----------|
| API rate limit hit | Surface rate limit info; suggest waiting or reducing `perPage` |
| Permission denied on a resource | Surface the 403/404; suggest checking scope |
| File update without SHA | Error; instruct to call `get_file_contents` first |
| PR template not found | Fall back to a minimal description; warn on missing template |
| Copilot review unavailable | Surface the error; suggest manual review fallback |
| Paginated result is empty | Surface empty result; check filter parameters |


