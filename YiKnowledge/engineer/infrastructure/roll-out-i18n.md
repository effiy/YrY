---
title: Roll out i18n
aliases: [i-want-to-roll-out-i18n, roll-out-i18n, internationalization]
tags: [journey, methodology, i18n, internationalization, localization, multilingual]
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
benefit: "migration is reversible"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
- ../../knowledge-curator/templates/write-documentation.md
  - ../process/handle-customer-feedback.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../process/collaborate-across-teams.md
  - ../../product-manager/discovery/write-a-prd.md
  - ../../product-manager/frameworks/do-user-research.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
  - ../../knowledge-curator/templates/thinking--inversion.md
tacit: "i18n is not just string translation; it is a full set covering culture / time zone / currency / date / names / typography / regulation; i18n + l10n in two phases"
---

# I want to implement internationalization

> **As an** engineer, **I want to** roll out i18n, **so that** migration is reversible.

## Summary

- i18n + l10n in two phases: i18n extracts strings / l10n localizes
- Not just strings: culture / time zone / currency / date / names / typography / regulation as a full set
- String SSOT: key-value dictionary; not hardcoded in code
- ICU MessageFormat: plural / gender / nesting; do not use sprintf
- RTL support: Arabic / Hebrew RTL; layout mirroring
- Regulatory alignment: GDPR / regional data compliance; see [data-compliance](../../executive/strategy/handle-data-compliance.md)

## Scenario description

Business goes overseas, cross-region operations, multilingual users; internationalization incidents are frequent (hardcoded strings, date format errors, currency errors, cultural taboos). This entry provides the full i18n + l10n path, covering string SSOT, ICU MessageFormat, RTL, regulatory alignment, and links to write-documentation / handle-customer-feedback / handle-data-compliance / prepare-a-go-to-market / collaborate-across-teams / write-a-prd / do-user-research and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Documentation writing | [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) |
| 2 hop | Customer feedback | [../strategies/handle-customer-feedback.md](../process/handle-customer-feedback.md) |
| 2 hop | Data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hop | GTM | [../../product-manager/frameworks/prepare-a-go-to-market.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-go-to-market.md) |
| 2 hop | Cross-team collaboration | [../strategies/collaborate-across-teams.md](../process/collaborate-across-teams.md) |
| 2 hop | PRD | [../../product-manager/discovery/write-a-prd.md](../../product-manager/discovery/write-a-prd.md) |
| 2 hop | User research | [../../product-manager/frameworks/do-user-research.md](../../product-manager/frameworks/do-user-research.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hop | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |

## Action recommendations

1. **i18n + l10n two phases**: i18n extracts strings / l10n localizes; do not collapse stages, but do them together
2. **Not just strings**: culture / time zone / currency / date / names / typography / regulation as a full set
3. **String SSOT**: key-value dictionary; not hardcoded in code
4. **ICU MessageFormat**: plural / gender / nesting; do not use sprintf
5. **RTL support**: Arabic / Hebrew RTL; layout mirroring
6. **Regulatory alignment**: GDPR / regional data compliance; see [data-compliance](../../executive/strategy/handle-data-compliance.md)
7. **Cultural taboos**: color / icon / number / gesture; cross-cultural research
8. **Currency + time zone**: currency format + time zone display; do not hardcode ¥ / UTC
9. **Date format**: YYYY-MM-DD ISO; localized display
10. **Names + addresses**: surname / name order; address format varies across regions
11. **Typography + fonts**: CJK / Arabic / Cyrillic; font adaptation
12. **Translation process**: PM + translation + proofreading + localization expert; do not launch with raw machine translation
13. **First principles**: why must i18n; worst consequence of not doing i18n; i18n cost ÷ benefit
14. **Inversion**: how much can English + localized prompts solve; if solvable, do not go full i18n
15. **Second-order thinking**: second-order consequences after i18n (maintenance / translation / culture); not just short-term output
16. **Occam's razor**: simpler i18n solutions are better; cut redundant languages

## Related

- Documentation: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — string SSOT
- Customer feedback: [../strategies/handle-customer-feedback.md](../process/handle-customer-feedback.md) — localization feedback
- Data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — regulatory alignment
- GTM: [../../product-manager/frameworks/prepare-a-go-to-market.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-go-to-market.md) — overseas release
- Cross-team collaboration: [../strategies/collaborate-across-teams.md](../process/collaborate-across-teams.md) — translation team collaboration
- PRD: [../../product-manager/discovery/write-a-prd.md](../../product-manager/discovery/write-a-prd.md) — multilingual requirements
- User research: [../../product-manager/frameworks/do-user-research.md](../../product-manager/frameworks/do-user-research.md) — cross-cultural research
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md)
