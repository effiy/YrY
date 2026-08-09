---
title: "Oncall SRE role index"
tags: [index, oncall-sre, incident-response, observability, release]
category: oncall-sre
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [oncall-sre]
benefit: "SREs find incident response, observability, and release content in one index"
acceptance_criteria:
  - "3 subdirectories with file counts"
  - "Key incident procedures highlighted"
related:
  - ./README.md
  - ../INDEX.md
  - ../engineer/SECURITY.md
---

# Oncall SRE — Role Index

> **As an** oncall SRE, **I want to** navigate incident response procedures, observability patterns, and release processes, **so that** I keep systems reliable.

## Subdirectories

| Domain | Content | Files |
|---|---|---|
| [incident-response/](./incident-response/) | Incident procedures, postmortems, oncall handovers, runbooks | 23 |
| [observability/](./observability/) | Monitoring, alerting, dashboards, SLO definitions | 6 |
| [release/](./release/) | Release coordination, hotfix procedures, rollback | 5 |

## Key procedures

- **Incident response** — respond to incidents, handle data breaches, outage communication
- **Postmortems** — blameless postmortem templates and examples (FSEvents, lockfile supply chain)
- **Oncall handover** — weekly handover templates (W32, W33)
- **Observability** — monitoring governance, SLO definition, alert configuration
- **Release** — release management, hotfix workflow, rollback drills

## Cross-role references

- [../engineer/infrastructure/](../engineer/infrastructure/) — CI/CD, releases, disaster recovery
- [../engineer/quality-security/](../engineer/quality-security/) — Security incident response
- [../tech-lead/risk/](../tech-lead/risk/) — Risk register and postmortems
- [../engineer/SECURITY.md](../engineer/SECURITY.md) — Security domain index
