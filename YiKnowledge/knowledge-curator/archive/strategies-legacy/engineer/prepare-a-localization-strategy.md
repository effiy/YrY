---
title: I want to build a Localization strategy / Prepare a localization strategy
aliases: [i-want-to-prepare-a-localization-strategy, localization-strategy, l10n-strategy]
tags: [journey, methodology, i18n, localization, planning]
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
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-web-strategy.md
  - ./prepare-a-mobile-strategy.md
  - ./prepare-a-content-strategy.md
  - ./prepare-an-accessibility-strategy.md
  - ../../product-manager/frameworks/prepare-a-product-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Localization is not just translation; it is a contract. Five dimensions: language + culture + legal + engineering + measurement; business-value driven; not one-shot; measurable"
---

# I want to build a Localization strategy

> **As an** engineer, **I want to** prepare a localization, **so that** launch is safe.

## Summary

- Localization = contract; not just translation
- Five dimensions: language + culture + legal + engineering + measurement; no missing dimension
- Business-value driven; not by gut feel
- Covers web / mobile / docs / marketing / support multiple carriers
- Links with web + mobile + content + accessibility + product
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Localization is a contract; not just translation. This entry provides the full Localization path, covering language + culture + legal + engineering + measurement, business-value driven not by gut feel, covering web / mobile / docs / marketing / support multiple carriers, linking with prepare-a-web-strategy + prepare-a-mobile-strategy + prepare-a-content-strategy + prepare-an-accessibility-strategy + prepare-a-product-strategy, publicly queryable, periodic review, and links to web / mobile / content / accessibility / product and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | web | [./prepare-a-web-strategy.md](./prepare-a-web-strategy.md) |
| 1 hop | mobile | [./prepare-a-mobile-strategy.md](./prepare-a-mobile-strategy.md) |
| 2 hops | content | [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) |
| 2 hops | accessibility | [./prepare-an-accessibility-strategy.md](./prepare-an-accessibility-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: language + culture + legal + engineering + measurement; no missing dimension
2. **Business-value driven**: prioritize by market + growth + trust + cost + speed; not sloganeering
3. **Language**: translation / terminology / style / quality / consistency; do not omit
4. **Culture**: date / currency / number / names / visuals; do not omit
5. **Legal**: compliance / privacy / data localization / content review / terms; do not omit
6. **Engineering**: i18n framework / resource files / CI checks / rollback / automation; do not omit
7. **Measurement**: market + growth + trust + cost + speed; do not omit
8. **Not one-shot**: progressive from language → culture → legal → engineering → measurement; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with web**: L10n + Web co-build
13. **Link with mobile**: L10n + Mobile co-build
14. **Link with content**: L10n + Content co-build
15. **Link with accessibility**: L10n + A11y co-build
16. **Link with product**: L10n + Product co-build
17. **Toolchain**: Crowdin / Lokalise / Phrase / Transifex / i18next
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why must Localization; worst consequence of not doing it
21. **Inversion thinking**: how much can English alone solve; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (market / trust / cost / speed)
23. **Occam**: the simpler L10n is, the better; cut redundant languages

## Related

- web: [./prepare-a-web-strategy.md](./prepare-a-web-strategy.md) — Web co-build
- mobile: [./prepare-a-mobile-strategy.md](./prepare-a-mobile-strategy.md) — Mobile co-build
- content: [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) — Content co-build
- accessibility: [./prepare-an-accessibility-strategy.md](./prepare-an-accessibility-strategy.md) — A11y co-build
- product: [../../product-manager/frameworks/prepare-a-product-strategy.md](../../product-manager/frameworks/prepare-a-product-strategy.md) — Product co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
