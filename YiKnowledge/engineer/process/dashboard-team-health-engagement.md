---
title: team health and engagement dashboard
aliases:
- team morale dashboard
- engagement dashboard
- team culture dashboard
- psychological safety dashboard
tags:
- dashboard
- team-health
- engagement
- psychological-safety
- morale
- burnout
- meeting-health
- belonging
category: engineer/process
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
- engineer
- executive
benefit: team health, engagement, and psychological safety visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- engagement, psychological safety, burnout, meeting health, belonging, and team cohesion defined
related:
- ./dashboard-team-velocity.md
- ./dashboard-code-review-health.md
- ../../tech-lead/capacity/dashboard-talent-retention.md
  - ../../tech-lead/capacity/dashboard-engineering-capacity.md
tacit: false
---

# team health and engagement dashboard

> **As a** tech lead, **I want to** track team health, engagement, and psychological safety, **so that** every team is a place where people do their best work, burnout is caught early, meetings are productive, and nobody feels like an outsider.

> Team health is the leading indicator of everything else. This dashboard tracks engagement, psychological safety, burnout risk, meeting health, belonging, and team cohesion — turning culture from a vague aspiration into measurable, actionable team health metrics.

## Summary

- 6 team health dimensions: engagement, psychological safety, burnout risk, meeting health, belonging, team cohesion
- 285 engineers across 12 teams; average team size: 24; average tenure: 2.8 years
- Engagement score: 72/100 (eNPS: +28); psychological safety: 74/100; 15% of engineers showing burnout warning signs
- 22.5 meeting hours/engineer/week; 35% of meetings rated as "unnecessary"; deep work blocks: 12 hours/week avg
- Belonging score: 76/100; 8% of engineers report feeling isolated; cross-team collaboration: 45%
- Dashboard reviewed monthly; team health deep-dive quarterly with engineering leadership

## Core viewpoints

- Psychological safety is the foundation — without it, you don't have a team, you have a group of people who share a manager; teams with high psychological safety report 75% fewer incidents and ship 40% faster
- Burnout is a system failure, not an individual failure — if one engineer burns out, it's a personal tragedy; if 15% of your engineers show burnout signs, it's an organizational failure
- Meeting health is a tax on productivity — every unnecessary meeting isn't just wasted time; it's a context switch that costs 23 minutes of recovery; 35% unnecessary meetings = 8 hours/engineer/week of lost deep work
- Belonging drives retention — engineers who feel they belong are 5× more likely to stay; belonging is built in the small moments: who gets invited, who gets heard, who gets credit

## Key information

### 6-panel team health overview

