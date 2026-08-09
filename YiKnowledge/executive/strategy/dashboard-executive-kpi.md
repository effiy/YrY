---
title: executive kpi dashboard
aliases:
- executive dashboard
- business kpi dashboard
- strategy dashboard
- board dashboard
tags:
- dashboard
- executive
- kpi
- strategy
- business
- revenue
- growth
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
- product-manager
- tech-lead
benefit: business health and strategic KPIs visible at a glance for executive decision-making
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./product-strategy-framework.md
- ./now-next-later-roadmap.md
- ../../product-manager/discovery/metrics--dashboard-product-portfolio.md
- ../../product-manager/discovery/metrics--north-star-metric.md
tacit: false
---

# executive kpi dashboard

> **As an** executive, **I want to** track business health and strategic KPIs across the organization, **so that** strategic decisions are grounded in data and deviations from plan are caught early.

> An executive dashboard distills company-wide metrics into a single-page view: financial health, growth engine, market position, team health, and strategic initiative progress.

## Summary

- 5 executive dimensions: financial health, growth engine, market position, team and talent, strategic initiatives
- Each dimension has 3-5 key metrics with red/yellow/green thresholds tied to quarterly targets
- Month-over-month and year-over-year trends for every metric
- Strategic initiative progress tracked via OKR completion %
- Dashboard reviewed monthly at executive team meeting; quarterly board review

## Core viewpoints

- Executive dashboard answers "are we winning?" — not "how does the system work?"
- Every metric must tie to a strategic goal — if a metric doesn't drive a decision, remove it
- Leading indicators (pipeline, activation) are more actionable than lagging indicators (revenue, churn)
- Red metrics are not failures — they are opportunities to course-correct before it's too late

## Key information

### 5-panel executive overview

