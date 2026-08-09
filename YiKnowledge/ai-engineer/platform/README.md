---
title: AI Platform Directory
tags: [leaf, tech, ai-platform]
category: ai-engineer/platform
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [ai-engineer]
benefit: "platform reliable"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../engineer/engineering/find-ai-deployment-cases.md
  - ../foundations/README.md
  - ../methodology/README.md
  - ../../engineer/engineering/vllm-ollama-deployment.md
---

# AI Platform Directory

> **As an** AI engineer, **I want to** understand AI platform options and deployment patterns, **so that** I can choose the right infrastructure for AI workloads.

Covers AI platform-layer technology, model services, inference engines, and platform engineering practices.

## Scope

- Mainstream large model comparison (capability, pricing, context)
- Inference services (vLLM, TGI, SGLang, TensorRT-LLM)
- Model gateway and routing (LiteLLM, Portkey)
- Vector databases and retrieval (Qdrant, Milvus, pgvector)
- AI gateway and observability (LangSmith, Langfuse, Helicone)
- Embedding model selection

## File types and naming

- `{topic}-summary.md`: platform technology summary
- `{engine/tool}-comparison.md`: comparison documentation
- Naming uses English kebab-case

## Frontmatter template

```yaml
---
title: some platform technology
tags: [AI Platform, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: active
last_verified: YYYY-MM-DD
review_cycle: monthly
related:
  - ./ai-workbench-user-guide.md
  - ./dashboard-ai-performance.md
  - ./dashboard-llm-cost.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended structure

1. Technology background and the problem it solves
2. Core concepts and components
3. Mainstream solution comparison table
4. Selection decision tree
5. Deployment and operations key points
6. Internal team landing status

## Included

- `llm-comparison-summary.md` — mainstream large language model comparison
- `inference-engine-comparison-summary.md` — inference engine comparison (vLLM / TGI / SGLang / TensorRT-LLM)
- `vector-db-comparison-summary.md` — vector database comparison (Qdrant / Milvus / pgvector / Weaviate)
- `llm-observability-comparison-summary.md` — LLM observability platform comparison (LangSmith / Langfuse / Helicone)
- `embedding-model-selection-summary.md` — Embedding model selection
- `ai-workbench-user-guide-summary.md` — AI desktop workbench user guide summary
- `ai-gateway-design.md` — AI gateway architecture for multi-provider LLM routing
- `multimodal-model-services.md` — Multimodal AI model deployment
- `model-routing-strategy.md` — LLM request routing strategy

## Related leaves

- [../foundations](../foundations) — foundational theory
- [../methodology](../methodology) — methodology
- [../../engineer/engineering/vllm-ollama-deployment.md](../../engineer/engineering/vllm-ollama-deployment.md) — deployment
- [../data/](../data/) — data dimension
- [../../engineer/engineering/find-ai-deployment-cases.md](../../engineer/engineering/find-ai-deployment-cases.md) — scenario entry
