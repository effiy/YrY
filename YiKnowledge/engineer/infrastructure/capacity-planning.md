---
aliases:
- Capacity Planning Process
title: Capacity assessment and scale-out process
tags:
- Process
- capacity assessment
- scale-out
- SRE
- SOP
category: engineer/infrastructure
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./data-migration.md
- ./incident-response.md
- ./chaos-engineering.md
tacit: false
---

# Capacity assessment and scale-out process

> **As an** engineer, **I want to** capacity planning, **so that** process followed predictably. 

## 1. Purpose and scope

Before launching new features, promotions/campaigns, or user growth, assess resource capacity and scale out in advance to avoid capacity incidents; at the same time avoid over-provisioning that wastes cost. 

Applies to: all production services (application, database, cache, message queue, storage, bandwidth) . 

## 2. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Capacity owner (R)  | Write capacity assessment report; execute scale-out |
| Tech owner (A)  | Audit assessment conclusions; decide scale-out scope |
| Ops / SRE (C)  | Execute resource changes; configure monitoring alerts |
| Business side (C)  | Provide traffic expectations and cadence |
| Iteration PM (I)  | Coordinate window and external communication |

## 3. Step breakdown

```
Capacity requirement input -> baseline assessment -> load test validation -> scale-out decision -> execute -> observe -> shrink
```

| Steps | Key actions | Exit criteria |
|---|---|---|
| 1. Capacity requirement input | Business side provides expected QPS/UV/data volume; clarify peak value and duration | Requirement doc confirmed |
| 2. Baseline assessment | Inventory current resources; single-instance capacity benchmark; identify bottlenecks | Assessment report produced |
| 3. Load test validation | Load test in shadow environment; validate bottlenecks and scale-out linearity | Load test report produced |
| 4. Scale-out decision | Compute required resources; consider redundancy factor; assess cost | Decision doc approved |
| 5. Execute | Scale out per plan; configure monitoring and alerts; warm up cache | Scale-out complete |
| 6. Observe | Watch dashboards during peak; record key metrics | Peak passed smoothly |
| 7. Shrink | After peak assess whether to reclaim resources; optimize cost | Shrink complete or retention decision archived |

## 4. Inputs / outputs

- **Input**: Business traffic expectations, resource baseline, historical load test data, monitoring dashboards
- **Output**: Capacity assessment report, load test report, scale-out decision, execution record

## 5. Measurement metrics

- Capacity assessment accuracy (actual vs expected) 
- Scale-out lead time (requirement to execution) 
- Number of incidents during peak
- Resource utilization (target 60%~80%, no over-provisioning) 

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Load test discovers hard-to-solve bottleneck | Split into a dedicated optimization item; assess whether to degrade / rate-limit as fallback |
| Scale-out resources insufficient | Escalate to ops + business side; adjust expectations or postpone the campaign |
| Peak exceeds expectations | Trigger [incident response process](../process/incident-response.md); emergency scale-out + rate limit |
| Unstable after scale-out | Immediately troubleshoot; revert to stable water level if necessary |
| Cost over budget | Escalate to business side + iteration PM; decide trade-offs |

## 7. Notes

- **Capacity assessment must be done early** — assessing 2 weeks before a promotion usually leaves no time
- Load testing is not "just test it" — must find the real bottleneck
- Redundancy factor 30%~50%; but don't over-provision to the point of waste
- Scale-out must configure monitoring and alerts at the same time; blind scale-out equals no scale-out
- After peak must assess shrinking — long-term retention is a cost black hole
- Links with [data-migration process](./data-migration.md): database scale-out often involves migration
