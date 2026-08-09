---
title: Set up feature flags
aliases:
- I want to set up feature flags
- feature-flag-journey
- toggle-journey
- feature toggle entry
tags:
- journeys
- feature-flag
- toggle
- canary
- rollback
- dual-world
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: baseline is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../processes/ship-a-release.md
- ../processes/run-an-experiment.md
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../../engineer/engineering/dual-world-boundary.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to set up feature flags

> **As an** engineer, **I want to** set up feature flags, **so that** baseline is reproducible.

> Reach patterns + process + thinking + case study within 2 hops for "flag system + canary + A/B + rollback + dual world + monitoring + governance".

## Summary

- Dual world: go [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md)
- Canary: go [canary-release-process.md](../../oncall-sre/release/canary-release.md) + [release-process.md](../../oncall-sre/release/release.md)
- Rollback: go [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md)
- Experiment: go [i-want-to-run-an-experiment.md](../quality-security/run-an-experiment.md) + [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md)
- Thinking: go [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)

## Core viewpoints

**Feature flags are a lifecycle, not a boolean.** A flag that is created, enabled, and never removed is tech debt. Every flag must have a defined lifecycle: create, canary, full rollout, retire. The retirement date should be set at creation time. A flag that has been at 100% for more than one release cycle is a flag that should have been removed from the code, not left to accumulate.

**The flag system is a critical production dependency, not a convenience tool.** If the flag service is down, the application must degrade gracefully (serve the default variant, not crash). The flag evaluation must be fast (in-memory, sub-millisecond) and the flag configuration must be cached locally with a TTL. A flag system that adds 500ms to every request defeats its own purpose.

**Every flag creates a combinatorial explosion of test cases.** Two flags create 4 possible states. Five flags create 32. Ten flags create 1024. The team cannot test every combination, so the flag count must be aggressively managed. Long-lived flags should be consolidated into a single configuration dimension, and the number of simultaneously active flags should be capped by policy.

**The flag is the cheapest rollback mechanism available.** A code rollback takes minutes (CI, deploy, restart) and carries the risk of database migration conflicts. A flag rollback takes seconds (flip the toggle) and carries no deployment risk. When a feature is behind a flag, the rollback decision is decoupled from the deployment process, which means the rollback can be made by the on-call engineer without a deployment window.

**Flag governance is the only thing preventing flag chaos.** Without a registry that tracks every flag's owner, creation date, rollout status, and retirement date, the flag system becomes a dumping ground of unknown toggles that nobody dares to remove. The governance process (quarterly audit, owner assignment, retirement enforcement) is more important than the flag infrastructure itself.

## Key info

- **Feature flag type taxonomy and lifecycle**: (1) Release flag — guards a new feature during rollout, lifecycle: create → canary (1-7 days) → full rollout (1 day) → retire (within 1 release cycle, max 2 weeks). (2) Experiment flag — A/B test, lifecycle: create → experiment (1-4 weeks, must cover at least one full business cycle) → decision (ship/kill) → retire. (3) Ops flag — emergency kill switch for a feature, lifecycle: create → idle (permanent, no retirement) → activated (during incident) → deactivated (post-incident). (4) Permission flag — user-tier gating (premium vs. free), lifecycle: create → active (long-term, tied to business model) → retire (when tier structure changes). Each type has a different retirement cadence; release flags are the most frequently abandoned and the most important to retire aggressively.
- **Flag evaluation performance requirements**: Flag evaluation must be: (1) In-memory — no remote call on every request, flag configuration is loaded into memory at startup and refreshed via background sync (TTL 30-60 seconds); (2) Sub-millisecond — flag evaluation is in the hot path of every request, a 500ms flag evaluation adds 500ms to every request latency; (3) Graceful degradation — if the flag service is unreachable, serve the default variant (not crash, not throw, not block the request). The flag service is a critical production dependency with the same availability requirements as the database.
- **Combinatorial explosion management**: N flags create 2^N possible states. At 5 flags = 32 states, testing becomes impractical. At 10 flags = 1024 states, testing is impossible. Management strategies: (1) Cap active flags — maximum 10 simultaneously active flags per service; (2) Consolidate long-lived flags — merge related flags into a single configuration dimension (e.g., `experiment_group` enum instead of 5 boolean flags); (3) Flag dependency graph — document which flags interact, test only the interactions that actually occur in production; (4) Stale flag detection — flags at 100% for >30 days are automatically flagged for retirement review.
- **Flag registry minimum fields**: (1) Flag key — unique identifier, naming convention: `<type>_<feature>_<variant>` (e.g., `release_new_search_ui`, `ops_kill_chat_streaming`); (2) Owner — single named person, not "the team"; (3) Created date — starts the lifecycle clock; (4) Type — release/experiment/ops/permission; (5) Rollout status — 0% (off) / 1% / 10% / 50% / 100% (on); (6) Retirement date — set at creation, enforced by quarterly audit; (7) Dependencies — other flags or features this flag depends on or affects. The Yi-family projects currently have no formal flag registry.
- **Flag monitoring requirements**: Each flag must monitor: (1) Exposure rate — actual traffic percentage vs. configured percentage, alert on >10% discrepancy; (2) Error rate — flag-on vs. flag-off error rate comparison, alert on >2x increase; (3) Latency — flag-on vs. flag-off p99 latency, alert on >50% increase; (4) Business metrics — conversion, engagement, retention for the flagged feature vs. baseline. The monitoring must be per-flag, not aggregate; an aggregate "flag system healthy" dashboard hides individual flag problems.
- **Yi-family feature flag state**: YiAi uses feature flags for LLM multi-provider routing (ops flags for provider enable/disable, experiment flags for model A/B comparison). YiVad uses feature flags for gradual feature rollout via the RPC envelope (flag state passed as parameter). YiPet uses Chrome storage-based flags for extension feature gating. All three projects lack a formal flag registry, flag governance process, and per-flag monitoring. The biggest gap: no retirement enforcement, meaning flags accumulate as tech debt.

