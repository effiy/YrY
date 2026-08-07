---
title: Build a self-service portal
aliases:
- I want tobuildself-service portal
- self-service-portal-journey
- internal-developer-portal-journey
- self-service portal entry
tags:
- journeys
- self-service
- internal-tool
- developer-portal
- platform-engineering
- idp
category: engineer/projects
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: system is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./build-an-internal-tool.md
- ../processes/do-a-tech-stack-inventory.md
- ../../executive/strategy/handle-data-compliance.md
- ../../oncall-sre/observability/tech-debt-inventory.md
review_cycle: quarterly
tacit: false
---

# I want to build a self-service portal

> **As an** engineer, **I want to** build a self service portal, **so that** system is reproducible. 

> "JTBD + orchestration + permission + audit + Template + dual-world + rollout + decommission"reach within 2 hopsProcess + Thinking + Case study. 

## Summary

- Process go [capacity-planning-process.md](../infrastructure/capacity-planning.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) + [monitoring-governance-process.md](../process/monitoring-governance.md)
- Thinking go [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- Pattern go [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md)
- Case study go [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) + [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md)

## Core viewpoints

**A portal that requires a ticket to use is not a portal; it is a request queue with a web interface.** The defining characteristic of a self-service portal is that the user can complete their task without human intervention. If every request still requires a platform engineer to approve, configure, or execute, the portal is just a form that generates Jira tickets.

**Permission and audit are the hardest parts of a portal, not the orchestration.** Orchestrating a workflow (create database, provision user, send email) is a solved problem. Getting RBAC right (who can request what, who can approve, what are the escalation paths), and having a complete audit trail (who did what, when, with what parameters, and what was the result) is where portals fail.

**The portal is a product, not a project.** It has users, a user experience, a support burden, and a lifecycle. It needs product management (JTBD, prioritization, user research), not just engineering. A portal built as a one-time engineering project will have the wrong features, poor UX, and zero adoption.

**Every portal operation must be reversible or have a dry-run mode.** Users will make mistakes: provisioning the wrong resource, deleting the wrong database, granting the wrong permission. The portal must either support undo (within a time window) or show exactly what will happen before executing. A portal without dry-run is a footgun with a GUI.

## Key info

- **Self-service portal maturity model (4 levels)**: Level 1 — Request Queue: web form that creates Jira tickets, still requires human intervention; Level 2 — Automated Provisioning: predefined templates with auto-approval for standard requests (e.g., create dev database, provision test user); Level 3 — Guided Self-Service: dynamic forms based on user context, cost estimation before provisioning, dry-run mode showing exactly what will happen; Level 4 — Fully Autonomous: policy-based auto-approval, quota management, automatic decommissioning of unused resources, cost optimization recommendations. Most organizations stall at Level 1 because they automate the form but not the fulfillment. The Yi-family projects have no formal self-service portal; the framework is documented for when the team and infrastructure grow.
- **Portal RBAC design (4 roles, defined before first line of code)**: (1) Requester — can submit requests for predefined resource types within their quota; (2) Approver — can approve/reject requests that exceed auto-approval thresholds; typically team lead or manager; (3) Administrator — can manage templates, quotas, and escalation paths; typically platform engineer; (4) Auditor — read-only access to all request logs, audit trails, and compliance reports; typically security/compliance team. The RBAC model must be designed before the first line of code because retrofitting permissions is exponentially harder than designing them upfront. Every permission change must be logged in an immutable audit trail.
- **Portal audit trail requirements (5 Ws, immutable and queryable)**: Every operation must record: Who (user identity + role), What (operation type + parameters), When (timestamp with timezone), Where (source IP, session ID), Why (request justification, approval chain). The audit trail must be: (1) Immutable — no modification or deletion after write; (2) Queryable — full-text search on all fields within 30 days, archived after 90 days; (3) Exportable — CSV/JSON export for compliance audits; (4) Complete — no operation bypasses the audit trail, including administrator actions. The audit trail is not just for compliance — it is the first tool used to diagnose "who changed what and when" during incidents.
- **Portal template management (3 template types)**: (1) Resource templates — predefined configurations for common resources (database with specific version/size, VM with specific image/specs); templates reduce configuration errors and enforce organizational standards; (2) Workflow templates — multi-step processes (onboard new team member: create accounts + grant permissions + send welcome email); templates ensure consistency across teams; (3) Policy templates — auto-approval rules (requests under $100/month auto-approved, requests over $1000 require director approval); policies enforce cost governance. Templates must be versioned and changes must go through the same review process as code changes. Template drift (different teams using different template versions) is a common failure mode.
- **Portal adoption and success metrics (4 KPIs)**: (1) Self-service rate — % of requests completed without human intervention; target ≥ 80% at Level 2+; (2) Time to fulfillment — median time from request submission to resource availability; target < 1 hour for standard requests; (3) Platform engineer to developer ratio — how many developers can one platform engineer support; industry benchmark: 1:30-50 at Level 3; (4) User satisfaction (NPS) — internal NPS from portal users; target ≥ 30. The fundamental metric is whether the portal reduces the operational burden on platform engineers while increasing developer velocity.
- **Yi-family self-service portal state (2026-08)**: No self-service portal exists. The Yi-family projects are internal tools used by 3-4 engineers; infrastructure provisioning is done manually by the team. The self-service portal framework is documented for when the team grows beyond 10 engineers and manual provisioning becomes a bottleneck. The SSOT view layer pattern ([ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md)) and dual-world boundary pattern ([dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md)) are the architectural foundations for a future portal.

## Scenario description

Build an internal self-service portal / IDP / developer portal / self-service tool / internal ticket / internal application / resource request / permission request / quota application / environment request / data export application / report subscription / internal marketplace / internal gateway, when Platform + TL + architect + security need to look up Process + Thinking + Case study. This entry aggregates self-service portal related Process + Thinking + Case study into a 2-hop path, avoiding "JTBD wrong / orchestration messy / permission scattered / audit missing / Template drift / rollout dragged / decommission missing". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [eval-driven](../engineering/evaluation-driven-development.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — portal intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagining failure · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md) |
| `work/processes/` | [capacity-planning-process.md](../infrastructure/capacity-planning.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) · [incident-response-process.md](../process/incident-response.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — portal audience |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — portal team |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) — portal metrics |
| `lessons/wins/` | [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project `architecture-summary.md` + `dev-standards-summary.md` — portal docking conventions |
| `journeys/` | [./build-an-internal-tool.md](./build-an-internal-tool.md) · [../processes/do-a-tech-stack-inventory.md](../engineering/do-a-tech-stack-inventory.md) · [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) · [../strategies/prepare-a-pitch.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-pitch.md) |

## Action recommendations

1. **First principles**: first ask "what does the portal solve / what happens if not built / ROI / who is the user"; do not build portal for portal's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how the portal could fail (mismatch / abuse / privilege escalation / data leak / cost explosion / user rejects) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Occam's razor**: the simplest orchestration that satisfies JTBD wins; do not pile up functions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
4. **JTBD**: must run [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) to understand real needs; do not pile up functions. 
5. **SSOT**: backend atomic capability SSOT + frontend view layer; follow [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md). 
6. **Dual-world**: self-service operations must run [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) dual-run + diff + dry-run. 
7. **Contract**: must run [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md); orchestration + atomic capability + third-party contracts. 
8. **Permission**: must do RBAC + least privilege + approval flow + dual-sign; follow [data-compliance-process.md](../infrastructure/data-compliance.md). 
9. **Audit**: must run [monitoring-governance-process.md](../process/monitoring-governance.md); operations / quota / privilege escalation / exception alerts. 
10. **Quota**: must run [capacity-planning-process.md](../infrastructure/capacity-planning.md); user-level / team-level quota + breakthrough approval. 
11. **Template**: self-service applications must use Template + required fields + validation; follow [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md). 
12. **Orchestration**: must do saga / state machine + compensation + idempotency; follow [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md). 
13. **AI orchestration**: complex applications must do LLM-assisted + evaluation + fallback; follow [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md). 
14. **Data**: export / report must run [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + data masking + row-level permission. 
15. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate with audience + Launch + change. 
16. **RACI**: must run [raci-matrix-summary.md](../process/raci-matrix.md); Platform / user / sponsor / security owner. 
17. **Monitoring**: must run [monitoring-governance-process.md](../process/monitoring-governance.md) dashboard + SLI + threshold + alert. 
18. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move Portal Template. 
19. **Rollout**: must do seed users + training + feedback loop + iteration; follow [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md). 
20. **Retrospective**: portal incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../lessons). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan Template still accurate + quota still reasonable.
22. **ADR**: Portal Decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: Portal used more → efficiency rises → trust rises → more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Anti-patterns

- **Building a portal without understanding JTBD.** Engineers tend to build portals that expose infrastructure primitives (create a database, create a namespace) rather than portals that solve user jobs (deploy my application, set up my development environment). Run JTBD interviews with actual users before designing the portal's capabilities. The portal should speak the user's language, not the infrastructure's.

- **No audit trail.** A portal that provisions resources without recording who requested what, who approved it, and what parameters were used is a compliance and security nightmare. Every operation must be logged with actor, timestamp, parameters, and result. The audit trail must be immutable and queryable.

- **Hardcoding workflows instead of using templates and state machines.** A portal where each workflow is a bespoke code path becomes unmaintainable after the third workflow. Use a template system (workflow definition as data) and a state machine (saga pattern with compensation) so that new workflows can be added without writing orchestration code.

- **Launching without seed users and a feedback loop.** Building a portal in isolation and launching it to the entire organization is a recipe for rejection. Start with 3-5 seed users, observe their behavior, iterate on the UX, and expand gradually. A portal that does not fit anyone's workflow will be ignored regardless of how well it is engineered.

- **Treating the portal as a one-time build.** The portal's capabilities must evolve as the organization's needs change. Without a quarterly review of usage patterns, template accuracy, and quota limits, the portal becomes a museum of outdated workflows. Schedule a quarterly audit of every template and every quota.

## Related

- Related journey: [./build-an-internal-tool.md](./build-an-internal-tool.md) — internal tool
- Related journey: [../processes/do-a-tech-stack-inventory.md](../engineering/do-a-tech-stack-inventory.md) — tech stack inventory
- Related journey: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — data compliance
- Related journey: [../strategies/prepare-a-pitch.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-pitch.md) — pitch
- Upstream: [../../oncall-sre/observability/README.md](../../oncall-sre/observability/README.md) — infra leaf entry
