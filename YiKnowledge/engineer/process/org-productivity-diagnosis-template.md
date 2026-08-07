---
aliases:
- Org Productivity Diagnosis Template
title: Org Productivity Diagnosis Template
tags:
- Templates
- Org efficiency
- Team topology
- Dependency topology
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
- tech-lead
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

# Org Productivity Diagnosis Template

> **As an** engineer, **I want to** org productivity diagnosis template, **so that** process followed predictably. 

> How to use: run once every half-year or before an org adjustment. Paired with the qb-row "Org productivity diagnosis" one-click prompt: team topology, dependency topology, delivery bottlenecks, and Conway's law alignment. Focus on 4 dimensions: team topology / dependency topology / delivery bottlenecks / Conway alignment. Copy to `work/processes/{half-year}-org-diagnosis.md`. 

## 1. Basic info

| Field | Content |
|------|------|
| Diagnosis cadence |  (example: 2026 H2)  |
| Diagnostician |  (example: CTO + PMO)  |
| Org scope |  (example: R&D + Product + Design + Ops)  |
| Diagnosis date |  (example: 2026-07-30)  |
| Previous diagnosis | [link]\({previous cadence filepath}\) |
| Data source | Ticket system, Git, org chart, interviews |

## 2. Team topology (Team Topology) 

### 2.1 Team list

| Team | Type | Headcount | Responsibilities | Upstream dependency | Downstream service target | Communication cost |
|---|---|---|---|---|---|---|
| YiVad front-end | Stream-aligned | 6 | Console delivery | YiAi back-end, Design | Business | Medium |
| YiAi back-end | Stream-aligned | 4 | API + AI services | Data team, Model team | Front-end, Ops | High |
| Platform team | Platform | 5 | Infrastructure | Ops | All R&D | Medium |
| Model team | Complicated-subsystem | 3 | Model training | Data team | Back-end, Product | High |

> Team type per Team Topologies: Stream-aligned / Platform / Complicated-subsystem / Enabling / Flow of Value Switching. 

### 2.2 Topology diagram (description / Mermaid) 

```
[Business] -> [Stream-aligned Team] -> [Platform Team]
                       |
          [Complicated-subsystem Model Team]
                       |
                 [Ops / SRE]
```

## 3. Dependency topology (Dependency Topology) 

### 3.1 Cross-team dependency matrix

| Team A -> | YiVad front-end | YiAi back-end | Platform team | Model team | Ops |
|---|---|---|---|---|---|
| YiVad front-end | — | High | Medium | Low | Low |
| YiAi back-end | Medium | — | High | High | Medium |
| Platform team | Low | Medium | — | Low | High |
| Model team | Low | High | Low | — | Low |
| Ops | Low | Low | Medium | Low | — |

### 3.2 Key dependency paths

| Path | Type | Frequency | Blocking situation |
|---|---|---|---|
| YiVad -> YiAi API | Strong dependency | 8/day | Interface changes need 2 weeks lead time |
| YiAi -> Model team | Strong dependency | 2/week | Compute contention |
| All -> Platform team | Weak dependency | 3/week | Ticket queue |

## 4. Delivery bottlenecks (Delivery Bottlenecks) 

### 4.1 Key bottleneck identification

| Bottleneck | Symptom | Root cause (5 Why)  | Impact scope |
|---|---|---|---|
| Review queue | Lead Time > 24h | Reviewers concentrated in 2 people -> knowledge not spread -> no cross-review mechanism | All R&D |
| Compute contention | Model iteration delay | 1 compute machine -> reused by multiple teams -> no quota mechanism | Model team + back-end |
| Design review | UI rework high | Requirements unclear -> no low-fidelity phase -> straight to high-fidelity | Front-end + Design |

### 4.2 Stream efficiency

| Stage | Avg duration | Wait proportion | Main wait cause |
|---|---|---|---|
| Requirement review | 2.5 days | 50% | Business schedule |
| Tech review | 1.5 days | 30% | Reviewer on leave |
| Development | 5 days | 0% | — |
| Review | 1.2 days | 60% | Reviewer concentration |
| Test | 3 days | 20% | Data preparation |
| Deploy | 0.5 days | 10% | CI queue |

## 5. Conway's law alignment (Conway's Law Alignment) 

> Conway's law: System structure mirrors org communication structure. Used in reverse: adjust the org to match the desired architecture. 

### 5.1 Desired architecture vs current org

| Desired architecture trait | Current org match | Gap | Adjustment suggestion |
|---|---|---|---|
| Front-end/back-end decoupling | 3 stars | Interface alignment mechanism missing | Set up API contract meeting |
| AI and business decoupling | 2 stars | Model team squeezed by business | Set up model SLA |
| Platform self-service | 2 stars | Platform is ticket-based | Switch to self-service + documentation |

### 5.2 Conway reverse tuning

| Desired change | Org action | Expected architecture impact |
|---|---|---|
| Accelerate front-end autonomy | Add "component owner" within front-end team | Component reuse increases |
| Model independent iteration | Set up model product manager | Model iteration cadence stabilizes |

## 6. Satisfaction and health check

| Dimension | Score (1-5) | Main issue |
|---|---|---|
| Goal clarity | 4 | — |
| Collaboration smoothness | 2.5 | Cross-team wait long |
| Work cadence | 3.5 | — |
| Tech growth | 4 | — |
| Psychological safety | 4 | — |

## 7. Action items

| No. | Action item | Type | Owner | Due date | State |
|---|---|---|---|---|---|
| 1 | Set up API contract meeting | Org | CTO | 2026-08-15 | To do |
| 2 | Model team compute quota mechanism | Process | Model team lead | 2026-08-30 | To do |
| 3 | Cross-reviewer mechanism into DoD | Process | Each team lead | 2026-08-10 | To do |
| 4 | Platform self-service upgrade | Architecture | Platform team lead | 2026 Q4 | To do |

## 8. Measurement metrics

| Metric | Previous cadence | This cadence goal |
|---|---|---|
| Cross-team wait duration | 8.2 days | <= 6 days |
| Self-service rate | 35% | >= 50% |
| Reviewer load per capita | 12 PR/week | <= 8 PR/week |
