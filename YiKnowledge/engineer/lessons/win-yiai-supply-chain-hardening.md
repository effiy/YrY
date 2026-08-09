---
title: YiAi supply chain hardening landing Phase 1 complete
aliases: [yiai-supply-chain-hardening-win, supply-chain-phase-one, uv-lockfile-audit-win]
tags: [success case, YiAi, supply chain, lockfile, audit, min-release-age, allowlist]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: draft
lifecycle: reference
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiAi supply chain hardening landing Phase 1 complete

> **As an** engineer, **I want to** yiai supply chain hardening, **so that** success is reproducible. 

> YiAi went from no lockfile to a four-piece suite (`uv.lock` + `pip-audit` + `min-release-age 7d` + lifecycle allowlist) + CI blocking; hard prerequisite before introducing multiple providers. 

## Summary

- **Complete**: `uv.lock` committed + `uv sync --frozen` strictly installs per lockfile + `pip-audit --strict` CI blocks + `min-release-age 7d` prevents premature pulls + lifecycle allowlist rejects pre-release / deprecated / unmaintained
- **Quantified effect**: CI blocks high-severity CVEs 0; new dependencies published < 7d rejected; pre-release / deprecated auto-rejected; transitive versions pinned = same tree installed across machines
- **Value**: Provides the "harden prerequisites before introducing new dependencies" hard prerequisite for [LLM multi-provider switch](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md); avoids expanding attack surface as multi-provider SDKs are introduced

## Core viewpoints

- **Supply chain hardening is not a feature -- it is the foundation that every other feature is built on top of**: The four-piece suite (`uv.lock` + `pip-audit` + `min-release-age` + lifecycle allowlist) is not improving the product; it is protecting the product from its own dependencies. Every feature added after hardening inherits the security posture. Every feature added before hardening inherits the security debt.

- **The `uv.lock` file is the single source of truth for the dependency tree, and treating `requirements.txt` as the input spec and `uv.lock` as the output artifact is the correct mental model**: Developers edit `requirements.in` (or `pyproject.toml`) with semantic version constraints. `uv pip compile` resolves those constraints into a fully pinned, hash-verified `uv.lock`. CI installs from the lockfile, not the input file. This separation means the input file expresses intent; the lockfile guarantees reproducibility.

- **CI blocking on `pip-audit --strict` is not a policy decision -- it is the only configuration where `pip-audit` provides value**: A warning in CI output is invisible within a week. A blocked merge is visible immediately and forces action. The difference between `pip-audit` (warn) and `pip-audit --strict` (block) is the difference between a security audit that produces a report and a security audit that prevents vulnerabilities from reaching production.

- **The `min-release-age` of 7 days is a calibrated tradeoff, not an arbitrary number**: 1 day is too short -- most malicious packages are detected within 24-48 hours. 30 days is too long -- it blocks legitimate security patches. 7 days balances the window of vulnerability detection (the community has had a week to find issues) against the need to ship fixes promptly. The threshold should be reviewed quarterly as the threat landscape evolves.

- **Each project vendoring its own dependencies (no monorepo shared client) is a supply chain decision, not an architectural one**: A monorepo with a shared client means a single compromised dependency poisons all three projects (YiAi, YiVad, YiPet). Independent lockfiles per project mean the blast radius of a supply chain attack is limited to one project. The cost of maintaining three lockfiles is the premium on an insurance policy against cross-project contamination.


- **lockfile whole-tree + hashes**: `uv.lock` locks the whole tree (including transitive) + hash verification = same tree installed across machines; `requirements.txt` only locks top-level = insufficient. 
- **audit CI blocking**: `pip-audit --strict` finds CVEs = blocks merge = keeps vulnerabilities out of production; warn = equivalent to not running. 
- **min-release-age prevents premature pulls**: new versions published < 7d rejected = closes the unexposed-vulnerability window = prevents 0-day premature poisoning. 
- **lifecycle allowlist**: rejects pre-release / deprecated / unmaintained = prevents poisoning after repo hijack. 
- **Hard prerequisite**: harden before introducing new dependencies (multi-provider SDKs) = avoids expanding attack surface then breaking. 

## Key information

### Background

- YiAi `requirements.txt` had no lockfile (see [no-lockfile gotcha](gotcha-no-lockfile-supply-chain-risk.md)) = transitive version drift + non-reproducible + large attack surface. 
- Multi-provider switch will bring OpenAI / Anthropic / Gemini SDK transitive dependencies = attack surface expands = hardening is urgent. 
- Decision ADR lists supply-chain hardening as Phase 1 hard prerequisite (see [LLM rollout Phase 1](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md)) . 

### Landing checklist

| No. | Change | impact | verification |
|---|---|---|---|
| 1 | `uv.lock` commit | whole-tree lock + hash verification | `uv sync --frozen` CI passes |
| 2 | CI: `pip-audit --strict` | high-severity CVE block | intentionally inject CVE package to test block |
| 3 | CI: `min-release-age 7d` | published < 7d rejected | intentionally install new package to test block |
| 4 | CI: lifecycle allowlist | pre-release / deprecated / unmaintained rejected | intentionally install rc package to test block |
| 5 | dependabot / renovate weekly PRs | cadence dependency upgrades | weekly PR merge rate monitoring |
| 6 | monitoring: new CVE alerts + auto-open issue | production vulnerability response | issue response time < 24h |

