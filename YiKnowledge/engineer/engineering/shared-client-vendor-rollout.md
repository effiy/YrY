---
title: Cross-project shared client vendor rollout tracking
aliases:
- shared-client-vendor-rollout
- shared-client-three-project-rollout
- cross-project-client-vendor
tags:
- summary
- cross-project
- shared-client
- vendor
- rollout
- contract-test
- rollout-tracking
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
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./shared-client-design.md
- ../projects/yiai/dev-standards.md
- ../projects/yivad/dev-standards.md
- ../projects/yipet/dev-standards.md
- ../patterns/rpc-envelope.md
- ../patterns/sse-streaming.md
---

# Cross-project shared client vendor rollout tracking

> **As an** engineer, **I want to** shared client vendor rollout, **so that** process followed predictably. 

> [Shared client design draft](./shared-client-design.md) three-layer architecture (base / per-project / feature module) parallel vendor rollout progress across YiAi / YiVad / YiPet, contract test co-build, hardening strategy and tracking metrics. 

## Summary

- **Architecture**: base layer (`rpcCall<T>` + `sseStream` + `YiAiError` + error normalization) written once, each project vendors a copy + per-project layer wraps project differences + feature module calls base layer
- **Three-project parallel vendor status**: YiVad frontend (in progress) + YiPet frontend (pending start, waiting for [aicr port rollout Phase 2](../../tech-lead/decisions/yipet--aicr-port-rollout.md)) + YiAi backend (Python stack, base layer is Python `services/ai/`, does not vendor TS base layer) 
- **Contract test co-build**: rpcCall + sseStream contract test co-built across three ends, prevents drift
- **Hardening**: each project vendors independent lockfile + audit + min-release-age + lifecycle allowlist (no monorepo) 

## Core viewpoints

- **Parallel vendor rollout is not about speed — it is about preventing sequential dependency** — If YiVad vendors first, YiPet waits for YiVad to stabilize, and YiAi waits for both, the rollout is serialized and each project blocks the next. Parallel vendor rollout means each project starts independently, finds its own issues, and stabilizes on its own timeline. The projects converge on the same contract, not the same code.

- **Contract test co-build is the only mechanism that prevents three-way drift** — Each project independently implementing the same contract (RPC envelope + SSE frame + error codes) will inevitably diverge. The only way to prevent drift is co-built contract tests that all three projects run. A test that fails in one project but passes in another is a contract violation, not a project-specific bug.

- **YiAi backend does not vendor the TS base layer — it is the contract source** — YiAi defines the RPC envelope, SSE frame format, and error code protocol. YiVad and YiPet vendor the TS base layer that implements the contract. YiAi's Python backend is the source of truth; the frontend base layers are implementations. This asymmetry is intentional: the backend defines the contract, the frontends implement it.

- **Independent lockfile is not paranoia — it is supply chain isolation** — If all three projects share an npm package, a compromised dependency in the package affects all three projects. Independent vendoring means each project has its own lockfile, its own audit, and its own `min-release-age`. A supply chain attack on one project does not spread to the others.

- **The rollout is not complete until contract tests pass in all three projects** — A base layer that works in YiVad but not in YiPet is not a shared client; it is a YiVad client. The rollout is complete only when all three projects pass the same contract test suite, proving that the contract is implemented consistently across projects.

## Key info

