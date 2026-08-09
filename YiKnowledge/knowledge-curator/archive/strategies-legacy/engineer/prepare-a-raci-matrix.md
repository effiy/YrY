---
title: I want to prepare a RACI matrix / Prepare a RACI matrix
aliases: [i-want-to-prepare-a-raci-matrix, raci-matrix, raci, responsibility-assignment-matrix]
tags: [journey, methodology, raci, responsibility-matrix, project-management, governance, decision-making]
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
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./collaborate-across-teams.md
  - ../processes/do-a-stakeholder-mapping.md
  - ./prepare-a-team-charter.md
  - ./prepare-a-decision-log.md
  - ../../oncall-sre/incident-response/handle-a-team-conflict.md
  - ./prepare-a-1-on-1.md
  - ./run-iteration-meetings.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/inversion.md
tacit: RACI is not a table; it is a responsibility contract. Every task must tag R/A/C/I; do not omit R; do not share A; R owns doing; A owns decision; C consulted; I informed; periodic review
status: deprecated
---

# I want to prepare a RACI matrix

> **As an** engineer, **I want to** prepare a raci matrix, **so that** launch is safe. 

## Summary

- RACI four roles: R executes / A decides / C consulted / I informed
- Every task must tag R + A; do not omit R; do not share A
- Not just a table; it is a responsibility contract
- A is unique: one A per task; not vague
- R can be multiple; but must coordinate
- C consulted must reply; not just listed
- I informed one-way; do not request reply
- Cross-team + cross-organization
- Periodic review; not one-shot
- Paired with decision log; R + A enter the decision log
- Paired with stakeholder mapping; A = high power high interest
- Not just nouns; they are verbs
- First principles / inversion / second-order / Occam

## Scenario

RACI is a responsibility contract; not a table pile. This entry gives the RACI full path, covering four roles, do not omit R, do not share A, responsibility contract, A unique, R can be multiple, C must reply, I one-way, cross-team, periodic review, paired decision log, paired stakeholder mapping, and links to collaborate-across-teams / do-a-stakeholder-mapping / prepare-a-team-charter / prepare-a-decision-log / handle-a-team-conflict / prepare-a-1-on-1 / run-iteration-meetings and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | cross-team | [./collaborate-across-teams.md](./collaborate-across-teams.md) |
| 2 hops | stakeholder mapping | [../processes/do-a-stakeholder-mapping.md](../processes/do-a-stakeholder-mapping.md) |
| 2 hops | team charter | [./prepare-a-team-charter.md](./prepare-a-team-charter.md) |
| 2 hops | decision log | [./prepare-a-decision-log.md](./prepare-a-decision-log.md) |
| 2 hops | team conflict | [../../oncall-sre/incident-response/handle-a-team-conflict.md](../../oncall-sre/incident-response/handle-a-team-conflict.md) |
| 2 hops | 1on1 | [./prepare-a-1-on-1.md](./prepare-a-1-on-1.md) |
| 2 hops | iteration meetings | [./run-iteration-meetings.md](./run-iteration-meetings.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |

## Action recommendations

1. **Four roles**: R executes / A decides / C consulted / I informed; not vague
2. **do not omit R**: every task must tag R; if no one does it, the task is suspended
3. **do not share A**: one A per task; multiple A means decisions fight
4. **A unique**: A must be unique; not vague
5. **R can be multiple**: R can be multiple people but must coordinate; do not work in silos
6. **C must reply**: C consulted must reply; not just listed
7. **I one-way**: I informed one-way; do not request reply
8. **Responsibility contract**: RACI is a contract; not just a table
9. **Cross-team + cross-organization**: cross-team must tag RACI; not vague
10. **Periodic review**: project phase update; not one-shot
11. **Paired decision log**: R + A enter the decision log; traceable
12. **Paired stakeholder mapping**: A = high power high interest; no conflict
13. **Not just nouns**: they are verbs; each role has actions
14. **Decision threshold**: which decisions A must participate; which can be delegated to R
15. **RACI upgrade**: RACI → RASCI (add S support) / RACI-V (add V verifier) 
16. **First principles**: why must RACI; worst consequence of not writing
17. **Inversion thinking**: how much can be solved with process + documentation; if solvable, do not introduce RACI
18. **Second-order thinking**: second-order consequences after RACI (responsibility clarity / hiring / decisions / conflicts) 
19. **Occam**: the simpler RACI the better; cut redundant roles

## Related

- cross-team: [./collaborate-across-teams.md](./collaborate-across-teams.md) — cross-team RACI
- stakeholder mapping: [../processes/do-a-stakeholder-mapping.md](../processes/do-a-stakeholder-mapping.md) — A = high power high interest
- team charter: [./prepare-a-team-charter.md](./prepare-a-team-charter.md) — decision mechanism + RACI
- decision log: [./prepare-a-decision-log.md](./prepare-a-decision-log.md) — R + A enter decision log
- team conflict: [../../oncall-sre/incident-response/handle-a-team-conflict.md](../../oncall-sre/incident-response/handle-a-team-conflict.md) — unclear-responsibility conflict
- 1on1: [./prepare-a-1-on-1.md](./prepare-a-1-on-1.md) — responsibility feedback
- iteration meetings: [./run-iteration-meetings.md](./run-iteration-meetings.md) — task assignment
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md)
