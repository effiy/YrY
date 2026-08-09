---
title: Stakeholder Map
aliases: [Stakeholder Map, Stakeholder Map, Power-Interest Matrix]
tags: [stakeholders, map, RACI, power, interest]
category: knowledge-curator/people/stakeholders
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
benefit: "Team members identify key stakeholders, their interests, and communication cadence for project alignment"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./communication-cadence.md
  - ../../../engineer/process/raci-matrix.md
  - ../../governance/tacit-knowledge-backlog.md
---

# Stakeholder Map

> **As a** knowledge curator, **I want to** stakeholder map, **so that** people discoverable.

> Related to tacit knowledge T006 — the power/interest matrix of external partners and internal approval roles. Skeleton placeholder, to be fully added.

## Summary

- Four quadrants: key decision makers / most satisfied (priority maintenance) / monitor (minimum satisfaction) / inform
- Stakeholders: EU HUB ITBP, RSC business, HQ counterpart business, NSC ITBP, legal, finance
- Each party rated by power/interest, matched to a communication strategy
- Quarterly review scans the matrix; major organization changes update immediately

## Core viewpoints

**The power/interest matrix is the minimum viable stakeholder analysis.** Any stakeholder management strategy more complex than a 2x2 grid is unlikely to be maintained. The power/interest matrix survives because it is simple enough to draw on a whiteboard and deep enough to drive differentiated communication strategies. The four quadrants (key decision makers, most satisfied, monitor, inform) map directly to four resource-allocation strategies: deep involvement, priority maintenance, minimum satisfaction, and keep informed.

**The most common stakeholder mistake is treating high-power, low-interest stakeholders as "inform only."** These are the key decision makers who have the power to kill your project but are not interested in its day-to-day progress. The natural instinct is to leave them alone until you need their approval. The correct strategy is proactive, structured updates: short, data-backed, and focused on the one thing they care about (risk, cost, timeline, or strategic alignment). When they are surprised by a decision, they use their power to block it.

**Stakeholder power is not static; it shifts with organizational changes, project phases, and external events.** A stakeholder who was low-power during the exploration phase becomes high-power during the budget approval phase. A stakeholder who was low-interest during steady-state operations becomes high-interest during an incident. The matrix must be re-evaluated at each project phase transition, not just on the quarterly calendar.

**The stakeholder map is a political document, not a technical one.** It describes power relationships, competing interests, and organizational dynamics. This makes it simultaneously the most valuable and the most sensitive piece of team documentation. It should be factual (power and interest ratings based on observable behavior, not personal opinion) and restricted (visible to the team, not published externally).


- Power/interest matrix determines communication strategy — not all stakeholders need equal investment
- Key decision makers and most-satisfied quadrants are priority maintenance objects — monitor and inform quadrants need only minimum satisfaction
- Major organization changes update immediately — do not wait for quarterly review

## Key information

### concept breakdown: power/interest matrix

```
        High power
          |
   |   Key decision makers   |   Most satisfied (priority maintenance)
   |   (high power, low interest) |   (high power, high interest)
   ----------------------------------------------------
   |   Monitor (minimum satisfaction) |   Inform
   |   (low power, low interest) |   (low power, high interest)
          |
        Low power             High interest
```

### keyparameter: stakeholder list (to be fully added)

| Stakeholder | Power | Interest | Quadrant | Communication strategy |
|---|---|---|---|---|
| EU HUB ITBP | _to be added_ | _to be added_ | | |
| RSC business | _to be added_ | _to be added_ | | |
| HQ counterpart business | _to be added_ | _to be added_ | | |
| NSC ITBP | _to be added_ | _to be added_ | | |
| Legal | _to be added_ | _to be added_ | | |
| Finance | _to be added_ | _to be added_ | | |

### keyparameter: decision rights and impact scope (to be added)

Each role's decision scope, impact radius, typical scenarios.

### keyparameter: key contacts (to be added)

Each role's key contacts (work channels only).

### Applicable scenarios

- Identify stakeholders at the start of a new project
- Align communication strategy before cross-organization collaboration
- Quarterly review scan of the matrix

## Action recommendations

1. **Rate each party's power/interest**: high / medium / low
2. **Match communication strategy**: key decision makers deeply involved, most satisfied priority maintenance, monitor minimum satisfaction, inform
3. **Record decision rights and impact scope**: each party writes decision scope and impact radius
4. **Fill work channels for key contacts**: no private contact info collected
5. **Quarterly review**: scan the matrix, update power/interest ratings
6. **Major organization changes update immediately**: do not wait for quarterly review

## Anti-patterns

- **Treating all stakeholders with the same communication strategy.** Every stakeholder gets the same weekly status email because "it is easier." The key decision maker who needs a 3-line risk summary gets a 3-page detail report and misses the one thing they needed to know. The highly interested stakeholder who needs technical depth gets a surface-level summary and escalates because they feel uninformed. One-size-fits-all communication is one-size-fits-none.

- **Rating stakeholders based on org-chart position rather than actual influence.** The VP with the impressive title but no decision-making authority on your project is rated high-power. The individual contributor who has the ear of the actual decision-maker is rated low-power. The resulting communication strategy targets the wrong person. Power ratings should be based on "who can block or accelerate this project," not "who has the most senior title."

- **Collecting private contact information in the stakeholder map.** Personal phone numbers, private email addresses, and social media profiles have no place in a team document. Work channels only (work email, Slack, work phone). The stakeholder map is a collaboration tool, not a CRM. Private contact information in a shared document is a privacy violation and a security risk.

- **Assuming the stakeholder map from the last project applies to the new project.** The stakeholder map is project-specific because power and interest are project-specific. The CFO who was high-power, high-interest for a budget-sensitive project may be low-power, low-interest for a technical infrastructure project. Reusing the stakeholder map across projects without re-evaluating each stakeholder's power and interest for the specific project context produces a communication strategy that targets the wrong people.

- **Failing to update the map when a stakeholder's role changes.** A stakeholder moves to a different department, gets promoted, or leaves the company. The map is not updated. The team continues sending updates to someone who no longer has decision-making authority, while the new decision-maker receives no communication and feels excluded. The stakeholder map must be updated within one week of any known stakeholder role change.

## Related

- Same class: [communication-cadence.md](./communication-cadence.md) — communication cadence
- Upstream: [../../../engineer/process/raci-matrix.md](../../../engineer/process/raci-matrix.md) — RACI framework
- Upstream: [../../governance/tacit-knowledge-backlog.md](../../governance/tacit-knowledge-backlog.md) — tacit knowledge backlog T006
- Downstream: [../team/team-overview.md](../team/team-overview.md) — team topology
