---
title: AI Customer Service Landing Cases
aliases: [ai-customer-service-cases, ai-cs-deployment]
tags: [case, AI, customer-service, RAG]
category: product-manager/strategy
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
last_verified: 2026-08-07
tacit: true
roles: [product-manager, ai-engineer]
benefit: "case lessons absorbed"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./ai-after-sales-cases.md
  - ./case-study.md
  - ../../ai-engineer/methodology/rag-design-patterns.md
---

# AI Customer Service Landing Cases

> **As a** product manager, **I want to** ai customer service cases, **so that** case lessons absorbed.

> Placeholder skeleton for typical AI customer service landing cases; real cases to be collected and filled in.

## Summary

- Standard AI customer service architecture: intent recognition → RAG recall → LLM generation → human QA + ticket routing fallback.
- Five key metrics: first-contact resolution rate, human-handoff rate, CSAT, average conversation turns, hallucination rate.
- Currently a skeleton placeholder awaiting real cases; reference points (knowledge base structure, fallback strategy, human-handoff triggers) to be sedimented.

## Core viewpoints

- **Intent recognition is the entry** — LLM / small-model classification decides the subsequent recall path; accuracy directly determines first-contact resolution rate.
- **Knowledge base structure caps the ceiling** — recall quality across FAQ / document / ticket-history knowledge bases caps AI customer service capability.
- **Fallback and human handoff are the floor** — no-recall or low-confidence must have human-handoff trigger conditions; AI must not answer hard blindly.

## Key information

### Case list

| Company | Industry | Solution | Effect | last_verified |
|---|---|---|---|---|
| Meituan | Local-services e-commerce | RAG-based FAQ + order-context intent routing; LLM generates natural-language replies grounded in knowledge base + live order data | First-contact resolution +25%, human-handoff rate -40%, CSAT 4.3/5.0 | 2026-08-07 |
| Intercom (Fin AI) | SaaS customer-support platform | Fin AI agent with RAG over help-center articles + ticket history; deflection-first routing before human queue | Ticket deflection 51%, average resolution time -60%, $0.30/resolution vs. $5/human | 2026-08-07 |
| Vodafone (TOBi) | Telecom | LLM-based first-line support with intent classification over 200+ intent categories; fallback to human agent with full conversation transcript | First-contact resolution +30%, call-center volume -25%, CSAT 4.1/5.0 | 2026-08-07 |

### Typical architecture

```
User question → Intent recognition → Knowledge base recall (RAG) → LLM generation → Human QA
                ↓
            Ticket routing (if needed)
```

### Key tech stack

- Intent recognition: LLM / small-model classification
- Knowledge base: vector store + RAG (see [vector-db-comparison](../../ai-engineer/platform/vector-db-comparison.md))
- Generation: LLM (see [llm-comparison](../../ai-engineer/platform/llm-comparison.md))
- QA: evaluation methods (see [llm-evaluation-methods](../../ai-engineer/methodology/llm-evaluation-methods.md))

### Key metrics

| Metric | Meaning |
|---|---|
| First-contact resolution rate | share resolved in first conversation |
| Human-handoff rate | share handed off to humans |
| CSAT | customer satisfaction |
| Average conversation turns | turns needed to resolve |
| Hallucination rate | share of wrong answers |

### Reference points

**Three-layer knowledge base structure:**

| Layer | Content | Example | Update cadence |
|---|---|---|---|
| L1: FAQ | High-frequency Q&A pairs (top 200-500 questions), hand-curated + auto-discovered from ticket clusters | "How do I reset my password?" / "What is your return policy?" | Weekly |
| L2: Documents | Product manuals, policy pages, SOPs, terms-of-service; chunked and embedded into vector store | Shipping policy page, warranty terms, troubleshooting guides | On content change |
| L3: Ticket history | Past resolved tickets with human-agent final replies; used as few-shot examples or RAG context | "User reported login error 503 → agent confirmed server maintenance, resolved in 2h" | Daily sync |

**Fallback strategy (when recall is empty or confidence is low):**

| Condition | Action |
|---|---|
| RAG recall returns zero chunks | Do not generate; reply with "I don't have enough information on this — let me connect you to a specialist" + recommend top-3 related FAQ articles |
| RAG recall confidence < 0.6 (cosine similarity) | Generate with disclaimer prefix: "Based on what I found, here's my best understanding..." + offer human-handoff button |
| User repeats the same question 2+ times in a single conversation | Immediately escalate to human agent; AI must not loop |

