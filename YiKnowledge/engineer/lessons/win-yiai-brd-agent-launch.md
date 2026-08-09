---
title: YiAi BRD Agent Launch
aliases: [yiai-brd-agent-launch, brd-agent-win]
tags: [success-case-study, YiAi, BRD, agent, launch, RAG]
category: engineer/lessons
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./yivad-aicr-phase-port.md
 - ../../../ai-engineer/methodology/prompts--brd-generation.md
 - ../../../knowledge-curator/templates/brd.md
 - ../../processes/review-lessons.md
---

# YiAi BRD Agent Launch

> **As an** engineer, **I want to** launch the YiAi BRD agent, **so that** success is reproducible.

> YiAi automatically generates BRD (Business Requirements Document) from PRD / requirement descriptions via an agent launch case study, advancing in 5 stages, cutting BRD writing time by 79%.

## Summary

- 5 stages: prompt + output structure contract → YiKnowledge RAG integration → streaming output → editable write-back to YiDoc → gray release + feedback closed loop.
- Key success factors: structure contract first, RAG > long prompt, streaming + interruptible, generate → edit → write-back, feedback closed loop, gray release.
- BRD writing time 2h → 25min (-79%), structure completeness 90%+, write-back rate 60%, 0 P0 bugs after launch.

## Core viewpoints

- **Structure contract first** — define output JSON schema before writing the prompt, so backend parsing does not break.
- **RAG > long prompt** — knowledge base retrieval is more accurate and saves tokens compared to stuffing context.
- **Streaming + interruptible is the user-perception baseline for long generation** — SSE + incremental frontend render; users can interrupt any time.
- **Generation is not the endpoint; edit + write-back is** — after generation, user edits and writes back to YiDoc, then the loop is closed.
- **Feedback closed loop is the fuel for the next round of prompt optimization** — every BRD records user feedback to iterate the prompt.

## Key information

### Background

YiAi needs to automatically generate BRD (Business Requirements Document) from PRD / requirement descriptions. Involves:

- multi-step reasoning (market → users → solution → risk → metric)
- structured output (YiDoc BRD Template)
- linking with YiKnowledge knowledge base (retrieve competitors / methodology)
- streaming output + editable + one-click write-back to YiDoc

### 5-stage split

| Stage | Content |
|---|---|
| 1 | prompt design + output structure contract |
| 2 | YiKnowledge retrieval integration (RAG) |
| 3 | streaming output + frontend render |
| 4 | editable + write-back to YiDoc |
| 5 | gray release + feedback closed loop |

### Key success factors

1. **Prompt and structure contract first**: define output JSON schema, then write prompt; avoid backend parse failure.
2. **RAG recall quality**: YiKnowledge embedded embedding + top-k tuning (top 5 → top 8).
3. **Streaming experience**: SSE + incremental frontend render; users can interrupt.
4. **Editable write-back**: generation is not the endpoint; user edits then writes back to YiDoc.
5. **Feedback closed loop**: every BRD records user feedback to iterate the prompt.
6. **Gray release**: first internal 5 people, then all.

### Quantified effect

- BRD writing time: average 2h → 25min (-79%)
- Structure completeness: 90%+ (manual spot check)
- User edit write-back rate: 60% (shows generation quality is usable but still needs fine-tuning)
- 0 P0 bugs after launch

### Agent methodology

- **Structure contract first**: JSON schema drives the prompt; parsing does not break.
- **RAG > long prompt**: knowledge base retrieval is more accurate than stuffing context.
- **Streaming + interruptible**: long generation must respect user perception.
- **Generate → edit → write-back**: generation is not the endpoint.
- **Feedback closed loop**: user feedback is the fuel for the next round of prompt optimization.

### Risk points

- Prompt drift: every model upgrade needs re-running evaluation.
- RAG recall bias: top-k tuning + multi-route recall (vector + BM25).
- Generation hallucination: key numbers / names must be traceable to YiKnowledge.

## Action recommendations

1. For agent development, define output JSON schema first; write the prompt around the schema; backend parses via schema validation.
2. RAG recall tuning: top-k starts at 5 and gradually increases; add multi-route recall (vector + BM25) for key scenarios.
3. Long generation must be streaming + interruptible: SSE + incremental frontend render + user interrupt button.
4. Generate → edit → write-back closed loop: after user edits, one-click write back to business system (YiDoc / database).
5. Every output records user feedback (thumbs up/down + revision diff) as fuel for the next round of prompt optimization.
6. Gray release: first internal 5 people → all; monitor P0 bugs and hallucination rate.
7. Prepare a prompt evaluation set (run weekly); re-run baseline comparison on model upgrade.
8. Key numbers / names must be traceable to YiKnowledge; add citations shown to users.

## Anti-patterns

- **Writing the prompt before defining the output schema** — without a JSON schema contract, the LLM output format drifts across model versions, and the backend parser breaks on unexpected field types or missing keys. The schema must be the first artifact, and the prompt must be written to satisfy it.

- **Stuffing all context into a long prompt instead of using RAG** — long prompts bloat token costs, reduce recall accuracy, and hit context-window limits on smaller models. Knowledge base retrieval with tuned top-k is both cheaper and more accurate for domain-specific content.

- **Delivering long-form generation without streaming** — users staring at a blank screen for 30+ seconds with no feedback will abandon the feature. SSE streaming with incremental frontend rendering and an interrupt button is the baseline for any generation longer than a few sentences.

- **Treating generation as the final deliverable** — if the output cannot be edited and written back to the business system (YiDoc, database), it rots in the chat box and delivers zero business value. The generate-edit-writeback loop is the minimum viable closed loop.

- **Launching without a feedback closed loop** — a one-shot prompt without user feedback collection (thumbs up/down, revision diffs) cannot improve over time. Each model upgrade or prompt drift will silently degrade quality with no signal to detect it.

## Related

- [./win-yiai-rag-hybrid-retrieval.md](./win-yiai-rag-hybrid-retrieval.md) — RAG hybrid retrieval that powers the BRD agent knowledge base recall
- [../../ai-engineer/methodology/prompts--brd-generation.md](../../ai-engineer/methodology/prompts--brd-generation.md) — BRD generation prompt design
- [../../knowledge-curator/templates/brd.md](../../knowledge-curator/templates/brd.md) — BRD template used for structured output
- [../../tech-lead/decisions/yiai--rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) — ADR for RAG evaluation infrastructure used in BRD agent
- [./win-yiai-llm-phase-five.md](./win-yiai-llm-phase-five.md) — LLM endpoint + frontend model selector consumed by BRD agent streaming
