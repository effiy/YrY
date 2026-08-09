---
title: ADR — YiAi multi-provider switch implementation
lifecycle: active
key: brd_brd-tech-lead_msfev6wl4zbh99
tags:
- adr
- yi-ai
- llm
- multi-provider
- rollout
adr_id: ADR-LLM-Multi-Provider-Rollout
project: yiai
domain: LLM Multi-Provider
decision_type: architectural
team_size: 5
status: in_progress
owner: YiAi lead owner
review_cycle: quarterly
kb_path: tech-lead/decisions/yiai/llm-multi-provider-rollout.md
context: "Decision ADR is settled: choose `llama_index.llms.*`, do not introduce `pi-ai`. This ADR tracks implementation: 5-phase gradual rollout + per-phase gate (eval set + supply chain + endpoint contract). Blocks downstream YiVad/YiPet model selector UI."
decision: "5-phase split: Phase 1 supply-chain hardening prerequisite (uv.lock + pip-audit + min-release-age 7d + allowlist); Phase 2 router + provider registry; Phase 3 config + env + gradual rollout; Phase 4 RAG generation-side switch + eval-set gate; Phase 5 endpoint + frontend model selector."
alternatives: B. One-shot switch — no gate, everyone affected when it breaks; C. Dual-track parallel — doubled maintenance cost. A is selected.
risks: 1. `llama_index.llms.*` breaking changes — pin version in lockfile + quarterly review; 2. eval-set baseline drift — quarterly full rerun; 3. indirect provider SDK CVE — pip-audit + min-release-age; 4. recall regression after streaming switch > 5% — eval-set gate blocks + gradual rollback; 5. long-term downstream UI block — Phase 5 priority + frontend mock first.
rollback: "Independent rollback per phase: Phase 1 failure deletes lockfile; Phase 2 deletes router; Phase 3 provider switch back to off; Phase 4 RAG rolls back to old path; Phase 5 endpoint offline + frontend rollback."
stakeholders: YiAi lead owner (decision); CTO (approval); YiVad/YiPet lead owners (downstream consumption); architecture team (supply-chain review)
tacit: false
related: []
type: reference
---

# ADR — YiAi multi-provider switch implementation

**ADR ID**: ADR-LLM-Multi-Provider-Rollout  |  **Project**: yiai  |  **Domain**: LLM Multi-Provider
**Decision Type**: architectural  |  **Team Size**: 5  |  **Status**: in_progress  |  **Owner**: YiAi lead owner
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yiai/llm-multi-provider-rollout.md

## Context
Decision ADR is settled: choose `llama_index.llms.*`, do not introduce `pi-ai`. This ADR tracks implementation: 5-phase gradual rollout + per-phase gate (eval set + supply chain + endpoint contract). Blocks downstream YiVad/YiPet model selector UI.

## Decision
5-phase split: Phase 1 supply-chain hardening prerequisite (uv.lock + pip-audit + min-release-age 7d + allowlist); Phase 2 router + provider registry; Phase 3 config + env + gradual rollout; Phase 4 RAG generation-side switch + eval-set gate; Phase 5 endpoint + frontend model selector.

## Alternatives
B. One-shot switch — no gate, everyone affected when it breaks; C. Dual-track parallel — doubled maintenance cost. A is selected.

## Risks & Mitigations
1. `llama_index.llms.*` breaking changes — pin version in lockfile + quarterly review; 2. eval-set baseline drift — quarterly full rerun; 3. indirect provider SDK CVE — pip-audit + min-release-age; 4. recall regression after streaming switch > 5% — eval-set gate blocks + gradual rollback; 5. long-term downstream UI block — Phase 5 priority + frontend mock first.

## Rollback Plan
Independent rollback per phase: Phase 1 failure deletes lockfile; Phase 2 deletes router; Phase 3 provider switch back to off; Phase 4 RAG rolls back to old path; Phase 5 endpoint offline + frontend rollback.

## Stakeholders
YiAi lead owner (decision); CTO (approval); YiVad/YiPet lead owners (downstream consumption); architecture team (supply-chain review)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai/llm-multi-provider-rollout.md`
