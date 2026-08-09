---
title: people and expertise dashboard
aliases:
- people dashboard
- expertise dashboard
- team expertise dashboard
- knowledge network dashboard
- skills matrix dashboard
tags:
- dashboard
- people
- expertise
- skills
- team
- knowledge-network
category: knowledge-curator/people
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- knowledge-curator
- tech-lead
- executive
benefit: team expertise distribution and knowledge network health visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./INDEX.md
- ./experts/INDEX.md
- ./stakeholders/INDEX.md
- ./team/INDEX.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
- ../../new-hire/onboarding/dashboard-onboarding-progress.md
- ../governance/dashboard-knowledge-health.md
tacit: false
---

# people and expertise dashboard

> **As a** knowledge curator, **I want to** track team expertise distribution and knowledge network health, **so that** critical knowledge gaps are identified, experts are connected, and organizational knowledge is resilient.

> People are the nodes in the knowledge network. This dashboard tracks expertise distribution, skill coverage, knowledge network connectivity, stakeholder engagement, and people development across the organization.

## Summary

- 5 people dimensions: expertise distribution, skill coverage & gaps, knowledge network health, stakeholder engagement, people development
- Expertise tracked by domain, depth level (L1-L5), and bus factor across 12 knowledge domains
- Skill coverage measured by critical skill availability, single-point-of-failure risks, and cross-training progress
- Knowledge network measured by collaboration density, knowledge sharing frequency, and expert accessibility
- Dashboard reviewed quarterly; expertise directory updated continuously

## Core viewpoints

- Expertise is distributed, not concentrated — healthy organizations have multiple experts per critical domain, not one guru
- Bus factor is a risk metric — every domain with bus factor = 1 is a single point of failure waiting to happen
- Knowledge network density predicts innovation — teams that share knowledge across domains solve problems faster
- Experts are made, not found — expertise development is a deliberate investment, not a hiring lottery

## Key information

### 5-panel people overview

