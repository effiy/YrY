---
title: Write documentation
aliases:
- I want to write docs
- documentation-journey
- docs-journey
- docsentry
tags:
- journeys
- documentation
- knowledge-leaf
- ssot
- tacit-knowledge
category: knowledge-curator/templates
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
roles:
- knowledge-curator
benefit: knowledge is captured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../new-hire/onboarding/contribute-to-the-knowledge-base.md
- ../governance/evolve-the-knowledge-base.md
- ../../tech-lead/architecture/design-architecture-decision.md
- ../../knowledge-curator/templates/knowledge-leaf.md
review_cycle: quarterly
tacit: false
---

# I want to write documentation

> **As a** knowledge curator, **I want to** write documentation, **so that** knowledge is captured. 

> "knowledge leaf / ADR / tech design / PRD / BRD / template / API docs / user docs" reachable within 2 hops via template + directory constraints + review process + SSOT pattern + make tacit knowledge explicit. 

## Summary

- Template follows [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) + `resources/templates/` full set
- Directory constraints follow [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) + [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md)
- Review follows [knowledge-review-process.md](../../engineer/process/knowledge-review.md) + [review-log.md](../../knowledge-curator/governance/review-log.md)
- SSOT follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md)
- Make tacit knowledge explicit via [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md)

## Core viewpoints

**The "why" is more valuable than the "what" in documentation.** A document that describes what the system does but not why it was designed that way is a user manual, not knowledge. The "why" -- the constraints that shaped the decision, the alternatives that were rejected, the assumptions that were later proven wrong -- is what enables the next engineer to modify the system without breaking it. Documentation without context is reference material; documentation with context is organizational learning.

**The SSOT pattern is the only defense against documentation drift.** When the same information exists in a knowledge leaf, a README, a wiki page, and a design doc, the four copies will diverge within weeks. The SSOT (Single Source of Truth) + view layer pattern solves this: one canonical source, and every other surface is a pointer or a generated view. The cost of maintaining four copies is not just the writing time -- it is the decision cost when a reader encounters conflicting information and does not know which to trust.

**The 2-hop reachability rule is a usability constraint, not a formalism.** The rule that every document must be reachable within two hops from an INDEX or role README forces the author to think about how a reader would find the document. A perfectly written document that nobody can discover is wasted effort. The 2-hop constraint is the minimum viable information architecture: if you cannot explain how someone would find this document in two clicks, it does not belong in the knowledge base.

**Documentation quality is a function of review frequency, not initial effort.** A document that took 40 hours to write but is never reviewed will be less useful after 6 months than a document that took 4 hours but is reviewed quarterly. The review cycle updates stale data, removes obsolete sections, and adds new context. Documentation is a living asset, not a one-time deliverable. The `review_cycle` field in frontmatter is the contract that keeps the document alive.

**AI-assisted drafting changes the economics of documentation.** With LLM-generated first drafts, the cost of creating documentation has dropped 10x. The bottleneck is no longer writing -- it is review, verification, and the tacit knowledge that only exists in people's heads. The new documentation workflow is: AI generates the draft, the domain expert verifies and adds context, and the review process catches errors. The human's role shifts from author to editor and verifier.

## Scenario description

When writing a knowledge base leaf / writing an ADR / writing a tech design / writing a PRD / writing a BRD / writing API docs / writing user docs / organizing meeting minutes, contributors need to look up templates + directory constraints + review process + SSOT pattern. This entry aggregates documentation writing related templates + lifecycle + SSOT pattern into a 2-hop path, avoiding "format drift / naming violations / no review / duplicate content — four kinds of drift". 

## 2-hop reachability path

| Hop 1 (directory/leaf)  | Hop 2 (specific file) |
|---|---|
| `knowledge-curator/templates/` | [knowledge-leaf.md](./knowledge-leaf.md) · [adr.md](./adr.md) · [tech-design.md](./tech-design.md) · [prd.md](./prd.md) · [brd.md](./brd.md) · [meeting-notes.md](./meeting-notes.md) · [one-on-one.md](./one-on-one.md) · [retrospective.md](./retrospective.md) · [tech-selection-evaluation.md](./tech-selection-evaluation.md) · [usability-test-report.md](./usability-test-report.md) · [user-research-interview.md](./user-research-interview.md) |
| `knowledge-curator/diagrams/` | [directory-blueprint.md](../diagrams/directory-blueprint.md) · [knowledge-map.md](../diagrams/knowledge-map.md) · [user-journey.md](../diagrams/user-journey.md) |
| `knowledge-curator/governance/` | [readiness-checklist.md](../governance/readiness-checklist.md) · [review-log.md](../governance/review-log.md) · [tacit-knowledge-backlog.md](../governance/tacit-knowledge-backlog.md) · [governance.md](../governance/governance.md) · [triage.md](../governance/triage.md) · [inbox.md](../governance/inbox.md) |
| `knowledge-curator/archive/` | [archive.md](../archive/archive.md) |
| `engineer/process/` | [knowledge-contributor-charter.md](../../engineer/process/knowledge-contributor-charter.md) · [knowledge-review.md](../../engineer/process/knowledge-review.md) · [knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md) · [knowledge-transfer.md](../../engineer/process/knowledge-transfer.md) |
| `product-manager/processes/` | [design-review.md](../../product-manager/delivery/design-review.md) · [tech-review.md](../../product-manager/delivery/tech-review.md) · [requirement-review.md](../../product-manager/delivery/requirement-review.md) |
| `engineer/architecture-design/` | [ssot-view-layer.md](../../engineer/architecture-design/ssot-view-layer.md) · [dual-world-boundary.md](../../engineer/engineering/dual-world-boundary.md) · [one-to-one-mapping-migration.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) |
| `knowledge-curator/templates/thinking/` | [ockhams-razor.md](./thinking/ockhams-razor.md) · [first-principles.md](./thinking/first-principles.md) · [inversion.md](./thinking/inversion.md) · [flywheel-effect.md](./thinking/flywheel-effect.md) |
| `INDEX.md` | [../../INDEX.md](../../INDEX.md) — all library indexes (including scenario entries section)  |
| `ai-engineer/methodology/prompts/` | [brd-generation.md](../../ai-engineer/methodology/prompts/brd-generation.md) · [code-review.md](../../ai-engineer/methodology/prompts/code-review.md) · [weekly-report.md](../../ai-engineer/methodology/prompts/weekly-report.md) — AI-assisted writing prompts |
| `engineer/lessons/wins/` | [yivad-leaf-view-leaves-ssot.md](../../engineer/lessons/win-yivad-leaf-view-leaves-ssot.md) · [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) |
| `product-manager/delivery/` | [weekly-report.md](../../product-manager/delivery/weekly-report.md) · [daily-report.md](../../product-manager/delivery/daily-report.md) · [retrospective.md](../../product-manager/delivery/retrospective.md) · [review-meeting.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting.md](../../product-manager/delivery/weekly-meeting.md) |
| `executive/industry/` | [README.md](../../executive/industry/README.md) — BRD leaf + 10 business domains + scenario library + glossary table |

