---
title: Knowledge Base Health Dashboard
tags: [governance, dashboard, metrics, curator, health]
category: curator/governance
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [curator]
benefit: "Curators and stakeholders see the knowledge base health at a glance: file counts, content maturity, cross-reference integrity, and known gaps"
acceptance_criteria:
  - "File counts per role directory"
  - "Content maturity breakdown (active vs planned vs stub)"
  - "Cross-reference integrity status"
  - "Known gaps listed with owners"
related:
  - ./governance.md
  - ./review-log.md
  - ../../INDEX.md
  - ../../README.md
---

# Knowledge Base Health Dashboard

> **Last updated: 2026-08-21 (session update).** Snapshot of YiKnowledge health across all 7 role directories.

## File counts by role

| Role | Files | With content | README only | Content maturity |
|---|---|---|---|---|
| [engineer/](../../engineer/) | 27 | 18 | 9 | 67% |
| [executiver/](../../executiver/) | 27 | 24 | 3 | 89% |
| [leader/](../../leader/) | 35 | 26 | 9 | 74% |
| [aier/](../../aier/) | 11 | 7 | 4 | 64% |
| [producter/](../../producter/) | 20 | 9 | 11 | 45% |
| [srer/](../../srer/) | 7 | 3 | 4 | 43% |
| [curator/](../../curator/) | 16 | 7 | 9 | 44% |
| root | 5 | 5 | 0 | 100% |
| **Total** | **144** | **95** | **49** | **66%** |

> "With content" = files that are not just README.md placeholders. "README only" = directories with only a README.md describing planned content.

## Cross-reference integrity

| Metric | Status |
|---|---|
| Dead links in project READMEs → subdirectory files | 0 (15 fixed 2026-08-21) |
| Dead links in YiAi README → ADR files | 0 (6 created 2026-08-21) |
| Dead links in leader/architecture README → assessments | 0 (6 created 2026-08-21) |
| Dead links in leader/decisions README → project ADRs | 0 (12 created across YiAi/YiVad/YiPet) |
| Dead links in YiKnowledge → project CLAUDE.md | 0 (verified 2026-08-21) |

## ADR coverage

| Project | ADRs | Status |
|---------|------|--------|
| [YiAi](../../leader/decisions/yiai/) | 6 | Done (route-llm, rollout, pytest, rag-eval, brd-agent, knowledge-watcher) |
| [YiVad](../../leader/decisions/yivad/) | 3 | Done (aicr-port, vitest, vite-to-rsbuild) |
| [YiPet](../../leader/decisions/yipet/) | 3 | Done (biome, aicr-port, dual-world) |
| [FDE](../../leader/decisions/fde/) | 0 | Planned (4 ADRs — external project, limited context) |

## Architecture assessments

| File | Status |
|---|---|
| design-architecture-decision.md | Done (ADR template) |
| tl-tech-selection-llm-provider.md | Done (2026-08-21) |
| tl-tech-selection-react-state-management.md | Done (2026-08-21) |
| tl-maturity-model-arch-2026-08.md | Done (2026-08-21) |
| tl-maturity-model-docs-2026-08.md | Done (2026-08-21) |
| tl-dora-metrics-2026-q2-baseline.md | Done (2026-08-21) |
| tl-tech-debt-yivad-no-test-framework.md | Done (2026-08-21) |

## Project documentation coverage

| Project | README | Architecture | Modules | Dev Standards | PM | Onboarding |
|---------|--------|-------------|---------|--------------|----|-----------|
| YiAi | Done | Done | Done | Done | Done | Done |
| YiVad | Done | Done | Done | Done | Done | Done |
| YiPet | Done | Done | Done | Done | Done | Done |

## Known gaps

| Gap | Owner | Priority | Notes |
|---|---|---|---|
| producter/ role has 9 content files | producter | medium | PRD template, 4 frameworks (RICE/ICE, JTBD, Kano, MoSCoW, OKR), 3 PM files created. 7 framework files still planned. |
| srer/ role has 3 content files | srer | medium | Incident response + release procedures done. Observability still planned. |
| aier/ role has 7 content files | aier | low | RAG patterns, agent architecture, prompt engineering, LLM comparison, plus agent-harness-plugin done. Foundations + ML still README-only. |
| FDE ADRs (4) not created | leader | low | FDE is not in this monorepo — limited context |
| bugs/ directory empty | engineer | low | No bug reports landed yet from YiPet's bug reporting pipeline |
| engineer/build/ and engineer/ship/ thin | engineer | low | Cross-project RPC protocol reference exists. Remaining patterns planned. |

## Recent improvements (2026-08-21 session)

| Change | Impact |
|---|---|
| 6 YiAi ADRs created | All YiAi README `related` links now resolve |
| 3 YiVad ADRs created | YiVad decisions directory populated |
| 3 YiPet ADRs created | YiPet decisions directory populated |
| 6 architecture assessments created | All leader/architecture README links now resolve |
| 9 project docs created (arch/modules/standards × 3 projects) | All project README subdirectory links now resolve |
| 3 project management files created (YiAi/YiVad/YiPet) | producter/projects/ now has per-project PM docs |
| 15 broken cross-references fixed | Zero dead links in project README → subdirectory references |
| 4 producter frameworks created (JTBD, Kano, MoSCoW, OKR) | producter/ now has 5 framework files |
| 4 aier content files created (RAG patterns, agent architecture, prompt engineering, LLM comparison) | aier/ content maturity: 43% → 64% |
| Health dashboard updated | Reflects current state (144 files, 66% content maturity) |

## Next priorities

1. **producter/ frameworks** — Create JTBD, RICE/ICE, Kano framework files
2. **srer/ observability** — Create observability procedures
3. **aier/ content** — Deepen AI enablement role content
4. **FDE ADRs** — Create when FDE project context is available
5. **bugs/ seeding** — Land first bug report from YiPet's reporting pipeline