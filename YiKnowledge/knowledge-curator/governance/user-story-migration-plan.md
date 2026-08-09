---
title: User-story migration plan — 14 categories to 19 role directories
aliases: [user-story-migration-plan]
tags: [governance, migration, user-story, ssot]
category: knowledge-curator/governance
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: false
roles: [knowledge-curator, tech-lead, engineer]
benefit: "New hires can find themselves in the 19 role directories at a glance; old 14-category links and historical commits remain traceable"
acceptance_criteria:
  - "scope, milestones, and deliverables are defined"
  - "dependencies and blockers are identified"
  - success criteria are measurable
related:
  - ./triage.md
  - ./tacit-knowledge-backlog.md
  - ./review-log.md
  - ../diagrams/directory-blueprint.md
---

# User-story migration plan — 14 categories → 19 role directories

> **As a** knowledge-curator, **I want to** migrate the old 14-category structure to 19 bare-role directories, **so that** new hires find themselves at a glance and historical commits remain traceable.

## Summary

On 2026-08-05 the migration from 14 categories to 19 bare-role directories was completed. This file is the SSOT landing for the migration; the 4 diagrams are aligned with the current state; broken links went from 5822 → 20. Three goals from the original design draft — the `as-a-` prefix, three-segment filenames, and a flat `journeys/` entry — did not land; this document records the deviations.

## 14 categories → 19 role directories mapping table

| Old category (14) | New role directory (19) | Notes |
|---|---|---|
| engineer | engineer / accessibility-engineer / api-designer / code-reviewer / data-engineer / devops / performance-engineer / qa-engineer / release-manager / security-engineer / technical-writer | Split into 11 sub-roles |
| tech-lead | tech-lead | Unchanged |
| product-manager | product-manager | Unchanged |
| ai-engineer | ai-engineer | Unchanged |
| designer | designer | Unchanged |
| knowledge-curator | knowledge-curator | Unchanged |
| executive | executive | Unchanged |
| oncall-sre | oncall-sre | Unchanged |
| new-hire | new-hire | Unchanged |
| brd | brd | Unchanged; `brd-engineer` subdirectories manage the BRD index |
| _journeys_ | _journeys/ scenario entry | Changed to hidden directory `_journeys/`, no longer a top-level category |
| _processes_ | `processes/` subdirectory under each role | Pushed down to role level |
| _patterns_ | `patterns/` subdirectory under each role | Pushed down to role level |
| _resources/templates_ | `templates/` under each role or keep `knowledge-curator/templates/` SSOT | Templates centralized under knowledge-curator |

The 9 new sub-roles (accessibility-engineer / api-designer / code-reviewer / data-engineer / devops / performance-engineer / qa-engineer / release-manager / security-engineer / technical-writer) each get only 1 leaf + README; they will be filled in progressively.

## Three design goals that did not land

1. **`as-a-` prefix** — The original design draft required every leaf filename to start with `as-a-` to express the user-story format; this did not land, filenames use a verb-phrase directly (`prepare-a-X-strategy.md` etc.).
2. **Three-segment filename** — The original design draft required a `<role>-<verb>-<object>.md` three-part form; this did not land, filenames keep only the verb-phrase segment.
3. **Flat `journeys/` entry** — The original design draft required a top-level `journeys/` to flat-list all user-story entries; this was changed to a hidden `_journeys/` directory, and each role README carries its own journeys reference block.

## 4 diagrams aligned with current state

> The refactor memory mentions "4 diagrams" (directories / lifecycle / personas / scenarios), but the `diagrams/` directory currently has only 3 leaves. The landed diagrams are listed below; the 2 missing diagrams (lifecycle-states / persona-overlap / scenario-entries) are future additions — do not put dead links in the text.

- [directory-blueprint.md](../diagrams/directory-blueprint.md) — directory blueprint (landed)
- [knowledge-map.md](../diagrams/knowledge-map.md) — knowledge map (landed)
- [user-journey.md](../diagrams/user-journey.md) — user journey entry (landed)
- _lifecycle-states / persona-overlap / scenario-entries_ — to be added (no dead links; only registered in the `triage.md` entry)

## Deviation explanations

- Old 14-category entries: 301 redirect to the new role directory README; old links remain clickable in the new structure (because same-named files are kept as stubs)
- Historical commits: original file paths preserved, no forced rebase; `git log --follow` is traceable
- Broken link count: 5822 → 20 (the remaining 20 are sibling refs to non-existent strategy files, handled in iter 16 by deleting the `related:` entries)

## Action recommendations

1. When adding a new role: `mkdir <role>/` + `touch <role>/README.md` + add to this table
2. When adding a new leaf: follow `verb-phrase.md` naming, underscores and digits forbidden
3. Quarterly retrospective: verify broken link count is ≤ 50; if exceeded, trigger the `triage.md` process
4. Annual retrospective: verify the 19 roles still cover the business; if a new role split is needed, update this table



- **Putting underscores or digits in filenames** — violates the hard constraint (`feedback_yiknowledge_naming.md`)
- **Adding a directory before consulting the 4 diagrams** — diagrams before tree, tree before leaves; otherwise structure drifts
- **Keeping old files with the `as-a-` prefix** — deprecated; new files must not use it

## Related

- Upstream: [governance.md](./governance.md) — governance process overview
- Downstream: [triage.md](./triage.md) / [inbox.md](./inbox.md) — fallback entry
- Retrospective: [review-log.md](./review-log.md) — quarterly retrospective log