```
┌──────────────────────────────────────────────────────────────────┐
│  FINANCIAL HEALTH               │  GROWTH ENGINE                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  MRR:    $842k ↑ 8% MoM │   │  │  New users:  3.2k/mo   │   │
│  │  ARR:    $10.1M run     │   │  │  CAC:        $42 ↓     │   │
│  │  Gross:  78% margin     │   │  │  LTV:        $1,280    │   │
│  │  Burn:   $124k/mo       │   │  │  LTV/CAC:   30.5x     │   │
│  │  Runway: 18 months      │   │  │  Viral:     1.12x     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  MARKET POSITION                │  TEAM & TALENT                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Market: $4.2B TAM      │   │  │  Headcount: 47 (+3)    │   │
│  │  Share:   4.8% ↑        │   │  │  Attrition: 8.5%/yr    │   │
│  │  NPS:     42 vs 35 comp │   │  │  eNPS:     38          │   │
│  │  Win rate: 62% ↑        │   │  │  DEI:      B+ score    │   │
│  │  Churn:   3.8% ↓        │   │  │  Hiring:   5 open      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Dimension 1: Financial health

| Metric | Current | Target (Q3) | MoM | YoY | Status |
|---|---|---|---|---|---|
| MRR | $842,000 | $900,000 | +8.2% | +42% | On track |
| ARR (run rate) | $10.1M | $10.8M | +8.2% | +42% | On track |
| Gross margin | 78% | > 75% | +1% | +3% | Green |
| Net revenue retention | 112% | > 110% | +2% | +5% | Green |
| Monthly burn | $124,000 | < $130,000 | -3% | +12% | Green |
| Cash runway (months) | 18 | > 12 | +1 | -4 | Green |
| Revenue per employee | $214,000 | > $200,000 | +5% | +18% | Green |

### Dimension 2: Growth engine

| Metric | Current | Target (Q3) | MoM | Benchmark | Status |
|---|---|---|---|---|---|
| New users/month | 3,200 | 3,500 | +6% | — | On track |
| CAC (blended) | $42 | < $45 | -8% | $50-80 (SaaS) | Green |
| LTV (monthly) | $1,280 | > $1,200 | +3% | — | Green |
| LTV/CAC ratio | 30.5x | > 3x | — | > 3x (good) | Green |
| CAC payback (months) | 1.4 | < 6 | — | < 12 (good) | Green |
| Viral coefficient | 1.12 | > 1.05 | +0.03 | > 1.0 (viral) | Green |
| Organic acquisition % | 58% | > 55% | +2% | — | Green |

### Dimension 3: Market position

| Metric | Current | Target | Trend | Notes |
|---|---|---|---|---|
| TAM (Total Addressable Market) | $4.2B | — | ↑ 15% YoY | AI developer tools market |
| Market share | 4.8% | 5.5% by Q4 | ↑ 0.8% YoY | Gaining on competitors |
| NPS vs competitors | 42 vs 35 | > 40 | ↑ 5 points | 7 points above category avg |
| Competitive win rate | 62% | > 55% | ↑ 8% | Primary competitor loss rate declining |
| Logo churn rate | 3.8% | < 4% | ↓ 0.5% | Below SaaS median of 5% |
| Expansion revenue | 28% of new MRR | > 25% | ↑ 3% | Upsell and cross-sell healthy |

### Dimension 4: Team and talent

| Metric | Current | Target | Trend | Notes |
|---|---|---|---|---|
| Total headcount | 47 | 52 by Q4 | +3 this quarter | 5 open reqs in pipeline |
| Voluntary attrition (annualized) | 8.5% | < 10% | ↓ 2% | Below tech industry avg (13%) |
| eNPS (employee NPS) | 38 | > 35 | ↑ 5 | Strong engagement |
| Time-to-hire (days) | 32 | < 45 | ↓ 8 | Efficient pipeline |
| Offer acceptance rate | 78% | > 70% | ↑ 5% | Competitive comp + mission |
| Internal promotion rate | 22% | > 20% | ↑ 3% | Growing leaders from within |
| Engineering velocity | 92% of plan | > 85% | ↑ 4% | DORA metrics improving |

### Dimension 5: Strategic initiative progress

| Initiative | OKR | Progress | Status | Next milestone |
|---|---|---|---|---|
| AI Platform Launch | KR1: 10k MAU | 8.2k (82%) | On track | GA launch Sep 15 |
| AI Platform Launch | KR2: 99.9% uptime | 99.95% | Green | Continuous |
| Enterprise Tier | KR1: 5 enterprise contracts | 3 signed, 2 in negotiation | On track | Q3 close |
| Enterprise Tier | KR2: SSO + RBAC shipped | SSO done, RBAC Q3 | On track | RBAC Aug 30 |
| International Expansion | KR1: 3 languages | 2 done (EN, CN) | On track | JP Sep 30 |
| International Expansion | KR2: 15% revenue from Intl | 12% | On track | Q4 target |
| Platform Reliability | KR1: 99.95% → 99.99% | 99.97% | At risk | Need additional capacity |
| Developer Ecosystem | KR1: Public API GA | Beta (50 devs) | On track | GA Oct 1 |
| Developer Ecosystem | KR2: 100 API integrations | 42 built | Behind | Need partner push |

### Risk register (top 5)

| Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Key engineer departure | Medium | High | Retention plans, documentation, succession | CTO |
| LLM provider price increase | Medium | Medium | Multi-provider architecture, cost optimization | AI Lead |
| Competitor launches similar AI features | High | Medium | Accelerate roadmap, differentiate on UX | CPO |
| Regulatory change (AI Act compliance) | Low | High | Legal monitoring, compliance readiness | GC |
| Infrastructure scale failure | Low | High | Load testing, auto-scaling, capacity planning | SRE Lead |

## Action recommendations

1. **Monthly executive review**: first Monday of each month, review all 5 dimensions; red metrics get dedicated deep-dive
2. **OKR check-in biweekly**: each initiative owner reports progress; at-risk OKRs get executive sponsor intervention
3. **Board deck auto-generated**: dashboard data feeds directly into board presentation; no manual data gathering
4. **Risk register review**: top 5 risks reviewed monthly; new risks added as they emerge
5. **Leading indicator focus**: if LTV/CAC drops below 3x or churn rises above 5%, initiate strategic review
6. **Team health pulse**: quarterly engagement survey; if eNPS drops below 30, investigate
7. **Competitive intelligence**: monthly competitive win/loss analysis; feed insights to product and marketing



- Dashboard overload → too many metrics, no one knows what matters; 5 dimensions × 5 metrics max
- Green-washing → marking everything green to avoid difficult conversations; red metrics are learning opportunities
- Lagging indicator obsession → focusing on revenue and churn while ignoring leading indicators; leading indicators give time to act
- Metric silos → each department has its own dashboard with no shared view; executive dashboard is the single source of truth
- No decision linkage → metrics reviewed but no decisions made; every metric review must produce at least one action

## Related

- Same class: [dashboard-product-portfolio](../../product-manager/discovery/metrics--dashboard-product-portfolio.md) — product-level metrics
- Same class: [dashboard-dora-metrics](../../engineer/infrastructure/dashboard-dora-metrics.md) — engineering delivery metrics
- Downstream: [product-strategy-framework](product-strategy-framework.md) — strategy framework
- Downstream: [now-next-later-roadmap](now-next-later-roadmap.md) — roadmap planning
- References: McKinsey — *The CEO Dashboard*; a16z — *Startup Metrics*; David Sacks — *SaaS Metrics 2.0*; Sequoia — *The Dashboard*