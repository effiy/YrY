---
title: Cross-project shared client design
aliases: [shared-client-design, cross-project-client, yry-shared-client]
tags: [client, rpc-envelope, sse-parser, cross-project, shared, design, api-client]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer]
benefit: "process followed predictably"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
- ../projects/yiai/dev-standards.md
  - ../projects/yiai/functional-modules.md
  - ../projects/yivad/dev-standards.md
  - ../projects/yivad/functional-modules.md
  - ../projects/yipet/dev-standards.md
  - ../projects/yipet/architecture.md
  - ../engineering/pi-agent-harness-evolution.md
---

# Cross-project shared client design

> **As an** engineer, **I want to** shared client design, **so that** process followed predictably. 

> YiVad + YiPet share a thin TypeScript HTTP client base class: RPC envelope parsing + SSE streaming parser + error normalization. **No monorepo** — each project vendors its own copy, aligned with the [YiAi RPC envelope contract](../projects/yiai/dev-standards.md). This is the landing design doc for the [retrospective Try item](../../product-manager/delivery/retrospective.md) "YiVad + YiPet each contribute 1 person, next Wednesday 1-hour design meeting, agenda = api-client base class sharing".

## Summary

- **No monorepo**: Each project vendors a `shared-client.ts` base, avoiding cross-project release coupling. 
- **Three-layer structure**: `base` (RPC envelope + SSE parser + error normalize) → `per-project layer` (project-specific endpoint wrappers) → `feature modules` (ragService / knowledgeService / llmService, etc.).
- **Contract aligns with YiAi**: RPC envelope `{module_name, method_name, parameters}` → `{code, message, data}`; SSE `data: {"data": {"message": "..."}}\n\n` + terminator `data: {"done": true}\n\n`. 
- **Error normalization**: YiAi `{code, message, data}` → throw `YiAiError` with `{code, message, data}`; callers branch on `code`. 
- **Don't introduce pi-ai**: [ADR multi-provider LLM routing](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) has decided YiAi backend manages multiple providers; frontend is provider-unaware, only passes through the `model` parameter. 

## Core viewpoints

- **Vendoring is not a temporary compromise — it is the correct default for cross-project sharing** — The instinct to use an npm private package for shared code is strong, but it introduces a release coupling problem: a bug fix in the shared package requires a release, then each project must upgrade, test, and deploy in lockstep. Vendoring means each project owns its copy, can fix bugs independently, and the contract (not the code) is the shared artifact. Only escalate to a package when drift exceeds 5% and the churn of synchronizing copies exceeds the cost of release coordination.

- **The SSE parser is the single most error-prone surface in cross-project code** — The `done: true` guard, buffer handling across chunk boundaries, `releaseLock` in `finally`, and `AbortError` vs `YiAiError` distinction are all bugs that have been fixed in one project and recurred in another. The SSE parser is where vendoring provides the most value: once fixed in the base, all three projects benefit.

- **Type derivation from OpenAPI is not optional — it is the contract enforcement mechanism** — Hand-written types drift within weeks as the YiAi backend adds fields or changes signatures. The drift is invisible until runtime errors occur. `openapi-typescript` generation + CI diff check makes contract drift a build failure, not a production incident.

- **Error normalization is the difference between a shared client and a shared fetch wrapper** — A thin fetch wrapper that passes through raw HTTP responses forces every caller to handle error codes, auth redirects, and retry logic independently. The `YiAiError` class with `code`-based branching standardizes this once, reducing per-feature error handling from 10 lines to 0.

- **The three-layer architecture is a deliberate separation of concerns, not over-engineering** — Base (envelope + SSE + error) changes rarely, per-project layer (endpoints + auth) changes per-project, and feature modules (services) change frequently. Without this separation, a change to the YiPet auth header would require touching the same file that handles SSE parsing, creating merge conflicts and regressions.


- **Sharing = contract alignment, not code sharing** — three projects vendor the same base, but each project releases, tests, and lints independently. What's shared is the contract (envelope + SSE + error); code is physically maintained per project. 
- **Base layer is thin, not thick** — base is business-agnostic, only unwraps envelopes, parses SSE, normalizes errors. Thick business logic lives in the per-project layer. 
- **The SSE parser is the largest cross-project reuse surface** — YiVad `aiChat` / `aicr` / `rag` + YiPet `chatController` all use SSE streams; after unifying the parser, the onDone guard is written once ([lessons/gotchas/sse-ondone-guard](../lessons/gotcha-sse-ondone-guard.md) shared across projects). 
- **Error normalization is the contract's protective layer** — YiAi `code` convention (`0` success / `1xx` parameter / `2xx` auth / `3xx` business / `5xx` system); frontend throws `YiAiError`, callers branch on `code` to auth redirect / business toast / system error page. 
- **TS types are derived from YiAi OpenAPI** — no hand-written types; YiAi `openapi.json` → `openapi-typescript` generates `types/api.d.ts`; contract drift surfaces as build errors. 

## Key information

