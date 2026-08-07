---
title: customer health dashboard
aliases:
- customer success dashboard
- customer health score dashboard
- account health dashboard
- churn prediction dashboard
tags:
- dashboard
- customer-success
- customer-health
- churn
- nps
- tickets
- adoption
category: product-manager/discovery/metrics
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
- engineer
benefit: customer health and success metrics visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-product-portfolio.md
- ../../delivery/dashboard-product-delivery.md
- ../../strategy/dashboard-product-strategy.md
- ../../../executive/strategy/dashboard-executive-kpi.md
tacit: false
---

# customer health dashboard

> **As a** product manager, **I want to** track customer health and success metrics, **so that** at-risk accounts are identified early and healthy customers are expanded proactively.

> Customer health is the leading indicator of retention and growth. This dashboard tracks customer health scores, ticket analysis, product adoption, NPS, and churn risk across the customer base.

## Summary

- 5 customer dimensions: customer health score, ticket & support analysis, product adoption depth, NPS & satisfaction, churn risk & expansion
- Customer health score is a composite of adoption, engagement, support health, billing health, and sentiment
- Tickets analyzed by volume, SLA compliance, resolution time, escalation rate, and self-service deflection
- Adoption measured by feature depth (how many features used), breadth (how many users), and frequency (DAU/MAU)
- Dashboard reviewed monthly; customer health review weekly for at-risk accounts

## Core viewpoints

- Health score is predictive, not reactive — a declining health score today predicts churn in 60-90 days; act on health scores, not cancellation calls
- Adoption depth > login frequency — a customer using 3 features deeply is healthier than one using 10 features shallowly
- Support tickets are product signals — every ticket is a conversation about product gaps; ticket patterns reveal UX, documentation, and feature gaps
- Churn is a process, not an event — customers don't wake up and churn; they disengage over weeks and months; health scoring catches the decline

## Key information

### 5-panel customer overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CUSTOMER HEALTH SCORE           │  TICKET & SUPPORT ANALYSIS       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Healthy:   62% (148)   │   │  │  Tickets:    285/mo     │   │
│  │  At risk:   22% (52)    │   │  │  SLA met:    88% ████   │   │
│  │  Critical:   8% (19)    │   │  │  Avg resolve: 18 hrs    │   │
│  │  New:        8% (19)    │   │  │  Escalation:  12%       │   │
│  │  Avg score:  72/100     │   │  │  Self-service: 45%      │   │
│  │  Trend:      ↓ 3 pts    │   │  │  CSAT:        4.0/5    │   │
│  │  Recovered:   5 this Q  │   │  │  KB deflection: 32%     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  PRODUCT ADOPTION DEPTH          │  NPS & SATISFACTION              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  DAU/MAU:     48% ██▌   │   │  │  NPS:          42       │   │
│  │  Features:    5.2 avg   │   │  │  Promoters:    48%      │   │
│  │  Depth:       62% ███   │   │  │  Detractors:   12%      │   │
│  │  Breadth:     58% ██▌   │   │  │  CSAT:         4.2/5   │   │
│  │  Frequency:   4.2x/wk   │   │  │  CES:          3.8/5   │   │
│  │  Time-to-value: 8 days  │   │  │  Response:     2.2 days│   │
│  │  Sticky:      42% ██    │   │  │  Survey resp:  28%      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Customer health score model

| Dimension | Weight | Metrics | Data source |
|---|---|---|---|
| **Product adoption** | 30% | DAU/MAU ratio, features used, session frequency, depth score | Product analytics |
| **Engagement recency** | 20% | Days since last login, days since last key action, session duration trend | Product analytics |
| **Support health** | 20% | Ticket volume (30d), avg resolution time, escalation count, CSAT | Ticketing system |
| **Billing health** | 15% | Payment status, plan tier, usage vs limit, expansion/contraction | Billing system |
| **Sentiment** | 15% | NPS score, survey responses, feature requests, feedback sentiment | Survey, CRM |
| **Overall** | **100%** | | |

### Health score distribution

| Health tier | Score range | Accounts | % of total | MRR | Churn rate (90d) |
|---|---|---|---|---|---|
| **Healthy** | 75-100 | 148 | 62% | $3.2M | 2.1% |
| **At risk** | 50-74 | 52 | 22% | $1.1M | 8.5% |
| **Critical** | 25-49 | 19 | 8% | $0.4M | 22.0% |
| **New** (baseline) | 50 (default) | 19 | 8% | $0.3M | 5.5% |
| **Total** | | **238** | | **$5.0M** | **4.2%** |

### At-risk account watchlist (top 8 by MRR)

