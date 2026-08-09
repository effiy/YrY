---
title: As an engineer, I want to adopt a new dependency, so that supply chain stays
  audited
aliases:
- I want to introduce a new dependency
- adopt-dependency-journey
- select new dependency entry
- tech selection entry
- i-want-to-adopt-a-new-dependency
tags:
- journeys
- dependency
- adoption
- selection
- supply-chain
- evaluation
- user-story
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: selection assessment + ADR decision + supply-chain hardening front-loaded triad fallback; new dependency is not introduced on intuition, post-introduction incidents avoided, hardening not skipped
acceptance_criteria:
- selection assessment form filled across 6 dimensions (maintenance activity / security history / compatibility / performance / package size / license)
- ADR 12 sections written and archived to tech-lead/decisions/<project>/
- supply-chain hardening four-piece set (lockfile + audit + min-release-age 7d + allowlist) CI passing
- gradual rollout introduces 1% → 10% → 50% → 100% observing each tier 1 day + monitoring triad
related:
- ../strategies/harden-supply-chain.md
- ../../tech-lead/architecture/design-architecture-decision.md
- ../../engineer/quality-security/harden-supply-chain.md
- ../../knowledge-curator/governance/user-story-migration-plan.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# As an engineer, I want to adopt a new dependency, so that supply chain stays audited

> **As an** engineer, **I want to** introduce a new dependency with selection assessment + ADR + supply-chain hardening front-loaded, **so that** new dependencies aren't introduced on intuition, post-introduction incidents avoided, hardening not skipped.

> "How to select + assess + introduce + harden a new dependency" — reach within 2 hops: selection assessment + supply-chain hardening + ADR decision + field name hard constraints.

## Summary

- Selection assessment via [resources/templates/tech-selection-evaluation](../../knowledge-curator/templates) + [first-principles](../../knowledge-curator/templates/thinking--first-principles.md)
- Decision via ADR 12 sections: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) + [resources/templates/adr](../../knowledge-curator/templates)
- Introduction + hardening via [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md)
- Assessment dimensions: maintenance activity / security history / compatibility / performance / package size / license / replacement solution

## Core viewpoints

**Every dependency is a liability you accept today for a problem you will pay for tomorrow.** A dependency that saves 2 days of implementation today will cost weeks of maintenance, upgrade, and security patching over its lifetime. The correct first question is not "does this library solve the problem" but "can we solve the problem without adding a new dependency." Existing tools, standard library functions, or a 50-line internal module often cover the 80% case without the ongoing carrying cost.

**The selection decision is irreversible in practice, not in theory.** Once a dependency is integrated into the codebase, the cost of replacing it grows with every consumer that adopts it. Even if the ADR says "we can swap this out," the organizational inertia of retesting, re-approving, and re-deploying means the replacement rarely happens. Treat the selection as a one-way door and invest accordingly in the upfront assessment.

**Supply-chain hardening must be a prerequisite, not a post-introduction follow-up.** Running lockfile + audit + min-release-age + allowlist after the dependency is already in production is security theater. The hardening pipeline must be green before the first merge. If a dependency cannot pass the hardening gate, it should not be introduced regardless of its functional appeal.

**Maintenance activity is a stronger signal than feature count.** A library with 10 features, weekly commits, and responsive maintainers is a safer bet than a library with 100 features and a 12-month stale repository. Dormant projects accumulate unresolved CVEs, incompatible transitive dependencies, and breaking changes in the ecosystem. Check the commit log and issue response time before checking the feature list.

**Gradual rollout of a new dependency is not optional.** Even if the dependency itself is battle-tested, its interaction with the specific codebase, configuration, and traffic patterns is unknown. A 1% rollout that observes error rates, latency, and memory for 24 hours catches integration-specific regressions that no amount of pre-merge testing can surface.

## Key info

