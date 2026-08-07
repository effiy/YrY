---
title: I want to write an RFC / Prepare an RFC
aliases:
- i-want-to-prepare-an-rfc
- prepare-an-rfc
- rfc-process
tags:
- journey
- methodology
- rfc
- tech-design
- review
- proposal
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ../../tech-lead/architecture/design-architecture-decision.md
- ../../product-manager/frameworks/write-a-spec-or-prd.md
- ../processes/do-a-code-review.md
- ./collaborate-across-teams.md
- ../../tech-lead/roadmap/do-a-tech-selection.md
- ../../tech-lead/roadmap/do-a-proof-of-concept.md
- ../../knowledge-curator/templates/write-documentation.md
- ../tools/set-up-ci-cd.md
- ../../knowledge-curator/templates/adr.md
- ../../knowledge-curator/templates/thinking/first-principles.md
- ../../knowledge-curator/templates/thinking/inversion.md
- ../../knowledge-curator/templates/thinking/second-order-thinking.md
- ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: An RFC is a proposal not a decision; diverge first then converge; review cadence is not a formality; after RFC lands must run ADR to record the decision
---

# I want to write an RFC

> **As an** engineer, **I want to** prepare an rfc, **so that** launch is safe.

## Summary

- RFC five sections: background + proposal + alternatives + risk + timeline
- Diverge first then converge: draft broadly gathers feedback; do not converge early
- Review cadence >= 3 days: comments must be replied to; no reply equals disagreement
- Alternatives must run: >= 3 alternatives + each with trade-off; no alternatives = immature
- After RFC lands, go to ADR: RFC is the process; ADR is the decision recorded
- review three-section form: requirement / design / tech review

## Scenario

When making non-trivial technical changes (architecture / paradigm / cross-team impact) that need team alignment, RFC is the entry to the RFC (Request for Comments) process. This entry provides the full path from writing to landing, covering RFC five sections, review cadence, alternatives, three-section review, ADR landing, and links to ADR / PRD / code review / cross-team collaboration / tech-selection / PoC and other leaves.

## 2-hop reachability paths

| Hops | goal | file |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | ADR template | [../../knowledge-curator/templates/adr.md](../../knowledge-curator/templates/adr.md) |
| 2 hops | ADR | [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) |
| 2 hops | PRD / spec writing | [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) |
| 2 hops | code review | [../processes/do-a-code-review.md](../processes/do-a-code-review.md) |
| 2 hops | cross-team collaboration | [./collaborate-across-teams.md](./collaborate-across-teams.md) |
| 2 hops | tech-selection | [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) |
| 2 hops | PoC | [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) |
| 2 hops | documentation writing | [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) |
| 2 hops | CI/CD | [../tools/set-up-ci-cd.md](../tools/set-up-ci-cd.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| 2 hops | strong-opinions | [../methodology/thinking-frameworks/strong-opinions.md](./../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) |

## Action recommendations

1. **RFC five sections required**: background + proposal + alternatives + risk + timeline
2. **Diverge first then converge**: draft broadly gathers feedback; do not converge early; review cadence >= 3 days
3. **Alternatives >= 3**: no alternatives = immature; each trade-off required
4. **Review cadence >= 3 days**: comments must be replied to; no reply equals disagreement; over deadline defaults to agreement
5. **Not a formality**: review cadence is not a formality; every comment must be replied + marked resolved
6. **RFC landing goes to ADR**: RFC is the process; ADR is the decision recorded; landing must run ADR
7. **Three-section review**: requirement / design / tech review three sections; do not skip sections
8. **Risk section honest**: list real risks; do not hide landmines; each risk carries a mitigation plan
9. **Timeline section executable**: milestones + owner + acceptance; not executable = immature
10. **Cross-team impact must tag**: tag cross-team impact; cross-team alignment
11. **First principles establish skeleton**: why must change; worst consequence of not changing; cost of change / benefit
12. **Inversion thinking**: if not changing, how much can be solved; if solvable, do not change
13. **Second-order thinking**: second-order consequences after change (migration / compatibility / maintenance); do not only look at short-term output
14. **Occam**: proposal the simpler the better; cut redundant actions
15. **Strong opinions loosely held**: proposal should have strong opinions; weak stance converges after review

## Related

- ADR: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — RFC landing
- PRD: [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) — spec prerequisite
- code review: [../processes/do-a-code-review.md](../processes/do-a-code-review.md) — landing review
- cross-team collaboration: [./collaborate-across-teams.md](./collaborate-across-teams.md) — cross-team alignment
- tech-selection: [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) — selection
- PoC: [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) — validation
- documentation: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — documentation-ize
- CI/CD: [../tools/set-up-ci-cd.md](../tools/set-up-ci-cd.md) — landing gate
- ADR template: [../../knowledge-curator/templates/adr.md](../../knowledge-curator/templates/adr.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md) + [strong-opinions](./../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md)
