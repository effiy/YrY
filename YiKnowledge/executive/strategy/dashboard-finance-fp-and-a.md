---
title: finance and fp-and-a health dashboard
aliases:
- finance dashboard
- FP&A dashboard
- financial planning dashboard
- runway dashboard
- unit economics dashboard
- budget health dashboard
tags:
- dashboard
- finance
- fp-and-a
- runway
- budget
- unit-economics
- gross-margin
- burn-rate
category: executive/strategy
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
- tech-lead
benefit: revenue, burn rate, runway, gross margin, and unit economics visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- revenue and ARR, burn rate and runway, gross margin, unit economics, budget variance, and cash management defined
related:
- ./dashboard-executive-kpi.md
- ./dashboard-market-growth.md
- ./dashboard-sales-gtm-motion.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
- ../../oncall-sre/observability/dashboard-cost-and-resource.md
tacit: false
---

# finance and FP&A health dashboard

> **As an** executive, **I want to** track financial health and FP&A discipline, **so that** every dollar is allocated with intent, every investment has a measurable return, runway is always visible, and financial management is a measured, transparent, and continuously improving practice — not a "the CFO will tell us if there's a problem" black box.

> Finance is the oxygen of the business. This dashboard tracks revenue and ARR, burn rate and runway, gross margin, unit economics, budget variance, and cash management — turning financial management from a monthly board-deck scramble into a real-time, transparent, and continuously improving operational discipline.

## Summary

- 6 financial dimensions: revenue and ARR, burn rate and runway, gross margin, unit economics, budget variance, cash management
- $85M ARR; $120M annual revenue; 1,250 employees; $18M monthly OPEX; 42 departments; $285M annual budget; 22 months runway
- Revenue and ARR: $85M ARR (target $100M); 115% NRR; $12.5M expansion ARR; $6.8M churned ARR; 92% gross retention; $10.5M recognized revenue/month
- Burn rate and runway: $18M/month gross burn; $12.5M/month net burn; 22 months runway (target > 24); $150M cash on hand; $45M debt facility
- Gross margin: 72% blended (target 78%); 82% software; 58% professional services; 45% hardware/IoT; COGS breakdown: cloud $2.8M/mo, support $1.5M/mo, services $0.8M/mo
- Dashboard reviewed monthly; financial review with executive leadership and board quarterly

## Core viewpoints

- Revenue is vanity, gross margin is sanity, cash flow is reality — a company with $100M ARR and 50% gross margin is less healthy than a company with $50M ARR and 85% gross margin; gross margin is the measure of business model quality, not just revenue growth
- Runway is a countdown, not a number — 22 months of runway means you have 22 months to either reach profitability or raise another round; if your plan to profitability takes 24 months and you have 22 months of runway, you don't have 22 months — you have a funding gap that needs to be closed now, not in month 21
- The budget is a hypothesis, not a contract — the $285M annual budget was built on assumptions (growth rate, hiring plan, cloud spend) that were true 6 months ago; 12% budget variance means the hypothesis was off by 12% — the question is whether you're updating the hypothesis or defending the original numbers
- Unit economics are the atomic unit of financial truth — if you can't answer "do we make money on each customer?" you can't answer "will we ever be profitable?"; CAC payback of 18 months and LTV/CAC of 4.2 means each customer becomes profitable in month 19 — the question is whether you have enough cash to fund 18 months of unprofitability per customer

## Key information

### 6-panel finance overview

