---
title: YiVad LoginForm pre-hashed the password with SHA-256 before sending, but
  the backend stores bcrypt(plaintext) and calls verify_password(plaintext, hash)
  — login was always rejected for API-created users
key: bug_2026_07_31_login_form_sha256_mismatch
tags:
- frontend
- backend
- yivad
- yiai
- auth
- bcrypt
- regression
category: lessons/failures/bugs
created: '2026-07-31'
updated: '2026-07-31'
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: YiVad
module: views/login/components/LoginForm.vue:login + YiAi src/domain/auth/core.py
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiVad Vue 3.5 + Rsbuild 1, YiAi FastAPI + bcrypt + PyJWT)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_31_login_form_sha256_mismatch.md
resolvedAt: 1759309200000
closedAt: null
---

## Description
`YiVad/src/views/login/components/LoginForm.vue:login` ran `await sha256(loginForm.password)` before sending the value to `/auth/login`. The YiAi backend (`src/server/routes/auth.py:login`) calls `verify_password(body.password, hashed)`, where `verify_password` runs `bcrypt.checkpw(received, stored_bcrypt_hash)`.

The backend stores `bcrypt(plaintext)` (per `src/domain/auth/core.py:hash_password` and its usage in `src/server/routes/users.py` create/update/batch routes — all call `hash_password(body.password)` with plaintext). So `verify_password` receives `sha256(plaintext)` and compares against `bcrypt(plaintext)` → always returns `False`. Every API-created user is locked out.

The `core.py` docstring even spells this out: *"Client sends the plaintext password over HTTPS. Server stores bcrypt(password) in MongoDB. On login, server runs bcrypt.checkpw(received_password, stored_hash)."* The frontend's SHA-256 pre-hash violated the documented contract.

The seed users in `src/data/seeds/users.json` have `"password": "seed_hashed_placeholder"` — neither SHA-256 nor a valid bcrypt hash — so login for seed users was broken for a *different* reason (invalid bcrypt hash). Real users created via `POST /users` (or batch import) had a real bcrypt hash but login was still broken because of the SHA-256 mismatch.

## Steps to Reproduce
1. Start YiAi (`main.py` on port 10086).
2. Create a real user via `POST /users` with `{"username":"qa","password":"123456"}`. The backend stores `bcrypt("123456")`.
3. Open YiVad at http://localhost:8848/#/login, enter `qa` / `123456`.
4. Frontend computes `sha256("123456")` = `"a665a45920422f9d417e0667..."` (64-char hex), sends `{"username":"qa","password":"a665a..."}`.
5. Backend `verify_password("a665a...", bcrypt("123456"))` → `bcrypt.checkpw(b"a665a...", bcrypt("123456"))` → `False`.
6. Login rejected with "Incorrect username or password" toast. User is permanently locked out.

## Expected Result
Frontend sends the plaintext password to `/auth/login` over HTTPS. Backend `verify_password(plaintext, bcrypt(plaintext))` matches. Login succeeds for API-created users.

## Actual Result
Frontend pre-hashed with SHA-256. Backend compared the SHA-256 hex against `bcrypt(plaintext)` — never matched. Every real user was locked out at login. The bug was masked because:
- Seed users were always broken anyway (placeholder hash).
- Auth middleware is disabled by default (`middleware_auth_enabled=False`), so the broader app was still usable.
- Nobody had actually logged in via the form against a real bcrypt-stored user yet.

## Cause
The `sha256` helper was likely cargo-culted from another project's "defense in depth" pattern (hash the plaintext in the browser so it's never logged). But the backend `hash_password` / `verify_password` pair is built for *plaintext in, plaintext compare* — it bcrypts the plaintext directly. The frontend SHA-256 layer was never mirrored on the storage side, so the two sides were hashing/verifying different values.

The mismatch lived undetected because (a) the default dev workflow doesn't actually exercise the login form (no seeded valid users), and (b) `middleware_auth_enabled=False` means the app is fully open without a token — so a broken login form doesn't block local dev.

## Solution
Removed the SHA-256 pre-hash from `LoginForm.vue`. The login API now receives the plaintext password (over HTTPS), matching the backend's documented contract.

```diff
- /** Compute SHA-256 hex digest using the Web Crypto API. */
- const sha256 = async (message: string): Promise<string> => {
-   const msgBuffer = new TextEncoder().encode(message);
-   const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
-   const hashArray = Array.from(new Uint8Array(hashBuffer));
-   return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
- };
-
 ...
-      // 1. Execute login API (password is SHA-256 hashed before transmission)
-      const { data } = await loginApi({
-        username: loginForm.username,
-        password: await sha256(loginForm.password)
-      });
+      // 1. Execute login API. Send the plaintext password over HTTPS — the
+      // backend stores bcrypt(plaintext) via domain.auth.hash_password and
+      // verifies via verify_password(plaintext, bcrypt_hash). A previous
+      // version pre-hashed with SHA-256 on the client, so
+      // verify_password received sha256(plaintext) instead of plaintext and
+      // bcrypt.checkpw would never match bcrypt(plaintext) — login was
+      // always rejected for API-created users.
+      const { data } = await loginApi({
+        username: loginForm.username,
+        password: loginForm.password
+      });
```

Process follow-up: when wiring a client to an auth endpoint, read the backend's `hash_password` / `verify_password` source to learn the exact input contract. If the backend bcrypts the plaintext, the client must send plaintext (over HTTPS) — a SHA-256 pre-hash layer requires the storage side to bcrypt the SHA-256 hash, otherwise the two sides operate on different values and login is silently broken for every real user. Defense-in-depth hashing only works when *both* ends agree on the hash layer. The backend's docstring (or `__init__.py` module docstring) is the source of truth for the contract — read it before adding client-side transforms.
