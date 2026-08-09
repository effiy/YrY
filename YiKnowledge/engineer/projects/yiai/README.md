---
title: YiAi project card
tags: [YiAi, project-card, backend, FastAPI]
category: engineer/projects/yiai
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, new-hire]
benefit: "Engineers find YiAi architecture, dev standards, and functional modules with project-specific context"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./architecture.md
  - ./functional-modules.md
  - ./dev-standards.md
  - ../../../product-manager/projects/yiai--project-management.md
  - ../../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md
  - ../../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md
  - ../../../tech-lead/decisions/yiai--pytest-introduction.md
  - ../../../tech-lead/decisions/yiai--rag-evaluation-infra.md
  - ../../../tech-lead/decisions/yiai--brd-agent-launch.md
  - ../../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md
  - ../../../new-hire/onboarding/yiai--onboarding.md
  - ./engineering/claude.md
  - ./engineering/readme.md
  - ../INDEX.md
---

# YiAi

> **As an** engineer, **I want to** access project-specific documentation, **so that** I understand the context and decisions behind each codebase.

> AI + BRD agent. FastAPI backend, Yi family service side.

## Core viewpoints

**YiAi is the single source of truth for all Yi family data, and that centralization is both its strength and its fragility.** Every project (YiPet, YiVad) depends on YiAi for chat, file storage, sessions, and knowledge base access. This eliminates data duplication and keeps business logic in one place, but it means YiAi downtime takes down the entire Yi family. The degradation countermeasures (fail-fast on MongoDB unavailability, 503 on Ollama unavailability) are documented but not sufficient for production reliability.

**The RPC envelope pattern is more valuable than any individual feature.** The `{module_name, method_name, parameters}` envelope allows any client to invoke any backend method without per-endpoint routing. This is why YiPet and YiVad can share the same backend without duplicating API surface. The trade-off is that parameter name contracts must be enforced across three codebases, and a single mismatch (e.g., `query` vs `filter`) silently breaks functionality.

**The absence of test coverage is the project's largest technical debt item.** The architecture is cleanly layered (domain/services/server), but with zero tests, every refactor carries unknown regression risk. The pytest ADR exists but has not been implemented. The first production incident caused by a refactored domain function will make the case for tests more forcefully than any ADR ever could.

**The knowledge watcher's polling fallback is a lesson in platform-specific failure modes.** macOS FSEvents silently drops events on this machine, so the watcher uses apscheduler polling every 5 seconds. This is a reminder that platform-level APIs are not universally reliable, and every file-watching feature needs a polling fallback. The polling interval is a trade-off between responsiveness and CPU usage.

**MongoDB as the sole persistent store with no cache layer is a single point of failure.** When MongoDB is unreachable, every feature (chat, files, sessions, knowledge base) fails. There is no read cache, no write buffer, and no graceful degradation beyond returning errors. A read-through cache for frequently accessed knowledge files would be the highest-ROI reliability improvement.

## project card

| field | value |
|---|---|
| positioning | business AI assistant + BRD automation agent |
| main tech stack | see [architecture-summary.md](./architecture.md) / `engineering/claude.md` |
| current primary owner | see [project-management-summary.md](../../../product-manager/projects/yiai--project-management.md) section current primary owner |
| business domain | overseas service domain, after-sales business, BRD approval flow |

## subdirectory