```
┌──────────────────────────────────────────────────────────────────┐
│  EXPERTISE DISTRIBUTION           │  SKILL COVERAGE & GAPS          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Domains:     12        │   │  │  Critical skills: 28     │   │
│  │  Experts:     45 (L3+)  │   │  │  Covered:   24 (86%)    │   │
│  │  L5 (guru):    5 (11%)  │   │  │  Gaps:       4 (14%)    │   │
│  │  L4 (lead):   12 (27%)  │   │  │  SPOF:       6 domains  │   │
│  │  L3 (strong): 28 (62%)  │   │  │  Bus factor:  1.8 avg   │   │
│  │  Bus factor:  1.2-3.5   │   │  │  Cross-trained: 62%     │   │
│  │  Diversity:   0.72 idx  │   │  │  Succession:   8/12     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  KNOWLEDGE NETWORK               │  STAKEHOLDER ENGAGEMENT         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Density:     0.45      │   │  │  Active:     28 stkh    │   │
│  │  Clusters:    4         │   │  │  Engagement: 72% ███▌   │   │
│  │  Bridges:     8 people  │   │  │  Satisfaction: 3.8/5    │   │
│  │  Sharing:     12/mo     │   │  │  Response:    85% < 48h │   │
│  │  Mentorship:  18 pairs  │   │  │  Interviews:  8/mo      │   │
│  │  Isolation:   3 people  │   │  │  Churn risk:   4 people  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Expertise distribution by domain

| Domain | L5 (Guru) | L4 (Lead) | L3 (Strong) | L2 (Capable) | L1 (Novice) | Total | Bus factor |
|---|---|---|---|---|---|---|---|
| AI/ML Engineering | 1 | 2 | 5 | 2 | 0 | 10 | 2.5 |
| Frontend (Vue/React) | 1 | 2 | 6 | 3 | 2 | 14 | 2.8 |
| Backend (Python/FastAPI) | 1 | 2 | 4 | 2 | 1 | 10 | 2.2 |
| Platform/Infrastructure | 0 | 1 | 2 | 1 | 1 | 5 | 1.2 |
| Data Engineering | 0 | 1 | 2 | 1 | 0 | 4 | 1.5 |
| Security | 0 | 1 | 1 | 0 | 0 | 2 | 1.0 |
| UX/Design | 1 | 1 | 1 | 0 | 0 | 3 | 1.5 |
| Product Management | 1 | 1 | 2 | 1 | 0 | 5 | 2.0 |
| DevOps/SRE | 0 | 0 | 2 | 2 | 1 | 5 | 1.2 |
| QA/Testing | 0 | 1 | 2 | 2 | 1 | 6 | 1.8 |
| Knowledge Management | 0 | 0 | 1 | 1 | 1 | 3 | 1.0 |
| Technical Writing | 0 | 0 | 0 | 2 | 1 | 3 | 1.0 |
| **Total** | **5** | **12** | **28** | **17** | **8** | **70** | **1.8** |

### L5 Guru profiles

| Name | Domain | Years exp | Mentoring | Knowledge artifacts | Succession plan? |
|---|---|---|---|---|---|
| Expert A | AI/ML Engineering | 12 | 3 mentees | 12 articles, 2 workshops | Yes — L4 identified |
| Expert B | Frontend (Vue/React) | 10 | 4 mentees | 8 articles, 3 workshops | Yes — L4 identified |
| Expert C | Backend (Python) | 11 | 2 mentees | 10 articles, 1 workshop | Partial — L3 in training |
| Expert D | UX/Design | 9 | 1 mentee | 6 articles, 2 workshops | No — **SPOF risk** |
| Expert E | Product Management | 8 | 2 mentees | 5 articles, 1 workshop | Yes — L4 identified |

### Skill coverage — critical skills

| Critical skill | Domain | Experts available | SPOF? | Cross-training | Risk level |
|---|---|---|---|---|---|
| LLM prompt engineering | AI/ML | 3 | No | 2 in progress | Low |
| RAG pipeline design | AI/ML | 2 | No | 1 in progress | Medium |
| Vue 3 component architecture | Frontend | 4 | No | 3 in progress | Low |
| Rsbuild/Webpack build tooling | Frontend | 2 | No | 1 in progress | Medium |
| FastAPI + async patterns | Backend | 3 | No | 2 in progress | Low |
| PostgreSQL optimization | Backend | 2 | No | 1 in progress | Medium |
| K8s cluster management | Platform | 1 | **Yes** | 1 in progress | **High** |
| CI/CD pipeline design | Platform | 2 | No | 0 | Medium |
| Data pipeline (ETL/ELT) | Data | 1 | **Yes** | 1 in progress | **High** |
| Security architecture | Security | 1 | **Yes** | 0 | **Critical** |
| Accessibility (WCAG) | UX/Design | 1 | **Yes** | 1 in progress | **High** |
| Product discovery | PM | 2 | No | 1 in progress | Low |
| Incident response | SRE | 2 | No | 2 in progress | Medium |
| Cost optimization (FinOps) | SRE | 1 | **Yes** | 0 | **High** |
| Contract testing | QA | 1 | **Yes** | 1 in progress | **High** |
| Knowledge graph design | Knowledge | 1 | **Yes** | 0 | **High** |

### Knowledge network analysis

| Network metric | Current | Target | Description |
|---|---|---|---|
| Network density | 0.45 | > 0.50 | Ratio of actual connections to possible connections |
| Clusters | 4 | 3-5 | Natural groupings (AI, Web, Platform, Business) |
| Bridge people (span 2+ clusters) | 8 | > 10 | People who connect otherwise separate clusters |
| Avg degree centrality | 6.2 | > 7 | Average number of knowledge-sharing connections per person |
| Isolated people (< 3 connections) | 3 | 0 | People with few knowledge-sharing ties |
| Knowledge sharing events/month | 12 | > 16 | Tech talks, demos, brown bags, guild meetings |
| Cross-team PR reviews | 22% | > 30% | % of PRs reviewed by someone outside the team |

### Knowledge sharing activity

| Activity type | This quarter | Attendance | Avg rating | Trend |
|---|---|---|---|---|
| Tech talks | 6 | 22 avg | 4.1/5 | ↑ |
| Lunch & learn | 4 | 15 avg | 3.8/5 | → |
| Guild meetings | 3 | 12 avg | 4.2/5 | ↑ |
| Demo days | 2 | 28 avg | 4.5/5 | ↑ |
| Code review exchange | 18 reviews | N/A | 4.0/5 | → |
| Pair programming sessions | 24 | N/A | 4.3/5 | ↑ |
| Written knowledge sharing (articles) | 15 | N/A | 3.9/5 | → |

### Mentorship program health

| Program | Active pairs | Avg duration | Satisfaction | Skill growth | Promotion rate |
|---|---|---|---|---|---|
| New hire buddy | 8 | 3 months | 4.2/5 | +18% | 85% pass probation |
| Technical mentorship | 6 | 6 months | 4.0/5 | +22% | 40% promoted within 1 year |
| Leadership coaching | 3 | 9 months | 4.3/5 | +15% | 60% promoted within 18 months |
| Cross-domain rotation | 1 | 3 months | 3.8/5 | +28% | New program |
| **Total** | **18** | | **4.1/5** | **+21%** | |

### Stakeholder engagement health

| Stakeholder group | Count | Engagement score | Last contact | Satisfaction | Churn risk |
|---|---|---|---|---|---|
| Executive sponsors | 4 | 85% | < 7 days | 4.2/5 | Low |
| Key customers (design partners) | 6 | 72% | < 14 days | 3.8/5 | Medium |
| Internal power users | 8 | 80% | < 7 days | 4.0/5 | Low |
| Cross-functional partners | 5 | 65% | < 21 days | 3.5/5 | Medium |
| External advisors | 3 | 55% | < 30 days | 3.2/5 | **High** |
| Community contributors | 2 | 45% | < 45 days | 3.0/5 | **High** |
| **Overall** | **28** | **72%** | | **3.8/5** | |

### People development pipeline

| Development stage | Count | % of team | Target |
|---|---|---|---|
| Individual development plan (IDP) active | 28 | 78% | 100% |
| IDP reviewed in last 6 months | 22 | 61% | 90% |
| Completed at least 1 development goal | 18 | 50% | 75% |
| Cross-domain exposure (> 1 domain) | 15 | 42% | 60% |
| Public speaking/teaching | 8 | 22% | 35% |
| External certification achieved | 5 | 14% | 25% |
| Promotion in last 12 months | 7 | 19% | 20-25% |

### Expertise risk register

| Risk | Domain | Impact | Likelihood | Risk score | Mitigation |
|---|---|---|---|---|---|
| Security architect leaves | Security | Critical | Low | 8 | Cross-train 1 engineer; document architecture |
| K8s expert leaves | Platform | High | Medium | 12 | Train 2 engineers; automate common operations |
| Data pipeline expert leaves | Data | High | Medium | 12 | Cross-train 1 data engineer; document pipelines |
| UX guru leaves | Design | High | Low | 6 | Identify L3 successor; capture design rationale |
| Knowledge management expert leaves | Knowledge | Medium | Medium | 9 | Document processes; distribute curation tasks |
| Accessibility expert leaves | Design | Medium | Medium | 9 | Cross-train 1 frontend engineer |

## Action recommendations

1. **Security architecture SPOF**: bus factor = 1.0, no cross-training; immediately assign 1 engineer for cross-training, document security architecture
2. **K8s cluster management**: bus factor = 1.2, single expert; train 2 Platform engineers, create runbooks for common operations
3. **Knowledge management bus factor**: 1.0, no succession plan; distribute curation responsibilities across 3 people
4. **External advisor engagement**: 55% engagement, 3.2/5 satisfaction; schedule quarterly check-ins, share roadmap updates
5. **Community contributor program**: 45% engagement, 2 active contributors; create contributor ladder, monthly community call
6. **IDP coverage**: 78% → 100%; 22% of team without active development plans; mandate IDP for all, review in 1:1s
7. **Increase bridge people**: 8 → 10; encourage cross-team projects, rotate sprint participation
8. **Reduce isolated people**: 3 people with < 3 knowledge connections; assign mentors, invite to guild meetings
9. **Technical writing domain**: 0 L3+ experts; send 2 engineers to technical writing workshop, hire or contract writer
10. **Quarterly expertise review**: update domain expertise levels, review bus factors, adjust cross-training priorities



- Expertise hoarding → "I'm the only one who knows this" as a career strategy; knowledge hoarding is organizational risk, not job security
- Paper expertise → claiming L4 based on years of experience rather than demonstrated capability; expertise is proven by doing, not by resume
- Ignoring the network → tracking individual expertise without understanding how people connect; isolated experts are underutilized assets
- Succession theater → naming a successor without actual training and handover; succession is a process, not a name on a spreadsheet
- Stakeholder neglect → only engaging stakeholders when you need something; stakeholder relationships need continuous investment

## Related

- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — capacity planning
- Same class: [dashboard-onboarding-progress](../../new-hire/onboarding/dashboard-onboarding-progress.md) — onboarding
- Same class: [dashboard-knowledge-health](../governance/dashboard-knowledge-health.md) — knowledge governance
- Downstream: [INDEX](INDEX.md), [experts/INDEX](experts/INDEX.md), [stakeholders/INDEX](stakeholders/INDEX.md), [team/INDEX](team/INDEX.md)
- References: Wenger-Trayner — *Communities of Practice*; Dave Gray — *Gamestorming*; Matthew Skelton & Manuel Pais — *Team Topologies*; Google — *Project Aristotle* (re: Psychological Safety)