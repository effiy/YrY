---
title: Set up a branching strategy
aliases: [i-want-to-set-up-a-branching-strategy, branching-strategy, git-workflow, git-flow]
tags: [journey, methodology, git, branching, trunk-based, git-flow, github-flow]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Branching strategy balances speed and stability, enabling parallel feature work while protecting the release branch"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
- ../../oncall-sre/incident-response/handle-a-pull-request.md
  - ./set-up-ci-cd.md
  - ../infrastructure/ship-a-release.md
  - ../process/collaborate-across-teams.md
  - ../quality-security/do-a-code-review.md
  - ../../oncall-sre/incident-response/handle-a-major-version-upgrade.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/inversion.md
tacit: Branching strategy is not "the more complex the better"; start with trunk-based; release flow for large teams; do not mix; keep branch lifetime short
---

# I want to set up a branching strategy

> **As an** engineer, **I want to** set up a branching, **so that** baseline is reproducible.

## Summary

- Three tiers of strategy: trunk-based / github flow / git flow
- Start with trunk-based: mainline + short-lived feature branch; simple
- Release flow: large teams / multiple release lines
- Short branch lifetime: feature < 1 day; do not pile up
- Merge strategy: squash / merge / rebase per scenario
- Protect the mainline: forbid force push / require review / require CI
- Do not mix strategies: one strategy per project
- Long-lived branches = tech debt

## Scenario description

Branching strategy shapes the team collaboration cadence; it is not "the more complex the better". This entry provides the full path of branching strategy, covering the three tiers, trunk-based as starting point, release flow for large teams, short-lived branches, merge strategy, mainline protection, no mixing strategies, long-lived branches becoming immediate debt, and links to handle-a-pull-request / set-up-ci-cd / ship-a-release / collaborate-across-teams / do-a-code-review / handle-a-major-version-upgrade and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | PR handling | [../../oncall-sre/incident-response/handle-a-pull-request.md](../../oncall-sre/incident-response/handle-a-pull-request.md) |
| 2 hop | CI/CD | [./set-up-ci-cd.md](./set-up-ci-cd.md) |
| 2 hop | Release launch | [../processes/ship-a-release.md](ship-a-release.md) |
| 2 hop | Cross-team collaboration | [../strategies/collaborate-across-teams.md](../process/collaborate-across-teams.md) |
| 2 hop | Code review lookup | [../processes/do-a-code-review.md](../quality-security/do-a-code-review.md) |
| 2 hop | Major version upgrade | [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hop | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |

## Action recommendations

1. **Three tiers of strategy**: trunk-based / github flow / git flow; choose by team size
2. **Start with trunk-based**: mainline + short-lived feature branch; simple; small-team default
3. **Release flow for large teams**: multiple release lines / multiple versions in parallel; large teams
4. **Short branch lifetime**: feature < 1 day; do not pile up; split if over 1 day
5. **Merge strategy**: squash compresses history / merge preserves / rebase linear; per scenario
6. **Protect mainline**: forbid force push / require review / require CI / require test set; no bypass
7. **Do not mix strategies**: one strategy per project; do not mix trunk + git flow
8. **Long-lived branch = tech debt**: long-lived branches must be split and merged; do not let them linger
9. **Feature branch naming**: feature/<jira-id>-<short-desc>; not arbitrary
10. **Hotfix branch**: hotfix/<issue-id>; cut from mainline; merge back to mainline + release
11. **Release branch**: release/<version>; only bug fixes, no new features
12. **Tag versioning**: every release must be tagged; traceability
13. **Cherry-pick**: hotfix back to release; no leakage
14. **No force push to mainline**: force push only on personal branches; forbidden on mainline
15. **First principles**: why a branching strategy is required; the worst consequence of not having one
16. **Inversion**: how much can be solved with trunk-based + feature flags; if solvable, do not introduce release branches
17. **Second-order thinking**: second-order consequences of the strategy (merge conflicts / rollback / release cadence / review fatigue)
18. **Occam's razor**: simpler strategy is better; cut redundant branches

## Related

- PR handling: [../../oncall-sre/incident-response/handle-a-pull-request.md](../../oncall-sre/incident-response/handle-a-pull-request.md) — merge gate
- CI/CD: [./set-up-ci-cd.md](./set-up-ci-cd.md) — mainline protection
- Release launch: [../processes/ship-a-release.md](ship-a-release.md) — release branch
- Cross-team: [../strategies/collaborate-across-teams.md](../process/collaborate-across-teams.md) — cross-team conventions
- Code review lookup: [../processes/do-a-code-review.md](../quality-security/do-a-code-review.md) — review process
- Major version upgrade: [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) — version management
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md)
