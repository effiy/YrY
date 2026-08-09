---
title: ADR — YiAi BRD Agent 5-Stage Launch Methodology
aliases: [adr-brd-agent-launch, yi-ai-brd-agent-adr, agent-launch-methodology-adr]
tags: [adr, yi-ai, brd-agent, agent, 5-phase, instance-adr, architecture-decision]
category: tech-lead/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiAi BRD agent 5-stage launch methodology is documented so future agent launches follow a proven pattern"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ../../../engineer/projects/yiai/architecture.md
  - ../../../engineer/projects/yiai/functional-modules.md
  - ../../../engineer/projects/yiai/dev-standards.md
  - ./route-llm-traffic-across-providers.md
  - ./pytest-introduction.md
  - ./rag-evaluation-infra.md
  - ../../../product-manager/projects/yiai--project-management.md
  - ../../../engineer/lessons/win-yiai-brd-agent-launch.md
  - ../../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiAi BRD Agent 5-Stage Launch Methodology

> **As a** tech lead, **I want to** brd agent launch, **so that** decision documented and reversible.

> Decision: YiAi BRD agent launch adopts a 5-stage split + structure-contract-first + RAG > long prompt + streaming + editable reflow + grayscale + feedback closed-loop methodology. This document captures the decision's "why split this way" and "why 5 stages instead of 3 or 7." Landing case at [yiai-brd-agent-launch win](../../../engineer/lessons/win-yiai-brd-agent-launch.md).

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Brd-Agent-Launch |
| Title | YiAi BRD agent 5-stage launch methodology |
| Status | Accepted |
| Date | 2026-07-31 |
| Decider | YiAi lead + architecture team + BRD business owner |
| Reviewers | CTO, BRD business owner, QA |
| Related project | YiAi |
| Related PR/Issue | shipped (see [yiai-brd-agent-launch win](../../../engineer/lessons/win-yiai-brd-agent-launch.md)) |
| Supersedes | — |
| Superseded by | — |
| Review trigger | quarterly review / signal: next agent launch / model upgrade / prompt drift / RAG recall regression |

## 2. Context

- **Current-state trigger**: YiAi needs to auto-generate BRDs from PRD / requirement descriptions; involves multi-step reasoning (market → user → solution → risk → metric) + structured output (YiDoc BRD template) + YiKnowledge retrieval + streaming output + editable reflow + feedback closed-loop.
- **Pain points**:
  - Long prompts are inaccurate and expensive: stuffed context + inaccurate recall + high cost.
  - No structure contract: output format drifts, backend parsing breaks.
  - Long generation without streaming: users wait 30s without feedback, experience collapses.
  - Generation as endpoint: no reflow to business systems = generated results rot in chat = no business value.
  - No feedback closed-loop: prompt written once and frozen; quality drops on model upgrade.
  - No grayscale: direct full launch = P0 bug blast radius explodes.
- **Trigger event**: BRD writing averaged 2h; business owner pushed automation; YiAi RAG already landed ([yiai-rag-hybrid-retrieval-win](../../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md)).
- **External constraints**: YiAi uses self-hosted Ollama (multi-provider lands after [ADR multi-provider](./route-llm-traffic-across-providers.md)); YiDoc is BRD's final destination; YiKnowledge provides RAG retrieval source.

## 3. Decision

YiAi BRD agent launch uses a 5-stage split + structure-contract-first + RAG > long prompt + streaming + interruptible + editable reflow + grayscale + feedback closed-loop methodology. Each stage independently shippable + verifiable; structure contract precedes prompt; RAG precedes generation; streaming precedes reflow; feedback closed-loop at the end.

Landing checklist:

| # | Change | Impact | Launch strategy |
|---|---|---|---|
| 1 | Stage 1: prompt design + output structure contract (JSON schema driven) | YiAi services/brd/ | one-shot |
| 2 | Stage 2: YiKnowledge retrieval integration (RAG multi-recall + top-k tuning) | YiAi domain/rag/ linkage | follow #1 |
| 3 | Stage 3: streaming output + frontend incremental render + interruptible (SSE + onDone guard) | YiAi services/brd/ + YiVad brd page | follow #2 |
| 4 | Stage 4: editable + reflow to YiDoc (generate → edit → write back) | YiAi + YiVad + YiDoc | follow #3 |
| 5 | Stage 5: grayscale + feedback closed-loop (5 internal users → all + user feedback recording) | YiAi + YiVad UI | follow #4 |
| 6 | Eval-set baseline (co-built with [ADR RAG eval](./rag-evaluation-infra.md)) | YiAi tests/eval/ | same cadence as #5 |

