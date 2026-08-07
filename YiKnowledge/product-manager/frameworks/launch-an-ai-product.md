---
title: Launch an AI product
aliases:
- I want to launch AI product
- ai-product-launch-journey
- BRD agent launch entry
- AI product publish entry
tags:
- journeys
- ai-product
- launch
- brd-agent
- grayscale
- feedback-loop
- rag-vs-long-prompt
category: product-manager/frameworks
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- product-manager
benefit: launch is safe
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/projects/build-a-rag-pipeline.md
- ../../tech-lead/architecture/design-architecture-decision.md
- ../../engineer/infrastructure/roll-out-a-migration.md
- ../../tech-lead/decisions/yiai/brd-agent-launch.md
- ../../engineer/lessons/failures/ai-product-launch-lessons.md
- ../../ai-engineer/methodology/agent-architecture-patterns.md
review_cycle: quarterly
tacit: false
---

# I want to launch an AI product

> **As a** product manager, **I want to** launch an ai product, **so that** launch is safe. 

> "BRD agent / AI feature how to launch from 0 to 1" reaches within 2 hops the 5-phase methodology + RAG vs long prompt + streaming + editable stream-back + grayscale + feedback loop + risk reference. 

## Summary

- launch methodology via [adr-brd-agent-launch.md](../../tech-lead/decisions/yiai/brd-agent-launch.md) + [yiai-brd-agent-launch win](../../engineer/lessons/win-yiai-brd-agent-launch.md): 5 phases (structure contract first → RAG > long prompt → streaming → editable stream-back → grayscale + feedback loop) 
- RAG pipeline via [i-want-to-build-a-rag-pipeline](../../engineer/projects/build-a-rag-pipeline.md) + [inline-citation-rag-pattern](../../engineer/engineering/inline-citation-rag.md)
- Agent architecture via [agent-architecture-patterns-summary](../../ai-engineer/methodology/agent-architecture-patterns.md)
- risk reference via [ai-product-launch-lessons-summary](../../engineer/lessons/failure-ai-product-launch-lessons.md) + [incident-postmortem-summary](../../engineer/lessons/failure-incident-postmortem.md)

## Core viewpoints

- **The structure contract is the most under-invested phase of AI product development.** Teams rush to build the RAG pipeline and the streaming UI before they have defined the input/output schema. The result: the prompt, the retrieval, and the UI are all built against an implicit contract that changes mid-development, causing cascading rework. A 2-day investment in defining the exact JSON schema for every input and output state pays back 10x in reduced integration churn.

- **RAG is not a feature — it is a quality architecture decision that determines the product's ceiling.** A product that uses long-prompt context stacking works beautifully in the demo with 3 documents and breaks down at 50 documents because the model's attention dilutes. RAG is harder to implement but scales sublinearly with knowledge growth. The choice between RAG and long-prompt is not about the MVP — it is about whether the product can survive its own success.

- **Grayscale rollout for AI products is not about infrastructure risk — it is about model behavior risk.** Traditional grayscale (canary deployments) tests whether the servers crash. AI grayscale tests whether the model's output quality degrades when exposed to real user diversity. A new model version that passes 100% of automated evals can still produce nonsensical answers for 5% of real users. The grayscale must include quality gates, not just error-rate gates.

- **The feedback loop is the product's learning engine, not a support ticket system.** User feedback (thumbs up/down, regenerations, edits) is the richest source of training data for improving the AI product. But most teams treat feedback as a support queue — they respond to individual complaints and ignore the aggregate signal. The correct approach: weekly review of feedback clusters to identify systematic failures, feed representative examples into the evaluation set, and use them to drive prompt and model improvements.

- **Streaming is user experience, not performance optimization.** The primary value of streaming is not reducing total latency (the answer takes the same time to generate) — it is reducing perceived latency and giving the user a sense of progress. A 10-second response that streams tokens from second 0.5 feels faster than a 5-second response that appears all at once. This is a psychological fact, not a technical one, and it should drive the decision to stream even for relatively fast responses.

## Key info

- **5-phase AI product launch methodology**: Phase 1 (structure contract: define input/output JSON schema, state machine, error states, 2-3 days), Phase 2 (RAG > long prompt: build retrieval pipeline, evaluate recall@10 >90%, 1-2 weeks), Phase 3 (streaming: SSE with `done: true` frame, `AbortController` differentiation, 3-5 days), Phase 4 (editable stream-back: user can edit the streaming output in real-time, the model adapts to mid-stream edits, 1-2 weeks), Phase 5 (grayscale + feedback loop: 1%→10%→50%→100% with quality gates, thumbs up/down + regeneration tracking, 2-4 weeks). The YiAi BRD Agent followed this methodology and launched in ~6 weeks.
- **RAG vs long-prompt decision framework**: RAG (scales to millions of documents, requires vector DB + embedding pipeline, latency 1-3s, best for knowledge-intensive applications with frequent updates). Long-prompt (works up to ~50 documents, no retrieval infrastructure, latency depends on model, best for small stable knowledge bases). The crossover point: if your knowledge base has >50 documents or updates weekly, RAG is the correct choice. If you have <20 documents and they update quarterly, long-prompt is simpler and sufficient.
- **AI grayscale quality gates**: beyond traditional error rate and latency, AI grayscale adds: (1) thumbs-up ratio (target >70%, if <60% at any tier, rollback), (2) regeneration rate (target <15%, if >25%, rollback), (3) edit rate (target <20%, if >30%, rollback), (4) abandonment rate (target <10%). These metrics capture user-perceived quality, not just system health.
- **Feedback loop mechanics**: (1) capture every thumbs up/down with full request/response context, (2) weekly cluster analysis: group similar negative feedback by embedding similarity, identify top 3 failure patterns, (3) add top 10 representative negative examples to the golden evaluation set, (4) run evaluation, fix prompt or retrieval, (5) track failure pattern recurrence rate. A team that closes the loop weekly improves 4x faster than one that reviews feedback quarterly.
- **Editable stream-back pattern**: the user sees the streaming response and can edit any part of it in real-time. The model detects the edit event, re-evaluates from the edit point, and continues streaming from the corrected text. The UX requirement: the edit cursor must be responsive, and the model must not overwrite the user's edit (the edit point is a pinned prefix). Used in YiAi BRD Agent: user edits a generated BRD section, and the model adapts the rest to be consistent with the edit.

