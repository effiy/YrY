---
title: Decompose a monolith
aliases: [i-want-to-decompose-a-monolith, decompose-a-monolith, monolith-to-services]
tags: [journey, methodology, architecture, monolith, strangler-fig, ddd]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead]
benefit: "Monoliths are broken into services incrementally with clear seam identification, reducing migration risk"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
- ../../tech-lead/architecture/design-architecture-decision.md
  - ../infrastructure/roll-out-a-migration.md
  - ../infrastructure/migrate-a-database.md
  - ../../tech-lead/roadmap/manage-tech-debt.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../tech-lead/roadmap/do-a-proof-of-concept.md
  - ../../engineer/architecture-design/one-to-one-mapping-migration.md
  - ../../engineer/architecture-design/staged-port-methodology.md
  - ../../engineer/engineering/evaluation-driven-development.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--inversion.md
tacit: "Decomposing a monolith is not slicing a cake in one cut; it is the strangler-fig pattern bypassing step by step — first build the boundary, then split services; each step is reversible"
---

# I want to decompose a monolith

> **As an** engineer, **I want to** decompose a monolith, **so that** system stays coherent.

## Summary

- Decompose a monolith in five steps: find boundary → build strangler → dual-write → switch reads → retire old monolith
- Find boundary: DDD bounded context + data ownership + call direction; do not split if boundary is unclear
- Build strangler: facade routing layer; new path goes to new service, old path still goes to monolith
- Dual-write: write path writes to both new and old data; reads still go to old; reconcile differences between new and old
- Switch reads: gradually switch read traffic 1% → 10% → 50% → 100%; eval set + visual diff guard
- Retire old monolith: after traffic is switched, take down old path; keep data as rollback fallback

## Core viewpoints

**Modularization is a valid end state; microservices are not mandatory.** The goal of decomposition is independent deployability and team autonomy, not a specific number of services. A well-modularized monolith with clear module boundaries, separate build artifacts, and disciplined dependency rules solves 80% of the scaling problems without introducing distributed systems complexity. Do not decompose into microservices unless you have a demonstrated need for independent scaling, independent deployment velocity, or polyglot persistence.

**Finding the right seam is 90% of the work.** The technical act of extracting a service (creating a new repo, setting up CI/CD, writing the API) is straightforward. The hard part is identifying a boundary that minimizes cross-service calls, avoids distributed transactions, and aligns with team ownership. If your bounded context diagram changes after you start coding, you started too early. Invest in DDD event storming and data-flow analysis before writing a single line of extraction code.

**Dual-write without reconciliation is a data integrity incident waiting to happen.** Writing to both old and new systems creates two sources of truth. Without a reconciliation process that compares records, detects drift, and alerts on anomalies, the two systems will diverge silently. The reconciliation must run continuously, not just during migration, because the divergence window is the entire dual-write period.

**Every migration step must be independently reversible.** The strangler fig pattern works because each step can be rolled back without affecting the rest of the system. If step 3 cannot be undone without also undoing steps 1 and 2, you have a big-bang migration disguised as incremental. Feature flags, traffic routing, and data fallback paths must be designed per-step, not per-migration.

**The biggest risk is not technical -- it is organizational momentum loss.** Monolith decomposition projects often span 6-18 months. During this period, the team delivers zero user-visible features, stakeholder patience evaporates, and the project gets cancelled halfway through. Structure the decomposition so that each extracted service ships a small user-visible improvement. This keeps the business invested and prevents the migration from becoming a zombie project.

## Scenario

As the business expands, the monolithic system becomes hard to deliver in parallel, with technology stack lock-in, deployment coupling, and too-large a blast radius; the team decides to decompose. This entry gives the full path from finding boundaries to retiring the old monolith, covering strangler-fig pattern, dual-write, read switch, gradual rollback, DDD bounded context, migration pattern co-built, and links to ADR / database migration / observability / evaluation-driven and other leaves.

