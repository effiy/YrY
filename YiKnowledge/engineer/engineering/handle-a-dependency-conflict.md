---
title: Handle a dependency conflict
aliases:
- I want to handle dependency conflicts
- dependency-conflict-journey
- version-conflict-journey
- dependency conflict entry
tags:
- journeys
- dependency
- conflict
- monorepo
- peer-dep
- version-resolution
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../patterns/adopt-a-new-dependency.md
- ../strategies/harden-supply-chain.md
- ../../oncall-sre/incident-response/handle-a-major-version-upgrade.md
- ../../engineer/engineering/dependency-upgrade.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to handle a dependency conflict

> **As an** engineer, **I want to** handle a dependency conflict, **so that** incident is contained.

> "diagnosis + version parse + peer dep + monorepo + lockFile + dual-world + rollback + retrospective" reachable within 2 hops of Process + Pattern + Thinking + Case study.

## Summary

- Process follows [dependency-upgrade-process.md](dependency-upgrade.md) + [incident-response-process.md](../process/incident-response.md) + [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md)
- Pattern follows [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) + [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Case study follows [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) + [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) + [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md)

## Core viewpoints

**Brute-force resolution is the most expensive way to solve a dependency conflict.** Running `npm install --force` or `pip install --ignore-dependencies` silences the error message but does not resolve the underlying incompatibility. The conflict manifests later as a runtime bug, a production deploy failure, or a security vulnerability from a silently downgraded package. The time spent diagnosing the conflict at the dependency tree level is always shorter than the time spent debugging the downstream consequences.

**Lockfile drift is a silent incident waiting to happen.** A lockfile that is not committed, not reproducible, or not verified in CI means that different environments run different dependency trees. The bug that passes locally but fails in production is almost always a lockfile drift problem. The lockfile is not a convenience file; it is the contract between development and production.

**Monorepo hoisting turns a local dependency conflict into a cross-project incident.** When a monorepo hoists a shared dependency to the root, a version conflict in one package can silently affect every other package in the workspace. The diagnosis must trace the hoist path, not just the local dependency tree. Tools like `pnpm why` and `npm ls` are essential, but they must be run from the workspace root, not from the individual package directory.

**The dual-world pattern is the only safe way to resolve a conflict that requires a version jump.** When upgrading a dependency from v2 to v4 (or switching frameworks entirely), running both versions in parallel with a traffic split is the only approach that preserves rollback capability. A direct cutover without dual-world means the rollback path is untested and likely broken. The dual-world period is not optional overhead; it is the insurance policy.

**Every dependency conflict resolution must produce a regression test, not just a fix.** The conflict that occurred once will occur again when the next developer upgrades a different package in the same tree. The resolution must include a CI check (lockfile integrity, peer dependency validation, version range enforcement) that catches the same class of conflict before it reaches production. Without the regression test, the fix is temporary.

## Key info

- **Dependency conflict diagnosis toolkit (5 commands by package manager)**: npm — `npm ls <package>` (trace the dependency tree), `npm explain <package>` (why is this package installed?), `npx npm-why <package>` (reverse dependency lookup); pnpm — `pnpm why <package>` (most powerful, shows all dependents and hoist paths), `pnpm list --depth=5` (full tree); pip — `pipdeptree` (visualize the tree), `pip check` (verify consistency); cargo — `cargo tree` (full tree), `cargo tree -i <crate>` (reverse dependencies); yarn — `yarn why <package>` (why is this installed?). The most common diagnostic mistake: running the command from the wrong directory (not the workspace root in monorepos). The Yi-family projects use pnpm (YiVad/YiPet) and pip/uv (YiAi).
- **Conflict resolution strategies (4 strategies ranked by safety)**: (1) Version alignment — upgrade all packages to a compatible version range; safest, but requires coordination across dependents; (2) Dependency override — use `overrides` (npm/pnpm), `resolutions` (yarn), or `dependency_override` (pip) to force a specific version; moderate risk — the override may break a dependent that genuinely requires a different version; (3) Fork/vendor — fork the conflicting package and apply the fix; high effort, moderate risk — you now maintain a fork; (4) Replace — replace one of the conflicting packages with an alternative; highest effort, highest risk — requires migration of all usage. The Yi-family standard: always try strategy 1 first; strategy 2 requires an ADR documenting the override and a quarterly review to remove it; strategies 3 and 4 follow the tech selection process.
- **Lockfile integrity verification (CI checks)**: (1) Lockfile must be committed — CI fails if `package-lock.json`/`pnpm-lock.yaml`/`uv.lock` is not in the commit; (2) Lockfile must be fresh — CI runs `npm ci`/`pnpm install --frozen-lockfile`/`uv sync --frozen` and fails if the lockfile is out of date; (3) Lockfile must be reproducible — CI runs install twice and compares the lockfiles; (4) Lockfile must be reviewed — changes to the lockfile in a PR must be explainable; a lockfile diff that adds 50 new packages for a one-line code change is a red flag. The Yi-family projects: YiVad has lockfile integrity (pnpm), YiPet has lockfile integrity (pnpm), YiAi does NOT have a lockfile (identified as supply chain debt, high interest).
- **Monorepo hoist conflict resolution pattern**: In a monorepo (pnpm workspace, npm workspaces, yarn workspaces), dependencies are hoisted to the root `node_modules`. A version conflict in one package can silently "win" the hoist and affect all other packages. The diagnosis pattern: (1) Run `pnpm why <package>` from the workspace root to find all packages that depend on it; (2) Check which version is hoisted (`ls node_modules/<package>/package.json | grep version`); (3) Check if any package's `package.json` specifies a different version range; (4) If conflicts exist, use `pnpm.overrides` in the root `package.json` to force the version, or use `pnpm.packageExtensions` to fix specific packages. The YiVad and YiPet projects use pnpm workspaces; no hoist conflicts have occurred yet.
- **Peer dependency conflict resolution**: Peer dependencies are a contract: "I need version X of package Y, but I won't install it — you must provide it." When two packages require incompatible peer dependencies, the standard resolution strategies: (1) Upgrade one of the packages to a version that supports the newer peer dependency; (2) Use `overrides` to force the peer dependency version (risky — may break the package that requires the older version); (3) Find an alternative package that supports the newer peer dependency. The most common peer dependency conflict in the Yi-family stack: React version conflicts (React 18.3 vs. React 15 in YiPet before migration). The YiPet stack migration resolved this by upgrading all packages to React 18.3.
- **Yi-family dependency conflict history (2026-08)**: YiPet jsxDEV mismatch — React dev-mode plugin expected `jsxDEV` but production `NODE_ENV` define removed it; resolved by changing the chat bundle dev script to `--mode production`; root cause: React plugin and build configuration conflict. YiVad Vite-to-Rsbuild migration — several Vite plugins had no direct Rsbuild equivalent; resolved by writing custom Rsbuild plugins (svg-sprite, views-glob). YiAi no-lockfile — no lockfile means dependency versions are not pinned; identified as supply chain debt, not yet resolved. YiAi SSE onDone guard — streaming response parser did not handle the `onDone` event consistently; resolved by adding a guard in the SSE parser. The pattern: dependency conflicts in the Yi-family are primarily version mismatches (lockfile, peer deps) and build tool migration issues (plugin compatibility).

## Scenario description

When handling dependency conflicts / version conflicts / peer dep errors / monorepo hoist issues / lockFile drift / multiple versions of the same package coexisting / cross-package version incompatibility, Platform + TL + engineer need to look up Process + Pattern + Thinking + Case study. This entry aggregates dependency-conflict-related Process + Pattern + Thinking + Case study into a 2-hop path, avoiding "brute force install / lockFile drift / multi-version bloat / escalate triggering chain / team cognitive gap / cannot rollback".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [dependency-upgrade-process.md](dependency-upgrade.md) · [incident-response-process.md](../process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) · [shared-client-vendor-rollout-process.md](./shared-client-vendor-rollout.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — root cause · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion thinking chain · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — escalation chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) — simplest solution |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) |
| `lessons/wins/` | [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — AI auxiliary diagnosis |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) — cross-team coordination |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — Quarterly audit |
| `journeys/` | [./i-want-to-adopt-a-new-dependency.md](../quality-security/adopt-a-new-dependency.md) · [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) · [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) · [./handle-a-dependency-cve.md](../quality-security/handle-a-dependency-cve.md) |
| `projects/` | each project's `adr-*.md` + `dev-standards-summary.md` §dependency management |

