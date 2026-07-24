# YiAi · FastAPI + MongoDB Backend

> FastAPI async backend · MongoDB (Motor) persistence · module execution
> engine · AI chat (Ollama) · RSS scheduler · OSS storage · WeWork webhook.
> Source root: `/Users/ruiyi/Downloads/YrY/YiAi/`.

## System view

YiAi is the backend service for the YiPet / YiAi ecosystem. It exposes a
FastAPI application on port `10086` (configurable in `config.yaml`) with
seven route groups: `files` (file CRUD + image upload to OSS), `execution`
(generic module/method invocation engine, SSE streaming), `wework`
(enterprise-WeChat webhook), `maintenance` (unused-image cleanup), `state`
(key-value state store backed by MongoDB), `health` (observer health
probe), and `story_panel` (story-task panel sync). The architecture is
strictly layered — `server/routes → services → domain → data` — with a
cross-cutting `shared` package and a reliability `observer` package
(throttle / sampler / sandbox / reentrancy-guard / lazy-start). The app
bootstraps MongoDB and the APScheduler-driven RSS system in its
lifespan; `header_verification_middleware` gates auth.

## Command flow

| Command | Purpose |
|---------|---------|
| `python main.py` | Start the server (reads `config.yaml`, runs `uvicorn`) |
| `uvicorn src.app:app --host 0.0.0.0 --port 10086 --reload` | Direct uvicorn with hot reload |
| `pip install -r requirements.txt` | Install runtime deps (19 pins) |
| `python -m src.cli.state <args>` | CLI entry (state ops, typer-based) |
| No `pytest` | No automated test runner; verify via `test/scene-*/index.md` scenes |

## Quick start

1. `cd /Users/ruiyi/Downloads/YrY/YiAi/` and
   `pip install -r requirements.txt` (preferably in a virtualenv).
2. Review `config.yaml` — adjust `mongodb.url`, `oss.*` credentials,
   `ollama.url`, `middleware.auth_token`. Defaults target localhost.
3. Ensure MongoDB is reachable at `mongodb://localhost:27017`
   (`config.yaml → mongodb.url`).
4. (Optional) Start Ollama locally or point `ollama.url` at
   `http://ollama.effiy.cn` if the AI chat routes will be exercised.
5. `python main.py` → the server boots at `http://0.0.0.0:10086`. The
   `/docs` Swagger UI lists every registered operation id.
6. To inspect the documentation catalog entry for this project, open
   `/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiAi/index.html` in a browser.

**Goal-Driven Execution** — success criteria: (a) `python main.py` boots
without tracebacks, (b) `GET /health/observer` returns 200, (c) a
`POST /state/records` + `GET /state/records/{key}` round-trip succeeds,
(d) the RSS scheduler starts (look for `init_rss_system` log line).

## Project structure

```
YiAi/
├── main.py                # Root entry → uvicorn run
├── config.yaml            # All runtime config (server / mongo / oss / ollama / observer / rss)
├── requirements.txt       # 19 runtime deps (FastAPI, Motor, Ollama, Apscheduler, oss2…)
└── src/
    ├── app.py             # FastAPI factory + lifespan + router registration
    ├── __main__.py        # python -m src entry
    ├── cli/               # Typer CLI (state.py)
    ├── data/              # database.py (Motor) + repository + sessions + store
    ├── domain/            # Business logic
    │   ├── ai/            # chat.py — Ollama-backed AI chat
    │   ├── execution/     # executor.py — generic module/method dispatcher
    │   ├── files/         # storage.py — OSS upload
    │   ├── rss/           # feed.py + scheduler.py — RSS pull & ingest
    │   ├── state/         # adapters + recorder + store — state KV
    │   └── wework/        # WeWork webhook domain
    ├── models/            # Pydantic schemas + Mongo collections
    ├── observer/          # guard / sampler / throttle / sandbox / lazy_start
    ├── server/
    │   ├── middleware.py  # header_verification_middleware
    │   ├── errors.py      # Global exception handlers
    │   └── routes/        # 7 routers: files / execution / wework / maintenance / state / health / story_panel
    ├── services/          # Service layer mirroring domain
    │   ├── ai/            # chat_service.py
    │   ├── database/      # data_service + mongo_store + session_service
    │   ├── execution/     # executor.py
    │   ├── rss/           # feed_service + rss_scheduler
    │   ├── state/         # skill_recorder + state_service
    │   └── storage/       # oss_client.py
    └── shared/            # config / error_codes / exceptions / logging / response / utils
```

