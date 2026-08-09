---
title: team topology / Team Overview
aliases: [Team Overview, team topology, RACI quick reference]
tags: [team, RACI, role, topology, tacit-knowledge]
category: knowledge-curator/people/team
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
review_cycle: yearly
tacit: true
roles: [knowledge-curator]
benefit: "Team members understand the current team structure, roles, and collaboration conventions for effective cross-team coordination"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./roster.md
  - ../../../engineer/process/raci-matrix.md
  - ../../governance/tacit-knowledge-backlog.md
---

# team topology / Team Overview

> **As a** knowledge curator, **I want to** team overview, **so that** people discoverable.

> Tacit knowledge T006 first precipitated — team topology and role RACI quick reference. Skeleton placeholder, to be filled in quarterly workshop.

## Summary

- Team topology and role RACI are essential for new-hire onboarding and cross-team collaboration, but have not yet been precipitated
- Three-layer structure: Owner / strategy layer, execution layer, support layer
- RACI = Responsible (execution) / Accountable (final accountability) / Consulted (review) / Informed (informed)
- Quarterly workshop scans topology and RACI once, update this table

## Core viewpoints

**Team topology is the highest-leverage and most neglected documentation.** A clear topology diagram with RACI assignments reduces the coordination cost of every cross-team decision by telling people who to talk to and who decides. The absence of this documentation means every decision requires a chain of Slack messages to discover who owns what. The cost of not documenting the topology is paid in every meeting, every handoff, and every escalation.

**RACI without an identified Owner is worse than no RACI at all.** A RACI matrix where every row has an empty "Accountable" column creates the illusion of clarity while hiding the absence of accountability. When something goes wrong, everyone points to the RACI and says "I was Responsible, not Accountable." The Owner (Accountable) is the single person who cannot delegate their accountability. If the RACI does not force the question "who gets fired if this fails," it is not a real RACI.

**Team topology is a living document that must survive personnel changes.** A topology that lists specific people's names without documenting the roles they fill will be obsolete within 6 months. The topology should describe roles and responsibilities, with names as a separate layer that can be updated independently. When a key person leaves, the topology should still answer: "who owns this decision now?" If the answer is "we need to figure that out," the topology was a phone book, not an architecture.

**The support layer (PM, Design, Data) is the most commonly under-resourced part of the topology.** Engineering teams are visible and funded. The support functions that enable engineering to build the right thing (PM), build it usable (Design), and measure whether it worked (Data) are treated as optional overhead. The topology diagram should make the support layer's dependencies on the execution layer explicit: if PM is understaffed, engineering velocity drops because engineers are making product decisions without context.


- Team topology is tacit knowledge — without precipitation it can only rely on word of mouth, new-hire onboarding is slow, cross-team collaboration is prone to misunderstanding
- RACI must have an Owner for each responsibility — responsibilities without a final accountable person will drift
- Quarterly workshop extraction — tacit knowledge not actively extracted will be lost

## Key information

### concept breakdown: role matrix (RACI quick reference)

| Responsibility | Owner | Executor | Reviewer | Informed |
|---|---|---|---|---|
| Product decisions | _to be added_ | | | |
| Technical architecture | _to be added_ | | | |
| Engineering delivery | _to be added_ | | | |
| QA gatekeeping | _to be added_ | | | |
| Release and operations | _to be added_ | | | |
| Business requirements (BRD) | _to be added_ | | | |
| AI agent (YiAi) | _to be added_ | | | |

> RACI = Responsible (execution) / Accountable (final accountability) / Consulted (review) / Informed (informed)

### concept breakdown: team topology diagram

```
Owner / strategy layer
  ├── Project: YiAi (AI + BRD agent)
  ├── Project: YiPet (browser extension + desktop)
  └── Project: YiVad (main control Web)

Execution layer
  ├── Frontend
  ├── Backend
  ├── AI engineering
  ├── QA
  └── SRE / operations

Support layer
  ├── PM
  ├── Design
  └── Data
```

_to be added: actual personnel names and collaboration preferences._

### key parameter: collaboration conventions (to be added)

- PR review SLA
- Meeting cadence (weekly / monthly retrospective / quarterly review)
- Cross-timezone handoff windows

### key parameter: time zones and working hours (to be added)

Owner and working hours for each region.

### Applicable scenarios

- Required reading for new-hire onboarding
- Align responsibilities before cross-team collaboration
- Quarterly workshop to extract tacit knowledge

## Action recommendations

1. **Quarterly workshop**: Scan topology and RACI once, update this table
2. **Assign Owner for each responsibility**: Responsibilities without a final accountable person will drift
3. **Required reading for new-hire onboarding**: This file + [projects/{proj}/onboarding.md](../../../engineer/projects)
4. **Solidify collaboration conventions**: PR review SLA, meeting cadence, cross-timezone windows written explicitly
5. **Update immediately on major organizational changes**: Do not wait for the quarterly workshop

## Anti-patterns

- **Creating a topology diagram and never updating it.** The topology created during the annual offsite is accurate for approximately 3 months. After that, people change roles, projects are re-scoped, and new hires join. A topology that is more than 6 months old is worse than no topology because it actively misleads. The quarterly workshop is the minimum cadence; major org changes require same-week updates.

- **Listing roles without defining decision rights.** A topology that says "Frontend Lead: Alice" tells you who to talk to but not what Alice can decide. Can Alice choose the frontend framework without approval? Can Alice veto a backend API design that affects frontend performance? Without decision rights, the topology is an org chart, not a governance document. Each role should have a one-sentence decision scope.

- **Treating RACI as a one-time exercise during project kickoff.** The RACI created during the project planning phase assigns responsibilities based on assumptions about who will do what. Three months into execution, the actual work distribution bears no resemblance to the RACI. The RACI must be reviewed and updated at each project milestone, with changes documented and communicated.

- **Creating a topology that only includes engineering roles.** The PM who defines requirements, the designer who creates the UX, the data analyst who measures impact -- these roles are as critical to project success as the engineers who write the code. A topology that omits them signals that their work is secondary, and the resulting coordination failures (engineering builds the wrong thing because PM was not in the design review) are predictable.

- **Filling the topology with "to be added" and never backfilling.** A skeleton topology with placeholder text in every cell is a promise to future selves. If the quarterly workshop comes and goes without filling the placeholders, the tacit knowledge the topology was supposed to capture remains in people's heads. A topology that is 50% placeholders should be marked `status: draft` and prioritized for completion before the next quarter.

## Related

- Same class: [roster.md](./roster.md) — member profile index
- Upstream: [../../../engineer/process/raci-matrix.md](../../../engineer/process/raci-matrix.md) — RACI framework
- Upstream: [../../governance/tacit-knowledge-backlog.md](../../governance/tacit-knowledge-backlog.md) — tacit knowledge backlog T006
- Downstream: [../../../process/handoff-project.md](../../../new-hire/onboarding/handoff-project.md) — project handoff scenario entry
