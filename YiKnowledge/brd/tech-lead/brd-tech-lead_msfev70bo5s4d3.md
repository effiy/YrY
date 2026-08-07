---
title: ADR — YiAi multi-provider LLM routing
lifecycle: active
key: brd_brd-tech-lead_msfev70bo5s4d3
tags:
- adr
- yi-ai
- llm
- multi-provider
- routing
adr_id: ADR-Multi-Provider-LLM-Routing
project: yiai
domain: LLM Provider Routing
decision_type: architectural
team_size: 5
status: accepted
owner: YiAi lead owner + architecture team
review_cycle: quarterly
kb_path: tech-lead/decisions/yiai/route-llm-traffic-across-providers.md
context: The frontend model selector was blocked by the backend; cost and availability must be bounded; the multi-provider abstraction needs a unified convergence point. pi-ai vs `llama_index.llms.*`
  choose one of two. 
decision: Adopt the `llama_index.llms.*` abstraction, do not introduce `pi-ai`. The YiPet shared client implements a thin TS layer itself, aligning with the YiAi endpoint
  contract. Available providers >= 4 (Ollama + OpenAI + Anthropic + Google). 
alternatives: B. pi-ai private SDK — depends on a single vendor + cannot switch; C. self-implement provider abstraction — reinventing the wheel + high maintenance cost. A
  selected (`llama_index.llms.*`). 
risks: 1. `llama_index.llms.*` breaking changes — lockfile + quarterly review; 2. eval set regression > 5% — CI gate blocks; 3.
  supply chain CVE — uv.lock + pip-audit + min-release-age; 4. downstream UI integration blocking — Phase 5 priority + mock
  first. 
rollback: routing exception -> switch back to single Ollama provider + fix + gradual retry (1 working day). 
stakeholders: YiAi lead owner + architecture team (decision); CTO (approval); YiVad/YiPet lead owner (downstream consumption); QA
tacit: false
related: []
---

# ADR — YiAi multi-provider LLM routing

**ADR ID**: ADR-Multi-Provider-LLM-Routing  |  **Project**: yiai  |  **Domain**: LLM Provider Routing
**Decision Type**: architectural  |  **Team Size**: 5  |  **Status**: accepted  |  **Owner**: YiAi lead owner + architecture team
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yiai/route-llm-traffic-across-providers.md

## Context
The frontend model selector was blocked by the backend; cost and availability must be bounded; the multi-provider abstraction needs a unified convergence point. pi-ai vs `llama_index.llms.*` choose one of two. 

## Decision
Adopt the `llama_index.llms.*` abstraction, do not introduce `pi-ai`. The YiPet shared client implements a thin TS layer itself, aligning with the YiAi endpoint contract. Available providers >= 4 (Ollama + OpenAI + Anthropic + Google). 

## Alternatives
B. pi-ai private SDK — depends on a single vendor + cannot switch; C. self-implement provider abstraction — reinventing the wheel + high maintenance cost. A selected (`llama_index.llms.*`). 

## Risks & Mitigations
1. `llama_index.llms.*` breaking changes — lockfile + quarterly review; 2. eval set regression > 5% — CI gate blocks; 3. supply chain CVE — uv.lock + pip-audit + min-release-age; 4. downstream UI integration blocking — Phase 5 priority + mock first. 

## Rollback Plan
routing exception -> switch back to single Ollama provider + fix + gradual retry (1 working day). 

## Stakeholders
YiAi lead owner + architecture team (decision); CTO (approval); YiVad/YiPet lead owner (downstream consumption); QA

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai/route-llm-traffic-across-providers.md`
