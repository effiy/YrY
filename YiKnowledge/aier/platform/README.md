---
title: AI Platform Directory
tags: [leaf, tech, ai-platform]
category: aier/platform
created: 2026-08-03
updated: 2026-08-10
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [aier]
benefit: "platform reliable"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../aier/ml/find-ai-deployment-cases.md
  - ../foundations/README.md
  - ../methodology/README.md
  - ../../engineer/build/vllm-ollama-deployment.md
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

### Platform tools & comparisons

- `llm-comparison.md` — mainstream large language model comparison
- `inference-engine-comparison.md` — inference engine comparison (vLLM / TGI / SGLang / TensorRT-LLM)
- `vector-db-comparison.md` — vector database comparison (Qdrant / Milvus / pgvector / Weaviate)
- `llm-observability-comparison.md` — LLM observability platform comparison (LangSmith / Langfuse / Helicone)
- `embedding-model-selection.md` — Embedding model selection
- `pick-a-vector-database.md` — Vector database selection guide
- `pick-an-llm-provider.md` — LLM provider selection guide
- `evaluate-an-llm-app.md` — LLM application evaluation

### Platform architecture

- `ai-gateway-design.md` — AI gateway architecture for multi-provider LLM routing
- `ai-workbench-user-guide.md` — AI desktop workbench user guide summary
- `multimodal-model-services.md` — Multimodal AI model deployment
- `model-routing-strategy.md` — LLM request routing strategy
- `llama-index-evolution.md` — LlamaIndex framework evolution
- `orchestrate-agents-with-adk-and-agents-cli.md` — Agent orchestration with ADK and Agents CLI

## Related leaves

- [../foundations](../foundations) — foundational theory
- [../methodology](../methodology) — methodology
- [../../engineer/build/vllm-ollama-deployment.md](../../engineer/build/vllm-ollama-deployment.md) — deployment
- [../data/](../data/) — data dimension
- [../../aier/ml/find-ai-deployment-cases.md](../../aier/ml/find-ai-deployment-cases.md) — scenario entry
