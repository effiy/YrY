---
title: Share client across projects
aliases:
- I want to share client across projects
- shared-client-journey
- cross-project contract entry
tags:
- journeys
- shared-client
- cross-project
- rpc-envelope
- sse
- contract
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
benefit: handoff is clean
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../tech-lead/architecture/design-architecture-decision.md
- ../../engineer/engineering/shared-client-design.md
- ../../README.md
review_cycle: quarterly
tacit: false
---

# I want to share client across projects

> **As an** engineer, **I want to** share client across projects, **so that** handoff is clean.

> "Three projects share RPC / SSE / error normalization — how to reach within 2 hops: shared client three-layer architecture + vendor rollout + RPC envelope + SSE guards + field name hard constraints + contract QA co-build."

## Summary

- Three-layer architecture via [shared-client-design-summary](shared-client-design.md) (base layer `rpcCall<T>` + `sseStream` + `YiAiError` / per-project layer / feature module)
- Vendor rollout via [shared-client-vendor-rollout](shared-client-vendor-rollout.md) (three projects parallel vendor + contract QA matrix + each project independent lockfile + no monorepo)
- Network contract via [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) (POST single entry + `{module_name, method_name, parameters}` → `{code, message, data}` + field name hard constraints + OpenAPI-derived types)
- Streaming contract via [sse-streaming-pattern](../architecture-design/sse-streaming.md) (three-way done frame + releaseLock + abort partition + nginx buffer off)

## Core viewpoints

- **The real value of a shared client is not code reuse — it is error prevention** — The SSE parser `done: true` guard, `releaseLock` in `finally`, and `AbortError` vs `YiAiError` distinction are bugs that have been fixed in one project and recurred in another. The shared client's primary value is that these fixes are applied once and benefit all three projects. Code reuse is a side effect; error prevention is the main effect.

- **Vendoring is not a stepping stone to a monorepo — it is the correct architecture** — Each project owning its own copy of the base layer means independent release cycles, independent lockfiles, and independent auditing. A monorepo introduces release coupling: a bug fix in the shared package requires all three projects to upgrade, test, and deploy in lockstep. Vendoring is the stable state, not a temporary compromise.

- **The contract is the shared artifact, not the code** — The RPC envelope (`{module_name, method_name, parameters}` → `{code, message, data}`), SSE frame format, and field name conventions are the contract. The code (`rpcCall`, `sseStream`, `YiAiError`) is the implementation. The contract is guarded by `openapi-typescript` type generation; the code is free to diverge per-project as long as the contract is respected.

- **Field name hard constraints are the cheapest form of contract enforcement** — `filter` (not `query`), `target_file` (not `path`), `cname` (not `name`), `module_name` (not `module`), `method_name` (not `method`) — these are the conventions that prevent drift. CI lint that blocks non-conforming field names is a one-time setup with ongoing benefit: every PR that violates the convention is caught at build time, not at runtime.

- **The three-project SSE parser is the single most impactful shared component** — YiVad `aiChat` / `aicr` / `rag` + YiPet `chatController` all use SSE streams. Each project independently writing its own parser would have produced 3 sets of bugs. One shared parser with the `done: true` guard benefits all three projects. The SSE parser is where the ROI of sharing is highest.

## Key info

