---
title: Do a stakeholder mapping
aliases: [i-want-to-do-a-stakeholder-mapping, stakeholder-mapping, stakeholder-analysis]
tags: [journey, methodology, stakeholder, mapping, communication, raci, project-management]
category: engineer/process
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers identify and manage stakeholders to align project goals, reduce miscommunication, and ensure buy-in"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../process/collaborate-across-teams.md
  - ../../product-manager/frameworks/write-a-spec-or-prd.md
  - ../../oncall-sre/incident-response/handle-a-customer-escalation.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Stakeholder mapping is not just listing names; it is classifying + impact + concerns + communication strategy; power/interest matrix; regular update
---

# I want to do a stakeholder mapping

> **As an** engineer, **I want to** do a stakeholder mapping, **so that** outcome is traceable. 

## Summary

- Mapping four pieces: classification + impact + concerns + communication strategy
- Power/interest matrix: four-quadrant classification
- Not just a list; it is a strategy
- Key stakeholders: decision makers / impacted / opponents / supporters
- Communication frequency: tiered by quadrant
- Opponent plan: identify + respond
- Regular update; not one-shot
- Cross-team + cross-organization

## Scenario

Stakeholder mapping is the cornerstone of project success; without mapping, key people / opponents / decision makers are missed. This entry provides mapping full path, covering the four pieces, power/interest matrix, not just a list, key stakeholders, communication frequency, opponent plan, regular update, cross-organization, and links to collaborate-across-teams / prepare-a-team-charter / write-a-spec-or-prd / prepare-a-go-to-market / prepare-an-rfc / handle-a-customer-escalation and other leaves. 

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | cross-team | [../strategies/collaborate-across-teams.md](collaborate-across-teams.md) |
| 2 hops | team charter | [../strategies/prepare-a-team-charter.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-team-charter.md) |
| 2 hops | PRD | [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) |
| 2 hops | GTM | [../../product-manager/frameworks/prepare-a-go-to-market.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-go-to-market.md) |
| 2 hops | RFC | [../strategies/prepare-an-rfc.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-rfc.md) |
| 2 hops | customer escalation | [../../oncall-sre/incident-response/handle-a-customer-escalation.md](../../oncall-sre/incident-response/handle-a-customer-escalation.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Four-piece set**: classification + impact + concerns + communication strategy; no missing piece
2. **Power/interest matrix**: four-quadrant classification; high-power-high-interest / high-power-low-interest / low-power-high-interest / low-power-low-interest
3. **Not just a list**: it is a strategy; not just listing names
4. **Key stakeholders**: decision makers / impacted / opponents / supporters; do not omit
5. **Communication frequency**: tiered by quadrant; high-power-high-interest most frequent
6. **Opponent plan**: identify + respond; don't hide risks
7. **Regular update**: update by project stage; not one-shot
8. **Cross-team + cross-organization**: not just own team; cross-organization
9. **Concern alignment**: each stakeholder has different concerns; targeted communication
10. **Impact assessment**: high / medium / low; tier by impact
11. **Communication channels**: meeting / email / IM / report; choose by stakeholder
12. **RACI related**: mapping related to RACI; no duplication
13. **Decision threshold**: which decisions need which stakeholders involved
14. **First principles**: why must map; worst consequence of not mapping
15. **Inversion thinking**: how much can be solved with RACI + process; if solvable, don't map
16. **Second-order thinking**: second-order consequences after mapping (communication aligned / hiring / decision / opposition) 
17. **Occam**: mapping the simpler the better; cut redundant dimensions

## Related

- cross-team: [../strategies/collaborate-across-teams.md](collaborate-across-teams.md) — RACI / communication
- team charter: [../strategies/prepare-a-team-charter.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-team-charter.md) — in-team stakeholders
- PRD: [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) — requirement stakeholders
- GTM: [../../product-manager/frameworks/prepare-a-go-to-market.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-go-to-market.md) — release stakeholders
- RFC: [../strategies/prepare-an-rfc.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-rfc.md) — decision stakeholders
- customer escalation: [../../oncall-sre/incident-response/handle-a-customer-escalation.md](../../oncall-sre/incident-response/handle-a-customer-escalation.md) — customer stakeholders
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
