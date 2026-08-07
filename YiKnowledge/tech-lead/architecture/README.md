---
title: Tech Lead — Architecture
tags: [leaf, tech-lead, architecture, tech-selection, maturity-model, tech-debt]
category: tech-lead/architecture
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: leaf-readme
status: stable
lifecycle: active
review_cycle: quarterly
roles: [tech-lead, engineer]
benefit: "Tech leads find architecture decision frameworks, maturity models, and tech selection guides in one place"
acceptance_criteria:
  - "Architecture decision framework and ADR template accessible"
  - "Maturity model assessments documented"
  - "Tech selection and tech debt tracking present"
related:
  - ../INDEX.md
  - ../decisions/
  - ../../engineer/architecture-design/
---

# Tech Lead — Architecture

> **As a** tech lead, **I want to** find architecture decision frameworks and tech selection guides, **so that** I can make consistent, well-documented architectural choices.

## Architecture decisions

| File | Description |
|---|---|
| [design-architecture-decision.md](./design-architecture-decision.md) | ADR framework and 12-section template |
| [tl-tech-selection-llm-provider.md](./tl-tech-selection-llm-provider.md) | LLM provider selection criteria |
| [tl-tech-selection-react-state-management.md](./tl-tech-selection-react-state-management.md) | React state management selection |

## Maturity & health

| File | Description |
|---|---|
| [tl-maturity-model-arch-2026-08.md](./tl-maturity-model-arch-2026-08.md) | Architecture maturity assessment |
| [tl-maturity-model-docs-2026-08.md](./tl-maturity-model-docs-2026-08.md) | Documentation maturity assessment |
| [tl-dora-metrics-2026-q2-baseline.md](./tl-dora-metrics-2026-q2-baseline.md) | DORA metrics baseline |

## Tech debt

| File | Description |
|---|---|
| [tl-tech-debt-yivad-no-test-framework.md](./tl-tech-debt-yivad-no-test-framework.md) | YiVad test framework tech debt |

## Cross-references

- [../decisions/](../decisions/) — Project-level ADRs (YiAi, YiVad, YiPet, FDE)
- [../../engineer/architecture-design/](../../engineer/architecture-design/) — System design patterns