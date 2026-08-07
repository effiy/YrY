---
title: Handoff a project
aliases:
- I want to handoff a project
- project handoff entry
tags:
- journeys
- onboarding
- handoff
- project
category: new-hire/onboarding
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- new-hire
benefit: onboarding is smooth
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../new-hire/onboarding/yiai/onboarding.md
- ../../new-hire/onboarding/yipet/onboarding.md
- ../../new-hire/onboarding/yivad/onboarding.md
- ../../new-hire/onboarding/template.md
- ../../new-hire/onboarding/onboarding-checklist.md
- ../../engineer/process/project-handover.md
review_cycle: quarterly
tacit: false
---

# I want to handoff a project

> **As a** new hire, **I want to** handoff project, **so that** onboarding is smooth.

> When taking over or handing off a project, reach onboarding, engineering docs, and handoff process within 2 hops.

## Summary
- 7 project-level onboarding entries (YiAi/YiPet/YiVad etc.) one click away
- Generic 8-section onboarding template + Day-1 task checklist covers new projects
- Handoff process and knowledge-transfer process are documented, avoiding word-of-mouth

## Core viewpoints

**The quality of a handoff is measured by how fast the receiver can ship independently.** A handoff is not complete when the documents are handed over; it is complete when the receiver can make a production change without asking the original owner. The clock starts ticking the moment the handoff meeting ends.

**Documentation alone is not a handoff.** Written docs are necessary but insufficient. A real handoff includes a recorded walkthrough of the key modules, a live debugging session, a Q&A session, and an explicit acknowledgement from the receiver. Without these, the documentation becomes shelfware within a week.

**The handoff process should be part of the project, not an afterthought.** Projects that treat handoff as a final-week checkbox item produce incomplete, rushed documentation. The onboarding.md should be written incrementally from day one, and the handoff checklist should be visible in the project board from sprint zero.

**Every project handoff is a rehearsal for the next one.** After each handoff, capture what was missing, what the receiver struggled with, and what questions came up repeatedly. Feed these back into the onboarding template and the handoff checklist. Without this feedback loop, the same gaps repeat across every project.

## Scenario

When a new member joins, a project changes owner, or someone is borrowed across teams, they need to quickly locate "what this project is / how to run it / who is who". This entry aggregates handoff-related files scattered across `projects/`, `work/onboarding/`, `work/processes/` into 2-hop reachability paths.

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `../../engineer/projects{YiAi,YiPet,YiVad}/onboarding.md` | [YiAi/onboarding.md](../../new-hire/onboarding/yiai/onboarding.md) · [YiPet/onboarding.md](../../new-hire/onboarding/yipet/onboarding.md) · [YiVad/onboarding.md](../../new-hire/onboarding/yivad/onboarding.md) |
| `../../engineer/projects{proj}/engineering/` | [YiAi/engineering/](../../engineer/projects/yiai/engineering) · [YiPet/engineering/](../../engineer/projects/yipet/engineering) · [YiVad/engineering/](../../engineer/projects/yivad/engineering) |
| `../../new-hire/onboarding` | [template.md](../../new-hire/onboarding/template.md) · [onboarding-checklist.md](../../new-hire/onboarding/onboarding-checklist.md) |
| `../../engineer/processes` | [project-handover-process.md](../../engineer/process/project-handover.md) · [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md) |
| `../../knowledge-curator/people/team` (to be added) | team-overview.md · roster.md |

## Action recommendations

1. First read the target project's `onboarding.md` three sections: "one-line project positioning + tech stack + local-dev getting-started"
2. Run the local dev environment, execute the smoke commands listed in onboarding
3. Complete Day-1 tasks against `work/onboarding/onboarding-checklist.md`
4. The handoff party follows `work/processes/project-handover-process.md` for the knowledge-transfer process, emphasizing "key module tour + common problems and pitfalls"
5. New projects start from the 8-section template in `work/onboarding/template.md` to fill in docs

## Anti-patterns

- **Handing off only code.** Dropping a repository link and a README on the receiver is not a handoff. Without the architecture walkthrough, the dev environment setup guide, and the common pitfalls list, the receiver will spend days reverse-engineering context that the original owner could have transferred in hours.

- **Assuming the receiver reads everything.** The receiver is overwhelmed on day one. They will not read 50 pages of documentation. Prioritize the three sections that matter most: one-line project positioning, tech stack, and how to run locally. Everything else can be referenced later.

- **No recorded walkthrough.** Live walkthroughs are ephemeral. Without a recording, the receiver has no way to revisit the explanation of a complex module or a subtle architectural decision. Record every handoff walkthrough and link it from the onboarding doc.

- **Handoff without a checklist.** An unstructured handoff conversation inevitably misses critical items (environment variables, database access, deployment pipeline, monitoring dashboards, on-call rotation). Use the onboarding-checklist.md as the agenda and check off every item before the handoff is declared complete.

- **Handoff treated as a one-time event.** The receiver will have questions for weeks after the handoff. The original owner should schedule a 30-minute follow-up one week later, and remain available for async questions. A handoff without a follow-up is a handoff that will quietly fail.

## Related

- Similar journey: [../../engineer/process/check-engineering-gotchas.md](../../engineer/process/check-engineering-gotchas.md) — project pitfalls log
- Similar journey: [../../engineer/lessons/learn-pm-frameworks.md](../../engineer/lessons/learn-pm-frameworks.md) — iteration PM handbook
- Upstream: [../../knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — journey design basis
- Upstream: [../../knowledge-curator/diagrams/directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) — directory blueprint
