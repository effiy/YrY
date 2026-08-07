---
title: Handle a major version upgrade
aliases:
- I want to handle a major version upgrade
- major-upgrade-journey
- framework-upgrade-journey
- breaking-changes
- major version upgrade entry
tags:
- journeys
- major-upgrade
- framework
- migration
- breaking-changes
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
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/quality-security/adopt-a-new-dependency.md
- ../../engineer/infrastructure/roll-out-a-migration.md
- ../../engineer/infrastructure/ship-a-release.md
- ../../engineer/engineering/dependency-upgrade.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to handle a major version upgrade

> **As a** oncall sre, **I want to** handle a major version upgrade, **so that** incident is contained.

> "Major version upgrade + breaking changes + dual-world + canary + rollback + test coverage + compatibility layer" reaches migration patterns + thinking + process + case studies within 2 hops.

## Summary

- Process follows [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md) + [release-process.md](../../oncall-sre/release/release.md) + [canary-release-process.md](../../oncall-sre/release/canary-release.md)
- Patterns follow [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) + [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) + [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md)
- Test follows [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) + [yivad-vitest-phase-*](../../engineer/lessons)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md)
- Cases follow [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) + [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) + [vite-to-rsbuild-migration.md](../../engineer/lessons/gotcha-vite-to-rsbuild-migration.md)

## Core viewpoints

**A major version upgrade is a migration, not a routine dependency bump.**
Teams that treat a major version upgrade like a minor version bump are the ones that cause production outages. Major versions change APIs, deprecate features, alter performance characteristics, and introduce new failure modes. The upgrade must be treated as a migration project with its own design document, test plan, canary rollout, and rollback procedure. The cost of treating it as a routine update is measured in hours of downtime.

**The most dangerous breaking changes are not in the changelog.**
Every major version changelog lists the documented breaking changes. But the real risks are the undocumented ones: subtle behavioral differences in edge cases, performance regressions under specific workloads, changed defaults that affect assumptions made in configuration files, and interactions with other dependencies that were not tested by the upstream maintainers. The only way to find these is through comprehensive testing with real workloads.

**The dual-world strategy is the only safe way to upgrade a critical system.**
Running the old and new versions in parallel with traffic splitting is the only approach that provides a meaningful rollback. A big-bang cutover, even with a rollback plan, is gambling. The rollback plan is only as good as the last time it was tested. The dual-world strategy allows you to incrementally shift traffic to the new version, observe behavior, and shift back instantly if problems arise. The cost of maintaining two versions temporarily is always less than the cost of a failed cutover.

**The upgrade is not complete until the team is retrained.**
A major version upgrade changes the developer experience: new APIs, new tooling, new debugging workflows, and new performance characteristics. If the team is not retrained on the new version, they will resist it, misuse it, and introduce bugs from old habits. The upgrade plan must include: updated documentation, updated onboarding materials, a team training session, and a migration guide for other teams that depend on the upgraded component.

## Scenario

For major version upgrades like React 15→18 / Vite→Rsbuild / Vue 2→3 / Node 16→20 / Python 3.8→3.12 / Spring Boot 2→3, TL + platform + engineers need migration patterns + test coverage + dual-world + canary + rollback + cases. This entry aggregates major version upgrade related patterns + thinking + process + cases to a 2-hop path, avoiding "big-bang cut / missing tests / missed breaking changes / non-rollbackable / team awareness gap".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `work/processes/` | [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md) · [release-process.md](../../oncall-sre/release/release.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [tech-roadmap-review-summary.md](../../engineer/process/tech-roadmap-review.md) |
| `lessons/wins/` | [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) — React 15→18 + AntD upgrade · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) — Vite→Rsbuild · [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) · [yivad-vitest-phase-{one,two,three,four}-win.md](../../engineer/lessons) — test coverage · [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) |
| `lessons/gotchas/` | [vite-to-rsbuild-migration.md](../../engineer/lessons/gotcha-vite-to-rsbuild-migration.md) · [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) — upgrade-period incident · [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) — upgrade-triggered incidents |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — upgrade as debt repayment |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) — upgrade RFC |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — breaking changes scan |
| `projects/` | each project's `adr-*.md` — upgrade ADR; `dev-standards-summary.md` — post-upgrade dev standards |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) — cross-team upgrade RACI |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — upgrade notifications |

