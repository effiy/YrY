---
title: Industry Reports Directory
aliases: [reports-leaf-readme, reports-readme]
tags: [leaf, industry, reports]
category: executive/industry/reports
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [executive]
benefit: "industry visible"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../../engineer/process/understand-competitors.md
  - ../competitors/README.md
  - ../market-trends/README.md
---

# Industry Reports Directory

> **As an** executive, **I want to** track competitors, market trends, and industry reports, **so that** strategic decisions are grounded in market reality.

> Third-party industry report summaries and original archives. External content must include `last_verified`; if not verified for half a year, transition to `status: deprecated`.

## Scope

- Industry reports from consulting firms / investment banks / research institutions
- Government and regulatory agency white papers
- Industry alliance and media annual roundups
- Vendor technical white papers

## File types and naming

- `{year}-{topic}-summary.md`: report summary
- `{year}-{topic}-original.md`: original archive (PDF / MD)
- English kebab-case naming, four-digit year

## Included

| File | Content | Status |
|---|---|---|
| [ai-industry-report-summary.md](./ai-industry-report.md) | 2026 AI industry trends report summary | active |
| [gartner-ai-hype-cycle.md](./gartner-ai-hype-cycle.md) | Gartner AI Hype Cycle 2026 — 5 phases, AI technology positioning, timing framework | active |
| [mckinsey-ai-report.md](./mckinsey-ai-report.md) | McKinsey AI Report — $13-22T economic impact, adoption by industry, AI leader characteristics | active |
| [idc-customer-service.md](./idc-customer-service.md) | IDC Customer Service Report — $45-55B market, vendor landscape, technology adoption curve | active |
| [caict-ai-whitepaper.md](./caict-ai-whitepaper.md) | CAICT AI White Paper — China AI market 600-800B RMB, domestic model landscape, policy timeline | active |
| [a16z-ai-outlook.md](./a16z-ai-outlook.md) | a16z AI Outlook — LLM OS framework, infrastructure vs. application layer, vertical AI defensibility | active |

## Recommended structure (summary)

1. Report basic info (institution, author, release date, page count)
2. Core viewpoints (3-5 items)
3. Key data (market size, growth rate, penetration rate)
4. Industry judgments and predictions
5. Implications for this product / business
6. Quotes from the original

## Related leaves

- [../competitors/](../competitors/) — competitor vendors
- [../market-trends/](../market-trends/) — market trends
- [../../../product-manager/industry-cases](../../../product-manager/strategy) — landing cases
- [../../../engineer/process/understand-competitors.md](../../../engineer/process/understand-competitors.md) — scenario entry
- [../../../knowledge-curator/diagrams/knowledge-map.md](../../../knowledge-curator/diagrams/knowledge-map.md) — knowledge map
