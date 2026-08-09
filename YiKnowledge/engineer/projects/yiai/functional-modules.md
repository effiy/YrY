---
title: YiAi Functional Module Inventory
aliases: [yiai-modules, yiai-functional-modules, yiai-domain-map]
tags: [yiai, modules, domain, services, routes, fastapi, rpc-envelope]
category: engineer/projects/yiai
created: 2026-08-03
updated: 2026-08-07
source: ../../YiAi/CLAUDE.md
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, new-hire]
benefit: "Engineers understand YiAi functional module boundaries, responsibilities, and dependencies"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./architecture.md
  - ./engineering/claude.md
  - ../yivad/functional-modules.md
  - ../yipet/functional-modules.md
---

# YiAi Functional Module Inventory

> **As an** engineer, **I want to** see the functional modules, **so that** project context is preserved.

## Summary

YiAi uses a three-layer mapping `domain/ → services/ → server/routes/`: each business domain lands its business logic in `domain/<name>/`, gets wrapped by `services/<name>/` for routes to call, and registers its HTTP entry in `server/routes/<name>.py`. Currently 10 domains, 7 services, 13 route modules. Cross-project calls go through a unified RPC envelope `{module_name, method_name, parameters}`. Standard action for adding a capability: land changes in all three directories in sync and converge public APIs in `__init__.py` / `engine.py`.

## Core viewpoints

- **The three-layer mapping is load-bearing** — `domain/` owns the logic, `services/` wraps it, `server/routes/` exposes HTTP; any missing layer in a new domain leaves a gap.
- **Public APIs converge in `__init__.py` or top-level module** — Callers only see the public API; internal files (`local.py` / `storage.py` / `client.py` / `paths.py` etc.) must not be imported directly.
- **Route files are thin, no business logic** — `server/routes/<name>.py` only parses the Pydantic request model + calls services + wraps the unified response; business logic stays in domain.
- **The cross-project RPC envelope is the single external contract** — YiVad / YiPet both call via `{module_name: "services.<domain>.<service>", method_name, parameters}` to avoid opening a new route per method.
- **`services/` and `domain/` counts need not match** — A domain that needs independent storage / scheduling etc. will grow extra services (e.g. `services/storage/` for OSS, with no domain).

## Key information

### Domain layer (10 domains)

| Domain | Public API | Internal files | Responsibility |
|---|---|---|---|
| `domain/ai/` | `chat.py` | — | Ollama LLM chat (incl. SSE streaming) |
| `domain/auth/` | JWT + bcrypt helpers | — | Auth utilities (disabled by default) |
| `domain/execution/` | `executor.py` | — | Generic module execution (sandbox entry) |
| `domain/files/` | `__init__.py` re-exports `read_file` / `write_file` / `delete_file` / `rename_file` / `delete_folder` / `rename_folder` / `upload_image` | `local.py`, `storage.py`, `paths.py` | Dual-write file persistence (disk + MongoDB `static_files`) |
| `domain/knowledge/` | `scanner.py` (tree scan + frontmatter) + `watcher.py` (apscheduler polling) + `writer.py` (markdown write-back) | — | Mirror the YiKnowledge markdown tree to MongoDB `knowledge_files` |
| `domain/rag/` | `engine.py` (`rag_query` / `rag_chat_stream` / `rag_file_query` / `rag_file_chat_stream`) + `indexer.py` (`get_kb_index` / `build_file_index`) + `settings.py` + `paths.py` | — | RAG engine (llama_index hybrid retrieval + rerank + reference numbering) |
| `domain/rss/` | `feed.py` + `scheduler.py` | — | RSS aggregation + scheduling |
| `domain/search/` | search helpers | — | Generic search (distinct from rag: search does not go through the LLM) |
| `domain/state/` | state-record CRUD | — | App state records |
| `domain/wework/` | `__init__.py` re-exports `send_message` | `client.py` | WeCom message push |

### Service layer (7 services)

| Service | Public API | Corresponding domain |
|---|---|---|
| `services/ai/` | `chat_service.py` | `domain/ai/` |
| `services/database/` | `data_service.py` (`query_documents` / `create_document` / `update_document` / `delete_document`) + `session_service.py` | `data/` singleton |
| `services/execution/` | `executor.py` | `domain/execution/` |
| `services/knowledge/` | `knowledge_service.py` (scan / read / write / metadata CRUD) | `domain/knowledge/` |
| `services/rag/` | `rag_service.py` (wraps `domain/rag/engine.py` for routes) | `domain/rag/` |
| `services/rss/` | `feed_service.py` + `rss_scheduler.py` | `domain/rss/` |
| `services/storage/` | `oss_client.py` | — (cross-cutting OSS, no domain) |

