# Dependencies

## Use `Annotated[T, Depends(...)]` — the modern form

```python
from typing import Annotated
from fastapi import Depends

PostDep = Annotated[dict, Depends(valid_post_id)]

@router.get("/posts/{post_id}")
async def get_post(post: PostDep):
    return post
```

Default-arg form (`post: dict = Depends(valid_post_id)`) still works but is
considered legacy — it has gotchas with default values and doesn't compose
cleanly with type-checkers.

## Beyond DI — use dependencies for validation

Pydantic validates shape. Dependencies validate **against the world**
(database, external services, business rules).

```python
# dependencies.py
async def valid_post_id(post_id: UUID4) -> dict[str, Any]:
    post = await service.get_by_id(post_id)
    if not post:
        raise PostNotFound()
    return post

# router.py
@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post_by_id(post: dict[str, Any] = Depends(valid_post_id)):
    return post

@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    update_data: PostUpdate,
    post: dict[str, Any] = Depends(valid_post_id),
):
    updated_post = await service.update(id=post["id"], data=update_data)
    return updated_post

@router.get("/posts/{post_id}/reviews", response_model=list[ReviewsResponse])
async def get_post_reviews(post: dict[str, Any] = Depends(valid_post_id)):
    post_reviews = await reviews_service.get_by_post_id(post["id"])
    return post_reviews
```

Without the dependency, every endpoint would have to re-validate `post_id`
exists and re-test it.

## Chain dependencies

```python
# dependencies.py
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError

async def valid_post_id(post_id: UUID4) -> dict[str, Any]:
    post = await service.get_by_id(post_id)
    if not post:
        raise PostNotFound()
    return post

async def parse_jwt_data(
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/token")),
) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, "JWT_SECRET", algorithms=["HS256"])
    except InvalidTokenError:
        raise InvalidCredentials()
    return {"user_id": payload["id"]}

async def valid_owned_post(
    post: dict[str, Any] = Depends(valid_post_id),
    token_data: dict[str, Any] = Depends(parse_jwt_data),
) -> dict[str, Any]:
    if post["creator_id"] != token_data["user_id"]:
        raise UserNotOwner()
    return post

# router.py
@router.get("/users/{user_id}/posts/{post_id}", response_model=PostResponse)
async def get_user_post(post: dict[str, Any] = Depends(valid_owned_post)):
    return post
```

## Per-request caching

Dependencies are cached per request. `parse_jwt_data` is referenced by
`valid_owned_post`, `valid_active_creator`, and `get_user_post` — it runs
**once** per request even though three endpoints depend on it. Decouple
without worrying about cost.

## Rules

- Prefer `async def` dependencies. Sync deps run in the threadpool — wasted
  overhead for small CPU-only checks.
- Use the same path-variable name across endpoints when you want to share a
  dependency (e.g. `profile_id` in both `/profiles/{profile_id}` and
  `/creators/{profile_id}`).
