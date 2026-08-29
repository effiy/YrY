---
title: Knowledge Curator — Lifecycle view layer
aliases: [lifecycle-view, para-lifecycle]
tags: [lifecycle, moc, para, 4-diagrams]
category: curator
created: 2026-08-03
updated: 2026-08-12
last_verified: 2026-08-12
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [curator]
benefit: "Knowledge curators maintain KB structure, governance, and quality — they do not create domain content"
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - usage guidance explains when to use this template and common mistakes
related:
  - [INDEX.md](./INDEX.md)
  - [COLLABORATION.md](./COLLABORATION.md)
  - [diagrams/](./diagrams/)
  - [governance/](./governance/)
  - [templates/](./templates/)
  - [archive/](./archive/)
  - [../README.md](../README.md)
  - [../MEMORY.md](../MEMORY.md)
---

# Knowledge Curator — Lifecycle view layer

> **Pipeline layer: Knowledge Governance (cross-cutting)** — Maintains the KB structure that all pipeline stages rely on. Spans the entire pipeline.
>
> **As a** knowledge curator, **I want to** maintain the knowledge base with clear governance, **so that** content is discoverable and well-maintained.
>
> Curator is a **META role**. It maintains the KB structure itself — it does NOT create domain content. Domain content belongs to the role directories ([engineer/](../engineer/), [leader/](../leader/), [producter/](../producter/), [aier/](../aier/), [srer/](../srer/), [executiver/](../executiver/)).

## Quick navigation

| Resource | Description |
|---|---|
| [INDEX.md](./INDEX.md) | Curator role index — subdirectory map, file counts, governance lifecycle |
| [COLLABORATION.md](./COLLABORATION.md) | Cross-role collaboration domain index (team process, meetings, onboarding, PM) |
| [governance/](./governance/) ([README](./governance/README.md)) | KB lifecycle, inbox/triage, readiness checklist, tacit backlog — 9 files |
| [diagrams/](./diagrams/) ([README](./diagrams/README.md)) | 4 canonical diagrams: knowledge-map, user-journey, directory-blueprint, dashboard-index — 4 files |
| [templates/](./templates/) ([README](./templates/README.md)) | Reusable templates: knowledge leaf, ADR, PRD, BRD, tech design, meetings, etc. — 15 files |
| [archive/](./archive/) ([README](./archive/README.md)) | Deprecated file index and archival procedures — 2 files |

## Scope

### In scope (curator OWNS)
- **KB governance**: lifecycle management, inbox/triage workflow
- **Content quality**: frontmatter validation, freshness checks, deprecation
- **4 diagrams**: [knowledge map](./diagrams/knowledge-map.md), [user-journey](./diagrams/user-journey.md), [directory blueprint](./diagrams/directory-blueprint.md), [governance flow](./governance/governance.md)
- **Templates**: [knowledge leaf](./templates/knowledge-leaf.md), [ADR](./templates/adr-template.md), [PRD](./templates/prd.md), [tech design](./templates/tech-design.md), [BRD](./templates/brd.md), etc.
- **Archive management**: deprecated file tracking and cleanup via [archive.md](./archive/archive.md)
- **Cross-cutting domain indexes**: [SECURITY](../engineer/SECURITY.md), [COLLABORATION](./COLLABORATION.md), [ENGINEERING](../engineer/ENGINEERING.md)
- **Operations cadence**: weekly/monthly/quarterly/yearly reviews (see [governance.md](./governance/governance.md))

### Out of scope (curator does NOT create)
- Any domain content — architecture, development, AI, PM, SRE, strategy, etc.
- If the content answers "how do I do X?" → belongs in a role directory, not curator/
- Curator only creates content ABOUT the KB itself (governance, diagrams, templates)

## Decision rules for boundary cases

| When content involves... | Route to | Because |
|---|---|---|
| How to write a good knowledge leaf | [curator/templates/](./templates/) | KB meta-content |
| How to design an API | [engineer/build/](../engineer/build/) | Domain content |
| KB review process | [curator/governance/](./governance/) | KB operations |
| Code review process | [engineer/ship/](../engineer/ship/) | Domain content |
| Frontmatter specification | [curator/governance/](./governance/) | KB standards |
| API specification format | [engineer/build/](../engineer/build/) | Domain content |
| KB directory structure | [curator/diagrams/](./diagrams/) | KB architecture |
| System architecture | [engineer/build/](../engineer/build/) | Domain content |
| Deprecation policy for KB files | [curator/governance/](./governance/) | KB lifecycle |
| Deprecation policy for APIs | [engineer/build/](../engineer/build/) | Domain content |

### Curator as the KB's "engineer + sre + leader"

Curator does for the KB what other roles do for the product:
- **Structure** (like [engineer/build/](../engineer/build/)) — directory blueprint, naming conventions
- **Quality** (like [engineer/ship/](../engineer/ship/)) — frontmatter validation, [readiness checklist](./governance/readiness-checklist.md)
- **Operations** (like [srer/](../srer/)) — inbox/triage workflow, review cadence
- **Decisions** (like [leader/](../leader/)) — governance rules, deprecation policy

