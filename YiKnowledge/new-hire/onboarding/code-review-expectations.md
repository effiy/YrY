---
title: Code Review Expectations
aliases:
- code-review-expectations
- code-review-norms
- review-checklist
- pr-review
tags:
- onboarding
- code-review
- collaboration
- quality
- engineering-practice
category: new-hire/onboarding
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- new-hire
- engineer
benefit: "Code reviews are consistent, constructive, and efficient, with clear expectations for both authors and reviewers"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./first-week-checklist.md
- ./first-month-goals.md
- ../../engineer/process/run-iteration-meetings.md
- ../../engineer/engineering/set-up-testing-infrastructure.md
tacit: false
---

# Code Review Expectations

> **As a** new engineer, **I want to** understand the team's code review norms and expectations, **so that** I can submit reviews that are helpful and receive reviews that are constructive.

> Code review is the team's primary quality practice. It catches bugs, spreads knowledge, and maintains codebase consistency. The norms below apply to everyone — seniority doesn't exempt you from review, and being new doesn't exempt you from reviewing.

## Summary

- Review purpose: Catch bugs, share knowledge, maintain consistency, improve design — in that order
- Author responsibility: Make PRs small (<400 lines), add clear descriptions, self-review first
- Reviewer responsibility: Review within 24 hours, focus on correctness first, be constructive
- New engineer expectation: Start reviewing PRs in week 2, start with observation then participation
- Key principle: Reviews are about the code, not the author. Be hard on the code, soft on the person.

## Core viewpoints

### 1. PR size is the #1 predictor of review quality

PRs under 200 lines get thorough reviews. PRs over 400 lines get superficial reviews. PRs over 1000 lines get rubber-stamped. The author's most important job is breaking work into small, reviewable chunks. If your PR is large, the problem is the decomposition, not the review.

### 2. Review for correctness first, style second

The reviewer's priority order: (1) Does this code do what it claims? (2) Are there edge cases or failure modes not handled? (3) Is the design sound? (4) Is the style consistent? Automated tooling (linter, formatter, type checker) should handle style. Human review should focus on logic, design, and edge cases.

### 3. New engineers should review code from day 1

You don't need deep codebase knowledge to review code. Reading other people's PRs is the fastest way to learn the codebase. Start by observing reviews (read the PR, read the comments, see what gets flagged). By week 2, start leaving comments — even "I don't understand this part, can you explain?" is a valid review comment.

### 4. "LGTM" is not a review

"Looks Good To Me" without any substantive comments is not a review. At minimum, a review should demonstrate that you read the code and thought about it. If you genuinely have no concerns, explain why: "The approach is sound because X. Edge cases are handled by Y. The tests cover Z."

### 5. Review speed matters more than review perfection

A review within 4 hours with 3 good comments is better than a perfect review after 3 days. Speed maintains the author's momentum. If you can't do a full review within 24 hours, leave a quick comment acknowledging the PR and giving an ETA.

## Key info

### Author checklist (before requesting review)

- [ ] PR is under 400 lines (ideally under 200)
- [ ] PR description explains WHAT and WHY (not HOW — the code shows HOW)
- [ ] Self-review completed: you've read every line of your own diff
- [ ] Tests pass locally (and CI is green if applicable)
- [ ] No commented-out code, debug logs, or TODO comments without context
- [ ] Related issues or documents are linked
- [ ] Screenshots included for UI changes

### Reviewer checklist

- [ ] Do I understand what this PR is trying to do?
- [ ] Does the code actually do what the description claims?
- [ ] Are there edge cases or error states not handled?
- [ ] Is the design consistent with existing patterns in the codebase?
- [ ] Are the tests adequate (not just coverage, but meaningful)?
- [ ] Is there any code that could be simplified or clarified?
- [ ] Have I flagged anything that is non-blocking vs. must-fix?

### Review comment conventions

| Prefix | Meaning | Example |
|---|---|---|
| `nit:` | Non-blocking style/preference suggestion | `nit: consider renaming this variable` |
| `suggestion:` | Optional improvement, author's discretion | `suggestion: this loop could be a map()` |
| `question:` | Genuine question, not a request for change | `question: why is this synchronous?` |
| `issue:` | Should be addressed before merge | `issue: this will NPE if user is null` |
| `praise:` | Positive reinforcement | `praise: clean error handling here` |

### Review turnaround expectations

| PR Size | Expected Review Time | Expected Merge Time |
|---|---|---|
| <100 lines (trivial) | 4 hours | Same day |
| 100-400 lines (normal) | 24 hours | 1-2 days |
| 400-800 lines (large) | 48 hours | 2-3 days (should be split) |
| >800 lines (too large) | Ask author to split | N/A |

## Action recommendations

1. **Start reviewing PRs in week 2**: Read every PR that comes in, even if you don't comment. Learn the patterns.
2. **Use the comment conventions**: Prefix your comments with `nit:`, `suggestion:`, `question:`, `issue:`, or `praise:`. This makes intent clear.
3. **Self-review before requesting review**: Read your own diff line by line before assigning reviewers. You'll catch 50% of issues yourself.
4. **Keep PRs small**: If a feature requires more than 400 lines, break it into stacked PRs or behind-a-feature-flag increments.
5. **Respond to all comments**: Even if just "Done" or "Disagree because X." Unresolved comments block merge.

## Anti-patterns

- **Mega-PRs**: 1000+ line PRs that are impossible to review thoroughly. Break them up.
- **Review silence**: PR sits unreviewed for 3+ days. If you're the reviewer and can't get to it, say so.
- **Style-only reviews**: Only commenting on formatting and naming while ignoring logic errors. Automate style; humans review logic.
- **Defensive authors**: Arguing with every review comment. Reviews are suggestions; the author decides. But if multiple reviewers flag the same issue, listen.
- **"LGTM" reviews**: Approving without reading. This is worse than no review — it creates a false sense of security.
- **Reviewing as a gatekeeping exercise**: Using reviews to assert authority or block work. Reviews are collaborative, not adversarial.

## Related

- [First Week Checklist](./first-week-checklist.md) — Day 3: first PR submission
- [First Month Goals](./first-month-goals.md) — 60-day milestone: reviewing 10+ PRs
- [Set Up Testing Infrastructure](../../engineer/engineering/set-up-testing-infrastructure.md) — Tests that reviews should verify
- [Run Iteration Meetings](../../engineer/process/run-iteration-meetings.md) — Where PR review norms are discussed