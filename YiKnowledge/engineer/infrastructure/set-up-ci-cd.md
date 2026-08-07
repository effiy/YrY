---
title: Set up CI/CD
aliases:
- I want to build CI/CD
- cicd-journey
- pipeline entry
- automation release entry
tags:
- journeys
- ci-cd
- pipeline
- automation
- release
- canary
- rollback
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
benefit: baseline is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../processes/ship-a-release.md
- ../strategies/harden-supply-chain.md
- ./set-up-testing-infrastructure.md
- ../../README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to set up CI/CD

> **As an** engineer, **I want to** set up ci cd, **so that** baseline is reproducible.

> Reach "how to build CI/CD pipeline + automated release + canary + rollback + gradual rollout" within 2 hops across release process + testing infrastructure + supply-chain hardening + monitoring.

## Summary

- CI: [./set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) + [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md)
- CD: [../processes/ship-a-release.md](ship-a-release.md) + [work/processes](../process/README.md) (release / canary / hotfix / rollback-drill / release-freeze)
- Eval set gate: [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md)
- Monitoring gate: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md)

## Core viewpoints

**CI/CD is a contract between the developer and the production environment.** The CI pipeline represents the team's collective agreement about what "done" means: linted, tested, supply-chain-hardened, and buildable. Any change that bypasses the CI pipeline is a breach of that contract. The CI pipeline must be the only path to production; manual deployments must be impossible by policy and by tooling.

**The CI pipeline must be fast enough that developers do not dread it.** A CI pipeline that takes 45 minutes to run teaches developers to batch their changes into large, infrequent PRs to amortize the wait time. The pipeline must complete in under 10 minutes for the common case. Parallelization, caching, and incremental builds are not optimizations; they are requirements for developer productivity.

**The CD pipeline must be reversible, not just reliable.** A deployment that succeeds 99.9% of the time but takes 30 minutes to roll back the other 0.1% is a deployment that carries unacceptable risk. The rollback path must be faster than the rollout path, and it must be tested on a regular cadence. A rollback drill that has not been run in the last quarter is a rollback that does not exist.

**The canary is the CD pipeline's safety net, not an optional feature.** A 1% canary that observes error rate, latency, and user feedback for a full day before expanding to 10% catches deployment-specific regressions that no amount of pre-production testing can catch. The canary tiers (1% -> 10% -> 50% -> 100%) exist to limit the blast radius, and each tier must have a gate that blocks the next tier if the guardrail metrics degrade.

**The CI/CD pipeline itself is code, and it must be reviewed, tested, and versioned.** A pipeline configuration that is edited directly in the CI/CD UI without version control is a pipeline that cannot be reproduced, cannot be rolled back, and cannot be audited. The pipeline configuration must live in the repository alongside the application code, and changes to the pipeline must go through the same review process as changes to the application.

## Key info

- **CI pipeline stages (ordered)**: (1) Install (uv sync/npm ci, must use lockfile, fail if lockfile is stale), (2) Lint (ruff/eslint, must pass, 0 warnings enforced), (3) Type-check (pyright/vue-tsc, must pass, no `as any` workarounds), (4) Test (pytest/vitest, must pass, coverage threshold enforced), (5) Supply-chain audit (pip-audit/npm audit, high severity = block), (6) Build (production build, must succeed, artifact archived), (7) Evaluation set (for AI features, regression >5% = block). Each stage is a gate: failure at any stage blocks the pipeline. The ordering is intentional: faster stages run first (lint < type-check < test < build), so developers get fast feedback on the cheapest issues.
- **Pipeline time budget**: total pipeline time should be <10 minutes for the common case. Breakdown: Install (1-2 min), Lint (30s), Type-check (1-2 min), Test (3-5 min), Supply-chain audit (30s), Build (2-3 min). If the pipeline exceeds 10 minutes, the first optimization targets are: parallelization (run lint + type-check in parallel), caching (cache node_modules/.venv, test cache), and incremental builds (only rebuild changed modules). The 10-minute target is based on the developer attention span: after 10 minutes, the developer has switched context and the pipeline result is a interruption, not a feedback loop.
- **Canary deployment tiers**: 1% (1 hour, error rate + latency guardrails), 10% (4 hours, same guardrails + user feedback), 50% (24 hours, all guardrails + business metrics), 100% (after 50% passes for 24 hours). The guardrail metrics: error rate (p99 < 2x baseline, blocking), latency (p99 < 2x baseline, blocking), CPU/memory (within 20% of baseline, warning). If any guardrail is breached at any tier, the canary is automatically rolled back. The `1%` tier is the most important: it catches catastrophic failures with minimal blast radius.
- **Rollback speed requirement**: rollback must complete in <5 minutes from the decision to roll back. This requires: (1) the previous deployment artifact is preserved (not deleted after successful deploy), (2) the rollback command is a single action (one button, one CLI command, not a multi-step process), (3) the rollback is tested quarterly (rollback drill). The most common rollback failure: the previous artifact was deleted to save storage, and the rollback requires a full rebuild, which takes 30+ minutes.
- **Yi-family CI/CD state**: YiAi (no CI pipeline, no pytest, no lint -- manual deployment), YiVad (husky pre-commit hooks for lint, `vue-tsc --noEmit` for type-check, `pnpm build:*` for build -- semi-automated), YiPet (Biome pre-commit hooks, `npm run typecheck`, `npm run build` -- semi-automated). The gap: no project has a CI server (GitHub Actions, GitLab CI) that runs the full pipeline on every PR. Adding this is the highest-ROI infrastructure investment for the Yi family.