## 2-hop reachability paths

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | ADR | [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) |
| 2 hops | migration | [../processes/roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) |
| 2 hops | database migration | [../processes/migrate-a-database.md](../infrastructure/migrate-a-database.md) |
| 2 hops | 1:1 mapping | [../../engineer/architecture-design/one-to-one-mapping-migration.md](one-to-one-mapping-migration.md) |
| 2 hops | staged rollout | [../../engineer/architecture-design/staged-port-methodology.md](staged-port-methodology.md) |
| 2 hops | evaluation-driven | [../../engineer/engineering/evaluation-driven-development.md](../engineering/evaluation-driven-development.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | tech debt | [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) |
| 2 hops | PoC | [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) |

## Action recommendations

1. **Do not split if boundary unclear**: first use DDD bounded context to find boundary; data ownership + call direction + team structure three-aligned
2. **Strangler-fig pattern**: not one cut; facade routing layer bypasses step by step; old path still usable for rollback
3. **New service before retiring old monolith**: build a working version of the new service first; do not retire old path if not working
4. **Dual-write + reconciliation**: write path writes to both new and old; reconcile differences; difference > threshold blocks
5. **Read switch 4-tier gradual**: 1% → 10% → 50% → 100%; observe each tier + monitoring trio + eval set
6. **1:1 behavior mapping**: strangler layer uses [1:1 mapping migration pattern](one-to-one-mapping-migration.md); do not bundle feature changes
7. **Staged rollout**: reference [staged-port methodology](staged-port-methodology.md); each stage independently publishable
8. **Eval set gatekeeping**: reference [evaluation-driven pattern](../engineering/evaluation-driven-development.md); regression baseline fail blocks
9. **Database migration prerequisite**: reference [database migration](../infrastructure/migrate-a-database.md); schema dual-write + dual-read + cut-over
10. **Keep fallback before retiring**: old path keeps data for rollback; observe another cadence after retiring
11. **Splitting services ≠ microservices**: first modularize boundaries; do not force distributed deployment; monolith modularization is also a valid goal
12. **First principles**: why must split; what is the worst consequence of not splitting; split cost ÷ benefit
13. **Second-order thinking**: second-order consequences after split (distributed transactions / network failures / tracing); do not only look at short-term output
14. **Inversion thinking**: if keeping the monolith and only modularizing can solve how much of the problem; if solvable, do not go distributed

## Anti-patterns

**Big-bang rewrite.** Attempting to rebuild the entire system from scratch and switching over in one cutover weekend. This has a near-100% failure rate because it assumes perfect requirements capture, ignores the years of bug fixes and edge cases baked into the old system, and provides no incremental value. Always use the strangler fig pattern instead.

**Decomposing without data ownership clarity.** Splitting services at the code level but keeping a shared database. This creates the worst of both worlds: distributed systems complexity (network failures, serialization overhead) combined with monolithic coupling (schema changes break multiple services, no independent scaling). Every extracted service must own its data.

**Bundling feature changes with migration.** Changing business logic while also extracting a service. When a bug surfaces, the team cannot determine whether the bug is in the new service boundary, the refactored code, or the new feature. The 1:1 mapping migration pattern exists precisely to prevent this: extract first, enhance later.

**Decomposing by technical layer instead of business domain.** Creating a "database service," a "business logic service," and a "presentation service" rather than an "orders service" and a "payments service." This maximizes cross-service chattiness because every user request must traverse all layers. Decompose by bounded context, not by n-tier architecture.

**No kill switch for the old system.** Removing the old code path immediately after migration without keeping it as a fallback. The first production incident after migration will have no rollback option. Keep the old code path behind a feature flag for at least one full release cycle, and ensure the rollback is a one-line config change, not a code deployment.

## Related

- ADR: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — split-decouple decision
- migration: [../processes/roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) — general migration methodology
- database migration: [../processes/migrate-a-database.md](../infrastructure/migrate-a-database.md) — schema dual-write dual-read
- PoC: [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) — boundary verification
- Pattern co-built: [1:1 mapping migration](one-to-one-mapping-migration.md) + [staged-port](staged-port-methodology.md) + [evaluation-driven](../engineering/evaluation-driven-development.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md)
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — traffic-cut monitoring
- tech debt: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — the monolith is the biggest tech debt
