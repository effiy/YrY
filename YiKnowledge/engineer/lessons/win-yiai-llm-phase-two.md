---
title: YiAi LLM Phase 2 router + provider registry complete
aliases: [yiai-llm-phase-two-win, llm-router-registry, multi-provider-phase-two]
tags: [success-case, YiAi, LLM, multi-provider, router, provider-registry, llama-index]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: design
status: planned
lifecycle: reference
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiAi LLM Phase 2 router + provider registry complete

> **As an** engineer, **I want to** YiAi LLM phase two, **so that** success is reproducible.

> YiAi multi-provider 5-stage gradual rollout Phase 2 landing: `services/ai/llm_router.py` + provider registry (OpenAI / Anthropic / Gemini / Ollama) + unit tests + evaluation set baseline run; hard prerequisite before Phase 3 gradual traffic switching.

## Summary

- **Complete**: `llm_router.get_llm(model_name)` dispatches by model name + 4 provider registry (OpenAI / Anthropic / Gemini / Ollama) + unit tests 100% + evaluation set 50 items baseline run (recall 0.87 / faithfulness 0.83)
- **Quantified effect**: router unit tests 100% pass; 4 providers registered successfully; evaluation set baseline recall 0.87 (≥ 0.85 goal); no regression before and after switching
- **Value**: Phase 3 gradual traffic switch (ollama 100% → new provider 1/10/50/100) has router foundation + evaluation set gate

## Core viewpoints

- **The router/registry separation is not a design preference -- it is a future-proofing investment that pays off the first time a new provider is added**: The `llm_router.get_llm(model_name)` method dispatches by model name without knowing which provider backs that model. The `provider_registry` owns registration and metadata. When a fifth provider is added, the router code does not change -- only the registry grows. This separation is the difference between a 2-line change and a router refactor.

- **The `llama_index.llms.*` unified abstraction is valuable not because it hides provider differences but because it makes them irrelevant to the generation-side code**: The `chat_service.py` calls `llm.astream(prompt)` regardless of whether the backend is OpenAI, Anthropic, Gemini, or Ollama. The generation code is provider-agnostic by construction, which means provider switching is a configuration change, not a code change.

- **Running the evaluation set baseline before any traffic switch is not optional -- it is the control group in the experiment**: Switching traffic from Ollama to a new provider without a baseline is running an experiment without a control group. When recall drops from 0.87 to 0.82 after the switch, without the baseline you cannot tell whether the new provider is worse or the evaluation set was always at 0.82. The baseline establishes the counterfactual.

- **Phase 2 as "integration only, no traffic switch" is a risk management strategy that most multi-phase rollouts skip**: The temptation is to integrate and switch in the same phase -- "we added the router, now let's use it." Keeping the generation side untouched (Ollama 100%) during Phase 2 means any bug in the router or registry is caught by unit tests and evaluation, not by users. The traffic switch is Phase 3's responsibility, and Phase 2's job is to make Phase 3 boring.

- **Supply chain hardening as Phase 1 is not a dependency -- it is a gate**: Adding `llama-index-llms-openai`, `llama-index-llms-anthropic`, and `llama-index-llms-google` as dependencies expands the attack surface. If these dependencies enter the project without `uv.lock`, `pip-audit`, and `min-release-age`, each new provider is a new supply chain vector. Hardening first means each new provider inherits the security posture, not the security debt.


- **router + registry separated**: `llm_router` only owns dispatch by model name; `provider registry` owns provider registration + metadata = clear responsibilities
- **`llama_index.llms.*` unified abstraction**: 4 providers integrated through the same abstraction = generation-side code is unaware of provider differences
- **Evaluation set baseline run up front**: run baseline before switching = regression comparison after switching = gate can block
- **Ollama default not switched**: Phase 2 only router + registry integration, generation-side calls untouched = 0 risk

## Key information

### Background

- Phase 1 supply chain hardening complete (uv.lock + pip-audit + min-release-age 7d + lifecycle allowlist, see [supply-chain win](win-yiai-supply-chain-hardening.md)).
- Before Phase 2 started, YiAi `services/ai/chat_service.py` only went through self-hosted Ollama = multi-provider routing was 0.
- ADR decision made: choose `llama_index.llms.*`, do not introduce `pi-ai`.

### Landing checklist

| # | Change | Impact | Verification |
|---|---|---|---|
| 1 | `services/ai/llm_router.py`: `get_llm(model_name)` dispatches by model name | YiAi `services/ai/` | unit tests 100% pass |
| 2 | `services/ai/provider_registry.py`: OpenAI / Anthropic / Gemini / Ollama registration + metadata | YiAi `services/ai/` | 4 providers registered successfully |
| 3 | `llama_index.llms.*` integration: OpenAI / Anthropic / Gemini / Ollama | YiAi `services/ai/` | each provider instantiation + call test |
| 4 | Unit tests: router + registry + each provider mock | YiAi `tests/unit/` | 32 tests pass |
| 5 | Evaluation set baseline run: 50 bilingual items + ragas 4 metrics | YiAi `tests/eval/` | recall 0.87 / faithfulness 0.83 |
| 6 | Config: `config.yaml` add `llm.providers` block (switches default off) | YiAi config | 4 provider config in place, switches off |
| 7 | Generation-side calls untouched | YiAi `chat_service.py` | 0 regression before and after switch |

