---
aliases:
- Engineering Productivity Metrics Template
title: Engineering Productivity Metrics Template (DORA + extension) 
tags:
- Templates
- DORA
- Engineering productivity
- Metrics
- Lead Time
- MTTR
- Change failure rate
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
- ./engineering-productivity-metrics.md
- ./org-productivity-diagnosis.md
- ./sprint-retrospective.md
tacit: false
---

# Engineering Productivity Metrics Template (DORA + extension) 

> **As an** engineer, **I want to** engineering productivity metrics, **so that** process followed predictably. 

> How to use: filled in biweekly by PMO/DevOps, paired with the qb-row "Engineering productivity metrics" one-click prompt: lead time, change failure rate, MTTR, and per-capita throughput trends with attribution. Focus on DORA four metrics + per-capita throughput, attributed by team / system dimension. Copy to `work/processes/{biweek}-dora-metrics.md`. 

## 1. Basic info

| Field | Content |
|------|------|
| Reporting cadence |  (example: 2026 W29, 2026-07-14 ~ 2026-07-27)  |
| Team |  (example: YiVad frontend team, YiAi backend team, YiPet team)  |
| Reporter |  (example: PMO Zhang San)  |
| Data sources | Git platform + CI/CD + monitoring + tickets |
| Reporting date |  (example: 2026-07-29)  |
| Readers | CTO, each team lead, product owner |

## 2. DORA four metrics (core) 

| Metric | Definition | This cadence | Last cadence | Trend | Industry benchmark |
|---|---|---|---|---|---|
| Deployment Frequency | deploys / week | 8 | 5 | up | Elite: > 14 |
| Lead Time for Changes | PR submit to merge median (h)  | 14 | 22 | down | Elite: < 1 |
| Change Failure Rate | failed deploys / total deploys | 12% | 18% | down | Elite: < 15% |
| MTTR | mean time to recover (h)  | 1.2 | 2.5 | down | Elite: < 1 |

> Elite / High / Medium / Low four tiers per DORA benchmark. 

## 3. Metric attribution (by team) 

| Team | Deploy frequency | Lead Time | CFR | MTTR | Main bottleneck |
|---|---|---|---|---|---|
| YiVad frontend | 12/week | 8h | 8% | 0.5h | — |
| YiAi backend | 4/week | 28h | 22% | 3h | review queue |
| YiPet | 2/week | 36h | 15% | 1.5h | cross-end integration |

## 4. Per-capita throughput

| Team | Headcount | Merged PRs | PR / person / week | Lines of code / person / week | Incident tickets / person / week |
|---|---|---|---|---|---|
| YiVad frontend | 6 | 28 | 2.33 | 320 | 0.5 |
| YiAi backend | 4 | 12 | 1.5 | 280 | 1.2 |
| YiPet | 3 | 6 | 1.0 | 180 | 0.8 |

## 5. Key trend charts (description) 

- Deploy frequency: 4-week rolling up trend; YiVad entered Elite
- Lead Time: YiAi backend consistently > 24h; alert triggered
- CFR: overall declining; YiAi backend occasional launch rollback
- MTTR: impacted by monitoring alert optimization; overall declining

## 6. Exceptions and highlights

| Type | Description | Impact | Follow-up |
|---|---|---|---|
| Warning exception | YiAi backend CFR 22% | launch quality | this week tighten PR template |
| Highlight | YiVad Lead Time entered Elite | team rhythm | lessons codified into process |

## 7. Attribution analysis (5 Why example) 

Example: YiAi backend Lead Time 28h
1. Why: review queue
2. Why: reviewers concentrated on 2 people
3. Why: core module knowledge does not spread
4. Why: no cross-review mechanism
5. Why: cross-review not written into Definition of Done

-> Action: add "at least 2 reviewers" to DoD within this cadence. 

## 8. Action items

| # | Action item | Owner | Due date | Status |
|---|---|---|---|---|
| 1 | YiAi backend PR DoD adds cross-review | Backend team lead | 2026-08-05 | To do |
| 2 | YiPet CI cache optimization to cut Lead Time | DevOps | 2026-08-10 | To do |
| 3 | Alert convergence to reduce MTTR fluctuation | Ops | 2026-08-15 | To do |

## 9. Data interpretation and conventions

- Lead Time counts only merged PRs; abandoned PRs not in denominator. 
- CFR failure definition: rollback or hotfix triggered within 24h after launch. 
- MTTR start/end: alert triggered -> full recovery. 
- Per-capita throughput: merged PRs / on-duty headcount (excluding leave). 

## 10. Next cadence goal

| Metric | This cadence | Next cadence goal |
|---|---|---|
| Deploy frequency | 8/week | >= 10/week |
| Lead Time | 14h | <= 12h |
| CFR | 12% | < 10% |
| MTTR | 1.2h | < 1h |
