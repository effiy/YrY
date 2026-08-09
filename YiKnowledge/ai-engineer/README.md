---
title: Tech
aliases: [tech category, technology knowledge]
tags: [leaf, ai-engineer, ai, machine-learning]
category: ai-engineer
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [ai-engineer]
benefit: "README outcome clear"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ./INDEX.md
  - ../engineer/engineering/find-ai-deployment-cases.md
  - ../engineer/process/check-engineering-gotchas.md
---

# Tech

> **As an** AI engineer, **I want to** navigate AI foundations, methodology, platform, and data resources, **so that** I can build effective AI systems.

> Covers technical domain knowledge: AI foundations, AI platform, data, infrastructure.

## Subdirectories

| Leaf | Coverage | File count |
|---|---|---|
| [ai-foundations/](./foundations) | AI foundations theory and model architecture (Transformer / Attention / KV Cache / MoE / RLHF / long context / multimodal) | 7 |
| [ai-platform/](./platform) | AI platform layer, inference service, model gateway (LLM comparison / inference engine / vector DB / observability / embedding / workbench) | 6 |
| [data/](./data/) | Data engineering, data governance, data science (modeling / ETL / Lakehouse / governance / MongoDB) | 5 |
| [infra/](../oncall-sre/observability) | Infrastructure, ops, deployment, observability (tech debt / capacity and cost) | 2 |

## Archiving principles

- Technical content is time-sensitive; entries older than half a year must be reviewed and tagged with `last_verified`
- Selection comparison must include a dimension table and decision basis (decision tree + performance reference)
- This team's landing instances take priority over external tutorials
- AI content uses `review_cycle: quarterly`; external content `last_verified` should be the original `updated` date

## Frequently referenced top

- [ai-foundations/transformer-architecture-summary.md](./foundations/transformer-architecture.md)
- [ai-foundations/attention-mechanism-summary.md](./foundations/attention-mechanism.md)
- [ai-platform/llm-comparison-summary.md](./platform/llm-comparison.md)
- [ai-platform/inference-engine-comparison-summary.md](./platform/inference-engine-comparison.md)
- [ai-platform/vector-db-comparison-summary.md](./platform/vector-db-comparison.md)
- [infra/tech-debt-inventory-summary.md](../oncall-sre/observability/tech-debt-inventory.md)

## Related

- [INDEX.md](./INDEX.md) — this category MOC
- [journeys/i-want-to-find-ai-deployment-cases.md](../engineer/engineering/find-ai-deployment-cases.md) — scenario entry
- [journeys/i-want-to-check-engineering-gotchas.md](../engineer/process/check-engineering-gotchas.md) — scenario entry
- [methodology/ai-specific/](./methodology) — AI methodology
- [work/tools/](../engineer/tools-devx) — engineering tools
