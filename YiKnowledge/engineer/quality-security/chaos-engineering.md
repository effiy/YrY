---
aliases:
- Chaos Engineering Process
title: Chaos engineering process
tags:
- process
- chaos
- fault-injection
- resilience
- SOP
category: engineer/quality-security
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
- ./disaster-recovery-drill.md
- ./incident-response.md
- ./capacity-planning.md
tacit: false
---

# Chaos engineering process

> **As an** engineer, **I want to** chaos engineering, **so that** process followed predictably.

## 1. Purpose and applicable scope

Through actively injecting faults (node crash, network packet loss, dependency slowdown, disk full) verify system resilience; discover hidden single points and cascading failures.

Applicable to: core microservices, key dependency chains, services with SLA commitments.

Not applicable to: unstable MVP, services lacking monitoring (first add monitoring then do chaos).

## 2. Roles and responsibilities

| role | responsibility |
|---|---|
| Drill owner (R) | Design fault cases; execute; retrospective |
| Technical owner (A) | Review fault scope; decide blast radius |
| Operations / SRE (C) | Execute fault injection; monitoring and response |
| Oncall (C) | Observe and decide whether to upgrade |
| Business party (I) | Confirm drill window |

## 3. Fault case library

| type | example |
|---|---|
| Node | Pod kill, CPU maxed, OOM |
| Network | Packet loss, latency, partition |
| Dependency | Downstream slow, timeout, error rate up |
| Data | DB connection maxed, cache stampede, message backlog |
| Resource | Disk full, file handle exhaustion |
| Third-party | API rate limit, cert expired |

## 4. Step breakdown

```
Case design → blast radius assessment → dry run → injection → observation → recovery → retrospective
```

| step | key action | exit criteria |
|---|---|---|
| 1. Case design | Select fault and goal; clarify assumption ("system should be able to X"); define stop-loss threshold | Case documentation complete |
| 2. Blast radius assessment | Assess impact scope; identify boundary; define abort conditions | Scope controlled |
| 3. Dry run | Run once in shadow environment | Dry run passed |
| 4. Injection | Inject fault per script; monitor during; trigger abort condition to stop immediately | Injection complete or aborted |
| 5. Observation | Verify whether system assumption holds; record metrics | Observation data archived |
| 6. Recovery | Revoke injection; verify system recovery | Recovered to normal |
| 7. Retrospective | Whether assumption was verified; discovered resilience defects; improvement actions | Retrospective report archived |

## 5. Measurement metrics

- Assumption verification rate (proportion of system responding as expected)
- Hidden defects discovered
- Fault recovery time
- Drill abort rate (proportion triggering stop-loss)

## 6. Exception handling and upgrade path

| scenario | handling |
|---|---|
| Stop-loss threshold triggered | Abort immediately; handle per [incident response process](../process/incident-response.md) |
| Impact exceeds blast radius | Stop immediately; assess whether to upgrade |
| Drill triggers real incident | Abort + incident response |
| Fault cannot be revoked | Upgrade to SRE + technical owner; assess restart or switch |
| Third-party impacted | Stop immediately; notify the other party |

## 7. Notes

- **Chaos is not sabotage** — it is a scientific method to validate assumptions
- Add monitoring before doing chaos; fault injection without observation equals blind operation
- Blast radius must be explicit; must have automatic abort mechanism
- Start from small scope; gradually expand (single instance → multi-instance → cross-region)
- Link with [rollback-drill-process](../../oncall-sre/release/rollback-drill.md) and [disaster-recovery-drill-process](../infrastructure/disaster-recovery-drill.md)
- Discovered resilience defects enter tech debt list; iterate PM scheduling governance
