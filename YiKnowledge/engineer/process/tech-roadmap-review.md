---
aliases:
- Tech Roadmap Review Template
title: Tech roadmap review template
tags:
- Templates
- tech roadmap
- quarterly planning
- milestones
- investment distribution
category: engineer/process
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./tech-roadmap-review.md
- ./quarterly-tech-debt.md
- ./org-productivity-diagnosis.md
tacit: false
---

# Tech roadmap review template

> **As an** engineer, **I want to** tech roadmap review, **so that** process followed predictably. 

> How to use: fill in this template 48 hours before the end-of-quarter alignment meeting. The key output is a single "this quarter's investment distribution + milestone alignment" table so the platform / middleware / business investment ratios are visible at a glance. Copy to `work/processes/{quarter}-tech-roadmap-review.md`, e.g. `2026Q3-tech-roadmap-review.md`. 

## 1. Basic info

| Field | Content |
|------|------|
| Review quarter |  (example: 2026 Q3)  |
| Review scope | platform / middleware / business three domains |
| Facilitator |  (example: CTO / architecture group lead)  |
| Participants | platform, middleware, business domain owners; PMO; finance BP |
| Review date |  (example: 2026-09-25)  |
| Last review | [link]\({previous-quarter-filepath}\) |
| Input materials | last quarter retrospective, each domain OKR draft, budget constraints, customer feedback Top 10 |

## 2. Investment distribution overview

### 2.1 Headcount allocation (by domain)

| Domain | Last quarter actual | This quarter plan | Deviation | Headcount (person-months) | Ratio | Strategic intent |
|---|---|---|---|---|---|---|
| Platform | 30% | 35% | +5pp | 18 | 35% | Solidify foundation, reduce cost |
| Middleware | 25% | 20% | -5pp | 10 | 20% | Consolidate message queues |
| Business | 45% | 45% | 0pp | 23 | 45% | AI launch |

### 2.2 Investment classification (by type)

| Type | Ratio | Key projects | Notes |
|---|---|---|---|
| Innovation (New Value) | 25% | BRD Agent | Growth engine |
| Efficiency (Optimize) | 40% | aicr automation | Cost reduction |
| Defensive (Risk/Tech Debt) | 20% | YiVad upgrade | Trend containment |
| Exploration (R&D) | 15% | Multimodal PoC | Option value |

## 3. Milestone alignment table

| Domain | Milestone | Key date | Acceptance criteria | Depends on | Status |
|---|---|---|---|---|---|
| Platform | data mid-platform v2 launch | 2026-10-15 | 5 core dashboard migrations done | data team interface alignment | In progress |
| Middleware | Message queue consolidation | 2026-11-01 | RabbitMQ fully migrated to Kafka | platform network | Risk |
| Business | AI GA | 2026-12-10 | Launch in 6 countries | legal compliance, model card | On time |

## 4. Deviation analysis

### 4.1 Unachieved items from last quarter

| Project | Planned completion | Actual completion | Delay cause | This quarter handling |
|---|---|---|---|---|
| YiVad Vite→Rsbuild migration | 100% | 100% | — | Delivered |
| Multimodal PoC | 80% | 50% | Insufficient compute | Downgraded to this quarter's focus |

### 4.2 Added/dropped items this quarter

| Change type | Project | Cause | Affected domain |
|---|---|---|---|
| Added | FinOps weekly report | Cost exceeded threshold | Platform / all domains |
| Dropped | In-house OCR | Vendor solution mature | Business |

## 5. Risk and mitigation

| Risk | Probability | Impact | Mitigation measures | Owner |
|---|---|---|---|---|
| Model hallucination delays launch | High | High | Red team testing + manual fallback | Model team |
| Cross-domain dependency blocked | Medium | Medium | Align key paths 2 weeks ahead | PMO |

## 6. Measurement metrics

| Metric | Last quarter | This quarter goal |
|---|---|---|
| On-time delivery rate | 78% | ≥85% |
| ROI | 1.6 | ≥1.8 |
| Milestone deviation | +12 days | ≤±7 days |
| Strategic goal completion | 70% | ≥85% |

## 7. Resolutions and action items

| # | Action item | Owner | Due date | Status |
|---|---|---|---|---|
| 1 | Lock this quarter's headcount allocation | PMO | 2026-10-08 | To do |
| 2 | Complete FinOps weekly report template launch | Platform team | 2026-10-15 | To do |
| 3 | Apply for additional compute for multimodal PoC | Architecture team | 2026-10-10 | To do |

## 8. Next review pre-arrangement

- Next review date: __
- Items to follow up: __
- Data to prepare in advance: __
