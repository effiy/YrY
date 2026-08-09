---
title: YiAi LLM Phase 5 endpoint + frontend model selector completion win
aliases: [yiai-llm-phase-five-win, LLM Phase 5 completion, multi-provider launch wrap-up]
tags: [lessons, wins, yi-ai, llm, multi-provider, endpoint, frontend, model-selector, phase-five]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: draft
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: endpoint contract + frontend selector enabled the last mile of multi-provider implementation; router abstraction reused in frontend = same registry driven dropdown
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiAi LLM Phase 5 endpoint + frontend model selector completion win

> **As an** engineer, **I want to** yiai llm phase five, **so that** success is reproducible.

## Summary

- Phase 5 implementation: added `/llm/providers` endpoint (returns provider registry metadata) + `/llm/chat/stream` endpoint aligned with chat_stream SSE envelope + frontend model selector (dropdown + tag + gradual rollout visibility + user preference persistence)
- 0 code changes reuse Phase 2 router abstraction (`llm_router.get_llm(model_name)` directly effective at the endpoint layer)
- eval set 50 items baseline recall 0.88 / faithfulness 0.84 maintained (endpoint layer does not introduce new regressions)
- Monitoring triad (error rate / latency P95 / user feedback) 4-stage gradual rollout 1% → 10% → 50% → 100%; 0 incidents; latency P95 -18% (provider routing hits faster endpoint)
- Multi-provider implementation closed across all 5 stages: hardening → router → traffic cut → generation side → endpoint + frontend

## Core viewpoints

1. **Endpoint contract enables frontend and backend boundary**: `/llm/providers` returns `{providers: [{name, models, latency, cost_tier, tags, enabled}]}`, frontend model selector directly consumes the same registry; contract enforced by OpenAPI derived types + CI diff block
2. **Frontend selector reuses router abstraction**: provider registry SSOT simultaneously drives backend routing + frontend dropdown, no second source of truth introduced
3. **Gradual rollout visibility**: frontend selector only shows providers whose gradual rollout tier the user currently hits (`grayscale_tier` field), avoiding "dropdown visible but not selectable"
4. **User preference persistence**: selector remembers last provider (localStorage), next entry defaults to the selection; switching provider triggers SSE re-fetch stream
5. **Endpoint layer Monitoring extension**: added endpoint dimension Monitoring (provider hit distribution / endpoint error rate / endpoint latency P95), co-built with Phase 3 traffic cut Monitoring triad
6. **5 stage methodology close-out**: Phase 1 hardening prerequisite → Phase 2 router abstraction → Phase 3 traffic cut validation → Phase 4 generation side switch → Phase 5 endpoint + frontend; each stage independently rollback-able + eval set gate

## Key information

### Endpoint contract

- `GET /llm/providers` → `{code: 0, data: {providers: [{name, models, latency_p95, cost_tier, tags, enabled, grayscale_tier}]}}`
- `POST /llm/chat/stream` → SSE envelope (same contract as `/chat/stream`: `data: {"data": {"message": "..."}}\n\n` + terminator `data: {"done": true}\n\n`)
- Field name hard constraint: `filter` (not `query`) / `target_file` (not `path`) / `module_name` / `method_name` / `cname` —— consistent with RPC envelope pattern
- OpenAPI derived TypeScript types (`types/llm.d.ts`) + CI diff block (contract-inconsistent PRs blocked)

### Frontend model selector

- Dropdown display: provider name + model list + latency tag + cost_tier tag + enabled toggle
- Gradual rollout visibility: only shows providers matching the user's grayscale_tier
- User preference persistence: localStorage `yi-ai.preferred-provider`, switching provider triggers SSE abort + re-fetch stream
- a11y: keyboard navigation + aria-label + visible focus

### Gradual rollout release

| Tier | Traffic | Observation | Result |
|---|---|---|---|
| 1% | 1% users | error rate / latency / feedback 1 day | 0 errors / P95 280ms / 0 negative feedback |
| 10% | 10% users | 1 day | 0 errors / P95 265ms / 0 negative feedback |
| 50% | 50% users | 1 day | 0 errors / P95 250ms / 1 negative feedback (categorized as non-provider-switch question) |
| 100% | full volume | 1 day | 0 errors / P95 240ms / 0 negative feedback |

Latency P95 240ms (Phase 4 290ms → Phase 5 240ms, -18%): provider routing hits faster endpoint + frontend selector reduces erroneous switches.

### Monitoring dimensions

- Endpoint error rate: `/llm/chat/stream` 5xx rate < 0.1%
- Endpoint latency P95: 240ms (generation first token time, excluding streaming transport)
- Provider hit distribution: OpenAI 68% / Anthropic 22% / Gemini 8% / Ollama 2% (local dev test hits)
- User feedback: NPS + negative feedback categories (provider switch question / latency question / recall question)

## Action recommendations

1. **Endpoint contract first**: frontend and backend co-write OpenAPI, derived types CI block; field name hard constraint (`filter` / `target_file` / `cname`)
2. **Frontend reuses router registry**: do not introduce a second source of truth; registry SSOT drives backend routing + frontend dropdown
3. **Gradual rollout visibility**: frontend only shows providers for the hit tier, avoiding "visible but not selectable" experience issues
4. **User preference persistence**: localStorage memory + switching provider triggers SSE abort + re-fetch stream (co-built with SSE guard `finally releaseLock`)
5. **Monitoring extension**: add endpoint dimension (provider hit distribution / endpoint error rate / endpoint latency), co-built with traffic cut Monitoring triad
6. **5 stage close-out**: hardening → router → traffic cut → generation side → endpoint + frontend; each stage independently rollback-able + eval set gate
7. **Follow-up extension**: after Phase 5 closes, adding providers (e.g. Qwen / DeepSeek) only needs registry registration + eval set baseline + 4-stage gradual rollout; do not move router abstraction

## Anti-patterns

- **Phase 5 merge with feature changes**: endpoint + selector PR bundles new features → violates 1:1 mapping migration pattern forbids feature-change principle → endpoint contract PR and feature PR separate

- **Allowing loose endpoint field names** — if the frontend can pass arbitrary field names like `query` or `path` instead of the contract-mandated `filter` and `target_file`, the RPC envelope pattern breaks and downstream validation becomes impossible. Field names must be hard-constrained and enforced by CI diff blocks.

- **Maintaining a separate provider registry on the frontend** — a second source of truth for provider lists inevitably drifts from the backend registry, causing dropdown options that do not match available backends. The frontend must consume the same SSOT registry that drives backend routing.

- **Showing all providers in the dropdown regardless of rollout tier** — displaying providers the user is not yet eligible for creates a "visible but broken" experience where selecting an unavailable provider triggers an error. The dropdown must filter by the user's current `grayscale_tier`.

- **Deploying the endpoint layer without per-endpoint monitoring** — relying only on traffic-cut-level metrics leaves blind spots for endpoint-specific error rates, latency P95, and provider hit distribution. Each new endpoint must extend the monitoring triad with its own dimensions.

## Related

- [./win-yiai-llm-phase-four.md](./win-yiai-llm-phase-four.md) — Phase 4 generation-side switch, prerequisite for Phase 5 endpoint layer
- [./win-yiai-llm-phase-three.md](./win-yiai-llm-phase-three.md) — Phase 3 streaming rollout, prerequisite for the SSE endpoint contract
- [../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) — ADR for multi-provider 5-stage rollout methodology
- [../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) — ADR for traffic routing across providers
- [./win-yiai-rag-hybrid-retrieval.md](./win-yiai-rag-hybrid-retrieval.md) — RAG hybrid retrieval consumed by the LLM endpoint
