---
title: Engineer role — problem-domain index
tags: [engineer, role, index]
category: engineer
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, new-hire]
benefit: "Engineers find content by problem domain within 2 hops"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ./INDEX.md
  - ../README.md
  - ../INDEX.md
---

# Engineer

> **As an** engineer, **I want to** find content by the problem I'm solving, **so that** I reach the right file within 2 hops.

> Covers architecture, quality, security, deployment, data, collaboration, tools, AI/ML, lessons, and cross-cutting journeys. Absorbed 11 former standalone roles (accessibility-engineer, api-designer, code-reviewer, data-engineer, designer, devops, performance-engineer, qa-engineer, security-engineer, technical-writer, release-manager) in 2026-08-06. Stale duplicate directories (data-engineer, devops, technical-writer) deleted 2026-08-07.

## Problem domains (7 → Build/Ship/Run/Learn)

| Phase | Domain | Content | Files |
|---|---|---|---|
| BUILD | [architecture-design/](./architecture-design/) | System design, API design, event-driven architecture, micro-frontends, staged port methodology | ~40 |
| BUILD | [engineering/](./engineering/) | AI/ML patterns, dev tools, DX, dependency management, cost optimization, vendor relationships | ~56 |
| SHIP | [quality-security/](./quality-security/) | Testing, QA, accessibility, performance, code review, supply chain, zero trust, secrets, audit logging | ~34 |
| SHIP | [infrastructure/](./infrastructure/) | CI/CD, deployment, feature flags, DB migration, data patterns, disaster recovery, runbooks | ~50 |
| RUN | [process/](./process/) | Team workflows, meetings, retros, knowledge sharing, mentoring, journeys, cross-cutting scenarios | ~50 |
| LEARN | [lessons/](./lessons/) | Wins, failures, gotchas, bugs — flat with type prefix (win-*, failure-*, gotcha-*, bug-*) | ~50 |
| LEARN | [projects/](./projects/) | Per-project engineering docs: YiAi, YiVad, YiPet | ~137 |

## Subdirectory descriptions

### architecture-design (BUILD)
System architecture patterns and design decisions. Covers: anti-corruption layer, API gateway, BFF, CQRS, event sourcing, saga, strangler fig, cell-based architecture, micro-frontends, SSE streaming, RPC envelope, staged port methodology, domain-driven design, team topologies.

### engineering (BUILD)
AI/ML engineering + developer tools and experience. Covers: eval-driven development, inline citation RAG, vector indexes, observability, rate limiting, load shedding, CDC, dual-world boundary, Biome/ESLint/Prettier, Claude Code tips, dependency audits, cost reduction, shared client design, compliance accreditation, site surveys, team bootstrapping.

### quality-security (SHIP)
Code quality, testing, security, and supply chain integrity. Covers: contract testing, chaos engineering, accessibility audits, code review, load testing, performance audits, threat modeling, dependency adoption, supply chain hardening, audit logging, zero trust, secrets management, vendor security assessments, CVE response.

### infrastructure (SHIP)
CI/CD, deployment, data persistence, and production operations. Covers: canary/blue-green deployment, feature flags, CI/CD setup, branching strategy, database migration, read replicas, outbox pattern, idempotency, connection pooling, disaster recovery, runbooks, data quality, data compliance, capacity planning.

### process (RUN)
Team collaboration, knowledge sharing, and cross-cutting journeys. Covers: daily standups, retrospectives, pair programming, pre-mortems, stakeholder mapping, mentoring, knowledge transfer, project handoffs, oncall rotation, iteration PM handbook, productivity metrics, cross-cutting scenario entries.

### lessons (LEARN)
Engineering lessons learned — wins, failures, gotchas, bugs. All files are flat with type prefix. Reference `check-engineering-gotchas.md` in process/ and `review-lessons.md` in process/ for guided review.

### projects (LEARN)
Per-project documentation mirrors: YiAi (AI + BRD agent), YiVad (main web app), YiPet (browser extension). Each has engineering docs, architecture overview, and functional modules. May exceed 3-level depth for story hierarchies.

## Frequently referenced

- [check-engineering-gotchas.md](./process/check-engineering-gotchas.md) — cross-cutting gotcha reference
- [harden-supply-chain.md](./process/harden-supply-chain.md) — supply chain hardening journey
- [knowledge-contributor-charter.md](./process/knowledge-contributor-charter.md) — KB contribution charter
- [iteration-pm-handbook.md](./process/iteration-pm-handbook.md) — iteration PM full process
- [claude-code-tips.md](./engineering/claude-code-tips.md) — Claude Code usage experience
- [share-client-across-projects.md](./engineering/share-client-across-projects.md) — shared client architecture

## Related

- [INDEX.md](./INDEX.md) — engineer role full file listing
- [../README.md](../README.md) — knowledge base overview
- [../INDEX.md](../INDEX.md) — full-library index
- [../knowledge-curator/governance/governance.md](../knowledge-curator/governance/governance.md) — KB governance
