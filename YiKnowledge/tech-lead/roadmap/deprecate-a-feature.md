---
title: Deprecate a feature
aliases: [i-want-to-deprecate-a-feature, deprecate-a-feature, feature-sunset]
tags: [journey, work, pm, deprecation, sunset, end-of-life]
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [tech-lead, engineer]
benefit: "Features are deprecated safely with clear communication, migration paths, and zero user-surprise"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../../engineer/process/handle-customer-feedback.md
  - ../../engineer/infrastructure/migrate-data.md
  - ../../engineer/infrastructure/ship-a-release.md
  - ../../engineer/process/collaborate-across-teams.md
  - ../../engineer/process/measure-product-metrics.md
  - ../../engineer/process/handle-outage-communication.md
  - ../../engineer/process/run-a-retrospective.md
  - ../../knowledge-curator/governance/evolve-the-knowledge-base.md
  - ../../engineer/process/knowledge-deprecation-policy.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
tacit: Deprecation is not deletion; it is phased notification + gradual rollout + rollback safety net + data migration + user communication; the final step is true deletion
---

# I want to deprecate a feature

> **As a** tech lead, **I want to** deprecate a feature, **so that** the system stays coherent.

## Summary

- Five deprecation steps: decision → notification → gradual deprecation → safety-net observation → true deletion
- Decision: north-star alignment + alternative path + impact surface assessment + data compliance
- Notification: users / customers / internal / compliance / stakeholders via multiple channels; at least 1 release cadence in advance
- Gradual deprecation: 1% → 10% → 50% → 100%; feature flag gates each stage; observe feedback at each stage
- Safety-net observation: retain 1 cadence of rollback capability; monitor negative feedback
- True deletion: delete code + drop tables + drop dependencies; retain data backup as safety net

## Scenario

Feature no longer used, technical debt too heavy, compliance requirements, product direction adjustments; deprecation is incident-prone, must proceed in phases. This entry provides the full path from decision to true deletion, covering decision, notification, gradual deprecation, safety-net observation, true deletion five steps, and links to customer feedback, data migration, release, cross-team collaboration, observability, retrospective and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | customer feedback | [../../engineer/process/handle-customer-feedback.md](../../engineer/process/handle-customer-feedback.md) |
| 2 hops | data migration | [../../engineer/infrastructure/migrate-data.md](../../engineer/infrastructure/migrate-data.md) |
| 2 hops | release | [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) |
| 2 hops | cross-team collaboration | [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) |
| 2 hops | measurement | [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) |
| 2 hops | incident communication | [../../engineer/process/handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) |
| 2 hops | retrospective | [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) |
| 2 hops | deprecation policy | [../../engineer/process/knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Decision follows north star**: north-star alignment + alternative path + impact surface assessment + data compliance; what is the worst consequence of not deprecating
2. **Notify at least 1 release cadence in advance**: users / customers / internal / compliance / stakeholders via multiple channels; no silent deprecation
3. **Feature flag gating**: 1% → 10% → 50% → 100%; observe feedback at each stage + block on negative feedback above threshold
4. **Retain rollback safety net**: retain 1 cadence of rollback capability; monitor negative feedback
5. **Data migration up front**: reference [data migration](../../engineer/infrastructure/migrate-data.md); export user data / migrate to alternative feature
6. **Alternative path clear**: users guided to alternative feature; provide export tool where no alternative exists
7. **Cross-team collaboration**: customer success / sales / support / compliance aligned; unified talking points
8. **Data compliance**: check compliance requirements before deleting data; retention period / regulatory reporting
9. **Communication channels**: email / in-app notification / announcement / account manager direct communication multiple channels
10. **True deletion in two steps**: first mark deprecated → delete next release; leave a window for rollback
11. **Retain data backup**: back up before deletion; retain at least 1 year as safety net
12. **Retrospective**: reference [retrospective](../../engineer/process/run-a-retrospective.md); sediment lessons from the deprecation process
13. **Inversion thinking**: what is the worst consequence of not deprecating; if it can be kept, keep it
14. **Second-order thinking**: second-order consequences after deprecation (user churn / compliance / data); don't only look at short-term output

## Related

- customer feedback: [../../engineer/process/handle-customer-feedback.md](../../engineer/process/handle-customer-feedback.md) — negative feedback monitoring
- data migration: [../../engineer/infrastructure/migrate-data.md](../../engineer/infrastructure/migrate-data.md) — user data export
- release: [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) — gradual deprecation gate
- cross-team collaboration: [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) — unified talking points
- measurement: [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) — impact surface assessment
- incident communication: [../../engineer/process/handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) — user notification
- retrospective: [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) — deprecation retrospective
- deprecation policy: [../../engineer/process/knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md) — deprecation process
- Thinking frameworks: [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [first-principles](../../knowledge-curator/templates/thinking--first-principles.md)
