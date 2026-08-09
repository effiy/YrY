---
title: Understand competitors and industry
aliases:
- I want to understand competitors and industry
- competitor analysis entry
tags:
- journeys
- competitors
- industry
- market-trends
- strategy
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: context is reachable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../executive/industry/competitors--README.md
- ../../executive/industry/reports--README.md
- ../../executive/industry/market-trends--README.md
- ../../executive/strategy/README.md
review_cycle: quarterly
tacit: false
---

# I want to understand competitors and industry

> **As an** engineer, **I want to** understand competitors, **so that** context is reachable. 

> What competitors are doing, where the industry is heading, how to use strategy tools — reachable within 2 hops. 

## Summary
- Three diagrams: competitor vendor landscape, industry reports, and market trends
- Quick reference for strategy frameworks such as Porter's Five Forces, Blue Ocean, and BMC
- Cross-cultural UX and compliance references for overseas business are indexed together

## Core viewpoints

- **Competitor analysis is not about knowing what competitors are doing -- it is about knowing what they cannot do, and why.** A feature-by-feature comparison tells you what competitors have built; a strategy analysis tells you what they are structurally incapable of building because of their business model, technical debt, or organizational constraints. The latter is the insight that creates strategic advantage.

- **The most dangerous competitor is not the one with the most features but the one with the fastest learning loop.** A competitor that ships weekly, measures obsessively, and pivots based on data will eventually surpass a competitor that ships quarterly with a perfect feature set. Competitor analysis must assess not just the current product but the velocity and direction of improvement -- the second derivative matters more than the first.

- **Industry reports are lagging indicators, not leading indicators -- they describe what already happened, not what will happen next.** By the time a trend appears in an industry report, the early movers have already captured the advantage. The value of industry reports is calibration (are we aligned with macro trends?) and context (what conditions produced the current landscape?), not prediction. Prediction comes from observing early signals at the edges, not from reading summaries of the center.

