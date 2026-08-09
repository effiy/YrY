---
title: postmortem quality dashboard
aliases:
- incident postmortem dashboard
- postmortem effectiveness dashboard
- incident learning dashboard
- post-incident review dashboard
tags:
- dashboard
- postmortem
- incident-review
- learning
- blameless
- action-tracking
- recurrence
category: oncall-sre/incident-response
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- oncall-sre
- tech-lead
- engineer
benefit: postmortem quality and organizational learning visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- postmortem completion, action item closure, severity classification, learning loop, and recurrence prevention defined
related:
- ./dashboard-incident-trends.md
- ./dashboard-oncall-health.md
- ../observability/dashboard-system-health.md
- ../../engineer/infrastructure/dashboard-deployment-safety.md
- ../../engineer/lessons/dashboard-lessons-learned.md
tacit: false
---

# postmortem quality dashboard

> **As an** SRE, **I want to** track postmortem quality and organizational learning from incidents, **so that** every incident is a learning opportunity, action items are closed, and the same failure never happens twice.

> A postmortem is not a report — it's a learning artifact. This dashboard tracks postmortem completion, action item closure, severity classification, learning loop effectiveness, and recurrence prevention — turning incidents from failures into investments in reliability.

## Summary

- 5 postmortem quality dimensions: completion, action items, severity classification, learning loop, recurrence prevention
- 48 incidents/year requiring postmortems (P1-P3); 85 postmortems in the repository (all time)
- Postmortem SLA: P1 (5 business days), P2 (10 business days), P3 (15 business days); 88% on-time completion
- 342 action items generated from postmortems in last 12 months; 78% closed, 15% open, 7% overdue
- 12 recurrence incidents in last 12 months (same root cause); recurrence rate: 8% of incidents
- Dashboard reviewed monthly; postmortem quality review quarterly with SRE and engineering leadership

## Core viewpoints

- The postmortem is the moment of learning — the incident is the symptom; the postmortem is where you find and fix the disease; skip the postmortem and you guarantee recurrence
- Blameless is not about being nice — it's about being accurate; blame stops the flow of information, and without information you can't find the root cause
- Action items are the ROI of postmortems — a postmortem without action items is a diary entry; every postmortem should produce concrete, assigned, time-bound actions
- Recurrence is the ultimate postmortem failure — if the same root cause produces two incidents, the postmortem process failed, not the engineers

## Key information

### 5-panel postmortem overview

