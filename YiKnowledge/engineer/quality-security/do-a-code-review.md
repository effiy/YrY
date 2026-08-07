---
title: Do a code review
aliases:
- I want to do a code review
- code-review-journey
- PR review entry
- Review entry
tags:
- journeys
- code-review
- pull-request
- review-checklist
- security-review
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
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../strategies/check-engineering-gotchas.md
- ../strategies/harden-supply-chain.md
- ../../ai-engineer/methodology/prompts/README.md
- ../../README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to do a code review

> **As an** engineer, **I want to** do a code review, **so that** outcome is traceable.

> "How to run PR review / code review / security review / review checklist" reaches review checklist + prompts + gotchas + security review + engineering patterns within 2 hops.

## Summary

- Go to [resources/prompts/code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — review prompt + checklist
- Security review goes to [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md)
- Pitfall reference goes to [lessons/gotchas](../lessons) — predecessor pitfalls
- Engineering pattern reference goes to [methodology/engineering-patterns](../architecture-design) — 9 patterns overview

## Core viewpoints

**Code review is a knowledge transfer mechanism, not a gatekeeping ritual.** The primary value of code review is not catching bugs (tests catch bugs) but spreading understanding of the codebase across the team. When only one person understands a module, that module is a bus factor of one. The review conversation should leave the reviewer with enough understanding to maintain the code if the author is unavailable.

**The reviewer's time is the most constrained resource in the review process.** A 2000-line PR that takes 2 hours to review will be skimmed, not reviewed. The author must optimize for reviewer time by keeping PRs small (under 400 lines), providing a clear description of the change and the reasoning, and pointing the reviewer to the critical sections. A PR that is easy to review gets a better review.

**The review checklist is a floor, not a ceiling.** The checklist (correctness, test coverage, readability, security, performance, naming, boundary conditions) ensures that the basics are covered. But the most valuable review feedback addresses design decisions, architectural fit, and maintainability -- questions that are not on the checklist. The checklist catches the obvious; the reviewer's judgment catches the non-obvious.

**Naming is the hardest problem in code review, and the most important.** A poorly named function, variable, or module creates a permanent cognitive tax on every developer who reads the code. The review should be ruthless about naming: names must be self-documenting, consistent with the project's conventions, and specific enough to distinguish the concept from similar concepts. A name that requires a comment to explain is a name that needs to be renamed.

**The review must be a conversation, not a verdict.** A review that says "change X to Y" without explaining why is a missed opportunity for the author to learn and the reviewer to be challenged. The best review feedback is phrased as a question ("what happens if this is called with an empty array?") or a suggestion with reasoning ("consider using a Map here because the lookup is O(1) and the key set is large").

## Key info

- **PR size and review time**: studies from Google and Microsoft show that reviewers can effectively review ~200-400 lines per hour. A 200-line PR gets a thorough review in 30 minutes; a 2000-line PR gets skimmed in the same 30 minutes. The defect detection rate drops from ~70% at 200 lines to ~30% at 2000 lines. The maximum PR size for an effective review is 400 lines; above that, the author should split into multiple PRs. The Yi-family projects currently have no PR size limit enforced.
- **Review checklist taxonomy**: (1) Correctness: does the code do what it claims? edge cases handled? null/empty/error states? (2) Security: injection risks? secrets exposed? auth bypass? (3) Performance: N+1 queries? unnecessary allocations? blocking I/O in async context? (4) Readability: can a new team member understand this in 3 months? (5) Testability: can this be tested? are the tests meaningful? (6) Naming: self-documenting? consistent with conventions? specific enough? (7) Architecture: does this fit the established patterns? introducing new abstractions? breaking module boundaries? Items 6 and 7 are the most valuable and the most frequently skipped.
- **Review turnaround SLA**: the industry standard is <24 hours for the first review pass, <4 hours for each subsequent pass. A PR that sits unreviewed for 3 days creates context-switching cost for the author (they must re-load the mental model of the change) and incentivizes larger PRs (to amortize the wait). The Yi-family projects have no formal review SLA; reviews happen when the reviewer has time.
- **Review feedback severity levels**: (1) Blocking (must fix before merge, e.g., security issue, broken functionality, architectural violation), (2) Strong suggestion (should fix, but reviewer can be convinced otherwise, e.g., naming, performance concern), (3) Nitpick (optional, personal preference, e.g., formatting, variable naming style). The convention is to prefix with `[blocking]`, `[suggestion]`, or `[nit]` so the author can triage. Without severity labels, the author treats all feedback as blocking, which creates unnecessary friction.
- **Code review in the Yi family**: YiAi (no review process, sole developer, changes land directly on master), YiVad (informal review, some PRs reviewed, no enforcement), YiPet (informal review, Biome pre-commit hooks catch formatting issues but not design issues). The gap: no project has a formal review requirement (required reviewer, blocking review, PR size limit). For a single-developer project, code review serves the knowledge-transfer purpose (documenting decisions for the future self) rather than the gatekeeping purpose.

## Scenario description

PR review / code review / security review / quarterly review — when engineers + tech owners + architects need review checklist + pitfall reference + engineering pattern reference + security review. This entry aggregates review prompts, gotchas, engineering-patterns, supply-chain hardening, and security review into a 2-hop path, avoiding "review becoming a formality / pitfalls repeated / security missed".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) — review prompts |
| `lessons/gotchas/` | [README.md](../lessons/README.md) — gotchas overview + common pitfall root cause reference |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) — historical bugs to avoid repeating |
| `methodology/engineering-patterns/` | [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [inline-citation-rag-pattern.md](../engineering/inline-citation-rag.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) — 9 patterns reference |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — review thinking frameworks |
| `work/processes/` | [code-review-process.md](../../ai-engineer/methodology/prompts/code-review.md) · [requirement-review-process.md](../../product-manager/delivery/requirement-review.md) · [design-review-process.md](../../product-manager/delivery/design-review.md) · [tech-review-process.md](../../product-manager/delivery/tech-review.md) |
| `work/tools/` | [claude-code-tips-summary.md](../engineering/claude-code-tips.md) — AI-assisted review |
| `projects/` | each project's `dev-standards-summary.md` — project-level review standards |

## Action recommendations

1. **Run checklist first**: run the [code-review-prompt](../../ai-engineer/methodology/prompts/code-review.md) checklist (function correctness / test coverage / readability / security / performance / naming / boundary).
2. **Pitfall reference**: scan [lessons/gotchas](../lessons) to avoid predecessor pitfalls (SSE guards / macOS FSEvents / no lockfile / React jsxDEV etc.).
3. **Engineering pattern reference**: scan [9 engineering-patterns](../architecture-design) to follow conventions (RPC envelope / SSE streaming / SSOT / inline citation / dual-world / supply chain / 1:1 / eval-driven / staged-port).
4. **Security review**: run the [supply-chain-hardening-pattern](../process/harden-supply-chain.md) four-piece set (lockfile + audit + min-release-age + allowlist) + [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md).
5. **Test coverage**: run the [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) coverage gate + rollback threshold.
6. **Thinking frameworks**: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) (function essence) + [second-order-thinking](../../knowledge-curator/templates/thinking/second-order-thinking.md) (second-order effects of PR merge) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) (how to make a PR bad).
7. **AI-assisted review**: use [claude-code-tips](../engineering/claude-code-tips.md) to accelerate review, but humans must make the final decision.
8. **Project dev-standards reference**: scan each project's `dev-standards-summary.md` to follow project-level conventions (field name hard constraints / lint rules / naming constraints).
9. **Distinguish PR size**: small PRs go through fast review; large PRs split into staged ports (see [staged-port-methodology-pattern](../architecture-design/staged-port-methodology.md)).
10. **Bug reference**: scan [lessons/failures/bugs](../lessons) to avoid repeating history.

