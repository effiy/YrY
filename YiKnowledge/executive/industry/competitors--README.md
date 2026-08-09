---
title: Competitor Analysis Directory
aliases: [competitors-leaf-readme, competitors-readme]
tags: [leaf, industry, competitors]
category: executive/industry/competitors
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: leaf-readme
lifecycle: reference
status: stable
review_cycle: monthly
roles: [executive, product-manager]
benefit: "industry visible"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../../engineer/process/understand-competitors.md
  - ../reports/README.md
  - ../market-trends/README.md
  - ../../strategy/README.md
---

# Competitor Analysis Directory

> **As an** executive, **I want to** track competitors, market trends, and industry reports, **so that** strategic decisions are grounded in market reality. 

> Competitor company profiles, product comparisons, competitor analysis templates and methodology. Monthly refresh; external content must include `last_verified`. 

## Scope

- Competitor company profiles in the same track
- Competitor function / pricing / channel comparison
- Competitor public event tracking
- Competitor analysis templates and methodology

## File types and naming

- `{company-english-name}-profile.md`: competitor company profile
- `{company-english-name}-{product-name}-comparison.md`: comparison analysis
- `competitor-analysis-template.md`: general template
- `*-summary.md`: competitor dynamics summary

All file names use kebab-case English. 

## Included

| file | content | state |
|---|---|---|
| [llm-vendor-landscape.md](./llm-vendor-landscape.md) | Large model vendor competitive landscape (Anthropic / OpenAI / Google / Meta / DeepSeek)  | active |
| [competitor-analysis.md](./competitor-analysis.md) | General competitor analysis template (eight-section)  | reference |
| [saas-top-players.md](./saas-top-players.md) | SaaS customer service top players (Zendesk, Freshdesk, Intercom, Salesforce, HubSpot) — feature comparison, pricing, positioning | active |
| [ai-brd-competitors.md](./ai-brd-competitors.md) | AI BRD / business requirements automation track players — AI writing tools, PM platforms, enterprise requirements tools | active |
| [regional-competitors.md](./regional-competitors.md) | Regional competitors — Europe, Southeast Asia, Middle East — local players, regulatory landscape, entry strategy | active | 

## recommended structure (competitor company profile) 

1. Company overview (founded, size, region, funding stage) 
2. Core product matrix
3. Business model and pricing
4. Channels and ecosystem
5. Tech stack and public capabilities
6. Benchmarking dimensions vs our product (function coverage gap, price gap, user gap) 
7. Recent dynamics and public events
8. Our response strategy

## Related leaves

- [../reports/](../reports/) — industry reports
- [../market-trends/](../market-trends/) — market trends
- [../../strategy](../../strategy) — strategy tools
- [../../../engineer/process/understand-competitors.md](../../../engineer/process/understand-competitors.md) — scenario entry
