---
title: RPC envelope contract pattern
aliases: [rpc-envelope-pattern, rpc-envelope-contract, single-entry-rpc]
tags: [pattern, engineering patterns, RPC, envelope, contract, cross-project, API]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "RPC interfaces are versioned and validated through envelope contracts, preventing breaking changes from reaching clients"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
- ../projects/yiai/dev-standards.md
  - ../projects/yiai/functional-modules.md
  - ../lessons/gotcha-sse-ondone-guard.md
  - ./sse-streaming.md
---

# RPC envelope contract pattern

> **As an** engineer, **I want to** rpc envelope, **so that** pattern applied consistently. 

> Single HTTP entry + unified envelope `{module_name, method_name, parameters}` → `{code, message, data}`; field names hard-constrained; error normalized. The de facto standard contract across the Yi family projects. 

## Summary

- **Pattern**: `POST /` single entry; request body `{module_name, method_name, parameters}`; response body `{code, message, data}`; `code=0` success, non-zero throws `YiAiError`
- **Cross-project applicability**: YiAi (backend Python FastAPI) → YiVad (frontend Vue) + YiPet (frontend React) shared across three ends
- **Landing**: [YiAi dev standards §field name contract](../projects/yiai/dev-standards.md) + [cross-project shared client design](../engineering/shared-client-design.md)
- **Alternative**: RESTful multi-entry + resource paths (not applicable to the Yi family, reason in §Not applicable) 

## Core viewpoints

**The envelope is not a protocol -- it is a contract between two codebases that evolve independently.** The backend team can change the implementation of `chat_stream` without telling the frontend team, as long as the envelope shape (`{module_name, method_name, parameters}` -> `{code, message, data}`) stays the same. The envelope is the stable API surface; everything behind it is an implementation detail.

**Field name consistency is a hard constraint that must be enforced by CI, not by convention.** A convention document that says "use `filter`, not `query`" will be ignored under schedule pressure. A CI lint rule that fails the build when `query` appears in a request body will not be ignored. The difference between convention and enforcement is the difference between aspiration and reality.

**The `code` field is a protocol, not a status code.** `code=0` means success everywhere. `code=1xxx` means the caller made a mistake. `code=5xxx` means the server is broken. This is not HTTP status codes (where 200 means success and 500 means error). It is a separate, simpler protocol that maps business errors to frontend behaviors without requiring the frontend to parse error messages.

**Type derivation from OpenAPI is not a convenience -- it is the only way to prevent contract drift at scale.** When the backend adds a field to the response, the frontend's TypeScript types must update. If types are hand-written, they will fall out of sync. If types are derived from `openapi.json`, CI can diff the generated types against the committed types and block the merge if they differ. This turns contract drift from a runtime bug into a compile-time error.

**The shared client base layer is not code reuse -- it is the single point where every RPC call is normalized.** Auth injection, error normalization, `code` checking, and type wrapping happen in exactly one function (`rpcCall<T>`). If a bug is found in error handling, it is fixed in one place. If a new auth mechanism is added, it is added in one place. The base layer is the enforcement mechanism for the envelope contract.

## Key info

- **Envelope shape**: request `{ module_name: "services.<domain>.<service>", method_name: "<method>", parameters: <method-specific> }`, response `{ code: 0, message: "ok", data: <any> }`. The `module_name` is a dotted path that resolves to a Python module; the `method_name` is a callable in that module. The backend uses `importlib` to resolve the module and `getattr` to resolve the method -- this is dynamic dispatch, not a registered route table. A typo in `module_name` produces a 500, not a 404.
- **Error code taxonomy**: `1xxx` = client error (bad request, missing required field, validation failure) -- the caller should fix the request. `2xxx` = auth error (missing token, expired token, insufficient permissions) -- the caller should re-authenticate. `5xxx` = server error (database unreachable, AI unavailable, internal exception) -- the caller should retry or escalate. The frontend maps these to: show inline error (1xxx), redirect to login (2xxx), toast + retry button (5xxx).
- **Field name bugs (production history)**: `filter` vs `query` in `query_documents` -- YiPet's `SessionService` sent `query` and got all documents back (backend silently ignored unknown key). `target_file` vs `path` in file read/write -- YiVad's `fileService` sent `path` and got 422 (Pydantic validation rejected the wrong field name). Both bugs were silent or cryptic; both were fixed by renaming the field. The root cause: no automated contract test that validates the request shape against the expected shape.
- **Shared client design**: YiPet (`src/api/client.ts`) and YiVad (`src/api/modules/`) both wrap the same base layer (`ApiClient` class / `RequestHttp` class) that handles: (1) auth token injection from store, (2) RPC envelope construction, (3) `code` field checking and `YiAiError` throwing, (4) SSE stream parsing, (5) abort controller integration. The base layer is ~200 lines and has changed 3 times in 6 months (auth, SSE, abort). Without it, each of the 30+ API service functions would have duplicated these responsibilities.
- **Contract test approach**: a Vitest/Jest suite that sends real RPC calls to a running YiAi instance, validates: (1) response shape matches expected type, (2) `code=0` for valid requests, (3) `code!=0` for invalid requests (wrong module, wrong method, wrong parameters), (4) `data` field matches the expected schema. These tests run against a local YiAi instance, not a mock. They catch contract drift before it reaches production.

