# Project Structure

Organize by **domain**, not by file type. One package per bounded context.

## Canonical tree

```
fastapi-project
├── alembic/
├── src
│   ├── auth
│   │   ├── router.py          # API endpoints
│   │   ├── schemas.py         # Pydantic models
│   │   ├── models.py          # SQLAlchemy ORM models
│   │   ├── service.py         # Business logic
│   │   ├── dependencies.py    # Route dependencies
│   │   ├── config.py          # Domain-scoped BaseSettings
│   │   ├── constants.py       # Constants and error codes
│   │   ├── exceptions.py      # Domain-specific exceptions
│   │   └── utils.py           # Helper functions
│   ├── aws
│   │   ├── client.py          # client model for external service communication
│   │   ├── schemas.py
│   │   ├── config.py
│   │   ├── constants.py
│   │   ├── exceptions.py
│   │   └── utils.py
│   ├── posts
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── dependencies.py
│   │   ├── constants.py
│   │   ├── exceptions.py
│   │   ├── service.py
│   │   └── utils.py
│   ├── config.py              # global configs
│   ├── models.py              # global models
│   ├── exceptions.py          # global exceptions
│   ├── pagination.py          # global module e.g. pagination
│   ├── database.py            # db connection related stuff
│   └── main.py
├── tests/
│   ├── auth
│   ├── aws
│   └── posts
├── templates/
│   └── index.html
├── requirements
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── .env
├── .gitignore
├── logging.ini
└── alembic.ini
```

## Per-file roles

| File | Purpose |
|------|---------|
| `router.py` | The core of each module with all the endpoints. |
| `schemas.py` | Pydantic models for this domain. |
| `models.py` | DB models (SQLAlchemy). |
| `service.py` | Module-specific business logic. |
| `dependencies.py` | Route dependencies (validators, auth, DB session). |
| `constants.py` | Module-specific constants and error codes. |
| `config.py` | Local env vars (a `BaseSettings` subclass with `env_prefix=`). |
| `utils.py` | Non-business logic helpers (response normalization, data enrichment). |
| `exceptions.py` | Module-specific exceptions (`PostNotFound`, `InvalidUserData`). |

## Cross-domain imports

Always use the explicit module name. Never `from src.auth import *`.

```python
from src.auth import constants as auth_constants
from src.notifications import service as notification_service
from src.posts.constants import ErrorCode as PostsErrorCode  # if each package has its own ErrorCode
```

This is the only pattern that survives a domain being renamed or split.

## Why not file-type layout

`routers/`, `schemas/`, `models/` works for microservices and small projects,
but doesn't scale for monoliths with many domains: a small change touches 4-5
files across 4-5 directories, and the cognitive load of remembering where
`PostNotFound` lives grows linearly.

## Why `src/` and not the project root

Keeping the package inside `src/` prevents accidental imports from the
working directory and forces a clean install for tests, so CI catches
import-time side effects that a local `python app.py` would hide.
