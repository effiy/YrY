---
title: YiAi development standards
aliases: [yiai-dev-standards, yiai-coding-conventions, yiai-backend-standards]
tags: [yiai, dev-standards, conventions, fastapi, python, lint, testing, commit]
category: engineer/projects/yiai
created: 2026-08-03
updated: 2026-08-07
source:../../YiAi/CLAUDE.md
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer]
benefit: "Engineers follow YiAi coding standards, conventions, and development workflow"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./architecture.md
 - ./functional-modules.md
 - ./engineering/claude.md
 - ../yivad/dev-standards.md
 - ../yipet/dev-standards.md
---

# YiAi development standards

> **As an** engineer, **I want to** dev standards, **so that** project context preserved.

## Summary

YiAi is a Python 3.10+ FastAPI backend. Naming: files / functions / variables use snake_case; classes use PascalCase; constants use UPPER_SNAKE. Layering hard constraints: routes must not call `data/` directly, domain must not import `server/`, callers must not bypass `__init__.py` to import internal modules. RPC field names are load-bearing: `filter` not `query`, `target_file` not `path`, `cname` / `collection_name` are equivalent. Currently **no lint / format / test infrastructure** — introduce `ruff` + `pytest` + `httpx` when style drift or coverage becomes a pain. Submission spec not yet set (no commitlint), but Conventional Commits is the de facto convention. Supply-chain hardening has a large gap (`requirements.txt` not pinned); borrow the pi checklist.

## Core viewpoints

- **Layering is a hard constraint** — `server/routes/` does not call `data/`; `domain/` does not import `server/`; callers go through `__init__.py` public API.
- **Everything async** — FastAPI is all-async; `requests` / `pymongo` and other sync libs are forbidden in hot paths; use `httpx.AsyncClient` / `motor`.
- **Field names are load-bearing** — `filter` / `target_file` / `cname` are contract names settled after historical pain; do not change.
- **Unified response envelope** — all RPC returns `{code: int, message: str, data: any}`; errors use `BusinessException` + `ErrorCode` enum.
- **SSE streaming is the default** — chat / execution / RAG chat all use `text/event-stream`; frame format `data: {"data": {"message": "..."}}` + terminal frame `data: {"done": true}`.
- **Dual-write is a hard constraint** — file persistence goes through `domain/files/`; disk failure means total failure; MongoDB is best-effort backup.
- **Lint / tests missing is a known gap** — do not pretend to have them; introduce when drift or coverage becomes a pain.

## Key information

### Naming spec

| Category | Spec | Example |
|---|---|---|
| File names | snake_case | `chat_service.py`, `error_codes.py` |
| functions / variables | snake_case | `query_documents`, `filter_dict` |
| classes | PascalCase | `MongoDB`, `BusinessException`, `ErrorCode` |
| constants | UPPER_SNAKE | `DEFAULT_PAGE_SIZE`, `AI_UNAVAILABLE` |
| module paths | snake_case sub-packages | `domain/ai/`, `services/database/` |
| Collection names | snake_case strings | `sessions`, `static_files`, `knowledge_files`, `bugs` |
| Pydantic models | PascalCase + suffix `Request` / `Response` | `FileReadRequest`, `ChatResponse` |

### Layering rules

| Rule | Explanation |
|---|---|
| Routes must not call `data/` directly | Must go through `services/` → `domain/` → `data/`; new routes violating this will be rejected in review |
| `domain/` must not import `server/` | Reverse dependency; server depends on domain, not vice versa |
| Callers go through `__init__.py` | Domains (`domain/files/`, `domain/wework/`) re-export their public API; callers only use re-exported APIs; internal modules (`local.py`, `storage.py`, `client.py`, `paths.py`) must not be imported directly |
| `data/` does not speculatively add methods | Only add when a caller has a real need (see 2026-07-28 `find_many` / `delete_one` history) |

### Cross-project RPC field contract

| Field | Purpose | Common pitfall |
|---|---|---|
| `filter` | Mongo query-condition dict | Not `query`; `query` is silently dropped by `_build_filter` |
| `target_file` | File path (read / write) | Not `path`; `path` triggers 422 |
| `cname` / `collection_name` | MongoDB collection name | Pick one; the backend accepts both |
| `pageNum` / `pageSize` / `limit` | Pagination params | 1-based page + size; `limit` overrides pageSize |
| `fields` / `excludeFields` | Projection control | Pick one; if both given, `fields` takes precedence |
| `orderBy` / `orderType` | Sorting | `orderType: asc|desc` |
| `stream: true` | SSE streaming flag | Required for chat |
| `system` / `images` | Chat system prompt / multimodal images | Optional |

### Responses and errors

| Item | Spec |
|---|---|
| Success response | `{code: 0, message: "ok", data: <any>}` |
| Business error | raise `BusinessException(ErrorCode.XXX, message=...)` |
| Error codes | `ErrorCode` enum in `src/shared/error_codes.py` |
| HTTP status codes | mapped at the route layer; business errors usually 400 / 422 / 503 |
| 401 | auth failure (when auth enabled) |
| 503 | AI_UNAVAILABLE (Ollama unreachable) |

### SSE streaming spec

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache

data: {"data": {"message": "chunk1"}}

data: {"data": {"message": "chunk2"}}

