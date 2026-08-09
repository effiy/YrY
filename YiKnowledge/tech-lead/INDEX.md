---
title: "Tech Lead role index"
tags: [index, tech-lead, adr, architecture, capacity, risk, roadmap]
category: tech-lead
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: index
status: stable
lifecycle: active
roles: [tech-lead]
benefit: "Tech leads find architecture decisions, capacity plans, risk register, and roadmap in one index"
acceptance_criteria:
  - "5 subdirectories with file counts"
  - "Key ADRs and decisions highlighted"
related:
  - ./README.md
  - ../INDEX.md
  - ../README.md
---

# Tech Lead — Role Index

> **As a** tech lead, **I want to** navigate architecture decisions, capacity plans, risk register, and roadmap, **so that** I make informed technical leadership decisions.

## Subdirectories

| Domain | Content | Files |
|---|---|---|
| [architecture/](./architecture/) | Architecture patterns, tech selection evaluations, maturity models, DORA metrics | 7 |
| [decisions/](./decisions/) | ADRs for YiAi (6), YiVad (3), YiPet (3), FDE (4) + stack migration | 17 |
| [capacity/](./capacity/) | Capacity & cost tracking, dependency audits, OSS storage planning | 5 |
| [risk/](./risk/) | Risk register, outage communication, postmortem methodology | 3 |
| [roadmap/](./roadmap/) | Roadmap planning, tech debt management, PoC, SLO definition, feature deprecation, service decommissioning | 9 |

## Key decisions (ADRs)

| ADR | Project | Decision |
|---|---|---|
| [route-llm-traffic-across-providers.md](./decisions/yiai--route-llm-traffic-across-providers.md) | YiAi | Multi-provider LLM traffic routing strategy |
| [llm-multi-provider-rollout.md](./decisions/yiai--llm-multi-provider-rollout.md) | YiAi | LLM multi-provider phased rollout |
| [rag-evaluation-infra.md](./decisions/yiai--rag-evaluation-infra.md) | YiAi | RAG evaluation infrastructure |
| [brd-agent-launch.md](./decisions/yiai--brd-agent-launch.md) | YiAi | BRD agent launch decision |
| [vitest-introduction.md](./decisions/yivad--vitest-introduction.md) | YiVad | Vitest test framework adoption |
| [aicr-phase-port.md](./decisions/yivad--aicr-phase-port.md) | YiVad | AiCR port phases |
| [biome-lint-format.md](./decisions/yipet--biome-lint-format.md) | YiPet | Biome lint/format migration |
| [chrome-manifest-dual-world-boundary.md](./decisions/yipet--chrome-manifest-dual-world-boundary.md) | YiPet | MV3 dual-world boundary design |
| [air-gap-first-for-regulated-clients.md](./decisions/fde--air-gap-first-for-regulated-clients.md) | FDE | Air-gap deployment for regulated clients |
| [two-loop-eval-as-production-gate.md](./decisions/fde--two-loop-eval-as-production-gate.md) | FDE | Dual-loop evaluation as production gate |

## Key architecture evaluations

- [tl-tech-selection-llm-provider.md](./architecture/tl-tech-selection-llm-provider.md) — LLM provider selection
- [tl-tech-selection-react-state-management.md](./architecture/tl-tech-selection-react-state-management.md) — React state management selection
- [tl-tech-debt-yivad-no-test-framework.md](./architecture/tl-tech-debt-yivad-no-test-framework.md) — YiVad test framework tech debt
- [tl-maturity-model-arch-2026-08.md](./architecture/tl-maturity-model-arch-2026-08.md) — Architecture maturity assessment
- [tl-dora-metrics-2026-q2-baseline.md](./architecture/tl-dora-metrics-2026-q2-baseline.md) — DORA metrics baseline

## Key capacity & risk files

- [tl-capacity-cost-2026-08-trend.md](./capacity/tl-capacity-cost-2026-08-trend.md) — Cost trend analysis
- [tl-dependency-audit-yipet-npm-2026-08.md](./capacity/tl-dependency-audit-yipet-npm-2026-08.md) — NPM dependency audit
- [tl-risk-register-single-provider-llm-lock-in.md](./risk/tl-risk-register-single-provider-llm-lock-in.md) — LLM lock-in risk

## Cross-role references

- [../engineer/architecture-design/](../engineer/architecture-design/) — Design patterns referenced in ADRs
- [../engineer/quality-security/](../engineer/quality-security/) — Security decisions
- [../engineer/SECURITY.md](../engineer/SECURITY.md) — Security domain index
- [../ai-engineer/AI-AND-DATA.md](../ai-engineer/AI-AND-DATA.md) — AI & data domain index
