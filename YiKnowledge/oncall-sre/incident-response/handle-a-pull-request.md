---
title: Handle a pull request
aliases: [i-want-to-handle-a-pull-request, pull-request, pr-workflow, merge-strategy]
tags: [journey, methodology, pull-request, code-review, merge-strategy, git-workflow]
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [oncall-sre, engineer]
benefit: "PRs are reviewed with consistent quality gates, reducing defects and preventing knowledge silos"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../../engineer/quality-security/do-a-code-review.md
  - ../../engineer/infrastructure/set-up-ci-cd.md
  - ../../engineer/infrastructure/set-up-a-branching-strategy.md
  - ../../product-manager/frameworks/write-a-spec-or-prd.md
  - ../../engineer/process/collaborate-across-teams.md
  - ../../engineer/infrastructure/ship-a-release.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--inversion.md
tacit: PR is not just a merge; it is review + CI gate + description + related + splitting large PRs + branch strategy; squash cleanly; rebase cleanly
---

# I want to handle a pull request

> **As a** oncall sre, **I want to** handle a pull request, **so that** incident is contained.

## Summary

- PR five essentials: title + description + related issue + tests + CI gate
- review must pass: at least 1 person + CI all green + eval set not regressed
- split large PRs: > 500 lines must split; do not pile up
- merge strategy: squash / merge / rebase by scenario
- branch strategy: trunk / git flow / github flow; do not mix
- conflict resolution: rebase, do not pile up merge commits
- PR description: what + why + how + test + risk
- no stealthy changes; no CI bypass; no force push to main branch

## Scenario

PR is the gate for code entering the main branch; not just a merge button. this entry provides PR full path, covering the five essentials, review must pass, splitting large PRs, merge strategy, branch strategy, conflict resolution, PR description, no stealthy changes no CI bypass, and links to do-a-code-review / set-up-ci-cd / set-up-a-branching-strategy / write-a-spec-or-prd / collaborate-across-teams / prepare-a-bug-report / ship-a-release and other leaves.

## 2-hop reachability paths

| Hop count | goal | file |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | code review | [../../engineer/quality-security/do-a-code-review.md](../../engineer/quality-security/do-a-code-review.md) |
| 2 hops | CI/CD | [../../engineer/infrastructure/set-up-ci-cd.md](../../engineer/infrastructure/set-up-ci-cd.md) |
| 2 hops | branch strategy | [../../engineer/infrastructure/set-up-a-branching-strategy.md](../../engineer/infrastructure/set-up-a-branching-strategy.md) |
| 2 hops | PRD | [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) |
| 2 hops | cross-team collaboration | [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) |
| 2 hops | bug report | [../../executive/strategy/prepare-a-bug-report.md](../../knowledge-curator/archive/strategies-legacy/executive/prepare-a-bug-report.md) |
| 2 hops | release ship | [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |

## Action recommendations

1. **Five essentials**: concise title + description what/why/how/test/risk + related issue + test coverage + CI all green; no missing piece
2. **review must pass**: at least 1 person + CI all green + eval set not regressed; no bypass
3. **Split large PRs**: > 500 lines must split; staged port split; do not pile up
4. **Merge strategy**: squash compress history / merge preserve branch history / rebase linear; choose by scenario
5. **Branch strategy**: trunk-based main / git flow complex / github flow simple; do not mix
6. **Conflict resolution**: rebase to resolve conflicts, do not pile merge commits; linear history
7. **PR description template**: what + why + how + test + risk + impact surface; not empty
8. **CI gate**: lint + unit tests + integration tests + supply chain + eval set; no bypass
9. **No stealthy changes**: changes after review must push new commits; no force push to hide
10. **No force push to main**: force push only on personal branches; forbidden on main
11. **No CI bypass**: CI failure must be fixed; no --no-verify
12. **related issue**: PR must link issue / RFC / ADR; not isolated
13. **screenshots / logs**: UI changes attach screenshots; backend changes attach logs; not empty
14. **review culture**: strong opinions loosely held; not personal
15. **first principles**: why must PR; worst consequence of not doing PR
16. **inversion thinking**: how much can small PRs + frequent merges solve; if solvable don't pile large PRs
17. **second-order thinking**: second-order consequences after PR (merge conflicts / rollback / history / review fatigue)
18. **Occam**: PR process the simpler the better; cut redundant steps

## Related

- code review: [../../engineer/quality-security/do-a-code-review.md](../../engineer/quality-security/do-a-code-review.md) — review culture
- CI/CD: [../../engineer/infrastructure/set-up-ci-cd.md](../../engineer/infrastructure/set-up-ci-cd.md) — CI gate
- branch strategy: [../../engineer/infrastructure/set-up-a-branching-strategy.md](../../engineer/infrastructure/set-up-a-branching-strategy.md) — git flow
- PRD: [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) — requirement alignment
- cross-team: [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) — cross-team review
- bug report: [../../executive/strategy/prepare-a-bug-report.md](../../knowledge-curator/archive/strategies-legacy/executive/prepare-a-bug-report.md) — PR fixes bug
- release ship: [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) — release after PR merged
- thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md)
