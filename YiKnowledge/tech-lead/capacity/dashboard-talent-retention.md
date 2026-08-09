---
title: talent retention dashboard
aliases:
- talent acquisition dashboard
- hiring dashboard
- retention dashboard
- people growth dashboard
- workforce planning dashboard
tags:
- dashboard
- talent
- hiring
- retention
- engagement
- growth
- workforce
category: tech-lead/capacity
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- tech-lead
- executive
- engineer
benefit: talent acquisition, retention, and growth health visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-engineering-capacity.md
- ../../new-hire/onboarding/dashboard-onboarding-progress.md
- ../../../knowledge-curator/people/dashboard-people-expertise.md
- ../../risk/dashboard-risk-management.md
tacit: false
---

# talent retention dashboard

> **As a** tech lead, **I want to** track talent acquisition, retention, and growth, **so that** the organization attracts, develops, and retains the engineering talent needed to execute our strategy.

> Talent is the most critical resource. This dashboard tracks hiring pipeline, retention & attrition, engagement, career growth, and workforce composition across the engineering organization.

## Summary

- 5 talent dimensions: hiring pipeline, retention & attrition, engagement & satisfaction, career growth, workforce composition
- Hiring tracked from sourcing → screening → interview → offer → acceptance → onboarding; time-to-fill and offer acceptance rate
- Retention measured by voluntary/involuntary attrition, regrettable loss rate, tenure distribution, and stay interview insights
- Engagement measured by quarterly pulse survey, eNPS, 1:1 cadence, and flight risk signals
- Dashboard reviewed monthly; talent strategy review quarterly

## Core viewpoints

- Hiring is a funnel, not a lottery — every stage has a conversion rate; optimize the funnel, not just the top
- Retention starts on day one — the first 90 days are the highest risk period for new hires; onboarding quality predicts retention
- Regrettable loss is the only attrition metric that matters — losing low performers is healthy; losing high performers is a crisis
- Career growth is a retention strategy — the #1 reason engineers leave is lack of growth; growth paths must be visible and achievable

## Key information

### 5-panel talent overview

