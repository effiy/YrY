---
title: Supply chain hardening pattern
aliases: [supply-chain-hardening-pattern, lockfile-audit-allowlist, dependency-hardening, as-an-engineer-i-want-to-harden-supply-chain]
tags: [pattern, engineering patterns, supply chain, lockfile, audit, min-release-age, allowlist, user-story]
category: engineer/quality-security
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
benefit: "lockfile + audit + min-release-age + allowlist four-piece guard; dependencies without lockfile / arbitrary versions / no audit cannot reach production"
acceptance_criteria:
  - "CI uses uv sync --frozen / npm ci to install strictly per lockfile"
  - "CI runs pip-audit / npm audit --audit-level=high as a blocker"
  - "CI enforces min-release-age ≥ 7 days to prevent front-running"
  - "CI enforces lifecycle allowlist (pre-release / deprecated / unmaintained rejected)"
  - "Any check failure = block merge"
related:
  - ../lessons/gotcha-no-lockfile-supply-chain-risk.md
  - ../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md
  - ../engineering/pi-agent-harness-evolution.md
  - ../../knowledge-curator/governance/user-story-migration-plan.md
---

# Supply chain hardening pattern

> **As an** engineer, **I want to** land lockfile + audit + min-release-age + lifecycle allowlist four-piece guard for all projects, **so that** dependencies without lockfile / arbitrary versions / no audit cannot reach production, and the supply chain poisoning surface is reduced. 

> lockfile + audit + min-release-age + lifecycle allowlist four-piece guard; do not let dependencies with "no lockfile / arbitrary versions / no audit" into production. 

## Summary

- **Pattern**: lockfile locks the whole tree (including transitive) + `audit` for vulnerability scanning + `min-release-age` N days to prevent front-running + `lifecycle allowlist` (pre-release / deprecated / unmaintained rejected) + CI blocking
- **Cross-project applicability**: YiAi (Python uv lockfile + pip-audit) + YiVad / YiPet (npm lockfile + npm audit) + shared client (vendored per project)
- **Landing**: [no-lockfile supply chain risk gotcha](../lessons/gotcha-no-lockfile-supply-chain-risk.md) + YiAi multi-provider ADR §supply chain hardening
- **Alternative**: manual pin versions + cadence audit (not applicable, see §Not applicable for reasons)

## Core viewpoints

**Supply-chain hardening is not a security feature; it is the minimum viable posture for any dependency.** A project without a lockfile, without audit, and without a lifecycle allowlist is accepting unknown code from unknown authors at unknown versions into its production environment. This is not a "security gap" to be addressed later; it is the absence of any security posture at all. The hardening four-piece set (lockfile + audit + min-release-age + allowlist) must be in place before the first dependency is introduced.

**The lockfile is the only thing standing between reproducibility and chaos.** A `requirements.txt` or `package.json` that pins only the top-level dependency leaves every transitive dependency floating. Two developers running `pip install` on the same commit can get different dependency trees, which means different behavior, different bugs, and different security vulnerabilities. The lockfile is the audit trail of every byte that runs in production, and it must be checked into version control.

**The min-release-age rule defeats the most common supply-chain attack vector.** A malicious actor who compromises a maintainer account and publishes a backdoored version relies on the fact that CI pipelines will install it immediately. A 7-day minimum release age means that by the time the backdoored version is eligible for installation, the compromise has likely been detected and the version has been revoked. This is a cheap, high-impact defense that costs nothing to implement.

**Audit without blocking is security theater.** Running `npm audit` or `pip-audit` and printing warnings to the console while allowing the build to proceed is the same as not running audit at all. The CI pipeline must block on audit failures at the `high` severity level or above. If a legitimate CVE cannot be fixed immediately, it must be explicitly suppressed with a documented reason and a tracked remediation plan.

**The monorepo shared client is a single point of supply-chain failure.** A vulnerability in a shared dependency that is used by all projects in the monorepo compromises every project simultaneously. Each project must vendor its own dependencies independently, so that a compromise in one project's dependency tree does not cascade to the others. The shared client is a convenience that becomes a liability at scale.

## Key info

