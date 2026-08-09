---
title: "Engineer role index"
tags: [index, engineer, architecture, quality, security, infrastructure, engineering, process, lessons, projects]
category: engineer
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles: [engineer, new-hire]
benefit: "Engineers find content by problem domain within 2 hops"
acceptance_criteria:
  - "7 problem-domain subdirectories with descriptive names"
  - "File counts per domain"
  - "Max 3 directory levels"
related:
  - ./README.md
  - ../INDEX.md
  - ../README.md
  - ./SECURITY.md
  - ../ai-engineer/AI-AND-DATA.md
  - ../knowledge-curator/COLLABORATION.md
---

# Engineer — Role Index

> **As an** engineer, **I want to** find content by the problem I'm solving, **so that** I reach the right file within 2 hops.

## Problem domains (Build → Ship → Run → Learn)

| Phase | Domain | Solves | Files |
|---|---|---|---|
| BUILD | [architecture-design/](./architecture-design/) | How do I design this system? | 40 |
| BUILD | [engineering/](./engineering/) | How do I build features (AI + tools)? | 56 |
| SHIP | [quality-security/](./quality-security/) | How do I test, secure, and verify? | 34 |
| SHIP | [infrastructure/](./infrastructure/) | How do I ship, run, and manage data? | 50 |
| RUN | [process/](./process/) | How do we work together? | 50 |
| LEARN | [lessons/](./lessons/) | What can I learn from past experience? | 50 |
| LEARN | [projects/](./projects/) | Project-specific docs (YiAi, YiVad, YiPet) | 137 |

## Quick reference by task

| I want to... | Go to |
|---|---|
| Design an API | [architecture-design/implement-an-api.md](./architecture-design/implement-an-api.md) |
| Set up CI/CD | [infrastructure/set-up-ci-cd.md](./infrastructure/set-up-ci-cd.md) |
| Write tests | [quality-security/contract-test-baseline.md](./quality-security/contract-test-baseline.md) |
| Review code | [quality-security/iterative-self-check.md](./quality-security/iterative-self-check.md) |
| Harden dependencies | [quality-security/harden-supply-chain.md](./quality-security/harden-supply-chain.md) |
| Deploy safely | [infrastructure/canary-deployment.md](./infrastructure/canary-deployment.md) |
| Migrate a database | [infrastructure/migrate-data.md](./infrastructure/migrate-data.md) |
| Run a retrospective | [process/run-a-retrospective.md](./process/run-a-retrospective.md) |
| Onboard a new engineer | [process/mentor-and-grow-engineers.md](./process/mentor-and-grow-engineers.md) |
| Build a RAG pipeline | [engineering/inline-citation-rag.md](./engineering/inline-citation-rag.md) |
| Check common gotchas | [lessons/](./lessons/) or [process/check-engineering-gotchas.md](./process/check-engineering-gotchas.md) |
| Bootstrap a new project | [engineering/bootstrap-a-new-project.md](./engineering/bootstrap-a-new-project.md) |
| Learn from failures | [lessons/](./lessons/) (failure-* and bug-* prefixed files) |

## Journeys (cross-cutting scenarios)

Start here when you don't know which domain to look in:

- [check-engineering-gotchas.md](./process/check-engineering-gotchas.md) — Common pitfalls
- [harden-supply-chain.md](./process/harden-supply-chain.md) — Supply chain security end-to-end
- [deploy-to-an-air-gapped-environment.md](./process/deploy-to-an-air-gapped-environment.md) — Air-gap deployment
- [diagnose-org-productivity.md](./process/diagnose-org-productivity.md) — Org productivity diagnosis
- [handle-outage-communication.md](./process/handle-outage-communication.md) — Outage communication
- [operate-as-a-forward-deployed-engineer.md](./process/operate-as-a-forward-deployed-engineer.md) — FDE operations

## Merged roles

These former standalone roles now live in engineer/ problem domains:

| Former role | Now in |
|---|---|
| accessibility-engineer | [quality-security/](./quality-security/) |
| api-designer | [architecture-design/](./architecture-design/) |
| code-reviewer | [quality-security/](./quality-security/) |
| data-engineer | [infrastructure/](./infrastructure/) |
| designer | [architecture-design/](./architecture-design/) |
| devops | [infrastructure/](./infrastructure/) |
| performance-engineer | [quality-security/](./quality-security/) |
| qa-engineer | [quality-security/](./quality-security/) |
| security-engineer | [quality-security/](./quality-security/) |
| technical-writer | [engineering/](./engineering/) |

## Cross-role references

- [../tech-lead/](../tech-lead/) — Architecture decisions, capacity, risk, roadmap
- [../ai-engineer/](../ai-engineer/) — AI foundations, methodology, platform
- [../product-manager/](../product-manager/) — PM frameworks, discovery, delivery
- [./SECURITY.md](./SECURITY.md) — Security domain index
- [../ai-engineer/AI-AND-DATA.md](../ai-engineer/AI-AND-DATA.md) — AI & data domain index
- [../knowledge-curator/COLLABORATION.md](../knowledge-curator/COLLABORATION.md) — Collaboration domain index