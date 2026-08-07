---
title: career development and growth dashboard
aliases:
- career growth dashboard
- career ladder dashboard
- promotion dashboard
- professional development dashboard
tags:
- dashboard
- career-development
- career-ladder
- promotion
- mentorship
- skill-growth
- internal-mobility
category: skill-author/patterns
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- tech-lead
- executive
- engineer
benefit: career development, promotion velocity, and professional growth visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- career ladder, promotion velocity, skill progression, mentorship, internal mobility, and growth equity defined
related:
- ./dashboard-learning-development.md
- ./dashboard-skill-ecosystem.md
- ../../tech-lead/capacity/dashboard-talent-retention.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
- ../../engineer/process/dashboard-team-health-engagement.md
tacit: false
---

# career development and growth dashboard

> **As a** tech lead, **I want to** track career development and professional growth across the engineering organization, **so that** every engineer has a clear growth path, promotions are fair and timely, skills are progressing, and nobody leaves because they couldn't see a future here.

> Career development is the #1 retention driver. This dashboard tracks career ladder health, promotion velocity, skill progression, mentorship effectiveness, internal mobility, and growth equity — turning career growth from a once-a-year review conversation into a continuously measured, actively managed organizational capability.

## Summary

- 6 career development dimensions: career ladder health, promotion velocity, skill progression, mentorship, internal mobility, growth equity
- 285 engineers across 5 levels (L3-L7); 12 career tracks; 8 job families; average tenure: 2.8 years
- Promotion velocity: 18 months average time-in-level (target 18-24); 42 promotions in last 12 months; 15% promotion rate
- 28 engineers (10%) at promotion readiness; 12 (4.2%) overdue for promotion (> 30 months in level); 8 (2.8%) at risk of leaving due to growth stagnation
- 85 active mentorship pairs; 68% mentorship satisfaction; 55% of engineers have a documented development plan
- Internal mobility: 22 internal transfers in 12 months (7.7%); 8 cross-team rotations; 4 engineers on leadership track
- Dashboard reviewed monthly; career development deep-dive quarterly with engineering leadership

## Core viewpoints

- Career growth is not a promotion — it's skill expansion, scope increase, and impact amplification; a promotion is the recognition of growth that has already happened, not a promise of growth to come
- The career ladder is a map, not a cage — it should describe the paths available, not limit the paths possible; if the ladder doesn't have a path for someone who wants to go deep technically without managing people, the ladder is broken
- Promotion velocity is a system metric, not an individual metric — if qualified engineers are waiting 30+ months for promotion, the system is broken, not the engineers
- Growth equity is a moral and business imperative — if promotion rates, time-in-level, or mentorship access differ by demographic, the system is biased; equity in growth is the foundation of an inclusive organization

## Key information

### 6-panel career development overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CAREER LADDER HEALTH              │  PROMOTION VELOCITY                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Levels: L3-L7 (5)       │   │  │  Promotions/yr: 42       │   │
│  │  Tracks: 12              │   │  │  Promotion rate: 15%     │   │
│  │  Job families: 8         │   │  │  Avg time-in-level: 18mo │   │
│  │  Ladder clarity: 78/100  │   │  │  Ready for promo: 28     │   │
│  │  Expectations gap: 22%   │   │  │  Overdue (>30mo): 12     │   │
│  │  Ladder refresh: 12 mo   │   │  │  At risk (stagnation): 8 │   │
│  │  Ladder score: B (80)    │   │  │  Promotion score: B+     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SKILL PROGRESSION                 │  MENTORSHIP                         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Dev plans: 55% coverage │   │  │  Active pairs: 85        │   │
│  │  Skill gap closure: 72%  │   │  │  Satisfaction: 68%       │   │
│  │  Technical breadth: B    │   │  │  Mentor coverage: 58%    │   │
│  │  Leadership skills: C+   │   │  │  Avg sessions/mo: 2.2    │   │
│  │  Communication: B-       │   │  │  Mentee growth: 72%      │   │
│  │  Business acumen: C      │   │  │  Mentor development: 65% │   │
│  │  Skill score: B- (72)    │   │  │  Mentorship score: B-    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  INTERNAL MOBILITY                 │  GROWTH EQUITY                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Transfers/yr: 22 (7.7%)│   │  │  Time-in-level equity: B │   │
│  │  Cross-team rotations: 8 │   │  │  Promotion rate equity:B-│   │
│  │  IC→Manager: 4           │   │  │  Mentorship equity: B    │   │
│  │  Manager→IC: 2           │   │  │  Development plan: C+    │   │
│  │  Open roles filled int: 45%│  │  │  Sponsorship coverage:62%│  │
│  │  Mobility satisfaction:72%│  │  │  Pay equity: 94%         │   │
│  │  Mobility score: B       │   │  │  Equity score: B- (72)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Career ladder health

