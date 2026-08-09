---
title: After-Sales PAD Visual Review Checklist (7.21)
aliases:
- After-Sales PAD Visual Review
- After-Sales PAD review
- Visual review checklist
tags:
- after-sales
- PAD
- visual review
- UI
- design review
- 7.21
category: product-manager/discovery/ux
created: 2026-07-30
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
benefit: PMs can make data-informed product decisions with clear metrics and frameworks
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./nielsen-heuristics.md
- ./spritesheet.md
tacit: false
---

# After-Sales PAD Visual Review Checklist (7.21)

> **As a** product manager, **I want to** after sales pad visual review, **so that** product decision clear. 

> Visual review checklist for the after-sales PAD product (7.21), recording UI visual-level inspection items and issue list. 

## Summary

- After-sales PAD product 7.21 visual review record
- Original format Excel, path `/Users/ruiyi/Downloads/YrY/After-Sales-PAD-Visual-Review-Checklist-7.21.xlsx`
- Covers UI element visual spec checks, fidelity issues, design-to-implementation diffs
- Serves as the visual reference baseline for subsequent version iterations

## Core viewpoints

- **Visual review is the last line of defense against design erosion.** Between the design file and the production implementation, there are dozens of micro-decisions made by engineers under time pressure: a margin is adjusted, a font weight is approximated, a color is sampled from the wrong part of the gradient. Each individual deviation is invisible, but the cumulative effect is a product that feels "off" compared to the design. The visual review checklist is the systematic process that catches these cumulative deviations before they become the product's identity.

- **The visual review checklist is not just a bug list — it is a design-implementation alignment tool.** When the same visual issue appears across multiple features (e.g., inconsistent border radius, mismatched spacing scale), the root cause is not a designer who missed the issue but a design system that is not enforced in code. The checklist should surface patterns: if 5 issues are all about spacing inconsistency, the fix is not 5 individual corrections but a spacing token that is enforced in the component library.

- **A visual review without owner assignment and due dates is a critique session, not a quality process.** Identifying 20 visual issues in a review meeting and then filing them in a spreadsheet that no one owns is the most common failure mode. Each issue must have a single owner (the person who will fix it), a priority (blocking launch vs. nice-to-have), and a due date. The review is not complete until every issue has been assigned and tracked to resolution.


- Visual review is the last gate of design fidelity -- there are often deviations between design and implementation, need systematic recording
- Review checklist tracks fix priority and owner -- not just finding issues, also assigning responsibility and tracking status
- As version baseline -- subsequent version iterations use this table as visual reference

## Key information

### concept breakdown: file information

| Item | Value |
|---|---|
| Format | Excel (.xlsx) |
| Original path | `/Users/ruiyi/Downloads/YrY/After-Sales-PAD-Visual-Review-Checklist-7.21.xlsx` |
| Archive path | `product/ux/After-Sales-PAD-Visual-Review-Checklist-7.21.xlsx` |
| Date label | 7.21 |

### Review checklist scope

- UI element visual spec inspection items
- Visual fidelity issue records
- Design vs actual implementation diff comparison
- Fix priority and owner assignment

### Applicable scenarios

- After-sales PAD product visual design review
- Visual reference baseline for subsequent version iterations
- Checklist for design and frontend collaboration

## Action recommendations

1. Periodically update issue status in the review checklist
2. Mark fixed issues as completed
3. Use as visual reference baseline for subsequent version iterations
4. Align review items with [Nielsen 10 heuristics](./nielsen-heuristics.md)
5. Re-review after fix to ensure closed loop

## Anti-patterns

- **The visual review that happens only at the end of the development cycle.** When visual review is a gate that happens 2 days before launch, the team faces a choice between shipping with visual issues or delaying the launch. The review should be continuous: a quick visual pass at the end of each Sprint, with issues fixed in the next Sprint. Continuous review catches issues when they are cheap to fix; end-of-cycle review creates a backlog of issues that are expensive to fix and politically difficult to prioritize.

- **Visual issues tracked in a format that is not shareable with the engineering team.** A visual review checklist in a PM's personal Excel file on a local drive is invisible to the engineers who need to fix the issues. The checklist must live in a shared system (project management tool, design handoff tool, or shared spreadsheet) where engineers can see the issues, update the status, and ask clarifying questions. A private checklist is a wish list, not a work-tracking tool.

- **The visual review that focuses on subjective preferences rather than objective deviations from the design spec.** "This doesn't feel right" is not an actionable issue. The issue must reference the specific design spec element that is incorrect: "the button border-radius is 4px in the design file but 6px in the implementation." Objective issues are fixable; subjective issues are debatable. The visual review should be grounded in the design file as the source of truth.

- **The visual review checklist that is never used as a baseline for the next version.** When each version's visual review starts from scratch, the team repeats the same issues. The checklist from version N should be the starting point for version N+1: verified as fixed, re-tested, and used to prevent regressions. The checklist is a living document that accumulates the team's knowledge about where design-implementation gaps typically occur.

- **The visual review that treats every issue as equally important without severity classification.** When a misaligned icon and a broken form layout are both filed as "visual issues" with no severity distinction, the team wastes time fixing cosmetic problems while functional issues remain. Each issue must be classified by severity (blocking launch, major, minor, cosmetic) so the team can triage effectively and fix the most impactful issues first.

## Related

- same category: [nielsen-heuristics-summary.md](./nielsen-heuristics.md) — usability heuristics
- same category: [spritesheet-summary.md](./spritesheet.md) — UI assets
- upstream: original file `/Users/ruiyi/Downloads/YrY/After-Sales-PAD-Visual-Review-Checklist-7.21.xlsx`
