# YiAi

## System view

YiAi is a FastAPI-based backend server that provides AI-powered services (Ollama chat), file management with dual-write persistence, WeCom bot messaging, RSS feed aggregation, a generic module-execution engine, and a state-store for arbitrary key-value records. It runs on uvicorn, uses MongoDB via motor for async data access, and integrates with external storage (OSS) and LLM inference (Ollama).

## Command flow

```bash
# Install dependencies
pip install -r requirements.txt

# Start development server (hot-reload)
python main.py

# Start production server
uvicorn src.app:app --host 0.0.0.0 --port 10086

# (No test commands configured — add pytest to the project to get test coverage)
```

## Quick start

1. Ensure Python 3.10+ is installed.
2. Clone the repo and navigate to the project root.
3. Install dependencies: `pip install -r requirements.txt`
4. Start MongoDB locally or configure `mongodb.url` in `config.yaml`.
5. (Optional) Start an Ollama instance at `http://localhost:11434` for AI chat endpoints.
6. Run the server: `python main.py`
7. Verify: `curl http://localhost:10086/health/observer`

## Project structure

```
YiAi/
├── main.py                    # Dev entry point
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
    │   └── repository.py      # Generic collection repository
    ├── models/                # Pydantic data models
    │   ├── schemas.py         # Request/response schemas
    │   └── collections.py     # Collection name constants
    ├── domain/                # Business domain logic
    │   ├── ai/
    │   │   └── chat.py        # Ollama chat + image processing
    │   ├── files/
    │   │   ├── __init__.py    # Public API (read/write/delete/rename/upload)
    │   │   ├── local.py       # Local disk IO
    │   │   ├── storage.py     # OSS object storage client
    │   │   └── paths.py       # Path normalization utilities
    │   ├── rss/
    │   │   ├── feed.py        # RSS feed fetcher + parser
    │   │   └── scheduler.py   # APScheduler-based RSS scheduling
    │   ├── wework/
    │   │   ├── __init__.py    # Public API (send_message)
    │   │   └── client.py      # WeCom webhook client
    │   └── execution/
    │       └── executor.py    # Generic module/method execution engine
    ├── services/              # Service layer (wraps domain + data)
    │   ├── ai/
    │   │   └── chat_service.py
    │   ├── database/
    │   │   ├── session_service.py
    │   │   ├── data_service.py
    │   │   └── mongo_store.py
    │   ├── execution/
    │   │   └── executor.py
    │   ├── rss/
    │   │   ├── feed_service.py
    │   │   └── rss_scheduler.py
    │   └── storage/
    │       └── oss_client.py
    └── server/                # HTTP server layer
        ├── middleware.py      # Auth middleware (X-Token header verification)
        ├── errors.py          # Global exception handlers
        └── routes/
            ├── files.py       # File CRUD + upload endpoints
            ├── execution.py   # Module execution endpoints (GET/POST + SSE streaming)
            ├── wework.py      # WeCom message sending endpoint
            ├── maintenance.py # Image/session cleanup endpoints
            ├── state.py       # State record CRUD endpoints
            └── health.py      # Observer health check endpoint
```

## Domain Language

YiAi is an AI services hub — a backend that ties together chat inference, file storage, external messaging, RSS ingestion, and a generic execution framework.

### Term definitions

| Term | Definition |
|------|------------|
| **State Record** | A persistent key-value record with a unique key, supporting type/tag categorization and time-range retrieval. |
| **Module Execution** | A generic execution mechanism that dynamically invokes any module method in `services/` or `domain/` via HTTP GET/POST. |
| **Dual Write** | A strategy that persists files simultaneously to local disk (primary) and MongoDB (backup), prioritizing disk write success with best-effort MongoDB upsert. |
| **Seed** | Initialization data/config seeds stored in the MongoDB `seeds` collection, used for data population during system startup. |
| **Observer** | A set of runtime monitoring components: Throttle (rate limiting), Sampler (slow-request sampling), Sandbox (execution sandbox), ReentrancyGuard (re-entry protection). |

### Relationships

- A **Module Execution** request targets a method in the **services/** layer, which in turn calls the **domain/** layer.
- A **State Record** belongs to a type category and carries optional tags for filtering.
- **Dual Write** is the persistence model for file operations; it spans both the **local disk** and the **MongoDB static_files** collection.
- **Observer** components wrap the request pipeline: Throttle and Sampler are FastAPI middlewares.
- **Seed** data feeds into database collections during initialization.

### Example dialogue

> **User**: Look up the State Record for recently uploaded files.
> **System**: I queried the State Record API, filtering by `record_type=file_upload` and `created_after` within the last 7 days. It returned 3 records, each with a key and associated metadata.
> **User**: Were these files persisted via Dual Write?
> **System**: Yes. On write, the file is first saved to the local static directory, then upserted into MongoDB's `static_files` collection via the Dual Write mechanism. `target_file` serves as a unique index to guarantee idempotency.

### Disambiguation markers

| Term | Do NOT confuse with |
|------|---------------------|
| State Record | Not a session (session records are a separate MongoDB collection) |
| Module Execution | Not RPC (no persistent connection); it is HTTP sync / SSE streaming |
| Dual Write | Not a transactional write (no two-phase commit); returns on local disk write success |
| Seed | Not a migration (does not handle schema changes); data population only |
| Observer | Not APM (does not trace distributed spans); it is in-process runtime monitoring |
