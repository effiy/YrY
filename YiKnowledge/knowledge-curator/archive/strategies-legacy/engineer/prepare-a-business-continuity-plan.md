---
title: I want to prepare a business continuity plan / Prepare a business continuity plan
aliases: [i-want-to-prepare-a-business-continuity-plan, business-continuity-plan, bcp, continuity-plan]
tags: [journey, methodology, business-continuity, bcp, disaster-recovery, risk-management, governance]
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
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md
  - ../../oncall-sre/incident-response/prepare-an-incident-response-plan.md
  - ./handle-outage-communication.md
  - ../../executive/strategy/prepare-a-data-retention-policy.md
  - ../processes/do-a-pre-mortem.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../../oncall-sre/incident-response/run-a-game-day.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: BCP is not just technical recovery; it is business continuity. People + process + communication + vendor + compliance + finance; RTO/RPO quantified; not just DR; periodic drills
---

# I want to prepare a business continuity plan

> **As an** engineer, **I want to** prepare a business continuity plan, **so that** launch is safe. 

## Summary

- BCP = business continuity; not just technical recovery
- Six dimensions: people + process + communication + vendor + compliance + finance
- RTO/RPO quantified; not vague
- DR is a technical subset; BCP is the business full picture
- Key business process identification; prioritized
- BIA business impact analysis; quantifies losses
- Drills periodic; not just documentation
- Links with IR + DR + compliance
- Supply chain + multi-vendor plans
- Documented + accessible; usable during incidents
- periodic review; architecture evolution must update
- first principles / inversion / second-order / Occam

## Scenario

BCP is the full picture of organizational resilience; not just technical recovery. This entry provides the BCP full path, covering six dimensions, RTO/RPO quantified, DR is a subset, key business process identification, BIA business impact analysis, periodic drills, linking with IR + DR + compliance, supply chain + multi-vendor plans, documented and accessible, periodic review, and links to prepare-a-disaster-recovery-plan / prepare-an-incident-response-plan / handle-outage-communication / prepare-a-data-retention-policy / do-a-pre-mortem / handle-data-compliance / run-a-game-day and other leaves. 

## 2-hop reachability paths

| Hops | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | DR plan | [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md) |
| 2 hops | IR plan | [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) |
| 2 hops | Outage communication | [./handle-outage-communication.md](./handle-outage-communication.md) |
| 2 hops | Data retention | [../../executive/strategy/prepare-a-data-retention-policy.md](../../executive/strategy/prepare-a-data-retention-policy.md) |
| 2 hops | pre-mortem | [../processes/do-a-pre-mortem.md](../processes/do-a-pre-mortem.md) |
| 2 hops | Data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hops | game day | [../../oncall-sre/incident-response/run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Six dimensions**: people + process + communication + vendor + compliance + finance; no missing dimension
2. **RTO/RPO quantified**: each key process must tag RTO + RPO; not vague
3. **DR is a subset**: BCP is the business full picture; DR is the technical subset
4. **Key business process identification**: list key business processes; sort by priority
5. **BIA business impact analysis**: quantify losses per process (revenue / users / compliance / reputation)
6. **Drills periodic**: full-scale annually + tabletop quarterly; not just documentation
7. **Link with IR**: P0 incidents trigger IR; long incidents trigger BCP
8. **Link with DR**: technical recovery goes through DR
9. **Link with compliance**: align with regulations; leave no compliance gaps
10. **Supply chain + multi-vendor**: key vendors multi-sourced; not single point
11. **Documented + accessible**: findable and accessible during incidents; not dependent on individuals
12. **Communication plan**: internal / external / customer / media / regulator
13. **People plan**: backup personnel + remote work + emergency contacts
14. **Financial impact**: quantify financial loss of incidents; insurance / reserves
15. **first principles**: why must have BCP; worst consequence of not writing it
16. **inversion thinking**: how much can be solved with DR + IR; if solvable, do not introduce BCP
17. **second-order thinking**: second-order consequences after BCP (resilience / hiring / culture / compliance)
18. **Occam**: BCP the simpler the better; cut redundant dimensions

## Related

- DR plan: [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md) — technical subset
- IR plan: [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) — incident response
- Outage communication: [./handle-outage-communication.md](./handle-outage-communication.md) — communication plan
- Data retention: [../../executive/strategy/prepare-a-data-retention-policy.md](../../executive/strategy/prepare-a-data-retention-policy.md) — data dimension
- pre-mortem: [../processes/do-a-pre-mortem.md](../processes/do-a-pre-mortem.md) — risk identification
- Data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — compliance dimension
- game day: [../../oncall-sre/incident-response/run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) — drill
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
