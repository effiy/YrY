---
title: success case study / Wins
aliases: [wins-leaf-readme, wins-readme]
tags: [leaf, lessons, wins]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
---

# success case study / Wins

> **As an** engineer, **I want to** README, **so that** success is reproducible.

> Success case studies of product release, technology implementation, and process optimization. Includes reusable experience and quantitative outcomes.

## Included scope

- product release success case studies (with reusable experience)
- technology implementation success (architecture selection, performance optimization)
- process optimization success (efficiency improvement, collaboration improvement)
- quarterly high-value accumulation selection

## file type and naming

- `*-win.md`: single-point success case study
- `*-summary.md`: collection of success case studies on a topic
- Naming uses English kebab-case

## Already included

| file | content | status |
|---|---|---|
| [yivad-aicr-phase-port.md](win-yivad-aicr-phase-port.md) | YiVad aicr 7-stage port methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-brd-agent-launch.md](win-yiai-brd-agent-launch.md) | YiAi BRD agent launch (authoring time -79%)  | active |
| [yipet-stack-migration-win.md](win-yipet-stack-migration.md) | YiPet stack migration (React 15->18.3 + Bootstrap->AntD + ESLint->Biome; lint -91%)  | active |
| [yry-vite-to-rsbuild-migration-win.md](win-yry-vite-to-rsbuild-migration.md) | YrY Vite->Rsbuild migration (dev 90s->8s / HMR 12%->0.5%)  | active |
| [yiai-rag-hybrid-retrieval-win.md](win-yiai-rag-hybrid-retrieval.md) | YiAi RAG hybrid retrieval (QueryFusionRetriever + LLMRerank + inline citation + scope)  | active |
| [yivad-leaf-view-leaves-ssot-win.md](win-yivad-leaf-view-leaves-ssot.md) | YiVad leaf view layer 28 leaves SSOT methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-supply-chain-hardening-win.md](win-yiai-supply-chain-hardening.md) | YiAi supply-chain hardening methodology (STALE — not landed; reference architecture)  | reference |
| [yivad-vitest-phase-one-win.md](win-yivad-vitest-phase-one.md) | YiVad Vitest Phase 1 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-llm-phase-two-win.md](win-yiai-llm-phase-two.md) | YiAi LLM Phase 2 methodology (STALE — not landed; reference architecture)  | reference |
| [yivad-vitest-phase-two-win.md](win-yivad-vitest-phase-two.md) | YiVad Vitest Phase 2 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-llm-phase-three-win.md](win-yiai-llm-phase-three.md) | YiAi LLM Phase 3 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-llm-phase-four-win.md](win-yiai-llm-phase-four.md) | YiAi LLM Phase 4 methodology (STALE — not landed; reference architecture)  | reference |
| [yivad-vitest-phase-three-win.md](win-yivad-vitest-phase-three.md) | YiVad Vitest Phase 3 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-llm-phase-five-win.md](win-yiai-llm-phase-five.md) | YiAi LLM Phase 5 methodology (STALE — not landed; reference architecture)  | reference |
| [yivad-vitest-phase-four-win.md](win-yivad-vitest-phase-four.md) | YiVad Vitest Phase 4 methodology (STALE — not landed; reference architecture)  | reference |
| [yipet-aicr-phase-one-win.md](win-yipet-aicr-phase-one.md) | YiPet aicr Phase 1 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-knowledge-watcher-win.md](win-yiai-knowledge-watcher.md) | YiAi Knowledge Watcher implementation (apscheduler 30s polling + SHA-256 incremental hash + 30s debounce + 3-failure exponential backoff + dead-letter queue + full-volume rebuild Sunday 02:00 fallback + bypass macOS FSEvents; 0 incident; latency < 60s)  | active |
| [yivad-shared-client-vendor-win.md](win-yivad-shared-client-vendor.md) | YiVad shared client vendor methodology (STALE — not landed; reference architecture)  | reference |
| [yipet-aicr-phase-two-win.md](win-yipet-aicr-phase-two.md) | YiPet aicr Phase 2 methodology (STALE — not landed; reference architecture)  | reference |
| [yipet-aicr-phase-three-win.md](win-yipet-aicr-phase-three.md) | YiPet aicr Phase 3 methodology (STALE — not landed; reference architecture)  | reference |
| [yipet-aicr-phase-four-win.md](win-yipet-aicr-phase-four.md) | YiPet aicr Phase 4 methodology (STALE — not landed; reference architecture)  | reference |
| [yipet-aicr-phase-five-win.md](win-yipet-aicr-phase-five.md) | YiPet aicr Phase 5 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-pytest-phase-one-win.md](win-yiai-pytest-phase-one.md) | YiAi pytest Phase 1 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-pytest-phase-two-win.md](win-yiai-pytest-phase-two.md) | YiAi pytest Phase 2 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-pytest-phase-three-win.md](win-yiai-pytest-phase-three.md) | YiAi pytest Phase 3 methodology (STALE — not landed; reference architecture)  | reference |
| [yiai-pytest-phase-four-win.md](win-yiai-pytest-phase-four.md) | YiAi pytest Phase 4 methodology (STALE — not landed; reference architecture)  | reference |

## To be included

- AI launch case study
- performance optimization success case study
- process improvement success case study

## Recommended writing structure

1. background (business scenario, target)
2. solution (tech stack, architecture, process)
3. key success factors
4. quantitative outcomes
5. reusable experience
6. subsequent evolution

## Related leaf

- [../failures/](.) — failure comparison
- [../gotchas/](.) — pitfall comparison
- [../../../product-manager/delivery/retrospective-meeting.md](../../product-manager/delivery/retrospective-meeting.md) — retrospective meeting
- [../../../knowledge-curator/templates/retrospective.md](../../product-manager/delivery/retrospective.md) — retrospective template
- [../../processes/review-lessons.md](../process/review-lessons.md) — scenario entry
