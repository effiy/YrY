---
title: user research operations dashboard
aliases:
- research ops dashboard
- user research pipeline dashboard
- UX research operations dashboard
- research insights dashboard
tags:
- dashboard
- user-research
- ux
- research-ops
- participant-management
- insights
- discovery
category: product-manager/discovery
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- product-manager
- tech-lead
- executive
benefit: user research operations and insight velocity visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./metrics/dashboard-product-portfolio.md
- ./ux/dashboard-ux-health.md
- ./metrics/dashboard-customer-health.md
- ../../tech-lead/roadmap/dashboard-roadmap-progress.md
- ../../executive/strategy/dashboard-executive-kpi.md
tacit: false
---

# user research operations dashboard

> **As a** product manager, **I want to** track user research operations and insight velocity, **so that** research is systematic, insights are actionable, and every product decision is grounded in user evidence.

> Research without operations is anecdotes. This dashboard tracks the research pipeline, participant management, insight velocity, research impact, and repository health — turning user research from a sporadic activity into a continuous organizational capability.

## Summary

- 5 research operations dimensions: research pipeline, participant management, insight velocity, research impact, repository health
- 18 active studies across 6 product areas; 4,200 participants in research panel; 28 studies completed in last 12 months
- Research methods mix: usability testing (35%), user interviews (28%), surveys (15%), diary studies (8%), A/B testing (8%), field studies (6%)
- 342 insights generated in last 12 months; 78% acted upon within 60 days; average time-to-insight: 12 days
- Dashboard reviewed monthly; research operations review quarterly with product, design, and engineering leadership

## Core viewpoints

- Research is a continuous capability, not a phase — research doesn't stop after discovery; continuous research feeds the entire product lifecycle from ideation to sunset
- Participant management is the bottleneck — the #1 reason research is slow is not analysis, it's finding and scheduling the right participants; invest in the participant pipeline
- An insight not acted upon is wasted research — tracking insight-to-action conversion is as important as tracking study completion; research impact = insights × action rate
- Research democratization must be balanced with quality — empowering PMs and designers to run their own research is good, but without standards it produces unreliable data

## Key information

### 5-panel research operations overview

