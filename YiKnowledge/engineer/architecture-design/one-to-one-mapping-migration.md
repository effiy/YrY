---
title: 1-to-1 Mapping Migration Pattern
aliases: [one-to-one-mapping-migration-pattern, 1-1-migration, stack-version-aligned-migration]
tags: [pattern, engineering patterns, migration, 1-to-1-mapping, version-alignment, dual-track-validation, stack-upgrade]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Large-scale migrations are executed safely by mapping old entities to new ones with rollback checkpoints"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
- ./staged-port-methodology.md
  - ../lessons/win-yipet-stack-migration.md
  - ../lessons/gotcha-react-jsxdev-mismatch.md
  - ../../tech-lead/decisions/yipet--biome-lint-format.md
---

# 1-to-1 Mapping Migration Pattern

> **As an** engineer, **I want to** one to one mapping migration, **so that** pattern applied consistently.

> Stack version alignment + 1:1 behavior mapping table + single-tool replacement + dual-track validation; do not let "upgrade = refactor" changes sneak into migration PRs. Migration = version switch with behavior unchanged.

## Summary

- **Pattern**: Old stack version X → new stack version Y with 1:1 behavior mapping table (API / config / default values / boundary cases) + single-tool replacement (one at a time) + dual-track run (old / new in parallel) + behavior diff assertion + migration PR forbids feature changes
- **Cross-project applicability**: YiPet (React 15→18.3 + Bootstrap→AntD 5.21 + ESLint→Biome 2.5; 5 stages, each a 1:1 migration)
- **Landing**: [yipet stack migration win](../lessons/win-yipet-stack-migration.md)
- **Alternative**: refactor-while-migrating (not applicable; reason in §Not applicable)

## Core viewpoints

**The migration is not the refactor -- and conflating them is the single most expensive mistake in stack upgrades.** A migration changes the version of a dependency. A refactor changes the structure of the code. Doing both in the same PR produces a diff that is unreviewable: half the changes are mechanical version bumps, half are behavior changes, and no one can tell which is which. The migration must be behavior-preserving by construction.

**The mapping table is the migration's specification, not its documentation.** Writing the mapping table after the migration is documentation. Writing it before the migration is design. Every old API must have a corresponding new API row, and every row must describe the behavior difference. A row that says "none" for behavior difference is a claim that must be verified by a test.

**Single-tool replacement is not about simplicity -- it is about rollback granularity.** If you swap React, Bootstrap, and ESLint in one PR and something breaks, you must roll back all three. If you swap them in three separate PRs and only React breaks, you roll back React and keep Bootstrap and ESLint. The cost of single-tool replacement is more PRs; the benefit is that a failure in one tool does not block the others.

**Dual-track is not a QA step -- it is the only way to prove the migration is behavior-preserving.** "It looks the same to me" is not verification. Running the old and new builds side-by-side and diffing the output is verification. The diff threshold must be non-zero (0.5%) to tolerate rendering engine differences, anti-aliasing variance, and timing-dependent behavior that is not a regression.

**The gray release is not a risk reduction strategy -- it is the admission that no amount of testing catches everything.** Even with a mapping table, dual-track diff, and CI assertions, some issues only appear under real traffic. The 1% -> 10% -> 50% -> 100% progression limits the blast radius of each undiscovered issue to an increasingly tolerable fraction of users.

## Key info

- **Mapping table structure**: each row has: old API/component/prop → new API/component/prop → behavior difference (none, parameter order changed, default value changed, removed, new required param) → test coverage (unit/integration/visual) → migration status (pending/in-progress/done). The table becomes the PR checklist: every row marked "done" must have a corresponding test. A row marked "none" for behavior difference but with no test is a lie waiting to be discovered.
- **YiPet stack migration metrics**: 5 stages (React 15→18.3, Bootstrap→Ant Design 5.21, ESLint→Biome 2.5, Webpack→Rsbuild, class components→hooks), each as a separate migration PR. File count: 80+ files changed across all stages. The React version bump alone was 40+ files but all changes were mechanical (no behavior change). The `jsxDEV is not a function` gotcha was caught during dual-track diff, not in production -- the dev-mode React plugin + production NODE_ENV conflict would have broken the chat bundle.
- **Dual-track diff setup**: run old build and new build against the same input (fixture data or recorded production traffic), capture output (rendered HTML, API responses, console logs), diff with a tolerance threshold. For visual regression: pixelmatch with 0.5% threshold. For API regression: JSON diff with tolerance for field order, timestamp variance, and floating-point precision. The diff tool must be CI-runnable; manual "looks good to me" is not verification.
- **Gray release percentages**: 1% (1 hour, catch catastrophic failures), 10% (4 hours, catch moderate regressions), 50% (24 hours, catch subtle performance issues), 100% (after 50% passes for 24 hours). The progression is not linear -- the jump from 50% to 100% is the largest because 50% of traffic has already validated the new stack, and the remaining 50% is unlikely to expose new issues. The most common failure pattern: a performance regression that only manifests at 50% load, caught at the 50% stage.
- **Migration PR size limits**: each migration PR should change ≤200 lines and ≤20 files. If the mapping table has 100 rows, split into 5 PRs of 20 rows each. The reviewer's attention is a finite resource; a 500-line diff gets skimmed, a 200-line diff gets reviewed. The per-PR limit is what a reviewer can carefully check in 30 minutes.

## Problem

Pain points when not using this pattern (quantified):

- **Behavior drift**: migration + refactor mixed = behavior changes unattributable = bug localization hard
- **Unreviewable PR**: 5000-line diff contains migration + feature changes + refactor = review fails = regressions after merge
- **Multiple tools swapped at once**: React + Bootstrap + ESLint swapped together = when it breaks, unclear which one broke = rollback everything
- **No mapping table**: old API → new API by memory = cases missed = inconsistent boundary behavior
- **No dual-track**: switch directly after migration = users find issues, cannot roll back = incident

## Pattern

### 1. Version alignment + 1:1 mapping table

```markdown
## React 15 → 18.3 mapping table

| Old API | New API | Behavior difference | Handling |
|---|---|---|---|
| `ReactDOM.render` | `createRoot().render()` | concurrent mode on by default | check useEffect deps |
| `useState` lazy init | same | none | - |
| `forwardRef` | `React.forwardRef` | none | - |
| `jsxDEV` (dev) | `jsxDEV` (production) | `--mode production` required | see [react-jsxdev gotcha](../lessons/gotcha-react-jsxdev-mismatch.md) |
```

Every API / config / default value / boundary case must have a mapping row.

### 2. Single-tool replacement

```markdown
## YiPet 5 stages (each a 1:1 migration)

1. React 15 → 18.3 (only React, leave Bootstrap / ESLint)
2. Bootstrap → AntD 5.21 (only UI lib, leave React / ESLint)
3. ESLint → Biome 2.5 (only lint, leave React / UI lib)
4. Build: CRA → Vite → Rsbuild (only build)
5. TS strictness: strict off → on
```

Each stage independently launchable + rollback-able + non-blocking for next stage.

### 3. Dual-track validation

```bash
# Old / new run in parallel, behavior diff
npm run build:old  # old stack build
npm run build:new  # new stack build

# Visual / behavior diff
npx playwright test --config=playwright.old.ts
npx playwright test --config=playwright.new.ts

# Behavior diff > threshold = block
node scripts/diff-threshold.mjs --max-diff 0.5%
```

### 4. Migration PR forbids feature changes

```yaml
# .github/PR-CHECKLIST.yml
migration-pr:
  - stack replacement only, no feature changes
  - behavior mapping table attached to PR description
  - dual-track build passes
  - visual diff < 0.5%
  - gray 1% / 10% / 50% / 100% traffic shift
```

Feature changes go in separate PRs; migration PR only does version switch.

## Applicable / Not applicable

### Applicable

- Stack upgrade (React / Vue / Angular / TS / Python / Node)
- UI lib replacement (Bootstrap → AntD / Element → Naive)
- Build tool replacement (CRA → Vite → Rsbuild / Webpack → Vite)
- Lint replacement (ESLint → Biome)
- Backend framework (Express → FastAPI / Flask → Litestar)

### Not applicable

- Pure refactor (no version switch): use a pure refactor PR
- Brand-new project: no need for old-stack alignment
- Emergency security fix: fix first, migrate later
- Behavior is intended to change: migration + behavior change mixed is reasonable

## Landing checklist

| No. | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Write version alignment + 1:1 mapping table (API / config / default / boundary) | documentation | One-time |
| 2 | Single-tool replacement: each stage a 1:1 migration, no mixed changes | backend / frontend | Gradual |
| 3 | Dual-track build (old / new in parallel) + visual / behavior diff | CI | One-time |
| 4 | Behavior diff threshold (> 0.5% blocks) | CI | One-time |
| 5 | Migration PR forbids feature changes (review checklist) | process | One-time |
| 6 | Gray traffic shift (1% → 10% → 50% → 100%) | launch | Per stage |
| 7 | Rollback plan (each stage independently rollback-able) | launch | Per stage |

## Action recommendations

1. **Write the 1:1 behavior mapping table before starting the migration, not after.** Every old API, config, default value, and boundary case must have a corresponding new-API row before any code is changed. A row that says "no behavior difference" is a claim that must be verified by a dual-track test. Writing the table after the migration is documentation; writing it before is design.

2. **Replace one tool at a time in separate PRs, each independently launchable and rollbackable.** If you swap React, Bootstrap, and ESLint in one PR and something breaks, you must roll back all three. If you swap them in three separate PRs, a failure in one does not block the others. The cost of single-tool replacement is more PRs; the benefit is granular rollback.

3. **Run the old and new builds side-by-side and diff the output with a non-zero threshold (0.5%).** "It looks the same to me" is not verification. A dual-track behavior diff is the only way to prove the migration is behavior-preserving. The 0.5% threshold tolerates rendering engine differences and anti-aliasing variance that are not regressions.

4. **Enforce a strict rule: migration PRs forbid feature changes and unrelated bug fixes.** "While I was migrating React, I also fixed that login bug" is the fastest way to make a migration unreviewable and unrollbackable. Bug fixes and feature changes go in separate PRs before or after the migration. The migration PR must be a pure version switch.

5. **Progress the gray release through 1% -> 10% -> 50% -> 100% with each step running long enough to observe error rates and latency.** A 1% canary that runs for 5 minutes and then jumps to 100% is a big-bang release with a 5-minute delay. Each step's duration should be proportional to the migration's risk, and each step must have defined rollback criteria.

## Anti-patterns

**Migration without a rollback plan.** A migration PR that cannot be reverted is a one-way door. If the migration is deployed and users report issues, the team must be able to roll back to the old stack in minutes, not days. The rollback plan must be tested before the migration is deployed.

**"We will fix the types later."** A migration that introduces `as any` or `// @ts-ignore` to bypass type errors is accumulating technical debt that will never be paid. The migration must pass type checking with the same or higher strictness as the old stack. Suppressed errors are hidden regressions.

**Skipping the behavior diff for "obvious" changes.** The mapping table says "no behavior difference," but the developer skipped the dual-track diff because "it is obviously the same." The most subtle regressions hide in "obvious" changes: a CSS default value that changed, an API that returns a different shape for null, a timing-dependent race condition.

**Gray release that jumps from 1% to 100%.** A 1% canary that runs for 5 minutes and then jumps to 100% is not a gray release -- it is a big-bang release with a 5-minute delay. Each step (1%, 10%, 50%, 100%) must run long enough to observe error rates, latency, and user reports. The duration of each step should be proportional to the risk of the migration.

**Migration PR that also fixes unrelated bugs.** "While I was migrating React, I also fixed that login bug." This is the fastest way to make a migration unreviewable and unrollbackable. The migration PR must be a pure version switch. Bug fixes go in separate PRs before or after the migration.



- **Refactor-while-migrating**: feature changes mixed in diff = review fails; migration PR must forbid feature changes.
- **Multiple tools swapped at once**: React + Bootstrap + ESLint swapped together = when broken, unclear which broke; must use single-tool replacement.
- **No mapping table**: old API by memory = cases missed; must have 1:1 behavior mapping table + boundary cases.
- **No dual-track**: switch directly after migration = users find issues, cannot roll back; must run dual-track + behavior diff.
- **Diff threshold = 0**: noise blocks merge; 0.5% threshold tolerates noise.
- **Skip gray release**: 100% traffic switch = total outage; must 1% → 10% → 50% → 100%.
- **Stages not independent**: stage 2 depends on stage 1 incomplete = blocking; each stage must be independently launchable + rollback-able.
- **Skip [react-jsxdev](../lessons/gotcha-react-jsxdev-mismatch.md) class trap**: mixing dev / prod modes = deploy breaks; must explicitly `--mode production`.

## Related

- landing: [yipet stack migration win](../lessons/win-yipet-stack-migration.md) — React 15→18.3 + Bootstrap→AntD 5.21 + ESLint→Biome 2.5
- landing: [react-jsxdev mismatch gotcha](../lessons/gotcha-react-jsxdev-mismatch.md) — dev / prod mode mixing trap
- Companion: [staged-port-methodology-pattern](./staged-port-methodology.md) — staged methodology for large ports
- Companion: [supply-chain-hardening-pattern](../process/harden-supply-chain.md) — hardened process for upgrades
- upstream: [./README.md](./) — engineering-patterns leaf entry