```
┌──────────────────────────────────────────────────────────────────┐
│  REVENUE & ARR                         │  BURN RATE & RUNWAY                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  ARR: $85M (target $100) │   │  │  Gross burn: $18M/mo     │   │
│  │  NRR: 115% (target 120%) │   │  │  Net burn: $12.5M/mo     │   │
│  │  Expansion ARR: +$12.5M  │   │  │  Cash on hand: $150M     │   │
│  │  Churned ARR: -$6.8M     │   │  │  Debt facility: $45M     │   │
│  │  Gross retention: 92%    │   │  │  Runway: 22 months       │   │
│  │  Recognized rev: $10.5M  │   │  │  (target > 24 months)    │   │
│  │  Revenue score: B+ (82)  │   │  │  Zero-cash date: 2028-06 │   │
│  │                           │   │  │  Burn score: B- (72)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  GROSS MARGIN                          │  UNIT ECONOMICS                         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Blended GM: 72%         │   │  │  CAC payback: 18 months  │   │
│  │  Software GM: 82%        │   │  │  LTV/CAC: 4.2 (target 5)│   │
│  │  Services GM: 58%        │   │  │  ARPU: $3,950/mo        │   │
│  │  Hardware GM: 45%        │   │  │  Avg revenue/customer:   │   │
│  │  COGS: $5.1M/mo total    │   │  │  $46K/yr                 │   │
│  │  Cloud infra: $2.8M/mo   │   │  │  Gross churn: 8%/yr     │   │
│  │  Margin score: B- (72)   │   │  │  Unit econ score: B(78) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  BUDGET VARIANCE                       │  CASH MANAGEMENT                        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Annual budget: $285M    │   │  │  Cash: $150M             │   │
│  │  YTD spend: $165M (58%)  │   │  │  AR aging: 42 days       │   │
│  │  Budget variance: +12%   │   │  │  (target < 30 days)      │   │
│  │  Over budget depts: 8/42 │   │  │  AP aging: 28 days       │   │
│  │  Under budget: 12/42     │   │  │  DSO: 55 days (target 45)│   │
│  │  Forecast accuracy: 78%  │   │  │  Working capital: $35M   │   │
│  │  Budget score: B- (72)   │   │  │  Cash score: B (78)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Revenue and ARR waterfall

| Revenue component | Current quarter | Prior quarter | QoQ change | Full year | % of ARR | Trend |
|---|---|---|---|---|---|---|
| **Starting ARR** | $82.5M | $78.0M | +$4.5M | $72.0M | 100% | +$13M YoY |
| **New customer ARR** | +$4.2M | +$3.8M | +$0.4M | +$15.5M | 18% | Improving (sales team ramp) |
| **Expansion ARR** (upsell/cross-sell) | +$3.5M | +$3.2M | +$0.3M | +$12.5M | 15% | Improving (CSM expansion) |
| **Churned ARR** | -$1.8M | -$1.6M | -$0.2M | -$6.8M | -8% | Worsening (SMB churn) |
| **Contraction ARR** (downgrade) | -$0.9M | -$0.7M | -$0.2M | -$3.2M | -4% | Stable |
| **Ending ARR** | $85.0M | $82.5M | +$2.5M | $85.0M | 100% | +$13M YoY |
| **Net new ARR** | +$2.5M | +$2.7M | -$0.2M | +$13.0M | | |

### Burn rate and runway analysis

| Burn metric | Monthly | Annual | % of total | Trend | Levers | Action |
|---|---|---|---|---|---|---|
| **Headcount cost** (salaries, benefits, taxes) | $10.5M | $126M | 58% | +8% YoY | Hiring freeze, RIF, contractor reduction | Slow hiring, backfill only critical roles |
| **Cloud/infrastructure** | $2.8M | $33.6M | 16% | +12% YoY | Reserved instances, rightsizing, spot instances | Cloud cost optimization sprint |
| **Sales & marketing** | $2.2M | $26.4M | 12% | +15% YoY | Reduce low-ROI campaigns, tool consolidation | Reallocate from < 1× to > 5× campaigns |
| **Facilities/office** | $0.8M | $9.6M | 4% | -5% YoY | Office consolidation, remote-first | Reduce office footprint |
| **Software/tools** | $0.6M | $7.2M | 3% | +18% YoY | Tool consolidation, license optimization | Audit 28 marketing tools, 42 engineering tools |
| **Professional services** | $0.4M | $4.8M | 2% | +5% YoY | Insource, renegotiate | Review vendor contracts |
| **Travel & entertainment** | $0.3M | $3.6M | 2% | +20% YoY | Travel policy, virtual events | Reduce non-essential travel |
| **Other** | $0.4M | $4.8M | 3% | +10% YoY | Various | Line-by-line review |
| **Total gross burn** | **$18.0M** | **$216M** | **100%** | **+10% YoY** | | |
| **Revenue** | $10.5M | $126M | 58% of burn | +15% YoY | | |
| **Net burn** | **$12.5M** | **$90M** | | | | |

### Gross margin by product line

| Product line | Revenue/mo | COGS/mo | Gross margin | Target | Gap | COGS breakdown | Margin improvement lever |
|---|---|---|---|---|---|---|---|
| **YiVad** (SaaS) | $3.8M | $0.6M | 84% | 88% | -4% | Cloud $0.35M, support $0.15M, third-party $0.10M | Optimize LLM API costs, improve caching |
| **YiWeb** (SaaS) | $2.5M | $0.45M | 82% | 85% | -3% | Cloud $0.28M, support $0.10M, CDN $0.07M | CDN optimization, database rightsizing |
| **YiPet** (SaaS) | $2.0M | $0.35M | 82% | 85% | -3% | Cloud $0.22M, support $0.08M, API $0.05M | Reserved instances, API cost negotiation |
| **YiAi** (SaaS) | $1.2M | $0.48M | 60% | 70% | -10% | Cloud $0.18M, LLM API $0.20M, support $0.10M | LLM cost optimization, model distillation |
| **Professional services** | $0.8M | $0.34M | 58% | 65% | -7% | Labor $0.28M, travel $0.04M, tools $0.02M | Improve utilization, productize services |
| **Hardware/IoT** | $0.2M | $0.11M | 45% | 55% | -10% | COGS $0.08M, logistics $0.02M, warranty $0.01M | Supply chain optimization, price increase |
| **Overall** | **$10.5M** | **$5.1M** | **72%** | **78%** | **-6%** | | |

### Unit economics by customer segment

| Segment | ARPU/mo | ARPU/yr | Avg customer lifetime | LTV | CAC (total) | CAC payback | LTV/CAC | Gross margin | Contribution margin |
|---|---|---|---|---|---|---|---|---|---|
| **Enterprise** (> 5K) | $23,300 | $280K | 4.5 years | $1.26M | $185K | 9.5 months | 6.8 | 82% | $1.03M |
| **Mid-market** (500-5K) | $7,900 | $95K | 3.5 years | $333K | $72K | 10.9 months | 4.6 | 78% | $260K |
| **SMB** (< 500) | $2,900 | $35K | 2.2 years | $77K | $18K | 7.4 months | 4.3 | 72% | $55K |
| **PLG/self-serve** | $417 | $5K | 1.5 years | $7.5K | $1.2K | 3.5 months | 6.3 | 85% | $6.4K |
| **Overall** | **$3,950** | **$46K** | **3.2 years** | **$147K** | **$35K** | **18 months** | **4.2** | **72%** | **$106K** |

### Budget variance by department

| Department | Annual budget | YTD spend | % of budget | Variance | Forecast | Over/under | Root cause |
|---|---|---|---|---|---|---|---|
| **Engineering** | $85M | $52M | 61% | +8% | $92M | +$7M | Hiring ahead of plan, cloud overage |
| **Sales** | $42M | $28M | 67% | +12% | $48M | +$6M | Higher commission (over-attainment), T&E |
| **Marketing** | $18M | $12M | 67% | +15% | $21M | +$3M | Campaign over-investment, tool sprawl |
| **Customer Success** | $15M | $8.5M | 57% | -2% | $14.5M | -$0.5M | Hiring lag, under budget |
| **Product** | $12M | $7M | 58% | -3% | $11.5M | -$0.5M | Under headcount, conservative spending |
| **G&A** (Finance, Legal, HR, IT) | $22M | $14M | 64% | +5% | $23M | +$1M | Legal fees, IT infrastructure |
| **R&D** (AI/ML, innovation) | $8M | $5.5M | 69% | +18% | $9.5M | +$1.5M | GPU compute overage, research costs |
| **Professional services** | $5M | $3M | 60% | 0% | $5M | $0 | On track |
| **Operations** | $3M | $1.8M | 60% | -5% | $2.8M | -$0.2M | Under budget |
| **Overall** | **$285M** | **$165M** | **58%** | **+12%** | **$305M** | **+$20M** | |

### Cash management and working capital

| Cash metric | Current | Target | Benchmark | Trend | Action |
|---|---|---|---|---|---|
| **Cash on hand** | $150M | > $120M | 18-24 months runway | -$12.5M/mo | Maintain > 24 months runway |
| **Debt facility** | $45M available | $45M | N/A | Unused | Maintain as buffer, not operational funding |
| **Accounts receivable** (AR) | $32M | < $25M | 60-75 days SaaS | Worsening | Implement AR aging escalation, offer early payment discounts |
| **Days sales outstanding** (DSO) | 55 days | < 45 days | 45-55 days SaaS | Worsening | Automate collections, tighten payment terms |
| **AR aging > 90 days** | 8% of AR | < 3% | < 5% | Worsening | Escalate to legal/collections, review credit policy |
| **Accounts payable** (AP) | $18M | N/A | 30-45 days | 28 days | Optimize without damaging vendor relationships |
| **Working capital** | $35M | > $30M | N/A | Stable | Healthy buffer |
| **Monthly cash flow** | -$12.5M | Trend toward $0 | N/A | Improving (revenue growing faster than burn) | Path to cash flow positive: 18 months at current trajectory |
| **Overall** | **B (78)** | | | | |

## Action recommendations

1. **Path to profitability**: $12.5M/month net burn, 22 months runway; reduce net burn to $8M/month by optimizing cloud (save $500K), reducing low-ROI marketing (save $400K), consolidating tools (save $200K), slowing non-critical hiring (save $1.4M), extend runway to 30 months
2. **Gross margin improvement**: 72% blended → 78% target; optimize YiAi LLM costs (60% → 70% margin), improve services utilization, renegotiate cloud contracts, target 78% blended
3. **YiAi unit economics**: 60% gross margin, highest COGS; implement LLM cost optimization (caching, model distillation, prompt optimization), consider price increase, target 70% margin
4. **Budget variance reduction**: +12% variance, 8 departments over budget; implement monthly budget review with department heads, add variance thresholds (±5% triggers review), improve forecast accuracy, target < 5% variance
5. **DSO reduction**: 55 days → 45 days target; implement automated collections, tighten payment terms for new customers, offer early payment discounts, escalate > 90 day AR, target 45 days DSO
6. **Cloud cost optimization**: $2.8M/month cloud spend, +12% YoY; implement FinOps practices, reserved instances, rightsizing, spot instances, target $2.3M/month
7. **Headcount efficiency**: $10.5M/month headcount, 58% of burn; implement hiring freeze for non-critical roles, improve revenue per employee ($85M/1,250 = $68K, target $100K), target revenue per employee > $80K
8. **Forecast accuracy improvement**: 78% accuracy; implement rolling forecast (6-quarter), improve pipeline-to-revenue modeling, add scenario planning (best/base/worst), target 90% accuracy
9. **Cash buffer maintenance**: 22 months runway; maintain > 24 months runway at all times, consider extending debt facility, prepare fundraising readiness, target > 24 months runway
10. **Monthly financial review**: review revenue and ARR, burn rate and runway, gross margin, unit economics, budget variance, and cash management with executive leadership and board



- The "we'll grow out of it" burn rate → burning $12.5M/month on the assumption that revenue growth will outpace cost growth; if revenue grows 15% YoY and costs grow 10% YoY, you reach cash flow positive in 18 months — but if revenue growth slows to 10% and costs stay at 10%, you never reach breakeven and run out of cash in 22 months
- The gross margin games → reporting "adjusted gross margin" that excludes cloud costs, support costs, or third-party API costs; 84% "adjusted gross margin" vs 72% GAAP gross margin is a 12-point gap that represents real cash leaving the business — there's no such thing as a non-GAAP dollar
- The budget-as-entitlement → departments treating their budget as money they must spend ("use it or lose it"); the 67% YTD spend with 12% variance means departments are spending ahead of plan — not because they need to, but because they can
- The runway-as-comfort → feeling secure with 22 months of runway and delaying hard decisions; the time to optimize costs is when you have 22 months of runway, not when you have 6 — every month of delay is $12.5M of cash that could have been preserved
- The unit economics blind spot → reporting blended LTV/CAC of 4.2 without segmenting by customer type; enterprise LTV/CAC is 6.8 (healthy), SMB is 4.3 (marginal), and PLG is 6.3 (healthy) — but if SMB is 60% of new customers, the blended number hides the SMB problem that's dragging down the whole business

## Related

- Same class: [dashboard-executive-kpi](dashboard-executive-kpi.md) — executive KPI
- Same class: [dashboard-market-growth](dashboard-market-growth.md) — market growth and expansion
- Same class: [dashboard-sales-gtm-motion](dashboard-sales-gtm-motion.md) — sales and GTM motion
- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — engineering capacity
- Same class: [dashboard-cost-and-resource](../../oncall-sre/observability/dashboard-cost-and-resource.md) — cost and resource
- References: David Skok — *For Entrepreneurs: SaaS Metrics*; Jason Lemkin — *SaaStr: The Path to $100M*; Bessemer — *Cloud 100 Benchmarks*; KeyBanc — *SaaS Survey*; A16Z — *SaaS Financial Model*; CFO Secrets — *The SaaS FP&A Playbook*; Ben Horowitz — *The Hard Thing About Hard Things*