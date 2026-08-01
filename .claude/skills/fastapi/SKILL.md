---
name: fastapi
description: >
  FastAPI backend development navigator — dependency injection,
  middleware, Pydantic validation, background tasks, WebSocket,
  router composition, and testing. Invoke when the user wants to:
  create FastAPI endpoints (GET/POST/PUT/DELETE), set up dependency
  injection (`Depends`), define Pydantic models for request/response
  validation, add middleware (CORS, logging, auth), run background
  tasks (`BackgroundTasks`), implement WebSocket endpoints, structure
  routers (`APIRouter`) for large apps, handle errors with exception
  handlers, configure OpenAPI/Swagger docs, or write async database
  queries. Trigger words: "fastapi", "fastapi dependency injection",
  "fastapi middleware", "pydantic", "fastapi router", "fastapi websocket",
  "fastapi background task", "fastapi testing", "fastapi openapi",
  "fastapi swagger", "fastapi cors", "fastapi auth", "fastapi async",
  "fastapi lifespan".
  Do NOT trigger for: general Python questions (syntax, data structures,
  standard library), database ORM specifics (SQLAlchemy usage patterns),
  or deployment/infrastructure (Docker, Kubernetes, nginx reverse proxy
  for FastAPI).
lifecycle: default-pipeline
user_invocable: true
---

# fastapi — FastAPI Backend Navigator

> Dependency injection, Pydantic validation, middleware, routers — the canonical FastAPI reference.

## What this skill does

1. **Endpoints** — path operations (`@app.get/post/put/delete`), path/query/body parameters, response models (`response_model`), status codes, response headers.
2. **Dependency injection** — `Depends()` for shared logic (auth, DB sessions, config), dependency hierarchies, `yield` for teardown, `Annotated` type shorthand.
3. **Pydantic models** — `BaseModel` for request/response schemas, field validation (`Field`, `validator`), nested models, `model_config`, `computed_field`.
4. **Middleware** — CORS (`CORSMiddleware`), custom middleware (`BaseHTTPMiddleware`), request/response logging, timing, rate limiting, trusted host.
5. **Background tasks** — `BackgroundTasks` for fire-and-forget, `BackgroundTask` for programmatic use, Celery/ARQ for heavy async tasks.
6. **Router composition** — `APIRouter`, prefix + tags, router inclusion (`app.include_router`), nested routers.
7. **Error handling** — `HTTPException`, custom exception handlers (`@app.exception_handler`), validation error customization.
8. **WebSocket** — `@app.websocket`, connection lifecycle, broadcasting patterns, `WebSocketDisconnect` handling.
9. **Lifespan** — `@app.on_event("startup"/"shutdown")`, lifespan context manager, async resource initialization.
10. **OpenAPI** — auto-generated docs (`/docs`, `/redoc`), custom docs URL, tags metadata, `summary`/`description` on path operations, schema customization.

## What this skill does NOT do

- Does NOT teach Python basics — assume working knowledge of Python, type hints, and async/await.
- Does NOT cover SQLAlchemy ORM details — SQLAlchemy is an adjacent concern.
- Does NOT cover deployment (Uvicorn/Gunicorn config, Docker, reverse proxy) beyond basic notes.
- Does NOT replace the official FastAPI docs — for exhaustive API reference, point to https://fastapi.tiangolo.com/.

## Workflow

1. **Identify the concern** — endpoint / DI / validation / middleware / router / error handling.
2. **Define the Pydantic model** — request schema first, then response schema.
3. **Implement the endpoint** — path decorator → DI → business logic → return with `response_model`.
4. **Add middleware/error handling** — CORS, auth guard, exception handlers.
5. **Test** — `TestClient` from `fastapi.testclient`, async tests with `httpx.AsyncClient`.

## Borders

| Boundary | Permission |
|----------|-----------|
| `*.py` source files | read + write |
| `requirements.txt` / `pyproject.toml` | read + write (for deps) |
| Official FastAPI docs | reference only |
| Skill directory | read + write |
| Outside the project | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| User asks about Flask/Django patterns | State the boundary; suggest FastAPI equivalents where relevant. |
| User asks about SQLAlchemy specifics | Provide the FastAPI integration pattern; defer ORM details. |
| User asks about GraphQL (Strawberry/Ariadne) | Note FastAPI-GraphQL integration exists; defer to those libraries' docs. |
| User asks about sync vs async endpoints | Explain `def` vs `async def` in FastAPI; recommend async for I/O-bound, def for CPU-bound. |
| User asks in a language other than English | Respond in the user's language; keep code identifiers in original. |
