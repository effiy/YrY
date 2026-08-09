---
title: pricing and packaging optimization dashboard
aliases:
- pricing dashboard
- packaging dashboard
- monetization dashboard
- revenue optimization dashboard
tags:
- dashboard
- pricing
- packaging
- monetization
- revenue
- conversion
- discount
category: product-manager/strategy
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- product-manager
- executive
benefit: pricing and packaging performance visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- plan mix, conversion, discount effectiveness, WTP, expansion revenue, and churn-by-plan defined
related:
- ./dashboard-product-strategy.md
- ./dashboard-innovation-portfolio.md
- ../discovery/metrics--dashboard-product-portfolio.md
- ../discovery/metrics--dashboard-customer-health.md
- ../discovery/metrics--dashboard-feature-adoption.md
tacit: false
---

# pricing and packaging optimization dashboard

> **As a** product manager, **I want to** track pricing and packaging performance, **so that** every plan is priced for value, packages drive the right customer behavior, discounts are strategic (not desperate), and revenue grows with usage.

> Pricing is the most powerful growth lever — and the most neglected. This dashboard tracks plan mix, conversion funnel, discount effectiveness, willingness-to-pay, expansion revenue, churn by plan, and competitive pricing positioning — turning pricing from an annual gut-feel decision into a continuously measured, data-driven growth engine.

## Summary

- 6 pricing dimensions: plan mix, conversion funnel, discount effectiveness, willingness-to-pay, expansion revenue, churn by plan
- 4 plan tiers: Free (62% of users), Starter ($29/mo, 18%), Pro ($99/mo, 12%), Enterprise ($499/mo, 8%); 85,000 total paying customers
- ARR: $24.8M; ARPU (paying): $292/mo; average revenue per user (all): $24/mo; expansion revenue: $3.2M/yr
- Free→Paid conversion: 4.2% (target 5%); Starter→Pro: 18%; Pro→Enterprise: 12%; overall expansion: 22% of ARR from upgrades
- Discount rate: 22% of deals discounted; average discount: 18% (target < 15%); 8% of deals at > 30% discount (margin risk)
- Pricing changes: 3 in 24 months; last change: +12% Pro, +15% Enterprise (2026-Q1); 2.8% churn attributed to pricing
- Dashboard reviewed monthly; pricing strategy review quarterly with product, finance, and executive leadership

## Core viewpoints

- Price is a signal of value, not a cost calculation — cost-plus pricing leaves money on the table; value-based pricing captures the value you create for the customer
- The free plan is a marketing expense, not a charity — every free user should have a path to paid; if the free plan has no natural upgrade trigger, it's not a growth engine, it's a cost center
- Discounts are a drug — they boost short-term conversion but create long-term dependency; if more than 20% of your deals are discounted, you're not selling value, you're buying customers
- Packaging is product design — the feature you put in Pro vs Enterprise is the most important product decision you make; it determines who buys what, how much they pay, and whether they stay

## Key information

### 6-panel pricing overview