- **Lockfile formats**: Python `uv.lock` (universal, cross-platform, `uv sync --frozen` reads from lockfile), `requirements.txt` with `==` pins (top-level only, transitive dependencies float), `Pipfile.lock` (pipenv, full tree, slower resolution). npm `package-lock.json` (v2+, `npm ci` reads from lockfile, `npm install` may modify it), `yarn.lock` (deterministic but less strict). The key difference: `uv.lock` and `package-lock.json` lock the entire transitive tree; `requirements.txt` does not. A project with only `requirements.txt` has no supply-chain reproducibility.
- **`npm audit` false positive rate**: typically 30-40% of `high` severity findings are false positives for browser extensions (the vulnerability is in Node.js server-side code that never executes in a browser context). The `--audit-level=high` flag alone is insufficient; the CI must also allow `--audit-level=critical` to block while `high` can be suppressed with a documented reason. The YiPet extension has 80+ vendored dependencies; without audit suppression for browser-only CVEs, the build would never pass.
- **Min-release-age implementation**: CI checks each dependency version's publish date against the current date. If the version is younger than 7 days, CI fails with "dependency X@Y was published N days ago, min-release-age is 7 days." The exception: explicit pinning with a comment linking to the security review (e.g., `# SEC-2026-08-07: reviewed by @alice, urgency=critical CVE patch`). The 7-day window is a balance: shorter (3 days) = less protection; longer (30 days) = blocked from critical security patches.
- **Lifecycle allowlist rules**: (1) reject pre-release versions (`alpha`, `beta`, `rc`, `dev`, `nightly`), (2) reject deprecated packages (npm `deprecated` flag, PyPI `Development Status :: 7 - Inactive`), (3) reject unmaintained packages (no commits in 12 months + no response to security issues). The allowlist is enforced by CI: a regex or metadata check on `package.json`/`pyproject.toml` that fails the build for any violation. The rules are configured per-project because some legacy projects may need exceptions for deprecated-but-stable dependencies.
- **Yi-family supply chain incident**: the missing lockfile gotcha (2026-07) was discovered when a fresh `npm install` on YiPet produced a different dependency tree than the one in production, breaking the CDN catalog. The root cause: `package.json` pinned top-level dependencies but transitive dependencies floated. The fix: `package-lock.json` was committed (previously gitignored) and CI was configured to run `npm ci` instead of `npm install`. This is now a pre-commit check across all Yi-family projects.

## Problem

Pain points of not using this pattern (quantified):

- **No lockfile**: `requirements.txt` / `package.json` only pins the top level = transitive version drift = same commit installs different trees on different machines = non-reproducible
- **Large attack surface**: any maintainer on npm / PyPI can publish any version = typosquatting / account hijack = poisoning
- **Front-running poisoning**: new versions installed upon publish = vulnerability window undiscovered = 0day risk
- **pre-release into production**: `1.0.0-rc.1` treated as `1.0.0` = unstable behavior
- **deprecated / unmaintained**: package abandoned then repo hijacked = poisoning vector

## Pattern

### 1. lockfile locks the whole tree

```bash
# Python (YiAi) 
uv lock                    # generates uv.lock (includes transitive hashes)
uv sync --frozen           # CI / deploy strictly per lockfile

# Node (YiVad / YiPet) 
npm install --package-lock-only   # generates package-lock.json
npm ci                            # CI strictly per lockfile
```

### 2. audit vulnerability scanning

```bash
# Python
pip-audit -r uv.lock --strict --ignore-vuln GHSA-xxx   # CI runs, blocks on CVE discovery

# Node
npm audit --audit-level=high                          # CI runs, blocks high/critical
```

### 3. min-release-age to prevent front-running

```bash
# Python
uv pip install --min-release-age 7d <pkg>   # versions published < 7 days are rejected

# Node (use lockfile-lint or a custom script)
npx lockfile-lint --path package-lock.json --allowed-host-schemas npm: --min-release-age 7d
```

Versions published < 7 days = vulnerabilities not yet exposed = rejected. 

### 4. lifecycle allowlist

```json
// .lockfile-lintrc.json
{
  "lifecycle": {
    "allowPrerelease": false,
    "allowDeprecated": false,
    "allowUnmaintained": false,
    "unmaintainedList": ["left-pad", "colors"]
  }
}
```

- `1.0.0-rc.1` / `0.0.0-experimental` → pre-release rejected
- `npm deprecate` marked → deprecated rejected
- repo archived / maintainer unreachable → unmaintained rejected

### 5. CI integration

```yaml
# .github/workflows/supply-chain.yml
jobs:
  hardening:
    steps:
      - run: uv sync --frozen
      - run: pip-audit --strict
      - run: uv pip install --dry-run --min-release-age 7d -r uv.lock
      - run: node scripts/check-lifecycle-allowlist.mjs
      - run: npm audit --audit-level=high
```

Any failure = block merge. 

## Applicable / Not applicable

### Applicable

