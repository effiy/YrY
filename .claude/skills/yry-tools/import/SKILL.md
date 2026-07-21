---
name: yry-tools-import
description: |
  Synchronize local documents to the remote document API. Manual trigger only.
  Executable: node .claude/yry-import/sync.mjs [options].
user_invocable: true
lifecycle: default-pipeline
---

# yry-tools-import

> Batch-synchronize workspace documents to the remote API. The behavioral spec
> (scan / filter / path mapping / API contract / error model) lives in
> [rules/sync-rules.md](./rules/sync-rules.md); this file is the human-facing
> overview and the contract for the executing agent.

## What this skill does

- Scans the local project tree and uploads every file to the remote document
  API (`api.effiy.cn`).
- Distinguishes `created` vs `overwritten` per file by querying existing
  sessions before upload.
- Supports three modes: `import` (push, default), `list` (enumerate, no HTTP),
  `pull` (remote → local download).
- Honors a manual trigger contract — never auto-overwrites remote without
  human intent; safe to delegate from `/rui` delivery step or `yry-claude`
  sync.

## What this skill does NOT do

- Does NOT generate document content (that's [yry-doc] · [yry-html]).
- Does NOT push notifications (that's [yry-bot]).
- Does NOT run on a cron — the `*/30 * * * *` self-loop is a recommendation
  for the dispatcher, not an automatic schedule; manual confirmation is
  required.
- Does NOT bypass token-missing: without `API_X_TOKEN` the script degrades
  to `no-token` and skips upload.

## Workflow

```
Capture Intent → Run sync.mjs → Scan → Filter → Resolve → Fetch sessions → Upload → Summarize
```

1. **Capture intent** — confirm the user wants a workspace sync, a single-file
   upload, a list, or a pull. Default (no args) = workspace full sync.
2. **Run** `node .claude/yry-import/sync.mjs [options]` — the script is the
   executable implementation; this skill is its human-readable contract.
3. **Scan** — walk from project root (detected by `.git/` or `.claude/`).
4. **Filter** — drop `.git` / `node_modules` / `dist` / `.claude-plugin` and any
   user `--exclude` subtrees.
5. **Resolve** — compute remote path = `prefix` (if any) + project-root-relative,
   separators → `/`, spaces → `_`.
6. **Fetch sessions** — query existing remote sessions to label each file as
   `created` or `overwritten`. Network failure → all treated as `created`.
7. **Upload** — POST `/write-file` per file, concurrency cap 4, 30s timeout.
   Single-file failure logs and continues.
8. **Summarize** — count `created` / `overwritten` / `failed`; exit 1 if any
   failed.

For the full operational spec (API contract, scan rules, error model,
performance, tests, self-loop scheduling), see
[rules/sync-rules.md](./rules/sync-rules.md).

## Borders

| Boundary | Permission |
|----------|-----------|
| `<project>/**` (workspace files) | read-only scan + read content |
| `API_X_TOKEN` env var | read-only access (required for upload) |
| Remote API `https://api.effiy.cn` | POST `/write-file`, `/read-file`, `query_documents`, `create_document`, `update_document` |
| `sync.mjs` and `lib/*.mjs` | execute (CLI invocation) |
| `rules/sync-rules.md` | read (reference for runtime details) |
| System files outside workspace | no access |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Manual trigger, no cron | Sync needs human confirmation — never auto-overwrite remote |
| 2 | Single-file failure does not block | Partial success > total failure |
| 3 | Concurrency ≤ 4 | Balance throughput and avoid API rate-limiting (429) |
| 4 | Path spaces → `_` | Remote URL-encoding compatibility |
| 5 | Project root via `.git` / `.claude` | Multi-project env — auto-detect boundary |
| 6 | Not restricted by `.gitignore` | Sync is not VCS — full inclusion |
| 7 | Token in repo / logs / docs 🚫 | P0 — never persist `API_X_TOKEN` |

## Supporting resources

- [sync.mjs](./sync.mjs) — executable entry: `node .claude/yry-import/sync.mjs [options]`
- [rules/sync-rules.md](./rules/sync-rules.md) — full operational spec: API
  contract, scan rules, error model, performance, tests, conflict resolution

## Fallback

| Situation | Behavior |
|-----------|----------|
| `API_X_TOKEN` missing | Stop upload (`no-token` degrade); still mark `docs_synced` |
| Scan root missing | Skip the entire sync; log error and exit 1 |
| Single file read/upload fail | Log error, continue with next file; final exit 1 if any failed |
| Network timeout / remote unreachable | 30s per file; log warning, doesn't block pipeline |
| `mode=pull` without args | Output recommend-mode hint, await confirmation |
| `mode=list` | Print file → remote path mapping; no HTTP request |
| Large file (>1MB) | Auto-skip, log warning; manual upload or compress |
| `mode=import` empty input | Default to `workspace=true` full sync |