| Level | Title | Engineers | % of org | Avg tenure | Expected time-in-level | Actual time-in-level | Health |
|---|---|---|---|---|---|---|---|
| **L3** | Junior Engineer | 42 | 15% | 1.2 yr | 12-18 months | 14 months | A (90) |
| **L4** | Engineer | 95 | 33% | 2.1 yr | 18-30 months | 22 months | B+ (85) |
| **L5** | Senior Engineer | 82 | 29% | 3.2 yr | 24-36 months | 24 months | B+ (84) |
| **L6** | Staff Engineer | 45 | 16% | 4.5 yr | 30-48 months | 28 months | B (80) |
| **L7** | Principal Engineer | 15 | 5% | 6.2 yr | 36-60 months | 32 months | B+ (82) |
| **L8+** | Distinguished/VP | 6 | 2% | 8.5 yr | N/A | N/A | A (88) |
| **Overall** | | **285** | | **2.8 yr** | | | **B+ (84)** |

### Career track distribution

| Track | Engineers | L3 | L4 | L5 | L6 | L7 | L8+ | Avg level | Promotion rate (12 mo) |
|---|---|---|---|---|---|---|---|---|---|
| **Software Engineering** (IC) | 125 | 22 | 48 | 35 | 14 | 4 | 2 | L4.5 | 18 (14%) |
| **SRE/Infrastructure** | 35 | 5 | 12 | 10 | 5 | 2 | 1 | L4.8 | 5 (14%) |
| **Data Engineering** | 28 | 4 | 10 | 8 | 4 | 2 | 0 | L4.6 | 4 (14%) |
| **AI/ML Engineering** | 32 | 5 | 10 | 10 | 5 | 2 | 0 | L4.8 | 5 (16%) |
| **Security Engineering** | 18 | 2 | 6 | 5 | 3 | 1 | 1 | L4.8 | 2 (11%) |
| **Quality Engineering** | 15 | 2 | 5 | 4 | 3 | 1 | 0 | L4.6 | 2 (13%) |
| **Engineering Management** | 22 | 0 | 0 | 6 | 8 | 5 | 3 | L6.2 | 4 (18%) |
| **Product Management** (technical) | 10 | 2 | 3 | 3 | 2 | 0 | 0 | L4.5 | 2 (20%) |
| **Overall** | **285** | **42** | **94** | **81** | **44** | **17** | **7** | **L4.7** | **42 (15%)** |

### Ladder clarity and expectations

| Level | Ladder doc exists | Expectations clear | Calibrated across teams | Gap: "I don't know what's expected" | Key issue |
|---|---|---|---|---|---|
| L3 | Yes | 85% | 80% | 15% | Some teams skip L3, expectations vary |
| L4 | Yes | 78% | 72% | 22% | L4→L5 bar inconsistent across teams |
| L5 | Yes | 75% | 68% | 25% | "Senior" means different things in different teams |
| L6 | Yes | 72% | 65% | 28% | Staff role poorly defined, scope varies 5× |
| L7 | Partial | 65% | 58% | 35% | Principal expectations unclear, only 15 examples |
| **Overall** | | **78/100** | **72/100** | **22%** | |

### Promotion velocity

| Promotion metric | Current | 6 months ago | 12 months ago | Industry benchmark | Target |
|---|---|---|---|---|---|
| **Total promotions** (12 mo) | 42 | 38 | 35 | — | — |
| **Promotion rate** | 15% | 14% | 13% | 15-20% | 18% |
| **Avg time-in-level** (all) | 18 months | 20 months | 22 months | 18-24 months | 18-24 months |
| **L3→L4 time** | 14 months | 15 months | 16 months | 12-18 months | 14 months |
| **L4→L5 time** | 22 months | 24 months | 26 months | 18-24 months | 20 months |
| **L5→L6 time** | 24 months | 26 months | 28 months | 24-36 months | 24 months |
| **L6→L7 time** | 28 months | 30 months | 34 months | 30-48 months | 30 months |
| **Promotion pass rate** (first attempt) | 72% | 68% | 65% | 70-80% | 80% |
| **Overall promotion health** | **B+ (82)** | **B (78)** | **B- (72)** | | **B+ (85)** |

