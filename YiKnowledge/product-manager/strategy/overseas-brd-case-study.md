---
title: Overseas After-Sales BRD Agent Case Study
aliases:
- overseas-brd-case-study
- overseas-brd-agent
- brd-agent-case
- after-sales-brd-ai
tags:
- Case study
- AI
- BRD
- After-Sales
- Overseas
- multilingual
- compliance
category: product-manager/strategy
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- product-manager
- ai-engineer
- executive
benefit: "PMs can learn from a real-world AI agent deployment for overseas after-sales BRD generation, including architecture decisions, compliance challenges, and measurable results"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./ai-after-sales-cases.md
  - ./case-study.md
  - ./ai-customer-service-cases.md
  - ../frameworks/write-a-brd.md
  - ../../engineer/projects/yiai/README.md
  - ../../executive/industry/reports/caict-ai-whitepaper.md
tacit: false
---

# Overseas After-Sales BRD Agent Case Study

> **As a** product manager, **I want to** understand how an AI agent was deployed to generate multilingual, regulation-compliant BRDs for overseas after-sales service centers, **so that** I can apply the same patterns, avoid the same mistakes, and make the build-vs-buy decision for similar AI agent deployments.

> Overseas after-sales service centers face a unique challenge: they must produce Business Requirements Documents (BRDs) for each market, each in the local language, each compliant with local regulations. This is a knowledge-intensive, repetitive, and error-prone process. The YiAi BRD agent was designed to solve this problem by combining a structured knowledge base with a multi-provider LLM architecture.

## Summary

- The problem: overseas after-sales service centers need BRDs that are multilingual, compliant with local regulations, and consistent with global standards. Manual BRD generation takes 2-4 weeks per document, has high error rates, and requires scarce domain expertise.
- The solution: a RAG-based AI agent that combines a structured knowledge base (regulations, templates, best practices) with multi-provider LLM support (GPT-4, Claude, DeepSeek, Qwen) to generate BRDs in 2-4 hours with 90%+ compliance accuracy.
- Key results: BRD generation time reduced from 2-4 weeks to 2-4 hours (90%+ reduction). Compliance error rate reduced from 15-20% to under 5%. Domain expert time freed from document generation to document review.
- The critical insight: domain knowledge is the moat. The AI model is interchangeable; the structured knowledge base of regulations, templates, and best practices is the defensible asset. Compliance workflow is the differentiator -- the agent does not just generate text; it enforces a compliance checklist.
- Key lessons: hybrid search (semantic + keyword) is mandatory for regulation-heavy domains. Multi-model architecture is required for multilingual support (different models excel at different languages). Evaluation-driven development (measuring retrieval recall, answer faithfulness, and compliance accuracy) is essential, not optional.

## Core viewpoints

### 1. Domain knowledge is the moat, not the model

The most common mistake in AI agent deployment is focusing on model selection while neglecting the knowledge base. For the BRD agent, the model (GPT-4, Claude, DeepSeek) is interchangeable -- any of them can generate a BRD. The moat is the structured knowledge base: categorized regulations by country, validated templates by service type, vetted best practices by scenario. When a competitor can switch models with an API key change, the knowledge base is the only defensible asset. Invest 80% of the effort in the knowledge base, 20% in the model and prompts.

### 2. Compliance workflow is the differentiator, not generation quality

A BRD agent that generates beautiful text but misses a regulatory requirement is worse than useless -- it is dangerous. The agent's compliance workflow is the differentiator: (1) before generation, the agent identifies applicable regulations based on the target market and service type; (2) during generation, the agent cross-references each section against the compliance checklist; (3) after generation, the agent produces a compliance audit trail showing which regulations were addressed and how. This workflow turns the agent from a text generator into a compliance tool. Competitors who focus on generation quality without compliance workflow will produce faster but riskier documents.

### 3. Multi-model architecture is required for multilingual support

No single model is best at all languages. GPT-4 excels at English and European languages but is weaker for Chinese, Japanese, and Arabic. Qwen and DeepSeek excel at Chinese and Asian languages. Claude excels at structured reasoning and compliance checking. The BRD agent uses a multi-model architecture: a routing layer selects the best model for each task (language generation, compliance checking, quality review), and multiple models can be used in sequence (generate with one model, review with another). This adds complexity but is necessary for multilingual quality.

