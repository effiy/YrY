---
title: Engineering domain index
tags: [domain-index, engineering, architecture, quality, deployment, data, tools, lessons]
category: root
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles: [engineer, tech-lead, ai-engineer, oncall-sre]
benefit: "All engineering content reachable from a single cross-role index"
acceptance_criteria:
  - "Aggregates engineering files from engineer/, tech-lead/, oncall-sre/"
  - "Organized by subdomain: architecture, quality, deployment, data, tools, lessons"
related:
  - ./INDEX.md
  - ./README.md
  - ./SECURITY.md
  - ../ai-engineer/AI-AND-DATA.md
  - ../knowledge-curator/COLLABORATION.md
---

# Engineering Domain Index

Cross-role aggregation of all architecture, quality, deployment, data, and tools content.

## Architecture & design

| File | Role | Description |
|---|---|---|
| [architecture-design/](./architecture-design/) | engineer | 38 files: API design, system design, design patterns, event schemas |
| [implement-an-api.md](./architecture-design/implement-an-api.md) | engineer | API implementation patterns |
| [architecture/](../tech-lead/architecture/) | tech-lead | Tech selection, maturity models, DORA metrics |
| [decisions/](../tech-lead/decisions/) | tech-lead | 17 ADRs across YiAi, YiVad, YiPet, FDE |

## Quality & testing

| File | Role | Description |
|---|---|---|
| [quality-testing/](./quality-security/) | engineer | 17 files: testing, code review, threat modeling, audits |
| [contract-test-baseline.md](./quality-security/contract-test-baseline.md) | engineer | Contract testing baseline |
| [iterative-self-check.md](./quality-security/iterative-self-check.md) | engineer | Code review self-check methodology |
| [do-a-threat-modeling.md](./quality-security/do-a-threat-modeling.md) | engineer | Threat modeling process |

## Deployment & operations

| File | Role | Description |
|---|---|---|
| [deployment-operations/](./infrastructure/) | engineer | 20 files: CI/CD, releases, DR, containerization |
| [set-up-ci-cd.md](./infrastructure/set-up-ci-cd.md) | engineer | CI/CD pipeline setup |
| [canary-deployment.md](./infrastructure/canary-deployment.md) | engineer | Canary deployment patterns |
| [release/](./oncall-sre/release/) | oncall-sre | Release coordination, hotfix, rollback |
| [incident-response/](./oncall-sre/incident-response/) | oncall-sre | 23 incident procedures and postmortems |

## Data & persistence

| File | Role | Description |
|---|---|---|
| [data-persistence/](./infrastructure/) | engineer | 26 files: databases, migrations, caching, queues |
| [migrate-data.md](./infrastructure/migrate-data.md) | engineer | Data migration patterns |
| [do-a-data-migration.md](./infrastructure/do-a-data-migration.md) | engineer | Data migration process |
| [data/](./ai-engineer/data/) | ai-engineer | Datasets, embeddings, data pipelines |

## Tools & developer experience

| File | Role | Description |
|---|---|---|
| [tools-devx/](./engineering/) | engineer | 37 files: dev tools, bootstrapping, editor config |
| [bootstrap-a-new-project.md](./engineering/bootstrap-a-new-project.md) | engineer | Project bootstrapping guide |
| [observability/](./oncall-sre/observability/) | oncall-sre | Monitoring, alerting, dashboards, SLO |

## Lessons from experience

| File | Role | Description |
|---|---|---|
| [lessons/](./lessons/) | engineer | 49 files: wins, failures, gotchas from real projects |
| [journeys/](./process/) | engineer | 6 cross-cutting scenario guides |

## Cross-cutting references

- [SECURITY.md](./SECURITY.md) — Security, supply chain, risk domain
- [AI-AND-DATA.md](../ai-engineer/AI-AND-DATA.md) — AI/ML and data engineering domain
- [COLLABORATION.md](../knowledge-curator/COLLABORATION.md) — Team process and collaboration domain
- [engineer/INDEX.md](./INDEX.md) — Full engineer role index
- [tech-lead/INDEX.md](../tech-lead/INDEX.md) — Full tech-lead role index