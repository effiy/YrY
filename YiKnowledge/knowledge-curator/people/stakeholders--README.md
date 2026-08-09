---
title: Stakeholders Directory
tags:
- leaf
- people
- stakeholders
category: knowledge-curator/people/stakeholders
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: leaf-readme
lifecycle: reference
status: stable
review_cycle: quarterly
roles:
- knowledge-curator
benefit: people discoverable
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present"
related:
- ../../../new-hire/onboarding/handoff-project.md
---

# Stakeholders Directory

> **As a** knowledge curator, **I want to** track team members, experts, and stakeholders, **so that** I can route knowledge requests to the right people.

Collects business stakeholder information (external partners, approval roles, etc.).

## Scope

- External partners (EU HUB ITBP / RSC business / HQ counterparts / NSC ITBP)
- Internal approval roles and decision rights
- Communication cadence and collaboration patterns

## File types and naming

- `{role-or-org}.md`: single party profile
- `stakeholder-map.md`: stakeholder map
- `communication-cadence.md`: communication cadence

## Frontmatter template

```yaml
---
title: Some Stakeholder
tags: [stakeholder, role]
created: YYYY-MM-DD
source: internal
type: summary
lifecycle: active
tacit: true
review_cycle: quarterly
related:
  - ./communication-cadence.md
  - ./stakeholder-map.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended structure

1. Role and responsibilities
2. Concerns and demands
3. Decision rights and impact scope
4. Collaboration pattern (communication cadence, approval stream)
5. Key contact (if applicable)

## Included

| file | content | status |
|---|---|---|
| [stakeholder-map.md](./stakeholder-map.md) | Stakeholder map — power/interest matrix, engagement strategy per quadrant | active |
| [communication-cadence.md](./communication-cadence.md) | Communication cadence — meeting rhythm, escalation paths, reporting templates | active |

## Related leaves

- [../../../process/handoff-project.md](../../../new-hire/onboarding/handoff-project.md) — handoff must-read
- [../team/](../team/) — internal team
- [../../../engineer/process/raci-matrix.md](../../../engineer/process/raci-matrix.md) — RACI
- [../../../engineer/process/project-handover.md](../../../engineer/process/project-handover.md) — handoff process

## Privacy and compliance

- Only work-related information is collected
- Private contact information is not collected
- Content changes require confirmation from relevant parties
