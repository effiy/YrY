---
title: Lifecycle view layer
aliases: [lifecycle-view, para-lifecycle]
tags: [lifecycle, moc, para, 4-diagrams]
category: knowledge-curator
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [knowledge-curator]
benefit: "README outcome clear"
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - usage guidance explains when to use this template and common mistakes
related:
  - ./diagrams/knowledge-map.md
  - ./diagrams/directory-blueprint.md
  - ./governance/governance.md
  - ./governance/readiness-checklist.md
  - ../README.md
  - ../MEMORY.md
---

# Lifecycle view layer

> **As a** knowledge curator, **I want to** maintain the knowledge base with clear governance, **so that** content is discoverable and well-maintained.

> YiKnowledge's view layer: lifecycle + 4 diagrams + operations mechanism entry.

## Summary

- This directory does not participate in topical classification; it only carries lifecycle / 4 diagrams / operations mechanism views, overlaid on semantic categories
- PARA mapping: Projects=`projects/`, Areas=7 semantic domains, Resources=`resources/`, Archives=`archive/`
- lifecycle field flow: `inbox → triage → active → reference → archive`
- Each of the 4 diagrams is its own file: knowledge-map / user-journey / directory-blueprint / governance
- Serves both humans and the YiAi BRD Agent: frontmatter `lifecycle`/`related`/`tacit`/`tags`/`category` are key signals for cross-directory RAG recall

## Core viewpoints

- **View layer independent of semantic classification** — the 9 semantic categories (projects/industry/...) stay unchanged; this directory only adds perspectives, avoiding rewrites of existing content
- **lifecycle field is the single signal of flow** — both AI and humans rely on it to judge which stage a file is in, deciding whether to recall / refine / archive
- **The knowledge map never goes out of date** — AI consumes structured knowledge, garbage in garbage out; explicit + tacit dual inventory is the only moat in the AI era

## Key info

### PARA / lifecycle mapping

| PARA concept | YiKnowledge mapping | Notes |
|---|---|---|
| Projects | `projects/{YiAi,YiPet,YiVad}/` | Active projects with clear goals and deadlines |
| Areas | `industry/` `methodology/` `people/` `product/` `tech/` `work/` `lessons/` | Responsibility domains under continuous maintenance |
| Resources | `resources/` | Reusable resources (prompts, templates, reading list) |
| Archives | `archive/` | Completed or no longer active content |

### lifecycle field flow

```
inbox → triage → active → reference → archive
```

| State | Meaning | Typical files |
|---|---|---|
| `inbox` | Just captured raw source, unclassified and unrefined | listed in `inbox.md` |
| `triage` | Classified into the correct leaf, pending summary | listed in `triage.md` |
| `active` | Summarised and referenced | most `*-summary.md` |
| `reference` | Stable methodology/templates, rarely changed | `*-template.md`, `methodology/thinking/*` |
| `archive` | deprecated or superseded | listed in `archive.md` |

### 4 diagrams in practice

| Original diagram (reference article) | File | Notes |
|---|---|---|
| Knowledge map | [knowledge-map.md](./diagrams/knowledge-map.md) | Explicit/tacit, holder/consumer, update-frequency inventory |
| User-journey map | [user-journey.md](./diagrams/user-journey.md) | 4 roles × acquire→use→contribute full chain, marking breakpoints |
| Directory blueprint | [directory-blueprint.md](./diagrams/directory-blueprint.md) | 9 categories + `lifecycle/` + `journeys/` topology |
| Governance flow | [governance.md](./governance/governance.md) | 4 roles + 3 cadences (weekly/monthly/quarterly) |

### Catch-all directory and scenario entries

- Catch-all (knowledge transit station): [inbox.md](./governance/inbox.md)
- Pending-refinement queue: [triage.md](./governance/triage.md)
- Archive index: [archive.md](./archive/archive.md)
- Scenario entries (verb-phrase names): `journeys/`

## Action recommendations

1. New content lands in `inbox.md` first, frontmatter `lifecycle: inbox`
2. During weekly review, classify into the correct leaf and change to `lifecycle: triage`, register in `triage.md`
3. After writing the summary, change to `lifecycle: active`; the original source becomes `lifecycle: reference`
4. Quarterly review: scan the 4 diagrams and backlog; yearly: scan `archive.md` for physical cleanup

## Anti-patterns / common misuse

- **Treating this directory as topical classification** — consequence: overlaps with the 9 semantic directories, polluting the directory structure
- **New files missing lifecycle field** — consequence: weak AI recall signal, operations cannot batch-filter unrefined content
- **Drawing the 4 diagrams and never reviewing** — consequence: the knowledge map goes stale, breakpoints accumulate into knowledge loss

## Related

- Same level: [knowledge-map.md](./diagrams/knowledge-map.md) / [user-journey.md](./diagrams/user-journey.md) / [directory-blueprint.md](./diagrams/directory-blueprint.md) / [governance.md](./governance/governance.md)
- Upstream: [../README.md](../README.md) (top-level category navigation), [../MEMORY.md](../MEMORY.md) (rulebook)
- Downstream: [readiness-checklist.md](./governance/readiness-checklist.md) (10-question pre-launch gate), [review-log.md](./governance/review-log.md) (review log), [tacit-knowledge-backlog.md](./governance/tacit-knowledge-backlog.md) (tacit backlog)
- SOP: [../engineer/process/knowledge-review.md](../engineer/process/knowledge-review.md)
