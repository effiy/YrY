---
title: competitive intelligence dashboard
aliases:
- competitor dashboard
- market intelligence dashboard
- competitive analysis dashboard
- CI dashboard
tags:
- dashboard
- competitive-intelligence
- competitor
- market
- feature-parity
- positioning
category: executive/industry
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- executive
- product-manager
- tech-lead
benefit: competitive landscape and market position visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./competitors/
- ../strategy/dashboard-executive-kpi.md
- ../strategy/product-strategy-framework.md
- ../../product-manager/discovery/metrics/dashboard-product-portfolio.md
tacit: false
---

# competitive intelligence dashboard

> **As an** executive, **I want to** track the competitive landscape and market position, **so that** strategic threats and opportunities are identified before they impact the business.

> Competitive intelligence is not about copying competitors — it's about understanding the landscape to make informed strategic decisions. This dashboard tracks competitor profiles, feature parity, market share, win/loss analysis, and strategic moves.

## Summary

- 5 CI dimensions: competitor profiles, feature parity matrix, market share and positioning, win/loss analysis, strategic moves and signals
- Primary competitors tracked with funding, headcount, pricing, and key differentiators
- Feature parity assessed across 12 capability dimensions with gap analysis
- Win/loss analysis by competitor, deal size, and reason; trends tracked monthly
- Dashboard reviewed monthly; win/loss deep-dive quarterly; full competitive review biannually

## Core viewpoints

