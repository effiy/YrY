---
lifecycle: active
title: YiAi Engineering — CLAUDE.md
status: stable
type: summary
category: engineer/projects/yiai/engineering
tags: []
created: 2026-08-03
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"review_cycle: quarterly
tacit: false
related:
  - ./readme.md
  - ../README.md
---

# CLAUDE.md — YiAi

> **As an** engineer，**I want to** claude，**so that** project context preserved。

> FastAPI backend server for the Yi family. Provides AI chat (Ollama), file management with dual-write persistence, RSS aggregation, WeCom messaging, generic module execution, and a state-store. Runs on uvicorn (ASGI), MongoDB via Motor (async).

## Summary

- YiAi is the backend server for the Yi family, running on uvicorn at port 10086, with MongoDB via Motor (async), Ollama for LLM inference, and llama_index for RAG — the RPC envelope is its most important architectural decision
- The domain/services/server layering is correct but has zero test coverage and no linting — the `pytest` and `ruff` gaps are structural risks that make every refactor a gamble
- Dual-write persistence (disk primary + MongoDB best-effort) is not transactional; the knowledge watcher uses apscheduler polling because macOS FSEvents silently drops events; MongoDB as the sole persistent store has no cache layer
- The `_build_filter` parameter names are load-bearing: `filter` (not `query`), `target_file` (not `path`), `cname`/`collection_name` — past bugs have come from callers using the wrong name
- Recent changes: RAG + Knowledge modules (hybrid retrieval + inline citations + markdown watcher), data layer bug fixes (missing `find_many`/`delete_one` wrappers, list filter silently dropped), and cross-project protocol hygiene documentation

## Core viewpoints

**The RPC envelope is the single most important architectural decision in the Yi family.** Every cross-project call goes through `{module_name, method_name, parameters}` POSTed to `/`. This single shape eliminates the need for per-feature endpoints, reduces API surface area, and makes the execution engine a universal gateway. The cost is that parameter name contracts (`filter` not `query`, `target_file` not `path`) must be documented and enforced across three codebases. A single mismatch silently breaks functionality.

**Dual-write persistence is a pragmatic trade-off, not a pattern to emulate.** Writing to local disk first (primary) and MongoDB second (best-effort backup) gives YiAi fast reads and a fallback. But it is not transactional -- there is no two-phase commit, and the MongoDB backup can lag behind or fail silently. This works for a single-developer project but would be a liability in a multi-writer system. Treat it as a stopgap, not a permanent architecture.

**The domain/services/server layering is correct but the "no test framework" gap is a ticking time bomb.** The layered architecture (domain owns logic, services wraps for routes, server handles HTTP) is clean and enforces separation of concerns. But with zero test coverage, every refactor is a gamble. The `pytest` ADR exists but has not been implemented. The first production incident caused by a refactored domain function will make the case for tests more forcefully than any ADR.

**The knowledge watcher's polling fallback is a lesson in platform-specific failure modes.** macOS FSEvents silently drops events on this machine, so the watcher uses apscheduler polling every 5 seconds. This is a reminder that platform-level APIs (filesystem events, kernel notifications) are not universally reliable, and every file-watching feature needs a polling fallback. The polling interval is a trade-off between responsiveness and CPU usage.

**MongoDB as the sole persistent store creates a single point of failure with no cache layer.** When MongoDB is unreachable, writes fail fast and reads return empty results. There is no read cache, no write buffer, and no graceful degradation beyond returning errors. For a backend that serves chat, file management, and knowledge base operations, this means every feature is gated on MongoDB availability. A read-through cache for frequently accessed knowledge files would be a high-ROI reliability improvement.

---

## Table of Contents

