---
title: I want to prepare a coding style guide / Prepare a coding style guide
aliases: [i-want-to-prepare-a-coding-style-guide, coding-style, code-style-guide, code-conventions]
tags: [journey, methodology, coding-style, code-quality, dev-standards, governance]
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
  - "filename is a descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ../processes/do-a-code-review.md
  - ../tools/set-up-ci-cd.md
  - ./improve-developer-experience.md
  - ../../new-hire/onboarding/onboard-as-a-new-engineer.md
  - ../../knowledge-curator/templates/write-documentation.md
  - ./bootstrap-a-new-project.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Coding style is not just lint; it's a contract. Format + naming + structure + patterns + anti-patterns; automated enforcement; not human review
---

# I want to prepare a coding style guide

> **As an** engineer,**I want to** prepare a coding style guide,**so that** launch is safe.

## Summary

- Coding style = contract; not just lint
- Format + naming + structure + patterns + anti-patterns; no missing dimensions
- Automated enforcement; not human review
- Toolchain: lint + formatter + git hook + CI gate
- Linked with code review; style violations block CI
- Linked with new hire onboarding; first read defines expectations
- Linked with docs; do not duplicate
- Per language; do not mix
- Public and queryable; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam

## Scenario description

Coding style is a contract; not just lint. This entry gives the full coding style path, covering format + naming + structure + patterns + anti-patterns, automated enforcement, toolchain lint + formatter + git hook + CI gate, linkage with code review, linkage with new hire onboarding, linkage with docs, per language, public and queryable, regular review, and links to leaves like do-a-code-review / set-up-ci-cd / improve-developer-experience / onboard-as-a-new-engineer / write-documentation / bootstrap-a-new-project.

## 2-hop reach paths

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Code review | [../processes/do-a-code-review.md](../processes/do-a-code-review.md) |
| 2 hops | CI/CD | [../tools/set-up-ci-cd.md](../tools/set-up-ci-cd.md) |
| 2 hops | DX | [./improve-developer-experience.md](./improve-developer-experience.md) |
| 2 hops | New hire onboarding | [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) |
| 2 hops | Docs | [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) |
| 2 hops | bootstrap | [./bootstrap-a-new-project.md](./bootstrap-a-new-project.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Five dimensions**: format + naming + structure + patterns + anti-patterns; no missing dimensions
2. **Automated formatting**: formatter not human; Biome / Prettier / Black / gofmt
3. **Strict lint**: eslint / ruff / golangci-lint; CI blocks violations
4. **git hook**: pre-commit local interception; do not wait for CI to find out
5. **CI gate**: lint + format + type check + test; violations block CI
6. **Naming rules**: variables / functions / classes / files / modules; not ambiguous
7. **Structure rules**: module boundaries + dependency direction + no cycles; not messy
8. **Pattern recommendations**: error handling + async + logging + testing; do not guess
9. **Anti-pattern list**: forbidden patterns listed; not verbal
10. **Per language**: one set per language; do not mix
11. **Link with code review**: style violations must be flagged in review; do not duplicate
12. **Link with CI**: style violations block CI; not human review
13. **Link with new hire onboarding**: first read defines expectations; not verbal
14. **Link with docs**: style goes into docs; do not duplicate
15. **Link with bootstrap**: new projects come with style by default; do not reconfigure
16. **Public and queryable**: everyone can look it up; not hidden
17. **Regular review**: evolve and update; not one-off
18. **Exception approval**: violations must be approved; not silent
19. **Tool versioning**: lint / formatter versions locked; no drift
20. **First principles**: why style is necessary; worst consequence of not doing
21. **Reverse thinking**: how much can review solve; if solvable, do not introduce style
22. **Second-order thinking**: second-order consequences of style (consistency / retention / hiring / speed)
23. **Occam**: simpler style is better; cut redundant rules

## Related

- Code review: [../processes/do-a-code-review.md](../processes/do-a-code-review.md) — enforcement
- CI/CD: [../tools/set-up-ci-cd.md](../tools/set-up-ci-cd.md) — gate
- DX: [./improve-developer-experience.md](./improve-developer-experience.md) — consistent experience
- New hire onboarding: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — first read
- Docs: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — landing
- bootstrap: [./bootstrap-a-new-project.md](./bootstrap-a-new-project.md) — starter kit
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
