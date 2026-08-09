---
title: architecture review dashboard
aliases:
- architecture governance dashboard
- architecture review board dashboard
- ARB dashboard
- design review dashboard
tags:
- dashboard
- architecture-review
- governance
- review
- design-review
- findings
category: tech-lead/architecture
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- tech-lead
- architect
- engineer
benefit: architecture review process and finding resolution visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../decisions/dashboard-architecture-decisions.md
- ../../engineer/architecture-design/dashboard-architecture-health.md
- ../risk/dashboard-risk-management.md
- ../roadmap/dashboard-roadmap-progress.md
tacit: false
---

# architecture review dashboard

> **As a** tech lead, **I want to** track the architecture review process and finding resolution, **so that** architecture quality is maintained and review findings are systematically resolved.

> Architecture review is the governance mechanism that prevents architectural erosion. This dashboard tracks review cadence, findings, action tracking, review coverage, and decision quality.

## Summary

- 5 review dimensions: review cadence and coverage, finding management, action tracking, review quality, architecture assurance
- Reviews tracked by type: design review (pre-build), code review (in-build), architecture audit (post-build)
- Findings classified by severity (critical, major, minor, observation) with SLA-driven resolution
- Review coverage measured by % of significant changes that pass through architecture review
- Dashboard reviewed monthly; architecture review board (ARB) meets biweekly

## Core viewpoints

- Architecture review is not a gate — it's a collaborative design session that happens early, not a blocker at the end
- Findings are gifts — each finding is an opportunity to improve the architecture before it's too expensive to change
- Review coverage is a process metric — if only 50% of significant changes go through review, the process is broken
- Architecture assurance is continuous — not just at design time, but through implementation and operation

## Key information

### 5-panel review overview

