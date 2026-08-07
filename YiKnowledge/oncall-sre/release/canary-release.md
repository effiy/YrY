---
aliases:
- Canary Release Process
title: Gradual Rollout Release Process
tags:
- Process
- gradual rollout release
- canary
- SOP
category: oncall-sre/release
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: yearly
roles:
- oncall-sre
- engineer
benefit: release safe
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./release.md
- ./hotfix-release.md
- ./rollback-drill.md
- ../../engineer/process/incident-response.md
tacit: false
---

# Gradual Rollout Release Process

> **As an** oncall sre, **I want to** canary release, **so that** release safe. 

## 1. Purpose and applicable scope

Reduce release risk via staged rollout; small traffic discovers issues early and stops loss immediately, avoiding full-volume incidents. 

Applicable to: All releases with user traffic and major process impact; pure back-end data fixes may be exempt. 

## 2. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Release owner (R)  | Set gradual rollout plan; execute staged rollout; monitoring |
| Tech owner (A)  | Review gradual rollout strategy, rollback threshold |
| Test owner (C)  | Gradual rollout acceptance use cases |
| Product (C)  | Gradual rollout scope and business communication |
| Business (I)  | Gradual rollout cadence confirmation |

## 3. Gradual rollout strategy

| Stage | Traffic ratio | Observation duration | Exit criteria |
|---|---|---|---|
| Internal | Internal accounts 100% | 30 minutes | No functional/performance issues |
| Small traffic | 1%-5% | 2 hours | Core metrics not degraded |
| Medium traffic | 10%-30% | 4 hours | Core metrics not degraded |
| Large traffic | 50%-80% | 4 hours | Core metrics not degraded |
| Full-volume | 100% | Persistent observation | Enter routine observation |

## 4. Step breakdown

```
Gradual rollout plan review -> prepare gradual rollout capability -> internal -> small traffic -> medium traffic -> large traffic -> full-volume
```

| Step | Key actions | Exit criteria |
|---|---|---|
| 1. Gradual rollout plan review | Traffic ratio, stage, rollback threshold, monitoring dashboard, owner | Plan approved |
| 2. Prepare gradual rollout capability | Switch/routing/AB platform in place; monitoring in place; rollback script in place | All in place |
| 3. Internal | Internal account validation; quickly discover functional issues | 30 minutes no issues |
| 4. Small traffic | Roll out per plan; watch core metrics | Metrics not degraded |
| 5. Medium traffic | Continue rollout; watch long-tail issues | Metrics not degraded |
| 6. Large traffic | Near full-volume; watch capacity and stability | Metrics not degraded |
| 7. Full-volume | Enter routine observation; archive gradual rollout record | Archive complete |

## 5. Measurement metrics

- Proportion of issues discovered during gradual rollout (Target: proportion of incidents intercepted during gradual rollout stage) 
- Average gradual rollout duration
- Gradual rollout rollback rate

## 6. Exception handling and upgrade path

| Scenario | Handling |
|---|---|
| Core metric degradation | Rollback immediately; do not raise traffic |
| User complaints | Assess impact; rollback if necessary |
| Gradual rollout platform failure | Pause; assess whether to do full-volume rollback |
| Data inconsistency | Pause; resume rollout after data fix |
| Emergency fix | Pause current gradual rollout; restart after fix |

## 7. Notes

- Gradual rollout is not an excuse to bypass testing — smoke test must pass first
- Each staged step must have explicit observation duration and rollback threshold
- No requirement changes during gradual rollout
- Before full-volume confirm data migration, cache warmup, capacity assessment
- Use together with [Release Process](./release.md) and [Incident Response Process](../../engineer/process/incident-response.md)