But curator applies these ONLY to the KB itself, never to the product.

## Pipeline flow

```
┌── curator/ (Knowledge Governance — cross-cutting) ──┐
│  Output: kb-lifecycle, kb-templates, kb-diagrams      │
└──────────────────────────────────────────────────────┘
    │ serves all pipeline stages
    ▼
producter/ ──→ leader/ ──→ engineer/ ──→ srer/
    ↑            ↑            ↑            ↑
    │ templates  │ ADR tmpl   │ leaf tmpl  │ postmortem
    └────────────┴────────────┴────────────┘
```

Curator sits **above** the pipeline, providing templates, governance, and structure to every stage. It does not participate in the stage flow itself — it enables it.

## Summary

- This directory does not participate in topical classification; it only carries lifecycle / 4 diagrams / operations mechanism views, overlaid on semantic categories
- PARA mapping: Projects=`engineer/learn/projects/`, Areas=7 role directories, Archives=`archive/`
- lifecycle field flow: `inbox → triage → active → reference → archive`
- Each of the 4 diagrams is its own file: [knowledge-map](./diagrams/knowledge-map.md) / [user-journey](./diagrams/user-journey.md) / [directory-blueprint](./diagrams/directory-blueprint.md) / [governance](./governance/governance.md)
- Serves both humans and the YiAi BRD Agent: frontmatter `lifecycle`/`related`/`tacit`/`tags`/`category` are key signals for cross-directory RAG recall

## Core viewpoints

- **View layer independent of semantic classification** — the 7 role directories stay unchanged; this directory only adds perspectives, avoiding rewrites of existing content
- **lifecycle field is the single signal of flow** — both AI and humans rely on it to judge which stage a file is in, deciding whether to recall / refine / archive
- **The knowledge map never goes out of date** — AI consumes structured knowledge, garbage in garbage out; explicit + tacit dual inventory is the only moat in the AI era

## Quick start for new curators

1. Read the [governance flow](./governance/governance.md) — understand the 4-role, 3-cadence model
2. Review the [4 diagrams](./diagrams/) — build a mental model of the KB topology
3. Run the [readiness checklist](./governance/readiness-checklist.md) — 10-question gate before any KB change
4. Check [inbox.md](./governance/inbox.md) and [triage.md](./governance/triage.md) — process incoming content
5. Use [templates/](./templates/) when creating new files — start from [knowledge-leaf.md](./templates/knowledge-leaf.md)

## Key info

### PARA / lifecycle mapping

| PARA concept | YiKnowledge mapping | Notes |
|---|---|---|
| Projects | [engineer/learn/projects/](../engineer/learn/projects/) | Active projects with clear goals and deadlines |
| Areas | 7 role directories | Responsibility domains under continuous maintenance |
| Resources | [aier/skills/](../aier/skills/), [curator/templates/](./templates/) | Reusable resources (skills, prompts, templates) |
| Archives | [curator/archive/](./archive/) | Completed or no longer active content |

### lifecycle field flow

```
inbox → triage → active → reference → archive
```

| State | Meaning | Typical files | Managed in |
|---|---|---|---|
| `inbox` | Just captured raw source, unclassified and unrefined | Raw captures, links, notes | [inbox.md](./governance/inbox.md) |
| `triage` | Classified into the correct leaf, pending summary | Classified but unsummarized | [triage.md](./governance/triage.md) |
| `active` | Summarised and referenced | Most `*-summary.md` | Role directories |
| `reference` | Stable methodology/templates, rarely changed | `*-template.md`, methodology files | [templates/](./templates/) |
| `archive` | Deprecated or superseded | Old versions, obsolete content | [archive.md](./archive/archive.md) |

### 4 diagrams in practice

| Diagram | File | Question answered | Sub-README |
|---|---|---|---|
| Knowledge map | [knowledge-map.md](./diagrams/knowledge-map.md) | What knowledge exists? Explicit vs. tacit? | [diagrams/](./diagrams/) |
| User-journey map | [user-journey.md](./diagrams/user-journey.md) | Where is the knowledge? Where are breakpoints? | [diagrams/](./diagrams/) |
| Directory blueprint | [directory-blueprint.md](./diagrams/directory-blueprint.md) | How do users find things at a glance? | [diagrams/](./diagrams/) |
| Governance flow | [governance.md](./governance/governance.md) | Who maintains? How often? 4 roles, 3 cadences | [governance/](./governance/) |

### Catch-all directory and scenario entries

| Entry point | Purpose |
|---|---|
| [inbox.md](./governance/inbox.md) | Catch-all — knowledge transit station for raw captures |
| [triage.md](./governance/triage.md) | Pending-refinement queue — classified but not yet summarized |
| [archive.md](./archive/archive.md) | Archive index — registry of deprecated files |

## Operations cadence

