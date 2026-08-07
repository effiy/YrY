---
title: Release Management
tags: [leaf, release, hotfix, rollback, canary]
category: oncall-sre/release
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: leaf-readme
status: stable
lifecycle: active
review_cycle: monthly
roles: [oncall-sre, engineer, tech-lead]
benefit: "SREs and engineers find release procedures, hotfix workflows, and rollback drills in one place"
acceptance_criteria:
  - "Release procedures: standard, canary, hotfix"
  - "Rollback drill documented"
  - "Release freeze policy present"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../engineer/infrastructure/
---

# Release Management

> **As an** oncall SRE, **I want to** find release procedures and rollback workflows, **so that** I can ship safely and recover quickly from bad deployments.

## Release procedures

| Procedure | File | Description |
|---|---|---|
| Standard release | [release.md](./release.md) | Regular release workflow |
| Canary release | [canary-release.md](./canary-release.md) | Gradual rollout with traffic shifting |
| Hotfix release | [hotfix-release.md](./hotfix-release.md) | Emergency fix workflow |
| Release freeze | [release-freeze.md](./release-freeze.md) | Freeze policy and exceptions |
| Rollback drill | [rollback-drill.md](./rollback-drill.md) | Scheduled rollback practice |

## Cross-references

- [../../engineer/infrastructure/](../../engineer/infrastructure/) — CI/CD, feature flags, canary deployment patterns
- [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) — Release shipping process
- [../incident-response/](../incident-response/) — Incident response procedures