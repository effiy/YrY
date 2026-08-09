---
title: AI Methodology Directory
tags: [leaf, methodology, ai-specific]
category: ai-engineer/methodology
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [ai-engineer, engineer]
benefit: "ai methodology sound"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../engineer/engineering/find-ai-deployment-cases.md
  - ../../engineer/engineering/find-templates-and-prompts.md
  - ../../product-manager/frameworks/README.md
  - ../platform/README.md
  - ./prompts/README.md
---

# AI Methodology Directory

> **As an** AI engineer, **I want to** apply proven AI methodologies and prompt engineering patterns, **so that** I can build reliable and effective AI features.

Includes AI product R&D specific methodology: Prompt engineering, RAG design, Agent Architecture, evaluation systems.

## Included scope

- Prompt engineering best practices
- RAG retrieval-augmented generation design patterns
- Agent Architecture Patterns (ReAct, Plan-Execute, Reflexion)
- Model evaluation methods (manual annotation, auto evaluation, red-teaming)
- Hallucination mitigation, security guardrails, alignment strategy
- Model fine-tuning decision tree

## File type and naming

- `{topic}-summary.md`: methodology summary
- `{topic}-template.md`: reusable template
- Naming uses English kebab-case

## Frontmatter Template

```yaml
---
title: Some methodology
tags: [AI, methodology, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: reference
last_verified: YYYY-MM-DD
review_cycle: quarterly
related:
  - ./agent-architecture-patterns.md
  - ./architecting-ai-powered-resilience-framework-on-aws-8ceb8e.md
  - ./architecting-offline-first-generative-ai-applications-for-ed-4e8e94.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended writing structure

1. Methodology definition and applicable scenarios
2. Key concepts and terminology
3. Step / pattern decomposition
4. Anti-patterns and pitfalls
5. Evaluation metrics
6. This team's implementation case study

## Already included

- `prompt-engineering-guide-summary.md` — Prompt Engineering best practices guide
- `rag-design-patterns-summary.md` — RAG design patterns (chunking / reranking / hybrid search)
- `agent-architecture-patterns-summary.md` — Agent architecture patterns (ReAct / Plan-Execute / Reflexion / Tool Use)
- `llm-evaluation-methods-summary.md` — LLM evaluation methods (HELM / MT-Bench / self-consistency / manual annotation)
- `hallucination-mitigation-summary.md` — Hallucination detection and mitigation
- `prompt-injection-defense-summary.md` — Prompt security and Prompt Injection defense
- `model-finetuning-decision-tree-summary.md` — Model fine-tuning decision tree (LoRA / QLoRA)
- `llm-red-teaming.md` — LLM red teaming methodology
- `ai-alignment-strategy.md` — AI alignment strategy for enterprise
- `agent-evaluation.md` — AI agent evaluation framework
- `multimodal-rag.md` — Multimodal RAG patterns

## Related leaf

- [../../product-manager/frameworks](../../product-manager/frameworks) — PM framework
- [../../knowledge-curator/templates/thinking](../../knowledge-curator/templates/thinking) — mental models
- [../platform](../platform) — Platform technology
- [../foundations](../foundations) — Foundations theory
- [./prompts](./prompts) — Prompts
- [../../product-manager/industry-cases](../../product-manager/strategy) — Implementation case studies
- [../../engineer/projects/yiai](../../engineer/projects/yiai) — YiAi implementation
- [../../engineer/engineering/find-ai-deployment-cases.md](../../engineer/engineering/find-ai-deployment-cases.md) — Scenario entry