| Cadence | Action | Governed by |
|---|---|---|
| **Weekly** | Process inbox → triage, classify new content | [governance.md](./governance/governance.md) |
| **Monthly** | Review [review-log.md](./governance/review-log.md), check freshness labels | [governance.md](./governance/governance.md) |
| **Quarterly** | Scan 4 diagrams for staleness, review [tacit-knowledge-backlog.md](./governance/tacit-knowledge-backlog.md) | [governance.md](./governance/governance.md) |
| **Yearly** | Scan [archive.md](./archive/archive.md) for physical cleanup, full KB audit | [governance.md](./governance/governance.md) |

## Cross-cutting domain indexes

Curator maintains 3 domain indexes that aggregate content across all role directories:

| Domain index | Aggregates | Answers |
|---|---|---|
| [SECURITY.md](../engineer/SECURITY.md) | Supply chain, appsec, risk, incident response, compliance | Where is all security content? |
| [COLLABORATION.md](./COLLABORATION.md) | Team process, meetings, knowledge sharing, onboarding, PM | Where is all collaboration content? |
| [ENGINEERING.md](../engineer/ENGINEERING.md) | Architecture, quality, data, tools, lessons | Where is all engineering content? |

## Key cross-stage links

### Templates → role directories

| Template | Consumed by |
|---|---|
| [knowledge-leaf.md](./templates/knowledge-leaf.md) | [write-a-prd.md](../producter/discovery/write-a-prd.md), [design-architecture-decision.md](../leader/architecture/design-architecture-decision.md), [implement-an-api.md](../engineer/build/implement-an-api.md) |
| [adr-template.md](./templates/adr-template.md) | [design-architecture-decision.md](../leader/architecture/design-architecture-decision.md) |
| [prd.md](./templates/prd.md) | [producter/discovery/prd/](../producter/discovery/prd/) |
| [brd.md](./templates/brd.md) | [executiver/strategy/](../executiver/strategy/) |
| [tech-design.md](./templates/tech-design.md) | [engineer/build/](../engineer/build/) |

### Governance → role directories

| Governance file | Drives |
|---|---|
| [evolve-the-knowledge-base.md](./governance/evolve-the-knowledge-base.md) | [knowledge-contributor-charter.md](../engineer/run/knowledge-contributor-charter.md) |
| [readiness-checklist.md](./governance/readiness-checklist.md) | Pre-launch gate for all new KB content |
| [review-log.md](./governance/review-log.md) | Content review tracking |
| [tacit-knowledge-backlog.md](./governance/tacit-knowledge-backlog.md) | Tacit knowledge capture |

### SOP references

- Knowledge review SOP: [../engineer/run/knowledge-review.md](../engineer/run/knowledge-review.md)
- Deprecation policy: [../engineer/run/knowledge-deprecation-policy.md](../engineer/run/knowledge-deprecation-policy.md)

## Action recommendations

1. New content lands in [inbox.md](./governance/inbox.md) first, frontmatter `lifecycle: inbox`
2. During weekly review, classify into the correct leaf and change to `lifecycle: triage`, register in [triage.md](./governance/triage.md)
3. After writing the summary, change to `lifecycle: active`; the original source becomes `lifecycle: reference`
4. Quarterly review: scan the 4 diagrams and [tacit-knowledge-backlog.md](./governance/tacit-knowledge-backlog.md); yearly: scan [archive.md](./archive/archive.md) for physical cleanup

## Anti-patterns / common misuse

- **Treating this directory as topical classification** — consequence: overlaps with the 7 role directories, polluting the directory structure. Fix: use the [decision rules](#decision-rules-for-boundary-cases) table above.
- **New files missing lifecycle field** — consequence: weak AI recall signal, operations cannot batch-filter unrefined content. Fix: run the [readiness checklist](./governance/readiness-checklist.md) before publishing.
- **Drawing the 4 diagrams and never reviewing** — consequence: the knowledge map goes stale, breakpoints accumulate into knowledge loss. Fix: follow the [operations cadence](#operations-cadence) schedule.
- **Creating domain content in curator/** — consequence: content is invisible to its intended role audience. Fix: always place domain content in the correct role directory; use the [role boundary decision tree](../README.md#role-boundary-quick-reference).
- **Skipping the inbox → triage → active flow** — consequence: unclassified content accumulates, discoverability degrades. Fix: process [inbox.md](./governance/inbox.md) weekly.

## Related

- **Curator sub-READMES**: [governance/](./governance/README.md) · [diagrams/](./diagrams/README.md) · [templates/](./templates/README.md) · [archive/](./archive/README.md)
- **Curator indexes**: [INDEX.md](./INDEX.md) · [COLLABORATION.md](./COLLABORATION.md)
- **Upstream**: [../README.md](../README.md) (top-level pipeline overview) · [../MEMORY.md](../MEMORY.md) (KB rulebook) · [../INDEX.md](../INDEX.md) (full-library index)
- **4 diagrams**: [knowledge-map.md](./diagrams/knowledge-map.md) · [user-journey.md](./diagrams/user-journey.md) · [directory-blueprint.md](./diagrams/directory-blueprint.md) · [governance.md](./governance/governance.md)