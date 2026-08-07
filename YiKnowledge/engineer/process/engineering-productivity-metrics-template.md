---
aliases:
- Engineering Productivity Metrics Template
title: Engineering productivity metrics template (DORA + extended) 
tags:
- Template
- DORA
- engineering productivity
- metric
- Lead Time
- MTTR
- change failure rate
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
- tech-lead
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

# Engineering productivity metrics template (DORA + extended) 

> **As an** engineer, **I want to** engineering productivity metrics template, **so that** process followed predictably. 

> Usage: every two weeks the PMO/DevOps fills in a one-shot, paired with the qb-row "Engineering productivity metrics" one-key prompt: lead time, change failure rate, MTTR, and per-capita throughput trends with attribution. Focuses on DORA four metrics + per-capita throughput, attributed by team/system dimension. Reproduced to `work/processes/{biweek}-dora-metrics.md`. 

## 1. Basic information

| Field | Content |
|------|------|
| Reporting cadence |  (example: 2026 W29, 2026-07-14 ~ 2026-07-27)  |
| Team |  (example: YiVad frontend team, YiAi backend team, YiPet team)  |
| Reporter |  (example: PMO Zhang San)  |
| Data source | Git platform + CI/CD + monitoring + ticket system |
| Report date |  (example: 2026-07-29)  |
| Readers | CTO, each team lead, product owner |

## 2. DORA four metrics (core) 

| Metric | Definition | This cadence | Previous cadence | Trend | Industry benchmark |
|---|---|---|---|---|---|
| Deployment Frequency | deploys / week | 8 | 5 | up | Elite: > 14 |
| Lead Time for Changes | PR submit to merge median (h)  | 14 | 22 | down | Elite: < 1 |
| Change Failure Rate | failed deploys / total deploys | 12% | 18% | down | Elite: < 15% |
| MTTR | average time to restore (h)  | 1.2 | 2.5 | down | Elite: < 1 |

> Elite / High / Medium / Low four tiers reference the DORA benchmark. 

## 3. Metric attribution (by team) 

| Team | Deploy frequency | Lead Time | CFR | MTTR | Main bottleneck |
|---|---|---|---|---|---|
| YiVad frontend | 12/week | 8h | 8% | 0.5h | — |
| YiAi backend | 4/week | 28h | 22% | 3h | Review queue |
| YiPet | 2/week | 36h | 15% | 1.5h | cross-end integration |

## 4. Per-capita throughput

| Team | Headcount | Merged PRs | PRs / person / week | Code lines / person / week | Defects / person / week |
|---|---|---|---|---|---|
| YiVad frontend | 6 | 28 | 2.33 | 320 | 0.5 |
| YiAi backend | 4 | 12 | 1.5 | 280 | 1.2 |
| YiPet | 3 | 6 | 1.0 | 180 | 0.8 |

## 5. Key trend charts (descriptions) 

- Deploy frequency: rolling 4-week upward trend, YiVad already Elite
- Lead Time: YiAi backend persistently > 24h, triggers warning
- CFR: overall down, YiAi backend occasional launch rollback
- MTTR: impacted by monitoring alert optimization, overall down

## 6. Exceptions and highlights

| Type | Description | Impact | Follow-up |
|---|---|---|---|
| Warning exception | YiAi backend CFR 22% | Launch quality | This week tighten PR Template |
| Highlight | YiVad Lead Time reaches Elite | Team cadence | Experience distilled into Process |

## 7. Attribution analysis (5-Why example) 

Example: YiAi backend Lead Time 28h
1. Why: Review queue
2. Why: Reviewers concentrated in 2 people
3. Why: Core module knowledge not diffused outward
4. Why: No cross-Review mechanism
5. Why: Cross-Review not written into Definition of Done

-> actions: This cadence will add "at least 2 reviewers" into DoD. 

## 8. Action items

| Number | Action item | Owner | Due date | Status |
|---|---|---|---|---|
| 1 | YiAi backend PR DoD add cross-Review | Backend team lead | 2026-08-05 | To do |
| 2 | YiPet CI cache optimization to drop Lead Time | DevOps | 2026-08-10 | To do |
| 3 | Alert convergence to reduce MTTR fluctuation | ops | 2026-08-15 | To do |

## 9. Data explanation and conventions

- Lead Time only counts already-merged PRs; deprecated PRs not included in denominator. 
- CFR failure definition: triggers rollback or hotfix within 24h after launch. 
- MTTR start/end: alert trigger -> full recovery. 
- Per-capita throughput: merged PRs / active headcount (excluding leave). 

## 10. Next-cadence targets

| Metric | This cadence | Next-cadence target |
|---|---|---|
| Deploy frequency | 8/week | >= 10/week |
| Lead Time | 14h | <= 12h |
| CFR | 12% | < 10% |
| MTTR | 1.2h | < 1h |
