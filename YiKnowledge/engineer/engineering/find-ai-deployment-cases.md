---
title: Find AI deployment cases
aliases:
- I want to find AI deployment cases
- AI deployment cases entry
tags:
- journeys
- AI
- deployment
- RAG
- Agent
- llm
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: context is reachable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../product-manager/strategy/README.md
- ../../ai-engineer/methodology/README.md
- ../../engineer/projects/yiai/README.md
- ../../ai-engineer/platform/README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to find AI deployment cases

> **As an** engineer, **I want to** find ai deployment cases, **so that** context is reachable.

> "How AI is used in business" reaches cases, methodology, tech stack, this team's landing within 2 hops.

## Summary
- Industry case library + AI methodology (RAG/Agent/Prompt/Eval) + tech stack comparison + this team's landing four diagrams
- YiAi BRD Agent and overseas after-sales AI storyline serve as internal landing reference
- AI launch failure lessons as reverse backstop

## Core viewpoints

### 1. AI deployment knowledge is scattered across categories by design, not by accident

The knowledge about AI deployment spans `industry/`, `methodology/`, `platform/`, and `projects/` because AI deployment is inherently multi-dimensional. Industry cases teach what worked, methodology teaches how to design, platform comparisons teach what to use, and project stories teach how this team did it. Consolidating all AI knowledge into a single category would lose the domain-specific context that each category provides. The journey entry is the stitching mechanism, not a replacement for the categories.

### 2. A 2-hop reachability constraint forces the knowledge graph to be navigable

Every relevant file must be reachable within 2 hops from the entry point. This constraint is not arbitrary -- it ensures that the knowledge graph is dense enough to be useful. If a file requires 3 or more hops to reach, the entry point is not a true entry point. The 2-hop constraint is a design rule for knowledge graph architecture.

### 3. Failure cases are as important as success cases for AI deployment

The inclusion of AI launch failure lessons as a "reverse backstop" is not a nice-to-have -- it is a structural requirement. Success cases show what to do; failure cases show what not to do. Without failure cases, the entry point presents an incomplete picture that biases toward overconfidence. The failure path is a mandatory hop, not an optional supplement.

### 4. Internal landing references provide credibility that external case studies cannot

External case studies describe what worked for other organizations under different constraints. Internal project stories (YiAi BRD Agent, overseas after-sales AI) describe what worked for this team under these constraints. The internal references are more actionable because they account for the team's specific technology stack, organizational context, and deployment environment.

### 5. The entry point must serve both the first-time explorer and the returning practitioner

A new engineer exploring AI deployment needs to understand the landscape: what categories exist, what each contains, and how to navigate. A returning practitioner needs to quickly find a specific file they used before. The 2-hop table serves both audiences: it maps the territory for the explorer and provides direct links for the practitioner.

## Key info

