---
title: ADR — YiAi multi-provider rollout implementation
aliases: [adr-llm-multi-provider-rollout, yi-ai-multi-provider-rollout-adr, llm-provider-rollout]
tags: [adr, yi-ai, llm, multi-provider, implementation, rollout, llama-index]
category: tech-lead/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
source: internal
type: adr
status: draft
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiAi multi-provider LLM routing decision is documented, enabling cost-flexibility without vendor lock-in"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ./route-llm-traffic-across-providers.md
  - ../../../engineer/projects/yiai/architecture.md
  - ../../../engineer/projects/yiai/dev-standards.md
  - ../../../product-manager/projects/yiai--project-management.md
  - ../../../engineer/engineering/shared-client-design.md
  - ../../../engineer/quality-security/harden-supply-chain.md
  - ../../../engineer/engineering/evaluation-driven-development.md
  - ../../../engineer/architecture-design/rpc-envelope.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiAi multi-provider rollout implementation

> **As a** tech lead, **I want to** llm multi provider rollout, **so that** decision documented and reversible. 

> Track the landing progress of [multi-provider decision ADR](./route-llm-traffic-across-providers.md): 5-phase gradual rollout + per-phase eval-set gate + supply-chain hardening prerequisite + endpoint contract alignment + traffic-split ratio monitoring. 

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-LLM-Multi-Provider-Rollout |
| Title | YiAi multi-provider rollout implementation: 5-phase gradual rollout |
| State | InProgress (Phase 2 / 5)  |
| Date | 2026-08-03 kickoff |
| Decision maker | YiAi lead owner |
| Reviewers | CTO, YiVad / YiPet lead owners |
| Related projects | YiAi (direct) / YiVad / YiPet (indirect endpoint consumers)  |
| Related PRs | YiAi `feat(llm): phase-1 supply-chain hardening` merged; `feat(llm): phase-2 router + provider registry` in progress |
| Upstream ADR | [ADR-Multi-Provider-LLM-Routing](./route-llm-traffic-across-providers.md) (decision)  |
| Re-review triggers | End of each phase / eval-set regression > 5% / supply-chain audit high CVE blocking |

## 2. Background

- Decision ADR settled: choose `llama_index.llms.*`, do not introduce `pi-ai`. 
- This ADR tracks implementation: 5-phase gradual rollout + per-phase gate (eval set + supply chain + endpoint contract) . 
- Blocks downstream: YiVad / YiPet model selector UI etc. open after `/llm-providers` endpoint lands. 
- Risk surface: dependencies grow (OpenAI / Anthropic / Gemini SDK indirectly via `llama_index.llms.*`) = supply-chain attack surface expands = hardening prerequisite. 

## 3. Decision

5-phase split (each phase independently launchable + eval-set gate + gradual traffic split) : 

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Supply-chain hardening prerequisite: `uv.lock` + `pip-audit` + `min-release-age 7d` + lifecycle allowlist | YiAi full stack | One-shot, hard prerequisite |
| 2 | `services/ai/llm_router.py` + provider registry (OpenAI / Anthropic / Gemini / Ollama)  | YiAi `services/ai/` | One-shot, unit tests + eval-set baseline run |
| 3 | `config.yaml` adds `llm.providers` + env injection + provider switch default off | YiAi config | Progressive: keep ollama default, new provider gradual 1% → 10% → 50% → 100% |
| 4 | `domain/rag/engine.py` generation side switches to `llm_router.get_llm(model_name)` + eval-set 50-case baseline run + regression > 5% blocks | YiAi RAG chat | Follows #2, same PR |
| 5 | `/llm-providers` endpoint + `chat_stream` endpoint carries `model` parameter + frontend model selector (YiVad + YiPet)  | YiAi route + YiVad / YiPet frontend | Follows #3 |

## 4. Alternatives

| Alternative | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. 5-phase gradual rollout | Current plan | Each phase independent gate; fine-grained rollback; downstream UI not blocked | Long cadence; eval-set maintenance cost | ✅ Selected |
| B. One-shot switch | All providers at once | Fast | No gate; incident hits everyone | ❌ Rejected |
| C. Dual-track parallel | Old / new long-term parallel | Comparable | Double maintenance cost | ❌ Rejected |

## 5. Evaluation dimensions

| Dimension | Goal | Current state |
|---|---|---|
| Supply-chain hardening | lockfile 100% + audit 0 high CVE | Phase 1 done |
| Eval-set baseline | 50 bilingual cases + ragas 4 metrics | Phase 2 running |
| Endpoint contract | RPC envelope + SSE guard + inline citation | Pending Phase 5 |
| Gradual traffic split | ollama 100% → new provider 1/10/50/100 | After Phase 3 starts |
| Downstream UI | YiVad / YiPet model selector | Blocked (waiting on Phase 5)  |

