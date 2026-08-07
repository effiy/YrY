---
title: Tech Lead — Architecture Decisions / Tech Selection / Capacity / Roadmap / Risk Workspace
aliases: [tech-lead-readme, tech-lead-index]
tags: [category, tech-lead, architecture, adr, capacity, roadmap, risk]
category: tech-lead
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: leaf-readme
status: stable
lifecycle: reference
review_cycle: monthly
roles: [tech-lead, engineer, ai-engineer, release-manager]
benefit: "Architecture decisions / ADR / tech selection / capacity planning / roadmap / risk registry centralized; cross-sub-project technical decisions are traceable"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../INDEX.md
  - ../README.md
  - ../engineer/quality-security/README.md
  - ../tech-lead/README.md
---

# Tech Lead — Architecture Decisions / Tech Selection / Capacity / Roadmap / Risk Workspace

> **As a** tech-lead, **I want to** centrally collect this project's architecture decisions, ADR collection, tech selection, capacity planning, roadmap, and risk registry, **so that** cross-sub-project (YiAi / YiVad / YiPet) technical decisions are traceable and new tech-leads do not re-derive existing conclusions.

> The Tech Lead perspective runs through the full chain of "write code → select → decide → roadmap → risk." This directory is the SSOT; sub-projects' (YiAi/YiVad/YiPet) engineering/claude.md references decisions here.

## Summary

- 5 sub-directories: `architecture/` (architecture principles) / `capacity/` (capacity and FinOps) / `decisions/` (ADR collection, organized by `<project>/` subtree) / `roadmap/` (roadmap and quarterly planning) / `risk/` (risk registry + postmortem)
- ADR template at [../knowledge-curator/templates/adr.md](../knowledge-curator/templates/adr.md)
- 9+ ADRs already: see `decisions/<project>/` subtree (YiAi multi-provider LLM routing / pytest adoption / YiVad Vite→Rsbuild / YiPet React 15→18 etc.)
- Capacity planning at [./capacity/](./capacity/) — includes FinOps / cost ceiling / SLO
- Roadmap at [./roadmap/](./roadmap/) — quarterly planning / priority / thinking-model priority
- Risk registry at [./risk/](./risk/) — postmortem template / risk assessment / retrospective

## Core viewpoints

- **ADR is the decision SSOT** — writing an ADR is not documentation burden, it is a gift to "future reviewers who won't re-derive"; each ADR contains Context / Decision / Consequences
- **Capacity planning links with FinOps** — tech-lead decides not only tech but also cost ceilings; links with oncall-sre/capacity
- **Roadmap is a promise** — quarterly roadmap is the tech-lead's promise to PM/executive; no silent changes
- **Risk registry upfront** — postmortem is after the fact; pre-incident risk assessment goes to `risk/`, post-incident retrospective goes to `risk/postmortem/`

## Key information

### Sub-directories

| Sub-directory | Content | Key leaf |
|---|---|---|
| `architecture/` | Architecture principles / architecture evolution / dual-world boundary | — |
| `capacity/` | FinOps / cost ceiling / SLO / capacity assessment | — |
| `decisions/` | ADR collection (organized by `<project>/` subtree) | `decisions/yiai/route-llm-traffic-across-providers.md` |
| `roadmap/` | Roadmap / quarterly planning / priority / thinking-model | — |
| `risk/` | Risk registry / postmortem / retro template | `risk/write-a-postmortem.md` |

### Key ADR index

- [decisions/yiai/route-llm-traffic-across-providers.md](./decisions/yiai/route-llm-traffic-across-providers.md) — YiAi multi-provider LLM traffic routing
- [decisions/yipet/chrome-manifest-dual-world-boundary.md](./decisions/yipet/chrome-manifest-dual-world-boundary.md) — YiPet MV3 dual-world boundary
- [decisions/yipet/biome-lint-format.md](./decisions/yipet/biome-lint-format.md) — YiPet ESLint → Biome 2.5
- [decisions/yivad/vitest-introduction.md](./decisions/yivad/vitest-introduction.md) — YiVad Vitest adoption

### FDE Practice ADR (cross-client reuse)

- [decisions/fde/delta-as-a-contract.md](./decisions/fde/delta-as-a-contract.md) — The Delta as a contract, not a feature
- [decisions/fde/air-gap-first-for-regulated-clients.md](./decisions/fde/air-gap-first-for-regulated-clients.md) — compliance-driven default to air-gap-first
- [decisions/fde/two-loop-eval-as-production-gate.md](./decisions/fde/two-loop-eval-as-production-gate.md) — double-loop eval as production release gate
- [decisions/fde/enterprise-rag-hybrid-search-mandatory.md](./decisions/fde/enterprise-rag-hybrid-search-mandatory.md) — enterprise RAG mandates hybrid search

## Action recommendations

1. **New decisions go through ADR**: copy [../knowledge-curator/templates/adr.md](../knowledge-curator/templates/adr.md) as a starting point; land at `decisions/<project>/<decision-name>.md`
2. **Roadmap synced quarterly**: any roadmap change must go through `roadmap/` update + notify PM/executive
3. **Risk registered upfront**: identify new risks via `risk/` registry; post-incident via `risk/write-a-postmortem.md`
4. **Capacity assessment links with FinOps**: new services must run `capacity/` assessment before launch + set cost ceiling
5. **Cross-sub-project decision alignment**: YiAi/YiVad/YiPet sub-project `engineering/claude.md` must reference this directory's decisions, not duplicate content



- **Silently changing the roadmap** — consequence: PM/executive lose trust; roadmap is a promise, changes must be synced
- **ADR written but not maintained** — consequence: decision context lost; future reviewers re-derive deprecated solutions
- **postmortem not registered as risk** — consequence: same-class failures repeat; post-incident must run `risk/` registry + improvements
- **Capacity assessment omitted** — consequence: cost overruns after launch; must run `capacity/` assessment + set ceiling

## Related

- Same kind (role directories): [../engineer/quality-security/README.md](../README.md) / [../tech-lead/README.md](../README.md) / [../engineer/README.md](../engineer/README.md)
- Upstream: [../README.md](../README.md) / [../INDEX.md](../INDEX.md)
- Downstream: [../knowledge-curator/templates/adr.md](../knowledge-curator/templates/adr.md) — ADR template
- Downstream: [../ai-engineer/README.md](../ai-engineer/README.md) — AI engineering perspective
