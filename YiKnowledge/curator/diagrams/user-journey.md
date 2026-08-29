---
title: User Journey Map — How Knowledge Flows
aliases: [user-journey, knowledge-journey, journey-map]
tags: [curator, diagrams, user-journey, knowledge-flow, pipeline]
category: curator/diagrams
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "Curators understand how knowledge flows through the pipeline — where the breakpoints are and how to fix them"
acceptance_criteria:
  - "maps 4 user journeys: engineer, producter, leader, AI"
  - "identifies breakpoints (friction) in each journey"
  - "suggests improvements for each breakpoint"
related:
  - ./README.md
  - ./knowledge-map.md
  - ./directory-blueprint.md
  - ../../INDEX.md
---

# User Journey Map — How Knowledge Flows

> **Purpose:** Map how different users navigate the knowledge base to accomplish their goals. Identify breakpoints where users get stuck.

## Journey 1: Engineer — "How do I implement X?"

```
START: Task assigned
  │
  ▼
1. ENTER: Read PRD → producter/discovery/
  │ ✓ Clear path: PRD → ADR → implementation pattern
  │
  ▼
2. DECIDE: Read ADR → leader/decisions/
  │ ✓ Project-organized: yiai/, yivad/, yipet/
  │
  ▼
3. IMPLEMENT: Find pattern → engineer/build/ or engineer/ship/
  │ ⚠ BREAKPOINT: 50 files, hard to scan. Use grep or INDEX.
  │
  ▼
4. REFERENCE: Check gotchas → engineer/learn/lessons/gotchas/
  │ ✓ Well-organized by failure type
  │
  ▼
END: Code written
```

**Breakpoint:** engineer/ has 50 files across build/ship/learn/run. Finding the right pattern requires grep or prior knowledge.

**Improvement:** Add a "by task" index: "I want to..." → file path.

## Journey 2: Producter — "What should we build?"

```
START: Market signal received
  │
  ▼
1. RESEARCH: Check industry → executiver/industry/
  │ ⚠ BREAKPOINT: reports/ and competitors/ were empty (now filled)
  │
  ▼
2. STRATEGY: Evaluate frameworks → executiver/strategy/
  │ ✓ Porter, SWOT, Blue Ocean, VRIO all present
  │
  ▼
3. DEFINE: Write PRD → producter/discovery/write-a-prd.md
  │ ✓ Template exists in curator/templates/prd.md
  │
  ▼
4. PRIORITIZE: Score features → producter/frameworks/rice-ice-prioritization.md
  │ ✓ RICE/ICE, MoSCoW, Kano all present
  │
  ▼
END: PRD approved
```

**Breakpoint:** Industry reports are thin. Market data needs external sources.

**Improvement:** Add RSS feed monitoring for competitors; integrate into executiver/industry/reports/.

## Journey 3: Leader — "Which technology should we choose?"

```
START: Technical decision needed
  │
  ▼
1. EVALUATE: Use selection template → curator/templates/tech-selection-evaluation.md
  │ ✓ Template exists with scoring matrix
  │
  ▼
2. DECIDE: Write ADR → curator/templates/adr.md
  │ ✓ Template exists with Context/Decision/Alternatives/Consequences
  │
  ▼
3. FILE: Store in → leader/decisions/<project>/
  │ ✓ Organized by project: yiai/, yivad/, yipet/
  │
  ▼
4. REFERENCE: Check past decisions → leader/decisions/
  │ ⚠ BREAKPOINT: Decisions are scattered across projects; no cross-project ADR index
  │
  ▼
END: ADR published
```

**Breakpoint:** Cross-project decisions (e.g., parameter name contracts) don't have a clear home.

**Improvement:** Add a cross-project ADR category in leader/decisions/.

## Journey 4: AI — "How does the RAG engine find knowledge?"

```
START: User asks question
  │
  ▼
1. QUERY: RAG engine receives question
  │ ✓ llama_index QueryFusionRetriever
  │
  ▼
2. RETRIEVE: Hybrid search (vector + keyword)
  │ ⚠ BREAKPOINT: Retrieval quality depends on frontmatter quality
  │
  ▼
3. RANK: LLM rerank top candidates
  │ ✓ Optional LLMRerank in config
  │
  ▼
4. SYNTHESIZE: LLM generates answer with citations
  │ ✓ NumberSourcesPostprocessor for inline citations
  │
  ▼
5. SCOPE: Filter by file_path, category, or tags
  │ ⚠ BREAKPOINT: Scope filtering is substring-based; can miss relevant files
  │
  ▼
END: Answer returned to user
```

**Breakpoint 1:** Frontmatter quality is inconsistent. Missing `benefit:` or `acceptance_criteria:` fields reduce retrieval accuracy.

**Breakpoint 2:** Scope filtering by substring is fragile. `engineer` matches `engineering` but not `implementation`.

**Improvement:** Run frontmatter compliance checks weekly; add tag-based scoping as an alternative to substring.

## Breakpoint Summary

| Breakpoint | Severity | Fix | Owner |
|---|---|---|---|
| engineer/ too large to scan | Medium | Add "by task" index | Curator |
| Industry reports thin | Low | Integrate RSS monitoring | Executiver |
| No cross-project ADR index | Low | Add cross-project category | Leader |
| Frontmatter quality inconsistent | High | Weekly compliance check | Curator |
| Substring-based scope filtering | Medium | Tag-based scoping alternative | Engineer |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Journey map never updated | Breakpoints change; old map is misleading | Update quarterly; verify each journey still works |
| Breakpoints identified but never fixed | Map becomes a complaint list, not an improvement tool | Assign an owner to every breakpoint; track to resolution |