## Scenario

When setting up a feature flag system / canary new features / A/B testing / emergency rollback / multi-version parallel / personalized experience, platform + TL + engineers need to look up flag patterns + canary process + rollback + monitoring + governance. This entry aggregates feature flag related patterns + process + thinking + case study into a 2-hop path, avoiding "flag abuse / no governance / no monitoring / canary without observation / rollback not understood".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `work/processes/` | [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [release-process.md](../../oncall-sre/release/release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [incident-response-process.md](../process/incident-response.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [data-migration-process.md](../infrastructure/data-migration.md) · [tech-roadmap-review-summary.md](../process/tech-roadmap-review.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) — business metrics after flag launch |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux--ai-product-ux-patterns.md) — flag personalized UX |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `lessons/wins/` | [yiai-llm-phase-{two,three,four,five}-win.md](../lessons) — multi-provider route flag · [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) — staged flag |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) — flag switching incident · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) — flag abuse causing incidents |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — flag debt |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) — flag monitoring · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) — multi-provider flag |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) — flag design / ADR |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — flag canary stakeholders |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) — flag quarterly audit |
| `projects/` | each project `adr-*.md` — flag related ADR; `architecture-summary.md` §flag system |

## Action recommendations

1. **first principles**: first ask "what problem does the flag solve / what if we don't use a flag"; do not use a flag for the sake of a flag; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **inversion**: first imagine "how the flag could blow up (misconfig / cache inconsistency / performance / governance chaos)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **second-order effects**: flag count explosion -> code branch combination explosion -> test matrix explosion; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: the simplest flag that satisfies needs (on/off / percentage / user allowlist / A/B) wins; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **type**: release flag (short-term) / experiment flag (mid-term) / ops flag (long-term) / personalization flag (long-term); set lifecycle cadence by type.
6. **server-side + client-side**: server-side flag takes effect in seconds; client-side flag needs version upgrade or hot reload; see [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md).
7. **cache consistency**: flag must come with TTL + invalidation broadcast + client pull + server fallback; see [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md).
8. **canary**: 1% -> 5% -> 25% -> 100%; at each step observe core metrics + error rate + latency; see [canary-release-process.md](../../oncall-sre/release/canary-release.md).
9. **A/B**: user-level hash split + at least one complete cycle + significance + effect size; see [i-want-to-run-an-experiment.md](../quality-security/run-an-experiment.md).
10. **rollback**: flag second-level rollback beats code rollback; rehearse with [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
11. **monitoring**: each flag must monitor exposure rate + business metrics + error rate + performance; see [monitoring-governance-process.md](../process/monitoring-governance.md).
12. **governance**: flag registry + owner + create / canary / full / retire four stages + quarterly audit; see [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md).
13. **ADR**: long-term flags must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
14. **retire**: release flags must be deleted after launch stabilizes; register tech debt at [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md).
15. **freeze period**: during big promos, do not open new flags / do not switch flags; see [release-freeze-process.md](../../oncall-sre/release/release-freeze.md).

## Anti-patterns

- **Creating a flag for every code change.** Flags are for features that need independent rollout control, not for every pull request. A flag for "refactored the error handling in the login module" adds overhead without benefit. The rule: if the change does not need to be toggled independently of the deploy, it does not need a flag.

- **Leaving a flag at 100% without removing the old code path.** The flag is on, the old code is still in the repository, and both paths are maintained. The old code path is dead code that still gets compiled, tested, and reviewed. The flag retirement must include the removal of the old code path and the simplification of the remaining code.

- **Using a flag to avoid making a decision.** The team cannot decide between two implementations, so they put both behind a flag and plan to decide later. Later never comes, and the flag becomes permanent. The flag is not a substitute for a design decision. If the team cannot decide, the flag should have a hard deadline for the decision, and the flag should be retired on that deadline.

- **Evaluating flags on every request with a remote call.** The flag service is called synchronously on every request, adding latency and creating a dependency on the flag service's availability. Flag evaluation must be local (in-memory, with a background sync), and the flag service must be designed for eventual consistency, not strong consistency.

- **Not monitoring flag exposure rates.** A flag that is supposed to be at 1% canary but is accidentally at 100% due to a configuration error is a full rollout of an untested feature. The flag system must monitor the actual exposure rate against the configured exposure rate and alert on discrepancies.

## Related

- same-class journey: [../processes/ship-a-release.md](ship-a-release.md) — canary release
- same-class journey: [../processes/run-an-experiment.md](../quality-security/run-an-experiment.md) — A/B experiment
- same-class journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — flag emergency rollback
- same-class journey: [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) — flag during upgrade
- upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