## Problem

Pain points (quantified) of not using this pattern: 

- **Multi-entry divergence**: 13 routes = 13 endpoint paths + 13 parameter schemas; each new domain on the frontend needs a new fetch wrapper
- **Field name drift**: `filter` vs `query` / `target_file` vs `path` / `cname` vs `collection_name` — each domain inventing its own field names = cross-project contract broken = bugs frequent
- **Error handling scattered**: Each endpoint does its own `if (json.code !== 0)` = error handling logic scattered = missed handling = silent failure
- **Auth scattered**: Each endpoint injects its own `Authorization` header = missed injection = auth failure
- **Type unsafe**: Hand-written `types/api.d.ts` = contract drift relies on eyeballing = backend changes field, frontend unaware

## Pattern

### Envelope contract

```http
POST / HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "module_name": "rag",
  "method_name": "chat_stream",
  "parameters": { "query": "...", "scope": "..." }
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

### `code` protocol

| Code segment | Meaning | Frontend response |
|---|---|---|
| 0 | success | return `data` |
| 1xx | parameter error | toast hint + no retry |
| 2xx | auth failure | redirect to login page |
| 3xx | business error | business toast |
| 4xx | rate limited | backoff retry |
| 5xx | system error | error page + report |

### Field name hard constraint (load-bearing) 

| Field name | Must not be written as | Purpose |
|---|---|---|
| `filter` | `query` (`query` is already a top-level request body field)  | Resource filtering |
| `target_file` | `path` | File operation target |
| `cname` / `collection_name` | `name` | Collection name |
| `module_name` / `method_name` | `module` / `method` | RPC dispatch |

### Frontend base layer (shared client) 

```typescript
export async function rpcCall<T>(baseUrl, moduleName, methodName, parameters, init?): Promise<T> {
  const body = { module_name: moduleName, method_name: methodName, parameters };
  const res = await fetch(baseUrl, { method: 'POST', headers: {...init?.headers}, body: JSON.stringify(body), signal: init?.signal });
  if (!res.ok) throw new YiAiError(res.status, `HTTP ${res.status}`);
  const json: RpcResponse<T> = await res.json();
  if (json.code !== 0) throw new YiAiError(json.code, json.message, json.data);
  return json.data;
}
```

### Types derived from OpenAPI

```bash
# Backend
python -m src.app --openapi  # generate openapi.json

