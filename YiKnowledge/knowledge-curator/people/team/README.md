---
title: Team member / Team
tags: [leaf, people, team]
category: knowledge-curator/people/team
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: leaf-readme
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [knowledge-curator]
benefit: "Knowledge curators maintain a team roster and collaboration conventions to support onboarding and cross-team coordination"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present"
related:
 - ../../../new-hire/onboarding/handoff-project.md
 - ../../governance/tacit-knowledge-backlog.md
---

# Team member / Team

> **As a** knowledge curator, **I want to** track team members, experts, and stakeholders, **so that** I can route knowledge requests to the right people.

Archives team member and collaboration conventions. **When before high-value tacit knowledge is missing** — team topology and Role RACI are necessary for new-person onboarding and cross-team collaboration, but not yet codified.

## Scope

- Individual archive (Role, profession domain, Collaboration preference, time zone, current primary responsible project)
- Team topology (Role matrix / RACI quick lookup)
- Collaboration conventions (PR style, meeting cadence, communication channel)

## File types and naming

- `{name}.md`: individual archive
- `team-overview.md`: team topology and Role matrix
- `roster.md`: member archive index

## Frontmatter Template

```yaml
---
title: A member
tags: [team, role]
created: YYYY-MM-DD
source: internal
type: summary
lifecycle: active
tacit: true # first codification of tacit knowledge
review_cycle: quarterly
related:
  - ./roster.md
  - ./team-overview.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended structure

1. Role and responsibility
2. Profession domain
3. Collaboration preference (communication way, PR style, meeting cadence)
4. Time zone / working hours
5. Current primary responsible project

## Already archived

| file | content | status |
|---|---|---|
| [team-overview.md](./team-overview.md) | Team topology and RACI matrix | active |
| [roster.md](./roster.md) | Member archive index | active |

## Related leaf

- [../../../process/handoff-project.md](../../../new-hire/onboarding/handoff-project.md) — onboarding must read
- [../stakeholders/](../stakeholders/) — external party stakeholders
- [../../../engineer/process/raci-matrix.md](../../../engineer/process/raci-matrix.md) — RACI framework
- [../../../new-hire/onboarding](../../../new-hire/onboarding) — onboarding Template

## Privacy and compliance

- Only archive work-related information
- Do not archive private contact methods
- Content changes need the person's confirmation