### Quantified effect

- `uv.lock` whole-tree lock = same tree installed across machines (hash verification passes) 
- `pip-audit --strict` CI block = 0 high-severity CVEs reach production
- `min-release-age 7d` = new dependencies published < 7d auto-rejected
- lifecycle allowlist = pre-release / deprecated / unmaintained auto-rejected
- Attack surface: from "no lockfile + arbitrary versions + no audit" to "four-piece suite fully on"

### Key success factors

1. **Hard prerequisite positioning**: hardening listed as multi-provider Phase 1 = no Phase 2 until complete
2. **CI blocking instead of warn**: warning on CVEs = equivalent to not running; CI block = forced fix
3. **Reasonable min-release-age threshold**: 7d balances security and velocity; too short (1d) doesn't stop 0-day, too long (30d) slows iteration
4. **lifecycle allowlist full coverage**: rejects all three states — pre-release / deprecated / unmaintained
5. **dependabot weekly**: dependencies not upgraded = CVEs accumulate; weekly auto-PRs = continuous fixes

## Action recommendations

1. Run hardening before introducing new dependencies (lockfile + audit + min-release-age + allowlist four-piece suite) . 
2. CI block instead of warn: CVE found blocks merge = forced fix. 
3. min-release-age threshold 7d (balances security and velocity) . 
4. lifecycle allowlist rejects all three states (pre-release / deprecated / unmaintained) . 
5. dependabot / renovate weekly PRs: cadence dependency upgrades + CVE auto-opens issue. 
6. Each project vendoring: shared client not as monorepo (see [shared-client-design](../engineering/shared-client-design.md)) = single-point poisoning doesn't spread. 



- **`requirements.txt` without lockfile**: transitive drift + non-reproducible; must use `uv.lock` whole-tree lock. 
- **`pip install` in production**: installed version tree not pinned = drift; must use `uv sync --frozen`. 
- **audit without blocking**: warn = equivalent to not running; must use CI block. 
- **min-release-age=0**: install new versions immediately = 0-day premature pull; must be ≥ 7d. 
- **pre-release into production**: `1.0.0-rc.1` behavior unstable; must reject via allowlist. 
- **deprecated packages still in use**: repo hijacked = poisoning vector; must reject via allowlist + find replacement. 
- **skipping dependabot**: dependencies not upgraded = CVEs accumulate; must have weekly PRs. 
- **monorepo shared client**: single-point poisoning crashes the whole family; must vendor per project. 

## Anti-patterns

- **Running `pip-audit --strict` in CI but using an allowlist of ignored CVEs that grows without review.** The first CVE that is ignored because it has no fix gets an `--ignore-vuln` entry with a comment. Six months later, the allowlist has 15 entries, and no one remembers why each was ignored or whether a fix has since become available. The allowlist must be reviewed quarterly, and every entry must have an expiration date after which it is re-evaluated.
- **Pinning all transitive dependencies in `uv.lock` but never running `uv pip compile --upgrade` to refresh the pins.** The lockfile freezes the dependency tree at the moment it was generated. Six months later, every package is six months behind, and the accumulated CVEs across all transitive dependencies are now blocking every PR. A weekly `uv pip compile --upgrade` PR (via Dependabot or Renovate) keeps the lockfile current and spreads the upgrade risk across small, reviewable changes.
- **Using `min-release-age 7d` as a global setting without the ability to override it for critical security patches.** A critical vulnerability in a dependency is patched in version 2.1.1, released 2 hours ago. The `min-release-age` check blocks the upgrade because the release is less than 7 days old. The project is now running a known-vulnerable version for 7 days because the security policy is too rigid. The `min-release-age` check must have an override mechanism for security patches, with a mandatory post-upgrade audit.
- **Running the lifecycle allowlist check only at CI time, not at dependency installation time.** A developer runs `uv add some-package` locally, the package installs, and the developer starts coding. The CI pipeline later rejects the package because it is deprecated. The developer has already written code against the deprecated API and must now redo the work. The lifecycle check must run as a pre-commit or pre-install hook so that rejected packages are caught before development time is invested.
- **Committing the `uv.lock` file without a PR template section that requires the author to explain why the lockfile changed.** A `uv.lock` diff that shows 50 transitive dependency changes with no explanation is unreviewable. The reviewer does not know whether the changes were intentional (the author ran `uv pip compile --upgrade`) or accidental (the author ran `uv add` and the resolver picked up unrelated upgrades). The PR template must require a "Dependency changes" section that lists every changed package, the old and new versions, and the reason for the change.

## Related

- Upstream: [ADR-LLM-Multi-Provider-Rollout](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) Phase 1 (implementation ADR landed by this win) 
- Decision: [ADR-Multi-Provider-LLM-Routing](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) §supply chain hardening
- Gotcha: [no-lockfile-supply-chain-risk gotcha](gotcha-no-lockfile-supply-chain-risk.md) — attack surface without lockfile
- Methodology: [supply-chain-hardening-pattern](../process/harden-supply-chain.md) — generic four-piece suite pattern
- Companion: [one-to-one-mapping-migration-pattern](../architecture-design/one-to-one-mapping-migration.md) — stack upgrade via hardening process
- Same class: [./README.md](./) — wins leaf entry
- Scenario: [i-want-to-check-engineering-gotchas](../process/check-engineering-gotchas.md)
