---
title: Harden supply chain
aliases:
- I want to harden supply chain
- supply-chain-journey
- supply-chain hardening entry
tags:
- journeys
- supply-chain
- lockfile
- audit
- min-release-age
- allowlist
- security
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
- tech-lead
benefit: supply chain stays audited
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../tech-lead/architecture/design-architecture-decision.md
- ../processes/roll-out-a-migration.md
- ../../README.md
- ../../engineer/lessons/gotchas/README.md
review_cycle: quarterly
tacit: false
---

# I want to harden supply chain

> **As an** engineer, **I want to** harden supply chain, **so that** supply chain stays audited. 

> "lockfile / audit / min-release-age / allowlist how to configure + how to harden before introducing a new dependency" reach the four-piece pattern + no-lockfile gotcha + implementation win + three-project hardening status within 2 hops. 

## Summary

- Four-piece set follows [supply-chain-hardening-pattern](harden-supply-chain.md): full-tree lockfile + audit CI block + min-release-age 7d + lifecycle allowlist (pre-release / deprecated / unmaintained rejected) 
- Pitfall reference follows [no-lockfile-supply-chain-risk gotcha](../lessons/gotcha-no-lockfile-supply-chain-risk.md): no-lockfile attack surface + transitive drift
- Implementation reference follows [yiai-supply-chain-hardening-win](../lessons/win-yiai-supply-chain-hardening.md): Phase 1 done (uv.lock + pip-audit + 7d + allowlist + dependabot weekly + per-project vendor) 
- Hardening is required before introducing a new dependency ([LLM rollout Phase 1](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md)) 

## Core viewpoints

- **Supply chain hardening is not a security feature — it is an insurance policy** — The four-piece set (lockfile + audit + min-release-age + allowlist) does not prevent attacks; it limits the blast radius. A lockfile prevents transitive dependency drift; an audit CI block catches known CVEs; min-release-age prevents same-day malicious releases; an allowlist rejects pre-release and unmaintained dependencies. Each piece covers a different attack vector; missing one piece leaves a gap.

- **No lockfile is not a convenience — it is an attack surface** — Without a lockfile, every `npm install` or `pip install` resolves dependencies to the latest compatible version. This means a malicious release of a transitive dependency on the same day as your deploy automatically enters your project. A lockfile is the single most impactful security measure a project can adopt, and it costs nothing.

- **min-release-age 7d is not a delay — it is a community vetting period** — The first 7 days after a release are when the community discovers bugs, CVEs, and malicious code. A dependency released today may be compromised, and no one knows yet. Waiting 7 days lets the community vet the release before you adopt it. The cost is a 7-day delay on new features; the benefit is that you never adopt a same-day malicious release.

- **Per-project vendoring is supply chain isolation, not code duplication** — A shared npm package used by all three projects is a single point of supply chain failure. A compromised dependency in the package affects all three projects. Per-project vendoring with independent lockfiles means each project's supply chain is isolated. The cost is maintaining three copies; the benefit is that a supply chain attack on one project does not spread to the others.

- **Supply chain hardening is not a one-time setup — it is a process** — A lockfile that is never updated becomes stale and accumulates CVEs. An audit CI job that runs weekly but is never reviewed becomes a checkmark, not a check. min-release-age that is bypassed "just this once" becomes a precedent. The four-piece set is a process that requires ongoing maintenance, not a setup that runs once and is forgotten.

## Key info

