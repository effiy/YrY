---
title: Market Trends Directory
aliases: [market-trends-leaf-readme, market-trends-readme]
tags: [leaf, industry, market-trends]
category: executive/industry/market-trends
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
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../reports/README.md
  - ../competitors/README.md
  - ../../../knowledge-curator/diagrams/knowledge-map.md
  - ../../../engineer/process/understand-competitors.md
---

# Market Trends Directory

> **As an** executive, **I want to** track competitors, market trends, and industry reports, **so that** strategic decisions are grounded in market reality.

> Market trend related summary, report, in-house observations. External content must include `last_verified`, monthly review for verification, half-year unverified switches to `status: deprecated`.

## Included scope

- Half-year market trend retrospective
- Regional market (Europe / Southeast Asia / Middle East) observations
- Emerging sector tracking (Agent, inference models, robotics, etc.)
- AI / SaaS / overseas expansion dynamics

## File type and naming

- `*-summary.md`: trend report summary
- `*-original.md`: archived original
- `*-observation.md` / `*-template.md`: in-house observation notes or template

## Already included

| file | content | status |
|---|---|---|
| [ai-market-trend-first-half.md](./ai-market-trend-first-half.md) | 2026 H1 AI market trend retrospective — timeline, funding trends, technology breakthroughs, regulatory developments | active |
| [regional-market-observation.md](./regional-market-observation.md) | Regional market observation template — PESTLE framework, signal source tiers, analysis cadence, regional sources | reference |
| [half-year-retrospective.md](./half-year-retrospective.md) | 2026 H1 retrospective — key events, funding by category, technology breakthroughs, regulatory developments | active |
| [emerging-sector-tracking.md](./emerging-sector-tracking.md) | Emerging sector tracking — 3-phase tracking process, 5-dimension evaluation framework, portfolio management, entry/exit criteria | active |

## Recommended writing structure

1. Trend core viewpoints
2. Key data and time window
3. Drivers
4. Impact on this team and action recommendations
5. Source and verification date

## Related leaf

- [../reports/](../reports/) — industry reports
- [../competitors/](../competitors/) — competitors
- [../../../product-manager/industry-cases](../../../product-manager/strategy) — implementation case studies
- [../../../engineer/process/understand-competitors.md](../../../engineer/process/understand-competitors.md) — scenario entry
- [../../../knowledge-curator/diagrams/knowledge-map.md](../../../knowledge-curator/diagrams/knowledge-map.md) — knowledge map
