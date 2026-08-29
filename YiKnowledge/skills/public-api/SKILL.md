---
title: public-api
name: public-api
description: >
  Public API probing and discovery — curl-based endpoint enumeration, OpenAPI
  spec scraping, API integration testing, and undocumented endpoint discovery.
  Invoke when the user is exploring a third-party API, reverse-engineering
  API behavior, writing API integration tests, scraping OpenAPI/Swagger docs,
  or debugging API authentication. Trigger words: "API", "endpoint", "curl",
  "OpenAPI", "Swagger", "REST API", "API testing", "API discovery", "API probe",
  "API integration", "API authentication", "bearer token", "API key", "API docs",
  "insomnia", "Postman", "HTTPie", "wget", "XHR", "fetch API", "request/response",
  "status code", "JSON API", "GraphQL endpoint", "API rate limit".
  Do NOT trigger for: building your own API (FastAPI, Express), database queries,
  or internal service-to-service communication.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/public-api
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - api
  - integration
  - backend
chip: backend
---
# Public API

API probing, discovery, and integration testing patterns.

## Core Concepts

- **Discovery** — OpenAPI/Swagger scraping, endpoint enumeration, documentation mining
- **Probing** — curl-based request crafting, header manipulation, auth testing
- **Integration Testing** — contract testing, response validation, error handling
- **Authentication** — bearer tokens, API keys, OAuth2 flows, session cookies

## Key Rules

1. Start with the official docs and OpenAPI spec before probing blind
2. Use `curl -v` for verbose debugging — headers, TLS, redirects
3. Respect rate limits — add `sleep` between probes, watch `Retry-After` headers
4. Never probe production APIs without explicit permission
5. Save discovered endpoints to a structured format (OpenAPI, Postman collection)