### Three-layer structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Feature modules (per-project)                                    │
│  YiVad: ragService / knowledgeService / llmService / bugService  │
│  YiPet: ragService / knowledgeService / llmService / chatService  │
├─────────────────────────────────────────────────────────────────┤
│ Per-project layer (vendor)                                       │
│  - endpoint list (PROJECT_ENDPOINTS)                              │
│  - project-specific fetch options (auth header / base url)         │
├─────────────────────────────────────────────────────────────────┤
│ Shared base (vendor)                                             │
│  - rpcCall(module, method, params) → Promise<Data>                │
│  - sseStream(module, method, params) → AsyncIterable<Data>       │
│  - YiAiError { code, message, data }                              │
│  - types/api.d.ts (from openapi-typescript)                       │
└─────────────────────────────────────────────────────────────────┘
```

### Base layer API

```typescript
// shared-client.ts (vendor in each project)
export class YiAiError extends Error {
  constructor(public code: number, message: string, public data?: unknown) {
    super(message);
  }
}

export interface RpcEnvelope<T = unknown> {
  module_name: string;
  method_name: string;
  parameters: unknown;
}

export interface RpcResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export async function rpcCall<T>(
  baseUrl: string,
  moduleName: string,
  methodName: string,
  parameters: unknown,
  init?: RequestInit,
): Promise<T> {
  const body: RpcEnvelope = { module_name: moduleName, method_name: methodName, parameters };
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    body: JSON.stringify(body),
    signal: init?.signal,
  });
  if (!res.ok) throw new YiAiError(res.status, `HTTP ${res.status}`);
  const json: RpcResponse<T> = await res.json();
  if (json.code !== 0) throw new YiAiError(json.code, json.message, json.data);
  return json.data;
}

