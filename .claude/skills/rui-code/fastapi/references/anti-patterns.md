# Anti-patterns

If you're an agent reviewing a diff, check for these. Each is a real
failure mode seen in production.

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| `requests.get(...)` inside `async def` | Blocks the event loop. `requests` is sync. | Use `httpx.AsyncClient` or `await run_in_threadpool(requests.get, ...)`. |
| `time.sleep` / `open()` / sync DB driver inside `async def` | Same — blocks the loop. | Use the async equivalent (`asyncio.sleep`, `aiofiles`, async driver). |
| `from jose import jwt` | `python-jose` is unmaintained. | `import jwt` (PyJWT). |
| `from async_asgi_testclient import TestClient` | Unmaintained. | `httpx.AsyncClient` + `ASGITransport`. |
| `model_config = ConfigDict(json_encoders={...})` | Deprecated in Pydantic v2. | `@field_serializer` or `Annotated[T, PlainSerializer(...)]`. |
| `Field(ge=18, default=None)` | Constraint contradicts the default. | Pick required or optional, not both. |
| `def get_user(id: int = Depends(...))` (default-arg form) | Legacy; gotchas with default values. | `user: Annotated[User, Depends(...)]`. |
| Catching `Exception` around a route's body | Hides bugs and turns 500s into silent 200s. | Catch the specific exception class; raise `HTTPException` with a meaningful status. |
| `BackgroundTasks` for anything you'd page on | No retry, dies with the worker. | Use Celery / Arq / RQ. |
| Calling a sync ORM session inside `async def` | Blocks the loop, may deadlock the pool. | Use `AsyncSession`. |
| Returning a Pydantic model *and* setting `response_model=` to the same class | Model gets constructed twice (validate + serialize). | Either return a `dict`/ORM row and let `response_model` validate, or drop `response_model` and trust the return type. |
| Importing across domains via deep paths (`from src.auth.service.user import ...`) | Tight coupling, hard to refactor. | `from src.auth import service as auth_service`. |
| Reusing one `BaseSettings` for the whole app | Hard to reason about; every domain reads every var. | One `BaseSettings` per domain. |
| Mocking the database in integration tests | Mock/prod divergence eventually fires in prod. | Use a real DB (testcontainers, ephemeral schema) and `dependency_overrides` for auth/external services. |
| `time.sleep(10)` inside `async def` | Blocks the loop for 10s — no other request can be served. | Use `def` (threadpool) or `await asyncio.sleep(10)`. |
| Using `from src import *` | Namespace collision, hidden side-effects. | Always use explicit module-name imports across domains. |
| Returning a list of Pydantic models from a route that wasn't validated | API contract drift. | Set `response_model=list[ItemResponse]` and let FastAPI validate. |

## How to use this table

When reviewing a diff:

1. Grep for the patterns in column 1 across the changed files.
2. For each hit, look at the surrounding code — sometimes the pattern is
   fine (e.g. `requests.get` in a `def` route).
3. Report the hit with `file:line` and the fix from column 3.
4. Cite this file as the source.
