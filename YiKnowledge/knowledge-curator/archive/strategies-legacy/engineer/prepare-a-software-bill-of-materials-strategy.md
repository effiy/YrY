---

title: I want to prepare a software bill of materials strategy
aliases:
- I want to prepare a software bill of materials strategy
- sbom-journey
- software-bill-of-materials-journey
- provenance-journey
- SBOM entry
tags:
- journeys
- sbom
- software-bill-of-materials
- supply-chain
- provenance
- attestation
- sca
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
- ./harden-supply-chain.md
- ../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md
- ./prepare-an-infrastructure-as-code-strategy.md
- ../../engineer/quality-security/harden-supply-chain.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a software bill of materials strategy

> **As an** engineer, **I want to** prepare a software bill of materials, **so that** launch is safe.

> "Generate + format + sign + provenance + verify + store + retrieve + quarterly audit" reachable within 2 hops: process + thinking + case study.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) + [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) + [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md)
- Case study via [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) + [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md)

## Scenario

When preparing SBOM strategy / software bill of materials / SPDX / CycloneDX / provenance / signing / attestation / SLSA / in-toto / Sigstore / Cosign / dependency graph / vulnerability mapping / compliance / SBOM reporting / SBOM big-promo freeze / quarterly SBOM audit / SBOM retrospective, TL + platform + security + sponsor need to look up process + thinking + case study. This entry aggregates SBOM-related process + thinking + case study into a 2-hop path, avoiding "scattered generation / format chaos / missing signing / fake provenance / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — SBOM intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine fakes · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — SBOM communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [bugs/](../../engineer/lessons/failures/bugs) — SBOM incident archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-risks](../../brd/) · [scenarios](../../brd/) — SBOM business impact |
| `projects/` | each project `architecture-summary.md` §supply-chain + `adr-*` §SBOM |
| `journeys/` | [./harden-supply-chain.md](./harden-supply-chain.md) · [../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md) · [./prepare-an-infrastructure-as-code-strategy.md](./prepare-an-infrastructure-as-code-strategy.md) · [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) |

## Action recommendations

1. **First principles**: first ask "what does SBOM solve / what happens if not done / ROI / business impact"; do not do SBOM for SBOM's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "SBOM could go out of control (fakes / drift / fake signing / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one dependency upgrade → SBOM changes → another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest format that satisfies business wins; do not pile up fields; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Generation**: must run build-time generation + multi-source (deps / lockfile / container / binary) + no manual fill.
6. **Format**: must run standard formats (CycloneDX / SPDX) + no proprietary formats.
7. **Signing**: must run signing (Cosign / Sigstore) + no unsigned.
8. **Provenance**: must run provenance (SLSA / in-toto attestation) + no missing provenance.
9. **Verification**: must run verification (policy as code / OPA / Kyverno) + no pass-through.
10. **Storage**: must run storage + retrieval + no loss.
11. **Vulnerability mapping**: must run SBOM ↔ CVE mapping + no silo; via [i-want-to-prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md).
12. **Dependency graph**: must run dependency graph + transitive dependencies + no direct-only.
13. **Licenses**: must run license scanning + no violations.
14. **AI model cards**: LLMs must run model cards + data cards + no missing cards; via [model-governance-policy.md](../../ai-engineer/foundations/prepare-a-model-governance-policy.md).
15. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / security / TL / sponsor owner.
16. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not move SBOM tools.
17. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally.
18. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) generation rate / signing rate / verification rate alerts.
19. **Drill**: must run [i-want-to-run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) + SBOM recovery drill.
20. **Retrospective**: after SBOM incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan SBOM whether still complete + signing whether still in place.
22. **ADR**: SBOM decision must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: SBOM done well → faster vulnerability response → trust rises → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./harden-supply-chain.md](./harden-supply-chain.md) — supply-chain hardening
- Same-class journey: [../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md) — vulnerability management
- Same-class journey: [./prepare-an-infrastructure-as-code-strategy.md](./prepare-an-infrastructure-as-code-strategy.md) — IaC
- Same-class journey: [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) — security audit
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) — patterns leaf entry
