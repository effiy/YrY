---
title: sales and go-to-market motion dashboard
aliases:
- sales dashboard
- GTM dashboard
- revenue motion dashboard
- pipeline health dashboard
- sales effectiveness dashboard
tags:
- dashboard
- sales
- gtm
- revenue
- pipeline
- win-rate
- quota
- sales-efficiency
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
benefit: pipeline health, sales efficiency, and GTM motion visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- pipeline health, win rate, sales cycle, quota attainment, sales efficiency, and channel performance defined
related:
- ./dashboard-executive-kpi.md
- ./dashboard-market-growth.md
- ../industry/dashboard-competitive-intelligence.md
- ../../product-manager/strategy/dashboard-pricing-packaging.md
- ../../product-manager/discovery/metrics/dashboard-customer-health.md
tacit: false
---

# sales and go-to-market motion dashboard

> **As an** executive, **I want to** track sales and GTM motion health, **so that** every pipeline stage is measured, every rep is enabled, every deal is qualified, and revenue generation is a systematic, predictable, and continuously improving practice — not a "this quarter we'll make it up in the last 2 weeks."

> Revenue is the engine of the business. This dashboard tracks pipeline health, win rate, sales cycle, quota attainment, sales efficiency, and channel performance — turning the GTM motion from "the CRM says we're fine" into a rigorously measured, forecastable, and continuously improving revenue machine.

## Summary

- 6 GTM dimensions: pipeline health, win rate, sales cycle, quota attainment, sales efficiency, channel performance
- $85M ARR; $120M new bookings target; 48 sales reps (32 AE, 16 SDR); 8 sales regions; 12 channel partners; 2,850 opportunities/year
- Pipeline health: $285M total pipeline; 3.2× pipeline coverage (target 4×); 42% stage 1 (discovery); 8% stage 5 (negotiation); 35% deals stalled > 30 days
- Win rate: 22% overall win rate; 35% competitive deals; 18% new logo; 45% expansion; 8% deals lost to "no decision" (biggest competitor)
- Sales cycle: 58 days avg (target 45); 85 days enterprise; 28 days SMB; 12 days expansion; 18% deals with > 2× avg cycle
- Dashboard reviewed weekly; GTM review with executive leadership biweekly

## Core viewpoints

- Pipeline coverage is a vanity metric if the pipeline is stale — 3.2× coverage looks healthy, but 35% of deals stalled > 30 days means the "coverage" is inflated by deals that will never close; pipeline velocity matters more than pipeline volume
- "No decision" is your biggest competitor — 8% of deals lost to "no decision" means the prospect chose to do nothing; this is higher than any single competitor's win rate and represents a failure to articulate urgency and value, not a failure to compete
- The enterprise sales cycle is a product problem, not a sales problem — if enterprise deals take 85 days (vs 45 target), the bottleneck is likely security review, legal, procurement, or technical evaluation; shortening the sales cycle is a cross-functional (product, engineering, legal, security) initiative, not a sales training initiative
- Sales efficiency (CAC ratio) is the bridge between GTM and finance — a CAC payback period of 18 months tells you whether growth is sustainable; growth at any cost is growth at the cost of the company

## Key information

### 6-panel GTM overview