| Account | MRR | Health score | Trend | Primary risk factor | Last contact | Action |
|---|---|---|---|---|---|---|
| Acme Corp | $85K | 52 | ↓ 8 pts | Support tickets spiking (3x normal) | 5 days ago | Schedule exec check-in |
| TechNova | $72K | 48 | ↓ 15 pts | DAU dropped 40% in 30 days | 12 days ago | Urgent — product specialist |
| GlobalFin | $65K | 55 | ↓ 5 pts | Billing dispute, payment late | 3 days ago | Billing team follow-up |
| DataSync Inc | $58K | 50 | ↓ 10 pts | Key champion left company | 7 days ago | Identify new champion |
| CloudWare | $45K | 58 | → | Low feature adoption (2 of 8) | 14 days ago | Onboarding refresh |
| DevFirst | $42K | 45 | ↓ 12 pts | Escalation unresolved for 8 days | 1 day ago | Escalate to engineering |
| ScaleUp AI | $38K | 52 | ↓ 6 pts | Usage approaching plan limit | 10 days ago | Expansion conversation |
| Meridian Health | $35K | 48 | ↓ 18 pts | NPS detractor, negative sentiment | 4 days ago | Urgent — VP check-in |

### Ticket & support analysis

| Ticket category | Volume/mo | % of total | Avg resolution | SLA met | Escalation rate | CSAT |
|---|---|---|---|---|---|---|
| Technical issue / bug | 85 | 30% | 22 hrs | 85% | 15% | 3.8/5 |
| How-to / configuration | 72 | 25% | 14 hrs | 90% | 8% | 4.1/5 |
| Feature request | 45 | 16% | 48 hrs | 82% | 12% | 4.0/5 |
| Billing / account | 35 | 12% | 10 hrs | 95% | 5% | 4.3/5 |
| Integration / API | 28 | 10% | 28 hrs | 78% | 18% | 3.7/5 |
| Performance / latency | 12 | 4% | 32 hrs | 72% | 22% | 3.5/5 |
| Security / access | 8 | 3% | 18 hrs | 88% | 15% | 4.0/5 |
| **Total** | **285** | | **18 hrs avg** | **88%** | **12%** | **4.0/5** |

### Ticket trend analysis

| Month | Total tickets | Per account | SLA met | Escalation | Self-service % | KB deflection |
|---|---|---|---|---|---|---|
| Jan | 245 | 1.2 | 85% | 14% | 38% | 25% |
| Feb | 260 | 1.3 | 86% | 13% | 40% | 27% |
| Mar | 278 | 1.3 | 87% | 12% | 42% | 28% |
| Apr | 290 | 1.4 | 88% | 12% | 43% | 30% |
| May | 275 | 1.3 | 89% | 11% | 44% | 31% |
| Jun | 282 | 1.3 | 88% | 12% | 45% | 32% |
| Jul | 285 | 1.3 | 88% | 12% | 45% | 32% |

### Product adoption depth by plan tier

| Plan tier | Accounts | Features used (of 8) | DAU/MAU | Sessions/week | Depth score | Sticky % |
|---|---|---|---|---|---|---|
| Enterprise | 42 | 6.8 | 62% | 5.8 | 78% | 58% |
| Business | 85 | 5.2 | 48% | 4.2 | 62% | 42% |
| Pro | 72 | 3.8 | 38% | 3.1 | 48% | 32% |
| Starter | 39 | 2.1 | 25% | 2.0 | 32% | 18% |
| **Overall** | **238** | **5.2** | **48%** | **4.2** | **62%** | **42%** |

### Feature adoption matrix

| Feature | Enterprise | Business | Pro | Starter | Overall | Trend |
|---|---|---|---|---|---|---|
| AI Chat | 95% | 88% | 75% | 55% | 82% | ↑ |
| Code Review | 85% | 62% | 45% | 20% | 58% | ↑ |
| Knowledge Base | 78% | 55% | 38% | 15% | 52% | ↑ |
| Search | 90% | 72% | 58% | 35% | 68% | → |
| Team Collaboration | 82% | 58% | 35% | 10% | 52% | ↑ |
| API Access | 72% | 42% | 28% | 5% | 42% | ↑ |
| Analytics/Reports | 68% | 38% | 22% | 8% | 38% | ↑ |
| SSO/Enterprise | 85% | 15% | 0% | 0% | 22% | ↑ |

### NPS by customer segment

| Segment | NPS | Promoters | Detractors | Response rate | MoM change |
|---|---|---|---|---|---|
| Enterprise (>$50K) | 48 | 55% | 8% | 35% | +3 |
| Business ($10K-$50K) | 42 | 48% | 10% | 28% | +2 |
| Pro ($1K-$10K) | 38 | 42% | 14% | 22% | 0 |
| Starter (<$1K) | 32 | 38% | 18% | 18% | -2 |
| **Overall** | **42** | **48%** | **12%** | **28%** | **+1** |