```
┌──────────────────────────────────────────────────────────────────┐
│  RESEARCH PIPELINE                 │  PARTICIPANT MANAGEMENT           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active studies: 18     │   │  │  Panel size: 4,200       │   │
│  │  Planning:    5 (28%)   │   │  │  Active:      2,850 (68%)│   │
│  │  Recruiting:  4 (22%)   │   │  │  Responsive:  1,950 (46%)│   │
│  │  In-field:    6 (33%)   │   │  │  New/mo:      180        │   │
│  │  Analysis:    2 (11%)   │   │  │  Churn/mo:     95 (2.3%) │   │
│  │  Completed:   1 (6%)    │   │  │  Avg incentive: $45      │   │
│  │  Cycle time: 18 days    │   │  │  Scheduling: 4.2 days    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  INSIGHT VELOCITY                  │  RESEARCH IMPACT                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Insights:    342/yr    │   │  │  Acted upon:   78% ███▌  │   │
│  │  Per study:   12.2 avg  │   │  │  In backlog:   15% ▌     │   │
│  │  Time-to-insight: 12d   │   │  │  Dismissed:     7% ▏    │   │
│  │  Critical:    45 (13%)  │   │  │  Feature change: 62%     │   │
│  │  High:        112 (33%) │   │  │  Strategy change: 18%    │   │
│  │  Medium:      128 (37%) │   │  │  Roadmap change: 14%     │   │
│  │  Low:         57 (17%)  │   │  │  No change:      6%      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Research pipeline

| Study | Product area | Method | Stage | Participants | Started | Est. completion | Owner | Priority |
|---|---|---|---|---|---|---|---|---|
| AI Code Review satisfaction | Code Review | User interview | In-field | 12/15 | 2026-07-28 | 2026-08-15 | PM + Design | P0 |
| Multi-modal chat usability | Chat | Usability test | In-field | 8/12 | 2026-07-25 | 2026-08-10 | Design Lead | P0 |
| Knowledge search relevance | Search | Survey + interview | Analysis | 85/200 (survey) | 2026-07-15 | 2026-08-08 | PM | P0 |
| Payment flow abandonment | Payment | Analytics + interview | Recruiting | 0/20 | 2026-08-01 | 2026-08-25 | PM + Data | P1 |
| Mobile onboarding redesign | Mobile | Usability test | Planning | 0/15 | 2026-08-15 | 2026-09-05 | Design | P1 |
| Enterprise SSO experience | Auth | Field study | Planning | 0/8 | 2026-08-20 | 2026-09-15 | PM + Design | P1 |
| Notification preference study | Notification | Diary study | In-field | 18/25 | 2026-07-20 | 2026-08-20 | PM | P2 |
| Accessibility audit follow-up | Platform | Usability (a11y) | Recruiting | 5/12 | 2026-08-05 | 2026-08-30 | Design | P2 |
| Admin dashboard workflow | Admin | Contextual inquiry | Recruiting | 3/10 | 2026-08-01 | 2026-08-22 | PM | P2 |
| API developer experience | API | Survey + interview | In-field | 45/100 (survey) | 2026-07-18 | 2026-08-12 | PM + Eng | P1 |
| File collaboration patterns | File Storage | Diary study | In-field | 15/20 | 2026-07-22 | 2026-08-18 | PM | P2 |
| Pricing page comprehension | Growth | A/B test + survey | Analysis | 1,200 completed | 2026-07-10 | 2026-08-05 | PM + Growth | P0 |
| Feature adoption barriers | Platform | Survey | Recruiting | 32/200 | 2026-08-03 | 2026-08-28 | PM | P2 |
| **Active pipeline** | | | | | | | | |

### Research methods mix

| Method | Studies (12 mo) | Avg participants | Avg duration | Cost per study | Reliability | Best for |
|---|---|---|---|---|---|---|
| Usability testing | 10 (35%) | 12 | 14 days | $4,500 | High | Interaction design validation |
| User interviews | 8 (28%) | 15 | 18 days | $5,200 | Medium-High | Problem discovery, needs |
| Surveys | 4 (15%) | 200+ | 10 days | $2,800 | Medium | Quantitative validation |
| Diary studies | 2 (8%) | 20 | 21 days | $6,500 | Medium | Longitudinal behavior |
| A/B testing | 2 (8%) | 5,000+ | 28 days | $3,200 | High | Causal inference, conversion |
| Field studies | 2 (6%) | 8 | 25 days | $8,500 | High | Contextual understanding |
| **Total** | **28 studies** | | **18 days avg** | **$4,500 avg** | | |

### Participant panel health

| Segment | Panel size | Active (last 90d) | Responsive rate | Churn rate | Incentive cost | Recruitment channel |
|---|---|---|---|---|---|---|
| Enterprise customers | 420 | 285 (68%) | 52% | 1.8%/mo | $75 avg | CSM referral, in-app |
| SMB customers | 850 | 580 (68%) | 48% | 2.2%/mo | $50 avg | In-app, email campaign |
| Individual/Pro | 1,650 | 1,120 (68%) | 44% | 2.5%/mo | $35 avg | In-app, social media |
| Non-users (prospect) | 580 | 380 (66%) | 42% | 3.2%/mo | $55 avg | Research panels, LinkedIn |
| Churned users | 320 | 210 (66%) | 38% | 2.8%/mo | $60 avg | Email outreach |
| Internal (dogfood) | 380 | 275 (72%) | 58% | 1.2%/mo | $0 | Internal comms |
| **Total** | **4,200** | **2,850 (68%)** | **46%** | **2.3%/mo** | **$45 avg** | |

### Participant diversity

| Dimension | Target | Actual | Gap | Trend | Action |
|---|---|---|---|---|---|
| Gender (non-male) | 40% | 32% | -8% | → | Targeted recruitment |
| Race/ethnicity (non-White) | 30% | 22% | -8% | ↑ | Community partnerships |
| Age (55+) | 15% | 8% | -7% | → | Senior user outreach |
| Accessibility needs | 10% | 6% | -4% | ↑ | A11y community recruitment |
| Non-US/English | 25% | 18% | -7% | ↑ | Localization of recruitment |
| Industry diversity | 20+ industries | 14 industries | -6 | → | Vertical-targeted outreach |
| Technical skill (low) | 20% | 12% | -8% | → | Non-technical channel recruitment |
| **Overall diversity score** | **80/100** | **62/100** | **-18** | **↑ 3pts** | |

### Insight velocity

| Metric | Current | 3 months ago | 6 months ago | Target | Trend |
|---|---|---|---|---|---|
| Insights generated/month | 28.5 | 24.2 | 20.5 | 30 | ↑ |
| Time from study start to insight report | 12 days | 14 days | 18 days | 10 days | ↓ |
| Time from insight to action | 28 days | 32 days | 38 days | 21 days | ↓ |
| Insights per study | 12.2 | 10.5 | 9.8 | 12 | ↑ |
| Insight-to-action rate | 78% | 72% | 68% | 85% | ↑ |
| Research requests fulfilled | 82% | 75% | 70% | 90% | ↑ |
| Research backlog (unstaffed) | 8 studies | 12 studies | 15 studies | 5 | ↓ |
| Research participant wait time | 4.2 days | 5.8 days | 7.5 days | 3 days | ↓ |

### Insight severity distribution

| Severity | Definition | Count (12 mo) | % | Avg time to action | Example |
|---|---|---|---|---|---|
| **Critical** | Blocks release, safety/legal issue | 45 | 13% | 5 days | "Payment flow fails for screen reader users" |
| **High** | Major usability barrier, user churn risk | 112 | 33% | 18 days | "Users can't find the export button" |
| **Medium** | Friction point, workaround exists | 128 | 37% | 35 days | "Filter UX is confusing but functional" |
| **Low** | Minor annoyance, cosmetic | 57 | 17% | 60+ days | "Button color preference differs" |
| **Total** | | **342** | **100%** | **28 days avg** | |

### Research impact tracking

| Impact category | Insights acted upon | Feature changes | Strategy pivots | Roadmap changes | Revenue impact | Example |
|---|---|---|---|---|---|---|
| User acquisition | 42 | 28 | 8 | 6 | +$320K (est.) | Simplified signup after research |
| User retention | 68 | 45 | 12 | 11 | +$580K (est.) | Fixed top 3 churn reasons |
| User engagement | 55 | 38 | 10 | 7 | +$250K (est.) | Improved notification relevance |
| Monetization | 32 | 22 | 5 | 5 | +$420K (est.) | Pricing page redesign |
| Accessibility | 28 | 24 | 2 | 2 | Compliance (risk avoided) | WCAG 2.2 AA violations fixed |
| Developer experience | 35 | 28 | 4 | 3 | +$180K (est.) | API documentation restructure |
| Internal efficiency | 22 | 18 | 2 | 2 | +$150K (est.) | Admin workflow simplification |
| **Total** | **282** | **203** | **43** | **36** | **$1.9M (est.)** | |

### Research repository health

| Repository metric | Current | Target | Assessment |
|---|---|---|---|
| Total studies archived | 86 | — | Healthy |
| Studies with full artifacts | 72 (84%) | 90% | Needs improvement |
| Studies with video/audio | 58 (67%) | 80% | Needs improvement |
| Studies with transcripts | 48 (56%) | 80% | Needs improvement |
| Tagged/categorized | 74 (86%) | 95% | Adequate |
| Searchable (full-text) | 62 (72%) | 90% | Needs improvement |
| Cross-referenced insights | 42 (49%) | 80% | Needs improvement |
| GDPR/data retention compliant | 78 (91%) | 100% | Needs improvement |
| Average study documentation score | B+ (82/100) | A (90/100) | Adequate |

### Research budget and ROI

| Cost category | Annual spend | % of product budget | Trend | Efficiency |
|---|---|---|---|---|
| Research team (2 FTE) | $280K | 5.6% | → | $140K/FTE |
| Participant incentives | $95K | 1.9% | ↑ 8% | $45/participant avg |
| Research tools (UserTesting, Dovetail, etc.) | $48K | 1.0% | → | $4K/mo |
| External research vendors | $65K | 1.3% | ↑ 12% | Specialized studies |
| Research training (democratization) | $12K | 0.2% | ↑ 20% | PM + Designer enablement |
| **Total** | **$500K/yr** | **10.0%** | **↑ 5%** | |
| **Estimated ROI** | **$1.9M impact** | **3.8× return** | | |

### Research democratization

| Self-service capability | Trained staff | Active users | Studies conducted | Quality score | Issues |
|---|---|---|---|---|---|
| Usability testing (moderated) | 12 PMs, 8 Designers | 8 | 15/yr | B+ (85) | Moderator bias in some sessions |
| Usability testing (unmoderated) | 15 PMs, 10 Designers | 12 | 22/yr | B (78) | Task design quality varies |
| User interviews | 8 PMs, 6 Designers | 6 | 10/yr | B (75) | Leading questions common |
| Surveys | 18 PMs, 8 Designers | 15 | 18/yr | B+ (82) | Sampling bias, low response rates |
| A/B testing | 10 PMs, 4 Engineers | 8 | 12/yr | A- (88) | Statistical rigor improving |
| Heuristic evaluation | 10 Designers | 8 | 20/yr | B+ (84) | Inconsistent severity ratings |
| **Overall** | **73 trained** | **57 active** | **97 studies/yr** | **B+ (82)** | |

## Action recommendations

1. **Participant panel diversity**: 62/100 diversity score, 8 underrepresented dimensions; launch targeted recruitment for non-male, 55+, and low-technical-skill participants
2. **Insight-to-action cycle time**: 28 days from insight to action, target 21 days; implement insight review meetings within 1 week of study completion
3. **Research repository searchability**: 72% full-text searchable; complete transcript digitization, implement cross-study insight linking
4. **Data retention compliance**: 9% of studies non-compliant with GDPR/data retention; audit and clean up, implement auto-expiry policies
5. **Research backlog reduction**: 8 unstaffed studies; evaluate contract researcher augmentation, prioritize by product strategy alignment
6. **Participant churn reduction**: 2.3%/mo churn, 95 participants/month lost; improve incentive structure, add research insights newsletter, reduce time between studies
7. **Democratization quality**: 97 self-service studies/year, B+ quality; add research quality checklist, peer review for first 3 studies per researcher
8. **Video/audio archive**: 67% of studies have recordings; mandate recording for all moderated studies, implement auto-transcription pipeline
9. **Research ROI tracking**: strengthen impact attribution; implement insight-to-revenue tracking, connect research insights to feature adoption metrics
10. **Monthly research ops review**: review pipeline, participant panel health, insight velocity, and research impact with product leadership



- Research as validation theater → running a study to confirm what you already decided to build; research should be open to disproving hypotheses, not just confirming them
- The "perfect" participant → waiting for the exact persona match before any research; any user feedback is better than no feedback, start with who you can reach
- Insights as shelf art → producing beautiful research reports that nobody reads; insights must be actionable, assigned to owners, and tracked to completion
- Research as a bottleneck → requiring the research team to run every study; democratize with guardrails so PMs and designers can run their own lightweight research
- Recency bias in insights → only acting on the most recent study's findings; cross-reference with the repository, patterns across studies are more valuable than single-study findings

## Related

- Same class: [dashboard-product-portfolio](metrics/dashboard-product-portfolio.md) — product portfolio health
- Same class: [dashboard-ux-health](ux/dashboard-ux-health.md) — UX and usability health
- Same class: [dashboard-customer-health](metrics/dashboard-customer-health.md) — customer health and satisfaction
- Same class: [dashboard-roadmap-progress](../../tech-lead/roadmap/dashboard-roadmap-progress.md) — roadmap and initiative tracking
- Same class: [dashboard-executive-kpi](../../executive/strategy/dashboard-executive-kpi.md) — executive KPI and business health
- References: Erika Hall — *Just Enough Research*; Nielsen Norman Group — *ResearchOps Maturity Model*; Teresa Torres — *Continuous Discovery Habits*; Tomer Sharon — *Validating Product Ideas*; Dovetail — *Research Operations Framework*