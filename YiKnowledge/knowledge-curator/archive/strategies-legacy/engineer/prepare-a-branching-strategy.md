---
title: I want to build a branching strategy / Prepare a branching strategy
aliases: [i-want-to-prepare-a-branching-strategy, branching-strategy, git-branching-strategy]
tags: [journey, methodology, engineering, git, version-control, planning]
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user story header + 7 fixed-order sections"
related:
  - ./prepare-a-cicd-strategy.md
  - ./prepare-a-release-engineering-strategy.md
  - ./prepare-a-code-review-strategy.md
  - ./prepare-a-test-automation-strategy.md
  - ./prepare-a-refactoring-strategy.md
  - ./prepare-a-developer-productivity-strategy.md
  - ./prepare-a-zero-downtime-deployment-strategy.md
  - ../tools/set-up-a-staging-environment.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Branching strategy is not just main; it is a contract. Five dimensions: trunk + branch + merge + protection + release; business-value driven; not one-shot; measurable"
---

# I want to build a branching strategy

> **As an** engineer, **I want to** prepare a branching, **so that** launch is safe. 

## Summary

- Branching strategy = contract; not just main
- Five dimensions: trunk + branch + merge + protection + release; no missing dimension
- Business-value driven; not by gut feel
- Covers trunk-based / git-flow / github-flow / release-flow multiple models
- Links with cicd + release-engineering + code-review + test-automation + refactoring + developer-productivity + zero-downtime + staging
- Publicly discoverable; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Branching strategy is a contract; not just main. This entry gives the full branching strategy path, covering trunk + branch + merge + protection + release, business-value driven not by gut feel, covering trunk-based / git-flow / github-flow / release-flow multiple models, linked with prepare-a-cicd-strategy + prepare-a-release-engineering-strategy + prepare-a-code-review-strategy + prepare-a-test-automation-strategy + prepare-a-refactoring-strategy + prepare-a-developer-productivity-strategy + prepare-a-zero-downtime-deployment-strategy + set-up-a-staging-environment, publicly discoverable, regular review, and links to prepare-a-cicd-strategy / prepare-a-release-engineering-strategy / prepare-a-code-review-strategy / prepare-a-test-automation-strategy / prepare-a-refactoring-strategy / prepare-a-developer-productivity-strategy / prepare-a-zero-downtime-deployment-strategy / set-up-a-staging-environment and other leaves.

## 2-hop reachability path

| Hop | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | cicd | [./prepare-a-cicd-strategy.md](./prepare-a-cicd-strategy.md) |
| 1 hop | release-engineering | [./prepare-a-release-engineering-strategy.md](./prepare-a-release-engineering-strategy.md) |
| 2 hops | code-review | [./prepare-a-code-review-strategy.md](./prepare-a-code-review-strategy.md) |
| 2 hops | test-automation | [./prepare-a-test-automation-strategy.md](./prepare-a-test-automation-strategy.md) |
| 2 hops | refactoring | [./prepare-a-refactoring-strategy.md](./prepare-a-refactoring-strategy.md) |
| 2 hops | developer-productivity | [./prepare-a-developer-productivity-strategy.md](./prepare-a-developer-productivity-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: trunk + branch + merge + protection + release; no missing dimension
2. **Business-value driven**: prioritize by team size + release frequency + risk + complexity; no empty slogans
3. **Trunk**: main / master + always releasable + protection + mandatory PR; no leakage
4. **Branch**: feature / fix / hotfix / release / chore + short-lived + naming conventions; no leakage
5. **Merge**: merge / squash / rebase + --no-ff + keep history + conflict resolution; no leakage
6. **Protection**: mandatory review + CI must pass + no force push + status check + restrict direct push; no leakage
7. **Release**: release branch / tag / cherry-pick / hotfix + version number + compatibility; no leakage
8. **Not one-shot**: progressive from single main → git-flow → github-flow → trunk-based → release-flow; no skipping levels
9. **No report-ism**: report is just the start; not the end
10. **No empty slogans**: every principle must mark implementation evidence; no vagueness
11. **Versioned**: strategy is versioned; evolution is traceable
12. **Link with cicd**: branch + CI/CD co-build
13. **Link with release-engineering**: branch + release co-build
14. **Link with code-review**: branch + review co-build
15. **Link with test-automation**: branch + test co-build
16. **Link with refactoring**: branch + refactor co-build
17. **Link with developer-productivity**: branch + productivity co-build
18. **Toolchain**: GitHub / GitLab / Bitbucket / Gitea / Azure DevOps + CODEOWNERS + branch protection + merge queue
19. **Publicly discoverable**: strategy is publicly discoverable; not hidden
20. **Regular review**: evolve and update; not one-shot
21. **First principles**: why a branching strategy is necessary; worst consequence of not doing it
22. **Inversion**: how much can be solved by direct push to main; if solvable, do not introduce a heavy strategy
23. **Second-order thinking**: second-order consequence after the strategy (cost / collaboration / speed / business) 
24. **Occam's razor**: branching strategy, simpler is better; cut redundant steps

## Related

- cicd: [./prepare-a-cicd-strategy.md](./prepare-a-cicd-strategy.md) — CI/CD co-build
- release-engineering: [./prepare-a-release-engineering-strategy.md](./prepare-a-release-engineering-strategy.md) — release co-build
- code-review: [./prepare-a-code-review-strategy.md](./prepare-a-code-review-strategy.md) — review co-build
- test-automation: [./prepare-a-test-automation-strategy.md](./prepare-a-test-automation-strategy.md) — test co-build
- refactoring: [./prepare-a-refactoring-strategy.md](./prepare-a-refactoring-strategy.md) — refactor co-build
- developer-productivity: [./prepare-a-developer-productivity-strategy.md](./prepare-a-developer-productivity-strategy.md) — productivity co-build
- zero-downtime-deployment: [./prepare-a-zero-downtime-deployment-strategy.md](./prepare-a-zero-downtime-deployment-strategy.md) — zero-downtime co-build
- staging-environment: [../tools/set-up-a-staging-environment.md](../tools/set-up-a-staging-environment.md) — pre-release co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
