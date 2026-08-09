---
title: Decommission a service
aliases:
- I want to decommission a service
- decommission-journey
- service-sunset-journey
- service decommission entry
tags:
- journeys
- decommission
- sunset
- retirement
- migration
- eol
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: Tech leads can decommission services safely without breaking system coherence or losing data
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./deprecate-a-feature.md
- ../../engineer/infrastructure/roll-out-a-migration.md
- ../../engineer/process/handle-customer-feedback.md
- ../../engineer/process/knowledge-deprecation-policy.md
review_cycle: quarterly
tacit: false
---

# I want to decommission a service

> **As a** tech lead, **I want to** decommission a service, **so that** system stays coherent.

> "Impact list + traffic cut + data migrate-out + dependency release + comms + archive + retrospective" within 2 hops reach process + patterns + thinking + cases.

## Summary

- Process: [release-process.md](../../oncall-sre/release/release.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) + [data-migration-process.md](../../engineer/infrastructure/data-migration.md) + [knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md)
- Patterns: [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) + [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- Comms: [i-want-to-handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md)

## Core viewpoints

**Decommissioning is a simplification flywheel.** Each service removed reduces the maintenance surface area, which frees up capacity for the next decommission. The first decommission is the hardest. Each subsequent one becomes easier as the organization builds muscle memory and trust in the process. The flywheel effect means the ROI of decommissioning compounds over time.

**The hardest part of decommissioning is not technical -- it is organizational.** Finding all callers, negotiating migration timelines with dependent teams, and managing stakeholder communication is harder than the actual traffic cut. The technical steps are straightforward. The coordination is where decommissions fail.

**Traffic tells the truth, documentation lies.** Dependency lists derived from documentation and architecture diagrams are always incomplete. The only reliable way to find all callers is to observe actual traffic patterns over a representative period -- at least two weeks, covering a full business cycle. Traffic data is the single source of truth for caller discovery.

**The rollback window is your insurance policy.** Keeping the old service running in read-only mode for N days after the cut is not waste. It is the cheapest insurance against an incomplete caller list. The cost of keeping the old service warm is negligible compared to the cost of an outage from a missed dependency.

**Every decommission should produce a post-mortem.** Whether successful or not, each decommission generates lessons about dependency discovery, stakeholder communication, and traffic cut patterns. These lessons compound across decommissions and make each subsequent one faster and safer.

## Key info

- **Decommissioning phase checklist (8 phases with verification gates)**: (1) Impact inventory — list all callers, dependents, data flows, alerts, monitoring dashboards, runbooks, docs, credentials, and cloud resources; verify with 2 weeks of traffic data, not documentation; (2) Stakeholder communication — 30-90 days advance notice to all dependent teams, with a specific migration deadline and a point of contact; (3) Traffic migration — staged cut: 10% → 50% → 100%, with 24-hour observation window at each stage; (4) Data migration — backup, migrate, verify integrity, retain old data for the full rollback window; (5) Dependency release — remove routing rules, revoke credentials, delete SDK endpoints, update DNS; (6) Rollback window — keep old service in read-only mode for N days (minimum 7, recommended 30); (7) Resource cleanup — instances, databases, caches, load balancers, DNS records, TLS certificates, monitoring alerts, runbooks; (8) Documentation archive — archive the decommission ADR, post-mortem, architecture diagrams, and runbooks with a "why this was decommissioned" summary. Each phase has a verification gate; the next phase does not start until the current gate is confirmed.
- **Caller discovery methodology (3 methods ranked by reliability)**: (1) Traffic observation — instrument the service to log all incoming requests for 2-4 weeks covering a full business cycle; this is the only method that catches batch jobs, cron tasks, and infrequent callers; (2) Code search — grep the entire codebase for references to the service's endpoints, SDK methods, and configuration keys; catches direct integrations but misses indirect ones (e.g., through a proxy or shared library); (3) Documentation review — check architecture diagrams, runbooks, and onboarding docs for references; least reliable because documentation is always stale. The Yi-family decommissioning standard: traffic observation is mandatory; code search and documentation review are supplementary.
- **Rollback window sizing by service criticality**: Tier 1 (customer-facing, revenue-impacting) — 30-day rollback window, read-only mode, full data retention; Tier 2 (internal tooling, operational) — 14-day rollback window, read-only mode, data retention; Tier 3 (development/experimental) — 7-day rollback window, can be cold-stored (restore from backup if needed). The cost of keeping the old service warm is typically < 5% of the original operational cost; the cost of an outage from a missed dependency is typically 10-100x the cost of keeping it warm. The rollback mechanism must be tested before the decommission starts.
- **Decommissioning communication template (5 audiences)**: (1) Dependent teams — specific migration deadline, replacement service, migration guide, point of contact; (2) Business stakeholders — business rationale, cost savings, timeline, risk mitigation; (3) Operations/oncall — change in runbooks, removal of alerts, change in oncall scope; (4) Security/compliance — data retention policy, credential revocation, compliance impact; (5) End users — if user-visible, communicate the change, the benefit, and the migration path (if any). Communication should start 30-90 days before the decommission, with reminders at 30, 14, 7, and 1 day before the cut.
- **Decommissioning cost-benefit analysis**: Direct savings — compute, storage, network, license costs removed; Indirect savings — reduced oncall burden, reduced maintenance, reduced cognitive load on the team; One-time costs — migration effort, communication effort, data migration, rollback window operation; Net savings = (annual direct + indirect savings) - one-time costs. A decommission with a payback period > 12 months should be questioned: is the simplification worth the effort, or is the service stable enough to leave running? The Yi-family decommissioning standard: any decommission with a payback period > 24 months requires explicit stakeholder approval.
- **Yi-family decommissioning examples (2026-08)**: YiPet — ESLint decommissioned, replaced by Biome 2.5 (savings: single tool for linting + formatting, 10x faster); YiVad — Vite decommissioned, replaced by Rsbuild (savings: 2x faster builds, better static analysis); RSS pipeline — MongoDB body storage decommissioned, replaced by YiKnowledge markdown files (savings: simpler data model, metadata-only MongoDB). Each decommission followed the staged migration pattern and produced a win/gotcha document archived in `lessons/`.

## Scenario description

When decommissioning a service / sunset / end-of-life / retiring microservices / shutting down legacy systems / removing old endpoints after migration / archiving instances, platform + architect + business owner + oncall need process + patterns + thinking + cases. This entry aggregates decommission-related process + patterns + thinking into 2-hop paths, avoiding "one-shot cut / missed dependency removal / missed data migration / missing comms / leftover instances / undocumented history."

## 2-hop reachable paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [release-process.md](../../oncall-sre/release/release.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [data-migration-process.md](../../engineer/infrastructure/data-migration.md) · [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) · [knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md) · [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — decommission necessity · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert missed cut · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — decommission chain · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) — simplification flywheel · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `lessons/wins/` | [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) · [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) · [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [vite-to-rsbuild-migration.md](../../engineer/lessons/gotcha-vite-to-rsbuild-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — decommission comms |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — owner |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [archive.md](../../knowledge-curator/archive/archive.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/reference/` | [countries.md](./../../brd/README.md) · [regulations.md](./../../brd/README.md) — cross-border data migration |
| `journeys/` | [./deprecate-a-feature.md](./deprecate-a-feature.md) · [../../engineer/infrastructure/roll-out-a-migration.md](../../engineer/infrastructure/roll-out-a-migration.md) · [../../engineer/process/handle-customer-feedback.md](../../engineer/process/handle-customer-feedback.md) · [../../engineer/infrastructure/migrate-data.md](../../engineer/infrastructure/migrate-data.md) |
| `projects/` | each project's `architecture-summary.md` §decommission + `adr-*.md` |

## Action recommendations

1. **First principles**: first ask "why decommission / what if not / decommission ROI / exit cost"; do not decommission for decommission's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: first imagine "how decommission will explode (missed dependency removal / missed data migration / user impact / cross-border violation / leftover instances)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: decommission → team knowledge gap → outdated docs → hard handover later; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: the simplest steps for exit win; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **Impact list**: must first list callers / dependents / data flows / alerts / monitoring / runbook / docs / credentials / resources.
6. **Comms**: must use [i-want-to-handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md); give 30-90 days advance notice.
7. **Traffic cut**: stage traffic cut (10% → 50% → 100% → close); use [release-process.md](../../oncall-sre/release/release.md) + [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md).
8. **Data migration**: must use [i-want-to-migrate-data.md](../../engineer/infrastructure/migrate-data.md) + [data-migration-process.md](../../engineer/infrastructure/data-migration.md); backup + verify + retention period.
9. **Dependency release**: must scan callers + change routing + close SDK endpoints + revoke credentials; use [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md).
10. **Rollback**: must be able to rollback in seconds (keep old instance N days); use [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
11. **Monitoring**: during decommission use [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md); must monitor traffic-to-zero + error rate + whether callers still have requests.
12. **Freeze window**: during big promos use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not decommission.
13. **Data retention**: must use [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) + [regulations.md](./../../brd/README.md); GDPR deletion + backup cleanup.
14. **Resource cleanup**: instances + databases + caches + LB + DNS + certificates + domains; must check each item.
15. **Cost**: must use [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) to compute decommission savings + exit cost.
16. **Document archive**: use [knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md) + [archive.md](../../knowledge-curator/archive/archive.md); ADR + architecture diagrams + runbook all archived.
17. **RACI**: cross-team decommission must use [raci-matrix-summary.md](../../engineer/process/raci-matrix.md); no parallel work without an owner.
18. **Retrospective**: after decommission use [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) to retrospect + archive to [lessons/wins/](../../engineer/lessons) or [lessons/gotchas/](../../engineer/lessons).
19. **Flywheel**: simplify → lighter maintenance → trust → bolder decommissioning; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).
20. **ADR**: decommission decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).

