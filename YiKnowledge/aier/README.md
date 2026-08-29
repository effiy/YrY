---
title: AI Engineer
aliases: [tech category, technology knowledge]
tags: [leaf, aier, ai, machine-learning]
category: aier
created: 2026-08-03
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [aier]
benefit: "AI engineers find AI-specific knowledge: foundations, methodology, platform, and ML"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "cross-references to related leaves and parent INDEX are present"
related:
  - ./INDEX.md
  - ../INDEX.md
---

# AI Engineer

> **Pipeline layer: AI Enablement (cross-cutting)** — Accelerates every pipeline stage with AI-specific knowledge.
>
> **As an** AI engineer, **I want to** navigate AI foundations, methodology, platform, and ML resources, **so that** I can build effective AI systems.
>
> Aier is AI-specific. It does not cover general software engineering (→ [engineer/](../engineer/)), architecture decisions (→ [leader/](../leader/)), or production operations (→ [srer/](../srer/)).

## Subdirectories

| Domain | Content |
|---|---|
| [foundations/](./foundations/) | AI/ML theory: transformers, attention, MoE, RLHF, quantization |
| [methodology/](./methodology/) | Prompt engineering, RAG patterns, agent architecture, evaluation, safety |
| [methodology/prompts/](./methodology/prompts/) | Prompt templates: agent tool use, code review, SQL generation |
| [platform/](./platform/) | AI platform: LLM comparison, inference engines, vector DBs, AI gateway |
| [ml/](./ml/) | ML ops: model deployment, evaluation infrastructure |

## Core viewpoints

- **AI knowledge is cross-cutting, not a pipeline stage** — aier accelerates every stage; it doesn't sit between stages
- **Theory informs practice** — foundations (Transformer, Attention, MoE) underpin methodology (RAG, agents) and platform choices
- **Evaluation is the production gate** — two-loop eval (auto + human) is mandatory before any AI feature reaches production
- **Prompts are code** — prompt templates live in version control, follow the same review cycle as code
- **Platform decisions are revisited quarterly** — LLM providers, inference engines, and vector DBs evolve fast

## Scope

### In scope (aier OWNS)
- AI/ML theory and model architecture
- Prompt engineering and prompt templates
- RAG design patterns and architectures
- Agent architecture and tool-use patterns
- LLM evaluation methodology and red-teaming
- AI platform and inference infrastructure
- ML ops and model deployment

### Out of scope (delegated to other roles)
- General database design and migrations → [engineer/ship/](../engineer/ship/)
- General API design and system architecture → [engineer/build/](../engineer/build/)
- AI product requirements → [producter/discovery/](../producter/discovery/)
- AI architecture decisions (ADRs) → [leader/decisions/](../leader/decisions/)
- AI service incident response → [srer/incident-response/](../srer/incident-response/)
- General code quality and testing → [engineer/ship/](../engineer/ship/)

## Cross-role references

- [INDEX.md](./INDEX.md) — Full file listing for this category
- [../engineer/build/](../engineer/build/) — Engineering tools and patterns
- [../leader/decisions/yiai/](../leader/decisions/yiai/) — YiAi ADRs
- [../srer/observability/](../srer/observability/) — Production observability