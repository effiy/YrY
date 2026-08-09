---
title: YiAi Architecture Overview
aliases: [yiai-architecture, yiai-backend-architecture]
tags: [yiai, architecture, backend, fastapi, modularization, rpc-envelope]
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
roles: [engineer, new-hire, tech-lead]
benefit: "Engineers understand YiAi system architecture, tech stack decisions, and integration patterns"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
- ./engineering/claude.md
  - ./engineering/readme.md
  - ../../../new-hire/onboarding/yiai--onboarding.md
  - ../../../ai-engineer/platform/inference-engine-comparison.md
  - ../../../ai-engineer/methodology/rag-design-patterns.md
---

# YiAi Architecture Overview

> **As an** engineer, **I want to** architecture, **so that** project context preserved.

## Summary

YiAi is the FastAPI backend base of the Yi family (YiAi / YiVad / YiPet). Single `src/` tree + domain-oriented `domain/` + service-oriented `services/` + data layer `data/`, exposed via a unified RPC envelope (`module_name / method_name / parameters`) for YiVad and YiPet to call. Runs on uvicorn ASGI (port 10086), MongoDB via Motor async access, Ollama self-hosted LLM inference, OSS object storage, llama_index provides RAG. Architecture direction: **backend modularization** (each domain subpackage encapsulates its own logic, public API converges to `__init__.py`).

## Core viewpoints

- **The RPC envelope is the only cross-project contract** — all cross-project calls go through `POST /` + `{module_name, method_name, parameters}`, avoiding opening a new route per method. Both YiVad and YiPet call by this contract.
- **Domain layer owns business logic, services layer wraps for route calls, data layer only handles MongoDB access** — routes never directly call `data/`, domain packages don't import `server/`. Layering is load-bearing.
- **Dual-write file persistence** — `domain/files/` writes local disk as primary, MongoDB `static_files` as hot backup. Local failure = total failure; MongoDB failure degrades to single-write.
- **SSE streaming is the default form for AI-class endpoints** — chat, execution, RAG chat all use `text/event-stream`, `data:` frames + `done: true` terminator frame.
- **Knowledge base is a structured asset, not a documentation dump** — the `../YiKnowledge` markdown tree is scanned by `domain/knowledge/scanner.py`, frontmatter parsed and written back to MongoDB `knowledge_files`; both RAG and BRD Agent build on this.

## Key information

### Tech stack

| dimension | value |
|---|---|
| Language / framework | Python 3.10+ / FastAPI |
| Runtime | uvicorn ASGI, port 10086 |
| Database | MongoDB via Motor (async) |
| LLM | Ollama (self-hosted, `http://localhost:11434`) |
| Object storage | OSS |
| RAG | llama_index (hybrid retrieval: vector + BM25, optional rerank) |
| Auth | bcrypt + PyJWT, optional `X-Token` header |
| Config | `config.yaml` + pydantic-settings (YAML keys flat-mapped) |
| Retry | tenacity (transient failures: network / Mongo / Ollama) |
| File watching | apscheduler polling (macOS FSEvents broken, see related gotcha) |

### Source topology

```
src/
├── app.py              # FastAPI app factory + lifecycle
├── shared/             # config / response / error_codes / logging / utils
├── data/               # MongoDB singleton + repository + sessions + store
├── models/             # Pydantic schemas + collection name constants
├── domain/             # business logic: ai/ auth/ execution/ files/ knowledge/ rag/ rss/ state/ wework/
├── services/           # service layer: ai/ database/ execution/ knowledge/ rag/ rss/ storage/
└── server/             # HTTP layer: middleware / errors / routes/
```

### Domain module public APIs

| module | public API | internal (do not directly import) |
|---|---|---|
| `domain/files/` | `__init__.py` re-exports `read_file`/`write_file`/`delete_file`/`rename_file`/`delete_folder`/`rename_folder`/`upload_image` | `local.py`, `storage.py`, `paths.py` |
| `domain/wework/` | `__init__.py` re-exports `send_message` | `client.py` |
| `domain/rag/` | `engine.py` (`rag_query`/`rag_chat_stream`/`rag_file_query`/`rag_file_chat_stream`) + `indexer.py` (`get_kb_index`/`build_file_index`) | — |
| `domain/knowledge/` | `scanner.py` (tree scan + frontmatter) + `watcher.py` (apscheduler polling) + `writer.py` (markdown write-back) | — |
| `data/` | `database.py` (MongoDB singleton) + `repository.py` (`query_documents`/`get_document_detail`/`create_document`/`update_document`/`delete_document`) + `sessions.py` + `store.py` | — |

