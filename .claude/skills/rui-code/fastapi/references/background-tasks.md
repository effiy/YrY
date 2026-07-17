# Background work — BackgroundTasks vs Celery/Arq/RQ

## Decision table

| Use BackgroundTasks when… | Use Celery / Arq / RQ when… |
|----------------------------|------------------------------|
| Task is < 1 second | Task takes seconds to minutes |
| Failure can be silently dropped | You need retries, dead-letter, or visibility |
| Task is in-process (send email, log row) | Task is CPU-heavy or needs a separate pool |
| You don't need scheduling | You need cron, ETA, or rate limiting |

## BackgroundTasks example

```python
from fastapi import BackgroundTasks


@router.post("/signup")
async def signup(data: SignupIn, bg: BackgroundTasks):
    user = await service.create_user(data)
    bg.add_task(send_welcome_email, user.email)  # fire-and-forget, in-process
    return user
```

## What BackgroundTasks really does

- Runs **after the response is sent, in the same worker process**.
- If the worker dies, the task is **lost**.
- There is **no retry**.
- There is **no visibility** (no dashboard, no logs you can search).

> Don't use `BackgroundTasks` for anything you'd page on. If a failed
> "send welcome email" is a Slack alert, use a task queue.

## When to graduate to a real queue

- The task is on the **critical path** of a user-visible feature
  (e.g. processing a payment after the response).
- The task is **CPU-bound** (image resize, PDF generation).
- You need **retries with backoff** (a flaky third-party API).
- You need **scheduled** or **delayed** execution.
- You need **observability** (Celery Flower, Arq dashboard).

For most projects, **Arq** is the lightest option (Redis-backed,
async-native). Use **Celery** if you need the mature ecosystem of
brokers/results backends. Use **RQ** if you want the simplest API and are
already on Redis.