- **AI deployment case taxonomy (4 categories with Yi-family mapping)**: (1) RAG (Retrieval-Augmented Generation) — knowledge-grounded Q&A, document search, enterprise search; Yi-family: YiAi RAG (hybrid retrieval + inline citation), YiVad knowledge leaf view RAG integration; (2) Agent — tool-using autonomous systems, multi-step reasoning, workflow automation; Yi-family: YiAi BRD Agent (BRD generation from user requirements), YiVad aiChat agent loop (followUp queue, QueueMode, terminate flag); (3) Prompt Engineering — structured prompt design, few-shot, system prompt optimization; Yi-family: 7 prompt templates (BRD/RAG/Agent/SQL/Code Review/Translation/Weekly Report), BRD generation prompt with 3 few-shot examples; (4) Fine-tuning/Alignment — RLHF, DPO, instruction tuning; Yi-family: not yet implemented (decision tree in place, no fine-tuning done). Each category has a methodology entry, a platform comparison, and a Yi-family win/gotcha document.
- **AI deployment maturity model (5 levels)**: Level 1 (Experiment) — manual prompt testing, no eval set, no production deployment; Level 2 (Prototype) — structured prompts, basic eval set (50-100 examples), internal deployment; Level 3 (Production) — eval-driven development, CI/CD for prompts, canary releases, user feedback loop; Level 4 (Scaled) — multi-provider routing, A/B testing, cost optimization, prompt caching; Level 5 (Enterprise) — fine-tuning pipeline, custom models, compliance certification, SLA-backed. The Yi-family projects: YiAi RAG at Level 2-3 (eval set exists, limited CI gating), YiAi BRD Agent at Level 2 (eval set exists, per-PR evaluation), YiVad/YiPet aiChat at Level 1-2 (online metrics only, no offline eval). The gap to Level 3: statistical drift detection, automated CI gating on eval regression.
- **Industry AI deployment case library (by sector)**: After-sales/service — AI-powered ticketing, repair recommendation, service advisor assistant; Yi-family: YiAi BRD Agent generates after-sales BRDs, aiAfterSalesCases.md documents industry cases; Customer service — AI chatbot, agent assist, sentiment analysis; Yi-family: YiVad/YiPet aiChat, aiCustomerServiceCases.md; Manufacturing — predictive maintenance, quality inspection, supply chain optimization; Yi-family: no direct cases; Finance — fraud detection, risk assessment, regulatory compliance; Yi-family: no direct cases; Healthcare — clinical decision support, medical coding, patient triage; Yi-family: no direct cases. The case library is strongest in after-sales and customer service (the Yi-family's primary domains); other sectors are covered by external industry reports.
- **AI deployment failure mode taxonomy (6 common patterns)**: (1) Hallucination in production — model generates plausible but incorrect output that users act on; prevention: retrieval grounding, citation enforcement, user education; (2) Jailbreak/prompt injection — user bypasses safety constraints; prevention: input sanitization, system prompt hardening, output filtering; (3) Cost overrun — LLM API costs exceed budget due to unexpected usage; prevention: rate limiting, cost monitoring, prompt caching; (4) Latency degradation — P95 latency exceeds user tolerance; prevention: streaming, model selection by task complexity, fallback to simpler models; (5) Evaluation drift — eval set no longer represents production distribution; prevention: monthly eval set refresh, production sampling; (6) Provider lock-in — single provider dependency creates risk; prevention: multi-provider routing, abstraction layer, standard interfaces. The Yi-family projects have encountered patterns 1, 3, and 6; patterns 2, 4, and 5 are potential risks.
- **Yi-family AI deployment landscape (2026-08)**: YiAi — 3 AI features deployed: RAG (hybrid retrieval + inline citation), BRD Agent (LLM-as-judge evaluation), aiChat (conversational AI); YiVad — 2 AI features deployed: aiChat (port from YiWeb), knowledge leaf RAG integration (planned); YiPet — 1 AI feature deployed: aiChat (port from YiVad patterns). All AI features are served by YiAi backend; YiVad and YiPet are clients. The primary LLM provider is Anthropic (Claude), with multi-provider routing (OpenAI/Google/Ollama) in evaluation. The total AI API cost is < $100/month (development usage). No AI features are deployed to external users; all are internal team tools.

## Scenario

When new business needs to assess AI feasibility, tech selection, or overseas multi-language scenario design, the AI-related leaves scattered across `industry/`, `methodology/ai-specific/`, `tech/ai-platform/`, `projects/YiAi/` must be strung into a single diagram. This entry is that diagram.

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `../../product-manager/industry-cases` (parts to be added) | ai-customer-service-cases.md · ai-after-sales-cases.md · [case-study-template.md](../../product-manager/strategy/case-study.md) |
| `../../ai-engineer/methodology` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) |
| `../../ai-engineer/platform` + `../../ai-engineer/foundations` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [transformer-architecture-summary.md](../../ai-engineer/foundations/transformer-architecture.md) |
| `../../engineer/projects/yiai` | [onboarding.md](../../new-hire/onboarding/yiai/onboarding.md) · [stories/overseas-after-sales-ai-brd-agent/](../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent) · [stories/ai-chat-function/](../../engineer/projects/yiai/stories/ai-chat-function) |
| `../../engineer/lessons/failures` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) |

## Action recommendations

1. First read `methodology/ai-specific/rag-design-patterns-summary.md` and `agent-architecture-patterns-summary.md` to pick architecture route
2. For tech-stack selection, check existing comparisons in `tech/ai-platform/` (LLM / inference engine / vector DB)
3. Reference this team's `projects/YiAi/stories/overseas-after-sales-ai-brd-agent/` multi-language landing path
4. Before launch, must check `methodology/ai-specific/llm-evaluation-methods-summary.md` to land an evaluation plan
5. Retrospect `lessons/failures/ai-product-launch-lessons-summary.md` to avoid repeated pitfalls
6. Sediment new cases into `industry/use-cases/` and append a row to this entry's quick-lookup table

## Anti-patterns

- **Starting AI deployment exploration from a single category.** Reading only industry cases produces a distorted view -- what worked for others, but not why it worked or how to implement it. Reading only methodology produces theoretical knowledge without practical grounding. Reading only platform comparisons produces technology knowledge without deployment context. The entry point exists to prevent single-category exploration -- every path must cross at least two categories.

- **Skipping the failure cases before launching.** The AI launch failure lessons are the last hop in the entry point for a reason: they are the final check before deployment. Teams that read success cases and methodology but skip the failure lessons repeat known mistakes. The failure path is not optional -- it is the last line of defense against overconfidence.

- **Treating the entry point as a static document.** The entry point includes an action recommendation to "sediment new cases into industry/use-cases/ and append a row to this entry's quick-lookup table." If the entry point is not updated when new knowledge is created, it becomes stale and untrustworthy. The entry point is a living document that must reflect the current state of the knowledge graph.

- **Using the entry point as a replacement for reading the source files.** The 2-hop table provides links, not summaries. Relying on file names and inferred content without reading the actual files is cargo-cult knowledge acquisition. The entry point is a navigation tool, not a knowledge substitute. Every link must be followed and read to gain genuine understanding.

- **Designing AI deployment evaluations without an evaluation methodology.** The entry point includes `llm-evaluation-methods-summary.md` as a required hop. Deploying AI without an evaluation plan is deploying without a way to know if it works. The evaluation methodology must be in place before deployment, not retrofitted after. The entry point enforces this by making the evaluation file a mandatory checkpoint.

## Related

- similar journey: [../lessons/learn-pm-frameworks.md](../lessons/learn-pm-frameworks.md) — AI product dedicated metrics, UX patterns
- similar journey: [./check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — AI engineering pitfalls
- upstream: [../../knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — journey design basis
- downstream: [../../knowledge-curator/diagrams/knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) — knowledge map
