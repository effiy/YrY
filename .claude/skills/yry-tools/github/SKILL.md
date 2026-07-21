---
name: yry-tools-github
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

# yry-tools-github

> Perform all GitHub platform operations via the GitHub MCP Server —
> from simple repository queries to complex multi-step issue and PR
> workflows.

## What this skill does

1. **Manage issues** — create, search, read, update, close, manage
   sub-issues and custom fields.
2. **Manage pull requests** — create, read, review (3-step workflow),
   merge, update branch, Copilot review.
3. **Repository and file operations** — file CRUD, batch push, fork,
   create repo, code search.
4. **Branch, commit, tag management on GitHub** (remote-side).
5. **Release inspection** — list releases, get latest, get by tag.
6. **User and team lookup** — `get_me`, teams, members, user search.
7. **Secret scanning** — detect credentials, API keys, passwords,
   tokens in diffs and file contents.
8. **Composite workflows** — full bug-to-PR pipeline, PR review
   automation, security audit.

## What this skill does NOT do

- Does NOT operate on local Git repositories — use `yry-tools-git`
  for local operations.
- Does NOT bypass GitHub API permissions — all operations are
  scoped to the authenticated user.
- Does NOT create commits or branches locally — operates on GitHub's
  API, not the local filesystem.

## Workflow

Each command follows a safety-first approach:

```
get_me (confirm identity) → search (avoid duplicates) → operate → verify
```

Core principles: search before creating (check for duplicate
issues/PRs); paginated queries (`page`/`perPage`, 5–10 per page
recommended); minimize output (`minimal_output: true` when details
not needed); `get_me` first (confirm identity and permissions before
the first operation); secret scanning (proactively scan file contents
and diffs for credential leaks).

## Borders

| Boundary | Permission |
|----------|-----------|
| GitHub API (issues, PRs, repos, releases, teams) | read + write (scoped to authenticated user) |
| Local filesystem | no access |
| Private repositories not in user's scope | blocked (permission-based) |

## Supporting resources

- [commands/issue.md](./commands/issue.md) — Manage issues: create, search, read, update, close, sub-issues.
- [commands/pr-review.md](./commands/pr-review.md) — Review pull requests with the 3-step workflow, create PRs, merge.
- [commands/security-scan.md](./commands/security-scan.md) — Scan diffs and file contents for credentials and secrets.

## Fallback

| Situation | Behavior |
|-----------|----------|
| API rate limit hit | Surface rate limit info; suggest waiting or reducing `perPage`. |
| Permission denied on a resource | Surface the 403/404; suggest checking scope. |
| File update without SHA | Error; instruct to call `get_file_contents` first. |
| PR template not found | Fall back to a minimal description; warn on missing template. |
| Copilot review unavailable | Surface the error; suggest manual review fallback. |
| Paginated result is empty | Surface empty result; check filter parameters. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
