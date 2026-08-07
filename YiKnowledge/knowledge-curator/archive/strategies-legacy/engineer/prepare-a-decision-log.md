---
title: I want to prepare a decision log / Prepare a decision log
aliases: [i-want-to-prepare-a-decision-log, decision-log, decision-journal]
tags: [journey, methodology, decision-log, adr, knowledge-management, traceability]
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "filename is a descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ../../tech-lead/architecture/design-architecture-decision.md
  - ./prepare-an-rfc.md
  - ./collaborate-across-teams.md
  - ../processes/run-a-retrospective.md
  - ../../tech-lead/roadmap/manage-tech-debt.md
  - ../../tech-lead/roadmap/plan-tech-roadmap.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A decision log is not meeting minutes; it's decision + rationale + alternatives + consequences + retrospective; why this decision; traceable
---

# I want to prepare a decision log

> **As an** engineer,**I want to** prepare a decision log,**so that** launch is safe.

## Summary

- Decision log five sections: decision + rationale + alternatives + consequences + retrospective
- Not meeting minutes; the decision itself
- ADR is engineering decisions; DL is all decisions
- Why this decision; not just the decision itself
- Alternatives must be recorded; not just conclusions
- Consequence tracking; landing verification
- Quarterly retrospective; traceable
- No verbal decisions; must be documented

## Scenario description

Decision log is organizational memory; without it the same issues get discussed repeatedly. This entry gives the full decision log path, covering five sections, not meeting minutes, ADR vs DL, why this decision, alternatives must be recorded, consequence tracking, quarterly retrospective, must be documented, and links to leaves like design-architecture-decision / prepare-an-rfc / collaborate-across-teams / run-a-retrospective / manage-tech-debt / plan-tech-roadmap.

## 2-hop reach paths

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | ADR | [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) |
| 2 hops | RFC | [./prepare-an-rfc.md](./prepare-an-rfc.md) |
| 2 hops | Cross-team | [./collaborate-across-teams.md](./collaborate-across-teams.md) |
| 2 hops | Retrospective | [../processes/run-a-retrospective.md](../processes/run-a-retrospective.md) |
| 2 hops | Tech debt | [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) |
| 2 hops | Roadmap | [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Five-section structure**: decision + rationale + alternatives + consequences + retrospective; no missing sections
2. **Not meeting minutes**: the decision itself; not a flowing account
3. **ADR vs DL**: ADR for engineering decisions; DL for all decisions (product / team / process / hiring)
4. **Why this decision**: not just the decision itself; record rationale
5. **Alternatives must be recorded**: ≥ 3 alternatives; not just conclusions
6. **Consequence tracking**: after landing, record outcomes; verify
7. **Quarterly retrospective**: review each quarter; traceable
8. **Must be documented**: no verbal decisions; must be documented
9. **Decision classification**: engineering / product / team / process / hiring
10. **Decision owner**: every decision must have an owner marked
11. **Decision status**: proposed / accepted / superseded / deprecated
12. **Decision date**: every decision must have a date marked
13. **Decision linkage**: link to RFC / ADR / issue / PR
14. **Decision search**: searchable; by tag / category
15. **First principles**: why a DL is necessary; worst consequence of not having one
16. **Reverse thinking**: how much can ADR + wiki solve; if solvable, do not introduce DL
17. **Second-order thinking**: second-order consequences of DL (decision consistency / hiring / culture / traceability)
18. **Occam**: simpler DL is better; cut redundant fields

## Related

- ADR: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — engineering decisions
- RFC: [./prepare-an-rfc.md](./prepare-an-rfc.md) — decision precursor
- Cross-team: [./collaborate-across-teams.md](./collaborate-across-teams.md) — cross-team decisions
- Retrospective: [../processes/run-a-retrospective.md](../processes/run-a-retrospective.md) — decision retrospective
- Tech debt: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — decision consequences
- Roadmap: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — decision accumulation
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
