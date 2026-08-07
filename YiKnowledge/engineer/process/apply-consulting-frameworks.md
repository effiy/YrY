---
title: Apply consulting frameworks
aliases:
- i-want-to-apply-consulting-frameworks
- pyramid-principle
- mece
- trusted-advisor
- three-whys
- bluf
tags:
- journey
- methodology
- consulting
- pyramid-principle
- mece
- trusted-advisor
- three-whys
- bluf
category: engineer/process
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present"
related:
- ./operate-as-a-forward-deployed-engineer.md
- ./design-a-minimum-viable-architecture.md
- ../processes/run-a-site-survey.md
- ../processes/write-a-statement-of-work.md
- ./prepare-a-discovery-call-strategy.md
- ./prepare-a-consultative-selling-strategy.md
- ../../knowledge-curator/templates/thinking/first-principles.md
- ../../knowledge-curator/templates/thinking/inversion.md
- ../../knowledge-curator/templates/thinking/second-order-thinking.md
- ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Consulting frameworks are not rhetoric; they are structured thinking. Pyramid BLUF: bottom-line up front, conclusions before support; MECE: mutually exclusive, collectively exhaustive; Trusted Advisor formula: the lower the Self-Orientation the higher the trust; Three Whys: find the root cause; CoI: quantify the cost of inaction"
---

# I want to apply consulting frameworks

> **As an** engineer, **I want to** apply consulting frameworks, **so that** launch is safe.

## Summary

- Consulting frameworks = structured thinking; not rhetoric
- Pyramid principle BLUF: Bottom-Line Up Front; conclusion before support
- MECE: Mutually Exclusive Collectively Exhaustive; no overlap, no omission
- Trusted Advisor formula: Trust = (Credibility + Reliability + Intimacy) / Self-Orientation
- Three Whys diagnosis: System of Record + Cost of Inaction + Day 2
- Cost of Inaction: quantify the cost of not doing it
- MVA + SOW + Discovery Call links
- Distinct from consultative-selling: sales vs structured thinking
- Publicly discoverable; Regular review
- First principles / inversion / second-order / Occam's razor

## Scenario description

Consulting frameworks are not rhetoric; they are structured thinking. This entry gives the full consulting-framework path, covering Pyramid principle BLUF + MECE + Trusted Advisor formula + Three Whys diagnosis + Cost of Inaction, and links with operate-as-a-forward-deployed-engineer + design-a-minimum-viable-architecture + run-a-site-survey + write-a-statement-of-work + prepare-a-discovery-call-strategy + prepare-a-consultative-selling-strategy + prepare-a-stakeholder-mapping-strategy, publicly discoverable, regular review, and links to fde-role / mva / site-survey / sow / discovery-call / consultative-selling / stakeholder-mapping and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | fde-role | [./operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) |
| 1 hop | mva | [./design-a-minimum-viable-architecture.md](../architecture-design/design-a-minimum-viable-architecture.md) |
| 2 hops | site-survey | [../processes/run-a-site-survey.md](../engineering/run-a-site-survey.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **BLUF anchoring**: Bottom-Line Up Front; conclusion before support; no storytelling
2. **Pyramid principle**: conclusion → 3 pillars → data; do not pile data
3. **MECE decomposition**: mutually exclusive + collectively exhaustive; no overlap, no omission
4. **Trusted Advisor formula**: Trust = (Credibility + Reliability + Intimacy) / Self-Orientation
5. **Lower Self-Orientation**: focus on the customer's win; do not sell product features
6. **Three Whys diagnosis**: System of Record + Cost of Inaction + Day 2
7. **System of Record**: where is the ground truth; an Excel on someone's desk for a project = already high-risk
8. **Cost of Inaction**: quantify the cost of not doing it; drives urgency
9. **Day 2 perspective**: who operates after the FDE leaves; no internal owner = project will die
10. **Discovery Five Whys**: ask why 5 times to find the root cause
11. **Not framework for framework's sake**: each framework item must connect to implementation evidence
12. **No empty slogans**: each principle tagged with scenario and measurement
13. **Versioned**: consulting logs have versions; evolution is traceable
14. **Link with fde-role**: consulting frameworks + FDE co-build
15. **Link with mva**: consulting frameworks + minimum viable architecture co-build
16. **Link with site-survey**: consulting frameworks + on-site discovery co-build
17. **Link with sow**: consulting frameworks + statement of work co-build
18. **Link with discovery-call**: consulting frameworks + discovery call co-build
19. **Distinct from consultative-selling**: this file leans toward McKinsey-style structured thinking; the latter leans toward sales
20. **Toolchain**: Mermaid / Excalidraw / Miro / Notion / Linear / Google Docs
21. **Publicly discoverable**: frameworks everyone can look up; not hidden
22. **Regular review**: evolve and update; not one-shot
23. **First principles**: why must structured thinking; worst consequence of not doing it (chaos / misjudgment / trust collapse)
24. **Inversion**: how much can self-driven effort solve; if solvable, do not introduce a heavy framework
25. **Second-order thinking**: second-order consequences after the framework (customer renewal / project survival / team reputation)
26. **Occam's razor**: the fewer frameworks the better; cut the redundant

## Related

- fde-role: [./operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) — FDE co-build
- mva: [./design-a-minimum-viable-architecture.md](../architecture-design/design-a-minimum-viable-architecture.md) — Minimum Viable Architecture co-build
- site-survey: [../processes/run-a-site-survey.md](../engineering/run-a-site-survey.md) — on-site discovery co-build
- sow: [../processes/write-a-statement-of-work.md](../infrastructure/write-a-statement-of-work.md) — statement of work co-build
- discovery-call: [./prepare-a-discovery-call-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-discovery-call-strategy.md) — discovery call co-build
- consultative-selling: [./prepare-a-consultative-selling-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-consultative-selling-strategy.md) — sales complement
- stakeholder-mapping: [./prepare-a-stakeholder-mapping-strategy.md](do-a-stakeholder-mapping.md) — stakeholder map co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