### Promotion pipeline

| Level | Engineers | Ready now | Ready in 6 mo | Ready in 12 mo | Overdue (>30 mo) | Stagnation risk |
|---|---|---|---|---|---|---|
| L3 → L4 | 42 | 12 (29%) | 8 (19%) | 5 (12%) | 2 (5%) | 1 (2%) |
| L4 → L5 | 95 | 10 (11%) | 15 (16%) | 12 (13%) | 5 (5%) | 3 (3%) |
| L5 → L6 | 82 | 4 (5%) | 8 (10%) | 10 (12%) | 3 (4%) | 2 (2%) |
| L6 → L7 | 45 | 2 (4%) | 3 (7%) | 5 (11%) | 2 (4%) | 1 (2%) |
| L7 → L8 | 15 | 0 (0%) | 1 (7%) | 2 (13%) | 0 (0%) | 1 (7%) |
| **Total** | **279** | **28 (10%)** | **35 (13%)** | **34 (12%)** | **12 (4.2%)** | **8 (2.8%)** |

### Engineers overdue for promotion

| Engineer | Level | Team | Time in level | Overdue by | Reason | Plan | Status |
|---|---|---|---|---|---|---|---|
| E1 | L4 | Platform | 38 months | 8 months | Scope limited, no L5-level projects | Assigned L5-scope project, mentor | In progress |
| E2 | L4 | Mobile | 36 months | 6 months | Cross-team impact not visible | Cross-team initiative, promotion packet | In progress |
| E3 | L4 | Data | 34 months | 4 months | Skill gap in system design | System design training, design review | In progress |
| E4 | L5 | Web Frontend | 38 months | 2 months | No L6-scope work in team | Staff-level initiative, architecture ownership | In progress |
| E5 | L5 | QA | 36 months | 0 months | Limited visibility to promotion committee | Documentation, cross-team presentation | In progress |
| E6 | L3 | DevOps | 32 months | 2 months | Manager churn, no consistent sponsor | New manager, promotion plan reset | In progress |
| E7 | L4 | Security | 32 months | 2 months | Niche role, hard to demonstrate L5 scope | Broader security initiative, mentorship | In progress |
| E8 | L6 | AI/ML | 42 months | 6 months | L7 bar poorly defined | Principal expectations workshop, sponsor | In progress |

### Skill progression

| Skill dimension | L3 | L4 | L5 | L6 | L7 | Overall | Target | Gap |
|---|---|---|---|---|---|---|---|---|
| **Technical depth** | B+ | B+ | B | A- | A | B+ (82) | A- (88) | -6 |
| **Technical breadth** | C+ | B- | B | B+ | A- | B (78) | B+ (85) | -7 |
| **System design** | C | B- | B | B+ | A- | B- (74) | B+ (85) | -11 |
| **Code quality** | B | B+ | B+ | B+ | A- | B+ (82) | A- (88) | -6 |
| **Communication** | C+ | B- | B | B+ | B+ | B- (72) | B+ (85) | -13 |
| **Leadership** | D | C | B- | B+ | A- | C+ (65) | B (80) | -15 |
| **Project management** | C | C+ | B- | B | B+ | C+ (68) | B (80) | -12 |
| **Mentorship** | D | C | B- | B+ | A- | C+ (66) | B (80) | -14 |
| **Business acumen** | D | D+ | C | B- | B | C (58) | B- (72) | -14 |
| **Overall skill score** | **C+ (68)** | **B- (72)** | **B (76)** | **B+ (82)** | **A- (86)** | **B- (72)** | **B+ (84)** | **-12** |

### Development plan coverage

| Level | Engineers | Has dev plan | Plan quality | Plan updated (6 mo) | Manager reviewed | Plan effectiveness |
|---|---|---|---|---|---|---|
| L3 | 42 | 32 (76%) | B (78) | 28 (67%) | 30 (71%) | B (78) |
| L4 | 95 | 58 (61%) | B- (72) | 42 (44%) | 48 (51%) | B- (70) |
| L5 | 82 | 42 (51%) | B- (70) | 28 (34%) | 35 (43%) | C+ (65) |
| L6 | 45 | 18 (40%) | C+ (68) | 12 (27%) | 15 (33%) | C (62) |
| L7 | 15 | 5 (33%) | C+ (65) | 3 (20%) | 4 (27%) | C (58) |
| **Overall** | **279** | **155 (55%)** | **B- (72)** | **113 (40%)** | **132 (47%)** | **C+ (68)** |

