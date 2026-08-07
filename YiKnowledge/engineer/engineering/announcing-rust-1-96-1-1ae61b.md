---
title: Announcing Rust 1.96.1
tags: [Rust, point-release, Cargo, CVE, security, MIR, libssh2]
category: engineer/engineering
created: '2026-08-05'
updated: 2026-08-07
source: https://blog.rust-lang.org/2026/06/30/Rust-1.96.1/
source_name: Rust Blog
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead]
benefit: "Quick reference for the Rust 1.96.1 point release fixes: Cargo HTTP retries/timeouts, a MIR miscompilation, and three libssh2 CVEs."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - engineer/engineering/security-advisory-for-cargo-cve-2026-5223-939481
  - engineer/engineering/security-advisory-for-cargo-cve-2026-5222-fa39eb
---

# Announcing Rust 1.96.1

> **As a** Rust developer, **I want to** know what the 1.96.1 point release fixes, **so that** I can determine whether to upgrade from 1.96.0.

## Summary

- Rust 1.96.1 is a point release published June 30, 2026. It fixes two issues in stable Rust and three CVEs in libssh2 (which is compiled into Cargo).
- Missing retries/timeouts in Cargo's HTTP client (could cause spurious failures on network issues).
- A miscompilation in a MIR (Mid-level Intermediate Representation) optimization.
- Three libssh2 CVEs: CVE-2025-15661, CVE-2026-55199, CVE-2026-55200.
- Upgrade via `rustup update stable`.

## Core viewpoints

### 1. Point releases addressing CVEs should be adopted immediately

The libssh2 CVEs are compiled into Cargo and affect all Rust users who download crates over SSH. The fix is a simple `rustup update stable` with no breaking changes.

### 2. The MIR miscompilation is the most concerning fix

MIR optimization bugs can produce incorrect binaries that pass all tests but behave incorrectly at runtime. This class of bug is rare but high-impact. Teams should upgrade promptly.

### 3. The Cargo HTTP retry fix addresses a reliability issue

Missing retries/timeouts in Cargo's HTTP client could cause spurious build failures on flaky networks. This is a quality-of-life improvement that reduces CI flakiness.

### 4. Point releases that fix miscompilations should trigger a full rebuild and retest

A MIR optimization bug can produce binaries that pass all existing tests but behave incorrectly in production. The only safe response is to rebuild everything and rerun the full test suite, not just the smoke tests. Teams that treat point releases as "just a patch" and skip retesting are gambling that the miscompilation did not affect their specific code paths.

### 5. The libssh2 CVEs are a reminder that your toolchain is part of your supply chain

Most teams audit their direct dependencies but overlook the native libraries compiled into their build tools. Cargo includes libssh2, which means every Rust developer who uses SSH-based git dependencies inherited three CVEs. Toolchain security is supply chain security -- the compiler and its bundled libraries are dependencies just like any crate.

## Key info

- Release date: June 30, 2026
- Fixes: Cargo HTTP retries/timeouts, MIR miscompilation, 3 libssh2 CVEs
- Upgrade: `rustup update stable`
- No breaking changes from 1.96.0

## Action recommendations

1. **Run `rustup update stable` to upgrade to 1.96.1 immediately.** The libssh2 CVEs are compiled into Cargo and affect all Rust users who download crates over SSH. The fix has no breaking changes from 1.96.0. The cost of upgrading is a single command; the cost of not upgrading is three known CVEs in your build toolchain.

2. **Rebuild and rerun the full test suite after upgrading, not just smoke tests.** The MIR miscompilation fix addresses a bug that can produce incorrect binaries that pass all tests. You cannot reliably determine whether your binary was affected by inspection. The only safe assumption is that you were affected and must rebuild everything.

3. **Add toolchain CVEs to your dependency audit pipeline alongside crate-level CVEs.** Most teams audit their direct dependencies but overlook the native libraries compiled into their build tools. Cargo includes libssh2, which means every Rust developer who uses SSH-based git dependencies inherited three CVEs. Toolchain security is supply chain security.

4. **Treat point releases that fix miscompilations with the same urgency as point releases that fix CVEs.** A MIR optimization bug can produce incorrect binaries that corrupt data or produce wrong results in production. The absence of a CVE identifier does not mean the fix is optional. Miscompilation fixes should trigger the same immediate-upgrade response as security fixes.

5. **Automate point-release adoption in CI pipelines so that toolchain updates are not gated on manual intervention.** If your CI pins an exact version (`rustc 1.96.0`) rather than a minor series (`rustc 1.96`), you will miss point releases like 1.96.1. Use minor-version ranges or automated update mechanisms to ensure point releases are pulled in without manual approval.

## Anti-patterns

- **Do not skip point releases that fix CVEs. The libssh2 vulnerabilities affect all Cargo users.**

- **Do not assume MIR optimization bugs are harmless. They can produce incorrect binaries.**

- **Treating toolchain updates as optional maintenance.** The libssh2 CVEs affect Cargo itself, not just user code. Delaying a toolchain update because "our code hasn't changed" misses the point: the vulnerability is in the tool that builds and fetches your code. Toolchain updates that fix CVEs are as critical as dependency updates that fix CVEs.

- **Assuming that a miscompilation fix only matters if you hit the bug.** MIR optimization bugs are non-deterministic in practice -- they may affect one compilation but not another of the same code, depending on inlining decisions, optimization levels, and target platform. You cannot reliably determine whether your binary was affected by inspection. The only safe assumption is that you were affected and must rebuild.

- **Deferring point releases because "no breaking changes" is not the same as "no risk".** The absence of breaking changes means the upgrade is safe to apply, not that it is safe to skip. The cost of upgrading is low (a single `rustup update` command), while the cost of not upgrading is potentially incorrect binaries or compromised SSH connections. The asymmetry of risk versus effort makes deferral irrational.

## Related

- engineer/engineering/security-advisory-for-cargo-cve-2026-5223-939481
- engineer/engineering/security-advisory-for-cargo-cve-2026-5222-fa39eb