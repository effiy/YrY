# YiAi

> FastAPI-based AI services hub — chat inference, file storage with dual-write persistence, RSS aggregation, WeCom messaging, a generic module-execution engine, and a state-store for arbitrary key-value records. Runs on uvicorn (ASGI), MongoDB via Motor (async), with self-hosted LLM inference via Ollama and object storage via OSS.

---

## Table of Contents

- [Overview](#overview)
- [Highlights](#highlights)
- [Architecture](#architecture)
- [Module Boundaries](#module-boundaries)
- [Data Flow](#data-flow)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Design](#api-design)
- [Configuration](#configuration)
- [Domain Language](#domain-language)
- [Recent Changes](#recent-changes)
- [Related Projects](#related-projects)

---

## Overview

YiAi is a FastAPI backend server that provides AI-powered services (Ollama chat), file management with dual-write persistence, WeCom bot messaging, RSS feed aggregation, a generic module-execution engine, and a state-store for arbitrary key-value records. It runs on uvicorn, uses MongoDB via Motor for async data access, and integrates with external storage (OSS) and self-hosted LLM inference (Ollama).

The server follows a strict domain-driven modular architecture: each domain sub-package owns its logic and exposes a clean public API via `__init__.py`. All endpoints return a unified response envelope with typed error codes.

---

## Highlights

- **Ollama-powered LLM chat** with SSE streaming and image processing (qwen-vl-utils).
- **File management** with dual-write persistence (local disk + MongoDB backup).
- **WeCom (WeCom Work) bot messaging** via webhook integration.
- **RSS feed aggregation** with APScheduler-based scheduling.
- **Generic module-execution engine** (GET/POST + SSE streaming).
- **State-store** for arbitrary key-value records with type/tag filtering.
- **MCP (Model Context Protocol) server integration**.
- **Unified API response envelope** with typed error codes.
- **Config-driven architecture** via `config.yaml` + pydantic-settings.
- **Observer runtime monitoring** — throttle, sampler, sandbox, reentrancy guard.
- **JWT + bcrypt auth** (optional, X-Token header verification).
- **Tenacity-backed retry** for transient failures.

---

## Architecture

YiAi advances along the **modularization** axis: split by domain into named modules; expose clear public APIs between modules; separate entry / domain / persistence / external layers.

```
┌──────────────────────────────────────────────────────────────┐
│  HTTP Layer (src/server/)                                    │
│  FastAPI app factory · auth middleware · global error handler│
│  Routes (about, auth, files, execution, wework, maintenance,│
│          state, system, users, health) — each APIRouter      │
└──────────────────────┬───────────────────────────────────────┘
                       │ calls
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Service Layer (src/services/)                               │
│  Wraps domain logic + data access; exposes coarse-grained  │
│  operations to routes                                       │
│  Sub-packages: ai/ · database/ · execution/ · rss/ · storage/│
└──────────────────────┬───────────────────────────────────────┘
                       │ delegates to
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Domain Layer (src/domain/)                                  │
│  Sub-packages: ai/ · auth/ · execution/ · files/ · rss/     │
│                state/ · wework/                              │
│  Each owns its logic + exposes public API via __init__.py   │
└──────────────────────┬───────────────────────────────────────┘
                       │ persists / queries
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Data Layer (src/data/)                                      │
│  MongoDB singleton · motor async · repository pattern       │
│  Collections: sessions · static_files · state_records ·     │
│               seeds · faqs · apis · ...                     │
└──────────────────────────────────────────────────────────────┘

Cross-cutting (src/shared/):
  config.py · exceptions.py · response.py · error_codes.py ·
  logging.py · utils.py
```

### Execution Engine

The generic module-execution endpoint lets callers invoke any `services.<domain>.<service>.<method>` function over HTTP with SSE streaming for long-running methods. This is how YiPet and YiVad reach into the backend without one-off endpoints — e.g. `{"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {...}}`.

---

## Module Boundaries

Every caller outside a domain package depends only on that package's public API surface. Internal files stay private.

| Module (under `src/domain/` or `src/services/`) | Public API | Internal files (not imported directly) |
|---|---|---|
| `domain/ai/` | `chat.py` (Ollama chat + image processing) | — |
| `domain/auth/` | JWT + bcrypt helpers | — |
| `domain/execution/` | `executor.py` (dynamic module/method invocation) | — |
| `domain/files/` | `__init__.py` re-exports `read_file`, `write_file`, `delete_file`, `rename_file`, `delete_folder`, `rename_folder`, `upload_image` | `local.py`, `storage.py`, `paths.py` |
| `domain/rss/` | `feed.py`, `scheduler.py` | — |
| `domain/state/` | state-record CRUD helpers | — |
| `domain/wework/` | `__init__.py` re-exports `send_message` | `client.py` |
| `services/ai/` | `chat_service.py` (wraps `domain/ai/chat.py` + models) | — |
| `services/database/` | `data_service.py` (`query_documents`, `create_document`, `update_document`, `delete_document`), `session_service.py` | — |
| `services/execution/` | `executor.py` | — |
| `services/rss/` | `feed_service.py`, `rss_scheduler.py` | — |
| `services/storage/` | `oss_client.py` | — |
| `data/` | `database.py` (MongoDB singleton: `find_one`, `find_many`, `insert_one`, `insert_many`, `update_one`, `delete_one`), `repository.py` (`query_documents`, `get_document_detail`, `create_document`, `update_document`, `delete_document`), `sessions.py`, `store.py` | — |

### Cross-project protocol

All three projects agree on the following shapes (the "RPC envelope"):

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}

response: { "code": 0, "message": "ok", "data": <any> }
```

Key parameter names (these have been the source of past bugs):

| Method | Contract |
|---|---|
| `data_service.query_documents` | `parameters: { cname | collection_name, filter?: dict, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }`. The `filter` dict is merged into the Mongo query via `_build_filter`. **Do NOT use `query` — it is silently ignored.** |
| `data_service.create_document` | `parameters: { cname, data }` |
| `data_service.update_document` | `parameters: { cname, key, data }` |
| `data_service.delete_document` | `parameters: { cname, key }` |

---

## Data Flow

### Generic RPC (used by both YiPet and YiVad)

```
YiPet / YiVad
   │
   │ fetch() POST /
   │ body: {module_name, method_name, parameters}
   ▼
FastAPI root route handler (src/server/routes/execution.py or app.py)
   │
   │ resolves module_name → Python module
   │ resolves method_name → callable on that module
   │ merges parameters into the method's kwargs
   ▼
services.<domain>.<service>.<method>(**parameters)
   │
   │ (if data_service.query_documents)
   │   pops `filter`, merges into query_params
   │   pops pageNum/pageSize/limit/page/fields/exclude/orderBy
   │   calls _build_filter(query_params) → Mongo filter dict
   │   collection.find(filter_dict, projection).sort().skip().limit()
   ▼
MongoDB (Motor async)
   │
   ▼
{ list: [...], total, pageNum, pageSize, totalPages }
```

### Chat SSE streaming

```
YiPet / YiVad
   │
   │ fetch() POST /
   │ body: {module_name: "services.ai.chat_service", method_name: "chat",
   │        parameters: {model, messages, stream: true, system?, images?}}
   ▼
chat_service.chat()
   │
   │ StreamingResponse(text/event-stream)
   │ yields: data: {"data": {"message": "..."}}\n\n
   │ ends:   data: {"done": true}\n\n
   ▼
Ollama HTTP API (http://localhost:11434/api/chat)
```

### Dual-write file persistence

```
POST /write-file  {target_file, content}
   │
   │ 1. write to local disk (primary, returns failure if this fails)
   │ 2. best-effort upsert to MongoDB static_files (backup)
   ▼
response: success
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- MongoDB 5+ (local or remote)
- (Optional) Ollama running at `http://localhost:11434` for AI chat endpoints
- (Optional) Alibaba OSS bucket + credentials for object storage

### Install & Run

```bash
# Install dependencies
pip install -r requirements.txt

# Start development server (hot-reload via uvicorn --reload)
python main.py

# Start production server
uvicorn src.app:app --host 0.0.0.0 --port 10086

# Verify health
curl http://localhost:10086/health/observer
```

### Configuration

Edit `config.yaml` — single source of truth, loaded via `pydantic-settings` with `YamlConfigSettingsSource`. See [Configuration](#configuration) below.

### Health Check

```bash
curl http://localhost:10086/health/observer
# → { "code": 0, "message": "ok", "data": { "throttle": ..., "sampler": ..., ... } }
```

---

## Project Structure

```
YiAi/
├── main.py                    # Dev entry point (uvicorn with --reload)
├── config.yaml                # Server configuration (single source of truth)
├── requirements.txt           # Python dependencies
├── CLAUDE.md                  # Assistant guidance
├── README.md                  # This file
└── src/
    ├── app.py                 # FastAPI app factory + lifecycle
    ├── shared/                # Shared utilities
    │   ├── config.py          # Pydantic settings (reads config.yaml)
    │   ├── exceptions.py      # BusinessException definition
    │   ├── response.py        # Unified response wrapper (success/fail)
    │   ├── error_codes.py     # ErrorCode enum
    │   ├── logging.py         # Logging setup
    │   └── utils.py           # Text, hash, time, file utility functions
    ├── data/                  # MongoDB data access layer
    │   ├── database.py        # MongoDB singleton (connection, indexes, CRUD wrappers)
    │   ├── sessions.py        # Session collection operations
    │   ├── store.py           # State-record store operations
    │   └── repository.py      # Generic collection repository (query_documents, ...)
    ├── models/                # Pydantic data models
    │   ├── schemas.py         # Request/response schemas
    │   └── collections.py     # Collection name constants
    ├── domain/                # Business domain logic
    │   ├── ai/                #   Ollama chat + image processing
    │   ├── auth/              #   JWT + bcrypt
    │   ├── execution/         #   Generic module/method execution
    │   ├── files/             #   Dual-write: disk + MongoDB + OSS
    │   ├── rss/               #   RSS feed fetcher + APScheduler
    │   ├── state/             #   Generic key-value state records
    │   └── wework/            #   WeCom webhook messaging
    ├── services/              # Service layer (wraps domain + data)
    │   ├── ai/                #   chat_service.py
    │   ├── database/          #   data_service.py, session_service.py
    │   ├── execution/         #   executor.py
    │   ├── rss/               #   feed_service.py, rss_scheduler.py
    │   └── storage/           #   oss_client.py
    └── server/                # HTTP server layer
        ├── middleware.py      # Auth middleware (X-Token header verification)
        ├── errors.py          # Global exception handlers
        └── routes/            # APIRouter modules
            ├── about.py, auth.py, execution.py, files.py,
            │   health.py, maintenance.py, state.py, system.py,
            │   users.py, wework.py
```

---

## API Design

All endpoints return a unified envelope:

```json
{ "code": 0, "message": "ok", "data": <any> }
```

- **Success** → `code: 0` (`ErrorCode.OK.business`).
- **Failure** → typed error codes defined in `src/shared/error_codes.py`.
- **Pagination** → responses include an optional `pagination` key (`{ total, page, pageSize }`).
- **SSE streaming** → chat and execution endpoints return `text/event-stream` with incremental `data:` frames.
- **Routes** → organised as `APIRouter` modules under `src/server/routes/`, assembled in `src/app.py`'s `create_app()` factory.
- **Auth** → optional `X-Token` header verification (middleware in `src/server/middleware.py`, disabled by default).

### Route Modules

| Module | Path prefix | Purpose |
|---|---|---|
| `files.py` | `/files` | File CRUD + multipart upload + `/read-file`, `/write-file`, `/delete-file`, `/delete-folder`, `/rename-file`, `/rename-folder`, `/upload-image-to-oss` |
| `execution.py` | `/exec` | Generic module/method execution (sync + SSE) |
| `wework.py` | `/wework` | WeCom webhook send |
| `maintenance.py` | `/maintenance` | Image / session cleanup |
| `state.py` | `/state` | State record CRUD with type/tag filtering |
| `health.py` | `/health` | Observer runtime health check |

---

## Configuration

`config.yaml` is the single source of truth. Top-level sections:

| Section | Purpose |
|---|---|
| `server` | Host, port, log level |
| `mongodb` | Connection URL, database name |
| `static` | `base_dir` for local disk files |
| `ollama` | Host URL, default model |
| `oss` | Bucket, region, credentials |
| `wework` | Webhook URL |
| `rss` | Feed list + scheduler interval |
| `auth` | Enable/disable X-Token verification |
| `observer` | Throttle, sampler, sandbox, reentrancy config |

Override any key via environment variables (pydantic-settings reads env first, then YAML fallback).

---

## Domain Language

YiAi is an AI services hub — a backend that ties together chat inference, file storage, external messaging, RSS ingestion, and a generic execution framework.

### Term Definitions

| Term | Definition |
|------|------------|
| **State Record** | A persistent key-value record with a unique key, supporting type/tag categorization and time-range retrieval. |
| **Module Execution** | A generic execution mechanism that dynamically invokes any module method in `services/` or `domain/` via HTTP GET/POST. |
| **Dual Write** | A strategy that persists files simultaneously to local disk (primary) and MongoDB (backup), prioritizing disk write success with best-effort MongoDB upsert. |
| **Seed** | Initialization data/config seeds stored in the MongoDB `seeds` collection, used for data population during system startup. |
| **Observer** | A set of runtime monitoring components: Throttle (rate limiting), Sampler (slow-request sampling), Sandbox (execution sandbox), ReentrancyGuard (re-entry protection). |
| **RPC envelope** | The `{module_name, method_name, parameters}` request shape used by every cross-project call. |
| **`filter` (not `query`)** | The MongoDB-filter parameter name in `query_documents`. `query` is not recognised — use `filter`. |

### Relationships

- A **Module Execution** request targets a method in the **services/** layer, which in turn calls the **domain/** layer.
- A **State Record** belongs to a type category and carries optional tags for filtering.
- **Dual Write** is the persistence model for file operations; it spans both the **local disk** and the **MongoDB static_files** collection.
- **Observer** components wrap the request pipeline: Throttle and Sampler are FastAPI middlewares.
- **Seed** data feeds into database collections during initialization.
- The **RPC envelope** is the lingua franca between YiVad, YiPet, and the execution engine — never invent a new shape; reuse the envelope.

### Example Dialogue

> **User**: Look up the State Record for recently uploaded files.
> **System**: I queried the State Record API, filtering by `record_type=file_upload` and `created_after` within the last 7 days. It returned 3 records, each with a key and associated metadata.
> **User**: Were these files persisted via Dual Write?
> **System**: Yes. On write, the file is first saved to the local static directory, then upserted into MongoDB's `static_files` collection via the Dual Write mechanism. `target_file` serves as a unique index to guarantee idempotency.

### Disambiguation Markers

| Term | Do NOT confuse with |
|------|---------------------|
| **State Record** | Not a session (session records are a separate MongoDB collection) |
| **Module Execution** | Not RPC (no persistent connection); it is HTTP sync / SSE streaming |
| **Dual Write** | Not a transactional write (no two-phase commit); returns on local disk write success |
| **Seed** | Not a migration (does not handle schema changes); data population only |
| **Observer** | Not APM (does not trace distributed spans); it is in-process runtime monitoring |
| **`filter`** | Not `query` (the backend's `query_documents` only recognises `filter`); not the Mongo `$filter` aggregation stage |

---

## Recent Changes

### 2026-07 — Bug fixes (data layer)

- **`data/database.py`**: Added the missing `find_many` and `delete_one` wrapper methods to the `MongoDB` singleton class. These were called by `domain/files/storage.py` (specifically `delete_oss_file`, `delete_file_tags`, `get_all_tags`) but never defined, so those callers would raise `AttributeError` at runtime.
- **`data/repository.py`**: Fixed `_handle_range_or_list_filter` so a 2-element list of strings (e.g. `tags: ["work", "personal"]`) is no longer silently dropped. Previously, if neither element parsed as a date or number, the function returned `True` without setting a filter — callers got ALL documents back. Now falls through to `$in` semantics.

### 2026-07 — Cross-project protocol hygiene

- Documented the `filter` (not `query`) contract for `query_documents` — both YiPet and YiVad have hit this bug. See [Module Boundaries](#module-boundaries) for the canonical table.
- Documented the `target_file` field name for `/read-file` and `/write-file` — YiVad had been sending `path` and getting 422s back.

---

## Related Projects

| Project | Type | Relationship |
|---|---|---|
| **YiPet** | Chrome MV3 extension | Frontend — calls YiAi endpoints for chat, sessions, auth, config |
| **YiVad** | Vue 3 admin dashboard | Admin UI — visualises and manages YiAi data and services |
