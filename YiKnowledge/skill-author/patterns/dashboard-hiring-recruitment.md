---
title: hiring and recruitment dashboard
aliases:
- recruitment dashboard
- hiring pipeline dashboard
- talent acquisition dashboard
- recruiting health dashboard
- employer brand dashboard
tags:
- dashboard
- hiring
- recruitment
- talent-acquisition
- interview-quality
- pipeline-health
- offer-acceptance
- time-to-hire
category: skill-author/patterns
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- tech-lead
- executive
- skill-author
benefit: hiring pipeline health, recruitment efficiency, and talent acquisition quality visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- pipeline health, time-to-hire, interview quality, offer acceptance, source effectiveness, and candidate experience defined
related:
- ./dashboard-career-development.md
- ./dashboard-skill-ecosystem.md
- ./dashboard-learning-development.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
- ../../tech-lead/capacity/dashboard-talent-retention.md
tacit: false
---

# hiring and recruitment dashboard

> **As a** tech lead, **I want to** track hiring pipeline health and recruitment effectiveness, **so that** every open role is filled with the right person, in the right timeframe, through a fair and efficient process — turning hiring from a reactive scramble into a measured, predictable, and continuously improving talent engine.

> Hiring is the most consequential investment a team makes. This dashboard tracks pipeline health, time-to-hire, interview quality, offer acceptance, source effectiveness, and candidate experience — turning recruitment from "we need someone yesterday" panic into a strategic, data-driven, and candidate-centric practice.

## Summary

- 6 hiring dimensions: pipeline health, time-to-hire, interview quality, offer acceptance, source effectiveness, candidate experience
- 42 open roles across 15 teams; 1,850 candidates in pipeline; 285 interviews/month; 18 offers/month; 14 hires/month
- Pipeline health: 42 open roles; 1,850 active candidates; 44:1 candidate-to-role ratio; 8 roles at risk (pipeline < 5 qualified candidates); 3 roles stale (> 60 days open)
- Time-to-hire: 42 days avg (target < 35); 28 days engineering; 55 days niche (ML, security); 12 days from offer to acceptance; 22 days from acceptance to start
- Interview quality: 4.2/5 candidate satisfaction; 85% interviewer calibration; 12% no-show rate; 8% interview-to-offer conversion; 2.8 avg interview rounds per hire
- Dashboard reviewed weekly; hiring retrospective with engineering leadership monthly

## Core viewpoints

- Time-to-hire is a competitive advantage, not an HR metric — the best candidates are off the market in 10 days; a 42-day hiring process means you're only hiring people who couldn't get hired faster elsewhere, not the best people who were available
- Every interview stage that doesn't predict performance is noise — if your interview process has 5 stages but only 2 of them correlate with on-the-job success, you're adding 3 stages of friction that drive away candidates without improving hire quality
- Source diversity is pipeline diversity — if 80% of your hires come from employee referrals, your pipeline looks like your existing team; diverse sourcing channels (bootcamps, conferences, underrepresented communities, global talent) are the only way to build a diverse team
- The candidate experience is your employer brand in action — every candidate who has a bad experience tells 10 people; every candidate who has a great experience tells 3 but applies again and refers others; the math of candidate experience is asymmetric

## Key information

### 6-panel hiring overview

