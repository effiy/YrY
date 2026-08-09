---
title: Onboard a new SaaS tenant
aliases:
- I want to onboard a new SaaS tenant
- saas-tenant-onboarding-journey
- multi-tenant-onboarding-journey
- saas tenant onboarding entry
tags:
- journeys
- saas
- multi-tenant
- tenant-onboarding
- isolation
- provisioning
- billing
category: new-hire/onboarding
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- new-hire
benefit: onboarding is smooth
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/architecture-design/handle-multi-tenancy.md
- ../../engineer/engineering/bootstrap-a-new-project.md
- ../../product-manager/frameworks/prepare-a-product-launch-checklist.md
- ../../engineer/engineering/dual-world-boundary.md
review_cycle: quarterly
tacit: false
---

# I want to onboard a new SaaS tenant

> **As a** new hire,**I want to** onboard a new saas tenant,**so that** onboarding is smooth.

> "Sign + configure + data isolation + authn + integration + acceptance + communication + monitoring" — reach process + thinking + cases within 2 hops.

## Summary

- Process: [requirement-review.md](../../product-manager/delivery/requirement-review.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Platform: [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) + [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md)

## Core viewpoints

**Tenant onboarding is a product, not a checklist.** Every tenant onboarding is a user journey through your platform's configuration surface. If the onboarding process requires 23 manual steps, the platform is not multi-tenant-ready; it is single-tenant with a multi-tenant label. The goal is to reduce the onboarding to a self-service form that provisions everything automatically.

**Isolation is the foundation; everything else is decoration.** A single cross-tenant data leak destroys trust irreversibly. Schema-level isolation, database-level isolation, and contract tests for isolation boundaries must be in place before the first tenant is onboarded. Isolation is not a feature to be added later; it is the architectural constraint that every other decision must respect.

**Self-service onboarding is the only scalable model.** If onboarding a tenant requires a platform engineer to manually configure settings, run database migrations, and set up SSO, the platform cannot scale beyond a handful of tenants. Every manual step is a bottleneck that compounds with tenant count.

**Every tenant onboarding is a rehearsal for the next one.** After each onboarding, capture what was manual, what was confusing, and what broke. Feed these back into the automation. Without this feedback loop, the Nth tenant onboarding is just as painful as the first.

## Scenario description

When onboarding a new SaaS tenant / multi-tenant onboarding / tenant onboarding / tenant provisioning / data isolation configuration / tenant authn / SSO integration / tenant-level quota / tenant-level billing / tenant acceptance / cross-tenant communication / tenant-level monitoring / tenant migration / quarterly tenant audit, platform + TL + PM + sponsor + customer success need to find process + thinking + cases. This entry aggregates tenant-onboarding-related process + thinking + cases into 2-hop paths to avoid "scattered sign-off / messy config / missed isolation / wrong authn / delayed integration / absent acceptance / lagging communication / missing monitoring".

## 2-hop reach paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [design-review.md](../../product-manager/delivery/design-review.md) · [tech-review.md](../../product-manager/delivery/tech-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [cross-team-collaboration-process.md](../../engineer/process/cross-team-collaboration.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [rate-limiting-pattern.md](../../engineer/engineering/rate-limiting.md) · [graceful-degradation-pattern.md](../../engineer/architecture-design/graceful-degradation.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — tenant essence · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — reverse-think cross-tenant leaks · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — cascades · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [runbook](../../engineer/infrastructure/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts--brd-generation.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — tenant communication |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — onboarding team |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — implementation consultant |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [bugs/](../../engineer/lessons) — cross-tenant / onboarding failure archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [brd-risks](../../brd/) · [scenarios](../../brd/) — business context |
| `projects/` | Each project's `architecture-summary.md` § multi-tenant + `adr-*` § tenant |
| `journeys/` | [../../engineer/architecture-design/handle-multi-tenancy.md](../../engineer/architecture-design/handle-multi-tenancy.md) · [../../engineer/engineering/bootstrap-a-new-project.md](../../engineer/engineering/bootstrap-a-new-project.md) · [../../product-manager/frameworks/prepare-a-product-launch-checklist.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-launch-checklist.md) · [../../engineer/engineering/evaluate-a-vendor-saas.md](../../engineer/engineering/evaluate-a-vendor-saas.md) |

## Action recommendations

1. **First principles**: ask first "what does onboarding solve / what happens if not / ROI / business impact"; do not onboard for onboarding's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: think first "how onboarding could go out of control (cross-tenant leak / data leak / wrong authn / delayed integration / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: onboard one → capacity changes → another expansion; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: the simplest onboarding that meets business needs wins; do not stack processes; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **Sign-off**: must follow [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) + must have SLA + must have SOW + must have legal review.
6. **Configuration**: must support self-service config + must parameterize + must validate + must have ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
7. **Isolation**: must follow [i-want-to-handle-multi-tenancy.md](../../engineer/architecture-design/handle-multi-tenancy.md) + must have schema / db / row level + must have contract tests.
8. **Authn**: must use SSO + must use SCIM + must use RBAC + must audit; see [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md).
9. **Integration**: must follow [i-want-to-integrate-a-third-party-api.md](../../engineer/engineering/integrate-a-third-party-api.md) + must have webhook + must have callback.
10. **Quota**: must follow [rate-limiting-pattern.md](../../engineer/engineering/rate-limiting.md) + must have tenant-level quota + must have approval for breach.
11. **Billing**: must use metering + must have showback + must have quarterly invoice; see [i-want-to-prepare-a-cost-allocation.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-cost-allocation.md).
12. **Dual world**: migration must follow [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + dual run + diff.
13. **Contract**: must follow [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) + must have tenant isolation contract.
14. **AI tenant**: LLM must follow [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) + must have tenant-level model routing + must have prompt isolation.
15. **RACI**: must follow [raci-matrix-summary.md](../../engineer/process/raci-matrix.md); platform / customer success / sponsor / legal owner.
16. **Freeze window**: during peak promotion follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not change onboarding config.
17. **Communication**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) to communicate internally and externally + must go-live.
18. **Monitoring**: must follow [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) for tenant-level dashboard + thresholds + alerts.
19. **Acceptance**: must run UAT + must dual-sign + must have customer sign-off.
20. **Retrospective**: after onboarding failure must follow [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) for retrospective + archive in [bugs/](../../engineer/lessons).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether tenants are still active + whether config is still correct.
22. **ADR**: tenant decisions must be captured in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: smooth onboarding → customers grow → trust grows → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **Manual configuration per tenant.** Writing a runbook that says "SSH into the server and run these 15 commands" is not a tenant onboarding process. It is a disaster recovery scenario waiting to happen. Every configuration must be parameterized, version-controlled, and applied through an automated pipeline.

- **Skipping isolation verification.** Assuming that row-level security or a tenant_id column is sufficient without testing it. Isolation must be verified with contract tests that attempt cross-tenant access and confirm it is blocked. A single missed isolation test is a data breach waiting to happen.

- **No acceptance criteria.** Onboarding a tenant without a written, signed-off acceptance checklist (UAT, performance baseline, monitoring dashboard, escalation path) means the tenant goes live with unknown gaps. The acceptance criteria are the contract between the platform team and the tenant.

- **Onboarding without monitoring.** A tenant goes live without a dedicated dashboard, without tenant-level SLI thresholds, and without alerting. The first indication of a problem is a support ticket from the customer. Monitoring must be provisioned as part of the onboarding automation, not as a separate step.

- **Treating all tenants as equal.** Different tenants have different scale, compliance requirements, and usage patterns. A one-size-fits-all onboarding template that provisions the same resources for a 10-user trial tenant and a 10,000-user enterprise tenant is wasteful and dangerous. Tenant tiering must be reflected in the provisioning logic.

## Related

- Similar journey: [../../engineer/architecture-design/handle-multi-tenancy.md](../../engineer/architecture-design/handle-multi-tenancy.md) — multi-tenant
- Similar journey: [../../engineer/engineering/bootstrap-a-new-project.md](../../engineer/engineering/bootstrap-a-new-project.md) — bootstrap
- Similar journey: [../../product-manager/frameworks/prepare-a-product-launch-checklist.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-launch-checklist.md) — launch checklist
- Similar journey: [../../engineer/engineering/evaluate-a-vendor-saas.md](../../engineer/engineering/evaluate-a-vendor-saas.md) — SaaS evaluation
- Upstream: [../../README.md](../../README.md) — patterns leaf entry