- **Dependency assessment 6-dimension scorecard**: (1) Maintenance activity — last commit date (<1 month = green, 1-6 months = yellow, >6 months = red), issue response time (<1 week = green), contributor count (>3 = green, 1 = yellow); (2) Security history — CVE count in last 12 months, mean time to patch (MTTP) for past CVEs, presence of security policy and responsible disclosure process; (3) Compatibility — supported language/runtime versions, transitive dependency count (<10 = green, 10-50 = yellow, >50 = red), known conflicts with existing dependencies; (4) Performance — bundle size impact (for JS: <10KB gzipped = green, 10-50KB = yellow, >50KB = red), startup time, memory footprint; (5) Package size — total install size including transitive dependencies; (6) License — must be compatible with project license (MIT, Apache 2.0, BSD = green; GPL = red for proprietary projects; unlicensed = red). Each dimension is scored green/yellow/red; a dependency with 2+ reds should be rejected; a dependency with 3+ yellows should be escalated to tech-lead review.
- **ADR 12-section template for dependency decisions**: (1) Title, (2) Status (proposed/accepted/deprecated/superseded), (3) Context (why this dependency is needed), (4) Decision (what we chose), (5) Alternatives considered (with scoring), (6) Consequences (what becomes easier/harder), (7) Risk assessment (what could go wrong), (8) Mitigation (how we handle the risks), (9) Rollout plan (canary tiers, observation windows), (10) Exit plan (how to remove/replace), (11) Supply chain hardening status (lockfile + audit + min-release-age + allowlist), (12) Review date (when to re-evaluate). The ADR is archived to `tech-lead/decisions/<project>/`.
- **Supply chain hardening gate (4 checks)**: The dependency introduction PR must pass all 4 checks before merge: (1) Lockfile — full-tree lockfile updated with exact version and integrity hash; (2) Audit — `pip-audit --strict` or `npm audit --audit-level=high` passes with zero high/critical CVEs; (3) min-release-age — the selected version was published at least 7 days ago; (4) Allowlist — the dependency is not pre-release, deprecated, or unmaintained. If any check fails, the PR is blocked. The Yi-family projects: YiAi enforces all 4, YiVad enforces lockfile + audit, YiPet enforces only lockfile.
- **Dependency replacement cost estimation**: The cost of replacing a dependency = (number of call sites) × (integration complexity factor) + (data migration cost if applicable) + (retesting cost) + (re-deployment cost). A dependency with 1 call site and a simple interface (e.g., a date formatting library) costs ~1 day to replace. A dependency with 50 call sites and deep integration (e.g., a database driver or ORM) costs weeks to months. The replacement cost grows with every consumer, which is why the initial selection is a one-way door. The Yi-family projects have 3 shared dependencies (RPC envelope, SSE parser, error normalization) whose replacement cost is high due to cross-project integration.
- **Dependency audit cadence**: (1) Weekly — automated audit (dependabot/renovate) runs, creates PRs for patch-level updates; (2) Monthly — manual review of audit report, triage medium/low CVEs; (3) Quarterly — full dependency inventory review, check for staleness (last commit >12 months), check for replacement candidates (better alternatives emerged), check for license changes; (4) Annually — major version upgrade planning, dependency elimination review (can any dependency be removed by using standard library or internal implementation). The Yi-family projects: YiAi has dependabot weekly, YiVad and YiPet have no automated dependency auditing.
- **Yi-family dependency landscape**: YiAi (Python) — fastapi, uvicorn, motor (MongoDB async), anthropic, openai, pydantic, httpx, markdown, beautifulsoup4, uv (package manager). YiVad (TypeScript/Vue) — vue, vue-router, pinia, rsbuild, vitest, @vue/test-utils, happy-dom, openapi-typescript, axios, ant-design-vue. YiPet (TypeScript/React) — react, react-dom, antd, zustand, vitest, axios, @anthropic-ai/sdk, openai. Shared by vendor (not monorepo): RPC envelope, SSE parser, YiAiError class — these are ~300 lines each, vendored per-project.

## Scenario description