## Action recommendations

1. **First principles**: first ask "root cause of conflict (peer dep / version scope / multi-version coexistence / hoist / lockFile drift)"; do not directly force install; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "what happens with brute force solve (hidden bugs / multi-version / performance degradation / security vulnerabilities / deploy inconsistency)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: escalating one package → chain triggers other package conflicts; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: satisfy constraints with the simplest solution (upgrade / downgrade / alias / ignore); do not pile up patches; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **diagnosis**: must first check `npm ls` / `pnpm why` / `yarn why` / `pip show` / `pipdeptree`; do not blindly try.
6. **lockFile**: must follow [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md); lockFile must be committed + must be reproducible.
7. **peer dep**: peer dep conflicts — first check host version; do not force; consider upgrading host or patching peer.
8. **monorepo**: hoist / workspace / pnpm hoist-pattern; must follow [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md).
9. **multi-version**: bundle size + inconsistency + type conflicts; must prioritise converging to a single version.
10. **dual-world**: old and new dependencies in parallel + alias + traffic cut; do not switch all at once; see [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md).
11. **1-1 mapping**: must follow [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md); first align then cut.
12. **rollback**: must be able to roll back in seconds (feature flag / retain old version / cut traffic); follow [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
13. **QA**: must first build regression QA set + evaluation set; QA must not pass before upgrading; follow [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md).
14. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), not for resolving conflicts.
15. **Monitoring**: during escalation follow [monitoring-governance-process.md](../process/monitoring-governance.md); must monitor error rate + performance + deploy consistency.
16. **team cognition**: after escalation must update [dev-standards-summary.md](../../engineer/projects) + run team sync; see [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md).
17. **ADR**: key conflict resolutions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
18. **Retrospective**: after resolution archive to [lessons/gotchas/](../lessons) or [lessons/wins/](../lessons).