## Scenario description

New project setup / CI/CD missing / release process chaos / rollback difficult / release incidents frequent; engineers + architects need to build CI/CD pipelines + automated release + canary + rollback + gradual rollout. This entry aggregates release process, testing infrastructure, supply-chain hardening, monitoring, eval set gate into a 2-hop path, avoiding "manual release / no rollback / no gate / frequent incidents".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [release-process.md](../../oncall-sre/release/release.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [data-migration-process.md](../infrastructure/data-migration.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [dependency-upgrade-process.md](../engineering/dependency-upgrade.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `lessons/wins/` | [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yiai-llm-phase-three-win.md](../lessons/win-yiai-llm-phase-three.md) — gradual rollout reference · [yivad-vitest-phase-four-win.md](../lessons/win-yivad-vitest-phase-four.md) — CI contract test |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) — release incident reference |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) |
| `projects/` | Each project `adr-{pytest,vitest,biome,chrome-manifest}-*` — CI toolchain ADR |
| `journeys/` | [../processes/ship-a-release.md](ship-a-release.md) · [./set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) · [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) · [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |

## Action recommendations

1. **CI gate triad**: lint ([Biome ADR](../../tech-lead/decisions/yipet/biome-lint-format.md)) + test ([pytest ADR](../../tech-lead/decisions/yiai/pytest-introduction.md) / [Vitest ADR](../../tech-lead/decisions/yivad/vitest-introduction.md)) + supply-chain hardening ([supply-chain-hardening-pattern](../process/harden-supply-chain.md) four-piece set).
2. **CD gate eval set**: run [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) rollback threshold 5%/3%; rollback > 5% blocks.
3. **Canary 4 tiers**: 1% → 10% → 50% → 100%; observe each tier 1 day + monitoring triad (error rate / latency / feedback).
4. **Rollback drill**: quarterly run [rollback-drill-process](../../oncall-sre/release/rollback-drill.md); a drill without rollback equals no rollback.
5. **Hotfix process**: follow [hotfix-release-process](../../oncall-sre/release/hotfix-release.md) (bypasses normal release process but still goes through review + test).
6. **Release freeze**: important nodes (holidays / big promotions) follow [release-freeze-process](../../oncall-sre/release/release-freeze.md).
7. **Data-migration gate**: DB changes follow [data-migration-process](../infrastructure/data-migration.md) dual-write + validation + traffic cut.
8. **Monitoring gate**: after release must run [monitoring-governance-process](../process/monitoring-governance.md); alerts must be actionable.
9. **Thinking frameworks**: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) (essence of CI/CD: automation + rollbackable) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) "how to make release a disaster" reverse-reasoned + [second-order-thinking](../../knowledge-curator/templates/thinking/second-order-thinking.md) (automation second-order effect: fewer hands but more machine dependency) + [ockhams-razor](../../knowledge-curator/templates/thinking/ockhams-razor.md) (do not add pipeline complexity unless necessary).
10. **Contract test**: cross-project CI runs contract test matrix ([yivad-vitest-phase-four-win](../lessons/win-yivad-vitest-phase-four.md) parity baseline 20 contract cases bidirectional run).

## Anti-patterns

- **A CI pipeline that only runs linting and unit tests.** A pipeline that does not include supply-chain hardening (lockfile audit, vulnerability scan, min-release-age, lifecycle allowlist) is shipping code with unknown dependencies. A pipeline that does not include build verification is shipping code that may not compile in production. The CI pipeline must cover the full chain from dependency integrity to production readiness.

- **A CD pipeline that deploys directly to 100% of production traffic.** A deployment that goes from CI green to all users in one step is a deployment that has no blast radius control. The CD pipeline must include canary tiers (1% -> 10% -> 50% -> 100%) with observation windows between each tier. Deploying to 100% is the last step of the pipeline, not the first.

- **Allowing manual deployments as a regular practice.** A manual deployment that bypasses the CD pipeline is a deployment that has not been tested, has not been reviewed, and has no rollback plan. Manual deployments should be reserved for emergency hotfixes only, and every manual deployment should trigger a retrospective on why the CD pipeline could not handle the case.

- **Treating the CD pipeline as a one-way door.** A pipeline that cannot roll back is a pipeline that gambles with production. The rollback path must be designed, implemented, tested, and drilled before the first deployment. A pipeline without a rollback plan is a pipeline that is not ready for production.

- **Ignoring flaky tests in CI.** A test that fails 10% of the time teaches developers to ignore CI failures. When a real failure occurs, the team assumes it is another flake and the broken code reaches production. Flaky tests must be fixed or quarantined (run in a separate, non-blocking pipeline) within the same sprint they are identified.

## Related

- Related journey: [../processes/ship-a-release.md](ship-a-release.md) — release process
- Related journey: [./set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) — testing infrastructure
- Related journey: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — supply-chain hardening
- Related journey: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — monitoring gate
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit of CI/CD
