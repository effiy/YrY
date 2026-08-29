---
title: Competitor Analysis Directory
aliases:
- competitors-leaf-readme
- competitors-readme
tags:
- leaf
- industry
- competitors
category: executiver/industry/competitors
created: '2026-08-03'
updated: '2026-08-18'
last_verified: '2026-08-18'
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles:
- executiver
- producter
benefit: "Executives and product managers find competitor profiles, product comparisons, analysis templates, LLM vendor landscape, and regional competitor maps — with clear categorization framework, intel sources, and maintenance workflow"
acceptance_criteria:
- scope of the leaf directory is clearly bounded with explicit exclusions
- file inventory table is complete with one-liner descriptions and status
- competitor categorization framework (direct/indirect/adjacent/potential) is documented
- intelligence gathering sources are listed
- recommended structure covers all file types (profile, comparison, summary)
- maintenance workflow is defined with review cadence
- cross-references to related leaves and parent INDEX are present
related:
- ../../../engineer/run/understand-competitors.md
- ../reports/README.md
- ../market-trends/README.md
- ../../strategy/README.md
- ../../roadmap/README.md
---

# Competitor Analysis Directory

> **As an** executiver, **I want to** track competitors, market trends, and industry reports, **so that** strategic decisions are grounded in market reality.
> Competitor company profiles, product comparisons, competitor analysis templates and methodology. Monthly refresh; external content must include `last_verified`; entries not verified for over half a year must be marked `status: deprecated`.

## Scope

**Included:**

- Competitor company profiles in the same track (direct competitors)
- Competitor function / pricing / channel comparison
- Competitor public event tracking (product launches, funding, partnerships, acquisitions)
- Competitor analysis templates and methodology
- LLM vendor and technology provider landscape
- Regional competitor maps with regulatory context

**Not included:**

- Third-party industry reports → [../reports/](../reports/)
- Market size, growth rate, trend forecasts → [../market-trends/](../market-trends/)
- Internal product strategy or roadmap decisions → [../../strategy/](../../strategy/), [../../roadmap/](../../roadmap/)
- Customer win/loss analysis → [../../../producter/](../../../producter/)
- Technology deep-dives or architecture reviews → [../../../engineer/](../../../engineer/)

## Competitor categorization

Use this four-tier framework to classify each competitor in the profile frontmatter (`tier` field):

| Tier | Label | Definition | Analysis depth |
|---|---|---|---|
| 1 | **Direct** | Same product category, same target customer, same value proposition | Full 8-section profile, quarterly refresh |
| 2 | **Indirect** | Different product category but solves the same customer job | 4-section comparison, semi-annual refresh |
| 3 | **Adjacent** | Same product category but different customer segment or region | 3-section snapshot, annual refresh |
| 4 | **Potential** | Could enter the market within 12-18 months (adjacent expansion, well-funded startup) | Radar watchlist, semi-annual review |

## Intelligence gathering sources

| Source type | Examples | Use for |
|---|---|---|
| **Official channels** | Company blog, product changelog, press releases, earnings calls | Product updates, strategy shifts, financial health |
| **Third-party reviews** | G2, Capterra, TrustRadius, Product Hunt | User sentiment, feature gaps, pricing perception |
| **Industry media** | TechCrunch, VentureBeat, 36Kr, LatePost | Funding, partnerships, leadership changes |
| **Social listening** | Twitter/X, LinkedIn, Reddit, Hacker News | Developer sentiment, community traction, hiring signals |
| **Job postings** | LinkedIn Jobs, company careers page | Tech stack, expansion direction, team size |
| **Regulatory filings** | SEC, CSRC, GDPR/CCPA notices | Compliance posture, market entry barriers |
| **Conference talks** | KubeCon, re:Invent, Google Cloud Next, local tech meetups | Technology roadmap, thought leadership |

## How to use this directory

1. **Add a new competitor**: copy `competitor-analysis.md` template, fill in the 8 sections, add a row to the Included table below
2. **Update an existing profile**: edit the file, bump `updated` and `last_verified` in frontmatter
3. **Compare competitors**: reference `saas-top-players.md` for multi-vendor comparison patterns
4. **Check regional landscape**: start with `regional-competitors.md` for region-specific context
5. **Understand LLM vendor landscape**: `llm-vendor-landscape.md` for model provider positioning

## File types and naming

