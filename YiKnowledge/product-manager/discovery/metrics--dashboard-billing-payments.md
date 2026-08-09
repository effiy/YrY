---
title: billing and payments health dashboard
aliases:
- billing dashboard
- payments dashboard
- revenue operations dashboard
- payment processing dashboard
- billing accuracy dashboard
- revenue leakage dashboard
tags:
- dashboard
- billing
- payments
- revenue-operations
- payment-processing
- invoicing
- dunning
- fraud-detection
category: product-manager/discovery/metrics
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- product-manager
- engineer
- executive
- tech-lead
benefit: payment success, billing accuracy, revenue leakage, and financial operations visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- payment success, billing accuracy, revenue leakage, dunning and collections, payment method, and fraud detection defined
related:
- ./dashboard-customer-health.md
- ./dashboard-customer-journey.md
- ../../strategy/dashboard-pricing-packaging.md
- ../../../executive/strategy/dashboard-executive-kpi.md
- ../../../executive/strategy/dashboard-finance-fp-and-a.md
tacit: false
---

# billing and payments health dashboard

> **As a** product manager, **I want to** track billing and payments health, **so that** every invoice is accurate, every payment succeeds, every dollar of revenue is collected, and billing operations are a measured, reliable, and continuously improving practice — not a "the finance team will figure it out" collection of spreadsheet errors.

> Billing is where product meets revenue. This dashboard tracks payment success, billing accuracy, revenue leakage, dunning and collections, payment method health, and fraud detection — turning billing operations from a back-office cost center into a strategic, measured, and continuously improving revenue operations function.

## Summary

- 6 billing dimensions: payment success, billing accuracy, revenue leakage, dunning and collections, payment method health, fraud detection
- 1,850 customers; 28,500 invoices/year; $85M ARR; 12 payment methods; 8 billing systems; 4 payment processors; 5-person billing team
- Payment success: 94.5% first-attempt success rate; 3.2% involuntary churn (payment failure); 2.8% of payments require manual intervention; $2.4M/year in failed payments
- Billing accuracy: 92% invoice accuracy (target 98%); 8% of invoices have errors; 2,280 billing disputes/year; 5% of customers report billing as "frustrating"
- Revenue leakage: $3.8M/year estimated revenue leakage; 2.2% underbilling rate; 1.5% unbilled usage; 0.8% pricing errors; 0.5% credit/refund abuse
- Dashboard reviewed weekly; billing operations review with finance and product biweekly

## Core viewpoints

- A failed payment is not a billing problem — it's a customer experience problem; 3.2% involuntary churn means $2.7M/year in revenue lost not because customers don't want the product, but because their credit card expired, their bank blocked the charge, or the payment processor was down
- Every invoice error is a trust withdrawal — a customer who finds an error on their invoice will spend 3× more time scrutinizing future invoices; the 8% invoice error rate isn't just a finance problem — it's eroding customer trust at scale
- Revenue leakage is the silent killer of SaaS margins — $3.8M/year in leakage (4.5% of ARR) means the company is leaving money on the table that's already been earned; unbilled usage, pricing errors, and credit abuse are not "rounding errors" — they're process failures
- The dunning process is a customer retention process, not a collections process — the 45% recovery rate on failed payments could be 65% with better dunning (smart retry logic, customer notifications, grace periods); treating dunning as collections (threatening, aggressive) reduces recovery — treating it as customer success (helpful, proactive) increases it

## Key information

### 6-panel billing overview

