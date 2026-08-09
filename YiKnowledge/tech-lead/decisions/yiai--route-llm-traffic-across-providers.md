---
title: ADR — YiAi multi-provider LLM routing
aliases: [adr-multi-provider-llm-routing, yi-ai-multi-provider-llm-adr, llm-provider-routing-adr, as-a-tech-lead-i-want-to-route-llm-traffic-across-providers]
tags: [adr, yi-ai, llm, multi-provider, routing, llama-index, pi-ai, architecture-decision, user-story]
category: tech-lead/decisions/yiai
created: 2026-08-03
updated: 2026-08-04
source: internal
type: adr
status: planned
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-04
tacit: false
roles: [tech-lead, ai-engineer, engineer]
benefit: "multi-provider routing has unified abstraction + eval set fallback + supply-chain hardening upfront, cost and availability all bounded"
acceptance_criteria:
  - "YiAi services/ai/llm_router.py implements provider registration via llama_index.llms.* + dispatch by model name"
  - "available provider count ≥ 4 (Ollama + OpenAI + Anthropic + Google)"
  - "eval set recall rate rollback ≤ 5%, BRD bilingual generated quality subjective scoring rollback ≤ 0.5 (5-point scale)"
  - "uv lockfile + pip-audit + min-release-age effective strategy CI block"
  - "YiVad / YiPet model selector UI joint debugging through"
related:
  - ../../../engineer/projects/yiai/architecture.md
  - ../../../engineer/projects/yiai/dev-standards.md
  - ../../../product-manager/projects/yiai--project-management.md
  - ../../../ai-engineer/platform/llama-index-evolution.md
  - ../../../engineer/engineering/pi-agent-harness-evolution.md
  - ../../../knowledge-curator/templates/adr.md
  - ../../../knowledge-curator/templates/adr.md
  - ../../../product-manager/delivery/weekly-report.md
  - ../../../product-manager/delivery/retrospective.md
  - ../../../product-manager/delivery/daily-report.md
  - ../../../knowledge-curator/governance/user-story-migration-plan.md
---

# ADR — YiAi multi-provider LLM routing

> **As a** tech-lead, **I want to** implement multi-provider LLM routing + eval set + supply-chain hardening upfront in YiAi, **so that** multi-provider abstraction has a unified convergence point, cost and availability are both bounded, frontend model selector is not then blocked by backend.

> Decision: YiAi multi-provider LLM routing uses the `llama_index.llms.*` abstraction, does not introduce `pi-ai`. YiPet shared client uses a TS self-implemented thin layer, aligned with YiAi endpoint contract. This ADR pins the Try item "YiAi multi-provider LLM routing ADR (pi-ai vs `llama_index.llms.*` pick one)" mentioned in [weekly report](../../../product-manager/delivery/weekly-report.md) / [Retrospective](../../../product-manager/delivery/retrospective.md) / [daily report](../../../product-manager/delivery/daily-report.md).

## 1. Basic information

| field | content |
|---|---|
| ADR number | ADR-Multi-Provider-LLM-Routing |
| title | YiAi multi-provider LLM routing: choose `llama_index.llms.*` |
| status | Accepted |
| date | 2026-08-03 |
| Decision maker | YiAi primary owner + Architecture group |
| Reviewer | CTO, YiVad primary owner, YiPet primary owner |
| Related project | YiAi (direct) / YiVad (indirect) / YiPet (indirect) |
| Related PR/Issue | to be opened (YiAi `feat(llm): multi-provider router via llama_index.llms.*`) |
| Supersedes | — |
| Superseded by | — |
| Review trigger | quarterly review / signal: new provider enters candidate / `llama_index.llms.*` abstraction breaking change / eval set recall rollback > 5% |

## 2. background (Context)

- **Status quo**: YiAi `services/ai/chat_service.py` only calls LLM via Ollama self-hosted; `domain/rag/` uses `llama_index` for retrieval, but the generation side has not connected `llama_index.llms.*`.
- **Pain points**:
  - BRD Agent multilingual scenarios need cloud models like GPT-4o / Claude / Gemini; Ollama path coverage incomplete.
  - YiVad / YiPet chat UI needs a model selector; YiAi backend has no multi-provider API, frontend UI blocked (see [YiVad project management §block](../../../product-manager/projects/yivad--project-management.md) + [YiPet project management §block](../../../product-manager/projects/yipet--project-management.md)).
  - YiAi `requirements.txt` has no lockfile (see [dev-standards-summary.md](../../../engineer/projects/yiai/dev-standards.md) §supply-chain hardening gap); introducing multi-provider increases the dependency surface, hardening is urgent.
