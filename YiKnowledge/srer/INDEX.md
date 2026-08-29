---
title: "Oncall SRE role index"
tags: [index, srer, incident-response, observability, release]
category: srer
created: 2026-08-06
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer]
benefit: "SREs find incident response, observability, and release content in one index"
acceptance_criteria:
  - "3 subdirectories with README files"
related:
  - ./README.md
  - ../INDEX.md
  - ../engineer/SECURITY.md
---

# Oncall SRE — Role Index

> **Pipeline stage**: 4. Ship + Operate — Srer OPERATES production. For implementation → [engineer/](../engineer/). For risk strategy → [leader/risk/](../leader/risk/).

## Subdirectories

| Domain | Content |
|---|---|
| [incident-response/](./incident-response/) | Incident procedures, postmortems, oncall handovers, runbooks |
| [observability/](./observability/) | Monitoring, alerting, dashboards, SLO definitions |
| [release/](./release/) | Release coordination, hotfix procedures, rollback |

## Cross-role references

- [../engineer/ship/](../engineer/ship/) — CI/CD, releases, disaster recovery
- [../engineer/ship/](../engineer/ship/) — Security incident response
- [../leader/risk/](../leader/risk/) — Risk register and postmortems
- [../engineer/SECURITY.md](../engineer/SECURITY.md) — Security domain index