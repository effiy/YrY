---
title: I want to prepare an accessibility strategy / Prepare an accessibility strategy
aliases: [i-want-to-prepare-an-accessibility-strategy, accessibility-strategy, a11y-strategy]
tags: [journey, methodology, accessibility, product, governance, planning]
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
 - ./do-an-accessibility-audit.md
 - ./prepare-a-design-system.md
 - ../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md
 - ./prepare-a-mobile-strategy.md
 - ./prepare-a-compliance-framework.md
 - ../tools/set-up-testing-infrastructure.md
 - ./prepare-a-coding-style-guide.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Accessibility is not just patches; it is a contract. Perception + Operability + Understanding + Robustness + Compatibility are the dimensions; user-value driven; not one-shot; measurable
---

# I want to prepare an accessibility strategy

> **As an** engineer, **I want to** prepare an accessibility, **so that** launch is safe.

## Summary

- Accessibility = contract; not just patches
- Perception + Operability + Understanding + Robustness + Compatibility; no missing dimension
- User-value driven; not by feel
- Cover WCAG / ARIA / semantic HTML / keyboard / contrast / screen readers
- Linked with audit + design-system + frontend + mobile + compliance + testing
- Publicly accessible; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Accessibility is a contract; not just patches. This entry provides the a11y full path, covering perception + operability + understanding + robustness + compatibility, user-value driven not by feel, covering WCAG / ARIA / semantic HTML / keyboard / contrast / screen readers, linked with audit + design-system + frontend + mobile + compliance + testing, publicly accessible, regular review, and links to do-an-accessibility-audit / prepare-a-design-system / prepare-a-frontend-architecture-strategy / prepare-a-mobile-strategy / prepare-a-compliance-framework / set-up-testing-infrastructure / prepare-a-coding-style-guide and other leaves.

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | audit | [./do-an-accessibility-audit.md](./do-an-accessibility-audit.md) |
| 2 hops | design-system | [./prepare-a-design-system.md](./prepare-a-design-system.md) |
| 2 hops | frontend | [../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md) |
| 2 hops | mobile | [./prepare-a-mobile-strategy.md](./prepare-a-mobile-strategy.md) |
| 2 hops | compliance | [./prepare-a-compliance-framework.md](./prepare-a-compliance-framework.md) |
| 2 hops | testing | [../tools/set-up-testing-infrastructure.md](../tools/set-up-testing-infrastructure.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: perception + operability + understanding + robustness + compatibility; no missing dimension
2. **User-value driven**: prioritize by user scenario + barrier type + compliance; no empty slogans
3. **Perception**: color contrast + font size + text alternatives; none missing
4. **Operability**: keyboard reachable + focus visible + target size; none missing
5. **Understanding**: error hints + consistent navigation + readability; none missing
6. **Robustness**: semantic HTML + ARIA + assistive tech compatibility; none missing
7. **Compatibility**: cross-browser + cross-device + screen readers; none missing
8. **Not one-shot**: progress from semantic HTML → ARIA → keyboard → contrast → screen readers; no skipping levels
9. **Not report-only**: reports are only the starting point; not the endpoint
10. **No empty slogans**: every principle must have landed evidence; no ambiguity
11. **Versioned**: strategy has versions; evolution is traceable
12. **Linked with audit**: a11y + audit co-built
13. **Linked with design-system**: a11y + design co-built
14. **Linked with frontend**: a11y + frontend co-built
15. **Linked with mobile**: a11y + mobile co-built
16. **Linked with compliance**: a11y + compliance co-built
17. **Linked with testing**: a11y + QA co-built
18. **Toolchain**: axe / Lighthouse / WAVE / NVDA / VoiceOver / Jest-axe
19. **Publicly accessible**: strategy accessible to everyone; not hidden
20. **Regular review**: evolve and update; not one-shot
21. **First principles**: why a11y is needed; worst consequence of not doing it
22. **Inversion**: how much can be solved with standard components + default styles; if solvable, don't introduce a heavy strategy
23. **Second-order thinking**: second-order consequences after the strategy (cost / complexity / experience / business)
24. **Occam**: a11y, the simpler the better; cut redundant steps

## Related

- audit: [./do-an-accessibility-audit.md](./do-an-accessibility-audit.md) — audit co-built
- design-system: [./prepare-a-design-system.md](./prepare-a-design-system.md) — design co-built
- frontend: [../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md) — frontend co-built
- mobile: [./prepare-a-mobile-strategy.md](./prepare-a-mobile-strategy.md) — mobile co-built
- compliance: [./prepare-a-compliance-framework.md](./prepare-a-compliance-framework.md) — compliance co-built
- testing: [../tools/set-up-testing-infrastructure.md](../tools/set-up-testing-infrastructure.md) — QA co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
