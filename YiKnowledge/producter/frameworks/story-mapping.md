---
title: User Story Mapping
aliases: [story-mapping, user-story-map, story-map]
tags: [producter, frameworks, story-mapping, user-stories, agile]
category: producter/frameworks
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "Producters use story mapping to visualize the user journey, prioritize releases, and keep the team aligned on the big picture"
acceptance_criteria:
  - "explains the story mapping process with a concrete example"
  - "covers release slicing and MVP definition"
  - "includes a YrY-relevant example"
related:
  - ./jobs-to-be-done-summary.md
  - ./rice-ice-prioritization.md
  - ../discovery/write-a-prd.md
  - ../delivery/run-a-sprint.md
---

# User Story Mapping

> **When to use:** At the start of a new feature or product. Story mapping turns a flat backlog into a visual map of the user journey — showing what to build first, second, and never.

## The Story Map Structure

A story map has two dimensions:

```
Horizontal: User journey (left to right) — the backbone
Vertical: Priority (top to bottom) — must-have → nice-to-have → won't-have
```

### The Backbone

The backbone is the user's end-to-end journey, broken into activities:

```
Browse    →  Search   →  Compare  →  Add to   →  Checkout  →  Track
products     products    products    cart                     order
```

### The Stories

Under each activity, stack user stories by priority:

```
Browse products
├─ [Must have]  View product list with images and prices
├─ [Must have]  Filter by category
├─ [Should have] Sort by price, rating, newest
├─ [Could have]  View in grid or list layout
└─ [Won't have]  AR preview of product in my room
```

## The Story Mapping Workshop

### Participants (3-5 people)

- Product manager (facilitator)
- 1-2 engineers
- Designer (if available)
- Stakeholder (optional, for context)

### Process (2-3 hours)

#### 1. Define the goal (10 min)

One sentence: "We're building {{product/feature}} so that {{user}} can {{outcome}}."

#### 2. Map the backbone (20 min)

- Write each user activity on a sticky note
- Arrange left to right in chronological order
- Don't worry about completeness — you'll fill gaps later

#### 3. Add user stories (45 min)

- For each activity, brainstorm user stories
- Write one story per sticky note
- Place under the corresponding activity
- Don't prioritize yet — just get everything down

#### 4. Prioritize vertically (30 min)

- Top row: **Must have** — the feature is useless without these
- Second row: **Should have** — important but not critical
- Third row: **Could have** — nice to have
- Bottom row: **Won't have** (this release) — explicitly descoped

## Release Slicing

Draw a horizontal line across the map to define each release:

```
Release 1 (MVP): Must-have stories only
Release 2:       Must-have + Should-have
Release 3:       Must-have + Should-have + Could-have
```

### MVP Definition

The MVP is the thinnest horizontal slice that delivers value:

> "What's the smallest thing we can build that a user would actually use?"

Test your MVP slice:
- [ ] Does it cover the full user journey (left to right)?
- [ ] Can a user accomplish their goal with just these stories?
- [ ] Is there anything in the MVP that can be deferred?

## YrY Example: YiPet Knowledge Grounding

### Backbone

```
Browse     →  Select     →  Ask       →  View        →  Refine
knowledge     scope         question      answer         scope
tree
```

### Stories

| Activity | Must have | Should have | Could have |
|---|---|---|---|
| Browse knowledge tree | Scan YiKnowledge tree; show folders + files | Search within tree | Drag-and-drop files to chat |
| Select scope | Click a file/folder to set RAG scope | Show active scope as a chip | Scope multiple files at once |
| Ask question | Send grounded chat message | Preview sources before sending | Decompose complex questions |
| View answer | Streaming response with sources | Inline source citations | Source snippet preview |
| Refine scope | Clear scope and re-select | @-mention file in chat input | Auto-suggest related files |

### MVP Slice (Release 1)

Must-have stories across all 5 activities = a user can browse, select, ask, view, and refine.

## Story Mapping Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Flat backlog (no backbone) | No user journey context; can't see what's missing | Always start with the backbone — the user's journey |
| Everything is "must have" | No prioritization; MVP is the whole product | Be ruthless: must-have = the feature is useless without it |
| PM maps alone | Misses engineering feasibility and design insights | Workshop with 3-5 people from different roles |
| Map is static (never updated) | Map rots; no longer reflects reality after 2 sprints | Update the map at sprint boundaries; it's a living artifact |