```
┌──────────────────────────────────────────────────────────────────┐
│  PAYMENT SUCCESS                       │  BILLING ACCURACY                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  1st attempt: 94.5%      │   │  │  Invoice accuracy: 92%   │   │
│  │  Involuntary churn: 3.2% │   │  │  Invoices with errors: 8%│   │
│  │  Manual intervention:    │   │  │  Disputes/yr: 2,280      │   │
│  │  2.8% of payments        │   │  │  "Billing frustrating":  │   │
│  │  Failed payments: $2.4M  │   │  │  5% of customers         │   │
│  │  Recovery rate: 45%      │   │  │  Avg dispute resolution: │   │
│  │  Retry success: 62%      │   │  │  8.5 days (target < 5)   │   │
│  │  Payment score: B- (72)  │   │  │  Accuracy score: C+(68) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  REVENUE LEAKAGE                       │  DUNNING & COLLECTIONS                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Est leakage: $3.8M/yr   │   │  │  Recovery rate: 45%      │   │
│  │  Underbilling: 2.2%      │   │  │  Smart retry: 62% success│   │
│  │  Unbilled usage: 1.5%    │   │  │  Dunning emails: 3-step  │   │
│  │  Pricing errors: 0.8%    │   │  │  sequence                │   │
│  │  Credit/refund abuse:    │   │  │  Grace period: 5 days    │   │
│  │  0.5%                    │   │  │  Collections: 2.5% of    │   │
│  │  Leakage detection: 55%  │   │  │  accounts (worst case)   │   │
│  │  Leakage score: C (65)   │   │  │  Dunning score: C (65)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  PAYMENT METHOD HEALTH                 │  FRAUD DETECTION                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Credit card: 62%        │   │  │  Fraud rate: 0.22%       │   │
│  │  ACH/bank: 18%           │   │  │  Chargeback rate: 0.35%  │   │
│  │  Invoice/PO: 12%         │   │  │  False positives: 2.8%   │   │
│  │  Digital wallet: 5%      │   │  │  Fraud losses: $185K/yr  │   │
│  │  Crypto: 1%              │   │  │  Detection speed: 4.5 hrs│   │
│  │  Card expiry: 8% of      │   │  │  (target < 1 hr)         │   │
│  │  cards/month (decay)     │   │  │  Fraud score: B (78)    │   │
│  │  Method score: B- (72)   │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Payment success by processor and method

| Payment method | Transaction volume | 1st attempt success | Retry success | Final success | Involuntary churn | Avg transaction | Processor |
|---|---|---|---|---|---|---|---|
| **Credit card** (Visa/MC) | 18,500/mo | 96.5% | 68% | 98.5% | 1.5% | $285 | Stripe |
| **Credit card** (Amex) | 3,200/mo | 95.5% | 62% | 97.8% | 2.2% | $420 | Stripe |
| **Credit card** (international) | 2,800/mo | 88.5% | 52% | 92.5% | 7.5% | $350 | Stripe + Adyen |
| **ACH/bank transfer** | 5,500/mo | 96.0% | 72% | 98.2% | 1.8% | $2,500 | GoCardless |
| **Invoice/PO** (NET 30) | 1,800/mo | 85.5% | N/A | 97.5% | 2.5% | $12,500 | Manual + NetSuite |
| **Digital wallet** (Apple/Google Pay) | 1,200/mo | 97.5% | 75% | 99.2% | 0.8% | $95 | Stripe |
| **SEPA/direct debit** | 850/mo | 95.5% | 65% | 97.8% | 2.2% | $1,800 | GoCardless |
| **Crypto** | 120/mo | 98.0% | N/A | 98.0% | 2.0% | $850 | Coinbase Commerce |
| **Overall** | **34,000/mo** | **94.5%** | **62%** | **97.5%** | **3.2%** | **$485** | |

### Billing accuracy analysis

| Error type | Frequency | % of invoices | Revenue impact | Root cause | Detection method | Resolution time |
|---|---|---|---|---|---|---|
| **Usage calculation error** | 850/mo | 3.0% | $1.2M/yr | Metering bugs, delayed usage data | Customer report (65%), internal audit (35%) | 7.5 days |
| **Pricing/plan mismatch** | 620/mo | 2.2% | $0.85M/yr | Manual plan changes, grandfathered pricing | Customer report (72%), renewal review (28%) | 8.5 days |
| **Discount/promo error** | 420/mo | 1.5% | $0.45M/yr | Expired promos not removed, manual overrides | Internal audit (55%), customer report (45%) | 5.5 days |
| **Tax calculation error** | 280/mo | 1.0% | $0.35M/yr | Tax rule changes, nexus updates | Tax engine audit (80%), customer report (20%) | 12.5 days |
| **Double billing** | 85/mo | 0.3% | $0.28M/yr | System race condition, manual errors | Customer report (90%), internal audit (10%) | 3.5 days |
| **Currency/conversion** | 65/mo | 0.2% | $0.18M/yr | Exchange rate timing, multi-currency | Customer report (55%), finance audit (45%) | 6.5 days |
| **Overall** | **2,320/mo** | **8.2%** | **$3.3M/yr** | | | **8.5 days avg** |

### Revenue leakage by source

| Leakage source | Annual estimate | % of ARR | Detection coverage | Root cause | Prevention | Action |
|---|---|---|---|---|---|---|
| **Underbilling** (usage not captured) | $1.87M | 2.2% | 55% | Metering gaps, delayed usage processing | Usage metering audit, real-time usage tracking | Implement usage metering for all billable features |
| **Unbilled usage** (metered but not invoiced) | $1.28M | 1.5% | 45% | Billing system integration gaps, manual processes | Automated usage-to-invoice pipeline, reconciliation | Connect all metering to billing, automate reconciliation |
| **Pricing errors** (wrong plan/price) | $0.68M | 0.8% | 60% | Manual plan assignment, grandfathered pricing | Plan automation, pricing audit, price book centralization | Centralize price book, automate plan assignment |
| **Credit/refund abuse** (excessive credits) | $0.43M | 0.5% | 35% | Loose credit policy, no approval workflow | Credit approval workflow, credit limits, audit trail | Implement credit approval tiers, audit quarterly |
| **Contract leakage** (terms not enforced) | $0.34M | 0.4% | 25% | Manual contract, no enforcement automation | Contract-to-billing automation, entitlement enforcement | Automate contract-to-billing, enforce entitlements |
| **Overall** | **$3.8M** | **4.5%** | **55%** | | | |

### Dunning and collections effectiveness

| Dunning stage | Timing | Channel | Success rate | Recovery at this stage | Cumulative recovery | Customer complaint rate | Action |
|---|---|---|---|---|---|---|---|
| **Pre-dunning** (card updater) | 3 days before expiry | Account updater API | 28% | 28% | 28% | 0% | Implement card updater, tokenization |
| **Stage 1** (soft fail) | Day 1, 3, 5 | Email | 22% | 15% | 43% | 2% | Friendly reminder, self-service update link |
| **Stage 2** (hard fail) | Day 7, 10, 14 | Email + in-app | 18% | 10% | 53% | 5% | Payment method update, offer help |
| **Stage 3** (final notice) | Day 21, 28 | Email + SMS + in-app | 8% | 5% | 58% | 12% | Service degradation warning, urgency |
| **Manual outreach** (CSM/support) | Day 30 | Phone + email | 35% | 8% | 66% | 8% | Personal outreach, payment plan |
| **Collections** | Day 60+ | Collections agency | 15% | 2% | 68% | 25% | Last resort, account suspension |
| **Overall** | | | | | **45% recovery** | | |

### Payment method health and optimization

| Payment method | % of customers | % of revenue | Decline rate | Avg transaction | Processing cost | Card expiry rate | Optimization |
|---|---|---|---|---|---|---|---|
| **Credit card** | 62% | 45% | 3.5% | $285 | 2.9% + $0.30 | 8%/month | Card updater, tokenization, local acquiring |
| **ACH/bank transfer** | 18% | 28% | 4.0% | $2,500 | 0.8% (cap $5) | 2%/year | Smart retry, same-day ACH |
| **Invoice/PO** (NET 30) | 12% | 22% | 14.5% (late) | $12,500 | 0.5% (manual) | N/A | Automated collections, early payment discount |
| **Digital wallet** | 5% | 3% | 2.5% | $95 | 2.5% + $0.15 | 3%/year (token refresh) | Promote for low-value transactions |
| **SEPA/direct debit** | 2% | 1.5% | 4.5% | $1,800 | 0.5% (cap €2) | 1%/year | Mandate management, pre-notification |
| **Crypto** | 1% | 0.5% | 2.0% | $850 | 1.0% | N/A | Monitor volatility, auto-convert to stablecoin |
| **Overall** | **100%** | **100%** | **5.5%** | **$485** | **2.1% blended** | | |

### Fraud detection and chargeback management

| Fraud metric | Current | Target | Benchmark | Issue | Action |
|---|---|---|---|---|---|
| **Fraud rate** (% of transactions) | 0.22% | < 0.10% | < 0.10% (SaaS) | Card testing, account takeover, promo abuse | Implement velocity checks, 3DS, device fingerprinting |
| **Chargeback rate** (% of transactions) | 0.35% | < 0.30% | < 0.30% (Visa/MC threshold) | Above Visa/MC monitoring threshold (0.30%) | Improve dispute resolution, add chargeback prevention |
| **Chargeback win rate** | 42% | 60% | 50-60% | Insufficient evidence, slow response | Improve evidence collection, faster response |
| **False positive rate** (legit blocked) | 2.8% | < 1.0% | < 1.5% | Overly aggressive fraud rules, poor risk scoring | Tune fraud rules, add ML-based risk scoring |
| **Fraud detection speed** | 4.5 hours | < 1 hour | < 1 hour | Batch processing, manual review | Real-time fraud detection, automated risk scoring |
| **Fraud losses** | $185K/yr | < $100K | 0.1-0.2% of revenue | Card testing rings, promo abuse | Implement rate limiting, CAPTCHA, 3DS |
| **Overall** | **B (78)** | | | | |

## Action recommendations

1. **Involuntary churn reduction**: 3.2% involuntary churn = $2.7M/year lost; implement card updater (account updater API), smart retry logic (exponential backoff, alternate processors), improve dunning emails, target < 1.5% involuntary churn
2. **Invoice accuracy improvement**: 8% error rate; implement automated usage-to-invoice reconciliation, centralize price book, add invoice preview/validation, target < 2% error rate
3. **Revenue leakage detection**: $3.8M/year leakage, only 55% detected; implement automated leakage detection (usage vs billing reconciliation, contract vs invoice audit), target 90% detection and < 2% leakage
4. **Dunning recovery optimization**: 45% recovery rate; implement smart dunning (best-time-to-contact, channel preference, personalized messaging), add grace period, improve self-service payment update, target 65% recovery
5. **International payment optimization**: 88.5% first-attempt for international cards; implement local acquiring (multi-currency processors), add popular local payment methods, improve decline retry logic, target 94% international success
6. **Billing operations automation**: 2.8% of payments require manual intervention; automate payment reconciliation, automate credit/refund workflows, automate invoice adjustments, target < 0.5% manual intervention
7. **Fraud detection improvement**: 2.8% false positive rate blocking legitimate customers; implement ML-based risk scoring, add device fingerprinting, reduce false positives, target < 1.0% false positive
8. **Chargeback management**: 0.35% chargeback rate (above Visa/MC threshold); implement chargeback prevention (clear billing descriptors, proactive communication), improve dispute evidence, target < 0.25% chargeback rate
9. **Payment method modernization**: 62% credit card, 5% digital wallet; promote digital wallets for low-value transactions, add local payment methods for international markets, implement buy-now-pay-later, target 15% digital wallet adoption
10. **Weekly billing review**: review payment success, billing accuracy, revenue leakage, dunning and collections, payment method health, and fraud detection with billing operations and finance



- The "finance will handle it" billing neglect → treating billing as a back-office function that doesn't need product/engineering investment; the 8% invoice error rate, $3.8M in revenue leakage, and 3.2% involuntary churn are all product/engineering problems that the finance team can't fix with spreadsheets
- The manual billing exception → every manual billing adjustment is a future error waiting to happen; the 2.8% of payments requiring manual intervention are the source of 35% of billing errors — manual processes don't scale, and they don't get better with practice, they get worse with volume
- The aggressive dunning → sending threatening "your account will be suspended" emails on day 3 of a failed payment; the customer didn't cancel — their credit card expired — and treating them like a delinquent account reduces recovery rates and damages the relationship
- The credit-as-customer-retention → issuing credits to unhappy customers instead of fixing the product issue; the 0.5% credit/refund abuse rate means $430K/year in credits that don't solve the underlying problem and train customers to complain for discounts
- The fraud detection trade-off blindness → accepting 2.8% false positive rate (legitimate customers blocked) as the cost of fraud prevention; every blocked legitimate customer costs $46K in lifetime value — the 2.8% false positive rate is costing more in lost customers than the $185K in fraud losses it prevents

## Related

- Same class: [dashboard-customer-health](dashboard-customer-health.md) — customer health
- Same class: [dashboard-customer-journey](dashboard-customer-journey.md) — customer journey
- Same class: [dashboard-pricing-packaging](../../strategy/dashboard-pricing-packaging.md) — pricing and packaging
- Same class: [dashboard-executive-kpi](../../../executive/strategy/dashboard-executive-kpi.md) — executive KPI
- Same class: [dashboard-finance-fp-and-a](../../../executive/strategy/dashboard-finance-fp-and-a.md) — finance and FP&A
- References: Stripe — *Billing Best Practices*; Chargebee — *Subscription Billing Benchmarks*; ProfitWell — *Payment Failure Analysis*; MGI — *Revenue Leakage in SaaS*; Visa — *Chargeback Management Guide*; Sift — *Fraud Detection in Digital Business*; Zuora — *Subscription Economy Index*