---
title: Do a blast radius analysis
aliases:
- I want to do an impact surface analysis
- blast-radius-journey
- impact-analysis-journey
- impact surface analysis entry
tags:
- journeys
- blast-radius
- impact-analysis
- incident
- dependency
- risk
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./respond-to-an-incident.md
- ../../tech-lead/roadmap/decommission-a-service.md
- ./prepare-a-disaster-recovery-plan.md
- ../../engineer/engineering/dual-world-boundary.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to do a blast radius analysis

> **As a** oncall sre, **I want to** do a blast radius analysis, **so that** outcome is traceable.

> "dependency graph + call graph + data flow + user surface + traffic cut amount + isolation + Communication + Retrospective" reach within 2 hops Pattern + Process + Thinking + Case study.

## Summary

- Pattern via [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) + [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) + [rpc-envelope-pattern.md](../../engineer/architecture-design/rpc-envelope.md)
- Process via [incident-response-process.md](../../engineer/process/incident-response.md) + [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md)
- Thinking via [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Case study via [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) + [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) + [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md)

## Core viewpoints

**Blast radius analysis is not a one-time diagram; it is a living artifact that decays faster than you think.**
Dependencies change with every sprint. A new microservice, a moved cache layer, a switched CDN provider -- each change invalidates part of the blast radius diagram. Teams that treat the analysis as a deliverable for a design review and never update it are operating on stale intelligence. The diagram must be reviewed at least quarterly, and ideally regenerated automatically from service mesh telemetry or distributed tracing data.

**The blast radius is measured in user impact, not infrastructure scope.**
A naive analysis lists all the services that depend on a failing component. A mature analysis quantifies how many users, what percentage of revenue, and which customer segments are affected at each hop of the dependency chain. Two services that depend on the same database may have blast radii that differ by orders of magnitude in business impact. The analysis must connect infrastructure dependencies to business metrics.

**Hidden dependencies are the most dangerous kind.**
The dependencies you do not know about cause the worst incidents. Configuration drift, shared libraries without explicit contracts, cron jobs that run on a shared instance, and implicit data dependencies (one service reads another's database directly) are the most common sources of surprise blast radius expansion. The analysis must actively hunt for undocumented dependencies, not just catalog the documented ones.

**Every decommission and every major change must include a blast radius re-assessment.**
The most common trigger for blast radius incidents is a change: decommissioning a service, upgrading a database, moving a load balancer. Each of these changes should trigger a mandatory blast radius analysis scoped to the specific change. The analysis is not a generic exercise; it answers the question: "what breaks if we make this specific change tonight?"

## Key info

- **Blast radius analysis methodology (5 steps)**: (1) Dependency graph — map all upstream and downstream dependencies of the component, including: direct API calls, shared databases, message queues, configuration dependencies, cron jobs, and implicit dependencies (one service reading another's database directly); (2) Call graph — trace the call path for each user-facing feature through the dependency graph, identify which features are affected at each dependency hop; (3) Data flow — map data movement between components, identify data consistency risks (stale data, lost writes, duplicate processing); (4) User surface — quantify the blast radius in user terms: how many users, which segments, what percentage of revenue, which SLA commitments; (5) Traffic cut amount — calculate the percentage of total traffic that flows through the affected component. The analysis output is a ranked list of failure scenarios by business impact.
- **Dependency classification by blast radius impact**: (1) Hard dependency — the calling service cannot function without the dependency (e.g., application → database), blast radius = 100% of users if dependency fails; (2) Soft dependency — the calling service degrades but functions (e.g., application → cache, application → recommendation engine), blast radius = degraded experience for X% of users; (3) Async dependency — the calling service is unaffected by real-time failures (e.g., application → analytics pipeline), blast radius = delayed data, no user impact; (4) Implicit dependency — undocumented dependency discovered during analysis (e.g., cron job reading another service's database), blast radius = unknown until the dependency fails. The Yi-family dependency graph: YiVad (hard → YiAi RPC), YiPet (hard → YiAi RPC), YiAi (hard → MongoDB, soft → Anthropic API, soft → OpenAI API).
- **Hidden dependency detection techniques**: (1) Database access audit — check which services have read/write access to which databases, including read-only replicas; (2) Configuration audit — check which services reference which hostnames, ports, and connection strings; (3) Log analysis — search logs for cross-service references (e.g., Service A's logs mentioning Service B's endpoints); (4) Distributed tracing — if available, trace a request through all services and identify every hop; (5) Code search — search codebase for hardcoded hostnames, IPs, and connection strings; (6) Interview — ask each team lead "what other services does your service depend on, including the ones you think are too obvious to mention." The Yi-family projects are small enough (3 projects) that the dependency graph is manageable via manual analysis.
- **Blast radius quantification by business impact**: For each failure scenario, calculate: (1) Affected users — count of unique users who would experience the failure; (2) Revenue impact — estimated revenue at risk per hour of outage; (3) SLA impact — which SLA commitments would be violated, financial penalties if any; (4) Reputation impact — qualitative assessment of customer trust damage; (5) Recovery time — estimated time to restore service (immediate via failover, minutes via rollback, hours via rebuild). The blast radius is the combination of all 5 dimensions, not just the technical scope. The Yi-family projects are pre-revenue (no SLA commitments), so the primary blast radius metric is affected users.
- **Blast radius analysis cadence and triggers**: (1) Scheduled — quarterly full analysis of the entire system; (2) Pre-change — before any major change (decommission, database upgrade, infrastructure migration), scoped to the change; (3) Post-incident — after any P0/P1 incident, analyze what other components could fail in the same way; (4) New dependency — when adding a new dependency, analyze the blast radius of the new dependency failing. The Yi-family projects currently have no formal blast radius analysis cadence.
- **Yi-family blast radius analysis**: YiAi MongoDB → blast radius if MongoDB fails: all 3 projects lose data access (YiVad and YiPet depend on YiAi RPC, which depends on MongoDB). Single point of failure. Mitigation: MongoDB Atlas replica set with automatic failover (not yet configured for M0 free tier). YiAi Anthropic API → blast radius if Anthropic API is down: all LLM features fail (BRD generation, aiChat, RAG). Mitigation: multi-provider routing to OpenAI as secondary. YiVad → blast radius if YiVad build fails: YiVad users cannot access the frontend. Mitigation: static fallback page, previous version served from CDN cache.

## Scenario description

Doing impact surface analysis / blast radius / failure radius / failure explosion radius / dependency mapping / pre-decommission impact assessment / traffic cut amount impact assessment / capacity assessment / risk assessment, when Platform + SRE + Architect + TL need to look up Pattern + Process + Thinking + Case study. This entry aggregates impact surface analysis related Pattern + Process + Thinking into 2-hop paths, avoiding "decommission blind / traffic cut amount blind / dependency missing / user surface missing / Communication lag / isolation incomplete / Retrospective absent".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) · [rpc-envelope-pattern.md](../../engineer/architecture-design/rpc-envelope.md) · [sse-streaming-pattern.md](../../engineer/architecture-design/sse-streaming.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — Inversion thinking missing · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain · [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — radius essence · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `work/processes/` | [incident-response-process.md](../../engineer/process/incident-response.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [disaster-recovery-drill-process.md](../../engineer/infrastructure/disaster-recovery-drill.md) · [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) · [release-process.md](../../oncall-sre/release/release.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [data-migration-process.md](../../engineer/infrastructure/data-migration.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [runbook-template.md](../../engineer/infrastructure/write-a-runbook.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) — AI-assisted dependency finding · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) — missing radius archive |
| `lessons/gotchas/` | [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) · [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — radius Communication |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) — user surface |
| `lifecycle/` | [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [governance.md](../../knowledge-curator/governance/governance.md) |
| `projects/` | each project `architecture-summary.md` §dependency + `dev-standards-summary.md` |
| `journeys/` | [./respond-to-an-incident.md](./respond-to-an-incident.md) · [../../tech-lead/roadmap/decommission-a-service.md](../../tech-lead/roadmap/decommission-a-service.md) · [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) · [./do-a-rollback-drill.md](./do-a-rollback-drill.md) |

## Action recommendations

1. **First principles**: first ask "what is the radius / who is impacted / what happens if not analyzed / ROI"; do not draw diagrams just for drawing's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: first imagine "what happens if the radius is missed (decommission Incident / traffic cut Incident / incomplete isolation / Communication lag)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: one service down → affects downstream → affects business → affects user; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam's razor**: the simplest diagram that satisfies the analysis requirement wins; do not pile up visualization; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **dependency graph**: must draw upstream / downstream / peer / third-party / provider; distinguish strong / weak dependency; follow [architecture-summary.md](../../engineer/projects).
6. **call graph**: must draw sync / async / SSE / webhook / cron / queue; mark QPS + SLO + timeout.
7. **data flow**: must draw read / write / replication / cache / ETL / CDC; mark schema + volume + frequency; follow [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md).
8. **user surface**: must list impacted users / tenant / business / customer; by tier + SLA; follow [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md).
9. **metric surface**: must do [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) + [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md); assess business impact.
10. **failure injection**: must do [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) to actually measure radius; do not only draw diagrams.
11. **contract**: must do [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) to prevent schema drift.
12. **isolation**: must do [i-want-to-handle-multi-tenancy.md](../../engineer/architecture-design/handle-multi-tenancy.md) + tenant isolation / traffic isolation / data isolation.
13. **traffic cut amount**: must do [canary-release-process.md](../../oncall-sre/release/canary-release.md) + [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md); 1% → 25% → 100%.
14. **Rollback**: must be able to Rollback in seconds; follow [i-want-to-do-a-rollback-drill.md](./do-a-rollback-drill.md).
15. **Communication**: must do [i-want-to-handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) to communicate with impacted parties.
16. **AI assistance**: use [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) + [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) to let AI find dependencies + find gaps.
17. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md); Monitoring + alert + runbook for services within radius.
18. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not move services within radius.
19. **Retrospective**: after incident go to [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) for Retrospective + radius diagram archive [bugs/](../../engineer/lessons).
20. **Quarterly audit**: follow [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether radius diagram is still accurate + whether dependency has drifted.
21. **ADR**: key radius Decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: radius clear → confidence rises → dare to change more → release faster; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **Drawing the dependency graph from memory instead of from telemetry.** Engineers' mental models of dependencies are consistently incomplete. The database they forgot about, the shared Redis instance, the webhook that triggers a downstream service -- these are the dependencies that cause incidents. The blast radius diagram must be generated from actual traffic data: distributed traces, service mesh telemetry, or network flow logs. A hand-drawn diagram is a starting point, not a finished product.

- **Equating "low traffic" with "low blast radius."** A service that handles 0.1% of total requests but is responsible for payment processing has a blast radius that dwarfs a service handling 50% of read-only traffic. Blast radius is a function of business criticality, not request volume. The analysis must weight each dependency by the business function it serves, not by its QPS.

- **Ignoring the blast radius of the CI/CD pipeline.** When the build system, artifact repository, or deployment pipeline fails, the blast radius includes every team that cannot ship fixes. The CI/CD pipeline is a dependency of every service, yet it is often omitted from blast radius analyses because it is "infrastructure" rather than "application." The analysis must include the deployment pipeline as a first-class dependency.

- **Assuming the blast radius is static during an incident.** During an incident, the blast radius can expand as operators take actions: a rate limit that affects legitimate traffic, a DNS change that propagates to unintended domains, a database failover that briefly disconnects all read replicas. The analysis should model not just the steady-state blast radius but also the potential blast radius of common mitigation actions.

- **Not including third-party dependencies in the blast radius.** Cloud provider outages, CDN failures, and SaaS dependency degradations are the most common causes of major incidents. Yet teams often omit third-party services from their blast radius analysis because "we cannot control them." You cannot control them, but you can mitigate their failure. The analysis must include every third-party dependency and its specific failure mode (graceful degradation, fallback, or hard dependency).

## Related

- Related journey: [./respond-to-an-incident.md](./respond-to-an-incident.md) — incident response
- Related journey: [../../tech-lead/roadmap/decommission-a-service.md](../../tech-lead/roadmap/decommission-a-service.md) — service decommission
- Related journey: [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — disaster recovery
- Related journey: [./do-a-rollback-drill.md](./do-a-rollback-drill.md) — Rollback drill
- Upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
