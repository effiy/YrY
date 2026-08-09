---
aliases:
- Disaster Recovery Drill Process
title: Disaster Recovery Drill and Switchover Process
tags:
- Process
- disaster recovery
- DR
- drill
- SOP
category: engineer/infrastructure
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
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
- ../../oncall-sre/release/rollback-drill.md
- ./chaos-engineering.md
- ./incident-response.md
- ./capacity-planning.md
tacit: false
---

# Disaster Recovery Drill and Switchover Process

> **As an** engineer, **I want to** run a disaster recovery drill, **so that** process followed predictably.

## 1. Purpose and applicable scope

Validate that disaster recovery systems (multi-DC / multi-cloud / primary-backup / remote disaster recovery) can actually switchover; avoid "configured but unusable" fake disaster recovery.

Applicable to: all core services explicitly claiming disaster recovery capability; businesses with compliance requirements for disaster recovery (finance/payments/orders etc.).

## 2. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Drill owner (R) | Author the drill script; execute; retrospective |
| Technology owner (A) | Review the script; decide drill scope |
| Ops / SRE (C) | Execute switchover; monitoring |
| Business side (I) | Confirm drill window and business impact |
| Compliance (C, when needed) | Supervise compliance requirements |

## 3. Drill classification

| Level | Description | Frequency |
|---|---|---|
| L1 Tabletop exercise | Walk through the process without switching | Quarterly |
| L2 Single-service switchover | Actually switch one service to backup DC | Semi-annual |
| L3 Full-chain switchover | Switch the entire core chain | Annual |
| L4 Failure-injection switchover | Simulate primary DC failure, force switchover | Annual |

## 4. Step breakdown

```
Script preparation → dry run → drill window confirmation → switchover execution → traffic validation → switchback → retrospective
```

| Step | Key actions | Exit criteria |
|---|---|---|
| 1. Script prepare | Switchover conditions, commands, responsible persons, validation points, switchback contingency | Script approved |
| 2. Dry run | Dry run on shadow or simulated environment | Dry run passed |
| 3. Drill window confirm | Align with business side; pick low-peak window | Window confirmed |
| 4. Switchover execution | Switch traffic/data/cache per script; record timeline | Switchover complete |
| 5. Traffic validation | Core chain usable; data consistent; latency within expectation | Validation passed |
| 6. Switchback | After drill, switch back to primary DC per plan; validate recovery | Switchback complete |
| 7. Retrospective | Record RTO/RPO; find script gaps; improvement actions | Retrospective report archived |

## 5. Measurement metrics

- RTO (recovery time objective) vs expected
- RPO (recovery point objective) vs expected
- Switchover success rate
- Number of script gaps
- Data consistency deviation

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Switchover failure | Switch back immediately; escalate per [incident response process](../process/incident-response.md) |
| Data inconsistent | Pause; assess whether data fix is needed |
| Latency regresses after switchover | Assess whether to switch back; investigate bottleneck |
| Script gap | Abort drill; fix script and rerun |
| Drill triggers real incident | Abort immediately; incident response |

## 7. Notes

- **Config is not capability** — must actually switch to validate
- Must back up before drill; switchback contingency must be validated first
- RTO/RPO are commitments — failing the drill means a breach
- Switchover must "switch and switch back" — switchback must be drilled
- Complements [rollback-drill process](../../oncall-sre/release/rollback-drill.md): rollback drill focuses on single service, disaster recovery drill focuses on DC level
- Drill results accumulate into `projects/<project>/` and compliance audit material
