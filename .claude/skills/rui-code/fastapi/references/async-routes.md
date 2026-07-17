# Async Routes

FastAPI is async-first. It supports `async def` and `def` routes, but they
behave very differently.

## Decision rule

| Route does this | Use |
|----------------|-----|
| `await`-able non-blocking I/O | `async def` |
| Blocking I/O (no async client exists) | `def` (sync — runs in a threadpool) |
| Mix of both | `async def` + `run_in_threadpool` for the blocking part |
| CPU-bound work (>50 ms compute) | Offload to a worker process (Celery / Arq / RQ) |

## I/O intensive — the canonical example

```python
import asyncio
import time

from fastapi import APIRouter

router = APIRouter()

@router.get("/terrible-ping")
async def terrible_ping():
    time.sleep(10)  # I/O blocking for 10 seconds, the whole process is blocked
    return {"pong": True}

@router.get("/good-ping")
def good_ping():
    time.sleep(10)  # runs in a threadpool, not the loop
    return {"pong": True}

@router.get("/perfect-ping")
async def perfect_ping():
    await asyncio.sleep(10)  # non-blocking
    return {"pong": True}
```

What happens when we call:

1. `GET /terrible-ping` — FastAPI receives the request, the route is `async`
   so it is **not** offloaded. `time.sleep(10)` blocks the event loop. The
   server stops accepting new requests until the sleep finishes.
2. `GET /good-ping` — sync route → FastAPI sends it to the threadpool. The
   event loop keeps serving other tasks. Only one threadpool worker is
   blocked.
3. `GET /perfect-ping` — `await asyncio.sleep(10)` yields control to the
   event loop immediately.

## Mixing async + blocking SDK

```python
from fastapi.concurrency import run_in_threadpool

@router.get("/wrap")
async def wrap():
    result = await run_in_threadpool(legacy_sync_client.fetch, "id")
    return result
```

## CPU intensive

Non-blocking awaitables and threadpool offloading are useless for CPU-bound
work. Threads are serialized by the GIL, so `asyncio` doesn't help either.

- Don't `await` heavy calculations.
- Don't run them in threads.
- Do offload to a worker process (Celery, Arq, RQ, or a custom pool).

## Threadpool caveats

- Default Starlette threadpool size is **40**. Saturating it slows every
  sync route.
- Threads cost more than coroutines. Don't use sync routes "just because."
- Sync dependencies also run in the threadpool. Prefer `async def`
  dependencies for small CPU-only checks.

## Related StackOverflow questions (read if confused)

- <https://stackoverflow.com/questions/62976648/architecture-flask-vs-fastapi/70309597#70309597>
- <https://stackoverflow.com/questions/65342833/fastapi-uploadfile-is-slow-compared-to-flask>
- <https://stackoverflow.com/questions/71516140/fastapi-runs-api-calls-in-serial-instead-of-parallel-fashion>