## Anti-patterns

- **One-shot cut without staged traffic migration.** Switching from 100% old to 100% new in a single deploy. Staged migration -- 10%, 50%, 100% -- gives you an observation window at each stage to catch missed callers before they cause a full outage.

- **Decommissioning without a complete caller inventory.** Relying on documentation, code search, or tribal knowledge to identify callers instead of observing actual traffic. Documentation is always stale. Traffic data is the only reliable source of truth for caller discovery.

- **Cleaning up resources before the rollback window expires.** Deleting instances, databases, and credentials immediately after the cut. If a missed caller surfaces three days later, there is no way to roll back. Keep everything in read-only mode for the full rollback window.

- **No communication plan for dependent teams.** Treating decommissioning as a purely technical exercise without giving dependent teams 30-90 days of advance notice. Teams need time to migrate their integrations. Springing a decommission on them creates resentment and rushed, error-prone work.

- **Forgetting to archive documentation.** Shutting down the service and deleting its docs, runbooks, and ADRs. Future engineers need to understand why the service existed, why it was decommissioned, and what replaced it. Archive everything, including the decommission ADR and post-mortem.

## Related

- Same-kind journey: [./deprecate-a-feature.md](./deprecate-a-feature.md) — feature decommission
- Same-kind journey: [../../engineer/infrastructure/roll-out-a-migration.md](../../engineer/infrastructure/roll-out-a-migration.md) — migration
- Same-kind journey: [../../engineer/infrastructure/migrate-data.md](../../engineer/infrastructure/migrate-data.md) — data migration
- Same-kind journey: [../../engineer/process/handle-customer-feedback.md](../../engineer/process/handle-customer-feedback.md) — user comms
- Upstream: [../../README.md](../../README.md) — processes leaf entry
