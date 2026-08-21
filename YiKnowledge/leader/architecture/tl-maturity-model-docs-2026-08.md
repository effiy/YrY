---
title: "Documentation Maturity Model Assessment 2026-08"
tags: [maturity-model, documentation, assessment]
category: leader/architecture
created: 2026-08-21
updated: 2026-08-21
source: internal
type: assessment
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "Documentation maturity baseline as of 2026-08"
---

# Documentation Maturity Assessment — 2026-08

## Maturity levels

| Level | Name | Criteria |
|-------|------|----------|
| 1 | Initial | No docs beyond code comments |
| 2 | Managed | README per project, onboarding exists |
| 3 | Defined | CLAUDE.md + README + ADRs + knowledge base |
| 4 | Measured | Doc coverage metrics, freshness checks |
| 5 | Optimizing | Automated doc generation, cross-ref integrity CI |

## Project assessments

| Project | Level | Evidence |
|---------|-------|----------|
| **YiAi** | 3 (Defined) | CLAUDE.md (342 lines), README in YiKnowledge, 6 ADRs, onboarding doc |
| **YiVad** | 3 (Defined) | CLAUDE.md + README (497 lines), 3 ADRs, onboarding doc, ProTable docs |
| **YiPet** | 3 (Defined) | CLAUDE.md + README (587 lines), 3 ADRs, onboarding doc, i18n docs |
| **YiKnowledge** | 3 (Defined) | INDEX.md, MEMORY.md, README per role, governance docs, frontmatter required |

## Key gaps

1. **No automated freshness checks** — docs can go stale without detection
2. **Cross-reference integrity** — 15+ broken links found and fixed (2026-08-21)
3. **No doc coverage metrics** — no way to know what's undocumented
4. **Onboarding docs** — exist for all 3 projects but not verified by new hires

## Recommendations

1. Add a CI check that verifies all `related` links resolve to existing files
2. Add `last_verified` freshness check — warn on docs > 90 days stale
3. Run onboarding docs with each new team member, collect feedback

## Next assessment

2026-11 (quarterly review)