### Mentorship program health

| Mentorship metric | Current | 6 months ago | Target | Notes |
|---|---|---|---|---|
| **Active mentorship pairs** | 85 | 72 | 120 | 58% of engineers have a mentor |
| **Mentor coverage** | 58% | 52% | 80% | 42% of engineers without mentor |
| **Mentorship satisfaction** (mentee) | 68% | 65% | 85% | 32% of mentees dissatisfied |
| **Mentorship satisfaction** (mentor) | 72% | 68% | 85% | 28% of mentors feel unsupported |
| **Average sessions/month** | 2.2 | 2.0 | 4 | Sessions are bi-weekly, not weekly |
| **Average mentorship duration** | 8.5 months | 7.2 months | 12+ months | Many pairs dissolve too early |
| **Mentee-reported growth** | 72% | 68% | 85% | 28% report no significant growth |
| **Mentor skill development** | 65% | 62% | 80% | Mentors need training |
| **Mentor training completion** | 55% | 48% | 100% | 45% of mentors untrained |
| **Overall mentorship score** | **B- (72)** | **C+ (68)** | **B+ (85)** | |

### Mentorship by level

| Level | Engineers | Have mentor | Are mentors | Mentorship gap | Key issue |
|---|---|---|---|---|---|
| L3 | 42 | 38 (90%) | 0 (0%) | 4 (10%) | High coverage, good |
| L4 | 95 | 68 (72%) | 8 (8%) | 27 (28%) | Coverage drops at L4 |
| L5 | 82 | 42 (51%) | 22 (27%) | 40 (49%) | L5s need mentorship too |
| L6 | 45 | 15 (33%) | 28 (62%) | 30 (67%) | L6+ mostly mentor, rarely mentored |
| L7 | 15 | 2 (13%) | 12 (80%) | 13 (87%) | L7s have no mentorship |
| L8+ | 6 | 0 (0%) | 5 (83%) | 6 (100%) | Executive coaching only |
| **Overall** | **285** | **165 (58%)** | **75 (26%)** | **120 (42%)** | |

### Internal mobility

| Mobility metric | Current | 6 months ago | 12 months ago | Industry benchmark | Target |
|---|---|---|---|---|---|
| **Internal transfers** (12 mo) | 22 (7.7%) | 18 (6.5%) | 15 (5.5%) | 8-12% | 10% |
| **Cross-team rotations** (3-6 mo) | 8 | 5 | 3 | — | 15 |
| **IC→Manager transitions** | 4 | 3 | 2 | — | — |
| **Manager→IC transitions** | 2 | 1 | 1 | — | — |
| **Internal applications per opening** | 3.2 | 2.8 | 2.2 | 3-5 | 4 |
| **Internal hire rate** | 45% | 38% | 32% | 40-50% | 50% |
| **Transfer satisfaction** (6 mo post) | 72% | 68% | 65% | 75% | 85% |
| **"I know how to transfer"** awareness | 58% | 52% | 48% | 70% | 80% |
| **Overall mobility score** | **B (78)** | **B- (72)** | **C+ (68)** | | **B+ (85)** |

### Internal transfers by type

| Transfer type | Count (12 mo) | Average tenure before | Success rate (6 mo) | Key driver | Example |
|---|---|---|---|---|---|
| **Team change** (same role) | 12 | 2.2 yr | 75% | New domain interest | Backend → Frontend engineer |
| **Role change** (same team) | 5 | 3.5 yr | 80% | Career pivot | Engineer → PM |
| **Team + role change** | 3 | 2.8 yr | 67% | Major career shift | SRE → Data Engineer |
| **IC→Manager** | 4 | 5.5 yr | 85% | Leadership track | Senior → Engineering Manager |
| **Manager→IC** | 2 | 3.0 yr | 90% | Return to technical work | Manager → Staff Engineer |
| **Cross-office relocation** | 4 | 2.5 yr | 70% | Personal/family | SF → NY office |
| **Total** | **22** | **2.8 yr** | **76%** | | |

### Growth equity

