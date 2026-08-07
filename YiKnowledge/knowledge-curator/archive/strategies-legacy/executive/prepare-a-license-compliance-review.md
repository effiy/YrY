---

title: I want to prepare a license compliance review
aliases:
- I want to do a license compliance review
- license-compliance-journey
- open-source-license-audit-journey
- license-compliance entry
tags:
- journeys
- license-compliance
- open-source
- ip-risk
- legal
- supply-chain
category: executive/strategy
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- executive
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../engineer/processes/do-a-dependency-audit.md
- ../../engineer/process/harden-supply-chain.md
- ../../engineer/patterns/adopt-a-new-dependency.md
- ../../engineer/quality-security/harden-supply-chain.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a license compliance review

> **As an** executive, **I want to** prepare a license compliance review, **so that** launch is safe.

> "Scan + tier + contagion + exception + approval + replacement + documentation + retrospective" reaches process + thinking + cases within 2 hops.

## Summary

- Process via [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) + [code-review.md](../../engineer/processes/do-a-code-review.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md)
- Cases via [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) + [no-lockfile-supply-chain-risk.md](./../../engineer/lessons/gotchas/no-lockfile-supply-chain-risk.md)

## Scenario

When conducting a license compliance review / license audit / open-source license scan / GPL/AGPL contagion check / copyleft risk assessment / commercial license conflict / pre-closed-source publish review / pre-acquisition IP due diligence / vendor IP review / legal sign-off / quarterly compliance audit / pre-promotion compliance scan, TL + architect + legal + security need to look up process + thinking + cases. This entry aggregates license-compliance-related process + thinking + cases into a 2-hop path, avoiding "scan missed / tiering chaos / contagion wrong / exceptions dragging / approval missing / replacement delayed / documentation scattered / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [code-review.md](../../engineer/processes/do-a-code-review.md) · [requirement-review.md](../../product-manager/processes/requirement-review.md) · [design-review.md](../../product-manager/processes/design-review.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of compliance · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert to imagine lawsuits · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — contagion chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [contract-negotiation-summary.md](./../../engineer/strategies/prepare-a-contract-strategy.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — legal notifications |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — external legal counsel |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — compliance incident archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../../engineer/lessons/gotchas/no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](./../../engineer/lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../../engineer/lessons/gotchas/sse-ondone-guard.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project's `dev-standards-summary.md` §depends on + `adr-*` §third-party selection |
| `journeys/` | [../../engineer/processes/do-a-dependency-audit.md](../../engineer/processes/do-a-dependency-audit.md) · [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) · [./i-want-to-adopt-a-new-dependency.md](../../engineer/patterns/adopt-a-new-dependency.md) · [../../engineer/processes/handle-a-dependency-cve.md](../../engineer/processes/handle-a-dependency-cve.md) |

## Action recommendations

1. **First principles**: First ask "what compliance problem to solve / what happens if not reviewed / ROI / business impact"; do not review for the sake of reviewing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "compliance could go out of control (GPL contagion / lawsuit / trade-secret leak / delisting / recall / acquisition failure)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One GPL contagion → cascades to downstream / commercialization / acquisition; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest license set that meets business needs wins; do not pile up exceptions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Scan**: Must run SBOM + must scan direct dependencies + transitive dependencies + must have lockfile; see [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md).
6. **Tiering**: Must run tiering (green / yellow / red); green = MIT/Apache/BSD; yellow = MPL/LGPL; red = GPL/AGPL/SSPL/commercial-modification.
7. **Contagion**: Must run contagion analysis (link / static link / dynamic link / derivative works / service-as); GPL/AGPL must be handled carefully.
8. **AI model licensing**: Must scan model license (LLaMA / Mistral / Qwen / commercial-use restriction + commercial license); see [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md).
9. **Exceptions**: Must run an exception list + must have legal sign-off + must have sponsor approval + must have an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
10. **Replacement**: Must run a replacement plan + must dual-run + must run regression; see [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md).
11. **New dependencies**: New dependencies must run [adopt-a-new-dependency.md](../../engineer/patterns/adopt-a-new-dependency.md) + must have legal pre-review.
12. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); engineering / legal / sponsor / security owners.
13. **Contract**: Must run [contract-negotiation-summary.md](./../../engineer/strategies/prepare-a-contract-strategy.md); third-party / vendor contract IP terms.
14. **External counsel**: For complex licenses, must use [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) external legal counsel.
15. **Freeze period**: During promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change the dependency license set.
16. **Notifications**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify sponsor + legal + business.
17. **Retrospective**: After a compliance incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + supplement process + archive in [bugs/](../../engineer/lessons/failures/bugs).
18. **Documentation**: Must run SBOM documentation + must keep repo-root catalog LICENSE / NOTICE / THIRD-PARTY; see [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md).
19. **Quarterly audit**: Use [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the license set is still compliant + whether SBOM is still accurate.
20. **ADR**: License decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
21. **Flywheel**: Good compliance → trust rises → more business / smoother acquisitions; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [../../engineer/processes/do-a-dependency-audit.md](../../engineer/processes/do-a-dependency-audit.md) — dependency audit
- similar journey: [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) — supply chain hardening
- similar journey: [./i-want-to-adopt-a-new-dependency.md](../../engineer/patterns/adopt-a-new-dependency.md) — new dependency
- similar journey: [../../engineer/processes/handle-a-dependency-cve.md](../../engineer/processes/handle-a-dependency-cve.md) — CVE
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) - patterns leaf entry