```
┌──────────────────────────────────────────────────────────────────┐
│  PLAN MIX                          │  CONVERSION FUNNEL                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Free: 62% (1.3M users) │   │  │  Free→Paid: 4.2%         │   │
│  │  Starter: 18% ($29/mo)  │   │  │  Starter→Pro: 18%        │   │
│  │  Pro: 12% ($99/mo)      │   │  │  Pro→Enterprise: 12%     │   │
│  │  Enterprise: 8% ($499)  │   │  │  Trial→Paid: 32%         │   │
│  │  Paying: 85,000          │   │  │  Expansion MRR: +$268K/mo│   │
│  │  ARPU: $292/mo (paying) │   │  │  Contraction MRR: -$85K/mo│   │
│  │  ARR: $24.8M             │   │  │  Net revenue retention:112%│  │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DISCOUNT EFFECTIVENESS            │  WILLINGNESS-TO-PAY                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Discounted deals: 22%  │   │  │  Van Westendorp: $79/mo  │   │
│  │  Avg discount: 18%       │   │  │  Optimal price: $89/mo   │   │
│  │  >30% discount: 8%       │   │  │  Price sensitivity: 2.8   │   │
│  │  Annual: 28% of deals    │   │  │  Feature value (Pro):+$45│   │
│  │  Discount churn: 35%     │   │  │  Feature value (Ent):+$280│  │
│  │  Undiscounted churn: 18% │   │  │  Competitor price: $85/mo │   │
│  │  Discount score: C+      │   │  │  WTP score: B+ (84)      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  EXPANSION REVENUE                 │  CHURN BY PLAN                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Expansion ARR: $3.2M/yr │   │  │  Free churn: 8.5%/mo     │   │
│  │  Seat expansion: 45%     │   │  │  Starter churn: 4.2%/mo  │   │
│  │  Plan upgrade: 35%       │   │  │  Pro churn: 2.8%/mo      │   │
│  │  Add-on purchase: 15%    │   │  │  Enterprise churn: 1.2%/mo│   │
│  │  Usage-based: 5%         │   │  │  Pricing churn: 2.8%     │   │
│  │  Avg expansion: +$42/mo  │   │  │  Feature churn: 12%      │   │
│  │  Expansion score: B+     │   │  │  Churn score: B (80)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Plan mix and revenue

| Plan | Users | % of total | Paying | MRR | ARPU | ARR contribution | YoY growth |
|---|---|---|---|---|---|---|---|
| **Free** | 1,300,000 | 62% | No | $0 | $0 | $0 (0%) | +18% |
| **Starter** ($29/mo) | 380,000 | 18% | Yes | $1.38M | $29 | $4.4M (18%) | +22% |
| **Pro** ($99/mo) | 255,000 | 12% | Yes | $3.78M | $99 | $12.1M (49%) | +28% |
| **Enterprise** ($499/mo) | 170,000 | 8% | Yes | $10.6M | $499 | $8.3M (33%) | +35% |
| **Total** | **2,105,000** | | **85,000 (4%)** | **$15.8M** | **$292 (paying)** | **$24.8M** | **+25%** |

### Plan feature packaging

| Feature group | Free | Starter | Pro | Enterprise | Upgrade driver |
|---|---|---|---|---|---|
| **Core features** | Limited (5 projects) | Unlimited | Unlimited | Unlimited | Project limit |
| **Storage** | 1 GB | 10 GB | 100 GB | 1 TB | Storage cap |
| **Collaborators** | 2 | 5 | 20 | Unlimited | Team size |
| **API access** | No | 1,000 calls/mo | 10,000 calls/mo | 100,000 calls/mo | API volume |
| **Analytics** | Basic | Standard | Advanced | Custom | Analytics depth |
| **SSO/SAML** | No | No | No | Yes | Enterprise requirement |
| **Audit logs** | No | No | No | Yes | Compliance |
| **Priority support** | No | No | Yes | Yes (dedicated) | Support SLA |
| **Custom integrations** | No | No | No | Yes | Custom needs |
| **SLA** | None | 99.5% | 99.9% | 99.95% | Reliability |

### Conversion funnel

| Funnel stage | Users | Conversion rate | 3 months ago | Target | Time to convert |
|---|---|---|---|---|---|
| **Signup → Activation** | 2.1M → 1.55M | 74% | 72% | 80% | Day 1 |
| **Activation → Engagement** (W1) | 1.55M → 820K | 53% | 50% | 60% | Day 7 |
| **Engagement → Trial** | 820K → 180K | 22% | 20% | 25% | Day 14 |
| **Trial → Paid** | 180K → 58K | 32% | 30% | 40% | Day 21 |
| **Free → Paid** (all paths) | 1.3M → 55K | 4.2% | 3.8% | 5.0% | 28 days |
| **Starter → Pro** | 380K → 68K | 18% | 16% | 22% | 8 months |
| **Pro → Enterprise** | 255K → 30K | 12% | 10% | 15% | 14 months |
| **Overall conversion health** | | | | | **B+ (82)** |

### Conversion by acquisition channel

| Channel | Signups | Free→Paid | Trial→Paid | ARPU (paying) | CAC | LTV/CAC |
|---|---|---|---|---|---|---|
| **Organic search** | 520K | 4.8% | 35% | $285 | $42 | 8.2× |
| **Paid search** | 380K | 3.5% | 28% | $245 | $85 | 3.2× |
| **Word of mouth** | 280K | 5.2% | 38% | $320 | $18 | 18.5× |
| **Content marketing** | 220K | 4.5% | 32% | $275 | $55 | 5.8× |
| **Social media** | 180K | 3.2% | 25% | $230 | $62 | 4.2× |
| **Partnerships** | 85K | 6.5% | 42% | $380 | $95 | 4.8× |
| **Sales (outbound)** | 25K | N/A | 65% | $520 | $280 | 2.2× |
| **Overall** | **1.69M** | **4.2%** | **32%** | **$292** | **$58** | **5.8×** |

### Discount effectiveness

| Discount tier | Deals | % of total | Avg contract | Churn rate (12 mo) | LTV impact | Margin impact |
|---|---|---|---|---|---|---|
| **No discount** | 78% | 66,300 | $295/mo | 18% | Baseline | Full margin |
| **5-15%** (standard) | 10% | 8,500 | $268/mo | 22% | -8% LTV | -12% margin |
| **16-25%** (aggressive) | 4% | 3,400 | $235/mo | 28% | -22% LTV | -25% margin |
| **26-35%** (risky) | 5% | 4,250 | $198/mo | 35% | -45% LTV | -40% margin |
| **>35%** (distressed) | 3% | 2,550 | $155/mo | 52% | -68% LTV | -55% margin |
| **Overall** | **22% discounted** | **85,000** | | | | |

### Discount by reason

| Discount reason | % of discounts | Avg discount | Conversion rate | 12-month retention | Assessment |
|---|---|---|---|---|---|
| **Annual contract** (prepay) | 35% | 15% | 45% | 82% | Good — prepay discount is ROI-positive |
| **Volume/seat count** | 25% | 18% | 55% | 75% | OK — volume should be standard pricing |
| **Non-profit/education** | 12% | 40% | 60% | 88% | Good — mission-driven, low churn |
| **Competitive win-back** | 10% | 28% | 32% | 45% | Poor — high churn, low loyalty |
| **Startup program** | 8% | 35% | 38% | 52% | OK — but growth-based pricing is better |
| **Customer complaint** | 5% | 22% | 28% | 35% | Bad — discounting unhappy customers |
| **End-of-quarter push** | 5% | 25% | 25% | 40% | Bad — sales-driven, not value-driven |

### Willingness-to-pay (WTP) analysis

| Van Westendorp metric | Starter | Pro | Enterprise | Notes |
|---|---|---|---|---|
| **Too cheap** (quality doubt) | < $15 | < $49 | < $199 | Below this, perceived as low quality |
| **Bargain** (good value) | $15-$25 | $49-$79 | $199-$399 | High conversion zone |
| **Expensive** (but still buy) | $25-$39 | $79-$129 | $399-$649 | Acceptable but friction |
| **Too expensive** (won't buy) | > $39 | > $129 | > $649 | Drop-off cliff |
| **Optimal price point** (indifference) | $25 | $89 | $449 | Where equal number say cheap/expensive |
| **Current price** | $29 | $99 | $499 | Above optimal for Starter, near for Pro |
| **Recommended price** | $25 | $99 | $549 | Lower Starter to expand, raise Enterprise |

### Feature value by plan (conjoint analysis)

| Feature | Starter value | Pro value | Enterprise value | WTP driver |
|---|---|---|---|---|
| **Unlimited projects** | +$8/mo | +$12/mo | +$15/mo | Medium |
| **Storage increase** | +$5/mo | +$10/mo | +$25/mo | Medium |
| **Team collaboration** | +$8/mo | +$15/mo | +$35/mo | High |
| **API access** | +$10/mo | +$18/mo | +$45/mo | High |
| **Advanced analytics** | +$5/mo | +$12/mo | +$28/mo | Medium |
| **SSO/SAML** | N/A | N/A | +$85/mo | Very high |
| **Audit logs** | N/A | N/A | +$65/mo | High |
| **Priority support** | N/A | +$8/mo | +$35/mo | Medium |
| **SLA** | +$3/mo | +$8/mo | +$42/mo | High |
| **Total feature value** | +$39/mo | +$83/mo | +$375/mo | |

### Expansion revenue

| Expansion type | MRR impact | % of expansion | Customers | Avg increase | Time to expand |
|---|---|---|---|---|---|
| **Seat expansion** | +$120K/mo | 45% | 2,800 | +$43/mo | 6 months |
| **Plan upgrade** (Starter→Pro) | +$95K/mo | 35% | 1,360 | +$70/mo | 8 months |
| **Plan upgrade** (Pro→Enterprise) | +$62K/mo | 23% | 220 | +$282/mo | 14 months |
| **Add-on purchase** | +$40K/mo | 15% | 1,850 | +$22/mo | 5 months |
| **Usage-based overage** | +$13K/mo | 5% | 420 | +$31/mo | 3 months |
| **Total expansion** | **+$268K/mo** | | | **+$42/mo** | |
| **Annual expansion ARR** | **$3.2M** | | | | |

### Churn by plan

| Churn metric | Free | Starter | Pro | Enterprise | Overall |
|---|---|---|---|---|---|
| **Monthly churn rate** | 8.5% | 4.2% | 2.8% | 1.2% | 4.8% |
| **Annual churn rate** | 65% | 40% | 29% | 14% | 45% |
| **Revenue churn** (MRR) | $0 | $58K/mo | $106K/mo | $127K/mo | $291K/mo |
| **Churn reason: pricing** | 0% | 15% | 8% | 2% | 2.8% |
| **Churn reason: feature gap** | 22% | 18% | 12% | 5% | 12% |
| **Churn reason: inactive** | 45% | 20% | 10% | 3% | 28% |
| **Churn reason: competitor** | 8% | 12% | 15% | 8% | 10% |
| **Churn reason: company closed** | 5% | 8% | 8% | 12% | 7% |
| **Churn reason: other** | 20% | 27% | 47% | 70% | 40% |

### Competitive pricing landscape

| Competitor | Free plan | Starter equiv | Pro equiv | Enterprise equiv | Our position |
|---|---|---|---|---|---|
| **Competitor A** | Yes (limited) | $25/mo | $89/mo | $399/mo | We're 16% higher on Starter, 11% on Pro |
| **Competitor B** | No | $35/mo | $119/mo | $599/mo | We're 17% lower on Starter, 17% on Pro |
| **Competitor C** | Yes (generous) | $19/mo | $79/mo | Custom | We're 53% higher on Starter, 25% on Pro |
| **Competitor D** | Yes | $0 (freemium) | $49/mo | $299/mo | We're 2× on Pro, 67% on Enterprise |
| **Our price** | Yes | **$29/mo** | **$99/mo** | **$499/mo** | |

## Action recommendations

1. **Starter price optimization**: $29 is above WTP optimal ($25); lower Starter to $25/mo or add features to justify $29, target 5% free→paid conversion
2. **Enterprise price increase**: WTP supports $549 (currently $499); raise Enterprise to $549/mo for new customers, grandfather existing, +$8.5M ARR potential
3. **Discount reduction program**: 22% of deals discounted, 8% at >30% (margin risk); implement discount approval workflow, cap at 25%, target < 15% average discount
4. **Annual contract incentive**: 35% of discounts are annual prepay; create standard annual pricing (2 months free) instead of custom discount per deal
5. **Pro→Enterprise upgrade acceleration**: 12% conversion, 14-month average; add SSO to Pro trial (time-limited), create Enterprise upgrade trigger at 15+ seats
6. **Feature gap churn**: 12% of paying churn is feature-driven; identify top 3 missing features for each plan, prioritize in roadmap
7. **Competitive positioning vs Competitor D**: 2× price on Pro, 67% on Enterprise; clearly differentiate on features, create comparison page, don't compete on price
8. **Add-on revenue expansion**: 15% of expansion from add-ons; create 3-5 new add-ons (extra storage, API packs, advanced analytics), bundle for Pro
9. **Usage-based pricing pilot**: 5% of expansion from usage; pilot usage-based component for API-heavy customers, target 10% of revenue from usage by Q4 2026
10. **Monthly pricing review**: review plan mix, conversion funnel, discount effectiveness, expansion revenue, churn by plan, and competitive pricing with product, finance, and executive leadership



- Pricing by committee → "let's put the whole leadership team in a room and pick a price"; pricing is a science, not a democracy — use WTP studies, conjoint analysis, and A/B tests, not gut feelings
- The free plan as a forever plan → "we'll make money on volume"; if your free plan is so generous that nobody needs to upgrade, it's not a funnel — it's a charity
- Discounting to close → "just give them 30% off to get the deal done"; a customer bought with a discount is a customer who will demand a discount to renew — and tell other customers
- Feature dumping in Enterprise → "just put everything in Enterprise"; Enterprise features should be things enterprises uniquely need (SSO, audit, compliance) — not features you wish you could charge more for
- Price changes as a surprise → "we're raising prices next month, good luck"; price changes should be communicated 3-6 months in advance, grandfathered for existing customers, and tied to new value delivery

## Related

- Same class: [dashboard-product-strategy](dashboard-product-strategy.md) — product strategy
- Same class: [dashboard-innovation-portfolio](dashboard-innovation-portfolio.md) — innovation portfolio
- Same class: [dashboard-product-portfolio](../discovery/metrics--dashboard-product-portfolio.md) — product portfolio
- Same class: [dashboard-customer-health](../discovery/metrics--dashboard-customer-health.md) — customer health
- Same class: [dashboard-feature-adoption](../discovery/metrics--dashboard-feature-adoption.md) — feature adoption
- References: Madhavan Ramanujam — *Monetizing Innovation*; Patrick Campbell — *ProfitWell Pricing Strategy*; Van Westendorp — *Price Sensitivity Meter*; Simon-Kucher — *Pricing Strategy Framework*; OpenView — *Product-Led Growth Pricing*; McKinsey — *The Power of Pricing*