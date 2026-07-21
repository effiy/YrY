# Authentication — JWT

Use **`PyJWT`**, not `python-jose`. `python-jose` is unmaintained.

```python
import jwt  # PyJWT
from jwt.exceptions import InvalidTokenError

from src.config import settings
from src.auth.exceptions import InvalidCredentials


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except InvalidTokenError as exc:
        raise InvalidCredentials() from exc
```

## Auth dependency pattern

```python
# src/auth/dependencies.py
from typing import Annotated, Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError

from src.auth.config import auth_settings
from src.auth.exceptions import InvalidCredentials


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


async def parse_jwt_data(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            auth_settings.JWT_SECRET,
            algorithms=[auth_settings.JWT_ALG],
        )
    except InvalidTokenError as exc:
        raise InvalidCredentials() from exc
    return {"user_id": payload["id"]}
```

Combine with a domain validator via dependency chaining:

```python
async def valid_owned_post(
    post: Annotated[dict, Depends(valid_post_id)],
    token_data: Annotated[dict, Depends(parse_jwt_data)],
) -> dict:
    if post["creator_id"] != token_data["user_id"]:
        raise UserNotOwner()
    return post
```

`parse_jwt_data` is cached per request, so chaining it into multiple
validators costs nothing extra.
