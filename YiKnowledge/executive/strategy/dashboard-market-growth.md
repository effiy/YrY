---
title: market growth and expansion dashboard
aliases:
- market growth dashboard
- growth strategy dashboard
- market expansion dashboard
- revenue growth dashboard
- TAM SAM SOM dashboard
tags:
- dashboard
- market-growth
- market-expansion
- revenue-growth
- tam-sam-som
- geographic-expansion
- customer-acquisition
- market-share
category: executive/strategy
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- executive
- product-manager
- tech-lead
benefit: market growth trajectory, expansion health, and revenue dynamics visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- market share, TAM/SAM/SOM, revenue growth, geographic expansion, customer acquisition, and market dynamics defined
related:
- ./dashboard-executive-kpi.md
- ./dashboard-okr-health.md
- ./dashboard-sustainability.md
- ../../product-manager/strategy/dashboard-product-strategy.md
- ../industry/dashboard-competitive-intelligence.md
tacit: false
---

# market growth and expansion dashboard

> **As an** executive, **I want to** track market growth and expansion health, **so that** every growth initiative is measured, market opportunities are quantified, and expansion is a strategic, data-driven practice — not a hope-based "we'll grow because the market grows" assumption.

> Growth is the primary mandate of the business. This dashboard tracks market share, TAM/SAM/SOM, revenue growth, geographic expansion, customer acquisition, and market dynamics — turning growth from a quarterly earnings narrative into a continuously measured, strategically managed, and proactively accelerated engine.

## Summary

- 6 growth dimensions: market share, TAM/SAM/SOM, revenue growth, geographic expansion, customer acquisition, market dynamics
- $85M ARR; 22% YoY growth; 4 product lines; 6 geographic regions; 3 market segments (B2C, B2B, Enterprise)
- Market share: 4.2% of $2.0B addressable market; 8.5% of SAM; 18.2% of SOM; 3 competitors gaining share; 2 competitors losing share
- Revenue growth: $85M ARR (target $100M); 22% YoY (target 30%); 85% subscription, 15% services; 118% NRR (B2B); 92% NRR (B2C)
- Geographic expansion: 68% revenue from NA; 22% EU; 8% APAC; 2% LATAM; 0% MENA; 2 new regions planned (MENA 2026-Q4, Africa 2027-Q2)
- Dashboard reviewed biweekly; growth strategy review with executive team monthly

## Core viewpoints

- Market share is a lagging indicator of competitive advantage — you don't grow market share by optimizing pricing pages; you grow market share by being the best solution for a specific customer segment, and the market share follows
- TAM is a story, SOM is a plan — a $2.0B TAM is aspirational; a $468M SOM with 18.2% penetration is operational; the ratio between the two tells you whether you're executing or storytelling
- Net revenue retention is the most honest growth metric — 118% NRR means your existing customers are growing faster than your new customer acquisition; 92% NRR means you're on a treadmill, running faster just to stay in place
- Geographic expansion without product-market fit is geographic multiplication of failure — if your product only has 18.2% market share in your home market, expanding to 3 new regions will not fix the underlying product-market fit problem

## Key information

### 6-panel market growth overview