- **Four-piece hardening set — technical implementation**: (1) Full-tree lockfile: `uv.lock` (Python, hash-verified, `uv sync --frozen` in CI), `package-lock.json` (Node.js, integrity hashes, `npm ci` in CI), `yarn.lock` (Yarn, `yarn install --frozen-lockfile` in CI). The lockfile must include transitive dependencies, not just top-level. (2) Audit CI: `pip-audit --strict` (Python, blocks on high/Critical CVEs), `npm audit --audit-level=high` (Node.js, `--audit-level=high` blocks on high+critical), must run on every PR and on a weekly schedule. (3) min-release-age: 7 days — the dependency's latest release must be at least 7 days old before adoption; enforced by a CI script that checks the publish date of the requested version against PyPI/npm registry. (4) Lifecycle allowlist: reject pre-release (alpha/beta/rc tags), deprecated (marked deprecated on registry), unmaintained (no commits in 12+ months). Enforced by CI on every dependency addition.
- **Lockfile types and security properties**: `uv.lock` (Python) — cross-platform, hash-verified, supports `--frozen` for strict resolution; `package-lock.json` (npm) — integrity hashes (sha512), `npm ci` enforces exact versions; `yarn.lock` (Yarn Berry) — zero-install support, `yarn install --immutable` for strict mode; `Cargo.lock` (Rust) — hash-verified, `cargo update --dry-run` for audit. The lockfile must be committed to version control; a `.gitignore`-ed lockfile is no lockfile at all. The Yi-family projects use: YiAi → `uv.lock` (Python uv), YiVad → `package-lock.json` (npm), YiPet → `yarn.lock` (Yarn).
- **Audit tool comparison**: `pip-audit` (Python) — uses PyPA advisory database, `--strict` exits non-zero on any vulnerability, `--fix` auto-upgrades; `safety` (Python, alternative) — uses Safety DB, commercial license required for some features; `npm audit` (Node.js) — built-in, `--audit-level=high` blocks on high+critical, `npm audit fix` auto-remediates; `yarn npm audit` (Yarn) — wraps npm audit; `cargo-audit` (Rust) — uses RustSec advisory database. The audit must run on every PR (blocks merge on high+critical) AND on a weekly cron schedule (catches CVEs in existing dependencies).
- **min-release-age rationale and trade-offs**: 1 day — insufficient, zero-day malicious releases are typically discovered within 24-48 hours; 7 days — the community vetting sweet spot, most bugs and CVEs are reported within the first week; 30 days — maximum safety but significant iteration delay, new features and bug fixes are delayed by a month. The 7-day threshold balances security and speed: it catches the vast majority of malicious releases and critical bugs while allowing the team to adopt legitimate updates within a reasonable timeframe. For emergency security patches (CVE with CVSS ≥9.0), the min-release-age can be bypassed with explicit tech-lead approval and a documented exception.
- **Yi-family supply chain hardening status**: YiAi (Phase 1 complete) — `uv.lock` + `pip-audit --strict` in CI + 7-day min-release-age + lifecycle allowlist + dependabot weekly PRs + per-project vendor. YiVad (partial) — `package-lock.json` committed, `npm audit` runs but does not block merge, no min-release-age enforcement, no lifecycle allowlist. YiPet (partial) — `yarn.lock` committed, no audit CI, no min-release-age, no lifecycle allowlist. The hardening gap: YiVad and YiPet are missing 3 of the 4 pieces. The per-project vendor architecture ensures a supply chain attack on one project does not spread, but only if all projects apply the full four-piece set.
- **Supply chain incident response process**: (1) Discovery — CVE alert or dependabot PR; (2) Assessment — CVSS score, exploitability, impact on Yi-family projects, within 2 hours of discovery; (3) Emergency upgrade — create PR with fixed version, bypass min-release-age if CVSS ≥9.0 with tech-lead approval, merge within 4 hours of assessment; (4) Whole-family scan — check all three projects for the same vulnerable dependency, create upgrade PRs for each; (5) Monitoring alert — add detection rule for the specific CVE pattern, verify no exploitation occurred before the fix. The Yi-family projects have not yet exercised this process end-to-end.

## Scenario description

