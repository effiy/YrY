---
name: public-api
description: >
  Public API probing and inspection — curl testing, endpoint discovery,
  response inspection, authentication, rate limiting, and OpenAPI/Swagger
  doc scraping. Invoke when the user wants to: test a public API endpoint
  with curl/httpie, inspect API response headers and body, explore an
  OpenAPI/Swagger spec for available endpoints, test authentication flows
  (API key, Bearer token, OAuth2), handle rate limiting (429 Retry-After),
  scrape and document an undocumented API, compare API responses across
  versions, or validate API behavior. Trigger words: "public api",
  "api probe", "curl api", "api endpoint", "api test", "openapi",
  "swagger", "api docs", "api inspect", "api response", "api header",
  "bearer token", "api key", "rate limit", "429 retry", "postman",
  "httpie", "api scraping", "api discovery".
  Do NOT trigger for: internal/private API development (FastAPI endpoint
  creation) — use /fastapi; GraphQL introspection; or web scraping of
  HTML pages (not API endpoints).
lifecycle: default-pipeline
user_invocable: true
---

# public-api — Public API Probe & Inspector

> Test, inspect, and document public APIs — from curl one-liners to OpenAPI spec exploration.

## What this skill does

1. **Endpoint testing** — `curl` and `httpie` commands for GET/POST/PUT/DELETE, headers (`-H`), body (`-d`, `--json`), query params, verbose output (`-v`, `--trace`).
2. **Response inspection** — status codes (2xx/3xx/4xx/5xx), response headers (`Content-Type`, `Cache-Control`, CORS, rate-limit headers), JSON pretty-printing (`jq`, `python -m json.tool`), binary response handling.
3. **OpenAPI/Swagger** — fetch `openapi.json` / `swagger.json`, parse endpoints and schemas, test endpoints directly from spec, validate response against schema.
4. **Authentication** — API key in header/query, Bearer token (JWT), Basic auth, OAuth2 client credentials flow, session cookie handling (`-c`/`-b`).
5. **Rate limiting** — detect rate-limit headers (`X-RateLimit-*`, `Retry-After`), exponential backoff, `429` response handling, respecting `Retry-After` delay.
6. **Endpoint discovery** — crawl links from API responses (HATEOAS), guess common paths (`/api`, `/v1`, `/docs`, `/openapi.json`), robots.txt/sitemap inspection.
7. **API documentation** — generate human-readable API docs from observed behavior, compare responses across API versions, document authentication and error patterns.

## What this skill does NOT do

- Does NOT build or design APIs — use `/fastapi` for building FastAPI backends.
- Does NOT cover GraphQL introspection or queries.
- Does NOT scrape HTML web pages — API probes only.
- Does NOT perform penetration testing or security audits.
- Does NOT auto-generate API client libraries.

## Workflow

1. **Discover** — find the API base URL, check for OpenAPI spec at common paths.
2. **Authenticate** — if needed, obtain token/API key and verify with a simple request.
3. **Explore** — list endpoints, test with minimal params, inspect response shape.
4. **Document** — note authentication method, rate limits, response schemas, error formats.
5. **Validate** — test edge cases (missing params, invalid auth, malformed body).

## Borders

| Boundary | Permission |
|----------|-----------|
| Public API endpoints (HTTP/HTTPS) | read (curl/httpie) |
| OpenAPI/Swagger specs | read + parse |
| Local filesystem | read + write (for saving responses/docs) |
| Skill directory | read + write |
| Private/internal APIs | no access without explicit credentials |

## Fallback

| Situation | Behavior |
|-----------|----------|
| API requires auth but no credentials provided | State the auth method needed; don't guess credentials. |
| OpenAPI spec not found at common paths | Try `/openapi.json`, `/swagger.json`, `/docs`, `/redoc`; report if none found. |
| API returns 5xx errors | Note the error; suggest retry with backoff; don't assume server is down permanently. |
| Rate limited (429) | Parse `Retry-After`; implement wait; reduce request rate. |
| Response is not JSON | Inspect Content-Type; handle XML/HTML/text appropriately. |
| User asks about building an API | Defer to `/fastapi`. |
| User asks in a language other than English | Respond in the user's language; keep API/curl syntax in original. |