```
┌──────────────────────────────────────────────────────────────────┐
│  PIPELINE HEALTH                      │  TIME-TO-HIRE                         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Open roles: 42          │   │  │  Avg time-to-hire: 42d  │   │
│  │  Active candidates: 1,850│   │  │  Engineering: 28d       │   │
│  │  Qualified: 38% (703)    │   │  │  Niche roles: 55d       │   │
│  │  Roles at risk: 8        │   │  │  Offer→accept: 12d      │   │
│  │  Stale roles: 3 (>60d)   │   │  │  Accept→start: 22d      │   │
│  │  New applicants/wk: 185  │   │  │  Time-to-productivity:   │   │
│  │  Pipeline score: B (78)  │   │  │  45d (after start)      │   │
│  │                           │   │  │  TTH score: B- (72)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  INTERVIEW QUALITY                    │  OFFER ACCEPTANCE                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Candidate sat: 4.2/5    │   │  │  Offer acceptance: 72%   │   │
│  │  Interviewer calib: 85%  │   │  │  Engineering: 78%        │   │
│  │  No-show rate: 12%       │   │  │  Niche: 58% (low)        │   │
│  │  Interview→offer: 8%     │   │  │  Declined: comp (35%),   │   │
│  │  Avg rounds to hire: 2.8 │   │  │  role (28%), process (22%)│   │
│  │  Structured interviews:  │   │  │  Counter-offer loss: 15% │   │
│  │  72% of loops            │   │  │  Offer-to-hire lag: 8d   │   │
│  │  Interview score: B(78)  │   │  │  Offer score: B- (72)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SOURCE EFFECTIVENESS                │  CANDIDATE EXPERIENCE                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Referral: 35% (best)    │   │  │  NPS: 38 (candidates)   │   │
│  │  LinkedIn: 22%           │   │  │  Response time: 4.2d    │   │
│  │  Company careers: 18%    │   │  │  Feedback quality: 3.8/5│   │
│  │  Recruiter sourced: 15%  │   │  │  Rejection experience:   │   │
│  │  Job boards: 8%          │   │  │  3.2/5 (ghosting 18%)   │   │
│  │  Cost/hire: $12,500 avg  │   │  │  Offer transparency:     │   │
│  │  Source score: B (78)    │   │  │  4.5/5 (comp, equity)   │   │
│  └─────────────────────────┘   │  │  Experience score: B(78) │   │
│                                │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Pipeline health by department

| Department | Open roles | Candidates | Qualified | Pipeline ratio | Avg days open | At risk | Stale | Priority |
|---|---|---|---|---|---|---|---|---|
| **Core Platform** | 8 | 420 | 180 (43%) | 52:1 | 35 | 1 | 0 | High |
| **YiVad** | 6 | 320 | 135 (42%) | 53:1 | 28 | 1 | 0 | High |
| **YiWeb** | 5 | 260 | 110 (42%) | 52:1 | 32 | 0 | 0 | Medium |
| **YiPet** | 3 | 145 | 52 (36%) | 48:1 | 38 | 1 | 0 | Medium |
| **YiAi** | 5 | 280 | 122 (44%) | 56:1 | 25 | 0 | 0 | High |
| **Data Platform** | 4 | 158 | 48 (30%) | 39:1 | 48 | 2 | 1 | High (niche) |
| **SRE** | 3 | 125 | 38 (30%) | 41:1 | 45 | 1 | 1 | High (niche) |
| **Security** | 2 | 62 | 22 (35%) | 31:1 | 52 | 1 | 1 | High (niche) |
| **Product** | 3 | 135 | 55 (41%) | 45:1 | 35 | 0 | 0 | Medium |
| **Design** | 2 | 85 | 35 (41%) | 42:1 | 30 | 0 | 0 | Medium |
| **Other** | 1 | 40 | 18 (45%) | 40:1 | 25 | 0 | 0 | Low |
| **Overall** | **42** | **1,850** | **703 (38%)** | **44:1** | **42** | **8** | **3** | |

### Time-to-hire by role type

| Role type | Open roles | Application→screen | Screen→onsite | Onsite→offer | Offer→accept | Accept→start | Total TTH | Target | Gap |
|---|---|---|---|---|---|---|---|---|---|
| **Software Engineer (general)** | 12 | 5d | 8d | 5d | 8d | 18d | 44d | 30d | +14d |
| **Frontend Engineer** | 5 | 4d | 7d | 4d | 7d | 18d | 40d | 30d | +10d |
| **SRE/DevOps** | 3 | 8d | 10d | 7d | 12d | 22d | 59d | 35d | +24d |
| **ML/AI Engineer** | 5 | 10d | 12d | 8d | 15d | 25d | 70d | 40d | +30d |
| **Security Engineer** | 2 | 12d | 15d | 10d | 18d | 28d | 83d | 45d | +38d |
| **Data Engineer** | 3 | 8d | 10d | 6d | 10d | 22d | 56d | 35d | +21d |
| **Product Manager** | 3 | 6d | 8d | 6d | 10d | 20d | 50d | 35d | +15d |
| **Designer** | 2 | 5d | 7d | 5d | 8d | 18d | 43d | 30d | +13d |
| **Engineering Manager** | 2 | 8d | 10d | 8d | 14d | 25d | 65d | 40d | +25d |
| **Other** | 5 | 6d | 8d | 5d | 8d | 20d | 47d | 35d | +12d |
| **Overall** | **42** | **6d** | **9d** | **6d** | **12d** | **22d** | **42d** | **35d** | **+7d** |

### Interview quality and calibration

| Interview type | Structured % | Avg duration | Calibration % | Predictive validity | Candidate sat | No-show rate |
|---|---|---|---|---|---|---|
| **Technical screen** (coding) | 85% | 45 min | 88% | 0.42 (moderate) | 4.0/5 | 8% |
| **System design** | 78% | 60 min | 82% | 0.38 (moderate) | 4.2/5 | 10% |
| **Behavioral/values** | 72% | 45 min | 75% | 0.35 (moderate) | 4.3/5 | 5% |
| **Take-home project** | 65% | 3-4 hours | 68% | 0.52 (good) | 3.5/5 | 18% (dropout) |
| **Hiring manager** | 68% | 45 min | 78% | 0.40 (moderate) | 4.4/5 | 4% |
| **Peer/team** | 55% | 45 min | 62% | 0.30 (low) | 4.5/5 | 3% |
| **Executive/VP** | 70% | 30 min | 72% | 0.25 (low) | 4.2/5 | 5% |
| **Overall** | **72%** | **50 min** | **85%** | | **4.2/5** | **12%** |

### Offer acceptance and decline analysis

| Decline reason | % of declines | Offers lost | Avg comp gap | Counter-offer | Preventable | Action |
|---|---|---|---|---|---|---|
| **Compensation below market** | 35% | 18/year | 15-20% below market | 8 (44%) | Yes | Adjust bands to P50-P75, add equity review |
| **Role/responsibility mismatch** | 28% | 14/year | N/A | 2 (14%) | Partially | Clarify role in JD, add team match call |
| **Process too slow/long** | 22% | 11/year | N/A | 0 | Yes | Reduce TTH, add fast-track for top candidates |
| **Counter-offer from current** | 15% | 8/year | 10-25% above | 8 (100%) | Partially | Pre-close on commitment, add retention bonus |
| **Location/remote policy** | 10% | 5/year | N/A | 0 | Partially | Clarify remote policy upfront, relocation support |
| **Overall** | | **56/year** | | | **72% preventable** | |

### Source effectiveness by channel

| Source | Applicants | % of total | Qualified % | Interview rate | Offer rate | Hire rate | Cost/hire | Quality score |
|---|---|---|---|---|---|---|---|---|
| **Employee referral** | 280 | 15% | 52% | 28% | 12% | 8% | $5,200 | 8.5/10 |
| **LinkedIn (inbound)** | 450 | 24% | 32% | 18% | 6% | 3.5% | $8,500 | 7.2/10 |
| **LinkedIn (sourced)** | 320 | 17% | 45% | 22% | 8% | 4.5% | $15,000 | 7.8/10 |
| **Company careers page** | 380 | 20% | 28% | 15% | 5% | 2.8% | $3,200 | 6.8/10 |
| **Job boards** (Indeed, etc.) | 520 | 28% | 15% | 8% | 2% | 0.8% | $6,500 | 5.5/10 |
| **Recruiter sourced** | 180 | 10% | 48% | 25% | 10% | 5.5% | $22,000 | 8.0/10 |
| **Conference/event** | 85 | 5% | 42% | 20% | 8% | 3.5% | $12,000 | 7.5/10 |
| **Bootcamp pipeline** | 55 | 3% | 35% | 15% | 5% | 2.5% | $8,000 | 7.0/10 |
| **Overall** | **1,850** | **100%** | **38%** | **18%** | **6%** | **3.2%** | **$12,500** | **7.2/10** |

### Candidate experience NPS

| Stage | NPS | Response time (avg) | Ghosting % | Feedback quality | Top complaint | Improvement |
|---|---|---|---|---|---|---|
| **Application** | 42 | 2.5 days | 15% | 3.5/5 | "No confirmation email" | Auto-confirmation, status tracker |
| **Recruiter screen** | 45 | 1.8 days | 8% | 4.0/5 | "Scheduling back-and-forth" | Self-serve scheduling tool |
| **Technical interview** | 38 | 3.5 days | 12% | 3.8/5 | "Interviewer unprepared" | Interviewer calibration, rubrics |
| **Onsite/virtual loop** | 35 | 5.2 days | 18% | 3.5/5 | "Too many rounds, exhausting" | Consolidate rounds, max 4 hours |
| **Offer stage** | 48 | 2.0 days | 5% | 4.5/5 | "Comp below expectations" | Market adjustment, transparent bands |
| **Rejection** | 18 | 8.5 days | 28% | 2.5/5 | "Ghosted after final round" | 48-hour post-interview response SLA |
| **Overall** | **38** | **4.2 days** | **18%** | **3.8/5** | | |

## Action recommendations

1. **Niche role time-to-hire reduction**: Security (83d), ML (70d), EM (65d) far above targets; build dedicated niche pipelines, pre-qualify passive candidates, add signing bonus for niche roles, target < 50d for all roles
2. **Offer acceptance improvement**: 72% acceptance, 35% declined due to comp; adjust salary bands to P50-P75 market, add compensation transparency in first call, implement pre-close process, target 82% acceptance
3. **Rejection experience overhaul**: NPS 18 for rejected candidates, 28% ghosting; implement 48-hour post-interview response SLA, provide constructive feedback to final-round candidates, add rejection auto-communication
4. **Interview process compression**: 2.8 avg rounds but 42-day TTH; consolidate technical screen + system design into single round, eliminate low-predictive-validity stages (peer, executive), target 2.5 rounds and 30-day TTH
5. **Stale role intervention**: 3 roles > 60 days open; escalate to executive sponsor, increase sourcing budget, consider contractor/consultant as bridge, add 45-day stale role trigger
6. **Take-home project reform**: 18% dropout rate, 3.5/5 candidate satisfaction; offer paid take-home ($200 compensation), cap at 2 hours, provide alternative live coding option, target < 10% dropout
7. **Source channel optimization**: job boards deliver 28% of applicants but only 0.8% hire rate; reduce job board spend, increase referral bonus ($5K→$8K), expand bootcamp and conference pipelines
8. **Interviewer calibration**: 85% calibrated, 28% of interviews unstructured; mandate structured interview training, add rubric-based scoring, implement shadow interviewer program for new interviewers
9. **Candidate communication automation**: 4.2-day avg response time, 15% application ghosting; implement ATS auto-responder, add candidate portal with status tracking, add recruiter response time SLA
10. **Weekly hiring review**: review pipeline health, time-to-hire, interview quality, offer acceptance, source effectiveness, and candidate experience with engineering leadership and recruiting



- The "we only hire the top 1%" arrogance → designing an interview process that filters for people who think like the existing team, not people who can do the job; a 6-round interview process with 2 take-home projects doesn't find the best engineers — it finds the engineers with the most free time
- The pipeline as a numbers game → focusing on top-of-funnel volume (1,850 candidates) while ignoring conversion rates (3.2% hire); 500 more unqualified applicants from job boards will not solve a niche SRE role that needs 5 qualified candidates
- The "we'll know it when we see it" rubric → evaluating candidates without structured criteria, written feedback, or calibrated scoring; unstructured interviews have 0.25-0.35 predictive validity — barely better than random — while structured interviews with rubrics reach 0.5-0.6
- The counter-offer surprise → investing 40 days in a candidate only to lose them to a counter-offer; if you haven't discussed their commitment to leaving, their notice period, and their current comp before the offer stage, you're gambling, not recruiting
- The ghosting asymmetry → expecting candidates to respond within 24 hours while taking 8.5 days to respond to them; a company that ghosts candidates after a final round is building a reputation that will cost them hundreds of future candidates

## Related

- Same class: [dashboard-career-development](dashboard-career-development.md) — career development
- Same class: [dashboard-skill-ecosystem](dashboard-skill-ecosystem.md) — skill ecosystem
- Same class: [dashboard-learning-development](dashboard-learning-development.md) — learning and development
- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — engineering capacity
- Same class: [dashboard-talent-retention](../../tech-lead/capacity/dashboard-talent-retention.md) — talent retention
- References: Google — *re:Work Hiring Guide*; Greenhouse — *Recruiting Metrics Report*; Lever — *Talent Acquisition Benchmarking*; Daniel Kahneman — *Structured Interviews and Decision Making*; Laszlo Bock — *Work Rules!*; LinkedIn — *Global Talent Trends*; SHRM — *Talent Acquisition Benchmarking*