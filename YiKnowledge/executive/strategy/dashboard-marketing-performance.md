---
title: marketing performance dashboard
aliases:
- marketing dashboard
- demand generation dashboard
- campaign performance dashboard
- marketing ops dashboard
- brand health dashboard
- content marketing dashboard
tags:
- dashboard
- marketing
- demand-generation
- campaigns
- brand
- lead-generation
- content-marketing
- marketing-operations
category: executive/strategy
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- executive
- product-manager
- tech-lead
benefit: campaign ROI, lead generation, content performance, and marketing efficiency visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- demand generation, campaign performance, content marketing, brand health, marketing operations, and marketing efficiency defined
related:
- ./dashboard-executive-kpi.md
- ./dashboard-sales-gtm-motion.md
- ./dashboard-market-growth.md
- ../../product-manager/discovery/metrics--dashboard-customer-journey.md
- ../../product-manager/strategy/dashboard-pricing-packaging.md
tacit: false
---

# marketing performance dashboard

> **As an** executive, **I want to** track marketing performance, **so that** every campaign dollar is accounted for, every lead is qualified, every content investment drives pipeline, and marketing is a measured, accountable, and continuously improving revenue driver — not a "brand awareness" budget that nobody can measure.

> Marketing is the engine of demand. This dashboard tracks demand generation, campaign performance, content marketing, brand health, marketing operations, and marketing efficiency — turning marketing from a cost center with fuzzy attribution into a revenue center with measurable, forecastable, and continuously improving ROI.

## Summary

- 6 marketing dimensions: demand generation, campaign performance, content marketing, brand health, marketing operations, marketing efficiency
- $18M annual marketing budget; 45-person marketing team; 85,000 leads/year; 850 campaigns/year; 2,500 content pieces/year; 4 primary channels
- Demand generation: 85,000 leads/year; 12% MQL conversion; 28% SQL conversion; $285 avg CPL; 22% marketing-sourced pipeline; 15% marketing-influenced pipeline
- Campaign performance: 850 campaigns/year; 3.2× avg ROI; 35% of campaigns below 1× ROI; 8% of campaigns > 5× ROI; $425 avg cost per opportunity
- Content marketing: 2,500 pieces/year; 850 blog posts; 48 whitepapers; 120 webinars; 22% content-driven leads; 35% content reuse rate
- Dashboard reviewed weekly; marketing review with executive leadership biweekly

## Core viewpoints

- Marketing ROI is not "we spent $X and got $Y pipeline" — it's the full-funnel attribution from impression to revenue; 15% of pipeline is marketing-influenced (touched by marketing at some point) vs 22% marketing-sourced (first touch was marketing) — the difference is whether marketing is creating demand or just claiming credit for demand that already existed
- The 35% of campaigns below 1× ROI are not failures — they're tuition; the question is whether you're learning from them and reallocating budget, or repeating the same underperforming campaigns because "we've always done it this way"
- Content is a compounding asset, not a campaign expense — a blog post written today will generate traffic for 3 years; a webinar recording will generate leads for 18 months; the 35% content reuse rate means most content is used once and forgotten — the ROI of content is in the reuse, not the creation
- Brand is the ultimate moat — a strong brand reduces CAC by 30-50%, increases win rate by 15-25%, and creates pricing power; brand is hard to measure but easy to see in the win/loss analysis: "we went with the vendor we trust" is brand, and it's worth more than any feature

## Key information

