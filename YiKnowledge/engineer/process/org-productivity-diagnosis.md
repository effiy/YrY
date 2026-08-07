---
aliases:
- Org Productivity Diagnosis Template
title: Organization effectiveness diagnosis template
tags:
- Templates
- organization-effectiveness
- team-topology
- dependency-topology
- Conway's law
category: engineer/process
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
review_cycle: half-yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./org-productivity-diagnosis.md
- ./engineering-productivity-metrics.md
- ./tech-roadmap-review.md
tacit: false
---

# Organization effectiveness diagnosis template

> **As an** engineer, **I want to** org productivity diagnosis, **so that** process followed predictably.

> Usage: run once every half year or before organization adjustment. Paired with qb-row "Org productivity diagnosis" one-click prompt: team topology, dependency topology, delivery bottlenecks, and Conway's law alignment. Focus on 4 dimensions: team topology / dependency topology / delivery bottlenecks / Conway alignment. Copy to `work/processes/{half-year}-org-diagnosis.md`.

## 1. Basic info

| Field | Content |
|------|------|
| Diagnosis cadence | (example: 2026 H2) |
| Diagnostician | (example: CTO + PMO) |
| Organization scope | (example: R&D + Product + Design + Ops) |
| Diagnosis date | (example: 2026-07-30) |
| Last diagnosis | [link]\({previous-cadence-filepath}\) |
| Data sources | Ticket system, Git, organization architecture diagram, interviews |

## 2. Team topology (Team Topology)

### 2.1 Team list

| Team | Type | Headcount | Responsibilities | Upstream dependency | Downstream service object | Communication cost |
|---|---|---|---|---|---|---|
| YiVad frontend | Stream-aligned | 6 | Console delivery | YiAi backend, Design | Business | Medium |
| YiAi backend | Stream-aligned | 4 | API + AI services | Data team, Model team | Frontend, Ops | High |
| Platform team | Platform | 5 | Infrastructure | Ops | All R&D | Medium |
| Model team | Complicated-subsystem | 3 | Model training | Data team | Backend, Product | High |

> Team type refers to Team Topologies: Stream-aligned / Platform / Complicated-subsystem / Enabling / Flow of Value Switching.

### 2.2 Topology diagram (description / Mermaid)

```
[Business] -> [Stream-aligned team] -> [Platform team]
                       |
          [Complicated-subsystem model team]
                       |
                 [Ops / SRE]
```

## 3. Dependency topology (Dependency Topology)

### 3.1 Cross-team dependency matrix

| Team A -> | YiVad frontend | YiAi backend | Platform | Model | Ops |
|---|---|---|---|---|---|
| YiVad frontend | — | High | Medium | Low | Low |
| YiAi backend | Medium | — | High | High | Medium |
| Platform | Low | Medium | — | Low | High |
| Model | Low | High | Low | — | Low |
| Ops | Low | Low | Medium | Low | — |

### 3.2 Key dependency paths

| Path | Type | Frequency | Blocking situation |
|---|---|---|---|
| YiVad -> YiAi API | Strong dependency | 8/day | Interface changes need 2 weeks advance notice |
| YiAi -> Model team | Strong dependency | 2/week | Compute capacity contention |
| Everyone -> Platform | Weak dependency | 3/week | Ticket queue |

## 4. Delivery bottlenecks (Delivery Bottlenecks)

### 4.1 Key bottleneck identification

| Bottleneck | Symptom | Root cause (5 Why) | Impact scope |
|---|---|---|---|
| Review queue | Lead Time > 24h | Reviewers concentrated on 2 people -> knowledge not spread -> no cross-review mechanism | All R&D |
| Compute contention | Model iteration delayed | 1 compute unit -> shared by multiple teams -> no quota mechanism | Model team + backend |
| Design review | UI rework many | Requirements unclear -> no low-fidelity stage -> straight to high-fidelity | Frontend + design |

### 4.2 Stream-throughput efficiency

| Stage | Average duration | Wait ratio | Main wait cause |
|---|---|---|---|
| Requirement review | 2.5 days | 50% | Business schedule |
| Tech review | 1.5 days | 30% | Reviewer on leave |
| Development | 5 days | 0% | — |
| Review | 1.2 days | 60% | Reviewer concentration |
| Test | 3 days | 20% | Data preparation |
| Deploy | 0.5 days | 10% | CI queue |

## 5. Conway's law alignment (Conway's Law Alignment)

> Conway's law: system structure mirrors organization communication structure. Reverse use: adjust the organization to match the desired architecture.

### 5.1 Desired architecture vs current organization

| Desired architecture feature | Current organization match | Gap | Adjustment suggestion |
|---|---|---|---|
| Frontend-backend decoupling | 3 stars | Interface alignment mechanism missing | Establish API contract meeting |
| AI-business decoupling | 2 stars | Model team squeezed by business | Establish model SLA |
| Platform self-service | 2 stars | Platform ticket-based | Switch to self-service + documentation |

### 5.2 Conway reverse tuning

| Desired change | Organization action | Expected architecture impact |
|---|---|---|
| Speed up frontend autonomy | Add "component owner" in frontend team | Component reuse improves |
| Independent model iteration | Establish model product manager | Model iteration cadence stabilizes |

## 6. Satisfaction and health check

| Dimension | Score (1-5) | Main issue |
|---|---|---|
| Goal clarity | 4 | — |
| Collaboration smoothness | 2.5 | Cross-team long waits |
| Work cadence | 3.5 | — |
| Technical growth | 4 | — |
| Psychological safety | 4 | — |

## 7. Action items

| Number | Action item | Type | Owner | Due date | Status |
|---|---|---|---|---|---|
| 1 | Establish API contract meeting | Organization | CTO | 2026-08-15 | Todo |
| 2 | Model team compute quota mechanism | Process | Model team lead | 2026-08-30 | Todo |
| 3 | Cross-reviewer mechanism into DoD | Process | Each team lead | 2026-08-10 | Todo |
| 4 | Platform self-service upgrade | Architecture | Platform team lead | 2026 Q4 | Todo |

## 8. Measurement metrics

| Metric | Last cadence | This cadence goal |
|---|---|---|
| Cross-team wait duration | 8.2 days | <= 6 days |
| Self-service rate | 35% | >= 50% |
| Reviewer per-capita load | 12 PR/week | <= 8 PR/week |
