# Testing

## Async client from day one

Use `httpx.AsyncClient` + `ASGITransport`. **Don't** use
`async_asgi_testclient` — it's unmaintained.

```python
import pytest
from httpx import AsyncClient, ASGITransport

from src.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_create_post(client: AsyncClient):
    resp = await client.post("/posts", json={"title": "hi"})
    assert resp.status_code == 201
```

## Override dependencies — never monkeypatch

```python
from src.auth.dependencies import parse_jwt_data
from src.main import app


def fake_user():
    return {"user_id": "00000000-0000-0000-0000-000000000001"}


@pytest.fixture(autouse=True)
def _override_auth():
    app.dependency_overrides[parse_jwt_data] = fake_user
    yield
    app.dependency_overrides.clear()
```

`app.dependency_overrides` is FastAPI's built-in mechanism. It exercises
the real DI graph in tests, unlike `monkeypatch` on internal helpers.

## Use a real database in integration tests

Don't mock the database. Use testcontainers or an ephemeral schema and
override the dependency that produces the session. Mocking diverges from
production; the divergence always fires eventually.

## Rules

- Always async client, even for sync routes (keeps the test pattern
  uniform).
- Use `dependency_overrides` for auth and external services.
- Run with `pytest-asyncio` mode `auto` (or decorate every test with
  `@pytest.mark.asyncio`).
