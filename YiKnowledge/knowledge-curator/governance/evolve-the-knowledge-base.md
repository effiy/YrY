---
title: Evolve the knowledge base
aliases:
- i-want-to-evolve-the-knowledge-base
- knowledge-base-evolution-journey
- knowledge base governance entry
- tacit-knowledge entry
tags:
- journeys
- knowledge-base
- governance
- tacit-knowledge
- directory-blueprint
- review-cycle
category: knowledge-curator/governance
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
roles:
- knowledge-curator
benefit: kb stays curated
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/process/run-iteration-meetings.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../../knowledge-curator/governance/governance.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/governance/tacit-knowledge-backlog.md
review_cycle: quarterly
tacit: false
---

# I want to evolve the knowledge base

> **As a** knowledge curator, **I want to** evolve the knowledge base, **so that** kb stays curated.

> "How the knowledge base itself evolves + how tacit knowledge becomes explicit + how the directory structure is governed + how quarterly audits run" reaches governance + directory-blueprint + tacit-knowledge-backlog + review-log + 4 diagrams within 2 hops.

## Summary

- Governance follows [governance.md](../../knowledge-curator/governance/governance.md): quarterly audits + 4 roles 3 cadences + lifecycle fields
- Directory structure follows [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) + [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md): 9 semantic categories + lifecycle layer + journeys entries
- Tacit knowledge follows [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md): making predecessors' experience explicit + quarterly intake
- Retrospectives follow [review-log.md](./review-log.md) + [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md): pre-launch / post-launch / quarterly

## Core viewpoints

**Knowledge base quality decays at a predictable rate if not actively governed.** Without quarterly audits, naming constraints, and a triage pipeline, a knowledge base doubles in size every 6-12 months while its signal-to-noise ratio halves. The natural entropy of a growing knowledge base is toward fragmentation, duplication, and staleness. Governance is not overhead -- it is the counter-force that keeps the knowledge base usable as it scales.

**The PARA stream (Inbox, Triage, Active, Archive) is the single most important governance mechanism.** Most knowledge base failures trace back to content entering the system without triage. When anyone can write anywhere, the directory structure becomes a reflection of individual mental models rather than a shared information architecture. The inbox-to-triage pipeline forces every new piece of content to justify its place, its category, and its relationship to existing content before it enters the active structure.

**Tacit knowledge is the highest-value and hardest-to-capture content.** The documented processes, templates, and summaries are the visible tip of the iceberg. The "why this way and not that way" judgments, the historical context behind architectural decisions, and the unwritten collaboration norms are the submerged mass that new hires take 6-12 months to absorb. The tacit knowledge backlog is not a nice-to-have; it is the mechanism for converting organizational intuition into organizational capability.

**Naming constraints are an information architecture decision, not a stylistic preference.** The ban on underscores and digits in file names (kebab-case only, version numbers in body) is not about aesthetics. It enforces consistency across a multi-contributor system, makes files machine-parseable for search and linking, and prevents the silent drift where one contributor uses `data_migration_v2` and another uses `data-migration-2` and nobody realizes they are describing the same thing.

## Scenario

When knowledge base content bloats / naming drifts / tacit knowledge breaks / pre-launch self-check / quarterly audit, technical owners + architecture team need to govern the directory structure + precipitate tacit knowledge + run quarterly audits + maintain the 4 diagrams. This entry aggregates governance, directory-blueprint, tacit-knowledge-backlog, review-log into a 2-hop path, avoiding "content bloat out of control / naming inconsistency / tacit knowledge gaps / missing pre-launch self-check".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `_lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) · [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) · [user-journey.md](../../knowledge-curator/diagrams/user-journey.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [review-log.md](./review-log.md) |
| `_lifecycle/` stream transition | [0-inbox.md](./inbox.md) · [1-triage.md](./triage.md) · [9-archive.md](./../archive/archive.md) — PARA lifecycle |
| `journeys/` | [README.md](./) — 18 scenario entries |
| Root | [INDEX.md](../../INDEX.md) · [MEMORY.md](../../MEMORY.md) · [README.md](../README.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) — governance decision thinking frameworks |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) — SSOT maintenance pattern |

## Action recommendations

1. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) 4 roles (owner / curator / contributor / reviewer) 3 cadences (daily / weekly / quarterly); scan [review-log.md](./review-log.md) historical audit records.
2. **Directory structure governance**: Scan [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) 9 semantic categories + lifecycle layer + journeys entries; do not add new top-level categories (first inbox → triage → merge).
3. **Naming constraints**: Directory and file names must not use `_` or digits; version numbers go in the body (e.g. `chrome-manifest` instead of `mv3`, `phase-port` instead of `7-phase`).
4. **Make tacit knowledge explicit**: When tacit knowledge is discovered (the "why this way" judgments) → write into [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) → quarterly intake as formal leaves.
5. **New file frontmatter required**: `lifecycle` / `related` / `review_cycle` / `tacit` fields consistent with the 4-diagram refactor constraints.
6. **PARA stream transition**: New content first enters [0-inbox](./inbox.md) → [1-triage](./triage.md) decides (keep / merge / rewrite) → active / reference / archive.
7. **Navigation chain maintenance**: Project README → projects/INDEX → root INDEX → leaf README; new files must add entries at each layer.
8. **Pre-launch self-check**: Follow [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md), avoiding "knowledge base content bloat out of control".
9. **Thinking frameworks**: Governance decisions follow [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) (erect the skeleton first) + [ockhams-razor](../../knowledge-curator/templates/thinking/ockhams-razor.md) (do not multiply entities without necessity).

## Anti-patterns

- **Adding new top-level categories without going through inbox and triage.** The most common cause of directory structure bloat is a contributor who creates a new top-level directory because "none of the existing categories fit." The correct response is to place the content in the inbox, flag it for triage, and let the governance process decide whether it merges into an existing category, expands a category's scope, or justifies a truly new category. Bypassing triage creates a parallel structure that future contributors will replicate.

- **Treating the quarterly audit as a checkbox exercise.** An audit that scans file counts and `last_verified` dates without reading content, checking for duplication, and questioning whether each file still serves its intended role is a compliance ritual, not governance. The audit must produce actionable outputs: files to deprecate, files to merge, naming violations to fix, and tacit knowledge items to formalize.

- **Letting "to be added" placeholders become permanent.** A skeleton file with `_to be added_` in every field is a promise, not a document. If the person who created the skeleton does not fill it within one review cycle, the file should move to the archive. Permanent placeholders erode trust in the knowledge base: when 30% of files are skeletons, contributors stop searching because they assume the answer will not be there.

- **Writing governance policies that nobody follows.** A governance document that specifies 4 roles, 3 cadences, and a 10-step review process is worthless if the actual workflow is "DM the person who wrote it." Governance must match the team's actual collaboration patterns. If the team communicates async, the governance should be async. If the team is 3 people, the governance should be lightweight. The best governance is the one that actually happens.

- **Accumulating tacit knowledge backlog items without ever promoting them to formal leaves.** A backlog with 50 items and zero promotions in 12 months is a wish list, not a governance system. Each quarterly audit should promote at least one tacit backlog item to a formal knowledge leaf. If no items are ready for promotion, the backlog entries are too vague to be useful and should be rewritten or removed.

## Related

- Same-class journey: [../../engineer/process/run-iteration-meetings.md](../../engineer/process/run-iteration-meetings.md) — retrospective meeting co-build
- Same-class journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — quarterly planning
- Same-class journey: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — new hire onboarding (knowledge base onboarding)
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — governance SSOT
