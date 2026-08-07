---
title: diversity equity and inclusion dashboard
aliases:
- DEI dashboard
- diversity dashboard
- inclusion dashboard
- belonging dashboard
- pay equity dashboard
- representation dashboard
tags:
- dashboard
- diversity
- equity
- inclusion
- belonging
- pay-equity
- representation
- psychological-safety
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
- executive
- tech-lead
- skill-author
benefit: diversity representation, equity in compensation, and inclusion culture visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- representation, pay equity, hiring diversity, inclusion survey, retention equity, and belonging defined
related:
- ./dashboard-hiring-recruitment.md
- ./dashboard-career-development.md
- ./dashboard-skill-ecosystem.md
- ../../tech-lead/capacity/dashboard-talent-retention.md
- ../../engineer/process/dashboard-team-health-engagement.md
tacit: false
---

# diversity, equity, and inclusion dashboard

> **As an** executive, **I want to** track diversity, equity, and inclusion across the organization, **so that** every employee has equitable opportunity, compensation is fair, representation reflects the communities we serve, and DEI is a measured, accountable, and continuously improving practice — not an annual report that nobody reads.

> Diversity is a fact, inclusion is a choice, equity is a practice. This dashboard tracks representation, pay equity, hiring diversity, inclusion survey, retention equity, and belonging — turning DEI from a set of aspirational values into quantified, governed, and continuously improving organizational habits.

## Summary

- 6 DEI dimensions: representation, pay equity, hiring diversity, inclusion survey, retention equity, belonging
- 1,250 employees across 15 teams; 6 office locations + remote; 42 countries; 28 languages
- Representation: 32% women (target 40%); 18% underrepresented minorities (URM, target 25%); 8% LGBTQ+; 5% persons with disabilities; 12% 50+ age; leadership: 22% women, 8% URM (gap)
- Pay equity: 94% pay equity ratio (adjusted for role/level/location); 6% unexplained gap; 3 roles with > 10% gap; $0.92 women-to-men (adjusted); $0.88 URM-to-non-URM (adjusted)
- Hiring diversity: 35% diverse slate rate; 28% diverse hire rate; 42% diverse interview panel rate; 8% diverse referral rate; 4 roles with 0 diverse candidates in pipeline
- Dashboard reviewed monthly; DEI council review with executive leadership quarterly

## Core viewpoints

- Diversity without inclusion is a revolving door — hiring diverse talent and then having them leave within 18 months because the culture isn't inclusive is worse than not hiring them; retention equity is the measure of whether diversity initiatives are working
- Pay equity is the most objective DEI metric — you can debate whether your culture is inclusive, but you can't debate whether two people in the same role with the same performance are paid differently; pay equity is a math problem, and math problems have solutions
- The pipeline problem is a pipeline design problem — saying "we can't find diverse candidates" usually means "we're looking in the same places we've always looked"; 42% diverse interview panel rate and 8% diverse referral rate mean the pipeline is a mirror of the existing team
- Belonging is the leading indicator of retention — an employee who feels they belong is 5× more likely to stay, 3× more likely to recommend the company, and 2× more likely to speak up about problems; belonging is not a feeling, it's a predictor

## Key information

### 6-panel DEI overview