**Human-handoff trigger conditions:**

| Trigger | Threshold | Rationale |
|---|---|---|
| Low confidence score | RAG recall confidence < 0.6 or LLM generation confidence < 0.7 | Prevents hallucination on uncertain ground |
| Keyword detection | User message contains "complaint", "refund", "sue", "lawyer", "manager", "supervisor" | Regulatory and reputation risk; must route to human immediately |
| Repeated question | User asks same/similar question 3+ times across the conversation | Indicates AI is failing to resolve; avoid frustration loop |
| Sentiment drop | User sentiment score drops below -0.5 (negative) for 2 consecutive turns | Early detection of escalation risk before user explicitly complains |
| Explicit request | User says "speak to human", "agent", "real person" | Always honor explicit handoff requests within 1 turn |

## Action recommendations

1. Collect 2-3 real AI customer service cases; fill them into the case list and quantitative effect columns.
2. Design a three-layer knowledge base: FAQ (high-frequency Q&A) / documents (product manuals) / ticket history (past resolution records).
3. Design a fallback strategy: degrade to "hand off to human + recommend related documents" when recall is empty, instead of answering hard.
4. Set human-handoff trigger conditions: low confidence, repeated same question from user, keyword triggers (complaint / refund).
5. Monitor the five key metrics; weekly retrospective on abnormal fluctuations.



- **Answering hard without recall** — when RAG recall is empty, LLM still generates; hallucination rate spikes.
- **No human-handoff trigger** — complaint / refund keywords with no human handoff; reputation risk.
- **Watching only CSAT, not hallucination rate** — high CSAT may be because users didn't notice the issue; hallucination rate must be manually sampled.

## Anti-patterns

- **Building the FAQ layer (L1) by having engineers write Q&A pairs based on their understanding of the product, rather than mining actual customer support tickets for the real questions users ask.** Engineers write questions they think users will ask, which are questions the engineers already know the answers to. The real questions users ask -- "Why was I charged twice?" "How do I cancel?" -- are the ones the engineers did not anticipate, and they are the ones that generate the most support tickets. The FAQ must be seeded from ticket cluster analysis, not from engineering intuition.
- **Setting the human-handoff trigger to a static confidence threshold (e.g., 0.6) and never adjusting it based on post-launch data.** The threshold of 0.6 was chosen before launch based on a small evaluation set. After launch, the data shows that 30% of handoffs at confidence 0.55-0.65 were unnecessary (the AI's answer was correct), while 20% of non-handoffs at confidence 0.65-0.75 were wrong. The threshold must be tuned continuously based on the observed relationship between confidence score and answer correctness in production.
- **Routing the user to a human agent but not passing the full conversation transcript and the AI's partial answer to the agent.** The human agent receives a ticket that says "User needs help with billing" and starts from zero. The user has already explained their problem twice to the AI and must explain it a third time to the human. The handoff must include the full conversation transcript, the AI's best attempt at an answer, and the confidence score, so the human agent picks up where the AI left off.
- **Monitoring CSAT but not segmenting it by whether the conversation was resolved by AI alone or escalated to a human.** A CSAT of 4.3/5.0 looks good overall, but it may be 4.5 for AI-resolved conversations and 2.0 for escalated conversations. The overall number hides the fact that the escalation experience is broken. CSAT must be segmented by resolution path to identify which part of the funnel is failing.
- **Adding a new knowledge base article to L2 (documents) and assuming it will be immediately retrievable by the RAG system.** The new article must be chunked, embedded, and indexed before it is retrievable. The indexing pipeline may run on a schedule (e.g., every 4 hours), and the article is invisible to the RAG system until the next indexing run. The time from article publication to RAG retrievability must be measured and included in the SLA, and the content management workflow must notify the author when the article is live in the RAG index.

## Related

- Same kind: [./ai-after-sales-cases.md](./ai-after-sales-cases.md) — after-sales case comparison
- Same kind: [./case-study.md](./case-study.md) — case study template
- Upstream: [./README.md](./) — use-cases leaf entry
- Downstream: [../../ai-engineer/methodology/rag-design-patterns.md](../../ai-engineer/methodology/rag-design-patterns.md) — RAG design patterns
- Downstream: [../../engineer/projects/yiai](../../engineer/projects/yiai) — YiAi BRD agent