## 6. Risk

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| `llama_index.llms.*` breaking change | Medium | High | lockfile pin version + quarterly re-review |
| Eval-set baseline drift | Medium | Medium | Quarterly full re-run |
| Provider SDK indirectly introduces CVE | Medium | High | `pip-audit` + min-release-age 7d + lifecycle allowlist |
| Recall regression > 5% after traffic split | Medium | High | Eval-set gate blocks + gradual rollback |
| Downstream UI long-term blocked | High | Medium | Phase 5 prioritized + frontend mock first |

## 7. Rollback

Each phase has independent rollback strategy: 
- Phase 1 failure: remove lockfile back to requirements.txt + re-run CI
- Phase 2 failure: remove `llm_router.py` + keep ollama default path
- Phase 3 failure: provider switch back to off + 100% ollama
- Phase 4 failure: `domain/rag/engine.py` rollback to old generation path + eval-set baseline re-run
- Phase 5 failure: `/llm-providers` endpoint offline + frontend model selector rollback

## 8. Implementation plan

```
Phase 1 (supply-chain hardening prerequisite) ✅ 2026-08-03 done
  - uv.lock commit
  - pip-audit --strict CI block
  - min-release-age 7d
  - lifecycle allowlist (pre-release / deprecated / unmaintained rejected) 

Phase 2 (router + provider registry) 🔄 in progress
  - services/ai/llm_router.py
  - provider registry: OpenAI / Anthropic / Gemini / Ollama
  - unit tests + eval-set baseline run
  - expected within 1 week

Phase 3 (config + env + gradual) ⏳ pending start
  - config.yaml adds llm.providers block
  - provider switch default off
  - gradual 1% → 10% → 50% → 100%

Phase 4 (RAG generation side switch + eval-set gate) ⏳
  - domain/rag/engine.py uses llm_router
  - eval-set 50-case baseline run
  - regression > 5% blocks

Phase 5 (endpoint + frontend model selector) ⏳
  - /llm-providers endpoint
  - chat_stream carries model parameter
  - YiVad src/api/modules/llmService.ts
  - YiPet services/llmService.ts
  - frontend model selector UI
```

## 9. Follow-up tracking metrics

- Eval set: recall / faithfulness / answer_relevancy / context_precision / context_recall
- Supply chain: `pip-audit` high CVE count = 0; new version publish-to-install min-release-age ≥ 7d
- Gradual: per-provider traffic-split ratio (ollama / OpenAI / Anthropic / Gemini) 
- Endpoint: `/llm-providers` call volume + `chat_stream` error rate + SSE exception termination rate
- Downstream: YiVad / YiPet model selector usage rate

## 10. Methodology reusability

- 5-phase gradual rollout + per-phase gate = general multi-provider switch methodology
- Supply-chain hardening prerequisite = must run before introducing new dependencies (see [supply-chain-hardening-pattern](../../../engineer/process/harden-supply-chain.md)) 
- Eval-set gate + regression threshold = quality gates (see [evaluation-driven-development-pattern](../../../engineer/engineering/evaluation-driven-development.md)) 
- Endpoint contract alignment = RPC envelope + SSE guard + inline citation co-build (see [rpc-envelope-pattern](../../../engineer/architecture-design/rpc-envelope.md)) 

## 11. Coupling with other ADRs

- Upstream decision: [ADR-Multi-Provider-LLM-Routing](./route-llm-traffic-across-providers.md)
- Co-build: [ADR-Pytest-Introduction](./pytest-introduction.md) (eval set directory `tests/eval/`) + [ADR-RAG-Evaluation-Infra](./rag-evaluation-infra.md) (ragas 4 metrics) + [ADR-BRD-Agent-Launch](./brd-agent-launch.md) (BRD multilingual scenarios) 
- Supply chain: [no-lockfile-supply-chain-risk gotcha](../../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md)
- Frontend: [shared-client-design-summary](../../../engineer/engineering/shared-client-design.md) (YiVad / YiPet base layer calling endpoint) 

## 12. References

- [ADR template](../../../knowledge-curator/templates/adr.md)
- [llama_index evolution tracking](../../../ai-engineer/platform/llama-index-evolution.md)
- [Pi Agent Harness evolution](../../../engineer/engineering/pi-agent-harness-evolution.md)