### Route layer (13 route modules)

`server/routes/`: `about.py` / `auth.py` / `execution.py` / `files.py` / `health.py` / `knowledge.py` / `maintenance.py` / `rag.py` / `search.py` / `state.py` / `system.py` / `users.py` / `wework.py`. `src/app.py` registers all routes + lifecycle.

### Data layer (cross-cutting, 4 files)

| File | Responsibility |
|---|---|
| `data/database.py` | MongoDB singleton: `find_one` / `find_many` / `insert_one` / `insert_many` / `update_one` / `delete_one` |
| `data/repository.py` | `query_documents` / `get_document_detail` / `create_document` / `update_document` / `delete_document` (incl. `_build_filter` turning parameters into Mongo filters) |
| `data/sessions.py` | Session collection access |
| `data/store.py` | Generic state storage |

### Shared layer (cross-cutting)

`shared/`: `config.py` (pydantic-settings + YAML load) / `response.py` (unified response wrapper `{code, message, data}`) / `error_codes.py` (`ErrorCode` enum + `BusinessException`) / `logging.py` / `utils.py`.

### Models layer

`models/`: Pydantic schema + MongoDB collection-name constants.

### Cross-project RPC contract (most-called)

| Method | Parameters shape | Common pitfall |
|---|---|---|
| `services.database.data_service.query_documents` | `{cname|collection_name, filter?, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType?}` | `filter` is not `query`; `query` is silently dropped |
| `services.database.data_service.create_document` | `{cname, data}` | — |
| `services.database.data_service.update_document` | `{cname, key, data}` | — |
| `services.database.data_service.delete_document` | `{cname, key}` | — |
| `services.ai.chat_service.chat` | `{model, messages, stream: true, system?, images?}` | SSE streaming; `stream: true` is mandatory |
| `services.knowledge.knowledge_service.*` | scan / read / write / metadata shapes vary | `target_file` is not `path` |
| `services.rag.rag_service.*` | `{question, scope?}` / `{messages, scope?}` / per-file variants | `scope` filters by `file_path` substring |

## Action recommendations

1. **New domain landing trio** — `domain/<name>/` (incl. public API) + `services/<name>/<name>_service.py` + `server/routes/<name>.py`; register the route in `src/app.py`.
2. **Converge public APIs** — When a domain has multiple internal files, write an `__init__.py` re-export (see `domain/files/`, `domain/wework/`).
3. **Routes must not contain business logic** — `server/routes/*.py` only parses the request + calls the service + wraps the response; business logic belongs in domain.
4. **Prefer extending services for cross-project capabilities** — Do not open a new `/xxx` route for a single capability; prefer extending `services.<domain>.<service>.<method>`, automatically visible to YiVad / YiPet.
5. **Cross-cutting capabilities land in services/** — Cross-cutting concerns not belonging to any domain (OSS / scheduling) land in `services/<name>/`, no domain is allowed.
6. **Do not speculatively add methods to the data layer** — Add only when a caller actually needs it (see the 2026-07-28 `find_many` / `delete_one` patch history).

## Anti-patterns

- **Routes call `data/` directly** — Skips the services / domain layers; later data-source replacement will pull in routes.
- **Directly importing internal files across `__init__.py`** — Callers bypass the public API; later refactoring of internal files breaks callers.
- **`domain/` imports `server/`** — Reverse dependency; server depends on domain, not the other way around.
- **Opening a new route instead of extending a service** — Route count inflates and contracts scatter; prefer extending a service method via the RPC envelope.
- **Mixing sync / async** — FastAPI is fully async; sync libraries like `requests`, `pymongo` must not enter the hot path.
- **Calling `query_documents` with the `query` field** — Silently drops the filter; must use `filter`.
- **Calling `/read-file` / `/write-file` with the `path` field** — 422; must use `target_file`.

## Related

- [YiAi architecture overview](./architecture.md) — layering / data flow / degradation
- [YiAi development standards](./dev-standards.md)
- [YiVad functional module inventory](../yivad/functional-modules.md) — frontend caller perspective
- [YiPet functional module inventory](../yipet/functional-modules.md) — browser extension caller perspective
- [llama_index evolution tracking](../../../ai-engineer/platform/llama-index-evolution.md) — the base of `domain/rag/`
- [Pi Agent Harness evolution tracking](../../engineering/pi-agent-harness-evolution.md) — agent runtime candidate