```
┌──────────────────────────────────────────────────────────────────┐
│  REVIEW CADENCE & COVERAGE        │  FINDING MANAGEMENT            │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Reviews:    12 this Q  │   │  │  Open:      18 findings │   │
│  │  Design:      5 (42%)   │   │  │  Critical:   0          │   │
│  │  Code:        4 (33%)   │   │  │  Major:      3         │   │
│  │  Audit:       3 (25%)   │   │  │  Minor:      8         │   │
│  │  Coverage:   78% of Δ   │   │  │  Obs:        7         │   │
│  │  On-time:    85%        │   │  │  Resolved:  42 this Q  │   │
│  │  Bypassed:    4 changes │   │  │  SLA met:    88%       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ACTION TRACKING                 │  REVIEW QUALITY                │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Actions:    28 total    │   │  │  Reviewer:   4.2/rev   │   │
│  │  Done:       18 (64%)    │   │  │  Duration:   45 min    │   │
│  │  In prog:     6 (21%)    │   │  │  Prep:       85% done  │   │
│  │  Overdue:     4 (14%)    │   │  │  Doc:        78% qual  │   │
│  │  Blocked:     0          │   │  │  Outcome:    92% clear │   │
│  │  Avg resolve: 12 days    │   │  │  Satisfaction: 4.0/5   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Review calendar (this quarter)

| Date | Type | Topic | Project | Reviewers | Outcome | Findings |
|---|---|---|---|---|---|---|
| Aug 2 | Design | Multi-model routing architecture | YiAi | 4 | Approved with conditions | 3 minor |
| Jul 28 | Code | Enterprise SSO implementation | YiVad | 3 | Changes requested | 2 major |
| Jul 22 | Audit | YiPet architecture health audit | YiPet | 4 | Action plan created | 5 (1 major, 3 minor, 1 obs) |
| Jul 15 | Design | Developer API Gateway design | Platform | 5 | Approved | 1 minor |
| Jul 10 | Code | RAG pipeline v2 implementation | YiAi | 3 | Approved with conditions | 2 minor |
| Jul 5 | Design | Mobile cross-platform strategy | Mobile | 4 | Deferred (needs research) | N/A |
| Jun 28 | Audit | YiVad quarterly architecture audit | YiVad | 4 | Action plan created | 4 (2 major, 2 minor) |
| Jun 20 | Design | Event streaming platform | Platform | 5 | Approved with conditions | 2 major, 1 minor |
| Jun 15 | Code | Knowledge Base tree component | YiVad | 3 | Approved | 1 obs |
| Jun 8 | Audit | YiAi quarterly architecture audit | YiAi | 4 | Action plan created | 3 (1 major, 2 minor) |
| Jun 1 | Design | AI Code Review v2 | YiVad | 4 | Approved | 1 minor |
| May 25 | Code | Contract testing framework | Platform | 3 | Approved | 0 |

### Review coverage analysis

| Month | Significant changes | Reviewed | Bypassed | Coverage | Target |
|---|---|---|---|---|---|
| May | 18 | 14 | 4 | 78% | 85% |
| Jun | 22 | 17 | 5 | 77% | 85% |
| Jul | 20 | 16 | 4 | 80% | 85% |
| Aug (to date) | 8 | 6 | 2 | 75% | 85% |

### Bypass analysis

| Change | Reason bypassed | Should have been reviewed? | Risk |
|---|---|---|---|
| Cache layer refactor | "Just a refactor" | Yes — changed caching strategy | Medium |
| Search index migration | "Ops task" | Yes — changed data consistency model | High |
| New payment provider integration | "Urgent business need" | Yes — new external dependency | High |
| UI component library update | "Minor version bump" | No — truly minor | Low |

### Finding severity and SLA

| Severity | Definition | Resolution SLA | Open | Avg age | SLA met |
|---|---|---|---|---|---|
| **Critical** | Architecture risk that could cause outage/data loss | 48 hours | 0 | — | — |
| **Major** | Significant deviation from architecture principles | 2 weeks | 3 | 8 days | 85% |
| **Minor** | Improvement opportunity, not blocking | 2 months | 8 | 22 days | 90% |
| **Observation** | Not a finding — something to watch | Next review | 7 | 35 days | 85% |

### Open findings detail

| ID | Severity | Finding | Review | Owner | Age | Due | Status |
|---|---|---|---|---|---|---|---|
| F-042 | Major | SSO implementation creates implicit coupling to auth service | Jul 28 | Auth Lead | 9 days | Aug 11 | In progress |
| F-041 | Major | YiPet uses deprecated Webpack config pattern | Jul 22 | YiPet Lead | 15 days | Aug 5 | **Overdue** |
| F-040 | Major | YiVad event bus not following ADR-003 pattern | Jun 28 | YiVad Lead | 39 days | Jul 12 | **Overdue** |
| F-039 | Minor | RAG chunking strategy not documented | Jul 10 | AI Lead | 27 days | Sep 10 | In progress |
| F-038 | Minor | API Gateway lacks rate limiting per consumer | Jul 15 | Platform Lead | 22 days | Sep 15 | Not started |
| F-037 | Minor | YiPet error boundary missing in 3 components | Jul 22 | YiPet Lead | 15 days | Sep 22 | Not started |
| F-036 | Minor | YiVad lacks circuit breaker on external calls | Jun 28 | YiVad Lead | 39 days | Aug 28 | **Overdue** |
| F-035 | Minor | YiAi config not following 12-factor app principles | Jun 8 | AI Lead | 59 days | Aug 8 | In progress |

### Action tracking by review

| Review | Actions | Done | In progress | Overdue | Avg resolution |
|---|---|---|---|---|---|
| Jun 1 — Code Review v2 Design | 3 | 3 (100%) | 0 | 0 | 8 days |
| Jun 8 — YiAi Audit | 5 | 3 (60%) | 1 | 1 | 18 days |
| Jun 15 — KB Tree Code Review | 2 | 2 (100%) | 0 | 0 | 5 days |
| Jun 20 — Event Streaming Design | 6 | 3 (50%) | 2 | 1 | 22 days |
| Jun 28 — YiVad Audit | 5 | 2 (40%) | 1 | 2 | 28 days |
| Jul 10 — RAG v2 Code Review | 3 | 2 (67%) | 1 | 0 | 10 days |
| Jul 15 — API Gateway Design | 2 | 1 (50%) | 1 | 0 | 12 days |
| Jul 22 — YiPet Audit | 5 | 1 (20%) | 2 | 2 | 15 days |
| Jul 28 — SSO Code Review | 4 | 1 (25%) | 3 | 0 | 8 days |
| **Total** | **35** | **18 (51%)** | **11 (31%)** | **6 (18%)** | **12 days** |

### Review quality assessment

| Quality dimension | Score | Target |
|---|---|---|
| Reviewer diversity (avg reviewers) | 4.2/rev | ≥ 3 |
| Review duration (avg) | 45 min | 30-60 min |
| Pre-read material sent on time | 85% | > 90% |
| Design document quality | 78% | > 85% |
| Decision clarity (approved/not/conditions) | 92% | 100% |
| Follow-up action clarity | 88% | > 90% |
| Participant satisfaction | 4.0/5 | > 4.0 |
| **Overall review quality** | **85%** | **> 85%** |

### Architecture assurance — principle compliance

| Architecture principle | YiVad | YiAi | YiPet | Overall |
|---|---|---|---|---|
| Loose coupling | 82% | 85% | 68% | 81% |
| High cohesion | 85% | 88% | 72% | 84% |
| API-first design | 90% | 92% | 75% | 86% |
| Stateless services | 88% | 85% | 80% | 87% |
| Defense in depth | 78% | 82% | 65% | 76% |
| Observability built-in | 85% | 80% | 70% | 78% |
| Data sovereignty | 92% | 90% | 85% | 91% |
| Graceful degradation | 80% | 85% | 60% | 78% |
| **Overall compliance** | **85%** | **86%** | **72%** | **83%** |

### Architecture review board (ARB) health

| Metric | Current | Target |
|---|---|---|
| ARB members | 5 (CTO, 2 Tech Leads, 2 Sr Engineers) | 5-7 |
| Meeting cadence | Biweekly | Biweekly |
| Attendance rate | 88% | > 85% |
| Decisions per meeting | 2.4 | 2-3 |
| Review backlog | 2 reviews waiting | 0 |
| Avg time from request to review | 8 days | < 5 days |
| Emergency review availability | Yes (within 24h) | Yes |

## Action recommendations

1. **Resolve overdue findings**: 6 overdue actions, 3 exceeding SLA by 15+ days; escalate to owners this week
2. **Reduce review bypass**: 4 changes bypassed review, 3 should have been reviewed; tighten bypass criteria
3. **YiPet architecture principles**: 72% overall compliance is the lowest; prioritize 3 lowest principles
4. **Improve design doc quality**: 78% → 85%; create design doc template and checklist
5. **Reduce review request-to-review time**: 8 days → 5 days; add 1 more review slot per month
6. **Monthly ARB effectiveness review**: review metrics, adjust process, celebrate well-run reviews
7. **Graceful degradation**: 78% overall, YiPet at 60%; every service should degrade gracefully
8. **Defense in depth**: 76% overall, YiPet at 65%; add security review checkpoint to design reviews



- Architecture review as gatekeeper → "you can't deploy until ARB approves"; review is collaborative, not a blocker
- Reviewing too late → code already written, design review happens after implementation; review early, review often
- Rubber stamp → reviews that approve everything without discussion; healthy reviews have findings
- Finding collection without resolution → findings documented but never actioned; tracking closure is as important as finding
- ARB as ivory tower → architects reviewing without understanding context; reviewers must include domain experts

## Related

- Same class: [dashboard-architecture-decisions](../decisions/dashboard-architecture-decisions.md) — ADR management
- Same class: [dashboard-architecture-health](../../engineer/architecture-design/dashboard-architecture-health.md) — architecture health
- Same class: [dashboard-risk-management](../risk/dashboard-risk-management.md) — risk management
- References: Neal Ford — *Building Evolutionary Architectures*; Mark Richards — *Software Architecture Fundamentals*; George Fairbanks — *Just Enough Software Architecture*