```
┌──────────────────────────────────────────────────────────────────┐
│  MARKET SHARE                         │  TAM / SAM / SOM                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Market share: 4.2%      │   │  │  TAM: $2.0B (global)    │   │
│  │  SAM share: 8.5%         │   │  │  SAM: $1.0B (target)    │   │
│  │  SOM share: 18.2%        │   │  │  SOM: $468M (reachable) │   │
│  │  Share trend: +0.3% QoQ  │   │  │  SOM penetration: 18.2% │   │
│  │  Competitors: 8 tracked  │   │  │  TAM growth: 12% YoY    │   │
│  │  Gainers: 3, Losers: 2   │   │  │  SAM growth: 15% YoY    │   │
│  │  Share score: B (78)     │   │  │  Market score: B+ (82)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  REVENUE GROWTH                       │  GEOGRAPHIC EXPANSION                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  ARR: $85M (target $100M)│   │  │  NA: 68% ($57.8M)       │   │
│  │  YoY growth: 22%         │   │  │  EU: 22% ($18.7M)       │   │
│  │  Subscription: 85% ($72M)│   │  │  APAC: 8% ($6.8M)      │   │
│  │  Services: 15% ($13M)    │   │  │  LATAM: 2% ($1.7M)     │   │
│  │  NRR (B2B): 118%         │   │  │  MENA: 0% (launch Q4)  │   │
│  │  NRR (B2C): 92%          │   │  │  New region pipeline: 2 │   │
│  │  Revenue score: B+ (82)  │   │  │  Geo score: B- (72)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CUSTOMER ACQUISITION                 │  MARKET DYNAMICS                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  CAC: $850 (B2C)         │   │  │  Market growth: 12% YoY │   │
│  │  CAC: $12,500 (B2B)      │   │  │  New entrants: 3 (Q2)   │   │
│  │  CAC: $45,000 (Ent)      │   │  │  Regulatory changes: 2  │   │
│  │  LTV/CAC: 4.2× (B2C)     │   │  │  Technology shifts: 3   │   │
│  │  LTV/CAC: 5.8× (B2B)     │   │  │  tracked (AI, edge, open│   │
│  │  Payback: 8 mo (B2C)     │   │  │  source)                │   │
│  │  Payback: 14 mo (B2B)    │   │  │  Market risk: Low-Med   │   │
│  │  Acquisition: B+ (82)    │   │  │  Dynamics score: B(78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Market share by segment

| Market segment | TAM | Our revenue | Market share | YoY share change | Competitors | Leader share | Our position |
|---|---|---|---|---|---|---|---|
| **AI Chat Platform** | $850M | $38M | 4.5% | +0.5% | 12 | 22% (ChatGPT) | #4 |
| **Developer Tools** | $520M | $22M | 4.2% | +0.3% | 8 | 28% (GitHub) | #5 |
| **Browser Extension (AI)** | $180M | $15M | 8.3% | +1.2% | 5 | 18% (Grammarly) | #3 |
| **Enterprise AI Agent Platform** | $450M | $10M | 2.2% | +0.8% | 6 | 35% (Microsoft) | #6 |
| **Overall** | **$2.0B** | **$85M** | **4.2%** | **+0.3%** | **8 key** | **25% avg** | **#4-6** |

### TAM/SAM/SOM waterfall

| Market layer | Value | Growth rate | Our penetration | Definition | Key assumptions |
|---|---|---|---|---|---|
| **TAM** (Total Addressable Market) | $2.0B | 12% YoY | 4.2% | All AI-powered productivity and development tools globally | All knowledge workers adopt AI tools; all developers use AI-assisted development |
| **SAM** (Serviceable Addressable Market) | $1.0B | 15% YoY | 8.5% | English-speaking, cloud-native, mid-market + enterprise | Focus on markets with existing cloud infrastructure; exclude China (regulatory) |
| **SOM** (Serviceable Obtainable Market) | $468M | 18% YoY | 18.2% | Segments we can reach with current GTM: B2B SaaS, developer tools, browser | Current sales capacity, marketing budget, geographic presence |
| **Current Revenue** | $85M | 22% YoY | 100% of current | Actual ARR across all products | |
| **SOM Gap** | $383M | | | Obtainable but not yet captured | |

### Revenue growth by product line

| Product | ARR | YoY growth | % of total | NRR | Gross margin | Growth vector | 12-month target |
|---|---|---|---|---|---|---|---|
| **YiVad** (AI chat) | $32M | 28% | 37.6% | 122% | 78% | Product-led growth, viral loops | $42M |
| **YiWeb** (dashboard) | $22M | 18% | 25.9% | 108% | 82% | Feature expansion, upselling | $28M |
| **YiPet** (browser ext) | $15M | 35% | 17.6% | 95% | 85% | Freemium conversion, enterprise plan | $22M |
| **YiAi** (agent platform) | $10M | 45% | 11.8% | 135% | 72% | Enterprise sales, partner channel | $18M |
| **Services** | $6M | 8% | 7.1% | N/A | 45% | Reduce dependency, productize | $5M (target decrease) |
| **Overall** | **$85M** | **22%** | **100%** | **118% (B2B)** | **76%** | | **$100M** |

### Geographic expansion roadmap

| Region | Current revenue | % of total | YoY growth | Market maturity | Localization | Team | Next milestone | Investment |
|---|---|---|---|---|---|---|---|---|
| **North America** (US, Canada) | $57.8M | 68% | 18% | Mature (core market) | Full | 85 FTEs | $75M ARR, 25% market share in SOM | $12M/year |
| **Europe** (UK, DE, FR, NL) | $18.7M | 22% | 28% | Growing | English + DE/FR | 28 FTEs | $30M ARR, GDPR-first data residency | $8M/year |
| **APAC** (SG, JP, AU, IN) | $6.8M | 8% | 35% | Emerging | English + JP | 12 FTEs | $15M ARR, local data centers in SG/JP | $5M/year |
| **LATAM** (BR, MX) | $1.7M | 2% | 42% | Nascent | English + PT/ES | 3 FTEs | $5M ARR, local payment methods | $2M/year |
| **MENA** (UAE, Saudi) | $0 | 0% | — | Pre-launch | English + AR | 0 FTEs (hiring) | Launch Q4 2026, $2M ARR in 12 months | $3M (setup) |
| **Africa** (South Africa, Nigeria, Kenya) | $0 | 0% | — | Exploration | English | 0 FTEs | Market assessment Q1 2027, launch Q2 2027 | $1M (research) |

### Customer acquisition efficiency

| Segment | CAC | LTV | LTV/CAC | Payback (months) | Churn rate | ARPU | Acquisition channels |
|---|---|---|---|---|---|---|---|
| **B2C (individual)** | $850 | $3,570 | 4.2× | 8 | 5.8% monthly | $35/mo | PLG, SEO, referrals, social, app store |
| **B2C (power user)** | $1,200 | $7,200 | 6.0× | 6 | 3.2% monthly | $65/mo | PLG, community, content marketing |
| **B2B (SMB, 10-100 seats)** | $12,500 | $72,500 | 5.8× | 14 | 2.2% monthly | $850/account/mo | Inbound, content, partnerships |
| **B2B (mid-market, 100-500)** | $28,000 | $185,000 | 6.6× | 12 | 1.5% monthly | $2,200/account/mo | Outbound SDR, events, channel |
| **Enterprise (500+ seats)** | $45,000 | $380,000 | 8.4× | 18 | 0.8% monthly | $5,500/account/mo | Enterprise sales, exec referrals, RFP |
| **Overall** | **$8,500** | **$42,000** | **4.9×** | **11** | **3.5%** | **$280/mo** | |

### Market dynamics and competitive landscape

| Dynamic | Impact | Urgency | Our response | Time horizon |
|---|---|---|---|---|
| **AI model commoditization** — foundation models becoming cheaper, faster, interchangeable | High — reduces moat of AI-first products | Near-term (0-6 months) | Build application-layer differentiation, proprietary data, workflow integration | Q3-Q4 2026 |
| **Enterprise AI adoption acceleration** — Fortune 500 moving from pilots to production | High — expands TAM, increases competition | Near-term (0-6 months) | Enterprise sales team expansion, SOC 2 Type II, FedRAMP prep | Q3-Q4 2026 |
| **Open-source AI agents** — AutoGPT, CrewAI, LangGraph gaining traction | Medium — threat to YiAi platform | Mid-term (6-12 months) | Differentiate on reliability, observability, enterprise governance | Q4 2026-Q1 2027 |
| **Regulatory: EU AI Act** — compliance requirements for AI products in EU | Medium — compliance cost, market access risk | Mid-term (6-12 months) | AI Act compliance audit, transparency documentation, risk classification | Q4 2026 |
| **Browser extension platform risk** — Chrome Manifest V3, Safari restrictions | Medium — YiPet dependency on extension APIs | Mid-term (6-12 months) | Diversify beyond extensions (web app, native desktop), MV3 compatibility | Q3-Q4 2026 |
| **New entrants (3 tracked)** — 2 well-funded startups, 1 big tech entry | Medium — competitive pressure | Ongoing | Competitive monitoring, feature parity analysis, win/loss tracking | Continuous |

## Action recommendations

1. **Revenue growth acceleration**: 22% YoY vs 30% target; focus on YiAi (45% growth, enterprise) and YiPet (35% growth, freemium conversion), add enterprise sales capacity, target 30%+ YoY
2. **B2C net revenue retention**: 92% NRR (below 100% = revenue contraction); implement expansion revenue motions (add-ons, premium features), reduce churn from 5.8% to 4%, target 100%+ NRR
3. **SOM penetration acceleration**: 18.2% of $468M SOM; identify highest-conversion segments within SOM, increase sales capacity in top 3 segments, target 25% SOM penetration
4. **MENA market entry**: launch Q4 2026; hire regional GM by Q3, establish UAE entity, localize for Arabic (RTL) + English, target $2M ARR in 12 months
5. **Enterprise segment investment**: 2.2% market share in $450M enterprise AI agent market; double enterprise sales team (5→10 AEs), add partner channel, target 5% market share
6. **Services revenue reduction**: 15% of revenue from services (low margin, 45% GM); productize top 3 service engagements, build self-serve onboarding, target < 10% services mix
7. **LATAM growth acceleration**: 42% YoY but only 2% of revenue; add local payment methods (Pix, OXXO), hire 2 local AEs, localize for PT-BR, target 5% of revenue
8. **AI model commoditization defense**: build proprietary data moat (user workflows, templates, agent patterns), deepen workflow integration, add switching costs through ecosystem
9. **Competitive win/loss analysis**: currently ad-hoc; implement systematic win/loss analysis, track competitive displacement rate, feed insights into product roadmap
10. **Biweekly growth review**: review market share, TAM/SAM/SOM, revenue growth, geographic expansion, customer acquisition, and market dynamics with executive team



- The TAM inflation game → inflating TAM by including every adjacent market ("all software is a $500B market") to make 4.2% share look like a huge opportunity; a $500B TAM you can't serve is a fantasy — a $468M SOM you can capture is a plan
- The "growth at all costs" trap → spending $45,000 to acquire an enterprise customer with $5,500/mo ARPU and 18-month payback; if LTV/CAC drops below 3×, every dollar of growth destroys enterprise value — growth is only good if it's efficient
- The "we'll figure out localization later" expansion → launching in Japan with an English-only product; 72% of Japanese B2B buyers prefer to buy in Japanese — geographic expansion without localization is just a very expensive website translation
- The NRR blind spot → celebrating 118% B2B NRR while ignoring 92% B2C NRR; the B2B number looks great, but 82% of your users are B2C and they're contracting — the blended NRR is what matters, not the best segment
- The "next quarter" growth hack → discounting annual contracts, pre-paying commissions, and pulling forward renewals to hit this quarter's number; Q3 looks great, Q4 has a hole the size of the discounts you gave — growth should be sustainable, not borrowed from the future

## Related

- Same class: [dashboard-executive-kpi](dashboard-executive-kpi.md) — executive KPI
- Same class: [dashboard-okr-health](dashboard-okr-health.md) — OKR health
- Same class: [dashboard-sustainability](dashboard-sustainability.md) — sustainability
- Same class: [dashboard-product-strategy](../../product-manager/strategy/dashboard-product-strategy.md) — product strategy
- Same class: [dashboard-competitive-intelligence](../industry/dashboard-competitive-intelligence.md) — competitive intelligence
- References: McKinsey — *Growth Strategy Framework*; Bain — *Sustainable Growth Model*; Geoffrey Moore — *Crossing the Chasm*; HubSpot — *TAM/SAM/SOM Model*; David Skok — *SaaS Metrics 2.0*; Gartner — *Market Share Analysis*; CB Insights — *Market Sizing Guide*