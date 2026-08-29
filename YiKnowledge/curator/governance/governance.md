---
title: Knowledge Base Governance Flow
tags: [governance, lifecycle, curator, roles, cadences]
category: curator/governance
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "Curators understand the 4 governance roles, 3 review cadences, and the full knowledge lifecycle"
acceptance_criteria:
  - "4 governance roles defined with responsibilities"
  - "3 review cadences defined with checklists"
  - "Knowledge lifecycle stages mapped to governance actions"
related:
  - ./README.md
  - ./readiness-checklist.md
  - ../../README.md
  - ../../MEMORY.md
---

# Knowledge Base Governance Flow

> **4 roles, 3 cadences, 1 lifecycle.** The governance model keeps YiKnowledge healthy, searchable, and trustworthy.

## Governance roles

| Role | Who | Responsibility |
|---|---|---|
| **Curator** | KB maintainer | Owns structure, naming, frontmatter compliance. Runs periodic reviews. Approves new content categories. |
| **Author** | Any team member | Creates and updates knowledge files. Follows the [readiness checklist](./readiness-checklist.md) before publishing. |
| **Reviewer** | Domain expert (role lead) | Reviews content in their domain for accuracy and freshness. Flags stale or deprecated content. |
| **Archivist** | Curator (delegated) | Moves deprecated content to archive. Maintains the [archive index](../archive/README.md). |

## Review cadences

### Daily (lightweight)
- **Inbox scan** — Check `inbox.md` for new unclassified content. Triage into the correct role directory within 24 hours.
- **Frontmatter spot-check** — Verify `title`, `tags`, `category`, `status` are present on any new files added today.

### Weekly (moderate)
- **Triage drain** — Process the `triage.md` queue. Each triaged item gets a role directory and `lifecycle: triage` tag.
- **Freshness scan** — `rg "^last_verified: 202[0-5]" YiKnowledge -l` to find files unverified for >1 year. Flag for review.
- **Dead link check** — Verify cross-references in recently modified files still resolve.

### Quarterly (deep)
- **Full audit** — Every file reviewed. Update `last_verified` date. Mark stale content `status: deprecated`.
- **Role boundary check** — Verify no content has drifted into the wrong role directory. Cross-reference with the [pipeline stage definitions](../../README.md#pipeline-stages).
- **Archive sweep** — Files with `status: deprecated` for >6 months move to `curator/archive/`.
- **Metrics update** — Update the [knowledge health dashboard](./dashboard-knowledge-health.md) with file counts, lifecycle distribution, and frontmatter compliance rates.

## Knowledge lifecycle

```
inbox → triage → active → reference → archive
  │        │        │         │           │
  │        │        │         │           └─ Deprecated >6mo, moved to curator/archive/
  │        │        │         └─ Stable reference material, reviewed yearly
  │        │        └─ Actively maintained, reviewed quarterly
  │        └─ Classified but not yet summarized, reviewed weekly
  └─ Unclassified new content, reviewed daily
```

### Lifecycle transitions

| From | To | Trigger | Action |
|---|---|---|---|
| `inbox` | `triage` | Content classified into a role directory | Set `lifecycle: triage`, add role-specific `tags` |
| `triage` | `active` | Content summarized and formatted | Set `lifecycle: active`, `status: stable`, add `benefit` and `acceptance_criteria` |
| `active` | `reference` | Content stable, no longer actively updated | Set `lifecycle: reference`, `review_cycle: yearly` |
| `active` | `archive` | Content superseded or no longer relevant | Set `status: deprecated`, keep in place for 6 months, then move to `curator/archive/` |
| `reference` | `archive` | Content outdated | Same as active→archive |

## Content standards

All knowledge files must meet these minimum standards before leaving `triage`:

1. **Frontmatter complete** — All required fields present (`title`, `tags`, `category`, `created`, `updated`, `source`, `type`, `status`)
2. **Naming compliant** — kebab-case, hyphens only, no underscores or digits
3. **Role boundary correct** — Content belongs to exactly one role directory
4. **Benefit stated** — `benefit:` field answers "what does the reader gain?"
5. **Acceptance criteria verifiable** — `acceptance_criteria:` entries are falsifiable statements
6. **No dead links** — All `related:` and body links resolve to existing files

## Governance procedures

### Adding new content
1. Author runs the [readiness checklist](./readiness-checklist.md) (10-question gate)
2. Author places file in the correct role directory (max 3 levels deep)
3. Curator verifies frontmatter and naming within 24 hours (daily scan)
4. File enters `lifecycle: triage` → weekly review promotes to `active`

### Reviewing existing content
1. Quarterly audit identifies files with stale `last_verified` dates
2. Reviewer checks content accuracy against current state
3. Update `last_verified` and `updated` dates
4. If content is no longer accurate → mark `status: deprecated` or update

### Archiving content
1. File marked `status: deprecated` with a note explaining why
2. Remains in place for 6 months (grace period for reversal)
3. After 6 months, curator moves to `curator/archive/` and adds entry to archive index
4. Update all cross-references that pointed to the archived file

## Metrics

Track these quarterly to measure KB health:

| Metric | Target | Measurement |
|---|---|---|
| Frontmatter compliance | ≥95% | Files with all required fields / total files |
| Dead link count | 0 | Automated cross-reference check |
| Stale content ratio | ≤10% | Files with `last_verified` >1 year / total files |
| Inbox age | ≤24h | Max age of items in inbox |
| Triage backlog | ≤20 items | Count of `lifecycle: triage` files |
| Role balance | No role <5% | File count per role / total files |

## Anti-patterns

- **Skipping the readiness checklist for "quick" additions.** A file without proper frontmatter is invisible to RAG retrieval and grep-based search. The checklist takes 2 minutes; finding an unclassified file 6 months later takes 20.
- **Filing content under the wrong role directory.** "It's close enough" creates broken cross-references and confuses the pipeline model. Use the [role boundary decision tree](../../README.md#role-boundary-quick-reference).
- **Archiving without updating cross-references.** Dead links degrade trust in the entire KB. Always grep for the file path before archiving.
- **Letting the triage queue grow unbounded.** A large triage backlog signals that content is being collected but not synthesized. Cap at 20 items; above that, pause new collection until the backlog is drained.