- **Three-layer architecture decomposition**: (1) Base layer (`rpcCall<T>` generic function, `sseStream` async generator, `YiAiError` class with `code`/`message`/`data` fields, error normalization middleware) — ~300 lines of TypeScript, vendored identically across all three projects. (2) Per-project layer (`api/` directory in each project, imports base layer, defines project-specific endpoint wrappers like `YiVadApi.knowledge.search` or `YiPetApi.chat.send`). (3) Feature module layer (component-specific calls, e.g., `useAiChat` composable in YiVad, `chatController` in YiPet). The base layer is never modified per-project; the per-project layer is the only place where project-specific API surface is defined; the feature module layer consumes the per-project layer and never calls `rpcCall` directly.
- **RPC envelope contract**: YiAi backend exposes a single POST endpoint `/api/rpc` that accepts `{module_name: string, method_name: string, parameters: Record<string, unknown>}` and returns `{code: number, message: string, data: T}`. `code=0` means success; any non-zero code throws `YiAiError` on the frontend. The `module_name` maps to a Python module (e.g., `knowledge` → `knowledge_service.py`), `method_name` maps to a function within that module (e.g., `search` → `search_knowledge()`). The contract is enforced by YiAi generating `openapi.json` at build time, and frontend projects running `openapi-typescript` to derive TypeScript types. CI diff check blocks PRs where the generated types diverge from the committed types.
- **SSE streaming contract**: Backend emits SSE frames in the format `data: {JSON}\n\n`. Each frame contains `{type: "chunk" | "done" | "error", content: string, metadata?: {token_count?: number, finish_reason?: string}}`. The backend must emit a `done: true` frame in `finally` (not just `try/except`) to prevent frontend hangs. The frontend parser must guard against processing content after `done: true` (the `ondone` guard pattern). Nginx must have `proxy_buffering off` and `proxy_read_timeout` set to at least 1 hour for long-running AI streams. The `releaseLock` in `finally` ensures the SSE connection is cleaned up even on abort.
- **Vendor rollout mechanics**: When the base layer changes, the author creates a single PR that updates the vendored copy in all three projects simultaneously. The Contract QA matrix (a shared document) tracks which projects have applied the update and passes the contract test suite. Each project maintains its own `lockfile` and `min-release-age` (7 days for YiVad, 3 days for YiPet) before the vendor bump is released. The audit runs per-project: `npm audit` / `yarn audit` on each project's lockfile independently. No monorepo tooling (no Lerna, no Nx, no Turborepo) — the orchestration is manual and intentional to preserve release independence.
- **Field name conventions as contract enforcement**: The RPC envelope uses specific field names that must be consistent across all three projects: `filter` (not `query` or `search`), `target_file` (not `path` or `file_path`), `cname` (not `name` or `component_name`), `module_name` (not `module` or `service`), `method_name` (not `method` or `action`). These are enforced by a CI lint script that scans all `api/` directories for non-conforming field names. The convention was established after the first cross-project bug: YiPet sent `{query: "..."}` to the RPC endpoint, but YiAi expected `{filter: "..."}`, and the error was silent (the parameter was simply ignored, returning empty results).
- **SSE parser bug history and ROI**: Three bugs were fixed in the SSE parser across its lifetime: (1) the `done: true` guard — the parser processed content after the done frame, causing duplicate output; (2) the `releaseLock` in `finally` — the SSE connection was not released on abort, causing connection leaks that accumulated over hours; (3) the `AbortError` vs `YiAiError` distinction — abort errors were treated as application errors, triggering error toasts for user-initiated cancellations. Each bug was fixed once in the shared parser and the fix propagated to all three projects via vendor update. Without sharing, each bug would have been discovered, reported, and fixed independently in each project, at 3x the engineering cost.

## Scenario description