## Anti-patterns

- **Approving a PR without reading the code.** "LGTM" on a 500-line change that was merged 30 seconds after submission is a rubber stamp, not a review. The review must demonstrate engagement with the code: comments on specific lines, questions about design decisions, and verification that the tests pass. If the reviewer does not have time to read the code, they should not approve it.

- **Focusing exclusively on style and formatting.** A review that only comments on indentation, variable naming, and semicolon placement is a linting tool, not a code reviewer. Style issues should be enforced by automated tools (Biome, ESLint, Black) so the human reviewer can focus on logic, design, and correctness. If the reviewer is spending time on style, the automation is insufficient.

- **Requesting changes that are out of scope for the PR.** A review that says "while you're here, can you also refactor this unrelated module" expands the PR scope and delays the merge. Out-of-scope suggestions should be filed as follow-up issues or tech debt items, not attached to the current PR. The PR should do one thing and do it well.

- **Merging a PR with unresolved review comments.** Every review comment must be resolved before merge, either by accepting the suggestion and making the change, or by discussing and agreeing to disagree. A comment that is left unresolved and the PR is merged anyway means the review process is optional, and future reviews will be taken less seriously.

- **Reviewing only the diff and not the integration.** A diff that looks correct in isolation may break the system when integrated with the rest of the codebase. The reviewer must check that the change does not violate existing contracts, does not duplicate existing functionality, and does not introduce a new pattern that conflicts with the established patterns in the codebase.

## Related

- Related journey: [../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — pitfall reference
- Related journey: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — security review
- Related journey: [../tools/set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) — testing infrastructure
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit review
