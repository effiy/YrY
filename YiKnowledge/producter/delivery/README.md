---
title: meeting / Meetings
tags: [leaf, work, meetings]
category: producter/delivery
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter, leader]
benefit: "PMs find the right meeting format for each delivery phase, ensuring meetings drive decisions not just status updates"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../engineer/run/review-lessons.md
  - ../../curator/templates/meeting-notes.md
  - ../../engineer/run/sprint-retrospective.md
---

# meeting / Meetings

> **As a** product manager, **I want to** run effective meetings and delivery processes, **so that** the team stays aligned and ships predictably.

Collects meeting templates, meeting-notes standards, and meeting-efficiency principles.

## Included scope

- weekly meeting / review meeting / retrospective meeting / 1on1
- meeting-notes standards
- meeting-efficiency principles
- async meetings

## file type and naming

- `*-template.md`: meeting templates
- `*-summary.md`: organization summaries for a class of meetings
- Naming uses English kebab-case

## Frontmatter Template

```yaml
---
title: some meeting template
tags: [meeting, type]
created: YYYY-MM-DD
source: internal
type: template
lifecycle: reference
review_cycle: quarterly
related:
  - ./daily-report.md
  - ./dashboard-product-delivery.md
  - ./design-review.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended writing structure (meeting template)

1. Meeting objectives
2. Participants and roles
3. Agenda (including time allocation)
4. Input materials
5. Outputs (decisions / Action Items / Parking Lot)
6. Follow-up tracking

## Already included

- `weekly-meeting-template.md` — weekly meeting template
- `review-meeting-template.md` — review meeting template
- `retrospective-meeting-template.md` — retrospective meeting template
- `weekly-report-sample.md` — weekly report sample (2026 week 31): this week's implementation / next week's plan / blockers / cross-project links / risks
- `daily-report-sample.md` — daily report sample (2026-08-01 Friday): today's completed / PR quick look / next-day plan / blockers / risk radar
- `retrospective-sample.md` — retrospective sample (2026 week 31): Keep / Drop / Try + accumulated outputs + key event timeline
- `one-on-one.md` — 1on1 template with manager's guide, skip-level guide, coaching question bank, and cadence recommendations
- `meeting-efficiency.md` — meeting efficiency principles: classification, hygiene checklist, cost calculator, async-first decision tree
- `async-meeting.md` — async meeting patterns: written proposals, async standups, ADRs, channel selection, team transition roadmap
- `quarterly-planning.md` — quarterly planning meeting template: capacity planning, commitment vs. forecast, dependency management, anti-portfolio

## Related leaf

- [../processes/](.) — meeting companion processes
- [../../engineer/collaboration-process](../../engineer/run/README.md) — collaboration principles
- [../../curator/templates/meeting-notes.md](../../curator/templates/meeting-notes.md) — notes template
- [../../curator/templates/one-on-one.md](../../curator/templates/one-on-one.md) — 1on1 template
- [../../engineer/run/sprint-retrospective.md](../../engineer/run/sprint-retrospective.md) — sprint review template
- [../../engineer/run/review-lessons.md](../../engineer/run/review-lessons.md) — scenario entry