## Action recommendations

1. **First principles**: first ask "why upgrade / what happens if not / what value upgrade brings / upgrade cost"; do not upgrade for upgrade's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how upgrade could blow up (breaking / perf degradation / compatibility / team awareness)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: how will upgrade change architecture / team / cost structure? see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Breaking changes list**: must scan official migration guide + full breaking changes list + assess impact per item; do not miss any.
5. **Dual-world**: new + old in parallel + abstraction layer + traffic splitting; do not big-bang cut; see [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md).
6. **1-1 mapping**: first do behavior alignment (old vs new output identical) then switch; see [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md).
7. **Test coverage**: must build regression test set + eval set first; no upgrade without test pass; see [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) + [yivad-vitest-phase-{one,two,three,four}-win.md](../../engineer/lessons).
8. **Compatibility layer**: build shim / adapter / polyfill for smooth transition when needed; see [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md).
9. **Canary**: internal → canary users → full; observe core metrics + error rate + latency at each step; see [canary-release-process.md](../../oncall-sre/release/canary-release.md).
10. **Rollback**: must be able to roll back in seconds (feature flag / traffic cut / old version retained); see [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
11. **Freeze period**: during promotions / holidays follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not stack upgrades.
12. **Monitoring**: during upgrade must monitor error rate + latency + capacity + alerts; see [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md).
13. **ADR**: upgrade must produce an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md) + project `adr-*.md`.
14. **Team awareness**: after upgrade must update [dev-standards-summary.md](../../engineer/projects) + onboarding + run a team sync; see [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md).
15. **Retrospective**: after upgrade, do retrospective + archive to [lessons/wins/](../../engineer/lessons) or [lessons/gotchas/](../../engineer/lessons).

## Anti-patterns

- **Upgrading because "the version is old" without a value case.** "Version 2.x is EOL in 6 months" is a valid reason. "Version 3.x has been out for a year and we should keep up" is not. Every major version upgrade must have a documented value case: what specific improvements does the new version provide (security patches, performance gains, new features, reduced maintenance burden), and what is the cost of not upgrading? If the value case is "staying current," the upgrade is a vanity project that creates risk with no reward.

- **Doing a big-bang cutover because "the rollback plan is solid."** A rollback plan that has not been tested under production load is not a plan; it is a hope. The rollback procedure must be tested in a staging environment with production-scale data, and it must be tested again in production with a small percentage of traffic before the full cutover. If the rollback takes more than 60 seconds, the upgrade is too risky for a big-bang cutover.

- **Upgrading multiple major versions in a single step.** Jumping from version 1.x to version 3.x in one upgrade is exponentially riskier than upgrading step by step. Each major version introduces its own breaking changes, and the interaction between multiple sets of breaking changes is unpredictable. Upgrade one major version at a time, stabilize, and then upgrade the next. If you are multiple versions behind, the incremental path is the only safe path.

- **Skipping the compatibility layer because "we will fix everything at once."** The desire to rewrite every deprecated API call in a single PR is understandable but dangerous. A compatibility layer (shim, adapter, or polyfill) allows the system to run on the new version while individual components are migrated incrementally. This reduces the blast radius of each migration step and makes it possible to bisect issues. Without a compatibility layer, every migration is an all-or-nothing gamble.

- **Declaring the upgrade complete after the canary reaches 100%.** The canary reaching 100% traffic means the rollback window has closed, not that the upgrade is complete. The post-upgrade stabilization period (typically 1-2 weeks) is when subtle issues emerge: memory leaks that take days to accumulate, performance regressions under specific workloads, and edge cases that only appear with full production traffic patterns. The upgrade is complete only after the stabilization period has passed without incident.

## Related

- Same-category journey: [./i-want-to-adopt-a-new-dependency.md](../../engineer/quality-security/adopt-a-new-dependency.md) — new dependency onboarding
- Same-category journey: [../../engineer/infrastructure/roll-out-a-migration.md](../../engineer/infrastructure/roll-out-a-migration.md) — migration patterns
- Same-category journey: [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) — release including upgrade
- Same-category journey: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — upgrade as debt repayment
- Upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
