---
aliases:
- Dependency Upgrade Process
title: Dependency Upgrade Process
tags:
- Process
- dependency-upgrade
- safe
- SOP
category: engineer/engineering
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./quarterly-security-audit.md
- ../../oncall-sre/release/hotfix-release.md
- ../../oncall-sre/release/canary-release.md
- ../../oncall-sre/release/release.md
tacit: false
---

# Dependency Upgrade Process

> **As an** engineer, **I want to** dependency upgrade, **so that** process followed predictably.

## 1. Purpose and scope

Covers third-party library, framework, runtime upgrade actions; balance safety, compliance, and stability; avoid both "never upgrade" and "reckless upgrade" extremes.

Applies to: all production project dependencies (npm/pip/cargo/maven etc.), runtimes (Node/Python/JVM), base images.

## 2. Role and responsibility

| Role | Responsibility |
|---|---|
| Upgrade owner (R) | Assess impact; execute upgrade; regression |
| Tech owner (A) | Decide upgrade timing and scope |
| Security / compliance (C) | Assess CVE and compliance requirements |
| QA Lead (C) | Regression strategy |
| Iteration PM (I) | Schedule and external coordination |

## 3. Upgrade tier

| Tier | Trigger condition | Timeline | Review |
|---|---|---|---|
| Urgent | High-severity CVE actively exploited; security bulletin | Within 24 hours | Simplified review, retroactively record |
| High | Medium CVE; vendor stopped maintenance | Within 1 week | Normal review |
| Medium | Minor version; feature/performance improvement | Within 1 month | Normal review |
| Low | Patch version; noise reduction | Quarterly batched | Batch review |

## 4. Steps

```
Trigger → Impact assessment → Upgrade plan review → Branch validation → Canary release → Observe → Close-out
```

| Step | Key action | Exit standard |
|---|---|---|
| 1. Trigger | Security bulletin / dependency scan / vendor announcement | Reaches owner |
| 2. Impact assessment | Breaking changes; call surface; compatibility; performance | Assessment doc complete |
| 3. Upgrade plan review | Upgrade path, rollback method, canary strategy | Plan approved |
| 4. Branch validation | Unit + integration regression; key path manual test | QA passed |
| 5. Canary release | Follow [canary release process](../../oncall-sre/release/canary-release.md) | Canary all quantities |
| 6. Observe | At least 24 hours watching core metrics | No regression |
| 7. Close-out | Update lockfile, CHANGELOG, archive record | Archive complete |

## 5. Measurement metrics

- Dependency expiration rate (share of dependencies more than N versions behind)
- High-severity CVE average fix time
- Number of incidents caused by upgrades
- Upgrade rollback rate

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Breaking changes large impact | Split across multiple iterations; compatibility layer first then switch |
| No replacement solution | Assess self-maintained fork; record risk |
| Performance degrades after upgrade | Roll back; dedicated optimization project then re-upgrade |
| Upgrade causes incident | Roll back immediately; handle per [incident response process](../process/incident-response.md) |
| Cannot canary (e.g. build tool) | Run dual validation; long enough parallel period |

## 7. Notes

- **Not upgrading is not stability; it is debt** — govern by cadence Governance
- Decouple upgrades from business requirements; do not mix in one iteration
- Lock version scope; avoid implicit upgrades
- Upgrade PR must be independent; do not mix with business changes
- Urgent CVE follows [hotfix process](../../oncall-sre/release/hotfix-release.md)
- Upgrade records settle into `projects/<project>/` for traceability