data: {"done": true}
```

- Per-frame `data: {"data": {"message": "..."}}`
- Terminal frame `data: {"done": true}`
- Interrupt: client drops TCP or server raises exception → `StreamingResponse` ends naturally
- `signal: AbortController` passed by the client

### Config spec

| Item | Spec |
|---|---|
| Config source | `config.yaml` + environment variables (pydantic-settings) |
| Loading | `YamlConfigSettingsSource` maps flat YAML keys to Settings fields |
| New config item | add field in `src/shared/config.py` + key in `config.yaml` + default value |
| Sensitive config (API key / token) | via environment variable; do not put in `config.yaml` |

### Submission and version control

| Item | Current state | Expected |
|---|---|---|
| Commit spec | no commitlint; de facto convention is Conventional Commits | introduce commitlint + cz-git (reference YiVad) |
| Branching strategy | mainline `master` | keep |
| Pre-commit hook | none | introduce `pre-commit` + `ruff` + `pytest --no-cov` |
| Lockfile | none (`requirements.txt` flat) | introduce `uv` / `pip-tools` to generate lockfile + `pip-audit` |
| Dependency pinning | none | borrow pi checklist: `save-exact` + `min-release-age` equivalent strategy |

### QA spec

| Item | Current state | Expected |
|---|---|---|
| framework | none | introduce `pytest` + `httpx` (async-test FastAPI) |
| unit tests | none | domain-layer unit tests (mock MongoDB) |
| integration tests | none | `httpx.AsyncClient` + real MongoDB (docker-compose) |
| coverage | none | prioritize RPC contract (`filter` / `target_file` / `cname`) and `_build_filter` boundaries |
| evaluation | none | RAG recall evaluation (`llama-datasets` + `ragas`) |

### Docs spec

| Item | Spec |
|---|---|
| Project README | `YiAi/README.md` — project overview + quick start |
| Project CLAUDE.md | `YiAi/CLAUDE.md` — architecture + module boundaries + data flow + degradation + self-constraints + Recent Changes |
| Knowledge-base mirror | `YiKnowledge/engineer/projects/yiai/engineering/{claude,readme}.md` — after editing the original project, `cp` to sync |
| New RPC method | must register in CLAUDE.md "Cross-project protocol" table with parameter shape + pitfalls |
| New domain | must register in CLAUDE.md "Module Boundaries" table with public API + internal modules |

### Async and retry

| Item | Spec |
|---|---|
| Async | all async; sync libs forbidden in hot path |
| Retry | `tenacity` retries transient faults (network / MongoDB / Ollama) |
| Timeout | `httpx.AsyncClient` default timeout; Ollama calls explicit timeout |
| Retry backoff | exponential backoff; max 3 retries |

### Auth spec

| Item | Spec |
|---|---|
| Model | optional `X-Token` header (off by default) |
| Implementation | bcrypt + PyJWT |
| Enable | `auth.enabled: true` in `config.yaml` |
| Token | JWT issued + `X-Token` header validation |
| When disabled | all endpoints public |

## Action recommendations

1. **New domain lands the three-piece set** — `domain/<name>/` + `services/<name>/<name>_service.py` + `server/routes/<name>.py`; register in both CLAUDE.md tables.
2. **New RPC method** — lands in `services.<domain>.<service>.<method>`; add a row to CLAUDE.md "Cross-project protocol" table; field names follow the contract.
3. **New collection** — add collection-name constant in `models/`; `data/repository.py` unchanged.
4. **New SSE endpoint** — reuse `StreamingResponse(text/event-stream)` + frame `data: {"data": {"message":...}}` + terminal `data: {"done": true}`.
5. **New config item** — add field in `shared/config.py` + key in `config.yaml` + default value; sensitive items via env var.
6. **Introduce lint** — when style drifts add `ruff` + `pre-commit`; rules reference `ruff.toml` (present but not enabled).
7. **Introduce tests** — when coverage hurts add `pytest` + `httpx`; prioritize RPC contract + `_build_filter` boundaries + RAG recall.
8. **Supply-chain hardening** — borrow from pi: `uv` / `pip-tools` for lockfile + `pip-audit` + `pre-commit` to block bad lockfile commits + min-release-age equivalent strategy.

## Anti-patterns

- **Routes calling `data/` directly** — bypassing the service and domain layers means any data-source swap (e.g., MongoDB to PostgreSQL) forces changes across every route. All data access must go through `services/` to `domain/` to `data/`, preserving the layering contract.

- **Importing internal modules by bypassing `__init__.py`** — when callers import `domain/files/local.py` directly instead of going through `domain/files/__init__.py`, any internal refactor of `local.py` breaks every caller. The `__init__.py` re-exports are the public API, and internal modules are private.

- **Using synchronous libraries in async FastAPI hot paths** — `requests` and `pymongo` block the asyncio event loop, causing the entire server to stall while waiting for a single I/O call. All I/O in hot paths must use async equivalents (`httpx.AsyncClient`, `motor`).

- **Using the wrong RPC field name** — passing `query` instead of `filter` causes `_build_filter` to silently drop the condition and return unfiltered results, while passing `path` instead of `target_file` triggers a 422 validation error. The field name contract is load-bearing and must never be violated.

- **Pretending that lint or test infrastructure exists** — documenting or claiming test coverage or lint enforcement when neither `ruff` nor `pytest` is configured creates false confidence and hides the real gap. The absence of tooling must be acknowledged as a known gap until it is actually introduced.

## Related

- [YiAi architecture](./architecture.md) — tech stack, layer boundaries, and domain/services/server layering
- [YiAi functional modules](./functional-modules.md) — domain modules, service wrappers, and route registrations
- [YiAi engineering CLAUDE.md](./engineering/claude.md) — project profile, module boundaries, cross-project protocol, and self-constraints
- [YiVad development standards](../yivad/dev-standards.md) — cross-project RPC field contract companion, SSE streaming standard
- [MongoDB query filter contract](../../infrastructure/mongodb-query-filter-contract.md) — `_build_filter` field name contract, collection naming, index strategy