```
┌──────────────────────────────────────────────────────────────────┐
│  POSTMORTEM COMPLETION            │  ACTION ITEMS                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Incidents/yr: 48       │   │  │  Actions: 342/yr         │   │
│  │  Postmortems due: 42    │   │  │  Closed: 268 (78%)       │   │
│  │  Completed: 37 (88%)    │   │  │  Open: 50 (15%)          │   │
│  │  Overdue: 5 (12%)       │   │  │  Overdue: 24 (7%)        │   │
│  │  P1 SLA: 92%            │   │  │  Avg closure: 28 days    │   │
│  │  P2 SLA: 88%            │   │  │  P1 actions: 18 days     │   │
│  │  P3 SLA: 82%            │   │  │  P2 actions: 32 days     │   │
│  │  Quality score: B+ (82) │   │  │  Action quality: B (78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SEVERITY CLASSIFICATION          │  LEARNING LOOP                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  P1 (critical): 4 (8%)  │   │  │  Learnings: 85/yr        │   │
│  │  P2 (major): 14 (29%)   │   │  │  Shared: 62 (73%)        │   │
│  │  P3 (minor): 30 (63%)   │   │  │  Review attendance: 72%  │   │
│  │  Downgraded: 3 (6%)     │   │  │  Runbook updated: 58%    │   │
│  │  Upgraded: 2 (4%)       │   │  │  Detection improved: 45% │   │
│  │  Severity accuracy: 90% │   │  │  Training created: 28%   │   │
│  │  Unknown root cause: 5% │   │  │  Learning score: B (78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Postmortem completion by severity

| Severity | Incidents (12 mo) | Postmortems required | Completed | Overdue | SLA | SLA met | Avg time to complete |
|---|---|---|---|---|---|---|---|
| **P1 (Critical)** | 4 | 4 | 4 | 0 | 5 business days | 100% | 3.2 days |
| **P2 (Major)** | 14 | 14 | 13 | 1 | 10 business days | 93% | 8.5 days |
| **P3 (Minor)** | 30 | 24 | 20 | 4 | 15 business days | 83% | 14.2 days |
| **P4 (Negligible)** | 38 | 0 | — | — | None required | — | — |
| **Total** | **86** | **42** | **37** | **5** | | **88%** | **11.5 days** |

### Postmortem quality scorecard

| Quality dimension | Weight | Score | Target | Assessment |
|---|---|---|---|---|
| **Root cause depth** (5 Whys or equivalent) | 20% | 82/100 | > 85 | Adequate — some stop at symptom |
| **Timeline completeness** (minute-by-minute) | 15% | 88/100 | > 90 | Good — most have detailed timelines |
| **Blamelessness** (no individual attribution) | 15% | 78/100 | > 90 | Needs improvement — subtle blame language |
| **Action item quality** (specific, assigned, time-bound) | 20% | 78/100 | > 85 | Adequate — 15% of actions are vague |
| **Detection gap analysis** (how to detect sooner) | 10% | 72/100 | > 85 | Needs improvement — often skipped |
| **Prevention plan** (how to prevent recurrence) | 10% | 80/100 | > 85 | Adequate — some lack concrete prevention |
| **Lessons learned articulation** | 10% | 74/100 | > 85 | Needs improvement — lessons too generic |
| **Overall quality score** | **100%** | **82/100** | **> 85** | **B+** |

### Action item tracking

| Action item type | Total | Closed | Open | Overdue | Avg closure | Closure rate |
|---|---|---|---|---|---|---|
| **Code/configuration fix** | 95 | 82 | 10 | 3 | 18 days | 86% |
| **Monitoring/alerting improvement** | 72 | 58 | 10 | 4 | 22 days | 81% |
| **Runbook/documentation update** | 55 | 42 | 8 | 5 | 30 days | 76% |
| **Process/policy change** | 48 | 32 | 12 | 4 | 42 days | 67% |
| **Training/knowledge sharing** | 28 | 18 | 6 | 4 | 38 days | 64% |
| **Architecture/design change** | 22 | 15 | 4 | 3 | 55 days | 68% |
| **Tooling/automation** | 18 | 12 | 5 | 1 | 35 days | 67% |
| **Vendor/3rd party escalation** | 4 | 2 | 1 | 1 | 60 days | 50% |
| **Total** | **342** | **261 (76%)** | **56 (16%)** | **25 (7%)** | **28 days** | **76%** |

### Overdue action items (top priority)

| Action | Incident | Severity | Owner | Due date | Days overdue | Risk | Blocker |
|---|---|---|---|---|---|---|---|
| Implement connection pool circuit breaker | INC-2026-045 | P1 | SRE Lead | 2026-07-15 | 22 days | Critical | Competing priorities |
| Add GPU memory pressure alerting | INC-2026-052 | P2 | AI/ML Lead | 2026-07-20 | 17 days | High | Alert threshold tuning |
| Update DB failover runbook | INC-2026-038 | P1 | SRE Lead | 2026-07-10 | 27 days | Critical | Incomplete testing |
| Implement rate limit per tenant | INC-2026-058 | P2 | Platform Lead | 2026-07-25 | 12 days | High | Architecture review pending |
| Add e2e test for payment retry | INC-2026-062 | P2 | Payment Lead | 2026-07-28 | 9 days | High | Test environment issue |
| Token invalidation race condition fix | INC-2026-048 | P2 | Auth Lead | 2026-07-18 | 19 days | High | Complex fix, multiple services |
| Chaos experiment for DB failover | INC-2026-038 | P1 | SRE Lead | 2026-07-22 | 15 days | Critical | Waiting for game day |
| Log sampling for DEBUG level | INC-2026-055 | P3 | Platform Lead | 2026-07-30 | 7 days | Medium | Cost analysis pending |

### Recurrence analysis

| Root cause category | Incidents (12 mo) | Recurrences | Recurrence rate | Learning effectiveness | Action |
|---|---|---|---|---|---|
| **Memory/Resource exhaustion** | 8 | 2 | 25% | Low | Auto-scaling not yet implemented |
| **Configuration error** | 6 | 1 | 17% | Medium | Config validation in CI partially deployed |
| **Database connection/performance** | 5 | 2 | 40% | Low | Connection pool fix delayed |
| **Network/timeout** | 4 | 1 | 25% | Medium | Timeout tuning incomplete |
| **Deployment/rollback** | 4 | 1 | 25% | Medium | Canary analysis improved but not complete |
| **Dependency failure** | 3 | 1 | 33% | Medium | Circuit breaker pattern not universal |
| **Data corruption** | 2 | 0 | 0% | Good | Prevention effective |
| **Authentication/authorization** | 2 | 0 | 0% | Good | Token rotation implemented |
| **Other** | 14 | 4 | 29% | Low | Various root causes |
| **Total** | **48** | **12** | **8% of all incidents** | | |

### Learning loop effectiveness

| Learning activity | Incidents covered | Completed | Effectiveness | Reach | Example |
|---|---|---|---|---|---|
| **Postmortem review meeting** | 42 | 37 (88%) | 78/100 | 8-15 people | Bi-weekly review of all P1/P2 postmortems |
| **Incident review newsletter** | 48 | 12 editions | 72/100 | All engineering (285) | Monthly digest of top incidents and learnings |
| **Runbook update** | 28 | 22 (79%) | 82/100 | On-call engineers | Updated runbook after each incident |
| **Detection improvement** | 22 | 18 (82%) | 85/100 | On-call SREs | New alerts/monitors from postmortem actions |
| **Training/brown bag** | 12 | 8 (67%) | 74/100 | Team-level | "How we fixed the DB failover" brown bag |
| **Chaos experiment** | 8 | 5 (63%) | 88/100 | SRE + affected team | New chaos experiment from incident scenario |
| **Architecture decision record** | 10 | 7 (70%) | 80/100 | All engineering | ADR from incident-driven architecture changes |
| **Overall** | | | **78/100** | | |

### Postmortem template compliance

| Template section | Compliance rate | Quality score | Common issues |
|---|---|---|---|
| **Incident summary** | 98% | 92/100 | Some too brief |
| **Timeline** (minute-by-minute) | 92% | 88/100 | Missing detection time in 8% |
| **Detection** (how was it found) | 88% | 78/100 | Customer-reported vs system-detected gap |
| **Impact** (users, revenue, data) | 95% | 85/100 | Revenue impact often estimated |
| **Root cause** (5 Whys) | 85% | 82/100 | 15% stop at symptom, not root cause |
| **Resolution** | 98% | 90/100 | Good across the board |
| **Detection gap** (could we detect sooner) | 72% | 72/100 | Most skipped or superficial |
| **Prevention plan** | 90% | 80/100 | Some lack concrete actions |
| **Action items** (specific, assigned, time-bound) | 95% | 78/100 | 15% of actions are vague |
| **Lessons learned** | 82% | 74/100 | Often generic ("be more careful") |
| **Timeline to recovery** | 88% | 80/100 | Missing parallel activities |
| **Overall** | **88%** | **82/100** | |

### Postmortem culture metrics

| Metric | Current | 3 months ago | 6 months ago | Target | Trend |
|---|---|---|---|---|---|
| **Blamelessness score** (survey) | 72/100 | 68/100 | 62/100 | > 85 | ↑ |
| **"I feel safe reporting incidents"** | 78/100 | 75/100 | 70/100 | > 90 | ↑ |
| **Postmortem review attendance** | 72% | 65% | 58% | > 80% | ↑ |
| **Cross-team participation** | 45% | 38% | 32% | > 60% | ↑ |
| **Postmortems read by non-participants** | 28% | 22% | 18% | > 40% | ↑ |
| **"Postmortems lead to real change"** | 68/100 | 62% | 55% | > 80 | ↑ |
| **Action items completed on time** | 76% | 72% | 68% | > 90% | ↑ |
| **Recurrence rate** | 8% | 12% | 15% | < 5% | ↓ |

### Postmortem repository health

| Metric | Current | Notes |
|---|---|---|
| **Total postmortems** | 85 | Since 2024-01 |
| **Searchable/tagged** | 78 (92%) | 7 missing tags |
| **Cross-referenced** | 52 (61%) | Linked to related incidents |
| **Has action item tracking** | 80 (94%) | 5 missing action item links |
| **Reviewed by peer/SRE** | 72 (85%) | 13 not peer-reviewed |
| **Anonymized for sharing** | 35 (41%) | Only 41% shareable externally |
| **Public (external) postmortems** | 8 (9%) | Published to status page |

## Action recommendations

1. **Overdue P1 action items**: 3 critical actions > 15 days overdue (circuit breaker, DB failover runbook, chaos experiment); escalate to VP Eng, dedicate sprint capacity
2. **Recurrence reduction**: 8% recurrence rate, 25-40% for memory/database/network categories; prioritize root cause fixes for recurring categories
3. **Detection gap analysis**: 72% compliance, 72/100 quality; add detection gap as required section, coach postmortem authors on detection improvement
4. **Blamelessness training**: 78/100 score, subtle blame in 22% of postmortems; conduct blameless postmortem training for all engineering leads
5. **Action item quality**: 15% vague actions, 7% overdue; require SMART action items (Specific, Measurable, Assignable, Realistic, Time-bound)
6. **Postmortem review attendance**: 72% attendance, 45% cross-team; make postmortem reviews part of team rituals, invite cross-team stakeholders
7. **Learning dissemination**: 28% of engineers read postmortems; create postmortem digest, add to onboarding, surface in team channels
8. **Severity classification accuracy**: 90% accuracy, 3 downgraded; implement severity classification guide, review severity in postmortem review
9. **Postmortem template refresh**: 82% quality score; update template to emphasize detection gap and concrete prevention, add examples
10. **Monthly postmortem quality review**: review completion rate, action item closure, recurrence, and learning effectiveness with SRE and engineering leads



- Postmortem as blame assignment → "who caused this?" instead of "what caused this?"; a postmortem that names individuals is a postmortem that guarantees future incidents will be hidden
- Action item theater → creating 20 action items to show "we're doing something" but never closing them; 5 well-closed actions are better than 20 open ones
- Root cause as a single thing → stopping at "the root cause was a typo in the config"; the real root cause is why the typo wasn't caught — keep asking why
- Postmortem as a checkbox → completing the postmortem template without genuine analysis; a postmortem that takes 20 minutes to write is not a postmortem, it's a form
- Learning that doesn't spread → one team learns from an incident but the other 7 teams don't; a postmortem read by 8 people is a learning opportunity lost for 277

## Related

- Same class: [dashboard-incident-trends](dashboard-incident-trends.md) — incident trends and analysis
- Same class: [dashboard-oncall-health](dashboard-oncall-health.md) — oncall health and alert fatigue
- Same class: [dashboard-system-health](../observability/dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-deployment-safety](../../engineer/infrastructure/dashboard-deployment-safety.md) — deployment safety
- Same class: [dashboard-lessons-learned](../../engineer/lessons/dashboard-lessons-learned.md) — lessons learned
- References: Google SRE — *Postmortem Culture: Learning from Failure*; John Allspaw — *Blameless Postmortems*; Etsy — *Debriefing Facilitation Guide*; J. Paul Reed — *Postmortem Analysis in DevOps*; Netflix — *Incident Review Process*