## Anti-patterns

- **Resolving the symptom instead of the root cause.** Pinning a specific version, adding a resolution override, or using `--force` silences the conflict warning without addressing why the conflict exists. The root cause is almost always one of: a peer dependency range that is too narrow, a transitive dependency that should be a direct dependency, or a monorepo hoist that should be excluded. Treating the symptom means the same conflict will recur with the next upgrade.

- **Upgrading dependencies during a release freeze.** Resolving a dependency conflict during a promotion period or holiday freeze violates the freeze process and introduces untested changes at the worst possible time. The conflict existed before the freeze and can wait until after. A hotfix during a freeze should only address production incidents, not dependency hygiene.

- **Allowing multiple versions of the same package to coexist indefinitely.** Running two versions of React, lodash, or any core library in the same application doubles the bundle size, creates type conflicts, and introduces subtle behavioral differences. The dual-world pattern is for migration, not for permanent coexistence. Every multi-version situation must have a convergence plan with a deadline.

- **Skipping the ADR for a significant dependency change.** A dependency conflict resolution that changes the version of a core framework, introduces a new peer dependency, or switches a major library without an ADR is untraceable. When the next developer encounters the same conflict six months later, there is no record of why the decision was made. ADRs are not bureaucracy; they are institutional memory.

- **Running the fix without a rollback plan.** A dependency resolution that cannot be rolled back in seconds (via lockfile revert, feature flag, or dual-world cut) is a deployment risk, not a fix. The rollback path must be tested before the fix is deployed. If the rollback drill fails, the fix does not ship.

## Related

- Related journey: [./i-want-to-adopt-a-new-dependency.md](../quality-security/adopt-a-new-dependency.md) — new dependency
- Related journey: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — supply chain
- Related journey: [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) — major version upgrade
- Related journey: [./handle-a-dependency-cve.md](../quality-security/handle-a-dependency-cve.md) — CVE
- Upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