# Frontend
npx openapi-typescript openapi.json -o src/api/types/api.d.ts
```

CI runs front-back diff to block contract drift. 

## Applicable / Not applicable

### Applicable

- Internal systems with many endpoints (≥ 10) + multiple frontends consuming
- Backend Python / Node + frontend TS cross-language
- Field name contract needs hard constraint (large team / cross-project) 
- Error handling needs normalization (multi-endpoint same protocol) 
- Type safety needs OpenAPI derivation

### Not applicable

- Public RESTful API (many external consumers, RESTful resource paths more intuitive) 
- Simple CRUD consumed by a single frontend (RESTful paths shorter) 
- Projects where GraphQL has already landed (GraphQL already solves contract + types) 
- Low-code / no-code scenarios (resource paths better suited for configuration) 

## Landing checklist

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Backend: single entry `POST /` + `module_name` / `method_name` dispatch | Backend routes | One-shot |
| 2 | Backend: unified response `{code, message, data}` + `code` protocol | Backend middleware | One-shot |
| 3 | Backend: field name hard constraint (`filter` / `target_file` / `cname`) + CI lint | Backend lint | One-shot |
| 4 | Backend: `openapi.json` exposed + OpenAPI-derived types | Backend + frontend | Follows #2 |
| 5 | Frontend: base layer `rpcCall<T>` + `YiAiError` + error normalization | Frontend shared | One-shot |
| 6 | Frontend: feature module calls base layer (`yiAiRpc('rag', 'query', {...})`)  | Frontend api modules | Gradual |
| 7 | CI: openapi types diff block + field name lint block | CI | One-shot |

## Action recommendations

1. **Enforce field name consistency with a CI lint rule, not by code review convention.** A convention document that says "use `filter`, not `query`" will be ignored under schedule pressure. A CI lint rule that fails the build when `query` appears in a request body will not be ignored. The difference between convention and enforcement is the difference between aspiration and reality.

2. **Derive frontend TypeScript types from the backend's `openapi.json` and block the merge if they differ.** Hand-written types fall out of sync with the backend silently. CI should run `openapi-typescript` diff against committed types and block the merge on any discrepancy. This turns contract drift from a runtime bug into a compile-time error.

3. **Use the base layer `rpcCall<T>` as the only fetch wrapper in the entire frontend codebase.** If the chat module has its own `chatFetch()` and the knowledge module has its own `knowledgeFetch()`, the codebase has diverged. Feature modules call `rpcCall('module', 'method', params)` -- they do not write their own HTTP logic. Auth injection, error normalization, and type wrapping happen in exactly one place.

4. **Apply the envelope contract to every endpoint, no matter how simple.** A developer adding a "simple query" endpoint that returns `{result: ...}` instead of `{code: 0, message: "ok", data: {result: ...}}` breaks the frontend base layer, which expects `code` and throws `YiAiError` when it is missing. The envelope is not optional -- it is the contract.

5. **Assign each error code a single, unambiguous meaning across the entire API surface.** If `code=1001` means "invalid module_name" in one endpoint and "missing required field" in another, the frontend cannot write a single error handler. Each error code must have one meaning, documented in a shared error code registry that both frontend and backend teams reference.

## Anti-patterns

**Treating the envelope as optional for "simple" endpoints.** A developer adds a new endpoint that returns `{result: ...}` instead of `{code: 0, message: "ok", data: {result: ...}}` because "it is just a simple query." The frontend base layer expects `code` and throws `YiAiError` when it is missing. Every endpoint, no matter how simple, must use the envelope. The envelope is not optional.

**Building a new fetch wrapper per feature module.** If the chat module has its own `chatFetch()` and the knowledge module has its own `knowledgeFetch()` and the database module has its own `dbFetch()`, the codebase has diverged. The base layer `rpcCall<T>` must be the only fetch wrapper. Feature modules call `rpcCall('module', 'method', params)` -- they do not write their own HTTP logic.

**Field name negotiation in code review.** A PR where the reviewer says "please rename `query` to `filter`" is a process failure. The field names must be enforced by a CI lint rule, not by human reviewers. Human reviewers miss inconsistencies; CI does not.

**OpenAPI types that are generated but not committed.** If the types are generated during CI but not committed to the repository, the frontend developer's IDE has no type information. The generated types must be committed so that IDE autocompletion, type checking, and refactoring work locally.

**Error codes that are reused across different error meanings.** If `code=1001` means "invalid module_name" in one endpoint and "missing required field" in another, the frontend cannot write a single error handler for code 1001. Each error code must have a single, unambiguous meaning across the entire API surface.



- **Multi-entry divergence**: One endpoint path per domain = field name drift + error handling scattered; must be single entry. 
- **Field names invented per domain**: `filter` vs `query` / `target_file` vs `path` will break the contract; must have field name hard constraint + CI lint. 
- **Error not normalized**: Each caller does its own `if (json.code !== 0)` = error handling scattered + missed; base layer must throw `YiAiError`. 
- **Hand-written types**: Contract drift relies on eyeballing; must use OpenAPI derivation + CI diff block. 
- **`code` field semantics unclear**: `code=200` success vs `code=0` success confusion; must use `code=0` success + segment protocol. 
- **Auth scattered**: Each endpoint injects its own header; base layer must inject uniformly. 
- **`as any` to bypass types**: Contract drift silenced; Biome lint forbids `as any`, must use `as unknown as` explicit + comment reason. 

## Related

- Landing: [YiAi dev standards §field name contract](../projects/yiai/dev-standards.md) + [YiAi functional modules §13 routes](../projects/yiai/functional-modules.md)
- Landing: [cross-project shared client design](../engineering/shared-client-design.md) §base layer API
- Companion: [sse-streaming-pattern](./sse-streaming.md) — streaming extension of the same envelope
- Companion: [sse-ondone-guard gotcha](../lessons/gotcha-sse-ondone-guard.md) — SSE guard
- Upstream: [./README.md](./) — engineering-patterns leaf entry
