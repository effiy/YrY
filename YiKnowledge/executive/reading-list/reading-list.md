---
title: 2026 reading list
aliases:
- reading-list-2026
- 2026-reading-list
tags:
- summary
- reading-list
- 2026
category: executive/reading-list
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- executive
benefit: Executives can maintain a curated reading list for continuous learning and industry awareness
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./reading-notes.md
- ../../knowledge-curator/governance/inbox.md
- ../../knowledge-curator/templates/README.md
- ../../ai-engineer/README.md
tacit: false
---

# 2026 reading list

> **As an** executive, **I want to** reading list, **so that** reading list curated. 

> Monthly rolling update. After reading, distill accumulated value into should-semantics leaves (`methodology/` `tech/`); notes `related` field points to the final landing leaf. 

## Summary

- A reading list without a distillation pipeline is consumption without retention — the distillation step (extracting core viewpoints, anti-patterns, and actionable recommendations into YiKnowledge leaves) converts temporary mental models into durable organizational knowledge
- The "Read but not distilled in 90 days" rule prevents the reading list from becoming a guilt tracker by forcing a decision: either the content is worth distilling, or it was not worth reading
- Monthly rolling updates transform the reading list from a static archive into a dynamic learning strategy, surfacing emerging topics, fading interests, and urgent knowledge gaps
- Scoring is a personal calibration tool measured after distillation, not immediately after reading — a book that feels transformative in the moment may prove forgettable after a month
- The `related` field creates a traceable chain from "I read this" to "this is what we changed as a result," turning reading from a hobby into professional development with measurable impact

## Reading queue

| # | type | title | source | status | scoring | accumulated destination |
|---|---|---|---|---|---|---|
| 1 | Article | _to be supplemented_ | | To read | | |
| 2 | Book | _to be supplemented_ | | To read | | |
| 3 | Paper | _to be supplemented_ | | To read | | |

## status enumeration

- `To read`: not started
- `Reading`: currently reading
- `Read`: finished
- `Distilled`: finished and distilled into YiKnowledge

## scoring

⭐⭐⭐⭐⭐ must-read classic / ⭐⭐⭐⭐ recommendation / ⭐⭐⭐ average / ⭐⭐ skippable / ⭐ not recommended

## monthly rolling

- Add this month's list at the start of each month
- Read but not distilled in 90 days: marked `status: Read` but no longer tracked
- Distilled: `related: [path]` points to the final landing file

## Core viewpoints

- **A reading list without a distillation pipeline is consumption without retention.** Reading an article or book produces a temporary mental model that fades within weeks. The distillation step — extracting the core viewpoints, anti-patterns, and actionable recommendations into a YiKnowledge leaf — is what converts consumption into durable organizational knowledge. Without distillation, the reading list is a graveyard of good intentions.

- **The "Read but not distilled in 90 days" rule prevents the reading list from becoming a guilt tracker.** Every item on the reading list that sits in "Read" status for months is a signal that the item was not valuable enough to distill, or that the distillation process is too expensive. The 90-day expiration forces a decision: either the content is worth distilling, or it was not worth reading.

- **Scoring is a personal calibration tool, not a public recommendation system.** A 5-star rating reflects the reader's context and timing, not universal quality. The same book read by a different person at a different career stage would receive a different score. The scoring system is most useful for the reader's own retrospective: "what kind of content did I find most valuable this year, and what should I read more of?"

- **The `related` field is the bridge between reading and doing.** When a reading list item is distilled, the `related` field points to the YiKnowledge leaf where the insights landed. This creates a traceable link from "I read this" to "this is what we changed as a result." Without this link, reading is a hobby; with it, reading is professional development with measurable impact.

- **Monthly rolling updates prevent the reading list from becoming a static archive.** A reading list that is updated once and forgotten is a snapshot of interest at a single point in time. Monthly updates force the reader to reflect on what changed: what new topics emerged, what old topics became less relevant, and what gaps in knowledge are becoming urgent.

## Action recommendations

1. **Assign an estimated reading date or a clear trigger to every item added to the reading list.** A reading list with 50 "To read" items and no prioritization is a wish list, not a plan. Each item should have a target month or a trigger event (e.g., "read before Q3 planning," "read when starting the RAG project") to prevent the list from growing indefinitely.

2. **Complete the distillation step within 90 days of finishing a reading item, or mark it as "not worth distilling" and remove it from active tracking.** Items that sit in "Read" status for months signal either that the content was not valuable enough to distill, or that the distillation process is too expensive. The 90-day expiration forces a decision and prevents the reading list from becoming a guilt tracker.

3. **Link the `related` field bidirectionally between the reading list entry and the YiKnowledge leaf where the insights landed.** A one-way link means the reader cannot trace the insight back to its source, and the source cannot demonstrate its impact on the knowledge base. The link creates a traceable chain from "I read this" to "this is what we changed as a result."

4. **Score items after the distillation step, not immediately after reading.** A book that feels transformative in the moment may prove forgettable after a month. The scoring should reflect how much durable value the content actually provided -- measured by how many actionable insights made it into YiKnowledge leaves, not by how engaging the reading experience was.

5. **Use the monthly rolling update to reflect on knowledge gaps, not just to add new items.** The monthly review should answer: what new topics emerged this month, what old topics became less relevant, and what gaps in knowledge are becoming urgent for upcoming projects. This turns the reading list from a static archive into a dynamic learning strategy.

## Anti-patterns

- **Adding items to the reading list without a plan for when they will be read.** A reading list with 50 "To read" items and no prioritization is not a plan — it is a wish list. Each item should have an estimated reading date or a clear trigger (e.g., "read before the Q3 planning meeting") to prevent the list from growing indefinitely.

- **Treating "Read" as the end state instead of "Distilled."** Marking an item as "Read" without distilling it means the knowledge stays in the reader's head, inaccessible to the team and vulnerable to forgetting. The goal is not to finish reading — it is to extract durable value.

- **Using the reading list as a proxy for actual learning.** A well-maintained reading list with high scores and diligent distillation can create the illusion of continuous learning. The real test is whether the distilled insights change decisions, not whether the reading list is complete.

- **Rating items immediately after reading rather than after a reflection period.** A book that feels transformative in the moment may prove forgettable after a month. The scoring should be done after the distillation step, when the reader can assess how much durable value the content actually provided.

- **Distilling without linking back to the source.** When a reading list item is distilled into a YiKnowledge leaf, the `related` field in both the reading list and the leaf should point to each other. A one-way link means the reader cannot trace the insight back to its source, and the source cannot demonstrate its impact on the knowledge base.

## Related

- [README.md](./) — this leaf navigation
- [reading-notes-template.md](./reading-notes.md) — reading notes template
- [../../knowledge-curator/governance/inbox.md](../../knowledge-curator/governance/inbox.md) — articles enter inbox first then categorized
- [../../knowledge-curator/templates](../../knowledge-curator/templates) — methodology distillation destination
- [../../ai-engineer](../../ai-engineer) — technology distillation destination