### Cross-project RPC contract

| method | parameters shape | pitfalls |
|---|---|---|
| `data_service.query_documents` | `{ cname|collection_name, filter?, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }` | **Use `filter` not `query`**, `query` is silently dropped |
| `data_service.create_document` | `{ cname, data }` | — |
| `data_service.update_document` | `{ cname, key, data }` | — |
| `data_service.delete_document` | `{ cname, key }` | — |
| `/read-file`, `/write-file` | `target_file` (not `path`), `content`, optional `is_base64` | field name easily mistaken as `path` |
| `/upload-image-to-oss` | `{ data_url, filename, directory }` | — |

### Key data streams

1. **Generic RPC**: client `fetch POST /` → FastAPI root route resolves `module_name → Python module`, `method_name → callable`, `parameters → kwargs` → `services.<domain>.<service>.<method>(**parameters)` → MongoDB / Ollama / OSS → unified response wrapper `{code, message, data}`.
2. **Chat SSE**: `chat_service.chat()` returns `StreamingResponse(text/event-stream)`, frame by frame `data: {"data": {"message": "..."}}`, end frame `data: {"done": true}`, underlying call to Ollama.
3. **Dual-write file persistence**: `POST /write-file` → ① write local disk (failure = total failure) → ② best-effort upsert MongoDB `static_files` → return success.

### Degradation strategy

| condition | behavior |
|---|---|
| MongoDB unreachable | write fails fast, read returns empty result (no cache layer) |
| Ollama unreachable | chat returns `ErrorCode.AI_UNAVAILABLE`; image processing 503 |
| OSS bucket unreachable | file storage degrades to local-only (dual-write downgraded to single-write) |
| Auth off (default) | all endpoints public |
| Observer off | no throttle / sampler / sandbox / reentrancy protection |

## Action recommendations

1. **Put new features in domain packages** — create a new subpackage under `domain/<name>/`, converge public API to `__init__.py`; wrap with `services/<name>/` for route calls; register route in `server/routes/<name>.py`.
2. **Cross-project calls must go through the RPC envelope** — don't open a new `/xxx` route for a single capability; prefer extending `services.<domain>.<service>.<method>`.
3. **Field names follow the contract** — `filter` not `query`, `target_file` not `path`, `cname`/`collection_name` are synonymous. Register new methods in the CLAUDE.md "Cross-project protocol" table.
4. **Tests and lint are missing for now** — introduce `ruff` + `pytest` + `httpx` when code style drift or coverage becomes a pain point.
5. **Knowledge base integration** — put new documentation under `YiKnowledge/{category}/`, frontmatter required; scanner will auto-sync to MongoDB `knowledge_files`.

## Anti-patterns

- **Routes directly call `data/`** — bypassing the services/domain layers; later swapping the data source will drag routes along.
- **Cross-project calls directly import Python modules** — YiVad/YiPet are browser-side, cannot import at all; must use the RPC envelope.
- **Speculatively adding methods to the MongoDB singleton** — only add when callers truly need it (see the 2026-07-28 `find_many`/`delete_one` fix).
- **`_build_filter` parameter name misuse** — `filter`/`target_file`/`cname` are load-bearing; past silent failures were repeatedly caused by wrong field names.
- **Sync/async mixing** — FastAPI is fully async; `requests`, `pymongo` and other sync libraries are forbidden in the hot path.

## Related

- Mirror: [engineering/claude.md](./engineering/claude.md) · [engineering/readme.md](./engineering/readme.md)
- Onboarding: [onboarding.md](../../../new-hire/onboarding/yiai--onboarding.md)
- Sibling projects: [../yivad/architecture.md](../yivad/architecture.md) · [../yipet/architecture.md](../yipet/architecture.md)
- Cross-project protocol: [../yivad/engineering/claude.md](../yivad/engineering/claude.md#cross-project-protocol-yivad-yiai) · [../yipet/engineering/claude.md](../yipet/engineering/claude.md#cross-project-protocol-contract)
- Related gotcha: [../../lessons/gotchas/macos-fsevents-silent-drop.md](../../lessons/gotcha-macos-fsevents-silent-drop.md)
- RAG methodology: [../../../ai-engineer/methodology/rag-design-patterns.md](../../../ai-engineer/methodology/rag-design-patterns.md)
- Inference engine comparison: [../../../ai-engineer/platform/inference-engine-comparison.md](../../../ai-engineer/platform/inference-engine-comparison.md)
