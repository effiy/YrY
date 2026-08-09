---
title: User Journey Map
aliases:
- user-journey
- knowledge-flow-breakpoints
tags:
- lifecycle
- user-journey
- 4-diagrams
category: knowledge-curator/diagrams
created: 2026-08-03
updated: 2026-08-05
last_verified: 2026-08-07
source: "internal part + reference <Knowledge base directory design: 90% of companies first step wrong>"
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
roles:
- knowledge-curator
benefit: knowledge flow breakpoints surfaced, improve backlog executability
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"- every journey annotated acquire/use/contribute three stages + breakpoints + improvement measures
- breakpoint summary table contains owner and severity
related:
- ./knowledge-map.md
- ./directory-blueprint.md
- ../governance/governance.md
- ../../executive/industry/README.md
- ../README.md
tacit: false
---

# User Journey Map

> **As a** knowledge-curator, **I want to** draw each typical role's "acquire → use → contribute" full trace and annotate breakpoints, **so that** knowledge flow loss points surfaced, breakpoint checklist becomes improvement backlog. 

> Diagram two of the four diagrams. Answers "knowledge in whose hands, who needs it, how it flows". 

## Summary

- Draw each role's "acquire → use → contribute" full trace, mark breakpoints
- Four typical roles: PM, engineer, newcomer, YiAi BRD Agent
- Breakpoints three big classes: cannot find / found but dare not use / used but no accumulation
- "Asked a person but no feedback" is the biggest knowledge flow loss point
- Quarterly review of newly increased breakpoints → improvement measures checklist

## Core viewpoints

- **Journey diagram reveals breakpoints but does not depict ideal process** — breakpoint is knowledge flow loss point, breakpoint checklist is improvement backlog
- **AI is also a user** — YiAi BRD Agent's RAG recall is also one journey, frontmatter incomplete = AI journey breakpoint
- **Contribution stage most easily broken** — stepping-on-pit / retrospective / feedback relies on self-awareness, without SOP then no feedback

## Key information

### Role 1: PM looking for methodology / writing PRD

**Acquire**: Enter INDEX.md "Scenario entries" section `i-want-to-learn-pm-frameworks` → jump to `product-manager/frameworks/` + `product-manager/discovery/prd--`
- Breakpoint: ⚠️ Current PRD template `knowledge-curator/templates/prd.md` whether up-to-date? Need verify

**Use**: After finding template use directly, or need secondary processing
- Breakpoint: ⚠️ Gap between template and practical project PRD (`product-manager/projects/{proj}/stories/`) whether someone feeds back to template?

**Contribute**: Does project completion have retrospective mechanism? Retrospective content enters `engineer/lessons/wins/` or `engineer/lessons/failures/`
- Breakpoint: ⚠️ Currently retrospective not mandatory, relies on self-awareness — need add in `product-manager/processes/` "every iteration end must write retrospective"

### Role 2: engineer checking engineering pitfalls / retrospective

**Acquire**: Enter INDEX.md `i-want-to-check-engineering-gotchas` → jump to `engineer/lessons/gotchas/` + `engineer/lessons/failures/`
- Breakpoint: ⚠️ `engineer/lessons/gotchas/` current entries coverage incomplete; new pitfalls rely on "word-of-mouth"

**Use**: Found gotcha → use solution directly; not found → ask old employee → answer stays in group chat

**Contribute**: After stepping on pit whether feeds back?
- Breakpoint: ⚠️ Currently no mandatory SOP, relies on individual self-awareness. `engineer/process/knowledge-review.md` should include "pitfall 24h supplement gotcha"

### Role 3: Newcomer onboarding

**Acquire**: Enter INDEX.md `i-want-to-handoff-project` → jump to `new-hire/onboarding/{proj}/` + `new-hire/onboarding/onboarding-checklist.md`
- Breakpoint: ⚠️ `new-hire/onboarding/{proj}/onboarding.md` whether completely covers 8 sections? Need verify

**Use**: Found → use; not found → ask colleague → answer stays in head
- Breakpoint: ⚠️ "Asked a person but no feedback" is the biggest knowledge flow loss point

**Contribute**: Newcomer fills feedback table after onboarding → improve onboarding.md
- Breakpoint: ⚠️ Currently no feedback closed loop

### Role 4: YiAi BRD Agent (AI perspective) 

**Acquire** (RAG recall): user question → YiAi recalls related chunks from YiKnowledge
- signal: frontmatter `tags` / `category` / `lifecycle` / `related` / `tacit` / `roles` / `benefit`
- Breakpoint: ⚠️ lifecycle=`triage` unrefined content recall quality low; `tacit: true` tacit knowledge scarce

**Use**: Recall → assemble prompt → generate BRD chapter
- Breakpoint: ⚠️ frontmatter `roles:` / `benefit:` incomplete file recall signal weak, need fill all

**Contribute**: YiAi-generated BRD after human approval enters `brd/brd-engineer/`
- Breakpoint: ⚠️ Does generated content feed back to `ai-engineer/methodology/` as training corpus? Currently no

### Breakpoint summary

| Role | Breakpoint class | Severity | Improvement measure |
|---|---|---|---|
| PM | Template vs practice gap | mid | Every iteration end sync template |
| engineer | Pitfalls no feedback | high | Pitfall 24h supplement gotcha SOP |
| Newcomer | Asked person but no feedback | high | Onboarding feedback closed loop |
| YiAi | frontmatter incomplete | high | New file must fill roles/benefit/lifecycle/related |

## Action recommendations

1. Quarterly review scan each role journey once, newly increased breakpoints → improvement measures checklist
2. High-severity breakpoints prioritize building SOP (pitfall 24h, onboarding feedback, frontmatter must fill) 
3. Template vs practice gap: every iteration end sync template owner
4. YiAi journey breakpoints: link with new file frontmatter validation (lint stage enforced) 

## Anti-patterns

- **Only draw "ideal process" without marking breakpoints** — consequence: journey diagram becomes PPT decoration, improvement no starting point
- **Not drawing AI journey** — consequence: ignore AI era biggest user, frontmatter governance loses power
- **Breakpoint checklist not assigned owner** — consequence: breakpoints forever stuck in "identify" stage

## Related

- Same class (4 diagrams): [knowledge-map.md](./knowledge-map.md) / [directory-blueprint.md](./directory-blueprint.md) / [governance.md](../governance/governance.md)
- Upstream: [README.md](../README.md) (KB overview) 
- Downstream: [../../executive/industry/README.md](../../executive/industry/README.md) (scenario entry landing) 