- [Foundational Beliefs](#foundational-beliefs)
- [Iron Laws](#iron-laws)
- [Architecture Direction](#architecture-direction)
- [Project Profile](#project-profile)
- [Project Structure](#project-structure)
- [Module Boundaries](#module-boundaries)
- [Data Flow](#data-flow)
- [Project Constraints](#project-constraints)
- [Degradation Countermeasures](#degradation-countermeasures)
- [Self-Constraints](#self-constraints)
- [Recent Changes](#recent-changes)
- [Guidance](#guidance)

---

## Foundational Beliefs

- **Trust the model** — When the model produces a reasonable response, do not second-guess it with redundant validation unless the outcome is destructive.
- **Value attention** — Be aware of context-window economics. Prefer concise code and avoid verbose scaffolding. Every token spent on boilerplate is a token not spent on the problem.
- **Verify reality** — The code on disk is the only truth. Do not assume a module exists or behaves a certain way without reading it.
- **Think before coding** — Don't assume, surface tradeoffs. State assumptions explicitly; if multiple interpretations exist, present them; if a simpler approach exists, say so.

## Iron Laws

1. **Simplicity first** — Minimum code, nothing speculative. No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenes.
2. **Surgical changes** — Touch only what you must. Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
3. **Goal-driven execution** — Define success criteria, loop until verified. Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.
4. **No silent writes** — Read the file before editing it. Use existing conventions (snake_case, FastAPI patterns, dual-write model). Do not introduce new patterns without explicit reason.

## Architecture Direction

> **Modularization.**
>
> YiAi is a FastAPI backend server. The direction is toward tighter module boundaries: each domain sub-package (`domain/ai/`, `domain/files/`, `domain/rss/`, `domain/wework/`, `domain/execution/`, `domain/auth/`, `domain/state/`) owns its logic; the `services/` layer wraps them for routes. New features should land in named domain modules with a clear public API surface (an `__init__.py` exporting the callable contract), rather than scattering handlers across existing files.
>
> Reference: [../../rules/architecture-direction.md](../../../../../.claude/skills/yry-init/rules/architecture-direction.md)

## Project Profile

| Dimension | Value |
|-----------|-------|
| Name | YiAi |
| Type | Backend |
| Version | 1.0.0 |
| Architecture | Single `src/` tree, no nested packages |
| Ecosystem | Python 3.10+ / FastAPI |
| Runtime | uvicorn (ASGI), port 10086 |
| Database | MongoDB via Motor (async) |
| Self-hosted | Ollama (LLM inference), OSS (object storage), llama_index (RAG) |
| Auth | bcrypt + PyJWT (optional X-Token header) |
| Config | `config.yaml` + pydantic-settings |
| Knowledge base | `../YiKnowledge` markdown tree, apscheduler watcher (poll fallback for macOS FSEvents) |
| Test framework | None (add `pytest` + `httpx` when coverage becomes a priority) |
| Lint / format | None (add `ruff` when code style drift becomes a problem) |

## Project Structure

```
src/
├── app.py              # FastAPI app factory + lifecycle
├── shared/             # Cross-cutting (config, response, error_codes, logging, utils)
├── data/               # MongoDB access (database singleton, repository, sessions, store)
├── models/             # Pydantic schemas + collection name constants
├── domain/             # Business logic — ai/ auth/ execution/ files/ knowledge/ rag/ rss/ state/ wework/
├── services/           # Service layer — ai/ database/ execution/ knowledge/ rag/ rss/ storage/
└── server/             # HTTP layer — middleware, errors, routes/
```

## Module Boundaries

Every caller outside a domain package depends only on that package's public API surface. Internal files stay private.

| Module | Public API | Internal (do not import directly) |
|---|---|---|
| `domain/ai/` | `chat.py` | — |
| `domain/auth/` | JWT + bcrypt helpers | — |
| `domain/execution/` | `executor.py` | — |
| `domain/files/` | `__init__.py` re-exports `read_file`, `write_file`, `delete_file`, `rename_file`, `delete_folder`, `rename_folder`, `upload_image` | `local.py`, `storage.py`, `paths.py` |
| `domain/knowledge/` | `scanner.py` (tree walk + frontmatter parse), `watcher.py` (apscheduler poll loop), `writer.py` (markdown write-back) | — |
| `domain/rag/` | `engine.py` (`rag_query`, `rag_chat_stream`, `rag_file_query`, `rag_file_chat_stream`), `indexer.py` (`get_kb_index`, `build_file_index`), `settings.py`, `paths.py` | — |
| `domain/rss/` | `feed.py`, `scheduler.py` | — |
| `domain/state/` | state-record CRUD helpers | — |
| `domain/wework/` | `__init__.py` re-exports `send_message` | `client.py` |
| `services/ai/` | `chat_service.py` | — |
| `services/database/` | `data_service.py` (`query_documents`, `create_document`, `update_document`, `delete_document`), `session_service.py` | — |
| `services/execution/` | `executor.py` | — |
| `services/knowledge/` | `knowledge_service.py` (scan / read / write / metadata CRUD) | — |
| `services/rag/` | `rag_service.py` (wraps `domain/rag/engine.py` for routes) | — |
| `services/rss/` | `feed_service.py`, `rss_scheduler.py` | — |
| `services/storage/` | `oss_client.py` | — |
| `data/` | `database.py` (MongoDB singleton: `find_one`, `find_many`, `insert_one`, `insert_many`, `update_one`, `delete_one`), `repository.py` (`query_documents`, `get_document_detail`, `create_document`, `update_document`, `delete_document`), `sessions.py`, `store.py` | — |

### Cross-project protocol

The "RPC envelope" used by both YiPet and YiVad:

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

| Method | Contract |
|---|---|
| `data_service.query_documents` | `parameters: { cname | collection_name, filter?: dict, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }`. The `filter` dict is merged into the Mongo query via `_build_filter`. **Do NOT use `query` — it is silently ignored.** |
| `data_service.create_document` | `parameters: { cname, data }` |
| `data_service.update_document` | `parameters: { cname, key, data }` |
| `data_service.delete_document` | `parameters: { cname, key }` |
| `/read-file`, `/write-file` | `target_file` (not `path`), `content`, optional `is_base64` |
| `/upload-image-to-oss` | `data_url`, `filename`, `directory` |

## Data Flow

### Generic RPC

```
YiPet / YiVad
   │ fetch() POST /  body: {module_name, method_name, parameters}
   ▼
FastAPI root route handler
   │ resolves module → Python module, method → callable, parameters → kwargs
   ▼
services.<domain>.<service>.<method>(**parameters)
   │ (if data_service.query_documents)
   │   pops `filter`, merges into query_params
   │   pops pageNum/pageSize/limit/page/fields/exclude/orderBy
   │   _build_filter(query_params) → Mongo filter dict
   │   collection.find(filter_dict, projection).sort().skip().limit()
   ▼
MongoDB (Motor async)
   ▼
{ list: [...], total, pageNum, pageSize, totalPages }
```

### Chat SSE

```
client  fetch POST /  body: {services.ai.chat_service.chat, stream:true}
   ▼
chat_service.chat()  →  StreamingResponse(text/event-stream)
   yields: data: {"data": {"message": "..."}}\n\n
   ends:   data: {"done": true}\n\n
   ▼
Ollama (http://localhost:11434/api/chat)
```

### Dual-write file persistence

```
POST /write-file {target_file, content}
   │ 1. write local disk (primary — returns failure if this fails)
   │ 2. best-effort upsert to MongoDB static_files (backup)
   ▼
success
```

## Project Constraints

### Non-Negotiable Baselines

| Entry point | `main.py` (dev) or `uvicorn src.app:app` (prod) |
|---|---|
| Configuration | `config.yaml` + pydantic-settings (flat YAML keys mapped via `YamlConfigSettingsSource`) |
| Language | Python 3.10+ (prefer async throughout — no sync/async mix) |
| File naming | snake_case |
| Auth model | Optional X-Token header verification (disabled by default) |
| File persistence | Dual-write: disk (primary) + MongoDB (backup, best-effort upsert) |
| Static files | Served at `/static`, base dir configurable via `static.base_dir` |
| API response | Unified envelope: `{ "code": int, "message": str, "data": any }` |
| Error handling | Typed `ErrorCode` enum in `src/shared/error_codes.py`; `BusinessException` raised from domain layer |
| SSE streaming | Chat and execution endpoints return `text/event-stream` with incremental `data:` frames |
| Retry policy | `tenacity` for transient failures (network, MongoDB, Ollama) |
| Degradation | MongoDB unavailable → writes fail; auth disabled → no gate; observer disabled → no runtime guard |

### Self-constraints

- **No test framework configured** — add `pytest` + `httpx` for integration testing when coverage becomes a priority.
- **No linting or formatting enforcement** — add `ruff` when code style drift becomes a problem.

## Degradation Countermeasures

| Condition | Behavior |
|-----------|----------|
| MongoDB unreachable | Writes fail fast; reads return empty results (no cache layer) |
| Ollama unreachable | Chat endpoints return `ErrorCode.AI_UNAVAILABLE`; image processing endpoints return 503 |
| OSS bucket unreachable | File storage falls back to local disk only (Dual Write degrades to single write) |
| Auth disabled (default) | No gate; all endpoints public |
| Observer disabled | No throttle / sampler / sandbox / reentrancy protection |

## Self-Constraints

- **Domain layer owns logic.** Routes never call `data/` directly — they go through `services/`. Domain packages never import `server/`.
- **Public API surface is `__init__.py`** for domain packages that have one (`domain/files/`, `domain/wework/`). Callers use the re-exports, not internal files.
- **`MongoDB` singleton wrappers only grow when callers need them.** Don't add `update_one` speculatively — only when a caller actually needs it (see 2026-07-28 fix where `find_many`/`delete_one` were added in response to `domain/files/storage.py` callers).
- **`_build_filter` parameter names are load-bearing.** `filter` (not `query`), `target_file` (not `path`), `cname`/`collection_name`. Past bugs have come from callers using the wrong name.

## Recent Changes

### 2026-07-31 — RAG + Knowledge modules

- **`domain/rag/` + `services/rag/`**: New RAG (retrieval-augmented generation) module built on `llama_index`. `engine.py` exposes `rag_query`, `rag_chat_stream` (SSE), `rag_file_query`, `rag_file_chat_stream`. Hybrid retrieval (vector + BM25 via `QueryFusionRetriever`), optional `LLMRerank`, inline citation numbering via `_NumberSourcesPostprocessor`. Scope filtering by `file_path` substring. Persisted index at `./data/rag_store`. Configured under `rag:` section in `config.yaml` (embed/llm models, top_k, chunk_size, hybrid/retrieval toggles).
- **`domain/knowledge/` + `services/knowledge/`**: Knowledge-base management module. `scanner.py` walks `../YiKnowledge` markdown tree with frontmatter parsing, `watcher.py` polls via apscheduler (macOS FSEvents is broken — see `YiKnowledge/lessons/gotchas/macos-fsevents-silent-drop.md`), `writer.py` performs markdown write-back with metadata upsert to MongoDB `knowledge_files` collection.
- **`config.yaml`**: Added `knowledge` (base_dir, watcher_enabled, watcher_poll_seconds) and `rag` (models, top_k, chunk_size, hybrid/retrieval/rerank/citations toggles) sections.
- **`server/routes/`**: Added `knowledge.py` and `rag.py` route modules; registered in `src/app.py`.

### 2026-07-28 — Bug fixes (data layer)

- **`data/database.py`**: Added missing `find_many` and `delete_one` wrappers to the `MongoDB` singleton. Previously `domain/files/storage.py` (`delete_oss_file`, `delete_file_tags`, `get_all_tags`) called them but they were undefined → `AttributeError` at runtime.
- **`data/repository.py`**: Fixed `_handle_range_or_list_filter` so a 2-element list of strings no longer silently drops the filter. Previously, `tags: ["work", "personal"]` returned ALL docs because neither element parsed as a date/number and the function returned `True` without setting `filter_dict[key]`. Now falls through to `{'$in': value_list}`.

### 2026-07 — Cross-project protocol hygiene

- Documented the `filter` (not `query`) contract — YiPet's `SessionService.list/get` was sending `query:` and getting empty results. Fixed in YiPet.
- Documented the `target_file` (not `path`) contract — YiVad's `fileService.readFile/writeFile` was sending `path` and getting 422s. Fixed in YiVad.

## Action recommendations

1. **Add a `pytest` test that sends `query` (the wrong parameter name) to `query_documents` and asserts that it returns all documents, not an error.** This is the silent failure that has bitten both YiPet and YiVad. The test should exist as a regression guard: if the backend ever adds validation that rejects unknown parameter names, this test will break, and the breaking change must be communicated to all consumers before it lands. The test is 5 lines of code and prevents cross-project outages.

2. **Implement a `MongoDB` connection health check in the FastAPI lifespan that verifies the database is reachable before the server starts accepting requests.** Currently, if MongoDB is unreachable at startup, the server starts successfully and fails on the first request. A startup health check that pings MongoDB and logs a clear error message ("MongoDB unreachable at mongodb://localhost:27017 -- server starting in degraded mode") gives the operator immediate visibility into the degraded state.

3. **Create a `test_contract.py` file in `tests/integration/` that validates every entry in the cross-project protocol table against the actual API behavior.** The table documents that `filter` is the correct parameter name, `target_file` is the correct field name, and `cname`/`collection_name` are interchangeable. A contract test that verifies each of these assertions programmatically turns documentation into enforcement. Run this test in CI and block merge on failure.

4. **Replace the dual-write persistence model with a transactional write-ahead log within the next quarter.** The current "write to disk first, MongoDB best-effort" model is not transactional and can silently lose data. A write-ahead log (WAL) that records every write operation before applying it to both disk and MongoDB would provide atomicity and allow replay of failed MongoDB writes. This is a larger engineering effort but addresses the most significant architectural risk in the current design.

5. **Add a `check_async` lint rule (via ruff plugin) that flags any synchronous blocking call in an async function.** The "no mixing sync and async" rule is documented but unenforced. A single `time.sleep(1)` in an async route handler blocks the entire event loop. A ruff plugin that detects `time.sleep`, synchronous file I/O, and blocking HTTP calls in async contexts would catch this at commit time. The rule should be enabled as a warning initially, then escalated to error after the team has fixed existing violations.

## Anti-patterns

- **Calling `data/` directly from routes instead of going through `services/`.** The architecture requires routes -> services -> domain -> data. Bypassing the service layer creates tight coupling between HTTP handlers and database access, making it impossible to swap data sources, add caching, or test routes in isolation. Every route must call a service function, never a repository method directly.

- **Speculatively adding methods to the `MongoDB` singleton.** The `MongoDB` class wraps Motor's async driver. Adding wrapper methods (like `update_one`) before any caller needs them creates dead code and a maintenance burden. The 2026-07-28 fix where `find_many` and `delete_one` were added reactively (in response to actual caller needs) is the correct pattern: grow the singleton only when a caller requires it.

- **Using `query` instead of `filter` in `query_documents` parameters.** The backend's `_build_filter` function reads the `filter` key, not `query`. Passing `query` silently returns all documents with no error. This has caused bugs in both YiPet and YiVad. Always use `filter` in the parameters dict.

- **Mixing sync and async code in the same call chain.** YiAi uses Motor (async MongoDB driver) and FastAPI (async framework). Introducing a synchronous blocking call (e.g., `time.sleep`, synchronous file I/O) in an async handler blocks the entire event loop. All I/O in route handlers and service functions must be async.

- **Adding a new feature by scattering handlers across existing files instead of creating a named domain module.** The architecture direction is toward modularization. New features should land in `domain/<name>/` with a clear `__init__.py` public API, then be wrapped by `services/<name>/` and exposed via `server/routes/<name>.py`. Scattering handlers across existing files creates the "god module" anti-pattern and makes the codebase progressively harder to navigate.

## Guidance

| Resource | Location |
|----------|---------|
| Project README | `README.md` |
| Server config | `config.yaml` |
| Route definitions | `src/server/routes/` |
| Domain logic | `src/domain/` |
| Service layer | `src/services/` |
| Data access | `src/data/` |
| Shared utilities | `src/shared/` |
| Data models | `src/models/` |
| Error codes | `src/shared/error_codes.py` |
| Response wrapper | `src/shared/response.py` |
| App factory | `src/app.py` |
| Architecture-direction rule | `../../rules/architecture-direction.md` |

## Related

- [YiAi README](./readme.md) — YiAi engineering README with project overview
- [YiAi architecture](../architecture.md) — YiAi backend architecture overview
- [YiAi dev standards](../dev-standards.md) — YiAi development standards and conventions
- [YiVad CLAUDE.md](../../yivad/engineering/claude.md) — YiVad frontend CLAUDE.md, the companion project
- [YiPet CLAUDE.md](../../yipet/engineering/claude.md) — YiPet extension CLAUDE.md, the third Yi-family project