- `{company-english-name}-profile.md`: competitor company profile (Tier 1, full 8-section)
- `{company-english-name}-{product-name}-comparison.md`: comparison analysis (Tier 2, 4-section)
- `{company-english-name}-snapshot.md`: brief snapshot (Tier 3, 3-section)
- `competitor-analysis-template.md`: general template for new profiles
- `*-summary.md`: competitor dynamics summary (quarterly roundup)
- `*-landscape.md`: multi-vendor landscape overview

All file names use kebab-case English.

## Included

| File | Content | Tier | Status |
|---|---|---|---|
| [llm-vendor-landscape.md](./llm-vendor-landscape.md) | Large model vendor competitive landscape (Anthropic / OpenAI / Google / Meta / DeepSeek) — model capability, pricing, ecosystem | 2 | planned |
| [competitor-analysis.md](./competitor-analysis.md) | General competitor analysis template (eight-section) for Tier 1 profiles | — | planned |
| [saas-top-players.md](./saas-top-players.md) | SaaS customer service top players (Zendesk, Freshdesk, Intercom, Salesforce, HubSpot) — feature comparison, pricing, positioning | 1 | planned |
| [ai-brd-competitors.md](./ai-brd-competitors.md) | AI BRD / business requirements automation track players — AI writing tools, PM platforms, enterprise requirements tools | 1 | planned |
| [regional-competitors.md](./regional-competitors.md) | Regional competitors — Europe, Southeast Asia, Middle East — local players, regulatory landscape, entry strategy | 3 | planned |

## Recommended structure

### Tier 1 — Competitor company profile (8-section)

1. **Company overview** — founded, size, region, funding stage, key people, annual revenue (estimated)
2. **Core product matrix** — product lines, flagship features, tech differentiators
3. **Business model and pricing** — revenue model, pricing tiers, discount strategy, contract terms
4. **Channels and ecosystem** — sales channels, partner network, developer ecosystem, marketplace
5. **Tech stack and public capabilities** — inferred tech stack, API/SDK maturity, scalability signals
6. **Benchmarking dimensions** — function coverage gap, price gap, UX gap, performance gap, ecosystem gap
7. **Recent dynamics and public events** — last 6 months: product launches, funding, partnerships, acquisitions, leadership changes
8. **Our response strategy** — threat level, differentiated positioning, counter-moves, timeline

### Tier 2 — Product comparison (4-section)

1. **Comparison scope** — which products, which dimensions, comparison date
2. **Feature matrix** — side-by-side feature table with coverage ratings (full/partial/none)
3. **Pricing comparison** — plan-by-plan price breakdown, hidden costs, TCO estimate
4. **Positioning map** — 2x2 positioning, our relative advantage, gaps to close

### Tier 3 — Regional snapshot (3-section)

1. **Regional market overview** — market size, local players, regulatory environment
2. **Key local competitors** — top 3-5 local players with brief profiles
3. **Entry assessment** — barriers, localization requirements, recommended approach

### Landscape overview (multi-vendor)

1. **Landscape scope** — vendor category, time period, data sources
2. **Positioning matrix** — capability vs. maturity, or capability vs. pricing, 2x2
3. **Vendor profiles** — one-paragraph per vendor with key differentiators
4. **Trends and implications** — market direction, impact on our positioning

## Maintenance workflow

| Cadence | Action | Owner |
|---|---|---|
| **Weekly** | Scan competitor official channels for product updates, pricing changes | executiver |
| **Monthly** | Review `last_verified` on all files; update or flag as deprecated | executiver |
| **Quarterly** | Full Tier 1 profile refresh; Tier 4 radar review | executiver + producter |
| **Semi-annual** | Tier 2 comparison refresh; Tier 4 potential-entrant reassessment | producter |
| **Annual** | Tier 3 regional snapshot refresh; categorization tier review | executiver |

> **Deprecation rule**: any file with `last_verified` older than 6 months must be moved to `archive/` and marked `status: deprecated`.

## Related leaves

- [../reports/](../reports/) — third-party industry reports (Gartner, McKinsey, a16z, CAICT, IDC)
- [../market-trends/](../market-trends/) — market size, growth rates, trend forecasts
- [../../strategy/](../../strategy/) — internal strategy tools and frameworks
- [../../roadmap/](../../roadmap/) — product roadmap and planning
- [../../../engineer/run/understand-competitors.md](../../../engineer/run/understand-competitors.md) — scenario entry: engineer researches competitors
- [../../../producter/](../../../producter/) — customer win/loss, landing case studies