- **Three-layer shared client architecture**: (1) Base layer — `rpcCall<T>(method, params)` generic RPC call with YiAi envelope parsing, `sseStream(url, body, onChunk)` SSE streaming with reconnection, `YiAiError` class with code/message/details, error normalization (AxiosError → YiAiError, network error → YiAiError); written once, each project vendors a copy; (2) Per-project layer — wraps project-specific differences: base URL configuration, auth token injection, project-specific error handling, logging/monitoring hooks; (3) Feature module layer — domain-specific API functions that call the base layer: `knowledgeService.getLeaf(path)`, `ragService.query(prompt, scope)`, `bugService.list(project)`. The base layer is ~300 lines of TypeScript; the per-project layer is ~100 lines; feature modules are ~50-100 lines each.
- **RPC envelope contract specification**: Every YiAi API response follows: `{code: number, message: string, data: T | null}`. `code === 0` → success, data contains the response. `code !== 0` → error, message contains the error description, data is null. Standard error codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 422 (validation error), 500 (internal error), 503 (service unavailable). The base layer `rpcCall<T>` unwraps the envelope, throws `YiAiError` on non-zero code, and returns `data` on success. The contract is the single source of truth; all three projects must implement the same envelope parsing.
- **SSE streaming contract specification**: YiAi SSE stream format: `data: {json}\n\n`. Each frame contains: `{type: "chunk" | "done" | "error", content: string, metadata?: {sources?: Source[], token_count?: number}}`. The base layer `sseStream` parses the SSE stream, calls `onChunk(content, metadata)` for each chunk, resolves on `type: "done"`, and rejects on `type: "error"`. The contract specifies: chunk ordering is sequential, done is the final frame, error terminates the stream, the client must handle connection drops with exponential backoff reconnection. The Yi-family SSE parser is shared across YiVad and YiPet; the SSE `onDone` guard (fixed in YiVad `aicr/chat.ts`) prevents half-message leaks.
- **Contract test co-build strategy**: Contract tests are written once and run in all three projects. Test categories: (1) RPC envelope — test that `rpcCall<T>` correctly unwraps success and error responses for all standard error codes; (2) SSE streaming — test that `sseStream` correctly parses chunk/done/error frames, handles connection drops, and enforces frame ordering; (3) Error normalization — test that Axios errors, network errors, and timeout errors are correctly normalized to `YiAiError`; (4) Field name contract — test that `filter` (not `query`) and `target_file` (not `path`) are used consistently. The contract tests are run in CI for each project; a test failure in any project is a contract violation.
- **Independent vendor hardening per project**: Each project vendors the base layer independently with its own: (1) Lockfile — `pnpm-lock.yaml` for YiVad/YiPet, `uv.lock` for YiAi (planned); (2) Audit — `pnpm audit` / `pip-audit` run in CI, blocking on critical vulnerabilities; (3) Min-release-age — new dependency versions must be at least 7 days old before adoption; (4) Lifecycle allowlist — only dependencies with active maintenance (last release < 6 months) are allowed. The hardening ensures supply chain isolation: a compromised dependency in one project does not spread to others.
- **Yi-family shared client rollout status (2026-08)**: YiVad — base layer implemented (`api/modules/` with `knowledgeService.ts`, `ragService.ts`, `bugService.ts`), RPC envelope parsing done, SSE parser reused from aiChat; YiPet — base layer pending (waiting for aicr port rollout Phase 2), `ApiClient` exists but does not use the shared base layer; YiAi — Python backend defines the contract (FastAPI + SSE via `sse-starlette`), does not vendor the TS base layer. The contract test suite is planned but not yet implemented. The field name contract (`filter`/`target_file`) is enforced via monthly alignment scan of CLAUDE.md contract tables.

## Design draft review

Three-layer architecture (see [shared-client-design-summary](./shared-client-design.md)) : 

```
┌─────────────────────────────────────────────────────────┐
│ Feature Module (per project unique)                     │
│ - YiVad: src/api/modules/{ragService,chatService,...}   │
│ - YiPet: src/api/modules/{ragService,chatService,...}   │
├─────────────────────────────────────────────────────────┤
│ Per-Project Layer (project differences)                │
│ - YiVad: baseUrl = import.meta.env.RSBUILD_ENV_YIAI_API│
│ - YiPet: baseUrl = chrome.runtime.getURL('/api')        │
├─────────────────────────────────────────────────────────┤
│ Base Layer (vendor shared, TS)                          │
│ - rpcCall<T> + sseStream<T> + YiAiError                 │
│ - src/shared/api/{rpc,sse,error}.ts                     │
└─────────────────────────────────────────────────────────┘
```

## Three-project rollout progress

### YiVad frontend (in progress) 

| phase | content | status |
|---|---|---|
| Phase 1 | base layer vendor: `src/shared/api/{rpc,sse,error}.ts` | 🔄 in progress |
| Phase 2 | per-project layer: `src/api/config.ts` (baseUrl + env injection)  | ⏳ |
| Phase 3 | feature module migration: 18 api modules from handwritten fetch to `rpcCall` | ⏳ |
| Phase 4 | contract test: rpcCall + sseStream parity with YiAi endpoints | ⏳ |

### YiPet frontend (pending start) 

| phase | content | status |
|---|---|---|
| Phase 1 | MV3 skeleton + dual-world boundary (see [aicr port rollout Phase 1](../../tech-lead/decisions/yipet--aicr-port-rollout.md))  | ⏳ waiting for aicr port rollout to start |
| Phase 2 | base layer vendor: `src/shared/api/{rpc,sse,error}.ts` (1:1 with YiVad)  | ⏳ |
| Phase 3 | per-project layer: `src/api/config.ts` (baseUrl = `chrome.runtime.getURL`)  | ⏳ |
| Phase 4 | feature module: aicr-related api modules call base layer | ⏳ |
| Phase 5 | contract test: rpcCall + sseStream three-end co-build parity with YiAi / YiVad | ⏳ |

### YiAi backend (Python stack, does not vendor TS base layer) 