When new requirements introduce a new dependency / replace an old dependency / compare selections, engineers + architects need to go through selection assessment + ADR decision + supply-chain hardening + field name hard constraints. This entry aggregates selection template, supply-chain hardening, ADR, thinking frameworks into a 2-hop path, avoiding "introducing dependencies on intuition / incidents after introduction / skipping hardening".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `engineer/process/` | [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) — hardening + replacement pattern |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) — selection thinking frameworks |
| `resources/templates/` | [tech-selection-evaluation-template](../../knowledge-curator/templates) · [adr-template.md](../../knowledge-curator/templates/adr.md) — selection assessment + ADR template |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) — no lockfile attack surface |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) — hardening implementation reference · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) — replacement reference |
| `work/processes/` | [shared-client-vendor-rollout.md](../engineering/shared-client-vendor-rollout.md) · [dependency-upgrade-process.md](../engineering/dependency-upgrade.md) · [security-audit-process.md](./../../oncall-sre/incident-response/do-a-security-audit.md) |
| `tech-lead/decisions/` | each project `as-a-tech-lead-i-want-to-*.md` — historical dependency decision reference |
| `journeys/` | [../process/harden-supply-chain.md](../process/harden-supply-chain.md) · [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) · [../infrastructure/roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) |

## Action recommendations

1. **First principles set the skeleton**: first ask "why do we need a new dependency" — can existing tools/libs resolve it? Avoid "dependency gold-plating".
2. **Assessment dimensions**: maintenance activity (recent commit / release frequency) + security history (CVE count + response speed) + compatibility (with existing stack versions) + performance benchmark + package size + license (MIT/Apache vs GPL/AGPL) + replacement solution.
3. **Occam's razor**: do not add dependencies unless necessary; prioritize using existing dependencies with the same function.
4. **Second-order thinking**: before introducing a dependency, ask about second-order effects (package size ↑ / maintenance burden ↑ / supply chain risk ↑ / upgrade difficulty).
5. **Inversion**: use inversion "how to make dependency introduction a disaster" to reverse-derive improvement items.
6. **ADR decision**: follow [ADR 12 sections](../../tech-lead/architecture/design-architecture-decision.md) to record background / decision / alternatives / assessment dimensions / risks / rollback / implementation plan.
7. **Supply-chain hardening front-loaded**: before introduction must do [supply-chain-hardening-pattern](../process/harden-supply-chain.md) four-piece set (lockfile + audit + min-release-age 7d + allowlist rejecting pre-release / deprecated / unmaintained).
8. **Field name hard constraints**: new dependency involving RPC / API must align `filter` / `target_file` / `cname` / `module_name` / `method_name`.
9. **Do not introduce pi-ai**: cross-project shared client does not introduce pi-ai package — follow [shared-client-vendor-rollout](../engineering/shared-client-vendor-rollout.md) for per-project independent vendor.
10. **Gradual rollout introduction**: 1% → 10% → 50% → 100%; observe each tier 1 day + monitoring triad.

## Anti-patterns

- **Introducing a dependency for a single function call.** Importing an entire library to use one utility function (e.g., `left-pad`) adds attack surface, bundle size, and maintenance burden disproportionate to the value gained. A 10-line inline implementation or standard library equivalent is always preferable.

- **Skipping the ADR because "this is obvious."** Every dependency introduction looks obvious at the time of decision. Six months later, when the team needs to understand why a specific version of a specific library was chosen, the absence of a written record forces everyone to reverse-engineer the original reasoning. The ADR is not bureaucracy; it is institutional memory.

- **Evaluating dependencies by star count and download numbers alone.** GitHub stars and npm downloads measure popularity, not quality. A trendy library can have critical security flaws, no maintenance plan, and breaking changes in every minor release. Assessment must include the 6 dimensions of maintenance activity, security history, compatibility, performance, package size, and license.

- **Allowing pre-release or deprecated versions into the dependency tree.** A `1.0.0-rc.1` that ends up in production is indistinguishable from a stable release to the end user, except that its behavior may change without notice. A deprecated package that remains in the tree is a known-unpatched vulnerability waiting to be exploited. The allowlist must reject both categories at CI time.

- **Assuming the dependency will be upgraded later.** "We'll pin an old version now and upgrade later" is the most common path to an unmaintained dependency. The upgrade never happens because it is never prioritized, and the old version accumulates CVEs while the rest of the ecosystem moves on. Every dependency must be introduced at a version that is maintainable today.

## Related

- Related journey: [../process/harden-supply-chain.md](../process/harden-supply-chain.md) — hardening after introduction
- Related journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — ADR decision
- Related journey: [../infrastructure/roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) — replace old dependency
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit of dependencies
- Design basis: [../../knowledge-curator/governance/user-story-migration-plan.md](../../knowledge-curator/governance/user-story-migration-plan.md) — this file's naming + multi-role annotation