Before introducing a new dependency / periodic upgrade / supply-chain poisoning incident response, security + primary owner need to harden supply chain. This entry aggregates the four-piece pattern, no-lockfile attack-surface gotcha, YiAi implementation win, and three-project hardening status into 2-hop paths, avoiding "no lockfile + arbitrary versions + no audit = high poisoning risk". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](harden-supply-chain.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) (stack upgrade hardening)  · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) (MV3 boundary + hardening co-build)  |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) (dev/prod pattern)  |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) |
| `projects/YiAi/` | [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) · [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md) · [dev-standards-summary.md](../../engineer/projects/yiai/dev-standards.md) |
| `projects/YiPet/` | [adr-biome-lint-format.md](../../tech-lead/decisions/yipet/biome-lint-format.md) · [adr-chrome-manifest-dual-world-boundary.md](../../tech-lead/decisions/yipet/chrome-manifest-dual-world-boundary.md) · [dev-standards-summary.md](../../engineer/projects/yipet/dev-standards.md) |
| `projects/YiVad/` | [adr-vitest-introduction.md](../../tech-lead/decisions/yivad/vitest-introduction.md) · [dev-standards-summary.md](../../engineer/projects/yivad/dev-standards.md) |
| `work/processes/` | [shared-client-design-summary.md](../engineering/shared-client-design.md) (§no monorepo + per-project vendor)  · [shared-client-vendor-rollout.md](../engineering/shared-client-vendor-rollout.md) (three-project hardening status table)  · [dependency-upgrade-process.md](../engineering/dependency-upgrade.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) |
| `work/tools/` | [pi-agent-harness-evolution-summary.md](../engineering/pi-agent-harness-evolution.md) (npm hardening list reference)  · [vllm-ollama-deployment-summary.md](../engineering/vllm-ollama-deployment.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |

## Action recommendations

1. Before introducing a new dependency, must run the four-piece hardening: lockfile (`uv.lock` / `package-lock.json`) + audit (`pip-audit --strict` / `npm audit --audit-level=high`) + min-release-age 7d + lifecycle allowlist. 
2. Lockfile full-tree + hash verification (not just top-level) ; CI strict `uv sync --frozen` / `npm ci`. 
3. Audit CI block rather than warn; high CVE blocks merge. 
4. min-release-age threshold 7d (balance security and speed; too short like 1d can't stop 0day, too long like 30d slows iteration).
5. lifecycle allowlist three-state rejection: pre-release / deprecated / unmaintained. 
6. dependabot / renovate weekly PR + CVE auto issue. 
7. Per-project vendor independent lockfile (no monorepo) = single-point poisoning does not spread. 
8. Quarterly security audit scans lockfiles whose `last_verified` exceeds half a year + re-runs full-volume audit. 
9. Supply-chain incident response: discover CVE → emergency upgrade PR + whole-family vendor scan + monitoring alert. 

## Anti-patterns

- **No lockfile** — Without a lockfile, every `npm install` or `pip install` resolves dependencies to the latest compatible version. A malicious release of a transitive dependency on the same day as your deploy automatically enters your project. A lockfile is the single most impactful security measure, and it costs nothing.

- **Lockfile without audit CI** — A lockfile without audit is a frozen snapshot of known vulnerabilities. The audit CI job catches CVEs as they are discovered. Without it, the lockfile goes stale and accumulates CVEs silently. The audit CI job must block merge on high-severity CVEs.

- **min-release-age set to 0** — Accepting dependencies on the day of release means the community has not had time to vet the release. A dependency released today may be compromised, and no one knows yet. min-release-age 7d is the community vetting period; bypassing it "just this once" creates a precedent that becomes the norm.

- **Lifecycle allowlist not enforced** — Pre-release, deprecated, and unmaintained dependencies are attack vectors. A pre-release dependency may have unstable APIs; a deprecated dependency has no security patches; an unmaintained dependency has no maintainer. The allowlist must be enforced by CI, not by convention.

- **Per-project hardening applied inconsistently** — If YiAi has lockfile + audit + min-release-age + allowlist but YiVad only has a lockfile, the supply chain is only as strong as the weakest project. Per-project vendoring isolates the blast radius, but only if every project applies the full four-piece set.

## Related

- Related journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — hardening ADR decision
- Related journey: [../processes/roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) — stack upgrade hardening process
- Related journey: [../tools/share-client-across-projects.md](../engineering/share-client-across-projects.md) — per-project vendor
- Related journey: [./check-engineering-gotchas.md](./check-engineering-gotchas.md) — supply-chain pitfall reference
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit cadence