| phase | content | status |
|---|---|---|
| Landed | RPC envelope endpoint `POST /` + `{module_name, method_name, parameters}` → `{code, message, data}` | ✅ |
| Landed | SSE streaming endpoint `chat_stream` + `done: true` guard | ✅ |
| In progress | Multi-provider switching + `/llm-providers` endpoint (see [LLM rollout Phase 5](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md))  | 🔄 Phase 5 |
| Pending start | Knowledge Watcher `POST /knowledge-rebuild` endpoint (see [knowledge watcher ADR](../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md))  | ⏳ |

## Contract test co-build

### Test matrix

| Test dimension | YiAi (endpoint)  | YiVad (base layer)  | YiPet (base layer)  | Co-build approach |
|---|---|---|---|---|
| RPC envelope | pytest `tests/integration/test_rpc_envelope.py` | Vitest `src/api/__tests__/rpc.test.ts` | Vitest `src/api/__tests__/rpc.test.ts` | Align same schema |
| SSE guard | pytest `tests/integration/test_sse_stream.py` | Vitest `src/api/__tests__/sse.test.ts` | Vitest `src/api/__tests__/sse.test.ts` | Align same frame sequence |
| Error normalization | pytest `tests/unit/test_error_normalization.py` | Vitest + `YiAiError` | Vitest + `YiAiError` | Align same code ranges |
| Field name hard constraint | pytest + lint | Biome lint + OpenAPI-derived types | Biome lint + OpenAPI-derived types | Align same field name table |

### Co-build strategy

- **Schema alignment**: YiAi `openapi.json` → frontend `openapi-typescript`-derived types + CI diff blocking
- **Frame sequence alignment**: SSE frame sequence (`data: {"data": ...}` + trailing `data: {"done": true}`) shared across three ends
- **Field name hard constraint**: `filter` / `target_file` / `cname` / `module_name` / `method_name` linted across three ends
- **Error normalization**: `code=0` success / `1xx-5xx` range protocol consistent across three ends

## Hardening strategy (per project independently) 

| project | lockfile | audit | min-release-age | allowlist |
|---|---|---|---|---|
| YiAi (Python)  | `uv.lock` ✅ | `pip-audit --strict` ✅ | 7d ✅ | pre-release / deprecated / unmaintained rejected ✅ (see [supply-chain win](../lessons/win-yiai-supply-chain-hardening.md))  |
| YiVad (npm)  | `package-lock.json` ✅ | `npm audit --audit-level=high` ⏳ | 7d ⏳ | allowlist ⏳ |
| YiPet (npm)  | `package-lock.json` ✅ | `npm audit --audit-level=high` ⏳ | 7d ⏳ | allowlist ⏳ |

**No monorepo**: each project vendors independent lockfile = single-point poisoning does not spread. 

## Key design decisions

### 1. No monorepo

- **Reason**: single-point poisoning takes down the whole family; each project vendoring independent hardening = single project poisoning affects only that project. 
- **Cost**: base layer vendor duplication = need contract tests to prevent drift. 
- **Alternative**: monorepo + workspace = single-point poisoning takes down the whole family = unacceptable. 

### 2. Base layer in TS, no `pi-ai`

- **Reason**: `pi-ai` is TS + Bun multi-provider abstraction, different stack from YiAi Python; the 300-line base layer written in-house is faster. 
- **Cost**: self-maintained = need contract tests. 
- **Alternative**: introducing `pi-ai` = cross-stack adaptation + larger dependency surface = not introduced. 

### 3. Field name hard constraint + OpenAPI-derived types

- **Reason**: handwritten types = contract drift depends on the naked eye; OpenAPI-derived + CI diff = static guard. 
- **Cost**: YiAi needs to expose `openapi.json` + frontend runs `openapi-typescript`. 
- **Alternative**: handwritten `types/api.d.ts` = drift depends on the naked eye = unacceptable. 



- **Monorepo shared client**: single-point poisoning takes down the whole family; must vendor per project. 
- **Introducing `pi-ai` cross-stack**: high adaptation cost + larger dependency surface; must write thin layer in-house. 
- **Handwritten types**: contract drift depends on the naked eye; must use OpenAPI-derived + CI diff. 
- **Base layer with business logic**: breaks isomorphism = reuse fails; business logic sinks to feature module. 
- **Cross-project copy/paste base layer**: drift depends on the naked eye; must vendor + contract test. 
- **Base layer without hardening**: vendored with CVEs = single-point poisoning; must go through hardening process. 
- **Field names chosen per project**: `filter` vs `query` will definitely break the contract; must hard-constrain field names. 

## Tracking metrics

- **Vendor coverage**: three-project base layer vendor completion rate (YiVad in progress / YiPet pending start / YiAi endpoint side landed) 
- **Contract test pass rate**: rpcCall + sseStream contract test three-end pass rate (goal 100%) 
- **Schema diff**: YiAi `openapi.json` vs frontend-derived types diff = 0
- **Field name lint**: three-end Biome / ruff lint blocking rate (`filter` / `target_file` / `cname` / `module_name` / `method_name`) 
- **SSE abnormal termination rate**: completions without `done` frame < 0.5%
- **Supply chain**: three-end high CVE count = 0; min-release-age ≥ 7d