### 4. Evaluation-driven development is essential, not optional

AI agent development without evaluation is guesswork. The BRD agent team established three evaluation metrics from day one: (1) retrieval recall: does the agent retrieve the right regulations for the target market? (2) answer faithfulness: does the generated BRD accurately reflect the retrieved knowledge? (3) compliance accuracy: does the BRD address all applicable regulations? These metrics are measured on every change to the knowledge base, prompts, or model selection. Changes that degrade any metric are rejected. Without this discipline, the agent drifts and quality degrades silently.

## Key info

### Problem context

| Dimension | Before the BRD agent | After the BRD agent |
|---|---|---|
| BRD generation time | 2-4 weeks per document | 2-4 hours per document |
| Compliance error rate | 15-20% (caught in review) | Under 5% (caught in generation) |
| Domain expert involvement | Full-time on document generation | Review and approval only |
| Language support | Manual translation, 2-3 languages | Multi-model, 10+ languages |
| Consistency across markets | Low (each expert writes differently) | High (template-enforced structure) |
| Audit trail | Manual, inconsistent | Automated compliance audit trail |

### Architecture

| Component | Technology | Purpose |
|---|---|---|
| Knowledge base | Structured documents (regulations, templates, best practices) | Source of domain knowledge |
| Vector database | Milvus / Pinecone | Semantic search for relevant knowledge |
| Keyword search | Elasticsearch | Exact match for regulation codes and references |
| Hybrid retrieval | Semantic + keyword fusion | Ensures both context-aware and exact-match retrieval |
| LLM routing | Multi-provider (GPT-4, Claude, DeepSeek, Qwen) | Best model for each language and task |
| Generation pipeline | LangChain / custom orchestration | Multi-step: retrieve → generate → review → compliance check |
| Compliance engine | Rule-based checklist + LLM verification | Ensures all applicable regulations are addressed |
| Human review | Web interface for domain expert review | Final approval before document delivery |

### Evaluation results

| Metric | Baseline (manual) | Agent v1 | Agent v2 (with hybrid search) | Target |
|---|---|---|---|---|
| Retrieval recall (top-10) | N/A | 72% | 91% | 90%+ |
| Retrieval recall (top-20) | N/A | 85% | 96% | 95%+ |
| Answer faithfulness | N/A | 82% | 89% | 90%+ |
| Compliance accuracy | 80-85% | 78% | 93% | 90%+ |
| Generation time (per BRD) | 2-4 weeks | 8 hours | 2-4 hours | Under 4 hours |
| Human review time (per BRD) | N/A | 4 hours | 1-2 hours | Under 2 hours |

### Key lessons learned

1. **Hybrid search is mandatory for regulation-heavy domains**: Semantic search alone misses exact regulation references (e.g., "Article 13, Section 4.2"). Keyword search alone misses contextually relevant regulations that use different terminology. Hybrid search (semantic + keyword fusion) improved retrieval recall from 72% to 91%.

2. **Evaluation-driven development prevents silent quality degradation**: The agent's compliance accuracy dropped from 85% to 78% after a knowledge base update because a new regulation conflicted with an existing template. The evaluation pipeline caught this before the agent was deployed to production. Without evaluation, the error would have been discovered by a customer.

3. **Prompt caching saves 30-40% of LLM cost**: The BRD agent uses the same system prompts and knowledge base chunks for every generation. Enabling prompt caching on the LLM API (Anthropic's prompt caching, OpenAI's cache) reduced per-generation cost by 30-40%. This is a must-have for any production AI agent.

4. **Multi-model routing is worth the complexity**: The routing layer adds engineering complexity but delivers measurable quality improvements. Chinese-language BRDs generated by Qwen were rated 15% higher by domain experts than those generated by GPT-4. English-language BRDs generated by GPT-4 were rated 10% higher. The routing layer is not premature optimization; it is a quality requirement.

