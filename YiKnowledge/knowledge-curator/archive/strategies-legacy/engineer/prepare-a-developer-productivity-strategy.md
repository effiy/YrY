---
title: I want to prepare a developer productivity strategy / Prepare a developer productivity strategy
aliases: [i-want-to-prepare-a-developer-productivity-strategy, developer-productivity-strategy, devex-strategy, dev-productivity-strategy]
tags: [journey, methodology, developer-productivity, devex, engineering-management, planning]
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
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./improve-developer-experience.md
  - ./diagnose-org-productivity.md
  - ../tools/set-up-ci-cd.md
  - ./prepare-a-developer-portal-strategy.md
  - ./prepare-a-platform-engineering-strategy.md
  - ./prepare-a-coding-style-guide.md
  - ../tools/set-up-testing-infrastructure.md
  - ../processes/do-a-code-review.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Developer productivity is not just tools; it is a contract. environment + process + tooling + measurement + culture five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to prepare a developer productivity strategy

> **As an** engineer, **I want to** prepare a developer productivity, **so that** launch is safe.

## Summary

- Developer productivity = contract; not just tools
- environment + process + tooling + measurement + culture five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Cover SPACE + DORA + eNPS + PR cycle time + lead time multiple metrics
- Link with improve-developer-experience + diagnose-org-productivity + set-up-ci-cd + developer-portal + platform-engineering + coding-style-guide + testing-infrastructure + code-review
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Developer productivity is a contract; not just tools. This entry provides developer productivity full path, covering environment + process + tooling + measurement + culture, business-value driven not by gut feel, covering SPACE + DORA + eNPS + PR cycle time + lead time multiple metrics, linking with improve-developer-experience + diagnose-org-productivity + set-up-ci-cd + prepare-a-developer-portal-strategy + prepare-a-platform-engineering-strategy + prepare-a-coding-style-guide + set-up-testing-infrastructure + do-a-code-review, publicly queryable, periodic review, and links to improve-developer-experience / diagnose-org-productivity / set-up-ci-cd / prepare-a-developer-portal-strategy / prepare-a-platform-engineering-strategy / prepare-a-coding-style-guide / set-up-testing-infrastructure / do-a-code-review and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | devex | [./improve-developer-experience.md](./improve-developer-experience.md) |
| 1 hop | org-productivity | [./diagnose-org-productivity.md](./diagnose-org-productivity.md) |
| 2 hops | ci-cd | [../tools/set-up-ci-cd.md](../tools/set-up-ci-cd.md) |
| 2 hops | developer-portal | [./prepare-a-developer-portal-strategy.md](./prepare-a-developer-portal-strategy.md) |
| 2 hops | platform-engineering | [./prepare-a-platform-engineering-strategy.md](./prepare-a-platform-engineering-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **five dimensions**: environment + process + tooling + measurement + culture; no missing dimension
2. **business-value driven**: prioritise by scenario + pain points + measurement + investment-return; not sloganeering
3. **environment**: local + dev + staging + CI + toolchain + IDE; do not omit
4. **process**: PR + code review + test + deploy + retrospective; do not omit
5. **tooling**: IDE + AI assistant + code generation + debug + profiling + documentation; do not omit
6. **measurement**: SPACE + DORA + eNPS + PR cycle time + lead time + MTTR; do not omit
7. **culture**: blameless + learning + psychological safety + engineering culture + communication; do not omit
8. **not one-shot**: from tooling → process → measurement → culture gradual; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **link with devex**: productivity + experience co-built
13. **link with org-productivity**: productivity + organisation co-built
14. **link with ci-cd**: productivity + pipeline co-built
15. **link with developer-portal**: productivity + portal co-built
16. **link with platform-engineering**: productivity + platform co-built
17. **link with coding-style-guide**: productivity + standards co-built
18. **toolchain**: GitHub / Linear / DX / Haystack / jellyfish / Faros
19. **publicly queryable**: strategy everyone can look up; not hidden
20. **periodic review**: evolution updates; not one-shot
21. **first principles**: why must developer productivity; worst consequence of not doing
22. **inversion thinking**: how much can be solved by a single tool; if solvable do not introduce heavy strategy
23. **second-order thinking**: second-order consequences after strategy (cost / complexity / experience / business)
24. **Occam**: developer productivity the simpler the better; cut redundant steps

## Related

- devex: [./improve-developer-experience.md](./improve-developer-experience.md) — experience co-built
- org-productivity: [./diagnose-org-productivity.md](./diagnose-org-productivity.md) — organisation co-built
- ci-cd: [../tools/set-up-ci-cd.md](../tools/set-up-ci-cd.md) — pipeline co-built
- developer-portal: [./prepare-a-developer-portal-strategy.md](./prepare-a-developer-portal-strategy.md) — portal co-built
- platform-engineering: [./prepare-a-platform-engineering-strategy.md](./prepare-a-platform-engineering-strategy.md) — platform co-built
- coding-style-guide: [./prepare-a-coding-style-guide.md](./prepare-a-coding-style-guide.md) — standards co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
