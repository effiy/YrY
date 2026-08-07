---
title: Prepare a frontend accessibility strategy
aliases: [i-want-to-prepare-a-frontend-accessibility-strategy, frontend-accessibility-strategy, fa11y-strategy]
tags: [journey, methodology, frontend, accessibility, planning]
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-an-accessibility-strategy.md
  - ./prepare-a-design-system.md
  - ./prepare-a-frontend-i18n-strategy.md
  - ./prepare-a-frontend-testing-strategy.md
  - ./prepare-a-user-experience-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Frontend accessibility is not just alt text; it is a contract. Perception + operation + understanding + governance + measurement are five dimensions; business-value driven; not one-shot; measurable
---

# Prepare a frontend accessibility strategy

> **As an** engineer, **I want to** prepare a frontend accessibility, **so that** launch is safe.

## Summary

- Frontend accessibility = contract; not just alt text
- Perception + operation + understanding + governance + measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers wcag / aria / keyboard / contrast / screen-reader multiple dimensions
- Links with accessibility + design-system + frontend-i18n + frontend-testing + user-experience
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Frontend accessibility is a contract; not just alt text. This entry provides the FrontendA11y full path, covering perception + operation + understanding + governance + measurement, business-value driven rather than gut feel, covering wcag / aria / keyboard / contrast / screen-reader multiple dimensions, linking with prepare-an-accessibility-strategy + prepare-a-design-system + prepare-a-frontend-i18n-strategy + prepare-a-frontend-testing-strategy + prepare-a-user-experience-strategy, publicly queryable, periodic review, and links to Accessibility / DesignSystem / FrontendI18n / FrontendTest / UX and other leaves.

## 2-hop reachability paths

| Hop | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | accessibility | [./prepare-an-accessibility-strategy.md](./prepare-an-accessibility-strategy.md) |
| 1 hop | design-system | [./prepare-a-design-system.md](./prepare-a-design-system.md) |
| 2 hop | frontend-i18n | [./prepare-a-frontend-i18n-strategy.md](./prepare-a-frontend-i18n-strategy.md) |
| 2 hop | user-experience | [./prepare-a-user-experience-strategy.md](./prepare-a-user-experience-strategy.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: perception + operation + understanding + governance + measurement; no missing dimension
2. **Business-value driven**: set priority by efficiency + trust + speed + risk + cost; no sloganeering
3. **Perceivable**: contrast / text / media / color / closed-loop; do not omit
4. **Operable**: keyboard / focus / skip / timing / closed-loop; do not omit
5. **Understandable**: language / consistency / tooltips / errors / closed-loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: gradual from perception → operation → understanding → governance → measurement; no skipping
9. **Not report-ism**: reports are only the start; not the end
10. **No sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with accessibility**: FrontendA11y + Accessibility co-build
13. **Link with design-system**: FrontendA11y + DesignSystem co-build
14. **Link with frontend-i18n**: FrontendA11y + FrontendI18n co-build
15. **Link with frontend-testing**: FrontendA11y + FrontendTest co-build
16. **Link with user-experience**: FrontendA11y + UX co-build
17. **Toolchain**: axe / Lighthouse / Pa11y / WAVE / NVDA
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why FrontendA11y is needed; worst consequence of not doing it
21. **Inversion thinking**: how much can be solved by manual testing; if solvable do not introduce heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam**: FrontendA11y the simpler the better; cut redundant rules

## Related

- accessibility: [./prepare-an-accessibility-strategy.md](./prepare-an-accessibility-strategy.md) — Accessibility co-build
- design-system: [./prepare-a-design-system.md](./prepare-a-design-system.md) — DesignSystem co-build
- frontend-i18n: [./prepare-a-frontend-i18n-strategy.md](./prepare-a-frontend-i18n-strategy.md) — FrontendI18n co-build
- frontend-testing: [./prepare-a-frontend-testing-strategy.md](./prepare-a-frontend-testing-strategy.md) — FrontendTest co-build
- user-experience: [./prepare-a-user-experience-strategy.md](./prepare-a-user-experience-strategy.md) — UX co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
