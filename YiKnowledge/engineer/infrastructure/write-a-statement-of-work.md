---
title: Write a statement of work
aliases: [i-want-to-write-a-statement-of-work, sow, scoping, scope-creep, msa, coi]
tags: [journey, process, sow, statement-of-work, scoping, scope-creep, msa, coi, acceptance-criteria]
category: engineer/infrastructure
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "SOWs define clear scope, deliverables, and acceptance criteria, preventing scope creep and misaligned expectations"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
  - ../process/operate-as-a-forward-deployed-engineer.md
  - ../process/apply-consulting-frameworks.md
  - ../architecture-design/design-a-minimum-viable-architecture.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: "A SOW is a contract not a plan. Boundary clear: in-scope + out-of-scope + phased + acceptance + anti-creep; MSA / SOW / CoI three-layer division; not in SOW = scope creep"
---

# I want to write a statement of work

> **As an** engineer, **I want to** write a statement of work, **so that** launch is safe.

## Summary

- SOW = contract; not planning documentation
- In-Scope + Out-of-Scope + Phased Delivery + Acceptance Criteria + Anti-Scope-Creep
- MSA / SOW / CoI three-layer division: MSA legal relationship + SOW project boundary + CoI urgency
- Boundary clear; not in SOW = scope creep
- Acceptance Criteria measurable; not "looks good"
- Phased Delivery: MVP → Scale → Optimize
- Distinguish from mutual-action-plan: MAP is two-way action; SOW is one-side contract
- publicly queryable; periodic review
- first principles / inversion / second-order / Occam

## Scenario

A SOW is a contract not a plan. This entry provides the SOW full path, covering In-Scope + Out-of-Scope + Phased Delivery + Acceptance Criteria + Anti-Scope-Creep, covering MSA / SOW / CoI three-layer division, linked with run-a-site-survey + project-handover + do-a-stakeholder-mapping + operate-as-a-forward-deployed-engineer + apply-consulting-frameworks + design-a-minimum-viable-architecture + prepare-a-discovery-call-strategy + prepare-a-mutual-action-plan-strategy, publicly queryable, periodic review, and links to site-survey / handover / stakeholder-mapping / fde-role / consulting-frameworks / mva / discovery-call / mutual-action-plan and other leaves.

## 2-hop reachability paths

| Hop count | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | site-survey | [./run-a-site-survey.md](../engineering/run-a-site-survey.md) |
| 1 hop | handover | [./project-handover.md](../process/project-handover.md) |
| 2 hops | fde-role | [../strategies/operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Contract anchor**: SOW is a contract; not planning documentation
2. **In-Scope clear**: each deliverable measurable
3. **Out-of-Scope explicit**: legacy AS400 integration deferred to Q3; not writing it = creep
4. **Phased Delivery**: MVP (manual trigger + static export) → Scale (auto trigger + streaming) → Optimize
5. **Acceptance Criteria**: measurable; not "looks good"; e.g. >90% recall + <5s latency + 0% hallucination
6. **Anti-Scope-Creep**: changes go through change request; no verbal agreements
7. **MSA / SOW / CoI division**: MSA legal relationship + SOW project boundary + CoI cost of not doing
8. **Definition of Done**: both parties sign; not vague
9. **Not documentation for documentation's sake**: each clause connects to landing evidence
10. **Not sloganeering**: every Acceptance marks a measurement
11. **Versioned**: SOW has versions; evolution is traceable
12. **Link with site-survey**: SOW + on-site findings co-build
13. **Link with handover**: SOW + project handover co-build
14. **Link with stakeholder-mapping**: SOW + stakeholder map co-build
15. **Link with fde-role**: SOW + FDE co-build
16. **Link with consulting-frameworks**: SOW + MECE / BLUF co-build
17. **Link with mva**: SOW + minimum viable architecture co-build
18. **Link with discovery-call**: SOW + discovery call co-build
19. **Distinguish from mutual-action-plan**: MAP is two-way action; SOW is one-side contract
20. **Toolchain**: Google Docs / Notion / DocuSign / Ironclad / Contractbook / Linear
21. **publicly queryable**: SOW everyone can look up; not hidden
22. **periodic review**: evolution updates; not one-shot
23. **first principles**: why must SOW; worst consequence of not doing (scope creep / contract not renewed / team exhausted)
24. **inversion thinking**: how much can verbal communication solve; whether customer legal accepts
25. **second-order thinking**: second-order consequences after SOW (renewal / customer trust / project survival)
26. **Occam**: SOW the more focused the better; cut redundant clauses

## Related

- site-survey: [./run-a-site-survey.md](../engineering/run-a-site-survey.md) — on-site findings co-build
- handover: [./project-handover.md](../process/project-handover.md) — project handover co-build
- stakeholder-mapping: [./do-a-stakeholder-mapping.md](../process/do-a-stakeholder-mapping.md) — stakeholder map co-build
- fde-role: [../strategies/operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) — FDE co-build
- consulting-frameworks: [../strategies/apply-consulting-frameworks.md](../process/apply-consulting-frameworks.md) — consulting frameworks co-build
- mva: [../strategies/design-a-minimum-viable-architecture.md](../architecture-design/design-a-minimum-viable-architecture.md) — minimum viable architecture co-build
- discovery-call: [../strategies/prepare-a-discovery-call-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-discovery-call-strategy.md) — discovery call co-build
- mutual-action-plan: [../strategies/prepare-a-mutual-action-plan-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-mutual-action-plan-strategy.md) — MAP complement
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
