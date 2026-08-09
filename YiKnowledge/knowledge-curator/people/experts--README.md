---
title: External Experts Directory
tags: [leaf, people, experts]
category: knowledge-curator/people/experts
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [knowledge-curator]
benefit: "Knowledge curators maintain a roster of external experts and authorities to reference for technical decisions and methodology"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../governance/tacit-knowledge-backlog.md
---

# External Experts Directory

> **As a** knowledge curator, **I want to** track team members, experts, and stakeholders, **so that** I can route knowledge requests to the right people.

Curates industry experts and technical authorities. **Currently a tacit-knowledge gap** — the external expert network (lawyers / translators / industry consultants) is a key resource for decision makers, but has not yet been captured (see [T007](../../governance/tacit-knowledge-backlog.md)).

## Scope

- Industry experts (public talks, articles, blogs)
- Technical authorities (papers, open-source project maintainers)
- External consultants (lawyers / translators / industry consultants)

## File types and naming

- `{expert-name}.md`: individual profile
- `external-experts-roster.md`: index of the external expert roster

## Frontmatter template

```yaml
---
title: Expert Name
tags: [expert, domain]
created: YYYY-MM-DD
source: <homepage / social link>
type: summary
lifecycle: active
last_verified: YYYY-MM-DD
review_cycle: quarterly
related:
  - ./external-experts-roster.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended structure

1. Background and career history
2. Key viewpoints and works
3. Areas of focus
4. Reference value (which endorsement scenarios it fits)
5. Contact channels (public channels only)

## Included

| file | content | status |
|---|---|---|
| [external-experts-roster.md](./external-experts-roster.md) | External expert roster — lawyers, translators, industry consultants index | active |

## Related leaves

- [../../governance/tacit-knowledge-backlog.md](../../governance/tacit-knowledge-backlog.md) — tacit knowledge backlog T007
- [../team/](../team/) — internal team
- [../../../executive/industry/competitors](../../../executive/industry/competitors) — competitor vendor experts
- [../../templates/thinking](../../templates/thinking) — mental model authorities

## Privacy and compliance

- Only public information is curated (public talks, articles, blogs)
- Private contact information is not included
- Mark `last_verified` with the date the information was last verified
