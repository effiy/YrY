---
title: Tacit Knowledge Backlog
aliases:
- tacit-knowledge-backlog
- tacit-backlog
tags:
- lifecycle
- tacit
- tacit-knowledge
- backlog
category: knowledge-curator/governance
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: "Reference \"Knowledge Base Directory Design: 90% of Companies Get the First Step Wrong\""
type: template
status: stable
lifecycle: reference
review_cycle: monthly
roles:
- knowledge-curator
benefit: kb stays curated
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ../diagrams/knowledge-map.md
- ./governance.md
- ../diagrams/user-journey.md
- ../README.md
tacit: false
---

# Tacit Knowledge Backlog

> **As a** knowledge curator, **I want to** tacit knowledge backlog, **so that** kb stays curated.

> 70% of the value lies in tacit knowledge — sitting in senior employees' heads, in group-chat logs, in processes that "everyone knows but nobody writes down."

## Summary

- Track tacit knowledge awaiting capture, 10 initial backlog items
- State transitions: `pending → planning → capturing → drafting → reviewing → done`
- 5 capture methods: 1-on-1 interview / workshop / code-comment extraction / process breakdown / customer interview
- On completion, mark the target leaf file with `tacit: true` + `lifecycle: active`
- Monthly review advances state; quarterly review adds new entries

## Core viewpoints

- **Tacit knowledge is 70% of the value** — explicit knowledge is just the tip of the iceberg; not capturing tacit = wasting the most valuable asset
- **Every time "you have to ask a senior employee to get the answer" is a new backlog item** — this is the simplest signal for identifying tacit knowledge
- **Capture method matched to holder type** — customer preferences via 1-on-1, SOPs via workshops, engineering via code comments

## Key information

### Backlog to capture

| ID | Tacit-knowledge description | Holder | Consumer | Capture method | Target leaf | State | Completion date |
|---|---|---|---|---|---|---|---|
| T001 | Customer A's boss cares deeply about data security; proposals must lead with security architecture | Senior sales | Pre-sales, product | 1-on-1 interview + case documentation | industry/use-cases/ | pending | |
| T002 | A certain interface has performance issues past 500 concurrent; cache ahead of time | Backend architect | All engineering | Code comments + gotcha file | lessons/gotchas/ | pending | |
| T003 | CTO dislikes PPTs over 3 pages in weekly reports | PM lead | All PMs | Team-meeting confirmation | work/processes/ | pending | |
| T004 | Pre-launch checklist (senior PM has 20 in head, only 8 documented) | Senior PM | All PMs | Workshop extraction | work/processes/release-process.md | pending | |
| T005 | Regional compliance differences overseas (EU GDPR / Middle East / Southeast Asia) | Legal + overseas PM | Pre-sales, product | Legal interview | brd/reference/regulations.md | pending | |
| T006 | Team topology and role RACI | Each owner | New hires, cross-team collaboration | Quarterly workshop | people/team/ | pending | |
| T007 | External expert network (lawyers / translators / industry consultants) | Each owner | Decision makers | Owner 1-on-1 | people/experts/ | pending | |
| T008 | Customer industry insight (each key customer's business model) | Senior sales | All sales, PM | Customer interview | industry/use-cases/ | pending | |
| T009 | Cross-timezone collaboration conventions (working hours per region, handoff windows) | Each region owner | Everyone | Workshop | work/collaboration/ | partial | |
| T010 | YiAi BRD Agent generate → approve → ingest tacit rules | PM + engineering | YiAi users | Process breakdown | work/processes/ + projects/YiAi/ | pending | |

### State enum

- `pending`: not started
- `planning`: holder contacted, interview scheduled
- `capturing`: interview/workshop in progress
- `drafting`: draft being written to target leaf
- `reviewing`: holder review
- `done`: capture complete, target leaf file `tacit: true` + `lifecycle: active`

### Capture methods

- **1-on-1 interview**: deep interview with a single holder, suited to customer-preference types
- **Workshop**: multiple holders extract together, suited to SOP types
- **Code-comment extraction**: extract from code / PR comments, suited to engineering types
- **Process breakdown**: follow an actual operation and record steps, suited to process types
- **Customer interview**: ask customers directly, suited to industry-insight types

## Action recommendations

1. Monthly review scans the table, advance `planning`/`capturing`/`drafting` states
2. Quarterly review adds tacit knowledge encountered this quarter ("had to ask a senior employee" events)
3. Assign an owner + expected completion date to each backlog item
4. On completion immediately add `tacit: true` on the target leaf file, and move from this table to [review-log.md](./review-log.md) registering as `promote`



- **Backlog only grows, never shrinks** — consequence: list becomes a junk pile, operations lose focus
- **Capture without `tacit: true`** — consequence: AI recall cannot prioritize tacit knowledge
- **Holder not involved in review** — consequence: draft drift, capture misleads successors
- **All entries use the same capture method** — consequence: SOPs via 1-on-1 miss the full picture; customer preferences via workshop waste resources

## Related

- Same category: [knowledge-map.md](../diagrams/knowledge-map.md) (knowledge map, tacit-gap source)
- Upstream: [README.md](../README.md) (Lifecycle view-layer overview)
- Downstream: [governance.md](./governance.md) (monthly/quarterly review cadence), [review-log.md](./review-log.md) (register on completion)
