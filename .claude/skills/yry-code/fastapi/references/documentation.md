# API Documentation

## Hide docs outside selected envs

```python
from fastapi import FastAPI

from src.config import settings

SHOW_DOCS_IN = {"local", "staging"}
app_kwargs = {"title": "My API"}
if settings.ENVIRONMENT not in SHOW_DOCS_IN:
    app_kwargs["openapi_url"] = None  # disables /docs and /redoc

app = FastAPI(**app_kwargs)
```

In production, exposing `/docs` is a free attacker recon tool. Restrict it
to environments where the dev team is the audience.

## Document endpoints fully

```python
from fastapi import APIRouter, status

router = APIRouter()


@router.post(
    "/items",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an item",
    description="Creates an item owned by the authenticated user.",
    tags=["items"],
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse, "description": "Validation error"},
        status.HTTP_409_CONFLICT: {"model": ErrorResponse, "description": "Slug already exists"},
    },
)
async def create_item(payload: ItemCreate) -> ItemResponse:
    ...
```

- `summary` becomes the heading in `/docs`.
- `description` accepts Markdown — link to relevant runbooks.
- `tags` group related endpoints in the sidebar.
- `responses` documents the *non-obvious* status codes; the success path is
  already implied by `response_model` + `status_code`.