YiAi (backend Python FastAPI) → YiVad (frontend Vue) + YiPet (frontend React MV3) share RPC envelope + SSE streaming + error normalization contract across three ends. This entry aggregates shared client design, vendor rollout, network contract pattern, field name hard constraints, contract QA co-build into a 2-hop path, avoiding "each project writing its own SSE parser = half-baked external bugs recurring".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [shared-client-design-summary.md](shared-client-design.md) · [shared-client-vendor-rollout.md](shared-client-vendor-rollout.md) |
| `methodology/engineering-patterns/` | [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `projects/YiAi/` | [dev-standards-summary.md](../../engineer/projects/yiai/dev-standards.md) · [functional-modules-summary.md](../../engineer/projects/yiai/functional-modules.md) · [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) · [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai/knowledge-watcher-deployment.md) |
| `projects/YiVad/` | [dev-standards-summary.md](../../engineer/projects/yivad/dev-standards.md) · [adr-vitest-rollout.md](../../tech-lead/decisions/yivad/vitest-rollout.md) (Phase 4 SSE parser contract QA) · [architecture-summary.md](../../engineer/projects/yivad/architecture.md) |
| `projects/YiPet/` | [dev-standards-summary.md](../../engineer/projects/yipet/dev-standards.md) · [adr-chrome-manifest-dual-world-boundary.md](../../tech-lead/decisions/yipet/chrome-manifest-dual-world-boundary.md) · [adr-aicr-port-rollout.md](../../tech-lead/decisions/yipet/aicr-port-rollout.md) (Phase 2 vendor) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yivad-vitest-phase-one-win.md](../lessons/win-yivad-vitest-phase-one.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |

## Action recommendations

1. Three-layer architecture: base layer (`rpcCall<T>` + `sseStream` + `YiAiError` + error normalization) written one-shot, each project vendors one copy.
2. No monorepo: each project vendors an independent lockfile + audit + min-release-age + allowlist = single-point poisoning does not spread.
3. Network contract: POST single entry + `{module_name, method_name, parameters}` → `{code, message, data}`, `code=0` succeeds, non-0 throws `YiAiError`.
4. Field name hard constraints: `filter` / `target_file` / `cname` / `module_name` / `method_name`, CI lint blocks drift.
5. Type derivation: YiAi `openapi.json` → frontend `openapi-typescript` derived types + CI diff block.
6. SSE guards: backend try/except/finally three-way emit `done: true` + frontend `done` frame guard + `finally releaseLock` + `AbortError` vs `YiAiError` distinction + nginx `proxy_buffering off` + `proxy_read_timeout 1h`.
7. Contract QA co-build: rpcCall + sseStream contract QA co-built across three ends; schema / frame sequence / field names / error normalizer aligned.
8. Do not introduce `pi-ai`: cross-stack adaptation cost high + dependency surface expands; base layer ~300 lines thin, self-written.

## Anti-patterns

- **Each project writing its own SSE parser** — The SSE `done: true` guard, `releaseLock` in `finally`, and `AbortError` vs `YiAiError` distinction are bugs that recur across projects. A single shared parser fixes these bugs once. Three independent parsers produce three sets of bugs, and lessons learned in one project do not benefit the others.

- **Extracting an npm package after the first bug fix** — The first time a bug is fixed in one project's vendored copy, the instinct is to extract a shared npm package. But this introduces release coupling: the package must be released, then each project must upgrade, test, and deploy. Vendoring is the correct default; only escalate to a package when drift exceeds 5%.

- **Hand-written types instead of OpenAPI generation** — Hand-written types drift within weeks. The drift is invisible until runtime errors occur. `openapi-typescript` generation + CI diff check makes contract drift a build failure, not a production incident.

- **Field name convention violations in CI passing** — `filter` (not `query`), `target_file` (not `path`), `cname` (not `name`) — these conventions only work if CI lint blocks non-conforming names. A CI that passes a PR with `query` instead of `filter` has no convention enforcement.

- **Introducing pi-ai to avoid writing ~300 lines of base code** — The pi-ai dependency adds cross-stack adaptation cost (Bun runtime in a Python project, or npm package in a Vue project) and expands the dependency surface. The base layer is ~300 lines of thin wrapper code; the cost of self-writing it is lower than the cost of maintaining a third-party dependency.

## Related

- Related journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — shared client decision ADR
- Related journey: [../projects/build-a-rag-pipeline.md](../projects/build-a-rag-pipeline.md) — RAG pipeline uses the same contract
- Related journey: [../processes/roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) — vendor rollout via migration process
- Upstream: [../../knowledge-curator/diagrams/directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) — directory structure diagram