- **trigger event**: Retrospective Try item + weekly report next-week plan YiAi item 1.
- **External constraints**:
  - YiAi is a Python stack, `llama_index` is already a direct dependency.
  - [pi](https://github.com/earendil-works/pi) is TS + Bun, `pi-ai` multi-provider abstraction and YiAi are different stacks.

## 3. Decision (Decision)

YiAi chooses `llama_index.llms.*` as the multi-provider LLM routing abstraction, does not introduce `pi-ai`. YiVad / YiPet access indirectly through the YiAi HTTP endpoint; the frontend does not directly import any provider SDK.

Implementation list:

| No. | Change | impact scope | Launch strategy |
|---|---|---|---|
| 1 | `services/ai/llm_router.py` new build: provider registration based on `llama_index.llms.*` + dispatch by model name | YiAi `services/ai/` | one-shot switch chat_service call point |
| 2 | `config.yaml` add `llm.providers` section: provider / api_key / base_url / model list | YiAi config + env injection | gradual: keep ollama default, new providers default off |
| 3 | `domain/rag/engine.py` generation side switches to `llm_router.get_llm(model_name)` | YiAi RAG chat | follow #1, same PR |
| 4 | `/llm-providers` endpoint: list available providers + model metadata (context window / cost / latency) | YiAi routing | one-shot new add |
| 5 | eval set: BRD bilingual docs 20 + RAG recall 50 | YiAi `tests/eval/` | run baseline before switch, run regression after switch |
| 6 | supply-chain hardening: `uv` lockfile + `pip-audit` + min-release-age effective strategy | YiAi whole stack | same PR as #1, upfront |
| 7 | YiVad `src/api/modules/llmService.ts` + YiPet `services/llmService.ts`: call `/llm-providers` + chat endpoint with `model` parameter | YiVad / YiPet frontend | after YiAi endpoint launches, gradually add UI |

## 4. Options Considered

| Option | description | pros | cons | conclusion |
|---|---|---|---|---|
| A. `llama_index.llms.*` | YiAi directly imports `from llama_index.llms.openai import OpenAI` etc.; dispatch by model name | existing dependency; Python homogeneous; 300+ integration ecosystem; RAG / agent path unified | abstraction follows llama_index evolution cadence, passive upgrades | ✅ chosen |
| B. `pi-ai` | unified LLM API via `pi-ai` package; YiAi cross-language calls TS package (or via HTTP sidecar) | clean multi-provider abstraction; TS native; supply-chain hardening list reusable | cross-language/process boundary; introduces Bun + sidecar; ecosystem narrower than llama_index | ❌ |
| C. self-built thin layer | YiAi self-writes `ProviderRouter` abstraction, directly connects to each provider SDK | fully controllable; no passive upgrades | reinventing the wheel; hardening surface too wide; maintenance cost high | ❌ (unless A invalid) |

## 5. Assessment dimensions

| dimension | A. `llama_index.llms.*` | B. `pi-ai` | C. self-built thin layer |
|---|---|---|---|
| ecosystem breadth | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Python homogeneous | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| TS shared client friendly | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| unified with RAG / agent path | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| ready-made supply-chain hardening list | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| passive upgrade degree | ⭐⭐ (follows upstream) | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| switch cost (first version) | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

## 6. Risks

| Risk | probability | impact | Mitigation |
|---|---|---|---|
| `llama_index.llms.*` breaking API change | medium | medium | quarterly review + run evaluation before `llama-index-core` minor upgrade |
| multi-provider switch causes generated quality drift | high | high | run eval set before switch; recall rate / generated quality rollback > 5% blocks launch |
| API key leak | medium | high | key not in repo; env injection + `config.yaml` only placeholder; CI secret scan |
| YiVad / YiPet model selector UI block unresolved | medium | medium | UI skeleton first, joint debug after endpoint launch (align with [YiPet project management §block](../../../product-manager/projects/yipet--project-management.md)) |
| YiAi no lockfile introduces supply chain attack surface | high | high | #6 supply-chain hardening upfront, same PR as #1 |
| llama_index upgrade cadence misaligned with business cadence | low | medium | ADR review trigger conditions include `llama_index.llms.*` breaking change |

## 7. Rollback plan

| trigger condition | Rollback action | responsible | estimated recovery time |
|---|---|---|---|
| eval set recall rollback > 5% | switch back to `ollama` single-provider branch | YiAi primary owner | 30 min |
| multi-provider routing causes SSE streaming regression | switch back to `chat_service.py` old call point | YiAi primary owner | 1 h |
| `llama_index.llms.*` breaking change blocks upgrade | lock version + eval set re-run + evaluate option C (self-built thin layer) | Architecture group | 1 work day |
| API key leak event | immediately revoke key + rotate + audit call log | ops + YiAi primary owner | 2 h |

> Rollback actions must be executable within one hour (unless the provider adapter layer needs rewriting), and require no redeployment of YiVad / YiPet frontend.

## 8. Implementation plan

| stage | content | completion date | responsible |
|---|---|---|---|
| Phase 1 | `uv` lockfile + `pip-audit` + min-release-age effective strategy implementation (#6) | 2026-08-05 | YiAi primary owner |
| Phase 2 | `llm_router.py` + `config.yaml` providers section + ollama single-provider run through (#1 #2) | 2026-08-07 | YiAi primary owner |
| Phase 3 | OpenAI / Anthropic / Google three provider onboarding + eval set baseline + regression (#3 #4 #5) | 2026-08-12 | YiAi primary owner + QA |
| Phase 4 | YiVad / YiPet model selector UI skeleton + joint debugging (#7) | 2026-08-14 | YiVad / YiPet primary owner |
| Phase 5 | Monitoring one week stability + review this ADR | 2026-08-21 | Architecture group |

## 9. Follow-up tracking metrics

| metric | pre-Launch | Target | actual |
|---|---|---|---|
| available provider count | 1 (Ollama) | ≥ 4 (Ollama + OpenAI + Anthropic + Google) | — |
| RAG recall rate (50-case eval set) | baseline | rollback ≤ 5% | — |
| BRD bilingual generated quality (20-case manual scoring) | baseline | subjective scoring rollback ≤ 0.5 (5-point scale) | — |
| chat SSE first-token latency (P95) | < 800 ms | < 1200 ms (multi-provider adds one hop) | — |
| LLM call error rate (5xx) | < 0.5% | < 1% (multi-provider adds failure surface) | — |

## 10. Cross-project contract

- **YiAi → YiVad / YiPet**: expose `GET /llm-providers` listing `{provider, model, context_window, cost_per_1k_tokens, latency_p95, default}`; chat endpoint accepts `model` parameter (default `ollama/llama3.1`).
- **YiVad / YiPet → YiAi**: model selector UI pulls list from `/llm-providers`; after user selects a model write into chat request body `model` field.
- **YiAi internal**: `llm_router.get_llm(model_name)` returns `llama_index.llms.*` instance; provider invalid degrades via `fallback` list.
- **supply-chain hardening**: YiAi `requirements.txt` locks version + `pip-audit` CI + `min-release-age` effective strategy (pip has no native support, use `pip-tools` + self-written check).

## 11. References

- [llama_index evolution track](../../../ai-engineer/platform/llama-index-evolution.md) — basis for choosing A's ecosystem
- [Pi Agent Harness evolution track](../../../engineer/engineering/pi-agent-harness-evolution.md) — basis for comparing B + supply-chain hardening list source
- [YiAi Architecture overview](../../../engineer/projects/yiai/architecture.md) — implementation points `services/ai/` + `domain/rag/`
- [YiAi development standards](../../../engineer/projects/yiai/dev-standards.md) — supply-chain hardening gap
- [ADR Template](../../../knowledge-curator/templates/adr.md) / [ADR Summary](../../../knowledge-curator/templates/adr.md)
- [weekly report instance](../../../product-manager/delivery/weekly-report.md) / [Retrospective instance](../../../product-manager/delivery/retrospective.md) / [daily report instance](../../../product-manager/delivery/daily-report.md) — trigger event source
- [user story migration plan](../../../knowledge-curator/governance/user-story-migration-plan.md) — design basis for this file naming + multi-Role annotation
