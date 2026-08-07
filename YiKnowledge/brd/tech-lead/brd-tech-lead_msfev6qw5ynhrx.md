---
title: ADR — YiAi BRD Agent 5-phase launch methodology
lifecycle: active
key: brd_brd-tech-lead_msfev6qw5ynhrx
tags:
- adr
- yi-ai
- brd-agent
- 5-phase
adr_id: ADR-Brd-Agent-Launch
project: yiai
domain: BRD Agent Launch
decision_type: architectural
team_size: 5
status: accepted
owner: YiAi lead owner
review_cycle: quarterly
kb_path: tech-lead/decisions/yiai/brd-agent-launch.md
context: YiAi needs to auto-generate BRDs from PRD / requirement descriptions; it involves multi-step reasoning + structured output + YiKnowledge retrieval + streaming output + editable re-streaming
  + feedback loop. Pain points: long prompts are inaccurate and costly, no structure contract, no streaming for long generation, generation-as-endpoint, no feedback loop, no gradual rollout.
decision: Adopt 5-phase split (structure contract first → RAG integration → streaming output → editable re-stream → gradual feedback loop); each phase is independently launchable + verifiable. Structure contract before
  prompt; RAG before generation; streaming before re-stream; feedback loop last.
alternatives: B. Big-bang launch (single PR) — 80% stall inevitable; C. 3-phase coarse split — contract and prompt not separated; D. 7-phase fine split — coordination cost explodes; E.
  No RAG (long prompt) — inaccurate recall + high cost. A is selected.
risks: 1. prompt drift (model upgrade) — eval-set baseline + rerun; 2. RAG recall skewed — multi-path recall + top-k tuning; 3. generation hallucination
  — key numbers must be traceable; 4. structure contract drift — JSON schema validation + failure retry; 5. streaming interruption — SSE + onDone guard; 6. re-stream conflict
  — YiDoc version detection + conflict UI.
rollback: Gradual P0 bug → immediately disable gradual rollout + switch back to hand-written process (2h); generation quality regression → switch back to previous prompt version (1 business day); RAG recall regression > 5%
  → switch back to previous top-k (1 business day); structure contract broken → switch back to previous schema (1h).
stakeholders: YiAi lead owner (decision); architecture team (technical review); BRD business consumer (consumption); CTO (approval); QA (test); YiVad lead owner (frontend collaboration)
tacit: false
related: []
---

# ADR — YiAi BRD Agent 5-phase launch methodology

**ADR ID**: ADR-Brd-Agent-Launch  |  **Project**: yiai  |  **Domain**: BRD Agent Launch
**Decision Type**: architectural  |  **Team Size**: 5  |  **Status**: accepted  |  **Owner**: YiAi lead owner
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yiai/brd-agent-launch.md

## Context
YiAi needs to auto-generate BRDs from PRD / requirement descriptions; it involves multi-step reasoning + structured output + YiKnowledge retrieval + streaming output + editable re-stream + feedback loop. Pain points: long prompts inaccurate and costly, no structure contract, no streaming for long generation, generation-as-endpoint, no feedback loop, no gradual rollout.

## Decision
Adopt 5-phase split (structure contract first → RAG integration → streaming output → editable re-stream → gradual feedback loop); each phase is independently launchable + verifiable. Structure contract before prompt; RAG before generation; streaming before re-stream; feedback loop last.

## Alternatives
B. Big-bang launch (single PR) — 80% stall inevitable; C. 3-phase coarse split — contract and prompt not separated; D. 7-phase fine split — coordination cost explodes; E. No RAG (long prompt) — inaccurate recall + high cost. A is selected.

## Risks & Mitigations
1. prompt drift (model upgrade) — eval-set baseline + rerun; 2. RAG recall skewed — multi-path recall + top-k tuning; 3. generation hallucination — key numbers must be traceable; 4. structure contract drift — JSON schema validation + failure retry; 5. streaming interruption — SSE + onDone guard; 6. re-stream conflict — YiDoc version detection + conflict UI.

## Rollback Plan
Gradual P0 bug → immediately disable gradual rollout + switch back to hand-written process (2h); generation quality regression → switch back to previous prompt version (1 business day); RAG recall regression > 5% → switch back to previous top-k (1 business day); structure contract broken → switch back to previous schema (1h).

## Stakeholders
YiAi lead owner (decision); architecture team (technical review); BRD business consumer (consumption); CTO (approval); QA (test); YiVad lead owner (frontend collaboration)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai/brd-agent-launch.md`
