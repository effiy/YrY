---

title: I want to prepare an IAM strategy
aliases:
- I want to prepare an IAM strategy
- iam-strategy-journey
- identity-provider-journey
- sso-journey
- IAM entry
tags:
- journeys
- iam
- identity
- sso
- oauth
- rbac
- abac
- scim
- authentication
- authorization
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./handle-secrets-and-config.md
- ../../oncall-sre/incident-response/do-a-security-audit.md
- ../../executive/strategy/handle-data-compliance.md
- ../../engineer/quality-security/harden-supply-chain.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an IAM strategy

> **As an** engineer, **I want to** prepare an iam, **so that** launch is safe.

> "Identity + authentication + roles + SSO + SCIM + audit + monitoring + quarterly audit" reachable within 2 hops: process + thinking + cases.

## Summary

- Process follows [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) + [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md)
- Cases follow [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) + [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md)

## Scenario

When preparing IAM strategy / identity and access / authentication / authorization / RBAC / ABAC / SSO / OAuth / OIDC / SAML / SCIM / service accounts / workload identity / cross-account / cross-tenant auth / zero trust / least privilege / quarterly IAM audit / pre-big-promo permission review / permission tightening / communication sync, TLs + architects + security + sponsors need to consult process + thinking + cases. This entry aggregates IAM-related process + thinking + cases into a 2-hop path, avoiding "scattered identity / chaotic auth / role pile-up / SSO drag / SCIM missing / audit leakage / missing monitoring / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) · [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [code-review.md](../../engineer/processes/do-a-code-review.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [rate-limiting-pattern.md](../../engineer/patterns/rate-limiting.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — IAM essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert the privilege escalation · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reaction · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/ai-specific/` | [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [incident-postmortem-template.md](../../engineer/lessons/failures/incident-postmortem.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — IAM communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — role matrix |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — security consultants |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) · [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — privilege-escalation archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | Each project's `architecture-summary.md` §IAM + `adr-*` §auth |
| `journeys/` | [./handle-secrets-and-config.md](./handle-secrets-and-config.md) · [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) · [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) · [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) |

## Action recommendations

1. **First principles**: first ask "what does IAM solve / what happens if not done / ROI / user impact"; do not do IAM for IAM's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how IAM can go out of control (privilege escalation / data leak / account takeover / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one privilege escalation → cascades downstream / data / regulators; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest role that satisfies business wins; do not pile up permissions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Zero trust**: must run zero trust + least privilege + default deny + explicit allow.
6. **Identity**: must run unified identity (SSO) + OIDC / SAML / OAuth + MFA + passwordless.
7. **Roles**: must run RBAC + minimal role set + audit + periodic tightening; see [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md).
8. **ABAC**: complex scenarios must run ABAC + attributes + policy engine (OPA / Cedar).
9. **SCIM**: must run SCIM automation + JIT + account lifecycle (create / change / offboard).
10. **Service accounts**: must run workload identity + short-term tokens + no long-term keys; see [i-want-to-handle-secrets-and-config.md](./handle-secrets-and-config.md).
11. **Cross-account**: must run cross-account roles + trust policy + audit.
12. **PII**: must run [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) + masking + row-level permissions.
13. **AI auth**: LLM must run [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) + prompt isolation + tool authorization.
14. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); security / engineering / sponsor owners.
15. **Freeze period**: during big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move IAM strategy.
16. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify sponsor + security + business.
17. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + login / privilege-escalation / exception alerts.
18. **Audit**: must run [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) + permission matrix + tightening.
19. **Retrospective**: after a privilege-escalation incident, must run [incident-postmortem-template.md](../../engineer/lessons/failures/incident-postmortem.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
20. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether roles are still accurate / whether permissions are still reasonable.
21. **ADR**: IAM decisions must land an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: good IAM → security rises → trust rises → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./handle-secrets-and-config.md](./handle-secrets-and-config.md) — secrets
- Same-category journey: [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) — security audit
- Same-category journey: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — data compliance
- Same-category journey: [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) — threat modeling
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) — patterns leaf entry