## Domain Language

YiAi's domain is **an async backend service that mediates between the
YiPet / YiAi front-ends and the storage + AI + scheduling substrates**.
The same codebase exposes seven route groups over a layered
`routes → services → domain → data` architecture.

- **Module execution engine** — the generic dispatcher in
  `src/domain/execution/executor.py` (and the `services/execution/`
  mirror) that takes `{module_name, method_name, parameters}` and
  invokes any allow-listed Python module/method, streaming results back
  via SSE. Registered at `POST /` and `GET /` in
  `server/routes/execution.py`.
- **State store** — a MongoDB-backed key-value record store
  (`src/domain/state/store.py` + `services/state/state_service.py`)
  exposed by `server/routes/state.py` at `/state/records`. Records are
  typed by `record_type` and tagged; the store supports TTL, tag
  filtering, title-contains search, and pagination (max 100M per the
  `state_store.query_max_limit` config).
- **Observer** — the reliability package (`src/observer/`) that wraps the
  ASGI app with `ThrottleMiddleware`, `TailSampler`, `SandboxMiddleware`,
  and `ReentrancyGuard` (max depth 3). Each is toggleable in
  `config.yaml → observer.*`. The `/health/observer` route surfaces
  their status.
- **RSS scheduler** — APScheduler-driven periodic feed puller
  (`src/domain/rss/scheduler.py` + `services/rss/rss_scheduler.py`)
  started in the app lifespan; pulls feeds, parses via `feedparser`,
  and ingests into MongoDB. Toggleable via `rss.scheduler_enabled`.
- **Story panel** — the `/api/story-panel/*` routes in
  `server/routes/story_panel.py` that sync a local kebab-case story
  directory (`docs/故事任务面板/`) with a remote panel, returning
  overview, list, single-story, and help payloads.

### Relationships

- **Route** → **Service** → **Domain** → **Data**: every public endpoint
  follows this chain; `shared/` is cross-cutting.
- **Module execution engine** ⊇ **State store** + **RSS scheduler**: the
  engine can dispatch into any allow-listed module, including the
  state store and RSS scheduler services, but the dedicated routes
  (`/state/records`, RSS cron) are the canonical entry points.
- **Observer** ⊇ all routes: the observer middlewares wrap the entire
  ASGI app, so every route — including the module execution engine —
  runs under throttle / sampler / sandbox / guard.
- **Story panel** → **WeWork webhook**: story-panel events can be
  mirrored to WeWork via the `wework/send-message` route (loose
  coupling, no shared state).

### Example dialogue

> User: "POST `/state/records` with `{key, value, record_type, tags}`."
> System (routes/state.py): lazily instantiates `StateStoreService`,
> calls `service.create(data)`, returns `success(data=result,
> http_code=201)`.
> User: "GET `/state/records?record_type=skill&tags=auth&limit=10`."
> System: same service, `service.query(...)`, paginated response.
> User: "POST `/` with `{module_name: 'domain.rss.feed',
> method_name: 'process_feed_from_url', parameters: {...}}`."
> System (routes/execution.py): `execute_module(...)` runs the
> method, streams results via SSE; observer sampler + guard wrap the
> call.
> User: "GET `/health/observer`."
> System (routes/health.py): returns throttle / sampler / sandbox /
> guard enabled-state from `settings`.

### Disambiguation markers

- "state" in this codebase **never** means Redux / Pinia state; it is
  specifically the MongoDB-backed key-value record store at
  `/state/records` and the `src/domain/state/` package.
- "observer" **does not** refer to a Python observable pattern; it is
  the reliability middleware package (`throttle` / `sampler` /
  `sandbox` / `guard` / `lazy_start`).
- "execution" **does not** mean shell-command execution; it is the
  allow-listed Python module/method dispatcher in
  `src/domain/execution/executor.py`, surfaced at `POST /` and `GET /`.
- "scheduler" **always** refers to the APScheduler-driven RSS puller,
  not a generic cron or a task queue.
- "story panel" is a server-side sync surface for the front-end
  story-task panel, not the user-facing story view (that lives in
  `YiWeb`).