5. **The human-in-the-loop is not a weakness**: The agent does not replace domain experts; it amplifies them. Domain experts spend their time reviewing and approving, not writing from scratch. The review step is not a sign that the agent is incomplete; it is a compliance requirement and a quality safeguard. The goal is to reduce review time, not eliminate it.

### When to apply this pattern vs. when not to

**Apply this pattern when:**
- The domain has a structured, stable knowledge base (regulations, standards, templates).
- The output requires compliance checking against a known set of rules.
- The output is in multiple languages and requires different models for different languages.
- The domain experts are scarce and their time is better spent on review than generation.
- The output quality can be measured with automated evaluation (retrieval recall, faithfulness, compliance accuracy).

**Do NOT apply this pattern when:**
- The domain knowledge is tacit, unstructured, or rapidly changing (the knowledge base is the foundation; without it, the agent is just a chatbot).
- The output does not require compliance checking (the compliance workflow is the differentiator; without it, the agent is just a text generator).
- The output is in a single language and a single model is sufficient (the multi-model routing adds complexity that is not justified).
- The use case is better served by a simple template fill than a full AI agent (over-engineering).

## Action recommendations

1. Invest 80% of the initial effort in the knowledge base: structure, categorize, and validate the domain knowledge. The model is interchangeable; the knowledge base is the moat.
2. Establish evaluation metrics from day one: retrieval recall, answer faithfulness, and domain-specific accuracy. Measure on every change. Reject changes that degrade metrics.
3. Implement hybrid search (semantic + keyword) for any domain with exact references (regulation codes, article numbers, standard IDs). Semantic search alone is not enough.
4. Use a multi-model architecture if the output is multilingual. Test each model on each language. Route to the best model for each task.
5. Build a compliance workflow that is more than generation: identify applicable rules, cross-reference during generation, produce an audit trail after generation.
6. Enable prompt caching on the LLM API. For a RAG agent that uses the same system prompts and knowledge base chunks, this saves 30-40% of cost.
7. Keep the human-in-the-loop for review and approval. The goal is to reduce review time, not eliminate it. The review step is a quality safeguard, not a weakness.

## Anti-patterns

- **Focusing on model selection while neglecting the knowledge base** -- the model is a commodity. The knowledge base is the differentiator. A great model with a poor knowledge base produces confident-sounding wrong answers.
- **Deploying without evaluation** -- AI agent quality degrades silently. Without automated evaluation on every change, you will not know when the agent starts producing worse output.
- **Semantic search only for regulation-heavy domains** -- exact regulation references require exact keyword matching. Semantic search alone will miss Article 13, Section 4.2. Hybrid search is mandatory.
- **Single-model architecture for multilingual output** -- no single model is best at all languages. Test each model on each language. The routing layer is worth the complexity.
- **Eliminating the human review step** -- the agent is an amplifier, not a replacement. The human review is a compliance requirement and a quality safeguard. The goal is to make review faster, not to eliminate it.
- **Building a general-purpose agent when a domain-specific agent is needed** -- a general-purpose BRD agent cannot handle the specific compliance requirements of overseas after-sales. Domain specificity is the value proposition.

## Related

- Same category: [./ai-after-sales-cases.md](./ai-after-sales-cases.md) -- broader AI after-sales implementation case studies
- Same category: [./case-study.md](./case-study.md) -- case study template for structured knowledge capture
- Same category: [./ai-customer-service-cases.md](./ai-customer-service-cases.md) -- AI customer service case studies
- Upstream: [../frameworks/write-a-brd.md](../frameworks/write-a-brd.md) -- BRD writing framework
- Upstream: [../../engineer/projects/yiai/README.md](../../engineer/projects/yiai/README.md) -- YiAi project overview
- Cross-reference: [../../executive/industry/reports/caict-ai-whitepaper.md](../../executive/industry/reports/caict-ai-whitepaper.md) -- China AI regulatory landscape affecting overseas deployments
- References: Internal YiAi BRD agent project documentation; Anthropic -- *Prompt Caching Guide*; LangChain -- *RAG Evaluation*; TruLens -- *RAG Evaluation Framework*