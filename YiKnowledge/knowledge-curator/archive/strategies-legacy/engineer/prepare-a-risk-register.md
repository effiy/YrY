---
title: I want to build a risk register / Prepare a risk register
aliases: [i-want-to-prepare-a-risk-register, risk-register, risk-log, risk-tracking]
tags: [journey, methodology, risk-management, risk-register, governance, planning]
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user story header + 7 fixed-order sections"
related:
  - ../processes/do-a-pre-mortem.md
  - ./prepare-a-decision-log.md
  - ./prepare-a-quarterly-review.md
  - ../../oncall-sre/incident-response/prepare-an-incident-response-plan.md
  - ./prepare-a-business-continuity-plan.md
  - ../processes/do-a-threat-modeling.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A risk register is not just a table; it is living documentation. Identify + assess + mitigate + track + close; persistently updated; not one-shot; not by memory
---

# I want to build a risk register

> **As an** engineer, **I want to** prepare a risk register, **so that** launch is safe. 

## Summary

- Risk register = living documentation; not a one-shot table
- Identify + assess + mitigate + track + close; full lifecycle
- Each risk must tag probability / impact / trigger condition / owner / status
- Priority = probability × impact; not by intuition
- Mitigation strategy: each risk must tag a solution; not just a name
- Persistent tracking not one-shot; regular review
- Links with pre-mortem + decision log + quarterly retrospective
- Links with IR + BCP + threat modeling
- Publicly discoverable; not hidden
- No blame, no judgment; tracking only
- First principles / inversion / second-order / Occam's razor

## Scenario description

A risk register is living documentation; not a one-shot table. This entry gives the risk register full path, covering identify + assess + mitigate + track + close full lifecycle, each risk must tag probability / impact / trigger condition / owner / status, priority = probability × impact, mitigation strategy each risk must tag a solution, persistent tracking regular review, links with pre-mortem + decision log + quarterly retrospective, links with IR + BCP + threat modeling, publicly discoverable not hidden, no blame no judgment, and links to do-a-pre-mortem / prepare-a-decision-log / prepare-a-quarterly-review / prepare-an-incident-response-plan / prepare-a-business-continuity-plan / do-a-threat-modeling and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | pre-mortem | [../processes/do-a-pre-mortem.md](../processes/do-a-pre-mortem.md) |
| 2 hops | Decision log | [./prepare-a-decision-log.md](./prepare-a-decision-log.md) |
| 2 hops | Quarterly retrospective | [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) |
| 2 hops | IR | [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) |
| 2 hops | BCP | [./prepare-a-business-continuity-plan.md](./prepare-a-business-continuity-plan.md) |
| 2 hops | threat modeling | [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Identify risk**: technology / team / market / resource / time / compliance / external dependency; no leakage category
2. **Each risk must tag**: probability / impact / trigger condition / owner / status; no vagueness
3. **Probability classification**: high / medium / low; or 1-5; no vagueness
4. **Impact classification**: high / medium / low; or 1-5; no vagueness
5. **Priority = probability × impact**: not by intuition
6. **Mitigation strategy**: each risk must tag a solution; not just a name; accept / mitigate / transfer / avoid
7. **Owner must tag**: each risk must have a person; not ownerless
8. **Status tracking**: open / mitigating / monitoring / closed; no vagueness
9. **Persistent tracking**: not one-shot; regular review weekly / monthly
10. **Trigger condition quantitative**: what signal triggers mitigation; no vagueness
11. **Link with pre-mortem**: pre-mortem output → risk register
12. **Link with decision log**: risk decisions enter decision log
13. **Link with quarterly retrospective**: quarterly retrospective reviews risks
14. **Link with IR**: risk trigger → IR contingency
15. **Link with BCP**: high-impact risks → BCP contingency
16. **Link with threat modeling**: security risks come from threat modeling
17. **Publicly discoverable**: everyone can look up; not hidden
18. **No blame no judgment**: tracking only; not blame
19. **First principles**: why must risk register; worst consequence of not doing
20. **Inversion**: how much can be solved using pre-mortem; if solvable do not introduce a register
21. **Second-order thinking**: second-order consequence after register (governance consistency / hiring / trust / decisions evidenced)
22. **Occam's razor**: register simpler is better; cut redundant fields

## Related

- pre-mortem: [../processes/do-a-pre-mortem.md](../processes/do-a-pre-mortem.md) — risk identify front-load
- decision log: [./prepare-a-decision-log.md](./prepare-a-decision-log.md) — risk decisions archived
- quarterly retrospective: [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) — quarterly review
- IR: [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) — trigger response
- BCP: [./prepare-a-business-continuity-plan.md](./prepare-a-business-continuity-plan.md) — high-impact contingency
- threat modeling: [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) — security risk source
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
