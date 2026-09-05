---
title: "ADR: YiPet Four-Tier API Layer Design"
tags: [adr, yipet, api, architecture, client, services]
category: leader/decisions/yipet
created: 2026-08-24
updated: 2026-08-24
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the four-tier API layer architecture and why it was chosen over simpler alternatives"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ../../../engineer/learn/projects/yipet/架构设计.md
---

# ADR: YiPet Four-Tier API Layer Design

> **Status**: Accepted (2026-07-27) — implemented

## Context

YiPet needed an HTTP API layer to communicate with the YiAi FastAPI backend. The initial prototypes used inline `fetch` calls scattered across components and content scripts. As the extension grew to support chat, sessions, auth, knowledge, RAG, and database operations, the inline approach became unmaintainable — duplicate error handling, inconsistent RPC envelope construction, and no shared type definitions.

The question was: how much structure? A Chrome extension talking to a single backend could get away with a thin wrapper. But YiPet shares the same RPC envelope protocol as YiVad, and the same parameter name contracts (`filter` not `query`, `target_file` not `path`).

## Decision

**Implement a four-tier API layer: `client → endpoints → types → services`, with constructor-injected `ApiClient`.**

### Architecture

```
src/api/
├── client.ts          # Tier 1: ApiClient — wraps fetch + retry + SSE streaming
├── endpoints.ts       # Tier 2: Path constants by domain
├── types.ts           # Tier 3: Request/response interfaces
├── index.ts           # Barrel export
└── services/          # Tier 4: Domain service classes
    ├── auth.ts        #   AuthService — login, logout, refresh, profile
    ├── chat.ts        #   ChatService — prompt + SSE streaming
    ├── config.ts      #   ConfigService — app config CRUD
    ├── database.ts    #   DatabaseService — generic collection CRUD
    ├── faq.ts         #   FaqService — FAQ management + batch reorder
    ├── sessions.ts    #   SessionService — CRUD, search, favorites, export/import
    ├── knowledge.ts   #   KnowledgeService — scan, read, write
    ├── rag.ts         #   RagService — RAG query + chat (SSE)
    └── index.ts       #   createApiServices() aggregator
```

### Tier responsibilities

| Tier | File | Responsibility |
|---|---|---|
| 1 — Client | `client.ts` | `ApiClient` class wrapping `fetch` with retry, timeout, error extraction, dev-gated logger, and SSE streaming. Other tiers must NOT call `fetch` directly. |
| 2 — Endpoints | `endpoints.ts` | Path constants by domain (`/auth/login`, `/sessions`, `/chat`, `/rag/query`, ...). Single source of truth for URL paths. |
| 3 — Types | `types.ts` | Request/response interfaces (`LoginRequest`, `RpcRequest`, `QueryParams`, `ChatParams`, `SessionRecord`, ...). Services and callers import types from here. |
| 4 — Services | `services/*.ts` | Domain service classes. Each takes `ApiClient` via constructor injection. `createApiServices(config)` aggregates them. |

### Key design decisions

1. **Constructor-injected `ApiClient`**: Services don't create their own HTTP client — they receive it. This enables testing with a mock client and ensures consistent error handling across all services.

2. **`ApiClient` wraps CDN-loaded utility**: The actual `fetch` wrapper (`api-client.ts`) lives in `public/cdn/utils/` and is loaded via the CDN catalog. The `src/api/client.ts` layer adds dev-gated logging and SSE streaming on top.

3. **`createApiServices()` aggregator**: A single factory function creates all services with shared `ApiClient` config. Callers import one function instead of wiring each service manually.

4. **RPC envelope centralized**: The `{module_name, method_name, parameters}` shape is constructed in the `ApiClient`, not in individual services. This ensures the envelope is consistent across all calls.

### Consequences

- **Positive**: Cross-project consistency with YiVad (same pattern); typed request/response contracts catch parameter name mismatches at compile time; constructor injection enables testing
- **Negative**: Over-engineered for a single-backend Chrome extension — 4 tiers for what could be 1 file; adds indirection for simple calls
- **Risk**: The CDN-loaded `api-client.ts` is a runtime dependency — if the CDN catalog fails to load it, all API calls fail

## Alternatives considered

1. **Inline `fetch` calls in components** — rejected because duplicate error handling, no type safety, and scattered RPC envelope construction
2. **Single `api.ts` file with all functions** — rejected because it would become a god module as services grew; the four-tier design separates concerns
3. **Generate types from YiAi's OpenAPI spec** — rejected because YiAi doesn't expose OpenAPI; manual types are the pragmatic choice