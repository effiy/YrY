---
title: AI Methodology Directory
tags: [leaf, methodology, ai-specific]
category: aier/methodology
created: 2026-08-03
updated: 2026-08-10
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [aier, engineer]
benefit: "ai methodology sound"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../aier/ml/find-ai-deployment-cases.md
  - ../../engineer/build/find-templates-and-prompts.md
  - ../../producter/frameworks/README.md
  - ../platform/README.md
  - ./prompts/README.md
---

# AI Methodology Directory

> **As an** AI engineer, **I want to** apply proven AI methodologies and prompt engineering patterns, **so that** I can build reliable and effective AI features.

Includes AI product R&D specific methodology: Prompt engineering, RAG design, Agent Architecture, evaluation systems.

## Directory structure

| Subdirectory | Content | Files |
|---|---|---|
| `./` (root) | Core methodology: prompt engineering, RAG, agent patterns, evaluation, safety, finetuning | 16 |
| [prompts/](./prompts/) | Reusable prompt templates (agent tool use, code review, SQL, etc.) | 9 |

## Included scope

- Prompt engineering best practices
- RAG retrieval-augmented generation design patterns
- Agent Architecture Patterns (ReAct, Plan-Execute, Reflexion)
- Model evaluation methods (manual annotation, auto evaluation, red-teaming)
- Hallucination mitigation, security guardrails, alignment strategy
- Model fine-tuning decision tree

## Core methodology files

- `prompt-engineering-guide.md` — Prompt Engineering best practices guide
- `rag-design-patterns.md` — RAG design patterns (chunking / reranking / hybrid search)
- `agent-architecture-patterns.md` — Agent architecture patterns (ReAct / Plan-Execute / Reflexion / Tool Use)
- `llm-evaluation-methods.md` — LLM evaluation methods (HELM / MT-Bench / self-consistency / manual annotation)
- `hallucination-mitigation.md` — Hallucination detection and mitigation
- `prompt-injection-defense.md` — Prompt security and Prompt Injection defense
- `model-finetuning-decision-tree.md` — Model fine-tuning decision tree (LoRA / QLoRA)
- `llm-red-teaming.md` — LLM red teaming methodology
- `ai-alignment-strategy.md` — AI alignment strategy for enterprise
- `agent-evaluation.md` — AI agent evaluation framework
- `multimodal-rag.md` — Multimodal RAG patterns
- `finetune-a-model.md` — Model fine-tuning guide
- `blueprint-an-enterprise-rag.md` — Enterprise RAG blueprint
- `tune-prompts.md` — Prompt tuning methodology
- `run-a-two-loop-llm-evaluation.md` — Two-loop LLM evaluation process
- `agent-harness-plugin-architecture.md` — Plugin-based agent harness architecture (Cordis / profiles / capability seams / events), mapped to YiAi's agent loop

## File type and naming

- `{topic}.md`: methodology summary
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

## Related leaf

- [../../producter/frameworks](../../producter/frameworks) — PM framework
- [../../curator/templates/thinking](../../curator/templates/thinking) — mental models
- [../platform](../platform) — Platform technology
- [../foundations](../foundations) — Foundations theory
- [./prompts](./prompts) — Prompts
- [../../producter/industry-cases](../../producter/strategy) — Implementation case studies
- [../../engineer/learn/projects/yiai](../../engineer/learn/projects/yiai) — YiAi implementation
- [../../aier/ml/find-ai-deployment-cases.md](../../aier/ml/find-ai-deployment-cases.md) — Scenario entry