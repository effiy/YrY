---
title: Operations Process Diagram / Governance
aliases:
- governance
- operations-cadence
tags:
- lifecycle
- governance
- 4-diagrams
- operations-mechanism
category: knowledge-curator/governance
created: 2026-08-03
updated: 2026-08-05
last_verified: 2026-08-07
source: "internal + reference<Knowledge base directory design: 90% of companies get the first step wrong>"
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
roles:
- knowledge-curator
benefit: Operations cost is quantifiable, knowledge contribution does not rely on self-discipline
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"- 4 Role responsibilities assigned to person + time investment explicit
- Weekly / monthly / quarterly / yearly 4 cadences + each cadence action checklist executable
related:
- ../diagrams/knowledge-map.md
- ./review-log.md
- ../README.md
- ../../engineer/process/knowledge-review.md
- ../../engineer/process/knowledge-contributor-charter.md
tacit: false
---

# Operations Process Diagram / Governance

> **As a** knowledge-curator, **I want to** use 4 Roles × 4 cadences of operations mechanism to replace "everyone self-disciplined", **so that** the Knowledge base does not become a ghost town, operations cost is quantifiable.

> The fourth of the 4 diagrams. The fate of a Knowledge base without an operations mechanism: Launch is lively → 1 month people reading → 3 months occasionally reading → 6 months no one reading → 1 year ghost town.

## Summary

- 4 Roles: Owner / Operations / knowledge owner / knowledge contributor
- 3 cadences: Weekly (1h) / Monthly (4h) / Quarterly (owner rotates) / Yearly (Owner)
- Use "knowledge owner + regular review" to replace "everyone self-disciplined"
- Use "search-data-driven content supplement" to replace "fill content by feel"
- Each retrospective fills [review-log.md](./review-log.md)

## Core viewpoints

- **Do not depend on "everyone self-disciplined"** — people are self-interested, without clear Roles, cadence and feedback, knowledge contribution is always only a slogan
- **Role × cadence × feedback triplet** — Role sets responsibility, cadence sets rhythm, feedback (review-log + quarterly high-value sediment) gives power
- **Operations cost is quantifiable** — Owner weekly 1h + Operations weekly 4h + owner monthly 2h, explicit investment then sustainability is possible

## Key information

### 4 Roles

| Role | Who | Responsibility | Time investment |
|---|---|---|---|
| Owner | I (ruiyi) | Strategy direction, cross-category coordination, final decision | Weekly 1h |
| Operations | I (ruiyi, part-time) | Content audit, frontmatter maintenance, search/link reachability analysis | Weekly 4h |
| knowledge owner | each leaf high-frequency contributor | Accuracy and timeliness of this leaf's docs | Monthly 2h |
| knowledge contributor | everyone (future team members) | Write docs, give feedback | Anytime |

Detailed charter: [../../engineer/process/knowledge-contributor-charter.md](../../engineer/process/knowledge-contributor-charter.md)

### 3 cadences

#### Weekly (Operations role, about 1h)

- Clear [inbox.md](./inbox.md): every item must be routed to a leaf or explicitly rejected
- Check recent 7 days new/modified files' frontmatter completeness (must fill `lifecycle` `tags` `category`)
- In this note system "push 1 high-value sediment of the week" (self-assessment)

#### Monthly (Operations role, about 4h)

- Scan `lifecycle: triage` files (see [triage.md](./triage.md)), urge summary
- Content governance:
  - Clear `last_verified` over 6 months outdated content → mark `status: deprecated` or update
  - Fill all frontmatter missing fields
- Data retrospective: coverage rate (each leaf whether has content), active rate (30 days modified file ratio), link reachability (dead-link ratio)

#### Quarterly (owner rotation + Owner)

- Architecture adjustment: based on INDEX.md "Scenario entries" usage frequency optimize scenario entries
- knowledge owner rotation review: each high-read doc confirm `active / needs update / deprecated`
- Update [knowledge-map.md](../diagrams/knowledge-map.md) and [tacit-knowledge-backlog.md](./tacit-knowledge-backlog.md)
- Select "quarterly high-value sediment" (give honor mark, frontmatter add `featured: true`)

#### Yearly (Owner)

- Scan [archive.md](../archive/archive.md) decide physical cleanup
- Select "yearly high-value sediment"
- Revise [../MEMORY.md](../../MEMORY.md) rules manual

### Review log

Each retrospective fills [review-log.md](./review-log.md):

| date | scope | handled files | action type | owner | note |
|---|---|---|---|---|---|

## Action recommendations

1. Monday fixed 1h to clear inbox + frontmatter validation
2. Monthly last day one person 4h content governance
3. Quarterly end arrange owner rotation review + 4 diagrams retrospective
4. Year beginning yearly scan archive + MEMORY revision

## Anti-patterns

- **Role not assigned to specific person** — consequence: responsibility hollow, no one actually does it
- **Cadence only defined not cleared** — consequence: inbox/triage pile up, operations signals fail
- **No data retrospective** — consequence: fill content by feel, coverage gap invisible
- **No high-value sediment selection** — consequence: contributors lose positive feedback, long-term contribution declines

## Related

- Same category (4 diagrams): [knowledge-map.md](../diagrams/knowledge-map.md) / [user-journey.md](../diagrams/user-journey.md) / [directory-blueprint.md](../diagrams/directory-blueprint.md)
- Upstream: [README.md](../README.md) (Lifecycle view layer overview)
- Downstream: [review-log.md](./review-log.md) (review log), [tacit-knowledge-backlog.md](./tacit-knowledge-backlog.md)
- SOP: [../../engineer/process/knowledge-review.md](../../engineer/process/knowledge-review.md), [../../engineer/process/knowledge-contributor-charter.md](../../engineer/process/knowledge-contributor-charter.md), [../../engineer/process/knowledge-deprecation-policy.md](../../engineer/process/knowledge-deprecation-policy.md)
