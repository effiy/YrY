---
title: Rust 1.96.0 Brings New Range Types, Assert Macros, and Wasm Linker Changes
tags: [rust, release, range-types, testing, wasm, cargo-security]
category: executive/industry
created: '2026-08-05'
updated: 2026-08-07
source: https://blog.rust-lang.org/2026/05/28/Rust-1.96.0/
source_name: Rust Blog
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [executive, tech-lead]
benefit: "Identify which Rust 1.96.0 changes require immediate action in your codebase and which offer long-term ergonomic improvements."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - executive/industry/announcing-rust-1-97-0-aabdad.md
  - executive/industry/announcing-rust-1-97-1-27c996.md
---

# Rust 1.96.0 Brings New Range Types, Assert Macros, and Wasm Linker Changes

> **As a** tech lead or senior engineer, **I want to** understand the breaking and non-breaking changes in Rust 1.96.0, **so that** I can plan upgrades, adopt new APIs, and avoid regressions.

## Summary

- Rust 1.96.0 introduces `core::range::*` types that implement `Copy` via `IntoIterator` (not `Iterator`), fixing a long-standing ergonomic pain point with legacy range types.
- New `assert_matches!` and `debug_assert_matches!` macros improve test diagnostics by printing the actual value on failure, unlike the existing `assert!(matches!(..))` pattern.
- WebAssembly targets now reject undefined symbols at link time by default, catching build misconfigurations earlier.
- Two Cargo security advisories (CVE-2026-5223 medium, CVE-2026-5222 low) are fixed for users of third-party registries; crates.io users are unaffected.
- The new range types are not yet the default for range syntax (`0..1` still produces legacy types); a future edition will switch this.

## Core viewpoints

### 1. The new Range types are a forward-compatibility signal

The `core::range::Range` types are explicitly designed to eventually replace `core::ops::Range` as the default. Library authors should use `impl RangeBounds` in public APIs to accept both old and new types transparently. If you must use a concrete type, prefer the new `core::range` types. This is a migration that will happen gradually across editions, and code that is generic over `RangeBounds` today will be future-proof.

### 2. Wasm linker change is a breaking change that catches real bugs

The removal of `--allow-undefined` from wasm linker flags means that undefined symbols become linker errors instead of silently being converted to `"env"` imports. This can break builds that accidentally relied on implicit imports. The fix is straightforward (add `RUSTFLAGS=-Clink-arg=--allow-undefined` or use `#[link(wasm_import_module = "env")]`), but the underlying issue is important: the old behavior silently masked build configuration bugs.

### 3. assert_matches! improves testing ergonomics at nearly zero cost

The new `assert_matches!` macro is essentially `assert!(matches!(..))` but prints the actual value on failure. This is a small change with outsized impact on debugging velocity. The fact that it was intentionally excluded from the prelude (to avoid conflicts with third-party crates) is a thoughtful design choice that prioritizes ecosystem stability over convenience.

### 4. The Cargo security advisories are a supply-chain health indicator

CVE-2026-5223 (medium, symlink extraction) and CVE-2026-5222 (low, normalized URL auth) affect only users of third-party registries -- crates.io users are unaffected. However, the existence of these advisories highlights a broader point: as Rust adoption grows in regulated industries, the security posture of the entire package ecosystem comes under scrutiny. Even crates.io-only users should treat these advisories as a signal to audit their own dependency chains and verify that no transitive dependencies pull from third-party registries.

### 5. The range type migration is a long game, not an immediate switch

The new `core::range::*` types are not yet the default for range syntax -- `0..1` still produces legacy types. A future edition will flip this default. This staged approach is characteristic of Rust's edition system: introduce the new types, let the ecosystem adapt, then switch the default in a later edition. Teams should use this window to migrate public APIs to `impl RangeBounds` and audit internal code for range type assumptions.

## Key info

- **New types**: `core::range::Range`, `RangeFrom`, `RangeInclusive`, `RangeToInclusive` (all `Copy` via `IntoIterator`).
- **New macros**: `assert_matches!`, `debug_assert_matches!` (manually import from `core` or `std`).
- **Wasm change**: `--allow-undefined` no longer passed to linker; undefined symbols are now linker errors.
- **Security**: CVE-2026-5223 (medium, symlink extraction) and CVE-2026-5222 (low, normalized URL auth) -- crates.io users are unaffected.
- **Other stabilized APIs**: `From<T> for AssertUnwindSafe<T>`, `From<T> for LazyCell/LazyLock`, `{RangeFrom,Range,RangeFromIter,RangeIter}` in `core::range`.

## Action recommendations

1. **Audit your Wasm builds** immediately after upgrading. If you have projects targeting `wasm32-unknown-unknown` or similar, check for linker errors about undefined symbols. Add `RUSTFLAGS=-Clink-arg=--allow-undefined` only if you intentionally relied on the old behavior.
2. **Adopt `impl RangeBounds` in public APIs** to prepare for the eventual range type migration. Avoid accepting concrete `core::ops::Range` in function signatures.
3. **Enable `assert_matches!` in your test suite** by adding `use std::assert_matches;` where you currently use `assert!(matches!(..))`. The improved failure diagnostics will pay off immediately in debugging sessions.

## Anti-patterns

- **Blindly adding `--allow-undefined` back to Wasm builds.** The linker error was introduced to catch real bugs. Investigate the undefined symbol before re-enabling the old behavior. If the symbol is intentionally provided at runtime, use `#[link(wasm_import_module = "env")]` instead.
- **Using concrete `core::ops::Range` in new library APIs.** This creates a future migration burden. Use `impl RangeBounds` instead.
- **Assuming crates.io is affected by the Cargo CVEs.** The advisories only affect users of third-party registries. If you use crates.io exclusively, no action is needed.
- **Using `assert!(matches!(..))` when `assert_matches!` is available.** The new macro provides strictly better failure diagnostics with no downside. The only exception is when you need to support an older Rust version that predates 1.96.0.
- **Assuming the new range types will immediately replace legacy ones.** The edition migration will take years. Code that assumes `core::range::Range` from range syntax today will break when the edition switch happens, as the syntax still produces legacy types.

## Related

- [Rust 1.97.0 Release](./announcing-rust-1-97-0-aabdad.md) -- the next stable release
- [Rust 1.97.1 Point Release](./announcing-rust-1-97-1-27c996.md) -- LLVM miscompilation fix