- Know your enemy but don't obsess — competitive intelligence informs strategy, not dictates it
- Feature parity is a trap — chasing every competitor feature leads to a commodity product; focus on your differentiation
- Win/loss is the most honest signal — why customers choose you (or don't) reveals your true competitive position
- Competitor moves are signals — funding rounds, hires, pricing changes, and acquisitions indicate strategic direction

## Key information

### 5-panel CI overview

```
┌──────────────────────────────────────────────────────────────────┐
│  COMPETITOR PROFILES             │  FEATURE PARITY MATRIX          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Primary:   4 tracked   │   │  │  Ahead:     3/12 dims   │   │
│  │  Secondary: 6 tracked   │   │  │  At parity: 5/12 dims   │   │
│  │  Emerging:  3 tracked   │   │  │  Behind:    4/12 dims   │   │
│  │  Total:    13 tracked   │   │  │  Unique:    2/12 dims   │   │
│  │  Threat level: Moderate │   │  │  Gap score: +2.5 (us)   │   │
│  │  Moves:     5 this month│   │  │  Trend:      → stable   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  MARKET SHARE & POSITIONING      │  WIN/LOSS ANALYSIS              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Our share: 4.8% ↑      │   │  │  Overall win: 62% ↑     │   │
│  │  Market: $4.2B TAM      │   │  │  vs CompA: 55%          │   │
│  │  Rank:    #3 of 8       │   │  │  vs CompB: 68%          │   │
│  │  G2:      4.5 vs 4.2    │   │  │  vs CompC: 72%          │   │
│  │  NPS:     42 vs 35      │   │  │  Top reason: AI quality │   │
│  │  Growth:  +42% YoY      │   │  │  Top loss: Pricing      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Competitor profiles (primary)

| Competitor | Type | Founded | Funding | Employees | Est. Revenue | Key differentiator |
|---|---|---|---|---|---|---|
| CompA (Market Leader) | Public | 2018 | $320M | ~850 | $180M ARR | Enterprise sales, compliance |
| CompB (Direct) | Series D | 2020 | $180M | ~400 | $65M ARR | Open-source core, flexibility |
| CompC (Direct) | Series C | 2021 | $95M | ~250 | $28M ARR | Developer experience, speed |
| CompD (Adjacent) | Public | 2015 | $450M | ~2,000 | $420M ARR | Platform breadth, ecosystem |

### Threat level assessment

| Competitor | Product threat | Market threat | Talent threat | Overall | Change |
|---|---|---|---|---|---|
| CompA | Medium | High | High | High | → |
| CompB | High | Medium | Medium | High | ↑ |
| CompC | Medium | Low | Medium | Medium | → |
| CompD | Low | High | Low | Medium | → |

### Feature parity matrix

| Capability | Us | CompA | CompB | CompC | CompD | Our position |
|---|---|---|---|---|---|---|
| AI Chat (multi-model) | 9.0 | 7.5 | 8.0 | 8.5 | 6.0 | **Ahead** |
| Code Generation | 8.5 | 6.0 | 7.5 | 9.0 | 5.0 | At parity |
| AI Code Review | 8.0 | 5.0 | 6.0 | 7.0 | 4.0 | **Ahead** |
| RAG Knowledge Base | 7.5 | 8.0 | 7.0 | 6.5 | 8.5 | Behind |
| Enterprise SSO/RBAC | 6.0 | 9.0 | 8.5 | 5.0 | 9.5 | Behind |
| API & Integrations | 7.0 | 8.5 | 9.0 | 7.5 | 9.0 | Behind |
| Observability & Analytics | 7.5 | 8.0 | 7.5 | 6.0 | 9.0 | At parity |
| Mobile Experience | 6.5 | 7.0 | 6.0 | 8.0 | 8.5 | Behind |
| Collaboration Features | 8.0 | 7.5 | 8.0 | 7.0 | 8.5 | At parity |
| Security & Compliance | 7.0 | 9.0 | 7.5 | 5.5 | 9.5 | Behind |
| Pricing Flexibility | 8.0 | 6.0 | 8.5 | 8.0 | 7.0 | At parity |
| Developer Tools & Docs | 8.5 | 7.0 | 8.0 | 9.0 | 7.5 | At parity |
| **Overall** | **7.6** | **7.3** | **7.6** | **7.3** | **7.7** | |

### Unique differentiators

| Differentiator | Description | Defensibility | Competitor gap |
|---|---|---|---|
| Multi-model orchestration | Seamless routing between Claude, GPT, and open-source models | High (integration complexity) | 12-18 months |
| AI Code Review with context | Full repo context + incremental review | Medium | 6-12 months |
| Cross-project knowledge graph | Unified knowledge across all projects | High (data network effect) | 18-24 months |

### Market share and positioning

| Metric | Us | CompA | CompB | CompC | CompD | Others |
|---|---|---|---|---|---|---|
| Market share | 4.8% | 22.5% | 12.0% | 5.5% | 35.0% | 20.2% |
| YoY growth | +42% | +18% | +35% | +55% | +12% | +15% |
| G2 rating | 4.5 | 4.2 | 4.4 | 4.6 | 4.3 | — |
| NPS | 42 | 35 | 38 | 45 | 32 | — |
| Enterprise customers | 28 | 180 | 65 | 15 | 420 | — |
| Avg deal size (ACV) | $42K | $85K | $38K | $22K | $120K | — |

### Win/loss analysis (last 90 days)

| Outcome | Count | % | Avg deal size |
|---|---|---|---|
| Win (chose us) | 42 | 48% | $45K |
| Win (no competition) | 18 | 20% | $28K |
| Loss (to CompA) | 8 | 9% | $72K |
| Loss (to CompB) | 6 | 7% | $38K |
| Loss (to CompC) | 5 | 6% | $25K |
| Loss (to CompD) | 3 | 3% | $95K |
| Loss (to others/inaction) | 6 | 7% | $32K |
| **Total** | **88** | | |

### Win/loss reasons

| Win reason | Count | % | Trend |
|---|---|---|---|
| AI quality and accuracy | 18 | 30% | ↑ |
| Developer experience | 14 | 23% | → |
| Multi-model support | 10 | 17% | ↑ |
| Pricing and value | 8 | 13% | → |
| Customer support | 5 | 8% | → |
| Integration ecosystem | 3 | 5% | ↑ |
| Brand/reputation | 2 | 3% | → |

| Loss reason | Count | % | Trend |
|---|---|---|---|
| Enterprise features (SSO/RBAC) | 8 | 36% | ↑ |
| Pricing (too expensive) | 5 | 23% | → |
| Compliance certifications | 4 | 18% | ↑ |
| Brand recognition | 2 | 9% | → |
| Platform breadth | 2 | 9% | → |
| Geographic support | 1 | 5% | → |

### Strategic moves tracker (last 90 days)

| Date | Competitor | Move type | Description | Impact | Our response |
|---|---|---|---|---|---|
| Aug 1 | CompB | Product | Launched AI code review | Medium | Accelerate AICR differentiation |
| Jul 28 | CompA | Acquisition | Acquired monitoring startup ($85M) | High | Evaluate observability strategy |
| Jul 20 | CompC | Pricing | Introduced free tier | Medium | Review pricing strategy |
| Jul 15 | CompB | Funding | Raised $80M Series D extension | Medium | Monitor hiring and expansion |
| Jul 10 | CompA | Product | Released enterprise SSO v2 | High | Prioritize SSO/RBAC roadmap |
| Jun 25 | CompD | Partnership | Partnered with major cloud provider | High | Evaluate cloud partnership strategy |
| Jun 18 | CompC | Talent | Hired ex-Google AI director | Medium | Monitor product acceleration |
| Jun 5 | CompA | Market | Expanded to APAC (Singapore office) | Low | Continue APAC partner strategy |

### Competitive positioning map

```
                    High Price
                        │
           CompD ───●── │
                        │
                        │  ● CompA
                        │
    Enterprise ◄────────┼──────────► Developer-first
                        │
                        │      ● Us
                        │
           CompB ──●──  │  ● CompC
                        │
                    Low Price
```

## Action recommendations

1. **Close enterprise gap**: SSO/RBAC is the #1 loss reason (36%); prioritize enterprise features in Q3-Q4 roadmap
2. **Defend AI quality lead**: AI quality is the #1 win reason (30%); continue investing in multi-model orchestration
3. **Monitor CompA acquisition**: observability startup acquisition signals CompA building integrated platform; evaluate our observability strategy
4. **Respond to CompC free tier**: evaluate freemium model; free tier with usage limits can expand top-of-funnel
5. **Win/loss program**: formalize win/loss interview process; target 80% coverage of all deals > $50K
6. **Competitive battle cards**: create per-competitor battle cards for sales team; update monthly based on win/loss data
7. **Quarterly CI review**: deep-dive competitive analysis with product, sales, and executive team
8. **Pricing review**: 23% loss due to pricing; evaluate value-based pricing vs competitor benchmarking



- Feature copying → adding every competitor feature; focus on your differentiation, not their checklist
- Competitor obsession → changing strategy based on every competitor move; competitors are one input, not the only input
- Win/loss ignorance → not tracking why you win or lose; win/loss is the most honest competitive signal
- Underestimating emerging competitors → only tracking established players; the most dangerous competitor is the one you're not watching
- Pricing wars → racing to the bottom on price; compete on value, not price

## Related

- Same class: [dashboard-executive-kpi](../strategy/dashboard-executive-kpi.md) — executive KPIs
- Same class: [dashboard-product-portfolio](../../product-manager/discovery/metrics/dashboard-product-portfolio.md) — product metrics
- Downstream: [product-strategy-framework](../strategy/product-strategy-framework.md) — strategy framework
- References: Michael Porter — *Competitive Strategy*; April Dunford — *Obviously Awesome: Product Positioning*; Steven Haines — *The Product Manager's Desk Reference*