## Action recommendations

1. **Write why first**: background + motivation + constraints + target — 4 sections; do not jump straight into what; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Template**: reuse the right template (leaf / ADR / tech design / PRD / BRD / meeting-notes) as the starting point; do not start from a blank page. 
3. **Naming constraints**: directory and file names must not use underscores `_` or digits; use kebab-case; dates only in frontmatter; see [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md). 
4. **Frontmatter**: must fill title / aliases / tags / category / created / updated / source / type / status / lifecycle / related; new files must fill lifecycle / related / review_cycle / tacit fields. 
5. **2-hop reachability**: new docs must be reachable from at least one piece of INDEX.md "scenario entries" section or a role README; see [../../INDEX.md](../../INDEX.md) + [knowledge-map.md](../diagrams/knowledge-map.md). 
6. **SSOT**: single source of fact + view layer wrapper; do not duplicate content; see [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/win-yivad-leaf-view-leaves-ssot.md). 
7. **Occam**: the simpler the docs the easier to maintain; satisfy readers' needs with the smallest length wins; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
8. **AI assistance**: use prompts like [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) / [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) / [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) to assist in generating drafts, then manually refine. 
9. **Review**: follow [knowledge-review-process.md](../../engineer/process/knowledge-review.md), record in [review-log.md](../../knowledge-curator/governance/review-log.md). 
10. **Make tacit explicit**: capture know-how that cannot yet be written clearly into [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) and gradually make it explicit. 
11. **Deprecation**: outdated content follows [knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md), first mark `status: deprecated` then archive. 
12. **Handover**: project delivery must run [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md), docs + screen recordings + Q&A + successor confirmation.

## Anti-patterns

- **Writing documentation as a post-hoc compliance activity.** When documentation is written after the project ships because "the process requires it," it is already obsolete. The author is reconstructing decisions from memory, omitting the dead ends and failed experiments that contain the most valuable learning. Documentation that is written concurrently with the work -- ADRs during architecture discussions, runbooks during deployment, retrospectives after incidents -- captures the reasoning while it is still fresh.

- **Duplicating content across multiple surfaces instead of using the SSOT pattern.** The same API description appears in the knowledge leaf, the project README, the internal wiki, and a Notion page. When the API changes, three of the four copies are not updated. The reader finds the outdated copy first and acts on wrong information. The fix is not better discipline -- it is structural: one canonical source, and every other surface is a link.

- **Writing for the author's future self rather than for a new team member.** Documentation written by the person who built the system assumes context the reader does not have. Acronyms are not expanded, prerequisites are not stated, and steps that are "obvious" to the author are omitted. The test is: can a new hire who joined yesterday follow this document and complete the task without asking anyone for help? If the answer is no, the document has an implicit knowledge dependency.

- **Prioritizing comprehensiveness over discoverability.** A 50-page document that covers every edge case is less useful than a 5-page document the reader can find in 30 seconds. The first job of documentation is to be found; the second is to be correct; the third is to be comprehensive. Documents that bury the answer to a common question on page 37 are effectively nonexistent.

- **Treating documentation as a one-time deliverable with no review cycle.** The `review_cycle` field in frontmatter is not decorative. A document with `review_cycle: quarterly` that has not been reviewed in 18 months is a liability. The data is stale, the links are broken, and the reader who trusts it will make decisions based on outdated information. A document that cannot be maintained should be deprecated, not left to rot.

## Related

- Related journey: [../../new-hire/onboarding/contribute-to-the-knowledge-base.md](../../new-hire/onboarding/contribute-to-the-knowledge-base.md) — contributor perspective
- Related journey: [../governance/evolve-the-knowledge-base.md](../governance/evolve-the-knowledge-base.md) — governance perspective
- Related journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — ADR writing
- Related journey: [../../engineer/engineering/find-templates-and-prompts.md](../../engineer/engineering/find-templates-and-prompts.md) — template entry
- Upstream: [../../knowledge-curator/templates/README.md](../../knowledge-curator/templates/README.md) — templates leaf entry
