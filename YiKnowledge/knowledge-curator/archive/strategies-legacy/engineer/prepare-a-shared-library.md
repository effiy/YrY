---

title: I want to prepare a shared library
aliases:
- I want to prepare a shared library
- shared-library-journey
- internal-sdk-journey
- npm-package-journey
- shared library entry
tags:
- journeys
- shared-library
- internal-sdk
- package
- monorepo
- versioning
- publishing
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
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../tools/share-client-across-projects.md
- ./bootstrap-a-new-project.md
- ./prepare-an-api-contract.md
- ../../engineer/architecture-design/ssot-view-layer.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a shared library

> **As an** engineer, **I want to** prepare a shared library, **so that** launch is safe.

> "Needs + boundary + naming + versioning + publishing + integration + monitoring + deprecation" reaches template + thinking + cases within 2 hops.

## Summary

- Template via [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) + [adr-template.md](../../knowledge-curator/templates/adr.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md)
- Cases via [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) + [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/wins/yivad-leaf-view-leaves-ssot.md)

## Scenario

When preparing a shared library / internal SDK / internal npm package / internal PyPI / internal maven / monorepo / polyrepo / shared client / shared utils / shared UI component / shared types / shared schema / internal tool library / package publish process / internal marketplace / quarterly library audit, TL + architect + platform + sponsor need to look up template + thinking + cases. This entry aggregates shared-library-related template + thinking + cases into a 2-hop path, avoiding "needs vague / boundary chaos / naming conflict / versioning chaos / publishing delayed / integration drift / monitoring missing / deprecation missing".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of sharing · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert to imagine loss of control · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) |
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [requirement-review.md](../../product-manager/processes/requirement-review.md) · [design-review.md](../../product-manager/processes/design-review.md) · [tech-review.md](../../product-manager/processes/tech-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform team |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — consumers |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `lessons/wins/` | [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/wins/yivad-leaf-view-leaves-ssot.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — shared library incident archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) · [react-jsxdev-mismatch.md](./../lessons/gotchas/react-jsxdev-mismatch.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project's `architecture-summary.md` §shared library + `dev-standards-summary.md` §depends on |
| `journeys/` | [../tools/share-client-across-projects.md](../tools/share-client-across-projects.md) · [./bootstrap-a-new-project.md](./bootstrap-a-new-project.md) · [./prepare-an-api-contract.md](./prepare-an-api-contract.md) · [./i-want-to-adopt-a-new-dependency.md](../patterns/adopt-a-new-dependency.md) |

## Action recommendations

1. **First principles**: First ask "what shared-library problem to solve / what happens if not built / ROI / consumer impact"; do not share for the sake of sharing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "shared library could go out of control (boundary chaos / naming conflict / versioning chaos / publishing delayed / integration drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: sharing once → consumer dependency changes → upgrade cascade; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest API that meets consumer needs wins; do not pile up features; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **JTBD**: must run [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) to understand real consumer needs.
6. **Boundary**: must run boundary (utils / SDK / UI / schema / business) + must have SSOT + must not mix layers; see [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md).
7. **Naming**: must run naming conventions + must have prefix (@org/) + must not conflict + must be versioned.
8. **Versioning**: must run semver + must have changelog + must have breaking flag + must have deprecation window; see [i-want-to-prepare-an-api-versioning-strategy.md](./prepare-an-api-versioning-strategy.md).
9. **Publishing**: must run CI/CD + must automate + must have lockfile + must have SBOM; see [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md).
10. **Contract**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + must have consumer pact + must have CI gate.
11. **Dual world**: upgrades must run [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + dual-run + diff.
12. **Monorepo**: must run monorepo vs polyrepo selection + must have ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
13. **AI SDK**: LLM SDK must run [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + must have multi-provider abstraction.
14. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / consumer / sponsor owner.
15. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change the shared library.
16. **Notifications**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify consumers + must have changelog.
17. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) to watch downloads / error rate / integration failures.
18. **Retrospective**: after a shared-library incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
19. **Deprecation**: must run deprecation window + must have migration guidance + must dual-run; see [i-want-to-deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md).
20. **Quarterly audit**: use [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the library is still used + whether versions are still accurate.
21. **ADR**: shared-library decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: good shared library → smooth integration → trust rises → more consumers; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [../tools/share-client-across-projects.md](../tools/share-client-across-projects.md) — shared client
- similar journey: [./bootstrap-a-new-project.md](./bootstrap-a-new-project.md) — bootstrap
- similar journey: [./prepare-an-api-contract.md](./prepare-an-api-contract.md) — API contract
- similar journey: [./i-want-to-adopt-a-new-dependency.md](../patterns/adopt-a-new-dependency.md) — new dependency
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) - patterns leaf entry
