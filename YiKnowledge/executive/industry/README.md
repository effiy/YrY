---
title: Industry Intelligence
aliases: [industry-category-readme, industry-readme, market-intelligence]
tags: [leaf, industry, market, competitors]
category: executive/industry
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: leaf-readme
lifecycle: reference
status: stable
review_cycle: monthly
roles: [executive]
benefit: "industry visible"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present"
related:
 - ./INDEX.md
 - ../../engineer/process/understand-competitors.md
 - ../../engineer/engineering/find-ai-deployment-cases.md
 - ../../product-manager/strategy/
---

# Industry Intelligence

> **As an** executive, **I want to** track competitors, market trends, and industry reports, **so that** strategic decisions are grounded in market reality.

> External industry knowledge hub entry: competitors, market trends, industry reports, landing case studies. Industry knowledge is time-sensitive; entries not verified for over half a year must be marked `status: deprecated`.

## Subdirectories

| Leaf | Curated content |
|---|---|
| [competitors/](./competitors/) | Competitor company archive, analysis, templates |
| [market-trends/](./market-trends/) | Market trend observations, semi-annual retrospective, regional market templates |
| [reports/](./reports/) | Third-party industry report summaries and originals |
| [use-cases/](../../product-manager/strategy) | AI customer service / after-sales / RAG+Agent landing case studies, case study templates |

## Archiving principles

- **Dual-copy archiving**: external content kept in two copies — original `*-original.md` + summary `*-summary.md`, frontmatter `source` points to the original.
- **YAML metadata spec**: all summaries must include `updated` and `last_verified`; external content must include `review_cycle` (monthly / quarterly / yearly).
- **Time-sensitive management**: entries not verified for over half a year must be tagged `status: deprecated` and archived to `archive/`.
- **Monthly review cadence**: scan `last_verified` every month; verify or archive expired entries in a timely manner.

## Frequently referenced Top

- [competitors/llm-vendor-landscape-summary.md](./competitors/llm-vendor-landscape.md) — Large model vendor competitive landscape
- [competitors/competitor-analysis-template.md](./competitors/competitor-analysis.md) — Competitor analysis template
- [reports/ai-industry-report-summary.md](./reports/ai-industry-report.md) — AI industry report summary

## Related

- [INDEX.md](./INDEX.md) — This category MOC
- [../../engineer/process/understand-competitors.md](../../engineer/process/understand-competitors.md) — Scenario entry: competitors and industry
- [../../engineer/engineering/find-ai-deployment-cases.md](../../engineer/engineering/find-ai-deployment-cases.md) — Scenario entry: AI landing case studies
- [../../knowledge-curator/diagrams/knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) — Knowledge map
- [../../MEMORY.md](../../MEMORY.md) — Library-wide archiving principles and YAML spec
