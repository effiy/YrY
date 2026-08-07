---
title: Contribute to the knowledge base
aliases:
- I want to contribute knowledge
- knowledge-contribution-journey
- kb-charter-journey
- knowledge contribution entry
tags:
- journeys
- knowledge
- contribution
- charter
- deprecation
- review
category: new-hire/onboarding
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- new-hire
benefit: onboarding is smooth
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./onboard-as-a-new-engineer.md
- ./handoff-project.md
- ../../knowledge-curator/README.md
review_cycle: quarterly
tacit: false
---

# I want to contribute to the knowledge base

> **As a** new hire, **I want to** contribute to the knowledge base, **so that** onboarding is smooth.

> "Contributor onboarding / writing a new leaf / requesting deprecation / quarterly review / knowledge handoff" — reach contributor charter + deprecation strategy + review cadence + handoff process + templates within 2 hops.

## Summary

- Onboarding: [knowledge-contributor-charter.md](../../engineer/process/knowledge-contributor-charter.md) — who can write / how to write / who reviews after writing
- Writing a new leaf: [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) + directory constraints ([directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md))
- Deprecation: [knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md)
- Review: [knowledge-review-process.md](../../engineer/process/knowledge-review.md) + [review-log.md](../../knowledge-curator/governance/review-log.md)

## Core viewpoints

**Knowledge that is not reachable in 2 hops does not exist.** A leaf buried four links deep is effectively invisible to anyone who needs it. The 2-hop rule is not a nice-to-have; it is the primary access-control mechanism for the entire knowledge base. If a piece of knowledge cannot be found from a journeys entry or a README index within two clicks, it might as well not be written.

**A knowledge base without a deprecation policy decays exponentially.** Every piece of content has a half-life. Without an explicit deprecation flow (mark deprecated, observe, archive), stale content accumulates and erodes trust in the entire system faster than new content can restore it. The deprecation policy is not janitorial work; it is the immune system of the knowledge base.

**Writing is the easy part; review and maintenance are where knowledge bases fail.** The quarterly review cycle is the heartbeat. A knowledge base that is written to but never reviewed becomes a graveyard of outdated advice within six months. The review-log is the single most important governance artifact, because it proves the system is alive.

**Tacit knowledge is the most valuable and the hardest to capture.** The knowledge that senior engineers carry in their heads -- why a decision was made, what alternatives were rejected, what was tried and failed -- is exactly what the tacit-knowledge backlog exists to codify. Treating tacit knowledge as "too hard to write down" is the single biggest loss of institutional memory.

**The naming constraint is not pedantry; it is machine-readability.** The rule against underscores and digits in file/directory names exists because the knowledge scanner, index generator, and cross-referencing tools all parse paths as structured data. A single `_` in a filename breaks the entire pipeline silently.

## Scenario description

When joining as a contributor / writing new knowledge / old content going stale / quarterly audit / project knowledge handoff, contributors need to look up the charter + templates + deprecation strategy + review cadence. This entry aggregates the 4 YiKnowledge self-governance processes + lifecycle leaves + templates into a 2-hop path, avoiding "new content with no place to go / old content never cleaned up / same-named files drifting apart".

## 2-hop reach path

| Hop 1 (category / leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [knowledge-contributor-charter.md](../../engineer/process/knowledge-contributor-charter.md) · [knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md) · [knowledge-review-process.md](../../engineer/process/knowledge-review.md) · [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md) |
| `lifecycle/` | [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) · [user-journey.md](../../knowledge-curator/diagrams/user-journey.md) · [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [triage.md](../../knowledge-curator/governance/triage.md) · [inbox.md](../../knowledge-curator/governance/inbox.md) · [archive.md](../../knowledge-curator/archive/archive.md) · [governance.md](../../knowledge-curator/governance/governance.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `resources/templates/` | [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) |
| `journeys/` | [./README.md](./) — 18+1 scenario entry map |
| `INDEX.md` | [../INDEX.md](../../INDEX.md) — full knowledge base index |
| `work/onboarding/` | project onboarding templates (linked with [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md)) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) — SSOT + view-layer separation; this knowledge base follows this pattern |

## Action recommendations

1. **Onboarding**: first read [knowledge-contributor-charter.md](../../engineer/process/knowledge-contributor-charter.md) + [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) to understand the naming constraints and directory semantics.
2. **Writing a new leaf**: copy [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md), fill in all frontmatter (including lifecycle / related / review_cycle / tacit fields), and categorize into the matching semantic leaf directory.
3. **Naming constraints**: directory and file names must not use underscores `_` or digits; use kebab-case; dates appear only in frontmatter, never in file names.
4. **2-hop reach**: a new leaf must be reachable from at least one journeys entry or one README index, to avoid "islands".
5. **Requesting deprecation**: out-of-date content follows [knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md) — first mark `status: deprecated`, then after the observation window delete or move to [archive.md](../../knowledge-curator/archive/archive.md).
6. **Quarterly review**: scan once a quarter per [knowledge-review-process.md](../../engineer/process/knowledge-review.md); record results in [review-log.md](../../knowledge-curator/governance/review-log.md); high-value content is upgraded to `status: stable`, stale content enters the deprecation flow.
7. **Handoff**: project delivery follows [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md); must include documentation + screen recording + Q&A + acknowledgement by the receiver.
8. **Tacit knowledge**: know-how that cannot be written clearly goes into [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) for gradual codification.
9. **Governance cadence**: quarterly audit + annual retrospective; see [governance.md](../../knowledge-curator/governance/governance.md).

## Anti-patterns

- **Writing without checking for duplicates.** Search the knowledge base before creating a new leaf. Two leaves covering the same topic with slightly different framings create confusion, not coverage. The first question before writing should always be: does this already exist under a different name?

- **Frontmatter treated as optional.** A leaf without complete frontmatter (lifecycle, related, review_cycle, tacit) is invisible to the scanner, unreachable via the index, and will never be reviewed. It is a ghost document that exists on disk but not in the knowledge graph.

- **Using underscores or digits in file or directory names.** This violates the naming constraint and breaks the scanner's expectations. The constraint exists to keep the directory structure predictable and machine-parseable. Rename the file before the first commit; retroactive renaming breaks all existing links.

- **Writing and walking away.** Contributing a leaf without setting a review_cycle and without linking it from any journeys entry creates an orphan that no one will ever find or maintain. Every leaf needs a parent in the navigation graph.

- **Creating islands.** A leaf that is not linked from any journey, README, or related field is unreachable. Every leaf must have at least one inbound path from the 2-hop navigation graph. If you cannot trace a path from a journeys entry to your leaf, it is an island.

## Related

- Peer journey: [./onboard-as-a-new-engineer.md](./onboard-as-a-new-engineer.md) — newcomer contributing knowledge
- Peer journey: [./handoff-project.md](./handoff-project.md) — project delivery including knowledge handoff
- Peer journey: [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) — retrospective outputs go into the knowledge base
- Upstream: [../../knowledge-curator/README.md](../../knowledge-curator/README.md) — lifecycle leaf entry
