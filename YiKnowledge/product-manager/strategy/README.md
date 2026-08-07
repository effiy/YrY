---
title: Case Studies / Industry Use Cases
aliases: [use-cases-leaf-readme, use-cases-readme, industry-cases]
tags: [leaf, industry, use-cases]
category: product-manager/strategy
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: leaf-readme
lifecycle: reference
status: stable
review_cycle: monthly
roles: [product-manager, ai-engineer]
benefit: "case lessons absorbed"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../ai-engineer/methodology/README.md
  - ../../engineer/projects/yiai/README.md
  - ../../engineer/engineering/find-ai-deployment-cases.md
  - ../../knowledge-curator/governance/tacit-knowledge-backlog.md
  - ../../executive/industry/
---

# Case Studies / Industry Use Cases

> **As a** product manager, **I want to** study AI and product implementation cases across industries, **so that** I can apply proven patterns and lessons to our products.

> AI and product implementation case study research. **Currently a tacit knowledge gap** — customer industry insight (each item focuses on the customer's business model) has not yet been accumulated (reference [T008](../../knowledge-curator/governance/tacit-knowledge-backlog.md)).

## Included scope

- AI customer service implementation case study
- AI after-sales implementation case study (Related YiAi)
- RAG + Agent enterprise implementation case study
- Customer industry insight (focus on customer business model)
- Case study research template

## file type and naming

- `*-summary.md` / `*-cases.md`: Case study summary (background + solution + effect + lessons)
- `*-original.md`: original document
- `case-study-template.md`: Case study research template

## Already included

| file | content | status |
|---|---|---|
| [ai-customer-service-cases.md](./ai-customer-service-cases.md) | AI customer service implementation case study | active |
| [ai-after-sales-cases.md](./ai-after-sales-cases.md) | AI after-sales implementation case study (Related YiAi) | active |
| [case-study.md](./case-study.md) | Case study research template | reference |
| [overseas-brd-case-study.md](./overseas-brd-case-study.md) | Overseas after-sales BRD agent case study — architecture, evaluation results, compliance workflow, production lessons | active |
| [rag-agent-case-study.md](./rag-agent-case-study.md) | RAG + Agent enterprise implementation case study — hybrid search, evaluation framework, agent loop patterns | active |
| [customer-industry-insight.md](./customer-industry-insight.md) | Customer industry insight methodology — interview framework, competitive intelligence, Porter's Five Forces, PESTLE | active |

## Recommended writing structure

1. background (customer business, pain points)
2. solution (tech stack, architecture, process)
3. effect (quantitative metric)
4. lessons and takeaways
5. source and verification date

## Related leaf

- [../../ai-engineer/methodology](../../ai-engineer/methodology) — AI methodology
- [../../engineer/projects/yiai](../../engineer/projects/yiai) — YiAi implementation
- [../../engineer/engineering/find-ai-deployment-cases.md](../../engineer/engineering/find-ai-deployment-cases.md) — scenario entry
- [../../knowledge-curator/governance/tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) — customer insight T001/T008
- `../../brd/brd-product-manager/` — BRD product manager exports
