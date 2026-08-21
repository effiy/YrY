---
title: research
name: research
description: >
  Investigate a question against high-trust primary sources and capture the
  findings as a cited markdown file in YiKnowledge. Use this skill when the
  user asks "research X," "what's the best way to Y," "compare A vs B," or
  wants to understand a technology, library, or pattern before adopting it.
  The skill runs as a background agent: searches the web, reads docs, and
  produces a structured research note with citations. Trigger words: research,
  调研, 研究一下, 查一下, compare, 对比, what's the best, 有没有更好的,
  investigate, 了解一下, 调查.
  Do NOT trigger for: quick lookups (a single web search), or when the user
  already knows the answer and just wants implementation.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/research
review_cycle: quarterly
roles:
  - engineer
  - aier
  - executiver
tags:
  - skill
  - ai
  - research
  - investigation
  - knowledge
chip: ai-workflow
---

# research

> Structured investigation against primary sources. Inspired by mattpocock's
> research — adapted for the YrY monorepo's YiKnowledge integration.

## What this skill does

- Take a research question and break it into investigable sub-questions.
- Search primary sources: official docs, GitHub repos, RFCs, standards.
- Evaluate source credibility: official > community > blog > social media.
- Produce a structured research note with findings, citations, and a
  recommendation.
- Save findings to YiKnowledge for future reference.

## What this skill does NOT do

- Does NOT produce code (hand off to `/write-plan` if research leads to
  implementation).
- Does NOT replace market-research (which is for competitive analysis —
  see `YiKnowledge/skills/market-research/`).
- Does NOT replace code-quality-research (which is for tool evaluation —
  see `YiKnowledge/skills/code-quality-research/`).
- Does NOT copy-paste — every finding is synthesized and cited.

## Workflow

```
Research question stated
  → Break into sub-questions
  → For each sub-question:
      Search primary sources → Evaluate credibility → Synthesize finding
  → Cross-reference findings
  → Produce research note with recommendation
  → Save to YiKnowledge (with user approval)
```

### Source credibility tiers

| Tier | Sources | Trust level |
|------|---------|-------------|
| 1 — Official | Official docs, RFCs, specifications, source code | Highest |
| 2 — Maintainer | GitHub issues/PRs, maintainer blog posts, conference talks | High |
| 3 — Community | Stack Overflow (accepted + high-vote), well-known blogs | Medium |
| 4 — General | Medium articles, social media, forum posts | Low (flag as unverified) |

### Research note template

```markdown
## Research: [question]

**Date**: YYYY-MM-DD
**Investigated by**: agent
**Status**: [finding | recommendation | stale]

### Question
[The original question]

### Sub-questions
1. [Sub-question 1]
2. [Sub-question 2]

### Findings

#### [Sub-question 1]
**Finding**: [Synthesized answer]
**Sources**:
- [Source 1](url) — Tier 1, official docs
- [Source 2](url) — Tier 2, maintainer comment

#### [Sub-question 2]
**Finding**: [Synthesized answer]
**Sources**:
- [Source 1](url) — Tier 1, specification

### Recommendation
[If applicable: what we should do based on this research]

### Open questions
- [Anything not resolved]

### Related YiKnowledge entries
- [path/to/related.md]
```

### YrY-specific research topics

Common research questions for this monorepo:

| Area | Example questions |
|------|------------------|
| Vue 3 ecosystem | "Is there a better ProTable alternative?" "Should we migrate to Vite 6?" |
| Python/FastAPI | "Should we use SQLAlchemy alongside MongoDB?" "Is Pydantic v2 worth migrating to?" |
| Chrome Extension | "MV3 service worker lifecycle changes?" "Better alternatives to chrome.storage?" |
| AI/LLM | "Ollama vs llama.cpp for self-hosted?" "New embedding model comparison?" |
| Cross-project | "gRPC vs REST for YiVad-YiAi communication?" "Shared type generation from Python to TypeScript?" |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Primary sources only (Tier 1-2) | Tier 3-4 sources are flagged as unverified |
| 2 | Every claim must have a citation | "Trust but verify" — the reader must be able to check |
| 3 | Synthesize, don't copy-paste | The value is in the analysis, not the raw text |
| 4 | Flag opinion as opinion | "The maintainer prefers X" ≠ "X is better" |
| 5 | Include the date of investigation | Research decays; dates help judge freshness |
| 6 | Save to YiKnowledge when done | Research that stays in the conversation is lost |
| 7 | Separate research from implementation | Don't mix findings with implementation plans |

## Borders

| Boundary | Permission |
|----------|-----------|
| Web search | read |
| GitHub repos, docs, issues | read |
| Official documentation sites | read |
| YiKnowledge (for saving) | read + write (with user approval) |

## Supporting resources

- [market-research/SKILL.md](../market-research/SKILL.md) — for competitive analysis (different skill, different scope)
- [code-quality-research/SKILL.md](../code-quality-research/SKILL.md) — for tool evaluation (different skill, different scope)
- [YiKnowledge/MEMORY.md](../../../YiKnowledge/MEMORY.md) — naming conventions, frontmatter spec for saving research notes

## Fallback

| Situation | Behavior |
|-----------|----------|
| No primary sources found | Flag the finding as "unverified — no primary sources available" |
| Sources contradict each other | Present both sides; don't pick a winner without evidence |
| Research question is too broad | Narrow it with the user before investigating |
| Finding is time-sensitive | Note the investigation date prominently; suggest a review date |