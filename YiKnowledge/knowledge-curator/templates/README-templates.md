---
title: Template / Templates
aliases:
- templates
- resources-templates
tags:
- leaf
- resources
- templates
- moc
category: knowledge-curator/templates
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: leaf-readme
status: stable
lifecycle: reference
review_cycle: quarterly
roles:
- knowledge-curator
benefit: template reusable
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present"
related:
- ./knowledge-leaf.md
- ./tech-design.md
- ./retrospective.md
- ./meeting-notes.md
- ./one-on-one.md
- ./user-research-interview.md
- ./usability-test-report.md
- ./adr.md
- ./adr.md
- ./tech-selection-evaluation.md
- ./tech-selection-evaluation.md
- ./prd.md
- ./brd.md
- ../../engineer/engineering/find-templates-and-prompts.md
- ../../executive/industry/README.md
tacit: false
---

# Template / Templates

> **As a** knowledge curator, **I want to** README templates, **so that** template reusable.

> Cataloged reusable document templates: PRD, BRD, tech solution, Retrospective, user research, ADR etc. All template leaves follow the `knowledge-leaf-template.md` seven-section structure; the body contains "Template body + field explanations + usage suggestions + Anti-patterns".

## Cataloging scope

- Requirement documents (PRD / BRD)
- Tech solution, selection assessment, Architecture Decision (ADR)
- Retrospective and review
- User research and usability QA
- Meeting minutes, 1-on-1

## Already cataloged

### Templates (can be directly copied and filled in)

| File | One-liner |
|---|---|
| [knowledge-leaf-template.md](./knowledge-leaf.md) | Unified template for all library leaves (SSOT, do not modify) |
| [tech-design-template.md](./tech-design.md) | Tech solution (business / Architecture / detailed / non-functional) |
| [retrospective-template.md](./retrospective.md) | Retrospective (Keep / Problem / 5-Why / Action) |
| [meeting-notes-template.md](./meeting-notes.md) | Meeting minutes (agenda / decisions / action items) |
| [one-on-one-template.md](./one-on-one.md) | 1-on-1 (employee-driven + two-way feedback) |
| [user-research-interview-template.md](./user-research-interview.md) | Semi-structured user research interview outline |
| [usability-test-report-template.md](./usability-test-report.md) | Usability QA report |
| [prd.md](./prd.md) | Product requirement documents |
| [brd.md](./brd.md) | Business requirement documents |
| [adr-template.md](./adr.md) | Architecture Decision record template |
| [tech-selection-evaluation-template.md](./tech-selection-evaluation.md) | Tech selection assessment template |

### Summaries (methodology)

| File | One-liner |
|---|---|
| [adr-summary.md](./adr.md) | What ADR is, when to write it, how to write it well |
| [tech-selection-evaluation-summary.md](./tech-selection-evaluation.md) | Selection methodology and trade-offs |

## Recommended writing structure

Every template leaf should include:

1. **Summary**: one sentence explaining when to use this template
2. **Template body**: Markdown + placeholders (code block)
3. **Field explanations**: field name, required, format spec
4. **Usage suggestions**: fill-in spec, supporting Prompt, upstream/downstream docs
5. **Anti-patterns**: common misuses and fixes
6. **Related**: related templates, Prompts, Processes

## Related leaf

- `../prompts/` — supporting Prompts
- [../../product-manager/discovery/prd](../../product-manager/discovery/prd) — PRD instance
- [../../product-manager/meetings](../../product-manager/delivery) — meeting template instance
- [../../engineer/lessons/failures/incident-postmortem.md](../../engineer/lessons/failure-incident-postmortem.md) — incident retrospective template
- [../../engineer/engineering/find-templates-and-prompts.md](../../engineer/engineering/find-templates-and-prompts.md) — scenario entry