```
┌──────────────────────────────────────────────────────────────────┐
│  REPRESENTATION                       │  PAY EQUITY                            │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Women: 32% (target 40%) │   │  │  Pay equity ratio: 94%   │   │
│  │  URM: 18% (target 25%)   │   │  │  Unexplained gap: 6%     │   │
│  │  Leadership women: 22%   │   │  │  $0.92 women-to-men      │   │
│  │  Leadership URM: 8%      │   │  │  $0.88 URM-to-non-URM    │   │
│  │  Tech roles women: 22%   │   │  │  Roles > 10% gap: 3      │   │
│  │  Intersectionality: 5%   │   │  │  Gap trend: -0.5%/yr     │   │
│  │  Representation: B- (72) │   │  │  Pay equity score: B(78) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  HIRING DIVERSITY                     │  INCLUSION SURVEY                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Diverse slate: 35%      │   │  │  Inclusion score: 3.8/5  │   │
│  │  Diverse hire: 28%       │   │  │  "I belong": 78% agree   │   │
│  │  Diverse panel: 42%      │   │  │  "My voice matters": 72% │   │
│  │  Diverse referral: 8%    │   │  │  "Fair advancement": 65% │   │
│  │  0 diverse candidates: 4 │   │  │  Microaggression exp:    │   │
│  │  roles (critical)        │   │  │  28% (last 12 mo)        │   │
│  │  Hiring score: C+ (68)   │   │  │  Inclusion score: B- (72)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RETENTION EQUITY                     │  BELONGING                            │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Overall attrition: 12%  │   │  │  Belonging: 3.8/5        │   │
│  │  Women attrition: 15%    │   │  │  Psychological safety:   │   │
│  │  URM attrition: 18%      │   │  │  3.5/5 (target 4.0)     │   │
│  │  Attrition gap: +3% women│   │  │  ERG participation: 35%  │   │
│  │  +6% URM (vs non-URM)    │   │  │  Mentorship: 28% have    │   │
│  │  Exit interview: 22% cit │   │  │  ERG satisfaction: 4.2/5 │   │
│  │  inclusion as factor     │   │  │  Belonging score: B(78)  │   │
│  │  Retention score: C+(68) │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Representation by level and dimension

| Level | Total | Women | % | URM | % | LGBTQ+ | % | Disability | % | 50+ age | % |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Executive (C-suite)** | 8 | 1 | 12.5% | 0 | 0% | 0 | 0% | 0 | 0% | 2 | 25% |
| **VP** | 12 | 3 | 25% | 1 | 8% | 1 | 8% | 0 | 0% | 3 | 25% |
| **Director** | 22 | 5 | 23% | 2 | 9% | 1 | 5% | 1 | 5% | 4 | 18% |
| **Senior Manager** | 35 | 9 | 26% | 4 | 11% | 3 | 9% | 1 | 3% | 5 | 14% |
| **Manager** | 48 | 15 | 31% | 8 | 17% | 4 | 8% | 2 | 4% | 6 | 12.5% |
| **Senior IC** | 185 | 42 | 23% | 30 | 16% | 15 | 8% | 8 | 4% | 18 | 10% |
| **Mid-level IC** | 520 | 168 | 32% | 94 | 18% | 45 | 9% | 28 | 5% | 55 | 11% |
| **Junior IC** | 310 | 125 | 40% | 68 | 22% | 28 | 9% | 18 | 6% | 25 | 8% |
| **Admin/ops** | 85 | 52 | 61% | 28 | 33% | 10 | 12% | 6 | 7% | 15 | 18% |
| **Intern/contract** | 25 | 12 | 48% | 8 | 32% | 3 | 12% | 1 | 4% | 1 | 4% |
| **Overall** | **1,250** | **400** | **32%** | **225** | **18%** | **100** | **8%** | **62** | **5%** | **150** | **12%** |

### Representation by department

| Department | Total | Women % | URM % | Tech women % | Leadership women % | Trend | Action |
|---|---|---|---|---|---|---|---|
| **Engineering** | 650 | 22% | 15% | 20% | 18% | +2% | Targeted outreach, return-to-work program |
| **Product** | 85 | 35% | 18% | N/A | 28% | +3% | Good trajectory, maintain |
| **Data/AI** | 120 | 25% | 16% | 22% | 15% | +1% | Scholarship program, conference sponsorship |
| **SRE/Operations** | 85 | 15% | 12% | 12% | 10% | 0% | Critical gap — dedicated SRE diversity pipeline |
| **Design** | 35 | 48% | 22% | N/A | 40% | +5% | Strong — maintain and mentor |
| **Sales** | 95 | 38% | 22% | N/A | 25% | +2% | Good trajectory |
| **Marketing** | 55 | 52% | 25% | N/A | 35% | +3% | Strong |
| **Customer Success** | 65 | 45% | 28% | N/A | 30% | +2% | Good |
| **HR/People** | 30 | 72% | 35% | N/A | 60% | +5% | Strong |
| **Finance** | 25 | 48% | 18% | N/A | 30% | +1% | Good |
| **Legal** | 15 | 55% | 15% | N/A | 40% | 0% | Good |
| **Executive** | 25 | 28% | 8% | 15% | 22% | +1% | Priority: leadership diversity |

### Pay equity analysis

| Pay equity dimension | Adjusted ratio | Unadjusted ratio | Unexplained gap | Trend | Roles with > 10% gap | Action |
|---|---|---|---|---|---|---|
| **Women to men** (same role, level, location, performance) | $0.92 | $0.85 | 8% | -0.5%/yr | 2 (Senior Engineer, Architect) | Immediate adjustment for 2 roles, annual pay equity audit |
| **URM to non-URM** (adjusted) | $0.88 | $0.80 | 12% | -0.8%/yr | 3 (Manager, Staff Engineer, SRE) | Immediate adjustment for 3 roles, add URM pay equity to review |
| **LGBTQ+ to non-LGBTQ+** (adjusted) | $0.96 | $0.94 | 4% | -0.2%/yr | 0 | Within acceptable range, monitor |
| **Disability to non-disability** (adjusted) | $0.95 | $0.92 | 5% | -0.3%/yr | 0 | Within acceptable range, monitor |
| **50+ to under 50** (adjusted) | $1.02 | $1.08 | -2% | 0%/yr | 0 | Slight premium (experience), no action needed |
| **Overall** | **$0.94** | **$0.90** | **6%** | **-0.5%/yr** | **3** | |

### Hiring diversity funnel

| Hiring stage | Women | URM | LGBTQ+ | Disability | Target | Gap | Action |
|---|---|---|---|---|---|---|---|
| **Applicant pool** | 28% | 15% | 6% | 3% | 40% / 25% / 10% / 7% | -12% / -10% / -4% / -4% | Expand sourcing channels, diverse job boards |
| **Phone screen** | 26% | 14% | 5% | 2.5% | 35% / 22% / 8% / 5% | -9% / -8% / -3% / -2.5% | Blind resume review, standardized screen |
| **Onsite interview** | 24% | 12% | 5% | 2% | 30% / 20% / 8% / 5% | -6% / -8% / -3% / -3% | Diverse interview panels, structured rubrics |
| **Offer** | 22% | 11% | 4% | 2% | 28% / 18% / 8% / 5% | -6% / -7% / -4% / -3% | Standardize offer process, diverse negotiation support |
| **Hire** | 20% | 10% | 4% | 1.5% | 28% / 18% / 8% / 5% | -8% / -8% / -4% / -3.5% | Overall funnel conversion needs improvement |
| **Overall** | **28% diverse hire rate** | | | | **35% target** | **-7%** | |

### Inclusion survey results

| Inclusion dimension | 2025 score | 2026 score | Trend | Women | URM | Top driver | Bottom driver |
|---|---|---|---|---|---|---|---|
| **Belonging** ("I feel I belong here") | 3.6/5 | 3.8/5 | +0.2 | 3.5/5 | 3.3/5 | Team relationships | Leadership diversity |
| **Voice** ("My opinions are valued") | 3.5/5 | 3.6/5 | +0.1 | 3.4/5 | 3.2/5 | Manager support | Meeting participation equity |
| **Fair advancement** ("Promotions are fair") | 3.2/5 | 3.3/5 | +0.1 | 3.0/5 | 2.8/5 | Clear promotion criteria | Perceived favoritism |
| **Psychological safety** ("I can take risks") | 3.4/5 | 3.5/5 | +0.1 | 3.3/5 | 3.1/5 | Team psychological safety | Fear of negative consequences |
| **Microaggressions** (% experienced) | 32% | 28% | -4% | 38% | 45% | N/A | Interrupted in meetings, mistaken for junior |
| **Allyship** ("Allies actively support me") | 3.3/5 | 3.5/5 | +0.2 | 3.4/5 | 3.2/5 | Peer allyship | Leadership allyship visibility |
| **Overall inclusion** | **3.6/5** | **3.8/5** | **+0.2** | | | | |

### Retention equity by demographic

| Demographic | Headcount | Attrition (12 mo) | Voluntary attrition | Involuntary attrition | Avg tenure | Exit: inclusion cited | Exit: growth cited | Exit: comp cited |
|---|---|---|---|---|---|---|---|---|
| **Women** | 400 | 15% (60) | 12% (48) | 3% (12) | 2.2 yrs | 28% | 35% | 22% |
| **Men** | 850 | 11% (94) | 9% (77) | 2% (17) | 2.8 yrs | 12% | 38% | 28% |
| **URM** | 225 | 18% (40) | 15% (34) | 3% (7) | 1.8 yrs | 35% | 30% | 25% |
| **Non-URM** | 1,025 | 11% (113) | 9% (92) | 2% (21) | 2.8 yrs | 14% | 38% | 25% |
| **LGBTQ+** | 100 | 14% (14) | 12% (12) | 2% (2) | 2.0 yrs | 22% | 32% | 20% |
| **Disability** | 62 | 12% (7) | 10% (6) | 2% (1) | 2.5 yrs | 18% | 35% | 22% |
| **Overall** | **1,250** | **12% (150)** | **10% (125)** | **2% (25)** | **2.5 yrs** | **22%** | **35%** | **25%** |

### ERG and belonging programs

| ERG/Program | Members | % of eligible | Events/year | Budget | Satisfaction | Leadership sponsor | Impact |
|---|---|---|---|---|---|---|---|
| **Women in Tech** | 185 | 46% of women | 12 | $35K | 4.5/5 | VP Engineering | Career development, mentorship |
| **URM Alliance** | 128 | 57% of URM | 10 | $28K | 4.2/5 | CTO | Hiring pipeline, retention |
| **LGBTQ+ Pride** | 72 | 72% of LGBTQ+ | 8 | $15K | 4.3/5 | VP Product | Community, policy advocacy |
| **Disability Advocacy** | 38 | 61% of PwD | 6 | $12K | 4.0/5 | VP People | Accessibility, accommodations |
| **Generations (50+)** | 55 | 37% of 50+ | 4 | $8K | 3.8/5 | CFO | Knowledge transfer, mentoring |
| **Mentorship program** | 350 | 28% of company | 350 pairs | $25K | 4.1/5 | CEO | Career growth, retention |
| **Overall** | **828** | **35%** | **40** | **$123K** | **4.2/5** | | |

## Action recommendations

1. **Leadership diversity gap**: 22% women and 8% URM in leadership vs 32% and 18% overall; implement leadership development program for underrepresented groups, add diverse slate requirement for all leadership roles, target 30% women and 15% URM in leadership within 2 years
2. **URM retention crisis**: 18% attrition vs 12% overall, 35% cite inclusion; implement stay interviews for URM employees, add executive sponsor for each URM employee, address microaggression rate (45%), target < 12% URM attrition
3. **Pay equity adjustment**: 3 roles with > 10% unexplained gap; immediate salary adjustment for affected employees, implement annual pay equity audit, add pay equity to compensation review, target < 3% unexplained gap
4. **SRE diversity pipeline**: 15% women, 12% URM (lowest in company); create SRE apprenticeship program, partner with diversity-focused bootcamps, add SRE scholarships, target 22% women and 18% URM in 18 months
5. **Hiring funnel conversion**: 28% diverse hire rate vs 35% diverse applicant rate; analyze where diverse candidates drop out, implement blind resume review, standardize interview rubrics, add diverse panel requirement, target 32% diverse hire rate
6. **Microaggression reduction**: 28% experienced, 45% URM; implement microaggression training for all managers, add bystander intervention training, create reporting and response process, target < 15% experience rate
7. **Fair advancement perception**: 3.3/5 overall, 2.8/5 for URM; publish clear promotion criteria, add promotion committee with diverse representation, implement promotion calibration, target 3.8/5
8. **ERG participation expansion**: 35% overall participation; add ERG time allocation (2 hours/month), increase ERG budgets, add ERG leadership to career ladder, target 50% participation
9. **Mentorship program expansion**: 28% have mentors; expand to 50%, add cross-demographic mentorship, implement sponsorship program (not just mentorship), add mentorship to performance review
10. **Monthly DEI review**: review representation, pay equity, hiring diversity, inclusion survey, retention equity, and belonging with executive leadership and DEI council



- The "diversity is a number" trap → focusing exclusively on hiring representation (32% women, 18% URM) while ignoring retention equity (15% women attrition, 18% URM attrition); hiring diverse talent into a non-inclusive culture is a leaky bucket — you're filling it faster than it's draining, but it's still draining
- The "pipeline problem" deflection → blaming the lack of diverse candidates on the external pipeline without examining internal pipeline barriers; 4 roles with 0 diverse candidates, 8% diverse referral rate — the pipeline is a mirror of your network, and your network is not diverse
- The pay equity "adjust and forget" → fixing the 3 roles with > 10% gap and declaring pay equity solved; without annual pay equity audits, the gap will re-emerge within 2-3 years as new hires, promotions, and merit increases accumulate bias
- The ERG tax → expecting ERG leaders to do DEI work on top of their day jobs without compensation, recognition, or career credit; 35% ERG participation with $123K total budget is $148/person/year — about the cost of one team lunch per person
- The "we don't see color" colorblindness → claiming to treat everyone equally while ignoring that systemic inequities require systemic solutions; colorblindness is not inclusion — it's the refusal to acknowledge that different employees have different experiences, different barriers, and different needs

## Related

- Same class: [dashboard-hiring-recruitment](dashboard-hiring-recruitment.md) — hiring and recruitment
- Same class: [dashboard-career-development](dashboard-career-development.md) — career development
- Same class: [dashboard-skill-ecosystem](dashboard-skill-ecosystem.md) — skill ecosystem
- Same class: [dashboard-talent-retention](../../tech-lead/capacity/dashboard-talent-retention.md) — talent retention
- Same class: [dashboard-team-health-engagement](../../engineer/process/dashboard-team-health-engagement.md) — team health and engagement
- References: McKinsey — *Diversity Wins*; Harvard Business Review — *Why Diversity Programs Fail*; Project Include — *DEI Metrics Framework*; Google — *re:Work DEI Guide*; Iris Bohnet — *What Works: Gender Equality by Design*; Joan C. Williams — *Bias Interrupted*; Culture Amp — *DEI Benchmarking Report*