### 6-panel marketing overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DEMAND GENERATION                     │  CAMPAIGN PERFORMANCE                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Leads/yr: 85,000        │   │  │  Campaigns/yr: 850       │   │
│  │  MQL conversion: 12%     │   │  │  Avg ROI: 3.2×           │   │
│  │  SQL conversion: 28%     │   │  │  < 1× ROI: 35% of        │   │
│  │  Avg CPL: $285 (target   │   │  │  campaigns               │   │
│  │  $200)                   │   │  │  > 5× ROI: 8% of         │   │
│  │  Mkt-sourced pipeline:   │   │  │  campaigns               │   │
│  │  22% ($62M)              │   │  │  Cost/opportunity: $425  │   │
│  │  Mkt-influenced: 15%     │   │  │  Campaign velocity: 18   │   │
│  │  Demand score: B- (72)   │   │  │  days (plan→launch)     │   │
│  │                           │   │  │  Campaign score: B(78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CONTENT MARKETING                     │  BRAND HEALTH                           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Content pieces/yr: 2500 │   │  │  Brand awareness: 42%    │   │
│  │  Blog posts: 850         │   │  │  (target 55%)            │   │
│  │  Whitepapers: 48         │   │  │  Unaided recall: 18%     │   │
│  │  Webinars: 120           │   │  │  Brand search vol: +15%  │   │
│  │  Content-driven leads:   │   │  │  YoY                    │   │
│  │  22%                     │   │  │  Share of voice: 12%     │   │
│  │  Content reuse rate: 35% │   │  │  Brand sentiment: 62%    │   │
│  │  Content score: C+ (68)  │   │  │  positive (target 75%)  │   │
│  │                           │   │  │  Brand score: C+ (68)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  MARKETING OPERATIONS                  │  MARKETING EFFICIENCY                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Marketing budget: $18M  │   │  │  CAC ratio (mkt): 0.45   │   │
│  │  Headcount: 45           │   │  │  Mkt % of revenue: 21%   │   │
│  │  Tool stack: 28 tools    │   │  │  LTV/CAC (mkt): 9.3      │   │
│  │  Tool utilization: 62%   │   │  │  Pipeline/$, mkt spend:  │   │
│  │  Data hygiene: 72%       │   │  │  $3.44 (target $5)       │   │
│  │  Lead scoring accuracy:  │   │  │  Payback period: 8.5 mo  │   │
│  │  68%                     │   │  │  Efficiency score: B+(82)│   │
│  │  Ops score: C+ (68)      │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Demand generation funnel

| Funnel stage | Volume | Conversion | Target | Gap | Avg time in stage | Bottleneck | Action |
|---|---|---|---|---|---|---|---|
| **Total addressable market** (TAM) | 500,000 accounts | N/A | N/A | N/A | N/A | N/A | |
| **In-market** (intent signals) | 85,000 | 17% of TAM | 20% | -3% | N/A | Intent data coverage (65% of TAM) | Expand intent data sources |
| **Leads** (form fill, signup, event) | 85,000/yr | 100% of in-market | N/A | N/A | N/A | Inbound 58%, Outbound 28%, Event 14% | Increase inbound via content |
| **MQL** (marketing qualified) | 10,200 | 12% | 15% | -3% | 3.5 days | Lead scoring accuracy (68%) | Improve lead scoring model, add firmographic data |
| **SAL** (sales accepted) | 5,100 | 50% | 60% | -10% | 2.5 days | SDR capacity, lead quality mismatch | SLA for SDR follow-up (< 2 hours) |
| **SQL** (sales qualified) | 2,856 | 28% of leads | 35% | -7% | 5.5 days | Qualification framework (BANT/MEDDIC) | Standardize qualification, add SDR training |
| **Opportunity** | 1,428 | 50% of SQL | 55% | -5% | 8.5 days | Discovery quality, champion identification | Improve discovery playbook |
| **Closed won** | 314 | 22% of opps | 25% | -3% | 58 days | Sales cycle (see Sales & GTM dashboard) | |

### Campaign performance by channel

| Channel | Campaigns/yr | Budget | Leads generated | Cost per lead | Opps created | Cost per opp | Pipeline generated | ROI | Top performer |
|---|---|---|---|---|---|---|---|---|---|
| **Paid search** (Google/Bing) | 185 | $4.2M | 28,500 | $147 | 520 | $8,077 | $18.5M | 4.4× | Brand terms (8.2×), competitor terms (3.5×) |
| **Paid social** (LinkedIn, Meta) | 165 | $3.8M | 18,200 | $209 | 285 | $13,333 | $9.8M | 2.6× | LinkedIn retargeting (4.5×) |
| **Content syndication** | 85 | $2.5M | 12,500 | $200 | 195 | $12,821 | $7.2M | 2.9× | Technical whitepapers (5.2×) |
| **Email marketing** | 120 | $1.2M | 8,500 | $141 | 165 | $7,273 | $5.8M | 4.8× | Nurture sequences (6.5×), newsletter (2.8×) |
| **Events/conferences** | 45 | $3.5M | 6,800 | $515 | 142 | $24,648 | $4.5M | 1.3× | Sponsored sessions (3.2×), booth only (0.8×) |
| **Webinars** | 120 | $0.8M | 5,200 | $154 | 85 | $9,412 | $3.2M | 4.0× | Customer case study webinars (7.5×) |
| **Partner co-marketing** | 38 | $0.6M | 2,800 | $214 | 42 | $14,286 | $1.8M | 3.0× | Integration partner webinars (4.8×) |
| **Direct mail/ABM** | 22 | $0.8M | 1,100 | $727 | 38 | $21,053 | $1.5M | 1.9× | Enterprise ABM (3.5×), generic (0.8×) |
| **Other** | 70 | $0.6M | 1,400 | $429 | 18 | $33,333 | $0.5M | 0.8× | |
| **Overall** | **850** | **$18M** | **85,000** | **$212** | **1,490** | **$12,080** | **$52.8M** | **3.2×** | |

### Content marketing performance

| Content type | Published/yr | Avg cost | Avg views/downloads | Leads generated | CPL | Reuse rate | Top 10% performance | Bottom 50% |
|---|---|---|---|---|---|---|---|---|
| **Blog posts** | 850 | $450 | 1,250 | 18/post | $25 | 25% | 5,000+ views, 80+ leads | < 200 views |
| **Whitepapers/guides** | 48 | $3,500 | 2,850 | 85/paper | $41 | 42% | 8,000+ downloads, 200+ leads | < 500 downloads |
| **Webinars** | 120 | $4,200 | 380 (live), 1,200 (on-demand) | 42/webinar | $100 | 55% | 800+ live, 5,000+ on-demand | < 100 live |
| **Case studies** | 35 | $5,500 | 1,850 | 28/case | $196 | 62% | 5,000+ views, 80+ leads | < 500 views |
| **Video/podcast** | 180 | $1,800 | 2,200 | 12/episode | $150 | 48% | 10,000+ views, 50+ leads | < 500 views |
| **Infographics** | 42 | $1,200 | 3,500 | 22/info | $55 | 35% | 15,000+ views, 60+ leads | < 800 views |
| **Email newsletter** | 52 | $800 | 28,500 subs | 85/issue | $9 | 15% | N/A (weekly cadence) | N/A |
| **Social media posts** | 1,200 | $85 | 2,800 avg | 3/post | $28 | 8% | 25,000+ impressions | < 500 impressions |
| **Overall** | **2,500** | **$1,250 avg** | **2,850 avg** | **22% lead rate** | **$57 avg** | **35%** | | |

### Brand health metrics

| Brand metric | Current | Target | Benchmark | Measurement method | Trend | Action |
|---|---|---|---|---|---|---|
| **Brand awareness** (aided) | 42% | 55% | 50% (category leader) | Annual brand survey, n=1,200 | +5% YoY | Increase brand campaigns, PR |
| **Unaided recall** ("name a vendor in X") | 18% | 30% | 25% (top 3) | Annual brand survey | +3% YoY | Category creation content, thought leadership |
| **Share of voice** (mentions vs competitors) | 12% | 20% | 15% (top 3) | Social listening, media monitoring | +2% YoY | Increase PR, analyst relations |
| **Brand search volume** | 28,500/mo | 45,000 | 35,000 (category) | Google Search Console, SEMrush | +15% YoY | SEO, content, demand gen |
| **Brand sentiment** (positive %) | 62% | 75% | 70% (industry) | Social listening, review sites | +3% YoY | Customer advocacy, community |
| **Net Promoter Score** (NPS) | 32 | 45 | 40 (SaaS) | Quarterly NPS survey | +5 YoY | Customer success, product quality |
| **Employer brand** (Glassdoor rating) | 4.0/5 | 4.3 | 4.2 (tech) | Glassdoor, LinkedIn | +0.1 YoY | Employer branding, culture |
| **Analyst rating** (Gartner/Forrester) | "Strong Performer" | "Leader" | "Leader" | Analyst evaluations | Upgraded from "Niche" | Analyst relations, product roadmap |
| **Overall** | **C+ (68)** | | | | | |

### Marketing operations and technology

| Operations metric | Current | Target | Issue | Action |
|---|---|---|---|---|
| **Tool stack consolidation** | 28 tools | < 20 | Tool sprawl, 38% unused, integration gaps | Audit tool stack, consolidate overlapping tools, target 20 tools |
| **Tool utilization** | 62% | 85% | 38% of features unused, paying for shelfware | Review tool contracts, train teams, remove unused tools |
| **Data hygiene** (email validity, enrichment) | 72% | 90% | 28% of contacts have missing/invalid data | Implement data enrichment, validation rules, deduplication |
| **Lead scoring accuracy** | 68% | 85% | 32% of MQLs are not actually qualified | Improve scoring model, add intent data, behavioral scoring |
| **Attribution model** | First-touch only | Multi-touch | Undercounts marketing influence on deals | Implement multi-touch attribution, track full funnel |
| **Marketing-sales SLA** | 65% compliance | 90% | 35% of MQLs not followed up within SLA | Implement SLA tracking, alert on breach, weekly review |
| **Overall** | **C+ (68)** | | | |

### Marketing efficiency ratios

| Efficiency metric | Current | Target | Formula | Trend | Action |
|---|---|---|---|---|---|
| **Marketing % of revenue** | 21% | < 18% | Total marketing spend / ARR | -2% | Improve efficiency, scale programs |
| **CAC ratio** (marketing portion) | 0.45 | < 0.35 | Marketing spend / New ARR | -0.05 | Improve conversion, reduce CPL |
| **LTV/CAC** (marketing) | 9.3 | > 12 | Customer LTV / Marketing CAC | +0.8 | Improve NRR, reduce churn |
| **Pipeline per marketing dollar** | $3.44 | > $5.00 | Pipeline generated / Marketing spend | +$0.35 | Improve campaign ROI, content reuse |
| **Marketing payback period** | 8.5 months | < 6 months | Marketing CAC / Monthly ARPU | -0.5 months | Improve lead-to-close velocity |
| **Marketing ROI** (total) | 3.2× | > 4.0× | (Pipeline × Win Rate) / Marketing Spend | +0.3× | Reallocate from < 1× to > 5× campaigns |
| **Overall** | **B+ (82)** | | | | |

## Action recommendations

1. **Campaign ROI optimization**: 35% of campaigns below 1× ROI; implement campaign post-mortem for all campaigns < 1×, reallocate budget from bottom 35% to top 10% performers, target < 20% below 1×
2. **Lead scoring improvement**: 68% accuracy, 32% of MQLs not qualified; implement predictive lead scoring, add intent data and firmographic enrichment, implement feedback loop from sales, target 85% accuracy
3. **Content reuse and atomization**: 35% content reuse rate; implement content atomization (1 whitepaper → 5 blog posts → 15 social posts → 1 webinar), create content library by use case/persona, target 60% reuse
4. **Brand awareness gap**: 42% aided vs 55% target; increase brand marketing investment, implement category creation content strategy, increase PR and analyst relations, target 50% awareness
5. **Marketing-sales SLA compliance**: 65% compliance; implement automated SLA tracking, add real-time alerts for SLA breach, weekly SLA review with sales leadership, target 90% compliance
6. **Tool stack consolidation**: 28 tools, 38% unused; audit all marketing tools, consolidate overlapping tools, renegotiate contracts, target < 20 tools and 85% utilization
7. **Multi-touch attribution**: First-touch attribution undercounts marketing influence; implement multi-touch attribution model, track full customer journey, report marketing-influenced AND marketing-sourced pipeline
8. **Event ROI improvement**: 1.3× ROI for events (lowest); shift budget from booth-only to sponsored sessions, implement pre-event and post-event nurture, improve lead capture, target 2.5× event ROI
9. **ABM program expansion**: 22 ABM campaigns, highest CPL but second-highest win rate; expand ABM to top 200 accounts, implement personalized content, add executive engagement, target 50 ABM campaigns
10. **Weekly marketing review**: review demand generation, campaign performance, content marketing, brand health, marketing operations, and marketing efficiency with marketing leadership and executive team



- The "we need more leads" panic → responding to pipeline pressure by buying more leads without fixing the funnel; if MQL→SQL conversion is 28% and SQL→Opp is 50%, the bottleneck is not lead volume — it's lead quality and conversion; doubling leads with the same conversion rates doubles cost without doubling revenue
- The last-touch attribution lie → crediting the last click (usually branded search or direct) for the deal while ignoring the 6 months of content, events, and nurture that created the demand; last-touch attribution makes brand and content look like cost centers when they're actually the demand engine
- The content factory without strategy → producing 2,500 content pieces/year without a clear content strategy, persona mapping, or distribution plan; 65% of content is used once and forgotten — the content factory is producing assets, not results
- The brand-as-billboard → treating brand as a logo, color palette, and tagline rather than the sum of every customer interaction; brand is built in the product experience, the support ticket, the billing email, and the sales call — not in the brand guidelines PDF
- The event ROI blind spot → measuring event success by booth traffic and badge scans rather than pipeline and revenue; the 1.3× event ROI is the lowest of all channels, but 70% of event budget is spent on booth-only presence — the ROI is low because the strategy is "show up and hope"

## Related

- Same class: [dashboard-executive-kpi](dashboard-executive-kpi.md) — executive KPI
- Same class: [dashboard-sales-gtm-motion](dashboard-sales-gtm-motion.md) — sales and GTM motion
- Same class: [dashboard-market-growth](dashboard-market-growth.md) — market growth and expansion
- Same class: [dashboard-customer-journey](../../product-manager/discovery/metrics--dashboard-customer-journey.md) — customer journey
- Same class: [dashboard-pricing-packaging](../../product-manager/strategy/dashboard-pricing-packaging.md) — pricing and packaging
- References: HubSpot — *State of Marketing Report*; Gartner — *CMO Spend Survey*; SiriusDecisions — *Demand Waterfall*; Google — *Zero Moment of Truth*; Content Marketing Institute — *B2B Content Marketing Benchmarks*; LinkedIn — *B2B Marketing Effectiveness*; ProfitWell — *SaaS Marketing Metrics*