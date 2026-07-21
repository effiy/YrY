# Database — SQLAlchemy 2.0 async

Use **SQLAlchemy 2.0**'s async API. `encode/databases` is in maintenance
mode — don't pick it for new projects.

## Engine and session factory

```python
# src/database.py
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.config import settings


engine = create_async_engine(str(settings.DATABASE_URL), pool_pre_ping=True)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with SessionFactory() as session:
        yield session
```

## Naming conventions

- `lower_case_snake`
- Singular tables: `post`, `user`, `post_like`
- Group with prefix: `payment_account`, `payment_bill`
- `_at` suffix for `datetime`, `_date` suffix for `date`
- Use the same FK column name everywhere it appears (`profile_id`, not
  `user_id` in some tables and `profile_id` in others)

## Index naming convention

```python
from sqlalchemy import MetaData

POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "%(column_0_label)s_idx",
    "uq": "%(table_name)s_%(column_0_name)s_key",
    "ck": "%(table_name)s_%(constraint_name)s_check",
    "fk": "%(table_name)s_%(column_0_name)s_fkey",
    "pk": "%(table_name)s_pkey",
}
metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)
```

## SQL-first, Pydantic-second

- Do joins, aggregation, and JSON shaping in **SQL** — Postgres is faster
  than CPython at this.
- Hydrate the result into Pydantic only for **response validation**, not
  for transformation.

## Anti-patterns in this area

- Calling a sync ORM session inside `async def` — blocks the loop and may
  deadlock the connection pool. Use `AsyncSession`.
- Returning a Pydantic model **and** setting `response_model=` to the same
  class — the model gets constructed twice (validate + serialize). Either
  return a `dict`/ORM row and let `response_model` validate, or drop
  `response_model` and trust the return type.