- [architecture-summary.md](./architecture.md) — architecture overview (tech stack / module boundary / data flow / degradation / anti-pattern)
- [functional-modules-summary.md](./functional-modules.md) — functional modules list (10 domains / 7 services / 13 routings / data / shared / models)
- [dev-standards-summary.md](./dev-standards.md) — development standards (naming / layered / RPC field contract / SSE / config / commit / lint gap)
- [project-management-summary.md](../../../product-manager/projects/yiai--project-management.md) — project management (iteration cadence / deliverables / onboarding / handoff / weekly report daily report retrospective / cross-project links)
- [adr-multi-provider-llm-routing.md](../../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) — ADR: multi-provider LLM routing chooses `llama_index.llms.*`, does not introduce `pi-ai`
- [adr-llm-multi-provider-rollout.md](../../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) — ADR (implementation): multi-provider 5-stage gradual rollout (supply-chain hardening prerequisite + router + config gradual rollout + RAG generation side + endpoint / frontend model selector)
- [adr-pytest-introduction.md](../../../tech-lead/decisions/yiai--pytest-introduction.md) — ADR: introduce pytest + httpx + pytest-asyncio + coverage, directory `tests/{unit,integration,eval}`
- [adr-rag-evaluation-infra.md](../../../tech-lead/decisions/yiai--rag-evaluation-infra.md) — ADR: RAG evaluation infrastructure built on llama-datasets + ragas 4 metrics + 50 documentation bilingual eval set + CI recall rollback > 5% block
- [adr-brd-agent-launch.md](../../../tech-lead/decisions/yiai--brd-agent-launch.md) — ADR: BRD agent 5-stage launch methodology (structure contract first + RAG > long prompt + streaming + editable stream back + gradual rollout + feedback closed loop)
- [adr-knowledge-watcher-deployment.md](../../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md) — ADR (implementation): Knowledge Watcher implementation (apscheduler polling + incremental index + debounce + failure retry + monitoring; bypass macOS FSEvents event loss)
- [onboarding.md](../../../new-hire/onboarding/yiai--onboarding.md) — new-hire onboarding
- [stories/](./stories/) — business requirement content (Story/Scene + BRD section)
  - [ai-chat-function/](./stories/ai-chat-function/) — AI chat function
    - [user-send-message/](./stories/ai-chat-function/user-send-message/) — user sends a message
    - [conversation-history-management/](./stories/ai-chat-function/conversation-history-management/) — conversation history management
  - [overseas-after-sales-ai-brd-agent/](./stories/overseas-after-sales-ai-brd-agent/) — AI BRD agent
    - [brd-draft-generation/](./stories/overseas-after-sales-ai-brd-agent/brd-draft-generation/) — BRD draft generation
    - [multilingual-brd/](./stories/overseas-after-sales-ai-brd-agent/multilingual-brd/) — multilingual BRD
    - [brd-approval-flow/](./stories/overseas-after-sales-ai-brd-agent/brd-approval-flow/) — BRD approval flow
- [engineering/](./engineering/) — project engineering documentation mirror
  - `claude.md` — project CLAUDE.md mirror
  - `readme.md` — project README.md mirror

## Anti-patterns

- **Relying on the RPC envelope for every cross-project call without documenting parameter contracts.** The envelope is universal, but the parameter names are not self-documenting. `filter` vs `query`, `target_file` vs `path`, `cname` vs `collection_name` -- each mismatch has caused real bugs. The contract table in `engineering/claude.md` must be consulted before every cross-project integration.

- **Deploying YiAi without health checks and monitoring for MongoDB connectivity.** MongoDB unavailability causes all features to fail. The `/health/observer` endpoint exists, but deploying without automated health checks and alerting means MongoDB outages will be discovered by users, not operators. The degradation countermeasures document failure modes but do not automate recovery.

- **Adding new domain logic directly to routes or services without creating a dedicated `domain/` sub-package.** The architecture direction is toward modularization. New features should land in `domain/<name>/` with a clear `__init__.py` public API, then be wrapped by `services/<name>/`. Scattering handlers across existing files creates the "god module" anti-pattern and makes the codebase progressively harder to navigate.

- **Skipping the `__init__.py` public API surface when creating new domain modules.** The `__init__.py` file in `domain/files/` and `domain/wework/` re-exports the public callable contract. Skipping this file forces callers to import from internal implementation files, creating tight coupling and making future refactors impossible. Every domain module must have an `__init__.py` that defines its public API.

- **Assuming the dual-write persistence model provides reliable backup.** The dual-write pattern (disk primary, MongoDB backup) is best-effort, not transactional. The MongoDB backup can lag behind or fail silently. For features requiring reliable persistence (e.g., session history), the dual-write model provides a fallback but not a guarantee. Critical data should have additional backup or replication mechanisms.
