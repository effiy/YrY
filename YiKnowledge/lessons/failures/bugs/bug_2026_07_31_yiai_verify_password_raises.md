---
key: bug_2026_07_31_yiai_verify_password_raises
title: verify_password raised ValueError on empty/malformed stored hash, crashing
  login with 500 instead of 401
project: YiAi
module: domain/auth/core.py
severity: medium
priority: medium
status: fixed
type: error-handling
iteration: loop-2026-07-31
assignee: claude
---

## Description

`YiAi/src/domain/auth/core.py:verify_password` called `bcrypt.checkpw(plain.encode("utf-8"), stored.encode("utf-8"))` directly. bcrypt raises `ValueError("Invalid salt")` when the stored hash is empty, malformed, or plaintext (e.g. legacy rows with no password field, corrupted migrations, or someone stored plaintext during debugging).

The caller in `server/routes/auth.py:46` is:
```python
if not verify_password(body.password, hashed):
    raise BusinessException("Incorrect username or password", code=401)
```

This relies on `verify_password` returning a bool — `False` maps to a clean 401. But when `stored` is malformed, `checkpw` raises `ValueError` *before* returning a bool. The exception propagated up through FastAPI's handler and surfaced as HTTP 500 Internal Server Error, not the intended 401. The user sees a server crash instead of a "wrong password" message.

## Steps to Reproduce

1. Seed a user row in MongoDB with a malformed `password` field — e.g. empty string `""`, a plaintext value like `"admin"`, or a truncated hash `"$2b$12$abc"` (too short to be a valid bcrypt salt).
2. `POST /auth/login` with the matching username and any password.
3. `verify_password(plain, stored)` calls `bcrypt.checkpw(plain.encode, stored.encode)` — bcrypt raises `ValueError("Invalid salt")`.
4. The exception escapes the `if not verify_password(...)` block (no try/except in the caller).
5. FastAPI's default exception handler returns HTTP 500 with a generic error body, instead of the intended 401 from `BusinessException("Incorrect username or password", code=401)`.

## Expected Result

`verify_password` returns `False` for any empty or malformed stored hash. The login flow maps `False` → clean 401 "Incorrect username or password". The server never crashes on a corrupted password row.

## Actual Result

`verify_password` propagated `ValueError("Invalid salt")` to the caller. Login crashes with HTTP 500 on any malformed stored hash — the user sees a server error instead of a credential rejection, and the operator gets paged for what is actually just a bad row in the DB.

## Cause

`verify_password` was written as a thin wrapper around `bcrypt.checkpw` with no defensive guard. bcrypt's `checkpw` validates the salt format and raises on anything malformed. The function's signature (`-> bool`) and its call site in the login flow both assume it returns a bool, never raises — but the implementation didn't honor that contract. A malformed stored hash (empty / plaintext / truncated) was an unhandled edge case.

The risk surface: any migration that touches the `password` column, any debug session that writes plaintext for testing, any legacy row that predates the bcrypt migration — all trigger this path.

## Solution

Wrapped `bcrypt.checkpw` in a try/except and added an early guard for empty inputs. `verify_password` now never raises:

```python
def verify_password(plain: str, stored: str) -> bool:
    """Verify a password against a stored bcrypt(*) hash.

    Returns False on any failure (empty/malformed stored hash, no match).
    Never raises — callers in the login flow rely on a bool so they can map
    False to a clean 401 instead of a 500 from an uncaught ValueError.
    """
    if not plain or not stored:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), stored.encode("utf-8"))
    except (ValueError, TypeError) as exc:
        # bcrypt raises ValueError("Invalid salt") for empty/malformed stored
        # hashes — e.g. legacy rows with no password field, corrupted migrations,
        # or someone stored plaintext. Treat as "no match", not a crash.
        logger.warning(f"verify_password rejected malformed stored hash: {exc}")
        return False
```

Process follow-up: any function whose signature promises `-> bool` and is consumed by a caller that branches on the bool (`if not verify(...): raise`) must honor "never raises" as a hard contract. Wrap third-party calls that validate input format (bcrypt, JWT decode, regex matchers) in try/except and return `False` on failure — let the caller's 401/400 path handle it. A `ValueError` that escapes such a function turns a clean 4xx into a 5xx and pages the operator for what's really just bad input.