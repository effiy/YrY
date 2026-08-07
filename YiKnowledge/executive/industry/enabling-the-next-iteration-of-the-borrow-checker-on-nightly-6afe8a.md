---
title: Polonius Alpha Borrow Checker Enabled on Nightly Ahead of Stabilization
tags: [rust, borrow-checker, polonius, compiler, type-system, nightly]
category: executive/industry
created: '2026-08-05'
updated: 2026-08-07
source: https://blog.rust-lang.org/2026/08/04/enabling-polonius-alpha-on-nightly/
source_name: Rust Blog
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [executive, tech-lead]
benefit: "Understand the impact of Rust's next-generation borrow checker on your codebase -- which patterns will newly compile, the performance tradeoffs, and how to prepare for stabilization."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - executive/industry/announcing-rust-1-97-0-aabdad.md
  - executive/industry/announcing-rust-1-97-1-27c996.md
---

# Polonius Alpha Borrow Checker Enabled on Nightly Ahead of Stabilization

> **As a** tech lead or Rust team lead, **I want to** understand what Polonius Alpha changes about borrow checking, **so that** I can plan migration, test on nightly, and prepare my team for reduced borrow-checker friction.

## Summary

- Polonius Alpha, the next iteration of the Rust borrow checker, is now enabled by default on nightly with stabilization targeted before the end of 2026.
- The key improvement is **flow-sensitive** borrow checking: the compiler now understands that borrows are not live in all branches of a control flow graph, accepting code that NLL incorrectly rejects.
- The most common pattern unlocked is `get_mut_or_default`-style functions where a `HashMap::get_mut` borrow is live in one branch but not another.
- Performance regression is minimal: among the top 10,000 crates, few show significant regressions. The worst observed case is a 2-3x slowdown, and even that is rare.
- Polonius Alpha is not the "full" Polonius -- some programs that would compile under the original (slow) Polonius formulation still do not compile.
- The implementation is built on the existing NLL architecture with minimal changes, giving it acceptable performance at the cost of accepting fewer programs than the original Polonius formulation.

## Core viewpoints

### 1. Flow sensitivity removes a major source of borrow-checker friction

The `get_mut_or_default` pattern is perennially cited as a frustrating borrow-checker limitation. NLL's flow-insensitive analysis forces workarounds like `get`/`insert` with double lookups, `unsafe` blocks, or the `entry` API. Polonius Alpha eliminates this class of problem entirely for the most common patterns. The practical impact is that engineers spend less time fighting the borrow checker and less time writing workarounds.

### 2. The performance story is acceptable but not perfect

The benchmark data shows that most crates see negligible regression (under 1%). The worst case is a 2-3x slowdown on crates with many borrows. The Rust team's position is that this is "fairly reasonable" given the added power, but it acknowledges that some edge cases may need further optimization. Teams with large, borrow-heavy codebases should test on nightly to assess the impact before stabilization.

### 3. This is a practical compromise, not a theoretical ideal

The original Polonius formulation was more powerful but too slow. Polonius Alpha is a pragmatic subset that solves the most commonly encountered problems with acceptable performance. The Rust team explicitly states they have no plans for further Polonius feature work after stabilization, shifting focus to other high-priority work. This is a shipping decision: solve 80% of the problem now rather than optimizing indefinitely.

### 4. The opt-out mechanism preserves gradual adoption

Polonius Alpha can be disabled with `-Zpolonius=off` via `RUSTFLAGS` or `.cargo/config.toml`. This is critical for teams that encounter performance regressions or unexpected behavior. The opt-out is not a permanent solution -- it is a bridge that allows teams to upgrade the compiler while deferring Polonius-specific issues. The Rust team expects the opt-out to be used primarily for performance reasons, and they are actively seeking real-world data on regressions.

### 5. The 8-year journey from inception to alpha is a lesson in compiler engineering patience

The Polonius effort started in 2018, with a new formulation in 2023, and stabilization was delayed from 2024 to 2026. This timeline reflects the difficulty of rewriting a core compiler subsystem while maintaining backward compatibility and acceptable performance. It is a reminder that fundamental compiler improvements are measured in years, not months, and that the Rust project's conservative approach to stabilization is a feature, not a bug.

## Key info

- **Timeline**: Enabled on nightly now (August 2026); stabilization targeted before end of 2026.
- **Key capability**: Flow-sensitive borrow checking of lifetime outlives relationships.
- **Opt-out**: `-Zpolonius=off` via `RUSTFLAGS` or `.cargo/config.toml`.
- **Performance**: Most crates show <1% regression. Worst case: 2-3x on borrow-heavy crates.
- **Known gaps**: Does not accept all programs that legacy Polonius would. Some programs compile under Polonius Alpha but not legacy Polonius (not a strict subset).
- **Reporting channels**: GitHub issue #160456 or Zulip `#t-types/polonius`.
- **History**: Polonius effort started in 2018; new formulation in 2023; stabilization delayed from 2024 to 2026.

## Action recommendations

1. **Test your codebase on nightly with Polonius Alpha now.** Run `cargo +nightly check` on your projects. If code that previously compiled fails, that is a regression to report. If code that previously didn't compile now works, identify where you can remove workarounds.
2. **Audit for `get_mut_or_default`-style workarounds.** Functions that use `unsafe`, double lookups, or the `entry` API to work around NLL limitations may be simplifiable after Polonius Alpha stabilizes. Document these locations now so the team can clean them up post-stabilization.
3. **Measure compile-time impact on your specific codebase.** While the benchmark data is reassuring, your codebase may have different characteristics. A nightly check with `cargo build --timings` provides concrete data for your upgrade decision.

## Anti-patterns

- **Assuming Polonius Alpha is the "full" Polonius.** Some programs that would compile under the original formulation still won't compile. If you encounter this, report it rather than assuming the feature is broken.
- **Opting out preemptively.** If you use nightly and encounter a performance regression, measure it before disabling Polonius. The team needs real-world data. If you must opt out, report why.
- **Expecting all borrow-checker friction to disappear.** Polonius Alpha solves the flow-insensitivity problem, but other borrow-checker limitations (e.g., no support for self-referential structs) remain unchanged.
- **Rewriting working `unsafe` code before Polonius Alpha stabilizes.** If your codebase uses `unsafe` to work around NLL limitations, wait until Polonius Alpha is on stable before removing those workarounds. Premature cleanup risks introducing bugs if the stabilization timeline slips.
- **Assuming Polonius Alpha will eliminate the need to learn the borrow checker.** Flow sensitivity removes one class of friction, but the ownership and borrowing model remains the same. New Rust developers will still need to understand lifetimes, ownership, and the distinction between shared and mutable references.

## Related

- [Rust 1.97.0 Release](./announcing-rust-1-97-0-aabdad.md) -- current stable release
- [Rust 1.97.1 Point Release](./announcing-rust-1-97-1-27c996.md) -- LLVM miscompilation fix