## Action recommendations

1. **Co-build contract tests for `rpcCall`, `sseStream`, and `YiAiError` across all three projects, and run the same test suite in YiVad, YiPet, and YiAi CI pipelines.** Each project independently implementing the same contract will inevitably diverge. The only way to prevent three-way drift is co-built contract tests that all three projects run. A test that fails in one project but passes in another is a contract violation. The contract test suite must be the source of truth for the RPC envelope, SSE frame format, and error code ranges.

2. **Generate TypeScript types from YiAi's `openapi.json` using `openapi-typescript`, and add a CI diff check that blocks merge if the generated types differ from the committed types.** Handwritten types drift within weeks. The drift is invisible until runtime errors occur. `openapi-typescript` generation + CI diff check makes contract drift a build failure. The CI job must: generate types from the latest `openapi.json`, diff against the committed types, and block if there is any difference.

3. **Complete per-project supply chain hardening (lockfile, audit, min-release-age, lifecycle allowlist) for YiVad and YiPet before the base layer is considered production-ready.** YiAi already has hardening in place. YiVad and YiPet must complete their hardening before the shared client rollout is complete. The hardening checklist must be part of the rollout tracking table, and each item must be marked complete before the corresponding project's Phase 4 (contract test) begins.

4. **Run the three-project vendor rollout in parallel, not sequentially: each project starts independently, finds its own issues, and stabilizes on its own timeline.** If YiVad vendors first, YiPet waits for YiVad to stabilize, and YiAi waits for both, the rollout is serialized and each project blocks the next. Parallel rollout means each project starts independently, finds its own issues, and converges on the same contract. The projects share the contract, not the code.

5. **Add a field name hard constraint lint rule across all three projects that blocks any API field name that does not match the canonical name in the contract registry (`filter`, `target_file`, `cname`, `module_name`, `method_name`, etc.).** `filter` vs `query`, `target_file` vs `path` -- these discrepancies will break the contract. The lint rule must have a registry of canonical field names, and any deviation must be a build failure. The registry must be versioned and updated through the same ADR process as the contract.

## Anti-patterns

- **Serial rollout instead of parallel** — If YiVad vendors first, YiPet waits for YiVad to stabilize, and YiAi waits for both, the rollout is serialized and each project blocks the next. The contract is the shared artifact; each project can implement it independently. Parallel rollout finds project-specific issues faster and converges on the same contract.

- **Monorepo shared client** — A single npm package shared across all three projects is a single point of supply chain failure. A compromised dependency in the package affects all three projects. Independent vendoring with per-project lockfiles and audits isolates the blast radius.

- **Base layer with business logic** — When the base layer implements `ragService` or `chatService`, it breaks isomorphism: every project that vendors the base must change it when business logic changes. The base layer handles only envelope parsing, SSE streaming, and error normalization. Business logic lives in the per-project feature modules.

- **Cross-project copy/paste instead of contract-aligned vendoring** — Copying the base layer between projects without contract tests means drift is invisible. The first time a field name changes in one project, the other projects break silently. Vendoring + contract test co-build is the only mechanism that prevents this.

- **Handwritten types instead of OpenAPI-derived types** — Handwritten types drift within weeks. The drift is invisible until runtime errors occur. `openapi-typescript` generation + CI diff check makes contract drift a build failure. The cost is YiAi exposing `openapi.json` + frontend running `openapi-typescript`; the alternative is silent runtime failures.

## Related

- Upstream design: [shared-client-design-summary](./shared-client-design.md) — three-layer architecture design draft
- Rollout tracking: this file — three-project parallel vendor progress
- YiAi endpoints: [YiAi dev-standards §field name contract](../projects/yiai/dev-standards.md) + [LLM rollout Phase 5](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) + [knowledge watcher ADR](../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md)
- YiVad base layer: [YiVad dev-standards §SSE guard](../projects/yivad/dev-standards.md) + [Vitest rollout Phase 4](../../tech-lead/decisions/yivad--vitest-rollout.md) (SSE parser contract test) 
- YiPet base layer: [YiPet dev-standards §MV3 dual world](../projects/yipet/dev-standards.md) + [aicr port rollout Phase 2](../../tech-lead/decisions/yipet--aicr-port-rollout.md)
- Methodology: [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) + [sse-streaming-pattern](../architecture-design/sse-streaming.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md)
- Gotchas: [sse-ondone-guard gotcha](../lessons/gotcha-sse-ondone-guard.md) + [no-lockfile gotcha](../lessons/gotcha-no-lockfile-supply-chain-risk.md)
- Upstream leaf: [README.md](./) — processes leaf entry