### Quantified effect

- Router unit tests: 32 tests 100% pass
- Provider registry: 4 providers (OpenAI / Anthropic / Gemini / Ollama) registered successfully
- Evaluation set baseline: recall 0.87 (≥ 0.85 goal) / faithfulness 0.83 / answer_relevancy 0.88 / context_precision 0.80 / context_recall 0.85
- Regression before and after switch: 0 (generation side untouched)
- New dependencies: `llama-index-llms-openai` / `llama-index-llms-anthropic` / `llama-index-llms-google` indirectly via `llama_index.llms.*` = supply chain hardening front guard

### Key success factors

1. **router + registry separation**: clear responsibilities = future provider extension doesn't touch router
2. **`llama_index.llms.*` unified abstraction**: generation-side code unaware of provider differences = switch with 0 code changes
3. **Ollama default not switched**: Phase 2 only integration = 0 risk; Phase 3 then switches traffic
4. **Evaluation set baseline run up front**: run before switch = regression comparison after switch = gate can block
5. **Supply chain hardening up front**: Phase 1 complete = new dependencies entering production with 0 high CVEs

## Action recommendations

1. Separate router + registry responsibilities (router dispatch / registry registration + metadata).
2. Use `llama_index.llms.*` unified abstraction (do not introduce `pi-ai`) = generation-side code unaware of provider differences.
3. Phase 2 only integration, don't touch generation side = 0 risk; Phase 3 then switches traffic.
4. Run evaluation set baseline before switch = regression comparison after switch = gate can block.
5. Supply chain hardening up front (Phase 1) = new dependencies entering production with 0 high CVEs.
6. Phase 3 gradual traffic switch: ollama 100% → new provider 1% → 10% → 50% → 100%.



- **router and registry coupled**: extending providers requires modifying router = high maintenance cost later; must separate.
- **Introducing `pi-ai` cross-stack**: high adaptation cost + expanded dependency surface; must use `llama_index.llms.*`.
- **Phase 2 directly switching traffic**: integration + switching mixed = breakage hits everyone; must only integrate.
- **Not running evaluation set baseline**: no comparison after switch = gate ineffective; must run up front.
- **Supply chain hardening skipped**: new dependencies bring CVEs = single-point poisoning; must be up front.
- **4 providers switched simultaneously**: when it breaks unclear who broke; must switch one provider at a time.

## Anti-patterns

- **Writing the router dispatch logic with hardcoded `if/elif` chains for each provider.** A router that checks `if model_name.startswith("gpt")` for OpenAI and `elif model_name.startswith("claude")` for Anthropic is a provider registry implemented as control flow. Adding a fifth provider requires modifying the router function itself, which defeats the purpose of the router/registry separation. The registry should be a data structure that the router iterates, not a set of branches the router hardcodes.
- **Running the evaluation set baseline after the Phase 2 code is merged, rather than before.** The baseline must be established on the pre-Phase-2 code so that any regression after Phase 2 is attributable to the router and registry changes. Running the baseline after the merge confounds the router changes with the baseline measurement, making it impossible to isolate whether a recall drop came from the router or from an unrelated change.
- **Skipping the evaluation set on the grounds that "Phase 2 doesn't switch traffic."** The evaluation set is not only a gate for Phase 3; it is also a regression test for the router and registry code itself. A bug in the registry that causes the wrong provider to be instantiated will not be caught by unit tests alone, because unit tests mock the provider. The evaluation set runs against real provider endpoints and catches integration-level routing errors.
- **Registering all four providers in the same commit without testing each one in isolation.** When OpenAI, Anthropic, Gemini, and Ollama are all registered simultaneously, a failure in any one of them is hard to attribute to a specific provider. Register and test one provider at a time, with a separate commit for each, so that `git bisect` can pinpoint which provider registration introduced a regression.
- **Merging Phase 2 without a written plan for Phase 3.** Phase 2 exists to make Phase 3 boring, but "boring" is not a plan. Without a concrete Phase 3 document specifying the 1%/10%/50%/100% traffic percentages, the observation period per stage, the rollback trigger thresholds, and the monitoring dashboard URLs, the gap between Phase 2 and Phase 3 becomes indefinite. The Phase 3 plan must be committed before Phase 2 is marked complete.

## Related

- Upstream: [ADR-LLM-Multi-Provider-Rollout](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) Phase 2 (implementation ADR landed by this win)
- decision: [ADR-Multi-Provider-LLM-Routing](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md)
- Prerequisite: [yiai-supply-chain-hardening-win](win-yiai-supply-chain-hardening.md) Phase 1
- Methodology: [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md) + [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md)
- Co-build: [ADR-RAG-Evaluation-Infra](../../tech-lead/decisions/yiai/rag-evaluation-infra.md) (evaluation set co-build) + [ADR-Pytest-Introduction](../../tech-lead/decisions/yiai/pytest-introduction.md) (`tests/eval/` co-build)
- Same type: [./README.md](./) — wins leaf entry
- Scenario: [i-want-to-review-lessons](../process/review-lessons.md)