## Scenario

New AI product / feature (BRD agent / Copilot / conversational query / auto-generation) launching from 0 to 1, PM + architect + engineer need to go through structure contract → knowledge source → streaming → editable stream-back → grayscale → feedback loop. This entry aggregates BRD agent 5-phase launch methodology, RAG pipeline, Agent architecture patterns, launch risk lessons into a 2-hop path, avoiding "design by intuition / no feedback after launch / grayscale not converging". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `projects/YiAi/` | [adr-brd-agent-launch.md](../../tech-lead/decisions/yiai/brd-agent-launch.md) · [adr-rag-evaluation-infra.md](../../tech-lead/decisions/yiai/rag-evaluation-infra.md) · [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md) · [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) · [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai/knowledge-watcher-deployment.md) |
| `methodology/ai-specific/` | [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) |
| `methodology/engineering-patterns/` | [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md) · [sse-streaming-pattern.md](../../engineer/architecture-design/sse-streaming.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-llm-phase-five-win.md](../../engineer/lessons/win-yiai-llm-phase-five.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) — launch risk reference |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `work/processes/` | [shared-client-vendor-rollout.md](../../engineer/engineering/shared-client-vendor-rollout.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) |
| `product/strategy/` | [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) |

## Action recommendations

1. **Structure contract first**: define input / output / intermediate state schema; contract first avoids "tune then change contract" rework. 
2. **RAG > long prompt**: knowledge source via RAG ([inline-citation-rag-pattern](../../engineer/engineering/inline-citation-rag.md)) over long prompt stacking context; easier incremental update + evaluation. 
3. **streaming**: must run [sse-streaming-pattern](../../engineer/architecture-design/sse-streaming.md), done frame guard + finally releaseLock. 
4. **editable stream-back**: user-edited content stream back to knowledge base ([knowledge-watcher ADR](../../tech-lead/decisions/yiai/knowledge-watcher-deployment.md)) — forming feedback loop. 
5. **grayscale**: 1% → 10% → 50% → 100%; each tier evaluation set gate + monitoring triad ([yiai-llm-phase-three-win](../../engineer/lessons/win-yiai-llm-phase-three.md)) . 
6. **feedback loop**: user feedback → classify (recall / latency / safety) → improve → next grayscale round; closed-loop or not decides product life/death. 
7. **safety**: via [prompt-injection-defense-summary](../../ai-engineer/methodology/prompt-injection-defense.md) + [hallucination-mitigation-summary](../../ai-engineer/methodology/hallucination-mitigation.md). 
8. **risk reference**: scan [ai-product-launch-lessons-summary](../../engineer/lessons/failure-ai-product-launch-lessons.md) avoid repeating mistakes. 
9. **product alignment**: align with product roadmap ([now-next-later-roadmap](../../executive/strategy/now-next-later-roadmap.md)) = AI serves product strategy. 

## Anti-patterns

- **Demo-driven development: optimizing for the 5-minute demo rather than the 8-hour workday.** The demo shows a user asking one question and getting one perfect answer. The real product has a user asking 20 questions in a session, with the model losing context, hallucinating on edge cases, and the user needing to edit and regenerate. The demo is a sales tool; the product must be designed for the 20th question, not the first one.

- **Launching without an evaluation set that represents real user diversity.** A hand-curated evaluation set of 50 "typical" questions will give a false sense of quality. Real users ask questions in broken English, with typos, with domain-specific jargon, and with ambiguous intent. The evaluation set must be sourced from real user queries (or realistic simulations) and must cover the long tail of input quality, not just the clean head.

- **Treating the model as the product.** The model (GPT-4, Claude, Gemini) is a component, not the product. Building the product around a specific model's strengths and weaknesses creates vendor lock-in and makes model swaps prohibitively expensive. The product architecture should treat the model as a replaceable service, with the product's value coming from the prompt engineering, the knowledge base, and the UX, not from the model's specific capabilities.

- **Editable output without stream-back to the knowledge base.** When users can edit AI-generated content but those edits are not captured and fed back into the system, the product is discarding its most valuable data. The user's edit is the ground truth of what the output should have been. Every edit should be logged, reviewed, and used to improve the prompt, the retrieval, or the knowledge base itself.

- **Grayscale that gates on infrastructure metrics but ignores quality metrics.** A grayscale stage that says "error rate < 1%, latency < 3s, proceed to 50%" is missing the critical dimension: output quality. The gate must include: hallucination rate, task success rate, and user acceptance rate. An AI product can be fast, available, and completely wrong. Fast wrong answers are worse than slow wrong answers because users trust them more.

## Related

- similar journey: [../../engineer/projects/build-a-rag-pipeline.md](../../engineer/projects/build-a-rag-pipeline.md) — RAG pipeline entry
- similar journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — pre-launch ADR decision
- similar journey: [../../engineer/infrastructure/roll-out-a-migration.md](../../engineer/infrastructure/roll-out-a-migration.md) — grayscale methodology
- upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit
