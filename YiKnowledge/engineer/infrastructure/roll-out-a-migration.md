---
title: Roll out a migration
aliases:
- I want to roll out a migration
- migration landing entry
- rollout-journey
tags:
- journeys
- migration
- rollout
- grayscale
- staged-port
- supply-chain
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: migration is reversible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../tech-lead/architecture/design-architecture-decision.md
- ../../README.md
- ../../engineer/lessons/wins/README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to roll out a migration

> **As an** engineer, **I want to** roll out a migration, **so that** migration is reversible. 

> "Stack upgrade / large port / grayscale cut-stream how to do" reach within 2 hops 1:1 mapping + staged port + supply-chain hardening + eval set gate + multiple rollout wins. 

## Summary

- Stack upgrade goes [1-1-mapping-migration-pattern](../architecture-design/one-to-one-mapping-migration.md) (1:1 behavior mapping table + single-tool replacement + dual-track + no feature changes) 
- Large port goes [staged-port-methodology-pattern](../architecture-design/staged-port-methodology.md) (N stage split + baseline + parity + decouple + /loop regression) 
- Introducing new dependency must run [supply-chain-hardening-pattern](../process/harden-supply-chain.md) first (lockfile + audit + min-release-age + allowlist) 
- Quality gates go [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) (baseline + CI gate + rollback threshold) 
- Grayscale cut-stream: 1% → 10% → 50% → 100%, each tier 1 day observation + eval set gate + monitoring trio

## Core viewpoints

**The 1:1 mapping is the contract that prevents scope creep during a migration.** A stack migration (React 15 to React 18, Vite to Rsbuild) must be a like-for-like replacement with no feature changes. The 1:1 behavior mapping table (old behavior -> new behavior, old API -> new API) is the contract that keeps the migration focused. Every deviation from the mapping table is a scope change that should be a separate project, not smuggled into the migration.

**Each stage of a staged migration must be independently shippable and rollbackable.** A migration that is split into 5 stages but cannot be shipped until stage 5 is complete is not a staged migration; it is a big-bang migration with a progress bar. Each stage must produce a working, testable, deployable artifact. If stage 3 cannot be deployed independently, stages 1-3 should be a single stage.

**The regression loop (/loop) is the migration's quality flywheel.** Running automated regression checks every 2 hours during a migration catches regressions while the change is still fresh in the developer's mind. The cost of fixing a regression discovered 2 hours after the change is a fraction of the cost of fixing a regression discovered 2 weeks later during QA. The /loop must cover the recurring bug patterns (SSE race conditions, field-name traps, env remnants, stale bindings) that are the most common migration regressions.

**The eval set gate is the migration's go/no-go decision point.** Before cutting traffic to the new system, the eval set (a representative sample of inputs and expected outputs) must be run against both the old and new systems. The results must match within a predefined tolerance (e.g., 95% parity). If the eval set fails, the migration does not proceed. The eval set is the objective measure of migration readiness; without it, the decision is based on gut feel.

**The migration win (lessons/wins) is as important as the migration itself.** A migration that is completed but not documented is a migration that cannot be referenced by the next team facing the same problem. The win file (what was migrated, why, how, what was learned, what went wrong) is the institutional memory that makes the next migration faster. Every migration must produce a win file, and the win file must be reviewed by the team that will run the next migration.

## Key info

- **Grayscale cut-stream tiers**: 1% (1 hour, monitoring: error rate, latency, eval set parity), 10% (4 hours, same + user feedback), 50% (24 hours, same + business metrics), 100% (after 50% passes for 24 hours). Each tier has a go/no-go gate: if eval set parity drops below 95% or error rate exceeds 2x baseline, the tier is rolled back. The grayscale is not a schedule; it is a decision tree where each tier's results determine whether to proceed.
- **Yi-family migration history**: YiPet stack migration (React 15→18.3 + Bootstrap→AntD 5.21 + ESLint→Biome 2.5, 5 stages, separate PRs, caught `jsxDEV is not a function` in dual-track diff), YrY Vite→Rsbuild migration (Vite 8→Rsbuild 1, env prefix `VITE_`→`RSBUILD_ENV_`, svg-sprite + views-glob plugins). The YiVad aicr 7-phase port methodology (baseline alignment, /loop automated regression) is documented as a reference pattern but has not been landed on master (see BRD-2026-080). Each completed migration produced a win file; each win file documents the pattern for the next migration.
- **Migration PR discipline**: each migration PR must: (1) change only one tool/dependency at a time, (2) contain no feature changes (only mechanical replacements), (3) have a mapping table documenting every old→new API change, (4) pass dual-track diff (old and new output match within tolerance), (5) be independently deployable and rollbackable. The most common violation: mixing a feature change into a migration PR because "I was already touching that file."
- **Dual-track diff tolerance**: rendering diff (pixelmatch with 0.5% threshold -- tolerates anti-aliasing and sub-pixel differences), API diff (JSON compare with tolerance for field order, timestamp variance, floating-point precision), behavior diff (same input → same output, 95% parity minimum). The tolerance is non-zero because some differences are inherent to the new stack (rendering engine, floating-point arithmetic) and flagging them as regressions creates noise.
- **Rollback decision timeout**: if a migration tier shows a regression, the decision to rollback must be made within 15 minutes. The rollback itself must complete within 5 minutes. If the team spends more than 15 minutes debating whether to rollback, the rollback decision is made for them: rollback first, investigate later. The most common mistake: spending 30 minutes investigating a regression while the blast radius expands from 1% to 10% of users.

## Scenario

New stack upgrade (React / Vue / TS / Python) / large page port (YiWeb → YiVad) / multi provider switch / test introduction / lint replacement etc. scenarios "need staged rollout + each stage launchable and rollbackable". This entry aggregates migration methodology, rollout ADRs, milestone wins, gotchas into 2-hop paths, avoiding "big bang one-shot push = 80% stagnation". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) |
| `projects/YiAi/` | [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) · [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md) |
| `projects/YiVad/` | [adr-vitest-rollout.md](../../tech-lead/decisions/yivad--vitest-rollout.md) · [adr-aicr-phase-port.md](../../tech-lead/decisions/yivad--aicr-phase-port.md) |
| `projects/YiPet/` | [adr-aicr-port-rollout.md](../../tech-lead/decisions/yipet--aicr-port-rollout.md) |
| `lessons/wins/` | [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yivad-vitest-phase-one-win.md](../lessons/win-yivad-vitest-phase-one.md) · [yiai-llm-phase-two-win.md](../lessons/win-yiai-llm-phase-two.md) · [yivad-vitest-phase-two-win.md](../lessons/win-yivad-vitest-phase-two.md) · [yiai-llm-phase-three-win.md](../lessons/win-yiai-llm-phase-three.md) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) |
| `work/processes/` | [shared-client-vendor-rollout.md](../engineering/shared-client-vendor-rollout.md) · [dependency-upgrade-process.md](../engineering/dependency-upgrade.md) · [release-process.md](../../oncall-sre/release/release.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) |

## Action recommendations

1. First check `methodology/engineering-patterns/` for reusable pattern (1:1 mapping / staged / hardening / eval set gate). 
2. Stack upgrade goes 1:1 mapping (single-tool replacement + dual-track + no feature changes); large port goes staged (N stages + baseline + parity + decouple). 
3. Before introducing new dependency must run supply-chain hardening (lockfile + audit + min-release-age 7d + lifecycle allowlist), prerequisite complete before opening next stage. 
4. Before cut-stream run eval set baseline; after cut-stream each tier gate block (rollback > 5% auto rollback). 
5. Grayscale cut-stream 1% → 10% → 50% → 100%, each tier 1 day observation + monitoring trio (error rate / latency / feedback). 
6. Each stage independently launchable and rollbackable; no accumulating big bang. 
7. Large port each stage build verification + /loop every 2h auto regression prevent tech debt accumulation. 

## Anti-patterns

- **Big-bang migration: rewriting everything and deploying once.** The entire system is rewritten over 6 months, and then deployed in one weekend. The deployment fails because the new system has never been tested against production traffic, and the rollback is impossible because the old system has been neglected. The big-bang migration is the highest-risk migration strategy, and it is almost never necessary.

- **Mixing feature changes with the migration.** The team decides to "improve the API while we're migrating" and adds new fields, changes the response format, and renames endpoints. The migration is now both a platform change and a feature change, and when something breaks, it is impossible to tell which change caused the breakage. The migration must be a pure mechanical transformation with zero feature changes.

- **Skipping the baseline because "we know what the old system does."** The team assumes the old system's behavior is well-understood and skips the step of capturing the old system's outputs for a representative set of inputs. When the new system produces different outputs for the same inputs, the team cannot tell whether the difference is a bug in the new system or a behavior of the old system that was never documented. The baseline is the ground truth.

- **Deploying the migration without a rollback drill.** The migration is deployed, something goes wrong, and the team discovers that the rollback procedure documented in the runbook does not work because a dependency was changed during the migration. A rollback drill that is run before the migration catches the broken rollback procedure before it is needed in production.

- **Declaring the migration complete and immediately moving the team to the next project.** The migration is "done," the team moves on, and the remaining bugs, edge cases, and documentation gaps are left for the on-call team to discover. The migration must include a stabilization period (1-2 weeks) where the migration team is still the primary responder for migration-related issues.

## Related

- Same-class journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — decision ADR after landing go this journey
- Same-class journey: [../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — migration gotchas checklist
- Same-class journey: [./review-lessons.md](../process/review-lessons.md) — milestone win accumulation
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — operations 4 roles 3 rhythms
