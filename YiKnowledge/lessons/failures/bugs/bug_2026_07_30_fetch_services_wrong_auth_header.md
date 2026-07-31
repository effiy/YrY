---
title: Direct-fetch services sent X-Token even with a valid JWT — middleware
  checks Authorization Bearer first, X-Token only against a static token, so
  fetch-based chat/RAG/knowledge/weChat would still 401 when auth is enabled
key: bug_2026_07_30_fetch_services_wrong_auth_header
tags:
- frontend
- auth
- jwt
- middleware
- regression
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: api/modules/chatService, api/modules/fileService, api/modules/knowledgeService, api/modules/ragService, api/modules/weChatService
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiAi backend on localhost:10086, FastAPI middleware)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
Follow-up to `bug_2026_07_30_fetch_services_wrong_token_key`. The previous fix corrected the localStorage key (read from `"yivad-user"` instead of the never-written `"YiWeb.apiToken.v1"`) and attached the JWT via the `X-Token` header. That's the header the fetch services had always sent — but it is the **wrong header for JWT verification** on the YiAi middleware.

`YiAi/src/server/middleware.py:header_verification_middleware` has two distinct auth paths:

1. **JWT path** (line 82-99): checks `Authorization: Bearer <token>` first, decodes via `verify_jwt`, and passes if valid.
2. **Static-token path** (line 101-125): only reached when no `Authorization` header is present. Reads `X-Token` and compares it against `settings.auth_token` (a static configured string, **not a JWT**).

The fetch services (chatService SSE, knowledgeService, ragService, fileService, weChatService) all sent only `X-Token: <jwt>`. The middleware flow:
- No `Authorization` header → skip JWT path.
- Fall to X-Token path → compare `<jwt>` against `settings.auth_token` (a static string).
- If `settings.auth_token` is unset → "API verification not configured, skipping request header verification" → pass (this is the default; why no one noticed).
- If `settings.auth_token` IS set → JWT != static string → fail with `Invalid or missing headers`.

So even with my previous fix sending the JWT in `X-Token`, **enabling JWT auth (`middleware_auth_enabled = True`) would still 401 every fetch-based request**. The Axios path was unaffected — its interceptor sets `Authorization: Bearer <jwt>`, which the middleware's JWT path verifies correctly.

## Steps to Reproduce
1. Set `middleware_auth_enabled: True` in `YiAi/config.yaml`.
2. Restart YiAi.
3. Log in at `/#/login`.
4. Send a chat message in `/aiChat`. The SSE request to `http://localhost:10086/` carries `X-Token: <jwt>` (no `Authorization` header).
5. Response: `401 {"code": 1009, "message": "Invalid or missing headers"}` — the middleware compared the JWT against an empty/unset static token.
6. Meanwhile, the Axios-based bug-list search (`POST /` with `Authorization: Bearer <jwt>`) succeeds because the middleware's JWT path runs first.

## Expected Result
Direct-fetch services attach the JWT as a Bearer `Authorization` header, mirroring the Axios interceptor, so the middleware's JWT path can verify it. Every direct-fetch call works when JWT auth is enabled, identical to Axios calls.

## Actual Result
Direct-fetch services sent only `X-Token`, which the middleware treats as a static-token comparison, not a JWT. With JWT auth enabled, every fetch-based request 401s.

## Cause
The previous fix was incomplete because I assumed `X-Token` was just an alternate header name for the JWT — it is not. The middleware has two distinct auth schemes with different semantics, and `X-Token` is bound to the static-token path, not the JWT path. I should have inspected the middleware's actual verification flow before deciding which header to use.

## Solution
Added a single helper `yiAiAuthHeaders()` to `src/config/yiweb.ts` that returns a headers object containing both `Authorization: Bearer <jwt>` (the header the middleware's JWT path checks) and `X-Token: <jwt>` (kept for back-compat with deployments that configured a static `auth_token` equal to the JWT):

```ts
export function yiAiAuthHeaders(): Record<string, string> {
  const token = getYiAiToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  headers["X-Token"] = token;
  return headers;
}
```

All five fetch-based services now call `headers: yiAiAuthHeaders()` instead of manually constructing `{ "Content-Type": "application/json", "X-Token": getYiAiToken() }`. `vue-tsc --noEmit` passes.

This makes the direct-fetch services byte-for-byte equivalent to the Axios interceptor for auth purposes — both send `Authorization: Bearer <jwt>` — so the middleware's JWT path verifies them identically.

Process follow-up: when a backend has multiple auth schemes (JWT + static, OAuth + API-key, etc.), don't assume the header you picked is the one that triggers the scheme you want. Read the middleware's dispatch logic to confirm which header triggers which path. A request that "works" only because the target scheme is *disabled* is a latent bug — flip the config switch and every request fails.
