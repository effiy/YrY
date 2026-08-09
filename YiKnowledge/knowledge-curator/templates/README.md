---
title: template / Templates
aliases: [templates, resources-templates]
tags: [leaf, resources, templates, moc]
category: knowledge-curator/templates
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [knowledge-curator, engineer, product-manager, tech-lead, ai-engineer, new-hire]
benefit: "Content creators find the right template quickly, ensuring consistent structure across all knowledge entries"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ./knowledge-leaf.md
  - ./tech-design.md
  - ./retrospective.md
  - ./meeting-notes.md
  - ./one-on-one.md
  - ./user-research-interview.md
  - ./usability-test-report.md
  - ./adr.md
  - ./tech-selection-evaluation.md
  - ./prd.md
  - ./brd.md
  - ../../engineer/engineering/find-templates-and-prompts.md
  - ../../ai-engineer/methodology/prompts--README.md
---

# template / Templates

> **As a** knowledge curator, **I want to** find the right template quickly, **so that** I can create consistent, well-structured knowledge entries. 

> Collects reusable documentation templates: PRD, BRD, technical design, retrospective, user research, ADR, etc. All template leaves follow the `knowledge-leaf-template.md` seven-section structure; the body contains "template body + field explanation + usage advice + anti-patterns". 

## Scope

- Requirements documentation (PRD / BRD) 
- Technical design, selection evaluation, architecture decision (ADR) 
- Retrospective and review
- User research and usability testing
- Meeting notes, 1on1

## Included

### Template (copy and fill in directly) 

| file | One-liner |
|---|---|
| [knowledge-leaf-template.md](./knowledge-leaf.md) | Unified template for all leaves in the library (SSOT, do not modify)  |
| [tech-design-template.md](./tech-design.md) | Technical design (business / architecture / detail / non-functional)  |
| [retrospective-template.md](./retrospective.md) | retrospective (Keep / Problem / 5-Why / Action)  |
| [meeting-notes-template.md](./meeting-notes.md) | Meeting notes (agenda / decisions / action items)  |
| [one-on-one-template.md](./one-on-one.md) | 1on1 (employee-led + two-way feedback)  |
| [user-research-interview-template.md](./user-research-interview.md) | Semi-structured user research interview outline |
| [usability-test-report-template.md](./usability-test-report.md) | Usability test report |
| [prd.md](./prd.md) | Product requirements documentation |
| [brd.md](./brd.md) | Business requirements documentation |
| [adr-template.md](./adr.md) | Architecture decision record form |
| [tech-selection-evaluation-template.md](./tech-selection-evaluation.md) | Tech selection evaluation form |

### Summary (methodology) 

| file | One-liner |
|---|---|
| [adr-summary.md](./adr.md) | What ADR is, when to write it, how to write it well |
| [tech-selection-evaluation-summary.md](./tech-selection-evaluation.md) | Selection methodology and trade-offs |

## Recommended structure

Each template leaf should contain: 

1. **Summary**: One sentence explaining when to use this template
2. **Template body**: Markdown + placeholders (code blocks) 
3. **Field explanation**: Field name, required, normative table
4. **Usage advice**: Filling conventions, supporting prompts, upstream/downstream documentation
5. **Anti-patterns**: Common misuses and fixes
6. **Related**: Related templates, prompts, processes

## Related leaves

- [../../ai-engineer/methodology/prompts](../../ai-engineer/methodology/prompts) — Supporting prompts
- [../../product-manager/discovery/prd](../../product-manager/discovery/prd) — PRD instance
- [../../product-manager/delivery](../../product-manager/delivery) — Meeting template instance
- [../../engineer/lessons/failures/incident-postmortem.md](../../engineer/lessons/failure-incident-postmortem.md) — Incident retrospective template
- [../../engineer/engineering/find-templates-and-prompts.md](../../engineer/engineering/find-templates-and-prompts.md) — Scenario entry
