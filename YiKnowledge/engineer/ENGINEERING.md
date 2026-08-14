---
title: Engineering domain index
tags: [domain-index, engineering, architecture, quality, deployment, data, tools, lessons]
category: root
created: 2026-08-06
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, aier, srer]
benefit: "All engineering content reachable from a single cross-role index"
acceptance_criteria:
  - "Aggregates engineering directories from engineer/, leader/, srer/"
  - "Organized by subdomain"
related:
  - ./INDEX.md
  - ./README.md
  - ./SECURITY.md
  - ../curator/COLLABORATION.md
---

# Engineering Domain Index

Cross-role aggregation of architecture, development, quality, deployment, data, reliability, and tools content.

## Architecture & design

| Directory | Role | Description |
|---|---|---|
| [architecture/](./architecture/) | engineer | API design, system design, design patterns |
| [../leader/architecture/](../leader/architecture/) | leader | Tech selection, maturity models |
| [../leader/decisions/](../leader/decisions/) | leader | ADRs across YiAi, YiVad, YiPet, FDE |

## Development & tools

| Directory | Role | Description |
|---|---|---|
| [development/](./development/) | engineer | Tools, DX, bootstrapping, dependencies |

## Quality & testing

| Directory | Role | Description |
|---|---|---|
| [quality-security/](./quality-security/) | engineer | Testing, code review, threat modeling, audits |

## Data & persistence

| Directory | Role | Description |
|---|---|---|
| [data/](./data/) | engineer | Databases, migrations, data pipelines |

## Reliability & resilience

| Directory | Role | Description |
|---|---|---|
| [reliability/](./reliability/) | engineer | Resilience patterns, observability, scaling |
| [../srer/observability/](../srer/observability/) | srer | Monitoring, alerting, dashboards, SLO |

## Deployment & operations

| Directory | Role | Description |
|---|---|---|
| [../srer/release/](../srer/release/) | srer | Release coordination, hotfix, rollback |
| [../srer/incident-response/](../srer/incident-response/) | srer | Incident procedures and postmortems |

## Lessons from experience

| Directory | Role | Description |
|---|---|---|
| [lessons/](./lessons/) | engineer | Wins, failures, gotchas from real projects |
| [process/](./process/) | engineer | Team workflows, onboarding, journeys |

## Cross-cutting references

- [SECURITY.md](./SECURITY.md) — Security, supply chain, risk domain
- [../curator/COLLABORATION.md](../curator/COLLABORATION.md) — Team process and collaboration domain
- [./INDEX.md](./INDEX.md) — Full engineer role index