---
title: member profile index / Roster
aliases:
- Roster
- member profile index
- team roster
tags:
- team
- member
- index
- profile
category: knowledge-curator/people/team
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
review_cycle: yearly
roles:
- knowledge-curator
benefit: people discoverable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./team-overview.md
tacit: false
---

# member profile index / Roster

> **As a** knowledge curator, **I want to** roster, **so that** people discoverable.

> List team member profiles by role — one `{name}.md` file per member.

## Summary

- List team member profiles by role, one independent `.md` file per member
- Add process: create profile → fill per README writing structure → add a row here → member confirms
- After departure, mark profile `status: deprecated`, move to `archive/`

## Core viewpoints

**The roster is a people-discovery tool, not an HR database.** Its purpose is to answer the question "who knows about X and how do I work with them effectively?" -- not "what is this person's employee ID and start date?" The profile fields (areas of expertise, collaboration preference, timezone, current project) are designed to reduce the coordination cost of cross-team collaboration. A roster that only lists names and titles is a phone book; a roster that describes how to work with each person is an onboarding accelerator.

**Collaboration preference is the most valuable and most neglected field.** Knowing that someone prefers async communication, reviews PRs within 4 hours, and works 9-18 CET is more actionable than knowing their job title. A new hire who reads the roster should be able to answer: "If I need a code review from Alice, should I DM her or open a PR? What turnaround time should I expect? Is she in a timezone where I should wait until tomorrow?" The collaboration preference field answers these questions before they need to be asked.

**The one-person-one-file structure is the only scalable pattern for a growing team.** A single index table with all member details embedded becomes unreadable at 10+ members and unmaintainable at 20+. The index table + individual profile pattern separates discovery (scan the table to find the right person) from detail (read the profile to learn how to work with them). Adding a new member adds one row to the index and one file to the directory; the index table never grows beyond a single screen.

**Departure archiving is not about preserving history -- it is about preserving the ability to understand historical decisions.** When a team member leaves, their profile contains the context for every decision they were involved in. Deleting the profile deletes the context. Archiving it as `status: deprecated` preserves the record for future reference: "Why did we choose this architecture? Alice was the tech lead at the time, and her profile says she prioritized stability over novelty."


- Single-person profile + index table two-layer structure — index for fast lookup, profile carries details
- Content changes require member confirmation — team member profiles are not modified arbitrarily
- Departure is archived not deleted — preserve historical info, move to `archive/`

## Key information

### concept breakdown: member list

| name | role | main owned project | timezone | profile |
|---|---|---|---|---|
| _to be added_ | | | | |

### concept breakdown: single-person profile writing structure

Refer to [README.md](./):

1. role and responsibilities
2. areas of expertise
3. collaboration preference (communication style, PR style, meeting cadence)
4. timezone / working hours
5. current main owned project

### key parameter: Frontmatter required fields

```yaml
---
title: some member
tags: [team, role]
created: YYYY-MM-DD
source: internal
type: summary
status: stable
lifecycle: active
tacit: true          # tacit knowledge first captured
review_cycle: yearly
related:
  - ./team-overview.md
  - ../README.md
  - ../INDEX.md
---
```

### Applicable scenarios

- New hire onboarding quick people recognition
- Cross-team collaboration to find the right contact
- role and responsibility alignment

## Action recommendations

1. **Create `{name}.md`**: frontmatter with `lifecycle: active` + `tacit: true`
2. **Fill per README writing structure**: role and responsibilities / areas of expertise / collaboration preference / timezone / current main owned project
3. **Add a row here**: name / role / main owned project / timezone / profile link
4. **Member confirms**: content changes require member confirmation
5. **Departure archive**: mark `status: deprecated`, move to `archive/`

## Anti-patterns

- **Piling all member details into the index table instead of creating individual profiles.** The index table with columns for name, role, expertise, timezone, collaboration preferences, and current projects becomes a horizontal-scrolling nightmare at 5+ members and an unreadable wall of text at 10+. The index table is for discovery, not detail. If a column requires more than 10 words to be useful, it belongs in the individual profile.

- **Modifying someone's profile without their review and confirmation.** A team member's collaboration preferences, areas of expertise, and working hours are personal. A well-intentioned editor who updates the profile based on observation ("I think Alice prefers async communication") may be wrong. The profile is a contract between the member and the team; the member must confirm that it accurately represents how they want to be worked with.

- **Deleting profiles on departure instead of archiving.** When a team member leaves, their profile is connected to ADRs, code reviews, incident postmortems, and design decisions. Deleting the profile creates a knowledge gap: future readers of those documents will see the person's name but have no context for who they were, what they knew, and why their opinion carried weight. The archive preserves this context at near-zero cost.

- **Creating profiles that focus on biography rather than collaboration.** "Alice has 10 years of experience in distributed systems and previously worked at Google and Microsoft" is a resume. "Alice prefers async communication via PR comments, works 9-18 CET, reviews frontend PRs within 4 hours, and is the owner for YiVad architecture decisions" is a collaboration guide. The roster is for the latter.

- **Failing to update profiles when roles or projects change.** A profile that says "current project: YiPet" when the person moved to YiVad 3 months ago is actively harmful. New team members will reach out about the wrong project, and the person will spend time redirecting queries. The profile update should be part of the role-change process, not a separate chore.

## Related

- Same class: [team-overview.md](./team-overview.md) — team topology
- upstream: [./README.md](./) — team subdirectories explanation + writing structure
- upstream: [../../../engineer/process/raci-matrix.md](../../../engineer/process/raci-matrix.md) — RACI framework
- upstream: [../../../new-hire/onboarding](../../../new-hire/onboarding) — onboarding template