## 4. Options considered

| Option | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. 5-stage split (structure contract → RAG → streaming → reflow → grayscale) | this doc | each stage shippable + verifiable; contract before prompt; RAG before generation | split cost (2 days upfront planning) | ✅ chosen |
| B. Big-bang launch (single PR) | one-shot all-at-once | no stage coordination | 80% stall likely; PR unreviewable; P0 bug blast radius explodes | ❌ |
| C. 3-stage coarse split (generate → reflow → grayscale) | 3 stages | fewer stages, simpler coordination | single-stage size still large; contract and prompt not separated; stuck blocks global | ❌ (too coarse) |
| D. 7-stage fine split (extra prompt tuning + eval-set independent stage) | 7 stages | very small PRs | too many stages, coordination cost explodes; eval-set cannot be independent | ❌ (too fine) |
| E. No RAG (long prompt instead) | long prompt stuffed context | no RAG integration cost | inaccurate recall + high cost + token bloat | ❌ |

## 5. Evaluation dimensions

| Dimension | A. 5-stage | B. Big-bang | C. 3-coarse | D. 7-fine | E. No RAG |
|---|---|---|---|---|---|
| Stage-verifiable | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | — |
| Contract before prompt | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| PR reviewable | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | — |
| Anti-regression | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | — |
| Coordination cost | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Recall quality | ⭐⭐⭐⭐⭐ | — | — | — | ⭐⭐ |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| prompt drift (model upgrade) | high | high | eval-set baseline + rerun before model upgrade (co-built with [ADR RAG eval](./rag-evaluation-infra.md)) |
| RAG recall skew | medium | medium | multi-recall (vector + BM25) + top-k tuning (5 → 8) + key numbers must be traceable |
| Generation hallucination | medium | high | key numbers / names must be traceable to YiKnowledge; frontend shows citation |
| Structure contract and generation drift | medium | high | JSON schema validation on generation + retry on failure + non-compliant not shipped |
| Streaming interrupt handling | medium | medium | SSE + onDone guard ([sse-ondone-guard gotcha](../../../engineer/lessons/gotcha-sse-ondone-guard.md)); user interrupt preserves already-rendered |
| Reflow conflict (user edit + subsequent generation) | medium | medium | check YiDoc version before reflow + conflict prompt + user choice |
| Grayscale feedback not closed-loop | medium | medium | user feedback mandatory collection (thumbs up/down + correction diff); weekly prompt iteration |
| Multi-provider switch breaks baseline | medium | high | rerun eval baseline before multi-provider switch ([ADR multi-provider §risk #2](./route-llm-traffic-across-providers.md)) |

## 7. Rollback plan

| Trigger | Rollback action | Owner | Est. recovery |
|---|---|---|---|
| Grayscale P0 bug | immediately disable grayscale + switch back to BRD manual authoring + fix bug | YiAi lead + BRD business owner | 2 h |
| Generation quality regression | switch back to previous prompt + rerun eval + re-review baseline | YiAi lead | 1 work day |
| RAG recall regression > 5% | switch back to previous top-k + re-review YiKnowledge content + rerun | YiAi lead | 1 work day |
| Structure contract broken | switch back to previous schema + re-review generation output + fix prompt | YiAi lead | 1 h |
| Reflow conflicts frequent | pause reflow + re-review YiDoc version detection + add conflict UI | YiAi lead + YiVad | 1 work day |
| Multi-provider switch breaks baseline | switch back to Ollama + rerun eval + re-review provider selection | architecture team | 1 work day |

> Rollback must be executable within 1 work day; BRD agent rollback does not affect BRD manual authoring flow.

## 8. Implementation plan

| Phase | Content | Completion date | Owner |
|---|---|---|---|
| Phase 1 | prompt + output structure contract | 2026-07-25 done | YiAi lead |
| Phase 2 | YiKnowledge RAG integration | 2026-07-27 done | YiAi lead |
| Phase 3 | streaming output + frontend render + interruptible | 2026-07-29 done | YiAi + YiVad leads |
| Phase 4 | editable + reflow YiDoc | 2026-07-30 done | YiAi + YiVad leads |
| Phase 5 | grayscale + feedback closed-loop | 2026-07-31 done | YiAi + BRD business owner |
| Phase 6 | eval-set baseline (co-built with [ADR RAG eval](./rag-evaluation-infra.md)) | 2026-08-15 | YiAi lead + BRD business owner |
| Phase 7 | rerun baseline before multi-provider switch | 2026-08-19 | YiAi lead |
| Phase 8 | quarterly review of prompt + eval set + feedback closed-loop | 2026-09-01 | architecture team + business owner |

## 9. Follow-up tracking metrics

| Metric | Pre-launch | Post-launch | Target |
|---|---|---|---|
| BRD writing time | 2h | 25min | -79% ✅ |
| Structure completeness | — | 90%+ | 90%+ ✅ |
| User-edit reflow rate | — | 60% | 50%+ ✅ |
| Post-launch P0 bugs | — | 0 | 0 ✅ |
| Eval-set baseline recall | not quantifiable | to be quantified | baseline + regression ≤ 5% |
| user feedback collection rate | 0% | — | ≥ 80% |
| Grayscale headcount | — | 5 → all | progressive |

## 10. Methodology reusability

- **Structure-contract-first principle**: define JSON schema first, then write prompt, backend parsing validates against schema; applies to all structured-generation agents.
- **RAG > long-prompt principle**: knowledge-base retrieval is more accurate and cheaper than stuffing context; applies to all knowledge-backed generation.
- **Streaming + interruptible principle**: long generation must have user-perceivable feedback; SSE + frontend incremental render + user interrupt button; applies to all > 10s generation agents.
- **Generate → edit → reflow principle**: generation is not the endpoint; reflow to business systems closes the loop; applies to all productive agents (vs conversational).
- **Feedback closed-loop principle**: user feedback (thumbs up/down + correction diff) fuels next-round prompt optimization; applies to all agents needing continuous iteration.
- **Grayscale release principle**: 5 internal users → all; monitor P0 bugs and hallucination rate; applies to all agents facing real users.
- **Eval-set co-build principle**: shared `tests/eval/` with [ADR RAG eval](./rag-evaluation-infra.md) + [ADR pytest](./pytest-introduction.md); applies to all agent launches.

## 11. Coupling with other ADRs / docs

- **[ADR multi-provider LLM routing](./route-llm-traffic-across-providers.md)**: rerun this ADR's baseline before multi-provider switch.
- **[ADR pytest introduction](./pytest-introduction.md) #5**: `tests/eval/` co-build; BRD generation eval integrated into pytest.
- **[ADR RAG eval infra](./rag-evaluation-infra.md)**: this ADR's stage 6 eval set is shared with RAG eval.
- **[yiai-brd-agent-launch win](../../../engineer/lessons/win-yiai-brd-agent-launch.md)**: this ADR's landing case.
- **[yiai-rag-hybrid-retrieval win](../../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md)**: stage 2 RAG integration basis.
- **[sse-ondone-guard gotcha](../../../engineer/lessons/gotcha-sse-ondone-guard.md)**: stage 3 streaming + interruptible basis.
- **[BRD generation prompt](../../../ai-engineer/methodology/prompts--brd-generation.md)**: stage 1 prompt design reference.
- **[YiDoc BRD template](../../../knowledge-curator/templates/brd.md)**: stage 1 output structure contract reference.

## 12. References

- [YiAi architecture overview](../../../engineer/projects/yiai/architecture.md)
- [YiAi functional modules](../../../engineer/projects/yiai/functional-modules.md)
- [yiai-brd-agent-launch win](../../../engineer/lessons/win-yiai-brd-agent-launch.md)
- [ADR RAG eval](./rag-evaluation-infra.md)
- [ADR multi-provider](./route-llm-traffic-across-providers.md)
- [ADR template](../../../knowledge-curator/templates/adr.md)
