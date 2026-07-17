---
paths:
  - ".claude/rui-import/**"
  - ".claude/rui-import/SKILL.md"
description: "Rules for syncing documents to the remote API."
---

# rui-import Sync Rules

> Rules and constraints for syncing documents to the remote API, independent of implementation details.

## Sync Flow

```
Scan → Filter → Resolve remote paths → Fetch existing sessions → Upload per file → Create session → Summarize
```

### Detailed Steps

| Stage | Action | Description | Failure Handling |
|-------|--------|-------------|------------------|
| ① Scan | Recursively walk from project root | Not restricted by `.gitignore` | Unreadable directory → skip & log |
| ② Filter | Exclude `.git` / `node_modules` / `dist` / `.claude-plugin` and explicit `--exclude` | Hit → skip whole subtree | — |
| ③ Resolve | Compute local→remote path mapping | Separator unified to `/`, spaces replaced with `_` | Illegal path → skip & log |
| ④ Fetch | Remote query sessions | Used to distinguish `created` / `overwritten` | API unreachable → treat all as created |
| ⑤ Upload | POST per file | Concurrency limit 4; overwrite if exists, create otherwise | Single-file failure → log, continue |
| ⑥ Create | Append `create_document` session | Only for newly added paths | Session creation failure → log |
| ⑦ Summarize | Count created / overwritten / failed | Emit structured result | — |

## Project Root Detection

```
From cwd, walk up level by level. The first directory containing any of:
  - .git/
  - .claude/
is treated as the project root. Fallback: cwd.
```

## Scan Rules

- Walk recursively from project root, unrestricted by `.gitignore`
- All files included, no extension restriction
- Symlinks: follow (resolve to real path)
- Empty directories: skipped

## Filter Rules

| Excluded Dir | Reason | Effect |
|--------------|--------|--------|
| `.git/` | Version control — internal files have no sync value | Skip whole subtree |
| `node_modules/` | Dependencies — large, remote has its own | Skip whole subtree |
| `dist/` | Build output — reproducible from source | Skip whole subtree |
| `.claude-plugin/` | Plugin metadata — local only | Skip whole subtree |
| Explicit `--exclude` | User-specified — flexible exclusion | Skip matching paths |

## Path Mapping

| Local Path | Remote Path | Notes |
|------------|-------------|-------|
| `docs/story-task-panel/<name>/*` | `story-task-panel/<name>/*` | Story documents |
| `skills/*/SKILL.md` | `workspace/skills/<name>/SKILL.md` | Skill specs |
| `lib/*.mjs` | `workspace/lib/<name>.mjs` | Shared libraries |
| `CLAUDE.md` | `workspace/CLAUDE.md` | Project docs |
| Other files | `workspace/<relative-path>` | Generic mapping |

**Path conversion rules:**
- Separator unified to `/`
- Spaces replaced with `_`
- Chinese characters preserved
- Special characters URL-encoded

## Upload Strategy

| Condition | Behavior | Notes |
|-----------|----------|-------|
| Remote absent | Create (created) | POST |
| Remote present | Overwrite (overwritten) | PUT |
| Concurrency limit | 4 | Avoid API throttling |
| Single-file failure | Log error, continue | Partial success > total failure |
| Large file (>1MB) | Chunked upload | Avoid timeout |
| Timeout | 30s timeout, retry once | Network-jitter tolerance |

## Error Model

| Error Type | Severity | Handling |
|------------|:--------:|----------|
| File unreadable | Warning | Skip, log path |
| API unreachable | Critical | Abort, prompt to check network |
| API rate limit (429) | Warning | Wait for Retry-After, retry |
| Single-file upload failure | Warning | Log, continue |
| Session creation failure | Warning | Log, does not block upload |
| Illegal path | Info | Skip, log path |

## Core Rules

| # | Rule | Rationale | Violation Consequence |
|---|------|-----------|------------------------|
| 1 | Manual trigger, no cron | Sync needs human confirmation — never auto-overwrite remote | Unexpected remote overwrite |
| 2 | Single-file failure does not block | Partial success beats total failure | One file blocks the entire run |
| 3 | Concurrency ≤ 4 | Avoid API throttling — 4 balances speed & safety | Trigger 429 rate limit |
| 4 | Path spaces unified to `_` | Remote compatibility — spaces need URL encoding | Remote path inconsistency |
| 5 | Project root via `.git`/`.claude` | Multi-project environment — auto-detect boundary | Wrong scan scope |
| 6 | Not restricted by `.gitignore` | Full sync — gitignore is for VCS, not sync | Required files missed |