```
┌──────────────────────────────────────────────────────────────────┐
│  ENGAGEMENT                        │  PSYCHOLOGICAL SAFETY               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  eNPS: +28               │   │  │  Safety score: 74/100    │   │
│  │  Engagement: 72/100      │   │  │  Speak-up rate: 72%       │   │
│  │  Promoters: 42%          │   │  │  Mistake admission: 78%   │   │
│  │  Passives: 44%           │   │  │  Idea challenge: 65%      │   │
│  │  Detractors: 14%         │   │  │  Blame frequency: 12%     │   │
│  │  Participation: 88%      │   │  │  Feedback comfort: 76%    │   │
│  │  "Proud to work here":78%│   │  │  Safety trend: ↑ (+6/yr)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  BURNOUT RISK                      │  MEETING HEALTH                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Burnout warning: 15%    │   │  │  Meeting hrs/wk: 22.5    │   │
│  │  High risk: 5% (14 eng)  │   │  │  Unnecessary: 35%         │   │
│  │  Exhaustion: 22%         │   │  │  Deep work: 12 hrs/wk     │   │
│  │  Cynicism: 12%           │   │  │  No-meeting Wed: 8 teams  │   │
│  │  Efficacy drop: 8%       │   │  │  Meeting-free days: 1.2   │   │
│  │  Overtime > 20%: 18 eng  │   │  │  Avg meeting size: 8.5    │   │
│  │  Vacation unused: 12%    │   │  │  Meeting score: C+ (68)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  BELONGING                         │  TEAM COHESION                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Belonging: 76/100       │   │  │  Cohesion: 72/100        │   │
│  │  "I belong here": 82%    │   │  │  Collaboration: 45%      │   │
│  │  "My voice is heard":72% │   │  │  Knowledge sharing: 68%  │   │
│  │  "I can be myself": 78%  │   │  │  Peer recognition: 55%   │   │
│  │  Isolation risk: 8%      │   │  │  Social connection: 62%  │   │
│  │  Inclusion index: 74/100 │   │  │  Conflict health: 78%    │   │
│  │  Belonging trend: ↑      │   │  │  Cohesion trend: →       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Engagement scorecard

| Engagement metric | Current | 6 months ago | 12 months ago | Target | Industry benchmark |
|---|---|---|---|---|---|
| **Overall engagement** | 72/100 | 68/100 | 65/100 | > 80 | 70 (tech avg) |
| **eNPS** (Net Promoter) | +28 | +22 | +18 | > +35 | +25 (tech avg) |
| **Promoters** ("would recommend") | 42% | 38% | 35% | > 50% | 40% |
| **Passives** (neutral) | 44% | 46% | 48% | < 35% | 42% |
| **Detractors** (would not recommend) | 14% | 16% | 17% | < 10% | 18% |
| **Survey participation** | 88% | 85% | 82% | > 90% | 85% |
| **"Proud to work here"** | 78% | 75% | 72% | > 85% | 76% |
| **"See myself here in 2 years"** | 68% | 65% | 62% | > 75% | 65% |
| **"My work is meaningful"** | 74% | 70% | 68% | > 80% | 72% |
| **"I have growth opportunities"** | 65% | 62% | 58% | > 75% | 62% |

### Engagement by team

| Team | Size | eNPS | Engagement | Promoters | Detractors | Participation | Trend |
|---|---|---|---|---|---|---|---|
| Platform | 28 | +35 | 78/100 | 48% | 10% | 92% | ↑ |
| AI/ML | 22 | +32 | 76/100 | 45% | 8% | 90% | ↑ |
| Web Frontend | 32 | +28 | 74/100 | 42% | 12% | 88% | ↑ |
| Mobile | 18 | +22 | 70/100 | 38% | 15% | 85% | → |
| SRE | 15 | +18 | 68/100 | 35% | 18% | 82% | → |
| Data | 20 | +25 | 72/100 | 40% | 12% | 88% | ↑ |
| Product | 15 | +30 | 75/100 | 44% | 10% | 90% | ↑ |
| Design | 12 | +20 | 70/100 | 38% | 16% | 84% | → |
| Security | 8 | +15 | 65/100 | 32% | 20% | 80% | → |
| DevOps | 10 | +12 | 62/100 | 30% | 22% | 78% | ↓ |
| QA | 14 | +18 | 68/100 | 35% | 18% | 82% | → |
| Developer Relations | 6 | +38 | 82/100 | 52% | 5% | 95% | ↑ |
| **Overall** | **285** | **+28** | **72/100** | **42%** | **14%** | **88%** | ↑ |

### Psychological safety assessment

| Safety dimension | Score | 6 months ago | Target | Key driver |
|---|---|---|---|---|
| **Speak-up culture** ("I can raise concerns") | 72/100 | 68/100 | > 85 | Fear of being seen as negative |
| **Mistake tolerance** ("Mistakes are learning") | 78/100 | 75/100 | > 85 | Blameless postmortem adoption |
| **Idea challenge** ("I can challenge the status quo") | 65/100 | 60/100 | > 80 | Hierarchy perception |
| **Help-seeking** ("I can ask for help") | 82/100 | 80/100 | > 85 | Strong mentorship culture |
| **Feedback comfort** ("I can give/receive feedback") | 76/100 | 72/100 | > 85 | Feedback training gaps |
| **Disagreement health** ("Disagreement is productive") | 68/100 | 65/100 | > 80 | Conflict avoidance culture |
| **Risk-taking** ("I can take calculated risks") | 62/100 | 58/100 | > 75 | Fear of failure consequences |
| **Overall psychological safety** | **74/100** | **70/100** | **> 85** | |

### Psychological safety by team

| Team | Safety score | Speak-up | Mistake tolerance | Idea challenge | Help-seeking | Blame incidents (6 mo) |
|---|---|---|---|---|---|---|
| Platform | 78/100 | 76% | 82% | 68% | 85% | 1 |
| AI/ML | 76/100 | 74% | 80% | 70% | 82% | 2 |
| Web Frontend | 74/100 | 72% | 78% | 65% | 80% | 2 |
| Mobile | 68/100 | 68% | 72% | 58% | 78% | 4 |
| SRE | 72/100 | 70% | 85% | 62% | 82% | 3 |
| Data | 74/100 | 72% | 76% | 66% | 80% | 2 |
| Product | 76/100 | 75% | 78% | 68% | 82% | 1 |
| Design | 70/100 | 68% | 74% | 62% | 76% | 2 |
| Security | 66/100 | 62% | 70% | 58% | 72% | 3 |
| DevOps | 62/100 | 58% | 68% | 52% | 70% | 5 |
| QA | 70/100 | 68% | 72% | 60% | 76% | 2 |
| Developer Relations | 82/100 | 80% | 84% | 74% | 88% | 0 |
| **Overall** | **74/100** | **72%** | **78%** | **65%** | **82%** | **27** |

### Blame incidents tracking

| Blame type | Incidents (6 mo) | Trend | Teams affected | Root cause | Remediation |
|---|---|---|---|---|---|
| **Public blame in postmortem** | 3 | ↓ | Mobile, DevOps, SRE | Blameless training gaps | Mandatory blameless postmortem training |
| **Manager 1:1 blame** | 5 | → | Various | Poor feedback skills | Manager feedback training |
| **Peer blame in code review** | 8 | ↑ | DevOps, Security, QA | Code review culture | Code review guidelines update |
| **Retrospective blame** | 4 | → | Mobile, Data | Retro facilitation skill | Retro facilitator training |
| **Chat/email blame** | 7 | → | Various | Communication norms | Team communication charter |
| **Total** | **27** | **→** | | | |

### Burnout risk dashboard

| Burnout indicator | Current | 3 months ago | 6 months ago | Warning threshold | Critical threshold |
|---|---|---|---|---|---|
| **Emotional exhaustion** (self-reported) | 22% | 20% | 18% | > 20% | > 30% |
| **Cynicism/depersonalization** | 12% | 10% | 9% | > 15% | > 25% |
| **Reduced professional efficacy** | 8% | 7% | 6% | > 10% | > 20% |
| **Overtime > 20%** (> 48 hrs/week) | 18 engineers | 15 | 12 | > 5% of team | > 10% |
| **Weekend work** (regular) | 22 engineers | 18 | 15 | > 5% of team | > 10% |
| **Vacation balance > 15 days** | 12% | 14% | 16% | > 10% | > 20% |
| **After-hours commits** (10pm-6am) | 8 engineers | 6 | 5 | > 3% of team | > 8% |
| **Sick days (unplanned)** | 2.5 days/yr | 2.2 | 2.0 | > 3 days | > 5 days |
| **Overall burnout risk** | **15% (warning)** | **12%** | **10%** | **< 10%** | **< 5%** |

### Burnout risk by team

| Team | Engineers at risk | High risk | Exhaustion | Overtime | Weekend work | Vacation unused | Trend |
|---|---|---|---|---|---|---|---|
| DevOps | 4 (40%) | 2 (20%) | 35% | 5 engineers | 4 engineers | 4 | ↑↑ |
| SRE | 3 (20%) | 1 (7%) | 25% | 3 engineers | 3 engineers | 3 | ↑ |
| Security | 2 (25%) | 1 (13%) | 22% | 2 engineers | 2 engineers | 2 | → |
| Mobile | 3 (17%) | 0 (0%) | 20% | 2 engineers | 2 engineers | 2 | → |
| QA | 2 (14%) | 0 (0%) | 18% | 1 engineer | 1 engineer | 2 | → |
| Data | 2 (10%) | 0 (0%) | 15% | 2 engineers | 2 engineers | 1 | → |
| Product | 1 (7%) | 0 (0%) | 12% | 1 engineer | 0 engineers | 1 | → |
| Design | 1 (8%) | 0 (0%) | 10% | 0 engineers | 0 engineers | 1 | → |
| Platform | 2 (7%) | 0 (0%) | 8% | 1 engineer | 1 engineer | 0 | → |
| Web Frontend | 2 (6%) | 0 (0%) | 8% | 1 engineer | 1 engineer | 1 | → |
| AI/ML | 1 (5%) | 0 (0%) | 5% | 0 engineers | 0 engineers | 0 | → |
| Developer Relations | 0 (0%) | 0 (0%) | 2% | 0 engineers | 0 engineers | 0 | → |
| **Overall** | **23 (15%)** | **4 (5%)** | **22%** | **18 (6%)** | **16 (6%)** | **17 (6%)** | **↑** |

### Meeting health

| Meeting metric | Current | Target | Waste | Annual cost |
|---|---|---|---|---|
| **Meeting hours/engineer/week** | 22.5 | < 15 | 7.5 hrs | $3.2M/yr |
| **Unnecessary meetings** (% rated ≤ 2/5) | 35% | < 15% | 20% | $1.8M/yr |
| **Deep work blocks** (hours/week) | 12 | > 20 | -8 hrs | — |
| **Meeting-free days/week** | 1.2 | > 3 | -1.8 days | — |
| **Average meeting size** | 8.5 people | < 6 | +2.5 extra | $850K/yr |
| **Recurring meetings** (per engineer) | 12.5 | < 8 | 4.5 meetings | — |
| **Meeting start latency** (avg late) | 4.2 min | < 1 min | 3.2 min | $420K/yr |
| **No-agenda meetings** | 28% | < 5% | 23% | — |
| **Decision-less meetings** | 32% | < 10% | 22% | — |
| **Overall meeting health** | **C+ (68)** | **B+ (85)** | | |

### Meeting audit by type

| Meeting type | Per engineer/week | Hours | Useful (% rated ≥ 4/5) | Avg attendees | Keep/Cut/Change |
|---|---|---|---|---|---|
| **Standup** (daily) | 5 | 2.5 hrs | 72% | 8 | Change — async for 3 teams |
| **Sprint planning** | 1 | 2.0 hrs | 85% | 12 | Keep |
| **Sprint retro** | 1 | 1.0 hrs | 78% | 10 | Change — shorter, focused |
| **1:1 with manager** | 1 | 0.5 hrs | 88% | 2 | Keep |
| **Team all-hands** | 1 | 1.0 hrs | 75% | 24 | Keep |
| **Cross-team sync** | 3 | 3.0 hrs | 55% | 12 | Change — reduce to 1, async updates |
| **Design review** | 2 | 2.0 hrs | 82% | 6 | Keep |
| **Architecture review** | 1 | 1.0 hrs | 85% | 8 | Keep |
| **Status update** | 3 | 2.0 hrs | 48% | 10 | Cut — replace with async |
| **Ad-hoc/discussion** | 4 | 3.5 hrs | 62% | 5 | Change — require agenda |
| **Demo/showcase** | 1 | 1.0 hrs | 80% | 15 | Keep |
| **All-company** | 1 | 1.0 hrs | 68% | 285 | Change — more interactive |
| **Other recurring** | 3 | 2.0 hrs | 52% | 8 | Cut — audit quarterly |
| **Total** | **27** | **22.5 hrs** | **65%** | **8.5 avg** | |

### Belonging and inclusion

| Belonging metric | Current | 6 months ago | Target | Industry benchmark |
|---|---|---|---|---|
| **"I belong here"** | 82% | 78% | > 90% | 80% |
| **"My voice is heard in meetings"** | 72% | 68% | > 85% | 72% |
| **"I can be my authentic self"** | 78% | 75% | > 85% | 76% |
| **"My contributions are recognized"** | 74% | 70% | > 85% | 72% |
| **"I have a friend at work"** | 76% | 74% | > 85% | 75% |
| **"I feel isolated"** | 8% | 10% | < 5% | 12% |
| **"I've experienced exclusion"** (6 mo) | 12% | 15% | < 5% | 15% |
| **Inclusion index** | 74/100 | 70/100 | > 85 | 72 |
| **Overall belonging** | **76/100** | **72/100** | **> 85** | |

### Belonging by tenure

| Tenure | Engineers | Belonging | "I belong here" | Isolation risk | Voice heard | Key challenge |
|---|---|---|---|---|---|---|
| **0-6 months** (new hire) | 42 | 68/100 | 72% | 15% | 62% | Finding social connections |
| **6-12 months** | 35 | 74/100 | 78% | 10% | 68% | Building influence |
| **1-2 years** | 68 | 76/100 | 82% | 8% | 72% | Career growth |
| **2-4 years** | 82 | 78/100 | 85% | 5% | 76% | Recognition plateau |
| **4+ years** | 58 | 75/100 | 82% | 6% | 74% | Renewal and purpose |
| **Overall** | **285** | **76/100** | **82%** | **8%** | **72%** | |

### Team cohesion

| Cohesion metric | Current | 6 months ago | Target | Notes |
|---|---|---|---|---|
| **Cross-team collaboration** | 45% | 38% | > 60% | Teams still siloed |
| **Knowledge sharing** (docs, talks) | 68% | 62% | > 80% | Brown bag attendance rising |
| **Peer recognition** (kudos, thanks) | 55% | 48% | > 75% | Recognition program launched Q2 |
| **Social connection** (team events) | 62% | 58% | > 75% | 2.5 team events/quarter avg |
| **Conflict health** (constructive resolution) | 78% | 74% | > 85% | Conflict avoidance still common |
| **Decision inclusion** (felt heard) | 68% | 65% | > 80% | Decisions still top-down in 3 teams |
| **Goal alignment** (shared purpose) | 74% | 70% | > 85% | OKR cascade improving |
| **Overall team cohesion** | **72/100** | **66/100** | **> 80** | |

### Recognition and appreciation

| Recognition type | Frequency (per engineer/month) | Satisfaction | Impact on engagement | Gap |
|---|---|---|---|---|
| **Manager recognition** (1:1) | 2.5 | 72% | High | 28% want more |
| **Peer recognition** (kudos/shoutout) | 1.8 | 68% | High | 32% want more |
| **Public recognition** (all-hands/channel) | 0.8 | 62% | Medium | 38% want more |
| **Compensation recognition** (bonus/raise) | 0.2 | 58% | Very high | 42% want more |
| **Growth recognition** (promotion/scope) | 0.1 | 55% | Very high | 45% want more |
| **Overall recognition** | **5.4 events** | **65/100** | | |

## Action recommendations

1. **DevOps and SRE burnout intervention**: 20-40% at risk, 2 engineers at high risk; immediate workload review, mandatory time off, hire 2 additional engineers, implement on-call rotation improvement
2. **Meeting reduction sprint**: 35% unnecessary meetings, $3.2M annual cost; replace 3 weekly status meetings with async updates, implement no-meeting Wednesday for all teams, reduce recurring meetings from 12.5 to 8
3. **Psychological safety in DevOps and Security**: 62-66/100 safety scores, 5+ blame incidents each; conduct blameless culture workshop, assign psychological safety champion, 1:1 safety check-ins
4. **Belonging for new hires**: 68/100 belonging for 0-6 month cohort; implement structured buddy program, new hire social events, 30/60/90 belonging check-ins
5. **Code review blame reduction**: 8 peer blame incidents in 6 months, rising trend; update code review guidelines with blameless language, add empathy prompts to review templates
6. **Manager burnout detection training**: managers not catching early warning signs; train all managers on burnout detection, implement monthly workload review
7. **Recognition program expansion**: 65/100 recognition satisfaction; implement peer bonus program, increase all-hands shoutouts, manager recognition training
8. **Deep work protection**: 12 hours/week deep work vs 20 target; implement 2 no-meeting days for all teams, protect 4-hour morning deep work blocks
9. **Cross-team collaboration**: 45% cross-team collaboration; implement cross-team guilds, rotate engineers across teams for short projects, cross-team demo days
10. **Monthly team health review**: review engagement, psychological safety, burnout risk, meeting health, belonging, and cohesion with engineering leadership



- Engagement survey as a checkbox → running the survey, looking at the dashboard, and doing nothing; an engagement survey without action items is worse than no survey — it tells people their voice doesn't matter
- Burnout as a badge of honor → "I worked 70 hours this week" said with pride; burnout is not dedication — it's organizational failure wearing a hero's costume
- Meeting reduction as calendar Tetris → moving meetings around instead of eliminating them; the goal is not to rearrange the deck chairs — it's to throw half the chairs overboard
- Psychological safety as "being nice" → confusing psychological safety with avoiding hard conversations; psychological safety means you can have the hard conversation without fear of retaliation
- Belonging as assimilation → "they'll fit in once they're like us"; belonging is about being valued for who you are, not for how well you conform

## Related

- Same class: [dashboard-team-velocity](dashboard-team-velocity.md) — team velocity and predictability
- Same class: [dashboard-code-review-health](dashboard-code-review-health.md) — code review health
- Same class: [dashboard-talent-retention](../../tech-lead/capacity/dashboard-talent-retention.md) — talent retention
- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — engineering capacity
- References: Google — *Project Aristotle (Psychological Safety)*; Amy Edmondson — *The Fearless Organization*; Gallup — *Q12 Employee Engagement*; Christina Maslach — *Burnout Assessment Tool (BAT)*; Microsoft — *Work Trend Index (Meeting Health)*; Deloitte — *Human Capital Trends*