```
┌──────────────────────────────────────────────────────────────────┐
│  HIRING PIPELINE                 │  RETENTION & ATTRITION           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Open reqs:    8 active │   │  │  Headcount:   36 total   │   │
│  │  Candidates:  145 in pip│   │  │  Attrition:   12% (4)    │   │
│  │  Screening:    42       │   │  │  Voluntary:    8% (3)    │   │
│  │  Interview:    18       │   │  │  Regrettable:  6% (2)    │   │
│  │  Offer:         4       │   │  │  Avg tenure:   2.8 yrs  │   │
│  │  Time-to-fill: 42 days  │   │  │  < 1 yr:       8 (22%)  │   │
│  │  Accept rate:  78%      │   │  │  Flight risk:  5 people │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ENGAGEMENT & SATISFACTION       │  CAREER GROWTH                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  eNPS:         38       │   │  │  Promoted:     7 (19%)  │   │
│  │  Engagement:   78% ███▌ │   │  │  Lateral:      2 (6%)   │   │
│  │  Satisfaction: 4.0/5    │   │  │  IDP active:   28 (78%) │   │
│  │  1:1 cadence:  88%      │   │  │  Skill growth:  +18%    │   │
│  │  Recognition:  65%      │   │  │  Mentorship:   18 pairs │   │
│  │  Burnout risk: 8%       │   │  │  Stretch:      12 (33%) │   │
│  │  Stay interviews: 12/Q  │   │  │  Stagnation:    4 (11%) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Hiring pipeline

| Role | Level | Team | Req opened | Candidates | Screening | Interview | Offer | Status | Target close |
|---|---|---|---|---|---|---|---|---|---|
| Senior Frontend Engineer | L5 | Web | Jun 15 | 32 | 12 | 4 | 1 | Offer stage | Aug 15 |
| ML Engineer | L5 | AI/ML | Jul 1 | 28 | 8 | 3 | 0 | Interviewing | Aug 30 |
| Platform Engineer | L4 | Platform | Jul 10 | 22 | 7 | 3 | 1 | Offer stage | Aug 30 |
| Data Engineer | L4 | Data | Jul 15 | 18 | 5 | 2 | 0 | Interviewing | Sep 15 |
| Security Engineer | L5 | Security | Aug 1 | 15 | 4 | 1 | 0 | Screening | Sep 30 |
| Product Designer | L4 | Design | Aug 1 | 12 | 3 | 0 | 0 | Screening | Sep 30 |
| SRE | L4 | SRE | Jun 1 | 20 | 5 | 2 | 1 | Offer accepted | Aug 1 |
| Technical Writer | L3 | Knowledge | Jul 15 | 8 | 2 | 1 | 1 | Offer accepted | Aug 15 |
| **Total** | | | | **145** | **42** | **18** | **4** | | |

### Hiring funnel metrics

| Funnel stage | Current | Target | Benchmark | Issue |
|---|---|---|---|---|
| Source → Screen | 29% | > 30% | 25-30% | Minor — sourcing quality |
| Screen → Interview | 43% | > 45% | 40-50% | Minor — screening criteria |
| Interview → Offer | 22% | > 25% | 20-25% | On track |
| Offer → Acceptance | 78% | > 80% | 75-85% | Improve — compensation, speed |
| **Time-to-fill (avg)** | **42 days** | **< 35 days** | **30-45 days** | **Slow — interview scheduling** |
| **Cost-per-hire** | **$18,500** | **< $15,000** | **$12-20K** | **High — agency fees** |

### Hiring source effectiveness

| Source | Candidates | % of pipeline | → Interview | → Offer | Quality rating | Cost |
|---|---|---|---|---|---|---|
| Employee referral | 28 | 19% | 35% | 12% | 4.2/5 | $3K |
| LinkedIn (inbound) | 35 | 24% | 22% | 5% | 3.5/5 | $8K |
| LinkedIn (outbound) | 22 | 15% | 18% | 3% | 3.2/5 | $12K |
| Company careers page | 25 | 17% | 28% | 8% | 3.8/5 | $2K |
| Recruiting agency | 15 | 10% | 40% | 15% | 3.8/5 | $25K |
| Conference/meetup | 12 | 8% | 30% | 10% | 4.0/5 | $5K |
| GitHub/OSS community | 5 | 3% | 45% | 20% | 4.5/5 | $1K |
| Other | 3 | 2% | 20% | 5% | 3.0/5 | $2K |

### Attrition analysis (last 12 months)

| Quarter | Headcount | Voluntary | Involuntary | Regrettable | Attrition rate | Regrettable rate |
|---|---|---|---|---|---|---|
| 2025-Q3 | 32 | 1 | 0 | 1 | 3.1% | 3.1% |
| 2025-Q4 | 33 | 1 | 0 | 0 | 3.0% | 0% |
| 2026-Q1 | 34 | 1 | 1 | 1 | 5.9% | 2.9% |
| 2026-Q2 | 35 | 2 | 0 | 2 | 5.7% | 5.7% |
| 2026-Q3 (to date) | 36 | 1 | 1 | 1 | 5.6% | 2.8% |
| **Trailing 12 months** | | **6** | **2** | **5** | **12.5%** | **8.3%** |

### Exit interview themes (last 6 departures)

| Theme | Mentions | % of exits | Example quote |
|---|---|---|---|
| Compensation below market | 4 | 67% | "Got a 30% raise by switching companies" |
| Limited growth opportunities | 3 | 50% | "No clear path to staff engineer" |
| Remote work policy | 2 | 33% | "Wanted fully remote, we're hybrid" |
| Management/leadership | 2 | 33% | "Manager didn't advocate for my promotion" |
| Technical challenge | 1 | 17% | "Work became repetitive, not learning enough" |
| Burnout/overwork | 1 | 17% | "On-call burden was unsustainable" |

### Flight risk register

| Engineer | Team | Level | Tenure | Risk signal | Risk level | Retention action |
|---|---|---|---|---|---|---|
| Engineer A | Platform | L5 | 3.5 yrs | Declined promotion, disengaged in 1:1s | **High** | Career conversation, external mentor |
| Engineer B | AI/ML | L4 | 2.0 yrs | Interviewing elsewhere (rumored) | **High** | Compensation review, new project |
| Engineer C | Web | L5 | 4.0 yrs | Stagnation, no growth in 2 years | **High** | Staff engineer path, conference speaking |
| Engineer D | Mobile | L3 | 1.5 yrs | Expressed frustration with tooling | Medium | Tooling investment, skills growth |
| Engineer E | Data | L4 | 2.5 yrs | Passed over for promotion twice | Medium | Clear promotion timeline, skip-level |

### Engagement & satisfaction — pulse survey results (Q2 2026, N=34)

| Dimension | Score (1-5) | YoY change | Top quartile | Bottom quartile | Action |
|---|---|---|---|---|---|
| Meaningful work | 4.3 | +0.1 | 55% | 8% | Sustain |
| Autonomy & ownership | 4.1 | +0.2 | 48% | 10% | Sustain |
| Growth & learning | 3.7 | -0.1 | 35% | 18% | **Improve** |
| Recognition & feedback | 3.5 | 0 | 30% | 22% | **Improve** |
| Compensation & benefits | 3.6 | -0.2 | 32% | 25% | **Improve** |
| Work-life balance | 3.8 | +0.1 | 40% | 15% | Monitor |
| Team collaboration | 4.2 | +0.1 | 50% | 8% | Sustain |
| Leadership trust | 4.0 | +0.2 | 45% | 12% | Sustain |
| Tools & infrastructure | 3.9 | +0.3 | 42% | 10% | Sustain |
| **Overall engagement** | **4.0** | **+0.1** | | | |

### eNPS by team

| Team | eNPS | Promoters | Detractors | Top driver | Top concern |
|---|---|---|---|---|---|
| AI/ML | 45 | 55% | 10% | Meaningful work | Growth paths |
| Web Frontend | 42 | 50% | 12% | Team collaboration | Compensation |
| Platform | 32 | 40% | 18% | Autonomy | On-call burden |
| Mobile | 28 | 35% | 20% | Ownership | Tooling frustration |
| Data | 38 | 42% | 15% | Learning | Recognition |
| Security | 40 | 45% | 12% | Impact | Isolation |
| Design | 35 | 38% | 15% | Creativity | Headcount |
| **Overall** | **38** | **45%** | **14%** | | |

### Career growth — promotion velocity

| Level | Current count | Promoted in (12mo) | Avg time in level | Target time | On track? |
|---|---|---|---|---|---|
| L2 → L3 (Junior → Mid) | 5 | 3 (60%) | 1.2 years | 1-1.5 years | Green |
| L3 → L4 (Mid → Senior) | 12 | 3 (25%) | 2.5 years | 2-3 years | Yellow |
| L4 → L5 (Senior → Staff) | 8 | 1 (12%) | 3.8 years | 3-4 years | Yellow |
| L5 → L6 (Staff → Principal) | 2 | 0 (0%) | 5.2 years | 4-5 years | Red |
| L6+ (Principal/Distinguished) | 1 | 0 (0%) | N/A | N/A | N/A |

### Career development activity

| Activity | Participation | Satisfaction | Impact on retention |
|---|---|---|---|
| Individual Development Plan (IDP) | 78% | 3.8/5 | High — +15% retention |
| Regular 1:1s (biweekly or more) | 88% | 4.2/5 | High — +18% retention |
| Mentorship program | 50% | 4.1/5 | Medium — +10% retention |
| Conference attendance | 35% | 4.5/5 | Medium — +8% retention |
| Internal tech talks | 55% | 4.0/5 | Low — +3% retention |
| External training/courses | 25% | 3.8/5 | Medium — +7% retention |
| Cross-team rotation | 15% | 4.3/5 | High — +12% retention |
| Public speaking/representation | 22% | 4.4/5 | Medium — +9% retention |

### Workforce composition

| Dimension | Current | Target | Industry benchmark |
|---|---|---|---|
| Total engineering headcount | 36 | 40 | — |
| Gender diversity (% women/non-binary) | 28% | 35% | 25% |
| Underrepresented minorities | 18% | 25% | 15% |
| Remote vs. hybrid vs. onsite | 15% / 70% / 15% | 20% / 65% / 15% | — |
| Avg age | 31.5 | — | 32 |
| International hires | 22% | 25% | 20% |
| Internal promotions (vs external hire) | 42% | 50% | 35-45% |
| Boomerang rehires | 2 | — | — |

### Compensation competitiveness

| Level | Market median | Our median | Competitiveness | Gap | Adjustment needed? |
|---|---|---|---|---|---|
| L2 (Junior) | $95K | $92K | 97% | -$3K | Minor |
| L3 (Mid) | $125K | $122K | 98% | -$3K | Minor |
| L4 (Senior) | $160K | $152K | 95% | -$8K | **Yes — 5% gap** |
| L5 (Staff) | $200K | $188K | 94% | -$12K | **Yes — 6% gap** |
| L6 (Principal) | $250K | $235K | 94% | -$15K | **Yes — 6% gap** |
| Equity (L4+) | 0.08% | 0.06% | 75% | — | **Yes — equity refresh** |

## Action recommendations

1. **Address L4/L5 compensation gap**: 5-6% below market, #1 exit reason; adjust compensation bands, especially for retention-critical roles
2. **Flight risk intervention**: 5 engineers at high risk; immediate career conversations, compensation review, and retention packages for top 3
3. **Improve promotion velocity**: L4→L5 at 3.8 years (target 3-4), L5→L6 at 5.2 years (target 4-5); create clear promotion rubrics, quarterly calibration
4. **Reduce time-to-fill**: 42 days → 35 days; streamline interview scheduling, reduce interview panel from 5 to 4, improve offer turnaround
5. **Growth & learning score**: 3.7/5, declining; create dedicated learning budget ($2K/person/year), establish career lattices
6. **Recognition program**: 3.5/5, 22% bottom quartile; implement peer recognition program, celebrate wins in all-hands
7. **Stay interviews**: 12/Q → 24/Q; double frequency, focus on flight risk and high performers
8. **Referral program**: 19% of pipeline, highest quality; increase referral bonus, gamify referrals
9. **Diversity hiring**: 28% gender diversity, 18% URM; partner with diverse talent communities, review job descriptions for inclusive language
10. **Quarterly talent review**: review hiring, attrition, engagement, and compensation; update retention strategies



- Hiring for the resume, not the potential → filtering for exact tech stack match instead of learning ability; great engineers learn any stack
- Exit interview as therapy → collecting exit feedback without acting on it; exit interviews are worthless unless they drive systemic change
- Engagement survey as checkbox → running surveys without follow-up actions; unaddressed feedback is worse than no feedback at all
- Promotion as tenure → promoting based on time served rather than demonstrated impact; leveling must be based on scope and impact, not years
- Compensation as secret → hiding compensation bands and rationale; transparency builds trust, even when the answer is "we can't match that"

## Related

- Same class: [dashboard-engineering-capacity](dashboard-engineering-capacity.md) — capacity planning
- Same class: [dashboard-onboarding-progress](../../new-hire/onboarding/dashboard-onboarding-progress.md) — onboarding
- Same class: [dashboard-people-expertise](../../../knowledge-curator/people/dashboard-people-expertise.md) — expertise distribution
- References: Gallup — *State of the Global Workplace*; LinkedIn — *Global Talent Trends*; Culture Amp — *People Science*; Daniel Pink — *Drive*; Laszlo Bock — *Work Rules!*