### Top detractor themes (last 90 days)

| Theme | Mentions | % of detractors | Example quote | Product action |
|---|---|---|---|---|
| Mobile experience lacking | 28 | 35% | "Desktop is great but mobile is unusable" | Mobile UX initiative Q3 |
| Integration complexity | 22 | 28% | "API docs are confusing, took 2 weeks to integrate" | API docs revamp, SDKs |
| Performance issues | 18 | 23% | "Code review takes 30+ seconds to load" | Performance sprint Q3 |
| Pricing/value | 15 | 19% | "Too expensive for what we use" | Tier restructuring review |
| Missing features | 12 | 15% | "No SSO on Pro plan is a dealbreaker" | SSO for Pro evaluation |
| Support responsiveness | 8 | 10% | "Took 3 days to get a response" | SLA review, staffing |

### Churn & expansion analysis

| Metric | Current quarter | Previous quarter | YoY |
|---|---|---|---|
| Gross MRR churn | 4.2% | 4.5% | ↓ 0.8% |
| Net MRR churn (incl. expansion) | -2.8% | -2.2% | ↑ 0.6% |
| Logo churn | 5.5% | 5.8% | ↓ 0.5% |
| Expansion MRR (existing customers) | $340K | $310K | ↑ 12% |
| Avg time from health decline to churn | 68 days | 72 days | ↓ 4 days |
| Saved accounts (health intervention) | 12 | 10 | ↑ 20% |
| **Customer LTV** | **$48K** | **$45K** | **↑ 7%** |

### Churn reason taxonomy

| Churn reason | % of churn | Recoverable? | Early warning signal |
|---|---|---|---|
| Feature gap / missing capability | 28% | Sometimes | Feature requests, declining adoption |
| Price / budget | 22% | Sometimes | Billing inquiries, usage below plan |
| Champion departure | 18% | Rarely | Single-user concentration, no multi-threading |
| Competitive displacement | 15% | Rarely | Competitive mentions in tickets/surveys |
| Poor experience / performance | 10% | Yes | Support spikes, declining NPS |
| Company closed / acquired | 5% | No | No signal |
| Other | 2% | | |

## Action recommendations

1. **Critical account intervention**: 19 accounts at critical health, $400K MRR at 22% churn risk; schedule VP-level check-ins within 1 week
2. **Acme Corp and TechNova**: $157K combined MRR trending down; immediate executive outreach, dedicated support, product specialist engagement
3. **Mobile experience gap**: #1 detractor theme (35%); align with Mobile Experience strategic initiative, share customer quotes with mobile team
4. **Reduce ticket resolution time**: 18 hrs → 12 hrs; improve integration/API documentation, add self-service debugging tools
5. **Feature adoption for Business tier**: 5.2 features avg, 42% sticky; create adoption playbooks, automated onboarding sequences
6. **Improve self-service**: 45% → 60%; expand knowledge base, add in-app help, improve KB deflection from 32% → 50%
7. **NPS detractor follow-up**: 12% detractors; close the loop within 48 hours, track resolution, escalate product issues
8. **Champion dependency risk**: 18% of churn from champion departure; identify multi-threading opportunities in all Enterprise accounts
9. **Pro tier SSO evaluation**: 15% of detractors cite missing SSO; build business case, evaluate SSO for Pro tier
10. **Weekly health review**: review all at-risk and critical accounts, track intervention effectiveness, update health scores



- Health score as vanity metric → tracking health score without acting on it; a declining score without intervention is just a churn stopwatch
- Ticket volume as success metric → "we closed 300 tickets this month"; the goal is fewer tickets, not more closed tickets
- NPS as the only sentiment metric → relying solely on NPS without qualitative feedback; NPS tells you what, not why
- Adoption as login count → counting logins without measuring feature depth; a customer who logs in daily but uses nothing is not healthy
- Saving every customer → investing in customers who will never be successful; some churn is healthy, focus on customers with genuine potential

## Related

- Same class: [dashboard-product-portfolio](dashboard-product-portfolio.md) — product metrics and adoption
- Same class: [dashboard-product-delivery](../../delivery/dashboard-product-delivery.md) — delivery execution
- Same class: [dashboard-executive-kpi](../../../executive/strategy/dashboard-executive-kpi.md) — executive KPIs
- References: Gainsight — *Customer Success Handbook*; Lincoln Murphy — *Customer Success*; Nick Mehta — *Customer Success Economy*; Totango — *Customer Health Score Framework*