| Equity metric | Overall | Breakdown | Gap | Status |
|---|---|---|---|---|
| **Time-in-level** | 18 months | No significant variance by demographic | ±2 months | B (80) |
| **Promotion rate** | 15% | Some variance in L5→L6 promotion rate | -8% for underrepresented groups | B- (70) |
| **Mentorship access** | 58% | Higher for L3-L4, lower for L5+ | -15% for L5+ underrepresented | B (78) |
| **Development plan coverage** | 55% | Lower for L5+ and some demographics | -20% gap | C+ (65) |
| **Sponsorship** (active advocate) | 62% | Senior engineers more likely to have sponsors | -25% for early-career underrepresented | C+ (68) |
| **Pay equity** (same level, same performance) | 94% | 6% gap at L5-L6 levels | -6% | B+ (84) |
| **Performance review equity** | 88% | Calibration removes some bias | -12% pre-calibration | B (82) |
| **Overall equity score** | | | | **B- (72)** |

### Sponsorship coverage

| Level | Have sponsor | Sponsor is senior leader | Sponsor effectiveness | Gap |
|---|---|---|---|---|
| L3 | 28% | 15% | C+ (65) | 72% without sponsor |
| L4 | 42% | 22% | B- (70) | 58% without sponsor |
| L5 | 55% | 35% | B (78) | 45% without sponsor |
| L6 | 72% | 58% | B+ (82) | 28% without sponsor |
| L7 | 85% | 78% | B+ (85) | 15% without sponsor |
| L8+ | 95% | 90% | A (90) | 5% without sponsor |
| **Overall** | **62%** | | **B (78)** | **38% without sponsor** |

## Action recommendations

1. **Development plan coverage**: 55% coverage, dropping to 33% at L7; mandate development plans for all engineers, integrate with quarterly check-ins, target 90% within 2 quarters
2. **Mentorship expansion**: 58% coverage, 42% without mentor; recruit 35 more mentors (L5+), provide mentor training for all new mentors, target 80% coverage
3. **L5→L6 promotion equity**: -8% rate for underrepresented groups; audit promotion packets for bias, implement diverse promotion committees, blind packet review pilot
4. **Overdue promotion intervention**: 12 engineers overdue, 8 at stagnation risk; immediate manager conversation for all 12, create promotion plan with timeline, assign sponsor
5. **Ladder clarity at L6/L7**: 28-35% expectations gap; define clear L6/L7 expectations with concrete examples, calibrate across teams, publish updated ladder
6. **Leadership skill development**: 65/100 overall, lowest skill dimension; implement leadership development program for L5+, target 80/100 within 12 months
7. **Sponsorship program**: 62% coverage, 38% without sponsor; formalize sponsorship matching, focus on L3-L5 underrepresented engineers
8. **Internal mobility awareness**: 58% awareness; promote internal openings, create internal transfer guide, host internal career fair quarterly
9. **Business acumen training**: 58/100, lowest skill dimension; implement business acumen workshops, product/engineering rotations, customer shadowing
10. **Monthly career development review**: review promotion pipeline, development plan coverage, mentorship health, internal mobility, and growth equity with engineering leadership



- The promotion as a reward → "you've been here 2 years, you deserve a promotion"; tenure is not a qualification — promotion recognizes demonstrated capability at the next level, not time served
- The career ladder as a straight line → assuming everyone wants to go L3→L4→L5→L6→L7→management; some want to go deep, some want to go broad, some want to lead — the ladder should have branches, not just rungs
- The development plan as a form → filling out a development plan once a year and never looking at it again; a development plan is a living document — it should be referenced in every 1:1
- The mentorship mismatch → pairing junior engineers with senior engineers who have no time or training; bad mentorship is worse than no mentorship — it teaches that growth doesn't matter
- The growth equity blind spot → "we promote based on merit, so the system is fair"; if the system produces unequal outcomes, it's not fair — measure equity, find the bias, fix the system

## Related

- Same class: [dashboard-learning-development](dashboard-learning-development.md) — learning and development
- Same class: [dashboard-skill-ecosystem](dashboard-skill-ecosystem.md) — skill ecosystem
- Same class: [dashboard-talent-retention](../../tech-lead/capacity/dashboard-talent-retention.md) — talent retention
- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — engineering capacity
- Same class: [dashboard-team-health-engagement](../../engineer/process/dashboard-team-health-engagement.md) — team health and engagement
- References: Google — *Career Development Framework*; Lara Hogan — *Resilient Management*; Camille Fournier — *The Manager's Path*; Will Larson — *Staff Engineer*; Tanya Reilly — *The Staff Engineer's Path*; Harvard Business Review — *The New Rules of Career Development*