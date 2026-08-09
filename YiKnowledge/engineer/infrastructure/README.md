---
title: Deployment & Operations
tags: [leaf, deployment, ci-cd, release, feature-flags, disaster-recovery]
category: engineer/infrastructure
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre]
benefit: "Engineers find CI/CD patterns, deployment strategies, and operational procedures in one place"
acceptance_criteria:
  - "CI/CD setup and deployment strategies documented"
  - "Feature flag and canary deployment patterns present"
  - "Disaster recovery and rollback procedures included"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../oncall-sre/release/
  - ../../oncall-sre/incident-response/
---

# Deployment & Operations

> **As an** engineer, **I want to** find CI/CD patterns, deployment strategies, and operational procedures, **so that** I can ship software safely and operate it reliably.

## CI/CD

| File | Description |
|---|---|
| [set-up-ci-cd.md](./set-up-ci-cd.md) | CI/CD pipeline setup |
| [dev-environment-hmr.md](./dev-environment-hmr.md) | Dev environment and HMR |
| [dashboard-dora-metrics.md](./dashboard-dora-metrics.md) | DORA metrics dashboard |

## Deployment strategies

| File | Description |
|---|---|
| [canary-deployment.md](./canary-deployment.md) | Canary deployment patterns |
| [blue-green-deployment.md](./blue-green-deployment.md) | Blue-green deployment |
| [feature-flag.md](./feature-flag.md) | Feature flag management |
| [roll-out-feature-flags.md](./roll-out-feature-flags.md) | Feature flag rollout |
| [set-up-feature-flags.md](./set-up-feature-flags.md) | Feature flag setup |
| [roll-out-a-migration.md](./roll-out-a-migration.md) | Migration rollout |
| [roll-out-i18n.md](./roll-out-i18n.md) | Internationalization rollout |

## Release & operations

| File | Description |
|---|---|
| [ship-a-release.md](./ship-a-release.md) | Release shipping process |
| [write-a-runbook.md](./write-a-runbook.md) | Runbook writing guide |
| [write-a-statement-of-work.md](./write-a-statement-of-work.md) | Statement of work template |
| [disaster-recovery-drill.md](./disaster-recovery-drill.md) | Disaster recovery drill |
| [migrate-a-database.md](./migrate-a-database.md) | Database migration |

## Cross-references

- [../../oncall-sre/release/](../../oncall-sre/release/) — Release management procedures
- [../../oncall-sre/incident-response/](../../oncall-sre/incident-response/) — Incident response
- [../infrastructure/](../infrastructure/) — Data and persistence patterns