- **Strategy frameworks (Porter's Five Forces, Blue Ocean, BMC) are not analysis tools -- they are structured thinking templates that prevent the most common analytical errors.** Porter's Five Forces prevents the error of only looking at direct competitors while ignoring the threat of substitutes and new entrants. Blue Ocean prevents the error of competing on the same dimensions as everyone else. The framework's value is not in the answer it produces but in the blind spots it illuminates.

- **Cross-cultural and regulatory analysis is not a "nice to have" for overseas expansion -- it is the difference between entering a market and being blocked from it.** A product that is compliant with EU regulations but violates Chinese data localization laws is not a global product with a China problem; it is a regional product with global aspirations. The competitor analysis must include the regulatory landscape of every target market, because a competitor that is blocked by regulation in your target market is not a competitor at all.

## Key info

- **Competitor analysis framework (5 dimensions, replace feature-by-feature comparison)**: (1) Current product — not feature count but capability depth in the competitor's target customer segment; (2) Strategy and business model — what are they structurally incapable of building because of their business model, technical debt, or organizational constraints; (3) Velocity and direction — the second derivative matters more than the first: shipping cadence, learning loop speed, and trend direction over the last 4 quarters; (4) Customer segment — who are their customers, what jobs are they hiring the product for, why are they not switching to you; (5) Regulatory moat — compliance investments (GDPR, SOC 2, data localization) that create barriers to entry harder to overcome than technical advantages. Feature counting is a substitute for thinking; the matrix showing "we have 15 features, they have 18" is a shopping list, not analysis.
- **Strategy framework complementarity matrix (5 frameworks, use ≥2 for any analysis)**: (1) Porter's Five Forces — analyzes competitive intensity: direct rivals, threat of new entrants, threat of substitutes, supplier power, buyer power; prevents the error of only looking at direct competitors; (2) Blue Ocean Strategy — identifies uncontested market spaces by eliminating/reducing/raising/creating value dimensions; prevents the error of competing on the same dimensions as everyone else; (3) Business Model Canvas (BMC) — maps 9 building blocks (value proposition, customer segments, channels, revenue streams, etc.); reveals structural differences between your model and competitors'; (4) SWOT Analysis — strengths/weaknesses/opportunities/threats; structured internal + external assessment; (5) VRIO Framework — evaluates resources by Value, Rarity, Imitability, Organization; identifies sustainable competitive advantage. Single-framework analysis produces blind spots — Porter's Five Forces without Blue Ocean produces a grim picture with no path to differentiation; Blue Ocean without Porter's produces a naive strategy that ignores structural competitive forces.
- **Competitor monitoring cadence and staleness management**: Quarterly updates are the minimum for stable markets; monthly for fast-moving markets (AI/LLM). The `last_verified` field on competitor analysis files is the mechanism that prevents stale intelligence from masquerading as current. A competitor analysis from Q1 2025 describing a competitor as "lacking AI capabilities" is actively misleading in Q3 2026 when that competitor has launched an AI-powered version. Every competitor analysis file must carry a `last_verified` date and a `review_cycle` field.
- **Industry report calibration methodology**: Industry reports (Gartner, McKinsey, a16z, IDC, CAICT) are lagging indicators — they describe what already happened, not what will happen next. By the time a trend appears in an industry report, early movers have already captured the advantage. The value of industry reports is: (1) Calibration — are we aligned with macro trends? (2) Context — what conditions produced the current landscape? (3) Benchmarking — how do our metrics compare to industry averages? Prediction comes from observing early signals at the edges (startup activity, academic papers, regulatory changes), not from reading summaries of the center.
- **Overseas expansion regulatory checklist (4 dimensions)**: (1) Data localization — where must data be stored (China: in-country; EU: GDPR-compliant transfers; Russia: in-country); (2) Content regulation — what content is restricted/prohibited in each market; (3) Certification requirements — SOC 2, ISO 27001, CCPA, PIPL, each with multi-year investment timelines; (4) Cross-cultural UX — Nielsen heuristics vary by culture (color symbolism, navigation patterns, trust signals). A competitor that has invested 2 years in compliance certifications has a moat that a new entrant cannot replicate in a quarter.
- **Yi-family competitor landscape (2026-08)**: Yi-family projects are internal tools — no direct commercial competitors. Competitor analysis is documented for: (1) BRD Agent — LLM vendor landscape (OpenAI, Anthropic, Google, Meta, Chinese LLM vendors), AI BRD competitors (SaaS players adding AI BRD capabilities); (2) YiVad aiChat — RAG system competitors (enterprise search + AI assistant products); (3) General market awareness — SaaS top players, regional competitors, AI market trends. The competitor analysis framework and strategy tools are maintained for when products face external markets.

## Scenario

During quarterly planning, new business initiatives, overseas expansion, or benchmarking retrospectives, you need to string together scattered competitor intelligence, industry reports, and strategy frameworks into a decision-ready picture. This entry aggregates related leaves under `industry/` and `product/strategy/` so you don't have to grep on demand. 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `../../executive/industry/competitors` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors--competitor-analysis.md) |
| `../../executive/industry/reports` | [ai-industry-report-summary.md](../../executive/industry/reports--ai-industry-report.md) |
| `../../executive/industry/market-trends` (to be added)  | ai-market-trend-first-half.md · regional-market-observation.md |
| `../../product-manager/industry-cases` (to be added)  | ai-customer-service-cases.md · ai-after-sales-cases.md |
| `../../executive/strategy` | [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) · [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md) · [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) |
| `../../product-manager/discovery/ux` | [cross-cultural-ux-summary.md](../../product-manager/discovery/ux--cross-cultural-ux.md) |
| `../brd/reference/` | [regulations.md](./../../brd/README.md) · [countries.md](./../../brd/README.md) |

## Action recommendations

1. First read `industry/competitors--llm-vendor-landscape-summary.md` to understand the large-model vendor landscape
2. Use `competitor-analysis-template.md` to write a horizontal and vertical comparison of target competitors
3. Cross-check trend judgments with the latest annual report under `industry/reports--`
4. Pick 1-2 strategy frameworks (Porter's Five Forces / BMC / Blue Ocean) and apply them to your own business canvas
5. For overseas business, must-check `brd/reference/regulations.md` + `cross-cultural-ux-summary.md`
6. Monthly review of external content where `last_verified` is over half a year; update or move to `archive/`

## Anti-patterns

- **Performing a feature-by-feature comparison without understanding the competitor's strategy.** A matrix showing that your product has 15 features and the competitor has 18 is not analysis -- it is a shopping list. The question is not "do they have feature X?" but "why did they build feature X, what problem does it solve for which customer segment, and what does it reveal about their strategy?" Feature counting is a substitute for thinking.

- **Using a single strategy framework in isolation and treating its output as a complete analysis.** Porter's Five Forces without Blue Ocean produces a grim picture of competitive intensity with no path to differentiation. Blue Ocean without Porter's Five Forces produces a naive strategy that ignores the structural forces that will crush the new market space. Frameworks are complementary lenses, not competing methodologies.

- **Writing a competitor analysis once and never updating it.** A competitor analysis from Q1 2025 that describes a competitor's product as "lacking AI capabilities" is actively misleading in Q3 2026 when that competitor has launched an AI-powered version. The `last_verified` field is the mechanism that prevents stale analysis from masquerading as current intelligence. Quarterly updates are the minimum; monthly is better for fast-moving markets.

- **Analyzing competitors without analyzing their customers.** A competitor's product decisions make no sense in isolation -- they only make sense in the context of the customer segment they are targeting. A competitor that appears to be making "bad" product decisions may be serving a customer segment you do not understand or do not value. The competitor analysis must include customer analysis: who are their customers, what jobs are they hiring the product for, and why are they not switching to you?

- **Treating regulatory compliance as a checklist item rather than a competitive moat.** A competitor that has invested two years in GDPR compliance, SOC 2 certification, and data localization infrastructure has a moat that a new entrant cannot replicate in a quarter. The competitor analysis must assess regulatory moats as rigorously as technical moats, because in regulated industries, compliance is a barrier to entry that is harder to overcome than a technical advantage.

## Related

- Same-class journey: [../strategies/find-ai-deployment-cases.md](../engineering/find-ai-deployment-cases.md) — industry landing instances
- Same-class journey: [../lessons/learn-pm-frameworks.md](../lessons/learn-pm-frameworks.md) — strategy framework extensions
- Upstream: [../../knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — journey design basis
- Downstream: [../../knowledge-curator/archive/archive.md](../../knowledge-curator/archive/archive.md) — archive of outdated content