```
┌──────────────────────────────────────────────────────────────────┐
│  PIPELINE HEALTH                       │  WIN RATE                              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total pipeline: $285M   │   │  │  Overall win rate: 22%   │   │
│  │  Coverage: 3.2× (target  │   │  │  Competitive: 35%         │   │
│  │  4×)                     │   │  │  New logo: 18%            │   │
│  │  Stage 1 (discovery): 42%│   │  │  Expansion: 45%           │   │
│  │  Stage 5 (negotiation):  │   │  │  Lost to competitor: 15% │   │
│  │  8%                       │   │  │  Lost to no decision: 8% │   │
│  │  Deals stalled > 30d: 35%│   │  │  Disqualified: 55%        │   │
│  │  Pipeline score: B- (72) │   │  │  Win rate score: B (78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SALES CYCLE                           │  QUOTA ATTAINMENT                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Avg cycle: 58 days      │   │  │  Quota attainment: 72%   │   │
│  │  Enterprise: 85 days     │   │  │  Reps > 100%: 18 (38%)   │   │
│  │  SMB: 28 days            │   │  │  Reps 80-100%: 15 (31%)  │   │
│  │  Expansion: 12 days      │   │  │  Reps 50-80%: 10 (21%)   │   │
│  │  > 2× avg: 18% of deals  │   │  │  Reps < 50%: 5 (10%)     │   │
│  │  Stage duration skew:    │   │  │  Ramp quota: 65% (target │   │
│  │  Security review 18 days │   │  │  80%)                    │   │
│  │  Cycle score: C+ (68)    │   │  │  Quota score: B- (72)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SALES EFFICIENCY                      │  CHANNEL PERFORMANCE                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  CAC ratio: 1.2 (target  │   │  │  Channel revenue: 22%    │   │
│  │  < 1.0)                  │   │  │  Active partners: 12      │   │
│  │  CAC payback: 18 months  │   │  │  Partner-sourced: 35%    │   │
│  │  LTV/CAC: 4.2 (target 5) │   │  │  Partner-influenced: 42% │   │
│  │  SDR→AE conversion: 42%  │   │  │  Partner win rate: 28%   │   │
│  │  Cost per meeting: $850  │   │  │  Partner pipeline: $52M   │   │
│  │  Efficiency score: B(78) │   │  │  Channel score: B- (72)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Pipeline health by stage

| Pipeline stage | Count | Value | % of total | Avg age (days) | Stalled (> 30d) | Conversion to next | Health |
|---|---|---|---|---|---|---|---|
| **Stage 1 — Discovery** | 480 | $120M | 42% | 18 | 28% | 35% | Yellow — too much at top, slow qualification |
| **Stage 2 — Qualification** | 245 | $68M | 24% | 22 | 32% | 42% | Yellow — BANT/MEDDIC not applied early |
| **Stage 3 — Evaluation/POC** | 148 | $45M | 16% | 35 | 38% | 28% | Red — bottleneck, POC scope creep |
| **Stage 4 — Proposal/Negotiation** | 85 | $30M | 10% | 28 | 22% | 55% | Yellow — legal/procurement delays |
| **Stage 5 — Contracting** | 42 | $22M | 8% | 15 | 12% | 78% | Green — healthy close rate |
| **Overall** | **1,000** | **$285M** | **100%** | **22** | **35%** | **35%** | |

### Win/loss analysis by deal type

| Deal type | Opportunities | Won | Lost to competitor | Lost to no decision | Disqualified | Win rate | Avg deal size | Top competitor |
|---|---|---|---|---|---|---|---|---|
| **New logo — Enterprise** | 285 | 45 (16%) | 55 (19%) | 32 (11%) | 153 (54%) | 18% | $280K | AWS (22%), Azure (18%), DIY (15%) |
| **New logo — SMB** | 520 | 85 (16%) | 72 (14%) | 58 (11%) | 305 (59%) | 16% | $35K | Open source (28%), niche vendors (22%) |
| **Expansion — Upsell** | 380 | 155 (41%) | 28 (7%) | 12 (3%) | 185 (49%) | 45% | $85K | N/A (incumbent advantage) |
| **Expansion — Cross-sell** | 245 | 95 (39%) | 18 (7%) | 8 (3%) | 124 (51%) | 42% | $55K | Point solutions (35%) |
| **Renewal** | 580 | 495 (85%) | 18 (3%) | 12 (2%) | 55 (10%) | 85% | $120K | Competitor migration (8%) |
| **Channel/Partner** | 420 | 118 (28%) | 52 (12%) | 28 (7%) | 222 (53%) | 28% | $95K | Partner conflict (15%) |
| **Overall** | **2,850** | **627 (22%)** | **243 (9%)** | **150 (5%)** | **1,044 (37%)** | **22%** | **$95K** | |

### Sales cycle by segment

| Segment | Avg cycle | Target | Gap | Stage 1-2 | Stage 3 (POC) | Stage 4-5 (Legal/Proc) | Bottleneck | Acceleration lever |
|---|---|---|---|---|---|---|---|---|
| **Enterprise (> 5K employees)** | 85 days | 60 days | +25 | 18 days | 28 days | 22 days | Security review (18 days avg) | Pre-completed security questionnaire, SOC2/Vanta |
| **Mid-market (500-5K)** | 52 days | 40 days | +12 | 12 days | 18 days | 10 days | POC scope creep (adds 8 days) | Standardized POC scope, success criteria |
| **SMB (< 500)** | 28 days | 25 days | +3 | 8 days | 8 days | 5 days | Self-service onboarding gap | Product-led growth, free trial→paid |
| **Expansion (existing customer)** | 12 days | 10 days | +2 | 5 days | 3 days | 2 days | Procurement (new SKU) | Pre-approved SKU, usage-based upgrade |
| **Overall** | **58 days** | **45 days** | **+13** | **12 days** | **18 days** | **12 days** | | |

### Quota attainment distribution

| Rep tier | Count | Quota | Avg attainment | % > 100% | % < 50% | Ramp time (months) | Avg deal size | Pipeline coverage |
|---|---|---|---|---|---|---|---|---|
| **Enterprise AE** | 12 | $2.5M | 68% | 3 (25%) | 2 (17%) | 6 | $280K | 2.8× |
| **Mid-market AE** | 14 | $1.2M | 74% | 6 (43%) | 1 (7%) | 4 | $95K | 3.2× |
| **SMB AE** | 6 | $600K | 78% | 4 (67%) | 0 | 3 | $35K | 3.5× |
| **SDR (inbound)** | 8 | 45 meetings/mo | 82% | 5 (63%) | 0 | 2 | N/A | N/A |
| **SDR (outbound)** | 8 | 35 meetings/mo | 65% | 2 (25%) | 2 (25%) | 3 | N/A | N/A |
| **Overall** | **48** | **$4.5M avg** | **72%** | **18 (38%)** | **5 (10%)** | **4** | **$95K** | **3.2×** |

### Sales efficiency metrics

| Efficiency metric | Current | Target | Benchmark | Trend | Formula | Action |
|---|---|---|---|---|---|---|
| **CAC ratio** (S&M spend / new ARR) | 1.2 | < 1.0 | 0.8 (SaaS median) | -0.1 | Total S&M / New ARR | Reduce SDR cost per meeting, improve inbound |
| **CAC payback** (months) | 18 | < 12 | 12 (SaaS median) | -2 | CAC / (ARPU × Gross Margin) | Shorten sales cycle, increase ASP |
| **LTV/CAC** | 4.2 | > 5.0 | 5.0 (SaaS benchmark) | +0.3 | (ARPU × GM × Life) / CAC | Improve NRR, reduce churn |
| **SDR→AE conversion** | 42% | 55% | 50% (industry) | +2% | SQLs → Opportunities / Total SQLs | Improve qualification, BANT/MEDDIC |
| **Cost per meeting** | $850 | $500 | $600 (industry) | -$50 | SDR cost / meetings booked | Increase inbound, improve SDR efficiency |
| **Magic number** (S&M efficiency) | 0.7 | > 1.0 | 0.8 (SaaS) | +0.1 | Net New ARR / Prior Q S&M | Improve expansion, reduce S&M spend growth |
| **Overall** | **B (78)** | | | | | |

### Channel and partner performance

| Partner tier | Partners | Revenue contribution | Partner-sourced pipeline | Partner win rate | Avg deal size | Partner conflict rate | Training completion | Certification |
|---|---|---|---|---|---|---|---|---|
| **Strategic (Tier 1)** | 3 | $12.5M (15%) | $28M | 32% | $180K | 5% | 92% | 3/3 certified |
| **Premier (Tier 2)** | 5 | $6.8M (8%) | $15M | 25% | $95K | 12% | 78% | 4/5 certified |
| **Registered (Tier 3)** | 4 | $2.2M (3%) | $9M | 18% | $45K | 18% | 55% | 1/4 certified |
| **Inactive** | 8 | $0 | $0 | N/A | N/A | N/A | 0% | 0/8 |
| **Overall** | **20** | **$21.5M (22%)** | **$52M** | **28%** | **$95K** | **12%** | **62%** | **8/20** |

## Action recommendations

1. **Pipeline coverage improvement**: 3.2× vs 4× target; increase top-of-funnel by 25%, invest in SDR outbound (65% attainment), add demand gen campaigns, target 4× coverage
2. **Stalled deal recovery**: 35% of deals stalled > 30 days; implement deal inspection cadence, add "next step" SLA (7 days max), flag stalled deals at 21 days, target < 20% stalled
3. **Enterprise cycle acceleration**: 85 days vs 60 target; pre-complete security reviews, create standardized legal/procurement playbook, add deal desk, target 65 days
4. **"No decision" reduction**: 8% of deals lost to no decision (costing $18M/year); implement MEDDIC qualification, create business case templates, add executive sponsor program, target < 5%
5. **Quota attainment improvement**: 72% overall, 10% of reps < 50%; implement performance improvement plans, add deal coaching, review territory assignment, target 80% attainment
6. **SDR efficiency**: $850 cost per meeting vs $500 target; improve inbound conversion, add SDR enablement tools, optimize SDR→AE handoff, target $600 cost per meeting
7. **Channel activation**: 8 inactive partners (40%); implement partner enablement program, add partner success manager, create partner portal, target 80% active partners
8. **POC optimization**: Stage 3 is the bottleneck (38% stalled, 28% conversion); standardize POC scope, define success criteria upfront, add POC-to-close playbook, target 40% conversion
9. **Self-service PLG motion**: SMB cycle 28 days but could be 7 with self-service; implement free trial, add product-led growth flow, automate onboarding, target 20% SMB through PLG
10. **Weekly GTM review**: review pipeline health, win rate, sales cycle, quota attainment, sales efficiency, and channel performance with sales leadership and executive team



- The pipeline stuffing quarter-end → pulling forward stage 1 deals to make pipeline look healthy at quarter-end; the 42% stage 1 concentration is a warning sign — if those deals were real, they'd move to stage 2 within 14 days, and 35% haven't moved in 30 days
- The "we'll make it up in Q4" forecast → relying on a back-loaded year where 45% of annual quota is in Q4; when Q4 underperforms, there's no time to recover — this is not a forecast, it's a hope with a spreadsheet
- The win rate denominator game → reporting win rate as "won / (won + lost)" to exclude disqualified deals; the real win rate is "won / total opportunities" — 22% vs 35% is a 13-point gap that hides the true cost of qualification failure
- The BANT-in-2026 trap → qualifying on Budget, Authority, Need, Timeline when modern B2B buyers don't have budget until they have a solution; the 18% of deals that go through full cycle then lose to "no decision" were BANT-qualified but never had a compelling event
- The channel conflict blind spot → 12% channel conflict rate means 1 in 8 partner deals has a direct sales conflict; the partner win rate drops from 32% to 18% when conflict exists — channel conflict is a revenue killer that shows up as "partner doesn't trust us" not as "lost deal"

## Related

- Same class: [dashboard-executive-kpi](dashboard-executive-kpi.md) — executive KPI
- Same class: [dashboard-market-growth](dashboard-market-growth.md) — market growth and expansion
- Same class: [dashboard-competitive-intelligence](../industry/dashboard-competitive-intelligence.md) — competitive intelligence
- Same class: [dashboard-pricing-packaging](../../product-manager/strategy/dashboard-pricing-packaging.md) — pricing and packaging
- Same class: [dashboard-customer-health](../../product-manager/discovery/metrics/dashboard-customer-health.md) — customer health
- References: Jason Lemkin — *SaaStr Metrics*; David Skok — *For Entrepreneurs: SaaS Metrics 2.0*; Winning by Design — *Bowtie Funnel Model*; MEDDIC — *Qualification Framework*; Bain & Company — *B2B Sales Benchmarking*; Insight Partners — *SaaS GTM Playbook*; Pavilion — *GTM Benchmark Report*