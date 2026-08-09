---
title: YiKnowledge Leaf File Unified Template
aliases:
- knowledge-leaf-template
- leaf-template
- knowledge leaf Template
tags:
- template
- knowledge-base
- frontmatter
- user-story
category: knowledge-curator/templates
created: 2026-08-03
updated: 2026-08-05
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: yearly
roles:
- knowledge-curator
- engineer
- product-manager
- tech-lead
- ai-engineer
- new-hire
benefit: New files written from this template satisfy the frontmatter + 7-section spec, keeping cross-directory RAG retrieval stable
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ../governance/user-story-migration-plan.md
- ../diagrams/directory-blueprint.md
- ./adr.md
- ./brd.md
- ./prd.md
tacit: false
---

# YiKnowledge Leaf File Unified Template

> **As a** knowledge-curator, **I want to** provide a single unified template for all leaf files, **so that** new files written from this template satisfy the frontmatter + 7 sections + user story header spec, keeping cross-directory RAG retrieval stable.

> All `*-summary.md` / `*-original.md` / `*-template.md` / `*-prompt.md` must be organized using this template. Frontmatter is the first signal for RAG retrieval, body content is the second signal — when both are well-structured, cross-directory retrieval stays stable.

## Frontmatter (required + recommendations)

```yaml
---
title: <title, may be Chinese> # required, human-readable title
aliases: [<English alias>,...] # recommended, English search aliases
tags: [<tag1>, <tag2>, <tag3>] # required, 3-5 items, for cross-directory aggregation
created: YYYY-MM-DD # required
updated: YYYY-MM-DD # required
source: <URL | internal> # required, source link or internal
type: summary | original | template | prompt # required
status: stable  # valid values: draft | stable | deprecated
lifecycle: inbox | triage | active | reference | archive # recommended, defaults to active
review_cycle: weekly | monthly | quarterly | yearly # required for external content
last_verified: YYYY-MM-DD # required for external content
author: <author> # optional
tacit: false # set to true for tacit knowledge, AI prioritizes retrieval
roles: [engineer, tech-lead] # required, user story roles array (short form, no as-a- prefix)
benefit: "<short sentence: quantifiable benefit the user gains>" # required, user story benefit clause
acceptance_criteria: # required, checkable acceptance criteria list
 - "<checkable condition 1>"
 - "<checkable condition 2>"
related: # recommended, cross-file relations
 - <relative/path/to/file.md>
---
```

## Body structure (user story header + 7 fixed-order sections)

```markdown
# <title>

> **As a** `<role>`, **I want to** `<goal>`, **so that** `<benefit>`.

> <one-sentence definition, ≤30 characters>

## Summary
- <conclusion 1>
- <conclusion 2>
- <conclusion 3>
 (3-5 items, one sentence each)

## Core viewpoints
- <conclusion> — <supporting evidence / data / source>
- <conclusion> — <supporting evidence>
 (each conclusion + one sentence of support; avoid listing bullets without explanation)

## Key information
### Concept breakdown
<term explanations, sub-concepts, mechanism diagrams>
### Key parameters / formulas / data
<quantitative info, thresholds, formulas, comparison tables>
### Applicable scenarios
<3-5 "when to use" items>

## Action recommendations
1. <step 1>
2. <step 2>
3. <step 3>
 (executable numbered steps; avoid vague phrases like "pay attention to" or "coordinate")

## Anti-patterns / common misuse
- <anti-pattern> — <consequence>
- <anti-pattern> — <consequence>
 (3-5 items, to prevent misuse)

## Related
- Similar: <relative path>
- Upstream: <relative path> (prerequisite knowledge)
- Downstream: <relative path> (application scenarios)
```

## Design rationale for the 7 sections

| Section | What it answers | Why it is here |
|---|---|---|
| User story header | Who uses it? What is achieved? Why use it? | One sentence locks Role + Target + Benefit, RAG aggregates by role |
| Summary | What is it? One sentence | Readers scan for 3 seconds to decide whether to continue; AI returns it first on retrieval |
| Core viewpoints | Key conclusion? | Present conclusions first; supporting evidence follows |
| Key information | Breakdown and data | Engineers look up parameters; PMs check applicable scenarios |
| Action recommendations | How to use? | Turn knowledge into actionable steps |
| Anti-pattern | What pitfalls to avoid? | Failures are more valuable than successes |
| Related | What about surrounding content? | Anchor for cross-file RAG retrieval |

## Naming spec

- File name: descriptive verb-phrase (like `set-up-ci-cd.md` / `harden-supply-chain.md` / `prepare-a-budget-strategy.md`)
- All English kebab-case, hyphens only, **no underscores `_` or digits**
- Chinese semantics stay in frontmatter `title` and `aliases`
- Multiple roles are expressed via the frontmatter `roles:` array; file name is not bound to a single primary role
- User story header `> **As a** <role>, **I want to** <goal>, **so that** <benefit>.` is a body header spec, not a file name spec

## Two-copy archive rationale

When receiving external knowledge, keep two copies:

1. **Original** `{topic}-original.md` — markdown fetched via web_fetch or copied directly from the source
2. **Summary** `{topic}-summary.md` — rewritten following this template's 7 sections; frontmatter `source` points to the original

A single-file structure (`{topic}.md` containing both "original" and "summary" sections) is only used when the original is < 200 lines.

## Progressive reading

1. `head -15 <file>` to read frontmatter and judge relevance
2. If relevant, `grep "^## "` to scan the section structure
3. Confirmed useful, then read the whole file