export async function* sseStream<T>(
  baseUrl: string,
  moduleName: string,
  methodName: string,
  parameters: unknown,
  init?: RequestInit,
): AsyncIterable<T> {
  const body: RpcEnvelope = { module_name: moduleName, method_name: methodName, parameters };
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...init?.headers },
    body: JSON.stringify(body),
    signal: init?.signal,
  });
  if (!res.ok || !res.body) throw new YiAiError(res.status, `HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const json = JSON.parse(line.slice(6));
        if (json.done === true) return;
        yield json.data as T;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
```

### Per-project layer

```typescript
// YiVad: src/api/base.ts
const YIAI_BASE = import.meta.env.RSBUILD_ENV_YIAI_BASE;
export const yiAiRpc = <T>(m: string, n: string, p: unknown) => rpcCall<T>(YIAI_BASE, m, n, p);
export const yiAiSse = <T>(m: string, n: string, p: unknown) => sseStream<T>(YIAI_BASE, m, n, p);

// YiPet: services/base.ts (same structure, base url from chrome.storage)
const YIAI_BASE = await getStored('yiai_base');
export const yiAiRpc = ...; export const yiAiSse = ...;
```

### Feature module

```typescript
// src/api/modules/ragService.ts
import { yiAiRpc, yiAiSse } from '../base';

export const ragService = {
  status: () => yiAiRpc('rag', 'status', {}),
  query: (q: string, scope?: string) => yiAiRpc<{ sources: Source[]; answer: string }>('rag', 'query', { query: q, scope }),
  chatStream: (q: string, scope?: string) => yiAiSse<{ message: string }>('rag', 'chat_stream', { query: q, scope }),
};
```

### Contract alignment table

| Dimension | YiAi backend | Shared client | Notes |
|---|---|---|---|
| URL | `POST /` single entry | `rpcCall(baseUrl, module, method, params)` | Not scattered across RESTful routes |
| Request body | `{module_name, method_name, parameters}` | same | Field names hard constraint ([YiAi dev-standards](../projects/yiai/dev-standards.md) §field name contract)  |
| Response body | `{code, message, data}` | `RpcResponse<T>` + `code !== 0` throws `YiAiError` | code protocol below |
| SSE frame | `data: {"data": {"message": "..."}}\n\n` | `sseStream` yields `json.data` | Auto-strips `data: ` prefix + terminates on `done: true` |
| Auth | header `Authorization: Bearer <token>` | passed via `init.headers` | base is unaware |
| Field names | `filter` (not `query`) / `target_file` (not `path`) | guarded by `types/api.d.ts` | generated from openapi |

### `code` protocol

| Code range | Meaning | Frontend response |
|---|---|---|
| 0 | success | return `data` |
| 1xx | parameter error | toast tip + no retry |
| 2xx | auth failure | redirect to login |
| 3xx | business error (e.g. file_not_found / quota_exceeded)  | business toast |
| 4xx | rate limited | backoff retry |
| 5xx | system error | error page + report |

### Boundary with pi-ai

- **Don't introduce pi-ai**: [ADR multi-provider LLM routing](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) has decided YiAi backend manages multiple providers; frontend only passes through the `model` parameter. 
- **YiPet is TS**: If YiPet later uses the `pi-ai` package for chat UI local LLM calls, base won't block it; but the YiAi HTTP endpoint contract stays unchanged. 
- **Borrow pi-tui ideas**: [pi-agent-harness evolution](pi-agent-harness-evolution.md) §anti-patterns reminds that `pi-tui` is a terminal UI; YiVad/YiPet are web, so rendering ideas may be borrowed but APIs aren't reusable — base doesn't include pi-tui. 

## Action recommendations

1. **Before the design meeting**: YiVad + YiPet each read YiAi `dev-standards-summary.md` §field name contract + §SSE guard contract; bring their current API layer structure to align. 
2. **Design meeting 1 h agenda**: 
   - 15 min: Walk the base layer API (this doc §base layer API) 
   - 15 min: Align the per-project layer (base url source differences / auth header source) 
   - 15 min: Feature module scope (YiVad vs YiPet feature list diff) 
   - 15 min: Landing cadence (each project vendors + gets 1 feature working; revisit npm private package after 2 weeks stable) 
3. **No monorepo**: Each project owns its `src/api/base.ts` (YiVad) / `services/base.ts` (YiPet); contract guarded by openapi-generated types. 
4. **openapi generation**: YiAi runs `python -m src.app --openapi` → `openapi.json`; frontend runs `npx openapi-typescript openapi.json -o src/api/types/api.d.ts`; CI runs a diff check to block drift. 
5. **SSE parser unit tests**: After base lands, write 8 SSE test cases first (incl. `done: true` termination / interruption / multi-`data:` merge / heartbeat blank lines); aligned with [ADR Vitest](../../tech-lead/decisions/yivad--vitest-introduction.md) / [YiPet dev-standards §Vitest](../projects/yipet/dev-standards.md). 
6. **Error normalization tests**: base `YiAiError` throw logic must cover all 5 `code` ranges; aligned with [ADR pytest](../../tech-lead/decisions/yiai--pytest-introduction.md) backend 13-route integration tests. 
7. **Re-evaluate after 2 weeks**: If vendoring causes 3-way base drift > 5%, consider extracting an npm private package; otherwise keep vendoring. 

## Anti-patterns

- **Premature npm package extraction** — The instinct to extract a shared npm package after the first bug fix is strong, but it introduces release coupling: a fix in the package requires a release, then each project must upgrade, test, and deploy in lockstep. Vendoring is the correct default until drift exceeds 5% and the churn of synchronizing copies exceeds the cost of release coordination.

- **Business logic leaking into the base layer** — When the base layer implements `ragService` or `chatService`, every project that vendors the base must change it when business logic changes. The base layer should only handle envelope parsing, SSE streaming, and error normalization. Business logic lives in the per-project layer.

- **Hand-written types instead of OpenAPI generation** — Hand-written types drift within weeks. The drift is invisible until runtime errors occur. `openapi-typescript` generation + CI diff check makes contract drift a build failure, not a production incident.

- **SSE parser without `done: true` guard** — The `done: true` frame is the contract termination signal. Without it, half-sent messages, buffered data, and stream interruption bugs recur across projects. The `done: true` guard is the single most important line in the SSE parser.

- **Error handling scattered across callers** — When every feature module checks `if (json.code !== 0)` and handles auth redirects independently, error handling becomes inconsistent and fragile. The `YiAiError` class must be the single point of error normalization, thrown by the base layer and caught by the caller.



- **Sharing = monorepo**: Cross-project release coupling disrupts frontend project cadence; first version sticks with vendoring. 
- **Base layer aware of business**: base implements `ragService` / `chatService` → every project changes base; base only does envelope + SSE + error. 
- **Hand-written types**: contract drift caught by eye; must use `openapi-typescript` to generate. 
- **Errors not normalized**: callers each do `if (json.code !== 0)` → error handling scattered; base must throw `YiAiError`. 
- **SSE parser ignores `done: true`**: cross-project half-sent bugs recur ([lessons/gotchas/sse-ondone-guard](../lessons/gotcha-sse-ondone-guard.md)); base must terminate. 
- **Introduce pi-ai**: conflicts with [ADR multi-provider](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md); base is provider-unaware. 
- **Base thick enough to be model-aware**: multi-provider is YiAi backend's responsibility; frontend base is unaware. 

## Related

- [YiAi dev-standards](../projects/yiai/dev-standards.md) — source of RPC envelope + SSE + field name contract
- [YiAi functional modules](../projects/yiai/functional-modules.md) — 13-route inventory
- [YiVad dev-standards](../projects/yivad/dev-standards.md) — SFC + ProTable + env prefix
- [YiVad functional modules](../projects/yivad/functional-modules.md) — 18 API modules + 11 stores
- [YiPet architecture overview](../projects/yipet/architecture.md) — API four tiers (client → endpoints → types → services) 
- [YiPet dev-standards](../projects/yipet/dev-standards.md) — TSX + Biome + Vitest
- [ADR multi-provider LLM routing](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) — rationale for not introducing pi-ai
- [Pi Agent Harness evolution](./pi-agent-harness-evolution.md) — pi-ai boundary
- [Retrospective instance](../../product-manager/delivery/retrospective.md) — Try item trigger
- [SSE onDone guard gotcha](../lessons/gotcha-sse-ondone-guard.md) — required reading for SSE parser
