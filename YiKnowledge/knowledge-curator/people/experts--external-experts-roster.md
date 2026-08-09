---
title: External Experts Roster
aliases: [External Experts Roster, external-experts-roster, expert-list]
tags: [expert, external, consultant, lawyer, translator, tacit-knowledge]
category: knowledge-curator/people/experts
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
tacit: true
roles: [knowledge-curator]
benefit: "Engineers find external experts and industry authorities to consult for technical decisions and methodology research"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ../../governance/tacit-knowledge-backlog.md
 - ../../../ai-engineer/methodology/prompts--multilingual-translation.md
---

# External Experts Roster

> **As a** knowledge curator, **I want to** an external experts roster, **so that** people are discoverable.

> Tacit knowledge T007 first sediment — external consultants, lawyers, translators, industry expert index. Skeleton placeholder, all TBD.

## Summary

- External expert types: lawyers, translators, industry consultants, tech experts, academics
- Five major domain candidates: GDPR compliance, regional compliance, multilingual BRD, after-sales business, LLM reasoning
- Only public information is collected; no private contact details
- Quarterly verify link validity; not verified for over half a year becomes `status: deprecated`

## Core viewpoints

- External expert network is a key resource for decision-makers — lawyers / translators / industry consultants provide external endorsement, but not yet sedimented (T007)
- Only public information collected — talks, articles, blogs, LinkedIn; no email / phone / private messaging accounts
- Citation value must be clear — suitable for which scenario endorsement, otherwise inclusion is meaningless
- Link validity needs quarterly verification — not verified for over half a year becomes deprecated

## Key information

### Concept breakdown: expert checklist (all TBD)

| Name | Type | Profession Domain | Contact Channel (public) | Citation Value | Last Verified |
|---|---|---|---|---|---|
| _TBD_ | Lawyer | GDPR compliance | | | |
| _TBD_ | Lawyer | Regional compliance | | | |
| _TBD_ | Translator | Multilingual BRD | | | |
| _TBD_ | Industry consultant | After-sales business | | | |
| _TBD_ | Tech expert | LLM reasoning | | | |

### Concept breakdown: type enumeration

- `lawyer`: compliance, contracts, intellectual property
- `translator`: multilingual content (related to [multilingual-translation-prompt.md](../../../ai-engineer/methodology/prompts--multilingual-translation.md))
- `industry-consultant`: specific industry insights
- `tech-expert`: technology selection endorsement
- `academic`: papers, research

### Key parameters: inclusion criteria

- **Only public information collected**: talks, articles, blogs, LinkedIn
- **No private contact details collected**: email / phone / private messaging accounts
- **Citation value must be clear**: suitable for which scenario endorsement
- **Tag `last_verified`**: information's most recent verification date

### Application scenarios

- When decisions need external endorsement, first check this table
- Lawyer / translator / industry consultant selection
- Quarterly verify link validity

## Action recommendations

1. **Collect public information**: talks, articles, blogs, LinkedIn
2. **Tag `last_verified`**: information's most recent verification date
3. **Quarterly verify link validity**: not verified for over half a year becomes `status: deprecated`
4. **Every time a decision needs external endorsement, first check this table**: avoid duplicate searches
5. **New requirements trigger inclusion**: every time a decision encounters a new expert, include them

## Anti-patterns

- **Adding experts to the roster without verifying their current professional relevance.** Experts who have moved domains, retired, or stopped publishing become noise; each entry must be verified against recent activity.

- **Listing experts without domain categorization and searchable tags.** An undifferentiated list makes it impossible to find the right expert for a specific decision; categorize by domain, type, and citation scenario.

- **Treating the roster as a static artifact.** New experts emerge, old ones become inactive; a quarterly refresh is the minimum cadence to keep the roster usable.

- **Using expert endorsement as a substitute for independent analysis.** Experts provide directional signals, not answers; the team must still evaluate the technical and business context independently.

- **Collecting experts without a clear citation use case.** "Interesting person" is not a sufficient reason for inclusion; each entry must specify which decisions or scenarios the expert informs.

## Related

- Upstream: [../../governance/tacit-knowledge-backlog.md](../../governance/tacit-knowledge-backlog.md) — tacit knowledge backlog T007
- Same type: [../../../executive/industry/competitors](../../../executive/industry/competitors) — vendor experts for reference
- Same type: [../../templates/thinking](../../templates/thinking) — academic authorities
- Downstream: [../../../ai-engineer/methodology/prompts--multilingual-translation.md](../../../ai-engineer/methodology/prompts--multilingual-translation.md) — translator-related translation prompt