- Backend services (Python / Node / Go / Rust)
- Frontend apps (npm / yarn / pnpm)
- Browser extensions (high supply chain poisoning risk)
- Shared client / SDK (vendored per project)
- Long-term maintained projects (cadence dependency upgrades)

### Not applicable

- One-off scripts (short-term, can skip)
- Internal mirror fully proxied (mirror already audited, can relax)
- Single-file deploy (no dependency tree)
- Experiment / prototype (speed first)

## Landing checklist

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Create lockfile (`uv.lock` / `package-lock.json`) + commit | Backend / Frontend | One-time |
| 2 | CI: `sync --frozen` / `npm ci` strict per lockfile | CI | One-time |
| 3 | CI: `pip-audit` / `npm audit` vulnerability scan + block | CI | One-time |
| 4 | CI: `min-release-age` 7 days prevent front-running | CI | One-time |
| 5 | CI: lifecycle allowlist (pre-release / deprecated / unmaintained rejected) | CI | One-time |
| 6 | Cadence upgrades: dependabot / renovate bot weekly PR | Backend / Frontend | One-time |
| 7 | Monitoring: new CVE alerts + auto open issue | Monitoring | One-time |

## Action recommendations

1. **Add `npm audit --audit-level=high` (or `pip-audit --strict`) as a blocking CI step for every project that does not yet have it, starting with YiVad and YiPet.** Audit without blocking is security theater. The CI pipeline must block on audit failures at the `high` severity level or above. If a legitimate CVE cannot be fixed immediately, it must be explicitly suppressed with a documented reason, a tracked remediation plan, and a deadline for resolution.

2. **Implement the `min-release-age` 7-day rule in CI for all three projects within the next sprint.** A 7-day minimum release age is the cheapest, highest-impact defense against supply-chain front-running attacks. A malicious actor who compromises a maintainer account and publishes a backdoored version relies on CI pipelines installing it immediately. By the time the 7-day window expires, the compromise has likely been detected and the version revoked.

3. **Create a lifecycle allowlist configuration file (`.lockfile-lintrc.json` for Node projects, a custom script for Python projects) that rejects pre-release, deprecated, and unmaintained packages.** The configuration should be checked in CI on every PR. Any package that is deprecated or unmaintained must be replaced with an actively maintained alternative before the PR can merge. Pre-release versions (`1.0.0-rc.1`, `0.0.0-experimental`) must never reach production.

4. **Set up Dependabot or Renovate with weekly automated PRs for dependency upgrades in all three projects.** Dependencies that are not upgraded accumulate CVEs over time. A weekly cadence ensures that no dependency goes more than 7 days without a security review. The automated PRs should be configured to group patch and minor updates together, and major updates should be reviewed separately.

5. **Verify that all three projects use `uv sync --frozen` (Python) or `npm ci` (Node) in CI and production deployments, not `pip install` or `npm install`.** A `requirements.txt` or `package.json` that pins only the top-level dependency leaves every transitive dependency floating. Two deployments of the same commit can get different dependency trees, which means different behavior, different bugs, and different security vulnerabilities. The frozen install is the only audit trail of every byte that runs in production.

## Anti-patterns

- **No lockfile**: only pin top level = transitive drift = non-reproducible; must lockfile whole tree. 
- **`pip install` / `npm install` in production**: installs a non-fixed tree = drift; must `uv sync --frozen` / `npm ci`. 
- **audit does not block**: CVE discovery only warns = same as not running; must CI block. 
- **min-release-age=0**: install new versions immediately = 0day front-running; must ≥ 7 days. 
- **pre-release into production**: `1.0.0-rc.1` unstable behavior; must allowlist reject. 
- **deprecated package still used**: repo hijacked = poisoning vector; must allowlist reject + find alternative. 
- **monorepo shared client**: single point of poisoning takes down the whole family; must vendor per project (see [shared-client-design](../engineering/shared-client-design.md)). 
- **Skip dependabot / renovate**: dependencies not upgraded = CVE accumulation; must cadence upgrades. 

## Related

- Landing: [no-lockfile supply chain risk gotcha](../lessons/gotcha-no-lockfile-supply-chain-risk.md) — YiAi no-lockfile attack surface
- Landing: [YiAi multi-provider ADR §supply chain hardening](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md)
- Reference: [Pi Agent Harness evolution](../engineering/pi-agent-harness-evolution.md) — npm hardening checklist
- Reference: [Shared client design](../engineering/shared-client-design.md) — vendor per project
- Design basis: [user-story migration plan](../../knowledge-curator/governance/user-story-migration-plan.md) — this file naming + multi-role annotation
